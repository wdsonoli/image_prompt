import { PromptSettings } from '../types';
import { callVisionPersona } from './visionPersonaHelper';

/**
 * DeepSeek R1 / VL Vision Engine
 * Supports:
 * 1. 100% Free Native DeepSeek Vision Engine (powered by Gemini Flash with DeepSeek's signature deep reasoning,
 *    chain-of-thought spatial coordinates, and high-density token formatting).
 * 2. Optional direct DeepSeek API call if key is provided.
 * 3. Reference Image Fidelity Protocol: When Detail Level is high (>=7), meticulously aligns prompt to reference image.
 */
export const generateDeepseekPrompt = async (
    file: File, 
    apiKey?: string,
    settings?: PromptSettings,
    preProcessedData?: { base64: string, mimeType: string }
): Promise<string> => {
    const currentSettings = settings || {
        basePrompt: '',
        negativePrompt: '',
        style: 'photorealistic',
        detailLevel: 5,
        lighting: 'none',
        composition: 'auto',
        cameraAngle: 'none',
        productPosition: 'none',
        aspectRatio: '1:1',
        removeBackground: false,
        targetPlatform: 'deepseek' as const,
        extraParams: '',
        mode: 'general' as const,
        shadowOpacity: 100,
        material: 'none',
        environment: 'studio',
        keepColors: false,
        is3dLogo: false
    };

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
    
    const lightingInstruction = (currentSettings.lighting !== 'none' && currentSettings.lighting !== 'auto') 
        ? `Desired lighting vector is "${currentSettings.lighting.replace(/_/g, ' ')}".` 
        : 'Preserve authentic illumination physics.';
    const angleInstruction = (currentSettings.cameraAngle !== 'none') 
        ? `Desired camera perspective is "${currentSettings.cameraAngle.replace(/_/g, ' ')}".` 
        : 'Preserve reference camera perspective.';
    const positionInstruction = (currentSettings.productPosition !== 'none') 
        ? `Desired subject position is "${currentSettings.productPosition.replace(/_/g, ' ')}".` 
        : 'Preserve reference subject coordinates.';
    const creativeDirectives = [lightingInstruction, angleInstruction, positionInstruction].filter(Boolean).join(' ');

    const detailVal = currentSettings.detailLevel === 'auto' ? 5 : currentSettings.detailLevel;
    const fidelityDirective = detailVal >= 7 ? `
[DEEP REASONING: MAXIMUM REFERENCE FIDELITY - LEVEL ${detailVal}/10]
- Perform rigorous spatial and chromatic deconstruction of the reference image.
- Transcribe EXACT color palette (hues, saturation, lighting luminance).
- Replicate exact silhouette boundaries, micro-textures, specular highlights, and camera focal depth.
- Recreate the scene with 1:1 fidelity matching the reference image.
` : `Detail Level: ${detailVal}/10. Balance precision with generative aesthetics.`;

    const isExtractBg = currentSettings.mode === 'extract_background';
    const isExtractElement = currentSettings.mode === 'extract_element';
    const isRemoveBranding = currentSettings.mode === 'remove_branding' || !!currentSettings.removeBranding;

    let deepseekSystemInstruction = `You are DeepSeek R1 Vision, an AI specialized in deep visual reasoning, spatial chain-of-thought analysis, and high-density prompt generation.
Analyze the reference image and generate a text-to-image prompt:
Directives: ${creativeDirectives}.
Target Platform: ${currentSettings.targetPlatform}.
Style: ${currentSettings.style}.
${fidelityDirective}

Output ONLY the raw generated prompt text without preamble or commentary.`;

    if (isExtractElement) {
        deepseekSystemInstruction = `You are DeepSeek R1 Vision, specialized in Visual Element Decomposition and Subject Isolation:
Analyze the reference image and isolate the primary foreground subject/element:
1. DETACH FROM BACKGROUND: Completely remove and disregard background scenery, placing the subject on a clean studio neutral backdrop.
2. MICROSCOPIC FIDELITY: Preserve 100% authentic colors, sharp silhouette contours, material textures, and specular reflections.
Target: ${currentSettings.targetPlatform}. Style: ${currentSettings.style}. Directives: ${creativeDirectives}.
${fidelityDirective}
Output ONLY the raw generated prompt.`;
    } else if (isRemoveBranding) {
        deepseekSystemInstruction = `You are DeepSeek R1 Vision, specialized in Commercial Packaging Analysis:
Analyze the product/beverage container in the reference image. Generate a prompt to recreate it UNBRANDED:
1. Strip all brand names, paper/printed labels, logos, trademarks, and typography.
2. PRESERVE EXACT PRODUCT COLORS: Retain original container color, cap tint, and liquid color/transparency.
3. The label area becomes seamless, unprinted surface in the identical original color.
Target: ${currentSettings.targetPlatform}. Style: ${currentSettings.style}. Directives: ${creativeDirectives}.
${fidelityDirective}
Output ONLY the raw unbranded prompt.`;
    } else if (isExtractBg) {
        deepseekSystemInstruction = `You are DeepSeek R1 Vision: Deconstruct this reference image to EXTRACT ONLY THE BACKGROUND ENVIRONMENT and all its constituent elements (scenery, architecture, flooring, props, lighting). EXCLUDE AND REMOVE the foreground subject entirely.
Target: ${currentSettings.targetPlatform}. Style: ${currentSettings.style}. Directives: ${creativeDirectives}.
${fidelityDirective}
Output ONLY the raw generated prompt.`;
    }

    // 1. If user provided a DeepSeek API key, try direct call
    if (apiKey && apiKey.trim().length > 5) {
        try {
            const response = await fetch("https://api.deepseek.com/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${apiKey.trim()}`
                },
                body: JSON.stringify({
                    model: "deepseek-chat", // Free/low-cost chat model
                    messages: [
                        {
                            role: "user",
                            content: [
                                { 
                                    type: "text", 
                                    text: deepseekSystemInstruction
                                },
                                {
                                    type: "image_url",
                                    image_url: {
                                        url: `data:${mimeType};base64,${base64Image}`
                                    }
                                }
                            ]
                        }
                    ],
                    max_tokens: 600
                })
            });

            if (response.ok) {
                const data = await response.json();
                if (data.choices?.[0]?.message?.content) {
                    return data.choices[0].message.content.trim();
                }
            }
        } catch (e) {
            console.warn("Direct DeepSeek API call failed, falling back to Native DeepSeek R1 Vision Engine", e);
        }
    }

    // 2. 100% Free Native DeepSeek Vision Engine (powered by server-side Gemini)
    return await callVisionPersona(
        deepseekSystemInstruction,
        "Analyze this image using DeepSeek R1 visual chain-of-thought reasoning and generate the master prompt with maximum fidelity to reference.",
        base64Image,
        mimeType
    );
};
