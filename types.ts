
export interface ColorAnalysis {
    dominantColors: string[];
    paletteType: 'warm' | 'cool' | 'vibrant' | 'dark' | 'balanced';
}

export interface ImageStats {
    width: number;
    height: number;
    aspectRatio: string;
}

export interface AnalysisResult {
    colors: ColorAnalysis;
    brightness: 'high' | 'medium' | 'low';
    saturation: 'high' | 'medium' | 'low';
    contrast: 'high' | 'medium' | 'low';
    composition: 'landscape' | 'portrait' | 'square' | 'standard';
    sharpness: 'crisp' | 'soft' | 'blurred';
    depthOfField: 'shallow' | 'deep' | 'balanced';
    contourComplexity: 'high' | 'medium' | 'low';
    stats: ImageStats;
    timestamp: number;
}

export interface BackgroundDecomposition {
    settingDescription: string;
    architecturalElements: string[];
    propsAndObjects: string[];
    lightingAndAtmosphere: string;
    dominantBackgroundColors: string[];
    isolatedPrompt: string;
}

export interface UploadedImage {
    id: string;
    file: File;
    previewUrl: string;
    name: string;
    analysis: AnalysisResult | null;
    backgroundExtraction?: BackgroundDecomposition | null;
    base64Data?: string;
    mimeType?: string;
}

export type TargetPlatform = 'midjourney' | 'dalle' | 'freepik' | 'stable_diffusion' | 'google_imagefx' | 'whisk' | 'chatgpt' | 'deepseek' | 'flux' | 'leonardo' | 'adobe_firefly';

export interface PromptSettings {
    basePrompt: string;
    negativePrompt: string;
    style: string;
    detailLevel: number | 'auto';
    lighting: string;
    composition: string;
    cameraAngle: string;
    productPosition: string;
    extraParams: string;
    aspectRatio: string;
    removeBackground: boolean;
    targetPlatform: TargetPlatform;
    mode: 'general' | 'mockup' | 'extract_background';
    activeTemplateId?: string;
    shadowOpacity: number;
    material: string;
    environment: string;
    keepColors: boolean;
    is3dLogo: boolean;
}

export interface HistoryItem {
    id: string;
    prompt: string;
    generatedImageUrl: string;
    baseImage: {
        base64Data: string;
        mimeType: string;
        name: string;
    };
    settings: PromptSettings;
    timestamp: number;
}


