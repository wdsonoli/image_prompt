/**
 * panelSplitterService.ts
 * Motor completo de fatiamento de imagens e painéis de festa inspirado em:
 * - FatiArt.pro (Fatiamento de painéis redondos, arcos romanos, retangulares e cilindros para A4/A3 com sangria e abas)
 * - SplitImage.im (Divisão em grade 3x3, horizontal, vertical e carrossel)
 * - Encantiva Pro / Cortador de Painéis (Margens de impressão, cruzetas de registro, economia de páginas e PDF pronto para imprimir)
 */

import JSZip from 'jszip';
import { jsPDF } from 'jspdf';

export type SplitMode = 'party_panel' | 'grid' | 'carousel' | 'horizontal' | 'vertical';

export type PanelShape = 'round' | 'roman_arch' | 'rectangular' | 'cylinder_p' | 'cylinder_m' | 'cylinder_g';

export type PaperFormat = 'A5' | 'A4' | 'A3' | 'A2' | 'Carta' | 'Legal' | 'custom';
export type PaperOrientation = 'portrait' | 'landscape';
export type DivisionMode = 'sheets' | 'size' | 'free';

export interface PanelPreset {
    id: string;
    name: string;
    shape: PanelShape;
    defaultWidthCm: number;
    defaultHeightCm: number;
    description: string;
    category?: 'encantiva_mini' | 'party_standard' | 'arch' | 'cylinder';
    sheetsEstimate?: string;
    icon?: string;
}

export const PANEL_PRESETS: PanelPreset[] = [
    // Encantiva Pro Presets Rápidos
    { id: 'enc_20', name: '20cm (Mini)', shape: 'round', defaultWidthCm: 20, defaultHeightCm: 20, sheetsEstimate: '2 folhas', category: 'encantiva_mini', description: 'Mini painel para mesa' },
    { id: 'enc_25', name: '25cm (Pequeno)', shape: 'round', defaultWidthCm: 25, defaultHeightCm: 25, sheetsEstimate: '2 folhas', category: 'encantiva_mini', description: 'Painel de mesa compacto' },
    { id: 'enc_30', name: '30cm (Médio)', shape: 'round', defaultWidthCm: 30, defaultHeightCm: 30, sheetsEstimate: '4 folhas', category: 'encantiva_mini', description: 'Ideal para topo e mesas' },
    { id: 'enc_40', name: '40cm (Grande)', shape: 'round', defaultWidthCm: 40, defaultHeightCm: 40, sheetsEstimate: '9 folhas', category: 'encantiva_mini', description: 'Painel para fundo de mesa' },
    { id: 'enc_50', name: '50cm (Super)', shape: 'round', defaultWidthCm: 50, defaultHeightCm: 50, sheetsEstimate: '6 folhas', category: 'encantiva_mini', description: 'Painel 50cm em folhas deitadas' },

    // Painéis de Festa Tradicionais
    { id: 'round_150', name: 'Painel Redondo 150cm (Padrão Festa)', shape: 'round', defaultWidthCm: 150, defaultHeightCm: 150, sheetsEstimate: '15-20 folhas', category: 'party_standard', description: 'O diâmetro mais usado em estruturas circulares de festas' },
    { id: 'round_120', name: 'Painel Redondo 120cm (Médio)', shape: 'round', defaultWidthCm: 120, defaultHeightCm: 120, sheetsEstimate: '10-14 folhas', category: 'party_standard', description: 'Ideal para salas e espaços compactos' },
    { id: 'round_180', name: 'Painel Redondo 180cm (Grande)', shape: 'round', defaultWidthCm: 180, defaultHeightCm: 180, sheetsEstimate: '25-30 folhas', category: 'party_standard', description: 'Cenografia ampla para salões de eventos' },
    { id: 'round_200', name: 'Painel Redondo 200cm (Max)', shape: 'round', defaultWidthCm: 200, defaultHeightCm: 200, sheetsEstimate: '32-40 folhas', category: 'party_standard', description: 'Super painel para eventos grandiosos' },
    { id: 'arch_100x200', name: 'Arco Romano 100 x 200cm', shape: 'roman_arch', defaultWidthCm: 100, defaultHeightCm: 200, sheetsEstimate: '16 folhas', category: 'arch', description: 'Painel ripado ou romano com curvatura no topo' },
    { id: 'arch_90x190', name: 'Arco Romano 90 x 190cm', shape: 'roman_arch', defaultWidthCm: 90, defaultHeightCm: 190, sheetsEstimate: '14 folhas', category: 'arch', description: 'Formato clássico para trio de arcos' },
    { id: 'arch_80x160', name: 'Arco Romano 80 x 160cm', shape: 'roman_arch', defaultWidthCm: 80, defaultHeightCm: 160, sheetsEstimate: '10 folhas', category: 'arch', description: 'Arco menor para composição lateral' },
    { id: 'rect_200x150', name: 'Banner Retangular 200 x 150cm', shape: 'rectangular', defaultWidthCm: 200, defaultHeightCm: 150, sheetsEstimate: '20 folhas', category: 'party_standard', description: 'Painel de fundo fotográfico tradicional' },
    { id: 'rect_150x100', name: 'Banner Retangular 150 x 100cm', shape: 'rectangular', defaultWidthCm: 150, defaultHeightCm: 100, sheetsEstimate: '12 folhas', category: 'party_standard', description: 'Mesa de bolo padrão' },
    { id: 'cyl_g', name: 'Cilindro G (50cm x 80cm alt.)', shape: 'cylinder_g', defaultWidthCm: 157, defaultHeightCm: 80, sheetsEstimate: '10 folhas', category: 'cylinder', description: 'Faixa esticada do cilindro grande (diâmetro 50cm)' },
    { id: 'cyl_m', name: 'Cilindro M (44cm x 58cm alt.)', shape: 'cylinder_m', defaultWidthCm: 138, defaultHeightCm: 58, sheetsEstimate: '8 folhas', category: 'cylinder', description: 'Faixa esticada do cilindro médio (diâmetro 44cm)' },
    { id: 'cyl_p', name: 'Cilindro P (38cm x 45cm alt.)', shape: 'cylinder_p', defaultWidthCm: 120, defaultHeightCm: 45, sheetsEstimate: '6 folhas', category: 'cylinder', description: 'Faixa esticada do cilindro pequeno (diâmetro 38cm)' },
];

