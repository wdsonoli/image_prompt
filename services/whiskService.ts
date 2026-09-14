
import { GoogleGenAI } from "@google/genai";
import { PromptSettings } from "../types";

export const analyzeWithWhisk = async (
    file: File, 
    settings: PromptSettings,
    preProcessedData?: { base64: string, mimeType: string }
): Promise<string> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

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
            mimeType = file.type;
        }

        const isMockup = settings.mode === 'mockup';
        const is3dLogo = settings.is3dLogo;

        let modeText = "FULL FIDELITY: Recreate the colors, textures, and subject exactly.";
        if (is3dLogo) {
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


        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: {
                parts: [
                    {
                        inlineData: {
                            data: base64Data,
                            mimeType: mimeType
                        }
                    },
                    {
                        text: `You are the Whisk AI Artistic Analyst. Translate the core subject of this image into an artistic prompt, but apply the following creative choices.

                        ${modeText}
                        
                        CREATIVE CHOICES:
                        ${creativeDirectives}
                        
                        Analyze the subject for 100% structural fidelity, but re-imagine the scene with the new choices.
                        
                        Target Platform: ${settings.targetPlatform}
                        Desired Style: ${settings.style}
                        
                        Return ONLY the final prompt.`
                    }
                ]
            }
        });

        return response.text?.trim() || "Whisk analysis failed.";
    } catch (error) {
        console.error("Whisk Analysis Error:", error);
        throw error;
    }
};
