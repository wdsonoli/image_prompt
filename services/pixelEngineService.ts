// services/pixelEngineService.ts
// Motor de Pixel Art no Tamanho Exato inspirado no Pixel Engine (pixelengine.ai)
// Suporta resoluções exatas (16x16, 32x32, 64x64, 128x128) e formatos livres até 4:1 com transparência

export interface PixelSizePreset {
    id: string;
    label: string;
    width: number;
    height: number;
    category: 'quadrado' | 'vertical' | 'horizontal' | 'prop';
    description: string;
    iconEmoji: string;
}

export const PIXEL_SIZE_PRESETS: PixelSizePreset[] = [
    // Seção 1: Escalas Quadradas Clássicas (Topo da referência)
    { id: '16x16', label: '16 × 16', width: 16, height: 16, category: 'quadrado', description: 'Ícone ultra retro, favicons e mini sprites 8-bit', iconEmoji: '🦊' },
    { id: '32x32', label: '32 × 32', width: 32, height: 32, category: 'quadrado', description: 'Sprite padrão clássico 16-bit (SNES / Mega Drive)', iconEmoji: '🧙‍♂️' },
    { id: '64x64', label: '64 × 64', width: 64, height: 64, category: 'quadrado', description: 'Sprite detalhado (GBA, Neo Geo e jogos indie)', iconEmoji: '🗡️' },
    { id: '128x128', label: '128 × 128', width: 128, height: 128, category: 'quadrado', description: 'Pixel art de alta definição, retratos e chefes', iconEmoji: '👑' },

    // Seção 2: Formatos Livres até 4:1 (Parte inferior da referência)
    { id: '32x128', label: '32 × 128 (1:4)', width: 32, height: 128, category: 'vertical', description: 'Torre medieval, pilares e monumentos verticais', iconEmoji: '🏰' },
    { id: '64x96', label: '64 × 96 (2:3)', width: 64, height: 96, category: 'vertical', description: 'Árvore RPG, estátuas e personagens esguios', iconEmoji: '🌳' },
    { id: '96x64', label: '96 × 64 (3:2)', width: 96, height: 64, category: 'horizontal', description: 'Casa rústica, cabanas e cenários horizontais', iconEmoji: '🏠' },
    { id: '128x64', label: '128 × 64 (2:1)', width: 128, height: 64, category: 'horizontal', description: 'Dragão vermelho, chefes e monstros largos', iconEmoji: '🐉' },
    { id: '32x48', label: '32 × 48 (2:3)', width: 32, height: 48, category: 'vertical', description: 'Guerreiro esqueleto, heróis e NPCs clássicos', iconEmoji: '💀' },
    { id: '16x48', label: '16 × 48 (1:3)', width: 16, height: 48, category: 'vertical', description: 'Cristal mágico, runas e gemas arcanas', iconEmoji: '💎' },
    { id: '16x32', label: '16 × 32 (1:2)', width: 16, height: 32, category: 'vertical', description: 'Lamparina, tochas, garrafas de poção', iconEmoji: '🏮' },
    { id: '64x32', label: '64 × 32 (2:1)', width: 64, height: 32, category: 'horizontal', description: 'Carroça de madeira, veículos e pontes', iconEmoji: '🛒' },
    { id: '48x32', label: '48 × 32 (3:2)', width: 48, height: 32, category: 'horizontal', description: 'Baú de tesouro, caixas e altares', iconEmoji: '📦' },
    { id: '32x32_camp', label: '32 × 32 (1:1)', width: 32, height: 32, category: 'prop', description: 'Fogueira de acampamento, caldeirões', iconEmoji: '🔥' },
    { id: '64x16', label: '64 × 16 (4:1)', width: 64, height: 16, category: 'horizontal', description: 'Espada lendária, cajados e lanças longas', iconEmoji: '⚔️' },
    { id: '24x24', label: '24 × 24 (1:1)', width: 24, height: 24, category: 'prop', description: 'Cogumelo mágico, flores e colecionáveis', iconEmoji: '🍄' },
    { id: '32x16', label: '32 × 16 (2:1)', width: 32, height: 16, category: 'horizontal', description: 'Morcego noturno, pássaros e projéteis', iconEmoji: '🦇' },
    { id: '24x16', label: '24 × 16 (3:2)', width: 24, height: 16, category: 'prop', description: 'Slime gosmento, insetos e mini monstros', iconEmoji: '🟢' },
];

