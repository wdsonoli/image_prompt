/**
 * packagingTemplateService.ts
 * Motor de engenharia de embalagens para folha A4 (210mm x 297mm) a 300 DPI.
 * Gera moldes planificados (die-cuts / packaging nets) ultra-detalhados com:
 * - Linhas de corte (Cut Lines)
 * - Linhas de vinco/dobra (Crease/Score Lines)
 * - Abas de colagem com chanfros e hachuras "COLE AQUI" (Glue Tabs)
 * - Sangrias técnicas (Bleed Margins)
 * - Régua de calibração milimétrica de 50mm para conferência de escala real 1:1
 * - Cruzetas gráficas de alinhamento e registro
 * - Mapeamento da imagem da embalagem nas faces
 */

export type PackagingType = 
    | 'caixa_milk'         // Caixa Milk clássica para festas e lembrancinhas
    | 'caixa_cartucho'     // Cartucho tradicional com aba superior e poeira
    | 'caixa_piramide'     // Caixa Pirâmide / Cone
    | 'caixa_almofada'     // Pillow Box arredondada elegante
    | 'caixa_gaveta'       // Caixa Luva + Gaveta / Fósforo
    | 'caixa_maleta'       // Gable Box com alça recortada
    | 'sacola_kraft'       // Mini sacolinha de papel com abas de fundo
    | 'caixa_tampa_fundo'; // Caixa base e tampa separadas

export type PaperOrientation = 'portrait' | 'landscape';

export type LineStyleTheme = 'minimalist_mono' | 'technical_cad' | 'full_color' | 'craft_art';

export interface PackagingDimensions {
    widthMm: number;    // Largura (L)
    depthMm: number;    // Profundidade (P)
    heightMm: number;   // Altura (A)
}

export interface PackagingConfig {
    type: PackagingType;
    dimensions: PackagingDimensions;
    orientation: PaperOrientation;
    bleedMm: number;             // Sangria: 0, 1.5, 3 ou 5mm
    glueTabWidthMm: number;      // Largura da aba de cola: 10 a 20mm
    lineStyle: LineStyleTheme;   // Estilo visual das linhas
    showBleedArea: boolean;      // Exibir área de sangria
    showCreaseLines: boolean;    // Exibir linhas de dobra
    showGlueLabels: boolean;     // Exibir texto "COLE AQUI"
    showCutScissors: boolean;    // Exibir ícones de tesoura
    showDimensions: boolean;     // Exibir cotas em mm
    showCalibrationRule: boolean;// Exibir régua de 50mm
    customTextTitle: string;     // Título / Nome na embalagem
    customTextSubtitle: string;  // Subtítulo / Frase na embalagem
    backgroundColor: string;     // Cor de fundo quando imagem não preenche
    imageFitMode: 'cover' | 'contain' | 'face_front_only' | 'tile';
}

export interface PackagingPreset {
    id: PackagingType;
    name: string;
    category: string;
    description: string;
    badge: string;
    defaultDimensions: PackagingDimensions;
    recommendedPaper: string;
    orientation: PaperOrientation;
}

// A4 em milímetros
export const A4_WIDTH_MM = 210;
export const A4_HEIGHT_MM = 297;

// A4 em pixels a 300 DPI (impressão profissional ultra detalhada)
export const DPI_300_SCALE = 300 / 25.4; // ~11.811 pixels por milímetro
export const A4_PORTRAIT_PIXELS = {
    width: Math.round(A4_WIDTH_MM * DPI_300_SCALE),   // 2480 px
    height: Math.round(A4_HEIGHT_MM * DPI_300_SCALE)   // 3508 px
};
export const A4_LANDSCAPE_PIXELS = {
    width: Math.round(A4_HEIGHT_MM * DPI_300_SCALE),  // 3508 px
    height: Math.round(A4_WIDTH_MM * DPI_300_SCALE)   // 2480 px
};

export const PACKAGING_PRESETS: PackagingPreset[] = [
    {
        id: 'caixa_milk',
        name: 'Caixa Milk (Festa & Lembrancinha)',
        category: 'Lembrancinhas & Festas',
        description: 'Clássica caixa de leite com fechamento piramidal superior, vincos triangulares e furo para laço/fita.',
        badge: 'Mais Popular',
        defaultDimensions: { widthMm: 60, depthMm: 60, heightMm: 120 },
        recommendedPaper: 'Papel Fotográfico Matte ou Offset 180g - 240g',
        orientation: 'landscape'
    },
    {
        id: 'caixa_cartucho',
        name: 'Caixa Cartucho (Cosmético / Remédio)',
        category: 'Comercial & Varejo',
        description: 'Modelo clássico de drogaria e cosméticos com aba superior de trava, abas de poeira e fundo de encaixe.',
        badge: 'Clássica',
        defaultDimensions: { widthMm: 55, depthMm: 55, heightMm: 125 },
        recommendedPaper: 'Cartão Duplex / Triplex ou Couche 250g - 300g',
        orientation: 'landscape'
    },
    {
        id: 'caixa_piramide',
        name: 'Caixa Pirâmide / Cone',
        category: 'Doces & Festas',
        description: 'Quatro faces triangulares convergentes com base quadrada e aba de colagem chanfrada.',
        badge: 'Festa Infantil',
        defaultDimensions: { widthMm: 65, depthMm: 65, heightMm: 135 },
        recommendedPaper: 'Offset 180g ou Papel Fotográfico Glossy 230g',
        orientation: 'portrait'
    },
    {
        id: 'caixa_almofada',
        name: 'Caixa Almofada (Pillow Box)',
        category: 'Jóias & Acessórios',
        description: 'Curvatura elegante com fechamento elíptico por pressão sem necessidade de cola nas pontas.',
        badge: 'Minimalista Chic',
        defaultDimensions: { widthMm: 90, depthMm: 30, heightMm: 140 },
        recommendedPaper: 'Papel Kraft 200g ou Color Plus 180g',
        orientation: 'portrait'
    },
    {
        id: 'caixa_maleta',
        name: 'Caixa Maletinha com Alça (Gable Box)',
        category: 'Lanche & Brinde',
        description: 'Painéis superiores com recorte ergonômico de alça para transporte fácil e fundo reforçado.',
        badge: 'Com Alça',
        defaultDimensions: { widthMm: 80, depthMm: 50, heightMm: 110 },
        recommendedPaper: 'Cartão Kraft ou Triplex 240g - 300g',
        orientation: 'landscape'
    },
    {
        id: 'caixa_gaveta',
        name: 'Caixa Gaveta & Luva (Matchbox)',
        category: 'Doces Finos & Jóias',
        description: 'Luva externa deslizante com 4 faces e aba colada + berço/gaveta interna montável.',
        badge: 'Premium',
        defaultDimensions: { widthMm: 70, depthMm: 70, heightMm: 35 },
        recommendedPaper: 'Cartão Triplex ou Kraft 250g',
        orientation: 'portrait'
    },
    {
        id: 'sacola_kraft',
        name: 'Mini Sacola de Lembrancinha',
        category: 'Presentes & Kits',
        description: 'Sacolinha estruturada com vincos sanfonados laterais, abas de fundo e furos para alça de cordão.',
        badge: 'Versátil',
        defaultDimensions: { widthMm: 85, depthMm: 45, heightMm: 120 },
        recommendedPaper: 'Kraft Natural 180g ou Couche Fosco 210g',
        orientation: 'landscape'
    },
    {
        id: 'caixa_tampa_fundo',
        name: 'Caixa Tampa e Fundo (Two-Piece)',
        category: 'Presente Rigído',
        description: 'Base e tampa separadas com abas de colagem nos 4 cantos para montagem rígida e sólida.',
        badge: 'Caixa Rígida',
        defaultDimensions: { widthMm: 80, depthMm: 80, heightMm: 40 },
        recommendedPaper: 'Papel Paraná/Roland revestido ou Offset 240g',
        orientation: 'portrait'
    }
];

