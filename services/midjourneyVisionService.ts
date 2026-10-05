import { PromptSettings } from '../types';
import { callVisionPersona } from './visionPersonaHelper';

/**
 * Midjourney v6.1 "Describe" Vision Engine
 * Reverse-engineers the reference image specifically into Midjourney v6 prompt taxonomy,
 * featuring photographic equipment specifications, artistic genres, rendering tags,
 * and standard Midjourney CLI parameters (--ar, --v 6.1, --s 250, --style raw).
 */
export const generateMidjourneyDescribePrompt = async (
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

    const midjourneyInstructions = `You are the Midjourney v6.1 /describe Reverse Prompting Engine.
Analyze the visual composition, lighting physics, textures, camera optics, and aesthetic mood of the image.

FORMAT RULES:
1. Synthesize the image into a master Midjourney prompt composed of descriptive phrases separated by commas.
2. Include specific camera equipment if photographic (e.g., "shot on 35mm lens, Hasselblad H6D-100c, aperture f/2.8, ISO 200, soft focus").
3. Include specific lighting keywords (e.g., "volumetric rim lighting, diffused studio lighting, chiaroscuro, cinematic softbox highlights").
4. Include color grading and texture tags (e.g., "Kodachrome 64 color grading, subtle film grain, tactile 8k detail").
5. ${isExtractPerson ? 'CRITICAL MANDATE - CLONE EXACT PERSON: Deeply analyze the person in the reference image. Describe their exact facial features (eye shape, color, nose, jawline, lips, natural skin undertone and pores), exact hair color and styling, exact clothing garments and fabrics, emotional expression, posture and lighting on their face. Frame as a portrait in neutral studio lighting.' : (isExtractElement ? 'CRITICAL RULE - ISOLATE VISUAL ELEMENT: Isolate the main subject or product on a pure neutral studio cyclorama background, discarding background scenery, emphasizing crisp cutout silhouettes, tactile surface reflections, authentic materials, and commercial catalog sharpness.' : (isRemoveBranding ? 'CRITICAL RULE - UNBRANDED CLEAN PRODUCT: completely de-brand the container. Remove any brand name, printed paper label, logo, or typography. Describe a clean, unprinted, blank beverage bottle/can surface while STRICTLY PRESERVING the exact authentic container color (e.g. emerald green glass, ruby red aluminum), cap color, and liquid color.' : (isExtractBg ? 'If MODE is EXTRACT_BACKGROUND: completely omit any foreground characters, people, or focal products, isolating the scenery as an empty photographic plate.' : '')))}
6. Append Midjourney parameters at the very end:
   - Aspect ratio: --ar ${settings.aspectRatio !== 'auto' ? settings.aspectRatio : '16:9'}
   - Version: --v 6.1
   - Stylize: --s 250
   ${settings.style === 'photorealistic' ? '--style raw' : ''}
   ${isRemoveBranding ? '--no text, logo, brand, watermark, label' : ''}
   ${isExtractElement ? '--no background clutter, scenery, landscape' : ''}
   ${isExtractPerson ? '--no distorted face, different person, wrong anatomy' : ''}
7. Return ONLY the raw prompt. Do NOT wrap in quotes, do NOT write markdown headings or explanations.`;

    const userPrompt = `${midjourneyInstructions}\n\nStyle Directive: ${settings.style}\nLighting Directive: ${settings.lighting}\nComposition: ${settings.composition}`;
    return await callVisionPersona(midjourneyInstructions, userPrompt, base64Image, mimeType);
};
