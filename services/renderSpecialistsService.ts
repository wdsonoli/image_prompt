import { PromptSettings } from '../types';
import { callVisionPersona } from './visionPersonaHelper';

async function getImageData(
    file: File,
    preProcessedData?: { base64: string; mimeType: string }
): Promise<{ base64Image: string; mimeType: string }> {
    if (preProcessedData) {
        return {
            base64Image: preProcessedData.base64,
            mimeType: preProcessedData.mimeType
        };
    }
    const base64Image = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve((reader.result as string).split(',')[1]);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
    return {
        base64Image,
        mimeType: file.type || 'image/jpeg'
    };
}

function getReferenceFidelityDirective(detailLevel: number | 'auto'): string {
    const level = detailLevel === 'auto' ? 5 : detailLevel;
    if (level >= 7) {
        return `[CRITICAL RENDER PROTOCOL: MAXIMUM REFERENCE IMAGE FIDELITY (Level ${level}/10)]:
- EXACT SPECTRAL CHROMATIC ACCURACY: Transcribe the exact color values, subsurface hues, gradient transitions, and specular highlight positions from the reference image.
- SURFACE MICRO-ROUGHNESS & IOR: Detail the exact physical material attributes seen in the reference.
- EXACT GEOMETRIC CONTOURS: Match the reference subject's silhouette curvature, proportion ratios, bevel radii, and perspective angle with 1:1 precision.
- ACCURATE LIGHTING VECTORS: Replicate the precise light sources without introducing generic hallucinated lighting.
- The prompt must reproduce a 3D/photographic render that is as visually identical and faithful to this reference image as possible.`;
    }
    return `Detail Level: ${level}/10. Balance physical render accuracy with aesthetic polish.`;
}

function getSpecialistModeDirective(settings: PromptSettings, specialistName: string): string {
    const isExtractPerson = settings.mode === 'extract_person';
    const isExtractElement = settings.mode === 'extract_element';
    const isRemoveBranding = settings.mode === 'remove_branding' || Boolean(settings.removeBranding);
    const isExtractBg = settings.mode === 'extract_background';

    if (isExtractPerson) {
        return `
MODE: 3D DIGITAL HUMAN & CHARACTER CLONING (${specialistName}):
- Deeply analyze the person in the reference image and replicate them with 100% fidelity.
- Subsurface scattering (SSS skin shaders, epidermal layers, realistic skin pores and melanin absorption).
- Exact facial biometrics: eye shape, cornea specular reflections, nose structure, jawline, lips, wrinkles, and expression.
- Exact hairstyle, hair strand volume, styling, and cut.
- Exact wardrobe garments, fabric micro-weave, seams, buttons, draping, and colors.
- Exact body posture, shoulder angle, head tilt, and physical key/fill/rim lighting on the person.
- Render cleanly framed on a soft neutral studio backdrop ready for generation on ${settings.targetPlatform}.
`;
    }
    if (isExtractElement) {
        return `
MODE: ISOLATED 3D HERO ELEMENT / SUBJECT:
- Deconstruct and isolate the central product/subject as an isolated asset on a neutral studio cyclorama.
- Discard all background scene clutter.
- Preserve 100% of authentic PBR material shaders, specular reflections, and crisp cutout edge geometry.
`;
    }
    if (isRemoveBranding) {
        return `
MODE: UNBRANDED 3D COMMERCIAL ASSET / CLEAN SHADER:
- Remove all commercial logos, printed brand labels, typography, and trademarks.
- Replace label areas with a pristine, unprinted procedural material matching the container's base substance.
- STRICTLY PRESERVE 100% OF ORIGINAL CONTAINER & LIQUID COLORS.
`;
    }
    if (isExtractBg) {
        return `
MODE: EMPTY 3D SCENIC PLATE / ARCHITECTURAL ENVIRONMENT EXTRACTION:
- Completely omit any foreground characters, people, or focal products.
- Recreate the pristine background set architecture, props, ambient lighting, and environmental atmospheric stage.
`;
    }
    return 'Preserve authentic reference subject fidelity.';
}

/** 1. OCTANE RENDER */
export const analyzeWithOctaneRender = async (
    file: File, settings: PromptSettings, preProcessedData?: { base64: string; mimeType: string }
): Promise<string> => {
    const { base64Image, mimeType } = await getImageData(file, preProcessedData);
    const instruction = `You are a World-Class 3D Rendering Master specializing in OTOY Octane Render & Cinema 4D.
Deconstruct the reference image into physical GPU path-tracing specifications:
- Shaders: Octane Universal Material, specular dispersion, volumetric glass caustics, anisotropic roughness, subsurface scattering (SSS), thin-film iridescence.
- Lighting: Spectral ray-tracing, unbiased path tracer, physical area lights.
- Target Platform: ${settings.targetPlatform} | Desired Style: ${settings.style}
${getReferenceFidelityDirective(settings.detailLevel)}
${getSpecialistModeDirective(settings, 'Octane Render')}
Format output as an elite Octane-optimized prompt for ${settings.targetPlatform}. RETURN ONLY THE RAW PROMPT TEXT.`;

    const userPrompt = "Analyze this image using Octane Render physical path-tracing deconstruction and output the generation prompt with maximum fidelity to reference.";
    return await callVisionPersona(instruction, userPrompt, base64Image, mimeType);
};

