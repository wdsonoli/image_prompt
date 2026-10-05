import { PromptSettings } from '../types';
import { callVisionPersona } from './visionPersonaHelper';

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

    const isExtractPerson = settings.mode === 'extract_person';
    const isExtractBg = settings.mode === 'extract_background';
    const isExtractElement = settings.mode === 'extract_element';
    const isRemoveBranding = settings.mode === 'remove_branding' || Boolean(settings.removeBranding);

    const fluxInstructions = `You are the Flux.1 Realism Prompt Architect specializing in Black Forest Labs Flux diffusion models.
Flux thrives on continuous, descriptive photographic prose rather than spammy keywords.

PROMPT CRITERIA:
1. Describe the scene like a professional award-winning photographer shooting RAW 35mm film.
2. Emphasize physical realism: micro-textures, authentic lighting bounce, realistic materials, and surface physics.
3. Completely avoid AI clichés such as "hyperrealistic, 8k, masterpiece, octane render". Instead describe the ACTUAL optical properties: lens focal length, natural depth of field, color temperature, and soft shadow gradients.
4. ${isExtractPerson ? 'FAITHFUL HUMAN PERSON EXTRACTION & BIOMETRIC REPLICATION: Focus with extreme accuracy on the person in the reference image. Describe their exact facial features (eyes, nose, mouth, jawline, natural skin undertone, pores, fine lines), exact hair color and hairstyle, wardrobe cut and fabric textures, emotional expression, posture and natural portrait lighting.' : (isExtractElement ? 'ISOLATED ELEMENT EXTRACTION: Focus strictly on the primary foreground subject, physical product, or focal asset. Omit all background scenery, placing the subject isolated in a pristine commercial studio setup with neutral cyclorama, pin-sharp optical edge resolution, and authentic tactile material reflections.' : (isRemoveBranding ? 'UNBRANDED DE-BRANDED PRODUCT: Completely remove any brand logos, commercial stickers, typography, paper labels, or emblems from the bottle, can, or packaging container. The surface must be a clean, blank, unprinted finish while STRICTLY PRESERVING the exact authentic container colors (e.g. glass tint, aluminum paint) and liquid color.' : (isExtractBg ? 'If EXTRACT_BACKGROUND: isolate the background scenery plate, describing the environmental space, wall textures, ambient daylight, and empty interior/exterior architecture with no people or foreground objects.' : 'Maintain authentic subject fidelity.')))}
5. Lighting directive: ${settings.lighting !== 'none' ? settings.lighting.replace(/_/g, ' ') : 'natural ambient lighting'}
6. Camera angle: ${settings.cameraAngle !== 'none' ? settings.cameraAngle.replace(/_/g, ' ') : 'eye-level candid perspective'}
7. Return ONLY the final prompt text in English, ready to paste into Flux.1.`;

    const userPrompt = `${fluxInstructions}\n\nStyle: ${settings.style}\nDetail Level: ${settings.detailLevel}/10`;

    return await callVisionPersona(fluxInstructions, userPrompt, base64Image, mimeType);
};
