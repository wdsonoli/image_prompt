import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
    Scissors,
    Download,
    FileText,
    Archive,
    Grid,
    Columns,
    Rows,
    Check,
    Layers,
    Info,
    RotateCw,
    Sparkles,
    ZoomIn,
    ZoomOut,
    Eye,
    Printer,
    DollarSign,
    RefreshCw,
    ChevronRight,
    ChevronDown,
    ChevronLeft,
    Circle,
    Square,
    ArrowLeft,
    Sliders,
    Maximize2,
    Calendar,
    PartyPopper,
    HelpCircle,
    SlidersHorizontal,
    Droplet,
    UserCheck,
    Palette,
    Home,
    Camera,
    Upload,
    Tag,
    Share2,
    Search
} from 'lucide-react';
import { UploadedImage } from '../types';
import {
    SplitterConfig,
    SplitMode,
    PanelShape,
    PaperFormat,
    PaperOrientation,
    DivisionMode,
    PANEL_PRESETS,
    PAPER_DIMENSIONS,
    calculatePartyPanelSheets,
    calculateGridSheets,
    renderSheetToCanvas,
    generatePrintablePdf,
    generateSlicesZip,
    generateMontageMapCanvas,
    SplitCalculationResult,
    SheetSlice
} from '../services/panelSplitterService';

interface PanelSplitterStudioProps {
    availableImages: UploadedImage[];
    initialImageUrl?: string | null;
    initialImageName?: string | null;
    onBackToArchitect: () => void;
    onOpenBirthdayStudio?: () => void;
    onOpenUpscale?: (url: string, name: string) => void;
}

type FatiArtStep = 1 | 2 | 3 | 4 | 5 | 6;

const FATIART_STEPS = [
    { num: 1 as FatiArtStep, label: 'Templates', icon: '🎨' },
    { num: 2 as FatiArtStep, label: 'Divisão', icon: '⊞' },
    { num: 3 as FatiArtStep, label: 'Papel', icon: '📄' },
    { num: 4 as FatiArtStep, label: 'Formato', icon: '📐' },
    { num: 5 as FatiArtStep, label: 'Avançado', icon: '⚙️' },
    { num: 6 as FatiArtStep, label: 'Melhoria de...', icon: '✨' },
];

// Presets do SplitImage.im (Screenshot 02:09:41)
const SPLITIMAGE_QUICK_MODELS = [
    { cols: 2, rows: 2, label: '2×2', shape: 'grid' },
    { cols: 3, rows: 3, label: '3×3', shape: 'grid' },
    { cols: 2, rows: 1, label: '1×2', shape: 'h' },
    { cols: 1, rows: 2, label: '2×1', shape: 'v' },
    { cols: 3, rows: 1, label: '1×3', shape: 'h' },
    { cols: 1, rows: 3, label: '3×1', shape: 'v' },
    { cols: 1, rows: 4, label: '4×1', shape: 'v' },
    { cols: 3, rows: 2, label: '2×3', shape: 'grid' },
    { cols: 2, rows: 3, label: '3×2', shape: 'grid' },
    { cols: 4, rows: 3, label: '3×4', shape: 'grid' },
    { cols: 3, rows: 4, label: '4×3', shape: 'grid' },
];