/** 2. UNREAL ENGINE 5.5 */
export const analyzeWithUnrealEngine = async (
    file: File, settings: PromptSettings, preProcessedData?: { base64: string; mimeType: string }
): Promise<string> => {
    const { base64Image, mimeType } = await getImageData(file, preProcessedData);
    const instruction = `You are a Principal Unreal Engine 5.5 Technical Artist and Cine-Camera Director.
Analyze the reference image and formulate a next-gen UE5 real-time CGI generation prompt:
- Technology: Lumen dynamic global illumination, Nanite virtualized micro-polygon geometry, Megascans 8k PBR surfaces, Virtual Shadow Maps (VSM), cinematic depth of field.
- Target Platform: ${settings.targetPlatform} | Desired Style: ${settings.style}
${getReferenceFidelityDirective(settings.detailLevel)}
${getSpecialistModeDirective(settings, 'Unreal Engine 5.5')}
Format output as an authoritative Unreal Engine prompt for ${settings.targetPlatform}. RETURN ONLY THE RAW PROMPT TEXT.`;

    const userPrompt = "Analyze this image in Unreal Engine 5.5 Lumen & Nanite fidelity and output the production prompt with maximum reference fidelity.";
    return await callVisionPersona(instruction, userPrompt, base64Image, mimeType);
};

/** 3. LEONARDO PHOENIX */
export const analyzeWithLeonardoPhoenix = async (
    file: File, settings: PromptSettings, preProcessedData?: { base64: string; mimeType: string }
): Promise<string> => {
    const { base64Image, mimeType } = await getImageData(file, preProcessedData);
    const instruction = `You are the Lead Visual Architect for Leonardo.ai Phoenix & Alchemy v2.
Analyze the reference image and formulate an ultra-dense Leonardo Phoenix visual prompt:
- Aesthetics: Leonardo Phoenix ultra-coherent composition, Alchemy v2 prompt weighting, cinematic contrast, dynamic range.
- Target Platform: ${settings.targetPlatform} | Desired Style: ${settings.style}
${getReferenceFidelityDirective(settings.detailLevel)}
${getSpecialistModeDirective(settings, 'Leonardo Phoenix')}
Return ONLY the raw prompt ready for Leonardo Phoenix.`;

    const userPrompt = "Deconstruct this image using Leonardo Phoenix architecture and output the generation prompt with maximum fidelity.";
    return await callVisionPersona(instruction, userPrompt, base64Image, mimeType);
};

/** 4. STABLE DIFFUSION 3.5 */
export const analyzeWithStableDiffusion3 = async (
    file: File, settings: PromptSettings, preProcessedData?: { base64: string; mimeType: string }
): Promise<string> => {
    const { base64Image, mimeType } = await getImageData(file, preProcessedData);
    const instruction = `You are a Stability AI Prompt Engineer specializing in Stable Diffusion 3.5 Large (Multimodal MMDiT).
Formulate a rich, descriptive natural language prompt optimized for SD 3.5:
- Formatting: Coherent narrative sentences with high semantic richness, natural spatial positioning, realistic lighting.
- Target Platform: ${settings.targetPlatform} | Desired Style: ${settings.style}
${getReferenceFidelityDirective(settings.detailLevel)}
${getSpecialistModeDirective(settings, 'Stable Diffusion 3.5')}
Return ONLY the final prompt text.`;

    const userPrompt = "Analyze this image for Stable Diffusion 3.5 Large and output the master prompt with maximum reference fidelity.";
    return await callVisionPersona(instruction, userPrompt, base64Image, mimeType);
};

/** 5. REDSHIFT 3D */
export const analyzeWithRedshiftRender = async (
    file: File, settings: PromptSettings, preProcessedData?: { base64: string; mimeType: string }
): Promise<string> => {
    const { base64Image, mimeType } = await getImageData(file, preProcessedData);
    const instruction = `You are a Maxon Redshift 3D Production Rendering Specialist (Houdini & Maya).
Deconstruct the image into biased GPU production rendering terminology:
- Shaders: Redshift Standard Material, subsurface scattering, dispersion, roughness, physical dome light, volumetric scattering.
- Target Platform: ${settings.targetPlatform} | Desired Style: ${settings.style}
${getReferenceFidelityDirective(settings.detailLevel)}
${getSpecialistModeDirective(settings, 'Redshift 3D')}
Return ONLY the raw Redshift prompt.`;

    const userPrompt = "Analyze this image using Maxon Redshift 3D production rendering specifications and output the prompt with maximum reference fidelity.";
    return await callVisionPersona(instruction, userPrompt, base64Image, mimeType);
};

