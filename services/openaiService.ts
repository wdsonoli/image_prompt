
import { PromptSettings } from '../types';

export const generateOpenAIPrompt = async (
    file: File, 
    apiKey: string,
    settings: PromptSettings,
    preProcessedData?: { base64: string, mimeType: string }
): Promise<string> => {
    if (!apiKey) {
        throw new Error("OpenAI API Key is missing. Please add it in settings.");
    }

    try {
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
            mimeType = file.type;
        }
        
        const platformInstructions = getPlatformInstructions(settings.targetPlatform);
        
        const lightingInstruction = (settings.lighting !== 'none' && settings.lighting !== 'auto') 
            ? `Re-render the scene with new lighting: "${settings.lighting.replace(/_/g, ' ')}".` 
            : '';
        const angleInstruction = (settings.cameraAngle !== 'none') 
            ? `Change the camera angle to: "${settings.cameraAngle.replace(/_/g, ' ')}".` 
            : '';
        const positionInstruction = (settings.productPosition !== 'none') 
            ? `Reposition the main subject to: "${settings.productPosition.replace(/_/g, ' ')}".` 
            : '';
        const creativeDirectives = [lightingInstruction, angleInstruction, positionInstruction].filter(Boolean).join('\n');

        const response = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: "gpt-4o",
                messages: [
                    {
                        role: "user",
                        content: [
                            { 
                                type: "text", 
                                text: `You are an expert prompt engineer. Analyze the subject in the image, then generate a new text-to-image prompt to recreate that subject but with the following modifications:
                                ${creativeDirectives}
                                
                                Platform Requirement: ${settings.targetPlatform}
                                Detailed Instruction: ${platformInstructions}
                                Style: ${settings.style}
                                
                                Instructions:
                                1. Identify the core subject, but apply the new creative directives.
                                2. Strictly follow the platform format.
                                3. Return ONLY the raw prompt text.` 
                            },
                            {
                                type: "image_url",
                                image_url: {
                                    url: `data:${mimeType};base64,${base64Image}`
                                }
                            }
                        ]
                    }
                ]
            })
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error?.message || "OpenAI Error");
        return data.choices[0].message.content.trim();
    } catch (error) {
        console.error("OpenAI Error:", error);
        throw error;
    }
};

function getPlatformInstructions(platform: string): string {
    switch (platform) {
        case 'chatgpt':
            return "Create a highly imaginative, poetic natural language description. Focus on sensory details and storytelling. Avoid technical tags.";
        case 'freepik':
            return "Optimize for professional stock photography. Include keywords like 'high quality', 'commercial photo', '8k', 'clean background', 'isolated'. Mix keywords with simple sentences.";
        case 'midjourney':
            return "Comma-separated tags and phrases. Use technical params like --ar 16:9 at the end.";
        case 'dalle':
            return "A rich, descriptive paragraph focusing on light and texture.";
        default:
            return "Standard descriptive prompt.";
    }
}