export interface PixelPalette {
    id: string;
    name: string;
    description: string;
    colors: [number, number, number][]; // RGB
}

export const PIXEL_PALETTES: PixelPalette[] = [
    {
        id: 'true_color',
        name: 'Cores Originais (True Color)',
        description: 'Mantém todas as nuances originais da imagem com pixelamento exato',
        colors: []
    },
    {
        id: 'pico8',
        name: 'PICO-8 (16 Cores)',
        description: 'A paleta definitiva da clássica fantasia console',
        colors: [
            [0, 0, 0], [29, 43, 83], [126, 37, 83], [0, 135, 81],
            [171, 82, 54], [95, 87, 79], [194, 195, 199], [255, 241, 232],
            [255, 0, 77], [255, 163, 0], [255, 236, 39], [0, 228, 54],
            [41, 173, 255], [131, 118, 156], [255, 119, 168], [255, 204, 170]
        ]
    },
    {
        id: 'gameboy',
        name: 'Game Boy DMG (4 Tons de Verde)',
        description: 'Nostalgia pura da tela LCD esverdeada de 1989',
        colors: [
            [15, 56, 15],
            [48, 98, 48],
            [139, 172, 15],
            [155, 188, 15]
        ]
    },
    {
        id: 'nes',
        name: 'NES Classic (Nintendo 8-bit)',
        description: '54 cores fiéis do console clássico Famicom/NES',
        colors: [
            [124, 124, 124], [0, 0, 252], [0, 0, 188], [68, 40, 188], [148, 0, 132], [168, 0, 32],
            [168, 16, 0], [136, 20, 0], [80, 48, 0], [0, 120, 0], [0, 104, 0], [0, 88, 0],
            [0, 64, 88], [0, 0, 0], [188, 188, 188], [0, 120, 248], [0, 88, 248], [104, 68, 252],
            [216, 0, 204], [228, 0, 88], [248, 56, 0], [228, 92, 16], [172, 124, 0], [0, 184, 0],
            [0, 168, 0], [0, 168, 68], [0, 136, 136], [248, 248, 248], [60, 188, 252], [104, 136, 252],
            [152, 120, 248], [248, 120, 248], [248, 88, 152], [248, 120, 88], [252, 160, 68], [248, 184, 0],
            [184, 248, 24], [88, 216, 84], [88, 248, 152], [0, 232, 216], [120, 120, 120], [252, 252, 252]
        ]
    },
    {
        id: 'c64',
        name: 'Commodore 64 (16 Cores)',
        description: 'Tons suaves e analógicos do icônico microcomputador',
        colors: [
            [0, 0, 0], [255, 255, 255], [136, 0, 0], [170, 255, 238],
            [204, 68, 204], [0, 204, 85], [0, 0, 170], [238, 238, 119],
            [221, 136, 85], [102, 68, 0], [255, 119, 119], [51, 51, 51],
            [119, 119, 119], [170, 255, 102], [0, 136, 255], [187, 187, 187]
        ]
    },
    {
        id: 'endesga32',
        name: 'EDG 32 (Indie Game Palette)',
        description: 'Aclamada paleta de 32 cores para pixel art moderno de jogos independentes',
        colors: [
            [190, 74, 47], [215, 123, 186], [143, 86, 59], [138, 111, 48],
            [75, 105, 47], [82, 75, 36], [50, 60, 57], [63, 63, 116],
            [48, 96, 130], [91, 110, 225], [99, 155, 255], [95, 205, 228],
            [203, 219, 252], [255, 255, 255], [155, 173, 183], [132, 126, 135],
            [105, 106, 106], [89, 86, 82], [118, 66, 138], [172, 50, 50],
            [217, 87, 99], [215, 123, 186], [143, 86, 59], [223, 113, 38],
            [247, 182, 158], [251, 242, 54], [153, 229, 80], [106, 190, 48],
            [55, 148, 110], [75, 105, 47], [34, 32, 52], [0, 0, 0]
        ]
    },
    {
        id: 'cyberpunk',
        name: 'Cyberpunk Neon (16 Cores)',
        description: 'Magentas elétricos, cianos fluorescentes e sombras profundas',
        colors: [
            [13, 2, 33], [37, 19, 81], [94, 23, 235], [255, 0, 128],
            [255, 78, 169], [0, 245, 255], [0, 210, 255], [0, 255, 159],
            [255, 230, 0], [255, 255, 255], [18, 16, 38], [150, 0, 255],
            [255, 0, 85], [45, 0, 247], [0, 255, 234], [254, 243, 199]
        ]
    },
    {
        id: 'monochrome',
        name: '1-Bit Monocromático (B&W)',
        description: 'Pixel art minimalista clássico de 2 tons (Preto & Branco)',
        colors: [
            [0, 0, 0],
            [255, 255, 255]
        ]
    }
];

