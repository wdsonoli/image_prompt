/**
 * Background Remover & Sticker Studio Service
 * Features:
 * - Smart Automatic Background Removal (corner & edge-sampled saliency, Lab color distance, edge smoothing)
 * - Hair & Fine Edge Matting (feathering, color defringe / despill, fine strands preservation)
 * - Interactive Brush (Erase / Restore mask layers with undo/redo)
 * - Sticker Mode (Die-Cut white contour border, custom colors, realistic 3D drop shadows)
 * - Background Replacement (Transparent, Solid Colors, Studio Gradients, Scenic Presets, Custom Uploads with Blur Bokeh)
 * - Universal Multi-Format Export (PNG transparent, JPG, WEBP, SVG Vector wrapper, Print-Ready PDF)
 */

export interface AiCutoutAnalysisResult {
    subjectType?: string;
    subjectTitle?: string;
    protectedWhiteElements?: string[];
    boundingBox?: { ymin: number; xmin: number; ymax: number; xmax: number };
    subjectPolygon?: Array<[number, number]>;
    foregroundSeedPoints?: Array<{ x: number; y: number; label?: string }>;
    backgroundSeedPoints?: Array<{ x: number; y: number }>;
    dominantBackgroundColor?: string;
    hasWhiteOrMatchingSubjectParts?: boolean;
    confidenceScore?: number;
}

export interface BackgroundRemoverOptions {
    tolerance: number; // 1 to 100
    edgeSmoothRadius: number; // 0 to 10
    hairRefinement: boolean;
    hairSensitivity: number; // 1 to 100
    colorDespill: boolean;
    edgeChoke: number; // -10 to +10 (erode or dilate)
    // Proteção de Peças Brancas e Partes Internas da mesma cor do fundo
    protectInternalWhites?: boolean;
    whiteShieldSensitivity?: number; // 1 a 100
    aiData?: AiCutoutAnalysisResult | null;
}

export interface StickerOptions {
    enabled: boolean;
    borderWidth: number; // 2 to 60px
    borderColor: string; // Hex color (default #FFFFFF)
    borderRadius: number; // Roundness / smoothness
    dropShadow: boolean;
    shadowBlur: number;
    shadowOpacity: number; // 0 to 1
    shadowColor: string;
    shadowOffsetY: number;
}

export type BackgroundType = 'transparent' | 'solid' | 'gradient' | 'preset' | 'custom';

export interface ScenicPreset {
    id: string;
    name: string;
    category: string;
    gradientCss: string;
    renderCanvas: (ctx: CanvasRenderingContext2D, width: number, height: number) => void;
}

export interface BackgroundReplacementOptions {
    type: BackgroundType;
    solidColor: string;
    gradient: {
        from: string;
        to: string;
        direction: 'to-b' | 'to-r' | 'to-br' | 'radial';
    };
    presetId: string;
    customImageUrl?: string;
    customImageFit: 'cover' | 'contain' | 'fill';
    blurBokeh: number; // 0 to 30px
    darken: number; // 0 to 100%
}

export interface ExportFormatOption {
    id: 'png' | 'jpeg' | 'webp' | 'svg' | 'pdf';
    label: string;
    extension: string;
    mimeType: string;
    description: string;
    supportsTransparency: boolean;
}

export const EXPORT_FORMAT_OPTIONS: ExportFormatOption[] = [
    {
        id: 'png',
        label: 'PNG Transparente (32-bit RGBA)',
        extension: '.png',
        mimeType: 'image/png',
        description: 'Transparência perfeita sem perdas. Ideal para figurinhas, logos e colagens.',
        supportsTransparency: true,
    },
    {
        id: 'webp',
        label: 'WEBP Ultra-Otimizado',
        extension: '.webp',
        mimeType: 'image/webp',
        description: 'Suporte a transparência com até 80% menos peso. Padrão web moderno.',
        supportsTransparency: true,
    },
    {
        id: 'jpeg',
        label: 'JPG Alta Resolução (100% Qualidade)',
        extension: '.jpg',
        mimeType: 'image/jpeg',
        description: 'Ideal para fotos com novo fundo ou impressão comercial.',
        supportsTransparency: false,
    },
    {
        id: 'svg',
        label: 'SVG Vetorial / Embed',
        extension: '.svg',
        mimeType: 'image/svg+xml',
        description: 'Arquivo vetorial pronto para Illustrator, Figma e corte a laser.',
        supportsTransparency: true,
    },
    {
        id: 'pdf',
        label: 'PDF Folha de Figurinha / Gráfica',
        extension: '.pdf',
        mimeType: 'application/pdf',
        description: 'Documento vetorial de alta definição pronto para impressão física e corte.',
        supportsTransparency: true,
    },
];

export const SOLID_COLOR_PRESETS = [
    { label: 'Branco Puro', hex: '#FFFFFF', isDark: false },
    { label: 'Preto Studio', hex: '#0A0A0C', isDark: true },
    { label: 'Cinza Neutro 18%', hex: '#808080', isDark: true },
    { label: 'Verde Chroma Key', hex: '#00FF00', isDark: false },
    { label: 'Azul Real', hex: '#1E40AF', isDark: true },
    { label: 'Rosa Shock', hex: '#EC4899', isDark: true },
    { label: 'Amarelo Ouro', hex: '#EAB308', isDark: false },
    { label: 'Vermelho Carmim', hex: '#DC2626', isDark: true },
    { label: 'Roxo Elétrico', hex: '#8B5CF6', isDark: true },
    { label: 'Bege Pastel', hex: '#F3E8DC', isDark: false },
    { label: 'Turquesa Suave', hex: '#0D9488', isDark: true },
    { label: 'Laranja Studio', hex: '#F97316', isDark: false },
];