export interface SplitterConfig {
    mode: SplitMode;
    panelName: string; // Ex: "Painel Unicórnio" (Encantiva Pro)
    // Parâmetros de Painel de Festa (FatiArt / Encantiva)
    panelShape: PanelShape;
    panelWidthCm: number;
    panelHeightCm: number;
    safetyBleedCm: number; // Margem de segurança de colagem Encantiva: 0, 1, 2, 3 cm
    paperFormat: PaperFormat;
    paperOrientation: PaperOrientation;
    customPaperWidthMm: number;
    customPaperHeightMm: number;
    customPaperUnit: 'mm' | 'cm' | 'pol';
    overlapMm: number; // Aba de sobreposição para colagem (ex: 10mm ou 15mm)
    printerMarginMm: number; // Margem não-imprimível da impressora (ex: 5mm)
    printDpi: 150 | 200 | 300;
    skipBlankPages: boolean; // Economia inteligente: não imprime folhas 100% vazias fora do círculo
    showCropMarks: boolean; // Cruzetas de corte nos cantos
    showCornerMarks: boolean; // Marcas de canto nas folhas
    showDashedCutLines: boolean; // Linhas pontilhadas para corte
    showOverlapGuideLines: boolean; // Linha tracejada indicando aba de colagem
    showPageNumbering: boolean; // Exibe "Folha X de Y (Linha L, Coluna C)"
    showShapeContourLine: boolean; // Linha vermelha/azul de recorte do painel (círculo / arco)
    paperCostEstimate: number; // Custo estimado por folha em R$ (ex: 0.50)
    includeMontageGuideInPdf: boolean; // Inclui página de mapa de montagem no PDF
    watermarkText: string; // Sua marca d'água / logotipo da empresa

    // Correção de Cor (FatiArt Etapa 5)
    colorBrightness: number; // -50 a +50
    colorContrast: number; // -50 a +50
    colorSaturation: number; // -50 a +50

    // Parâmetros de Grade / Carrossel (SplitImage)
    gridCols: number;
    gridRows: number;
    maintainAspectRatio: boolean;
    outputFormat: 'png' | 'jpg' | 'webp';
    imageQuality: number; // 0.1 a 1.0 (ex: 1.0 para 100%)
    carouselSlices: number; // Para carrossel vertical/horizontal
    linearSplitCount: number;
    isInstagramMode: boolean; // Fatias sem bordas para Instagram

    // Visualizar na Parede (FatiArt Mockup)
    wallWidthM: number;
    wallHeightM: number;
    wallTheme: 'living_room' | 'party_brick' | 'kids_bedroom' | 'studio_minimal';

    // FatiArt Modo de Divisão
    divisionMode: DivisionMode;
    defineBy: 'width_pages' | 'height_pages';
    targetPages: number;
}

export interface SheetSlice {
    id: string;
    index: number;
    row: number;
    col: number;
    totalRows: number;
    totalCols: number;
    isInsideShape: boolean; // Se contém arte relevante dentro do formato (redondo/arco)
    isBlankSkipped: boolean; // Marcada para pular na impressão
    // Coordenadas em porcentagem na imagem original
    sourceX: number;
    sourceY: number;
    sourceWidth: number;
    sourceHeight: number;
    // Dimensões físicas estimadas
    physicalWidthMm: number;
    physicalHeightMm: number;
    // DataURL da miniatura renderizada
    thumbnailDataUrl?: string;
}

export interface SplitCalculationResult {
    totalCols: number;
    totalRows: number;
    totalSheets: number;
    printableSheets: number; // Excluindo páginas em branco se economia estiver ativa
    blankSheetsCount: number;
    sheets: SheetSlice[];
    totalWidthCm: number;
    totalHeightCm: number;
    paperWidthMm: number;
    paperHeightMm: number;
    estimatedCost: number;
    dpiEstimated: number;
}

/**
 * Dimensões físicas dos papéis em milímetros
 */
