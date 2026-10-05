import { HistoryItem, UploadedImage } from '../types';

const DB_NAME = 'VPA_PROMPT_HISTORY_DB';
const DB_VERSION = 2;
const STORE_NAME = 'historyItems';
const STORE_ACTIVE_IMAGES = 'activeUploadedImages';
const LEGACY_STORAGE_KEY = 'promptHistory';
const FALLBACK_STORAGE_KEY = 'promptHistory_lite';

/**
 * Open or create the IndexedDB database for history persistence and active images.
 */
function openDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
        if (typeof window === 'undefined' || !window.indexedDB) {
            return reject(new Error('IndexedDB is not supported in this environment'));
        }

        try {
            const request = window.indexedDB.open(DB_NAME, DB_VERSION);

            request.onupgradeneeded = () => {
                const db = request.result;
                if (!db.objectStoreNames.contains(STORE_NAME)) {
                    const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
                    store.createIndex('timestamp', 'timestamp', { unique: false });
                }
                if (!db.objectStoreNames.contains(STORE_ACTIVE_IMAGES)) {
                    db.createObjectStore(STORE_ACTIVE_IMAGES, { keyPath: 'id' });
                }
            };

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error || new Error('Failed to open IndexedDB'));
            request.onblocked = () => {
                console.warn('IndexedDB open was blocked');
            };
        } catch (err) {
            reject(err);
        }
    });
}

/**
 * Safely compresses a base64 image string to reduce storage footprint.
 * Target max dimension 1024px with 0.8 quality JPEG.
 */
export async function compressBase64Image(
    base64Data: string,
    mimeType: string,
    maxDimension: number = 1024,
    quality: number = 0.8
): Promise<{ base64Data: string; mimeType: string }> {
    // If running server-side or if base64 is already small, return directly
    if (typeof window === 'undefined' || typeof Image === 'undefined') {
        return { base64Data, mimeType };
    }

    return new Promise((resolve) => {
        try {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.onload = () => {
                try {
                    let { width, height } = img;
                    if (width > maxDimension || height > maxDimension) {
                        if (width > height) {
                            height = Math.round((height * maxDimension) / width);
                            width = maxDimension;
                        } else {
                            width = Math.round((width * maxDimension) / height);
                            height = maxDimension;
                        }
                    }

                    const canvas = document.createElement('canvas');
                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    if (!ctx) {
                        return resolve({ base64Data, mimeType });
                    }

                    ctx.drawImage(img, 0, 0, width, height);
                    const targetMime = mimeType === 'image/png' ? 'image/jpeg' : mimeType;
                    const dataUrl = canvas.toDataURL(targetMime, quality);
                    const parts = dataUrl.split(',');
                    if (parts.length === 2) {
                        resolve({
                            base64Data: parts[1],
                            mimeType: targetMime
                        });
                        return;
                    }
                    resolve({ base64Data, mimeType });
                } catch {
                    resolve({ base64Data, mimeType });
                }
            };
            img.onerror = () => {
                resolve({ base64Data, mimeType });
            };
            img.src = `data:${mimeType};base64,${base64Data}`;
        } catch {
            resolve({ base64Data, mimeType });
        }
    });
}

/**
 * Safely saves lightweight history items to localStorage if IndexedDB is not usable.
 * Automatically trims oldest entries if quota is exceeded.
 */
function saveFallbackLocalStorage(items: HistoryItem[]) {
    try {
        // Strip heavy base64 for fallback to prevent any quota issues
        const lightweightItems = items.slice(0, 15).map(item => ({
            ...item,
            baseImage: {
                ...item.baseImage,
                // Truncate or keep only thumbnail preview if extremely long
                base64Data: item.baseImage.base64Data.length > 50000 
                    ? item.baseImage.base64Data.slice(0, 50000) 
                    : item.baseImage.base64Data
            }
        }));

        let toSave = [...lightweightItems];
        while (toSave.length > 0) {
            try {
                localStorage.setItem(FALLBACK_STORAGE_KEY, JSON.stringify(toSave));
                return;
            } catch (quotaError) {
                // Remove the oldest item and retry
                toSave.pop();
            }
        }
    } catch (e) {
        console.warn('Fallback localStorage write failed safely', e);
    }
}

/**
 * Loads history with automatic IndexedDB support and migration of legacy localStorage.
 */
