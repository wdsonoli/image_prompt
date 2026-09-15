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

    const ideogramInstructions = `You are the Ideogram 2.0 Graphic Design & Typography Vision Engine.
Analyze the image specifically looking for:
1. Graphic elements, branding, logos, badges, layouts, and typography.
2. If there is visible text or lettering in the image, extract it and place it explicitly within quotation marks (e.g. typography that reads "BRAND").
3. Describe font aesthetics (e.g., bold geometric sans-serif, vintage serif, elegant handwritten script, embossed metallic 3D letters).
4. Outline the graphic composition: visual hierarchy, vector silhouettes, flat-lay balance, color palette, and clean background contrast.
5. If in 3D SEAL / LOGO mode: specify clean vector geometry, bevel edges, embossed depth, studio isometric lighting.
6. Target style: ${settings.style}.
7. Return ONLY the raw prompt optimized for Ideogram 2.0.`;

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
                    text: `${ideogramInstructions}\n\nAdditional directives: Lighting ${settings.lighting}, Angle ${settings.cameraAngle}`
                }
            ]
        },
        config: {
            temperature: 0.5,
        }
    });

    if (!response.text) throw new Error("Ideogram Vision returned an empty response.");
    return response.text.trim();
};
