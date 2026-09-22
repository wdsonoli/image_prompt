import { PromptSettings } from '../types';
import { GoogleGenAI } from '@google/genai';

/**
 * Ideogram 2.0 Graphic & Typography Vision Engine
 * Specialized in graphic design, brand identities, posters, badges, typography,
 * text rendered in exact quotation marks, clean vector shapes, and graphic illustration.
 */
export const generateIdeogramPrompt = async (
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
    const isRemoveBranding = settings.mode === 'remove_branding' || !!settings.removeBranding;

    const ideogramInstructions = isRemoveBranding
        ? `You are the Ideogram 2.0 Graphic Design & Packaging Engine in DE-BRANDING & CLEAN PRODUCT MODE.
Analyze the image to produce an UNBRANDED, LABEL-FREE product render:
1. STRICT NEGATIVE INSTRUCTION: ZERO text, ZERO logos, ZERO brand typography, ZERO stickers, ZERO slogans.
2. PRESERVE THE EXACT COLOR PALETTE: Preserve the exact color of the beverage container (can color, bottle glass tint), cap color, and liquid color.
3. Replace any label area with a clean, smooth, unprinted surface in the identical base color and material finish.
4. Professional studio lighting and commercial product composition.
5. Target style: ${settings.style}.
6. Return ONLY the raw prompt for an unbranded product with authentic preserved colors.`
        : `You are the Ideogram 2.0 Graphic Design & Typography Vision Engine.
Analyze the image specifically looking for:
1. Graphic elements, branding, logos, badges, layouts, and typography.
2. If there is visible text or lettering in the image, extract it and place it explicitly within quotation marks (e.g. typography that reads "BRAND").
3. Describe font aesthetics (e.g., bold geometric sans-serif, vintage serif, elegant handwritten script, embossed metallic 3D letters).
4. Outline the graphic composition: visual hierarchy, vector silhouettes, flat-lay balance, color palette, and clean background contrast.
5. If in 3D SEAL / LOGO mode: specify clean vector geometry, bevel edges, embossed depth, studio isometric lighting.
6. Target style: ${settings.style}.
7. Return ONLY the raw prompt optimized for Ideogram 2.0.`;

    let response;
    const requestPayload = {
        contents: {
            parts: [
                {
                    inlineData: {
                        data: base64Image,
                        mimeType: mimeType
                    }
                },
                {
                    text: `${ideogramInstructions}\n\nAdditional directives: Lighting ${settings.lighting}, Angle ${settings.cameraAngle}`
                }
            ]
        },
        config: {
            temperature: 0.5,
        }
    };

    try {
        response = await ai.models.generateContent({
            model: 'gemini-3.8-flash',
            ...requestPayload
        });
    } catch (flashErr) {
        console.warn("Attempt with gemini-3.8-flash failed, falling back to gemini-3.5-flash:", flashErr);
        response = await ai.models.generateContent({
            model: 'gemini-3.5-flash',
            ...requestPayload
        });
    }

    if (!response.text) throw new Error("Ideogram Vision returned an empty response.");
    return response.text.trim();
};
