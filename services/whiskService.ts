import { PromptSettings } from "../types";
import { callVisionPersona } from "./visionPersonaHelper";

export const analyzeWithWhisk = async (
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
        const isRemoveBranding = settings.mode === 'remove_branding' || Boolean(settings.removeBranding);

        let modeText = "FULL FIDELITY: Recreate the colors, textures, and subject exactly.";
        if (isExtractElement) {
            modeText = "ELEMENT EXTRACTION: Isolate and extract the primary subject and key foreground components cleanly. Disregard background scenery entirely. Focus on authentic textures, materials, reflections, and sharp silhouette contours isolated in studio lighting.";
        } else if (isRemoveBranding) {
            modeText = "UNBRANDED BEVERAGE / PRODUCT: Strip all brand logos, labels, commercial typography, and trademarks. Recreate the container with a blank, seamless unprinted surface while strictly keeping 100% of the authentic product colors (can/bottle color, cap color, liquid color, and reflections).";
        } else if (isExtractBg) {
            modeText = "BACKGROUND EXTRACTION: Exclude and remove the foreground subject completely. Isolate and describe all constituent elements of the background (scenery, architecture, materials, props, atmosphere, and lighting) to render an empty background scenic plate.";
        } else if (is3dLogo) {
            modeText = "3D SEAL RECONSTRUCTION: Describe the subject as a high-end 3D metallic or glass asset. REPLICATE ALL DETAILS FROM THE ORIGINAL IMAGE IDENTICALLY. Focus on 3D depth and premium materials.";
        } else if (isMockup) {
            modeText = "MOCKUP FOCUS: Describe the subject's form as a 'clean white artistic mockup'. Preserve the silhouette and proportions exactly.";
        }

        const lightingInstruction = (settings.lighting !== 'none' && settings.lighting !== 'auto') 
            ? `Desired lighting effect: "${settings.lighting.replace(/_/g, ' ')}".` 
            : '';
        const angleInstruction = (settings.cameraAngle !== 'none') 
            ? `Desired artistic angle: "${settings.cameraAngle.replace(/_/g, ' ')}".` 
            : '';
        const positionInstruction = (settings.productPosition !== 'none') 
            ? `Desired composition focus: "${settings.productPosition.replace(/_/g, ' ')}".` 
            : '';
        const creativeDirectives = [lightingInstruction, angleInstruction, positionInstruction].filter(Boolean).join('\n');

        const systemInstruction = `You are the Whisk AI Artistic Analyst. Translate this image into an artistic prompt, applying the following directives. Return ONLY the final prompt.`;
        const userPrompt = `${modeText}\n\nCREATIVE CHOICES:\n${creativeDirectives}\n\n${isExtractBg 
            ? 'Render strictly the empty background plate with all scene elements intact, without any foreground subject.' 
            : 'Analyze the subject for 100% structural fidelity, but re-imagine the scene with the new choices.'}\n\nTarget Platform: ${settings.targetPlatform}\nDesired Style: ${settings.style}`;

        return await callVisionPersona(systemInstruction, userPrompt, base64Data, mimeType);
    } catch (error) {
        console.error("Whisk Analysis Error:", error);
        throw error;
    }
};
