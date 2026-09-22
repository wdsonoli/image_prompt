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
    const isRemoveBranding = settings.mode === 'remove_branding' || !!settings.removeBranding;

    const consensusInstructions = `You are the Multi-Vision Consensus Orchestrator (Super Vision Ensemble).
Perform a multi-layered simultaneous optical and aesthetic analysis of the provided image across 4 specialized dimensions:

[LAYER 1: GEOMETRY & COMPOSITION]
Analyze the spatial balance, aspect ratio, camera focal length, vanishing lines, container proportions, and subject/background isolation.
${isRemoveBranding ? 'CRITICAL MANDATE: Completely remove all branding, labels, logos, trademarks, and typography. The container/bottle/can becomes an unbranded, seamless, unprinted commercial package.' : ''}
${isExtractBg ? 'RULE: The main foreground subject is omitted to preserve an empty scenic plate.' : ''}

[LAYER 2: LIGHTING PHYSICS & ATMOSPHERE]
Analyze the light sources (key light, fill, ambient bounce, color temperature in Kelvin, rim illumination, shadow falloff, condensation glints).

[LAYER 3: MATERIALS & TACTILE TEXTURES - COLOR PRESERVATION]
Analyze surface shaders (roughness, specular reflections, subsurface scattering, micro-textures, liquid clarity, and metallic gloss).
${isRemoveBranding ? 'STRICT COLOR PRESERVATION: Preserve 100% of the authentic product color palette (exact bottle glass hue, aluminum can paint, liquid color, cap color). The blank surface must match the original color flawlessly.' : ''}

[LAYER 4: SYNTHESIS & TARGET PLATFORM OPTIMIZATION]
Synthesize the above layers into a single, cohesive, breathtaking master prompt specifically formatted for:
Platform: ${settings.targetPlatform}
Style: ${settings.style}
Detail Level: ${settings.detailLevel}/10
Directives: Lighting (${settings.lighting}), Camera Angle (${settings.cameraAngle}), Position (${settings.productPosition})
${isRemoveBranding ? 'Directive: UNBRANDED CLEAN PRODUCT - NO LOGOS, NO LABELS, PRESERVE AUTHENTIC PRODUCT COLORS' : ''}

FORMAT RULE: Output ONLY the synthesized master prompt ready for production generation, with no introductory text or markdown labels.`;

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
                    text: consensusInstructions
                }
            ]
        },
        config: {
            temperature: 0.6,
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

    if (!response.text) throw new Error("Consenso Multi-Visão returned an empty response.");
    return response.text.trim();
};
