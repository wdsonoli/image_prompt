
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
        const isExtractBg = settings.mode === 'extract_background';

        const lighting = (settings.lighting !== 'none' && settings.lighting !== 'auto') 
            ? `Physics Override: Use "${settings.lighting.replace(/_/g, ' ')}" light source properties.` 
            : 'Map original light vectors.';

        const angle = (settings.cameraAngle !== 'none') 
            ? `Spatial Override: Rotate perspective to "${settings.cameraAngle.replace(/_/g, ' ')}".` 
            : 'Map original camera coordinates.';

        const modeDescription = isExtractBg 
            ? 'Background & Environment Isolation (Exclude foreground subject)' 
            : (is3dLogo ? '3D Seal Reconstruction' : (isMockup ? 'Clay Mockup' : 'Literal mapping'));

        let response;
        const requestPayload = {
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
                        - Operational Mode: ${modeDescription}
                        - Directives: ${lighting}, ${angle}
                        - Detail Resolution: ${settings.detailLevel}/10
                        
                        ${isExtractBg 
                            ? 'Detect and catalog all background architectural surfaces, secondary props, ambient textures, and environment lighting vectors. Exclude the foreground subject.' 
                            : 'Map the subject geometry and combine with the specified physics overrides.'}`
                    }
                ]
            },
            config: {
                systemInstruction: `You are a High-Precision Technical Recognition and Vision Engine. 
                Your task is to perform a literal and structural mapping of the provided image. 
                ${isExtractBg 
                    ? 'Catalog all background components, materials, scenery props, surfaces, and environmental vectors. Completely omit the foreground focal subject to create an empty scenic background plate.' 
                    : 'Identify the subject with hyper-accuracy, cataloging its textures, materials, and geometry.'}
                
                OPERATIONAL PROTOCOL:
                1. If in BACKGROUND EXTRACTION: Extract only background elements, surfaces, and ambient fixtures, excluding the foreground subject.
                2. MOCKUP MODE: Treat the surface as untextured white polymer/clay, mapping only vertices and topology.
                3. 3D SEAL MODE: Identify logos and typography for perfect 1:1 vector/3D reconstruction.
                4. INTEGRATION: Apply the user's overrides for lighting and camera position.
                5. NO CHATTER: Do not explain your process.
                6. OUTPUT: Return only the technical prompt optimized for high-end image generators like Flux or Midjourney.`,
                temperature: 0.2 // Baixa temperatura para maior consistência técnica
            }
        };

        try {
            response = await ai.models.generateContent({
                model: 'gemini-3.8-flash',
                ...requestPayload
            });
        } catch (flashErr) {
            console.warn("Attempt with gemini-3.8-flash failed, falling back to gemini-3.5-flash:", flashErr);
            response = await ai.models.generateContent({
                model: 'gemini-3.5-flash',
                ...requestPayload
            });
        }

        return response.text?.trim() || "Google Vision recognition failed.";
    } catch (error) {
        console.error("Google Vision Error:", error);
        throw error;
    }
};