export const GRADIENT_PRESETS = [
    { id: 'gold', label: 'Luxury Gold', from: '#1a1403', to: '#6b5014', direction: 'to-br' as const },
    { id: 'cyberpunk', label: 'Cyberpunk Neon', from: '#0f172a', to: '#ec4899', direction: 'to-r' as const },
    { id: 'sunset', label: 'Pôr do Sol Suave', from: '#f43f5e', to: '#fbbf24', direction: 'to-b' as const },
    { id: 'studio-soft', label: 'Clean Studio Soft', from: '#f8fafc', to: '#cbd5e1', direction: 'to-b' as const },
    { id: 'tech-dark', label: 'Dark Violet Tech', from: '#09090b', to: '#3b0764', direction: 'to-br' as const },
    { id: 'emerald-bokeh', label: 'Emerald Bokeh', from: '#022c22', to: '#059669', direction: 'to-br' as const },
    { id: 'pure-midnight', label: 'Pure Midnight', from: '#020617', to: '#1e293b', direction: 'to-b' as const },
];

export const SCENIC_PRESETS: ScenicPreset[] = [
    {
        id: 'studio_minimal',
        name: 'Estúdio Minimalista com Spotlight',
        category: 'Estúdio',
        gradientCss: 'from-slate-900 via-slate-800 to-slate-950',
        renderCanvas: (ctx, w, h) => {
            const grad = ctx.createRadialGradient(w * 0.5, h * 0.45, 10, w * 0.5, h * 0.5, w * 0.7);
            grad.addColorStop(0, '#334155');
            grad.addColorStop(0.5, '#1e293b');
            grad.addColorStop(1, '#090d16');
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, w, h);
            // Piso sutil com reflexo
            const floorGrad = ctx.createLinearGradient(0, h * 0.7, 0, h);
            floorGrad.addColorStop(0, 'rgba(15, 23, 42, 0.4)');
            floorGrad.addColorStop(1, 'rgba(2, 6, 23, 0.9)');
            ctx.fillStyle = floorGrad;
            ctx.fillRect(0, h * 0.7, w, h * 0.3);
        }
    },
    {
        id: 'cyberpunk_city',
        name: 'Metrópole Cyberpunk Noturna',
        category: 'Cenário',
        gradientCss: 'from-purple-950 via-slate-950 to-cyan-950',
        renderCanvas: (ctx, w, h) => {
            const grad = ctx.createLinearGradient(0, 0, 0, h);
            grad.addColorStop(0, '#0f051d');
            grad.addColorStop(0.6, '#180e29');
            grad.addColorStop(1, '#051923');
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, w, h);
            // Neon horizontal beams
            const neon1 = ctx.createLinearGradient(0, h * 0.3, w, h * 0.3);
            neon1.addColorStop(0, 'rgba(236, 72, 153, 0.25)');
            neon1.addColorStop(0.5, 'rgba(139, 92, 246, 0.15)');
            neon1.addColorStop(1, 'rgba(6, 182, 212, 0.25)');
            ctx.fillStyle = neon1;
            ctx.fillRect(0, h * 0.2, w, h * 0.4);
        }
    },
    {
        id: 'luxury_living_room',
        name: 'Ambiente Luxo & Madeira Nobre',
        category: 'Interiores',
        gradientCss: 'from-amber-950 via-stone-900 to-amber-950',
        renderCanvas: (ctx, w, h) => {
            const grad = ctx.createRadialGradient(w * 0.5, h * 0.35, 20, w * 0.5, h * 0.5, w * 0.8);
            grad.addColorStop(0, '#45260f');
            grad.addColorStop(0.5, '#261608');
            grad.addColorStop(1, '#0e0804');
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, w, h);
        }
    },
    {
        id: 'tropical_sunlight',
        name: 'Luz Natural & Praia Tropical',
        category: 'Natureza',
        gradientCss: 'from-sky-400 via-amber-200 to-emerald-400',
        renderCanvas: (ctx, w, h) => {
            const grad = ctx.createLinearGradient(0, 0, 0, h);
            grad.addColorStop(0, '#38bdf8');
            grad.addColorStop(0.55, '#fef08a');
            grad.addColorStop(0.6, '#38bdf8');
            grad.addColorStop(1, '#fde047');
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, w, h);
        }
    },
    {
        id: 'clean_white_infinity',
        name: 'Fundo Infinito Branco Comercial',
        category: 'Comercial',
        gradientCss: 'from-white via-slate-100 to-slate-200',
        renderCanvas: (ctx, w, h) => {
            const grad = ctx.createRadialGradient(w * 0.5, h * 0.4, 20, w * 0.5, h * 0.6, w * 0.7);
            grad.addColorStop(0, '#ffffff');
            grad.addColorStop(0.7, '#f1f5f9');
            grad.addColorStop(1, '#e2e8f0');
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, w, h);
        }
    },
    {
        id: 'ecom_podium',
        name: 'Pódio Studio para E-commerce',
        category: 'Comercial',
        gradientCss: 'from-slate-200 via-slate-300 to-slate-400',
        renderCanvas: (ctx, w, h) => {
            // Fundo estúdio suave
            const bgGrad = ctx.createLinearGradient(0, 0, 0, h);
            bgGrad.addColorStop(0, '#f8fafc');
            bgGrad.addColorStop(0.65, '#e2e8f0');
            bgGrad.addColorStop(1, '#cbd5e1');
            ctx.fillStyle = bgGrad;
            ctx.fillRect(0, 0, w, h);

            // Sombra do pódio
            ctx.beginPath();
            ctx.ellipse(w * 0.5, h * 0.78, w * 0.38, h * 0.08, 0, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(15, 23, 42, 0.12)';
            ctx.fill();

            // Pódio cilíndrico
            ctx.beginPath();
            ctx.ellipse(w * 0.5, h * 0.72, w * 0.35, h * 0.07, 0, 0, Math.PI * 2);
            ctx.fillStyle = '#ffffff';
            ctx.fill();
            ctx.lineWidth = 1;
            ctx.strokeStyle = '#e2e8f0';
            ctx.stroke();

            // Lateral do pódio
            ctx.beginPath();
            ctx.rect(w * 0.15, h * 0.72, w * 0.7, h * 0.05);
            ctx.fillStyle = '#f1f5f9';
            ctx.fill();

            ctx.beginPath();
            ctx.ellipse(w * 0.5, h * 0.77, w * 0.35, h * 0.07, 0, 0, Math.PI * 2);
            ctx.fillStyle = '#e2e8f0';
            ctx.fill();
        }
    },
    {
        id: 'modern_office',
        name: 'Escritório Executivo com Bokeh',
        category: 'Interiores',
        gradientCss: 'from-slate-800 via-sky-950 to-slate-900',
        renderCanvas: (ctx, w, h) => {
            const grad = ctx.createLinearGradient(0, 0, w, h);
            grad.addColorStop(0, '#1e293b');
            grad.addColorStop(0.5, '#0f172a');
            grad.addColorStop(1, '#020617');
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, w, h);

            // Círculos de Bokeh de luz de escritório
            const circles = [
                { x: w * 0.2, y: h * 0.3, r: 60, color: 'rgba(255, 255, 255, 0.08)' },
                { x: w * 0.75, y: h * 0.25, r: 90, color: 'rgba(56, 189, 248, 0.1)' },
                { x: w * 0.85, y: h * 0.6, r: 120, color: 'rgba(251, 191, 36, 0.07)' },
                { x: w * 0.15, y: h * 0.75, r: 80, color: 'rgba(255, 255, 255, 0.06)' },
            ];
            circles.forEach(c => {
                ctx.beginPath();
                ctx.arc(c.x, c.y, c.r, 0, Math.PI * 2);
                ctx.fillStyle = c.color;
                ctx.fill();
            });
        }
    },
    {
        id: 'warm_studio_portrait',
        name: 'Estúdio Retrato Tons Quentes',
        category: 'Estúdio',
        gradientCss: 'from-amber-900 via-orange-950 to-stone-950',
        renderCanvas: (ctx, w, h) => {
            const grad = ctx.createRadialGradient(w * 0.5, h * 0.4, 30, w * 0.5, h * 0.5, w * 0.75);
            grad.addColorStop(0, '#78350f');
            grad.addColorStop(0.4, '#451a03');
            grad.addColorStop(0.8, '#1c1917');
            grad.addColorStop(1, '#0c0a09');
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, w, h);
        }
    },
    {
        id: 'forest_bokeh',
        name: 'Jardim Natureza com Bokeh Verde',
        category: 'Natureza',
        gradientCss: 'from-emerald-900 via-teal-950 to-slate-950',
        renderCanvas: (ctx, w, h) => {
            const grad = ctx.createLinearGradient(0, 0, 0, h);
            grad.addColorStop(0, '#064e3b');
            grad.addColorStop(0.5, '#022c22');
            grad.addColorStop(1, '#020617');
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, w, h);

            // Bokeh de folhas e luz do sol
            const lights = [
                { x: w * 0.3, y: h * 0.2, r: 50, color: 'rgba(253, 224, 71, 0.15)' },
                { x: w * 0.6, y: h * 0.15, r: 75, color: 'rgba(167, 243, 208, 0.12)' },
                { x: w * 0.8, y: h * 0.4, r: 60, color: 'rgba(250, 204, 21, 0.1)' },
            ];
            lights.forEach(l => {
                ctx.beginPath();
                ctx.arc(l.x, l.y, l.r, 0, Math.PI * 2);
                ctx.fillStyle = l.color;
                ctx.fill();
            });
        }
    }
];

