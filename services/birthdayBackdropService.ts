/**
 * Birthday Backdrop & Cake Topper Designer Service
 * For party backdrops (Painel Redondo, Arco Romano, Painel Retangular, Cilindros)
 * and Cake Toppers (Topo de Bolo com corte e sangria).
 */

export type PanelShape = 'circle' | 'arch' | 'rectangle' | 'cake_topper' | 'cylinder';

export interface PanelSizePreset {
    id: string;
    name: string;
    shape: PanelShape;
    widthCm: number;
    heightCm: number;
    category: 'painel_redondo' | 'arco_romano' | 'painel_retangular' | 'cilindro' | 'topo_bolo' | 'personalizado';
    description: string;
    bleedMarginCm: number; // Margem para costura / elástico
    safetyMarginCm: number; // Margem de segurança interna
}

export const PANEL_SIZE_PRESETS: PanelSizePreset[] = [
    // Painéis Redondos (Sublimação / Tecido / MDF)
    {
        id: 'circle_150',
        name: 'Painel Redondo 1,50m (Padrão)',
        shape: 'circle',
        widthCm: 150,
        heightCm: 150,
        category: 'painel_redondo',
        description: 'O tamanho mais usado no Brasil para festas infantis e adultas. Ideal para estrutura circular.',
        bleedMarginCm: 10,
        safetyMarginCm: 12
    },
    {
        id: 'circle_120',
        name: 'Painel Redondo 1,20m (Pocket Party)',
        shape: 'circle',
        widthCm: 120,
        heightCm: 120,
        category: 'painel_redondo',
        description: 'Ideal para festas em casa, minitable e apartamentos.',
        bleedMarginCm: 8,
        safetyMarginCm: 10
    },
    {
        id: 'circle_180',
        name: 'Painel Redondo 1,80m (Grande)',
        shape: 'circle',
        widthCm: 180,
        heightCm: 180,
        category: 'painel_redondo',
        description: 'Tamanho expressivo para salões de festa e decorações luxuosas.',
        bleedMarginCm: 10,
        safetyMarginCm: 15
    },
    {
        id: 'circle_200',
        name: 'Painel Redondo 2,00m (Mega Painel)',
        shape: 'circle',
        widthCm: 200,
        heightCm: 200,
        category: 'painel_redondo',
        description: 'Cenário grandioso para aniversários de 15 anos, casamentos e formaturas.',
        bleedMarginCm: 12,
        safetyMarginCm: 18
    },

    // Arco Romano (Painéis com topo curvo)
    {
        id: 'arch_100x200',
        name: 'Arco Romano 1,00m × 2,00m',
        shape: 'arch',
        widthCm: 100,
        heightCm: 200,
        category: 'arco_romano',
        description: 'Tendência moderna para painel central ou lateral de festa desconstruída.',
        bleedMarginCm: 8,
        safetyMarginCm: 12
    },
    {
        id: 'arch_120x220',
        name: 'Arco Romano 1,20m × 2,20m (Alto)',
        shape: 'arch',
        widthCm: 120,
        heightCm: 220,
        category: 'arco_romano',
        description: 'Dimensão imponente com curva perfeita no topo.',
        bleedMarginCm: 8,
        safetyMarginCm: 15
    },
    {
        id: 'arch_90x180',
        name: 'Arco Romano 0,90m × 1,80m (Compacto)',
        shape: 'arch',
        widthCm: 90,
        heightCm: 180,
        category: 'arco_romano',
        description: 'Perfeito para composições em trio de arcos.',
        bleedMarginCm: 7,
        safetyMarginCm: 10
    },

    // Painéis Retangulares / Banners
    {
        id: 'rect_200x150',
        name: 'Banner Retangular 2,00m × 1,50m',
        shape: 'rectangle',
        widthCm: 200,
        heightCm: 150,
        category: 'painel_retangular',
        description: 'Banner horizontal tradicional para fundo de mesa de bolo com ilhós.',
        bleedMarginCm: 5,
        safetyMarginCm: 10
    },
    {
        id: 'rect_250x180',
        name: 'Banner Retangular 2,50m × 1,80m',
        shape: 'rectangle',
        widthCm: 250,
        heightCm: 180,
        category: 'painel_retangular',
        description: 'Tamanho amplo para grandes cenários fotográficos e backdrop.',
        bleedMarginCm: 6,
        safetyMarginCm: 12
    },
    {
        id: 'rect_300x200',
        name: 'Mega Banner 3,00m × 2,00m',
        shape: 'rectangle',
        widthCm: 300,
        heightCm: 200,
        category: 'painel_retangular',
        description: 'Cenário panorâmico de salão de eventos.',
        bleedMarginCm: 8,
        safetyMarginCm: 15
    },

    // Trio de Cilindros de Mesa
    {
        id: 'cylinder_g',
        name: 'Cilindro Grande G (80 × 50cm)',
        shape: 'cylinder',
        widthCm: 157, // Perímetro do cilindro de 50cm de diâmetro (pi * 50)
        heightCm: 80,
        category: 'cilindro',
        description: 'Capa sublimada para mesa cilindro grande G.',
        bleedMarginCm: 6,
        safetyMarginCm: 8
    },
    {
        id: 'cylinder_m',
        name: 'Cilindro Médio M (60 × 44cm)',
        shape: 'cylinder',
        widthCm: 138, // Perímetro (pi * 44)
        heightCm: 60,
        category: 'cilindro',
        description: 'Capa sublimada para mesa cilindro média M.',
        bleedMarginCm: 5,
        safetyMarginCm: 7
    },
    {
        id: 'cylinder_p',
        name: 'Cilindro Pequeno P (45 × 38cm)',
        shape: 'cylinder',
        widthCm: 119, // Perímetro (pi * 38)
        heightCm: 45,
        category: 'cilindro',
        description: 'Capa sublimada para mesa cilindro pequena P.',
        bleedMarginCm: 4,
        safetyMarginCm: 6
    },

    // Topo de Bolo & Papelaria Personalizada
    {
        id: 'cake_topper_round',
        name: 'Topo de Bolo Redondo Aro (18 × 18cm)',
        shape: 'cake_topper',
        widthCm: 18,
        heightCm: 18,
        category: 'topo_bolo',
        description: 'Topper circular moderno para topo de bolo com nome, idade e elementos em camadas.',
        bleedMarginCm: 0.5,
        safetyMarginCm: 1.5
    },
    {
        id: 'cake_topper_banner',
        name: 'Faixa Lateral de Bolo (12 × 75cm)',
        shape: 'rectangle',
        widthCm: 75,
        heightCm: 12,
        category: 'topo_bolo',
        description: 'Faixa decorativa em volta do bolo cenográfico ou pasta americana.',
        bleedMarginCm: 1,
        safetyMarginCm: 1.5
    },
    {
        id: 'cake_topper_sheet_a4',
        name: 'Folha de Topo de Bolo A4 (21 × 29,7cm)',
        shape: 'rectangle',
        widthCm: 21,
        heightCm: 29.7,
        category: 'topo_bolo',
        description: 'Folha completa para tesouretes e Silhouette com apliques, nome e idade para recortar.',
        bleedMarginCm: 0.5,
        safetyMarginCm: 1
    }
];

export interface ThemePreset {
    id: string;
    name: string;
    category: 'Infantil' | 'Meninas' | 'Meninos' | 'Adulto' | 'Luxo';
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    backgroundStyle: 'gradient' | 'clouds' | 'stars' | 'wood' | 'marble' | 'glitter' | 'safari' | 'underwater' | 'boteco';
    previewSvg: string;
    suggestedFonts: string[];
    suggestedText: {
        name: string;
        age: string;
        subtitle: string;
    };
}

