import { PromptSettings } from '../types';

/**
 * Consenso Multi-Visão (Super Vision Ensemble)
 * Queries multi-angle visual analyzers:
 * 1. Structural Geometry & Subject Morphology
 * 2. Optical Physics & Ambient Lighting
 * 3. Textures, Materials & Fine Micro-details
 * 4. Target Platform Prompt Optimization
 * And combines them into a master consensus prompt via server-side Gemini.
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

    const isExtractBg = settings.mode === 'extract_background';
    const isExtractElement = settings.mode === 'extract_element';
    const isRemoveBranding = settings.mode === 'remove_branding' || Boolean(settings.removeBranding);

    const consensusInstructions = `You are the Multi-Vision Consensus Orchestrator (Super Vision Ensemble).
Perform a multi-layered simultaneous optical and aesthetic analysis of the provided image across 4 specialized dimensions:

[LAYER 1: GEOMETRY & COMPOSITION]
Analyze the spatial balance, aspect ratio, camera focal length, vanishing lines, container proportions, and subject/background isolation.
${isExtractElement ? 'CRITICAL MANDATE: Completely isolate the primary foreground element/subject. Omit all background scenery, placing the subject isolated in pristine studio composition.' : ''}
${isRemoveBranding ? 'CRITICAL MANDATE: Completely remove all branding, labels, logos, trademarks, and typography. The container/bottle/can becomes an unbranded, seamless, unprinted commercial package.' : ''}
${isExtractBg ? 'RULE: The main foreground subject is omitted to preserve an empty scenic plate.' : ''}

[LAYER 2: LIGHTING PHYSICS & ATMOSPHERE]
Analyze the light sources (key light, fill, ambient bounce, color temperature in Kelvin, rim illumination, shadow falloff, condensation glints).

[LAYER 3: MATERIALS & TACTILE TEXTURES - COLOR PRESERVATION]
Analyze surface shaders (roughness, specular reflections, subsurface scattering, micro-textures, liquid clarity, and metallic gloss).
${isRemoveBranding ? 'STRICT COLOR PRESERVATION: Preserve 100% of the authentic product color palette (exact bottle glass hue, aluminum can paint, liquid color, cap color). The blank surface must match the original color flawlessly.' : ''}
${isExtractElement ? 'ELEMENT TEXTURE & CONTOURS: Preserve 100% of the authentic colors, razor-sharp cutout contours, and tactile surface characteristics of the isolated element.' : ''}

[LAYER 4: SYNTHESIS & TARGET PLATFORM OPTIMIZATION]
Synthesize the above layers into a single, cohesive, breathtaking master prompt specifically formatted for:
Platform: ${settings.targetPlatform}
Style: ${settings.style}
Detail Level: ${settings.detailLevel}/10
Directives: Lighting (${settings.lighting}), Camera Angle (${settings.cameraAngle}), Position (${settings.productPosition})
${isExtractElement ? 'Directive: ISOLATED FOREGROUND ELEMENT - CLEAN STUDIO LIGHTING, NO BACKGROUND SCENERY' : ''}
${isRemoveBranding ? 'Directive: UNBRANDED CLEAN PRODUCT - NO LOGOS, NO LABELS, PRESERVE AUTHENTIC PRODUCT COLORS' : ''}

FORMAT RULE: Output ONLY the synthesized master prompt ready for production generation, with no introductory text or markdown labels.`;

    try {
        const res = await fetch('/api/gemini/vision-persona', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                systemInstruction: consensusInstructions,
                userPrompt: 'Synthesize the multi-vision consensus prompt now.',
                imageBase64: base64Image,
                mimeType
            })
        });

        if (!res.ok) {
            const errData = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
            throw new Error(errData.error || `Erro HTTP ${res.status}`);
        }

        const data = await res.json();
        if (!data.prompt) throw new Error("Consenso Multi-Visão retornou resposta vazia.");
        return data.prompt.trim();
    } catch (err: any) {
        console.error("Falha no Consenso Multi-Visão:", err);
        throw err;
    }
};