export interface PixelEngineConfig {
    targetWidth: number;
    targetHeight: number;
    paletteId: string;
    ditherMode: 'none' | 'floyd' | 'bayer';
    enhanceOutline: boolean;
    outlineColor: 'black' | 'dark_shade';
    removeBackground: boolean;
    backgroundTolerance: number; // 0 a 100
    displayZoom: number; // 1 a 16x
    showPixelGrid: boolean;
    pixelAspectMode: 'contain' | 'cover' | 'stretch';
    exportUpscaleFactor: 1 | 2 | 4 | 8 | 16 | 32;
    brightness: number; // -50 a 50
    contrast: number; // -50 a 50
    saturation: number; // -50 a 50
}

export const DEFAULT_PIXEL_ENGINE_CONFIG: PixelEngineConfig = {
    targetWidth: 32,
    targetHeight: 32,
    paletteId: 'true_color',
    ditherMode: 'none',
    enhanceOutline: true,
    outlineColor: 'black',
    removeBackground: true,
    backgroundTolerance: 15,
    displayZoom: 8,
    showPixelGrid: true,
    pixelAspectMode: 'contain',
    exportUpscaleFactor: 8,
    brightness: 0,
    contrast: 10,
    saturation: 15
};

// Amostras prontas baseadas diretamente na imagem enviada pelo usuário
export interface PixelEngineSample {
    id: string;
    name: string;
    category: 'quadrado' | 'sprite';
    width: number;
    height: number;
    svgDataUrl: string;
    promptHint: string;
}

