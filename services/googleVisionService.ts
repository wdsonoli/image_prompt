
import { GoogleGenAI } from "@google/genai";
import { PromptSettings } from "../types";

export const analyzeWithGoogleVision = async (
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

        const lighting = (settings.lighting !== 'none' && settings.lighting !== 'auto') 
            ? `Physics Override: Use "${settings.lighting.replace(/_/g, ' ')}" light source properties.` 
            : 'Map original light vectors.';

        const angle = (settings.cameraAngle !== 'none') 
            ? `Spatial Override: Rotate perspective to "${settings.cameraAngle.replace(/_/g, ' ')}".` 
            : 'Map original camera coordinates.';

        const response = await ai.models.generateContent({
            // Mantido Flash pela velocidade e precisão em detecção técnica de labels e formas
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
                        text: `TECHNICAL ANALYSIS PARAMETERS:
                        - Subject Mode: ${is3dLogo ? '3D Seal Reconstruction' : (isMockup ? 'Clay Mockup' : 'Literal mapping')}
                        - Directives: ${lighting}, ${angle}
                        - Detail Resolution: ${settings.detailLevel}/10
                        
                        Map the subject geometry and combine with the specified physics overrides.`
                    }
                ]
            },
            config: {
                systemInstruction: `You are a High-Precision Technical Recognition and Vision Engine. 
                Your task is to perform a literal and structural mapping of the provided image. 
                Identify the subject with hyper-accuracy, cataloging its textures, materials, and geometry.
                
                OPERATIONAL PROTOCOL:
                1. MOCKUP MODE: Treat the surface as untextured white polymer/clay, mapping only vertices and topology.
                2. 3D SEAL MODE: Identify logos and typography for perfect 1:1 vector/3D reconstruction.
                3. INTEGRATION: Apply the user's overrides for lighting and camera position to the mapped subject.
                4. NO CHATTER: Do not explain your process.
                5. OUTPUT: Return only the technical prompt optimized for high-end image generators like Flux or Midjourney.`,
                temperature: 0.2 // Baixa temperatura para maior consistência técnica
            }
        });

        return response.text?.trim() || "Google Vision recognition failed.";
    } catch (error) {
        console.error("Google Vision Error:", error);
        throw error;
    }
};
