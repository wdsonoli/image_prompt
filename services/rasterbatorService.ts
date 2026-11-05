/**
 * rasterbatorService.ts
 * Motor completo do The Rasterbator (https://rasterbator.net)
 * Cria pôsteres gigantes divididos em folhas A4/A3 com efeito Halftone (meio-tom reticulado)
 * ou ampliação direta em mosaico com marcas de corte, sobreposição e coordenadas de montagem.
 */

import { jsPDF } from 'jspdf';
import JSZip from 'jszip';
import { PAPER_DIMENSIONS, PaperFormat, PaperOrientation } from './panelSplitterService';
import { downloadBlob, downloadFile } from '../utils/downloadHelper';

export type RasterStyle = 'rasterbation' | 'no_effects' | 'bw_rasterbation';

export type HalftoneMode = 'interlaced' | 'grid' | 'lines' | 'squares' | 'diamonds';

export type DotShape = 'circle' | 'square' | 'diamond' | 'triangle';

export type RasterColorMode = 'multicolor' | 'black' | 'single_color';

export type BackgroundColorMode = 'white' | 'black' | 'single_color' | 'transparent';

export interface RasterPalettePreset {
    id: string;
    name: string;
    description: string;
    primaryColor: string;
    secondaryColor: string;
    backgroundColor: string;
    colors: string[]; // Cores do gradiente/paleta
}

export const RASTER_PALETTES: RasterPalettePreset[] = [
    {
        id: 'original',
        name: 'Multicolor Original',
        description: 'Cores naturais e fiéis da imagem',
        primaryColor: '#000000',
        secondaryColor: '#ffffff',
        backgroundColor: '#ffffff',
        colors: ['#000000', '#ffffff'],
    },
    {
        id: 'classic_bw',
        name: 'The Original B&W',
        description: 'Pontos pretos clássicos no fundo branco',
        primaryColor: '#000000',
        secondaryColor: '#334155',
        backgroundColor: '#ffffff',
        colors: ['#000000', '#ffffff'],
    },
    {
        id: 'invert_bw',
        name: 'Invertido (Dark)',
        description: 'Pontos brancos sobre fundo preto fosco',
        primaryColor: '#ffffff',
        secondaryColor: '#94a3b8',
        backgroundColor: '#0a0a0a',
        colors: ['#ffffff', '#0a0a0a'],
    },
    {
        id: 'pop_art',
        name: 'Pop Art Warhol',
        description: 'Amarelo vibrante, ciano e magenta',
        primaryColor: '#ec4899',
        secondaryColor: '#06b6d4',
        backgroundColor: '#fef08a',
        colors: ['#ec4899', '#06b6d4', '#eab308'],
    },
    {
        id: 'cyberpunk',
        name: 'Cyberpunk Neon',
        description: 'Ciano neon e rosa choque em fundo escuro',
        primaryColor: '#06b6d4',
        secondaryColor: '#f43f5e',
        backgroundColor: '#0f172a',
        colors: ['#06b6d4', '#f43f5e', '#0f172a'],
    },
    {
        id: 'retro_sepia',
        name: 'Retrô Sépia',
        description: 'Tons quentes de papel envelhecido e café',
        primaryColor: '#451a03',
        secondaryColor: '#92400e',
        backgroundColor: '#fef3c7',
        colors: ['#451a03', '#92400e', '#fef3c7'],
    },
    {
        id: 'matrix_green',
        name: 'Terminal Verde',
        description: 'Visual hacker phosphor verde dos anos 80',
        primaryColor: '#22c55e',
        secondaryColor: '#15803d',
        backgroundColor: '#022c22',
        colors: ['#22c55e', '#022c22'],
    },
    {
        id: 'blueprint',
        name: 'Blueprint Cianótipo',
        description: 'Pontos brancos e celestes sobre azul arquitetura',
        primaryColor: '#e0f2fe',
        secondaryColor: '#38bdf8',
        backgroundColor: '#1e3a8a',
        colors: ['#e0f2fe', '#1e3a8a'],
    },
    {
        id: 'sunset_vibes',
        name: 'Sunset Laranja',
        description: 'Gradiente de pôr do sol violeta e dourado',
        primaryColor: '#ea580c',
        secondaryColor: '#db2777',
        backgroundColor: '#fff7ed',
        colors: ['#ea580c', '#db2777', '#fff7ed'],
    },
    {
        id: 'vintage_comic',
        name: 'HQ / Comic Book',
        description: 'Pontos Ben-Day de histórias em quadrinhos clássicas',
        primaryColor: '#dc2626',
        secondaryColor: '#2563eb',
        backgroundColor: '#fafaf9',
        colors: ['#dc2626', '#2563eb', '#facc15', '#fafaf9'],
    },
];