export const THEME_PRESETS: ThemePreset[] = [
    {
        id: 'safari_baby',
        name: 'Safari Baby / Selva Dourada',
        category: 'Infantil',
        primaryColor: '#84cc16',
        secondaryColor: '#fef08a',
        accentColor: '#b45309',
        backgroundStyle: 'safari',
        previewSvg: '🌿',
        suggestedFonts: ['Luckiest Guy', 'Arial Black', 'Comic Sans MS'],
        suggestedText: {
            name: 'LORENZO',
            age: '1 ANINHO',
            subtitle: 'SAFARI DO LORENZO'
        }
    },
    {
        id: 'jardim_encantado',
        name: 'Jardim Encantado / Borboletas',
        category: 'Meninas',
        primaryColor: '#f472b6',
        secondaryColor: '#fbcfe8',
        accentColor: '#a855f7',
        backgroundStyle: 'clouds',
        previewSvg: '🦋',
        suggestedFonts: ['Great Vibes', 'Brush Script MT', 'Dancing Script'],
        suggestedText: {
            name: 'Helena',
            age: 'Meu 1º Aninho',
            subtitle: 'JARDIM ENCANTADO'
        }
    },
    {
        id: 'astronauta_espaco',
        name: 'Astronauta / Galáxia Cósmica',
        category: 'Meninos',
        primaryColor: '#090d16',
        secondaryColor: '#1e1b4b',
        accentColor: '#38bdf8',
        backgroundStyle: 'stars',
        previewSvg: '🚀',
        suggestedFonts: ['Arial Black', 'Impact', 'Trebuchet MS'],
        suggestedText: {
            name: 'GABRIEL',
            age: '5 ANOS',
            subtitle: 'UMA AVENTURA NO ESPAÇO'
        }
    },
    {
        id: 'princesa_realeza',
        name: 'Princesa Realeza & Rosé Gold',
        category: 'Meninas',
        primaryColor: '#fb7185',
        secondaryColor: '#fce7f3',
        accentColor: '#eab308',
        backgroundStyle: 'glitter',
        previewSvg: '👑',
        suggestedFonts: ['Great Vibes', 'Georgia', 'Playfair Display'],
        suggestedText: {
            name: 'Isadora',
            age: '15 Anos',
            subtitle: 'UMA NOITE INESQUECÍVEL'
        }
    },
    {
        id: 'fundo_do_mar',
        name: 'Fundo do Mar & Sereia Pastel',
        category: 'Meninas',
        primaryColor: '#06b6d4',
        secondaryColor: '#a5f3fc',
        accentColor: '#ec4899',
        backgroundStyle: 'underwater',
        previewSvg: '🐚',
        suggestedFonts: ['Comic Sans MS', 'Arial Black'],
        suggestedText: {
            name: 'LIVIA',
            age: '3 ANOS',
            subtitle: 'FESTA NO FUNDO DO MAR'
        }
    },
    {
        id: 'fazendinha_feliz',
        name: 'Fazendinha & Celeiro Rústico',
        category: 'Infantil',
        primaryColor: '#dc2626',
        secondaryColor: '#fef08a',
        accentColor: '#78350f',
        backgroundStyle: 'wood',
        previewSvg: '🐮',
        suggestedFonts: ['Impact', 'Arial Black'],
        suggestedText: {
            name: 'BENÍCIO',
            age: '2 ANOS',
            subtitle: 'FAZENDINHA DO BENÍCIO'
        }
    },
    {
        id: 'dourado_luxo',
        name: 'Black & Gold Luxo VIP',
        category: 'Luxo',
        primaryColor: '#09090b',
        secondaryColor: '#1c1917',
        accentColor: '#eab308',
        backgroundStyle: 'glitter',
        previewSvg: '✨',
        suggestedFonts: ['Georgia', 'Great Vibes', 'Impact'],
        suggestedText: {
            name: 'De Repente 30',
            age: 'PARABÉNS',
            subtitle: 'VIVA A VIDA COM ESTILO'
        }
    },
    {
        id: 'boteco_festa',
        name: 'Boteco do Chopp & Chá Bar',
        category: 'Adulto',
        primaryColor: '#78350f',
        secondaryColor: '#d97706',
        accentColor: '#f59e0b',
        backgroundStyle: 'wood',
        previewSvg: '🍺',
        suggestedFonts: ['Impact', 'Arial Black'],
        suggestedText: {
            name: 'BOTECO DO MARCOS',
            age: '40 ANOS',
            subtitle: 'CHOPP GELADO & BOA MÚSICA'
        }
    }
];

export interface BackdropTextLayer {
    id: string;
    type: 'text';
    text: string;
    x: number; // percentage 0-100
    y: number; // percentage 0-100
    fontSize: number; // pt/px
    fontFamily: string;
    fontWeight: 'normal' | 'bold' | '900';
    textColor: string;
    textAlign: 'center' | 'left' | 'right';
    isCurved: boolean;
    curveRadius: number; // raio de curvatura em arco
    curveDirection: 'up' | 'down';
    strokeColor: string;
    strokeWidth: number; // contorno 1
    secondaryStrokeColor: string;
    secondaryStrokeWidth: number; // contorno 2
    gradientFill: boolean;
    gradientFrom: string;
    gradientTo: string;
    dropShadow: boolean;
    shadowColor: string;
    shadowBlur: number;
    shadowOffsetY: number;
    rotation: number;
    opacity: number;
    visible: boolean;
    locked: boolean;
}

export type ImageMaskShape = 'none' | 'circle' | 'arch' | 'heart' | 'star' | 'polaroid' | 'hexagon';
export type ImageBorderStyle = 'none' | 'white_sticker' | 'gold_glitter' | 'rose_gold' | 'neon' | 'custom';
export type ImageShadowStyle = 'none' | 'soft_3d' | 'floating' | 'gold_glow' | 'neon_glow';
export type ImageFilterTreatment = 'none' | 'vibrant' | 'pastel' | 'warm_gold' | 'monochrome' | 'pop_art';

export interface BackdropClipartLayer {
    id: string;
    type: 'clipart' | 'custom_image';
    clipartType: string;
    dataUrl?: string;
    x: number; // percentage 0-100
    y: number; // percentage 0-100
    width: number; // percentage of canvas
    height: number;
    rotation: number;
    opacity: number;
    flipH: boolean;
    flipV: boolean;
    visible: boolean;
    locked: boolean;

    // Jeitos e Estilos da Imagem (Formatos de Corte, Bordas, Sombras 3D e Filtros de Festa)
    maskShape?: ImageMaskShape;
    borderStyle?: ImageBorderStyle;
    borderWidth?: number; // 0 a 30
    borderColor?: string;
    shadowStyle?: ImageShadowStyle;
    filterTreatment?: ImageFilterTreatment;
    borderRadius?: number; // 0 a 50 (%)
    polaroidCaption?: string;
}

export type BackdropLayer = BackdropTextLayer | BackdropClipartLayer;

export interface BackdropState {
    sizePresetId: string;
    customWidthCm?: number;
    customHeightCm?: number;
    customShape?: PanelShape;
    themeId: string;
    backgroundColor: string;
    backgroundStyle: 'gradient' | 'clouds' | 'stars' | 'wood' | 'marble' | 'glitter' | 'safari' | 'underwater' | 'solid' | 'custom_bg';
    customBgUrl?: string;
    showBleedGuide: boolean; // Margem de sangria
    showSafetyGuide: boolean; // Margem de segurança
    showCenterAxes: boolean; // Eixos centrais
    showGrommets: boolean; // Ilhós para banners
    spotlightLight: boolean; // Efeito de iluminação central
    layers: BackdropLayer[];
}