export interface NetPathSegment {
    type: 'cut' | 'crease' | 'bleed' | 'glue';
    points: { x: number; y: number }[];
    label?: string;
    closed?: boolean;
}

export interface PackagingFace {
    name: string;
    x: number;
    y: number;
    width: number;
    height: number;
    type: 'front' | 'back' | 'side_left' | 'side_right' | 'top' | 'bottom' | 'roof' | 'handle' | 'glue_tab';
    rotationDeg?: number;
    label: string;
    isGlueArea?: boolean;
}

export interface GeneratedNetData {
    faces: PackagingFace[];
    cutPaths: NetPathSegment[];
    creasePaths: NetPathSegment[];
    glueTabs: NetPathSegment[];
    bleedPaths: NetPathSegment[];
    totalNetWidthMm: number;
    totalNetHeightMm: number;
    scaleFactor: number; // mm to canvas pixels
    offsetX: number;
    offsetY: number;
    fitsOnA4: boolean;
    availableWidthMm: number;
    availableHeightMm: number;
}

/**
 * Calcula a geometria precisa do molde de embalagem para caber na folha A4.
 */
export function calculatePackagingNet(
    config: PackagingConfig,
    canvasWidth: number,
    canvasHeight: number
): GeneratedNetData {
    const isLandscape = config.orientation === 'landscape';
    const sheetWidthMm = isLandscape ? A4_HEIGHT_MM : A4_WIDTH_MM;   // 297 ou 210
    const sheetHeightMm = isLandscape ? A4_WIDTH_MM : A4_HEIGHT_MM;  // 210 ou 297

    // Margens mínimas de impressão da folha A4 (6mm em cada borda)
    const marginMm = 8;
    const availableWidthMm = sheetWidthMm - (marginMm * 2);
    const availableHeightMm = sheetHeightMm - (marginMm * 2) - 18; // 18mm para régua e cabeçalho

    const { widthMm: W, depthMm: D, heightMm: H } = config.dimensions;
    const G = Math.max(8, Math.min(22, config.glueTabWidthMm)); // aba de cola
    const bleed = config.showBleedArea ? config.bleedMm : 0;

    let netWidthMm = 0;
    let netHeightMm = 0;

    const faces: PackagingFace[] = [];
    const cutPaths: NetPathSegment[] = [];
    const creasePaths: NetPathSegment[] = [];
    const glueTabs: NetPathSegment[] = [];
    const bleedPaths: NetPathSegment[] = [];

    // GERAÇÃO GEOMÉTRICA CONFORME O MODELO
    switch (config.type) {
        case 'caixa_milk': {
            // Caixa Milk:
            // 4 faces laterais: Lateral Esquerda (D), Frente (W), Lateral Direita (D), Verso (W) + Aba lateral (G)
            // Altura total: Fundo dobrável (D/2 ou D*0.8) + Corpo (H) + Topo piramidal (D*0.75) + Aba superior furada (15mm)
            const bottomFlapH = Math.min(30, D * 0.7);
            const pyramidH = Math.min(45, D * 0.75);
            const topLipH = 15; // aba do laço

            netWidthMm = G + D + W + D + W;
            netHeightMm = bottomFlapH + H + pyramidH + topLipH;

            // Se as dimensões ultrapassam o espaço do A4, calculamos escala ou mantemos cotas reais
            // Faces principais (corpo central)
            const yBody = bottomFlapH;
            let currentX = G;

            // Painel 1: Lateral Esquerda
            faces.push({
                name: 'Lateral Esquerda',
                x: currentX,
                y: yBody,
                width: D,
                height: H,
                type: 'side_left',
                label: 'LATERAL ESQ.'
            });
            currentX += D;

            // Painel 2: Frente
            faces.push({
                name: 'Frente',
                x: currentX,
                y: yBody,
                width: W,
                height: H,
                type: 'front',
                label: 'FRENTE'
            });
            currentX += W;

            // Painel 3: Lateral Direita
            faces.push({
                name: 'Lateral Direita',
                x: currentX,
                y: yBody,
                width: D,
                height: H,
                type: 'side_right',
                label: 'LATERAL DIR.'
            });
            currentX += D;

            // Painel 4: Verso
            faces.push({
                name: 'Verso',
                x: currentX,
                y: yBody,
                width: W,
                height: H,
                type: 'back',
                label: 'VERSO'
            });

            // Aba de cola lateral esquerda
            faces.push({
                name: 'Aba de Cola Lateral',
                x: 0,
                y: yBody,
                width: G,
                height: H,
                type: 'glue_tab',
                label: 'COLE AQUI',
                isGlueArea: true
            });

            // Painéis superiores (Pirâmide e Aba com furo)
            // Topo Lateral Esq (vinco triangular)
            faces.push({
                name: 'Topo Triângulo Esq',
                x: G,
                y: yBody + H,
                width: D,
                height: pyramidH + topLipH,
                type: 'roof',
                label: 'DOBRA'
            });
            // Topo Frente
            faces.push({
                name: 'Topo Frente',
                x: G + D,
                y: yBody + H,
                width: W,
                height: pyramidH + topLipH,
                type: 'roof',
                label: 'TOPO'
            });
            // Topo Lateral Dir (vinco triangular)
            faces.push({
                name: 'Topo Triângulo Dir',
                x: G + D + W,
                y: yBody + H,
                width: D,
                height: pyramidH + topLipH,
                type: 'roof',
                label: 'DOBRA'
            });
            // Topo Verso
            faces.push({
                name: 'Topo Verso',
                x: G + D + W + D,
                y: yBody + H,
                width: W,
                height: pyramidH + topLipH,
                type: 'roof',
                label: 'TOPO'
            });

            // Abas de Fundo (4 abas)
            faces.push({
                name: 'Aba Fundo 1',
                x: G,
                y: 0,
                width: D,
                height: bottomFlapH,
                type: 'bottom',
                label: 'FUNDO'
            });
            faces.push({
                name: 'Aba Fundo Frente',
                x: G + D,
                y: 0,
                width: W,
                height: bottomFlapH,
                type: 'bottom',
                label: 'COLE AQUI',
                isGlueArea: true
            });
            faces.push({
                name: 'Aba Fundo 2',
                x: G + D + W,
                y: 0,
                width: D,
                height: bottomFlapH,
                type: 'bottom',
                label: 'FUNDO'
            });
            faces.push({
                name: 'Aba Fundo Verso',
                x: G + D + W + D,
                y: 0,
                width: W,
                height: bottomFlapH,
                type: 'bottom',
                label: 'FUNDO'
            });

            // Linhas de Corte do Contorno
            cutPaths.push({
                type: 'cut',
                points: [
                    { x: 0, y: yBody + 4 },
                    { x: G, y: yBody },
                    { x: G, y: 0 },
                    { x: G + D, y: 0 },
                    { x: G + D, y: yBody * 0.2 },
                    { x: G + D + W, y: yBody * 0.2 },
                    { x: G + D + W, y: 0 },
                    { x: G + D + W + D, y: 0 },
                    { x: G + D + W + D + W, y: 0 },
                    { x: G + D + W + D + W, y: netHeightMm },
                    { x: G + D + W + D, y: netHeightMm },
                    { x: G + D + W, y: netHeightMm },
                    { x: G + D, y: netHeightMm },
                    { x: G, y: netHeightMm },
                    { x: G, y: yBody + H },
                    { x: 0, y: yBody + H - 4 },
                    { x: 0, y: yBody + 4 }
                ],
                closed: true
            });

            // Linhas de Vinco Horizontais (entre Fundo e Corpo, entre Corpo e Topo, e Topo e Aba de Laço)
            creasePaths.push({
                type: 'crease',
                points: [{ x: G, y: yBody }, { x: netWidthMm, y: yBody }]
            });
            creasePaths.push({
                type: 'crease',
                points: [{ x: G, y: yBody + H }, { x: netWidthMm, y: yBody + H }]
            });
            creasePaths.push({
                type: 'crease',
                points: [{ x: G, y: yBody + H + pyramidH }, { x: netWidthMm, y: yBody + H + pyramidH }]
            });

            // Linhas de Vinco Verticais entre as 4 faces
            creasePaths.push({
                type: 'crease',
                points: [{ x: G, y: yBody }, { x: G, y: yBody + H }]
            });
            creasePaths.push({
                type: 'crease',
                points: [{ x: G + D, y: 0 }, { x: G + D, y: netHeightMm }]
            });
            creasePaths.push({
                type: 'crease',
                points: [{ x: G + D + W, y: 0 }, { x: G + D + W, y: netHeightMm }]
            });
            creasePaths.push({
                type: 'crease',
                points: [{ x: G + D + W + D, y: 0 }, { x: G + D + W + D, y: netHeightMm }]
            });

            // Vincos Diagonais da Pirâmide das laterais (efeito milk box)
            // Lateral Esquerda: X = G até G+D
            creasePaths.push({
                type: 'crease',
                points: [{ x: G, y: yBody + H }, { x: G + D / 2, y: yBody + H + pyramidH }]
            });
            creasePaths.push({
                type: 'crease',
                points: [{ x: G + D, y: yBody + H }, { x: G + D / 2, y: yBody + H + pyramidH }]
            });
            // Lateral Direita: X = G+D+W até G+D+W+D
            creasePaths.push({
                type: 'crease',
                points: [{ x: G + D + W, y: yBody + H }, { x: G + D + W + D / 2, y: yBody + H + pyramidH }]
            });
            creasePaths.push({
                type: 'crease',
                points: [{ x: G + D + W + D, y: yBody + H }, { x: G + D + W + D / 2, y: yBody + H + pyramidH }]
            });

            // Aba de cola com chanfro
            glueTabs.push({
                type: 'glue',
                points: [
                    { x: 0, y: yBody + 4 },
                    { x: G, y: yBody },
                    { x: G, y: yBody + H },
                    { x: 0, y: yBody + H - 4 }
                ],
                label: 'COLE AQUI',
                closed: true
            });
            break;
        }

        case 'caixa_cartucho':
        default: {
            // Cartucho clássico:
            // Aba cola lateral (G) + Lateral 1 (D) + Frente (W) + Lateral 2 (D) + Verso (W)
            // Topo: Aba de encaixe (D) + aba de inserção (15mm)
            // Fundo: Aba de encaixe (D) + aba de inserção
            const tuckFlapH = Math.min(18, D * 0.35);
            const topCoverH = D;
            const bottomCoverH = D;

            netWidthMm = G + D + W + D + W;
            netHeightMm = bottomCoverH + tuckFlapH + H + topCoverH + tuckFlapH;

            const yBody = bottomCoverH + tuckFlapH;
            let currentX = G;

            // Lateral 1
            faces.push({
                name: 'Lateral Esquerda',
                x: currentX,
                y: yBody,
                width: D,
                height: H,
                type: 'side_left',
                label: 'LATERAL 1'
            });
            currentX += D;

            // Frente
            faces.push({
                name: 'Frente',
                x: currentX,
                y: yBody,
                width: W,
                height: H,
                type: 'front',
                label: 'FRENTE'
            });
            currentX += W;

            // Lateral 2
            faces.push({
                name: 'Lateral Direita',
                x: currentX,
                y: yBody,
                width: D,
                height: H,
                type: 'side_right',
                label: 'LATERAL 2'
            });
            currentX += D;

            // Verso
            faces.push({
                name: 'Verso',
                x: currentX,
                y: yBody,
                width: W,
                height: H,
                type: 'back',
                label: 'VERSO'
            });

            // Aba cola
            faces.push({
                name: 'Aba de Cola Lateral',
                x: 0,
                y: yBody,
                width: G,
                height: H,
                type: 'glue_tab',
                label: 'COLE AQUI',
                isGlueArea: true
            });

            // Tampa superior (na Frente)
            faces.push({
                name: 'Tampa Superior',
                x: G + D,
                y: yBody + H,
                width: W,
                height: topCoverH,
                type: 'top',
                label: 'TAMPA'
            });

            // Aba de inserção da tampa
            faces.push({
                name: 'Aba de Inserção Superior',
                x: G + D,
                y: yBody + H + topCoverH,
                width: W,
                height: tuckFlapH,
                type: 'top',
                label: 'ENCAIXE'
            });

            // Fundo (no Verso)
            faces.push({
                name: 'Tampa Fundo',
                x: G + D + W + D,
                y: yBody - bottomCoverH,
                width: W,
                height: bottomCoverH,
                type: 'bottom',
                label: 'FUNDO'
            });

            // Aba de inserção do fundo
            faces.push({
                name: 'Aba Inserção Fundo',
                x: G + D + W + D,
                y: 0,
                width: W,
                height: tuckFlapH,
                type: 'bottom',
                label: 'ENCAIXE'
            });

            // Vincos principais
            creasePaths.push({
                type: 'crease',
                points: [{ x: G, y: yBody }, { x: netWidthMm, y: yBody }]
            });
            creasePaths.push({
                type: 'crease',
                points: [{ x: G, y: yBody + H }, { x: netWidthMm, y: yBody + H }]
            });
            creasePaths.push({
                type: 'crease',
                points: [{ x: G + D, y: yBody + H + topCoverH }, { x: G + D + W, y: yBody + H + topCoverH }]
            });
            creasePaths.push({
                type: 'crease',
                points: [{ x: G + D + W + D, y: yBody - bottomCoverH }, { x: netWidthMm, y: yBody - bottomCoverH }]
            });

            // Vincos verticais
            creasePaths.push({ type: 'crease', points: [{ x: G, y: yBody }, { x: G, y: yBody + H }] });
            creasePaths.push({ type: 'crease', points: [{ x: G + D, y: yBody }, { x: G + D, y: yBody + H }] });
            creasePaths.push({ type: 'crease', points: [{ x: G + D + W, y: yBody }, { x: G + D + W, y: yBody + H }] });
            creasePaths.push({ type: 'crease', points: [{ x: G + D + W + D, y: yBody }, { x: G + D + W + D, y: yBody + H }] });

            // Contorno de corte geral
            cutPaths.push({
                type: 'cut',
                points: [
                    { x: 0, y: yBody + 3 },
                    { x: G, y: yBody },
                    { x: G + D, y: yBody },
                    { x: G + D, y: yBody - bottomCoverH * 0.7 },
                    { x: G + D + W, y: yBody - bottomCoverH * 0.7 },
                    { x: G + D + W, y: yBody },
                    { x: G + D + W + D, y: yBody },
                    { x: G + D + W + D, y: 0 },
                    { x: netWidthMm, y: 0 },
                    { x: netWidthMm, y: yBody + H },
                    { x: G + D + W + D, y: yBody + H },
                    { x: G + D + W + D, y: yBody + H + topCoverH * 0.7 },
                    { x: G + D + W, y: yBody + H + topCoverH * 0.7 },
                    { x: G + D + W, y: netHeightMm },
                    { x: G + D, y: netHeightMm },
                    { x: G + D, y: yBody + H },
                    { x: G, y: yBody + H },
                    { x: 0, y: yBody + H - 3 },
                    { x: 0, y: yBody + 3 }
                ],
                closed: true
            });

            glueTabs.push({
                type: 'glue',
                points: [
                    { x: 0, y: yBody + 3 },
                    { x: G, y: yBody },
                    { x: G, y: yBody + H },
                    { x: 0, y: yBody + H - 3 }
                ],
                label: 'COLE AQUI',
                closed: true
            });
            break;
        }

        case 'caixa_piramide': {
            // Caixa Pirâmide: Fundo central (W x W) e 4 triângulos de altura H saindo dos lados
            const halfW = W / 2;
            const slantH = Math.sqrt(H * H + halfW * halfW); // altura real do triângulo na planificação
            netWidthMm = W + slantH * 2;
            netHeightMm = W + slantH * 2;

            const cx = netWidthMm / 2;
            const cy = netHeightMm / 2;

            // Fundo central
            faces.push({
                name: 'Fundo da Pirâmide',
                x: cx - halfW,
                y: cy - halfW,
                width: W,
                height: W,
                type: 'bottom',
                label: 'FUNDO'
            });

            // 4 Faces triangulares
            faces.push({
                name: 'Face Frente',
                x: cx - halfW,
                y: cy + halfW,
                width: W,
                height: slantH,
                type: 'front',
                label: 'FRENTE'
            });
            faces.push({
                name: 'Face Verso',
                x: cx - halfW,
                y: cy - halfW - slantH,
                width: W,
                height: slantH,
                type: 'back',
                label: 'VERSO'
            });
            faces.push({
                name: 'Face Lateral Esquerda',
                x: cx - halfW - slantH,
                y: cy - halfW,
                width: slantH,
                height: W,
                type: 'side_left',
                label: 'LATERAL 1'
            });
            faces.push({
                name: 'Face Lateral Direita',
                x: cx + halfW,
                y: cy - halfW,
                width: slantH,
                height: W,
                type: 'side_right',
                label: 'LATERAL 2'
            });

            // Vincos do quadrado central
            creasePaths.push({
                type: 'crease',
                points: [{ x: cx - halfW, y: cy - halfW }, { x: cx + halfW, y: cy - halfW }, { x: cx + halfW, y: cy + halfW }, { x: cx - halfW, y: cy + halfW }, { x: cx - halfW, y: cy - halfW }],
                closed: true
            });

            // Corte dos 4 triângulos com abas de colagem
            cutPaths.push({
                type: 'cut',
                points: [
                    { x: cx, y: cy + halfW + slantH },
                    { x: cx + halfW, y: cy + halfW },
                    { x: cx + halfW + slantH, y: cy },
                    { x: cx + halfW, y: cy - halfW },
                    { x: cx, y: cy - halfW - slantH },
                    { x: cx - halfW, y: cy - halfW },
                    { x: cx - halfW - slantH, y: cy },
                    { x: cx - halfW, y: cy + halfW },
                    { x: cx, y: cy + halfW + slantH }
                ],
                closed: true
            });

            glueTabs.push({
                type: 'glue',
                points: [
                    { x: cx, y: cy + halfW + slantH },
                    { x: cx + 10, y: cy + halfW + slantH - 8 },
                    { x: cx + halfW + 6, y: cy + halfW },
                    { x: cx + halfW, y: cy + halfW }
                ],
                label: 'COLE AQUI',
                closed: true
            });
            break;
        }

        case 'caixa_almofada': {
            // Pillow Box: 2 faces idênticas lado a lado (W x H) + abas laterais (G) + abas curvas nas pontas (D)
            const curveDepth = Math.min(25, D * 0.6);
            netWidthMm = G + W + W;
            netHeightMm = curveDepth + H + curveDepth;

            const yBody = curveDepth;

            // Face 1
            faces.push({
                name: 'Frente Curva',
                x: G,
                y: yBody,
                width: W,
                height: H,
                type: 'front',
                label: 'FRENTE'
            });

            // Face 2
            faces.push({
                name: 'Verso Curvo',
                x: G + W,
                y: yBody,
                width: W,
                height: H,
                type: 'back',
                label: 'VERSO'
            });

            // Aba de cola
            faces.push({
                name: 'Aba de Cola Lateral',
                x: 0,
                y: yBody,
                width: G,
                height: H,
                type: 'glue_tab',
                label: 'COLE AQUI',
                isGlueArea: true
            });

            // Vinco central vertical
            creasePaths.push({
                type: 'crease',
                points: [{ x: G + W, y: 0 }, { x: G + W, y: netHeightMm }]
            });
            creasePaths.push({
                type: 'crease',
                points: [{ x: G, y: yBody }, { x: G, y: yBody + H }]
            });

            // Vincos elípticos superiores e inferiores (simulados por segmentos de arco)
            creasePaths.push({
                type: 'crease',
                points: [{ x: G, y: yBody }, { x: G + W / 2, y: yBody - 6 }, { x: G + W, y: yBody }]
            });
            creasePaths.push({
                type: 'crease',
                points: [{ x: G + W, y: yBody }, { x: G + W + W / 2, y: yBody - 6 }, { x: netWidthMm, y: yBody }]
            });
            creasePaths.push({
                type: 'crease',
                points: [{ x: G, y: yBody + H }, { x: G + W / 2, y: yBody + H + 6 }, { x: G + W, y: yBody + H }]
            });
            creasePaths.push({
                type: 'crease',
                points: [{ x: G + W, y: yBody + H }, { x: G + W + W / 2, y: yBody + H + 6 }, { x: netWidthMm, y: yBody + H }]
            });

            // Corte externo em curva
            cutPaths.push({
                type: 'cut',
                points: [
                    { x: 0, y: yBody + 4 },
                    { x: G, y: yBody },
                    { x: G + W / 2, y: 0 },
                    { x: G + W, y: yBody },
                    { x: G + W + W / 2, y: 0 },
                    { x: netWidthMm, y: yBody },
                    { x: netWidthMm, y: yBody + H },
                    { x: G + W + W / 2, y: netHeightMm },
                    { x: G + W, y: yBody + H },
                    { x: G + W / 2, y: netHeightMm },
                    { x: G, y: yBody + H },
                    { x: 0, y: yBody + H - 4 },
                    { x: 0, y: yBody + 4 }
                ],
                closed: true
            });

            glueTabs.push({
                type: 'glue',
                points: [
                    { x: 0, y: yBody + 4 },
                    { x: G, y: yBody },
                    { x: G, y: yBody + H },
                    { x: 0, y: yBody + H - 4 }
                ],
                label: 'COLE AQUI',
                closed: true
            });
            break;
        }

        case 'caixa_maleta':
        case 'sacola_kraft':
        case 'caixa_gaveta':
        case 'caixa_tampa_fundo': {
            // Modelo versátil estruturado para sacola / maleta / gaveta
            const flapH = Math.min(30, D * 0.7);
            const topFeatureH = config.type === 'caixa_maleta' ? 38 : (D * 0.5);

            netWidthMm = G + D + W + D + W;
            netHeightMm = flapH + H + topFeatureH;

            const yBody = flapH;
            let curX = G;

            faces.push({ name: 'Lateral 1', x: curX, y: yBody, width: D, height: H, type: 'side_left', label: 'LATERAL 1' });
            curX += D;
            faces.push({ name: 'Frente', x: curX, y: yBody, width: W, height: H, type: 'front', label: 'FRENTE' });
            curX += W;
            faces.push({ name: 'Lateral 2', x: curX, y: yBody, width: D, height: H, type: 'side_right', label: 'LATERAL 2' });
            curX += D;
            faces.push({ name: 'Verso', x: curX, y: yBody, width: W, height: H, type: 'back', label: 'VERSO' });

            faces.push({
                name: 'Aba de Cola Lateral',
                x: 0,
                y: yBody,
                width: G,
                height: H,
                type: 'glue_tab',
                label: 'COLE AQUI',
                isGlueArea: true
            });

            // Topo (com alça na frente e verso)
            faces.push({
                name: 'Alça / Topo Frente',
                x: G + D,
                y: yBody + H,
                width: W,
                height: topFeatureH,
                type: 'handle',
                label: config.type === 'caixa_maleta' ? 'ALÇA' : 'TOPO'
            });
            faces.push({
                name: 'Alça / Topo Verso',
                x: G + D + W + D,
                y: yBody + H,
                width: W,
                height: topFeatureH,
                type: 'handle',
                label: config.type === 'caixa_maleta' ? 'ALÇA' : 'TOPO'
            });

            // Fundo
            faces.push({
                name: 'Aba Fundo 1',
                x: G,
                y: 0,
                width: D,
                height: flapH,
                type: 'bottom',
                label: 'FUNDO'
            });
            faces.push({
                name: 'Aba Fundo Frente',
                x: G + D,
                y: 0,
                width: W,
                height: flapH,
                type: 'bottom',
                label: 'COLE AQUI',
                isGlueArea: true
            });
            faces.push({
                name: 'Aba Fundo 2',
                x: G + D + W,
                y: 0,
                width: D,
                height: flapH,
                type: 'bottom',
                label: 'FUNDO'
            });
            faces.push({
                name: 'Aba Fundo Verso',
                x: G + D + W + D,
                y: 0,
                width: W,
                height: flapH,
                type: 'bottom',
                label: 'FUNDO'
            });

            // Vincos
            creasePaths.push({ type: 'crease', points: [{ x: G, y: yBody }, { x: netWidthMm, y: yBody }] });
            creasePaths.push({ type: 'crease', points: [{ x: G, y: yBody + H }, { x: netWidthMm, y: yBody + H }] });
            creasePaths.push({ type: 'crease', points: [{ x: G, y: yBody }, { x: G, y: yBody + H }] });
            creasePaths.push({ type: 'crease', points: [{ x: G + D, y: 0 }, { x: G + D, y: netHeightMm }] });
            creasePaths.push({ type: 'crease', points: [{ x: G + D + W, y: 0 }, { x: G + D + W, y: netHeightMm }] });
            creasePaths.push({ type: 'crease', points: [{ x: G + D + W + D, y: 0 }, { x: G + D + W + D, y: netHeightMm }] });

            // Cortes
            cutPaths.push({
                type: 'cut',
                points: [
                    { x: 0, y: yBody + 4 },
                    { x: G, y: yBody },
                    { x: G, y: 0 },
                    { x: G + D, y: 0 },
                    { x: G + D, y: yBody * 0.3 },
                    { x: G + D + W, y: yBody * 0.3 },
                    { x: G + D + W, y: 0 },
                    { x: netWidthMm, y: 0 },
                    { x: netWidthMm, y: netHeightMm },
                    { x: G + D + W + D, y: netHeightMm },
                    { x: G + D + W + D, y: yBody + H },
                    { x: G + D + W, y: yBody + H },
                    { x: G + D + W, y: netHeightMm },
                    { x: G + D, y: netHeightMm },
                    { x: G + D, y: yBody + H },
                    { x: G, y: yBody + H },
                    { x: 0, y: yBody + H - 4 },
                    { x: 0, y: yBody + 4 }
                ],
                closed: true
            });

            glueTabs.push({
                type: 'glue',
                points: [
                    { x: 0, y: yBody + 4 },
                    { x: G, y: yBody },
                    { x: G, y: yBody + H },
                    { x: 0, y: yBody + H - 4 }
                ],
                label: 'COLE AQUI',
                closed: true
            });
            break;
        }
    }

    // Calcula sangria externa se habilitada
    if (bleed > 0) {
        cutPaths.forEach(cutPath => {
            const bleedPoints = cutPath.points.map(p => {
                // Expansão radial a partir do centro
                const cx = netWidthMm / 2;
                const cy = netHeightMm / 2;
                const angle = Math.atan2(p.y - cy, p.x - cx);
                return {
                    x: p.x + Math.cos(angle) * bleed,
                    y: p.y + Math.sin(angle) * bleed
                };
            });
            bleedPaths.push({
                type: 'bleed',
                points: bleedPoints,
                closed: cutPath.closed
            });
        });
    }

    // Verifica se cabe na folha A4 em 100% de escala real
    const fitsOnA4 = (netWidthMm <= availableWidthMm) && (netHeightMm <= availableHeightMm);

    // Fator de escala para desenhar no canvas mantendo proporções
    // Se couber, podemos desenhar em 1:1 real ou centralizado
    const scaleX = (canvasWidth - 60) / sheetWidthMm;
    const scaleY = (canvasHeight - 120) / sheetHeightMm;
    const scaleFactor = Math.min(scaleX, scaleY);

    // Posição centralizada dentro da folha
    const offsetX = (sheetWidthMm - netWidthMm) / 2;
    const offsetY = (sheetHeightMm - netHeightMm) / 2 + 5; // compensa cabeçalho

    return {
        faces,
        cutPaths,
        creasePaths,
        glueTabs,
        bleedPaths,
        totalNetWidthMm: netWidthMm,
        totalNetHeightMm: netHeightMm,
        scaleFactor,
        offsetX,
        offsetY,
        fitsOnA4,
        availableWidthMm,
        availableHeightMm
    };
}

