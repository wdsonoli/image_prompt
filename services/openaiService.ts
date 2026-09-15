
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

        const isExtractBg = settings.mode === 'extract_background';
        const isRemoveBranding = settings.mode === 'remove_branding' || !!settings.removeBranding;
        let systemPromptText = `You are an expert prompt engineer. Analyze the subject in the image, then generate a new text-to-image prompt to recreate that subject but with the following modifications:
${creativeDirectives}

Platform Requirement: ${settings.targetPlatform}
Detailed Instruction: ${platformInstructions}
Style: ${settings.style}

Instructions:
1. Identify the core subject, but apply the new creative directives.
2. Strictly follow the platform format.
3. Return ONLY the raw prompt text.`;

        if (isRemoveBranding) {
            systemPromptText = `You are an elite Commercial Product Photographer and Prompt Engineer.
Analyze the beverage/product in the image and generate a prompt to recreate it completely UNBRANDED:
1. REMOVE ALL BRANDING: No brand names, no paper/plastic labels, no logos, no typography, no trademarks.
2. PRESERVE 100% OF THE ORIGINAL PRODUCT COLORS: Retain the exact bottle glass color, aluminum can color, cap color, and internal liquid color and transparency.
3. Replace the label with a clean, smooth, unprinted container surface in the identical original color and material.
4. Keep original container geometry, reflections, condensation drops, and lighting.
Platform Requirement: ${settings.targetPlatform}
Detailed Instruction: ${platformInstructions}
Style: ${settings.style}
Directives: ${creativeDirectives}
Return ONLY the raw unbranded prompt text without preamble.`;
        } else if (isExtractBg) {
            systemPromptText = `You are an elite Scene Decomposition and Background Extraction Architect. Analyze the image, DETECT AND ISOLATE THE BACKGROUND ENVIRONMENT, and EXTRACT EVERY CONSTITUENT ELEMENT that composes the scene (architecture, walls, flooring, materials, background props, secondary ambient objects, lighting direction, and atmosphere).
CRITICAL RULE: The main foreground subject (person, product, central vehicle, or character) MUST BE COMPLETELY EXCLUDED OR REMOVED.
Reconstruct the entire background environment as a pristine, empty scenic plate containing all the background details, textures, and ambiance.
Platform Requirement: ${settings.targetPlatform}
Detailed Instruction: ${platformInstructions}
Style: ${settings.style}
Directives: ${creativeDirectives}
Return ONLY the raw prompt text without preamble.`;
        }

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
                                text: systemPromptText
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
