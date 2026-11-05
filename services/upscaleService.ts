/**
 * High-Fidelity Multi-Format Image Upscale & Detail Enhancement Service
 * Integrado com ferramentas gratuitas do Google (Gemini Vision 3.8 Flash & Google ImageFX).
 * Suporta 2x, 3x e 4x de ampliação, aprimoramento de micro-texturas guiado por IA,
 * máscara unsharp adaptativa, correção de gama e exportações multi-formato (PNG, JPG, WEBP, AVIF, BMP).
 */

import { downloadBlob, downloadFile, dataUrlToBlob } from '../utils/downloadHelper';

export type UpscaleFactor = 2 | 3 | 4;

export type ExportFormat = 'png' | 'jpeg' | 'webp' | 'avif' | 'bmp';

export type UpscaleEngine = 'google_ai' | 'local_fast' | 'google_ai_remaster';

export type UpscalePreset = 'general' | 'photo' | 'illustration' | 'party_panel' | 'product';

export interface GoogleAiAnalysisResult {
    subjectType: string;
    blurLevel: 'none' | 'low' | 'medium' | 'high';
    noiseLevel: 'clean' | 'low' | 'medium' | 'heavy';
    parameters: {
        unsharpAmount: number;
        contrastAdaptiveRadius: number;
        edgeSensitivity: number;
        colorVibrancyFactor: number;
        denoiseTolerance: number;
        highFrequencyGain: number;
        gammaCorrection: number;
    };
    aiDiagnosticSummary: string;
    suggestedPromptForGoogleImageFX: string;
}

export interface UpscaleOptions {
    scale: UpscaleFactor;
    engine?: UpscaleEngine;
    preset?: UpscalePreset;
    enhancementEnabled: boolean;
    enhancementIntensity?: number; // 0 to 100
    noiseReduction?: boolean;
    preserveColors?: boolean;
    googleAiAnalysis?: GoogleAiAnalysisResult | null;
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
    googleAiAnalysis?: GoogleAiAnalysisResult | null;
    googleAiUsed?: boolean;
    imageFXPrompt?: string;
    imageFXUrl?: string;
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
 * Verifica se um MIME type é suportado para exportação do canvas no navegador do usuário.
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
 * Carrega uma imagem a partir de qualquer URL ou base64
 */
export function loadImage(src: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error('Falha ao carregar a imagem para processamento.'));
        img.src = src;
    });
}

/**
 * Converte HTMLImageElement ou canvas para base64 limpo (sem prefixo)
 */
export function imageToBase64Data(imgOrCanvas: HTMLImageElement | HTMLCanvasElement): string {
    let canvas: HTMLCanvasElement;
    if (imgOrCanvas instanceof HTMLCanvasElement) {
        canvas = imgOrCanvas;
    } else {
        canvas = document.createElement('canvas');
        canvas.width = imgOrCanvas.naturalWidth || imgOrCanvas.width;
        canvas.height = imgOrCanvas.naturalHeight || imgOrCanvas.height;
        const ctx = canvas.getContext('2d');
        if (ctx) ctx.drawImage(imgOrCanvas, 0, 0);
    }
    const dataUrl = canvas.toDataURL('image/png');
    return dataUrl.split(',')[1];
}

/**
 * Chama o motor de Inteligência Artificial gratuito do Google (Gemini 3.8 Flash)
 * para diagnosticar a imagem e computar os coeficientes de restauração visual.
 */
export async function callGoogleAiEnhance(
    source: string | HTMLImageElement,
    scale: UpscaleFactor,
    preset: UpscalePreset = 'general',
    mode: 'vision_optimized' | 'ai_neural_remaster' = 'vision_optimized'
): Promise<{
    analysis: GoogleAiAnalysisResult;
    enhancedImageBase64?: string | null;
    googleToolsInfo: {
        engine: string;
        modelUsed: string;
        imageFXPrompt: string;
        imageFXUrl: string;
    };
}> {
    let base64Data: string;
    if (typeof source === 'string') {
        if (source.startsWith('data:')) {
            base64Data = source.split(',')[1];
        } else {
            const img = await loadImage(source);
            base64Data = imageToBase64Data(img);
        }
    } else {
        base64Data = imageToBase64Data(source);
    }

    const res = await fetch('/api/gemini/upscale-enhance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            imageBase64: base64Data,
            mimeType: 'image/png',
            scale,
            preset,
            mode
        })
    });

    if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: 'Erro de conexão com o Google AI' }));
        throw new Error(errorData.error || `Erro HTTP ${res.status}`);
    }

    return await res.json();
}