export async function loadHistory(): Promise<HistoryItem[]> {
    let legacyItems: HistoryItem[] = [];

    // 1. Check for legacy localStorage data
    try {
        const legacyData = localStorage.getItem(LEGACY_STORAGE_KEY);
        if (legacyData) {
            try {
                legacyItems = JSON.parse(legacyData);
                if (!Array.isArray(legacyItems)) legacyItems = [];
            } catch {
                legacyItems = [];
            }
            // CRITICAL: Immediately clear legacy key to free up quota and prevent errors
            localStorage.removeItem(LEGACY_STORAGE_KEY);
        }
    } catch (e) {
        console.warn('Error reading or removing legacy promptHistory:', e);
    }

    // 2. Try loading from IndexedDB
    try {
        const db = await openDB();
        return new Promise<HistoryItem[]>((resolve) => {
            try {
                const transaction = db.transaction(STORE_NAME, 'readwrite');
                const store = transaction.objectStore(STORE_NAME);
                const request = store.getAll();

                request.onsuccess = () => {
                    let items: HistoryItem[] = request.result || [];

                    // If IndexedDB was empty but we found legacy items, migrate them
                    if (items.length === 0 && legacyItems.length > 0) {
                        items = legacyItems;
                        try {
                            const migrationTx = db.transaction(STORE_NAME, 'readwrite');
                            const migrationStore = migrationTx.objectStore(STORE_NAME);
                            for (const item of legacyItems) {
                                migrationStore.put(item);
                            }
                        } catch (err) {
                            console.warn('Migration to IndexedDB failed:', err);
                        }
                    }

                    // Sort descending by timestamp
                    items.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
                    resolve(items);
                };

                request.onerror = () => {
                    resolve(legacyItems.length > 0 ? legacyItems : loadFallbackLocalStorage());
                };
            } catch {
                resolve(legacyItems.length > 0 ? legacyItems : loadFallbackLocalStorage());
            }
        });
    } catch {
        // IndexedDB unavailable, check fallback localStorage
        return legacyItems.length > 0 ? legacyItems : loadFallbackLocalStorage();
    }
}

/**
 * Fallback load from localStorage
 */
function loadFallbackLocalStorage(): HistoryItem[] {
    try {
        const data = localStorage.getItem(FALLBACK_STORAGE_KEY);
        if (data) {
            const parsed = JSON.parse(data);
            return Array.isArray(parsed) ? parsed : [];
        }
    } catch {
        // ignore
    }
    return [];
}

/**
 * Saves all history items reliably to IndexedDB with safety guards against storage quota.
 */
export async function saveHistory(items: HistoryItem[]): Promise<void> {
    // Ensure legacy localStorage key is definitely removed
    try {
        localStorage.removeItem(LEGACY_STORAGE_KEY);
    } catch {
        // ignore
    }

    try {
        const db = await openDB();
        return new Promise<void>((resolve, reject) => {
            try {
                const tx = db.transaction(STORE_NAME, 'readwrite');
                const store = tx.objectStore(STORE_NAME);

                // Clear current store and put items
                store.clear();
                for (const item of items) {
                    store.put(item);
                }

                tx.oncomplete = () => {
                    resolve();
                };

                tx.onerror = (e) => {
                    console.warn('IndexedDB transaction error, saving to fallback:', e);
                    saveFallbackLocalStorage(items);
                    resolve(); // Do not throw, keep application running smoothly
                };

                tx.onabort = (e) => {
                    console.warn('IndexedDB transaction aborted, saving to fallback:', e);
                    saveFallbackLocalStorage(items);
                    resolve();
                };
            } catch (err) {
                console.warn('IndexedDB write error:', err);
                saveFallbackLocalStorage(items);
                resolve();
            }
        });
    } catch {
        // Fallback to localStorage safely without throwing quota error
        saveFallbackLocalStorage(items);
    }
}

/**
 * Deletes a single history item by id.
 */
export async function deleteHistoryItem(id: string): Promise<void> {
    try {
        const db = await openDB();
        const tx = db.transaction(STORE_NAME, 'readwrite');
        tx.objectStore(STORE_NAME).delete(id);
    } catch {
        // ignore
    }
}

/**
 * Clears the entire history store.
 */
export async function clearHistory(): Promise<void> {
    try {
        localStorage.removeItem(LEGACY_STORAGE_KEY);
        localStorage.removeItem(FALLBACK_STORAGE_KEY);
    } catch {
        // ignore
    }

    try {
        const db = await openDB();
        const tx = db.transaction(STORE_NAME, 'readwrite');
        tx.objectStore(STORE_NAME).clear();
    } catch {
        // ignore
    }
}

export interface StoredReferenceImage {
    id: string;
    name: string;
    base64Data: string;
    mimeType: string;
    analysis: any;
    order: number;
    isSelected: boolean;
}

/**
 * Saves current uploaded reference images and the selected image ID to IndexedDB.
 */