export const PAPER_DIMENSIONS: Record<PaperFormat, { width: number; height: number; name: string }> = {
    A5: { width: 148, height: 210, name: 'A5 (148 × 210 mm)' },
    A4: { width: 210, height: 297, name: 'A4 (210 × 297 mm)' },
    A3: { width: 297, height: 420, name: 'A3 (297 × 420 mm)' },
    A2: { width: 420, height: 594, name: 'A2 (420 × 594 mm)' },
    Carta: { width: 216, height: 279, name: 'Carta (216 × 279 mm)' },
    Legal: { width: 216, height: 356, name: 'Legal (216 × 356 mm)' },
    custom: { width: 210, height: 297, name: 'Personalizado' },
};

/**
 * Calcula a grade e as fatias necessárias para o painel com base nas dimensões físicas e papel
 */
export function calculatePartyPanelSheets(config: SplitterConfig, sourceImgW = 2000, sourceImgH = 2000): SplitCalculationResult {
    const paperDim = PAPER_DIMENSIONS[config.paperFormat] || PAPER_DIMENSIONS.A4;
    
    // Suporte a papel personalizado
    let pWidth = paperDim.width;
    let pHeight = paperDim.height;
    if (config.paperFormat === 'custom' && config.customPaperWidthMm && config.customPaperHeightMm) {
        let mult = 1;
        if (config.customPaperUnit === 'cm') mult = 10;
        if (config.customPaperUnit === 'pol') mult = 25.4;
        pWidth = config.customPaperWidthMm * mult;
        pHeight = config.customPaperHeightMm * mult;
    }

    const isPortrait = config.paperOrientation === 'portrait';
    const paperWidthMm = isPortrait ? pWidth : pHeight;
    const paperHeightMm = isPortrait ? pHeight : pWidth;

    const usableWidthMm = Math.max(10, paperWidthMm - 2 * config.printerMarginMm);
    const usableHeightMm = Math.max(10, paperHeightMm - 2 * config.printerMarginMm);

    // Cada passo útil de avanço subtrai a aba de sobreposição para colagem
    const stepWidthMm = Math.max(10, usableWidthMm - config.overlapMm);
    const stepHeightMm = Math.max(10, usableHeightMm - config.overlapMm);

    // Margem de segurança Encantiva Pro (+0cm, +1cm, +2cm, +3cm)
    const extraBleedMm = (config.safetyBleedCm || 0) * 10;
    const totalWidthMm = (config.panelWidthCm * 10) + extraBleedMm;
    const totalHeightMm = (config.panelHeightCm * 10) + extraBleedMm;

    // Quantidade de colunas e linhas necessárias para cobrir o painel
    let totalCols = 1;
    let accumulatedW = usableWidthMm;
    while (accumulatedW < totalWidthMm) {
        totalCols++;
        accumulatedW += stepWidthMm;
    }

    let totalRows = 1;
    let accumulatedH = usableHeightMm;
    while (accumulatedH < totalHeightMm) {
        totalRows++;
        accumulatedH += stepHeightMm;
    }

    // Se o usuário especificou divisão por páginas no modo FatiArt
    if (config.divisionMode === 'sheets' && config.targetPages > 0) {
        if (config.defineBy === 'width_pages') {
            totalCols = config.targetPages;
            totalRows = Math.max(1, Math.round((totalHeightMm / totalWidthMm) * totalCols));
        } else {
            totalRows = config.targetPages;
            totalCols = Math.max(1, Math.round((totalWidthMm / totalHeightMm) * totalRows));
        }
    } else if (config.divisionMode === 'free') {
        totalCols = Math.max(1, config.gridCols || 3);
        totalRows = Math.max(1, config.gridRows || 3);
    }

    const sheets: SheetSlice[] = [];
    let sheetIndex = 0;
    let blankSheetsCount = 0;

    for (let r = 0; r < totalRows; r++) {
        for (let c = 0; c < totalCols; c++) {
            sheetIndex++;

            // Posição física em mm no painel geral
            const startX_mm = c * stepWidthMm;
            const startY_mm = r * stepHeightMm;
            const endX_mm = Math.min(totalWidthMm, startX_mm + usableWidthMm);
            const endY_mm = Math.min(totalHeightMm, startY_mm + usableHeightMm);

            // Mapeamento normalizado (0 a 1) para recortar da imagem base
            const normX = startX_mm / totalWidthMm;
            const normY = startY_mm / totalHeightMm;
            const normW = (endX_mm - startX_mm) / totalWidthMm;
            const normH = (endY_mm - startY_mm) / totalHeightMm;

            // Verifica se este retângulo intersecta com a forma do painel (redondo ou arco)
            const isInside = checkSliceInsideShape(
                startX_mm, startY_mm, endX_mm, endY_mm,
                totalWidthMm, totalHeightMm,
                config.panelShape
            );

            if (!isInside) {
                blankSheetsCount++;
            }

            const isBlankSkipped = config.skipBlankPages && !isInside;

            sheets.push({
                id: `sheet_${r}_${c}`,
                index: sheetIndex,
                row: r + 1,
                col: c + 1,
                totalRows,
                totalCols,
                isInsideShape: isInside,
                isBlankSkipped,
                sourceX: normX,
                sourceY: normY,
                sourceWidth: normW,
                sourceHeight: normH,
                physicalWidthMm: endX_mm - startX_mm,
                physicalHeightMm: endY_mm - startY_mm,
            });
        }
    }

    const printableSheets = sheets.filter(s => !s.isBlankSkipped).length;
    const estimatedCost = printableSheets * (config.paperCostEstimate || 0.5);
    const dpiEstimated = Math.max(10, Math.round((sourceImgW / Math.max(1, totalWidthMm / 25.4))));

    return {
        totalCols,
        totalRows,
        totalSheets: sheets.length,
        printableSheets,
        blankSheetsCount,
        sheets,
        totalWidthCm: config.panelWidthCm + (config.safetyBleedCm || 0),
        totalHeightCm: config.panelHeightCm + (config.safetyBleedCm || 0),
        paperWidthMm,
        paperHeightMm,
        estimatedCost,
        dpiEstimated,
    };
}