export const PIXEL_ENGINE_SAMPLES: PixelEngineSample[] = [
    {
        id: 'fox',
        name: 'Raposa Astuta (Fox)',
        category: 'quadrado',
        width: 32,
        height: 32,
        promptHint: 'cute orange fox sitting, bushy white-tipped tail, black paws, side profile',
        svgDataUrl: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="320" height="320" viewBox="0 0 32 32" shape-rendering="crispEdges">
            <rect width="32" height="32" fill="none"/>
            <rect x="18" y="4" width="3" height="5" fill="%231e293b"/>
            <rect x="25" y="4" width="3" height="5" fill="%231e293b"/>
            <rect x="19" y="5" width="2" height="4" fill="%23f97316"/>
            <rect x="25" y="5" width="2" height="4" fill="%23f97316"/>
            <rect x="17" y="8" width="12" height="10" fill="%23ea580c"/>
            <rect x="27" y="11" width="3" height="3" fill="%23ffffff"/>
            <rect x="29" y="12" width="2" height="2" fill="%230f172a"/>
            <rect x="22" y="10" width="2" height="2" fill="%230f172a"/>
            <rect x="20" y="13" width="7" height="6" fill="%23ffffff"/>
            <rect x="15" y="15" width="12" height="12" fill="%23f97316"/>
            <rect x="18" y="17" width="6" height="8" fill="%23ffffff"/>
            <rect x="24" y="24" width="3" height="5" fill="%230f172a"/>
            <rect x="18" y="24" width="3" height="5" fill="%230f172a"/>
            <rect x="5" y="12" width="9" height="13" fill="%23ea580c"/>
            <rect x="4" y="13" width="4" height="6" fill="%23ffffff"/>
            <rect x="3" y="14" width="2" height="4" fill="%23ffffff"/>
        </svg>`
    },
    {
        id: 'wizard',
        name: 'Mago Arcano (Wizard)',
        category: 'quadrado',
        width: 32,
        height: 32,
        promptHint: 'fantasy blue wizard with pointed starry hat, long white beard, golden magic staff with glowing orb',
        svgDataUrl: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="320" height="320" viewBox="0 0 32 32" shape-rendering="crispEdges">
            <rect width="32" height="32" fill="none"/>
            <rect x="13" y="3" width="6" height="3" fill="%231d4ed8"/>
            <rect x="11" y="6" width="10" height="4" fill="%231d4ed8"/>
            <rect x="7" y="10" width="18" height="3" fill="%232563eb"/>
            <rect x="14" y="4" width="2" height="2" fill="%23fde047"/>
            <rect x="12" y="13" width="8" height="5" fill="%23fed7aa"/>
            <rect x="14" y="14" width="2" height="2" fill="%230f172a"/>
            <rect x="10" y="16" width="12" height="8" fill="%23ffffff"/>
            <rect x="12" y="24" width="8" height="4" fill="%23ffffff"/>
            <rect x="9" y="19" width="14" height="10" fill="%231d4ed8"/>
            <rect x="13" y="22" width="6" height="2" fill="%23eab308"/>
            <rect x="25" y="8" width="4" height="4" fill="%23fef08a"/>
            <rect x="26" y="9" width="2" height="2" fill="%23ffffff"/>
            <rect x="26" y="12" width="2" height="17" fill="%2378350f"/>
        </svg>`
    },
    {
        id: 'dragon',
        name: 'Dragão Vermelho (128 × 64)',
        category: 'sprite',
        width: 128,
        height: 64,
        promptHint: 'fearsome red western dragon, broad wings spread, long horned tail, sharp claws, side view game boss sprite',
        svgDataUrl: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="640" height="320" viewBox="0 0 128 64" shape-rendering="crispEdges">
            <rect width="128" height="64" fill="none"/>
            <path d="M 60 10 L 105 10 L 95 35 L 75 40 Z" fill="%23b91c1c"/>
            <path d="M 70 12 L 100 14 L 88 30 Z" fill="%23ef4444"/>
            <rect x="40" y="30" width="45" height="20" rx="6" fill="%23991b1b"/>
            <rect x="20" y="32" width="22" height="14" fill="%23dc2626"/>
            <polygon points="10,36 22,30 22,42" fill="%23f87171"/>
            <circle cx="20" cy="35" r="2" fill="%23fef08a"/>
            <circle cx="20" cy="35" r="1" fill="%23000000"/>
            <path d="M 85 36 Q 115 45 124 25" stroke="%23991b1b" stroke-width="6" fill="none"/>
            <rect x="44" y="48" width="8" height="12" fill="%237f1d1d"/>
            <rect x="68" y="48" width="8" height="12" fill="%237f1d1d"/>
        </svg>`
    },
    {
        id: 'tower',
        name: 'Torre Medieval (32 × 128)',
        category: 'sprite',
        width: 32,
        height: 128,
        promptHint: 'tall stone fantasy wizard tower, purple conical roof, arched windows, stone bricks texture, narrow 1:4 pixel art sprite',
        svgDataUrl: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="160" height="640" viewBox="0 0 32 128" shape-rendering="crispEdges">
            <rect width="32" height="128" fill="none"/>
            <polygon points="16,4 4,36 28,36" fill="%237e22ce"/>
            <polygon points="16,8 8,34 24,34" fill="%23a855f7"/>
            <rect x="6" y="36" width="20" height="88" fill="%2364748b"/>
            <rect x="4" y="36" width="2" height="88" fill="%23334155"/>
            <rect x="26" y="36" width="2" height="88" fill="%23334155"/>
            <rect x="12" y="48" width="8" height="14" rx="4" fill="%230f172a"/>
            <rect x="12" y="78" width="8" height="14" rx="4" fill="%230f172a"/>
            <rect x="10" y="106" width="12" height="18" rx="6" fill="%23451a03"/>
        </svg>`
    },
    {
        id: 'sword',
        name: 'Espada Lendária (64 × 16)',
        category: 'sprite',
        width: 64,
        height: 16,
        promptHint: 'legendary steel broadsword, shiny blade with silver highlights, golden crossguard, blue gem pommel, 4:1 pixel art weapon',
        svgDataUrl: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="640" height="160" viewBox="0 0 64 16" shape-rendering="crispEdges">
            <rect width="64" height="16" fill="none"/>
            <rect x="2" y="7" width="8" height="2" fill="%2378350f"/>
            <circle cx="3" cy="8" r="2" fill="%2338bdf8"/>
            <rect x="10" y="3" width="4" height="10" fill="%23eab308"/>
            <polygon points="14,6 60,6 63,8 60,10 14,10" fill="%23e2e8f0"/>
            <rect x="14" y="7" width="45" height="1" fill="%2394a3b8"/>
            <polygon points="16,6 58,6 56,7 16,7" fill="%23ffffff"/>
        </svg>`
    },
    {
        id: 'chest',
        name: 'Baú de Tesouro (48 × 32)',
        category: 'sprite',
        width: 48,
        height: 32,
        promptHint: 'wooden treasure chest with shiny gold trim, iron keyhole lock, isometric RPG prop sprite, 48x32',
        svgDataUrl: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="480" height="320" viewBox="0 0 48 32" shape-rendering="crispEdges">
            <rect width="48" height="32" fill="none"/>
            <rect x="6" y="6" width="36" height="10" rx="3" fill="%23b45309"/>
            <rect x="6" y="16" width="36" height="12" fill="%2392400e"/>
            <rect x="6" y="6" width="4" height="22" fill="%23eab308"/>
            <rect x="38" y="6" width="4" height="22" fill="%23eab308"/>
            <rect x="22" y="14" width="4" height="6" fill="%23fbbf24"/>
            <circle cx="24" cy="17" r="1.5" fill="%230f172a"/>
        </svg>`
    }
];