export const PanelSplitterStudio: React.FC<PanelSplitterStudioProps> = ({
    availableImages,
    initialImageUrl,
    initialImageName,
    onBackToArchitect,
    onOpenBirthdayStudio,
    onOpenUpscale
}) => {
    // Imagem ativa selecionada
    const [selectedImageUrl, setSelectedImageUrl] = useState<string>(() => {
        if (initialImageUrl) return initialImageUrl;
        if (availableImages.length > 0) {
            return availableImages[0].previewUrl || (availableImages[0].base64Data ? `data:${availableImages[0].mimeType || 'image/png'};base64,${availableImages[0].base64Data}` : '');
        }
        return '';
    });

    const [loadedImage, setLoadedImage] = useState<HTMLImageElement | null>(null);
    const [imageDimensions, setImageDimensions] = useState<{ width: number; height: number }>({ width: 0, height: 0 });

    // Modo principal
    const [mainMode, setMainMode] = useState<'cortador' | 'splitimage' | 'wall_mockup'>('cortador');

    // Stepper FatiArt (Etapas 1 a 6)
    const [currentStep, setCurrentStep] = useState<FatiArtStep>(1);

    // Configurações principais do fatiador (FatiArt + Encantiva Pro + SplitImage)
    const [config, setConfig] = useState<SplitterConfig>({
        mode: 'party_panel',
        panelName: 'Painel Festa',
        panelShape: 'round',
        panelWidthCm: 150,
        panelHeightCm: 150,
        safetyBleedCm: 2, // Encantiva Pro padrão: +2cm de margem de colagem
        paperFormat: 'A4',
        paperOrientation: 'landscape', // FatiArt padrão: paisagem
        customPaperWidthMm: 210,
        customPaperHeightMm: 297,
        customPaperUnit: 'mm',
        overlapMm: 12,
        printerMarginMm: 5,
        printDpi: 150,
        skipBlankPages: true,
        showCropMarks: true,
        showCornerMarks: true,
        showDashedCutLines: false,
        showOverlapGuideLines: true,
        showPageNumbering: true,
        showShapeContourLine: true,
        paperCostEstimate: 0.50,
        includeMontageGuideInPdf: true,
        watermarkText: '',
        colorBrightness: 0,
        colorContrast: 0,
        colorSaturation: 0,
        gridCols: 3,
        gridRows: 3,
        maintainAspectRatio: true,
        outputFormat: 'png',
        imageQuality: 1.0,
        carouselSlices: 3,
        linearSplitCount: 3,
        isInstagramMode: false,
        wallWidthM: 3.0,
        wallHeightM: 2.5,
        wallTheme: 'living_room',
        divisionMode: 'size',
        defineBy: 'width_pages',
        targetPages: 3,
    });

    // Estados de UI
    const [paperTab, setPaperTab] = useState<'standard' | 'custom'>('standard');
    const [paperSearchQuery, setPaperSearchQuery] = useState('');
    const [selectedSheetIndex, setSelectedSheetIndex] = useState<number | null>(null);
    const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
    const [isGeneratingZip, setIsGeneratingZip] = useState(false);
    const [generationProgress, setGenerationProgress] = useState<{ current: number; total: number } | null>(null);
    const [zoomLevel, setZoomLevel] = useState<number>(1);
    const [previewSheetDataUrl, setPreviewSheetDataUrl] = useState<string | null>(null);
    const [showMontageModal, setShowMontageModal] = useState(false);
    const [montageMapUrl, setMontageMapUrl] = useState<string | null>(null);

    // Accordions da Etapa 5 (Avançado FatiArt)
    const [openAdvancedSection, setOpenAdvancedSection] = useState<string | null>('cortes_marcas');

    const fileInputRef = useRef<HTMLInputElement>(null);
    const wallPhotoInputRef = useRef<HTMLInputElement>(null);
    const [userWallPhotoUrl, setUserWallPhotoUrl] = useState<string | null>(null);

    // Carrega a imagem nativa HTML para processamento em Canvas
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
            console.error('Erro ao carregar imagem para fatiamento');
            setLoadedImage(null);
        };
        img.src = selectedImageUrl;
    }, [selectedImageUrl]);

    // Cálculo das fatias em tempo real
    const calcResult: SplitCalculationResult = useMemo(() => {
        const w = imageDimensions.width || 2000;
        const h = imageDimensions.height || 2000;
        if (mainMode === 'splitimage' || config.mode === 'grid') {
            return calculateGridSheets(config, w, h);
        } else {
            return calculatePartyPanelSheets(config, w, h);
        }
    }, [config, mainMode, imageDimensions]);

    // Renderiza a folha selecionada em alta resolução quando o usuário clica nela
    useEffect(() => {
        if (!loadedImage || selectedSheetIndex === null) {
            setPreviewSheetDataUrl(null);
            return;
        }

        const sheet = calcResult.sheets.find(s => s.index === selectedSheetIndex);
        if (!sheet) return;

        let isCancelled = false;
        renderSheetToCanvas(loadedImage, sheet, config, calcResult).then(canvas => {
            if (!isCancelled) {
                setPreviewSheetDataUrl(canvas.toDataURL('image/png'));
            }
        });

        return () => {
            isCancelled = true;
        };
    }, [loadedImage, selectedSheetIndex, config, calcResult]);

    // Aplica predefinições de painel rápido
    const handleApplyPreset = (preset: typeof PANEL_PRESETS[0]) => {
        setConfig(prev => ({
            ...prev,
            panelShape: preset.shape,
            panelWidthCm: preset.defaultWidthCm,
            panelHeightCm: preset.defaultHeightCm,
        }));
    };

    // Upload de nova imagem
    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = () => {
            if (reader.result) {
                setSelectedImageUrl(reader.result as string);
                setSelectedSheetIndex(null);
            }
        };
        reader.readAsDataURL(file);
    };

    // Upload de foto da parede do usuário
    const handleWallPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = () => {
            if (reader.result) {
                setUserWallPhotoUrl(reader.result as string);
            }
        };
        reader.readAsDataURL(file);
    };

    // Exportação em PDF
    const handleDownloadPdf = async () => {
        if (!loadedImage) return;
        setIsGeneratingPdf(true);
        setGenerationProgress({ current: 0, total: calcResult.printableSheets });

        try {
            const blob = await generatePrintablePdf(loadedImage, config, calcResult, (current, total) => {
                setGenerationProgress({ current, total });
            });

            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            const safeName = (config.panelName || 'Painel').replace(/[^a-zA-Z0-9_-]/g, '_');
            a.download = `${safeName}_${config.panelWidthCm}x${config.panelHeightCm}cm_${calcResult.printableSheets}Folhas_${config.paperFormat}.pdf`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Erro ao gerar PDF do painel:', error);
            alert('Falha ao gerar o PDF. Verifique se a imagem foi carregada corretamente.');
        } finally {
            setIsGeneratingPdf(false);
            setGenerationProgress(null);
        }
    };

    // Exportação em ZIP
    const handleDownloadZip = async () => {
        if (!loadedImage) return;
        setIsGeneratingZip(true);
        setGenerationProgress({ current: 0, total: calcResult.printableSheets });

        try {
            const blob = await generateSlicesZip(loadedImage, config, calcResult, (current, total) => {
                setGenerationProgress({ current, total });
            });

            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            const safeName = (config.panelName || 'Fatias').replace(/[^a-zA-Z0-9_-]/g, '_');
            a.download = `${safeName}_${calcResult.printableSheets}_Folhas_${config.paperFormat}.zip`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Erro ao gerar ZIP das fatias:', error);
            alert('Falha ao compactar os arquivos em ZIP.');
        } finally {
            setIsGeneratingZip(false);
            setGenerationProgress(null);
        }
    };

    // Baixar folha individual
    const handleDownloadCurrentSheet = () => {
        if (!previewSheetDataUrl || selectedSheetIndex === null) return;
        const a = document.createElement('a');
        a.href = previewSheetDataUrl;
        a.download = `Folha_${selectedSheetIndex.toString().padStart(2, '0')}_${config.panelName || 'Painel'}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    // Abrir Mapa de Montagem
    const handleOpenMontageMap = async () => {
        if (!loadedImage) return;
        const canvas = await generateMontageMapCanvas(loadedImage, config, calcResult);
        setMontageMapUrl(canvas.toDataURL('image/png'));
        setShowMontageModal(true);
    };

    // Lista de papéis filtrados
    const filteredPapers = useMemo(() => {
        const query = paperSearchQuery.toLowerCase().trim();
        return Object.entries(PAPER_DIMENSIONS).filter(([key, val]) => {
            if (key === 'custom') return false;
            return key.toLowerCase().includes(query) || val.name.toLowerCase().includes(query);
        });
    }, [paperSearchQuery]);

    // Próxima etapa
    const handleNextStep = () => {
        if (currentStep < 6) {
            setCurrentStep((prev) => (prev + 1) as FatiArtStep);
        }
    };

    // Etapa anterior
    const handlePrevStep = () => {
        if (currentStep > 1) {
            setCurrentStep((prev) => (prev - 1) as FatiArtStep);
        }
    };

    return (
        <div className="space-y-6">
            {/* CABEÇALHO DO CORTADOR DE PAINÉIS (Estilo Encantiva Pro / FatiArt) */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-4 sm:p-6 backdrop-blur-md shadow-2xl space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={onBackToArchitect}
                            className="p-2.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition cursor-pointer"
                            title="Voltar ao Arquiteto"
                        >
                            <ArrowLeft size={18} />
                        </button>
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-pink-500 via-rose-500 to-amber-500 flex items-center justify-center text-white shadow-xl shadow-pink-500/25">
                            <Scissors size={24} />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                                    Cortador de Painéis
                                </h1>
                                <span className="px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider rounded-full bg-pink-500/20 text-pink-300 border border-pink-500/30">
                                    FatiArt & Encantiva Pro
                                </span>
                            </div>
                            <p className="text-xs text-slate-400 mt-0.5">
                                Transforme sua imagem em {calcResult.printableSheets} folhas {config.paperFormat} prontas para imprimir — corte com sangria e abas de cola
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {onOpenBirthdayStudio && (
                            <button
                                type="button"
                                onClick={onOpenBirthdayStudio}
                                className="px-3 py-2 rounded-xl bg-pink-500/10 hover:bg-pink-500/20 text-pink-300 border border-pink-500/30 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                            >
                                <PartyPopper size={14} />
                                <span>Criador de Painel</span>
                            </button>
                        )}
                        {onOpenUpscale && selectedImageUrl && (
                            <button
                                type="button"
                                onClick={() => onOpenUpscale(selectedImageUrl, config.panelName || 'painel')}
                                className="px-3 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                                title="Melhorar qualidade para impressão com Super Resolução 4x"
                            >
                                <Sparkles size={14} />
                                <span>Upscaling 4x IA</span>
                            </button>
                        )}
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                        >
                            <RotateCw size={14} />
                            <span>Trocar Foto</span>
                        </button>
                        <input
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            accept="image/*"
                            onChange={handleFileUpload}
                        />
                    </div>
                </div>

                {/* MODOS DE NAVEGAÇÃO PRINCIPAIS (CORTADOR / GRADE / SIMULADOR NA PAREDE) */}
                <div className="grid grid-cols-3 gap-2 bg-slate-950/80 p-1.5 rounded-2xl border border-slate-800/80 max-w-xl">
                    <button
                        type="button"
                        onClick={() => { setMainMode('cortador'); setConfig(p => ({ ...p, mode: 'party_panel' })); }}
                        className={`py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer ${
                            mainMode === 'cortador'
                                ? 'bg-gradient-to-r from-pink-500 to-rose-600 text-white shadow-lg shadow-pink-500/25'
                                : 'text-slate-400 hover:text-slate-200'
                        }`}
                    >
                        <Scissors size={14} />
                        <span>Cortador de Festa</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => { setMainMode('splitimage'); setConfig(p => ({ ...p, mode: 'grid' })); }}
                        className={`py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer ${
                            mainMode === 'splitimage'
                                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/25'
                                : 'text-slate-400 hover:text-slate-200'
                        }`}
                    >
                        <Grid size={14} />
                        <span>SplitImage (Grade)</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => setMainMode('wall_mockup')}
                        className={`py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer ${
                            mainMode === 'wall_mockup'
                                ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-lg shadow-amber-500/25'
                                : 'text-slate-400 hover:text-slate-200'
                        }`}
                    >
                        <Home size={14} />
                        <span>Na Parede (3D)</span>
                    </button>
                </div>

                {/* BARRA DE ETAPAS (STEPPER HORIZONTAL FATIART - SCREENSHOT 02:09:11) */}
                {mainMode === 'cortador' && (
                    <div className="pt-2 border-t border-slate-800/80 overflow-x-auto pb-1">
                        <div className="flex items-center min-w-[580px] justify-between">
                            {FATIART_STEPS.map((step, idx) => {
                                const isCurrent = currentStep === step.num;
                                const isCompleted = currentStep > step.num;

                                return (
                                    <React.Fragment key={step.num}>
                                        <button
                                            type="button"
                                            onClick={() => setCurrentStep(step.num)}
                                            className="flex items-center gap-2 group cursor-pointer"
                                        >
                                            <div
                                                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black transition-all ${
                                                    isCurrent
                                                        ? 'bg-blue-600 text-white ring-4 ring-blue-500/30'
                                                        : isCompleted
                                                        ? 'bg-emerald-500 text-white'
                                                        : 'bg-slate-800 text-slate-400 group-hover:bg-slate-700'
                                                }`}
                                            >
                                                {isCompleted ? <Check size={14} /> : step.num}
                                            </div>
                                            <span
                                                className={`text-xs font-bold ${
                                                    isCurrent
                                                        ? 'text-white'
                                                        : isCompleted
                                                        ? 'text-emerald-400'
                                                        : 'text-slate-500 group-hover:text-slate-300'
                                                }`}
                                            >
                                                {step.label}
                                            </span>
                                        </button>

                                        {idx < FATIART_STEPS.length - 1 && (
                                            <div
                                                className={`h-0.5 flex-1 mx-3 rounded ${
                                                    currentStep > idx + 1 ? 'bg-emerald-500/80' : 'bg-slate-800'
                                                }`}
                                            />
                                        )}
                                    </React.Fragment>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>

            {/* CONTEÚDO PRINCIPAL: CONTROLES À ESQUERDA (5 COLS) E PRÉ-VISUALIZAÇÃO À DIREITA (7 COLS) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* COLUNA ESQUERDA: CONTROLES DA ETAPA ATUAL */}
                <div className="lg:col-span-5 space-y-5">
                    {/* SE MODO FOR SPLITIMAGE.IM (SCREENSHOT 02:09:41) */}
                    {mainMode === 'splitimage' && (
                        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 space-y-5 backdrop-blur-md">
                            <div>
                                <h3 className="text-base font-black text-white">Configurações SplitImage</h3>
                                <p className="text-xs text-slate-400 mt-0.5">
                                    Modelos rápidos de divisão para mosaico de Instagram e carrossel
                                </p>
                            </div>

                            {/* Modelos Rápidos de Grade (2x2, 3x3, 1x2, etc.) */}
                            <div className="space-y-2">
                                <span className="text-xs font-bold text-slate-300">Modelos rápidos:</span>
                                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                                    {SPLITIMAGE_QUICK_MODELS.map(model => {
                                        const isSelected = config.gridCols === model.cols && config.gridRows === model.rows;
                                        return (
                                            <button
                                                key={model.label}
                                                type="button"
                                                onClick={() => setConfig(p => ({ ...p, gridCols: model.cols, gridRows: model.rows }))}
                                                className={`p-3 rounded-2xl border text-center transition flex flex-col items-center justify-center gap-1.5 cursor-pointer ${
                                                    isSelected
                                                        ? 'bg-blue-600 border-blue-400 text-white shadow-lg shadow-blue-600/30 font-black ring-2 ring-blue-400/40'
                                                        : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                                                }`}
                                            >
                                                {/* Mini ícone do grid correspondente */}
                                                <div
                                                    className="grid gap-0.5 w-6 h-6 p-0.5 rounded bg-black/40"
                                                    style={{
                                                        gridTemplateColumns: `repeat(${model.cols}, 1fr)`,
                                                        gridTemplateRows: `repeat(${model.rows}, 1fr)`,
                                                    }}
                                                >
                                                    {Array.from({ length: Math.min(12, model.cols * model.rows) }).map((_, i) => (
                                                        <div key={i} className={`rounded-[1px] ${isSelected ? 'bg-white' : 'bg-blue-400'}`} />
                                                    ))}
                                                </div>
                                                <span className="text-xs font-mono font-bold">{model.label}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Ajuste manual de Linhas e Colunas */}
                            <div className="pt-2 border-t border-slate-800 space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-bold text-slate-300">Corte personalizado:</span>
                                    <span className="text-xs font-mono text-cyan-400 font-bold">
                                        {config.gridCols} cols × {config.gridRows} linhas
                                    </span>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-[11px] text-slate-400 block mb-1">Colunas:</label>
                                        <input
                                            type="number"
                                            min={1}
                                            max={12}
                                            value={config.gridCols}
                                            onChange={(e) => setConfig(p => ({ ...p, gridCols: Math.max(1, Number(e.target.value) || 1) }))}
                                            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono font-bold focus:border-cyan-500 outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[11px] text-slate-400 block mb-1">Linhas:</label>
                                        <input
                                            type="number"
                                            min={1}
                                            max={12}
                                            value={config.gridRows}
                                            onChange={(e) => setConfig(p => ({ ...p, gridRows: Math.max(1, Number(e.target.value) || 1) }))}
                                            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono font-bold focus:border-cyan-500 outline-none"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Formato de saída & Qualidade */}
                            <div className="space-y-3 pt-2 border-t border-slate-800">
                                <div>
                                    <label className="text-[11px] text-slate-400 block mb-1">Formato de saída:</label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {(['png', 'jpg', 'webp'] as const).map(fmt => (
                                            <button
                                                key={fmt}
                                                type="button"
                                                onClick={() => setConfig(p => ({ ...p, outputFormat: fmt }))}
                                                className={`py-2 rounded-xl text-xs font-bold uppercase transition cursor-pointer border ${
                                                    config.outputFormat === fmt
                                                        ? 'bg-blue-600 border-blue-400 text-white shadow-md'
                                                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                                                }`}
                                            >
                                                {fmt}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <div className="flex justify-between text-xs text-slate-300">
                                        <span>Qualidade:</span>
                                        <span className="font-mono text-cyan-400 font-bold">{Math.round(config.imageQuality * 100)}%</span>
                                    </div>
                                    <input
                                        type="range"
                                        min="0.5"
                                        max="1.0"
                                        step="0.05"
                                        value={config.imageQuality}
                                        onChange={(e) => setConfig(p => ({ ...p, imageQuality: Number(e.target.value) }))}
                                        className="w-full accent-blue-500 cursor-pointer"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* SE MODO FOR VISUALIZAR NA PAREDE (FATIART MOCKUP - SCREENSHOT 02:07:55) */}
                    {mainMode === 'wall_mockup' && (
                        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 space-y-4 backdrop-blur-md">
                            <div className="flex items-center justify-between">
                                <h3 className="text-base font-black text-white flex items-center gap-2">
                                    <Home size={16} className="text-amber-400" />
                                    Visualizar na Parede
                                </h3>
                                <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                                    <input
                                        type="checkbox"
                                        checked={config.isInstagramMode}
                                        onChange={(e) => setConfig(p => ({ ...p, isInstagramMode: e.target.checked }))}
                                        className="accent-pink-500 w-4 h-4 rounded cursor-pointer"
                                    />
                                    <span>Modo Instagram</span>
                                </label>
                            </div>
                            <p className="text-xs text-slate-400">
                                Veja como seu painel ou pôster ficará pendurado no ambiente em escala real.
                            </p>

                            {/* Botões Tirar Foto / Carregar Foto */}
                            <div className="grid grid-cols-2 gap-2">
                                <button
                                    type="button"
                                    onClick={() => wallPhotoInputRef.current?.click()}
                                    className="py-2.5 px-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-200 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                                >
                                    <Upload size={14} className="text-blue-400" />
                                    <span>Carregar Foto Parede</span>
                                </button>
                                <input
                                    type="file"
                                    ref={wallPhotoInputRef}
                                    className="hidden"
                                    accept="image/*"
                                    onChange={handleWallPhotoUpload}
                                />
                                <button
                                    type="button"
                                    onClick={() => setUserWallPhotoUrl(null)}
                                    className="py-2.5 px-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                                >
                                    <RotateCw size={14} />
                                    <span>Usar Parede Padrão</span>
                                </button>
                            </div>

                            {/* Ambientes pré-configurados */}
                            <div className="space-y-1.5">
                                <label className="text-[11px] text-slate-400 block">Ambientes de Cenografia:</label>
                                <div className="grid grid-cols-2 gap-2">
                                    {[
                                        { id: 'living_room', label: '🛋️ Sala de Estar' },
                                        { id: 'kids_bedroom', label: '🧸 Quarto Infantil' },
                                        { id: 'party_brick', label: '🧱 Festa Tijolinho' },
                                        { id: 'studio_minimal', label: '🏛️ Estúdio Limpo' },
                                    ].map(env => (
                                        <button
                                            key={env.id}
                                            type="button"
                                            onClick={() => setConfig(p => ({ ...p, wallTheme: env.id as any }))}
                                            className={`p-2 rounded-xl border text-xs font-bold text-left transition cursor-pointer ${
                                                config.wallTheme === env.id
                                                    ? 'bg-amber-500/20 border-amber-400 text-amber-200'
                                                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                                            }`}
                                        >
                                            {env.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Dimensões da Parede em Metros */}
                            <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 space-y-3">
                                <span className="text-xs font-bold text-slate-300">Dimensões da Parede (Metros):</span>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-[11px] text-slate-400 block mb-1">Largura (m):</label>
                                        <input
                                            type="number"
                                            step="0.1"
                                            min="1"
                                            max="10"
                                            value={config.wallWidthM}
                                            onChange={(e) => setConfig(p => ({ ...p, wallWidthM: Number(e.target.value) || 3.0 }))}
                                            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white font-mono font-bold"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[11px] text-slate-400 block mb-1">Altura (m):</label>
                                        <input
                                            type="number"
                                            step="0.1"
                                            min="1"
                                            max="8"
                                            value={config.wallHeightM}
                                            onChange={(e) => setConfig(p => ({ ...p, wallHeightM: Number(e.target.value) || 2.5 }))}
                                            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white font-mono font-bold"
                                        />
                                    </div>
                                </div>

                                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-[11px] text-slate-300 space-y-1">
                                    <div className="font-bold text-amber-400">
                                        Tamanho do pôster: {config.panelWidthCm}cm × {config.panelHeightCm}cm
                                    </div>
                                    <div className="text-slate-400 font-mono text-[10px]">
                                        Ocupa {Math.round((config.panelWidthCm / (config.wallWidthM * 100)) * 100)}% da largura e {Math.round((config.panelHeightCm / (config.wallHeightM * 100)) * 100)}% da altura da parede
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* SE MODO FOR CORTADOR DE PAINÉIS (FATIART & ENCANTIVA PRO) */}
                    {mainMode === 'cortador' && (
                        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 space-y-5 backdrop-blur-md">
                            {/* ETAPA 1: TEMPLATES & TAMANHO (ENCANTIVA PRO + FATIART) */}
                            {currentStep === 1 && (
                                <div className="space-y-4 animate-in fade-in">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                                            <span>🎨</span>
                                            Tamanho do Painel (Encantiva Pro & Festa)
                                        </h3>
                                    </div>

                                    {/* Presets Rápidos Encantiva Pro (Screenshot 02:10:36) */}
                                    <div className="space-y-2">
                                        <span className="text-[11px] font-bold text-pink-400 uppercase tracking-wider block">
                                            Mini Painéis Rápidos (Mesa & Topo):
                                        </span>
                                        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                                            {PANEL_PRESETS.filter(p => p.category === 'encantiva_mini').map(p => {
                                                const isSelected = config.panelWidthCm === p.defaultWidthCm && config.panelHeightCm === p.defaultHeightCm && config.panelShape === 'round';
                                                return (
                                                    <button
                                                        key={p.id}
                                                        type="button"
                                                        onClick={() => handleApplyPreset(p)}
                                                        className={`p-2 rounded-2xl border text-center transition flex flex-col items-center justify-center cursor-pointer ${
                                                            isSelected
                                                                ? 'bg-pink-600/20 border-pink-500 text-pink-200 ring-2 ring-pink-500 shadow-lg'
                                                                : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                                                        }`}
                                                    >
                                                        <span className="text-xs font-black font-mono">{p.defaultWidthCm}cm</span>
                                                        <span className="text-[9px] text-slate-400 font-bold mt-0.5">{p.sheetsEstimate}</span>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* Painéis Maiores de Cenografia de Festa */}
                                    <div className="space-y-2 pt-2 border-t border-slate-800">
                                        <span className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider block">
                                            Painéis Grandes & Estruturas de Festa:
                                        </span>
                                        <div className="grid grid-cols-2 gap-2 max-h-44 overflow-y-auto pr-1">
                                            {PANEL_PRESETS.filter(p => p.category !== 'encantiva_mini').map(p => {
                                                const isSelected = config.panelWidthCm === p.defaultWidthCm && config.panelHeightCm === p.defaultHeightCm && config.panelShape === p.shape;
                                                return (
                                                    <button
                                                        key={p.id}
                                                        type="button"
                                                        onClick={() => handleApplyPreset(p)}
                                                        className={`p-2.5 rounded-xl border text-left transition cursor-pointer ${
                                                            isSelected
                                                                ? 'bg-blue-600/20 border-blue-400 text-white shadow-md ring-1 ring-blue-400'
                                                                : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                                                        }`}
                                                    >
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-xs font-bold truncate">{p.name.split(' (')[0]}</span>
                                                            {isSelected && <Check size={12} className="text-blue-400 shrink-0" />}
                                                        </div>
                                                        <div className="text-[10px] text-cyan-400 font-mono mt-0.5">
                                                            {p.defaultWidthCm}×{p.defaultHeightCm} cm · {p.sheetsEstimate}
                                                        </div>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* Margem de Segurança de Colagem Encantiva Pro (+0cm, +1cm, +2cm, +3cm) */}
                                    <div className="pt-2 border-t border-slate-800 space-y-2">
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-bold text-slate-300">Margem de segurança para colagem:</span>
                                        </div>
                                        <div className="grid grid-cols-4 gap-2">
                                            {[0, 1, 2, 3].map(extra => {
                                                const isSel = (config.safetyBleedCm || 0) === extra;
                                                const finalW = config.panelWidthCm + extra;
                                                return (
                                                    <button
                                                        key={extra}
                                                        type="button"
                                                        onClick={() => setConfig(p => ({ ...p, safetyBleedCm: extra }))}
                                                        className={`py-2 px-1 rounded-xl border text-center transition cursor-pointer ${
                                                            isSel
                                                                ? 'bg-pink-600 border-pink-400 text-white font-black shadow-md'
                                                                : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                                                        }`}
                                                    >
                                                        <div className="text-xs font-mono font-bold">{finalW}cm</div>
                                                        <div className="text-[9px] text-pink-300/80 mt-0.5">{extra === 0 ? 'exato' : `+${extra}cm`}</div>
                                                    </button>
                                                );
                                            })}
                                        </div>

                                        {/* Banner Informativo Rosa Encantiva Pro (Screenshot 02:10:36) */}
                                        <div className="p-3 rounded-2xl bg-pink-950/40 border border-pink-500/40 text-pink-200 text-xs flex items-center gap-2">
                                            <Tag size={16} className="text-pink-400 shrink-0" />
                                            <span>
                                                Painel finalizado: <strong>{config.panelWidthCm + (config.safetyBleedCm || 0)}×{config.panelHeightCm + (config.safetyBleedCm || 0)}cm</strong> — {config.safetyBleedCm || 0}cm de margem de segurança para facilitar a colagem
                                            </span>
                                        </div>
                                    </div>

                                    {/* Campo NOME DO PAINEL * (Encantiva Pro) */}
                                    <div className="space-y-1">
                                        <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block">
                                            NOME DO PAINEL *
                                        </label>
                                        <input
                                            type="text"
                                            value={config.panelName}
                                            onChange={(e) => setConfig(p => ({ ...p, panelName: e.target.value }))}
                                            placeholder="Ex: Painel Unicórnio"
                                            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white font-medium focus:border-pink-500 outline-none placeholder:text-slate-600"
                                        />
                                    </div>
                                </div>
                            )}

                            {/* ETAPA 2: DIVISÃO (FATIART - SCREENSHOT 02:07:32) */}
                            {currentStep === 2 && (
                                <div className="space-y-4 animate-in fade-in">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                                            <span>⊞</span>
                                            Modo de Divisão (FatiArt)
                                        </h3>
                                    </div>

                                    {/* Cards de Modo de Divisão: Folhas, Tamanho, Livre */}
                                    <div className="space-y-2">
                                        {[
                                            { id: 'sheets', title: 'Folhas', desc: 'Defina quantas páginas de largura ou altura', icon: '📄' },
                                            { id: 'size', title: 'Tamanho', desc: 'Defina o tamanho real em cm ou metros', icon: '📏' },
                                            { id: 'free', title: 'Livre', desc: 'Controle linhas e colunas diretamente', icon: '⊞' },
                                        ].map(mode => {
                                            const isSelected = config.divisionMode === mode.id;
                                            return (
                                                <button
                                                    key={mode.id}
                                                    type="button"
                                                    onClick={() => setConfig(p => ({ ...p, divisionMode: mode.id as DivisionMode }))}
                                                    className={`w-full p-3 rounded-2xl border text-left transition flex items-center gap-3 cursor-pointer ${
                                                        isSelected
                                                            ? 'bg-blue-600/20 border-blue-400 text-white ring-1 ring-blue-400 shadow-md'
                                                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                                                    }`}
                                                >
                                                    <span className="text-xl">{mode.icon}</span>
                                                    <div className="flex-1">
                                                        <div className="text-xs font-bold text-white">{mode.title}</div>
                                                        <div className="text-[11px] text-slate-400">{mode.desc}</div>
                                                    </div>
                                                    {isSelected && <Check size={16} className="text-blue-400" />}
                                                </button>
                                            );
                                        })}
                                    </div>

                                    {/* Se Modo for 'Folhas': Definir por Páginas de Largura ou Altura */}
                                    {config.divisionMode === 'sheets' && (
                                        <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
                                            <div className="text-xs font-bold text-slate-300">Definir por:</div>
                                            <div className="flex gap-4 text-xs text-slate-300">
                                                <label className="flex items-center gap-1.5 cursor-pointer">
                                                    <input
                                                        type="radio"
                                                        name="defineBy"
                                                        checked={config.defineBy === 'width_pages'}
                                                        onChange={() => setConfig(p => ({ ...p, defineBy: 'width_pages' }))}
                                                        className="accent-blue-500"
                                                    />
                                                    <span>Páginas de largura</span>
                                                </label>
                                                <label className="flex items-center gap-1.5 cursor-pointer">
                                                    <input
                                                        type="radio"
                                                        name="defineBy"
                                                        checked={config.defineBy === 'height_pages'}
                                                        onChange={() => setConfig(p => ({ ...p, defineBy: 'height_pages' }))}
                                                        className="accent-blue-500"
                                                    />
                                                    <span>Páginas de altura</span>
                                                </label>
                                            </div>

                                            <div className="flex items-center gap-3">
                                                <label className="text-xs text-slate-400">Quantidade:</label>
                                                <input
                                                    type="number"
                                                    min="1"
                                                    max="20"
                                                    value={config.targetPages}
                                                    onChange={(e) => setConfig(p => ({ ...p, targetPages: Math.max(1, Number(e.target.value) || 1) }))}
                                                    className="w-24 bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white font-mono font-bold"
                                                />
                                                <span className="text-xs text-slate-400">folhas</span>
                                            </div>
                                        </div>
                                    )}

                                    {/* Toggle de Páginas em Branco Detectadas (Screenshot 02:07:32) */}
                                    <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-3">
                                        <div className="flex items-center gap-2">
                                            <div className="w-7 h-7 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center text-xs font-bold">
                                                🖨️
                                            </div>
                                            <div>
                                                <div className="text-xs font-bold text-white">
                                                    {calcResult.blankSheetsCount} páginas em branco detectadas
                                                </div>
                                                <div className="text-[10px] text-slate-400">
                                                    Folhas 100% fora do contorno do círculo
                                                </div>
                                            </div>
                                        </div>

                                        <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                                            <span className="text-[11px] text-slate-400">Pular vazias</span>
                                            <input
                                                type="checkbox"
                                                checked={config.skipBlankPages}
                                                onChange={(e) => setConfig(p => ({ ...p, skipBlankPages: e.target.checked }))}
                                                className="accent-blue-500 w-4 h-4 rounded cursor-pointer"
                                            />
                                        </label>
                                    </div>
                                </div>
                            )}

                            {/* ETAPA 3: PAPEL (FATIART - SCREENSHOT 02:08:38 & 02:08:50) */}
                            {currentStep === 3 && (
                                <div className="space-y-4 animate-in fade-in">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                                            <span>📄</span>
                                            Tamanho do Papel & Impressora
                                        </h3>
                                    </div>

                                    {/* Toggle Tamanhos Padrão vs Personalizado */}
                                    <div className="grid grid-cols-2 gap-1 bg-slate-950 p-1 rounded-2xl border border-slate-800">
                                        <button
                                            type="button"
                                            onClick={() => setPaperTab('standard')}
                                            className={`py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                                                paperTab === 'standard'
                                                    ? 'bg-blue-600 text-white shadow-md'
                                                    : 'text-slate-400 hover:text-white'
                                            }`}
                                        >
                                            Tamanhos padrão
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setPaperTab('custom')}
                                            className={`py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center justify-center gap-1.5 ${
                                                paperTab === 'custom'
                                                    ? 'bg-blue-600 text-white shadow-md'
                                                    : 'text-slate-400 hover:text-white'
                                            }`}
                                        >
                                            <span>Personalizado</span>
                                            <span className="px-1 text-[9px] font-black rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                                                novo
                                            </span>
                                        </button>
                                    </div>

                                    {paperTab === 'standard' ? (
                                        <div className="space-y-3">
                                            {/* Busca de Tamanho */}
                                            <div className="relative">
                                                <Search size={14} className="absolute left-3 top-2.5 text-slate-500" />
                                                <input
                                                    type="text"
                                                    value={paperSearchQuery}
                                                    onChange={(e) => setPaperSearchQuery(e.target.value)}
                                                    placeholder="Buscar tamanho (ex: A4, Carta...)"
                                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-3 py-2 text-xs text-white focus:border-blue-500 outline-none"
                                                />
                                            </div>

                                            {/* Chips de Papel (A5, A4, A3, A2, Carta, Legal) */}
                                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                                {filteredPapers.map(([key, val]) => {
                                                    const isSelected = config.paperFormat === key;
                                                    return (
                                                        <button
                                                            key={key}
                                                            type="button"
                                                            onClick={() => setConfig(p => ({ ...p, paperFormat: key as PaperFormat }))}
                                                            className={`p-2.5 rounded-2xl border text-center transition cursor-pointer ${
                                                                isSelected
                                                                    ? 'bg-blue-600/20 border-blue-400 text-white font-bold ring-1 ring-blue-400 shadow-md'
                                                                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                                                            }`}
                                                        >
                                                            <div className="text-xs font-bold">{key}</div>
                                                            <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                                                                {val.width}×{val.height} mm
                                                            </div>
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    ) : (
                                        /* Papel Personalizado (Screenshot 02:08:50) */
                                        <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
                                            <div className="grid grid-cols-3 gap-2">
                                                <div>
                                                    <label className="text-[10px] text-slate-400 block mb-1">Largura:</label>
                                                    <input
                                                        type="number"
                                                        value={config.customPaperWidthMm}
                                                        onChange={(e) => setConfig(p => ({ ...p, customPaperWidthMm: Number(e.target.value) || 210 }))}
                                                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-white font-mono font-bold"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-[10px] text-slate-400 block mb-1">Altura:</label>
                                                    <input
                                                        type="number"
                                                        value={config.customPaperHeightMm}
                                                        onChange={(e) => setConfig(p => ({ ...p, customPaperHeightMm: Number(e.target.value) || 297 }))}
                                                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-white font-mono font-bold"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-[10px] text-slate-400 block mb-1">Unidade:</label>
                                                    <div className="flex rounded-lg overflow-hidden border border-slate-700">
                                                        {(['mm', 'cm', 'pol'] as const).map(u => (
                                                            <button
                                                                key={u}
                                                                type="button"
                                                                onClick={() => setConfig(p => ({ ...p, customPaperUnit: u }))}
                                                                className={`flex-1 py-1 text-[10px] font-bold ${
                                                                    config.customPaperUnit === u ? 'bg-blue-600 text-white' : 'bg-slate-900 text-slate-400'
                                                                }`}
                                                            >
                                                                {u}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>

                                            <button
                                                type="button"
                                                onClick={() => setConfig(p => ({ ...p, paperFormat: 'custom' }))}
                                                className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-md transition cursor-pointer"
                                            >
                                                Aplicar tamanho personalizado
                                            </button>
                                        </div>
                                    )}

                                    {/* Margem Não-Imprimível da Impressora */}
                                    <div className="space-y-1 pt-2 border-t border-slate-800">
                                        <div className="flex justify-between text-xs text-slate-300">
                                            <span>Margem da Impressora (mm):</span>
                                            <span className="font-mono text-cyan-400 font-bold">{config.printerMarginMm} mm</span>
                                        </div>
                                        <input
                                            type="number"
                                            min="0"
                                            max="20"
                                            value={config.printerMarginMm}
                                            onChange={(e) => setConfig(p => ({ ...p, printerMarginMm: Number(e.target.value) || 0 }))}
                                            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white font-mono font-bold"
                                        />
                                    </div>

                                    {/* Orientação das Folhas com Status Encantiva Pro */}
                                    <div className="space-y-2 pt-2 border-t border-slate-800">
                                        <div className="flex items-center justify-between text-xs">
                                            <span className="text-slate-300 font-bold">Orientação das folhas:</span>
                                            <span className="text-pink-400 font-mono text-[11px] font-bold">
                                                {calcResult.totalCols} col × {calcResult.totalRows} lin — {config.paperOrientation === 'landscape' ? 'folha deitada' : 'folha em pé'} · {calcResult.printableSheets} folhas
                                            </span>
                                        </div>

                                        <div className="grid grid-cols-2 gap-2">
                                            <button
                                                type="button"
                                                onClick={() => setConfig(p => ({ ...p, paperOrientation: 'landscape' }))}
                                                className={`py-3 px-3 rounded-2xl border text-center transition flex items-center justify-center gap-2 cursor-pointer ${
                                                    config.paperOrientation === 'landscape'
                                                        ? 'bg-pink-600/20 border-pink-400 text-pink-200 font-bold ring-1 ring-pink-400'
                                                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                                                }`}
                                            >
                                                <Columns size={16} />
                                                <span>Paisagem (Deitada)</span>
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setConfig(p => ({ ...p, paperOrientation: 'portrait' }))}
                                                className={`py-3 px-3 rounded-2xl border text-center transition flex items-center justify-center gap-2 cursor-pointer ${
                                                    config.paperOrientation === 'portrait'
                                                        ? 'bg-pink-600/20 border-pink-400 text-pink-200 font-bold ring-1 ring-pink-400'
                                                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                                                }`}
                                            >
                                                <Rows size={16} />
                                                <span>Retrato (Em pé)</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* ETAPA 4: FORMATO DO PAINEL */}
                            {currentStep === 4 && (
                                <div className="space-y-4 animate-in fade-in">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                                            <span>📐</span>
                                            Formato & Sangria do Painel
                                        </h3>
                                    </div>

                                    {/* Escolha do Formato: Redondo, Romano, Retangular */}
                                    <div className="grid grid-cols-3 gap-2">
                                        <button
                                            type="button"
                                            onClick={() => setConfig(p => ({ ...p, panelShape: 'round' }))}
                                            className={`py-3 px-2 rounded-2xl border text-xs font-bold flex flex-col items-center justify-center gap-1.5 transition cursor-pointer ${
                                                config.panelShape === 'round'
                                                    ? 'bg-pink-600/20 border-pink-400 text-pink-200 font-black ring-1 ring-pink-400'
                                                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                                            }`}
                                        >
                                            <Circle size={20} />
                                            <span>Painel Redondo</span>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setConfig(p => ({ ...p, panelShape: 'roman_arch' }))}
                                            className={`py-3 px-2 rounded-2xl border text-xs font-bold flex flex-col items-center justify-center gap-1.5 transition cursor-pointer ${
                                                config.panelShape === 'roman_arch'
                                                    ? 'bg-pink-600/20 border-pink-400 text-pink-200 font-black ring-1 ring-pink-400'
                                                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                                            }`}
                                        >
                                            <span className="text-xl">🏛️</span>
                                            <span>Arco Romano</span>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setConfig(p => ({ ...p, panelShape: 'rectangular' }))}
                                            className={`py-3 px-2 rounded-2xl border text-xs font-bold flex flex-col items-center justify-center gap-1.5 transition cursor-pointer ${
                                                config.panelShape === 'rectangular'
                                                    ? 'bg-pink-600/20 border-pink-400 text-pink-200 font-black ring-1 ring-pink-400'
                                                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                                            }`}
                                        >
                                            <Square size={20} />
                                            <span>Retangular / Banner</span>
                                        </button>
                                    </div>

                                    {/* Aba de Sobreposição para Colagem */}
                                    <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
                                        <div className="flex justify-between text-xs text-slate-300">
                                            <span>Aba de Sobreposição (Cola):</span>
                                            <span className="font-mono text-cyan-400 font-bold">{config.overlapMm} mm</span>
                                        </div>
                                        <input
                                            type="range"
                                            min="0"
                                            max="25"
                                            value={config.overlapMm}
                                            onChange={(e) => setConfig(p => ({ ...p, overlapMm: Number(e.target.value) }))}
                                            className="w-full accent-blue-500 cursor-pointer"
                                        />
                                        <div className="flex justify-between text-[10px] text-slate-500">
                                            <span>0mm (Sem aba)</span>
                                            <span>12mm (Padrão)</span>
                                            <span>25mm (Larga)</span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* ETAPA 5: AVANÇADO (FATIART - SCREENSHOT 02:09:11) */}
                            {currentStep === 5 && (
                                <div className="space-y-3 animate-in fade-in">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                                            <span>⚙️</span>
                                            Configurações Avançadas FatiArt
                                        </h3>
                                    </div>

                                    {/* Accordion 1: Cortes & Marcas */}
                                    <div className="bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden">
                                        <button
                                            type="button"
                                            onClick={() => setOpenAdvancedSection(openAdvancedSection === 'cortes_marcas' ? null : 'cortes_marcas')}
                                            className="w-full p-3.5 flex items-center justify-between text-xs font-bold text-white hover:bg-slate-900/60 cursor-pointer"
                                        >
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center">
                                                    <Scissors size={13} />
                                                </div>
                                                <span>Cortes & Marcas</span>
                                            </div>
                                            {openAdvancedSection === 'cortes_marcas' ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                                        </button>

                                        {openAdvancedSection === 'cortes_marcas' && (
                                            <div className="p-3 pt-0 space-y-2 text-xs border-t border-slate-800/60">
                                                <label className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-900 cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={config.includeMontageGuideInPdf}
                                                        onChange={(e) => setConfig(p => ({ ...p, includeMontageGuideInPdf: e.target.checked }))}
                                                        className="accent-blue-500"
                                                    />
                                                    <span className="text-slate-300">Incluir guia de montagem no PDF</span>
                                                </label>
                                                <label className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-900 cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={config.showCropMarks}
                                                        onChange={(e) => setConfig(p => ({ ...p, showCropMarks: e.target.checked }))}
                                                        className="accent-blue-500"
                                                    />
                                                    <span className="text-slate-300">Incluir marcas de alinhamento nas folhas (Cruzetas)</span>
                                                </label>
                                                <label className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-900 cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={config.showCornerMarks}
                                                        onChange={(e) => setConfig(p => ({ ...p, showCornerMarks: e.target.checked }))}
                                                        className="accent-blue-500"
                                                    />
                                                    <span className="text-slate-300">Marcas de canto em L nas folhas (PDF)</span>
                                                </label>
                                                <label className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-900 cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={config.showDashedCutLines}
                                                        onChange={(e) => setConfig(p => ({ ...p, showDashedCutLines: e.target.checked }))}
                                                        className="accent-blue-500"
                                                    />
                                                    <span className="text-slate-300">Linhas pontilhadas para corte (PDF)</span>
                                                </label>
                                            </div>
                                        )}
                                    </div>

                                    {/* Accordion 2: Sua Marca d'Água */}
                                    <div className="bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden">
                                        <button
                                            type="button"
                                            onClick={() => setOpenAdvancedSection(openAdvancedSection === 'watermark' ? null : 'watermark')}
                                            className="w-full p-3.5 flex items-center justify-between text-xs font-bold text-white hover:bg-slate-900/60 cursor-pointer"
                                        >
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 rounded-lg bg-pink-500/20 text-pink-400 flex items-center justify-center">
                                                    <UserCheck size={13} />
                                                </div>
                                                <span>Sua marca d'água</span>
                                            </div>
                                            <span className="text-[11px] text-slate-500 font-mono">
                                                {config.watermarkText ? 'Ativado' : 'Desativado'}
                                            </span>
                                        </button>

                                        {openAdvancedSection === 'watermark' && (
                                            <div className="p-3 pt-0 space-y-2 border-t border-slate-800/60">
                                                <label className="text-[11px] text-slate-400 block">Nome do seu Ateliê / Logotipo:</label>
                                                <input
                                                    type="text"
                                                    value={config.watermarkText}
                                                    onChange={(e) => setConfig(p => ({ ...p, watermarkText: e.target.value }))}
                                                    placeholder="Ex: Ateliê Festas Encantadas"
                                                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                                                />
                                            </div>
                                        )}
                                    </div>

                                    {/* Accordion 3: Correção de Cor (NOVO) */}
                                    <div className="bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden">
                                        <button
                                            type="button"
                                            onClick={() => setOpenAdvancedSection(openAdvancedSection === 'color' ? null : 'color')}
                                            className="w-full p-3.5 flex items-center justify-between text-xs font-bold text-white hover:bg-slate-900/60 cursor-pointer"
                                        >
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                                                    <Palette size={13} />
                                                </div>
                                                <span>Correção de cor</span>
                                                <span className="px-1 text-[9px] font-black rounded bg-blue-500/20 text-blue-300">NOVO</span>
                                            </div>
                                            {openAdvancedSection === 'color' ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                                        </button>

                                        {openAdvancedSection === 'color' && (
                                            <div className="p-3 pt-0 space-y-3 text-xs border-t border-slate-800/60">
                                                <div>
                                                    <div className="flex justify-between text-slate-400 text-[11px]">
                                                        <span>Brilho:</span>
                                                        <span className="font-mono text-cyan-400">{config.colorBrightness}</span>
                                                    </div>
                                                    <input
                                                        type="range"
                                                        min="-40"
                                                        max="40"
                                                        value={config.colorBrightness}
                                                        onChange={(e) => setConfig(p => ({ ...p, colorBrightness: Number(e.target.value) }))}
                                                        className="w-full accent-blue-500 cursor-pointer"
                                                    />
                                                </div>
                                                <div>
                                                    <div className="flex justify-between text-slate-400 text-[11px]">
                                                        <span>Contraste:</span>
                                                        <span className="font-mono text-cyan-400">{config.colorContrast}</span>
                                                    </div>
                                                    <input
                                                        type="range"
                                                        min="-40"
                                                        max="40"
                                                        value={config.colorContrast}
                                                        onChange={(e) => setConfig(p => ({ ...p, colorContrast: Number(e.target.value) }))}
                                                        className="w-full accent-blue-500 cursor-pointer"
                                                    />
                                                </div>
                                                <div>
                                                    <div className="flex justify-between text-slate-400 text-[11px]">
                                                        <span>Saturação:</span>
                                                        <span className="font-mono text-cyan-400">{config.colorSaturation}</span>
                                                    </div>
                                                    <input
                                                        type="range"
                                                        min="-40"
                                                        max="40"
                                                        value={config.colorSaturation}
                                                        onChange={(e) => setConfig(p => ({ ...p, colorSaturation: Number(e.target.value) }))}
                                                        className="w-full accent-blue-500 cursor-pointer"
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* ETAPA 6: MELHORIA DE QUALIDADE & EXPORTAÇÃO */}
                            {currentStep === 6 && (
                                <div className="space-y-4 animate-in fade-in">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                                            <span>✨</span>
                                            Qualidade & Exportação Final
                                        </h3>
                                    </div>

                                    {/* Card de Informações Finais */}
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800">
                                            <div className="text-[10px] text-slate-400 uppercase font-mono">Folhas para Imprimir</div>
                                            <div className="text-2xl font-black text-pink-400 font-mono">
                                                {calcResult.printableSheets}
                                                <span className="text-xs text-slate-500 ml-1 font-normal">folhas</span>
                                            </div>
                                            <div className="text-[10px] text-slate-500 mt-1">
                                                {calcResult.totalCols} colunas × {calcResult.totalRows} linhas
                                            </div>
                                        </div>

                                        <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800">
                                            <div className="text-[10px] text-slate-400 uppercase font-mono">DPI Estimado</div>
                                            <div className="text-2xl font-black text-emerald-400 font-mono">
                                                {calcResult.dpiEstimated}
                                                <span className="text-xs text-slate-500 ml-1 font-normal">DPI</span>
                                            </div>
                                            <div className="text-[10px] text-slate-500 mt-1">
                                                {calcResult.dpiEstimated >= 150 ? '✅ Excelente' : '💡 Recomendado Upscale'}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Seletor de Resolução do PDF */}
                                    <div className="space-y-1.5">
                                        <label className="text-xs text-slate-300 font-bold">Resolução de Saída do PDF:</label>
                                        <div className="grid grid-cols-3 gap-2">
                                            {[150, 200, 300].map(dpi => (
                                                <button
                                                    key={dpi}
                                                    type="button"
                                                    onClick={() => setConfig(p => ({ ...p, printDpi: dpi as any }))}
                                                    className={`py-2 px-1 rounded-xl border text-xs font-bold text-center transition cursor-pointer ${
                                                        config.printDpi === dpi
                                                            ? 'bg-blue-600 border-blue-400 text-white shadow-md'
                                                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                                                    }`}
                                                >
                                                    {dpi} DPI {dpi === 300 ? '👑 HD' : ''}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Opção de Abrir no Upscaler */}
                                    {onOpenUpscale && selectedImageUrl && (
                                        <div className="p-3 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 flex items-center justify-between gap-3">
                                            <div>
                                                <div className="text-xs font-bold text-emerald-300">
                                                    Melhorar com Upscaling 4x IA
                                                </div>
                                                <div className="text-[10px] text-slate-400">
                                                    Multiplica a resolução da arte antes de imprimir
                                                </div>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => onOpenUpscale(selectedImageUrl, config.panelName)}
                                                className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md transition cursor-pointer"
                                            >
                                                Abrir Upscale
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* BARRA DE BOTÕES DE NAVEGAÇÃO DE ETAPAS (FATIART - ANTERIOR / PRÓXIMO) */}
                            <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
                                <button
                                    type="button"
                                    onClick={handlePrevStep}
                                    disabled={currentStep === 1}
                                    className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 text-xs font-bold flex items-center gap-1 cursor-pointer"
                                >
                                    <ChevronLeft size={16} />
                                    <span>Anterior</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={handleNextStep}
                                    disabled={currentStep === 6}
                                    className="py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white text-xs font-bold flex items-center gap-1 ml-auto cursor-pointer shadow-md"
                                >
                                    <span>Próximo</span>
                                    <ChevronRight size={16} />
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* COLUNA DIREITA: PRÉ-VISUALIZAÇÃO INTERATIVA EM GRADE 2D & SELETOR DE FOLHAS (7 COLS) */}
                <div className="lg:col-span-7 space-y-4">
                    {/* Barra de Status Informativa Superior (Screenshot 02:07:32) */}
                    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3 sm:p-4 flex flex-wrap items-center justify-between gap-3 backdrop-blur-md">
                        <div className="flex items-center gap-3 text-xs">
                            <span className="font-bold text-white">
                                {calcResult.printableSheets} folhas
                            </span>
                            <span className="text-slate-600">•</span>
                            <span className="text-slate-400">
                                DPI: <strong className="text-emerald-400 font-mono">{calcResult.dpiEstimated}</strong>
                            </span>
                            <span className="text-slate-600">•</span>
                            <span className="text-slate-400">
                                Tamanho final: <strong className="text-cyan-400 font-mono">{calcResult.totalWidthCm} × {calcResult.totalHeightCm} cm</strong>
                            </span>
                        </div>

                        {/* Controles de Zoom */}
                        <div className="flex items-center gap-1.5 ml-auto">
                            <button
                                type="button"
                                onClick={() => setZoomLevel(prev => Math.max(0.6, prev - 0.2))}
                                className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
                                title="Diminuir Zoom"
                            >
                                <ZoomOut size={14} />
                            </button>
                            <span className="text-[11px] font-mono text-slate-400 w-10 text-center">
                                {Math.round(zoomLevel * 100)}%
                            </span>
                            <button
                                type="button"
                                onClick={() => setZoomLevel(prev => Math.min(2.0, prev + 0.2))}
                                className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
                                title="Aumentar Zoom"
                            >
                                <ZoomIn size={14} />
                            </button>
                            <button
                                type="button"
                                onClick={() => setZoomLevel(1)}
                                className="px-2 py-1 rounded-lg bg-slate-800 text-[10px] text-slate-300 hover:text-white"
                            >
                                Ajustar
                            </button>
                        </div>
                    </div>

                    {/* ÁREA CENTRAL: CANVAS INTERATIVO COM A GRADE FATIADA */}
                    <div className="bg-slate-950 border border-slate-800 rounded-3xl p-4 sm:p-6 overflow-auto max-h-[640px] flex items-center justify-center relative min-h-[460px] shadow-inner">
                        {!selectedImageUrl ? (
                            <div className="text-center p-8 text-slate-500">
                                <Scissors size={44} className="mx-auto mb-3 opacity-40 text-pink-400" />
                                <p className="text-sm font-bold text-slate-400">Nenhuma imagem carregada</p>
                                <p className="text-xs text-slate-600 mt-1">Carregue uma imagem ou envie da aba Painel & Bolo.</p>
                            </div>
                        ) : mainMode === 'wall_mockup' ? (
                            /* SIMULADOR NA PAREDE 3D (FATIART - SCREENSHOT 02:07:55) */
                            <div className="relative w-full max-w-xl aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl border border-slate-800 flex items-center justify-center bg-gradient-to-b from-slate-900 to-slate-950">
                                {userWallPhotoUrl ? (
                                    <img src={userWallPhotoUrl} alt="Parede do usuário" className="absolute inset-0 w-full h-full object-cover" />
                                ) : (
                                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-800 via-slate-900 to-slate-950">
                                        {/* Rodapé / Chão de madeira simulado */}
                                        <div className="absolute bottom-0 inset-x-0 h-16 bg-gradient-to-t from-amber-950/80 to-amber-900/40 border-t border-amber-800/40" />
                                    </div>
                                )}

                                {/* Painel em Escala na Parede */}
                                <div
                                    className="relative transition-all duration-300 shadow-[0_20px_50px_rgba(0,0,0,0.8)] border-4 border-white/90"
                                    style={{
                                        width: `${Math.min(85, Math.max(25, (config.panelWidthCm / (config.wallWidthM * 100)) * 100))}%`,
                                        aspectRatio: `${config.panelWidthCm} / ${config.panelHeightCm}`,
                                        borderRadius: config.panelShape === 'round' ? '9999px' : config.panelShape === 'roman_arch' ? '9999px 9999px 8px 8px' : '8px',
                                        overflow: 'hidden'
                                    }}
                                >
                                    <img src={selectedImageUrl} alt="Painel" className="w-full h-full object-cover" />
                                </div>
                            </div>
                        ) : (
                            /* GRADE 2D COM NÚMEROS DAS FOLHAS E INDICAÇÃO DE VAZIA (SCREENSHOT 02:07:32) */
                            <div
                                className="relative transition-transform duration-150 origin-center select-none shadow-2xl rounded-xl overflow-hidden border border-slate-700 bg-white"
                                style={{
                                    transform: `scale(${zoomLevel})`,
                                    width: '100%',
                                    maxWidth: '560px',
                                    aspectRatio: `${config.panelWidthCm + (config.safetyBleedCm || 0)} / ${config.panelHeightCm + (config.safetyBleedCm || 0)}`,
                                }}
                            >
                                {/* Imagem de fundo */}
                                <img
                                    src={selectedImageUrl}
                                    alt="Painel de fundo"
                                    className="w-full h-full object-cover pointer-events-none"
                                />

                                {/* Guia visual de contorno vermelho para corte (círculo / arco) */}
                                {config.mode === 'party_panel' && config.panelShape === 'round' && (
                                    <div className="absolute inset-0 rounded-full border-2 border-red-500 border-dashed pointer-events-none shadow-[0_0_0_9999px_rgba(15,23,42,0.65)]" />
                                )}
                                {config.mode === 'party_panel' && config.panelShape === 'roman_arch' && (
                                    <div className="absolute inset-0 rounded-t-full border-2 border-red-500 border-dashed pointer-events-none" />
                                )}

                                {/* Overlay com a grade de folhas clicáveis e números grandes estilo FatiArt */}
                                <div
                                    className="absolute inset-0 grid"
                                    style={{
                                        gridTemplateColumns: `repeat(${calcResult.totalCols}, 1fr)`,
                                        gridTemplateRows: `repeat(${calcResult.totalRows}, 1fr)`,
                                    }}
                                >
                                    {calcResult.sheets.map(sheet => {
                                        const isSelected = selectedSheetIndex === sheet.index;

                                        return (
                                            <div
                                                key={sheet.id}
                                                onClick={() => {
                                                    if (!sheet.isBlankSkipped) {
                                                        setSelectedSheetIndex(sheet.index);
                                                    }
                                                }}
                                                className={`relative border border-blue-400/60 flex flex-col items-center justify-center transition-all cursor-pointer group ${
                                                    sheet.isBlankSkipped
                                                        ? 'bg-slate-950/85 opacity-60 cursor-not-allowed border-slate-800'
                                                        : isSelected
                                                        ? 'bg-blue-500/35 ring-2 ring-blue-400 z-10'
                                                        : 'hover:bg-blue-500/20'
                                                }`}
                                                title={
                                                    sheet.isBlankSkipped
                                                        ? `Folha #${sheet.index} (Vazia - Fora do Círculo)`
                                                        : `Folha #${sheet.index} (Linha ${sheet.row}, Coluna ${sheet.col}) - Clique para inspecionar`
                                                }
                                            >
                                                {/* Número grande transparente (FatiArt Screenshot 02:07:32) */}
                                                <span
                                                    className={`text-sm sm:text-base font-black font-mono select-none drop-shadow-md ${
                                                        isSelected
                                                            ? 'text-white scale-110'
                                                            : sheet.isBlankSkipped
                                                            ? 'text-slate-500 text-[10px]'
                                                            : 'text-blue-200'
                                                    }`}
                                                >
                                                    {sheet.index}
                                                    {sheet.isBlankSkipped && <span className="block text-[8px] font-normal font-sans">vazia</span>}
                                                </span>

                                                {/* Indicação sutil de aba de colagem */}
                                                {config.showOverlapGuideLines && !sheet.isBlankSkipped && sheet.col < sheet.totalCols && (
                                                    <div className="absolute right-0 top-0 bottom-0 w-2.5 bg-blue-500/25 border-l border-dashed border-blue-400 pointer-events-none" />
                                                )}
                                                {config.showOverlapGuideLines && !sheet.isBlankSkipped && sheet.row < sheet.totalRows && (
                                                    <div className="absolute left-0 right-0 bottom-0 h-2.5 bg-blue-500/25 border-t border-dashed border-blue-400 pointer-events-none" />
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* BOTÕES DE EXPORTAÇÃO PRINCIPAIS (GERAR PDF COM SETA DROPDOWN - SCREENSHOT 02:09:11) */}
                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                        <button
                            type="button"
                            onClick={handleDownloadPdf}
                            disabled={isGeneratingPdf || isGeneratingZip || !loadedImage}
                            className="sm:col-span-8 py-3.5 px-5 rounded-2xl bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-sm flex items-center justify-center gap-2.5 shadow-xl shadow-blue-600/30 transition disabled:opacity-50 cursor-pointer"
                        >
                            {isGeneratingPdf ? (
                                <>
                                    <RefreshCw size={18} className="animate-spin" />
                                    <span>
                                        Gerando PDF... {generationProgress ? `(${generationProgress.current}/${generationProgress.total})` : ''}
                                    </span>
                                </>
                            ) : (
                                <>
                                    <FileText size={18} />
                                    <span>📄 Gerar PDF ({calcResult.printableSheets} Páginas {config.paperFormat})</span>
                                </>
                            )}
                        </button>

                        <button
                            type="button"
                            onClick={handleDownloadZip}
                            disabled={isGeneratingPdf || isGeneratingZip || !loadedImage}
                            className="sm:col-span-4 py-3.5 px-4 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-100 font-bold text-xs flex items-center justify-center gap-2 border border-slate-700 transition disabled:opacity-50 cursor-pointer shadow-lg"
                        >
                            {isGeneratingZip ? (
                                <>
                                    <RefreshCw size={15} className="animate-spin" />
                                    <span>Compactando...</span>
                                </>
                            ) : (
                                <>
                                    <Archive size={15} className="text-amber-400" />
                                    <span>Baixar ZIP (Todas)</span>
                                </>
                            )}
                        </button>
                    </div>

                    {/* DETALHE DA FOLHA SELECIONADA (MODAL / PAINEL INFERIOR) */}
                    {selectedSheetIndex !== null && (
                        <div className="bg-slate-900 border border-blue-500/40 rounded-3xl p-4 sm:p-5 animate-in fade-in space-y-3 shadow-2xl">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2.5">
                                    <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-300 flex items-center justify-center font-mono font-black text-sm">
                                        #{selectedSheetIndex}
                                    </div>
                                    <div>
                                        <h4 className="text-xs sm:text-sm font-bold text-white">
                                            Folha #{selectedSheetIndex} Individual
                                        </h4>
                                        <p className="text-[10px] text-slate-400">
                                            Visualização exata com margens da impressora e abas de colagem
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={handleDownloadCurrentSheet}
                                        disabled={!previewSheetDataUrl}
                                        className="py-1.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                                    >
                                        <Download size={13} />
                                        <span>Baixar Esta Folha</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setSelectedSheetIndex(null)}
                                        className="p-1.5 rounded-lg text-slate-400 hover:text-white"
                                    >
                                        ✕
                                    </button>
                                </div>
                            </div>

                            {/* Imagem renderizada da folha */}
                            {previewSheetDataUrl ? (
                                <div className="bg-white rounded-2xl p-3 flex justify-center max-h-64 overflow-hidden shadow-inner">
                                    <img
                                        src={previewSheetDataUrl}
                                        alt={`Folha ${selectedSheetIndex}`}
                                        className="max-h-60 object-contain"
                                    />
                                </div>
                            ) : (
                                <div className="py-8 text-center text-xs text-slate-500">
                                    <RefreshCw size={18} className="animate-spin mx-auto mb-2 text-blue-400" />
                                    Renderizando detalhes da folha #{selectedSheetIndex}...
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* MODAL DO MAPA GERAL DE MONTAGEM */}
            {showMontageModal && montageMapUrl && (
                <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
                    <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-2xl w-full p-5 space-y-4 shadow-2xl">
                        <div className="flex items-center justify-between">
                            <h3 className="text-base font-black text-white flex items-center gap-2">
                                <Eye size={18} className="text-blue-400" />
                                Mapa Geral de Montagem do Painel
                            </h3>
                            <button
                                type="button"
                                onClick={() => setShowMontageModal(false)}
                                className="p-1 rounded-lg text-slate-400 hover:text-white cursor-pointer"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="bg-slate-950 rounded-2xl p-2 max-h-[70vh] overflow-auto flex justify-center">
                            <img src={montageMapUrl} alt="Mapa de Montagem" className="max-w-full rounded shadow" />
                        </div>

                        <div className="flex items-center justify-between">
                            <span className="text-xs text-slate-400">
                                Guarde este mapa para orientar a colagem folha a folha na ordem correta.
                            </span>
                            <a
                                href={montageMapUrl}
                                download="Mapa_Geral_De_Montagem.png"
                                className="py-2 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-2 cursor-pointer"
                            >
                                <Download size={14} />
                                <span>Salvar Imagem do Mapa</span>
                            </a>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