export interface RasterbatorConfig {
    // 1. Papel & Tamanho
    paperFormat: PaperFormat;
    paperOrientation: PaperOrientation;
    marginMm: number; // Margem nas bordas (padrão 10mm)
    overlapMm: number; // Sobreposição de colagem (padrão 5mm)
    defineSizeBy: 'sheets_wide' | 'sheets_high' | 'total_width_cm';
    sheetsWide: number;
    sheetsHigh: number;
    totalWidthCm: number;

    // 2. Estilo
    style: RasterStyle;

    // 3. Cores
    rasterColorMode: RasterColorMode;
    singleRasterColor: string;
    backgroundColorMode: BackgroundColorMode;
    singleBackgroundColor: string;
    selectedPaletteId: string;

    // 4. Opções de Halftone
    halftoneMode: HalftoneMode; // interlaced (alternating columns) ou grid
    dotShape: DotShape;
    gridSizeMm: number; // Tamanho da célula (5mm a 25mm)
    minDotPercent: number; // 0%
    maxDotPercent: number; // 100%

    // 5. Outros
    showCropMarks: boolean; // Marcas de corte
    showPagePosition: boolean; // Coordenadas nas páginas (A1, B2)
    showPageNumbering: boolean; // Folha 1 de 12
    humanScaleReference: boolean; // Mostrar silhueta humana no preview
}

export const DEFAULT_RASTERBATOR_CONFIG: RasterbatorConfig = {
    paperFormat: 'A4',
    paperOrientation: 'portrait',
    marginMm: 10,
    overlapMm: 5,
    defineSizeBy: 'sheets_wide',
    sheetsWide: 4,
    sheetsHigh: 3,
    totalWidthCm: 84,

    style: 'rasterbation',

    rasterColorMode: 'multicolor',
    singleRasterColor: '#000000',
    backgroundColorMode: 'white',
    singleBackgroundColor: '#ffffff',
    selectedPaletteId: 'original',

    halftoneMode: 'interlaced',
    dotShape: 'circle',
    gridSizeMm: 10,
    minDotPercent: 0,
    maxDotPercent: 100,

    showCropMarks: true,
    showPagePosition: true,
    showPageNumbering: true,
    humanScaleReference: true,
};

export interface RasterSheet {
    index: number;
    row: number; // 1-based
    col: number; // 1-based
    posCode: string; // ex: "A1", "A2", "B1"
    xMm: number;
    yMm: number;
    widthMm: number;
    heightMm: number;
}

export interface RasterCalculationResult {
    cols: number;
    rows: number;
    totalSheets: number;
    posterWidthMm: number;
    posterHeightMm: number;
    posterWidthCm: number;
    posterHeightCm: number;
    paperWidthMm: number;
    paperHeightMm: number;
    printableWidthMm: number;
    printableHeightMm: number;
    sheets: RasterSheet[];
}

/**
 * Converte número de coluna para letra (1 = A, 2 = B, 27 = AA...)
 */