export const DETAIL_LEVEL_MAP: Record<number, { label: string; keywords: string[]; platformBoosts: Partial<Record<TargetPlatform, string>> }> = {
    1: { 
        label: "Minimalist", 
        keywords: ["simple", "minimalist", "clean lines", "uncluttered", "abstract forms", "reductive aesthetic", "low complexity", "flat color"],
        platformBoosts: { midjourney: "--stylize 50 --v 6.1", stable_diffusion: "(minimalist:1.4), simple shapes, flat design", chatgpt: "Generate a minimalist and starkly simple description.", flux: "clean minimalist aesthetic", leonardo: "minimalist style, simple" }
    },
    2: { 
        label: "Basic", 
        keywords: ["clear", "plain", "straightforward", "unadorned", "simple lighting", "defined shapes"],
        platformBoosts: { midjourney: "--stylize 100", stable_diffusion: "simple background, clear focus", dalle: "a clear and basic depiction", adobe_firefly: "clean simple composition" }
    },
    3: { 
        label: "Standard", 
        keywords: ["standard detail", "balanced", "natural textures", "realistic proportions", "standard resolution", "accurate scale"],
        platformBoosts: { midjourney: "--stylize 250", freepik: "standard stock photo quality", deepseek: "balanced visual density", flux: "natural detail" }
    },
    4: { 
        label: "Clear", 
        keywords: ["well-defined", "sharp", "recognizable textures", "crisp edges", "coherent lighting", "high contrast lines"],
        platformBoosts: { google_imagefx: "sharp, clear, well-defined", stable_diffusion: "sharp edges, high quality, crisp", leonardo: "clear focus, sharp detail" }
    },
    5: { 
        label: "Detailed", 
        keywords: ["detailed", "textured", "rich", "intentional accents", "layered depth", "professional finish", "visible grains"],
        platformBoosts: { stable_diffusion: "(highly detailed:1.1)", freepik: "sharp details, professional photography", midjourney: "--stylize 400", flux: "highly detailed render, sharp textures" }
    },
    6: { 
        label: "High Detail", 
        keywords: ["intricate", "fine textures", "elaborate", "ornate elements", "advanced shaders", "volumetric depth", "surface roughness"],
        platformBoosts: { midjourney: "--stylize 500", dalle: "intricate details and textures", deepseek: "high fidelity rendering", leonardo: "high fidelity, intricate, polished" }
    },
    7: { 
        label: "Hyper Detail", 
        keywords: ["ultra detailed", "hyperrealistic", "8k resolution", "micro-textures", "pbr materials", "ray traced reflections", "photographic precision"],
        platformBoosts: { dalle: "extreme detail, 8k photographic", stable_diffusion: "(masterpiece:1.2), ultra-high definition, sharp focus", flux: "hyper-realistic textures, 8k, photorealistic", google_imagefx: "photorealistic, 8k resolution" }
    },
    8: { 
        label: "Epic", 
        keywords: ["masterpiece", "breathtaking", "complex patterns", "cinematic quality", "global illumination", "physically based rendering", "volumetric caustics"],
        platformBoosts: { midjourney: "--stylize 750 --quality 2", stable_diffusion: "(best quality:1.3), absurdres, masterpiece", freepik: "premium stock quality, commercial photography", adobe_firefly: "cinematic masterpiece lighting, epic scale" }
    },
    9: { 
        label: "Legendary", 
        keywords: ["hyper-intricate", "unreal engine 5 render", "ray tracing", "subsurface scattering", "anisotropic highlights", "nanite geometry", "octane render style"],
        platformBoosts: { midjourney: "--stylize 850", google_imagefx: "photorealistic masterpiece, cinematic lighting", stable_diffusion: "unreal engine 5, octane render, 8k, masterpiece", flux: "unreal engine 5 style, hyper-detailed, raytracing" }
    },
    10: { 
        label: "Omniscient", 
        keywords: ["sub-surface scattering", "macro photography quality", "infinitely detailed", "architectural photography precision", "visible molecular texture", "diffraction spikes", "volumetric caustics", "hyper-fidelity render", "quantum-level detail"],
        platformBoosts: { midjourney: "--stylize 1000 --v 6.1", stable_diffusion: "(masterpiece:1.5), (ultra-high-definition:1.2), extremely detailed CG, photorealistic", deepseek: "maximum visual density, total fidelity", flux: "extreme realistic textures, nanoscopic detail, flawless render", dalle: "astounding detail, every surface texture rendered with absolute precision" }
    }
};

