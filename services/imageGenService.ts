export type ImageResolution = "4K" | "2K" | "1K" | "512px";
export type ImageAspectRatio = "1:1" | "16:9" | "9:16" | "4:3" | "3:4" | "21:9" | "4:1" | "1:4";
export type ImageGenModel = "gemini-3.1-flash-image-preview" | "gemini-3-pro-image" | "gemini-3.1-flash-image" | "gemini-3.1-flash-lite-image";

export interface GenerateImageOptions {
    prompt: string;
    model?: ImageGenModel;
    imageSize?: ImageResolution;
    aspectRatio?: ImageAspectRatio;
    imageContext?: { base64: string; mimeType: string };
    isHighQuality?: boolean;
}

export interface CreateOrEditImageOptions {
    prompt: string;
    mode?: 'create' | 'edit';
    imageContext?: { base64: string; mimeType: string };
    model?: ImageGenModel;
    aspectRatio?: ImageAspectRatio;
    imageSize?: ImageResolution;
}

export interface GenerationMetadata {
    imageUrl: string;
    modelUsed?: string;
    isQuotaFallback?: boolean;
    note?: string;
}

export let lastGenerationMetadata: GenerationMetadata | null = null;

/**
 * Generates an image using neural models with automatic free fallback via server-side endpoint.
 */
export const generateGemini3ProImage = async (options: GenerateImageOptions): Promise<string> => {
    const {
        prompt,
        model = "gemini-3.1-flash-image",
        imageSize = "1K",
        aspectRatio = "1:1",
        imageContext,
    } = options;

    try {
        const res = await fetch('/api/gemini/generate-image', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                prompt,
                model,
                imageSize,
                aspectRatio,
                imageBase64: imageContext?.base64,
                mimeType: imageContext?.mimeType || 'image/png'
            })
        });

        if (!res.ok) {
            const errData = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
            const cleanMsg = errData.error || `Erro HTTP ${res.status}`;
            const errObj = new Error(cleanMsg);
            (errObj as any).isQuotaExceeded = Boolean(errData.isQuotaExceeded);
            (errObj as any).status = res.status;
            throw errObj;
        }

        const data = await res.json();
        if (!data.imageUrl) {
            throw new Error("Nenhuma imagem gerada retornada pelo servidor.");
        }

        lastGenerationMetadata = {
            imageUrl: data.imageUrl,
            modelUsed: data.modelUsed,
            isQuotaFallback: Boolean(data.isQuotaFallback),
            note: data.note
        };

        return data.imageUrl;
    } catch (err: any) {
        console.error("Falha ao gerar imagem com Gemini:", err?.message || err);
        throw err;
    }
};

/**
 * Backwards-compatible generateImage function defaulting to high quality with Gemini 3 Pro support.
 */
export const generateImage = async (
    prompt: string, 
    isHighQuality: boolean = true,
    imageContext?: { base64: string, mimeType: string },
    preferredSize: "1K" | "2K" | "4K" = "1K"
): Promise<string> => {
    return generateGemini3ProImage({
        prompt,
        model: isHighQuality ? "gemini-3.1-flash-image" : "gemini-3.1-flash-lite-image",
        imageSize: preferredSize,
        imageContext,
        isHighQuality
    });
};

/**
 * Creates or edits an image using text prompts with flash image models.
 */
export const createOrEditWithFlashImagePreview = async (options: CreateOrEditImageOptions): Promise<string> => {
    const {
        prompt,
        mode = options.imageContext ? 'edit' : 'create',
        imageContext,
        model = 'gemini-3.1-flash-image',
        aspectRatio = '1:1',
        imageSize = '1K'
    } = options;

    return generateGemini3ProImage({
        prompt,
        model,
        aspectRatio,
        imageSize,
        imageContext: mode === 'edit' ? imageContext : undefined
    });
};