/**
 * Calcula divisão em grade livre (estilo SplitImage.im)
 */
export function calculateGridSheets(config: SplitterConfig, sourceImgW = 2000, sourceImgH = 2000): SplitCalculationResult {
    const totalCols = Math.max(1, config.gridCols || 3);
    const totalRows = Math.max(1, config.gridRows || 3);
    const sheets: SheetSlice[] = [];
    let sheetIndex = 0;

    for (let r = 0; r < totalRows; r++) {
        for (let c = 0; c < totalCols; c++) {
            sheetIndex++;
            sheets.push({
                id: `grid_${r}_${c}`,
                index: sheetIndex,
                row: r + 1,
                col: c + 1,
                totalRows,
                totalCols,
                isInsideShape: true,
                isBlankSkipped: false,
                sourceX: c / totalCols,
                sourceY: r / totalRows,
                sourceWidth: 1 / totalCols,
                sourceHeight: 1 / totalRows,
                physicalWidthMm: 100,
                physicalHeightMm: 100,
            });
        }
    }

    return {
        totalCols,
        totalRows,
        totalSheets: sheets.length,
        printableSheets: sheets.length,
        blankSheetsCount: 0,
        sheets,
        totalWidthCm: config.panelWidthCm || 100,
        totalHeightCm: config.panelHeightCm || 100,
        paperWidthMm: 210,
        paperHeightMm: 297,
        estimatedCost: sheets.length * (config.paperCostEstimate || 0.5),
        dpiEstimated: Math.max(10, Math.round(sourceImgW / ((config.panelWidthCm || 100) / 2.54))),
    };
}

/**
 * Determina se a folha cai dentro da área do painel (ex: elimina os 4 cantos em painel redondo)
 */
function checkSliceInsideShape(
    x1: number, y1: number, x2: number, y2: number,
    totalW: number, totalH: number,
    shape: PanelShape
): boolean {
    if (shape === 'rectangular' || shape.startsWith('cylinder')) {
        return true;
    }

    // Para painel redondo: raio e centro
    if (shape === 'round') {
        const radius = Math.min(totalW, totalH) / 2;
        const centerX = totalW / 2;
        const centerY = totalH / 2;

        // Ponto mais próximo do centro do círculo dentro do retângulo da folha
        const closestX = Math.max(x1, Math.min(centerX, x2));
        const closestY = Math.max(y1, Math.min(centerY, y2));

        const distSq = (closestX - centerX) ** 2 + (closestY - centerY) ** 2;
        return distSq <= radius ** 2;
    }

    // Para arco romano: metade superior é semi-círculo, metade inferior é retângulo
    if (shape === 'roman_arch') {
        const radius = totalW / 2;
        const archCenterY = radius; // centro do arco superior

        // Se está na parte retangular inferior:
        if (y2 >= archCenterY) {
            return true;
        }

        // Se está na abóbada superior: testa distância ao centro do arco
        const centerX = totalW / 2;
        const closestX = Math.max(x1, Math.min(centerX, x2));
        const closestY = Math.max(y1, Math.min(archCenterY, y2));
        const distSq = (closestX - centerX) ** 2 + (closestY - archCenterY) ** 2;
        return distSq <= radius ** 2;
    }

    return true;
}

/**
 * Renderiza uma folha individual com guias de corte, abas de colagem, marcas de registro e numeração
 */