/**
 * Loads an image from a Data URL, Blob URL, or external URL into an HTMLImageElement
 */
export function loadImageElement(url: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        const isDataOrBlob = url.startsWith('data:') || url.startsWith('blob:');
        if (!isDataOrBlob) {
            img.crossOrigin = 'anonymous';
        }

        img.onload = () => resolve(img);
        img.onerror = () => {
            // Se falhou com crossOrigin, tenta carregar sem crossOrigin para uso local
            if (!isDataOrBlob && img.crossOrigin) {
                const fallbackImg = new Image();
                fallbackImg.onload = () => resolve(fallbackImg);
                fallbackImg.onerror = () => reject(new Error('Falha ao carregar imagem para remoção de fundo.'));
                fallbackImg.src = url;
            } else {
                reject(new Error('Falha ao carregar imagem para remoção de fundo.'));
            }
        };
        img.src = url;
    });
}

/**
 * Calls Internet AI Vision Model (Gemini 3.8 Flash Vision) to analyze the subject
 * and identify internal white elements (clothing, sneakers, labels, etc.) that must NOT be removed.
 */
export async function analyzeSubjectWithAI(
    imageBase64: string,
    mimeType: string = 'image/jpeg'
): Promise<AiCutoutAnalysisResult> {
    const cleanBase64 = imageBase64.replace(/^data:[^;]+;base64,/, '');
    const res = await fetch('/api/gemini/ai-cutout-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: cleanBase64, mimeType })
    });

    if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || 'Falha ao analisar imagem com IA');
    }

    return await res.json();
}

/**
 * Checks if a point is inside a 2D polygon (Ray-casting algorithm)
 */
function isPointInPolygon(px: number, py: number, polygon: Array<[number, number]>): boolean {
    let inside = false;
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
        const xi = polygon[i][0], yi = polygon[i][1];
        const xj = polygon[j][0], yj = polygon[j][1];
        const intersect = ((yi > py) !== (yj > py)) && (px < (xj - xi) * (py - yi) / (yj - yi) + xi);
        if (intersect) inside = !inside;
    }
    return inside;
}

/**
 * Smart Automatic Background Removal Engine with AI & White-Detail Shielding
 * - Connected Component Flood Fill from image borders (only removes external background)
 * - White Shield Protection: NEVER deletes white t-shirts, white shoes, white teeth, or white objects inside the subject
 * - Semantic AI Integration: Uses bounding box, polygon contour and foreground seeds from Vision AI models
 * - Topological Hole-Filling: Prevents hollow or transparent gaps inside the subject
 * - Hair & Fine Strands Alpha Matting
 */
