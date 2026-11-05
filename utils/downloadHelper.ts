/**
 * downloadHelper.ts
 * Utilitário profissional e robusto para download de arquivos (Blobs, DataURLs, PDFs, ZIPs, Imagens)
 * Garante funcionamento perfeito em iframes, navegadores móveis e desktop, prevenindo cancelamento prematuro.
 */

export interface DownloadOptions {
    filename: string;
    mimeType?: string;
    revokeDelayMs?: number;
}

// Armazena último download para fallback manual caso o navegador bloqueie download automático
export interface LastDownloadInfo {
    url: string;
    filename: string;
    timestamp: number;
}

let lastDownload: LastDownloadInfo | null = null;
const downloadListeners = new Set<(info: LastDownloadInfo | null) => void>();

export function getLastDownload(): LastDownloadInfo | null {
    return lastDownload;
}

export function subscribeToDownloads(cb: (info: LastDownloadInfo | null) => void): () => void {
    downloadListeners.add(cb);
    return () => downloadListeners.delete(cb);
}

function notifyDownload(info: LastDownloadInfo) {
    lastDownload = info;
    downloadListeners.forEach(fn => fn(info));
}

/**
 * Converte dataUrl base64 em Blob de forma assíncrona e segura, evitando estouro de memória e erros de atob.
 */
export async function dataUrlToBlobAsync(dataUrl: string): Promise<Blob> {
    try {
        const res = await fetch(dataUrl);
        return await res.blob();
    } catch {
        return dataUrlToBlob(dataUrl);
    }
}

/**
 * Converte dataUrl base64 em Blob de forma síncrona com sanitização.
 */
export function dataUrlToBlob(dataUrl: string): Blob {
    try {
        const parts = dataUrl.split(',');
        const mimeMatch = parts[0].match(/:(.*?);/);
        const mime = mimeMatch ? mimeMatch[1] : 'application/octet-stream';
        const cleanBase64 = parts[1].replace(/[\s\r\n]+/g, '');
        const bstr = atob(cleanBase64);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        while (n--) {
            u8arr[n] = bstr.charCodeAt(n);
        }
        return new Blob([u8arr], { type: mime });
    } catch (e) {
        console.warn('dataUrlToBlob fallback básico:', e);
        return new Blob([dataUrl], { type: 'application/octet-stream' });
    }
}

/**
 * Dispara o download de um Blob de forma segura no navegador e dentro de iframes.
 */
export async function downloadBlob(blob: Blob, filename: string, revokeDelayMs: number = 120000): Promise<boolean> {
    try {
        const blobUrl = URL.createObjectURL(blob);
        notifyDownload({ url: blobUrl, filename, timestamp: Date.now() });

        const link = document.createElement('a');
        link.style.display = 'none';
        link.href = blobUrl;
        link.download = filename;
        link.setAttribute('download', filename);
        link.rel = 'noopener';

        document.body.appendChild(link);

        // Dispara o download diretamente pelo método padrão do HTML
        link.click();

        // Remove o elemento após o click sem revogar a URL imediatamente
        setTimeout(() => {
            if (link.parentNode) {
                link.parentNode.removeChild(link);
            }
        }, 1500);

        // Mantém a URL ativa por 2 minutos (120s) para garantir que o download termine a gravação
        setTimeout(() => {
            try {
                URL.revokeObjectURL(blobUrl);
            } catch {
                // Ignore
            }
        }, revokeDelayMs);

        return true;
    } catch (err) {
        console.error('Erro ao disparar download do blob:', err);
        return false;
    }
}

/**
 * Dispara o download de qualquer fonte (Blob ou DataURL ou URL remota).
 */
export async function downloadFile(
    source: Blob | string,
    filename: string,
    options?: { mimeType?: string; revokeDelayMs?: number }
): Promise<boolean> {
    if (source instanceof Blob) {
        return downloadBlob(source, filename, options?.revokeDelayMs);
    }

    if (typeof source === 'string') {
        if (source.startsWith('data:')) {
            const blob = dataUrlToBlob(source);
            return downloadBlob(blob, filename, options?.revokeDelayMs);
        }

        if (source.startsWith('blob:')) {
            const link = document.createElement('a');
            link.style.display = 'none';
            link.href = source;
            link.download = filename;
            link.setAttribute('download', filename);
            document.body.appendChild(link);
            link.click();
            setTimeout(() => {
                if (link.parentNode) link.parentNode.removeChild(link);
            }, 1000);
            return true;
        }

        // Para URLs remotas (HTTP / HTTPS), busca como Blob para contornar bloqueio de download por CORS
        try {
            const res = await fetch(source, { mode: 'cors' });
            if (res.ok) {
                const blob = await res.blob();
                return downloadBlob(blob, filename, options?.revokeDelayMs);
            }
        } catch {
            // Fallback direto
        }

        const link = document.createElement('a');
        link.style.display = 'none';
        link.href = source;
        link.download = filename;
        link.setAttribute('download', filename);
        document.body.appendChild(link);
        link.click();
        setTimeout(() => {
            if (link.parentNode) link.parentNode.removeChild(link);
        }, 1000);
        return true;
    }

    return false;
}

/**
 * Baixa uma lista de arquivos sequencialmente com intervalo para não bloquear a fila do navegador.
 */
export async function downloadBatchFiles(
    files: Array<{ source: Blob | string; filename: string }>,
    intervalMs: number = 300,
    onProgress?: (current: number, total: number) => void
): Promise<void> {
    for (let i = 0; i < files.length; i++) {
        const item = files[i];
        if (onProgress) {
            onProgress(i + 1, files.length);
        }
        await downloadFile(item.source, item.filename);
        if (i < files.length - 1) {
            await new Promise(r => setTimeout(r, intervalMs));
        }
    }
}