export async function renderSheetToCanvas(
    sourceImg: HTMLImageElement,
    sheet: SheetSlice,
    config: SplitterConfig,
    fullCalc: SplitCalculationResult
): Promise<HTMLCanvasElement> {
    const isPortrait = config.paperOrientation === 'portrait';
    const paperDim = PAPER_DIMENSIONS[config.paperFormat] || PAPER_DIMENSIONS.A4;
    const paperWidthMm = isPortrait ? paperDim.width : paperDim.height;
    const paperHeightMm = isPortrait ? paperDim.height : paperDim.width;

    // Resolução do canvas calculada com base no DPI escolhido
    // 1 polegada = 25.4 mm
    const dpi = config.printDpi || 150;
    const pxPerMm = dpi / 25.4;

    const canvasWidth = Math.round(paperWidthMm * pxPerMm);
    const canvasHeight = Math.round(paperHeightMm * pxPerMm);

    const canvas = document.createElement('canvas');
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return canvas;

    // Fundo branco da folha de papel
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // Margem física da impressora em pixels
    const marginPx = Math.round(config.printerMarginMm * pxPerMm);
    const usableW_px = canvasWidth - 2 * marginPx;
    const usableH_px = canvasHeight - 2 * marginPx;

    // Aba de sobreposição em pixels
    const overlapPx = Math.round(config.overlapMm * pxPerMm);

    // 1. Recorta a porção correspondente da imagem original
    const imgW = sourceImg.naturalWidth || sourceImg.width;
    const imgH = sourceImg.naturalHeight || sourceImg.height;

    const sx = Math.max(0, Math.min(imgW, sheet.sourceX * imgW));
    const sy = Math.max(0, Math.min(imgH, sheet.sourceY * imgH));
    const sw = Math.max(1, Math.min(imgW - sx, sheet.sourceWidth * imgW));
    const sh = Math.max(1, Math.min(imgH - sy, sheet.sourceHeight * imgH));

    ctx.save();
    // Área de conteúdo da folha (dentro das margens de impressão)
    ctx.beginPath();
    ctx.rect(marginPx, marginPx, usableW_px, usableH_px);
    ctx.clip();

    ctx.drawImage(sourceImg, sx, sy, sw, sh, marginPx, marginPx, usableW_px, usableH_px);

    // 2. Se for painel com formato especial (redondo / arco), desenhar contorno de corte se habilitado
    if (config.showShapeContourLine && (config.panelShape === 'round' || config.panelShape === 'roman_arch')) {
        drawShapeContourGuide(ctx, sheet, config, fullCalc, marginPx, usableW_px, usableH_px, pxPerMm);
    }

    // 3. Guia da Aba de Sobreposição (linha pontilhada para colagem)
    if (config.showOverlapGuideLines && config.overlapMm > 0) {
        drawOverlapGuide(ctx, sheet, marginPx, usableW_px, usableH_px, overlapPx);
    }

    ctx.restore();

    // 4. Marcas de registro / cruzetas de corte nos 4 cantos da área útil
    if (config.showCropMarks) {
        drawCropMarks(ctx, marginPx, canvasWidth - marginPx, marginPx, canvasHeight - marginPx, 18);
    }

    // 5. Faixa e Legenda Técnica de Identificação da Folha
    if (config.showPageNumbering) {
        drawSheetHeaderInfo(ctx, sheet, fullCalc, config, marginPx, canvasWidth, canvasHeight);
    }

    return canvas;
}

/**
 * Desenha a curva ou contorno do formato do painel (ex: círculo do painel redondo) que passa por esta folha
 */
function drawShapeContourGuide(
    ctx: CanvasRenderingContext2D,
    sheet: SheetSlice,
    config: SplitterConfig,
    fullCalc: SplitCalculationResult,
    marginPx: number,
    usableW_px: number,
    usableH_px: number,
    pxPerMm: number
) {
    ctx.save();
    ctx.strokeStyle = '#ef4444'; // Vermelho pontilhado bem visível para corte com tesoura
    ctx.lineWidth = Math.max(2, Math.round(pxPerMm * 0.8));
    ctx.setLineDash([12, 8]);

    const totalWidthMm = fullCalc.totalWidthCm * 10;
    const totalHeightMm = fullCalc.totalHeightCm * 10;

    // Posição física desta folha em mm dentro do painel
    const stepW_mm = (usableW_px / pxPerMm) - config.overlapMm;
    const stepH_mm = (usableH_px / pxPerMm) - config.overlapMm;
    const sheetStartX_mm = (sheet.col - 1) * stepW_mm;
    const sheetStartY_mm = (sheet.row - 1) * stepH_mm;

    if (config.panelShape === 'round') {
        const radiusMm = Math.min(totalWidthMm, totalHeightMm) / 2;
        const centerXMm = totalWidthMm / 2;
        const centerYMm = totalHeightMm / 2;

        // Centro do círculo relativo ao canto superior esquerdo desta folha
        const circleCenterX_px = marginPx + (centerXMm - sheetStartX_mm) * pxPerMm;
        const circleCenterY_px = marginPx + (centerYMm - sheetStartY_mm) * pxPerMm;
        const radiusPx = radiusMm * pxPerMm;

        ctx.beginPath();
        ctx.arc(circleCenterX_px, circleCenterY_px, radiusPx, 0, Math.PI * 2);
        ctx.stroke();

        // Rótulo sutil indicando linha de corte
        ctx.setLineDash([]);
        ctx.fillStyle = '#ef4444';
        ctx.font = 'bold 11px sans-serif';
    } else if (config.panelShape === 'roman_arch') {
        const radiusMm = totalWidthMm / 2;
        const archCenterXMm = totalWidthMm / 2;
        const archCenterYMm = radiusMm;

        const archCenterX_px = marginPx + (archCenterXMm - sheetStartX_mm) * pxPerMm;
        const archCenterY_px = marginPx + (archCenterYMm - sheetStartY_mm) * pxPerMm;
        const radiusPx = radiusMm * pxPerMm;

        // Semi-círculo do topo
        ctx.beginPath();
        ctx.arc(archCenterX_px, archCenterY_px, radiusPx, Math.PI, 0);
        ctx.stroke();
    }

    ctx.restore();
}

/**
 * Desenha a guia tracejada da aba de sobreposição e indicação de cola
 */