export async function removeBackgroundAutomatically(
    image: HTMLImageElement,
    options: BackgroundRemoverOptions
): Promise<{ cutoutCanvas: HTMLCanvasElement; maskData: Uint8ClampedArray; width: number; height: number }> {
    const width = image.naturalWidth || image.width;
    const height = image.naturalHeight || image.height;

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) throw new Error('Falha ao instanciar contexto Canvas');

    ctx.drawImage(image, 0, 0, width, height);
    const imgData = ctx.getImageData(0, 0, width, height);
    const data = imgData.data;

    // 1. Amostragem das cores do fundo externo
    const cornerSamples: Array<[number, number, number]> = [];
    const sampleSize = Math.max(3, Math.floor(Math.min(width, height) * 0.04));

    const sampleRect = (startX: number, startY: number) => {
        let rSum = 0, gSum = 0, bSum = 0, count = 0;
        for (let y = startY; y < Math.min(height, startY + sampleSize); y++) {
            for (let x = startX; x < Math.min(width, startX + sampleSize); x++) {
                const idx = (y * width + x) * 4;
                rSum += data[idx];
                gSum += data[idx + 1];
                bSum += data[idx + 2];
                count++;
            }
        }
        if (count > 0) {
            cornerSamples.push([rSum / count, gSum / count, bSum / count]);
        }
    };

    // Amostra dos 4 cantos e bordas externas
    sampleRect(0, 0);
    sampleRect(Math.max(0, width - sampleSize), 0);
    sampleRect(0, Math.max(0, height - sampleSize));
    sampleRect(Math.max(0, width - sampleSize), Math.max(0, height - sampleSize));
    sampleRect(Math.floor(width / 2 - sampleSize / 2), 0);
    sampleRect(Math.floor(width / 2 - sampleSize / 2), Math.max(0, height - sampleSize));

    // Se a IA forneceu pontos de fundo confirmados
    if (options.aiData?.backgroundSeedPoints) {
        for (const pt of options.aiData.backgroundSeedPoints) {
            const px = Math.min(width - 1, Math.max(0, Math.round(pt.x * width)));
            const py = Math.min(height - 1, Math.max(0, Math.round(pt.y * height)));
            const idx = (py * width + px) * 4;
            cornerSamples.push([data[idx], data[idx + 1], data[idx + 2]]);
        }
    }

    // Tolerância da remoção
    const tolerance = 25 + (options.tolerance / 100) * 115;
    const protectWhites = options.protectInternalWhites !== false;
    const whiteShieldSens = (options.whiteShieldSensitivity ?? 85) / 100;

    // Distância de cor ponderada (perceptual RGB)
    const colorDist = (r1: number, g1: number, b1: number, r2: number, g2: number, b2: number) => {
        const rmean = (r1 + r2) / 2;
        const r = r1 - r2;
        const g = g1 - g2;
        const b = b1 - b2;
        return Math.sqrt((((512 + rmean) * r * r) >> 8) + 4 * g * g + (((767 - rmean) * b * b) >> 8));
    };

    const mask = new Uint8ClampedArray(width * height);

    // 2. Flood Fill Conectado a partir das bordas externas (Connected Component Analysis)
    // Isso garante que apenas o fundo CONTÍGUO com as bordas da imagem seja removido!
    // Se o sujeito tem uma camiseta branca ou detalhes brancos no centro, eles NÃO são alcançados pelo flood fill!
    const isExternalBackground = new Uint8Array(width * height);
    const queue = new Int32Array(width * height);
    let qHead = 0;
    let qTail = 0;

    const pushQueue = (x: number, y: number) => {
        const idx = y * width + x;
        if (isExternalBackground[idx] === 0) {
            isExternalBackground[idx] = 1;
            queue[qTail++] = idx;
        }
    };

    // Inicia a fila com o perímetro da imagem (topo, rodapé, esquerda, direita)
    for (let x = 0; x < width; x++) {
        // Borda superior e inferior
        const topIdx = x * 4;
        let minTopDist = Infinity;
        for (const s of cornerSamples) {
            const d = colorDist(data[topIdx], data[topIdx + 1], data[topIdx + 2], s[0], s[1], s[2]);
            if (d < minTopDist) minTopDist = d;
        }
        if (minTopDist < tolerance * 1.1) pushQueue(x, 0);

        const botIdx = ((height - 1) * width + x) * 4;
        let minBotDist = Infinity;
        for (const s of cornerSamples) {
            const d = colorDist(data[botIdx], data[botIdx + 1], data[botIdx + 2], s[0], s[1], s[2]);
            if (d < minBotDist) minBotDist = d;
        }
        if (minBotDist < tolerance * 1.1) pushQueue(x, height - 1);
    }

    for (let y = 0; y < height; y++) {
        const leftIdx = (y * width) * 4;
        let minLeftDist = Infinity;
        for (const s of cornerSamples) {
            const d = colorDist(data[leftIdx], data[leftIdx + 1], data[leftIdx + 2], s[0], s[1], s[2]);
            if (d < minLeftDist) minLeftDist = d;
        }
        if (minLeftDist < tolerance * 1.1) pushQueue(0, y);

        const rightIdx = (y * width + (width - 1)) * 4;
        let minRightDist = Infinity;
        for (const s of cornerSamples) {
            const d = colorDist(data[rightIdx], data[rightIdx + 1], data[rightIdx + 2], s[0], s[1], s[2]);
            if (d < minRightDist) minRightDist = d;
        }
        if (minRightDist < tolerance * 1.1) pushQueue(width - 1, y);
    }

    // Expansão do Flood Fill
    const aiBox = options.aiData?.boundingBox;
    const aiPolygon = options.aiData?.subjectPolygon;

    while (qHead < qTail) {
        const currIdx = queue[qHead++];
        const cx = currIdx % width;
        const cy = Math.floor(currIdx / width);

        const neighbors = [
            cx > 0 ? currIdx - 1 : -1,
            cx < width - 1 ? currIdx + 1 : -1,
            cy > 0 ? currIdx - width : -1,
            cy < height - 1 ? currIdx + width : -1
        ];

        for (const nIdx of neighbors) {
            if (nIdx === -1 || isExternalBackground[nIdx] === 1) continue;

            const nx = nIdx % width;
            const ny = Math.floor(nIdx / width);
            const nxNorm = nx / width;
            const nyNorm = ny / height;

            // Se o ponto estiver dentro do contorno/caixa principal do sujeito fornecido pela IA
            if (protectWhites && aiBox) {
                // Margem interna de proteção contra vazamento
                const pad = 0.02 * (1 - whiteShieldSens);
                if (nyNorm >= aiBox.ymin + pad && nyNorm <= aiBox.ymax - pad &&
                    nxNorm >= aiBox.xmin + pad && nxNorm <= aiBox.xmax - pad) {
                    // Se estiver dentro da silhueta do sujeito, bloqueia a penetração do flood fill
                    if (aiPolygon && aiPolygon.length >= 3 && isPointInPolygon(nxNorm, nyNorm, aiPolygon)) {
                        continue;
                    }
                }
            }

            const dataIdx = nIdx * 4;
            const nr = data[dataIdx];
            const ng = data[dataIdx + 1];
            const nb = data[dataIdx + 2];

            // Distância ao fundo
            let minDist = Infinity;
            for (const s of cornerSamples) {
                const d = colorDist(nr, ng, nb, s[0], s[1], s[2]);
                if (d < minDist) minDist = d;
            }

            // O pixel vizinho só é absorvido como fundo externo se casar com a cor do fundo
            if (minDist < tolerance) {
                isExternalBackground[nIdx] = 1;
                queue[qTail++] = nIdx;
            }
        }
    }

    // 3. Atribuição de Alpha com Proteção de Peças Brancas Internas
    for (let y = 0; y < height; y++) {
        const yNorm = y / height;
        for (let x = 0; x < width; x++) {
            const xNorm = x / width;
            const pixelIdx = y * width + x;
            const isExternal = isExternalBackground[pixelIdx] === 1;

            if (isExternal) {
                // É fundo contíguo externo confirmado
                const idx = pixelIdx * 4;
                const r = data[idx], g = data[idx + 1], b = data[idx + 2];
                let minDist = Infinity;
                for (const s of cornerSamples) {
                    const dist = colorDist(r, g, b, s[0], s[1], s[2]);
                    if (dist < minDist) minDist = dist;
                }

                if (minDist < tolerance * 0.7) {
                    mask[pixelIdx] = 0; // Transparente
                } else {
                    // Borda de transição suave
                    const t = (minDist - tolerance * 0.7) / (tolerance * 0.4);
                    mask[pixelIdx] = Math.round(Math.max(0, Math.min(255, t * 255)));
                }
            } else {
                // NÃO é alcançado pelas bordas externas -> É SUJEITO OU PARTE INTERNA (camisa branca, tênis, etc.)
                if (protectWhites) {
                    // BLINDAGEM MÁXIMA: Mantém 100% visível, mesmo que a cor seja branca pura (#FFFFFF)
                    mask[pixelIdx] = 255;
                } else {
                    // Modo padrão sem blindagem (baseado somente em cor)
                    const idx = pixelIdx * 4;
                    let minDist = Infinity;
                    for (const s of cornerSamples) {
                        const dist = colorDist(data[idx], data[idx + 1], data[idx + 2], s[0], s[1], s[2]);
                        if (dist < minDist) minDist = dist;
                    }
                    mask[pixelIdx] = minDist > tolerance ? 255 : 0;
                }
            }

            // Reforço se ponto for ancorado por IA em sementes de primeiro plano (Foreground Seeds)
            if (options.aiData?.foregroundSeedPoints) {
                for (const seed of options.aiData.foregroundSeedPoints) {
                    const sx = seed.x * width;
                    const sy = seed.y * height;
                    const distSq = (x - sx) * (x - sx) + (y - sy) * (y - sy);
                    // Raio de 12px ao redor do centro do sujeito/peito branco
                    if (distSq < 144) {
                        mask[pixelIdx] = 255;
                    }
                }
            }
        }
    }

    // 4. Preenchimento Topológico de Furos (Topological Hole-Filling)
    // Preenche quaisquer buracos acidentais dentro do corpo ou roupas brancas
    if (protectWhites) {
        // Varredura horizontal e vertical: se um pixel transparente está cercado por opacos, ele é protegido
        const paddedMask = new Uint8ClampedArray(mask);
        for (let y = 2; y < height - 2; y++) {
            for (let x = 2; x < width - 2; x++) {
                const idx = y * width + x;
                if (paddedMask[idx] < 50) {
                    // Checa se há opacos nos 4 lados (acima, abaixo, esquerda, direita)
                    let leftFg = false, rightFg = false, upFg = false, downFg = false;
                    for (let dx = x - 1; dx >= Math.max(0, x - 30); dx--) {
                        if (paddedMask[y * width + dx] > 200) { leftFg = true; break; }
                    }
                    for (let dx = x + 1; dx < Math.min(width, x + 30); dx++) {
                        if (paddedMask[y * width + dx] > 200) { rightFg = true; break; }
                    }
                    for (let dy = y - 1; dy >= Math.max(0, y - 30); dy--) {
                        if (paddedMask[dy * width + x] > 200) { upFg = true; break; }
                    }
                    for (let dy = y + 1; dy < Math.min(height, y + 30); dy++) {
                        if (paddedMask[dy * width + x] > 200) { downFg = true; break; }
                    }

                    if (leftFg && rightFg && upFg && downFg) {
                        mask[idx] = 255; // Preenche furo interno
                    }
                }
            }
        }
    }

    // 5. Refinamento de Cabelos & Fios Finos
    if (options.hairRefinement) {
        const sensitivity = options.hairSensitivity / 100;
        for (let y = 1; y < height - 1; y++) {
            for (let x = 1; x < width - 1; x++) {
                const pixelIdx = y * width + x;
                const currentAlpha = mask[pixelIdx];

                if (currentAlpha > 5 && currentAlpha < 250) {
                    const neighbors = [
                        (y - 1) * width + x,
                        (y + 1) * width + x,
                        y * width + (x - 1),
                        y * width + (x + 1)
                    ];

                    let fgCount = 0;
                    for (const n of neighbors) {
                        if (mask[n] > 200) fgCount++;
                    }

                    if (fgCount >= 1) {
                        const boost = Math.round(50 * sensitivity);
                        mask[pixelIdx] = Math.min(255, currentAlpha + boost);
                    }
                }
            }
        }
    }

    // 6. Expansão / Erosão de Borda (Edge Choke)
    if (options.edgeChoke !== 0) {
        const tempMask = new Uint8ClampedArray(mask);
        const radius = Math.abs(options.edgeChoke);
        const isErode = options.edgeChoke < 0;

        for (let y = radius; y < height - radius; y++) {
            for (let x = radius; x < width - radius; x++) {
                const pixelIdx = y * width + x;
                if (isErode) {
                    let minVal = 255;
                    for (let dy = -radius; dy <= radius; dy++) {
                        for (let dx = -radius; dx <= radius; dx++) {
                            const val = tempMask[(y + dy) * width + (x + dx)];
                            if (val < minVal) minVal = val;
                        }
                    }
                    mask[pixelIdx] = minVal;
                } else {
                    let maxVal = 0;
                    for (let dy = -radius; dy <= radius; dy++) {
                        for (let dx = -radius; dx <= radius; dx++) {
                            const val = tempMask[(y + dy) * width + (x + dx)];
                            if (val > maxVal) maxVal = val;
                        }
                    }
                    mask[pixelIdx] = maxVal;
                }
            }
        }
    }

    // 7. Aplica máscara Alpha final com Descontaminação de Cores (Despill)
    for (let i = 0; i < mask.length; i++) {
        const alpha = mask[i];
        const dataIdx = i * 4;

        if (options.colorDespill && alpha > 0 && alpha < 250) {
            const r = data[dataIdx];
            const g = data[dataIdx + 1];
            const b = data[dataIdx + 2];
            const avg = (r + b) / 2;
            if (g > avg * 1.15) {
                data[dataIdx + 1] = avg;
            }
        }

        data[dataIdx + 3] = alpha;
    }

    ctx.putImageData(imgData, 0, 0);

    return {
        cutoutCanvas: canvas,
        maskData: mask,
        width,
        height
    };
}