/**
 * Procedural Party Clipart Library (SVGs / Canvas-rendered cliparts)
 * Balloons, floral arches, ribbons, crowns, stars, cakes, confetti
 */
export const PARTY_CLIPART_ITEMS = [
    {
        id: 'balloon_arch_gold_white',
        title: 'Arco de Balões Ouro & Branco',
        category: 'Balões',
        icon: '🎈',
        render: (ctx: CanvasRenderingContext2D, w: number, h: number) => {
            // Desenha guirlanda orgânica de balões no arco superior
            ctx.save();
            const colors = ['#fef08a', '#eab308', '#ffffff', '#cbd5e1', '#ca8a04'];
            for (let i = 0; i < 35; i++) {
                const angle = (i / 35) * Math.PI * 0.9 + 0.15;
                const r = w * 0.42 + (Math.sin(i * 3) * 20);
                const bx = w * 0.5 + Math.cos(angle + Math.PI) * r;
                const by = h * 0.5 + Math.sin(angle + Math.PI) * r;
                const radius = 24 + (i % 4) * 8;
                
                // Balão
                ctx.beginPath();
                ctx.ellipse(bx, by, radius, radius * 1.15, angle, 0, Math.PI * 2);
                const bGrad = ctx.createRadialGradient(bx - radius * 0.3, by - radius * 0.3, 2, bx, by, radius);
                const col = colors[i % colors.length];
                bGrad.addColorStop(0, '#ffffff');
                bGrad.addColorStop(0.3, col);
                bGrad.addColorStop(1, '#78350f');
                ctx.fillStyle = bGrad;
                ctx.fill();
            }
            ctx.restore();
        }
    },
    {
        id: 'balloon_arch_rose_pink',
        title: 'Arco de Balões Rosé & Pink',
        category: 'Balões',
        icon: '🎈',
        render: (ctx: CanvasRenderingContext2D, w: number, h: number) => {
            ctx.save();
            const colors = ['#f472b6', '#fb7185', '#ffffff', '#fbcfe8', '#db2777'];
            for (let i = 0; i < 35; i++) {
                const angle = (i / 35) * Math.PI * 0.9 + 0.15;
                const r = w * 0.42 + (Math.cos(i * 3) * 22);
                const bx = w * 0.5 + Math.cos(angle + Math.PI) * r;
                const by = h * 0.5 + Math.sin(angle + Math.PI) * r;
                const radius = 22 + (i % 3) * 9;
                
                ctx.beginPath();
                ctx.ellipse(bx, by, radius, radius * 1.15, angle, 0, Math.PI * 2);
                const bGrad = ctx.createRadialGradient(bx - radius * 0.3, by - radius * 0.3, 2, bx, by, radius);
                const col = colors[i % colors.length];
                bGrad.addColorStop(0, '#ffffff');
                bGrad.addColorStop(0.3, col);
                bGrad.addColorStop(1, '#831843');
                ctx.fillStyle = bGrad;
                ctx.fill();
            }
            ctx.restore();
        }
    },
    {
        id: 'balloon_arch_blue_silver',
        title: 'Arco de Balões Azul & Prata',
        category: 'Balões',
        icon: '🎈',
        render: (ctx: CanvasRenderingContext2D, w: number, h: number) => {
            ctx.save();
            const colors = ['#38bdf8', '#0284c7', '#ffffff', '#94a3b8', '#1e3a8a'];
            for (let i = 0; i < 35; i++) {
                const angle = (i / 35) * Math.PI * 0.9 + 0.15;
                const r = w * 0.42 + (Math.sin(i * 4) * 20);
                const bx = w * 0.5 + Math.cos(angle + Math.PI) * r;
                const by = h * 0.5 + Math.sin(angle + Math.PI) * r;
                const radius = 24 + (i % 4) * 8;
                
                ctx.beginPath();
                ctx.ellipse(bx, by, radius, radius * 1.15, angle, 0, Math.PI * 2);
                const bGrad = ctx.createRadialGradient(bx - radius * 0.3, by - radius * 0.3, 2, bx, by, radius);
                const col = colors[i % colors.length];
                bGrad.addColorStop(0, '#ffffff');
                bGrad.addColorStop(0.3, col);
                bGrad.addColorStop(1, '#0c4a6e');
                ctx.fillStyle = bGrad;
                ctx.fill();
            }
            ctx.restore();
        }
    },
    {
        id: 'gold_crown',
        title: 'Coroa Imperial Ouro',
        category: 'Realeza',
        icon: '👑',
        render: (ctx: CanvasRenderingContext2D, w: number, h: number) => {
            ctx.save();
            ctx.translate(w * 0.5, h * 0.5);
            const scale = Math.min(w, h) / 200;
            ctx.scale(scale, scale);

            // Coroa
            ctx.beginPath();
            ctx.moveTo(-60, 40);
            ctx.lineTo(-80, -30);
            ctx.lineTo(-30, 0);
            ctx.lineTo(0, -60);
            ctx.lineTo(30, 0);
            ctx.lineTo(80, -30);
            ctx.lineTo(60, 40);
            ctx.closePath();

            const cGrad = ctx.createLinearGradient(-80, -60, 80, 40);
            cGrad.addColorStop(0, '#fef08a');
            cGrad.addColorStop(0.4, '#eab308');
            cGrad.addColorStop(0.8, '#ca8a04');
            cGrad.addColorStop(1, '#a16207');
            ctx.fillStyle = cGrad;
            ctx.fill();
            ctx.lineWidth = 4;
            ctx.strokeStyle = '#ffffff';
            ctx.stroke();

            // Jóias
            [-75, -25, 0, 25, 75].forEach(x => {
                ctx.beginPath();
                ctx.arc(x, 20, 6, 0, Math.PI * 2);
                ctx.fillStyle = '#ef4444';
                ctx.fill();
                ctx.strokeStyle = '#ffffff';
                ctx.lineWidth = 2;
                ctx.stroke();
            });

            ctx.restore();
        }
    },
    {
        id: 'birthday_cake_candles',
        title: 'Bolo de Festa com Velas',
        category: 'Festa',
        icon: '🎂',
        render: (ctx: CanvasRenderingContext2D, w: number, h: number) => {
            ctx.save();
            ctx.translate(w * 0.5, h * 0.5);
            const scale = Math.min(w, h) / 220;
            ctx.scale(scale, scale);

            // Prato
            ctx.beginPath();
            ctx.ellipse(0, 70, 95, 20, 0, 0, Math.PI * 2);
            ctx.fillStyle = '#cbd5e1';
            ctx.fill();

            // Andar de Baixo do Bolo
            ctx.beginPath();
            ctx.roundRect(-80, 0, 160, 70, 12);
            ctx.fillStyle = '#fce7f3';
            ctx.fill();
            ctx.strokeStyle = '#f472b6';
            ctx.lineWidth = 4;
            ctx.stroke();

            // Cobertura do andar de baixo
            ctx.beginPath();
            ctx.roundRect(-80, 0, 160, 25, 8);
            ctx.fillStyle = '#f472b6';
            ctx.fill();

            // Andar de Cima do Bolo
            ctx.beginPath();
            ctx.roundRect(-55, -55, 110, 55, 10);
            ctx.fillStyle = '#fef08a';
            ctx.fill();
            ctx.strokeStyle = '#eab308';
            ctx.lineWidth = 4;
            ctx.stroke();

            // Cobertura do topo
            ctx.beginPath();
            ctx.roundRect(-55, -55, 110, 20, 6);
            ctx.fillStyle = '#fbbf24';
            ctx.fill();

            // 3 Velas
            [-30, 0, 30].forEach(vx => {
                ctx.fillStyle = '#38bdf8';
                ctx.fillRect(vx - 4, -80, 8, 25);
                // Chama
                ctx.beginPath();
                ctx.ellipse(vx, -90, 5, 10, 0, 0, Math.PI * 2);
                ctx.fillStyle = '#f97316';
                ctx.fill();
                ctx.beginPath();
                ctx.ellipse(vx, -89, 2.5, 6, 0, 0, Math.PI * 2);
                ctx.fillStyle = '#fef08a';
                ctx.fill();
            });

            ctx.restore();
        }
    },
    {
        id: 'golden_stars_burst',
        title: 'Explosão de Estrelas Douradas',
        category: 'Efeitos',
        icon: '⭐',
        render: (ctx: CanvasRenderingContext2D, w: number, h: number) => {
            ctx.save();
            const stars = [
                { x: w * 0.2, y: h * 0.3, r: 18 },
                { x: w * 0.8, y: h * 0.25, r: 24 },
                { x: w * 0.15, y: h * 0.7, r: 22 },
                { x: w * 0.85, y: h * 0.65, r: 20 },
                { x: w * 0.5, y: h * 0.15, r: 26 },
                { x: w * 0.35, y: h * 0.82, r: 16 },
                { x: w * 0.65, y: h * 0.85, r: 18 },
            ];

            stars.forEach(s => {
                drawStar(ctx, s.x, s.y, 5, s.r, s.r * 0.45);
            });
            ctx.restore();
        }
    },
    {
        id: 'festive_confetti',
        title: 'Chuva de Confetes & Serpentinas',
        category: 'Efeitos',
        icon: '🎊',
        render: (ctx: CanvasRenderingContext2D, w: number, h: number) => {
            ctx.save();
            const colors = ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#ec4899', '#8b5cf6', '#eab308'];
            for (let i = 0; i < 70; i++) {
                const cx = (Math.sin(i * 17) * 0.5 + 0.5) * w;
                const cy = (Math.cos(i * 23) * 0.5 + 0.5) * h;
                const rot = (i * 35 * Math.PI) / 180;
                ctx.save();
                ctx.translate(cx, cy);
                ctx.rotate(rot);
                ctx.fillStyle = colors[i % colors.length];
                if (i % 2 === 0) {
                    ctx.fillRect(-6, -3, 12, 6);
                } else {
                    ctx.beginPath();
                    ctx.arc(0, 0, 4, 0, Math.PI * 2);
                    ctx.fill();
                }
                ctx.restore();
            }
            ctx.restore();
        }
    },
    {
        id: 'tropical_foliage_frame',
        title: 'Folhagens Tropicais de Safari',
        category: 'Natureza',
        icon: '🍃',
        render: (ctx: CanvasRenderingContext2D, w: number, h: number) => {
            ctx.save();
            const leafColors = ['#15803d', '#166534', '#4ade80', '#22c55e'];
            // Folhas na borda inferior esquerda e direita
            const drawBranch = (baseX: number, baseY: number, dir: number) => {
                for (let k = 0; k < 8; k++) {
                    ctx.save();
                    ctx.translate(baseX + dir * k * 20, baseY - k * 16);
                    ctx.rotate((dir * (k * 15 - 20) * Math.PI) / 180);
                    ctx.beginPath();
                    ctx.ellipse(0, 0, 45, 18, 0, 0, Math.PI * 2);
                    ctx.fillStyle = leafColors[k % leafColors.length];
                    ctx.fill();
                    ctx.strokeStyle = '#ffffff';
                    ctx.lineWidth = 1.5;
                    ctx.stroke();
                    ctx.restore();
                }
            };
            drawBranch(w * 0.1, h * 0.85, 1);
            drawBranch(w * 0.9, h * 0.85, -1);
            ctx.restore();
        }
    }
];

