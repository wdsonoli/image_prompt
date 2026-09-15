import { PromptSettings } from '../types';
import { GoogleGenAI } from '@google/genai';

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

    const isExtractBg = settings.mode === 'extract_background';
    const lightingInstruction = (settings.lighting !== 'none' && settings.lighting !== 'auto') 
        ? `Artistic lighting direction: ${settings.lighting.replace(/_/g, ' ')}.` 
        : '';
    const angleInstruction = (settings.cameraAngle !== 'none') 
        ? `Cinematic angle & framing: ${settings.cameraAngle.replace(/_/g, ' ')}.` 
        : '';
    const positionInstruction = (settings.productPosition !== 'none') 
        ? `Compositional weight & placement: ${settings.productPosition.replace(/_/g, ' ')}.` 
        : '';

    const claudeSystemInstruction = isExtractBg 
        ? `You are Claude 3.7 Sonnet Vision, acting as a world-renowned Cinematographer and Production Designer.
Your task is to isolate and deeply deconstruct the BACKGROUND ENVIRONMENT plate of this image, omitting the foreground subject.
Deconstruct the scene's spatial architecture, materials, ambient set dressing, atmospheric depth, color grading, and environmental lighting physics.
Target platform: ${settings.targetPlatform}.
Visual style: ${settings.style}.
Detail level: ${settings.detailLevel}/10.
${lightingInstruction} ${angleInstruction} ${positionInstruction}
Return ONLY the final prompt text without meta-commentary or markdown conversational filler.`
        : `You are Claude 3.7 Sonnet Vision, acting as an elite Creative Director and Master Cinematographer.
Analyze the visual essence, emotional resonance, optical depth, color harmony, and tactile textures of the image.
Transform this visual into an evocative, ultra-nuanced image-generation prompt tailored for ${settings.targetPlatform}.
Visual style: ${settings.style}.
Detail level: ${settings.detailLevel}/10.
${lightingInstruction}
${angleInstruction}
${positionInstruction}
Return ONLY the raw prompt text without preamble, quotation marks, or conversational notes.`;

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
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: {
            parts: [
                {
                    inlineData: {
                        data: base64Image,
                        mimeType: mimeType
                    }
                },
                {
                    text: `${claudeSystemInstruction}\n\nTask: Deliver the Claude 3.7 Sonnet-style rich visual prompt now.`
                }
            ]
        },
        config: {
            temperature: 0.5,
        }
    });

    if (!response.text) throw new Error("Claude Vision returned an empty response.");
    return response.text.trim();
};
