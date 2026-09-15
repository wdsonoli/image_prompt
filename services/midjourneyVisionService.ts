import { PromptSettings } from '../types';
import { GoogleGenAI } from '@google/genai';

/**
 * Midjourney v6.1 "Describe" Vision Engine
 * Reverse-engineers the reference image specifically into Midjourney v6 prompt taxonomy,
 * featuring photographic equipment specifications, artistic genres, rendering tags,
 * and standard Midjourney CLI parameters (--ar, --v 6.1, --s 250, --style raw).
 */
export const generateMidjourneyDescribePrompt = async (
    file: File,
    settings: PromptSettings,
    preProcessedData?: { base64: string; mimeType: string }
): Promise<string> => {
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
    const isExtractBg = settings.mode === 'extract_background';
    const isRemoveBranding = settings.mode === 'remove_branding' || !!settings.removeBranding;

    const midjourneyInstructions = `You are the Midjourney v6.1 /describe Reverse Prompting Engine.
Analyze the visual composition, lighting physics, textures, camera optics, and aesthetic mood of the image.

FORMAT RULES:
1. Synthesize the image into a master Midjourney prompt composed of descriptive phrases separated by commas.
2. Include specific camera equipment if photographic (e.g., "shot on 35mm lens, Hasselblad H6D-100c, aperture f/2.8, ISO 200, soft focus").
3. Include specific lighting keywords (e.g., "volumetric rim lighting, diffused golden hour sunlight, chiaroscuro, cinematic shadows").
4. Include color grading and texture tags (e.g., "Kodachrome 64 color grading, subtle film grain, tactile 8k detail").
5. ${isRemoveBranding ? 'CRITICAL RULE - UNBRANDED CLEAN PRODUCT: completely de-brand the container. Remove any brand name, printed paper label, logo, or typography. Describe a clean, unprinted, blank beverage bottle/can surface while STRICTLY PRESERVING the exact authentic container color (e.g. emerald green glass, ruby red aluminum), cap color, and liquid color.' : (isExtractBg ? 'If MODE is EXTRACT_BACKGROUND: completely omit any foreground characters, people, or focal products, isolating the scenery as an empty photographic plate.' : '')}
6. Append Midjourney parameters at the very end:
   - Aspect ratio: --ar ${settings.aspectRatio !== 'auto' ? settings.aspectRatio : '16:9'}
   - Version: --v 6.1
   - Stylize: --s 250
   ${settings.style === 'photorealistic' ? '--style raw' : ''}
   ${isRemoveBranding ? '--no text, logo, brand, watermark, label' : ''}
7. Return ONLY the raw prompt. Do NOT wrap in quotes, do NOT write markdown headings or explanations.`;

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
                    text: `${midjourneyInstructions}\n\nStyle Directive: ${settings.style}\nLighting Directive: ${settings.lighting}\nComposition: ${settings.composition}`
                }
            ]
        },
        config: {
            temperature: 0.6,
        }
    });

    if (!response.text) throw new Error("Midjourney Vision returned an empty response.");
    return response.text.trim();
};