function drawStar(ctx: CanvasRenderingContext2D, cx: number, cy: number, spikes: number, outerRadius: number, innerRadius: number) {
    let rot = (Math.PI / 2) * 3;
    let x = cx;
    let y = cy;
    const step = Math.PI / spikes;

    ctx.beginPath();
    ctx.moveTo(cx, cy - outerRadius);
    for (let i = 0; i < spikes; i++) {
        x = cx + Math.cos(rot) * outerRadius;
        y = cy + Math.sin(rot) * outerRadius;
        ctx.lineTo(x, y);
        rot += step;

        x = cx + Math.cos(rot) * innerRadius;
        y = cy + Math.sin(rot) * innerRadius;
        ctx.lineTo(x, y);
        rot += step;
    }
    ctx.lineTo(cx, cy - outerRadius);
    ctx.closePath();

    const starGrad = ctx.createRadialGradient(cx, cy, 2, cx, cy, outerRadius);
    starGrad.addColorStop(0, '#ffffff');
    starGrad.addColorStop(0.4, '#fef08a');
    starGrad.addColorStop(0.8, '#eab308');
    starGrad.addColorStop(1, '#ca8a04');
    ctx.fillStyle = starGrad;
    ctx.fill();
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = '#ffffff';
    ctx.stroke();
}

/**
 * Creates default initial state for Birthday Backdrop Creator
 */
export function createInitialBackdropState(): BackdropState {
    const defaultTheme = THEME_PRESETS[0];
    return {
        sizePresetId: 'circle_150', // Painel Redondo 1,50m
        themeId: defaultTheme.id,
        backgroundColor: '#fef08a',
        backgroundStyle: 'safari',
        showBleedGuide: true,
        showSafetyGuide: true,
        showCenterAxes: true,
        showGrommets: false,
        spotlightLight: true,
        layers: [
            // 1. Clipart de Balões
            {
                id: 'layer_balloon_arch',
                type: 'clipart',
                clipartType: 'balloon_arch_gold_white',
                x: 50,
                y: 50,
                width: 96,
                height: 96,
                rotation: 0,
                opacity: 1,
                flipH: false,
                flipV: false,
                visible: true,
                locked: false
            },
            // 2. Clipart de Folhagens
            {
                id: 'layer_foliage',
                type: 'clipart',
                clipartType: 'tropical_foliage_frame',
                x: 50,
                y: 85,
                width: 90,
                height: 35,
                rotation: 0,
                opacity: 1,
                flipH: false,
                flipV: false,
                visible: true,
                locked: false
            },
            // 3. Texto Nome do Aniversariante (Curvado em arco!)
            {
                id: 'layer_text_name',
                type: 'text',
                text: 'LORENZO',
                x: 50,
                y: 42,
                fontSize: 68,
                fontFamily: 'Arial Black',
                fontWeight: '900',
                textColor: '#ffffff',
                textAlign: 'center',
                isCurved: true,
                curveRadius: 280,
                curveDirection: 'up',
                strokeColor: '#78350f',
                strokeWidth: 8,
                secondaryStrokeColor: '#fbbf24',
                secondaryStrokeWidth: 16,
                gradientFill: true,
                gradientFrom: '#ffffff',
                gradientTo: '#fef08a',
                dropShadow: true,
                shadowColor: 'rgba(0,0,0,0.45)',
                shadowBlur: 16,
                shadowOffsetY: 10,
                rotation: 0,
                opacity: 1,
                visible: true,
                locked: false
            },
            // 4. Texto Idade
            {
                id: 'layer_text_age',
                type: 'text',
                text: '★ 1 ANINHO ★',
                x: 50,
                y: 55,
                fontSize: 32,
                fontFamily: 'Arial Black',
                fontWeight: 'bold',
                textColor: '#ffffff',
                textAlign: 'center',
                isCurved: false,
                curveRadius: 0,
                curveDirection: 'up',
                strokeColor: '#b45309',
                strokeWidth: 5,
                secondaryStrokeColor: '#15803d',
                secondaryStrokeWidth: 10,
                gradientFill: true,
                gradientFrom: '#fef08a',
                gradientTo: '#f59e0b',
                dropShadow: true,
                shadowColor: 'rgba(0,0,0,0.3)',
                shadowBlur: 8,
                shadowOffsetY: 4,
                rotation: 0,
                opacity: 1,
                visible: true,
                locked: false
            },
            // 5. Estrelas cintilantes
            {
                id: 'layer_stars',
                type: 'clipart',
                clipartType: 'golden_stars_burst',
                x: 50,
                y: 50,
                width: 90,
                height: 90,
                rotation: 0,
                opacity: 0.9,
                flipH: false,
                flipV: false,
                visible: true,
                locked: false
            }
        ]
    };
}

