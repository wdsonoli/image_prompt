
import { GoogleGenAI } from "@google/genai";

export type ImageResolution = "4K" | "2K" | "1K" | "512px";
export type ImageAspectRatio = "1:1" | "16:9" | "9:16" | "4:3" | "3:4" | "21:9" | "4:1" | "1:4";
export type ImageGenModel = "gemini-3-pro-image" | "gemini-3.1-flash-image" | "gemini-3.1-flash-lite-image";

export interface GenerateImageOptions {
    prompt: string;
    model?: ImageGenModel;
    imageSize?: ImageResolution;
    aspectRatio?: ImageAspectRatio;
    imageContext?: { base64: string; mimeType: string };
    isHighQuality?: boolean;
}

/**
 * Generates an image using Gemini models, with first-class support for Gemini 3 Pro at 4K resolution.
 */
export const generateGemini3ProImage = async (options: GenerateImageOptions): Promise<string> => {
    const {
        prompt,
        model = "gemini-3-pro-image",
        imageSize = "4K",
        aspectRatio = "1:1",
        imageContext,
    } = options;

    // Rule: When using high-quality models (nano banana pro / gemini-3-pro-image / gemini-3.1-flash-image),
    // users must select their own API key.
    const aistudio = (window as any).aistudio;
    if (aistudio && typeof aistudio.hasSelectedApiKey === 'function') {
        try {
            const hasKey = await aistudio.hasSelectedApiKey();
            if (!hasKey && typeof aistudio.openSelectKey === 'function') {
                await aistudio.openSelectKey();
            }
        } catch (e) {
            console.warn("Could not check AI Studio API key state:", e);
        }
    }

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    // Prepare contents parts
    const parts: any[] = [];
    if (imageContext && imageContext.base64) {
        parts.push({
            inlineData: {
                data: imageContext.base64,
                mimeType: imageContext.mimeType || "image/png"
            }
        });
    }
    parts.push({ text: prompt });

    // Try target model first, with automatic fallback to gemini-3.1-flash-image if pro image encounters temporary issues
    const modelsToTry: ImageGenModel[] = [model];
    if (model === "gemini-3-pro-image") {
        modelsToTry.push("gemini-3.1-flash-image");
    }

    let lastError: any = null;

    for (const currentModel of modelsToTry) {
        try {
            const imageConfig: any = {
                aspectRatio: aspectRatio,
            };

            // imageSize is supported for gemini-3-pro-image and gemini-3.1-flash-image
            if (currentModel !== "gemini-3.1-flash-lite-image" && imageSize) {
                imageConfig.imageSize = imageSize;
            }

            const response = await ai.models.generateContent({
                model: currentModel,
                contents: {
                    parts: parts,
                },
                config: {
                    imageConfig: imageConfig,
                },
            });

            if (!response.candidates || response.candidates.length === 0) {
                throw new Error("A requisição foi bloqueada pelos filtros de segurança. Tente refinar o prompt.");
            }

            const candidate = response.candidates[0];
            if (candidate.content && candidate.content.parts) {
                for (const part of candidate.content.parts) {
                    if (part.inlineData) {
                        const base64EncodeString: string = part.inlineData.data;
                        return `data:image/png;base64,${base64EncodeString}`;
                    }
                }

                for (const part of candidate.content.parts) {
                    if (part.text) {
                        throw new Error(`Resposta do modelo: ${part.text}`);
                    }
                }
            }

            throw new Error("Nenhum dado de imagem retornado pelo modelo Gemini 3.");
        } catch (err: any) {
            console.warn(`Attempt with ${currentModel} failed:`, err);
            lastError = err;

            // If it's a permission error, prompt for key selection
            const errorMsg = err?.message || String(err);
            if (errorMsg.includes("Requested entity was not found") || errorMsg.includes("403") || errorMsg.includes("permission")) {
                if (aistudio && typeof aistudio.openSelectKey === 'function') {
                    await aistudio.openSelectKey();
                }
            }

            // Continue to fallback if available
        }
    }

    throw lastError || new Error("Falha na geração da imagem com Gemini 3 Pro.");
};

/**
 * Backwards-compatible generateImage function defaulting to high quality with Gemini 3 Pro 4K support.
 */
export const generateImage = async (
    prompt: string, 
    isHighQuality: boolean = true,
    imageContext?: { base64: string, mimeType: string },
    preferredSize: "1K" | "2K" | "4K" = "4K"
): Promise<string> => {
    return generateGemini3ProImage({
        prompt,
        model: isHighQuality ? "gemini-3-pro-image" : "gemini-3.1-flash-image",
        imageSize: preferredSize,
        imageContext,
        isHighQuality
    });
};
