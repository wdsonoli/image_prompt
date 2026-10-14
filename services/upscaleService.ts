/**
 * High-Fidelity Multi-Format Image Upscale & Detail Enhancement Service
 * Supports 2x, 3x, and 4x resolution scaling with toggleable adaptive detail enhancement,
 * unsharp masking, contrast-adaptive sharpening, and multi-format exports (PNG, JPG, WEBP, AVIF, BMP).
 */

export type UpscaleFactor = 2 | 3 | 4;

export type ExportFormat = 'png' | 'jpeg' | 'webp' | 'avif' | 'bmp';

export interface UpscaleOptions {
    scale: UpscaleFactor;
    enhancementEnabled: boolean;
    enhancementIntensity?: number; // 0 to 100
    noiseReduction?: boolean;
    preserveColors?: boolean;
}

export interface UpscaleResult {
    dataUrl: string;
    blob: Blob;
    width: number;
    height: number;
    originalWidth: number;
    originalHeight: number;
    scale: UpscaleFactor;
    megapixels: number;
    processingTimeMs: number;
    canvas: HTMLCanvasElement;
}

export interface ExportFormatInfo {
    id: ExportFormat;
    label: string;
    extension: string;
    mimeType: string;
    description: string;
    hasQualitySlider: boolean;
    recommendedFor: string;
    isSupported: boolean;
}

/**
 * Checks if a given mime type is supported for canvas export in the user's browser.
 */
export function isMimeTypeSupported(mimeType: string): boolean {
    try {
        const c = document.createElement('canvas');
        c.width = 1;
        c.height = 1;
        const uri = c.toDataURL(mimeType);
        return uri.startsWith(`data:${mimeType}`);
    } catch {
        return false;
    }
}

export const EXPORT_FORMATS: ExportFormatInfo[] = [
    {
        id: 'png',
        label: 'PNG (Lossless 4K)',
        extension: '.png',
        mimeType: 'image/png',
        description: 'Sem perdas de compressão com transparência preservada. Máxima fidelidade e nitidez de bordas.',
        hasQualitySlider: false,
        recommendedFor: 'Impressão, edição profissional e arte digital',
        isSupported: true,
    },
    {
        id: 'jpeg',
        label: 'JPG / JPEG (Ultra HQ)',
        extension: '.jpg',
        mimeType: 'image/jpeg',
        description: 'Fotografia com compressão ajustável (90% a 100%). Arquivos mais leves e universais.',
        hasQualitySlider: true,
        recommendedFor: 'Redes sociais, portfólios web e envio rápido',
        isSupported: true,
    },
    {
        id: 'webp',
        label: 'WebP (Google Modern)',
        extension: '.webp',
        mimeType: 'image/webp',
        description: 'Formato moderno do Google com 30% menos tamanho que JPG e suporte a transparência.',
        hasQualitySlider: true,
        recommendedFor: 'Websites de alta performance e visualizadores modernos',
        isSupported: isMimeTypeSupported('image/webp'),
    },
    {
        id: 'avif',
        label: 'AVIF (Next-Gen HDR)',
        extension: '.avif',
        mimeType: 'image/avif',
        description: 'Compressão AV1 de última geração com preservação de gama de cor superior.',
        hasQualitySlider: true,
        recommendedFor: 'Navegadores modernos com suporte AV1',
        isSupported: isMimeTypeSupported('image/avif'),
    },
    {
        id: 'bmp',
        label: 'BMP (Raw Bitmap)',
        extension: '.bmp',
        mimeType: 'image/bmp',
        description: 'Formato de mapa de bits puro sem qualquer compressão.',
        hasQualitySlider: false,
        recommendedFor: 'Sistemas legados e processamento bruto',
        isSupported: isMimeTypeSupported('image/bmp'),
    }
];

/**
 * Loads an image from any source (URL, data URL, blob URL) into an HTMLImageElement.
 */
export function loadImage(src: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => resolve(img);
        img.onerror = (e) => reject(new Error('Falha ao carregar a imagem para processamento.'));
        img.src = src;
    });
}

/**
 * Executes a step-wise high-fidelity scale and optional Contrast-Adaptive Sharpening.
 */
