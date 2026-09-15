import { GoogleGenAI } from "@google/genai";
import { PromptSettings, BackgroundDecomposition } from "../types";

export const generateGeminiPrompt = async (
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
            base64Data = await fileToGenerativePart(file);
            mimeType = file.type;
        }

        const isMockup = settings.mode === 'mockup';
        const is3dLogo = settings.is3dLogo;
        const isExtractBg = settings.mode === 'extract_background';
        const isRemoveBranding = settings.mode === 'remove_branding' || !!settings.removeBranding;
        
        const lighting = (settings.lighting !== 'none' && settings.lighting !== 'auto') 
            ? `NEW LIGHTING: Apply "${settings.lighting.replace(/_/g, ' ')}" lighting style to the scene.` 
            : 'Analyze and preserve original lighting essence.';

        const angle = (settings.cameraAngle !== 'none') 
            ? `NEW CAMERA ANGLE: Capture the scene from a "${settings.cameraAngle.replace(/_/g, ' ')}" perspective.` 
            : 'Analyze and preserve original camera perspective.';

        const position = (settings.productPosition !== 'none') 
            ? `NEW COMPOSITION: Framing emphasis on "${settings.productPosition.replace(/_/g, ' ')}".` 
            : 'Analyze and preserve original composition balance.';

        let systemInstruction = `You are a World-Class Creative Director and Image-to-Prompt Architect. 
Your goal is to analyze the core visual aspects of the provided image with high fidelity, following the user's specific directives.

RULES:
1. If in 3D SEAL MODE: Focus on a 1:1 3D reconstruction of the object.
2. If in MOCKUP MODE: Ignore colors and textures, focus on the geometry as a white clay model.
3. ALWAYS optimize the formatting for the target platform (e.g., Midjourney tags, DALL-E descriptive text).
4. DO NOT include any conversational text, explanations, or "Here is your prompt". 
5. RETURN ONLY THE RAW PROMPT TEXT.`;

        let promptTaskText = `USER CREATIVE DIRECTIVES:
- Target Platform: ${settings.targetPlatform}
- Visual Style: ${settings.style}
- Detail Level: ${settings.detailLevel}/10
- ${lighting}
- ${angle}
- ${position}
- Base Request: ${settings.basePrompt || 'Detailed reconstruction'}

TASK: Extract the subject from the image and generate a professional prompt that follows the creative directives above.`;

        if (isRemoveBranding) {
            systemInstruction = `You are an Elite Commercial Beverage & Product Prompt Architect and Visual Retoucher.
Your mission is to analyze the provided image (beverage, bottle, can, packaging, container, or product) and construct a high-precision prompt that COMPLETELY REMOVES ALL BRAND NAMES, COMMERCIAL LABELS, LOGOS, TRADEMARKS, STICKERS, AND TYPOGRAPHY.
CRITICAL MANDATES:
1. PRESERVE THE EXACT SAME COLORS of the product: exact bottle/can container colors, cap/lid color, and internal liquid color/transparency (e.g. amber brew, emerald glass, ruby soda, deep black, matte brushed aluminum).
2. PRESERVE THE EXACT SHAPE & GEOMETRY: silhouette, neck curvature, can bevels, condensation beads, surface gloss, reflections, and lighting.
3. The surface where the label or brand was must be seamless, unprinted, blank, and pristine, matching the authentic material and color of the container.
4. Format the output as a clean, highly descriptive prompt for ${settings.targetPlatform}.
5. RETURN ONLY THE RAW PROMPT TEXT WITHOUT PREAMBLE.`;

            promptTaskText = `USER DIRECTIVES FOR REMOVING BRAND / LABEL (PRESERVING 100% PRODUCT COLORS):
- Mode: REMOVE BRAND, LOGO, AND LABEL (UNBRANDED PRODUCT WITH IDENTICAL COLORS)
- Target Platform: ${settings.targetPlatform}
- Desired Style: ${settings.style}
- Detail Level: ${settings.detailLevel}/10
- ${lighting}
- ${angle}
- ${position}
- Additional Directives: ${settings.basePrompt || 'Completely unbranded clean beverage/product container, zero logos, zero labels, original container and liquid colors strictly preserved'}

TASK: Carefully extract the exact container color palette, liquid color, materials, reflections, and geometry. Generate an image generation prompt specifying an UNBRANDED, LABEL-FREE product with NO text and NO logos, while preserving the exact authentic colors, reflections, and container shape of the reference image.`;
        } else if (isExtractBg) {
            systemInstruction = `You are an Elite Scene Decomposition and Background Extraction Architect.
Your mission is to analyze the provided image, DETECT AND ISOLATE THE BACKGROUND ENVIRONMENT, and EXTRACT EVERY CONSTITUENT ELEMENT that composes the scene (setting, architecture, walls, flooring, materials, background props, secondary ambient objects, lighting direction, and atmosphere).
CRITICAL RULE: The main foreground subject (person, model, product, central vehicle, or character) MUST BE COMPLETELY EXCLUDED OR REMOVED.
Reconstruct the entire background environment as a pristine, empty scenic plate containing all the background details, textures, and ambiance.
Format the output as a clean, highly effective prompt for ${settings.targetPlatform}.
RETURN ONLY THE RAW PROMPT TEXT WITHOUT ANY CONVERSATIONAL PREAMBLE.`;

            promptTaskText = `USER DIRECTIVES FOR BACKGROUND EXTRACTION:
- Mode: EXTRACT BACKGROUND & CONSTITUENT SCENE ELEMENTS (No foreground subject)
- Target Platform: ${settings.targetPlatform}
- Desired Style: ${settings.style}
- Detail Level: ${settings.detailLevel}/10
- ${lighting}
- ${angle}
- Additional Directives: ${settings.basePrompt || 'Isolate clean background scene with all secondary elements'}

TASK: Analyze the image, identify all background elements (scenery, architecture, background props, ambient lighting, textures), and generate a prompt that renders ONLY the empty, pristine background scene with high fidelity.`;
        }

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: {
                parts: [
                    {
                        inlineData: {
                            data: base64Data,
                            mimeType: mimeType
                        }
                    },
                    {
                        text: promptTaskText
                    }
                ]
            },
            config: {
                systemInstruction,
                temperature: 0.6,
            }
        });

        if (!response.text) throw new Error("Gemini returned an empty response.");
        return response.text.trim();
    } catch (error: any) {
        console.error("Gemini API Error:", error);
        throw error;
    }
};

