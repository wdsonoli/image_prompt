
import { GoogleGenAI } from "@google/genai";
import { PromptSettings } from "../types";

export const generateGeminiPrompt = async (
    file: File, 
    settings: PromptSettings,
    preProcessedData?: { base64: string, mimeType: string }
): Promise<string> => {
    // Inicialização da instância conforme as diretrizes
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    try {
        let base64Data: string;
        let mimeType: string;

        if (preProcessedData) {
            base64Data = preProcessedData.base64;
            mimeType = preProcessedData.mimeType;
        } else {
            base64Data = await fileToGenerativePart(file);
            mimeType = file.type;
        }

        const isMockup = settings.mode === 'mockup';
        const is3dLogo = settings.is3dLogo;
        
        // Definição da lógica de re-imaginação baseada nas seleções do usuário
        const lighting = (settings.lighting !== 'none' && settings.lighting !== 'auto') 
            ? `NEW LIGHTING: Apply "${settings.lighting.replace(/_/g, ' ')}" lighting style to the scene.` 
            : 'Analyze and preserve original lighting essence.';

        const angle = (settings.cameraAngle !== 'none') 
            ? `NEW CAMERA ANGLE: Capture the subject from a "${settings.cameraAngle.replace(/_/g, ' ')}" perspective.` 
            : 'Analyze and preserve original camera perspective.';

        const position = (settings.productPosition !== 'none') 
            ? `NEW COMPOSITION: Place the main subject in the "${settings.productPosition.replace(/_/g, ' ')}" of the frame.` 
            : 'Analyze and preserve original subject placement.';

        const response = await ai.models.generateContent({
            // Upgrade para o modelo Pro para raciocínio avançado em geração de prompts
            model: 'gemini-3-pro-preview',
            contents: {
                parts: [
                    {
                        inlineData: {
                            data: base64Data,
                            mimeType: mimeType
                        }
                    },
                    {
                        text: `USER CREATIVE DIRECTIVES:
                        - Target Platform: ${settings.targetPlatform}
                        - Visual Style: ${settings.style}
                        - Detail Level: ${settings.detailLevel}/10
                        - ${lighting}
                        - ${angle}
                        - ${position}
                        - Base Request: ${settings.basePrompt || 'Detailed reconstruction'}
                        
                        TASK: Extract the subject from the image and generate a professional prompt that follows the creative directives above.`
                    }
                ]
            },
            config: {
                // System Instruction garante que a IA não divague e foque no papel de Arquiteto de Prompts
                systemInstruction: `You are a World-Class Creative Director and Image-to-Prompt Architect. 
                Your goal is to analyze the core subject of the provided image with high fidelity, but completely re-imagine the scene's lighting, camera angle, and positioning based on the user's specific directives.
                
                RULES:
                1. If in 3D SEAL MODE: Focus on a 1:1 3D reconstruction of the object.
                2. If in MOCKUP MODE: Ignore colors and textures, focus on the geometry as a white clay model.
                3. ALWAYS optimize the formatting for the target platform (e.g., Midjourney tags, DALL-E descriptive text).
                4. DO NOT include any conversational text, explanations, or "Here is your prompt". 
                5. RETURN ONLY THE RAW PROMPT TEXT.`,
                temperature: 0.7,
                thinkingConfig: { thinkingBudget: 0 } // Desabilitado para resposta direta ou pode ser aumentado se necessário
            }
        });

        if (!response.text) throw new Error("Gemini returned an empty response.");
        return response.text.trim();
    } catch (error: any) {
        console.error("Gemini API Error:", error);
        throw error;
    }
};

async function fileToGenerativePart(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            const result = reader.result;
            if (typeof result !== 'string') return reject(new Error("Failed to read file."));
            const base64String = result.split(',')[1];
            resolve(base64String);
        };
        reader.readAsDataURL(file);
    });
}