/** 6. V-RAY 6 */
export const analyzeWithVRayRender = async (
    file: File, settings: PromptSettings, preProcessedData?: { base64: string; mimeType: string }
): Promise<string> => {
    const { base64Image, mimeType } = await getImageData(file, preProcessedData);
    const instruction = `You are a Chaos Group V-Ray 6 Master Render Architect (3ds Max & Maya).
Deconstruct the reference image into architectural and commercial V-Ray specifications:
- Shaders: VRayMtl, physically accurate IOR, reflection glossiness, translucency, VRayPhysicalCamera.
- Target Platform: ${settings.targetPlatform} | Desired Style: ${settings.style}
${getReferenceFidelityDirective(settings.detailLevel)}
${getSpecialistModeDirective(settings, 'V-Ray 6')}
Return ONLY the raw V-Ray prompt.`;

    const userPrompt = "Analyze this image using Chaos V-Ray 6 rendering specifications and output the prompt with maximum fidelity.";
    return await callVisionPersona(instruction, userPrompt, base64Image, mimeType);
};

/** 7. CORONA RENDER */
export const analyzeWithCoronaRender = async (
    file: File, settings: PromptSettings, preProcessedData?: { base64: string; mimeType: string }
): Promise<string> => {
    const { base64Image, mimeType } = await getImageData(file, preProcessedData);
    const instruction = `You are a Chaos Corona Renderer Specialist for Scandinavian Architectural Visualization & Luxury Interior Design.
Deconstruct the reference image into Corona Physical Material specifications:
- Shaders: Natural diffuse scattering, subtle sheen, authentic wood/stone textures, soft daylight falloff.
- Target Platform: ${settings.targetPlatform} | Desired Style: ${settings.style}
${getReferenceFidelityDirective(settings.detailLevel)}
${getSpecialistModeDirective(settings, 'Corona Renderer')}
Return ONLY the raw Corona prompt.`;

    const userPrompt = "Analyze this image using Chaos Corona Renderer specifications and output the prompt with maximum reference fidelity.";
    return await callVisionPersona(instruction, userPrompt, base64Image, mimeType);
};

/** 8. BLENDER CYCLES */
export const analyzeWithBlenderCycles = async (
    file: File, settings: PromptSettings, preProcessedData?: { base64: string; mimeType: string }
): Promise<string> => {
    const { base64Image, mimeType } = await getImageData(file, preProcessedData);
    const instruction = `You are a Blender 4.3 Cycles Master Technical Artist.
Deconstruct the reference image into Blender Principled BSDF v2 node network specifications:
- Shaders: Principled BSDF v2, metallic, roughness, IOR, anisotropic reflections, micro-displacement.
- Target Platform: ${settings.targetPlatform} | Desired Style: ${settings.style}
${getReferenceFidelityDirective(settings.detailLevel)}
${getSpecialistModeDirective(settings, 'Blender Cycles')}
Return ONLY the raw Blender Cycles prompt.`;

    const userPrompt = "Analyze this image using Blender Cycles Principled BSDF v2 shader specifications and output the prompt with maximum fidelity.";
    return await callVisionPersona(instruction, userPrompt, base64Image, mimeType);
};

/** 9. RECRAFT V3 */
export const analyzeWithRecraftV3 = async (
    file: File, settings: PromptSettings, preProcessedData?: { base64: string; mimeType: string }
): Promise<string> => {
    const { base64Image, mimeType } = await getImageData(file, preProcessedData);
    const instruction = `You are the Lead Visual Designer for Recraft v3 (Vector, 3D Iconography, Graphic Illustration).
Analyze the image into clean, graphic, iconographic, and brand asset generation directives:
- Structure: Clean vector silhouettes, isometric framing, smooth gradients, crisp outlines.
- Target Platform: ${settings.targetPlatform} | Desired Style: ${settings.style}
${getReferenceFidelityDirective(settings.detailLevel)}
${getSpecialistModeDirective(settings, 'Recraft v3')}
Return ONLY the raw Recraft v3 prompt.`;

    const userPrompt = "Analyze this image using Recraft v3 graphic and vector design taxonomy and output the prompt with maximum fidelity.";
    return await callVisionPersona(instruction, userPrompt, base64Image, mimeType);
};

/** 10. MAGNIFIC NEURAL 16K */
export const analyzeWithMagnificNeural = async (
    file: File, settings: PromptSettings, preProcessedData?: { base64: string; mimeType: string }
): Promise<string> => {
    const { base64Image, mimeType } = await getImageData(file, preProcessedData);
    const instruction = `You are a Magnific AI Neural Remaster & 16K Hallucination Upscaling Specialist.
Formulate a prompt that captures microscopic tactile granularity:
- Textures: 16k ultra-definition pores, microscopic fabric weaves, micro-scratches, condensation glints, specular catchlights.
- Target Platform: ${settings.targetPlatform} | Desired Style: ${settings.style}
${getReferenceFidelityDirective(settings.detailLevel)}
${getSpecialistModeDirective(settings, 'Magnific AI')}
Return ONLY the raw Magnific prompt.`;

    const userPrompt = "Analyze this image using Magnific AI 16K ultra-granularity neural upscaler specifications and output the prompt with maximum fidelity.";
    return await callVisionPersona(instruction, userPrompt, base64Image, mimeType);
};