export async function saveActiveImages(images: UploadedImage[], selectedId: string | null): Promise<void> {
    try {
        const db = await openDB();
        return new Promise<void>((resolve) => {
            try {
                const tx = db.transaction(STORE_ACTIVE_IMAGES, 'readwrite');
                const store = tx.objectStore(STORE_ACTIVE_IMAGES);
                store.clear();
                images.forEach((img, idx) => {
                    if (img.base64Data) {
                        const item: StoredReferenceImage = {
                            id: img.id,
                            name: img.name,
                            base64Data: img.base64Data,
                            mimeType: img.mimeType || 'image/png',
                            analysis: img.analysis || null,
                            order: idx,
                            isSelected: img.id === selectedId
                        };
                        store.put(item);
                    }
                });
                tx.oncomplete = () => resolve();
                tx.onerror = () => resolve();
            } catch {
                resolve();
            }
        });
    } catch {
        // Safe fallback: save minimal reference in sessionStorage
        try {
            if (images.length > 0) {
                const minified = images.slice(0, 5).map((img, idx) => ({
                    id: img.id,
                    name: img.name,
                    base64Data: img.base64Data ? img.base64Data.slice(0, 100000) : '',
                    mimeType: img.mimeType || 'image/png',
                    order: idx,
                    isSelected: img.id === selectedId
                }));
                sessionStorage.setItem('vpa_active_ref_imgs', JSON.stringify(minified));
            } else {
                sessionStorage.removeItem('vpa_active_ref_imgs');
            }
        } catch {}
    }
}

/**
 * Loads saved reference images from IndexedDB, reconstructing the File and previewUrl objects.
 */
export async function loadActiveImages(): Promise<{ images: UploadedImage[]; selectedId: string | null }> {
    try {
        const db = await openDB();
        return new Promise((resolve) => {
            try {
                const tx = db.transaction(STORE_ACTIVE_IMAGES, 'readonly');
                const store = tx.objectStore(STORE_ACTIVE_IMAGES);
                const req = store.getAll();
                req.onsuccess = () => {
                    const rawItems: StoredReferenceImage[] = req.result || [];
                    if (!rawItems || rawItems.length === 0) {
                        resolve(loadFallbackSessionImages());
                        return;
                    }
                    rawItems.sort((a, b) => a.order - b.order);
                    let selectedId: string | null = null;
                    const restored: UploadedImage[] = [];

                    for (const item of rawItems) {
                        try {
                            if (item.isSelected && !selectedId) {
                                selectedId = item.id;
                            }
                            const byteCharacters = atob(item.base64Data);
                            const byteArrays: Uint8Array[] = [];
                            for (let offset = 0; offset < byteCharacters.length; offset += 512) {
                                const slice = byteCharacters.slice(offset, offset + 512);
                                const byteNumbers = new Array(slice.length);
                                for (let i = 0; i < slice.length; i++) {
                                    byteNumbers[i] = slice.charCodeAt(i);
                                }
                                byteArrays.push(new Uint8Array(byteNumbers));
                            }
                            const blob = new Blob(byteArrays, { type: item.mimeType || 'image/png' });
                            const file = new File([blob], item.name, { type: item.mimeType || 'image/png' });
                            const previewUrl = URL.createObjectURL(file);

                            restored.push({
                                id: item.id,
                                file,
                                previewUrl,
                                name: item.name,
                                analysis: item.analysis || null,
                                base64Data: item.base64Data,
                                mimeType: item.mimeType
                            });
                        } catch (itemErr) {
                            console.warn("Failed to restore one image record:", itemErr);
                        }
                    }

                    if (restored.length > 0 && !selectedId) {
                        selectedId = restored[0].id;
                    }
                    resolve({ images: restored, selectedId });
                };
                req.onerror = () => resolve(loadFallbackSessionImages());
            } catch {
                resolve(loadFallbackSessionImages());
            }
        });
    } catch {
        return loadFallbackSessionImages();
    }
}

function loadFallbackSessionImages(): { images: UploadedImage[]; selectedId: string | null } {
    try {
        const raw = sessionStorage.getItem('vpa_active_ref_imgs');
        if (raw) {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed) && parsed.length > 0) {
                let selectedId: string | null = null;
                const restored: UploadedImage[] = [];
                for (const item of parsed) {
                    if (item.isSelected && !selectedId) selectedId = item.id;
                    const byteCharacters = atob(item.base64Data);
                    const byteArrays: Uint8Array[] = [];
                    for (let offset = 0; offset < byteCharacters.length; offset += 512) {
                        const slice = byteCharacters.slice(offset, offset + 512);
                        const byteNumbers = new Array(slice.length);
                        for (let i = 0; i < slice.length; i++) {
                            byteNumbers[i] = slice.charCodeAt(i);
                        }
                        byteArrays.push(new Uint8Array(byteNumbers));
                    }
                    const blob = new Blob(byteArrays, { type: item.mimeType || 'image/png' });
                    const file = new File([blob], item.name, { type: item.mimeType || 'image/png' });
                    restored.push({
                        id: item.id,
                        file,
                        previewUrl: URL.createObjectURL(file),
                        name: item.name,
                        analysis: null,
                        base64Data: item.base64Data,
                        mimeType: item.mimeType
                    });
                }
                return { images: restored, selectedId: selectedId || (restored[0]?.id ?? null) };
            }
        }
    } catch {}
    return { images: [], selectedId: null };
}