export function colToLetter(colIndex: number): string {
    let letter = '';
    let temp = colIndex;
    while (temp > 0) {
        const mod = (temp - 1) % 26;
        letter = String.fromCharCode(65 + mod) + letter;
        temp = Math.floor((temp - mod) / 26);
    }
    return letter || 'A';
}

/**
 * Calcula dimensões e quantidade de páginas do Rasterbator
 */
export function calculateRasterbatorLayout(
    imageWidth: number,
    imageHeight: number,
    config: RasterbatorConfig
): RasterCalculationResult {
    const isPortrait = config.paperOrientation === 'portrait';
    const paper = PAPER_DIMENSIONS[config.paperFormat] || PAPER_DIMENSIONS.A4;
    const paperWidthMm = isPortrait ? paper.width : paper.height;
    const paperHeightMm = isPortrait ? paper.height : paper.width;

    const printableWidthMm = Math.max(10, paperWidthMm - config.marginMm * 2);
    const printableHeightMm = Math.max(10, paperHeightMm - config.marginMm * 2);

    const imageAspect = imageWidth / Math.max(1, imageHeight);

    let cols = 1;
    let rows = 1;

    if (config.defineSizeBy === 'sheets_wide') {
        cols = Math.max(1, Math.round(config.sheetsWide));
        const totalPosterWidthMm = cols * printableWidthMm - (cols - 1) * config.overlapMm;
        const totalPosterHeightMm = totalPosterWidthMm / imageAspect;
        rows = Math.max(1, Math.ceil((totalPosterHeightMm + (cols > 1 ? config.overlapMm : 0)) / printableHeightMm));
    } else if (config.defineSizeBy === 'sheets_high') {
        rows = Math.max(1, Math.round(config.sheetsHigh));
        const totalPosterHeightMm = rows * printableHeightMm - (rows - 1) * config.overlapMm;
        const totalPosterWidthMm = totalPosterHeightMm * imageAspect;
        cols = Math.max(1, Math.ceil((totalPosterWidthMm + (rows > 1 ? config.overlapMm : 0)) / printableWidthMm));
    } else {
        // total_width_cm
        const targetWidthMm = config.totalWidthCm * 10;
        cols = Math.max(1, Math.ceil(targetWidthMm / printableWidthMm));
        const totalPosterWidthMm = cols * printableWidthMm - (cols - 1) * config.overlapMm;
        const totalPosterHeightMm = totalPosterWidthMm / imageAspect;
        rows = Math.max(1, Math.ceil((totalPosterHeightMm + (cols > 1 ? config.overlapMm : 0)) / printableHeightMm));
    }

    const posterWidthMm = cols * printableWidthMm - (cols > 1 ? (cols - 1) * config.overlapMm : 0);
    const posterHeightMm = rows * printableHeightMm - (rows > 1 ? (rows - 1) * config.overlapMm : 0);

    const sheets: RasterSheet[] = [];
    let idx = 1;

    for (let r = 1; r <= rows; r++) {
        for (let c = 1; c <= cols; c++) {
            const posCode = `${colToLetter(c)}${r}`;
            sheets.push({
                index: idx++,
                row: r,
                col: c,
                posCode,
                xMm: (c - 1) * (printableWidthMm - config.overlapMm),
                yMm: (r - 1) * (printableHeightMm - config.overlapMm),
                widthMm: printableWidthMm,
                heightMm: printableHeightMm,
            });
        }
    }

    return {
        cols,
        rows,
        totalSheets: sheets.length,
        posterWidthMm,
        posterHeightMm,
        posterWidthCm: Math.round(posterWidthMm / 10),
        posterHeightCm: Math.round(posterHeightMm / 10),
        paperWidthMm,
        paperHeightMm,
        printableWidthMm,
        printableHeightMm,
        sheets,
    };
}

/**
 * Renderiza o efeito de Halftone (Rasterbator) em um Canvas
 */