function drawOverlapGuide(
    ctx: CanvasRenderingContext2D,
    sheet: SheetSlice,
    marginPx: number,
    usableW_px: number,
    usableH_px: number,
    overlapPx: number
) {
    ctx.save();
    ctx.strokeStyle = '#0284c7'; // Azul sutil para montagem
    ctx.lineWidth = 1.5;
    ctx.setLineDash([6, 6]);

    // Aba direita (se não for a última coluna)
    if (sheet.col < sheet.totalCols) {
        const overlapX = marginPx + usableW_px - overlapPx;
        ctx.beginPath();
        ctx.moveTo(overlapX, marginPx);
        ctx.lineTo(overlapX, marginPx + usableH_px);
        ctx.stroke();

        // Faixa sombreada sutil da aba de colagem
        ctx.fillStyle = 'rgba(2, 132, 199, 0.08)';
        ctx.fillRect(overlapX, marginPx, overlapPx, usableH_px);

        // Texto vertical indicando área de cola
        ctx.save();
        ctx.translate(overlapX + overlapPx / 2, marginPx + usableH_px / 2);
        ctx.rotate(-Math.PI / 2);
        ctx.fillStyle = '#0369a1';
        ctx.font = 'bold 10px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`PASSE COLA AQUI (${overlapPx > 10 ? 'ABA DE COLAGEM' : 'ABA'})`, 0, 4);
        ctx.restore();
    }

    // Aba inferior (se não for a última linha)
    if (sheet.row < sheet.totalRows) {
        const overlapY = marginPx + usableH_px - overlapPx;
        ctx.beginPath();
        ctx.moveTo(marginPx, overlapY);
        ctx.lineTo(marginPx + usableW_px, overlapY);
        ctx.stroke();

        ctx.fillStyle = 'rgba(2, 132, 199, 0.08)';
        ctx.fillRect(marginPx, overlapY, usableW_px, overlapPx);
    }

    ctx.restore();
}

/**
 * Cruzetas de alinhamento e corte nos cantos
 */
function drawCropMarks(
    ctx: CanvasRenderingContext2D,
    x1: number,
    x2: number,
    y1: number,
    y2: number,
    size: number
) {
    ctx.save();
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 1.2;
    ctx.setLineDash([]);

    const corners = [
        { x: x1, y: y1 },
        { x: x2, y: y1 },
        { x: x1, y: y2 },
        { x: x2, y: y2 },
    ];

    corners.forEach(({ x, y }) => {
        ctx.beginPath();
        // Linha horizontal
        ctx.moveTo(x - size, y);
        ctx.lineTo(x + size, y);
        // Linha vertical
        ctx.moveTo(x, y - size);
        ctx.lineTo(x, y + size);
        ctx.stroke();

        // Pequeno círculo central para mira
        ctx.beginPath();
        ctx.arc(x, y, 2.5, 0, Math.PI * 2);
        ctx.stroke();
    });

    ctx.restore();
}

/**
 * Marcas de canto em L nas folhas (FatiArt)
 */
function drawCornerMarks(
    ctx: CanvasRenderingContext2D,
    x1: number,
    x2: number,
    y1: number,
    y2: number,
    length: number
) {
    ctx.save();
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([]);

    // Top-left
    ctx.beginPath();
    ctx.moveTo(x1, y1 + length);
    ctx.lineTo(x1, y1);
    ctx.lineTo(x1 + length, y1);
    ctx.stroke();

    // Top-right
    ctx.beginPath();
    ctx.moveTo(x2 - length, y1);
    ctx.lineTo(x2, y1);
    ctx.lineTo(x2, y1 + length);
    ctx.stroke();

    // Bottom-left
    ctx.beginPath();
    ctx.moveTo(x1, y2 - length);
    ctx.lineTo(x1, y2);
    ctx.lineTo(x1 + length, y2);
    ctx.stroke();

    // Bottom-right
    ctx.beginPath();
    ctx.moveTo(x2 - length, y2);
    ctx.lineTo(x2, y2);
    ctx.lineTo(x2, y2 - length);
    ctx.stroke();

    ctx.restore();
}

/**
 * Marca d'água técnica ou logotipo do ateliê
 */
function drawWatermark(
    ctx: CanvasRenderingContext2D,
    text: string,
    canvasW: number,
    canvasH: number
) {
    ctx.save();
    ctx.fillStyle = 'rgba(15, 23, 42, 0.15)';
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`PRODUZIDO POR: ${text.toUpperCase()}`, canvasW / 2, canvasH - 6);
    ctx.restore();
}

/**
 * Cabeçalho e rodapé técnico com informações de montagem
 */