/**
 * Draws text in a circular arc on HTML5 Canvas
 */
export function drawArcText(
    ctx: CanvasRenderingContext2D,
    text: string,
    cx: number,
    cy: number,
    radius: number,
    angleSpreadRad: number = Math.PI * 0.6,
    upward: boolean = true
) {
    ctx.save();
    const len = text.length;
    if (len === 0) {
        ctx.restore();
        return;
    }

    const anglePerChar = angleSpreadRad / Math.max(1, len - 1);
    const startAngle = (upward ? -Math.PI / 2 : Math.PI / 2) - (angleSpreadRad / 2);

    for (let i = 0; i < len; i++) {
        const char = text[i];
        const charAngle = startAngle + i * anglePerChar;
        const charX = cx + Math.cos(charAngle) * radius;
        const charY = cy + Math.sin(charAngle) * radius;

        ctx.save();
        ctx.translate(charX, charY);
        ctx.rotate(charAngle + (upward ? Math.PI / 2 : -Math.PI / 2));
        ctx.fillText(char, 0, 0);
        ctx.strokeText(char, 0, 0);
        ctx.restore();
    }
    ctx.restore();
}

/**
 * Renders full high resolution backdrop canvas
 */
export async function renderBackdropToCanvas(
    state: BackdropState,
    targetWidthPx: number = 1800,
    customImageCache: Map<string, HTMLImageElement> = new Map()
): Promise<HTMLCanvasElement> {
    const preset = PANEL_SIZE_PRESETS.find(p => p.id === state.sizePresetId) || PANEL_SIZE_PRESETS[0];
    const widthCm = state.customWidthCm || preset.widthCm;
    const heightCm = state.customHeightCm || preset.heightCm;
    const shape = state.customShape || preset.shape;

    const aspect = heightCm / widthCm;
    const canvasWidth = targetWidthPx;
    const canvasHeight = Math.round(targetWidthPx * aspect);

    const canvas = document.createElement('canvas');
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return canvas;

    ctx.save();

    // 1. Clip path according to panel shape (Circle, Arch, Rectangle, Topper)
    if (shape === 'circle' || shape === 'cake_topper') {
        ctx.beginPath();
        ctx.arc(canvasWidth * 0.5, canvasHeight * 0.5, Math.min(canvasWidth, canvasHeight) * 0.495, 0, Math.PI * 2);
        ctx.clip();
    } else if (shape === 'arch') {
        const r = canvasWidth * 0.5;
        ctx.beginPath();
        ctx.moveTo(0, canvasHeight);
        ctx.lineTo(0, r);
        ctx.arc(r, r, r, Math.PI, 0, false);
        ctx.lineTo(canvasWidth, canvasHeight);
        ctx.closePath();
        ctx.clip();
    }

    // 2. Render Backdrop Texture / Background
    await renderBackground(ctx, canvasWidth, canvasHeight, state, customImageCache);

    // 3. Render Spotlight Lighting Effect
    if (state.spotlightLight) {
        ctx.save();
        const spot = ctx.createRadialGradient(
            canvasWidth * 0.5, canvasHeight * 0.45, 10,
            canvasWidth * 0.5, canvasHeight * 0.5, canvasWidth * 0.65
        );
        spot.addColorStop(0, 'rgba(255, 255, 255, 0.35)');
        spot.addColorStop(0.5, 'rgba(255, 255, 255, 0.08)');
        spot.addColorStop(1, 'rgba(0, 0, 0, 0.25)');
        ctx.fillStyle = spot;
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);
        ctx.restore();
    }

    // 4. Render Layers in Order
    for (const layer of state.layers) {
        if (!layer.visible) continue;

        const lx = (layer.x / 100) * canvasWidth;
        const ly = (layer.y / 100) * canvasHeight;

        ctx.save();
        ctx.globalAlpha = layer.opacity;
        ctx.translate(lx, ly);
        if (layer.rotation) {
            ctx.rotate((layer.rotation * Math.PI) / 180);
        }

        if (layer.type === 'text') {
            renderTextLayer(ctx, layer, canvasWidth, canvasHeight);
        } else if (layer.type === 'clipart') {
            const item = PARTY_CLIPART_ITEMS.find(c => c.id === layer.clipartType);
            if (item) {
                const lw = (layer.width / 100) * canvasWidth;
                const lh = (layer.height / 100) * canvasHeight;
                ctx.translate(-lw * 0.5, -lh * 0.5);
                if (layer.flipH) {
                    ctx.translate(lw, 0);
                    ctx.scale(-1, 1);
                }
                if (layer.flipV) {
                    ctx.translate(0, lh);
                    ctx.scale(1, -1);
                }
                item.render(ctx, lw, lh);
            }
        } else if (layer.type === 'custom_image' && layer.dataUrl) {
            let img = customImageCache.get(layer.dataUrl);
            if (!img) {
                img = new Image();
                img.src = layer.dataUrl;
                await new Promise((res) => { img!.onload = res; img!.onerror = res; });
                customImageCache.set(layer.dataUrl, img);
            }
            if (img.complete && img.naturalWidth > 0) {
                const lw = (layer.width / 100) * canvasWidth;
                const lh = (layer.height / 100) * canvasHeight;
                ctx.translate(-lw * 0.5, -lh * 0.5);
                if (layer.flipH) {
                    ctx.translate(lw, 0);
                    ctx.scale(-1, 1);
                }
                if (layer.flipV) {
                    ctx.translate(0, lh);
                    ctx.scale(1, -1);
                }
                renderStyledCustomImage(ctx, layer, img, lw, lh);
            }
        }

        ctx.restore();
    }

    ctx.restore(); // Restaura clip geral

    // 5. Draw Technical Guides (Sangria, Segurança, Eixos) se ativadas
    renderTechnicalGuides(ctx, canvasWidth, canvasHeight, preset, state, shape);

    return canvas;
}

/**
 * Renderiza foto/imagem do usuário com suporte a todos os "Jeitos da Imagem":
 * Formatos de corte (Círculo, Arco, Coração, Estrela, Polaroid, Hexágono, Cantos arredondados),
 * Bordas (Adesivo die-cut branco, glitter dourado, rosé gold, neon),
 * Sombras 3D e Brilhos,
 * Filtros de Festa (Vívido, Aquarela/Pastel, Dourado, P&B, Pop Art).
 */
