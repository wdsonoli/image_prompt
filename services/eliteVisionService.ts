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
        return `[CRITICAL MANDATE - MAXIMUM REFERENCE IMAGE FIDELITY (Level ${level}/10)]:
- EXACT CHROMATIC CODES: Replicate the precise color tones, hue shifts, specular glints, and ambient color bounce from the reference image.
- EXACT SILHOUETTE & CONTOURS: Maintain identical spatial geometry, bevels, lines, and proportion ratios.
- MICRO-TEXTURE REPLICATION: Transcribe authentic physical textures.
- EXACT LIGHTING VECTORS: Map the precise light direction, key-to-fill ratios, shadows, and focal depth.
- The prompt must reproduce an image as close, faithful, and visually indistinguishable from this reference image as possible.`;
    }
    return `Detail Level: ${level}/10. Balance authentic reference capture with aesthetic director flair.`;
}

/**
 * 1. HOLLYWOOD CINEMATOGRAPHER (ARRI / IMAX / 70mm ANAMORPHIC)
 */
export const analyzeWithCinemaDirector = async (
    file: File,
    settings: PromptSettings,
    preProcessedData?: { base64: string; mimeType: string }
): Promise<string> => {
    const { base64Image, mimeType } = await getImageData(file, preProcessedData);

    const isExtractBg = settings.mode === 'extract_background';
    const isExtractElement = settings.mode === 'extract_element';
    const isRemoveBranding = settings.mode === 'remove_branding' || Boolean(settings.removeBranding);
    const fidelityDirective = getReferenceFidelityDirective(settings.detailLevel);

    const lightingInstruction = (settings.lighting !== 'none' && settings.lighting !== 'auto') 
        ? `Cinematic light direction: "${settings.lighting.replace(/_/g, ' ')}".` 
        : 'Preserve authentic cinematic lighting physics, volumetric haze, and key-to-fill contrast.';
    const angleInstruction = (settings.cameraAngle !== 'none') 
        ? `Cinematic angle: "${settings.cameraAngle.replace(/_/g, ' ')}".` 
        : 'Preserve camera angle.';

    const cinemaSystemInstruction = `You are a Legendary Hollywood Director of Photography and Master Cinematographer.
Analyze the reference image and translate it into a master cinematic prompt:
- Optics: Shot on ARRI Alexa LF, Panavision Primo 70mm Anamorphic lenses, cinematic shallow depth of field, anamorphic horizontal streaks, volumetric atmospheric haze.
- Composition: Dynamic widescreen framing, cinematic blocking, cinematic color grade.
- Target Platform: ${settings.targetPlatform}
- Desired Style: ${settings.style}

${fidelityDirective}

${lightingInstruction}
${angleInstruction}

${isExtractElement ? `
MODE: EXTRACT CINEMATIC HERO PROP / ELEMENT:
- Focus solely on isolating the focal subject/prop cleanly in cinematic studio lighting.
- Discard background scenery.
- Preserve 100% of authentic textures, surface reflections, and sharp contours.
` : ''}

${isRemoveBranding ? `
MODE: UNBRANDED CINEMATIC PROP:
- Completely remove any commercial logos, brand names, or printed labels from the product container.
- Maintain a clean, blank surface while preserving 100% of the authentic product colors and container geometry.
` : ''}

${isExtractBg ? `
MODE: EXTRACT CINEMATIC STAGE & ENVIRONMENT:
- Exclude all foreground characters and subjects.
- Recreate the atmospheric background environment, set architecture, props, and ambient lighting as an empty scenic plate.
` : ''}

Format output as an authoritative prompt for ${settings.targetPlatform}.
RETURN ONLY THE RAW PROMPT TEXT WITHOUT PREAMBLE OR QUOTATION MARKS.`;

    const userPrompt = "Analyze this image as a Master Hollywood Cinematographer and output the production prompt with maximum reference fidelity.";
    return await callVisionPersona(cinemaSystemInstruction, userPrompt, base64Image, mimeType);
};