export async function upscaleImage(
    source: string | HTMLImageElement,
    options: UpscaleOptions
): Promise<UpscaleResult> {
    const startTime = performance.now();
    const img = typeof source === 'string' ? await loadImage(source) : source;

    const originalWidth = img.naturalWidth || img.width;
    const originalHeight = img.naturalHeight || img.height;
    const scale = options.scale;
    const targetWidth = Math.round(originalWidth * scale);
    const targetHeight = Math.round(originalHeight * scale);

    // Multi-pass intermediate scaling for cleaner interpolation if scale >= 3
    const canvas = document.createElement('canvas');
    canvas.width = targetWidth;
    canvas.height = targetHeight;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });

    if (!ctx) {
        throw new Error('Não foi possível inicializar o contexto gráfico 2D.');
    }

    // High quality bicubic / lanczos smoothing settings
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    if (scale > 2) {
        // Two-step scaling: 1x -> 2x -> targetWidth for smoother edge interpolation
        const intermediateCanvas = document.createElement('canvas');
        const interWidth = Math.round(originalWidth * 2);
        const interHeight = Math.round(originalHeight * 2);
        intermediateCanvas.width = interWidth;
        intermediateCanvas.height = interHeight;
        const interCtx = intermediateCanvas.getContext('2d');
        if (interCtx) {
            interCtx.imageSmoothingEnabled = true;
            interCtx.imageSmoothingQuality = 'high';
            interCtx.drawImage(img, 0, 0, interWidth, interHeight);
            ctx.drawImage(intermediateCanvas, 0, 0, targetWidth, targetHeight);
        } else {
            ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
        }
    } else {
        ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
    }

    // If enhancement is activated, apply contrast-adaptive sharpening & micro-texture recovery
    if (options.enhancementEnabled) {
        applyContrastAdaptiveSharpening(
            ctx, 
            targetWidth, 
            targetHeight, 
            options.enhancementIntensity ?? 65,
            Boolean(options.noiseReduction)
        );
    }

    const dataUrl = canvas.toDataURL('image/png');
    const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((b) => resolve(b || new Blob()), 'image/png');
    });

    const processingTimeMs = Math.round(performance.now() - startTime);
    const megapixels = Number(((targetWidth * targetHeight) / 1_000_000).toFixed(2));

    return {
        dataUrl,
        blob,
        width: targetWidth,
        height: targetHeight,
        originalWidth,
        originalHeight,
        scale,
        megapixels,
        processingTimeMs,
        canvas,
    };
}

/**
 * Contrast-Adaptive Sharpening (CAS) and Edge Refinement.
 * Enhances micro-textures (hair, skin, fabric, edges) while suppressing halo artifacts.
 */
function applyContrastAdaptiveSharpening(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    intensityPercent: number,
    denoiseFlatSurfaces: boolean
) {
    const imageData = ctx.getImageData(0, 0, width, height);
    const src = imageData.data;
    const output = new Uint8ClampedArray(src.length);
    output.set(src);

    const sharpness = Math.max(0.1, Math.min(1.0, (intensityPercent / 100) * 0.85));

    // Fast luminance calculator
    const getLum = (idx: number) => {
        return (src[idx] * 77 + src[idx + 1] * 150 + src[idx + 2] * 29) >> 8;
    };

    const rowBytes = width * 4;

    // Process interior pixels with 3x3 adaptive kernel
    for (let y = 1; y < height - 1; y++) {
        const yOffset = y * rowBytes;
        const yPrev = (y - 1) * rowBytes;
        const yNext = (y + 1) * rowBytes;

        for (let x = 1; x < width - 1; x++) {
            const idx = yOffset + (x * 4);

            // 4-neighborhood luminance
            const lC = getLum(idx);
            const lU = getLum(yPrev + (x * 4));
            const lD = getLum(yNext + (x * 4));
            const lL = getLum(yOffset + ((x - 1) * 4));
            const lR = getLum(yOffset + ((x + 1) * 4));

            const minL = Math.min(lC, lU, lD, lL, lR);
            const maxL = Math.max(lC, lU, lD, lL, lR);
            const contrast = maxL - minL;

            // If flat surface and noise reduction is on, suppress noise
            if (denoiseFlatSurfaces && contrast < 6) {
                continue;
            }

            // Contrast-adaptive weight: more sharpening on medium edges, softer on extremes to prevent halos
            const edgeWeight = Math.min(1.0, contrast / 64);
            const weight = sharpness * edgeWeight;

            // Apply unsharp enhancement to R, G, B channels
            for (let c = 0; c < 3; c++) {
                const cC = src[idx + c];
                const cNeighbors = (
                    src[yPrev + (x * 4) + c] +
                    src[yNext + (x * 4) + c] +
                    src[yOffset + ((x - 1) * 4) + c] +
                    src[yOffset + ((x + 1) * 4) + c]
                ) * 0.25;

                const diff = cC - cNeighbors;
                const enhanced = cC + (diff * weight * 1.5);

                // Anti-ringing clamp based on local neighborhood
                const minC = Math.min(
                    cC,
                    src[yPrev + (x * 4) + c],
                    src[yNext + (x * 4) + c],
                    src[yOffset + ((x - 1) * 4) + c],
                    src[yOffset + ((x + 1) * 4) + c]
                );
                const maxC = Math.max(
                    cC,
                    src[yPrev + (x * 4) + c],
                    src[yNext + (x * 4) + c],
                    src[yOffset + ((x - 1) * 4) + c],
                    src[yOffset + ((x + 1) * 4) + c]
                );

                output[idx + c] = Math.max(minC - 4, Math.min(maxC + 4, enhanced));
            }
            output[idx + 3] = src[idx + 3]; // Preserve alpha
        }
    }

    imageData.data.set(output);
    ctx.putImageData(imageData, 0, 0);
}

