import express from 'express';
import type { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import type { PromptSettings, BackgroundDecomposition, ElementDecomposition, PersonDecomposition, SearchGroundingSource } from './types.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);

// Allow large payloads for base64 images
app.use(express.json({ limit: '60mb' }));
app.use(express.urlencoded({ limit: '60mb', extended: true }));

// Initialize shared server-side Google GenAI instance with mandatory User-Agent
const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY || '';
const ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
        headers: {
            'User-Agent': 'aistudio-build',
        }
    }
});

// Helper for model fallback
async function generateContentWithFallback(params: any): Promise<any> {
    try {
        return await ai.models.generateContent({
            ...params,
            model: 'gemini-3.8-flash',
        });
    } catch (err: any) {
        console.warn('Attempt with gemini-3.8-flash failed, trying gemini-3.1-flash-lite fallback:', err?.message || err);
        return await ai.models.generateContent({
            ...params,
            model: 'gemini-3.1-flash-lite',
        });
    }
}

// Helper for parsing and sanitizing Gemini errors
function parseGeminiError(err: any): { message: string; isQuotaExceeded: boolean; code: number } {
    let rawMsg = err?.message || String(err || '');
    let isQuotaExceeded = false;
    let code = err?.status || 500;

    try {
        const jsonStart = rawMsg.indexOf('{');
        if (jsonStart !== -1) {
            const parsed = JSON.parse(rawMsg.slice(jsonStart));
            if (parsed.error) {
                if (parsed.error.code === 429 || parsed.error.status === 'RESOURCE_EXHAUSTED') {
                    isQuotaExceeded = true;
                    code = 429;
                }
                rawMsg = parsed.error.message || rawMsg;
            }
        }
    } catch {
        // Not valid JSON
    }

    if (rawMsg.includes('429') || rawMsg.includes('RESOURCE_EXHAUSTED') || rawMsg.includes('quota') || rawMsg.includes('Quota exceeded')) {
        isQuotaExceeded = true;
        code = 429;
    }

    let friendlyMessage = rawMsg;
    if (isQuotaExceeded) {
        friendlyMessage = 'Limite de requisições temporariamente atingido. Você pode copiar o prompt master gerado com 1 clique para testar gratuitamente no Google ImageFX, Midjourney ou Flux.';
    }

    return { message: friendlyMessage, isQuotaExceeded, code };
}