/**
 * 2. VOGUE & FASHION EDITORIAL (HAUTE COUTURE & LUXURY AESTHETIC)
 */
export const analyzeWithVogueEditorial = async (
    file: File,
    settings: PromptSettings,
    preProcessedData?: { base64: string; mimeType: string }
): Promise<string> => {
    const { base64Image, mimeType } = await getImageData(file, preProcessedData);

    const isExtractBg = settings.mode === 'extract_background';
    const isExtractElement = settings.mode === 'extract_element';
    const isRemoveBranding = settings.mode === 'remove_branding' || Boolean(settings.removeBranding);
    const fidelityDirective = getReferenceFidelityDirective(settings.detailLevel);

    const vogueSystemInstruction = `You are a World-Renowned Fashion Editor-in-Chief and Luxury Creative Director for Vogue, Harper's Bazaar, and Vanity Fair.
Analyze the reference image with haute couture elegance and high-end commercial sophistication:
- Aesthetic: Editorial magazine cover aesthetic, luxury fashion lighting (Profoto softbox, butterfly lighting, rim highlights), high-fashion color palette, sophisticated mood, premium tactile textures (silk, velvet, leather, polished lacquer, fine jewelry glints).
- Target Platform: ${settings.targetPlatform}
- Desired Style: ${settings.style}

${fidelityDirective}

${isExtractElement ? `
MODE: EXTRACT FASHION & LUXURY HERO ASSET:
- Isolate the central fashion subject, luxury accessory, or product.
- Eliminate all background clutter, framing on a minimalist high-fashion studio cyclorama.
- Retain 100% of authentic garment/object textures, drape, specular reflections, and chromatic purity.
` : ''}

${isRemoveBranding ? `
MODE: UNBRANDED LUXURY BESPOKE PRODUCT:
- Remove all commercial logos, brand emblems, labels, and text.
- Re-render as an exclusive, unbranded luxury bespoke piece while strictly preserving the EXACT original color palette and container geometry.
` : ''}

${isExtractBg ? `
MODE: LUXURY EDITORIAL RUNWAY / STUDIO SET EXTRACTION:
- Omit the central model or foreground product.
- Reconstruct the editorial architectural backdrop, haute couture runway set, luxury interior, and ambient lighting.
` : ''}

Format output as an evocative prompt for ${settings.targetPlatform}.
RETURN ONLY THE RAW PROMPT TEXT WITHOUT PREAMBLE OR QUOTATION MARKS.`;

    const userPrompt = "Analyze this image from the perspective of a Vogue Luxury Fashion Director and output the prompt with maximum fidelity to reference.";
    return await callVisionPersona(vogueSystemInstruction, userPrompt, base64Image, mimeType);
};

/**
 * 3. NATIONAL GEOGRAPHIC MASTER (HASSELBLAD 100MP RAW OPTICS)
 */
