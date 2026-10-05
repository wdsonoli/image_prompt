import { PromptSettings, BackgroundDecomposition, ElementDecomposition, PersonDecomposition, SearchGroundingData } from "../types";

export interface GroundedPromptResult {
    prompt: string;
    grounding: SearchGroundingData;
}

async function fileToBase64Data(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            const result = reader.result;
            if (typeof result !== 'string') return reject(new Error("Falha ao ler arquivo."));
            const base64String = result.split(',')[1];
            resolve(base64String);
        };
        reader.onerror = () => reject(new Error("Falha ao ler arquivo."));
        reader.readAsDataURL(file);
    });
}

/**
 * Generates an image-to-prompt reconstruction via server-side Gemini 3.8 Flash.
 */
export const generateGeminiPrompt = async (
    file: File, 
    settings: PromptSettings,
    preProcessedData?: { base64: string, mimeType: string }
): Promise<string> => {
    let base64Data: string;
    let mimeType: string;

    if (preProcessedData) {
        base64Data = preProcessedData.base64;
        mimeType = preProcessedData.mimeType;
    } else {
        base64Data = await fileToBase64Data(file);
        mimeType = file.type || 'image/png';
    }

    try {
        const res = await fetch('/api/gemini/prompt', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                imageBase64: base64Data,
                mimeType,
                settings
            })
        });

        if (!res.ok) {
            const errorData = await res.json().catch(() => ({ error: 'Erro desconhecido no servidor' }));
            throw new Error(errorData.error || `Erro HTTP ${res.status}`);
        }

        const data = await res.json();
        if (!data.prompt) throw new Error("Resposta vazia da IA.");
        return data.prompt.trim();
    } catch (error: any) {
        console.error("Gemini API Error:", error);
        throw error;
    }
};

/**
 * Generates an up-to-date visual prompt using Search Grounding on gemini-3.8-flash.
 */
export const generateGroundedGeminiPrompt = async (
    file: File,
    settings: PromptSettings,
    preProcessedData?: { base64: string, mimeType: string }
): Promise<GroundedPromptResult> => {
    let base64Data: string;
    let mimeType: string;

    if (preProcessedData) {
        base64Data = preProcessedData.base64;
        mimeType = preProcessedData.mimeType;
    } else {
        base64Data = await fileToBase64Data(file);
        mimeType = file.type || 'image/png';
    }

    try {
        const res = await fetch('/api/gemini/grounded-prompt', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                imageBase64: base64Data,
                mimeType,
                settings
            })
        });

        if (!res.ok) {
            const errorData = await res.json().catch(() => ({ error: 'Erro na busca' }));
            throw new Error(errorData.error || `Erro HTTP ${res.status}`);
        }

        const data = await res.json();
        return {
            prompt: data.prompt || '',
            grounding: data.grounding || { queries: [], sources: [], text: data.prompt }
        };
    } catch (err: any) {
        console.error("Erro na busca de prompt com Grounding:", err);
        throw err;
    }
};

/**
 * Enriches any existing prompt with live Google Search data.
 */