function drawSheetHeaderInfo(
    ctx: CanvasRenderingContext2D,
    sheet: SheetSlice,
    fullCalc: SplitCalculationResult,
    config: SplitterConfig,
    marginPx: number,
    canvasW: number,
    canvasH: number
) {
    ctx.save();
    ctx.fillStyle = '#475569';
    ctx.font = '10px "Courier New", monospace, sans-serif';

    const shapeLabel = {
        round: `Painel Redondo Ø${config.panelWidthCm}cm`,
        roman_arch: `Arco Romano ${config.panelWidthCm}x${config.panelHeightCm}cm`,
        rectangular: `Painel Retangular ${config.panelWidthCm}x${config.panelHeightCm}cm`,
        cylinder_p: 'Cilindro P',
        cylinder_m: 'Cilindro M',
        cylinder_g: 'Cilindro G',
    }[config.panelShape] || 'Painel';

    // Topo da página na margem não-imprimível
    const namePrefix = config.panelName ? `[${config.panelName.toUpperCase()}] ` : '';
    const headerText = `${namePrefix}FOLHA ${sheet.index.toString().padStart(2, '0')}/${fullCalc.totalSheets.toString().padStart(2, '0')} | LINHA ${sheet.row}/${sheet.totalRows} - COLUNA ${sheet.col}/${sheet.totalCols} | ${shapeLabel}`;
    ctx.fillText(headerText, marginPx, Math.max(12, marginPx - 4));

    // Rodapé
    const watermarkExtra = config.watermarkText ? ` | Ateliê: ${config.watermarkText}` : '';
    const footerText = `FatiArt & Encantiva Pro | Sangria/Aba: ${config.overlapMm}mm | Papel: ${config.paperFormat} (${config.paperOrientation})${watermarkExtra}`;
    ctx.textAlign = 'right';
    ctx.fillText(footerText, canvasW - marginPx, canvasH - Math.max(4, marginPx - 8));

    ctx.restore();
}

/**
 * Gera arquivo PDF multipágina pronto para imprimir (Folhas organizadas em 1 arquivo)
 */
export async function generatePrintablePdf(
    sourceImg: HTMLImageElement,
    config: SplitterConfig,
    calcResult: SplitCalculationResult,
    onProgress?: (current: number, total: number) => void
): Promise<Blob> {
    const isPortrait = config.paperOrientation === 'portrait';
    const orientation = isPortrait ? 'portrait' : 'landscape';
    const paperDim = PAPER_DIMENSIONS[config.paperFormat] || PAPER_DIMENSIONS.A4;
    
    let pWidthMm = isPortrait ? paperDim.width : paperDim.height;
    let pHeightMm = isPortrait ? paperDim.height : paperDim.width;
    if (config.paperFormat === 'custom' && config.customPaperWidthMm && config.customPaperHeightMm) {
        let mult = 1;
        if (config.customPaperUnit === 'cm') mult = 10;
        if (config.customPaperUnit === 'pol') mult = 25.4;
        pWidthMm = isPortrait ? config.customPaperWidthMm * mult : config.customPaperHeightMm * mult;
        pHeightMm = isPortrait ? config.customPaperHeightMm * mult : config.customPaperWidthMm * mult;
    }

    // Cria documento PDF com as dimensões exatas da folha
    const pdf = new jsPDF({
        orientation,
        unit: 'mm',
        format: [pWidthMm, pHeightMm],
        compress: true,
    });

    let pageAdded = false;

    // Se o usuário pediu para incluir o Guia de Montagem no PDF (FatiArt)
    if (config.includeMontageGuideInPdf) {
        const montageCanvas = await generateMontageMapCanvas(sourceImg, config, calcResult);
        const mapDataUrl = montageCanvas.toDataURL('image/jpeg', 0.90);
        pdf.addImage(mapDataUrl, 'JPEG', 5, 5, pWidthMm - 10, pHeightMm - 10, undefined, 'FAST');
        pageAdded = true;
    }

    const activeSheets = calcResult.sheets.filter(s => !s.isBlankSkipped);
    const totalToRender = activeSheets.length;

    for (let i = 0; i < totalToRender; i++) {
        const sheet = activeSheets[i];
        if (onProgress) {
            onProgress(i + 1, totalToRender);
        }

        // Renderiza o canvas de alta resolução desta folha
        const sheetCanvas = await renderSheetToCanvas(sourceImg, sheet, config, calcResult);
        const imgDataUrl = sheetCanvas.toDataURL('image/jpeg', 0.92);

        if (pageAdded) {
            pdf.addPage([pWidthMm, pHeightMm], orientation);
        } else {
            pageAdded = true;
        }

        pdf.addImage(imgDataUrl, 'JPEG', 0, 0, pWidthMm, pHeightMm, undefined, 'FAST');
    }

    return pdf.output('blob');
}

/**
 * Gera arquivo ZIP contendo todas as imagens individuais em alta resolução + Mapa de Montagem + Instruções
 */