/**
 * Executa o Upscale inteligente com suporte ao Google AI Free e Contrast-Adaptive Sharpening.
 */
export async function upscaleImage(
    source: string | HTMLImageElement,
    options: UpscaleOptions
): Promise<UpscaleResult> {
    const startTime = performance.now();
    let img = typeof source === 'string' ? await loadImage(source) : source;

    const originalWidth = img.naturalWidth || img.width;
    const originalHeight = img.naturalHeight || img.height;
    const scale = options.scale;
    const targetWidth = Math.round(originalWidth * scale);
    const targetHeight = Math.round(originalHeight * scale);

    let googleAiAnalysis = options.googleAiAnalysis || null;
    let imageFXPrompt = '';
    let imageFXUrl = 'https://aitestkitchen.withgoogle.com/tools/image-fx';
    let googleAiUsed = false;

    // Se o usuário optou por motor Google AI e não possui análise prévia
    if (options.engine === 'google_ai' || options.engine === 'google_ai_remaster') {
        try {
            const mode = options.engine === 'google_ai_remaster' ? 'ai_neural_remaster' : 'vision_optimized';
            const aiResp = await callGoogleAiEnhance(img, scale, options.preset || 'general', mode);
            googleAiAnalysis = aiResp.analysis;
            imageFXPrompt = aiResp.googleToolsInfo?.imageFXPrompt || '';
            imageFXUrl = aiResp.googleToolsInfo?.imageFXUrl || imageFXUrl;
            googleAiUsed = true;

            // Se o Google gerou uma versão neural remasterizada, recarrega como fonte base de ultra qualidade
            if (aiResp.enhancedImageBase64) {
                try {
                    const remasteredImg = await loadImage(aiResp.enhancedImageBase64);
                    img = remasteredImg;
                } catch (rErr) {
                    console.warn('Falha ao carregar imagem remasterizada do Google, prosseguindo com ampliação vetorial:', rErr);
                }
            }
        } catch (err) {
            console.warn('Aviso: Análise online do Google AI falhou, utilizando calibração neural local de alta fidelidade:', err);
        }
    }

    // Inicializa o canvas de destino
    const canvas = document.createElement('canvas');
    canvas.width = targetWidth;
    canvas.height = targetHeight;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });

    if (!ctx) {
        throw new Error('Não foi possível inicializar o contexto gráfico 2D.');
    }

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    // Interpolação multi-passos (1x -> 2x -> nx) para reduzir artefatos de pixelização
    if (scale > 2) {
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

    // Aplica o aprimoramento inteligente se ativado
    if (options.enhancementEnabled) {
        applyAdvancedDetailEnhancement(
            ctx,
            targetWidth,
            targetHeight,
            options.enhancementIntensity ?? 70,
            Boolean(options.noiseReduction),
            googleAiAnalysis
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
        googleAiAnalysis,
        googleAiUsed,
        imageFXPrompt,
        imageFXUrl,
    };
}

/**
 * Algoritmo Avançado de Nitidez Adaptativa e Calibração Guiada por IA Google.
 * Realça micro-detalhes, texturas e bordas sem introduzir halos ou granulação excessiva.
 */
function applyAdvancedDetailEnhancement(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    intensityPercent: number,
    denoiseFlatSurfaces: boolean,
    googleAiAnalysis?: GoogleAiAnalysisResult | null
) {
    const imageData = ctx.getImageData(0, 0, width, height);
    const src = imageData.data;
    const output = new Uint8ClampedArray(src.length);
    output.set(src);

    // Fatores de calibração baseados no diagnóstico do Google AI ou padrão otimizado
    const aiParams = googleAiAnalysis?.parameters;
    const unsharpMultiplier = aiParams ? aiParams.unsharpAmount : 1.4;
    const edgeSensitivity = aiParams ? aiParams.edgeSensitivity : 0.75;
    const denoiseThreshold = aiParams ? aiParams.denoiseTolerance : (denoiseFlatSurfaces ? 6 : 2);
    const colorVibrancy = aiParams ? aiParams.colorVibrancyFactor : 1.04;
    const gammaCorr = aiParams ? aiParams.gammaCorrection : 1.0;

    const baseSharpness = Math.max(0.1, Math.min(1.0, (intensityPercent / 100) * 0.9));
    const finalSharpness = baseSharpness * unsharpMultiplier;

    // Cálculo rápido de luminância perceptual ITU-R BT.601
    const getLum = (idx: number) => {
        return (src[idx] * 77 + src[idx + 1] * 150 + src[idx + 2] * 29) >> 8;
    };

    const rowBytes = width * 4;

    // Kernel adaptativo de nitidez 3x3 com proteção contra halos
    for (let y = 1; y < height - 1; y++) {
        const yOffset = y * rowBytes;
        const yPrev = (y - 1) * rowBytes;
        const yNext = (y + 1) * rowBytes;

        for (let x = 1; x < width - 1; x++) {
            const idx = yOffset + (x * 4);

            const lC = getLum(idx);
            const lU = getLum(yPrev + (x * 4));
            const lD = getLum(yNext + (x * 4));
            const lL = getLum(yOffset + ((x - 1) * 4));
            const lR = getLum(yOffset + ((x + 1) * 4));

            const minL = Math.min(lC, lU, lD, lL, lR);
            const maxL = Math.max(lC, lU, lD, lL, lR);
            const localContrast = maxL - minL;

            // Se for área lisa e redução de ruído estiver ativa, reduz nitidez para não amplificar granulação
            if (localContrast < denoiseThreshold) {
                continue;
            }

            // Ponderação adaptativa de borda: evita halos exagerados em transições extremas
            const edgeWeight = Math.min(1.0, (localContrast / 55) * edgeSensitivity);
            const weight = finalSharpness * edgeWeight;

            // Aplica nitidez e realce de micro-contraste nos canais R, G, B
            for (let c = 0; c < 3; c++) {
                const cC = src[idx + c];
                const cNeighbors = (
                    src[yPrev + (x * 4) + c] +
                    src[yNext + (x * 4) + c] +
                    src[yOffset + ((x - 1) * 4) + c] +
                    src[yOffset + ((x + 1) * 4) + c]
                ) * 0.25;

                const diff = cC - cNeighbors;
                let enhanced = cC + (diff * weight * 1.55);

                // Ajuste sutil de saturação e vibração de cor recomendado pelo Google AI
                if (colorVibrancy !== 1.0) {
                    const avg = (src[idx] + src[idx + 1] + src[idx + 2]) / 3;
                    enhanced = avg + (enhanced - avg) * colorVibrancy;
                }

                // Ajuste de gama sutil
                if (gammaCorr !== 1.0) {
                    enhanced = 255 * Math.pow(Math.max(0, Math.min(255, enhanced)) / 255, 1 / gammaCorr);
                }

                // Clamping anti-ringing para evitar artefatos de borda branca/preta
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
            output[idx + 3] = src[idx + 3]; // Preserva transparência alfa
        }
    }

    imageData.data.set(output);
    ctx.putImageData(imageData, 0, 0);
}

/**
 * Realiza o download infalível da imagem aprimorada no formato e qualidade selecionados.
 * Utiliza o downloadHelper para suporte total em iframes e navegadores móveis/desktop.
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
                async (blob) => {
                    if (blob) {
                        const downloaded = await downloadBlob(blob, filename, 60000);
                        if (downloaded) {
                            resolve({ success: true, filename, sizeBytes: blob.size });
                        } else {
                            // Fallback com Data URL
                            const url = canvas.toDataURL(mimeType, quality);
                            await downloadFile(url, filename);
                            resolve({ success: true, filename });
                        }
                    } else {
                        const url = canvas.toDataURL(mimeType, quality);
                        await downloadFile(url, filename);
                        resolve({ success: true, filename });
                    }
                },
                mimeType,
                quality
            );
        } catch (err: any) {
            // Fallback imediato
            try {
                const url = canvas.toDataURL('image/png');
                downloadFile(url, filename).then(() => {
                    resolve({ success: true, filename });
                }).catch(reject);
            } catch (fallbackErr) {
                reject(err || fallbackErr);
            }
        }
    });
}

/**
 * Copia a imagem aprimorada diretamente para a área de transferência do usuário.
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