export const STYLE_TEMPLATES: Record<string, string> = {
    blank: "plain background, solid color, minimalist, clean, no distractions",
    photorealistic: "photorealistic, 8K resolution, detailed texture, realistic lighting, sharp focus, professional photography",
    disney_pixar: "Disney Pixar style, 3D animation, high quality CGI render, vibrant colors, expressive facial features, cute stylized characters, cinematic lighting, masterpiece, Pixar movie aesthetic",
    digital_art: "digital art, vibrant colors, detailed, trending on ArtStation, fantasy art, concept art",
    ghibli: "studio ghibli style, anime, cel shaded, detailed background, hayao miyazaki style, vibrant colors, whimsical, clouds, hand drawn aesthetic",
    meme: "internet meme style, viral image aesthetic, humor, impact font style text overlay, funny, relatable, internet culture",
    claymation: "claymation, plasticine, stop motion, clay texture, handcrafted, soft lighting, aardman style",
    crochet: "crochet style, knitted wool texture, amigurumi, yarn details, soft lighting, macro photography, handmade feel",
    monochromatic: "monochromatic, single color palette, high contrast, artistic, dramatic, noir style, black and white or sepia",
    origami: "origami style, folded paper art, paper texture, geometric shapes, sharp creases, craft, 3d paper",
    pixel_art: "pixel art, 16-bit, retro game aesthetic, dithering, limited palette, sharp edges, sprite sheet style",
    pop_art: "pop art, andy warhol style, halftone dots, vibrant bold colors, comic book style, repeating patterns",
    steampunk: "steampunk aesthetic, gears, brass, copper, vitorian technology, steam engine details, mechanical, clockwork",
    cartoon: "cartoon style, 2d animation, flat colors, thick clean outlines, expressive characters, saturday morning cartoon",
    cyberpunk: "cyberpunk, neon lighting, futuristic, dystopian, rainy night, cinematic, high tech low life, blade runner aesthetic",
    oil_painting: "oil painting, textured brush strokes, canvas texture, rich colors, traditional art, masterpiece",
    watercolor: "watercolor painting, soft edges, translucent layers, paper texture, artistic, delicate, wet-on-wet",
    anime: "anime style, modern japanese animation, vibrant, detailed character design, manga illustration",
    fantasy: "fantasy art, epic, magical, detailed environment, ethereal, concept art, mystical, rpg style",
    minimalist: "minimalist, simple composition, clean lines, negative space, modern art, elegant, flat design",
    impressionism: "impressionism, visible brush strokes, emphasis on light, dreamy, artistic, painted, monet style",
    surrealism: "surrealism, dreamlike, impossible scenes, symbolic, artistic, imaginative, dali style",
    "3d_render": "3d render, unreal engine 5, octane render, ray tracing, highly detailed, cgsociety, 8k, cinema4d",
    vintage: "vintage photography, film grain, retro style, 1950s aesthetic, sepia tones, polaroid style, nostalgia",
    isometric: "isometric view, 3d, vector art, clean lines, detailed, diorama, colorful, orthographic projection",
    line_art: "line art, black and white, ink drawing, clean lines, minimalist, illustration, sketch",
    noir: "film noir, black and white, dramatic shadows, high contrast, cinematic, moody, mystery, detective style",
    sticker: "sticker art, thick white outline, vector, flat color, simple background, die-cut, vinyl sticker",
    low_poly: "low poly, geometric shapes, sharp edges, minimalist, 3d art, vibrant, polygon art",
    horror: "horror theme, dark, eerie, scary, nightmare fuel, gloomy, cinematic lighting, unsettling",
    pencil_sketch: "pencil sketch, graphite, charcoal, rough lines, shading, hand drawn, artistic sketch",
    architectural: "architectural photography, minimalist design, clean structural lines, urban aesthetic, modern building",
    editorial: "editorial fashion photography, high-end magazine style, artistic pose, sophisticated lighting",
    double_exposure: "double exposure art, surreal overlay, blended images, dreamlike artistic effect",
    synthwave: "synthwave aesthetic, 80s retro-futurism, grid sunset, purple and pink neon, nostalgic electronic vibes",
    ukiyo_e: "Ukiyo-e style, traditional Japanese woodblock print, bold outlines, flat colors, Edo period aesthetic",
    art_nouveau: "Art Nouveau style, Alphonse Mucha inspired, flowing organic lines, floral motifs, elegant, decorative borders",
    biomechanical: "biomechanical style, H.R. Giger inspired, organic meets mechanical, dark surrealism, intricate metallic textures",
    voxel_art: "voxel art, 3d pixel art, blocky cubic style, digital sandbox aesthetic, vibrant colors",
    stained_glass: "stained glass window style, leaded glass, translucent colors, vibrant light passing through, religious or mosaic aesthetic",
    holographic: "holographic aesthetic, iridescent shimmering colors, pearlescent glow, futuristic material, prismatic",
    knitted: "knitted texture, crochet amigurumi style, yarn fibers, macro photography of wool, handmade craft aesthetic",
    paper_cutout: "paper cutout art, layered paper, shadow box effect, 3d paper craft, simple shapes, vibrant colors",
    vaporwave: "vaporwave aesthetic, 80s retro-futurism, pink and teal palette, lo-fi, surreal palm trees and marble statues",
    blueprint: "architectural blueprint, technical drawing, cyanotype, white lines on blue background, detailed schematic",
    baroque: "baroque painting style, dramatic chiaroscuro, intense lighting, rich emotional depth, caravaggio style",
    charcoal_drawing: "charcoal drawing, rough texture, high contrast, smudge effects, artistic hand-drawn sketch",
    caricature: "caricature style, exaggerated features, humorous, colorful, hand-drawn illustration",
    graffiti: "graffiti art, street art style, spray paint textures, vibrant urban mural, tags and stencils",
    fresco: "fresco painting, ancient mural style, plaster texture, muted classical colors, renaissance aesthetic"
};