function renderStyledCustomImage(
    ctx: CanvasRenderingContext2D,
    layer: BackdropClipartLayer,
    img: HTMLImageElement,
    lw: number,
    lh: number
) {
    ctx.save();

    // 1. Sombra / Brilho 3D
    if (layer.shadowStyle && layer.shadowStyle !== 'none') {
        if (layer.shadowStyle === 'soft_3d') {
            ctx.shadowColor = 'rgba(0, 0, 0, 0.45)';
            ctx.shadowBlur = Math.round(lw * 0.05);
            ctx.shadowOffsetY = Math.round(lh * 0.03);
        } else if (layer.shadowStyle === 'floating') {
            ctx.shadowColor = 'rgba(0, 0, 0, 0.65)';
            ctx.shadowBlur = Math.round(lw * 0.09);
            ctx.shadowOffsetY = Math.round(lh * 0.06);
        } else if (layer.shadowStyle === 'gold_glow') {
            ctx.shadowColor = 'rgba(234, 179, 8, 0.9)';
            ctx.shadowBlur = Math.round(lw * 0.08);
            ctx.shadowOffsetY = 0;
        } else if (layer.shadowStyle === 'neon_glow') {
            ctx.shadowColor = 'rgba(236, 72, 153, 0.9)';
            ctx.shadowBlur = Math.round(lw * 0.08);
            ctx.shadowOffsetY = 0;
        }
    }

    const mask = layer.maskShape || 'none';
    const borderStyle = layer.borderStyle || 'none';
    const baseBorderWidth = (layer.borderWidth !== undefined ? layer.borderWidth : (borderStyle === 'white_sticker' ? 10 : 4));
    const borderWidth = Math.max(0, baseBorderWidth * (lw / 300));
    const borderRadius = (layer.borderRadius || 0) * (Math.min(lw, lh) * 0.01);

    // 2. Filtros Visuais de Festa
    if (layer.filterTreatment && layer.filterTreatment !== 'none') {
        if (layer.filterTreatment === 'vibrant') {
            ctx.filter = 'saturate(135%) contrast(110%) brightness(103%)';
        } else if (layer.filterTreatment === 'pastel') {
            ctx.filter = 'saturate(85%) brightness(108%) contrast(95%)';
        } else if (layer.filterTreatment === 'warm_gold') {
            ctx.filter = 'sepia(25%) saturate(125%) brightness(105%)';
        } else if (layer.filterTreatment === 'monochrome') {
            ctx.filter = 'grayscale(100%) contrast(112%)';
        } else if (layer.filterTreatment === 'pop_art') {
            ctx.filter = 'saturate(180%) contrast(130%)';
        }
    }

    // Função geradora do caminho da forma (para clip e contorno)
    const createShapePath = (context: CanvasRenderingContext2D, inset: number = 0) => {
        const x = inset;
        const y = inset;
        const w = Math.max(1, lw - inset * 2);
        const h = Math.max(1, lh - inset * 2);

        context.beginPath();
        if (mask === 'circle') {
            context.arc(lw * 0.5, lh * 0.5, Math.min(w, h) * 0.5, 0, Math.PI * 2);
        } else if (mask === 'arch') {
            const r = w * 0.5;
            context.moveTo(x, y + h);
            context.lineTo(x, y + r);
            context.arc(x + r, y + r, r, Math.PI, 0, false);
            context.lineTo(x + w, y + h);
            context.closePath();
        } else if (mask === 'heart') {
            const hx = lw * 0.5;
            const hy = lh * 0.35;
            const size = Math.min(w, h) * 0.48;
            context.moveTo(hx, hy + size * 0.75);
            context.bezierCurveTo(hx + size, hy + size * 0.35, hx + size, hy - size * 0.55, hx, hy - size * 0.35);
            context.bezierCurveTo(hx - size, hy - size * 0.55, hx - size, hy + size * 0.35, hx, hy + size * 0.75);
            context.closePath();
        } else if (mask === 'star') {
            const cx = lw * 0.5;
            const cy = lh * 0.5;
            const outerR = Math.min(w, h) * 0.5;
            const innerR = outerR * 0.42;
            const points = 5;
            for (let i = 0; i < points * 2; i++) {
                const r = i % 2 === 0 ? outerR : innerR;
                const angle = (i * Math.PI) / points - Math.PI / 2;
                const px = cx + Math.cos(angle) * r;
                const py = cy + Math.sin(angle) * r;
                if (i === 0) context.moveTo(px, py);
                else context.lineTo(px, py);
            }
            context.closePath();
        } else if (mask === 'hexagon') {
            const cx = lw * 0.5;
            const cy = lh * 0.5;
            const r = Math.min(w, h) * 0.48;
            for (let i = 0; i < 6; i++) {
                const angle = (i * Math.PI) / 3 - Math.PI / 6;
                const px = cx + Math.cos(angle) * r;
                const py = cy + Math.sin(angle) * r;
                if (i === 0) context.moveTo(px, py);
                else context.lineTo(px, py);
            }
            context.closePath();
        } else if (mask === 'polaroid') {
            context.rect(x, y, w, h);
        } else {
            // Forma retangular normal com borderRadius opcional
            if (borderRadius > 0 && typeof context.roundRect === 'function') {
                const r = Math.min(borderRadius, w * 0.5, h * 0.5);
                context.roundRect(x, y, w, h, r);
            } else {
                context.rect(x, y, w, h);
            }
        }
    };

    if (mask === 'polaroid') {
        // Moldura Polaroid clássica de festa com base para nome/data
        const pad = lw * 0.06;
        const bottomPad = lh * 0.22;

        // Base de papel branco polaroid
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.rect(0, 0, lw, lh);
        ctx.fill();

        // Foto recortada dentro
        ctx.save();
        ctx.beginPath();
        ctx.rect(pad, pad, lw - pad * 2, lh - pad - bottomPad);
        ctx.clip();
        ctx.drawImage(img, pad, pad, lw - pad * 2, lh - pad - bottomPad);
        ctx.restore();

        // Contorno sutil de papel
        ctx.strokeStyle = '#e2e8f0';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(0, 0, lw, lh);

        // Legenda Polaroid
        if (layer.polaroidCaption) {
            ctx.font = `italic bold ${Math.round(bottomPad * 0.38)}px 'Caveat', 'Comic Sans MS', cursive, sans-serif`;
            ctx.fillStyle = '#1e293b';
            ctx.textAlign = 'center';
            ctx.fillText(layer.polaroidCaption, lw * 0.5, lh - bottomPad * 0.35);
        }
    } else {
        // Se houver borda die-cut de adesivo (white_sticker), desenha contorno grosso antes
        if (borderStyle === 'white_sticker' && borderWidth > 0) {
            ctx.save();
            ctx.lineWidth = borderWidth * 2;
            ctx.lineJoin = 'round';
            ctx.lineCap = 'round';
            ctx.strokeStyle = '#ffffff';
            createShapePath(ctx, 0);
            ctx.stroke();
            ctx.restore();
        }

        // Desenha a imagem recortada pela forma
        ctx.save();
        createShapePath(ctx, 0);
        ctx.clip();
        ctx.drawImage(img, 0, 0, lw, lh);
        ctx.restore();

        // Desenha a borda por cima
        if (borderStyle !== 'none' && borderWidth > 0) {
            ctx.save();
            ctx.lineWidth = borderWidth;
            ctx.lineJoin = 'round';
            ctx.lineCap = 'round';

            if (borderStyle === 'white_sticker') {
                ctx.strokeStyle = '#ffffff';
            } else if (borderStyle === 'gold_glitter') {
                const grad = ctx.createLinearGradient(0, 0, lw, lh);
                grad.addColorStop(0, '#fef08a');
                grad.addColorStop(0.3, '#d97706');
                grad.addColorStop(0.6, '#fef9c3');
                grad.addColorStop(1, '#b45309');
                ctx.strokeStyle = grad;
            } else if (borderStyle === 'rose_gold') {
                const grad = ctx.createLinearGradient(0, 0, lw, lh);
                grad.addColorStop(0, '#fce7f3');
                grad.addColorStop(0.5, '#fb7185');
                grad.addColorStop(1, '#be185d');
                ctx.strokeStyle = grad;
            } else if (borderStyle === 'neon') {
                ctx.strokeStyle = '#38bdf8';
            } else if (borderStyle === 'custom') {
                ctx.strokeStyle = layer.borderColor || '#ffffff';
            }

            createShapePath(ctx, borderWidth * 0.5);
            ctx.stroke();
            ctx.restore();
        }
    }

    ctx.restore();
}