export function renderRasterbatorToCanvas(
    sourceImg: HTMLImageElement,
    config: RasterbatorConfig,
    targetWidthPx: number = 1600
): HTMLCanvasElement {
    const canvas = document.createElement('canvas');
    const aspect = sourceImg.naturalHeight / Math.max(1, sourceImg.naturalWidth);
    canvas.width = targetWidthPx;
    canvas.height = Math.round(targetWidthPx * aspect);
    const ctx = canvas.getContext('2d');
    if (!ctx) return canvas;

    // Se o estilo for sem efeitos (No effects), apenas amplia limpamente
    if (config.style === 'no_effects') {
        ctx.drawImage(sourceImg, 0, 0, canvas.width, canvas.height);
        return canvas;
    }

    // Canvas temporário com a imagem original para amostragem rápida de pixels
    const sampleCanvas = document.createElement('canvas');
    sampleCanvas.width = canvas.width;
    sampleCanvas.height = canvas.height;
    const sampleCtx = sampleCanvas.getContext('2d', { willReadFrequently: true });
    if (!sampleCtx) return canvas;
    sampleCtx.drawImage(sourceImg, 0, 0, sampleCanvas.width, sampleCanvas.height);
    const imgData = sampleCtx.getImageData(0, 0, sampleCanvas.width, sampleCanvas.height);
    const pixels = imgData.data;

    // Cor de Fundo
    let bgColor = '#ffffff';
    if (config.backgroundColorMode === 'black') bgColor = '#000000';
    else if (config.backgroundColorMode === 'single_color') bgColor = config.singleBackgroundColor;
    else if (config.backgroundColorMode === 'transparent') bgColor = 'transparent';

    if (config.selectedPaletteId !== 'original') {
        const pal = RASTER_PALETTES.find(p => p.id === config.selectedPaletteId);
        if (pal) bgColor = pal.backgroundColor;
    }

    if (bgColor !== 'transparent') {
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    // Calcula tamanho da célula da grade em pixels com base em mm
    // Considera proporção do pôster
    const layout = calculateRasterbatorLayout(sourceImg.naturalWidth, sourceImg.naturalHeight, config);
    const pxPerMm = canvas.width / Math.max(1, layout.posterWidthMm);
    const cellPx = Math.max(4, Math.round(config.gridSizeMm * pxPerMm));

    const isInterlaced = config.halftoneMode === 'interlaced';
    const isLines = config.halftoneMode === 'lines';
    const minFactor = Math.max(0, config.minDotPercent / 100);
    const maxFactor = Math.min(1.2, config.maxDotPercent / 100);

    const cols = Math.ceil(canvas.width / cellPx) + 1;
    const rows = Math.ceil(canvas.height / cellPx) + 1;

    for (let r = 0; r < rows; r++) {
        const offsetY = r * cellPx;
        const isOffsetRow = isInterlaced && r % 2 === 1;
        const shiftX = isOffsetRow ? cellPx / 2 : 0;

        for (let c = 0; c < cols; c++) {
            const centerX = Math.round(c * cellPx + cellPx / 2 + shiftX);
            const centerY = Math.round(offsetY + cellPx / 2);

            if (centerX < 0 || centerX >= canvas.width || centerY < 0 || centerY >= canvas.height) {
                continue;
            }

            // Amostra a cor do pixel central (ou média de 3x3 para suavidade)
            const pIdx = (centerY * canvas.width + centerX) * 4;
            const red = pixels[pIdx];
            const green = pixels[pIdx + 1];
            const blue = pixels[pIdx + 2];
            const alpha = pixels[pIdx + 3];

            if (alpha < 20) continue; // Pula áreas transparentes

            // Luminância padrão (Perceived Luminance)
            const luminance = (0.299 * red + 0.587 * green + 0.114 * blue) / 255;
            
            // Quanto mais escuro o pixel original, maior o ponto (halftone clássico)
            const darkness = 1 - luminance;
            
            // Fator de escala do ponto ajustado pelos limites min e max
            const dotFactor = minFactor + darkness * (maxFactor - minFactor);
            if (dotFactor <= 0.02) continue; // Não desenha ponto invisível

            const maxDotRadius = (cellPx / 2) * 1.15; // Leve sobreposição permitida
            const dotRadius = Math.max(0.5, maxDotRadius * dotFactor);

            // Determina a cor do ponto
            let dotColor = '#000000';
            if (config.style === 'bw_rasterbation') {
                dotColor = '#000000';
            } else if (config.rasterColorMode === 'multicolor') {
                if (config.selectedPaletteId !== 'original') {
                    const pal = RASTER_PALETTES.find(p => p.id === config.selectedPaletteId);
                    if (pal && pal.colors.length > 0) {
                        // Mapeia tom de cor da paleta
                        const palIdx = Math.min(pal.colors.length - 1, Math.floor(darkness * pal.colors.length));
                        dotColor = pal.colors[palIdx];
                    } else {
                        dotColor = `rgb(${red}, ${green}, ${blue})`;
                    }
                } else {
                    dotColor = `rgb(${red}, ${green}, ${blue})`;
                }
            } else if (config.rasterColorMode === 'single_color') {
                dotColor = config.singleRasterColor;
            }

            ctx.fillStyle = dotColor;

            // Desenho da Forma
            if (isLines) {
                // Modo Linhas Horizontais com espessura variável
                const lineHeight = Math.max(1, cellPx * dotFactor * 0.95);
                ctx.fillRect(c * cellPx + shiftX, centerY - lineHeight / 2, cellPx, lineHeight);
            } else if (config.dotShape === 'circle') {
                ctx.beginPath();
                ctx.arc(centerX, centerY, dotRadius, 0, Math.PI * 2);
                ctx.fill();
            } else if (config.dotShape === 'square') {
                const s = dotRadius * 1.7;
                ctx.fillRect(centerX - s / 2, centerY - s / 2, s, s);
            } else if (config.dotShape === 'diamond') {
                ctx.beginPath();
                ctx.moveTo(centerX, centerY - dotRadius * 1.2);
                ctx.lineTo(centerX + dotRadius * 1.2, centerY);
                ctx.lineTo(centerX, centerY + dotRadius * 1.2);
                ctx.lineTo(centerX - dotRadius * 1.2, centerY);
                ctx.closePath();
                ctx.fill();
            } else if (config.dotShape === 'triangle') {
                ctx.beginPath();
                ctx.moveTo(centerX, centerY - dotRadius * 1.3);
                ctx.lineTo(centerX + dotRadius * 1.1, centerY + dotRadius * 0.8);
                ctx.lineTo(centerX - dotRadius * 1.1, centerY + dotRadius * 0.8);
                ctx.closePath();
                ctx.fill();
            }
        }
    }

    return canvas;
}

/**
 * Renderiza uma folha individual com margem, marcas de corte e coordenadas
 */
export function renderRasterSheet(
    rasterMasterCanvas: HTMLCanvasElement,
    sheet: RasterSheet,
    config: RasterbatorConfig,
    layout: RasterCalculationResult
): HTMLCanvasElement {
    const isPortrait = config.paperOrientation === 'portrait';
    const paper = PAPER_DIMENSIONS[config.paperFormat] || PAPER_DIMENSIONS.A4;
    const paperWidthMm = isPortrait ? paper.width : paper.height;
    const paperHeightMm = isPortrait ? paper.height : paper.width;

    // Renderiza em alta resolução (300 DPI aprox: 11.81 px/mm)
    const dpm = 11.81;
    const sheetCanvas = document.createElement('canvas');
    sheetCanvas.width = Math.round(paperWidthMm * dpm);
    sheetCanvas.height = Math.round(paperHeightMm * dpm);
    const ctx = sheetCanvas.getContext('2d');
    if (!ctx) return sheetCanvas;

    // Fundo branco da folha de papel
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, sheetCanvas.width, sheetCanvas.height);

    const marginPx = Math.round(config.marginMm * dpm);
    const printableWidthPx = Math.round(layout.printableWidthMm * dpm);
    const printableHeightPx = Math.round(layout.printableHeightMm * dpm);

    // Mapeia a porção correspondente do pôster original
    const scaleX = rasterMasterCanvas.width / layout.posterWidthMm;
    const scaleY = rasterMasterCanvas.height / layout.posterHeightMm;

    const srcX = Math.round(sheet.xMm * scaleX);
    const srcY = Math.round(sheet.yMm * scaleY);
    const srcW = Math.round(sheet.widthMm * scaleX);
    const srcH = Math.round(sheet.heightMm * scaleY);

    // Desenha a arte dentro da área imprimível
    ctx.drawImage(
        rasterMasterCanvas,
        srcX, srcY, srcW, srcH,
        marginPx, marginPx, printableWidthPx, printableHeightPx
    );

    // Linha de sobreposição / aba de colagem (overlap)
    if (config.overlapMm > 0) {
        ctx.save();
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 4]);

        const overlapPx = Math.round(config.overlapMm * dpm);
        // Borda direita de colagem (se não for a última coluna)
        if (sheet.col < layout.cols) {
            ctx.beginPath();
            ctx.moveTo(marginPx + printableWidthPx - overlapPx, marginPx);
            ctx.lineTo(marginPx + printableWidthPx - overlapPx, marginPx + printableHeightPx);
            ctx.stroke();
        }
        // Borda inferior de colagem (se não for a última linha)
        if (sheet.row < layout.rows) {
            ctx.beginPath();
            ctx.moveTo(marginPx, marginPx + printableHeightPx - overlapPx);
            ctx.lineTo(marginPx + printableWidthPx, marginPx + printableHeightPx - overlapPx);
            ctx.stroke();
        }
        ctx.restore();
    }

    // Marcas de corte (Crop Marks nos 4 cantos)
    if (config.showCropMarks) {
        ctx.save();
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 1.2;
        const markLen = Math.round(6 * dpm);

        const corners = [
            { x: marginPx, y: marginPx },
            { x: marginPx + printableWidthPx, y: marginPx },
            { x: marginPx, y: marginPx + printableHeightPx },
            { x: marginPx + printableWidthPx, y: marginPx + printableHeightPx },
        ];

        corners.forEach(({ x, y }) => {
            // Horizontal
            ctx.beginPath();
            ctx.moveTo(x - markLen, y);
            ctx.lineTo(x + markLen, y);
            ctx.stroke();
            // Vertical
            ctx.beginPath();
            ctx.moveTo(x, y - markLen);
            ctx.lineTo(x, y + markLen);
            ctx.stroke();
        });
        ctx.restore();
    }

    // Textos informativos de cabeçalho e rodapé
    ctx.save();
    ctx.fillStyle = '#64748b';
    ctx.font = `${Math.round(2.6 * dpm)}px "Courier New", monospace, sans-serif`;

    if (config.showPagePosition) {
        // Coordenada no topo esquerdo da margem (ex: [A1] ou [B3])
        const coordText = `POSIÇÃO: [ ${sheet.posCode} ]  |  Linha ${sheet.row}/${layout.rows} - Coluna ${sheet.col}/${layout.cols}`;
        ctx.fillText(coordText, marginPx, Math.max(marginPx - Math.round(1.5 * dpm), 16));
    }

    if (config.showPageNumbering) {
        // Rodapé com número da folha e dimensões
        const footText = `The Rasterbator  •  Folha ${sheet.index} de ${layout.totalSheets}  •  Pôster: ${layout.posterWidthCm} × ${layout.posterHeightCm} cm  •  Papel ${config.paperFormat}`;
        ctx.textAlign = 'right';
        ctx.fillText(footText, sheetCanvas.width - marginPx, sheetCanvas.height - Math.max(marginPx - Math.round(2 * dpm), 10));
    }
    ctx.restore();

    return sheetCanvas;
}