// Função de cálculo de cor mais próxima na paleta usando percepção humana (Luma ponderada)
function getClosestPaletteColor(r: number, g: number, b: number, paletteColors: [number, number, number][]): [number, number, number] {
    if (paletteColors.length === 0) return [r, g, b];

    let minDist = Infinity;
    let closest = paletteColors[0];

    for (let i = 0; i < paletteColors.length; i++) {
        const [pr, pg, pb] = paletteColors[i];
        // Distância Euclidiana ponderada perceptiva: 0.299 R, 0.587 G, 0.114 B
        const dr = (r - pr) * 0.299;
        const dg = (g - pg) * 0.587;
        const db = (b - pb) * 0.114;
        const dist = dr * dr + dg * dg + db * db;
        if (dist < minDist) {
            minDist = dist;
            closest = paletteColors[i];
        }
    }
    return closest;
}

// Matriz de dithering Bayer 4x4
const BAYER_4X4 = [
    [ 0,  8,  2, 10],
    [12,  4, 14,  6],
    [ 3, 11,  1,  9],
    [15,  7, 13,  5]
];

export interface ProcessedPixelResult {
    dataUrl: string;
    width: number;
    height: number;
    totalPixels: number;
    uniqueColorsCount: number;
    paletteUsed: string;
}