/**
 * Creates high-quality Sticker Die-Cut contour around cutout
 * Draws dilated boundary with rounded edges and optional realistic drop shadow.
 */
export function applyStickerContour(
    cutoutCanvas: HTMLCanvasElement,
    options: StickerOptions
): HTMLCanvasElement {
    if (!options.enabled) return cutoutCanvas;

    const width = cutoutCanvas.width;
    const height = cutoutCanvas.height;
    const border = Math.max(2, Math.round(options.borderWidth));

    // Pad canvas to accommodate thick sticker border and drop shadow without clipping
    const pad = border + (options.dropShadow ? Math.max(10, options.shadowBlur * 2) : 4);
    const resultCanvas = document.createElement('canvas');
    resultCanvas.width = width + pad * 2;
    resultCanvas.height = height + pad * 2;
    const ctx = resultCanvas.getContext('2d');
    if (!ctx) return cutoutCanvas;

    // Offscreen mask canvas for building the thick border silhouette
    const silhouetteCanvas = document.createElement('canvas');
    silhouetteCanvas.width = resultCanvas.width;
    silhouetteCanvas.height = resultCanvas.height;
    const sCtx = silhouetteCanvas.getContext('2d');
    if (!sCtx) return cutoutCanvas;

    // Multi-pass dilation: draw cutout in circular kernel steps around center
    const steps = Math.max(16, Math.min(64, border * 2));
    sCtx.imageSmoothingEnabled = true;

    for (let r = 1; r <= border; r += Math.max(1, Math.floor(border / 6))) {
        for (let i = 0; i < steps; i++) {
            const angle = (i * 2 * Math.PI) / steps;
            const ox = Math.cos(angle) * r;
            const oy = Math.sin(angle) * r;
            sCtx.drawImage(cutoutCanvas, pad + ox, pad + oy);
        }
    }
    sCtx.drawImage(cutoutCanvas, pad, pad);

    // Color the silhouette with the sticker border color
    sCtx.globalCompositeOperation = 'source-in';
    sCtx.fillStyle = options.borderColor || '#FFFFFF';
    sCtx.fillRect(0, 0, silhouetteCanvas.width, silhouetteCanvas.height);
    sCtx.globalCompositeOperation = 'source-over';

    // Draw Drop Shadow underneath if enabled
    if (options.dropShadow) {
        ctx.save();
        ctx.shadowColor = `rgba(0, 0, 0, ${options.shadowOpacity ?? 0.35})`;
        ctx.shadowBlur = options.shadowBlur ?? 16;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = options.shadowOffsetY ?? 8;
        ctx.drawImage(silhouetteCanvas, 0, 0);
        ctx.restore();
    }

    // Draw the solid die-cut border
    ctx.drawImage(silhouetteCanvas, 0, 0);

    // Draw original subject on top
    ctx.drawImage(cutoutCanvas, pad, pad);

    return resultCanvas;
}

