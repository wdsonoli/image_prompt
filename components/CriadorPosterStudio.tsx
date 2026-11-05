import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
    Scissors,
    Download,
    FileText,
    Archive,
    Grid3X3,
    Check,
    Layers,
    Info,
    RotateCw,
    Sparkles,
    ZoomIn,
    ZoomOut,
    Eye,
    Printer,
    RefreshCw,
    ChevronRight,
    ChevronLeft,
    Sliders,
    Maximize2,
    PartyPopper,
    HelpCircle,
    SlidersHorizontal,
    Move,
    FlipHorizontal,
    FlipVertical,
    Upload,
    ImageIcon,
    ArrowLeft,
    X,
    ExternalLink,
    AlertCircle,
    UserCheck,
    Minimize2,
    Calendar,
    Share2,
    Wand2
} from 'lucide-react';
import { UploadedImage } from '../types';
import { downloadBlob, downloadFile, downloadBatchFiles } from '../utils/downloadHelper';
import { jsPDF } from 'jspdf';
import JSZip from 'jszip';

export interface CriadorPosterStudioProps {
    availableImages: UploadedImage[];
    initialImageUrl?: string | null;
    initialImageName?: string | null;
    onBackToArchitect: () => void;
    onOpenBgRemover?: () => void;
    onOpenUpscale?: (url: string, name: string) => void;
    onOpenBirthdayStudio?: () => void;
    onSwitchMode?: (mode: 'painel_festa' | 'cortador' | 'criador_poster' | 'rasterbator' | 'splitimage' | 'wall_mockup') => void;
}

// Formatos de papel e suas dimensões milimétricas
export const PAPER_SPECS: Record<'A4' | 'A3' | 'Carta', { widthMm: number; heightMm: number; label: string }> = {
    A4: { widthMm: 210, heightMm: 297, label: 'A4 (210 × 297 mm) - Padrão Brasil' },
    A3: { widthMm: 297, heightMm: 420, label: 'A3 (297 × 420 mm) - Folha Grande' },
    Carta: { widthMm: 216, heightMm: 279, label: 'Carta / Letter (216 × 279 mm)' },
};

// Presets pré-definidos do Criador de Pôster (Fazendo a Nossa Festa)
export interface PosterPreset {
    id: string;
    label: string;
    cols: number;
    rows: number;
    sheetsCount: number;
    recommendedUse: string;
    approxSizeCm: string;
    badge?: string;
}

export const POSTER_PRESETS: PosterPreset[] = [
    { id: '2x2', label: '2 × 2', cols: 2, rows: 2, sheetsCount: 4, approxSizeCm: '40 × 57 cm', recommendedUse: 'Mesa de doces, quarto infantil ou quadro', badge: 'Compacto' },
    { id: '3x3', label: '3 × 3', cols: 3, rows: 3, sheetsCount: 9, approxSizeCm: '60 × 87 cm', recommendedUse: 'Fundo da mesa do bolo e decorações médias', badge: 'Mais Popular' },
    { id: '4x3', label: '4 × 3', cols: 4, rows: 3, sheetsCount: 12, approxSizeCm: '80 × 87 cm', recommendedUse: 'Painel horizontal e mesa de bolo estendida', badge: 'Paisagem' },
    { id: '4x4', label: '4 × 4', cols: 4, rows: 4, sheetsCount: 16, approxSizeCm: '84 × 115 cm', recommendedUse: 'Painel grande de 1 metro e displays de chão', badge: 'Grande 1m' },
    { id: '5x4', label: '5 × 4', cols: 5, rows: 4, sheetsCount: 20, approxSizeCm: '105 × 115 cm', recommendedUse: 'Super painel para parede inteira', badge: 'Gigante' },
    { id: '6x4', label: '6 × 4', cols: 6, rows: 4, sheetsCount: 24, approxSizeCm: '125 × 115 cm', recommendedUse: 'Mega cenografia para festas infantis completas', badge: 'Mega Festa' },
    { id: 'custom', label: 'Livre', cols: 3, rows: 3, sheetsCount: 9, approxSizeCm: 'Personalizado', recommendedUse: 'Defina colunas e linhas sob medida', badge: 'Custom' },
];

// Amostras de teste prontas (Temas infantis e personagens para recorte)
interface SampleItem {
    id: string;
    name: string;
    category: 'mascote' | 'painel';
    description: string;
    svgDataUrl: string;
}

