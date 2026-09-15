import { PromptSettings } from '../types';
import { GoogleGenAI } from '@google/genai';

/**
 * Consenso Multi-Visão (Super Vision Ensemble)
 * Queries multi-angle visual analyzers:
 * 1. Structural Geometry & Subject Morphology
 * 2. Optical Physics & Ambient Lighting
 * 3. Textures, Materials & Fine Micro-details
 * 4. Target Platform Prompt Optimization
 * And combines them into a master consensus prompt.
 */
export const generateConsensusPrompt = async (
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

    const consensusInstructions = `You are the Multi-Vision Consensus Orchestrator (Super Vision Ensemble).
Perform a multi-layered simultaneous optical and aesthetic analysis of the provided image across 4 specialized dimensions:

[LAYER 1: GEOMETRY & COMPOSITION]
Analyze the spatial balance, aspect ratio, camera focal length, vanishing lines, and subject/background isolation.
${isExtractBg ? 'RULE: The main foreground subject is omitted to preserve an empty scenic plate.' : ''}

[LAYER 2: LIGHTING PHYSICS & ATMOSPHERE]
Analyze the light sources (key light, fill, ambient bounce, color temperature in Kelvin, rim illumination, shadow falloff).

[LAYER 3: MATERIALS & TACTILE TEXTURES]
Analyze surface shaders (roughness, specular reflections, subsurface scattering, micro-textures, fabric weave, or metallic gloss).

[LAYER 4: SYNTHESIS & TARGET PLATFORM OPTIMIZATION]
Synthesize the above 3 layers into a single, cohesive, breathtaking master prompt specifically formatted for:
Platform: ${settings.targetPlatform}
Style: ${settings.style}
Detail Level: ${settings.detailLevel}/10
Directives: Lighting (${settings.lighting}), Camera Angle (${settings.cameraAngle}), Position (${settings.productPosition})

FORMAT RULE: Output ONLY the synthesized master prompt ready for production generation, with no introductory text or markdown labels.`;

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
                    text: consensusInstructions
                }
            ]
        },
        config: {
            temperature: 0.6,
        }
    });

    if (!response.text) throw new Error("Consenso Multi-Visão returned an empty response.");
    return response.text.trim();
};
