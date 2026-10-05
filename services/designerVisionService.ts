import { PromptSettings } from '../types';
import { callVisionPersona } from './visionPersonaHelper';

/**
 * Helper to extract base64 data and mimeType from File or preProcessedData
 */
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

/**
 * Builds the Reference Fidelity Directive according to Detail Level
 */
function getReferenceFidelityDirective(detailLevel: number | 'auto'): string {
    const level = detailLevel === 'auto' ? 5 : detailLevel;
    if (level >= 7) {
        return `CRITICAL MANDATE - MAXIMUM REFERENCE IMAGE FIDELITY (Detail Level ${level}/10):
- EXACT 1:1 COLOR EXTRACTION: Identify and state the exact dominant color hues, HEX/Pantone equivalents, gradients, specular highlight glints, and ambient color casts present in the reference image.
- EXACT SILHOUETTE & GEOMETRY: Describe the exact proportions, perspective, bevel radii, contours, and physical alignment of the reference subject.
- MICROSCOPIC TEXTURE MATCH: Transcribe authentic tactile micro-textures exactly as visible in the reference.
- LIGHTING & OPTICAL VECTORS: Replicate the precise lighting setup.
- ZERO UNWANTED HALLUCINATION: The generated prompt must recreate an image that is as close, faithful, and visually indistinguishable from this reference image as possible.`;
    } else {
        return `Detail Level: ${level}/10. Balance faithful reference reproduction with creative aesthetic flair.`;
    }
}

/**
 * 1. BEHANCE / DRIBBBLE TOP DESIGNER VISION
 */
export const analyzeWithBehanceDesigner = async (
    file: File,
    settings: PromptSettings,
    preProcessedData?: { base64: string; mimeType: string }
): Promise<string> => {
    const { base64Image, mimeType } = await getImageData(file, preProcessedData);

    const isExtractBg = settings.mode === 'extract_background';
    const isExtractElement = settings.mode === 'extract_element';
    const isRemoveBranding = settings.mode === 'remove_branding' || Boolean(settings.removeBranding);
    const fidelityDirective = getReferenceFidelityDirective(settings.detailLevel);

    const behanceSystemInstruction = `You are a World-Renowned Art Director and Senior Graphic Designer whose work is perpetually featured on the curated frontpages of Behance, Dribbble, and Adobe Design Awards.
Analyze this image and transform it into an elite visual generation prompt:
- Typography & layout composition, visual weight, negative space, golden ratio framing.
- Color grading: Harmonious color palettes, micro-contrast, specular highlights, authentic textures.
- Target Platform: ${settings.targetPlatform}
- Desired Style: ${settings.style}

${fidelityDirective}

${isExtractElement ? `
MODE: ISOLATED HERO ELEMENT & SUBJECT CUTOUT:
- Extract the hero subject cleanly on a neutral, minimalist design cyclorama.
- Disregard background environment and scenery.
- Emphasize crisp contour edges, material physics, and tactile surface gloss.
` : ''}

${isRemoveBranding ? `
MODE: REMOVE BRANDING & LABELS (PRESERVE 100% AUTHENTIC COLORS):
- Eliminate all commercial brand logos, printed paper labels, typography, and trademarks.
- Replace label areas with a pristine, seamless, unprinted surface.
- STRICT COLOR RETENTION: Keep the exact container hue and liquid color.
` : ''}

${isExtractBg ? `
MODE: EXTRACT BACKGROUND SCENIC ENVIRONMENT:
- Exclude all foreground subjects/characters/products.
- Extract the architectural interior/exterior, ambient background props, surface textures, and scenic atmosphere.
` : ''}

Format the output strictly as a production-ready text-to-image prompt optimized for ${settings.targetPlatform}.
RETURN ONLY THE RAW PROMPT TEXT WITHOUT PREAMBLE OR QUOTATION MARKS.`;

    const userPrompt = "Analyze this image from the perspective of an elite Behance/Dribbble Design Director and generate the definitive generation prompt with maximum fidelity to reference.";
    return await callVisionPersona(behanceSystemInstruction, userPrompt, base64Image, mimeType);
};

/**
 * 2. ARTSTATION MASTER / 3D ART DIRECTOR VISION
 */