/**
 * Gera documento PDF multipágina completo pronto para impressão
 */
export async function generateRasterbatorPdf(
    sourceImg: HTMLImageElement,
    config: RasterbatorConfig,
    onProgress?: (current: number, total: number) => void
): Promise<Blob> {
    const layout = calculateRasterbatorLayout(sourceImg.naturalWidth, sourceImg.naturalHeight, config);
    
    // Renderiza o pôster mestre reticulado em resolução ultra-HD
    // 3000px de largura garante máxima nitidez de círculos em grandes ampliações
    const targetMasterW = Math.min(4000, Math.max(2000, layout.cols * 600));
    const masterCanvas = renderRasterbatorToCanvas(sourceImg, config, targetMasterW);

    const isPortrait = config.paperOrientation === 'portrait';
    const orientation = isPortrait ? 'portrait' : 'landscape';

    const pdf = new jsPDF({
        orientation,
        unit: 'mm',
        format: [layout.paperWidthMm, layout.paperHeightMm],
        compress: true,
    });

    for (let i = 0; i < layout.sheets.length; i++) {
        const sheet = layout.sheets[i];
        if (i > 0) {
            pdf.addPage([layout.paperWidthMm, layout.paperHeightMm], orientation);
        }

        const sheetCanvas = renderRasterSheet(masterCanvas, sheet, config, layout);
        const imgData = sheetCanvas.toDataURL('image/jpeg', 0.92);

        pdf.addImage(imgData, 'JPEG', 0, 0, layout.paperWidthMm, layout.paperHeightMm, undefined, 'FAST');

        if (onProgress) {
            onProgress(i + 1, layout.sheets.length);
        }
    }

    const pdfOutput = pdf.output('blob');
    return pdfOutput;
}