const SAMPLE_POSTERS: SampleItem[] = [
    {
        id: 'safari',
        name: 'Mascote Leãozinho Safari',
        category: 'mascote',
        description: 'Display de chão recortado infantil com fundo transparente',
        svgDataUrl: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="1000" height="1200" viewBox="0 0 1000 1200">
            <defs>
                <linearGradient id="mane" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%23ea580c"/><stop offset="100%" stop-color="%23b45309"/></linearGradient>
                <linearGradient id="face" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%23fde047"/><stop offset="100%" stop-color="%23f59e0b"/></linearGradient>
            </defs>
            <circle cx="500" cy="550" r="380" fill="url(%23mane)"/>
            <circle cx="500" cy="560" r="290" fill="url(%23face)"/>
            <circle cx="280" cy="280" r="100" fill="%23f59e0b"/><circle cx="280" cy="280" r="60" fill="%23fef08a"/>
            <circle cx="720" cy="280" r="100" fill="%23f59e0b"/><circle cx="720" cy="280" r="60" fill="%23fef08a"/>
            <ellipse cx="400" cy="500" rx="30" ry="45" fill="%231e293b"/><circle cx="410" cy="485" r="12" fill="%23ffffff"/>
            <ellipse cx="600" cy="500" rx="30" ry="45" fill="%231e293b"/><circle cx="610" cy="485" r="12" fill="%23ffffff"/>
            <polygon points="500,560 460,610 540,610" fill="%237c2d12"/>
            <ellipse cx="440" cy="650" rx="60" ry="40" fill="%23fef08a"/>
            <ellipse cx="560" cy="650" rx="60" ry="40" fill="%23fef08a"/>
            <path d="M 470 610 Q 440 680 400 660" stroke="%237c2d12" stroke-width="8" fill="none" stroke-linecap="round"/>
            <path d="M 530 610 Q 560 680 600 660" stroke="%237c2d12" stroke-width="8" fill="none" stroke-linecap="round"/>
            <text x="500" y="1080" font-family="sans-serif" font-weight="900" font-size="44" fill="%2315803d" text-anchor="middle">🦁 SAFARI BABY - DISPLAY A4</text>
        </svg>`
    },
    {
        id: 'princesa',
        name: 'Castelo Encantado & Estrelas',
        category: 'painel',
        description: 'Painel fotográfico completo com degradê rosa, dourado e lilás',
        svgDataUrl: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="900" viewBox="0 0 1200 900">
            <defs>
                <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%23f472b6"/><stop offset="50%" stop-color="%23c084fc"/><stop offset="100%" stop-color="%2338bdf8"/></linearGradient>
            </defs>
            <rect width="1200" height="900" fill="url(%23bg)"/>
            <circle cx="600" cy="400" r="300" fill="%23ffffff" opacity="0.15"/>
            <polygon points="600,200 450,450 750,450" fill="%23fbbf24"/>
            <rect x="520" y="450" width="160" height="250" fill="%23ffffff" opacity="0.9"/>
            <rect x="360" y="520" width="100" height="180" fill="%23ffffff" opacity="0.85"/>
            <rect x="740" y="520" width="100" height="180" fill="%23ffffff" opacity="0.85"/>
            <polygon points="410,380 340,520 480,520" fill="%23ec4899"/>
            <polygon points="790,380 720,520 860,520" fill="%23ec4899"/>
            <text x="600" y="800" font-family="sans-serif" font-weight="900" font-size="52" fill="%23ffffff" text-anchor="middle" letter-spacing="2">✨ REINO ENCANTADO ✨</text>
        </svg>`
    },
    {
        id: 'espaco',
        name: 'Astronauta & Foguete Neon',
        category: 'mascote',
        description: 'Mascote infantil recortado tema Espaço Sideral',
        svgDataUrl: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="900" height="1200" viewBox="0 0 900 1200">
            <defs>
                <linearGradient id="suit" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%23f8fafc"/><stop offset="100%" stop-color="%23cbd5e1"/></linearGradient>
                <linearGradient id="visor" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%2338bdf8"/><stop offset="100%" stop-color="%230284c7"/></linearGradient>
            </defs>
            <circle cx="450" cy="400" r="230" fill="url(%23suit)" stroke="%233b82f6" stroke-width="12"/>
            <ellipse cx="450" cy="400" rx="160" ry="120" fill="url(%23visor)"/>
            <path d="M 380 350 Q 420 330 460 340" stroke="%23ffffff" stroke-width="10" stroke-linecap="round" fill="none"/>
            <rect x="300" y="600" width="300" height="350" rx="60" fill="url(%23suit)"/>
            <rect x="360" y="680" width="180" height="140" rx="20" fill="%230f172a"/>
            <circle cx="400" cy="740" r="16" fill="%23ef4444"/>
            <circle cx="450" cy="740" r="16" fill="%23eab308"/>
            <circle cx="500" cy="740" r="16" fill="%2322c55e"/>
            <text x="450" y="1100" font-family="sans-serif" font-weight="900" font-size="44" fill="%2338bdf8" text-anchor="middle">🚀 ASTRONAUTA A4</text>
        </svg>`
    }
];

export interface PosterSheetData {
    index: number;
    col: number;
    row: number;
    label: string;
    isEmpty: boolean;
    excluded: boolean;
}

export const CriadorPosterStudio: React.FC<CriadorPosterStudioProps> = ({
    availableImages,
    initialImageUrl,
    initialImageName,
    onBackToArchitect,
    onOpenBgRemover,
    onOpenUpscale,
    onOpenBirthdayStudio,
    onSwitchMode
}) => {
    // Imagem selecionada
    const [selectedImageUrl, setSelectedImageUrl] = useState<string>(initialImageUrl || '');
    const [selectedImageName, setSelectedImageName] = useState<string>(initialImageName || 'meu-poster-festa');
    const [loadedImage, setLoadedImage] = useState<HTMLImageElement | null>(null);
    const [imageDimensions, setImageDimensions] = useState<{ width: number; height: number }>({ width: 0, height: 0 });

    // Configuração de Formato & Grade
    const [activePresetId, setActivePresetId] = useState<string>('3x3');
    const [cols, setCols] = useState<number>(3);
    const [rows, setRows] = useState<number>(3);
    const [paperFormat, setPaperFormat] = useState<'A4' | 'A3' | 'Carta'>('A4');
    const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');

    // Modo de Pôster: Painel Completo vs Mascote Recortado
    const [posterType, setPosterType] = useState<'full' | 'mascot'>('full');
    const [skipBlankSheets, setSkipBlankSheets] = useState<boolean>(true);
    const [excludedSheetIndices, setExcludedSheetIndices] = useState<Set<number>>(new Set());

    // Ajustes Manuais da Imagem
    const [zoom, setZoom] = useState<number>(100); // 50 a 300%
    const [panX, setPanX] = useState<number>(0); // em % relativo
    const [panY, setPanY] = useState<number>(0);
    const [rotation, setRotation] = useState<number>(0); // graus: -180 a 180
    const [isFlippedH, setIsFlippedH] = useState<boolean>(false);
    const [isFlippedV, setIsFlippedV] = useState<boolean>(false);

    // Margem, Sangria e Abas de Colagem
    const [overlapMm, setOverlapMm] = useState<number>(10); // 0, 5, 10, 15, 20 mm
    const [printerMarginMm, setPrinterMarginMm] = useState<number>(5); // 0, 3, 5 mm
    const [showCutLines, setShowCutLines] = useState<boolean>(true);
    const [showGlueTabs, setShowGlueTabs] = useState<boolean>(true);
    const [showPageNumbers, setShowPageNumbers] = useState<boolean>(true);

    // Visualização e Interação
    const [previewMode, setPreviewMode] = useState<'grid' | 'joined' | 'scale' | 'wall'>('grid');
    const [selectedSheetIndex, setSelectedSheetIndex] = useState<number | null>(null);
    const [previewSheetUrl, setPreviewSheetUrl] = useState<string | null>(null);
    const [showGuideModal, setShowGuideModal] = useState<boolean>(false);
    const [guideStep, setGuideStep] = useState<number>(1);
    const [isDragging, setIsDragging] = useState<boolean>(false);
    const dragStartRef = useRef<{ x: number; y: number; initialPanX: number; initialPanY: number }>({ x: 0, y: 0, initialPanX: 0, initialPanY: 0 });

    // Geração de PDF e ZIP
    const [isGeneratingPdf, setIsGeneratingPdf] = useState<boolean>(false);
    const [isGeneratingZip, setIsGeneratingZip] = useState<boolean>(false);
    const [isDownloadingSeparate, setIsDownloadingSeparate] = useState<boolean>(false);
    const [progress, setProgress] = useState<{ current: number; total: number } | null>(null);
    const [toastMessage, setToastMessage] = useState<string | null>(null);
    const [fallbackDownload, setFallbackDownload] = useState<{ url: string; filename: string } | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const previewCanvasRef = useRef<HTMLCanvasElement>(null);

    // Inicializa imagem
    useEffect(() => {
        if (initialImageUrl) {
            setSelectedImageUrl(initialImageUrl);
            if (initialImageName) setSelectedImageName(initialImageName);
        } else if (!selectedImageUrl && availableImages.length > 0) {
            const first = availableImages[0];
            const url = first.previewUrl || (first.base64Data ? `data:${first.mimeType || 'image/png'};base64,${first.base64Data}` : '');
            if (url) {
                setSelectedImageUrl(url);
                setSelectedImageName(first.name);
            }
        } else if (!selectedImageUrl) {
            // Carrega a primeira amostra por padrão para visualização rica imediata
            setSelectedImageUrl(SAMPLE_POSTERS[0].svgDataUrl);
            setSelectedImageName(SAMPLE_POSTERS[0].name);
            setPosterType('mascot');
        }
    }, [initialImageUrl, initialImageName, availableImages]);

    // Carrega HTML Image Element
    useEffect(() => {
        if (!selectedImageUrl) {
            setLoadedImage(null);
            return;
        }

        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
            setLoadedImage(img);
            setImageDimensions({ width: img.naturalWidth || img.width, height: img.naturalHeight || img.height });
        };
        img.onerror = () => {
            console.warn('Tentativa com crossOrigin anonymous falhou no Criador de Pôster, tentando direto...');
            const directImg = new Image();
            directImg.onload = () => {
                setLoadedImage(directImg);
                setImageDimensions({ width: directImg.naturalWidth || directImg.width, height: directImg.naturalHeight || directImg.height });
            };
            directImg.onerror = () => {
                console.error('Falha ao carregar imagem para o Criador de Pôster');
                setLoadedImage(null);
            };
            directImg.src = selectedImageUrl;
        };
        img.src = selectedImageUrl;
    }, [selectedImageUrl]);

    // Dimensões do papel em mm com base na orientação
    const paperDimMm = useMemo(() => {
        const spec = PAPER_SPECS[paperFormat];
        return orientation === 'portrait'
            ? { width: spec.widthMm, height: spec.heightMm }
            : { width: spec.heightMm, height: spec.widthMm };
    }, [paperFormat, orientation]);

    // Cálculo das dimensões totais finais do pôster em centímetros
    const totalPosterSize = useMemo(() => {
        // Dimensão real útil (sem aba de sobreposição para cada folha subsequente)
        const effectiveWidthMm = paperDimMm.width - (cols > 1 ? overlapMm : 0);
        const effectiveHeightMm = paperDimMm.height - (rows > 1 ? overlapMm : 0);
        
        const totalW_mm = paperDimMm.width + (cols - 1) * effectiveWidthMm;
        const totalH_mm = paperDimMm.height + (rows - 1) * effectiveHeightMm;

        return {
            widthCm: Math.round(totalW_mm / 10),
            heightCm: Math.round(totalH_mm / 10),
            totalSheets: cols * rows,
            aspectRatio: totalW_mm / totalH_mm
        };
    }, [cols, rows, paperDimMm, overlapMm]);

    // Detecção de folhas vazias (para modo mascote / display recortado)
    const sheetsData: PosterSheetData[] = useMemo(() => {
        const list: PosterSheetData[] = [];
        let idx = 0;
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                // Heurística de folha vazia nos cantos em modo mascote ou centro
                // Permite desmarcar folhas individuais
                const isExcludedByUser = excludedSheetIndices.has(idx);
                list.push({
                    index: idx,
                    col: c + 1,
                    row: r + 1,
                    label: `Folha ${idx + 1} [L${r + 1}, C${c + 1}]`,
                    isEmpty: false, // Pode ser computado via pixel scan
                    excluded: isExcludedByUser
                });
                idx++;
            }
        }
        return list;
    }, [cols, rows, excludedSheetIndices]);

    // Folhas ativas a serem impressas
    const printableSheets = useMemo(() => {
        return sheetsData.filter(s => !s.excluded);
    }, [sheetsData]);

    // Altera Preset
    const handleSelectPreset = (preset: PosterPreset) => {
        setActivePresetId(preset.id);
        if (preset.id !== 'custom') {
            setCols(preset.cols);
            setRows(preset.rows);
        }
    };

    // Ações de Ajuste Rápido
    const handleFitToPage = () => {
        setZoom(100);
        setPanX(0);
        setPanY(0);
        setRotation(0);
    };

    const handleFillPoster = () => {
        // Zoom automático para preencher completamente sem bordas vazias
        setZoom(120);
        setPanX(0);
        setPanY(0);
    };

    const handleResetAdjustments = () => {
        setZoom(100);
        setPanX(0);
        setPanY(0);
        setRotation(0);
        setIsFlippedH(false);
        setIsFlippedV(false);
        setExcludedSheetIndices(new Set());
    };

    // Alternar exclusão de folha específica ao clicar
    const handleToggleSheetExclusion = (index: number) => {
        setExcludedSheetIndices(prev => {
            const next = new Set(prev);
            if (next.has(index)) {
                next.delete(index);
            } else {
                // Não exclui se for a única folha restante
                if (next.size < cols * rows - 1) {
                    next.add(index);
                }
            }
            return next;
        });
    };

    // Upload de Imagem Personalizada
    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = () => {
            if (reader.result) {
                setSelectedImageUrl(reader.result as string);
                setSelectedImageName(file.name.replace(/\.[^/.]+$/, ""));
                setExcludedSheetIndices(new Set());
            }
        };
        reader.readAsDataURL(file);
    };

    // Exibir Toast
    const showToast = (msg: string) => {
        setToastMessage(msg);
        setTimeout(() => setToastMessage(null), 4000);
    };

    // Renderiza uma folha individual em Canvas para o PDF / ZIP
    const renderSingleSheetCanvas = async (sheetIndex: number): Promise<HTMLCanvasElement> => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx || !loadedImage) return canvas;

        // Resolução de saída: 300 DPI para impressão nítida
        const dpi = 200;
        const mmToPx = (dpi / 25.4);
        const sheetWidthPx = Math.round(paperDimMm.width * mmToPx);
        const sheetHeightPx = Math.round(paperDimMm.height * mmToPx);

        canvas.width = sheetWidthPx;
        canvas.height = sheetHeightPx;

        // Fundo branco limpo
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, sheetWidthPx, sheetHeightPx);

        const rIndex = Math.floor(sheetIndex / cols);
        const cIndex = sheetIndex % cols;

        // Dimensões do pôster completo em pixels
        const totalPosterWidthPx = cols * sheetWidthPx;
        const totalPosterHeightPx = rows * sheetHeightPx;

        // Salva estado para desenhar imagem transformada
        ctx.save();

        // Enquadramento da imagem no pôster
        const imgAspect = loadedImage.width / loadedImage.height;
        const posterAspect = totalPosterWidthPx / totalPosterHeightPx;

        let drawW = totalPosterWidthPx;
        let drawH = totalPosterHeightPx;
        if (imgAspect > posterAspect) {
            drawH = totalPosterHeightPx;
            drawW = totalPosterHeightPx * imgAspect;
        } else {
            drawW = totalPosterWidthPx;
            drawH = totalPosterWidthPx / imgAspect;
        }

        // Aplica Zoom e Panning
        drawW *= (zoom / 100);
        drawH *= (zoom / 100);

        const offsetX = (totalPosterWidthPx - drawW) / 2 + (panX / 100) * totalPosterWidthPx;
        const offsetY = (totalPosterHeightPx - drawH) / 2 + (panY / 100) * totalPosterHeightPx;

        // Deslocamento da folha atual no pôster
        ctx.translate(-cIndex * sheetWidthPx, -rIndex * sheetHeightPx);

        // Aplica rotação e espelhamento se houver
        if (rotation !== 0 || isFlippedH || isFlippedV) {
            ctx.save();
            ctx.translate(totalPosterWidthPx / 2, totalPosterHeightPx / 2);
            if (rotation !== 0) ctx.rotate((rotation * Math.PI) / 180);
            if (isFlippedH || isFlippedV) ctx.scale(isFlippedH ? -1 : 1, isFlippedV ? -1 : 1);
            ctx.drawImage(loadedImage, -drawW / 2, -drawH / 2, drawW, drawH);
            ctx.restore();
        } else {
            ctx.drawImage(loadedImage, offsetX, offsetY, drawW, drawH);
        }

        ctx.restore();

        // DESENHAR GUIAS DE MONTAGEM, MARCAS DE CORTE E ABA "COLE AQUI"
        const marginPx = Math.round(printerMarginMm * mmToPx);
        const overlapPx = Math.round(overlapMm * mmToPx);

        // Aba de colagem na direita (se não for a última coluna)
        if (showGlueTabs && overlapMm > 0 && cIndex < cols - 1) {
            const tabWidthPx = overlapPx;
            const tabX = sheetWidthPx - tabWidthPx;

            ctx.save();
            ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
            ctx.fillRect(tabX, 0, tabWidthPx, sheetHeightPx);

            // Linha pontilhada divisória
            ctx.strokeStyle = '#94a3b8';
            ctx.lineWidth = 2;
            ctx.setLineDash([8, 8]);
            ctx.beginPath();
            ctx.moveTo(tabX, 0);
            ctx.lineTo(tabX, sheetHeightPx);
            ctx.stroke();

            // Texto guia "COLE AQUI"
            ctx.save();
            ctx.translate(tabX + tabWidthPx / 2, sheetHeightPx / 2);
            ctx.rotate(-Math.PI / 2);
            ctx.fillStyle = '#64748b';
            ctx.font = 'bold 22px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('✂️ LINHA DE EMENDA • COLE A FOLHA SEGUINTE AQUI ➔', 0, 0);
            ctx.restore();

            ctx.restore();
        }

        // Aba de colagem na parte inferior (se não for a última linha)
        if (showGlueTabs && overlapMm > 0 && rIndex < rows - 1) {
            const tabHeightPx = overlapPx;
            const tabY = sheetHeightPx - tabHeightPx;

            ctx.save();
            ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
            ctx.fillRect(0, tabY, sheetWidthPx, tabHeightPx);

            ctx.strokeStyle = '#94a3b8';
            ctx.lineWidth = 2;
            ctx.setLineDash([8, 8]);
            ctx.beginPath();
            ctx.moveTo(0, tabY);
            ctx.lineTo(sheetWidthPx, tabY);
            ctx.stroke();

            ctx.fillStyle = '#64748b';
            ctx.font = 'bold 22px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('✂️ LINHA DE EMENDA • COLE A FOLHA DE BAIXO AQUI ➔', sheetWidthPx / 2, tabY + tabHeightPx / 2);
            ctx.restore();
        }

        // Marcas de corte nas 4 quinas
        if (showCutLines) {
            ctx.save();
            ctx.strokeStyle = '#334155';
            ctx.lineWidth = 2;
            const markLen = 30;

            // Canto superior esquerdo
            ctx.beginPath();
            ctx.moveTo(marginPx, marginPx); ctx.lineTo(marginPx + markLen, marginPx);
            ctx.moveTo(marginPx, marginPx); ctx.lineTo(marginPx, marginPx + markLen);
            // Canto superior direito
            ctx.moveTo(sheetWidthPx - marginPx, marginPx); ctx.lineTo(sheetWidthPx - marginPx - markLen, marginPx);
            ctx.moveTo(sheetWidthPx - marginPx, marginPx); ctx.lineTo(sheetWidthPx - marginPx, marginPx + markLen);
            // Canto inferior esquerdo
            ctx.moveTo(marginPx, sheetHeightPx - marginPx); ctx.lineTo(marginPx + markLen, sheetHeightPx - marginPx);
            ctx.moveTo(marginPx, sheetHeightPx - marginPx); ctx.lineTo(marginPx, sheetHeightPx - marginPx - markLen);
            // Canto inferior direito
            ctx.moveTo(sheetWidthPx - marginPx, sheetHeightPx - marginPx); ctx.lineTo(sheetWidthPx - marginPx - markLen, sheetHeightPx - marginPx);
            ctx.moveTo(sheetWidthPx - marginPx, sheetHeightPx - marginPx); ctx.lineTo(sheetWidthPx - marginPx, sheetHeightPx - marginPx - markLen);
            ctx.stroke();
            ctx.restore();
        }

        // Rodapé com Identificação e Coordenadas [L, C]
        if (showPageNumbers) {
            ctx.save();
            ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
            ctx.fillRect(marginPx, sheetHeightPx - 36, sheetWidthPx - marginPx * 2, 28);
            
            ctx.fillStyle = '#0f172a';
            ctx.font = 'bold 15px sans-serif';
            ctx.textAlign = 'left';
            ctx.fillText(`🎉 PÔSTER DE FESTA • Folha ${sheetIndex + 1} de ${cols * rows} [Linha ${rIndex + 1}, Coluna ${cIndex + 1}] • ${totalPosterSize.widthCm}×${totalPosterSize.heightCm}cm`, marginPx + 10, sheetHeightPx - 16);

            ctx.textAlign = 'right';
            ctx.fillStyle = '#ec4899';
            ctx.font = 'bold 13px sans-serif';
            ctx.fillText(`Criador de Pôster • Imprimir em 100%`, sheetWidthPx - marginPx - 10, sheetHeightPx - 16);
            ctx.restore();
        }

        return canvas;
    };

    // Gera PDF de Alta Resolução Pronto para Imprimir com downloadBlob seguro
    const handleGeneratePdf = async () => {
        let img = loadedImage;
        if (!img && selectedImageUrl) {
            img = await new Promise<HTMLImageElement | null>((resolve) => {
                const i = new Image();
                i.onload = () => resolve(i);
                i.onerror = () => resolve(null);
                i.src = selectedImageUrl;
            });
            if (img) setLoadedImage(img);
        }

        if (!img) {
            showToast('❌ Selecione ou envie uma imagem antes de gerar o PDF.');
            return;
        }

        setIsGeneratingPdf(true);
        setProgress({ current: 0, total: printableSheets.length });
        showToast('📄 Preparando páginas em alta resolução para o PDF...');

        try {
            const pdf = new jsPDF({
                orientation: orientation,
                unit: 'mm',
                format: [paperDimMm.width, paperDimMm.height]
            });

            for (let i = 0; i < printableSheets.length; i++) {
                const sheet = printableSheets[i];
                setProgress({ current: i + 1, total: printableSheets.length });

                const canvas = await renderSingleSheetCanvas(sheet.index);
                const imgData = canvas.toDataURL('image/jpeg', 0.95);

                if (i > 0) {
                    pdf.addPage([paperDimMm.width, paperDimMm.height], orientation);
                }

                pdf.addImage(imgData, 'JPEG', 0, 0, paperDimMm.width, paperDimMm.height, undefined, 'FAST');
            }

            const pdfBlob = pdf.output('blob');
            const safeName = (selectedImageName || 'poster-festa').replace(/[^a-zA-Z0-9_-]/g, '_');
            const filename = `${safeName}_${totalPosterSize.widthCm}x${totalPosterSize.heightCm}cm_${printableSheets.length}Folhas_${paperFormat}.pdf`;

            const ok = await downloadBlob(pdfBlob, filename, 120000);
            if (ok) {
                showToast('✅ PDF do pôster baixado com sucesso! Pronto para imprimir em 100%.');
            } else {
                setFallbackDownload({ url: URL.createObjectURL(pdfBlob), filename });
                showToast('⚠️ O navegador pode ter bloqueado o download automático. Use o link abaixo.');
            }
        } catch (err: any) {
            console.error('Erro ao gerar PDF do pôster:', err);
            showToast('❌ Falha ao gerar PDF. Verifique a memória do navegador.');
        } finally {
            setIsGeneratingPdf(false);
            setProgress(null);
        }
    };

    // Gera ZIP com Todas as Folhas em PNG Alta Definição
    const handleGenerateZip = async () => {
        let img = loadedImage;
        if (!img && selectedImageUrl) {
            img = await new Promise<HTMLImageElement | null>((resolve) => {
                const i = new Image();
                i.onload = () => resolve(i);
                i.onerror = () => resolve(null);
                i.src = selectedImageUrl;
            });
            if (img) setLoadedImage(img);
        }

        if (!img) {
            showToast('❌ Selecione ou envie uma imagem antes de gerar o arquivo ZIP.');
            return;
        }

        setIsGeneratingZip(true);
        setProgress({ current: 0, total: printableSheets.length });
        showToast('📦 Renderizando todas as folhas para o arquivo ZIP...');

        try {
            const zip = new JSZip();
            const safeName = (selectedImageName || 'poster-festa').replace(/[^a-zA-Z0-9_-]/g, '_');
            const folder = zip.folder(`poster-${safeName}`) || zip;

            for (let i = 0; i < printableSheets.length; i++) {
                const sheet = printableSheets[i];
                setProgress({ current: i + 1, total: printableSheets.length });

                const canvas = await renderSingleSheetCanvas(sheet.index);
                const dataUrl = canvas.toDataURL('image/png');
                const base64Data = dataUrl.split(',')[1];
                const padIndex = String(sheet.index + 1).padStart(2, '0');
                folder.file(`folha-${padIndex}-linha-${sheet.row}-col-${sheet.col}.png`, base64Data, { base64: true });
            }

            // Adiciona arquivo de instruções TXT dentro do ZIP
            folder.file('INSTRUCOES_DE_IMPRESSAO_E_MONTAGEM.txt', 
`=== CRIADOR DE PÔSTER & PAINÉIS DE FESTA EM FOLHAS A4 ===
Tamanho Total Final: ${totalPosterSize.widthCm} cm de largura x ${totalPosterSize.heightCm} cm de altura
Folhas Totais: ${cols * rows} (${printableSheets.length} ativas para impressão)
Formato: ${paperFormat} (${orientation === 'portrait' ? 'Retrato' : 'Paisagem'})
Abas de Colagem: ${overlapMm} mm (marcação "COLE AQUI")

COMO IMPRIMIR E MONTAR:
1. Abra cada imagem e imprima em TAMANHO REAL / 100% (nunca use "Ajustar à Página").
2. Papel recomendado: Papel Fotográfico Matte ou Glossy 180g ou Papel Offset 180g.
3. Corte as margens brancas onde indicado pelas linhas de corte.
4. Una as folhas em sequência: da esquerda para a direita (Linha 1), depois Linha 2, etc.
5. Use cola branca PVA, fita dupla face fina ou cola bastão sobre as abas "COLE AQUI".
6. Fixe sobre papelão Paraná, placa pluma de isopor ou direto na parede para seu evento!
`
            );

            const content = await zip.generateAsync({ type: 'blob' });
            const zipFilename = `${safeName}_${printableSheets.length}Folhas_${paperFormat}.zip`;
            const ok = await downloadBlob(content, zipFilename, 120000);
            if (ok) {
                showToast('✅ Arquivo ZIP com todas as folhas baixado com sucesso!');
            } else {
                setFallbackDownload({ url: URL.createObjectURL(content), filename: zipFilename });
                showToast('⚠️ Download automático bloqueado. Use o botão de download manual.');
            }
        } catch (err: any) {
            console.error('Erro ao gerar ZIP do pôster:', err);
            showToast('❌ Falha ao criar arquivo compactado.');
        } finally {
            setIsGeneratingZip(false);
            setProgress(null);
        }
    };

    // Baixa todas as folhas avulsas sequencialmente (para quem não quer ou não consegue usar ZIP)
    const handleDownloadAllSeparateSheets = async () => {
        if (!loadedImage) return;
        setIsDownloadingSeparate(true);
        setProgress({ current: 0, total: printableSheets.length });
        showToast('⬇️ Iniciando download de todas as folhas (avulsas)...');

        try {
            const files: Array<{ source: string; filename: string }> = [];
            const safeName = (selectedImageName || 'poster-festa').replace(/[^a-zA-Z0-9_-]/g, '_');

            for (let i = 0; i < printableSheets.length; i++) {
                const sheet = printableSheets[i];
                setProgress({ current: i + 1, total: printableSheets.length });
                const canvas = await renderSingleSheetCanvas(sheet.index);
                const dataUrl = canvas.toDataURL('image/png');
                const padIndex = String(sheet.index + 1).padStart(2, '0');
                files.push({
                    source: dataUrl,
                    filename: `${safeName}_Folha-${padIndex}_L${sheet.row}-C${sheet.col}.png`
                });
            }

            await downloadBatchFiles(files, 350, (current, total) => {
                setProgress({ current, total });
            });
            showToast(`✅ Todas as ${printableSheets.length} folhas foram baixadas com sucesso!`);
        } catch (err) {
            console.error('Erro ao baixar folhas avulsas:', err);
            showToast('❌ Falha ao baixar algumas folhas.');
        } finally {
            setIsDownloadingSeparate(false);
            setProgress(null);
        }
    };

    // Imprimir diretamente pelo navegador com diálogo nativo
    const handleDirectPrint = async () => {
        if (!loadedImage) return;
        setIsGeneratingPdf(true);
        showToast('🖨️ Preparando folhas para o diálogo de impressão...');

        try {
            const printIframe = document.createElement('iframe');
            printIframe.style.position = 'fixed';
            printIframe.style.right = '0';
            printIframe.style.bottom = '0';
            printIframe.style.width = '0';
            printIframe.style.height = '0';
            printIframe.style.border = '0';
            document.body.appendChild(printIframe);

            const doc = printIframe.contentDocument || printIframe.contentWindow?.document;
            if (!doc) {
                await handleGeneratePdf();
                return;
            }

            const imgUrls: string[] = [];
            for (let i = 0; i < printableSheets.length; i++) {
                const sheet = printableSheets[i];
                const canvas = await renderSingleSheetCanvas(sheet.index);
                imgUrls.push(canvas.toDataURL('image/jpeg', 0.95));
            }

            const pageStyle = `@page { size: ${paperDimMm.width}mm ${paperDimMm.height}mm; margin: 0; } @media print { html, body { margin: 0; padding: 0; } img { width: 100%; height: auto; max-height: 100vh; page-break-after: always; display: block; object-fit: contain; } }`;
            const htmlContent = `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="utf-8">
                    <title>Imprimir Pôster - ${selectedImageName}</title>
                    <style>${pageStyle}</style>
                </head>
                <body>
                    ${imgUrls.map(url => `<img src="${url}" />`).join('')}
                </body>
                </html>
            `;

            doc.open();
            doc.write(htmlContent);
            doc.close();

            setTimeout(() => {
                try {
                    printIframe.contentWindow?.focus();
                    printIframe.contentWindow?.print();
                } catch {
                    handleGeneratePdf();
                }
                setTimeout(() => {
                    if (printIframe.parentNode) printIframe.parentNode.removeChild(printIframe);
                }, 4000);
            }, 800);
        } catch (err) {
            console.error('Erro na impressão direta:', err);
            await handleGeneratePdf();
        } finally {
            setIsGeneratingPdf(false);
        }
    };

    // Abrir pré-visualização de folha individual no modal
    const handleInspectSheet = async (index: number) => {
        setSelectedSheetIndex(index);
        const canvas = await renderSingleSheetCanvas(index);
        setPreviewSheetUrl(canvas.toDataURL('image/png'));
    };

    return (
        <div className="space-y-6 pb-20 animate-in fade-in duration-300">
            {/* CABEÇALHO DO MODO: CRIADOR DE PÔSTER (FAZENDO A NOSSA FESTA) */}
            <div className="bg-gradient-to-r from-pink-950/80 via-purple-950/70 to-slate-900 border border-pink-500/30 rounded-3xl p-5 sm:p-6 shadow-2xl relative overflow-hidden backdrop-blur-xl">
                <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-pink-500/10 to-amber-500/10 rounded-full blur-3xl pointer-events-none" />

                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 relative z-10">
                    <div className="space-y-1.5">
                        <div className="flex flex-wrap items-center gap-2">
                            <button
                                type="button"
                                onClick={onBackToArchitect}
                                className="px-3 py-1.5 text-xs font-bold text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer"
                            >
                                <ArrowLeft size={14} />
                                <span>Voltar</span>
                            </button>
                            {onSwitchMode && (
                                <>
                                    <button
                                        type="button"
                                        onClick={() => onSwitchMode('painel_festa')}
                                        className="px-2.5 py-1 text-xs font-bold text-pink-300 hover:text-white bg-pink-950/60 hover:bg-pink-900/80 border border-pink-500/40 rounded-xl flex items-center gap-1 transition-all cursor-pointer shadow-sm"
                                        title="Ir para o Painel de Festa & Topo de Bolo"
                                    >
                                        <span>🎈 Painel de Festa</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => onSwitchMode('cortador')}
                                        className="px-2.5 py-1 text-xs font-bold text-cyan-300 hover:text-white bg-cyan-950/60 hover:bg-cyan-900/80 border border-cyan-500/40 rounded-xl flex items-center gap-1 transition-all cursor-pointer shadow-sm"
                                        title="Ir para o Fatiador de Festa A4/A3 (FatiArt)"
                                    >
                                        <Scissors size={13} />
                                        <span>Fatiador Festa</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => onSwitchMode('rasterbator')}
                                        className="px-2.5 py-1 text-xs font-bold text-teal-300 hover:text-white bg-teal-950/60 hover:bg-teal-900/80 border border-teal-500/40 rounded-xl flex items-center gap-1 transition-all cursor-pointer shadow-sm"
                                        title="Ir para o The Rasterbator Halftone"
                                    >
                                        <span className="font-mono font-bold text-cyan-300">::</span>
                                        <span>The Rasterbator</span>
                                    </button>
                                </>
                            )}
                            <span className="px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider rounded-full bg-pink-500/20 text-pink-300 border border-pink-500/40 flex items-center gap-1">
                                <Sparkles size={11} className="text-pink-400" />
                                <span>Modo Criador de Pôster</span>
                            </span>
                            <span className="px-2.5 py-0.5 text-[10px] font-bold rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30">
                                Folhas A4 & A3
                            </span>
                        </div>
                        <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2">
                            <span>Criador de Pôster</span>
                            <span className="text-pink-400 text-lg font-normal">:: Painel & Displays em Folhas A4</span>
                        </h2>
                        <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
                            Crie painéis decorativos gigantes e personagens recortados divididos em folhas A4 ou A3 para imprimir na sua impressora comum doméstica, com abas de colagem <strong className="text-pink-300">"COLE AQUI"</strong> e marcas de corte.
                        </p>
                    </div>

                    {/* Resumo em tempo real do tamanho final */}
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3 bg-slate-900/90 border border-pink-500/30 rounded-2xl p-3.5 shadow-lg">
                        <div className="px-3 py-1.5 bg-pink-500/15 rounded-xl border border-pink-500/25">
                            <span className="text-[10px] uppercase font-bold text-pink-300 block">Tamanho Final</span>
                            <span className="text-base sm:text-lg font-black text-white">{totalPosterSize.widthCm} × {totalPosterSize.heightCm} cm</span>
                        </div>
                        <div className="px-3 py-1.5 bg-purple-500/15 rounded-xl border border-purple-500/25">
                            <span className="text-[10px] uppercase font-bold text-purple-300 block">Total Folhas</span>
                            <span className="text-base sm:text-lg font-black text-white">{printableSheets.length} {paperFormat}</span>
                        </div>
                        <button
                            type="button"
                            onClick={() => setShowGuideModal(true)}
                            className="px-3.5 py-2.5 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-1.5 transition-all cursor-pointer active:scale-95"
                        >
                            <HelpCircle size={15} />
                            <span>Guia de Montagem</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* SELEÇÃO RÁPIDA DE IMAGEM & AMOSTRAS DE FESTA */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 backdrop-blur-md">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                        <ImageIcon size={16} className="text-pink-400" />
                        <span className="text-xs font-bold text-white uppercase tracking-wider">Imagem do Pôster:</span>
                        <span className="text-xs font-semibold text-slate-300 truncate max-w-xs">{selectedImageName}</span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleImageUpload}
                            accept="image/*"
                            className="hidden"
                        />
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl border border-slate-700 flex items-center gap-1.5 transition cursor-pointer"
                        >
                            <Upload size={13} />
                            <span>Enviar Imagem do Celular/PC</span>
                        </button>

                        {onOpenBgRemover && (
                            <button
                                type="button"
                                onClick={onOpenBgRemover}
                                className="px-3 py-1.5 bg-teal-500/20 hover:bg-teal-500/30 text-teal-300 border border-teal-500/40 text-xs font-bold rounded-xl flex items-center gap-1.5 transition cursor-pointer"
                                title="Remova o fundo para transformar qualquer foto em display recortado!"
                            >
                                <Scissors size={13} />
                                <span>Remover Fundo (Display Recortado)</span>
                            </button>
                        )}
                    </div>
                </div>

                {/* Miniaturas de amostras prontas para testar com 1 clique */}
                <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center gap-2 overflow-x-auto pb-1">
                    <span className="text-[11px] font-bold text-slate-400 whitespace-nowrap">Amostras prontas:</span>
                    {SAMPLE_POSTERS.map(sample => (
                        <button
                            key={sample.id}
                            type="button"
                            onClick={() => {
                                setSelectedImageUrl(sample.svgDataUrl);
                                setSelectedImageName(sample.name);
                                setPosterType(sample.category === 'mascote' ? 'mascot' : 'full');
                                setExcludedSheetIndices(new Set());
                            }}
                            className={`px-2.5 py-1 text-xs rounded-lg font-bold border transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                                selectedImageName === sample.name
                                    ? 'bg-pink-500/20 border-pink-400 text-pink-200'
                                    : 'bg-slate-800/60 border-slate-700/80 text-slate-300 hover:bg-slate-800'
                            }`}
                        >
                            <span>{sample.category === 'mascote' ? '✂️' : '🎨'}</span>
                            <span>{sample.name}</span>
                        </button>
                    ))}
                    {availableImages.map(img => (
                        <button
                            key={img.id}
                            type="button"
                            onClick={() => {
                                const url = img.previewUrl || (img.base64Data ? `data:${img.mimeType || 'image/png'};base64,${img.base64Data}` : '');
                                if (url) {
                                    setSelectedImageUrl(url);
                                    setSelectedImageName(img.name);
                                    setExcludedSheetIndices(new Set());
                                }
                            }}
                            className="px-2.5 py-1 text-xs rounded-lg font-medium bg-slate-800/60 hover:bg-slate-700 border border-slate-700 text-slate-300 flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
                        >
                            <ImageIcon size={12} className="text-blue-400" />
                            <span className="truncate max-w-[100px]">{img.name}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* ÁREA PRINCIPAL: CONTROLES À ESQUERDA (5 COLS) E PRÉ-VISUALIZAÇÃO À DIREITA (7 COLS) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* COLUNA ESQUERDA: CONTROLES E FORMATAÇÃO DO PÔSTER */}
                <div className="lg:col-span-5 space-y-5">
                    {/* CARD 1: FORMATO DO PÔSTER & PRESETS RÁPIDOS */}
                    <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 space-y-4 shadow-xl backdrop-blur-md">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Grid3X3 size={17} className="text-pink-400" />
                                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Tamanho do Pôster</h3>
                            </div>
                            <span className="text-xs font-bold text-pink-300 bg-pink-500/10 px-2 py-0.5 rounded-md border border-pink-500/20">
                                {cols} colunas × {rows} linhas
                            </span>
                        </div>

                        {/* Botões Visuais de Presets Rápidos */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                            {POSTER_PRESETS.map(preset => {
                                const isSelected = activePresetId === preset.id;
                                return (
                                    <button
                                        key={preset.id}
                                        type="button"
                                        onClick={() => handleSelectPreset(preset)}
                                        className={`p-3 rounded-2xl border text-left transition-all relative flex flex-col justify-between cursor-pointer ${
                                            isSelected
                                                ? 'bg-gradient-to-br from-pink-500/20 to-purple-500/20 border-pink-500 text-white shadow-lg ring-1 ring-pink-400/50'
                                                : 'bg-slate-800/60 hover:bg-slate-800 border-slate-700/80 text-slate-300'
                                        }`}
                                    >
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-sm font-black tracking-tight">{preset.label}</span>
                                            {preset.badge && (
                                                <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-full ${
                                                    isSelected ? 'bg-pink-500 text-white' : 'bg-slate-700 text-slate-300'
                                                }`}>
                                                    {preset.badge}
                                                </span>
                                            )}
                                        </div>
                                        <span className="text-[11px] font-bold text-pink-300">{preset.approxSizeCm}</span>
                                        <span className="text-[10px] text-slate-400 truncate mt-0.5">{preset.sheetsCount} folhas</span>
                                    </button>
                                );
                            })}
                        </div>

                        {/* Controles de Colunas e Linhas Personalizadas */}
                        <div className="pt-2 border-t border-slate-800 grid grid-cols-2 gap-3">
                            <div>
                                <label className="text-[11px] font-bold text-slate-300 block mb-1">Colunas ({cols}):</label>
                                <input
                                    type="range"
                                    min={1}
                                    max={10}
                                    value={cols}
                                    onChange={e => {
                                        setCols(parseInt(e.target.value));
                                        setActivePresetId('custom');
                                        setExcludedSheetIndices(new Set());
                                    }}
                                    className="w-full accent-pink-500"
                                />
                            </div>
                            <div>
                                <label className="text-[11px] font-bold text-slate-300 block mb-1">Linhas ({rows}):</label>
                                <input
                                    type="range"
                                    min={1}
                                    max={10}
                                    value={rows}
                                    onChange={e => {
                                        setRows(parseInt(e.target.value));
                                        setActivePresetId('custom');
                                        setExcludedSheetIndices(new Set());
                                    }}
                                    className="w-full accent-pink-500"
                                />
                            </div>
                        </div>

                        {/* Tamanho e Orientação do Papel */}
                        <div className="pt-2 border-t border-slate-800 grid grid-cols-2 gap-3">
                            <div>
                                <label className="text-[11px] font-bold text-slate-300 block mb-1">Papel:</label>
                                <select
                                    value={paperFormat}
                                    onChange={e => setPaperFormat(e.target.value as any)}
                                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-2.5 py-2 text-xs font-bold text-white focus:outline-none focus:border-pink-500"
                                >
                                    <option value="A4">A4 (210 × 297 mm)</option>
                                    <option value="A3">A3 (297 × 420 mm)</option>
                                    <option value="Carta">Carta (216 × 279 mm)</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-[11px] font-bold text-slate-300 block mb-1">Orientação:</label>
                                <div className="grid grid-cols-2 gap-1.5">
                                    <button
                                        type="button"
                                        onClick={() => setOrientation('portrait')}
                                        className={`py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                                            orientation === 'portrait' ? 'bg-pink-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'
                                        }`}
                                    >
                                        Retrato ▯
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setOrientation('landscape')}
                                        className={`py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                                            orientation === 'landscape' ? 'bg-pink-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'
                                        }`}
                                    >
                                        Paisagem ▭
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* CARD 2: MODO DO PÔSTER (PAINEL CHEIO VS MASCOTE RECORTADO) */}
                    <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 space-y-4 shadow-xl backdrop-blur-md">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Scissors size={17} className="text-pink-400" />
                                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Modo de Pôster</h3>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <button
                                type="button"
                                onClick={() => setPosterType('full')}
                                className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                                    posterType === 'full'
                                        ? 'bg-pink-500/20 border-pink-400 text-white shadow-md ring-1 ring-pink-400/40'
                                        : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:text-slate-200'
                                }`}
                            >
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-base">🖼️</span>
                                    <span className="text-xs font-black">Painel Completo</span>
                                </div>
                                <p className="text-[10px] text-slate-400">
                                    Imagem preenche todas as folhas do pôster. Ideal para fundos de festa e banners.
                                </p>
                            </button>

                            <button
                                type="button"
                                onClick={() => setPosterType('mascot')}
                                className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                                    posterType === 'mascot'
                                        ? 'bg-pink-500/20 border-pink-400 text-white shadow-md ring-1 ring-pink-400/40'
                                        : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:text-slate-200'
                                }`}
                            >
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-base">✂️</span>
                                    <span className="text-xs font-black">Mascote Recortado</span>
                                </div>
                                <p className="text-[10px] text-slate-400">
                                    Para personagens com fundo transparente ou displays de chão de festa infantil.
                                </p>
                            </button>
                        </div>

                        {posterType === 'mascot' && (
                            <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-2xl space-y-2">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Wand2 size={14} className="text-amber-400" />
                                        <span className="text-xs font-bold text-amber-200">Economia Inteligente:</span>
                                    </div>
                                    <span className="text-xs font-bold text-amber-300">
                                        {excludedSheetIndices.size > 0 ? `${excludedSheetIndices.size} folhas descartadas` : 'Todas ativas'}
                                    </span>
                                </div>
                                <p className="text-[11px] text-slate-300">
                                    💡 <em>Dica:</em> Clique nas folhas vazias na grade ao lado para desmarcá-las e não gastar tinta nem papel à toa!
                                </p>
                                {excludedSheetIndices.size > 0 && (
                                    <button
                                        type="button"
                                        onClick={() => setExcludedSheetIndices(new Set())}
                                        className="text-[11px] font-bold text-amber-400 underline hover:text-amber-300 cursor-pointer"
                                    >
                                        Restaurar todas as folhas
                                    </button>
                                )}
                            </div>
                        )}
                    </div>

                    {/* CARD 3: AJUSTES MANUAIS DE POSIÇÃO, ZOOM E ROTAÇÃO */}
                    <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 space-y-4 shadow-xl backdrop-blur-md">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <SlidersHorizontal size={17} className="text-pink-400" />
                                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Ajustes da Imagem</h3>
                            </div>
                            <button
                                type="button"
                                onClick={handleResetAdjustments}
                                className="text-xs font-bold text-slate-400 hover:text-pink-300 flex items-center gap-1 transition cursor-pointer"
                                title="Resetar todos os ajustes manuais"
                            >
                                <RefreshCw size={12} />
                                <span>Resetar</span>
                            </button>
                        </div>

                        {/* Botões Rápidos de Enquadramento */}
                        <div className="grid grid-cols-3 gap-2">
                            <button
                                type="button"
                                onClick={handleFitToPage}
                                className="py-2 px-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 flex items-center justify-center gap-1 transition cursor-pointer"
                            >
                                <Minimize2 size={13} />
                                <span>Ajustar 100%</span>
                            </button>
                            <button
                                type="button"
                                onClick={handleFillPoster}
                                className="py-2 px-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 flex items-center justify-center gap-1 transition cursor-pointer"
                            >
                                <Maximize2 size={13} />
                                <span>Preencher</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => { setPanX(0); setPanY(0); }}
                                className="py-2 px-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 flex items-center justify-center gap-1 transition cursor-pointer"
                            >
                                <Move size={13} />
                                <span>Centralizar</span>
                            </button>
                        </div>

                        {/* Slider de Zoom */}
                        <div className="space-y-1">
                            <div className="flex justify-between text-xs">
                                <span className="font-bold text-slate-300">Zoom / Escala:</span>
                                <span className="font-bold text-pink-300">{zoom}%</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <ZoomOut size={14} className="text-slate-400" />
                                <input
                                    type="range"
                                    min={50}
                                    max={250}
                                    value={zoom}
                                    onChange={e => setZoom(parseInt(e.target.value))}
                                    className="w-full accent-pink-500"
                                />
                                <ZoomIn size={14} className="text-slate-400" />
                            </div>
                        </div>

                        {/* Sliders de Deslocamento X e Y */}
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <div className="flex justify-between text-[11px]">
                                    <span className="font-bold text-slate-400">Posição Horizontal (X):</span>
                                    <span className="font-mono text-pink-300">{panX > 0 ? `+${panX}%` : `${panX}%`}</span>
                                </div>
                                <input
                                    type="range"
                                    min={-60}
                                    max={60}
                                    value={panX}
                                    onChange={e => setPanX(parseInt(e.target.value))}
                                    className="w-full accent-pink-500"
                                />
                            </div>
                            <div className="space-y-1">
                                <div className="flex justify-between text-[11px]">
                                    <span className="font-bold text-slate-400">Posição Vertical (Y):</span>
                                    <span className="font-mono text-pink-300">{panY > 0 ? `+${panY}%` : `${panY}%`}</span>
                                </div>
                                <input
                                    type="range"
                                    min={-60}
                                    max={60}
                                    value={panY}
                                    onChange={e => setPanY(parseInt(e.target.value))}
                                    className="w-full accent-pink-500"
                                />
                            </div>
                        </div>

                        {/* Rotação e Espelhamento */}
                        <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-2">
                            <div className="flex items-center gap-1.5">
                                <button
                                    type="button"
                                    onClick={() => setRotation(r => (r - 90) % 360)}
                                    className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700 transition cursor-pointer"
                                    title="Girar 90° à esquerda"
                                >
                                    <RotateCw size={14} className="transform -scale-x-100" />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setRotation(r => (r + 90) % 360)}
                                    className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700 transition cursor-pointer"
                                    title="Girar 90° à direita"
                                >
                                    <RotateCw size={14} />
                                </button>
                                <span className="text-xs font-mono text-slate-400 px-1">{rotation}°</span>
                            </div>

                            <div className="flex items-center gap-1.5">
                                <button
                                    type="button"
                                    onClick={() => setIsFlippedH(f => !f)}
                                    className={`px-2.5 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1 transition cursor-pointer ${
                                        isFlippedH ? 'bg-pink-600 border-pink-400 text-white' : 'bg-slate-800 border-slate-700 text-slate-300'
                                    }`}
                                    title="Espelhar Horizontalmente"
                                >
                                    <FlipHorizontal size={13} />
                                    <span>Espelho</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setIsFlippedV(f => !f)}
                                    className={`px-2.5 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1 transition cursor-pointer ${
                                        isFlippedV ? 'bg-pink-600 border-pink-400 text-white' : 'bg-slate-800 border-slate-700 text-slate-300'
                                    }`}
                                    title="Espelhar Verticalmente"
                                >
                                    <FlipVertical size={13} />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* CARD 4: ABAS DE COLAGEM, MARGENS E SANGRIAS */}
                    <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 space-y-4 shadow-xl backdrop-blur-md">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Layers size={17} className="text-pink-400" />
                                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Abas & Sangria de Impressão</h3>
                            </div>
                        </div>

                        {/* Largura da Aba "COLE AQUI" */}
                        <div className="space-y-1">
                            <div className="flex justify-between text-xs">
                                <span className="font-bold text-slate-300">Aba de Colagem ("COLE AQUI"):</span>
                                <span className="font-bold text-pink-300">{overlapMm === 0 ? 'Sem aba' : `${overlapMm} mm`}</span>
                            </div>
                            <div className="grid grid-cols-5 gap-1.5">
                                {[0, 5, 10, 15, 20].map(mm => (
                                    <button
                                        key={mm}
                                        type="button"
                                        onClick={() => setOverlapMm(mm)}
                                        className={`py-1.5 text-xs font-bold rounded-xl border transition cursor-pointer ${
                                            overlapMm === mm
                                                ? 'bg-pink-600 border-pink-400 text-white shadow-md'
                                                : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
                                        }`}
                                    >
                                        {mm === 0 ? '0 mm' : `${mm}mm`}
                                    </button>
                                ))}
                            </div>
                            <p className="text-[10px] text-slate-400">
                                💡 Recomendado: <strong>10 mm</strong> para montagem tipo telha (uma folha sobreposta à outra sem falha branca).
                            </p>
                        </div>

                        {/* Checkboxes de Guias */}
                        <div className="pt-2 border-t border-slate-800 space-y-2.5">
                            <label className="flex items-center gap-2.5 text-xs font-bold text-slate-200 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={showGlueTabs}
                                    onChange={e => setShowGlueTabs(e.target.checked)}
                                    className="w-4 h-4 accent-pink-500 rounded"
                                />
                                <span>Imprimir texto guia "COLE AQUI" na aba de sobreposição</span>
                            </label>

                            <label className="flex items-center gap-2.5 text-xs font-bold text-slate-200 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={showCutLines}
                                    onChange={e => setShowCutLines(e.target.checked)}
                                    className="w-4 h-4 accent-pink-500 rounded"
                                />
                                <span>Marcas de corte em cruz nos cantos das folhas</span>
                            </label>

                            <label className="flex items-center gap-2.5 text-xs font-bold text-slate-200 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={showPageNumbers}
                                    onChange={e => setShowPageNumbers(e.target.checked)}
                                    className="w-4 h-4 accent-pink-500 rounded"
                                />
                                <span>Numeração e coordenadas de montagem no rodapé [L, C]</span>
                            </label>
                        </div>
                    </div>
                </div>

                {/* COLUNA DIREITA: PRÉ-VISUALIZAÇÃO INTERATIVA & EXPORTAÇÕES */}
                <div className="lg:col-span-7 space-y-5">
                    {/* BARRA SUPERIOR DE PRÉ-VISUALIZAÇÃO & MODOS */}
                    <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-4 shadow-xl backdrop-blur-md flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={() => setPreviewMode('grid')}
                                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
                                    previewMode === 'grid'
                                        ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-md'
                                        : 'bg-slate-800 text-slate-400 hover:text-white'
                                }`}
                            >
                                <Grid3X3 size={14} />
                                <span>Grade de Folhas</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setPreviewMode('joined')}
                                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
                                    previewMode === 'joined'
                                        ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-md'
                                        : 'bg-slate-800 text-slate-400 hover:text-white'
                                }`}
                            >
                                <Eye size={14} />
                                <span>Montagem Final</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setPreviewMode('scale')}
                                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
                                    previewMode === 'scale'
                                        ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-md'
                                        : 'bg-slate-800 text-slate-400 hover:text-white'
                                }`}
                                title="Visualizar com silhueta humana de 1,70m para ter noção real de tamanho"
                            >
                                <UserCheck size={14} />
                                <span>Escala Real</span>
                            </button>
                        </div>

                        <div className="text-xs font-bold text-slate-400 flex items-center gap-2">
                            <span>Arraste no quadro para posicionar</span>
                        </div>
                    </div>

                    {/* CANVAS / CONTAINER DE PRÉ-VISUALIZAÇÃO INTERATIVA COM GRADE DAS FOLHAS */}
                    <div 
                        className="bg-slate-950 border border-slate-800 rounded-3xl p-4 sm:p-6 shadow-2xl relative overflow-hidden min-h-[460px] flex items-center justify-center select-none"
                        onMouseDown={e => {
                            setIsDragging(true);
                            dragStartRef.current = { x: e.clientX, y: e.clientY, initialPanX: panX, initialPanY: panY };
                        }}
                        onMouseMove={e => {
                            if (!isDragging) return;
                            const dx = e.clientX - dragStartRef.current.x;
                            const dy = e.clientY - dragStartRef.current.y;
                            setPanX(Math.min(60, Math.max(-60, Math.round(dragStartRef.current.initialPanX + dx / 5))));
                            setPanY(Math.min(60, Math.max(-60, Math.round(dragStartRef.current.initialPanY + dy / 5))));
                        }}
                        onMouseUp={() => setIsDragging(false)}
                        onMouseLeave={() => setIsDragging(false)}
                    >
                        {/* Grade de fundo estilo mesa de corte / réguas */}
                        <div 
                            className="absolute inset-0 opacity-15 pointer-events-none" 
                            style={{
                                backgroundImage: 'linear-gradient(to right, #64748b 1px, transparent 1px), linear-gradient(to bottom, #64748b 1px, transparent 1px)',
                                backgroundSize: '24px 24px'
                            }} 
                        />

                        {/* MODO ESCALA REAL: Silhueta humana ao lado */}
                        {previewMode === 'scale' && (
                            <div className="absolute left-6 bottom-6 flex flex-col items-center pointer-events-none z-20 opacity-80">
                                <svg width="60" height="170" viewBox="0 0 60 170" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <circle cx="30" cy="20" r="14" fill="#38bdf8"/>
                                    <path d="M 12 45 Q 30 38 48 45 L 42 105 L 18 105 Z" fill="#38bdf8"/>
                                    <rect x="18" y="105" width="9" height="60" rx="3" fill="#38bdf8"/>
                                    <rect x="33" y="105" width="9" height="60" rx="3" fill="#38bdf8"/>
                                </svg>
                                <span className="text-[10px] font-bold text-sky-400 mt-1">Pessoa 1,70m</span>
                            </div>
                        )}

                        {/* O PÔSTER EM SI: CONTAINER COM ASPECT RATIO E GRADE DINÂMICA */}
                        <div 
                            className="relative max-w-full max-h-[500px] border-4 border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden bg-slate-900 transition-all cursor-move"
                            style={{
                                aspectRatio: `${totalPosterSize.aspectRatio}`,
                                width: '100%',
                                maxWidth: cols > rows ? '540px' : '400px'
                            }}
                        >
                            {/* IMAGEM PRINCIPAL TRANSFORMADA COM ZOOM, PAN E ROTAÇÃO */}
                            {selectedImageUrl && (
                                <div 
                                    className="absolute inset-0 flex items-center justify-center pointer-events-none"
                                    style={{
                                        transform: `scale(${zoom / 100}) translate(${panX}%, ${panY}%) rotate(${rotation}deg) scale(${isFlippedH ? -1 : 1}, ${isFlippedV ? -1 : 1})`,
                                        transformOrigin: 'center center',
                                        transition: isDragging ? 'none' : 'transform 0.15s ease-out'
                                    }}
                                >
                                    <img
                                        src={selectedImageUrl}
                                        alt="Preview do Pôster"
                                        className="w-full h-full object-contain pointer-events-none"
                                    />
                                </div>
                            )}

                            {/* SOBREPOSIÇÃO DA GRADE DAS FOLHAS */}
                            {previewMode === 'grid' && (
                                <div 
                                    className="absolute inset-0 grid pointer-events-auto"
                                    style={{
                                        gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
                                        gridTemplateRows: `repeat(${rows}, minmax(0, 1fr))`
                                    }}
                                >
                                    {sheetsData.map(sheet => {
                                        const isExcluded = sheet.excluded;
                                        return (
                                            <div
                                                key={sheet.index}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    if (posterType === 'mascot') {
                                                        handleToggleSheetExclusion(sheet.index);
                                                    } else {
                                                        handleInspectSheet(sheet.index);
                                                    }
                                                }}
                                                className={`border border-pink-500/40 relative group transition-all cursor-pointer flex flex-col justify-between p-1.5 ${
                                                    isExcluded
                                                        ? 'bg-slate-950/90 backdrop-blur-sm opacity-40 border-dashed border-red-500/60'
                                                        : 'hover:bg-pink-500/10'
                                                }`}
                                                title={posterType === 'mascot' ? (isExcluded ? 'Clique para reativar folha' : 'Clique para descartar folha vazia') : 'Clique para inspecionar'}
                                            >
                                                {/* Número da Folha e Coordenada */}
                                                <div className="flex items-center justify-between pointer-events-none">
                                                    <span className={`text-[10px] font-black px-1.5 py-0.5 rounded shadow ${
                                                        isExcluded ? 'bg-red-500 text-white' : 'bg-slate-900/90 text-pink-300 border border-pink-500/30'
                                                    }`}>
                                                        #{sheet.index + 1}
                                                    </span>
                                                    <span className="text-[9px] font-mono font-bold text-slate-300 bg-slate-950/80 px-1 rounded">
                                                        L{sheet.row}C{sheet.col}
                                                    </span>
                                                </div>

                                                {/* Marcas de corte nas quinas */}
                                                {showCutLines && !isExcluded && (
                                                    <div className="absolute inset-0 pointer-events-none opacity-40">
                                                        <span className="absolute top-0 left-0 text-[8px] text-pink-400 font-mono">+</span>
                                                        <span className="absolute top-0 right-0 text-[8px] text-pink-400 font-mono">+</span>
                                                        <span className="absolute bottom-0 left-0 text-[8px] text-pink-400 font-mono">+</span>
                                                        <span className="absolute bottom-0 right-0 text-[8px] text-pink-400 font-mono">+</span>
                                                    </div>
                                                )}

                                                {/* Aba de sobreposição na direita */}
                                                {showGlueTabs && overlapMm > 0 && sheet.col < cols && !isExcluded && (
                                                    <div className="absolute right-0 top-0 bottom-0 w-2.5 bg-pink-500/20 border-l border-dashed border-pink-400/60 pointer-events-none" />
                                                )}

                                                {/* Status da Folha / Ação */}
                                                <div className="text-center pointer-events-none">
                                                    {isExcluded ? (
                                                        <span className="text-[9px] font-black text-red-400 uppercase tracking-tight">Descartada</span>
                                                    ) : (
                                                        <span className="text-[9px] font-bold text-pink-300 opacity-0 group-hover:opacity-100 transition bg-slate-950/80 px-1 rounded">
                                                            🔍 Ver Folha
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* BARRA DE AÇÕES & EXPORTAÇÕES PROFISSIONAIS */}
                    <div className="bg-gradient-to-r from-slate-900 via-pink-950/40 to-slate-900 border border-pink-500/30 rounded-3xl p-5 shadow-2xl backdrop-blur-md space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div>
                                <h3 className="text-base font-black text-white flex items-center gap-2">
                                    <span>Exportação & Impressão</span>
                                    <span className="text-xs font-bold text-pink-300 bg-pink-500/20 px-2 py-0.5 rounded-full">
                                        {printableSheets.length} páginas {paperFormat}
                                    </span>
                                </h3>
                                <p className="text-xs text-slate-300">
                                    Documento dimensionado para <strong>{totalPosterSize.widthCm} × {totalPosterSize.heightCm} cm</strong> com resolução gráfica profissional.
                                </p>
                            </div>

                            {/* Custo estimado das impressões */}
                            <div className="text-right">
                                <span className="text-[10px] uppercase font-bold text-slate-400 block">Custo Estimado Papel</span>
                                <span className="text-sm font-black text-emerald-400">
                                    ~R$ {(printableSheets.length * 0.45).toFixed(2).replace('.', ',')}
                                </span>
                            </div>
                        </div>

                        {/* BARRAS DE PROGRESSO DURANTE PROCESSAMENTO */}
                        {progress && (
                            <div className="p-3 bg-pink-500/10 border border-pink-500/30 rounded-2xl space-y-2">
                                <div className="flex justify-between text-xs font-bold text-pink-200">
                                    <span>Renderizando páginas do pôster...</span>
                                    <span>{progress.current} de {progress.total}</span>
                                </div>
                                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                                    <div 
                                        className="h-full bg-gradient-to-r from-pink-500 to-purple-600 transition-all duration-200"
                                        style={{ width: `${(progress.current / progress.total) * 100}%` }}
                                    />
                                </div>
                            </div>
                        )}

                        {/* BOTÕES DE EXPORTAÇÃO */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                            <button
                                type="button"
                                onClick={handleGeneratePdf}
                                disabled={isGeneratingPdf || isGeneratingZip || isDownloadingSeparate || !loadedImage}
                                className="py-3 px-3.5 bg-gradient-to-r from-pink-600 via-rose-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white font-black text-xs rounded-2xl shadow-lg shadow-pink-500/25 flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
                            >
                                <FileText size={16} />
                                <span>{isGeneratingPdf ? 'Gerando PDF...' : 'Baixar PDF (Pronto)'}</span>
                            </button>

                            <button
                                type="button"
                                onClick={handleGenerateZip}
                                disabled={isGeneratingPdf || isGeneratingZip || isDownloadingSeparate || !loadedImage}
                                className="py-3 px-3.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-2xl border border-slate-700 flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
                            >
                                <Archive size={16} className="text-purple-400" />
                                <span>{isGeneratingZip ? 'Criando ZIP...' : 'Baixar ZIP (Todas)'}</span>
                            </button>

                            <button
                                type="button"
                                onClick={handleDownloadAllSeparateSheets}
                                disabled={isGeneratingPdf || isGeneratingZip || isDownloadingSeparate || !loadedImage}
                                className="py-3 px-3.5 bg-slate-800 hover:bg-slate-700 text-pink-300 font-bold text-xs rounded-2xl border border-pink-500/30 flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
                                title="Baixa todas as folhas em imagens individuais separadas"
                            >
                                <Download size={16} className="text-pink-400" />
                                <span>{isDownloadingSeparate ? 'Baixando...' : 'Baixar Folha a Folha'}</span>
                            </button>

                            <button
                                type="button"
                                onClick={handleDirectPrint}
                                disabled={isGeneratingPdf || isGeneratingZip || isDownloadingSeparate || !loadedImage}
                                className="py-3 px-3.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-2xl border border-slate-700 flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
                            >
                                <Printer size={16} className="text-emerald-400" />
                                <span>Imprimir Folhas</span>
                            </button>
                        </div>

                        {/* Banner de Fallback Manual caso o navegador tenha bloqueado popup automático */}
                        {fallbackDownload && (
                            <div className="p-3 bg-amber-500/15 border border-amber-500/40 rounded-2xl flex items-center justify-between gap-3 text-xs animate-in fade-in">
                                <div className="flex items-center gap-2 text-amber-200">
                                    <AlertCircle size={16} className="text-amber-400 shrink-0" />
                                    <span>Arquivo pronto: <strong>{fallbackDownload.filename}</strong></span>
                                </div>
                                <a
                                    href={fallbackDownload.url}
                                    download={fallbackDownload.filename}
                                    className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl flex items-center gap-1 shrink-0"
                                >
                                    <Download size={13} />
                                    <span>Clique para Baixar</span>
                                </a>
                            </div>
                        )}

                        {/* Atalhos para outros módulos integrados */}
                        <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-xs">
                            <span className="text-slate-400">Quer melhorar a qualidade da imagem antes de imprimir?</span>
                            <div className="flex items-center gap-2">
                                {onOpenUpscale && (
                                    <button
                                        type="button"
                                        onClick={() => onOpenUpscale(selectedImageUrl, selectedImageName)}
                                        className="text-emerald-400 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                                    >
                                        <Sparkles size={12} />
                                        <span>Upscale 4K</span>
                                    </button>
                                )}
                                {onOpenBirthdayStudio && (
                                    <button
                                        type="button"
                                        onClick={onOpenBirthdayStudio}
                                        className="text-pink-400 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                                    >
                                        <PartyPopper size={12} />
                                        <span>Painel Redondo 1.5m</span>
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* MODAL: GUIA PASSO A PASSO DE IMPRESSÃO E MONTAGEM (FAZENDO A NOSSA FESTA) */}
            {showGuideModal && (
                <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
                    <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-5 animate-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                            <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-full bg-pink-500/20 text-pink-400 flex items-center justify-center font-bold">
                                    💡
                                </div>
                                <div>
                                    <h3 className="text-lg font-black text-white">Guia de Impressão e Montagem</h3>
                                    <p className="text-xs text-slate-400">Passo a passo para montar seu painel sem falhas</p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowGuideModal(false)}
                                className="p-2 text-slate-400 hover:text-white rounded-xl bg-slate-800/60 cursor-pointer"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* CARROSSEL DE ETAPAS DO GUIA */}
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                <div className={`p-3.5 rounded-2xl border transition ${guideStep === 1 ? 'bg-pink-500/20 border-pink-400 text-white' : 'bg-slate-800/60 border-slate-700 text-slate-400'}`}>
                                    <span className="text-xs font-black text-pink-300 block mb-1">Passo 1</span>
                                    <h4 className="text-sm font-bold text-white mb-1">Configurar Impressora</h4>
                                    <p className="text-[11px] text-slate-300">
                                        Configure a impressora para <strong>100% / Tamanho Real</strong>. Desative "Ajustar à Página" para que as folhas encaixem perfeitamente.
                                    </p>
                                </div>
                                <div className={`p-3.5 rounded-2xl border transition ${guideStep === 2 ? 'bg-pink-500/20 border-pink-400 text-white' : 'bg-slate-800/60 border-slate-700 text-slate-400'}`}>
                                    <span className="text-xs font-black text-pink-300 block mb-1">Passo 2</span>
                                    <h4 className="text-sm font-bold text-white mb-1">Papel Recomendado</h4>
                                    <p className="text-[11px] text-slate-300">
                                        Use <strong>Papel Fotográfico Matte 180g</strong> (fosco não reflete flash de fotos) ou <strong>Papel Offset 180g a 240g</strong>.
                                    </p>
                                </div>
                                <div className={`p-3.5 rounded-2xl border transition ${guideStep === 3 ? 'bg-pink-500/20 border-pink-400 text-white' : 'bg-slate-800/60 border-slate-700 text-slate-400'}`}>
                                    <span className="text-xs font-black text-pink-300 block mb-1">Passo 3</span>
                                    <h4 className="text-sm font-bold text-white mb-1">Corte e Colagem</h4>
                                    <p className="text-[11px] text-slate-300">
                                        Corte as margens brancas da folha da esquerda e sobreponha sobre a aba <strong>"COLE AQUI"</strong> da folha da direita com fita dupla face ou cola.
                                    </p>
                                </div>
                            </div>

                            <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-2">
                                <h5 className="text-xs font-bold text-pink-300 uppercase tracking-wider">Como Fazer Display de Chão (Personagem Recortado):</h5>
                                <ul className="text-xs text-slate-300 space-y-1.5 list-disc list-inside">
                                    <li>Após colar todas as folhas A4 do personagem, cole o pôster inteiro sobre uma placa de <strong>Papelão Paraná</strong> ou <strong>Isopor Pluma EPS (5mm)</strong>.</li>
                                    <li>Com um estilete afiado, recorte em volta de todo o contorno do personagem.</li>
                                    <li>Faça um "pé de apoio" triangular de papelão atrás para o display ficar em pé sozinho ao lado da mesa de bolo!</li>
                                </ul>
                            </div>
                        </div>

                        <div className="flex justify-end pt-2">
                            <button
                                type="button"
                                onClick={() => setShowGuideModal(false)}
                                className="px-5 py-2.5 bg-gradient-to-r from-pink-600 to-purple-600 text-white font-bold text-xs rounded-xl cursor-pointer"
                            >
                                Entendi, vamos criar!
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL: INSPEÇÃO DE FOLHA INDIVIDUAL COM MARCAS E ABAS */}
            {selectedSheetIndex !== null && previewSheetUrl && (
                <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
                    <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-5 shadow-2xl space-y-4 animate-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                            <div>
                                <h3 className="text-sm font-black text-white">
                                    Inspeção da Folha #{selectedSheetIndex + 1} de {cols * rows}
                                </h3>
                                <p className="text-xs text-slate-400">
                                    Formato {paperFormat} • Resolução real de impressão
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => { setSelectedSheetIndex(null); setPreviewSheetUrl(null); }}
                                className="p-1.5 text-slate-400 hover:text-white rounded-xl bg-slate-800 cursor-pointer"
                            >
                                <X size={16} />
                            </button>
                        </div>

                        <div className="bg-slate-950 p-2 rounded-2xl flex items-center justify-center border border-slate-800">
                            <img
                                src={previewSheetUrl}
                                alt="Inspeção da Folha"
                                className="max-h-[360px] object-contain rounded-lg shadow-lg border border-slate-700"
                            />
                        </div>

                        <div className="flex items-center justify-between pt-1">
                            <button
                                type="button"
                                onClick={() => {
                                    handleToggleSheetExclusion(selectedSheetIndex);
                                    setSelectedSheetIndex(null);
                                    setPreviewSheetUrl(null);
                                }}
                                className={`px-3 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                                    excludedSheetIndices.has(selectedSheetIndex)
                                        ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                                        : 'bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/40'
                                }`}
                            >
                                {excludedSheetIndices.has(selectedSheetIndex) ? '✓ Reativar Folha' : '✕ Descartar Esta Folha (Vazia)'}
                            </button>

                            <button
                                type="button"
                                onClick={async () => {
                                    if (previewSheetUrl && selectedSheetIndex !== null) {
                                        const sheet = sheetsData[selectedSheetIndex];
                                        const r = sheet ? sheet.row : Math.floor(selectedSheetIndex / cols) + 1;
                                        const c = sheet ? sheet.col : (selectedSheetIndex % cols) + 1;
                                        const safeName = (selectedImageName || 'poster').replace(/[^a-zA-Z0-9_-]/g, '_');
                                        const filename = `${safeName}_Folha-${String(selectedSheetIndex + 1).padStart(2, '0')}_L${r}-C${c}.png`;
                                        await downloadFile(previewSheetUrl, filename);
                                        showToast(`✅ Folha #${selectedSheetIndex + 1} baixada com sucesso!`);
                                    }
                                }}
                                className="px-4 py-2 bg-pink-600 hover:bg-pink-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer active:scale-95 shadow-md shadow-pink-500/20"
                            >
                                <Download size={14} />
                                <span>Baixar Apenas Esta Folha</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* TOAST FLUTUANTE DE SUCESSO / NOTIFICAÇÃO */}
            {toastMessage && (
                <div className="fixed bottom-6 right-6 z-50 bg-slate-900 border border-pink-500 text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 text-xs font-bold animate-in slide-in-from-bottom duration-300">
                    <Sparkles size={16} className="text-pink-400" />
                    <span>{toastMessage}</span>
                </div>
            )}
        </div>
    );
};