export const analyzeWithArtStationMaster = async (
    file: File,
    settings: PromptSettings,
    preProcessedData?: { base64: string; mimeType: string }
): Promise<string> => {
    const { base64Image, mimeType } = await getImageData(file, preProcessedData);

    const isExtractBg = settings.mode === 'extract_background';
    const isExtractElement = settings.mode === 'extract_element';
    const isRemoveBranding = settings.mode === 'remove_branding' || Boolean(settings.removeBranding);
    const fidelityDirective = getReferenceFidelityDirective(settings.detailLevel);

    const artStationSystemInstruction = `You are a Principal 3D Concept Artist and VFX Art Director trending #1 on ArtStation and CGSociety.
Deconstruct the image into technical 3D CGI and concept art specifications:
- Physically-Based Rendering (PBR), specular roughness maps, subsurface scattering, ambient occlusion, ray-traced reflections, and volumetric atmosphere.
- Optics: 8k resolution, Octane Render / Unreal Engine 5 aesthetic, anamorphic lens flares, dynamic chiaroscuro.
- Target Platform: ${settings.targetPlatform}
- Desired Style: ${settings.style}

${fidelityDirective}

${isExtractElement ? `
MODE: EXTRACT 3D ASSET / ISOLATED HERO ELEMENT:
- Focus solely on isolating the hero subject/prop/model in 3D studio lighting.
- Discard all background scene geometry.
- Preserve 100% of authentic material shaders, edge contours, specular highlights, and structural dimensions.
` : ''}

${isRemoveBranding ? `
MODE: UNBRANDED 3D PRODUCT SHADER:
- Remove all 2D graphic logos, brand names, and printed labels.
- Re-texture the container with seamless procedural material in the EXACT original container color and liquid transparency.
` : ''}

${isExtractBg ? `
MODE: 3D SCENIC MATTE ENVIRONMENT EXTRACTION:
- Remove foreground actors/products.
- Render the environmental stage, architectural geometry, volumetric fog, and ambient scene props as an empty set plate.
` : ''}

Format the prompt with technical rendering terminology optimized for ${settings.targetPlatform}.
RETURN ONLY THE RAW PROMPT TEXT WITHOUT PREAMBLE OR QUOTATION MARKS.`;

    const userPrompt = "Analyze this image as a Master 3D Concept Art Director (ArtStation style) and output the generation prompt with maximum fidelity to reference.";
    return await callVisionPersona(artStationSystemInstruction, userPrompt, base64Image, mimeType);
};

/**
 * 3. PRODUCT & PACKAGING CMF DESIGNER VISION
 */
export const analyzeWithProductDesigner = async (
    file: File,
    settings: PromptSettings,
    preProcessedData?: { base64: string; mimeType: string }
): Promise<string> => {
    const { base64Image, mimeType } = await getImageData(file, preProcessedData);

    const isExtractBg = settings.mode === 'extract_background';
    const isExtractElement = settings.mode === 'extract_element';
    const isRemoveBranding = settings.mode === 'remove_branding' || Boolean(settings.removeBranding);
    const fidelityDirective = getReferenceFidelityDirective(settings.detailLevel);

    const productSystemInstruction = `You are a Lead Industrial Designer and Luxury Packaging CMF (Color, Material, Finish) Specialist.
Analyze the reference image with uncompromising industrial design precision:
- Material authenticity: Anodized aluminum, optical-grade borosilicate glass, matte soft-touch polycarbonate, brushed brass, debossed textures, condensation beads, precision seam tolerances.
- Commercial lighting: Precision softbox highlights along contour ridges, contact shadows, flawless catalog background cyclorama.
- Target Platform: ${settings.targetPlatform}
- Desired Style: ${settings.style}

${fidelityDirective}

${isExtractElement ? `
MODE: EXTRACT INDUSTRIAL PRODUCT & PACKAGING ELEMENT:
- Isolate the product/subject completely, eliminating all surrounding background clutter.
- Highlight tactile CMF textures, parting lines, bevels, and crisp edge reflections.
- Present on a clean, professional commercial studio cyclorama.
` : ''}

${isRemoveBranding ? `
MODE: DE-BRANDED PACKAGING / UNBRANDED PRODUCT PROTOTYPE:
- Strip away all commercial labels, logos, trademarks, and typography.
- Provide a pristine, blank, smooth packaging finish.
- PRESERVE 100% EXACT CONTAINER COLOR PALETTE, cap color, and internal liquid refraction.
` : ''}

${isExtractBg ? `
MODE: EXTRACT COMMERCIAL BACKDROP & ENVIRONMENT:
- Exclude the central product.
- Recreate the commercial advertising studio set, ambient styling props, surfaces, and lighting stage.
` : ''}

Format the prompt specifically for ${settings.targetPlatform}.
RETURN ONLY THE RAW PROMPT TEXT WITHOUT PREAMBLE OR QUOTATION MARKS.`;

    const userPrompt = "Analyze this image as a Lead Industrial & Packaging CMF Designer and output the generation prompt with maximum fidelity to reference.";
    return await callVisionPersona(productSystemInstruction, userPrompt, base64Image, mimeType);
};
