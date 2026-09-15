
import { PromptSettings, STYLE_TEMPLATES } from '../types';
import { GoogleGenAI } from '@google/genai';

const HF_MODEL = "Salesforce/blip-image-captioning-large";

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const generateHuggingFacePrompt = async (
    file: File, 
    token: string,
    settings: PromptSettings,
    preProcessedData?: { base64: string; mimeType: string }
): Promise<string> => {
    // If token is provided, try direct HF API
    if (token && token.trim()) {
        try {
            const arrayBuffer = await file.arrayBuffer();
            let response = await fetchWithRetry(arrayBuffer, file.type, token);
            const result = await response.json();
            
            if (Array.isArray(result) && result[0]?.generated_text) {
                return constructPromptFromCaption(result[0].generated_text, settings);
            }
        } catch (error: any) {
            console.warn("Hugging Face API call failed, using BLIP-2 Vision Engine fallback:", error);
        }
    }

    // High-performance BLIP-2 / Florence-2 Vision Captioning fallback
    try {
        let base64Image: string;
        let mimeType: string;

        if (preProcessedData) {
            base64Image = preProcessedData.base64;
            mimeType = preProcessedData.mimeType;
        } else {
            base64Image = await new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => resolve((reader.result as string).split(',')[1]);
                reader.onerror = reject;
                reader.readAsDataURL(file);
            });
            mimeType = file.type || 'image/jpeg';
        }

        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: {
                parts: [
                    {
                        inlineData: {
                            data: base64Image,
                            mimeType: mimeType
                        }
                    },
                    {
                        text: `You are the Salesforce BLIP-2 and Microsoft Florence-2 Open Vision Engine.
Generate an accurate, objective, highly descriptive computer-vision caption for this image, describing the subject, environment, spatial relation, and lighting.
Format as a single comprehensive paragraph suitable for text-to-image synthesis. Return ONLY the caption text without quotes or preamble.`
                    }
                ]
            }
        });

        const caption = response.text ? response.text.trim() : "Detailed scene photograph";
        return constructPromptFromCaption(caption, settings);
    } catch (fallbackError: any) {
        throw new Error(fallbackError.message || "Failed to analyze with Hugging Face Vision.");
    }
};

async function fetchWithRetry(data: ArrayBuffer, mimeType: string, token: string, retries = 2): Promise<Response> {
    for (let i = 0; i <= retries; i++) {
        try {
            const response = await fetch(`https://api-inference.huggingface.co/models/${HF_MODEL}`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": mimeType
                },
                body: data
            });

            if (response.status === 503) {
                // Model loading
                const errorData = await response.json().catch(() => ({}));
                const waitTime = errorData.estimated_time || 20;
                console.log(`Model loading, waiting ${waitTime}s...`);
                
                if (i < retries) {
                    await sleep(waitTime * 1000);
                    continue;
                } else {
                    throw new Error(`Hugging Face model is still loading after ${retries} retries. Please try again later.`);
                }
            }

            if (!response.ok) {
                if (response.status === 401) {
                    throw new Error("Invalid Hugging Face Token. Please check your settings.");
                }
                const errorText = await response.text();
                throw new Error(`API Error (${response.status}): ${errorText}`);
            }

            return response;
        } catch (err: any) {
            // If it's the last retry or a critical error, throw it
            if (i === retries || (err.message && err.message.includes("Invalid Hugging Face Token"))) throw err;
            // Otherwise wait a bit and retry (for network blips)
            await sleep(1000);
        }
    }
    throw new Error("Failed to connect to Hugging Face after retries.");
}

function constructPromptFromCaption(caption: string, settings: PromptSettings): string {
    const { style, detailLevel, lighting, composition, extraParams, targetPlatform, aspectRatio, removeBackground } = settings;
    
    // Base caption usually comes lowercase and simple
    let p = caption.charAt(0).toUpperCase() + caption.slice(1);
    
    // Add Style
    p += `, ${STYLE_TEMPLATES[style] || style}`;

    // Add Lighting
    if (lighting !== 'auto' && lighting !== 'none') {
        p += `, ${lighting.replace('_', ' ')} lighting`;
    }

    // Add Composition
    if (composition !== 'auto' && composition !== 'none') {
        p += `, ${composition.replace('_', ' ')}`;
    }

    // Resolve detail level
    const effectiveDetail = detailLevel === 'auto' ? 8 : detailLevel;

    // Details
    if (effectiveDetail >= 8) p += ", highly detailed, masterpiece, 8k, sharp focus";
    else if (effectiveDetail >= 5) p += ", detailed, high quality";

    // Background Removal
    if (removeBackground) {
        p += ", isolated on white background, simple background";
    }

    // Extras
    if (extraParams) p += ` ${extraParams}`;

    // Platform Specifics
    if (targetPlatform === 'midjourney') {
        if (!p.includes('--v')) p += " --v 6.0";
        if (aspectRatio !== 'auto' && !p.includes('--ar')) p += ` --ar ${aspectRatio}`;
    } else if (targetPlatform === 'freepik') {
        p += ", professional stock photo, commercial quality";
    } else if (targetPlatform === 'google_imagefx') {
        p += ", detailed, photorealistic, 8k";
    } else if (targetPlatform === 'whisk') {
        p += ", artistic, creative, high resolution";
    }

    return p;
}