/**
 * Gera arquivo ZIP com todas as folhas individuais em PNG
 */
export async function generateRasterbatorZip(
    sourceImg: HTMLImageElement,
    config: RasterbatorConfig,
    onProgress?: (current: number, total: number) => void
): Promise<Blob> {
    const layout = calculateRasterbatorLayout(sourceImg.naturalWidth, sourceImg.naturalHeight, config);
    const targetMasterW = Math.min(3600, Math.max(2000, layout.cols * 500));
    const masterCanvas = renderRasterbatorToCanvas(sourceImg, config, targetMasterW);

    const zip = new JSZip();
    const folder = zip.folder(`Rasterbator_${layout.posterWidthCm}x${layout.posterHeightCm}cm`);

    // Inclui a imagem do pôster mestre montado completo
    const masterDataUrl = masterCanvas.toDataURL('image/jpeg', 0.92);
    folder?.file(`00_Poster_Completo_${layout.posterWidthCm}x${layout.posterHeightCm}cm.jpg`, masterDataUrl.split(',')[1], { base64: true });

    for (let i = 0; i < layout.sheets.length; i++) {
        const sheet = layout.sheets[i];
        const sheetCanvas = renderRasterSheet(masterCanvas, sheet, config, layout);
        const dataUrl = sheetCanvas.toDataURL('image/jpeg', 0.90);
        const filename = `Folha_${sheet.index.toString().padStart(2, '0')}_[${sheet.posCode}]_Linha${sheet.row}_Col${sheet.col}.jpg`;
        folder?.file(filename, dataUrl.split(',')[1], { base64: true });

        if (onProgress) {
            onProgress(i + 1, layout.sheets.length);
        }
    }

    const zipBlob = await zip.generateAsync({ type: 'blob' });
    return zipBlob;
}