async function renderBackground(
    ctx: CanvasRenderingContext2D,
    w: number,
    h: number,
    state: BackdropState,
    customImageCache: Map<string, HTMLImageElement>
) {
    const style = state.backgroundStyle;

    if (style === 'custom_bg' && state.customBgUrl) {
        let img = customImageCache.get(state.customBgUrl);
        if (!img) {
            img = new Image();
            img.src = state.customBgUrl;
            await new Promise((res) => { img!.onload = res; img!.onerror = res; });
            customImageCache.set(state.customBgUrl, img);
        }
        if (img.complete && img.naturalWidth > 0) {
            // Desenha com preenchimento cover mantendo proporção
            const scale = Math.max(w / img.naturalWidth, h / img.naturalHeight);
            const nw = img.naturalWidth * scale;
            const nh = img.naturalHeight * scale;
            const ox = (w - nw) / 2;
            const oy = (h - nh) / 2;
            ctx.drawImage(img, ox, oy, nw, nh);
            return;
        }
    }

    if (style === 'gradient') {
        const grad = ctx.createLinearGradient(0, 0, 0, h);
        grad.addColorStop(0, '#fef08a');
        grad.addColorStop(0.5, '#f472b6');
        grad.addColorStop(1, '#818cf8');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);
    } else if (style === 'clouds') {
        const grad = ctx.createLinearGradient(0, 0, 0, h);
        grad.addColorStop(0, '#fbcfe8');
        grad.addColorStop(0.6, '#fce7f3');
        grad.addColorStop(1, '#e0f2fe');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);

        // Nuvens estilizadas
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        for (let i = 0; i < 8; i++) {
            const cx = (i * 0.14) * w + w * 0.05;
            const cy = (Math.sin(i * 2) * 0.2 + 0.5) * h;
            ctx.beginPath();
            ctx.arc(cx, cy, w * 0.08, 0, Math.PI * 2);
            ctx.arc(cx + w * 0.06, cy - w * 0.02, w * 0.06, 0, Math.PI * 2);
            ctx.arc(cx - w * 0.05, cy + w * 0.01, w * 0.05, 0, Math.PI * 2);
            ctx.fill();
        }
    } else if (style === 'stars') {
        const grad = ctx.createRadialGradient(w * 0.5, h * 0.5, 10, w * 0.5, h * 0.5, w * 0.7);
        grad.addColorStop(0, '#1e1b4b');
        grad.addColorStop(0.6, '#0f172a');
        grad.addColorStop(1, '#020617');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);

        // Pontos de estrelas
        ctx.fillStyle = '#ffffff';
        for (let i = 0; i < 150; i++) {
            const sx = (Math.sin(i * 37) * 0.5 + 0.5) * w;
            const sy = (Math.cos(i * 41) * 0.5 + 0.5) * h;
            ctx.beginPath();
            ctx.arc(sx, sy, (i % 3 === 0 ? 2 : 1), 0, Math.PI * 2);
            ctx.fill();
        }
    } else if (style === 'wood') {
        const grad = ctx.createLinearGradient(0, 0, 0, h);
        grad.addColorStop(0, '#78350f');
        grad.addColorStop(0.5, '#451a03');
        grad.addColorStop(1, '#291002');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);

        // Ripas de madeira
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.4)';
        ctx.lineWidth = 3;
        for (let y = 0; y < h; y += h * 0.08) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(w, y);
            ctx.stroke();
        }
    } else if (style === 'glitter') {
        const grad = ctx.createRadialGradient(w * 0.5, h * 0.4, 20, w * 0.5, h * 0.5, w * 0.8);
        grad.addColorStop(0, '#fef08a');
        grad.addColorStop(0.3, '#ca8a04');
        grad.addColorStop(0.7, '#854d0e');
        grad.addColorStop(1, '#1c1917');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);

        // Pontos de glitter brilhante
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        for (let i = 0; i < 100; i++) {
            const gx = (Math.sin(i * 53) * 0.5 + 0.5) * w;
            const gy = (Math.cos(i * 59) * 0.5 + 0.5) * h;
            ctx.beginPath();
            ctx.arc(gx, gy, 1.5 + (i % 3), 0, Math.PI * 2);
            ctx.fill();
        }
    } else if (style === 'safari') {
        const grad = ctx.createLinearGradient(0, 0, 0, h);
        grad.addColorStop(0, '#fef9c3');
        grad.addColorStop(0.6, '#fef08a');
        grad.addColorStop(1, '#d97706');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);
    } else if (style === 'underwater') {
        const grad = ctx.createLinearGradient(0, 0, 0, h);
        grad.addColorStop(0, '#a5f3fc');
        grad.addColorStop(0.4, '#38bdf8');
        grad.addColorStop(1, '#0369a1');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);
    } else {
        ctx.fillStyle = state.backgroundColor;
        ctx.fillRect(0, 0, w, h);
    }
}

function renderTextLayer(
    ctx: CanvasRenderingContext2D,
    layer: BackdropTextLayer,
    canvasW: number,
    canvasH: number
) {
    const scale = canvasW / 1800;
    const computedFontSize = Math.round(layer.fontSize * scale);
    ctx.font = `${layer.fontWeight} ${computedFontSize}px ${layer.fontFamily}, sans-serif`;
    ctx.textAlign = layer.textAlign;
    ctx.textBaseline = 'middle';

    // 1. Sombra Projetada
    if (layer.dropShadow) {
        ctx.shadowColor = layer.shadowColor;
        ctx.shadowBlur = layer.shadowBlur * scale;
        ctx.shadowOffsetY = layer.shadowOffsetY * scale;
    } else {
        ctx.shadowColor = 'transparent';
    }

    // 2. Contorno Secundário (Externo / Borda Grossa)
    if (layer.secondaryStrokeWidth > 0) {
        ctx.lineWidth = layer.secondaryStrokeWidth * scale;
        ctx.strokeStyle = layer.secondaryStrokeColor;
        ctx.lineJoin = 'round';
        ctx.miterLimit = 2;
        if (layer.isCurved) {
            drawArcText(ctx, layer.text, 0, 0, layer.curveRadius * scale, Math.PI * 0.6, layer.curveDirection === 'up');
        } else {
            ctx.strokeText(layer.text, 0, 0);
        }
    }

    // 3. Contorno Primário
    if (layer.strokeWidth > 0) {
        ctx.lineWidth = layer.strokeWidth * scale;
        ctx.strokeStyle = layer.strokeColor;
        ctx.lineJoin = 'round';
        ctx.miterLimit = 2;
        if (layer.isCurved) {
            drawArcText(ctx, layer.text, 0, 0, layer.curveRadius * scale, Math.PI * 0.6, layer.curveDirection === 'up');
        } else {
            ctx.strokeText(layer.text, 0, 0);
        }
    }

    // 4. Preenchimento de Cor ou Gradiente
    if (layer.gradientFill) {
        const textMetrics = ctx.measureText(layer.text);
        const tWidth = textMetrics.width;
        const grad = ctx.createLinearGradient(-tWidth * 0.5, -computedFontSize * 0.5, tWidth * 0.5, computedFontSize * 0.5);
        grad.addColorStop(0, layer.gradientFrom);
        grad.addColorStop(1, layer.gradientTo);
        ctx.fillStyle = grad;
    } else {
        ctx.fillStyle = layer.textColor;
    }

    if (layer.isCurved) {
        drawArcText(ctx, layer.text, 0, 0, layer.curveRadius * scale, Math.PI * 0.6, layer.curveDirection === 'up');
    } else {
        ctx.fillText(layer.text, 0, 0);
    }
}

