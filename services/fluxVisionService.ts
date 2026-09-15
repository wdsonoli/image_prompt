import { PromptSettings } from '../types';
import { GoogleGenAI } from '@google/genai';

/**
 * Flux.1 Realism Vision Engine
 * Tailored for Black Forest Labs Flux.1 architecture (Dev, Schnell, Pro).
 * Emphasizes natural skin pores, realistic imperfections, natural daylight,
 * documentary photograph composition, micro-textures, and high dynamic range without plastic AI sheen.
 */
export const generateFluxPrompt = async (
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

    const fluxInstructions = `You are the Flux.1 Realism Prompt Architect specializing in Black Forest Labs Flux diffusion models.
Flux thrives on continuous, descriptive photographic prose rather than spammy keywords.

PROMPT CRITERIA:
1. Describe the scene like a professional award-winning photographer shooting RAW 35mm film.
2. Emphasize physical realism: micro-textures, authentic lighting bounce, natural skin textures (subtle freckles, natural pores), realistic fabric weaves, and atmospheric haze.
3. Completely avoid AI clichés such as "hyperrealistic, 8k, masterpiece, octane render". Instead describe the ACTUAL optical properties: lens focal length, natural depth of field, color temperature, and soft shadow gradients.
4. If EXTRACT_BACKGROUND (${isExtractBg}): isolate the background scenery plate, describing the environmental space, wall textures, ambient daylight, and empty interior/exterior architecture with no people or foreground objects.
5. Lighting directive: ${settings.lighting !== 'none' ? settings.lighting.replace(/_/g, ' ') : 'natural ambient lighting'}
6. Camera angle: ${settings.cameraAngle !== 'none' ? settings.cameraAngle.replace(/_/g, ' ') : 'eye-level candid perspective'}
7. Return ONLY the final prompt text in English, ready to paste into Flux.1.`;

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
                    text: `${fluxInstructions}\n\nStyle: ${settings.style}\nDetail Level: ${settings.detailLevel}/10`
                }
            ]
        },
        config: {
            temperature: 0.5,
        }
    });

    if (!response.text) throw new Error("Flux.1 Vision returned an empty response.");
    return response.text.trim();
};
