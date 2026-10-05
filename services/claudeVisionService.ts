import { PromptSettings } from '../types';
import { callVisionPersona } from './visionPersonaHelper';

/**
 * Claude 3.7 Vision Engine
 * Analyzes imagery with Anthropic Claude's signature cinematic perspective,
 * spatial nuance, emotional ambiance, director-level camera optics, and photographic color grading.
 */
export const generateClaudePrompt = async (
    file: File,
    apiKey: string,
    settings: PromptSettings,
    preProcessedData?: { base64: string; mimeType: string }
): Promise<string> => {
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

    const isExtractPerson = settings.mode === 'extract_person';
    const isExtractBg = settings.mode === 'extract_background';
    const isExtractElement = settings.mode === 'extract_element';
    const isRemoveBranding = settings.mode === 'remove_branding' || !!settings.removeBranding;
    const lightingInstruction = (settings.lighting !== 'none' && settings.lighting !== 'auto') 
        ? `Artistic lighting direction: ${settings.lighting.replace(/_/g, ' ')}.` 
        : '';
    const angleInstruction = (settings.cameraAngle !== 'none') 
        ? `Cinematic angle & framing: ${settings.cameraAngle.replace(/_/g, ' ')}.` 
        : '';
    const positionInstruction = (settings.productPosition !== 'none') 
        ? `Compositional weight & placement: ${settings.productPosition.replace(/_/g, ' ')}.` 
        : '';

    const detailVal = settings.detailLevel === 'auto' ? 5 : settings.detailLevel;
    const fidelityDirective = detailVal >= 7 ? `
[MANDATORY REFERENCE IMAGE FIDELITY PROTOCOL - Level ${detailVal}/10]:
- Capture the EXACT color palette, chromatic warmth, and specular glints directly from the reference image.
- Transcribe micro-textures, surface finish, and authentic physical materials with absolute precision.
- Preserve identical proportions, silhouette geometry, and perspective coordinates.
- Ensure the prompt recreates an image as close, faithful, and indistinguishable from this reference image as possible.`
        : `Detail level: ${detailVal}/10. Balance fidelity with artistic depth.`;

    let claudeSystemInstruction = `You are Claude 3.7 Sonnet Vision, acting as an elite Creative Director and Master Cinematographer.
Analyze the visual essence, emotional resonance, optical depth, color harmony, and tactile textures of the image.
Transform this visual into an evocative, ultra-nuanced image-generation prompt tailored for ${settings.targetPlatform}.
Visual style: ${settings.style}.
${fidelityDirective}
${lightingInstruction}
${angleInstruction}
${positionInstruction}
Return ONLY the raw prompt text without preamble, quotation marks, or conversational notes.`;

    if (isExtractElement) {
        claudeSystemInstruction = `You are Claude 3.7 Sonnet Vision, acting as a Master Product & Subject Isolation Artist.
Your task is to detect and extract the primary foreground subject/element from this image, completely disregarding background scenery.
MANDATORY RULES:
1. Isolate the subject/element with razor-sharp contour definition, authentic tactile textures, and specular reflections.
2. Preserve 100% authentic color fidelity, material qualities, and silhouette geometry.
3. Frame the isolated element in balanced studio lighting on a pristine minimalist neutral backdrop.
Target platform: ${settings.targetPlatform}.
Visual style: ${settings.style}.
Detail level: ${settings.detailLevel}/10.
${lightingInstruction} ${angleInstruction} ${positionInstruction}
Return ONLY the raw isolated element prompt text without meta-commentary or conversational filler.`;
    } else if (isRemoveBranding) {
        claudeSystemInstruction = `You are Claude 3.7 Sonnet Vision, acting as an elite Commercial Product Photographer and Master Colorist.
Your goal is to de-brand the beverage/product container in this image.
MANDATORY RULES:
1. Completely eradicate all commercial brand logos, printed labels, typography, barcodes, and trademarks from the container.
2. PRESERVE WITH ABSOLUTE FIDELITY THE EXACT COLOR PALETTE of the product: bottle glass tint, aluminum can color, cap/lid shade, and the exact fluid/liquid tone and translucency.
3. Preserve the exact container silhouette, reflections, condensation drops, and lighting atmosphere.
4. The label area must become a seamless, pristine, unprinted surface in the identical base material and color.
Target platform: ${settings.targetPlatform}.
Visual style: ${settings.style}.
Detail level: ${settings.detailLevel}/10.
${lightingInstruction} ${angleInstruction} ${positionInstruction}
Return ONLY the raw unbranded prompt text without conversational preamble.`;
    } else if (isExtractBg) {
        claudeSystemInstruction = `You are Claude 3.7 Sonnet Vision, acting as a world-renowned Cinematographer and Production Designer.
Your task is to isolate and deeply deconstruct the BACKGROUND ENVIRONMENT plate of this image, omitting the foreground subject.
Deconstruct the scene's spatial architecture, materials, ambient set dressing, atmospheric depth, color grading, and environmental lighting physics.
Target platform: ${settings.targetPlatform}.
Visual style: ${settings.style}.
Detail level: ${settings.detailLevel}/10.
${lightingInstruction} ${angleInstruction} ${positionInstruction}
        Return ONLY the final prompt text without meta-commentary or markdown conversational filler.`;
    } else if (isExtractPerson) {
        claudeSystemInstruction = `You are Claude 3.7 Sonnet Vision, acting as a Master Portraitist, Biometric Analyst and Character Cloning Architect.
Your task is to analyze the person in this reference image and generate a master prompt that recreates this EXACT individual with identical biometric and physical characteristics.
MANDATORY RULES:
1. Exact facial biometrics: eye shape, gaze, iris tone, eyebrows, nose bridge/tip, mouth/lips, jawline, skin undertone, natural pores/freckles, and facial expression.
2. Exact hairstyle: length, cut, texture, hair color, highlights, and styling.
3. Exact wardrobe & fabrics: garment pieces, draping, textures, buttons, collars, colors, and accessories.
4. Exact posture, shoulder angle, head tilt, and physical lighting bounce on the face and body.
Target platform: ${settings.targetPlatform}.
Visual style: ${settings.style}.
Detail level: ${settings.detailLevel}/10.
${lightingInstruction} ${angleInstruction} ${positionInstruction}
Return ONLY the raw prompt text without conversational preamble.`;
    }

    // 1. Direct Anthropic API call if key is provided
    if (apiKey && apiKey.trim().startsWith('sk-ant-')) {
        try {
            const response = await fetch('https://api.anthropic.com/v1/messages', {
                method: 'POST',
                headers: {
                    'x-api-key': apiKey,
                    'anthropic-version': '2023-06-01',
                    'content-type': 'application/json',
                    'anthropic-dangerous-direct-browser-access': 'true'
                },
                body: JSON.stringify({
                    model: 'claude-3-7-sonnet-20250219',
                    max_tokens: 1024,
                    temperature: 0.6,
                    system: claudeSystemInstruction,
                    messages: [
                        {
                            role: 'user',
                            content: [
                                {
                                    type: 'image',
                                    source: {
                                        type: 'base64',
                                        media_type: mimeType,
                                        data: base64Image
                                    }
                                },
                                {
                                    type: 'text',
                                    text: 'Analyze this image and compose the ultimate production prompt following your instructions.'
                                }
                            ]
                        }
                    ]
                })
            });

            if (response.ok) {
                const data = await response.json();
                const content = data.content?.[0]?.text;
                if (content) return content.trim();
            }
        } catch (e) {
            console.warn("Direct Anthropic call failed, falling back to Claude Vision engine adapter", e);
        }
    }

    // 2. High-fidelity Claude Vision prompt architecture powered by Gemini backend
    return await callVisionPersona(
        claudeSystemInstruction,
        'Task: Deliver the Claude 3.7 Sonnet-style rich visual prompt now.',
        base64Image,
        mimeType
    );
};