function renderTechnicalGuides(
    ctx: CanvasRenderingContext2D,
    w: number,
    h: number,
    preset: PanelSizePreset,
    state: BackdropState,
    shape: PanelShape
) {
    const scale = w / preset.widthCm;
    const bleedPx = preset.bleedMarginCm * scale;
    const safetyPx = preset.safetyMarginCm * scale;

    ctx.save();

    // 1. Linha de Sangria (Vermelha pontilhada - limite de costura / elástico)
    if (state.showBleedGuide) {
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 2.5;
        ctx.setLineDash([8, 6]);

        if (shape === 'circle' || shape === 'cake_topper') {
            ctx.beginPath();
            ctx.arc(w * 0.5, h * 0.5, (w * 0.5) - bleedPx, 0, Math.PI * 2);
            ctx.stroke();
        } else if (shape === 'arch') {
            const r = (w - bleedPx * 2) * 0.5;
            ctx.beginPath();
            ctx.moveTo(bleedPx, h - bleedPx);
            ctx.lineTo(bleedPx, bleedPx + r);
            ctx.arc(w * 0.5, bleedPx + r, r, Math.PI, 0, false);
            ctx.lineTo(w - bleedPx, h - bleedPx);
            ctx.stroke();
        } else {
            ctx.strokeRect(bleedPx, bleedPx, w - bleedPx * 2, h - bleedPx * 2);
        }
    }

    // 2. Linha de Segurança (Verde pontilhada - elementos principais devem ficar dentro dela)
    if (state.showSafetyGuide) {
        ctx.strokeStyle = '#22c55e';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);

        const safeMargin = bleedPx + safetyPx;
        if (shape === 'circle' || shape === 'cake_topper') {
            ctx.beginPath();
            ctx.arc(w * 0.5, h * 0.5, (w * 0.5) - safeMargin, 0, Math.PI * 2);
            ctx.stroke();
        } else {
            ctx.strokeRect(safeMargin, safeMargin, w - safeMargin * 2, h - safeMargin * 2);
        }
    }

    // 3. Eixos Centrais (Ciano sutil)
    if (state.showCenterAxes) {
        ctx.strokeStyle = 'rgba(6, 182, 212, 0.4)';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([4, 4]);

        // Eixo Vertical
        ctx.beginPath();
        ctx.moveTo(w * 0.5, 0);
        ctx.lineTo(w * 0.5, h);
        ctx.stroke();

        // Eixo Horizontal
        ctx.beginPath();
        ctx.moveTo(0, h * 0.5);
        ctx.lineTo(w, h * 0.5);
        ctx.stroke();
    }

    ctx.restore();
}

/**
 * Downloads backdrop in user-selected format (PDF, PNG, JPG, WEBP)
 */
export async function downloadBackdrop(
    canvas: HTMLCanvasElement,
    format: 'pdf' | 'png' | 'jpeg' | 'webp',
    baseFilename: string,
    preset: PanelSizePreset,
    includeSpecsSheet: boolean = true
) {
    const filename = `${baseFilename}-${preset.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}.${format === 'jpeg' ? 'jpg' : format}`;

    if (format === 'pdf') {
        // Gera PDF em alta definição com medidas reais da gráfica
        const jpegUrl = canvas.toDataURL('image/jpeg', 0.95);
        const pdfBlob = createBackdropPdfBlob(jpegUrl, canvas.width, canvas.height, preset.widthCm, preset.heightCm, preset.name);
        triggerDownloadBlob(pdfBlob, filename);
    } else {
        const mime = format === 'png' ? 'image/png' : format === 'webp' ? 'image/webp' : 'image/jpeg';
        canvas.toBlob((blob) => {
            if (blob) {
                triggerDownloadBlob(blob, filename);
            } else {
                const dataUrl = canvas.toDataURL(mime, 0.95);
                triggerDownloadDataUrl(dataUrl, filename);
            }
        }, mime, 0.95);
    }
}

function triggerDownloadBlob(blob: Blob, filename: string) {
    const url = URL.createObjectURL(blob);
    triggerDownloadDataUrl(url, filename);
    setTimeout(() => URL.revokeObjectURL(url), 20000);
}

function triggerDownloadDataUrl(url: string, filename: string) {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
        if (link.parentNode) link.parentNode.removeChild(link);
    }, 500);
}

/**
 * Generates a standard PDF document with the backdrop image and real print measurements in CM
 */
function createBackdropPdfBlob(
    jpegDataUrl: string,
    imgWidthPx: number,
    imgHeightPx: number,
    widthCm: number,
    heightCm: number,
    panelName: string
): Blob {
    const base64Data = jpegDataUrl.split(',')[1];
    const binaryJpeg = atob(base64Data);
    const jpegBytes = new Uint8Array(binaryJpeg.length);
    for (let i = 0; i < binaryJpeg.length; i++) {
        jpegBytes[i] = binaryJpeg.charCodeAt(i);
    }

    // 1 pt = 1/72 inch; 1 cm = 28.3465 pt
    const ptWidth = Math.round(widthCm * 28.3465);
    const ptHeight = Math.round(heightCm * 28.3465);

    const encoder = new TextEncoder();
    const parts: Uint8Array[] = [];

    const header = `%PDF-1.4\n%\xFF\xFF\xFF\xFF\n`;
    parts.push(encoder.encode(header));

    const offsets: number[] = [0];
    let currentOffset = header.length;

    function addObj(content: string, binaryStream?: Uint8Array): number {
        const objNum = offsets.length;
        offsets.push(currentOffset);
        let full = `${objNum} 0 obj\n${content}\nendobj\n`;
        if (binaryStream) {
            const prefix = `${objNum} 0 obj\n${content}\nstream\n`;
            const postfix = `\nendstream\nendobj\n`;
            const pBytes = encoder.encode(prefix);
            const postBytes = encoder.encode(postfix);
            parts.push(pBytes);
            parts.push(binaryStream);
            parts.push(postBytes);
            currentOffset += pBytes.length + binaryStream.length + postBytes.length;
            return objNum;
        } else {
            const b = encoder.encode(full);
            parts.push(b);
            currentOffset += b.length;
            return objNum;
        }
    }

    // Obj 1: Catalog
    addObj(`<< /Type /Catalog /Pages 2 0 R >>`);

    // Obj 2: Pages
    addObj(`<< /Type /Pages /Kids [3 0 R] /Count 1 >>`);

    // Obj 3: Page
    addObj(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${ptWidth} ${ptHeight}] /Resources << /XObject << /Im0 4 0 R >> >> /Contents 5 0 R >>`);

    // Obj 4: Image XObject
    addObj(
        `<< /Type /XObject /Subtype /Image /Width ${imgWidthPx} /Height ${imgHeightPx} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${jpegBytes.length} >>`,
        jpegBytes
    );

    // Obj 5: Content stream
    const streamContent = `q\n${ptWidth} 0 0 ${ptHeight} 0 0 cm\n/Im0 Do\nQ\n`;
    const sBytes = encoder.encode(streamContent);
    addObj(`<< /Length ${sBytes.length} >>`, sBytes);

    // XREF table
    const startXref = currentOffset;
    let xref = `xref\n0 ${offsets.length}\n0000000000 65535 f \n`;
    for (let i = 1; i < offsets.length; i++) {
        const offStr = String(offsets[i]).padStart(10, '0');
        xref += `${offStr} 00000 n \n`;
    }
    xref += `trailer\n<< /Size ${offsets.length} /Root 1 0 R >>\nstartxref\n${startXref}\n%%EOF\n`;
    parts.push(encoder.encode(xref));

    return new Blob(parts, { type: 'application/pdf' });
}