// Processamento completo da imagem em Pixel Art exato
export function processImageToPixelArt(
    sourceImg: HTMLImageElement,
    config: PixelEngineConfig
): Promise<ProcessedPixelResult> {
    return new Promise((resolve) => {
        const {
            targetWidth,
            targetHeight,
            paletteId,
            ditherMode,
            enhanceOutline,
            removeBackground,
            backgroundTolerance,
            brightness,
            contrast,
            saturation
        } = config;

        // Canvas temporário do tamanho nativo exato em pixels (ex: 32x32)
        const lowResCanvas = document.createElement('canvas');
        lowResCanvas.width = targetWidth;
        lowResCanvas.height = targetHeight;
        const ctx = lowResCanvas.getContext('2d', { willReadFrequently: true });
        if (!ctx) {
            resolve({
                dataUrl: '',
                width: targetWidth,
                height: targetHeight,
                totalPixels: targetWidth * targetHeight,
                uniqueColorsCount: 0,
                paletteUsed: paletteId
            });
            return;
        }

        // Limpa com transparência
        ctx.clearRect(0, 0, targetWidth, targetHeight);

        // Aspect ratio fitting
        const srcW = sourceImg.naturalWidth || sourceImg.width;
        const srcH = sourceImg.naturalHeight || sourceImg.height;

        let drawX = 0;
        let drawY = 0;
        let drawW = targetWidth;
        let drawH = targetHeight;

        if (config.pixelAspectMode === 'contain') {
            const scale = Math.min(targetWidth / srcW, targetHeight / srcH);
            drawW = Math.round(srcW * scale);
            drawH = Math.round(srcH * scale);
            drawX = Math.round((targetWidth - drawW) / 2);
            drawY = Math.round((targetHeight - drawH) / 2);
        } else if (config.pixelAspectMode === 'cover') {
            const scale = Math.max(targetWidth / srcW, targetHeight / srcH);
            drawW = Math.round(srcW * scale);
            drawH = Math.round(srcH * scale);
            drawX = Math.round((targetWidth - drawW) / 2);
            drawY = Math.round((targetHeight - drawH) / 2);
        }

        // Desenha a imagem reduzida
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(sourceImg, drawX, drawY, drawW, drawH);

        const imgData = ctx.getImageData(0, 0, targetWidth, targetHeight);
        const data = imgData.data;

        // Amostragem do fundo nos cantos para remoção de fundo transparente se solicitado
        let bgR = data[0], bgG = data[1], bgB = data[2];
        const cornerAlpha = data[3];
        const hasExistingAlpha = cornerAlpha < 50;

        // Aplicação de Ajustes de Brilho / Contraste / Saturação
        const bMult = brightness / 100;
        const cFactor = (259 * (contrast + 100)) / (100 * (259 - contrast));
        const sFactor = (saturation + 100) / 100;

        // Seleciona paleta
        const selectedPalette = PIXEL_PALETTES.find(p => p.id === paletteId);
        const paletteColors = selectedPalette ? selectedPalette.colors : [];

        // Matriz de transparência para aplicar contorno depois
        const alphaGrid: boolean[][] = Array.from({ length: targetHeight }, () => Array(targetWidth).fill(false));

        for (let y = 0; y < targetHeight; y++) {
            for (let x = 0; x < targetWidth; x++) {
                const idx = (y * targetWidth + x) * 4;
                let r = data[idx];
                let g = data[idx + 1];
                let b = data[idx + 2];
                let a = data[idx + 3];

                // Transparência
                if (a < 50) {
                    data[idx + 3] = 0;
                    alphaGrid[y][x] = false;
                    continue;
                }

                // Remoção de fundo se a cor for muito próxima do canto e a tolerância estiver ativa
                if (removeBackground && !hasExistingAlpha) {
                    const diff = Math.sqrt(
                        Math.pow(r - bgR, 2) + Math.pow(g - bgG, 2) + Math.pow(b - bgB, 2)
                    );
                    const threshold = (backgroundTolerance / 100) * 441.67; // max sqrt(255^2*3)
                    if (diff < threshold) {
                        data[idx + 3] = 0;
                        alphaGrid[y][x] = false;
                        continue;
                    }
                }

                // Brilho
                r = Math.min(255, Math.max(0, r + bMult * 255));
                g = Math.min(255, Math.max(0, g + bMult * 255));
                b = Math.min(255, Math.max(0, b + bMult * 255));

                // Contraste
                r = Math.min(255, Math.max(0, cFactor * (r - 128) + 128));
                g = Math.min(255, Math.max(0, cFactor * (g - 128) + 128));
                b = Math.min(255, Math.max(0, cFactor * (b - 128) + 128));

                // Saturação
                const gray = 0.2989 * r + 0.5870 * g + 0.1140 * b;
                r = Math.min(255, Math.max(0, gray + (r - gray) * sFactor));
                g = Math.min(255, Math.max(0, gray + (g - gray) * sFactor));
                b = Math.min(255, Math.max(0, gray + (b - gray) * sFactor));

                // Dithering Bayer se habilitado
                if (ditherMode === 'bayer' && paletteColors.length > 0) {
                    const bayerVal = (BAYER_4X4[y % 4][x % 4] - 7.5) * 4;
                    r = Math.min(255, Math.max(0, r + bayerVal));
                    g = Math.min(255, Math.max(0, g + bayerVal));
                    b = Math.min(255, Math.max(0, b + bayerVal));
                }

                // Quantização de paleta
                if (paletteColors.length > 0) {
                    const [cr, cg, cb] = getClosestPaletteColor(r, g, b, paletteColors);
                    r = cr;
                    g = cg;
                    b = cb;
                }

                data[idx] = Math.round(r);
                data[idx + 1] = Math.round(g);
                data[idx + 2] = Math.round(b);
                data[idx + 3] = 255;
                alphaGrid[y][x] = true;
            }
        }

        // Aplicação de contorno retro (Dark Outline Enhancement)
        if (enhanceOutline) {
            for (let y = 0; y < targetHeight; y++) {
                for (let x = 0; x < targetWidth; x++) {
                    // Se o pixel atual é opaco, checa se tem vizinho transparente (é borda)
                    if (alphaGrid[y][x]) {
                        const hasTransparentNeighbor =
                            (x > 0 && !alphaGrid[y][x - 1]) ||
                            (x < targetWidth - 1 && !alphaGrid[y][x + 1]) ||
                            (y > 0 && !alphaGrid[y - 1][x]) ||
                            (y < targetHeight - 1 && !alphaGrid[y + 1][x]);

                        if (hasTransparentNeighbor) {
                            const idx = (y * targetWidth + x) * 4;
                            if (config.outlineColor === 'black') {
                                data[idx] = 15;
                                data[idx + 1] = 23;
                                data[idx + 2] = 42; // Quase preto azulado profundo
                            } else {
                                // Escurece 60%
                                data[idx] = Math.round(data[idx] * 0.4);
                                data[idx + 1] = Math.round(data[idx + 1] * 0.4);
                                data[idx + 2] = Math.round(data[idx + 2] * 0.4);
                            }
                        }
                    }
                }
            }
        }

        ctx.putImageData(imgData, 0, 0);

        // Contagem de cores únicas
        const uniqueColors = new Set<string>();
        for (let i = 0; i < data.length; i += 4) {
            if (data[i + 3] > 0) {
                uniqueColors.add(`${data[i]},${data[i + 1]},${data[i + 2]}`);
            }
        }

        resolve({
            dataUrl: lowResCanvas.toDataURL('image/png'),
            width: targetWidth,
            height: targetHeight,
            totalPixels: targetWidth * targetHeight,
            uniqueColorsCount: uniqueColors.size,
            paletteUsed: selectedPalette?.name || 'True Color'
        });
    });
}

