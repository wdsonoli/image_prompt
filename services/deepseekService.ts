
import { PromptSettings } from '../types';

export const generateDeepseekPrompt = async (
    file: File, 
    apiKey: string,
    settings: PromptSettings,
    preProcessedData?: { base64: string, mimeType: string }
): Promise<string> => {
    if (!apiKey) {
        throw new Error("Deepseek API Key is missing. Please add it in settings.");
    }

    try {
        let base64Image: string;
        if (preProcessedData) {
            base64Image = preProcessedData.base64;
        } else {
            base64Image = await new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => resolve((reader.result as string).split(',')[1]);
                reader.onerror = reject;
                reader.readAsDataURL(file);
            });
        }
        
        const lightingInstruction = (settings.lighting !== 'none' && settings.lighting !== 'auto') 
            ? `Desired lighting is "${settings.lighting.replace(/_/g, ' ')}".` 
            : '';
        const angleInstruction = (settings.cameraAngle !== 'none') 
            ? `Desired camera angle is "${settings.cameraAngle.replace(/_/g, ' ')}".` 
            : '';
        const positionInstruction = (settings.productPosition !== 'none') 
            ? `Desired subject position is "${settings.productPosition.replace(/_/g, ' ')}".` 
            : '';
        const creativeDirectives = [lightingInstruction, angleInstruction, positionInstruction].filter(Boolean).join(' ');

        const isExtractBg = settings.mode === 'extract_background';
        const isRemoveBranding = settings.mode === 'remove_branding' || !!settings.removeBranding;
        let promptInstruction = `Analyze the subject in the image. Generate a new prompt for this subject but apply these new directives: ${creativeDirectives}.
Target: ${settings.targetPlatform}
Style: ${settings.style}

Describe the original subject but with the new lighting, angle, and position.
Output ONLY the generated prompt.`;

        if (isRemoveBranding) {
            promptInstruction = `Commercial Product Photography Analysis:
Analyze the beverage/product container in the image. Generate a prompt to recreate this product completely UNBRANDED:
1. Strip all brand names, paper/printed labels, logos, trademarks, and typography.
2. PRESERVE THE EXACT SAME COLORS: keep the original container color (can paint, bottle glass tint), cap color, and internal liquid color.
3. The label area must become a seamless, unprinted surface in the identical original color.
4. Target: ${settings.targetPlatform}. Style: ${settings.style}. Directives: ${creativeDirectives}.
Output ONLY the generated unbranded prompt.`;
        } else if (isExtractBg) {
            promptInstruction = `Deconstruct this image to EXTRACT ONLY THE BACKGROUND ENVIRONMENT and all its constituent elements (scenery, walls, flooring, materials, background props, secondary ambient objects, lighting). EXCLUDE AND REMOVE the foreground subject entirely. Target: ${settings.targetPlatform}. Style: ${settings.style}. Directives: ${creativeDirectives}. Output ONLY the raw generated prompt.`;
        }

        const response = await fetch("https://api.deepseek.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: "deepseek-vl",
                messages: [
                    {
                        role: "user",
                        content: [
                            { 
                                type: "text", 
                                text: promptInstruction
                            },
                            {
                                type: "image_url",
                                image_url: {
                                    url: `data:image/jpeg;base64,${base64Image}`
                                }
                            }
                        ]
                    }
                ],
                max_tokens: 500
            })
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error?.message || "Deepseek API Error");
        return data.choices[0].message.content.trim();
    } catch (error) {
        console.error("Deepseek Error:", error);
        throw error;
    }
};
