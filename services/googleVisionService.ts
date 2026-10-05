import { PromptSettings } from "../types";
import { callVisionPersona } from "./visionPersonaHelper";

export const analyzeWithGoogleVision = async (
    file: File, 
    settings: PromptSettings,
    preProcessedData?: { base64: string, mimeType: string }
): Promise<string> => {
    try {
        let base64Data: string;
        let mimeType: string;

        if (preProcessedData) {
            base64Data = preProcessedData.base64;
            mimeType = preProcessedData.mimeType;
        } else {
            base64Data = await new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => resolve((reader.result as string).split(',')[1]);
                reader.onerror = reject;
                reader.readAsDataURL(file);
            });
            mimeType = file.type || 'image/png';
        }

        const isMockup = settings.mode === 'mockup';
        const is3dLogo = settings.is3dLogo;
        const isExtractBg = settings.mode === 'extract_background';
        const isExtractElement = settings.mode === 'extract_element';

        const lighting = (settings.lighting !== 'none' && settings.lighting !== 'auto') 
            ? `Physics Override: Use "${settings.lighting.replace(/_/g, ' ')}" light source properties.` 
            : 'Map original light vectors.';

        const angle = (settings.cameraAngle !== 'none') 
            ? `Spatial Override: Rotate perspective to "${settings.cameraAngle.replace(/_/g, ' ')}".` 
            : 'Map original camera coordinates.';

        const modeDescription = isExtractElement
            ? 'Element & Subject Extraction (Isolate subject, disregard background)'
            : (isExtractBg 
                ? 'Background & Environment Isolation (Exclude foreground subject)' 
                : (is3dLogo ? '3D Seal Reconstruction' : (isMockup ? 'Clay Mockup' : 'Literal mapping')));

        const systemInstruction = `You are a High-Precision Technical Recognition and Vision Engine. 
Your task is to perform a literal and structural mapping of the provided image. 
${isExtractElement
    ? 'Extract and catalog the focal subject, foreground elements, props, physical textures, and silhouette. Omit background scenery to isolate the element cleanly on a neutral studio background.'
    : (isExtractBg 
        ? 'Catalog all background components, materials, scenery props, surfaces, and environmental vectors. Completely omit the foreground focal subject to create an empty scenic background plate.' 
        : 'Identify the subject with hyper-accuracy, cataloging its textures, materials, and geometry.')}

OPERATIONAL PROTOCOL:
1. If in ELEMENT EXTRACTION: Extract the subject and key visual components with razor-sharp contours on clean studio backdrop.
2. If in BACKGROUND EXTRACTION: Extract only background elements, surfaces, and ambient fixtures, excluding the foreground subject.
3. MOCKUP MODE: Treat the surface as untextured white polymer/clay, mapping only vertices and topology.
4. 3D SEAL MODE: Identify logos and typography for perfect 1:1 vector/3D reconstruction.
5. INTEGRATION: Apply the user's overrides for lighting and camera position.
6. NO CHATTER: Do not explain your process.
7. OUTPUT: Return only the technical prompt optimized for high-end image generators like Flux or Midjourney.`;

        const userPrompt = `TECHNICAL ANALYSIS PARAMETERS:
- Operational Mode: ${modeDescription}
- Directives: ${lighting}, ${angle}
- Detail Resolution: ${settings.detailLevel}/10

${isExtractElement
    ? 'Isolate the primary foreground subject and all constituent physical elements. Catalog materials, surfaces, contours, specular highlights, and color fidelity. Disregard background scenery.'
    : (isExtractBg 
        ? 'Detect and catalog all background architectural surfaces, secondary props, ambient textures, and environment lighting vectors. Exclude the foreground subject.' 
        : 'Map the subject geometry and combine with the specified physics overrides.')}`;

        return await callVisionPersona(systemInstruction, userPrompt, base64Data, mimeType);
    } catch (error) {
        console.error("Google Vision Error:", error);
        throw error;
    }
};