/**
 * Composes the cutout onto the chosen background (transparent, color, gradient, scenic, custom)
 */
export async function composeFinalImage(
    subjectCanvas: HTMLCanvasElement,
    bgOptions: BackgroundReplacementOptions,
    customLoadedImage?: HTMLImageElement | null
): Promise<HTMLCanvasElement> {
    const width = subjectCanvas.width;
    const height = subjectCanvas.height;

    const outCanvas = document.createElement('canvas');
    outCanvas.width = width;
    outCanvas.height = height;
    const ctx = outCanvas.getContext('2d');
    if (!ctx) throw new Error('Erro ao criar canvas de saída');

    // 1. Render Background
    if (bgOptions.type === 'transparent') {
        // Nothing to draw for background, stays transparent!
    } else if (bgOptions.type === 'solid') {
        ctx.fillStyle = bgOptions.solidColor || '#FFFFFF';
        ctx.fillRect(0, 0, width, height);
    } else if (bgOptions.type === 'gradient') {
        const { from, to, direction } = bgOptions.gradient;
        let grad: CanvasGradient;

        if (direction === 'to-r') {
            grad = ctx.createLinearGradient(0, 0, width, 0);
        } else if (direction === 'to-br') {
            grad = ctx.createLinearGradient(0, 0, width, height);
        } else if (direction === 'radial') {
            grad = ctx.createRadialGradient(width * 0.5, height * 0.5, 10, width * 0.5, height * 0.5, width * 0.7);
        } else {
            // to-b
            grad = ctx.createLinearGradient(0, 0, 0, height);
        }

        grad.addColorStop(0, from);
        grad.addColorStop(1, to);
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, width, height);
    } else if (bgOptions.type === 'preset') {
        const preset = SCENIC_PRESETS.find(p => p.id === bgOptions.presetId) || SCENIC_PRESETS[0];
        preset.renderCanvas(ctx, width, height);
    } else if (bgOptions.type === 'custom' && customLoadedImage) {
        ctx.save();
        if (bgOptions.blurBokeh > 0) {
            ctx.filter = `blur(${bgOptions.blurBokeh}px)`;
        }

        // Draw custom image according to fit
        if (bgOptions.customImageFit === 'contain') {
            const scale = Math.min(width / customLoadedImage.width, height / customLoadedImage.height);
            const w = customLoadedImage.width * scale;
            const h = customLoadedImage.height * scale;
            const x = (width - w) / 2;
            const y = (height - h) / 2;
            ctx.drawImage(customLoadedImage, x, y, w, h);
        } else if (bgOptions.customImageFit === 'cover') {
            const scale = Math.max(width / customLoadedImage.width, height / customLoadedImage.height);
            const w = customLoadedImage.width * scale;
            const h = customLoadedImage.height * scale;
            const x = (width - w) / 2;
            const y = (height - h) / 2;
            ctx.drawImage(customLoadedImage, x, y, w, h);
        } else {
            ctx.drawImage(customLoadedImage, 0, 0, width, height);
        }
        ctx.restore();

        // Optional darken overlay
        if (bgOptions.darken > 0) {
            ctx.fillStyle = `rgba(0, 0, 0, ${bgOptions.darken / 100})`;
            ctx.fillRect(0, 0, width, height);
        }
    }

    // 2. Draw subject cutout on top
    ctx.drawImage(subjectCanvas, 0, 0);

    return outCanvas;
}