/**
 * Performs structured decomposition of the image background and its constituent elements.
 */
export const extractBackgroundDecomposition = async (
    file: File,
    settings: PromptSettings,
    preProcessedData?: { base64: string, mimeType: string }
): Promise<BackgroundDecomposition> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    let base64Data: string;
    let mimeType: string;

    if (preProcessedData) {
        base64Data = preProcessedData.base64;
        mimeType = preProcessedData.mimeType;
    } else {
        base64Data = await fileToGenerativePart(file);
        mimeType = file.type;
    }

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: {
                parts: [
                    {
                        inlineData: {
                            data: base64Data,
                            mimeType: mimeType
                        }
                    },
                    {
                        text: `Analyze this image and extract ONLY the background environment and all of its composing visual elements, completely disregarding the central foreground subject/person/product.
                        
Return a JSON object with this exact structure:
{
  "settingDescription": "Comprehensive description of the environment, room type or landscape (e.g. Modern minimalist industrial loft with exposed concrete)",
  "architecturalElements": ["Array of distinct structural materials, walls, flooring, windows, surfaces, ceiling"],
  "propsAndObjects": ["Array of secondary scene items, furniture, plants, background props, decor located in the background"],
  "lightingAndAtmosphere": "Description of the light source, ambient color, shadows, atmospheric haze or mood",
  "dominantBackgroundColors": ["Array of 3 to 5 HEX color codes present specifically in the background, like #2A3B4C"],
  "isolatedPrompt": "A masterfully compiled text-to-image prompt optimized for ${settings.targetPlatform} describing ONLY the pristine empty background scene with all elements above, excluding any foreground subject."
}`
                    }
                ]
            },
            config: {
                responseMimeType: "application/json",
                systemInstruction: "You are an expert AI vision analyst specializing in visual background segmentation, architectural decomposition, and prompt engineering. Return pure valid JSON only.",
                temperature: 0.3
            }
        });

        const text = response.text?.trim();
        if (!text) throw new Error("Resposta vazia da IA.");
        
        const parsed = JSON.parse(text);
        return {
            settingDescription: parsed.settingDescription || "Cenário de fundo identificado.",
            architecturalElements: Array.isArray(parsed.architecturalElements) ? parsed.architecturalElements : [],
            propsAndObjects: Array.isArray(parsed.propsAndObjects) ? parsed.propsAndObjects : [],
            lightingAndAtmosphere: parsed.lightingAndAtmosphere || "Iluminação ambiente balanceada.",
            dominantBackgroundColors: Array.isArray(parsed.dominantBackgroundColors) ? parsed.dominantBackgroundColors : [],
            isolatedPrompt: parsed.isolatedPrompt || "Pristine empty background scene without subject."
        };
    } catch (err: any) {
        console.error("Erro na extração de background estruturada:", err);
        // Fallback robusto caso haja erro no JSON
        return {
            settingDescription: "Ambiente de fundo da imagem.",
            architecturalElements: ["Paredes de fundo", "Piso", "Superfícies ambientais"],
            propsAndObjects: ["Elementos de cenografia", "Objetos de fundo"],
            lightingAndAtmosphere: "Iluminação ambiente natural.",
            dominantBackgroundColors: ["#2d3748", "#4a5568", "#718096"],
            isolatedPrompt: `Empty background scene of ${settings.basePrompt || 'the provided environment'}, clean composition without any subjects, architectural details and ambient lighting, 8k resolution, photorealistic`
        };
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