// Geração do Showcase Completo 4-em-1 (Exatamente igual ao topo da imagem do usuário: 16x16, 32x32, 64x64, 128x128)
export async function generateComparisonShowcase(
    sourceImg: HTMLImageElement,
    paletteId: string = 'true_color'
): Promise<string> {
    const sizes = [16, 32, 64, 128];
    const lowResCanvases: HTMLCanvasElement[] = [];

    for (const sz of sizes) {
        const temp = document.createElement('canvas');
        temp.width = sz;
        temp.height = sz;
        const ctx = temp.getContext('2d');
        if (ctx) {
            ctx.imageSmoothingEnabled = true;
            ctx.drawImage(sourceImg, 0, 0, sz, sz);
            const imgData = ctx.getImageData(0, 0, sz, sz);
            const data = imgData.data;
            const selPal = PIXEL_PALETTES.find(p => p.id === paletteId);
            if (selPal && selPal.colors.length > 0) {
                for (let i = 0; i < data.length; i += 4) {
                    if (data[i + 3] > 50) {
                        const [cr, cg, cb] = getClosestPaletteColor(data[i], data[i + 1], data[i + 2], selPal.colors);
                        data[i] = cr;
                        data[i + 1] = cg;
                        data[i + 2] = cb;
                    }
                }
                ctx.putImageData(imgData, 0, 0);
            }
        }
        lowResCanvases.push(temp);
    }

    // Canvas do poster de apresentação (estilo pixelengine.ai)
    const showcaseCanvas = document.createElement('canvas');
    showcaseCanvas.width = 1200;
    showcaseCanvas.height = 700;
    const sCtx = showcaseCanvas.getContext('2d');
    if (!sCtx) return '';

    // Fundo branco clean
    sCtx.fillStyle = '#ffffff';
    sCtx.fillRect(0, 0, 1200, 700);

    // Cabeçalho estilizado
    sCtx.fillStyle = '#64748b';
    sCtx.font = 'bold 13px sans-serif';
    sCtx.fillText('PIXEL ENGINE IMAGE', 40, 45);

    sCtx.fillStyle = '#64748b';
    sCtx.font = 'bold 13px sans-serif';
    sCtx.textAlign = 'right';
    sCtx.fillText('pixelengine.ai', 1160, 45);
    sCtx.textAlign = 'left';

    sCtx.fillStyle = '#1e293b';
    sCtx.font = '900 32px sans-serif';
    sCtx.fillText('PIXEL ART AT THE EXACT SIZE YOU ASK FOR', 40, 85);

    // Linha divisória
    sCtx.strokeStyle = '#93c5fd';
    sCtx.lineWidth = 2.5;
    sCtx.beginPath();
    sCtx.moveTo(40, 105);
    sCtx.lineTo(1160, 105);
    sCtx.stroke();

    // Renderiza as 4 caixas com xadrez transparente (checkerboard)
    const boxSize = 250;
    const startY = 140;
    const gap = 30;
    const startX = 40;

    for (let i = 0; i < sizes.length; i++) {
        const boxX = startX + i * (boxSize + gap);

        // Desenha checkerboard de fundo
        const chkSize = 10;
        for (let cy = 0; cy < boxSize; cy += chkSize) {
            for (let cx = 0; cx < boxSize; cx += chkSize) {
                const isEven = (Math.floor(cx / chkSize) + Math.floor(cy / chkSize)) % 2 === 0;
                sCtx.fillStyle = isEven ? '#e2e8f0' : '#f8fafc';
                sCtx.fillRect(boxX + cx, startY + cy, chkSize, chkSize);
            }
        }

        // Borda sutil
        sCtx.strokeStyle = '#cbd5e1';
        sCtx.lineWidth = 1;
        sCtx.strokeRect(boxX, startY, boxSize, boxSize);

        // Desenha o sprite com nearest-neighbor (pixel art nítido)
        sCtx.imageSmoothingEnabled = false;
        sCtx.drawImage(lowResCanvases[i], boxX, startY, boxSize, boxSize);

        // Rótulo de dimensão abaixo (ex: 16 × 16)
        sCtx.fillStyle = '#0f172a';
        sCtx.font = 'bold 18px monospace';
        sCtx.fillText(`${sizes[i]} × ${sizes[i]}`, boxX, startY + boxSize + 32);
    }

    // Rodapé
    sCtx.fillStyle = '#64748b';
    sCtx.font = 'bold 14px monospace';
    sCtx.fillText('pe_image_v1 · 16–128 px a side · in the app and the API', 40, 660);

    return showcaseCanvas.toDataURL('image/png');
}