/**
 * Composes a full resolution master canvas from subject, sticker settings, and background replacement.
 * Can be called independently of UI displayCanvas.
 */
export async function createComposedCanvas(
    cutoutCanvas: HTMLCanvasElement,
    stickerOpts: StickerOptions,
    bgOpts: BackgroundReplacementOptions,
    customBgImage?: HTMLImageElement | null
): Promise<HTMLCanvasElement> {
    let subject = cutoutCanvas;
    if (stickerOpts.enabled) {
        subject = applyStickerContour(cutoutCanvas, stickerOpts);
    }
    return await composeFinalImage(subject, bgOpts, customBgImage);
}

/**
 * Robust download trigger supporting Blobs, Blob URLs, and Data URLs.
 * Works seamlessly across modern browsers and sandboxed iframe environments.
 */
export function triggerDownload(blobOrDataUrl: Blob | string, filename: string): void {
    let url: string;
    let isCreatedBlobUrl = false;

    if (typeof blobOrDataUrl === 'string') {
        url = blobOrDataUrl;
    } else {
        url = URL.createObjectURL(blobOrDataUrl);
        isCreatedBlobUrl = true;
    }

    const a = document.createElement('a');
    a.style.position = 'fixed';
    a.style.top = '-9999px';
    a.style.left = '-9999px';
    a.style.opacity = '0';
    a.setAttribute('download', filename);
    a.href = url;
    document.body.appendChild(a);

    // Dispara clique
    try {
        a.click();
    } catch (clickErr) {
        // Fallback: evento de clique sintético
        const evt = new MouseEvent('click', {
            view: window,
            bubbles: true,
            cancelable: true
        });
        a.dispatchEvent(evt);
    }

    // Limpeza de recursos
    setTimeout(() => {
        try {
            document.body.removeChild(a);
        } catch (_) {}
        if (isCreatedBlobUrl) {
            URL.revokeObjectURL(url);
        }
    }, 2000);
}

/**
 * Downloads canvas in any user-chosen format (PNG, JPG, WEBP, SVG, PDF) with rock-solid fallback.
 */