export const enrichPromptWithSearchGrounding = async (
    prompt: string,
    targetPlatform: string = 'midjourney'
): Promise<GroundedPromptResult> => {
    try {
        const res = await fetch('/api/gemini/enrich-search', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                prompt,
                targetPlatform
            })
        });

        if (!res.ok) {
            const errorData = await res.json().catch(() => ({ error: 'Erro ao enriquecer prompt' }));
            throw new Error(errorData.error || `Erro HTTP ${res.status}`);
        }

        const data = await res.json();
        return {
            prompt: data.prompt || prompt,
            grounding: data.grounding || { queries: [], sources: [], text: data.prompt }
        };
    } catch (err: any) {
        console.error("Erro ao enriquecer prompt:", err);
        throw err;
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
    let base64Data: string;
    let mimeType: string;

    if (preProcessedData) {
        base64Data = preProcessedData.base64;
        mimeType = preProcessedData.mimeType;
    } else {
        base64Data = await fileToBase64Data(file);
        mimeType = file.type || 'image/png';
    }

    try {
        const res = await fetch('/api/gemini/extract-background', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                imageBase64: base64Data,
                mimeType,
                settings
            })
        });

        if (!res.ok) {
            throw new Error(`HTTP ${res.status}`);
        }

        const data = await res.json();
        return {
            settingDescription: data.settingDescription || "Cenário de fundo identificado.",
            architecturalElements: Array.isArray(data.architecturalElements) ? data.architecturalElements : [],
            propsAndObjects: Array.isArray(data.propsAndObjects) ? data.propsAndObjects : [],
            lightingAndAtmosphere: data.lightingAndAtmosphere || "Iluminação ambiente balanceada.",
            dominantBackgroundColors: Array.isArray(data.dominantBackgroundColors) ? data.dominantBackgroundColors : [],
            isolatedPrompt: data.isolatedPrompt || "Pristine empty background scene without subject."
        };
    } catch (err: any) {
        console.warn("Fallback local para extração de background:", err?.message || err);
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

/**
 * Performs structured decomposition and extraction of individual visual elements/objects from the image.
 */
export const extractElementDecomposition = async (
    file: File,
    settings: PromptSettings,
    preProcessedData?: { base64: string, mimeType: string }
): Promise<ElementDecomposition> => {
    let base64Data: string;
    let mimeType: string;

    if (preProcessedData) {
        base64Data = preProcessedData.base64;
        mimeType = preProcessedData.mimeType;
    } else {
        base64Data = await fileToBase64Data(file);
        mimeType = file.type || 'image/png';
    }

    try {
        const res = await fetch('/api/gemini/extract-element', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                imageBase64: base64Data,
                mimeType,
                settings
            })
        });

        if (!res.ok) {
            throw new Error(`HTTP ${res.status}`);
        }

        const data = await res.json();
        return {
            mainSubject: data.mainSubject || "Elemento visual identificado",
            category: data.category || "Objeto / Produto",
            elements: Array.isArray(data.elements) && data.elements.length > 0 ? data.elements.map((el: any) => ({
                name: el.name || "Elemento",
                category: el.category || "Componente",
                description: el.description || "",
                materialsAndTextures: el.materialsAndTextures || "Materiais e texturas originais",
                dominantColors: Array.isArray(el.dominantColors) ? el.dominantColors : ["#3b82f6"],
                isolatedPrompt: el.isolatedPrompt || "Isolated element on clean studio background"
            })) : [
                {
                    name: data.mainSubject || "Elemento Principal",
                    category: data.category || "Sujeito Principal",
                    description: "Elemento central isolado da cena.",
                    materialsAndTextures: "Superfície e acabamento originais com alta resolução",
                    dominantColors: ["#1e293b", "#3b82f6", "#f8fafc"],
                    isolatedPrompt: data.isolatedMasterPrompt || `Isolated subject of ${settings.basePrompt || 'the image subject'}, clean composition, studio lighting, crisp edges, 8k resolution, photorealistic`
                }
            ],
            lightingAndReflections: data.lightingAndReflections || "Iluminação de estúdio com reflexos preservados.",
            silhouetteAndEdges: data.silhouetteAndEdges || "Bordas nítidas e contorno recortado com alta definição.",
            isolatedMasterPrompt: data.isolatedMasterPrompt || "Master isolated subject on studio background."
        };
    } catch (err: any) {
        console.warn("Fallback local para extração de elemento:", err?.message || err);
        return {
            mainSubject: settings.basePrompt || "Elemento principal da imagem",
            category: "Objeto / Sujeito",
            elements: [
                {
                    name: "Elemento Central",
                    category: "Sujeito Principal",
                    description: "Elemento de destaque isolado da cena.",
                    materialsAndTextures: "Superfície e acabamento originais com alta resolução",
                    dominantColors: ["#1e293b", "#3b82f6", "#f8fafc"],
                    isolatedPrompt: `Master isolated element of ${settings.basePrompt || 'the image subject'}, clean isolated composition, pristine studio lighting, crisp edges, 8k resolution, photorealistic`
                }
            ],
            lightingAndReflections: "Iluminação de estúdio balanceada com destaques suaves.",
            silhouetteAndEdges: "Recorte nítido com preservação total de contornos.",
            isolatedMasterPrompt: `Clean isolated subject of ${settings.basePrompt || 'the focal element'}, studio lighting, pure neutral background, sharp silhouette, photorealistic`
        };
    }
};

/**
 * Performs structured decomposition and extraction of a person/human subject from the image with 1:1 fidelity.
 */
export const extractPersonDecomposition = async (
    file: File,
    settings: PromptSettings,
    preProcessedData?: { base64: string, mimeType: string }
): Promise<PersonDecomposition> => {
    let base64Data: string;
    let mimeType: string;

    if (preProcessedData) {
        base64Data = preProcessedData.base64;
        mimeType = preProcessedData.mimeType;
    } else {
        base64Data = await fileToBase64Data(file);
        mimeType = file.type || 'image/png';
    }

    try {
        const res = await fetch('/api/gemini/extract-person', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                imageBase64: base64Data,
                mimeType,
                settings
            })
        });

        if (!res.ok) {
            throw new Error(`HTTP ${res.status}`);
        }

        const data = await res.json() as PersonDecomposition;
        return data;
    } catch (err: any) {
        console.warn("Fallback local para extração de pessoa:", err?.message || err);
        return {
            mainSubject: "Pessoa da imagem de referência",
            genderAndAge: "Indivíduo adulto",
            ethnicityAndSkinTone: "Tom de pele natural conforme imagem de referência",
            facialFeatures: "Traços faciais, formato dos olhos, expressão e olhar idênticos à referência",
            hairStyleAndColor: "Penteado, cor e textura de cabelo conforme a imagem de referência",
            clothingAndFabric: "Vestuário, cortes e tecidos conforme observados na imagem",
            accessoriesAndDetails: ["Acessórios observados na referência"],
            poseAndBodyLanguage: "Postura e enquadramento corporais idênticos à referência",
            lightingOnSubject: "Iluminação de estúdio natural e suave sobre o sujeito",
            isolatedPersonPrompt: `Portrait of the person from the reference image, matching exact facial features, expression, hairstyle, wardrobe, and pose, 8k resolution, photorealistic, ${settings.style} style`
        };
    }
};