/**
 * Renderiza a folha A4 completa com o molde da embalagem no Canvas HTML5 em 300 DPI ou resolução de preview.
 */
export async function renderPackagingToCanvas(
    canvas: HTMLCanvasElement,
    config: PackagingConfig,
    sourceImage: HTMLImageElement | null,
    isHighResPrint: boolean = false
): Promise<void> {
    const isLandscape = config.orientation === 'landscape';
    const sheetDims = isLandscape
        ? (isHighResPrint ? A4_LANDSCAPE_PIXELS : { width: 1414, height: 1000 })
        : (isHighResPrint ? A4_PORTRAIT_PIXELS : { width: 1000, height: 1414 });

    canvas.width = sheetDims.width;
    canvas.height = sheetDims.height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Dimensões da folha em mm
    const sheetWidthMm = isLandscape ? A4_HEIGHT_MM : A4_WIDTH_MM;
    const sheetHeightMm = isLandscape ? A4_WIDTH_MM : A4_HEIGHT_MM;

    // Pixels por mm nesta resolução
    const pxPerMm = canvas.width / sheetWidthMm;

    // Limpa fundo da folha (Papel Branco Puro com textura suave)
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Margem sutil de borda da folha A4
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1;
    ctx.strokeRect(0, 0, canvas.width, canvas.height);

    // Calcula a geometria do molde
    const netData = calculatePackagingNet(config, canvas.width, canvas.height);

    // Converte mm do molde para pixels do canvas
    const toPxX = (mmX: number) => (netData.offsetX + mmX) * pxPerMm;
    const toPxY = (mmY: number) => (netData.offsetY + mmY) * pxPerMm;
    const toPxDim = (mm: number) => mm * pxPerMm;

    // 1. ÁREA DE SANGRIA E COR DE FUNDO DA EMBALAGEM
    if (config.showBleedArea && netData.bleedPaths.length > 0) {
        ctx.save();
        ctx.fillStyle = config.backgroundColor || '#fdf2f8';
        netData.bleedPaths.forEach(path => {
            if (path.points.length < 2) return;
            ctx.beginPath();
            ctx.moveTo(toPxX(path.points[0].x), toPxY(path.points[0].y));
            for (let i = 1; i < path.points.length; i++) {
                ctx.lineTo(toPxX(path.points[i].x), toPxY(path.points[i].y));
            }
            if (path.closed) ctx.closePath();
            ctx.fill();

            // Linha fina de sangria magenta técnica
            ctx.strokeStyle = 'rgba(236, 72, 153, 0.4)';
            ctx.lineWidth = Math.max(1, 0.5 * (pxPerMm / 4));
            ctx.setLineDash([4 * (pxPerMm / 4), 4 * (pxPerMm / 4)]);
            ctx.stroke();
            ctx.setLineDash([]);
        });
        ctx.restore();
    }

    // 2. APLICAÇÃO DA IMAGEM DA EMBALAGEM NAS FACES
    if (sourceImage && sourceImage.complete && sourceImage.naturalWidth > 0) {
        ctx.save();

        if (config.imageFitMode === 'cover') {
            // Aplica a imagem cobrindo toda a rede planificada com clip no contorno
            if (netData.cutPaths.length > 0) {
                const mainCut = netData.cutPaths[0];
                ctx.beginPath();
                ctx.moveTo(toPxX(mainCut.points[0].x), toPxY(mainCut.points[0].y));
                for (let i = 1; i < mainCut.points.length; i++) {
                    ctx.lineTo(toPxX(mainCut.points[i].x), toPxY(mainCut.points[i].y));
                }
                ctx.closePath();
                ctx.clip();

                const netPxW = toPxDim(netData.totalNetWidthMm);
                const netPxH = toPxDim(netData.totalNetHeightMm);
                const netStartX = toPxX(0);
                const netStartY = toPxY(0);

                ctx.drawImage(sourceImage, netStartX, netStartY, netPxW, netPxH);
            }
        } else if (config.imageFitMode === 'face_front_only') {
            // Aplica a imagem centralizada na face frontal com acabamento premium
            const frontFace = netData.faces.find(f => f.type === 'front');
            if (frontFace) {
                const fx = toPxX(frontFace.x);
                const fy = toPxY(frontFace.y);
                const fw = toPxDim(frontFace.width);
                const fh = toPxDim(frontFace.height);

                ctx.save();
                ctx.beginPath();
                ctx.rect(fx, fy, fw, fh);
                ctx.clip();

                // Fundo sutil
                ctx.fillStyle = config.backgroundColor || '#f8fafc';
                ctx.fillRect(fx, fy, fw, fh);

                // Desenha a imagem mantendo aspect ratio
                const imgRatio = sourceImage.naturalWidth / sourceImage.naturalHeight;
                const faceRatio = fw / fh;
                let drawW = fw;
                let drawH = fh;
                let drawX = fx;
                let drawY = fy;

                if (imgRatio > faceRatio) {
                    drawW = fh * imgRatio;
                    drawX = fx + (fw - drawW) / 2;
                } else {
                    drawH = fw / imgRatio;
                    drawY = fy + (fh - drawH) / 2;
                }

                ctx.drawImage(sourceImage, drawX, drawY, drawW, drawH);
                ctx.restore();
            }

            // Pinta outras faces com a cor de fundo escolhida
            netData.faces.filter(f => f.type !== 'front' && !f.isGlueArea).forEach(f => {
                ctx.fillStyle = config.backgroundColor || '#f8fafc';
                ctx.fillRect(toPxX(f.x), toPxY(f.y), toPxDim(f.width), toPxDim(f.height));
            });
        } else {
            // Mapeia inteligentemente em cada face principal (frente, verso e laterais)
            netData.faces.filter(f => !f.isGlueArea).forEach(face => {
                const fx = toPxX(face.x);
                const fy = toPxY(face.y);
                const fw = toPxDim(face.width);
                const fh = toPxDim(face.height);

                ctx.save();
                ctx.beginPath();
                ctx.rect(fx, fy, fw, fh);
                ctx.clip();

                ctx.fillStyle = config.backgroundColor || '#f8fafc';
                ctx.fillRect(fx, fy, fw, fh);

                ctx.drawImage(sourceImage, fx, fy, fw, fh);
                ctx.restore();
            });
        }

        ctx.restore();
    } else {
        // Sem imagem: Preenche faces com fundo limpo minimalista
        netData.faces.filter(f => !f.isGlueArea).forEach(face => {
            ctx.fillStyle = config.backgroundColor || '#fafafa';
            ctx.fillRect(toPxX(face.x), toPxY(face.y), toPxDim(face.width), toPxDim(face.height));
        });
    }

    // 3. ABAS DE COLAGEM COM HACHURAS E TEXTO "COLE AQUI"
    netData.glueTabs.forEach(tab => {
        if (tab.points.length < 3) return;

        ctx.save();
        ctx.beginPath();
        ctx.moveTo(toPxX(tab.points[0].x), toPxY(tab.points[0].y));
        for (let i = 1; i < tab.points.length; i++) {
            ctx.lineTo(toPxX(tab.points[i].x), toPxY(tab.points[i].y));
        }
        ctx.closePath();

        // Fundo suave da aba de cola
        ctx.fillStyle = 'rgba(241, 245, 249, 0.85)';
        ctx.fill();
        ctx.clip();

        // Hachura diagonal sutil de textura de cola
        ctx.strokeStyle = 'rgba(148, 163, 184, 0.4)';
        ctx.lineWidth = Math.max(1, 0.5 * (pxPerMm / 4));
        const hatchStep = 3 * pxPerMm;
        const minX = toPxX(Math.min(...tab.points.map(p => p.x)));
        const maxX = toPxX(Math.max(...tab.points.map(p => p.x)));
        const minY = toPxY(Math.min(...tab.points.map(p => p.y)));
        const maxY = toPxY(Math.max(...tab.points.map(p => p.y)));

        for (let x = minX - (maxY - minY); x < maxX + (maxY - minY); x += hatchStep) {
            ctx.beginPath();
            ctx.moveTo(x, minY);
            ctx.lineTo(x + (maxY - minY), maxY);
            ctx.stroke();
        }

        // Texto "COLE AQUI" minimalista elegante
        if (config.showGlueLabels) {
            const centerX = (minX + maxX) / 2;
            const centerY = (minY + maxY) / 2;
            ctx.save();
            ctx.translate(centerX, centerY);
            if (maxY - minY > maxX - minX) {
                ctx.rotate(-Math.PI / 2);
            }

            const fontSize = Math.max(8, Math.round(2.6 * pxPerMm));
            ctx.font = `900 ${fontSize}px sans-serif`;
            ctx.fillStyle = '#475569';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';

            // Fundo de pill sutil para leitura perfeita
            const textMetrics = ctx.measureText('COLE AQUI');
            const pillPadX = 6 * (pxPerMm / 4);
            const pillPadY = 3 * (pxPerMm / 4);
            ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
            ctx.fillRect(
                -textMetrics.width / 2 - pillPadX,
                -fontSize / 2 - pillPadY,
                textMetrics.width + pillPadX * 2,
                fontSize + pillPadY * 2
            );
            ctx.strokeStyle = '#cbd5e1';
            ctx.lineWidth = 1;
            ctx.strokeRect(
                -textMetrics.width / 2 - pillPadX,
                -fontSize / 2 - pillPadY,
                textMetrics.width + pillPadX * 2,
                fontSize + pillPadY * 2
            );

            ctx.fillStyle = '#1e293b';
            ctx.fillText('COLE AQUI', 0, 0);
            ctx.restore();
        }

        ctx.restore();
    });

    // 4. LINHAS DE VINCO / DOBRA (Tracejadas sutis)
    if (config.showCreaseLines) {
        ctx.save();
        ctx.strokeStyle = config.lineStyle === 'technical_cad' ? '#2563eb' : '#64748b';
        ctx.lineWidth = Math.max(1, 0.5 * (pxPerMm / 4));
        // Traço pontilhado elegante
        ctx.setLineDash([4 * (pxPerMm / 4), 3 * (pxPerMm / 4)]);

        netData.creasePaths.forEach(path => {
            if (path.points.length < 2) return;
            ctx.beginPath();
            ctx.moveTo(toPxX(path.points[0].x), toPxY(path.points[0].y));
            for (let i = 1; i < path.points.length; i++) {
                ctx.lineTo(toPxX(path.points[i].x), toPxY(path.points[i].y));
            }
            if (path.closed) ctx.closePath();
            ctx.stroke();
        });
        ctx.setLineDash([]);
        ctx.restore();
    }

    // 5. LINHAS DE CORTE (Linhas sólidas pretas nítidas)
    ctx.save();
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = Math.max(1.5, 0.8 * (pxPerMm / 4));

    netData.cutPaths.forEach(path => {
        if (path.points.length < 2) return;
        ctx.beginPath();
        ctx.moveTo(toPxX(path.points[0].x), toPxY(path.points[0].y));
        for (let i = 1; i < path.points.length; i++) {
            ctx.lineTo(toPxX(path.points[i].x), toPxY(path.points[i].y));
        }
        if (path.closed) ctx.closePath();
        ctx.stroke();
    });
    ctx.restore();

    // 6. ÍCONES DE TESOURA MINIMALISTAS
    if (config.showCutScissors && netData.cutPaths.length > 0) {
        const cut = netData.cutPaths[0];
        // Coloca 3 a 5 tesourinhas bem espaçadas ao longo da borda de corte
        const scissorIndices = [1, Math.floor(cut.points.length / 2), cut.points.length - 2];
        scissorIndices.forEach(idx => {
            if (idx >= 0 && idx < cut.points.length) {
                const pt = cut.points[idx];
                const px = toPxX(pt.x);
                const py = toPxY(pt.y);

                ctx.save();
                ctx.translate(px, py);
                ctx.font = `${Math.max(10, Math.round(3.5 * pxPerMm))}px sans-serif`;
                ctx.fillStyle = '#0f172a';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText('✂', 0, 0);
                ctx.restore();
            }
        });
    }

    // 7. RÓTULOS E NOMES DAS FACES (FRENTE, LATERAL, VERSO, ETC.)
    if (config.showDimensions) {
        ctx.save();
        netData.faces.filter(f => !f.isGlueArea).forEach(face => {
            const cx = toPxX(face.x + face.width / 2);
            const cy = toPxY(face.y + face.height / 2);
            const fontSize = Math.max(7, Math.round(2.2 * pxPerMm));

            ctx.font = `600 ${fontSize}px sans-serif`;
            ctx.fillStyle = 'rgba(71, 85, 105, 0.7)';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';

            // Cota em mm abaixo do nome
            const dimText = `${face.width}x${face.height}mm`;
            ctx.fillText(face.label, cx, cy - fontSize);
            ctx.font = `400 ${fontSize * 0.85}px monospace`;
            ctx.fillStyle = 'rgba(100, 116, 139, 0.6)';
            ctx.fillText(dimText, cx, cy + fontSize * 0.4);
        });
        ctx.restore();
    }

    // 8. TEXTO PERSONALIZADO DO USUÁRIO (TÍTULO E SUBTÍTULO) NA FACE FRONTAL
    if (config.customTextTitle || config.customTextSubtitle) {
        const frontFace = netData.faces.find(f => f.type === 'front');
        if (frontFace) {
            const fcx = toPxX(frontFace.x + frontFace.width / 2);
            const fTopY = toPxY(frontFace.y + frontFace.height * 0.25);

            ctx.save();
            ctx.textAlign = 'center';

            if (config.customTextTitle) {
                const titleSize = Math.max(11, Math.round(4.2 * pxPerMm));
                ctx.font = `900 ${titleSize}px sans-serif`;
                // Sombra suave para legibilidade
                ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
                ctx.fillText(config.customTextTitle, fcx + 1, fTopY + 1);
                ctx.fillStyle = '#0f172a';
                ctx.fillText(config.customTextTitle, fcx, fTopY);
            }

            if (config.customTextSubtitle) {
                const subSize = Math.max(8, Math.round(2.6 * pxPerMm));
                ctx.font = `500 ${subSize}px sans-serif`;
                ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
                ctx.fillText(config.customTextSubtitle, fcx + 1, fTopY + subSize * 1.6 + 1);
                ctx.fillStyle = '#334155';
                ctx.fillText(config.customTextSubtitle, fcx, fTopY + subSize * 1.6);
            }

            ctx.restore();
        }
    }

    // 9. MIRAS DE REGISTRO E CRUZEIS GRÁFICOS NOS 4 CANTOS
    const regMargin = 5 * pxPerMm;
    const regSize = 4 * pxPerMm;
    const corners = [
        { x: regMargin, y: regMargin },
        { x: canvas.width - regMargin, y: regMargin },
        { x: regMargin, y: canvas.height - regMargin },
        { x: canvas.width - regMargin, y: canvas.height - regMargin }
    ];

    ctx.save();
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = Math.max(1, 0.4 * (pxPerMm / 4));
    corners.forEach(c => {
        // Círculo com cruzeta
        ctx.beginPath();
        ctx.arc(c.x, c.y, regSize / 2, 0, Math.PI * 2);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(c.x - regSize, c.y);
        ctx.lineTo(c.x + regSize, c.y);
        ctx.moveTo(c.x, c.y - regSize);
        ctx.lineTo(c.x, c.y + regSize);
        ctx.stroke();
    });
    ctx.restore();

    // 10. CABEÇALHO TÉCNICO MINIMALISTA (TOPO DA FOLHA A4)
    ctx.save();
    const topBarY = 7 * pxPerMm;
    ctx.font = `bold ${Math.max(9, Math.round(2.8 * pxPerMm))}px sans-serif`;
    ctx.fillStyle = '#0f172a';
    ctx.textAlign = 'left';
    ctx.fillText('MOLDE TÉCNICO DE EMBALAGEM A4', 12 * pxPerMm, topBarY);

    ctx.font = `500 ${Math.max(7, Math.round(2.2 * pxPerMm))}px sans-serif`;
    ctx.fillStyle = '#64748b';
    const presetName = PACKAGING_PRESETS.find(p => p.id === config.type)?.name || 'Embalagem Personalizada';
    ctx.fillText(`${presetName} • Dimensões Montada: ${config.dimensions.widthMm} x ${config.dimensions.depthMm} x ${config.dimensions.heightMm} mm`, 12 * pxPerMm, topBarY + 3.2 * pxPerMm);

    // Legenda no topo direito
    ctx.textAlign = 'right';
    const legX = canvas.width - 12 * pxPerMm;
    ctx.fillStyle = '#0f172a';
    ctx.fillText('LEGENDA:', legX - 85 * (pxPerMm / 4), topBarY);

    ctx.font = `400 ${Math.max(6, Math.round(2 * pxPerMm))}px sans-serif`;
    ctx.fillStyle = '#0f172a';
    ctx.fillText('— Linha Contínua: CORTE (Tesoura / Estilete)', legX, topBarY);
    ctx.fillStyle = config.lineStyle === 'technical_cad' ? '#2563eb' : '#64748b';
    ctx.fillText('--- Linha Tracejada: VINCO (Dobra com boleador)', legX, topBarY + 2.8 * pxPerMm);
    ctx.restore();

    // 11. RÉGUA DE CALIBRAÇÃO DE 50mm (5cm) NO RODAPÉ DA FOLHA
    if (config.showCalibrationRule) {
        ctx.save();
        const ruleY = canvas.height - 11 * pxPerMm;
        const ruleStartX = 14 * pxPerMm;
        const ruleLengthMm = 50; // Exatos 50 mm
        const ruleWidthPx = ruleLengthMm * pxPerMm;

        // Fundo suave da régua
        ctx.fillStyle = '#f8fafc';
        ctx.fillRect(ruleStartX - 2 * pxPerMm, ruleY - 5 * pxPerMm, ruleWidthPx + 4 * pxPerMm, 8 * pxPerMm);
        ctx.strokeStyle = '#cbd5e1';
        ctx.lineWidth = 1;
        ctx.strokeRect(ruleStartX - 2 * pxPerMm, ruleY - 5 * pxPerMm, ruleWidthPx + 4 * pxPerMm, 8 * pxPerMm);

        // Barra milimétrica
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = Math.max(1, 0.6 * (pxPerMm / 4));
        ctx.beginPath();
        ctx.moveTo(ruleStartX, ruleY);
        ctx.lineTo(ruleStartX + ruleWidthPx, ruleY);
        ctx.stroke();

        // Traços milimétricos (a cada 1mm e traço maior a cada 5mm e 10mm)
        for (let mm = 0; mm <= ruleLengthMm; mm++) {
            const tickX = ruleStartX + mm * pxPerMm;
            const is10 = mm % 10 === 0;
            const is5 = mm % 5 === 0;
            const tickH = is10 ? 3.5 * pxPerMm : (is5 ? 2.5 * pxPerMm : 1.5 * pxPerMm);

            ctx.beginPath();
            ctx.moveTo(tickX, ruleY);
            ctx.lineTo(tickX, ruleY - tickH);
            ctx.stroke();

            if (is10) {
                ctx.font = `600 ${Math.max(6, Math.round(1.8 * pxPerMm))}px monospace`;
                ctx.fillStyle = '#0f172a';
                ctx.textAlign = 'center';
                ctx.fillText(`${mm / 10}cm`, tickX, ruleY - tickH - 1.2 * pxPerMm);
            }
        }

        // Texto explicativo de calibração
        ctx.font = `bold ${Math.max(7, Math.round(2 * pxPerMm))}px sans-serif`;
        ctx.fillStyle = '#0f172a';
        ctx.textAlign = 'left';
        ctx.fillText('RÉGUA DE TESTE 50mm (5cm):', ruleStartX + ruleWidthPx + 4 * pxPerMm, ruleY - 2 * pxPerMm);

        ctx.font = `400 ${Math.max(6, Math.round(1.8 * pxPerMm))}px sans-serif`;
        ctx.fillStyle = '#64748b';
        ctx.fillText('Meça com régua física após imprimir para confirmar escala real de 100% (Sem ajustar à página)', ruleStartX + ruleWidthPx + 4 * pxPerMm, ruleY + 1.5 * pxPerMm);

        // Rodapé direito com aviso de gramatura
        ctx.textAlign = 'right';
        ctx.fillText('Gramatura recomendada: Papel Offset, Fotográfico ou Kraft 180g a 240g', canvas.width - 12 * pxPerMm, ruleY);
        ctx.restore();
    }
}