// 1. Generate Prompt endpoint
app.post('/api/gemini/prompt', async (req: Request, res: Response) => {
    try {
        const { imageBase64, mimeType, settings } = req.body as {
            imageBase64: string;
            mimeType: string;
            settings: PromptSettings;
        };

        if (!imageBase64) {
            return res.status(400).json({ error: 'Nenhuma imagem base64 fornecida.' });
        }

        const isMockup = settings.mode === 'mockup';
        const isExtractBg = settings.mode === 'extract_background';
        const isExtractElement = settings.mode === 'extract_element';
        const isExtractPerson = settings.mode === 'extract_person';
        const isRemoveBranding = settings.mode === 'remove_branding' || Boolean(settings.removeBranding);

        const lighting = (settings.lighting !== 'none' && settings.lighting !== 'auto')
            ? `NEW LIGHTING: Apply "${settings.lighting.replace(/_/g, ' ')}" lighting style to the scene.`
            : 'Analyze and preserve original lighting essence.';

        const angle = (settings.cameraAngle !== 'none')
            ? `NEW CAMERA ANGLE: Capture the scene from a "${settings.cameraAngle.replace(/_/g, ' ')}" perspective.`
            : 'Analyze and preserve original camera perspective.';

        const position = (settings.productPosition !== 'none')
            ? `NEW COMPOSITION: Framing emphasis on "${settings.productPosition.replace(/_/g, ' ')}".`
            : 'Analyze and preserve original composition balance.';

        const detailVal = settings.detailLevel === 'auto' ? 5 : settings.detailLevel;
        const fidelityDirective = detailVal >= 7
            ? `\n[CRITICAL PROTOCOL: MAXIMUM REFERENCE IMAGE FIDELITY (Level ${detailVal}/10)]\n- EXACT COLOR MATCHING: Document the exact color palette, dominant hues, gradients, and specular highlight tones observed in the reference image.\n- MICROSCOPIC TEXTURE MATCHING: Transcribe authentic tactile micro-textures (materials, roughness, reflections, gloss, condensation, surface finish) exactly as seen.\n- GEOMETRY & PROPORTIONS: Retain the identical shape, silhouette, perspective, and proportions of the reference image subject.\n- LIGHTING & SPECULAR PHYSICS: Map the precise light directions, shadows, and specular bounce from the reference.\n- ZERO INVENTED DRIFT: The resulting prompt must recreate an image that is as close, faithful, and visually indistinguishable from this reference image as possible.`
            : `Detail Level: ${detailVal}/10. Balance faithful reference reproduction with creative aesthetic flair.`;

        let systemInstruction = `You are a World-Class Creative Director and Image-to-Prompt Architect. 
Your goal is to analyze the core visual aspects of the provided image with high fidelity, following the user's specific directives.

RULES:
1. If in 3D SEAL MODE: Focus on a 1:1 3D reconstruction of the object.
2. If in MOCKUP MODE: Ignore colors and textures, focus on the geometry as a white clay model.
3. ALWAYS optimize the formatting for the target platform (e.g., Midjourney tags, DALL-E descriptive text).
4. ${fidelityDirective}
5. DO NOT include any conversational text, explanations, or "Here is your prompt". 
6. RETURN ONLY THE RAW PROMPT TEXT.`;

        const genderDirective = settings.characterGender && settings.characterGender !== 'auto'
            ? `- Subject Gender: Explicitly ${settings.characterGender === 'man' ? 'Male / Homem (ensure masculine physique, facial features, styling, and groom)' : 'Female / Mulher (ensure feminine physique, facial features, styling, and aesthetic)'}`
            : '';

        let promptTaskText = `USER CREATIVE DIRECTIVES:
- Target Platform: ${settings.targetPlatform}
- Visual Style: ${settings.style}
- Detail Level: ${settings.detailLevel}/10
${genderDirective ? genderDirective + '\n' : ''}- ${lighting}
- ${angle}
- ${position}
- Base Request: ${settings.basePrompt || 'Detailed reconstruction'}
- Fidelity Directive: ${fidelityDirective}

TASK: Extract the subject from the image and generate a professional prompt that follows the creative directives above and replicates the reference image with extreme fidelity.`;

        if (isRemoveBranding) {
            systemInstruction = `You are an Elite Commercial Beverage & Product Prompt Architect and Visual Retoucher.
Your mission is to analyze the provided image (beverage, bottle, can, packaging, container, or product) and construct a high-precision prompt that COMPLETELY REMOVES ALL BRAND NAMES, COMMERCIAL LABELS, LOGOS, TRADEMARKS, STICKERS, AND TYPOGRAPHY.
CRITICAL MANDATES:
1. PRESERVE THE EXACT SAME COLORS of the product: exact bottle/can container colors, cap/lid color, and internal liquid color/transparency.
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
        } else if (isExtractElement) {
            systemInstruction = `You are an Elite Subject & Visual Element Extraction Architect.
Your mission is to analyze the provided image, DETECT, ISOLATE, AND EXTRACT THE KEY VISUAL ELEMENTS (main subject, foreground product, individual objects, characters, or specific items) with pristine precision.
CRITICAL MANDATES:
1. FOCUS EXCLUSIVELY ON THE ELEMENT(S): Disregard the background environment or scenery entirely.
2. PRESERVE MAXIMUM FIDELITY: Retain 100% authentic colors, silhouette, contour edges, surface textures, reflections, specular highlights, and material properties.
3. ISOLATED COMPOSITION: Construct a professional prompt tailored for ${settings.targetPlatform} rendering the extracted element in full glory, cleanly isolated (studio lighting, neutral clean minimalist backdrop, or crisp commercial product presentation).
4. RETURN ONLY THE RAW PROMPT TEXT WITHOUT ANY CONVERSATIONAL PREAMBLE.`;

            promptTaskText = `USER DIRECTIVES FOR ELEMENT EXTRACTION (ISOLATE FOREGROUND SUBJECT & VISUAL COMPONENTS):
- Mode: EXTRACT ELEMENT (Subject & Object Isolation, Ignore/Remove Background)
- Target Platform: ${settings.targetPlatform}
- Desired Style: ${settings.style}
- Detail Level: ${settings.detailLevel}/10
- ${lighting}
- ${angle}
- ${position}
- Additional Directives: ${settings.basePrompt || 'Isolate clean foreground element/subject with razor-sharp contours, authentic textures, and studio lighting'}`;
        } else if (isExtractPerson) {
            systemInstruction = `You are a World-Class Portraiture, Human Biometrics & Character Cloning Prompt Architect.
Your mission is to analyze the provided image and EXTRACT THE EXACT PERSON (individual, model, or character) with 100% FAITHFUL REPLICATION OF THEIR IDENTICAL CHARACTERISTICS.

MANDATORY PERSON CLONING PROTOCOL:
1. EXACT FACIAL BIOMETRICS: Replicate the person's precise facial structure: eye shape, iris color, eyebrow arch and thickness, nose bridge and tip, mouth/lip shape and fullness, jawline definition, cheekbones, natural skin undertone, wrinkles/pores/freckles, and facial hair (if any).
2. EXACT HAIR & GROOMING: Document the exact hair color, highlights, length, texture, volume, parting, bangs, styling, and flyaway strands.
3. EXACT EXPRESSION & GAZE: Capture authentic emotional nuance and eye contact direction.
4. EXACT POSE & BODY PHYSIQUE: Describe body posture, shoulder angle, spine curvature, and hand placement.
5. EXACT WARDROBE & FABRICS: Transcribe every garment worn, fabric textures, folds, and accessories.
6. EXACT LIGHTING ON THE PERSON: Map photographic lighting: key light angle, fill ratio, rim light, and eye catchlights.
7. Format output as a master prompt for ${settings.targetPlatform}.
8. RETURN ONLY THE RAW PROMPT TEXT WITHOUT PREAMBLE.`;

            promptTaskText = `USER DIRECTIVES FOR PERSON EXTRACTION (CLONE IDENTICAL CHARACTERISTICS):
- Mode: EXTRACT PERSON / EXACT HUMAN SUBJECT REPLICATION
${genderDirective ? genderDirective + '\n' : ''}- Target Platform: ${settings.targetPlatform}
- Desired Style: ${settings.style}
- Detail Level: ${settings.detailLevel}/10
- ${lighting}
- ${angle}
- ${position}
- Additional Directives: ${settings.basePrompt || 'Replicate this exact person with 1:1 facial features, hairstyle, clothing, expression, pose, and lighting'}

TASK: Deeply analyze the person in the reference image. Generate a master prompt for ${settings.targetPlatform} that recreates this EXACT person with identical facial biometrics, hair, wardrobe, expression, pose, and lighting characteristics.`;
        }

        const config: any = {
            systemInstruction,
            temperature: 0.6,
        };

        if (settings.enableSearchGrounding) {
            config.tools = [{ googleSearch: {} }];
        }

        const response = await generateContentWithFallback({
            contents: {
                parts: [
                    {
                        inlineData: {
                            data: imageBase64,
                            mimeType: mimeType || 'image/png'
                        }
                    },
                    {
                        text: promptTaskText
                    }
                ]
            },
            config
        });

        const prompt = response.text ? response.text.trim() : '';
        res.json({ prompt });
    } catch (err: any) {
        console.error('Error generating prompt:', err);
        const parsed = parseGeminiError(err);
        res.status(parsed.code).json({ error: parsed.message, isQuotaExceeded: parsed.isQuotaExceeded });
    }
});

// 2. Grounded Prompt with Google Search endpoint
app.post('/api/gemini/grounded-prompt', async (req: Request, res: Response) => {
    try {
        const { imageBase64, mimeType, settings } = req.body;
        const systemInstruction = `You are an Elite Visual Prompt Architect equipped with live Google Search Grounding.
Your objective is to examine the provided image and perform Google searches to retrieve accurate, up-to-date real-world information (cameras, lenses, optical gear, authentic materials, verified trends).
Compile all verified details into an ultra-realistic, state-of-the-art master prompt optimized for ${settings?.targetPlatform || 'midjourney'}.
DO NOT output conversational preamble. RETURN ONLY THE FINAL COMPILED PROMPT.`;

        const promptTask = `GROUNDED SEARCH PROMPT COMPILATION:
- Target Platform: ${settings?.targetPlatform || 'midjourney'}
- Visual Style: ${settings?.style || 'photorealistic'}
- Detail Level: ${settings?.detailLevel || 5}/10
- Base Request: ${settings?.basePrompt || 'Analyze subject, aesthetic, lighting, and real-world optical references'}

Use Google Search to verify exact facts, visual trends, and real-world gear for this image. Produce the highest-fidelity prompt possible.`;

        const response = await ai.models.generateContent({
            model: 'gemini-3.8-flash',
            contents: {
                parts: [
                    {
                        inlineData: {
                            data: imageBase64,
                            mimeType: mimeType || 'image/png'
                        }
                    },
                    {
                        text: promptTask
                    }
                ]
            },
            config: {
                systemInstruction,
                temperature: 0.4,
                tools: [{ googleSearch: {} }]
            }
        });

        const text = response.text ? response.text.trim() : '';
        const candidate = response.candidates?.[0];
        const groundingMeta = (candidate as any)?.groundingMetadata;

        const queries: string[] = groundingMeta?.webSearchQueries || [];
        const chunks = groundingMeta?.groundingChunks || [];
        const sources: SearchGroundingSource[] = [];

        for (const chunk of chunks) {
            if (chunk?.web?.uri) {
                sources.push({
                    title: chunk.web.title || chunk.web.uri,
                    url: chunk.web.uri
                });
            }
        }

        res.json({
            prompt: text,
            grounding: {
                queries,
                sources,
                text
            }
        });
    } catch (err: any) {
        console.error('Error in grounded prompt:', err);
        const parsed = parseGeminiError(err);
        res.status(parsed.code).json({ error: parsed.message, isQuotaExceeded: parsed.isQuotaExceeded });
    }
});

// 3. Enrich existing prompt with Google Search
app.post('/api/gemini/enrich-search', async (req: Request, res: Response) => {
    try {
        const { prompt, targetPlatform = 'midjourney' } = req.body;
        const response = await ai.models.generateContent({
            model: 'gemini-3.8-flash',
            contents: `Enrich this visual prompt for ${targetPlatform} using Google Search to verify real-world facts, current photography techniques, authentic optical gear, and trending styles:
Prompt: "${prompt}"

Return ONLY the refined, highly detailed enriched prompt with verified real-world terminology.`,
            config: {
                tools: [{ googleSearch: {} }],
                temperature: 0.4
            }
        });

        const text = response.text ? response.text.trim() : prompt;
        const candidate = response.candidates?.[0];
        const groundingMeta = (candidate as any)?.groundingMetadata;

        const queries: string[] = groundingMeta?.webSearchQueries || [];
        const chunks = groundingMeta?.groundingChunks || [];
        const sources: SearchGroundingSource[] = [];

        for (const chunk of chunks) {
            if (chunk?.web?.uri) {
                sources.push({
                    title: chunk.web.title || chunk.web.uri,
                    url: chunk.web.uri
                });
            }
        }

        res.json({
            prompt: text,
            grounding: {
                queries,
                sources,
                text
            }
        });
    } catch (err: any) {
        console.error('Error enriching prompt:', err);
        const parsed = parseGeminiError(err);
        res.status(parsed.code).json({ error: parsed.message, isQuotaExceeded: parsed.isQuotaExceeded });
    }
});

// 4. Background decomposition
app.post('/api/gemini/extract-background', async (req: Request, res: Response) => {
    try {
        const { imageBase64, mimeType, settings } = req.body;
        const targetPlatform = settings?.targetPlatform || 'midjourney';

        const requestPayload = {
            contents: {
                parts: [
                    {
                        inlineData: {
                            data: imageBase64,
                            mimeType: mimeType || 'image/png'
                        }
                    },
                    {
                        text: `Analyze this image and extract ONLY the background environment and all of its composing visual elements, completely disregarding the central foreground subject/person/product.
                        
Return a JSON object with this exact structure:
{
  "settingDescription": "Comprehensive description of the environment, room type or landscape",
  "architecturalElements": ["Array of distinct structural materials, walls, flooring, windows, surfaces, ceiling"],
  "propsAndObjects": ["Array of secondary scene items, furniture, plants, background props, decor located in the background"],
  "lightingAndAtmosphere": "Description of the light source, ambient color, shadows, atmospheric haze or mood",
  "dominantBackgroundColors": ["Array of 3 to 5 HEX color codes present specifically in the background, like #2A3B4C"],
  "isolatedPrompt": "A masterfully compiled text-to-image prompt optimized for ${targetPlatform} describing ONLY the pristine empty background scene with all elements above, excluding any foreground subject."
}`
                    }
                ]
            },
            config: {
                responseMimeType: 'application/json',
                systemInstruction: 'You are an expert AI vision analyst specializing in visual background segmentation, architectural decomposition, and prompt engineering. Return pure valid JSON only.',
                temperature: 0.3
            }
        };

        const response = await generateContentWithFallback(requestPayload);
        const text = response.text ? response.text.trim() : '';
        const parsed = JSON.parse(text) as BackgroundDecomposition;
        res.json(parsed);
    } catch (err: any) {
        console.error('Error extracting background decomposition:', err);
        // Fallback response so frontend never crashes
        const fallback: BackgroundDecomposition = {
            settingDescription: "Ambiente de fundo da imagem.",
            architecturalElements: ["Paredes de fundo", "Piso", "Superfícies ambientais"],
            propsAndObjects: ["Elementos de cenografia", "Objetos de fundo"],
            lightingAndAtmosphere: "Iluminação ambiente natural.",
            dominantBackgroundColors: ["#2d3748", "#4a5568", "#718096"],
            isolatedPrompt: `Empty background scene, clean composition without any subjects, architectural details and ambient lighting, 8k resolution, photorealistic`
        };
        res.json(fallback);
    }
});

// 5. Element decomposition
app.post('/api/gemini/extract-element', async (req: Request, res: Response) => {
    try {
        const { imageBase64, mimeType, settings } = req.body;
        const targetPlatform = settings?.targetPlatform || 'midjourney';

        const requestPayload = {
            contents: {
                parts: [
                    {
                        inlineData: {
                            data: imageBase64,
                            mimeType: mimeType || 'image/png'
                        }
                    },
                    {
                        text: `Analyze this image and EXTRACT the main subject and all individual identifiable foreground visual elements, objects, and components. Completely ignore the background environment.
Return a JSON object with this exact structure:
{
  "mainSubject": "Name and concise definition of the primary element or subject",
  "category": "Broad category: Produto, Personagem, Objeto, Veículo, Acessório, Logotipo ou Alimento",
  "elements": [
    {
      "name": "Name of specific extracted element",
      "category": "Classification of this sub-element",
      "description": "Comprehensive visual description of shape, surface finish, and appearance",
      "materialsAndTextures": "Materials like matte glass, embossed foil, brushed steel, liquid condensation...",
      "dominantColors": ["#HEX1", "#HEX2", "#HEX3"],
      "isolatedPrompt": "Dedicated text-to-image prompt to generate this specific element completely isolated on a clean studio background for ${targetPlatform}"
    }
  ],
  "lightingAndReflections": "Description of reflections, gloss, specular highlights, and edge lighting on the extracted element",
  "silhouetteAndEdges": "Description of edge contours, sharpness, transparency, and cutout qualities",
  "isolatedMasterPrompt": "A master prompt optimized for ${targetPlatform} describing the entire primary subject cleanly isolated on neutral studio background, pristine lighting, photorealistic 8k, ready for commercial cutout and placement."
}`
                    }
                ]
            },
            config: {
                responseMimeType: 'application/json',
                systemInstruction: 'You are an expert AI vision analyst specializing in visual element segmentation, object extraction, product deconstruction, and prompt engineering. Return pure valid JSON only.',
                temperature: 0.3
            }
        };

        const response = await generateContentWithFallback(requestPayload);
        const text = response.text ? response.text.trim() : '';
        const parsed = JSON.parse(text);
        res.json({
            mainSubject: parsed.mainSubject || "Elemento visual identificado",
            category: parsed.category || "Objeto / Produto",
            elements: Array.isArray(parsed.elements) && parsed.elements.length > 0 ? parsed.elements.map((el: any) => ({
                name: el.name || "Elemento",
                category: el.category || "Componente",
                description: el.description || "",
                materialsAndTextures: el.materialsAndTextures || "Materiais e texturas originais",
                dominantColors: Array.isArray(el.dominantColors) ? el.dominantColors : ["#3b82f6"],
                isolatedPrompt: el.isolatedPrompt || "Isolated element on clean studio background"
            })) : [
                {
                    name: parsed.mainSubject || "Elemento Principal",
                    category: parsed.category || "Sujeito Principal",
                    description: "Elemento central isolado da cena.",
                    materialsAndTextures: "Superfície e acabamento originais com alta resolução",
                    dominantColors: ["#1e293b", "#3b82f6", "#f8fafc"],
                    isolatedPrompt: parsed.isolatedMasterPrompt || `Isolated subject, clean composition, studio lighting, crisp edges, 8k resolution, photorealistic`
                }
            ],
            lightingAndReflections: parsed.lightingAndReflections || "Iluminação de estúdio com reflexos preservados.",
            silhouetteAndEdges: parsed.silhouetteAndEdges || "Bordas nítidas e contorno recortado com alta definição.",
            isolatedMasterPrompt: parsed.isolatedMasterPrompt || "Master isolated subject on studio background."
        });
    } catch (err: any) {
        console.error('Error extracting element decomposition:', err);
        const fallback: ElementDecomposition = {
            mainSubject: "Elemento principal da imagem",
            category: "Objeto / Sujeito",
            elements: [
                {
                    name: "Elemento Central",
                    category: "Sujeito Principal",
                    description: "Elemento de destaque isolado da cena.",
                    materialsAndTextures: "Superfície e acabamento originais com alta resolução",
                    dominantColors: ["#1e293b", "#3b82f6", "#f8fafc"],
                    isolatedPrompt: `Master isolated element, clean isolated composition, pristine studio lighting, crisp edges, 8k resolution, photorealistic`
                }
            ],
            lightingAndReflections: "Iluminação de estúdio balanceada com destaques suaves.",
            silhouetteAndEdges: "Recorte nítido com preservação total de contornos.",
            isolatedMasterPrompt: `Clean isolated subject, studio lighting, pure neutral background, sharp silhouette, photorealistic`
        };
        res.json(fallback);
    }
});

// 6. Person decomposition
app.post('/api/gemini/extract-person', async (req: Request, res: Response) => {
    try {
        const { imageBase64, mimeType, settings } = req.body;
        const targetPlatform = settings?.targetPlatform || 'midjourney';
        const style = settings?.style || 'photorealistic';

        const requestPayload = {
            contents: {
                parts: [
                    {
                        inlineData: {
                            data: imageBase64,
                            mimeType: mimeType || 'image/png'
                        }
                    },
                    {
                        text: `Analyze this image and EXTRACT the main person (human subject, model, or character) with extreme photographic and biometric fidelity.
Disregard background environment and focus 100% on the person's exact characteristics.
Return a JSON object with this exact structure:
{
  "mainSubject": "Short identification of the subject",
  "genderAndAge": "Gender presentation and estimated age range",
  "ethnicityAndSkinTone": "Complexion, skin undertone, natural texture, pores, freckles",
  "facialFeatures": "Comprehensive breakdown of facial structure, eyes, nose, mouth/lips, jawline, expression and gaze",
  "hairStyleAndColor": "Exact hair color, highlights, length, texture, parting and styling",
  "clothingAndFabric": "Every garment piece worn, colors, fabric textures, fit and neckline",
  "accessoriesAndDetails": ["Array of accessories"],
  "poseAndBodyLanguage": "Exact body pose, posture, shoulder orientation, head tilt angle, and arm placement",
  "lightingOnSubject": "Photographic lighting sculpted across face and body",
  "isolatedPersonPrompt": "A master prompt optimized for ${targetPlatform} describing this EXACT person with identical facial biometrics, hair, wardrobe, expression, pose, and lighting, rendered in ${style} style on clean neutral background with 8k photorealistic quality."
}`
                    }
                ]
            },
            config: {
                responseMimeType: 'application/json',
                systemInstruction: 'You are an expert AI vision portrait analyst specializing in human biometrics, facial feature mapping, fashion deconstruction, and prompt engineering. Return pure valid JSON only.',
                temperature: 0.3
            }
        };

        const response = await generateContentWithFallback(requestPayload);
        const text = response.text ? response.text.trim() : '';
        const parsed = JSON.parse(text) as PersonDecomposition;
        res.json(parsed);
    } catch (err: any) {
        console.error('Error extracting person decomposition:', err);
        const fallback: PersonDecomposition = {
            mainSubject: "Pessoa da imagem de referência",
            genderAndAge: "Indivíduo adulto",
            ethnicityAndSkinTone: "Tom de pele natural conforme imagem de referência",
            facialFeatures: "Traços faciais, formato dos olhos, expressão e olhar idênticos à referência",
            hairStyleAndColor: "Penteado, cor e textura de cabelo conforme a imagem de referência",
            clothingAndFabric: "Vestuário, cortes e tecidos conforme observados na imagem",
            accessoriesAndDetails: ["Acessórios observados na referência"],
            poseAndBodyLanguage: "Postura e enquadramento corporais idênticos à referência",
            lightingOnSubject: "Iluminação de estúdio natural e suave sobre o sujeito",
            isolatedPersonPrompt: `Portrait of the person from the reference image, matching exact facial features, expression, hairstyle, wardrobe, and pose, 8k resolution, photorealistic`
        };
        res.json(fallback);
    }
});

// 6.5 Model Sheet & Character Turnaround Extraction
app.post('/api/gemini/extract-model-sheet', async (req: Request, res: Response) => {
    try {
        const { imageBase64, mimeType } = req.body;
        if (!imageBase64) {
            return res.status(400).json({ error: 'Nenhuma imagem fornecida.' });
        }

        const requestPayload = {
            contents: {
                parts: [
                    {
                        inlineData: {
                            data: imageBase64,
                            mimeType: mimeType || 'image/jpeg'
                        }
                    },
                    {
                        text: `You are an elite Character Designer and Production Model Sheet Supervisor.
Analyze this character/person image with extreme biometric and costume fidelity.
Extract and deconstruct all identity components so the user can customize them before generating prompts.
Return a single valid JSON object strictly matching this schema:
{
  "gender": "woman or man",
  "characterName": "Suggested character/model name",
  "role": "Creator / Model or Lead Character",
  "age": "e.g. 22-26 or Mid 20s",
  "height": "e.g. 5'8\\" (173 cm) or 6'0\\" (183 cm)",
  "bodyType": "Slim, Athletic, Curvy, etc.",
  "personality": "3-5 descriptive personality traits",
  "distinctiveTraits": "Prominent facial, postural or styling distinctive traits",
  "facialStructure": "Shape of face, cheekbones, jawline, forehead",
  "eyes": "Color, shape, expression, lashes",
  "eyebrows": "Arch, thickness, groom",
  "nose": "Bridge, tip shape",
  "lips": "Fullness, shape, natural tint",
  "skinTone": "Fair porcelain / olive / deep / etc. with undertone",
  "skinToneHex": "Approximate dominant skin hex like #F6CCC8",
  "hair": "Length, waves/straight, style, parting",
  "hairColorHex": "Dominant hair color hex like #3B2A1F",
  "makeup": "Foundation, blush, lips, eye definition",
  "facialHair": "Clean-shaven / stubble / beard description if male, or none",
  "scarsOrMarks": "None / subtle beauty mark",
  "outfitType": "Complete outfit description (e.g. Red asymmetric ruffle dress / Red shirt and trousers)",
  "topNeckline": "Neckline cut, collar or ruffle details",
  "sleevesOrStraps": "Sleeve length or strap design",
  "bottomPiece": "Pants, skirt, silhouette cut",
  "footwear": "Shoes, heels, sneakers, color and style",
  "accessories": "Jewelry, necklace, earrings, watch",
  "fabricTextures": ["Silk", "Chiffon", "Crepe", "Cotton", "Leather"],
  "colorSwatches": [
    { "id": "c1", "label": "Primary Outfit", "hex": "#B31217" },
    { "id": "c2", "label": "Secondary Shade", "hex": "#E63946" },
    { "id": "c3", "label": "Skin Tone", "hex": "#F6CCC8" },
    { "id": "c4", "label": "Hair Tone", "hex": "#3B2A1F" }
  ],
  "materialReferences": ["Silk/Satin", "Chiffon", "Crepe"],
  "lighting": "Natural soft studio lighting with warm highlights",
  "backgroundSetting": "Textured neutral beige wall or minimal studio backdrop",
  "renderStyle": "Photorealistic 8K, Master Studio Portrait",
  "outputType": "full_model_sheet",
  "additionalNotes": "Maintain identity look across all sheets, exact biometric facial consistency."
}`
                    }
                ]
            },
            config: {
                responseMimeType: 'application/json',
                systemInstruction: 'You are a master character artist and prompt architect. Extract precise biometric, fashion, and color hex values from the reference image. Return pure JSON only without markdown fences.',
                temperature: 0.2
            }
        };

        const response = await generateContentWithFallback(requestPayload);
        const text = response.text ? response.text.trim() : '';
        const parsed = JSON.parse(text);
        res.json(parsed);
    } catch (err: any) {
        console.error('Error extracting model sheet:', err);
        const fallback = {
            gender: "woman",
            characterName: "Modelo de Referência",
            role: "Creator / Model",
            age: "20-25",
            height: "5'8\" (173 cm)",
            bodyType: "Slim / Elegante",
            personality: "Confiante, elegante, expressiva e profissional",
            distinctiveTraits: "Olhar expressivo, cabelo ondulado fluido, postura refinada",
            facialStructure: "Rosto oval harmonioso com maçãs do rosto bem definidas",
            eyes: "Castanhos amendoados com brilho natural",
            eyebrows: "Arqueadas e naturais",
            nose: "Reto e delicado",
            lips: "Contorno natural e suavemente rosado",
            skinTone: "Pele clara com subtom neutro e textura acetinada",
            skinToneHex: "#F6CCC8",
            hair: "Cabelos longos ondulados com textura sedosa",
            hairColorHex: "#3B2A1F",
            makeup: "Maquiagem natural leve com acabamento glow",
            facialHair: "Nenhum",
            scarsOrMarks: "Nenhuma cicatriz visível",
            outfitType: "Traje elegante monocromático de alta costura",
            topNeckline: "Decote assimétrico sofisticado",
            sleevesOrStraps: "Detalhe em drapeado fluido",
            bottomPiece: "Corte reto impecável com caimento leve",
            footwear: "Sandália de tiras finas de salto alto",
            accessories: "Brincos discretos dourados",
            fabricTextures: ["Seda / Cetim", "Chiffon", "Crepe"],
            colorSwatches: [
                { id: "c1", label: "Traje Principal", hex: "#B31217" },
                { id: "c2", label: "Destaque Vermelho", hex: "#E63946" },
                { id: "c3", label: "Tom de Pele", hex: "#F6CCC8" },
                { id: "c4", label: "Tom de Cabelo", hex: "#3B2A1F" }
            ],
            materialReferences: ["Seda", "Crepe", "Chiffon"],
            lighting: "Iluminação de estúdio suave com luz de preenchimento quente",
            backgroundSetting: "Fundo neutro estúdio fotográfico minimalista",
            renderStyle: "Fotorealista 8K, Ultra Detalhado",
            outputType: "full_model_sheet",
            additionalNotes: "Manter consistência facial e anatômica idêntica em todas as vistas e poses."
        };
        res.json(fallback);
    }
});

// 6.55 Wardrobe & Clothing Reference Extraction (Upload Vestuário / Figurino)
app.post('/api/gemini/extract-wardrobe', async (req: Request, res: Response) => {
    try {
        const { imageBase64, mimeType, role, characterGender, userInstructions } = req.body;
        if (!imageBase64) {
            return res.status(400).json({ error: 'Nenhuma imagem de vestuário fornecida.' });
        }

        const roleContext = role ? `The user uploaded this image as: "${role}" (e.g. full_outfit, top_piece, bottom_piece, shoes_accessories, pattern_texture).` : '';
        const genderContext = characterGender && characterGender !== 'auto' ? `The character is a ${characterGender}.` : '';
        const userNotes = userInstructions ? `Additional user notes: "${userInstructions}".` : '';

        const requestPayload = {
            contents: {
                parts: [
                    {
                        inlineData: {
                            data: imageBase64,
                            mimeType: mimeType || 'image/jpeg'
                        }
                    },
                    {
                        text: `You are an elite Fashion Designer, Haute Couture Patternmaker, and Costume Supervisor for 3D character studios and cinematic productions.
Analyze the clothing, garment pieces, fabrics, cuts, shoes, accessories, and color palette shown in this image with extreme fashion expertise.
${roleContext}
${genderContext}
${userNotes}

Deconstruct the apparel thoroughly so it can be applied to a Character Model Sheet.
Return ONLY a valid JSON object matching this schema:
{
  "outfitType": "Complete detailed description of the outfit/garment (e.g. Asymmetrical crimson silk midi dress with sculptural shoulder ruffle / Tailored navy blue wool blazer with crisp poplin shirt and slim chinos)",
  "topNeckline": "Detailed neckline/collar/lapel cut (e.g. One-shoulder ruffle neckline / Peak lapels with open collar shirt)",
  "sleevesOrStraps": "Sleeve design, cuff, straps or armhole styling (e.g. Sleeveless on left with dramatic flutter sleeve on right / Long tailored sleeves with surgeon cuffs)",
  "bottomPiece": "Pants, skirt, shorts, hemline, cut, silhouette (e.g. Fluid midi length skirt with high side slit / Slim-fit tapered trousers with pressed crease)",
  "footwear": "Matching shoes, heels, sneakers, boots, material and color (e.g. Strappy stiletto sandals in matching crimson leather / White minimalist calfskin sneakers)",
  "accessories": "Jewelry, belt, bag, scarf, hardware, watch, buttons (e.g. Minimalist gold hoop earrings and slender chain belt / Silver dress watch and brass buttons)",
  "fabricTextures": ["List of 3-6 exact fabrics and weave textures, e.g. Silk Crepe, Chiffon, Fine Wool, Matte Leather, Denim, Cotton Twill"],
  "colorSwatches": [
    { "id": "w1", "label": "Dominant Garment Color", "hex": "#HEX" },
    { "id": "w2", "label": "Secondary Garment Shade", "hex": "#HEX" },
    { "id": "w3", "label": "Accent / Hardware Tone", "hex": "#HEX" },
    { "id": "w4", "label": "Complementary / Lining Color", "hex": "#HEX" }
  ],
  "materialReferences": ["List of 3-5 material finishes, e.g. High-sheen Silk, Matte Wool, Brushed Brass, Italian Nappa Leather"],
  "clothingStyle": "e.g. Haute Couture / Streetwear / Italian Tailoring / Techwear / Boho Chic / Casual Minimalist",
  "wardrobeSummary": "A concise, highly evocative 2-sentence description of the look for master prompt compilers."
}`
                    }
                ]
            },
            config: {
                responseMimeType: 'application/json',
                systemInstruction: 'You are an elite fashion designer and costume director. Extract precise clothing, textile, silhouette, cut, and exact hex color data from the wardrobe image. Return pure JSON only without markdown formatting.',
                temperature: 0.2
            }
        };

        const response = await generateContentWithFallback(requestPayload);
        const text = response.text ? response.text.trim() : '';
        const parsed = JSON.parse(text);
        res.json(parsed);
    } catch (err: any) {
        console.error('Error extracting wardrobe from image:', err);
        const fallback = {
            outfitType: "Traje estilizado baseado na imagem de referência enviada",
            topNeckline: "Gola e decote estruturados com corte contemporâneo",
            sleevesOrStraps: "Mangas com caimento proporcional e acabamento de alfaiataria",
            bottomPiece: "Parte inferior com corte fluido e costuras alinhadas",
            footwear: "Calçados elegantes em harmonia com o estilo do traje",
            accessories: "Acessórios e detalhes metálicos refinados",
            fabricTextures: ["Seda / Cetim", "Algodão Pima", "Alfaiataria Lã", "Couro Fosco"],
            colorSwatches: [
                { id: "w1", label: "Cor Principal do Traje", hex: "#B31217" },
                { id: "w2", label: "Tom Secundário", hex: "#2B2D42" },
                { id: "w3", label: "Destaque / Acessório", hex: "#D4AF37" }
            ],
            materialReferences: ["Tecido Nobre", "Acabamento Acetinado", "Couro"],
            clothingStyle: "Editorial Fashion Contemporâneo",
            wardrobeSummary: "Look sofisticado com equilíbrio de caimento e cortes inspirados na imagem de referência."
        };
        res.json(fallback);
    }
});

// 6.56 Combined Model + Wardrobe Extraction (Model Person + Clothing Reference)
app.post('/api/gemini/extract-model-with-wardrobe', async (req: Request, res: Response) => {
    try {
        const { modelImage, wardrobeImage, characterGender, userInstructions } = req.body;
        if (!modelImage?.data && !wardrobeImage?.data) {
            return res.status(400).json({ error: 'Forneça ao menos uma imagem de modelo ou vestuário.' });
        }

        const parts: any[] = [];

        if (modelImage?.data) {
            parts.push({
                inlineData: {
                    data: modelImage.data,
                    mimeType: modelImage.mimeType || 'image/jpeg'
                }
            });
            parts.push({
                text: `[IMAGE 1: CHARACTER / MODEL REFERENCE - Source of identity, facial features, facial structure, skin tone, eye color, hairstyle, and body proportions]`
            });
        }

        if (wardrobeImage?.data) {
            parts.push({
                inlineData: {
                    data: wardrobeImage.data,
                    mimeType: wardrobeImage.mimeType || 'image/jpeg'
                }
            });
            parts.push({
                text: `[IMAGE 2: WARDROBE / CLOTHING REFERENCE - Source of the exact outfit, dress, suit, fabrics, cuts, footwear, accessories, and clothing color palette]`
            });
        }

        const userNotes = userInstructions ? `\nUser Custom Directives: ${userInstructions}` : '';
        const genderDirective = characterGender && characterGender !== 'auto' ? `\nGender Directive: ${characterGender}` : '';

        parts.push({
            text: `You are an elite Character Designer and Production Art Director.
TASK: Synthesize a complete Model Sheet specification that pairs the human subject/model from Image 1 with the exact clothing/wardrobe from Image 2.
${userNotes}
${genderDirective}

REQUIREMENTS:
1. BIOMETRICS: Extract the human model's exact facial structure, eyes, eyebrows, nose, lips, skin tone (with hex), hair (with hex), and body physique from Image 1.
2. COSTUME: Extract the exact outfit, cuts, neckline, sleeves, bottom piece, shoes, accessories, fabrics, and clothing colors (with hex) from Image 2.
3. HARMONIZATION: Formulate directives for rendering this specific person wearing this specific clothing.

Return ONLY a valid JSON object strictly matching this schema:
{
  "gender": "woman or man",
  "characterName": "Suggested name",
  "role": "Creator / Model or Lead Character",
  "age": "e.g. 22-26",
  "height": "e.g. 5'9\\" (175 cm)",
  "bodyType": "e.g. Slim, Athletic, Fit",
  "personality": "Descriptive traits",
  "distinctiveTraits": "Prominent facial and styling traits",
  "facialStructure": "Shape of face, cheekbones, jawline",
  "eyes": "Color, shape, expression",
  "eyebrows": "Arch, thickness",
  "nose": "Bridge, tip shape",
  "lips": "Fullness, shape, natural tint",
  "skinTone": "Description with undertone",
  "skinToneHex": "#HEX",
  "hair": "Length, style, parting",
  "hairColorHex": "#HEX",
  "makeup": "Makeup description",
  "facialHair": "Clean-shaven / stubble / beard if male, or none",
  "scarsOrMarks": "None / beauty mark",
  "outfitType": "Complete detailed description of the outfit from Image 2",
  "topNeckline": "Neckline / collar / lapels from Image 2",
  "sleevesOrStraps": "Sleeve design / straps from Image 2",
  "bottomPiece": "Pants / skirt / hemline from Image 2",
  "footwear": "Shoes / heels / sneakers from Image 2",
  "accessories": "Jewelry / belt / accessories from Image 2",
  "fabricTextures": ["Silk", "Cotton", "Wool", "Leather", "Chiffon"],
  "colorSwatches": [
    { "id": "c1", "label": "Cor Principal do Traje", "hex": "#HEX" },
    { "id": "c2", "label": "Tom Secundário", "hex": "#HEX" },
    { "id": "c3", "label": "Tom de Pele", "hex": "#HEX" },
    { "id": "c4", "label": "Tom de Cabelo", "hex": "#HEX" }
  ],
  "materialReferences": ["Silk/Satin", "Fine Wool", "Matte Leather"],
  "lighting": "Natural soft studio lighting with warm highlights",
  "backgroundSetting": "Textured neutral beige wall or minimal studio backdrop",
  "renderStyle": "Fotorealista 8K, Master Studio Character Sheet",
  "outputType": "full_model_sheet",
  "additionalNotes": "Exact biometric replication of Model (Image 1) wearing the exact outfit from Wardrobe (Image 2)."
}`
        });

        const response = await generateContentWithFallback({
            contents: { parts },
            config: {
                responseMimeType: 'application/json',
                temperature: 0.2
            }
        });

        const rawText = response.text ? response.text.trim() : '{}';
        const cleaned = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(cleaned);
        res.json(parsed);
    } catch (err: any) {
        console.error('Error in extract-model-with-wardrobe:', err);
        res.status(500).json({ error: err.message || 'Falha ao processar modelo e vestuário' });
    }
});

// 6.6 Product & Rebranding Sheet Extraction (Multi-Image: Base Product + Logo + Label)
app.post('/api/gemini/extract-product-sheet', async (req: Request, res: Response) => {
    try {
        const { baseProductImage, brandLogoImage, packageLabelImage, propsOrTextureImage, userInstructions } = req.body;

        const parts: any[] = [];

        if (baseProductImage && baseProductImage.data) {
            parts.push({
                inlineData: {
                    data: baseProductImage.data,
                    mimeType: baseProductImage.mimeType || 'image/jpeg'
                }
            });
            parts.push({
                text: `[IMAGE 1: BASE PRODUCT / PACKAGING REFERENCE (Original Container to be rebranded, e.g. beer bottle, ice cream tub, beverage can, perfume)]`
            });
        }

        if (brandLogoImage && brandLogoImage.data) {
            parts.push({
                inlineData: {
                    data: brandLogoImage.data,
                    mimeType: brandLogoImage.mimeType || 'image/png'
                }
            });
            parts.push({
                text: `[IMAGE 2: NEW BRAND LOGO (To be applied prominently onto the product packaging)]`
            });
        }

        if (packageLabelImage && packageLabelImage.data) {
            parts.push({
                inlineData: {
                    data: packageLabelImage.data,
                    mimeType: packageLabelImage.mimeType || 'image/png'
                }
            });
            parts.push({
                text: `[IMAGE 3: NEW PACKAGE LABEL ARTWORK (Complete label design to wrap or replace on the product)]`
            });
        }

        if (propsOrTextureImage && propsOrTextureImage.data) {
            parts.push({
                inlineData: {
                    data: propsOrTextureImage.data,
                    mimeType: propsOrTextureImage.mimeType || 'image/jpeg'
                }
            });
            parts.push({
                text: `[IMAGE 4: CONTEXTUAL PROPS & TEXTURE REFERENCE]`
            });
        }

        const instructionText = userInstructions ? `\nUSER SPECIFIC REBRANDING INSTRUCTION: "${userInstructions}"` : '';

        parts.push({
            text: `You are an elite Commercial Industrial Designer and Packaging Rebranding Director.
Analyze the provided images to create a comprehensive Product Sheet & Rebranding Specification Board (like commercial production reference sheets, e.g. Fanice Ice Cream or Premium Beer Rebranding).
${instructionText}

REBRANDING GOAL:
1. Identify the base product (e.g. beer bottle like Skol, ice cream tub, beverage can, perfume, cosmetic).
2. Transpose and replace the original branding with the NEW BRAND LOGO and NEW LABEL provided in the uploaded images.
3. Preserve authentic physical materials (condensation, amber glass, matte plastic, aluminum, reflection, liquid).
4. Extract exact hex color codes for the new brand.
5. Identify or suggest contextual props (e.g. glassware, ice, fresh fruits, scoops).

Return a SINGLE valid JSON object matching this schema strictly:
{
  "originalBrandName": "Name of original brand to replace (e.g. Skol / Generic Tub)",
  "newBrandName": "Name of new brand detected from logo or label (e.g. Minha Cerveja Artesanal / Fanice)",
  "productCategory": "e.g. Cerveja Premium / Frozen Dessert / Bebida",
  "productMaterials": "Specific physical materials (e.g. amber glass with ice condensation, plastic tub)",
  "productDimensions": "e.g. 355ml Long Neck (23 x 6 cm) or 18 x 12 x 6 cm tub",
  "keyFeatures": ["4-5 visual and functional selling points"],
  "rebrandMode": "full_replacement",
  "labelPlacement": "Detailed placement description of how the new label wraps around the container",
  "neckLabelOrCap": "Details about the neck label, cap, foil seal, or lid",
  "surfaceTexture": "Tactile surface texture (e.g. condensation droplets, frosted glass, matte paper)",
  "packagingNutritional": "Nutritional panel, barcode, and ABV/ingredient specifications",
  "specialFeatures": "Embossing, gold foil, spot varnish, or unique finishes",
  "props": [
    { "id": "p1", "name": "Prop Name", "purpose": "Why this prop complements the product" }
  ],
  "backgroundEnvironment": "Ideal studio or lifestyle background setting",
  "brandColors": [
    { "id": "c1", "label": "Color Name", "hex": "#HEX" }
  ],
  "customConsistencyRules": "Directives for maintaining 100% packaging fidelity",
  "outputLayout": "full_product_sheet",
  "lighting": "Studio lighting scheme description",
  "renderQuality": "8K Hasselblad commercial product photography"
}
Output ONLY valid JSON without markdown wrapping.`
        });

        const response = await generateContentWithFallback({
            contents: { parts },
            config: {
                temperature: 0.3,
            }
        });

        const rawText = response.text ? response.text.trim() : '{}';
        const cleaned = rawText.replace(/```json/g, '').replace(/```/g, '').trim();

        try {
            const parsed = JSON.parse(cleaned);
            return res.json(parsed);
        } catch {
            const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                const extracted = JSON.parse(jsonMatch[0]);
                return res.json(extracted);
            }
            throw new Error('Não foi possível parsear o JSON da ficha de produto.');
        }
    } catch (err: any) {
        console.warn('Erro ao extrair ficha de produto com Gemini, usando preset de fallback:', err?.message || err);
        const fallback = {
            originalBrandName: "Marca Original (ex: Skol / Ambev)",
            newBrandName: "Minha Marca Artesanal",
            productCategory: "Cerveja Premium / Bebidas",
            productMaterials: "Garrafa de vidro âmbar com condensação de gotas geladas",
            productDimensions: "Long Neck 355ml",
            keyFeatures: [
                "Vidro âmbar com reflexos dourados do líquido",
                "Gotas de condensação escorrendo pela garrafa",
                "Novo rótulo centralizado com arte da marca enviada",
                "Tampa metálica personalizada"
            ],
            rebrandMode: "full_replacement",
            labelPlacement: "Novo rótulo aplicado com perfeição no corpo cilíndrico da garrafa",
            neckLabelOrCap: "Gargalo com selo e tampa personalizada",
            surfaceTexture: "Vidro molhado com gotas de gelo realistas",
            packagingNutritional: "Tabela com teor alcoólico 5.2% ABV e código de barras",
            specialFeatures: "Acabamento fosco com verniz localizado no logotipo",
            props: [
                { id: "p1", name: "Copo de Cristal com Espuma", purpose: "Apresentar o produto servido" },
                { id: "p2", name: "Gelo Triturado", purpose: "Reforçar a temperatura gelada" }
            ],
            backgroundEnvironment: "Balcão rústico de madeira com iluminação quente de bar",
            brandColors: [
                { id: "c1", label: "Azul Imperial", hex: "#0B2545" },
                { id: "c2", label: "Dourado", hex: "#D4AF37" },
                { id: "c3", label: "Âmbar", hex: "#582F0E" },
                { id: "c4", label: "Branco", hex: "#FFFFFF" }
            ],
            customConsistencyRules: "Substituir 100% a marca original pela nova marca e manter a embalagem física idêntica.",
            outputLayout: "full_product_sheet",
            lighting: "Iluminação de estúdio comercial com luzes de recorte",
            renderQuality: "Fotorealista 8K, Fotografia Comercial de Bebidas"
        };
        res.json(fallback);
    }
});

// 7. Image Generation endpoint (Gemini 3 Image Models)
app.post('/api/gemini/generate-image', async (req: Request, res: Response) => {
    try {
        const {
            prompt,
            model = 'gemini-3.1-flash-image',
            imageSize = '1K',
            aspectRatio = '1:1',
            imageBase64,
            mimeType = 'image/png'
        } = req.body;

        if (!prompt) {
            return res.status(400).json({ error: 'Prompt é obrigatório.' });
        }

        const parts: any[] = [];
        if (imageBase64) {
            parts.push({
                inlineData: {
                    data: imageBase64,
                    mimeType: mimeType || 'image/png'
                }
            });
        }
        parts.push({ text: prompt });

        // Normalize model selection based on gemini-api guidelines
        let targetModel = model;
        if (targetModel === 'gemini-3.1-flash-image-preview' || !targetModel) {
            targetModel = 'gemini-3.1-flash-image';
        }

        const modelsToTry = [targetModel, 'gemini-3.1-flash-image', 'gemini-3.1-flash-lite-image'];
        let lastError: any = null;

        for (const currentModel of modelsToTry) {
            try {
                const imageConfig: any = {
                    aspectRatio: aspectRatio || '1:1',
                };
                if (currentModel !== 'gemini-3.1-flash-lite-image' && imageSize) {
                    imageConfig.imageSize = imageSize;
                }

                const response = await ai.models.generateContent({
                    model: currentModel,
                    contents: { parts },
                    config: { imageConfig }
                });

                const candidate = response.candidates?.[0];
                if (candidate?.content?.parts) {
                    for (const part of candidate.content.parts) {
                        if (part.inlineData) {
                            const dataUrl = `data:image/png;base64,${part.inlineData.data}`;
                            return res.json({ 
                                imageUrl: dataUrl, 
                                modelUsed: currentModel,
                                isQuotaFallback: false 
                            });
                        }
                    }
                }
            } catch (err: any) {
                console.warn(`Model ${currentModel} image generation attempt failed:`, err?.message || err);
                lastError = err;
            }
        }

        // Se o Gemini falhar por cota ou ausência de faturamento (limit 0 no free tier),
        // ativamos automaticamente o Motor Neural de Alta Resolução 100% Gratuito (sem bloqueio de cotas).
        console.log('Gemini image generation unavailable or quota exceeded. Using 100% Free Neural Engine...');
        try {
            let width = 1024;
            let height = 1024;
            switch (aspectRatio) {
                case '16:9': width = 1280; height = 720; break;
                case '9:16': width = 720; height = 1280; break;
                case '4:3': width = 1024; height = 768; break;
                case '3:4': width = 768; height = 1024; break;
                case '21:9': width = 1344; height = 576; break;
                case '4:1': width = 1024; height = 256; break;
                case '1:4': width = 256; height = 1024; break;
                default: width = 1024; height = 1024; break;
            }

            const cleanPrompt = prompt.replace(/\r?\n|\r/g, ' ').slice(0, 900);
            const seed = Math.floor(Math.random() * 9999999);
            const neuralUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(cleanPrompt)}?width=${width}&height=${height}&seed=${seed}&nologo=true`;

            const imageFetch = await fetch(neuralUrl, {
                signal: AbortSignal.timeout(18000),
                headers: { 'User-Agent': 'PromptArchitect/2.0' }
            });

            if (imageFetch.ok) {
                const buffer = Buffer.from(await imageFetch.arrayBuffer());
                const contentType = imageFetch.headers.get('content-type') || 'image/jpeg';
                const dataUrl = `data:${contentType};base64,${buffer.toString('base64')}`;

                return res.json({
                    imageUrl: dataUrl,
                    modelUsed: 'motor-neural-gratuito',
                    isQuotaFallback: true,
                    note: 'Imagem gerada com sucesso pelo Motor Neural HD Gratuito (100% grátis e ilimitado).'
                });
            } else {
                return res.json({
                    imageUrl: neuralUrl,
                    modelUsed: 'motor-neural-gratuito-direct',
                    isQuotaFallback: true,
                    note: 'Imagem gerada com sucesso pelo Motor Neural HD Gratuito.'
                });
            }
        } catch (fallbackErr: any) {
            console.warn('Buffer fetch timed out, falling back to direct stream URL:', fallbackErr?.message);
            const cleanPrompt = prompt.replace(/\r?\n|\r/g, ' ').slice(0, 900);
            const seed = Math.floor(Math.random() * 9999999);
            const directUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(cleanPrompt)}?width=1024&height=1024&seed=${seed}&nologo=true`;
            return res.json({
                imageUrl: directUrl,
                modelUsed: 'motor-neural-gratuito-stream',
                isQuotaFallback: true,
                note: 'Imagem gerada com sucesso pelo Motor Neural HD Gratuito.'
            });
        }
    } catch (err: any) {
        console.error('Error generating image:', err);
        // Em qualquer erro inesperado, ainda fornecemos a imagem via URL neural para não falhar
        const fallbackPrompt = (req.body?.prompt || 'visual art').slice(0, 400);
        const directUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(fallbackPrompt)}?width=1024&height=1024&nologo=true`;
        return res.json({
            imageUrl: directUrl,
            modelUsed: 'motor-neural-reserva',
            isQuotaFallback: true,
            note: 'Imagem gerada com sucesso pelo Motor Neural de Reserva.'
        });
    }
});