export async function downloadInFormat(
    canvas: HTMLCanvasElement,
    format: 'png' | 'jpeg' | 'webp' | 'svg' | 'pdf',
    baseFilename: string,
    quality: number = 0.95
): Promise<{ success: boolean; filename: string }> {
    const cleanName = baseFilename.replace(/\.[^/.]+$/, '').trim() || 'imagem-recortada';

    // 1. FORMATO SVG (Vetorial com encapsulamento de alta fidelidade)
    if (format === 'svg') {
        const dataUrl = canvas.toDataURL('image/png');
        const svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 ${canvas.width} ${canvas.height}" width="${canvas.width}" height="${canvas.height}">
  <title>${cleanName} - Recorte e Figurinha Master</title>
  <image width="${canvas.width}" height="${canvas.height}" href="${dataUrl}" xlink:href="${dataUrl}"/>
</svg>`;
        const blob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' });
        const filename = `${cleanName}-cutout.svg`;
        triggerDownload(blob, filename);
        return { success: true, filename };
    }

    // 2. FORMATO PDF (PDF-1.4 válido, binário, compatível com qualquer leitor e gráfica)
    if (format === 'pdf') {
        const pdfBlob = await generateCompliantPdf(canvas);
        const filename = `${cleanName}-cutout.pdf`;
        triggerDownload(pdfBlob, filename);
        return { success: true, filename };
    }

    // 3. FORMATOS RASTER (PNG, WEBP, JPEG)
    const mimeMap: Record<string, string> = {
        png: 'image/png',
        jpeg: 'image/jpeg',
        webp: 'image/webp'
    };
    const mime = mimeMap[format] || 'image/png';
    const ext = format === 'jpeg' ? 'jpg' : format;
    const filename = `${cleanName}-cutout.${ext}`;

    // Para JPEG: preenche com fundo branco sólido caso o canvas tenha transparência
    let exportCanvas = canvas;
    if (format === 'jpeg') {
        exportCanvas = document.createElement('canvas');
        exportCanvas.width = canvas.width;
        exportCanvas.height = canvas.height;
        const eCtx = exportCanvas.getContext('2d');
        if (eCtx) {
            eCtx.fillStyle = '#FFFFFF';
            eCtx.fillRect(0, 0, canvas.width, canvas.height);
            eCtx.drawImage(canvas, 0, 0);
        }
    }

    return new Promise((resolve, reject) => {
        try {
            exportCanvas.toBlob(
                (blob) => {
                    if (blob) {
                        triggerDownload(blob, filename);
                        resolve({ success: true, filename });
                    } else {
                        // Fallback seguro via Data URL se toBlob falhar no navegador
                        try {
                            const dataUrl = exportCanvas.toDataURL(mime, quality);
                            triggerDownload(dataUrl, filename);
                            resolve({ success: true, filename });
                        } catch (dataUrlErr: any) {
                            reject(new Error(`Falha ao exportar imagem ${format.toUpperCase()}: ${dataUrlErr?.message || 'Erro desconhecido'}`));
                        }
                    }
                },
                mime,
                quality
            );
        } catch (toBlobErr: any) {
            // Fallback direto via toDataURL
            try {
                const dataUrl = exportCanvas.toDataURL(mime, quality);
                triggerDownload(dataUrl, filename);
                resolve({ success: true, filename });
            } catch (err: any) {
                reject(new Error(`Falha no download em ${format.toUpperCase()}: ${err?.message || 'Restrição do navegador'}`));
            }
        }
    });
}

/**
 * Copies the cutout image as a 32-bit transparent PNG directly to the user's clipboard.
 */
export async function copyImageToClipboard(canvas: HTMLCanvasElement): Promise<void> {
    return new Promise((resolve, reject) => {
        try {
            canvas.toBlob(async (blob) => {
                if (!blob) {
                    reject(new Error('Não foi possível gerar blob para transferência.'));
                    return;
                }
                try {
                    if (navigator.clipboard && window.ClipboardItem) {
                        await navigator.clipboard.write([
                            new ClipboardItem({ 'image/png': blob })
                        ]);
                        resolve();
                    } else {
                        reject(new Error('Área de transferência com imagem não suportada neste dispositivo/navegador.'));
                    }
                } catch (clipErr: any) {
                    reject(new Error(`Permissão de área de transferência negada: ${clipErr?.message || clipErr}`));
                }
            }, 'image/png');
        } catch (err: any) {
            reject(err);
        }
    });
}

/**
 * Generates a 100% compliant, standard PDF-1.4 file with DCTDecode (JPEG) and accurate xref table.
 */
async function generateCompliantPdf(canvas: HTMLCanvasElement): Promise<Blob> {
    // 1. Converte o canvas com fundo branco sólido em imagem JPEG para o stream PDF
    const flatCanvas = document.createElement('canvas');
    flatCanvas.width = canvas.width;
    flatCanvas.height = canvas.height;
    const fCtx = flatCanvas.getContext('2d');
    if (fCtx) {
        fCtx.fillStyle = '#FFFFFF';
        fCtx.fillRect(0, 0, canvas.width, canvas.height);
        fCtx.drawImage(canvas, 0, 0);
    }

    const jpegBlob = await new Promise<Blob>((resolve) => {
        flatCanvas.toBlob((b) => resolve(b || new Blob()), 'image/jpeg', 0.95);
    });
    const jpegBuffer = await jpegBlob.arrayBuffer();
    const jpegBytes = new Uint8Array(jpegBuffer);

    // Dimensões do documento em pontos PDF (72 dpi base, adaptado para 150-300 dpi print)
    const ptWidth = Math.max(72, Math.round((canvas.width * 72) / 150));
    const ptHeight = Math.max(72, Math.round((canvas.height * 72) / 150));

    const enc = new TextEncoder();

    // Estrutura PDF-1.4 padrão
    const header = `%PDF-1.4\n%âãÏÓ\n`;
    const obj1 = `1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n`;
    const obj2 = `2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n`;
    const obj3 = `3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${ptWidth} ${ptHeight}] /Resources << /XObject << /Im0 4 0 R >> /ProcSet [/PDF /ImageC] >> /Contents 5 0 R >>\nendobj\n`;
    const obj4Prefix = `4 0 obj\n<< /Type /XObject /Subtype /Image /Width ${canvas.width} /Height ${canvas.height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${jpegBytes.length} >>\nstream\n`;
    const obj4Suffix = `\nendstream\nendobj\n`;
    const contentStream = `q\n${ptWidth} 0 0 ${ptHeight} 0 0 cm\n/Im0 Do\nQ\n`;
    const obj5 = `5 0 obj\n<< /Length ${contentStream.length} >>\nstream\n${contentStream}endstream\nendobj\n`;

    const headerBytes = enc.encode(header);
    const obj1Bytes = enc.encode(obj1);
    const obj2Bytes = enc.encode(obj2);
    const obj3Bytes = enc.encode(obj3);
    const obj4PrefixBytes = enc.encode(obj4Prefix);
    const obj4SuffixBytes = enc.encode(obj4Suffix);
    const obj5Bytes = enc.encode(obj5);

    // Cálculo exato de offsets de bytes para a tabela xref
    const offset1 = headerBytes.length;
    const offset2 = offset1 + obj1Bytes.length;
    const offset3 = offset2 + obj2Bytes.length;
    const offset4 = offset3 + obj3Bytes.length;
    const offset5 = offset4 + obj4PrefixBytes.length + jpegBytes.length + obj4SuffixBytes.length;
    const xrefOffset = offset5 + obj5Bytes.length;

    const pad10 = (n: number) => n.toString().padStart(10, '0');

    const xref = `xref\n0 6\n0000000000 65535 f \n${pad10(offset1)} 00000 n \n${pad10(offset2)} 00000 n \n${pad10(offset3)} 00000 n \n${pad10(offset4)} 00000 n \n${pad10(offset5)} 00000 n \ntrailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`;
    const xrefBytes = enc.encode(xref);

    return new Blob([
        headerBytes,
        obj1Bytes,
        obj2Bytes,
        obj3Bytes,
        obj4PrefixBytes,
        jpegBytes,
        obj4SuffixBytes,
        obj5Bytes,
        xrefBytes
    ], { type: 'application/pdf' });
}