/**
 * Downloads the upscaled image in any selected file format and quality.
 */
export async function downloadUpscaledImage(
    canvasOrDataUrl: HTMLCanvasElement | string,
    format: ExportFormat = 'png',
    quality: number = 0.95,
    customFilename?: string
): Promise<{ success: boolean; filename: string; sizeBytes?: number }> {
    let canvas: HTMLCanvasElement;

    if (typeof canvasOrDataUrl === 'string') {
        const img = await loadImage(canvasOrDataUrl);
        canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth || img.width;
        canvas.height = img.naturalHeight || img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('Não foi possível gerar canvas para exportação.');
        ctx.drawImage(img, 0, 0);
    } else {
        canvas = canvasOrDataUrl;
    }

    const formatInfo = EXPORT_FORMATS.find(f => f.id === format) || EXPORT_FORMATS[0];
    const mimeType = formatInfo.isSupported ? formatInfo.mimeType : 'image/png';
    const extension = formatInfo.isSupported ? formatInfo.extension : '.png';

    const timestamp = Date.now();
    const filename = customFilename 
        ? `${customFilename.replace(/\.[^/.]+$/, "")}${extension}` 
        : `upscale-${canvas.width}x${canvas.height}-${timestamp}${extension}`;

    return new Promise((resolve, reject) => {
        try {
            canvas.toBlob(
                (blob) => {
                    if (!blob) {
                        // Fallback to dataUrl download
                        const url = canvas.toDataURL(mimeType, quality);
                        const link = document.createElement('a');
                        link.href = url;
                        link.download = filename;
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                        resolve({ success: true, filename });
                        return;
                    }

                    const blobUrl = URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.href = blobUrl;
                    link.download = filename;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);

                    setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
                    resolve({ success: true, filename, sizeBytes: blob.size });
                },
                mimeType,
                quality
            );
        } catch (err: any) {
            reject(err);
        }
    });
}

/**
 * Copies the upscaled image directly to the user's clipboard.
 */
export async function copyImageToClipboard(canvas: HTMLCanvasElement): Promise<boolean> {
    if (!navigator.clipboard || !window.ClipboardItem) {
        throw new Error('Cópia de imagem para a área de transferência não é suportada neste navegador.');
    }

    return new Promise((resolve, reject) => {
        canvas.toBlob(async (blob) => {
            if (!blob) {
                reject(new Error('Falha ao gerar blob para a área de transferência.'));
                return;
            }
            try {
                await navigator.clipboard.write([
                    new ClipboardItem({ 'image/png': blob })
                ]);
                resolve(true);
            } catch (err) {
                reject(err);
            }
        }, 'image/png');
    });
}