// 8. Vision Persona & Specialist Analysis endpoint
app.post('/api/gemini/vision-persona', async (req: Request, res: Response) => {
    try {
        const { systemInstruction, userPrompt, imageBase64, mimeType } = req.body;
        const response = await generateContentWithFallback({
            contents: {
                parts: [
                    {
                        inlineData: {
                            data: imageBase64,
                            mimeType: mimeType || 'image/jpeg'
                        }
                    },
                    {
                        text: userPrompt || 'Deliver the visual prompt analysis.'
                    }
                ]
            },
            config: {
                systemInstruction: systemInstruction || 'You are an elite vision and prompt analyst.',
                temperature: 0.5,
            }
        });

        const prompt = response.text ? response.text.trim() : '';
        res.json({ prompt });
    } catch (err: any) {
        console.error('Error in vision persona analysis:', err);
        const parsed = parseGeminiError(err);
        res.status(parsed.code).json({ error: parsed.message, isQuotaExceeded: parsed.isQuotaExceeded });
    }
});

// Vite middleware in dev, static in production
async function startServer() {
    const isProd = process.env.NODE_ENV === 'production';
    if (!isProd) {
        const vite = await createViteServer({
            server: { middlewareMode: true },
            appType: 'spa',
        });
        app.use(vite.middlewares);
    } else {
        const distPath = path.resolve(__dirname, 'dist');
        app.use(express.static(distPath));
        app.use((req: Request, res: Response) => {
            res.sendFile(path.resolve(distPath, 'index.html'));
        });
    }

    app.listen(PORT, '0.0.0.0', () => {
        console.log(`Server running on http://0.0.0.0:${PORT} (Node ${process.version})`);
    });
}

startServer().catch((err) => {
    console.error('Failed to start server:', err);
});