export const analyzeWithNatGeoMaster = async (
    file: File,
    settings: PromptSettings,
    preProcessedData?: { base64: string; mimeType: string }
): Promise<string> => {
    const { base64Image, mimeType } = await getImageData(file, preProcessedData);

    const isExtractBg = settings.mode === 'extract_background';
    const isExtractElement = settings.mode === 'extract_element';
    const isRemoveBranding = settings.mode === 'remove_branding' || Boolean(settings.removeBranding);
    const fidelityDirective = getReferenceFidelityDirective(settings.detailLevel);

    const natGeoSystemInstruction = `You are a Legendary National Geographic Master Photographer and Optical Fellow.
Analyze the reference image with uncompromising organic realism and photographic veracity:
- Photographic DNA: Shot on Hasselblad H6D-100c medium format, Zeiss macro prime lens, 100 megapixels, RAW dynamic range, pure authentic optical physics, zero synthetic oversaturation, natural light falloff, micro-textures of biological or physical surfaces.
- Target Platform: ${settings.targetPlatform}
- Desired Style: ${settings.style}

${fidelityDirective}

${isExtractElement ? `
MODE: EXTRACT SPECIMEN / HERO ELEMENT WITH RAW OPTICAL PRECISION:
- Isolate the focal subject with razor-sharp macro edge definition.
- Discard background scenery, presenting on a clean museum-grade neutral field.
- Preserve 100% authentic color temperatures, organic textures, micro-reflections, and surface topology.
` : ''}

${isRemoveBranding ? `
MODE: RAW NATURAL CONTAINER / PRODUCT ISOLATION:
- Strip away all commercial branding, stickers, and commercial labels.
- Preserve 100% of authentic glass/aluminum colors, liquid clarity, and surface condensation beads.
` : ''}

${isExtractBg ? `
MODE: NATURAL GEOGRAPHIC HABITAT / LANDSCAPE ENVIRONMENT EXTRACTION:
- Completely exclude the foreground subject.
- Recreate the authentic environmental plate, geography, natural lighting, and atmospheric depth.
` : ''}

Format output strictly as a prompt optimized for ${settings.targetPlatform}.
RETURN ONLY THE RAW PROMPT TEXT WITHOUT PREAMBLE OR QUOTATION MARKS.`;

    const userPrompt = "Analyze this image as a National Geographic Master Photographer and output the RAW generation prompt with maximum fidelity to reference.";
    return await callVisionPersona(natGeoSystemInstruction, userPrompt, base64Image, mimeType);
};

/**
 * 4. AWWWARDS & BENTO UI/UX (DIGITAL PRODUCT & SAAS DESIGN MASTER)
 */
export const analyzeWithAwwwardsDigital = async (
    file: File,
    settings: PromptSettings,
    preProcessedData?: { base64: string; mimeType: string }
): Promise<string> => {
    const { base64Image, mimeType } = await getImageData(file, preProcessedData);

    const isExtractBg = settings.mode === 'extract_background';
    const isExtractElement = settings.mode === 'extract_element';
    const isRemoveBranding = settings.mode === 'remove_branding' || Boolean(settings.removeBranding);
    const fidelityDirective = getReferenceFidelityDirective(settings.detailLevel);

    const awwwardsSystemInstruction = `You are an Awwwards 'Site of the Year' Creative Director and Lead UI/UX Digital Product Designer (Stripe, Linear, Apple Developer aesthetic).
Analyze the reference image through modern high-tech digital design principles:
- Visual composition: Bento grid aesthetics, frosted glassmorphism, subtle chromatic glow accents, precise layout alignment, modern dark mode luxury, clean vector lines, isometric 3D floating elements.
- Target Platform: ${settings.targetPlatform}
- Desired Style: ${settings.style}

${fidelityDirective}

${isExtractElement ? `
MODE: EXTRACT DIGITAL PRODUCT ASSET / 3D HERO ICON:
- Isolate the central asset/element as a standalone 3D digital product component.
- Discard background scenery.
- Preserve 100% of authentic color palette, metallic/matte shaders, and clean silhouette contours.
` : ''}

${isRemoveBranding ? `
MODE: UNBRANDED MODERN SAAS / PRODUCT MOCKUP:
- Eliminate commercial labels, logos, and trademarks.
- Replace with a sleek, minimalist, unbranded surface in the EXACT original product color and material.
` : ''}

${isExtractBg ? `
MODE: EXTRACT MODERN DIGITAL STAGE / UI BACKDROP:
- Remove foreground focal elements.
- Render the modern digital backdrop, ambient gradient glow, bento grid background, and clean geometric lighting.
` : ''}

Format output as an elite prompt for ${settings.targetPlatform}.
RETURN ONLY THE RAW PROMPT TEXT WITHOUT PREAMBLE OR QUOTATION MARKS.`;

    const userPrompt = "Analyze this image as an Awwwards Digital Product Design Lead and output the prompt with maximum fidelity to reference.";
    return await callVisionPersona(awwwardsSystemInstruction, userPrompt, base64Image, mimeType);
};