export async function generateSlicesZip(
    sourceImg: HTMLImageElement,
    config: SplitterConfig,
    calcResult: SplitCalculationResult,
    onProgress?: (current: number, total: number) => void
): Promise<Blob> {
    const zip = new JSZip();
    const activeSheets = calcResult.sheets.filter(s => !s.isBlankSkipped);
    const totalToRender = activeSheets.length;

    const folder = zip.folder('fatias_painel') || zip;

    // Renderiza cada folha
    for (let i = 0; i < totalToRender; i++) {
        const sheet = activeSheets[i];
        if (onProgress) {
            onProgress(i + 1, totalToRender);
        }

        const canvas = await renderSheetToCanvas(sourceImg, sheet, config, calcResult);
        const dataUrl = canvas.toDataURL('image/png');
        const base64Data = dataUrl.split(',')[1];

        const fileName = `Folha_${sheet.index.toString().padStart(2, '0')}_Linha-${sheet.row}_Coluna-${sheet.col}.png`;
        folder.file(fileName, base64Data, { base64: true });
    }

    // Adiciona Instruções de Montagem detalhadas
    const instructions = `========================================================
GUIA DE MONTAGEM DO PAINEL DE FESTA (FatiArt & Encantiva Pro)
========================================================

INFORMAÇÕES DO PAINEL:
- Formato: ${config.panelShape}
- Dimensão Final Montada: ${config.panelWidthCm} cm x ${config.panelHeightCm} cm
- Papel Recomendado: ${config.paperFormat} (${config.paperOrientation})
- Quantidade de Folhas: ${calcResult.printableSheets} folhas (Grade: ${calcResult.totalRows} linhas x ${calcResult.totalCols} colunas)
- Aba de Sobreposição / Colagem: ${config.overlapMm} mm
- Margem de Segurança: ${config.printerMarginMm} mm

PASSO A PASSO PARA UMA MONTAGEM PERFEITA:
1. IMPRESSÃO:
   - Abra o arquivo PDF ou as imagens em um visualizador.
   - Configure sua impressora para "Tamanho Real" / "100%" (NÃO selecione "Ajustar à página").
   - Utilize papel de gramatura 180g a 240g (fotográfico matte ou glossy) para melhor rigidez.

2. PREPARAÇÃO & CORTE:
   - Com régua de metal e estilete, alinhe as cruzetas de corte dos cantos da folha.
   - Corte APENAS a margem branca onde está indicado, mantendo a aba de colagem tracejada.

3. COLAGEM EM LINHAS:
   - Monte primeiro as tiras horizontais (Linha 1: Folha 1 sobrepondo na Folha 2, etc.).
   - Passe cola bastão, fita dupla face de boa aderência ou cola pano na "ABA DE COLAGEM".
   - Sobreponha a folha vizinha até a linha tracejada guia.

4. UNIÃO DAS LINHAS:
   - Uma a Linha 1 sobre a Linha 2, depois a Linha 3, e assim por diante.

5. ACABAMENTO FINAL DO FORMATO:
   - Se o painel for Redondo ou Arco Romano, siga a linha guia vermelha pontilhada no contorno para o corte curvo perfeito!

Parabéns pelo trabalho!`;

    zip.file('INSTRUCOES_DE_MONTAGEM.txt', instructions);

    // Gera o Mapa Geral de Montagem (Grid Overview)
    const overviewCanvas = await generateMontageMapCanvas(sourceImg, config, calcResult);
    if (overviewCanvas) {
        const overviewBase64 = overviewCanvas.toDataURL('image/png').split(',')[1];
        zip.file('MAPA_GERAL_DE_MONTAGEM.png', overviewBase64, { base64: true });
    }

    return await zip.generateAsync({ type: 'blob' });
}

/**
 * Gera um mapa visual esquemático da grade de montagem para o usuário visualizar a ordem
 */
export async function generateMontageMapCanvas(
    sourceImg: HTMLImageElement,
    config: SplitterConfig,
    calcResult: SplitCalculationResult
): Promise<HTMLCanvasElement> {
    const canvas = document.createElement('canvas');
    const width = 1200;
    const height = Math.round(1200 * (calcResult.totalHeightCm / Math.max(1, calcResult.totalWidthCm))) + 120;
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    if (!ctx) return canvas;

    // Fundo escuro elegante
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, width, height);

    // Título
    ctx.fillStyle = '#f8fafc';
    ctx.font = 'bold 24px sans-serif';
    ctx.fillText('MAPA DE MONTAGEM DAS FOLHAS', 40, 45);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '14px sans-serif';
    ctx.fillText(`Painel: ${config.panelWidthCm}x${config.panelHeightCm}cm | ${calcResult.printableSheets} folhas (${calcResult.totalCols} colunas x ${calcResult.totalRows} linhas)`, 40, 75);

    // Área da imagem
    const mapX = 40;
    const mapY = 100;
    const mapW = width - 80;
    const mapH = height - 140;

    // Desenha miniatura da imagem base
    ctx.drawImage(sourceImg, mapX, mapY, mapW, mapH);

    // Desenha as divisões da grade
    const cellW = mapW / calcResult.totalCols;
    const cellH = mapH / calcResult.totalRows;

    calcResult.sheets.forEach(sheet => {
        const cellX = mapX + (sheet.col - 1) * cellW;
        const cellY = mapY + (sheet.row - 1) * cellH;

        if (sheet.isBlankSkipped) {
            // Folha pulada (fora do círculo)
            ctx.fillStyle = 'rgba(15, 23, 42, 0.75)';
            ctx.fillRect(cellX, cellY, cellW, cellH);
            ctx.strokeStyle = '#334155';
            ctx.lineWidth = 1;
            ctx.strokeRect(cellX, cellY, cellW, cellH);
            return;
        }

        // Borda da folha
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 2;
        ctx.strokeRect(cellX, cellY, cellW, cellH);

        // Badge com número da folha
        ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
        ctx.fillRect(cellX + 8, cellY + 8, 48, 28);
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 1;
        ctx.strokeRect(cellX + 8, cellY + 8, 48, 28);

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 15px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`${sheet.index}`, cellX + 32, cellY + 27);
        ctx.textAlign = 'left';
    });

    return canvas;
}
