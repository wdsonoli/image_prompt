import { PromptSettings } from '../types';
import { callVisionPersona } from './visionPersonaHelper';

/**
 * ChatGPT / OpenAI Vision Engine
 * Supports:
 * 1. 100% Free Native ChatGPT Vision Engine (powered by Gemini Flash with authentic ChatGPT narrative styling)
 * 2. Optional OpenAI API call using gpt-4o-mini (free tier / cost-effective) if user provides a key.
 * 3. Reference Image Fidelity Protocol: When Detail Level is high (>=7), meticulously transcribes exact colors,
 *    textures, lighting, and geometric proportions to recreate the reference image with extreme fidelity.
 */
export const generateOpenAIPrompt = async (
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
        targetPlatform: 'chatgpt' as const,
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
    
    const platformInstructions = getPlatformInstructions(currentSettings.targetPlatform);
    
    const lightingInstruction = (currentSettings.lighting !== 'none' && currentSettings.lighting !== 'auto') 
        ? `Re-render the scene with new lighting: "${currentSettings.lighting.replace(/_/g, ' ')}".` 
        : 'Preserve authentic lighting atmosphere.';
    const angleInstruction = (currentSettings.cameraAngle !== 'none') 
        ? `Change the camera angle to: "${currentSettings.cameraAngle.replace(/_/g, ' ')}".` 
        : 'Preserve original camera perspective.';
    const positionInstruction = (currentSettings.productPosition !== 'none') 
        ? `Reposition the main subject to: "${currentSettings.productPosition.replace(/_/g, ' ')}".` 
        : 'Preserve original framing.';
    const creativeDirectives = [lightingInstruction, angleInstruction, positionInstruction].filter(Boolean).join('\n');

    const detailVal = currentSettings.detailLevel === 'auto' ? 5 : currentSettings.detailLevel;
    const fidelityDirective = detailVal >= 7 ? `
[CRITICAL PROTOCOL: FIDELIDADE MÁXIMA À IMAGEM DE REFERÊNCIA (Nível ${detailVal}/10)]
1. CORES EXATAS: Descreva os tons exatos de cor, matizes dominantes e brilhos especulares observados na imagem de referência.
2. TEXTURAS E MATERIAIS: Transcreva com precisão microscópica as texturas físicas (grãos, reflexos, rugosidade, transparência).
3. GEOMETRIA E SILHUETA: Mantenha as proporções e o contorno idênticos aos da imagem original.
4. ILUMINAÇÃO: Mapeie as fontes de luz, sombras e ângulo para que a nova imagem seja visualmente indistinguível da imagem de referência.
` : `Nível de Detalhe: ${detailVal}/10. Equilibre fidelidade à referência com narrativa envolvente.`;

    const isExtractBg = currentSettings.mode === 'extract_background';
    const isExtractElement = currentSettings.mode === 'extract_element';
    const isRemoveBranding = currentSettings.mode === 'remove_branding' || !!currentSettings.removeBranding;

    let systemPromptText = `You are ChatGPT (GPT-4o Mini), an imaginative, evocative prompt engineer and visual storyteller.
Analyze the subject in the reference image and generate an inspiring text-to-image prompt to recreate it with maximum fidelity:
${creativeDirectives}

Platform Requirement: ${currentSettings.targetPlatform}
Detailed Instruction: ${platformInstructions}
Style: ${currentSettings.style}
${fidelityDirective}

Instructions:
1. Identify the core subject, apply the creative directives and match the reference details.
2. Strictly follow the platform format.
3. Return ONLY the raw prompt text without preamble or quotation marks.`;

    if (isExtractElement) {
        systemPromptText = `You are ChatGPT Vision, acting as an elite Visual Element Extraction & Subject Isolation Architect.
Analyze the reference image, DETECT AND ISOLATE THE PRIMARY FOREGROUND SUBJECT OR VISUAL COMPONENTS, disregarding the background environment entirely:
1. ISOLATE THE ELEMENT: Strip away background scenes, walls, or rooms. Focus purely on the subject/object/product.
2. PRESERVE 100% VISUAL FIDELITY: Retain authentic colors, textures, specular highlights, reflections, and sharp silhouette contours.
3. PRESENTATION: Frame the isolated element in professional studio lighting on a clean neutral minimalist backdrop.
Platform Requirement: ${currentSettings.targetPlatform}
Detailed Instruction: ${platformInstructions}
Style: ${currentSettings.style}
Directives: ${creativeDirectives}
${fidelityDirective}
Return ONLY the raw prompt text without preamble.`;
    } else if (isRemoveBranding) {
        systemPromptText = `You are ChatGPT Vision, acting as an elite Commercial Product Photographer and Prompt Engineer.
Analyze the beverage/product in the reference image and generate a prompt to recreate it completely UNBRANDED:
1. REMOVE ALL BRANDING: No brand names, no paper/plastic labels, no logos, no typography, no trademarks.
2. PRESERVE 100% OF THE ORIGINAL PRODUCT COLORS: Retain the exact bottle glass color, aluminum can color, cap color, and internal liquid color and transparency.
3. Replace the label with a clean, smooth, unprinted container surface in the identical original color and material.
4. Keep original container geometry, reflections, condensation drops, and lighting.
Platform Requirement: ${currentSettings.targetPlatform}
Detailed Instruction: ${platformInstructions}
Style: ${currentSettings.style}
Directives: ${creativeDirectives}
${fidelityDirective}
Return ONLY the raw unbranded prompt text without preamble.`;
    } else if (isExtractBg) {
        systemPromptText = `You are ChatGPT Vision, acting as an elite Scene Decomposition and Background Extraction Architect.
Analyze the reference image, DETECT AND ISOLATE THE BACKGROUND ENVIRONMENT, and EXTRACT EVERY CONSTITUENT ELEMENT that composes the scene (architecture, walls, flooring, materials, background props, secondary ambient objects, lighting direction, and atmosphere).
CRITICAL RULE: The main foreground subject (person, product, central vehicle, or character) MUST BE COMPLETELY EXCLUDED OR REMOVED.
Reconstruct the entire background environment as a pristine, empty scenic plate containing all the background details, textures, and ambiance.
Platform Requirement: ${currentSettings.targetPlatform}
Detailed Instruction: ${platformInstructions}
Style: ${currentSettings.style}
Directives: ${creativeDirectives}
${fidelityDirective}
Return ONLY the raw prompt text without preamble.`;
    }

    // 1. If user provided a valid OpenAI key, attempt free-tier model gpt-4o-mini
    if (apiKey && apiKey.trim().startsWith('sk-')) {
        try {
            const response = await fetch("https://api.openai.com/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${apiKey.trim()}`
                },
                body: JSON.stringify({
                    model: "gpt-4o-mini", // Free/low-cost model
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
            console.warn("Direct OpenAI API call failed, seamlessly falling back to Free Native ChatGPT Vision Engine", e);
        }
    }

    // 2. 100% Free Native ChatGPT Vision Engine (powered by server-side Gemini)
    return await callVisionPersona(
        systemPromptText,
        "Analyze this image and generate the prompt with ChatGPT style and maximum fidelity to reference.",
        base64Image,
        mimeType
    );
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