// Geração de prompt especializado no padrão pe_image_v1 / Pixel Engine
export function buildPixelEnginePrompt(
    subjectName: string,
    width: number,
    height: number,
    paletteName: string,
    extraKeywords: string = ''
): string {
    const isSquare = width === height;
    const aspect = isSquare ? '1:1 square' : `${width}:${height} aspect ratio`;

    return `pixel art sprite of ${subjectName}, exactly ${width}x${height} pixels grid, pe_image_v1 pixel engine style, true retro pixel art, crisp pixel edges without antialiasing, clean black pixel outline, isolated on pure transparent background, limited color palette (${paletteName}), ${aspect}, detailed 2D game asset sprite, orthographic perspective, 16-bit masterwork${extraKeywords ? `, ${extraKeywords}` : ''}`;
}

// Exporta o canvas em escala ampliada com Nearest Neighbor (sem borrão)
export function exportScaledPixelCanvas(
    nativeCanvasDataUrl: string,
    nativeWidth: number,
    nativeHeight: number,
    scaleFactor: number
): Promise<string> {
    return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
            const outCanvas = document.createElement('canvas');
            outCanvas.width = nativeWidth * scaleFactor;
            outCanvas.height = nativeHeight * scaleFactor;
            const ctx = outCanvas.getContext('2d');
            if (!ctx) {
                resolve(nativeCanvasDataUrl);
                return;
            }
            ctx.imageSmoothingEnabled = false;
            ctx.drawImage(img, 0, 0, outCanvas.width, outCanvas.height);
            resolve(outCanvas.toDataURL('image/png'));
        };
        img.onerror = () => resolve(nativeCanvasDataUrl);
        img.src = nativeCanvasDataUrl;
    });
}
