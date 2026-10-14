import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
    Scissors, 
    Sparkles, 
    Download, 
    Sliders, 
    Eye, 
    Check, 
    RefreshCw, 
    Eraser, 
    Paintbrush, 
    Undo2, 
    Redo2, 
    Upload, 
    Image as ImageIcon, 
    ZoomIn, 
    ZoomOut, 
    RotateCcw, 
    SlidersHorizontal, 
    Layers, 
    Palette, 
    Maximize2, 
    X, 
    CheckCircle2, 
    Columns2, 
    Square, 
    FileText, 
    SunMedium, 
    ArrowLeftRight,
    Loader2,
    Copy,
    AlertCircle,
    Shield,
    ShieldCheck,
    Globe,
    Bot,
    SplitSquareVertical,
    LayoutGrid,
    MoveHorizontal,
    UploadCloud,
    Flame
} from 'lucide-react';
import { 
    removeBackgroundAutomatically, 
    analyzeSubjectWithAI,
    AiCutoutAnalysisResult,
    applyStickerContour, 
    composeFinalImage, 
    createComposedCanvas,
    downloadInFormat, 
    copyImageToClipboard,
    loadImageElement, 
    BackgroundRemoverOptions, 
    StickerOptions, 
    BackgroundReplacementOptions, 
    EXPORT_FORMAT_OPTIONS, 
    SOLID_COLOR_PRESETS, 
    GRADIENT_PRESETS, 
    SCENIC_PRESETS 
} from '../services/backgroundRemoverService';
import { SAMPLE_DEMO_IMAGES, DemoSampleItem } from '../utils/sampleDemoImages';
import type { UploadedImage } from '../types';

interface BackgroundRemoverStudioProps {
    initialImageUrl?: string | null;
    initialImageName?: string | null;
    availableImages?: UploadedImage[];
    onBackToArchitect?: () => void;
    onOpenUpscale?: (imageUrl: string, imageName: string) => void;
}

type TabType = 'cutout' | 'background' | 'sticker' | 'brush';

export const BackgroundRemoverStudio: React.FC<BackgroundRemoverStudioProps> = ({
    initialImageUrl,
    initialImageName,
    availableImages = [],
    onBackToArchitect,
    onOpenUpscale,
}) => {
    // Imagem Base (Inicia com demonstração de tênis branco se nenhuma for passada, estilo remove.photos)
    const [sourceUrl, setSourceUrl] = useState<string | null>(() => {
        if (initialImageUrl) return initialImageUrl;
        if (typeof window !== 'undefined' && SAMPLE_DEMO_IMAGES.length > 0) {
            return SAMPLE_DEMO_IMAGES[0].getDataUrl();
        }
        return null;
    });
    const [sourceName, setSourceName] = useState<string>(initialImageName || (initialImageUrl ? 'imagem-recorte' : 'tenis-branco-amostra'));
    const [originalImgElement, setOriginalImgElement] = useState<HTMLImageElement | null>(null);
    const [dimensions, setDimensions] = useState<{ width: number; height: number } | null>(null);

    // Estado do Recorte
    const [isRemoving, setIsRemoving] = useState<boolean>(false);
    const [hasCutout, setHasCutout] = useState<boolean>(false);
    const [tolerance, setTolerance] = useState<number>(45);
    const [hairRefinement, setHairRefinement] = useState<boolean>(true);
    const [hairSensitivity, setHairSensitivity] = useState<number>(70);
    const [colorDespill, setColorDespill] = useState<boolean>(true);
    const [edgeChoke, setEdgeChoke] = useState<number>(0);

    // Proteção Inteligente contra remoção de peças brancas internas (roupas, calçados, detalhes)
    const [protectInternalWhites, setProtectInternalWhites] = useState<boolean>(true);
    const [whiteShieldSensitivity, setWhiteShieldSensitivity] = useState<number>(85);
    const [aiModel, setAiModel] = useState<'gemini' | 'huggingface' | 'openai'>('gemini');
    const [aiData, setAiData] = useState<AiCutoutAnalysisResult | null>(null);
    const [isAnalyzingAI, setIsAnalyzingAI] = useState<boolean>(false);
    const [aiStatusMessage, setAiStatusMessage] = useState<string | null>(null);

    // Modo Figurinha (Sticker)
    const [stickerOptions, setStickerOptions] = useState<StickerOptions>({
        enabled: false,
        borderWidth: 16,
        borderColor: '#FFFFFF',
        borderRadius: 12,
        dropShadow: true,
        shadowBlur: 14,
        shadowOpacity: 0.35,
        shadowColor: '#000000',
        shadowOffsetY: 8
    });

    // Trocar Fundo
    const [bgOptions, setBgOptions] = useState<BackgroundReplacementOptions>({
        type: 'transparent',
        solidColor: '#FFFFFF',
        gradient: GRADIENT_PRESETS[0],
        presetId: SCENIC_PRESETS[0].id,
        customImageUrl: undefined,
        customImageFit: 'cover',
        blurBokeh: 0,
        darken: 0
    });
    const [customBgElement, setCustomBgElement] = useState<HTMLImageElement | null>(null);

    // Ferramenta de Pincel Manual
    const [activeTab, setActiveTab] = useState<TabType>('cutout');
    const [brushTool, setBrushTool] = useState<'erase' | 'restore'>('erase');
    const [brushSize, setBrushSize] = useState<number>(28);
    const [brushFeather, setBrushFeather] = useState<number>(20);
    const [isPainting, setIsPainting] = useState<boolean>(false);
    const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null);

    // Zoom & Pan
    const [zoom, setZoom] = useState<number>(1);
    const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

    // Modos de Comparação Inspirados em remove.photos e removebackgrounds.ai
    // 'split' = Divisor interativo arrastável (Antes / Depois com alça)
    // 'sideBySide' = Telas lado a lado
    // 'cutout' = Apenas imagem recortada
    // 'original' = Apenas imagem original
    const [viewMode, setViewMode] = useState<'split' | 'sideBySide' | 'cutout' | 'original'>('split');
    const [compareSplit, setCompareSplit] = useState<number>(50); // 0 a 100%
    const [isDraggingSplit, setIsDraggingSplit] = useState<boolean>(false);
    const [isComparingHold, setIsComparingHold] = useState<boolean>(false);
    const [isDragOver, setIsDragOver] = useState<boolean>(false);
    const [showSamplesBar, setShowSamplesBar] = useState<boolean>(true);

    // Download & Export
    const [selectedFormat, setSelectedFormat] = useState<'png' | 'jpeg' | 'webp' | 'svg' | 'pdf'>('png');
    const [exportScale, setExportScale] = useState<1 | 2>(1);
    const [isDownloading, setIsDownloading] = useState<boolean>(false);
    const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);
    const [downloadError, setDownloadError] = useState<string | null>(null);
    const [isCopied, setIsCopied] = useState<boolean>(false);

    // Canvases em Memória
    const rawCutoutCanvasRef = useRef<HTMLCanvasElement | null>(null);
    const maskDataRef = useRef<Uint8ClampedArray | null>(null);
    const historyStackRef = useRef<ImageData[]>([]);
    const historyIndexRef = useRef<number>(-1);

    // Canvas de Exibição
    const displayCanvasRef = useRef<HTMLCanvasElement | null>(null);
    const containerRef = useRef<HTMLDivElement | null>(null);
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const customBgInputRef = useRef<HTMLInputElement | null>(null);

    // Clipboard Paste Listener (Ctrl+V em qualquer lugar da tela abre a imagem copiada)
    useEffect(() => {
        const handlePaste = (e: ClipboardEvent) => {
            const items = e.clipboardData?.items;
            if (!items) return;
            for (let i = 0; i < items.length; i++) {
                if (items[i].type.indexOf('image') !== -1) {
                    const blob = items[i].getAsFile();
                    if (blob) {
                        const reader = new FileReader();
                        reader.onload = (event) => {
                            if (event.target?.result) {
                                setSourceUrl(event.target.result as string);
                                setSourceName(`imagem-colada-${Date.now()}`);
                            }
                        };
                        reader.readAsDataURL(blob);
                        e.preventDefault();
                        break;
                    }
                }
            }
        };

        window.addEventListener('paste', handlePaste);
        return () => window.removeEventListener('paste', handlePaste);
    }, []);

    // Arrastar Divisor Interativo (Split Slider)
    const handleSplitMove = useCallback((clientX: number) => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        if (rect.width <= 0) return;
        const relativeX = clientX - rect.left;
        const percentage = Math.max(2, Math.min(98, (relativeX / rect.width) * 100));
        setCompareSplit(Math.round(percentage));
    }, []);

    useEffect(() => {
        if (!isDraggingSplit) return;

        const onPointerMove = (e: PointerEvent) => {
            handleSplitMove(e.clientX);
        };
        const onPointerUp = () => {
            setIsDraggingSplit(false);
        };

        window.addEventListener('pointermove', onPointerMove);
        window.addEventListener('pointerup', onPointerUp);
        return () => {
            window.removeEventListener('pointermove', onPointerMove);
            window.removeEventListener('pointerup', onPointerUp);
        };
    }, [isDraggingSplit, handleSplitMove]);

    // Carrega imagem fonte quando sourceUrl muda
    useEffect(() => {
        if (!sourceUrl) return;
        let isMounted = true;
        loadImageElement(sourceUrl)
            .then(img => {
                if (!isMounted) return;
                setOriginalImgElement(img);
                setDimensions({ width: img.naturalWidth || img.width, height: img.naturalHeight || img.height });
                // Reseta estado
                setHasCutout(false);
                historyStackRef.current = [];
                historyIndexRef.current = -1;
                // Executa recorte automático inicial com blindagem de partes brancas
                executeAutoRemove(img, {
                    tolerance,
                    edgeSmoothRadius: 2,
                    hairRefinement,
                    hairSensitivity,
                    colorDespill,
                    edgeChoke,
                    protectInternalWhites: true,
                    whiteShieldSensitivity: 85,
                    aiData: null
                });
            })
            .catch(err => {
                console.error("Erro ao carregar imagem:", err);
            });
        return () => { isMounted = false; };
    }, [sourceUrl]);

    // Executa remoção automática
    const executeAutoRemove = async (
        img: HTMLImageElement,
        opts: BackgroundRemoverOptions
    ) => {
        setIsRemoving(true);
        try {
            const finalOpts: BackgroundRemoverOptions = {
                ...opts,
                protectInternalWhites: opts.protectInternalWhites ?? protectInternalWhites,
                whiteShieldSensitivity: opts.whiteShieldSensitivity ?? whiteShieldSensitivity,
                aiData: opts.aiData !== undefined ? opts.aiData : aiData
            };
            const result = await removeBackgroundAutomatically(img, finalOpts);
            rawCutoutCanvasRef.current = result.cutoutCanvas;
            maskDataRef.current = result.maskData;
            setHasCutout(true);

            // Salva estado inicial na pilha de histórico
            const ctx = result.cutoutCanvas.getContext('2d');
            if (ctx) {
                const initialImgData = ctx.getImageData(0, 0, result.width, result.height);
                historyStackRef.current = [initialImgData];
                historyIndexRef.current = 0;
            }

            renderDisplay();
        } catch (err) {
            console.error("Falha no recorte:", err);
        } finally {
            setIsRemoving(false);
        }
    };

    // Analisa a imagem com o modelo de IA selecionado para blindar peças brancas
    const handleRunAIAnalysis = async () => {
        if (!originalImgElement) return;

        setIsAnalyzingAI(true);
        const modelLabel = aiModel === 'gemini' 
            ? 'Google Gemini 3.8 Flash Vision' 
            : aiModel === 'huggingface' 
                ? 'Hugging Face RMBG / BiRefNet' 
                : 'OpenAI GPT-4o Vision';

        setAiStatusMessage(`Conectando ao modelo de IA (${modelLabel})...`);

        try {
            // Converte imagem em base64 limpo
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = originalImgElement.naturalWidth || originalImgElement.width;
            tempCanvas.height = originalImgElement.naturalHeight || originalImgElement.height;
            const tCtx = tempCanvas.getContext('2d');
            if (!tCtx) throw new Error('Não foi possível inicializar canvas para IA.');
            tCtx.drawImage(originalImgElement, 0, 0);
            const base64 = tempCanvas.toDataURL('image/jpeg', 0.88);

            setAiStatusMessage('IA analisando o sujeito e demarcando elementos brancos internos...');
            const result = await analyzeSubjectWithAI(base64, 'image/jpeg');
            setAiData(result);

            // Re-executa recorte com os dados semânticos da IA e blindagem de branco
            setAiStatusMessage('Aplicando máscara de segmentação e blindando peças brancas...');
            await executeAutoRemove(originalImgElement, {
                tolerance,
                edgeSmoothRadius: 2,
                hairRefinement,
                hairSensitivity,
                colorDespill,
                edgeChoke,
                protectInternalWhites: true,
                whiteShieldSensitivity,
                aiData: result
            });

            const protectedDesc = result.protectedWhiteElements?.length
                ? result.protectedWhiteElements.join(', ')
                : 'roupas brancas, tênis e detalhes internos';

            setAiStatusMessage(`✓ IA (${modelLabel}): ${result.subjectTitle || 'Sujeito detectado'} — Blindagem ativada para: ${protectedDesc}!`);
            setTimeout(() => setAiStatusMessage(null), 9000);
        } catch (err: any) {
            console.error('Falha na IA:', err);
            setAiStatusMessage(`Aviso: IA offline ou cota (${err?.message || 'Usando blindagem inteligente local'}). Roupas e áreas brancas blindadas!`);
            await executeAutoRemove(originalImgElement, {
                tolerance,
                edgeSmoothRadius: 2,
                hairRefinement,
                hairSensitivity,
                colorDespill,
                edgeChoke,
                protectInternalWhites: true,
                whiteShieldSensitivity,
                aiData: null
            });
            setTimeout(() => setAiStatusMessage(null), 7000);
        } finally {
            setIsAnalyzingAI(false);
        }
    };

    // Renderiza o canvas composto final de exibição
    const renderDisplay = useCallback(async () => {
        const displayCanvas = displayCanvasRef.current;
        if (!displayCanvas || !rawCutoutCanvasRef.current) return;

        let workingCanvas = rawCutoutCanvasRef.current;

        // 1. Aplica Modo Figurinha se ativo
        if (stickerOptions.enabled) {
            workingCanvas = applyStickerContour(workingCanvas, stickerOptions);
        }

        // 2. Compõe com Fundo Selecionado
        const composed = await composeFinalImage(workingCanvas, bgOptions, customBgElement);

        // 3. Atualiza o displayCanvas visível
        displayCanvas.width = composed.width;
        displayCanvas.height = composed.height;
        const dCtx = displayCanvas.getContext('2d');
        if (dCtx) {
            dCtx.clearRect(0, 0, composed.width, composed.height);
            dCtx.drawImage(composed, 0, 0);
        }
    }, [stickerOptions, bgOptions, customBgElement]);

    // Re-renderiza quando mudam opções de fundo ou figurinha
    useEffect(() => {
        if (hasCutout) {
            renderDisplay();
        }
    }, [stickerOptions, bgOptions, customBgElement, hasCutout, renderDisplay]);

    // Pintura Manual com Pincel (Apagar / Restaurar)
    const applyBrushStroke = (canvasX: number, canvasY: number) => {
        const rawCanvas = rawCutoutCanvasRef.current;
        const originalImg = originalImgElement;
        if (!rawCanvas || !originalImg) return;

        const ctx = rawCanvas.getContext('2d');
        if (!ctx) return;

        ctx.save();
        ctx.beginPath();
        ctx.arc(canvasX, canvasY, brushSize / 2, 0, Math.PI * 2);

        if (brushTool === 'erase') {
            // Apaga pixels (torna transparente)
            ctx.globalCompositeOperation = 'destination-out';
            ctx.fillStyle = 'rgba(0,0,0,1)';
            ctx.fill();
        } else {
            // Restaura pixels da imagem original
            ctx.globalCompositeOperation = 'source-over';
            ctx.clip();
            ctx.drawImage(originalImg, 0, 0);
        }
        ctx.restore();

        renderDisplay();
    };

    const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
        if (activeTab !== 'brush') return;
        const canvas = displayCanvasRef.current;
        if (!canvas) return;

        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        const x = (e.clientX - rect.left) * scaleX;
        const y = (e.clientY - rect.top) * scaleY;

        setIsPainting(true);
        applyBrushStroke(x, y);
    };

    const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
        const canvas = displayCanvasRef.current;
        if (!canvas) return;

        const rect = canvas.getBoundingClientRect();
        setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });

        if (!isPainting || activeTab !== 'brush') return;
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        const x = (e.clientX - rect.left) * scaleX;
        const y = (e.clientY - rect.top) * scaleY;

        applyBrushStroke(x, y);
    };

    const handlePointerUp = () => {
        if (isPainting && rawCutoutCanvasRef.current) {
            setIsPainting(false);
            // Salva no histórico de Undo/Redo
            const ctx = rawCutoutCanvasRef.current.getContext('2d');
            if (ctx) {
                const snapshot = ctx.getImageData(0, 0, rawCutoutCanvasRef.current.width, rawCutoutCanvasRef.current.height);
                // Trunca redo futuro se estávamos no meio
                const newHistory = historyStackRef.current.slice(0, historyIndexRef.current + 1);
                newHistory.push(snapshot);
                historyStackRef.current = newHistory;
                historyIndexRef.current = newHistory.length - 1;
            }
        }
    };

    // Desfazer (Undo)
    const handleUndo = () => {
        if (historyIndexRef.current > 0 && rawCutoutCanvasRef.current) {
            historyIndexRef.current--;
            const previousState = historyStackRef.current[historyIndexRef.current];
            const ctx = rawCutoutCanvasRef.current.getContext('2d');
            if (ctx) {
                ctx.putImageData(previousState, 0, 0);
                renderDisplay();
            }
        }
    };

    // Refazer (Redo)
    const handleRedo = () => {
        if (historyIndexRef.current < historyStackRef.current.length - 1 && rawCutoutCanvasRef.current) {
            historyIndexRef.current++;
            const nextState = historyStackRef.current[historyIndexRef.current];
            const ctx = rawCutoutCanvasRef.current.getContext('2d');
            if (ctx) {
                ctx.putImageData(nextState, 0, 0);
                renderDisplay();
            }
        }
    };

    // Download em Qualquer Formato (PNG, JPG, WEBP, SVG, PDF) com escala 1x / 2x e fallback seguro
    const handleDownload = async (overrideFormat?: 'png' | 'jpeg' | 'webp' | 'svg' | 'pdf') => {
        const targetFormat = overrideFormat || selectedFormat;
        if (!hasCutout && !rawCutoutCanvasRef.current) {
            setDownloadError('Nenhum recorte disponível. Carregue uma imagem e aguarde o recorte.');
            return;
        }

        setIsDownloading(true);
        setDownloadSuccess(null);
        setDownloadError(null);

        try {
            // Obtenção da imagem mestre recortada
            const baseCutout = rawCutoutCanvasRef.current || displayCanvasRef.current;
            if (!baseCutout) {
                throw new Error('Canvas do recorte não encontrado.');
            }

            // Composição em resolução mestre total (independente de zoom da tela)
            const composedCanvas = await createComposedCanvas(baseCutout, stickerOptions, bgOptions, customBgElement);

            // Ajuste de escala opcional (1x ou 2x HD)
            let exportCanvas = composedCanvas;
            if (exportScale === 2) {
                const scaledCanvas = document.createElement('canvas');
                scaledCanvas.width = composedCanvas.width * 2;
                scaledCanvas.height = composedCanvas.height * 2;
                const sCtx = scaledCanvas.getContext('2d');
                if (sCtx) {
                    sCtx.imageSmoothingEnabled = true;
                    sCtx.imageSmoothingQuality = 'high';
                    sCtx.drawImage(composedCanvas, 0, 0, scaledCanvas.width, scaledCanvas.height);
                    exportCanvas = scaledCanvas;
                }
            }

            const res = await downloadInFormat(exportCanvas, targetFormat, sourceName);
            setDownloadSuccess(`✓ Arquivo ${targetFormat.toUpperCase()} baixado com sucesso! (${res.filename})`);
            setTimeout(() => setDownloadSuccess(null), 5000);
        } catch (err: any) {
            console.error("Erro no download do recorte:", err);
            setDownloadError(`Falha no download: ${err?.message || 'Verifique se o navegador bloqueou o download automático.'}`);
            setTimeout(() => setDownloadError(null), 7000);
        } finally {
            setIsDownloading(false);
        }
    };

    // Copiar imagem transparente diretamente para a Área de Transferência
    const handleCopyCutout = async () => {
        if (!hasCutout && !rawCutoutCanvasRef.current) return;
        setIsCopied(false);
        setDownloadError(null);

        try {
            const baseCutout = rawCutoutCanvasRef.current || displayCanvasRef.current;
            if (!baseCutout) throw new Error('Recorte não disponível.');

            const composedCanvas = await createComposedCanvas(baseCutout, stickerOptions, bgOptions, customBgElement);
            await copyImageToClipboard(composedCanvas);
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 3000);
        } catch (err: any) {
            console.error("Falha ao copiar:", err);
            setDownloadError(`Não foi possível copiar: ${err?.message || 'Permissão negada'}`);
            setTimeout(() => setDownloadError(null), 5000);
        }
    };

    // Upload de nova imagem
    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const dataUrl = event.target?.result as string;
            setSourceUrl(dataUrl);
            setSourceName(file.name.replace(/\.[^/.]+$/, ''));
        };
        reader.readAsDataURL(file);
    };

    // Upload de fundo personalizado
    const handleCustomBgUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const dataUrl = event.target?.result as string;
            loadImageElement(dataUrl).then(img => {
                setCustomBgElement(img);
                setBgOptions(prev => ({ ...prev, type: 'custom', customImageUrl: dataUrl }));
            });
        };
        reader.readAsDataURL(file);
    };

    // Drag & Drop Handlers
    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(false);
        const file = e.dataTransfer.files?.[0];
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const dataUrl = event.target?.result as string;
                setSourceUrl(dataUrl);
                setSourceName(file.name.replace(/\.[^/.]+$/, ''));
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div 
            className="w-full space-y-4 relative"
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
        >
            {/* Overlay de Drag & Drop */}
            {isDragOver && (
                <div className="fixed inset-0 z-50 bg-emerald-950/85 backdrop-blur-md border-4 border-dashed border-emerald-400 flex flex-col items-center justify-center pointer-events-none animate-in fade-in duration-200">
                    <UploadCloud size={64} className="text-emerald-400 animate-bounce" />
                    <div className="text-2xl font-black text-white mt-4">Solte sua Imagem Aqui</div>
                    <div className="text-sm text-emerald-200 mt-1">O fundo será removido automaticamente com IA!</div>
                </div>
            )}

            {/* Header com Navegação e Ações Rápidas */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 backdrop-blur-md shadow-2xl">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 font-black shadow-lg shadow-emerald-500/20">
                            <Scissors size={22} />
                        </div>
                        <div>
                            <div className="flex items-center gap-2 flex-wrap">
                                <h1 className="text-base sm:text-lg font-black text-white tracking-wide">
                                    Removedor & Editor de Fundo IA
                                </h1>
                                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
                                    Estúdio Pro
                                </span>
                                {dimensions && (
                                    <span className="text-[10px] text-slate-400 font-mono">
                                        {dimensions.width} × {dimensions.height} px
                                    </span>
                                )}
                            </div>
                            <p className="text-xs text-slate-400 mt-0.5">
                                Inspirado em <span className="text-slate-300 font-semibold">remove.photos</span> e <span className="text-slate-300 font-semibold">removebackgrounds.ai</span>: IA com blindagem de peças brancas, refino de cabelos e figurinhas
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                        {onBackToArchitect && (
                            <button
                                type="button"
                                onClick={onBackToArchitect}
                                className="px-3 py-2 text-xs font-bold text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 transition-all cursor-pointer"
                            >
                                ← Voltar ao Arquiteto
                            </button>
                        )}
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="px-3 py-2 text-xs font-bold text-white bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 transition-all flex items-center gap-1.5 cursor-pointer"
                        >
                            <Upload size={14} />
                            <span>Trocar Foto</span>
                        </button>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleFileUpload}
                            className="hidden"
                        />
                    </div>
                </div>

                {/* Faixa de Recursos & Badges */}
                <div className="mt-4 pt-3.5 border-t border-slate-800/80 flex items-center justify-between gap-2.5 flex-wrap text-xs">
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className="px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-bold flex items-center gap-1.5 text-[11px]">
                            <Sparkles size={12} className="text-emerald-400" />
                            100% Automático & Alta Definição
                        </span>
                        <span className="px-2.5 py-1 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 font-bold flex items-center gap-1.5 text-[11px]">
                            <ShieldCheck size={12} className="text-cyan-400" />
                            Blindagem de Peças Brancas (Tênis, Roupas, Detalhes)
                        </span>
                        <span className="px-2.5 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 font-bold flex items-center gap-1.5 text-[11px]">
                            <Copy size={12} className="text-amber-400" />
                            Cole imagem com Ctrl+V ou arraste aqui
                        </span>
                    </div>

                    <button
                        type="button"
                        onClick={() => setShowSamplesBar(prev => !prev)}
                        className="text-[11px] font-bold text-slate-400 hover:text-white flex items-center gap-1 transition-colors ml-auto cursor-pointer"
                    >
                        <Flame size={13} className="text-amber-400" />
                        <span>{showSamplesBar ? 'Ocultar Amostras' : 'Testar Amostras de Teste'}</span>
                    </button>
                </div>

                {/* Amostras Rápidas para Testar Imediatamente (remove.photos & removebackgrounds.ai) */}
                {showSamplesBar && (
                    <div className="mt-3.5 p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
                        <div className="flex items-center justify-between text-xs">
                            <span className="font-bold text-slate-300 flex items-center gap-1.5">
                                <Flame size={13} className="text-amber-400" />
                                <span>Testar Imediatamente com Exemplos da Internet (Sem precisar de foto):</span>
                            </span>
                            <span className="text-[10px] text-slate-500 hidden sm:inline">
                                Clique para carregar e recortar na hora
                            </span>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                            {SAMPLE_DEMO_IMAGES.map((sample) => (
                                <button
                                    key={sample.id}
                                    type="button"
                                    onClick={() => {
                                        const dataUrl = sample.getDataUrl();
                                        setSourceUrl(dataUrl);
                                        setSourceName(sample.id);
                                    }}
                                    className={`p-2 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-2.5 ${
                                        sourceName === sample.id
                                            ? 'bg-emerald-500/20 border-emerald-400 shadow-md ring-1 ring-emerald-400'
                                            : 'bg-slate-900/80 border-slate-800 hover:border-slate-700 hover:bg-slate-800'
                                    }`}
                                >
                                    <div className="w-10 h-10 rounded-lg bg-slate-950 border border-slate-800 overflow-hidden shrink-0 flex items-center justify-center">
                                        <img 
                                            src={sample.getDataUrl()} 
                                            alt={sample.title} 
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center gap-1">
                                            <span className={`text-[8px] font-black uppercase px-1 rounded ${sample.badgeColor}`}>
                                                {sample.badge}
                                            </span>
                                        </div>
                                        <div className="text-[11px] font-bold text-white truncate mt-0.5">
                                            {sample.title}
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Seleção rápida de imagem carregada do projeto */}
                {availableImages.length > 0 && (
                    <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center gap-2 overflow-x-auto pb-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0">
                            Imagens do Projeto:
                        </span>
                        {availableImages.map((img) => (
                            <button
                                key={img.id}
                                type="button"
                                onClick={() => {
                                    setSourceUrl(img.previewUrl || `data:${img.mimeType};base64,${img.base64Data}`);
                                    setSourceName(img.name);
                                }}
                                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs transition-all shrink-0 cursor-pointer ${
                                    sourceName === img.name
                                        ? 'bg-emerald-500/20 border-emerald-500 text-emerald-200 shadow-sm'
                                        : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:text-slate-200'
                                }`}
                            >
                                <img
                                    src={img.previewUrl || `data:${img.mimeType};base64,${img.base64Data}`}
                                    alt=""
                                    className="w-4 h-4 rounded object-cover"
                                />
                                <span className="max-w-[120px] truncate font-medium">{img.name}</span>
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Layout Principal: Coluna de Controles (Esquerda) + Canvas Interativo (Direita) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                {/* Painel de Controles com Abas */}
                <div className="lg:col-span-5 xl:col-span-4 space-y-4">
                    {/* Botão de Destaque: Remover Automaticamente */}
                    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-3">
                        <button
                            type="button"
                            onClick={() => {
                                if (originalImgElement) {
                                    executeAutoRemove(originalImgElement, {
                                        tolerance,
                                        edgeSmoothRadius: 2,
                                        hairRefinement,
                                        hairSensitivity,
                                        colorDespill,
                                        edgeChoke,
                                        protectInternalWhites,
                                        whiteShieldSensitivity,
                                        aiData
                                    });
                                }
                            }}
                            disabled={isRemoving || !originalImgElement}
                            className="w-full py-3.5 px-4 rounded-xl font-black text-xs uppercase tracking-wider text-slate-950 bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 hover:from-emerald-300 hover:to-cyan-300 shadow-lg shadow-emerald-500/25 transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 cursor-pointer"
                        >
                            {isRemoving ? (
                                <>
                                    <Loader2 size={16} className="animate-spin text-slate-950" />
                                    <span>Recortando Sujeito com IA...</span>
                                </>
                            ) : (
                                <>
                                    <Sparkles size={16} className="text-slate-950" />
                                    <span>Remover Fundo Automaticamente</span>
                                </>
                            )}
                        </button>

                        {/* Abas de Configuração */}
                        <div className="grid grid-cols-4 gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
                            {[
                                { id: 'cutout', label: 'Recorte', icon: Scissors },
                                { id: 'background', label: 'Fundo', icon: Palette },
                                { id: 'sticker', label: 'Figurinha', icon: Square },
                                { id: 'brush', label: 'Pincel', icon: Paintbrush }
                            ].map(tab => (
                                <button
                                    key={tab.id}
                                    type="button"
                                    onClick={() => setActiveTab(tab.id as TabType)}
                                    className={`py-2 px-1.5 rounded-lg text-[10px] font-black uppercase transition-all flex flex-col items-center gap-1 cursor-pointer ${
                                        activeTab === tab.id
                                            ? 'bg-emerald-500 text-slate-950 shadow-md font-bold'
                                            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                                    }`}
                                >
                                    <tab.icon size={13} />
                                    <span>{tab.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Conteúdo da Aba Ativa */}
                    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-4">
                        {activeTab === 'cutout' && (
                            <div className="space-y-4 animate-in fade-in duration-200">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-xs font-black uppercase tracking-wider text-slate-200 flex items-center gap-1.5">
                                        <SlidersHorizontal size={14} className="text-emerald-400" />
                                        <span>Ajustes & Modelos de IA da Internet</span>
                                    </h2>
                                    <span className="text-[10px] bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded-full border border-emerald-500/30 flex items-center gap-1">
                                        <Bot size={11} />
                                        <span>IA DE VISÃO</span>
                                    </span>
                                </div>

                                {/* CARD ESPECIAL: Modelos de IA da Internet & Blindagem de Peças Brancas */}
                                <div className="p-3.5 rounded-2xl bg-gradient-to-b from-slate-950 via-slate-900/90 to-slate-950 border border-emerald-500/30 shadow-lg space-y-3">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400">
                                                <Globe size={15} />
                                            </div>
                                            <div>
                                                <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                                                    <span>Modelos de IA da Internet</span>
                                                    <span className="text-[9px] bg-emerald-500 text-slate-950 font-black px-1.5 py-0.2 rounded">NOVO</span>
                                                </h3>
                                                <p className="text-[10px] text-slate-400 leading-tight">
                                                    Analisa a imagem e impede a remoção de peças brancas internas
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Seletor de Modelo de IA */}
                                    <div className="space-y-1.5">
                                        <span className="text-[11px] font-bold text-slate-300">Escolha o Modelo de IA:</span>
                                        <div className="grid grid-cols-3 gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
                                            {[
                                                { id: 'gemini', label: 'Gemini 3.8', sub: 'Google Vision' },
                                                { id: 'huggingface', label: 'HuggingFace', sub: 'RMBG Neural' },
                                                { id: 'openai', label: 'GPT-4o', sub: 'Vision Pro' }
                                            ].map(m => (
                                                <button
                                                    key={m.id}
                                                    type="button"
                                                    onClick={() => setAiModel(m.id as any)}
                                                    className={`py-1.5 px-1 rounded-lg text-center transition-all cursor-pointer ${
                                                        aiModel === m.id
                                                            ? 'bg-emerald-500 text-slate-950 shadow-md font-bold'
                                                            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                                                    }`}
                                                >
                                                    <div className="text-[10px] font-black">{m.label}</div>
                                                    <div className="text-[8px] opacity-80">{m.sub}</div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Botão de Disparo da Análise com IA */}
                                    <button
                                        type="button"
                                        onClick={handleRunAIAnalysis}
                                        disabled={isAnalyzingAI || !originalImgElement}
                                        className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 active:scale-95 text-slate-950 font-black text-xs uppercase tracking-wide transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                                    >
                                        {isAnalyzingAI ? (
                                            <>
                                                <Loader2 size={14} className="animate-spin text-slate-950" />
                                                <span>Consultando IA da Internet...</span>
                                            </>
                                        ) : (
                                            <>
                                                <Sparkles size={14} className="text-slate-950" />
                                                <span>Analisar Sujeito & Blindar Peças Brancas com IA</span>
                                            </>
                                        )}
                                    </button>

                                    {/* Status / Notificação da IA */}
                                    {aiStatusMessage && (
                                        <div className="p-2.5 rounded-xl bg-emerald-950/50 border border-emerald-500/40 text-emerald-200 text-[11px] flex items-start gap-2 animate-in fade-in duration-200">
                                            <ShieldCheck size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                                            <div className="flex-1 leading-snug">{aiStatusMessage}</div>
                                        </div>
                                    )}

                                    {/* Detalhes Detectados pela IA */}
                                    {aiData && (
                                        <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1.5 text-[11px]">
                                            <div className="flex items-center gap-1.5 font-bold text-white">
                                                <Check size={13} className="text-emerald-400" />
                                                <span>Sujeito: {aiData.subjectTitle}</span>
                                            </div>
                                            {aiData.protectedWhiteElements && aiData.protectedWhiteElements.length > 0 && (
                                                <div className="text-slate-400">
                                                    <strong className="text-emerald-300">Áreas Brancas Protegidas:</strong> {aiData.protectedWhiteElements.join(', ')}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* BLINDAGEM DE PEÇAS BRANCAS (Toggle & Sensibilidade) */}
                                <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3">
                                    <div className="flex items-center justify-between">
                                        <label className="text-xs font-bold text-slate-200 flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={protectInternalWhites}
                                                onChange={(e) => {
                                                    const val = e.target.checked;
                                                    setProtectInternalWhites(val);
                                                    if (originalImgElement) {
                                                        executeAutoRemove(originalImgElement, {
                                                            tolerance,
                                                            edgeSmoothRadius: 2,
                                                            hairRefinement,
                                                            hairSensitivity,
                                                            colorDespill,
                                                            edgeChoke,
                                                            protectInternalWhites: val,
                                                            whiteShieldSensitivity,
                                                            aiData
                                                        });
                                                    }
                                                }}
                                                className="rounded accent-emerald-500 w-4 h-4 cursor-pointer"
                                            />
                                            <span className="flex items-center gap-1.5">
                                                <Shield size={14} className="text-emerald-400" />
                                                <span>Blindagem de Peças Brancas Internas</span>
                                            </span>
                                        </label>
                                        <span className={`text-[9px] font-black px-1.5 py-0.5 rounded ${protectInternalWhites ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-500'}`}>
                                            {protectInternalWhites ? 'ATIVADO' : 'DESLIGADO'}
                                        </span>
                                    </div>

                                    <p className="text-[11px] text-slate-400 leading-snug">
                                        Garante que camisetas brancas, tênis claros, dentes, olhos ou detalhes brancos internos <strong className="text-slate-200">NUNCA sejam apagados</strong>, mesmo se o fundo também for 100% branco.
                                    </p>

                                    {protectInternalWhites && (
                                        <div className="space-y-1.5 pt-2 border-t border-slate-800">
                                            <div className="flex justify-between text-xs">
                                                <span className="text-slate-400">Sensibilidade da Blindagem:</span>
                                                <span className="font-mono font-bold text-emerald-400">{whiteShieldSensitivity}%</span>
                                            </div>
                                            <input
                                                type="range"
                                                min="30"
                                                max="100"
                                                value={whiteShieldSensitivity}
                                                onChange={(e) => {
                                                    const val = Number(e.target.value);
                                                    setWhiteShieldSensitivity(val);
                                                    if (originalImgElement) {
                                                        executeAutoRemove(originalImgElement, {
                                                            tolerance,
                                                            edgeSmoothRadius: 2,
                                                            hairRefinement,
                                                            hairSensitivity,
                                                            colorDespill,
                                                            edgeChoke,
                                                            protectInternalWhites: true,
                                                            whiteShieldSensitivity: val,
                                                            aiData
                                                        });
                                                    }
                                                }}
                                                className="w-full accent-emerald-500 cursor-pointer"
                                            />
                                            <div className="flex justify-between text-[9px] text-slate-500 font-mono">
                                                <span>Equilibrado (30%)</span>
                                                <span>Blindagem Total (100%)</span>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Tolerância da Remoção */}
                                <div className="space-y-1.5">
                                    <div className="flex justify-between text-xs">
                                        <span className="text-slate-400 font-medium">Tolerância do Fundo:</span>
                                        <span className="font-mono font-bold text-emerald-400">{tolerance}%</span>
                                    </div>
                                    <input
                                        type="range"
                                        min="5"
                                        max="90"
                                        value={tolerance}
                                        onChange={(e) => setTolerance(Number(e.target.value))}
                                        className="w-full accent-emerald-500 cursor-pointer"
                                    />
                                    <div className="flex justify-between text-[9px] text-slate-500 font-mono">
                                        <span>Mais Restrito (5%)</span>
                                        <span>Mais Agressivo (90%)</span>
                                    </div>
                                </div>

                                {/* Refinamento de Cabelos */}
                                <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 space-y-3">
                                    <div className="flex items-center justify-between">
                                        <label className="text-xs font-bold text-slate-200 flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={hairRefinement}
                                                onChange={(e) => setHairRefinement(e.target.checked)}
                                                className="rounded accent-emerald-500 w-4 h-4 cursor-pointer"
                                            />
                                            <span>Refinamento de Cabelos & Fios Finos</span>
                                        </label>
                                        <span className="text-[9px] bg-emerald-500/20 text-emerald-300 font-bold px-1.5 py-0.5 rounded">
                                            ALPHA MATTING
                                        </span>
                                    </div>

                                    {hairRefinement && (
                                        <div className="space-y-2 pt-1 border-t border-slate-800/80">
                                            <div className="flex justify-between text-[11px]">
                                                <span className="text-slate-400">Sensibilidade de Fios:</span>
                                                <span className="font-mono text-emerald-400 font-bold">{hairSensitivity}%</span>
                                            </div>
                                            <input
                                                type="range"
                                                min="10"
                                                max="100"
                                                value={hairSensitivity}
                                                onChange={(e) => setHairSensitivity(Number(e.target.value))}
                                                className="w-full accent-emerald-500 cursor-pointer"
                                            />

                                            <label className="flex items-center gap-2 text-[11px] text-slate-300 pt-1 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={colorDespill}
                                                    onChange={(e) => setColorDespill(e.target.checked)}
                                                    className="rounded accent-emerald-500 w-3.5 h-3.5 cursor-pointer"
                                                />
                                                <span>Descontaminar Cor de Fundo nas Bordas (Despill)</span>
                                            </label>
                                        </div>
                                    )}
                                </div>

                                {/* Erosão / Expansão de Bordas */}
                                <div className="space-y-1.5">
                                    <div className="flex justify-between text-xs">
                                        <span className="text-slate-400 font-medium">Ajuste de Margem (Choke):</span>
                                        <span className="font-mono font-bold text-emerald-400">
                                            {edgeChoke > 0 ? `+${edgeChoke}px` : `${edgeChoke}px`}
                                        </span>
                                    </div>
                                    <input
                                        type="range"
                                        min="-6"
                                        max="6"
                                        value={edgeChoke}
                                        onChange={(e) => setEdgeChoke(Number(e.target.value))}
                                        className="w-full accent-emerald-500 cursor-pointer"
                                    />
                                    <div className="flex justify-between text-[9px] text-slate-500 font-mono">
                                        <span>Contrair Borda (-6px)</span>
                                        <span>Expandir (+6px)</span>
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => {
                                        if (originalImgElement) {
                                            executeAutoRemove(originalImgElement, {
                                                tolerance,
                                                edgeSmoothRadius: 2,
                                                hairRefinement,
                                                hairSensitivity,
                                                colorDespill,
                                                edgeChoke,
                                                protectInternalWhites,
                                                whiteShieldSensitivity,
                                                aiData
                                            });
                                        }
                                    }}
                                    className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs border border-slate-700 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                                >
                                    <RefreshCw size={13} className={isRemoving ? 'animate-spin' : ''} />
                                    <span>Recalcular com Novos Parâmetros</span>
                                </button>
                            </div>
                        )}

                        {activeTab === 'background' && (
                            <div className="space-y-4 animate-in fade-in duration-200">
                                <h2 className="text-xs font-black uppercase tracking-wider text-slate-200 flex items-center gap-1.5">
                                    <Palette size={14} className="text-emerald-400" />
                                    <span>Trocar Fundo da Imagem</span>
                                </h2>

                                {/* Tipos de Fundo */}
                                <div className="grid grid-cols-3 gap-1.5">
                                    {[
                                        { id: 'transparent', label: 'Transparente' },
                                        { id: 'solid', label: 'Cor Sólida' },
                                        { id: 'gradient', label: 'Gradiente' },
                                        { id: 'preset', label: 'Cenários IA' },
                                        { id: 'custom', label: 'Foto Upload' },
                                    ].map(b => (
                                        <button
                                            key={b.id}
                                            type="button"
                                            onClick={() => setBgOptions(prev => ({ ...prev, type: b.id as any }))}
                                            className={`py-2 px-1.5 rounded-lg text-xs font-bold transition-all border cursor-pointer ${
                                                bgOptions.type === b.id
                                                    ? 'bg-emerald-500/20 border-emerald-500 text-emerald-200 shadow-sm'
                                                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
                                            }`}
                                        >
                                            {b.label}
                                        </button>
                                    ))}
                                </div>

                                {/* Opções de Cor Sólida */}
                                {bgOptions.type === 'solid' && (
                                    <div className="space-y-3 pt-2">
                                        <div className="text-[11px] text-slate-400 font-bold">Cores Pré-Definidas:</div>
                                        <div className="grid grid-cols-6 gap-2">
                                            {SOLID_COLOR_PRESETS.map((color) => (
                                                <button
                                                    key={color.hex}
                                                    type="button"
                                                    onClick={() => setBgOptions(prev => ({ ...prev, solidColor: color.hex }))}
                                                    style={{ backgroundColor: color.hex }}
                                                    className={`h-8 rounded-lg border transition-all cursor-pointer relative shadow-sm ${
                                                        bgOptions.solidColor.toLowerCase() === color.hex.toLowerCase()
                                                            ? 'ring-2 ring-emerald-400 scale-105 border-white'
                                                            : 'border-slate-700/80 hover:scale-105'
                                                    }`}
                                                    title={color.label}
                                                >
                                                    {bgOptions.solidColor.toLowerCase() === color.hex.toLowerCase() && (
                                                        <span className={`absolute inset-0 flex items-center justify-center text-xs font-black ${color.isDark ? 'text-white' : 'text-slate-950'}`}>
                                                            ✓
                                                        </span>
                                                    )}
                                                </button>
                                            ))}
                                        </div>

                                        <div className="flex items-center gap-2 pt-2">
                                            <input
                                                type="color"
                                                value={bgOptions.solidColor}
                                                onChange={(e) => setBgOptions(prev => ({ ...prev, solidColor: e.target.value }))}
                                                className="w-10 h-9 rounded-lg bg-transparent cursor-pointer border border-slate-700 p-0.5"
                                            />
                                            <input
                                                type="text"
                                                value={bgOptions.solidColor}
                                                onChange={(e) => setBgOptions(prev => ({ ...prev, solidColor: e.target.value }))}
                                                placeholder="#FFFFFF"
                                                className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white font-mono"
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* Opções de Gradiente */}
                                {bgOptions.type === 'gradient' && (
                                    <div className="space-y-2 pt-2">
                                        <div className="text-[11px] text-slate-400 font-bold">Gradientes de Estúdio:</div>
                                        <div className="grid grid-cols-2 gap-2">
                                            {GRADIENT_PRESETS.map(g => (
                                                <button
                                                    key={g.id}
                                                    type="button"
                                                    onClick={() => setBgOptions(prev => ({ ...prev, gradient: g }))}
                                                    style={{ background: `linear-gradient(to right, ${g.from}, ${g.to})` }}
                                                    className={`py-3 px-2 rounded-xl text-xs font-bold text-white shadow-md border transition-all text-center cursor-pointer ${
                                                        bgOptions.gradient.from === g.from && bgOptions.gradient.to === g.to
                                                            ? 'ring-2 ring-emerald-400 border-white'
                                                            : 'border-slate-700/60 hover:opacity-90'
                                                    }`}
                                                >
                                                    {g.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Cenários Realistas */}
                                {bgOptions.type === 'preset' && (
                                    <div className="space-y-2 pt-2">
                                        <div className="text-[11px] text-slate-400 font-bold">Cenários Renderizados:</div>
                                        <div className="space-y-2">
                                            {SCENIC_PRESETS.map(p => (
                                                <button
                                                    key={p.id}
                                                    type="button"
                                                    onClick={() => setBgOptions(prev => ({ ...prev, presetId: p.id }))}
                                                    className={`w-full p-2.5 rounded-xl border text-left transition-all flex items-center justify-between cursor-pointer ${
                                                        bgOptions.presetId === p.id
                                                            ? 'bg-emerald-950/60 border-emerald-500 text-white shadow-md'
                                                            : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
                                                    }`}
                                                >
                                                    <div>
                                                        <div className="text-xs font-bold text-white">{p.name}</div>
                                                        <div className="text-[10px] text-slate-400">{p.category}</div>
                                                    </div>
                                                    {bgOptions.presetId === p.id && (
                                                        <Check size={16} className="text-emerald-400" />
                                                    )}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Fundo Personalizado Upload */}
                                {bgOptions.type === 'custom' && (
                                    <div className="space-y-3 pt-2">
                                        <button
                                            type="button"
                                            onClick={() => customBgInputRef.current?.click()}
                                            className="w-full py-3 px-3 rounded-xl border border-dashed border-emerald-500/50 bg-emerald-950/20 hover:bg-emerald-950/40 text-emerald-300 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all"
                                        >
                                            <Upload size={15} />
                                            <span>{customBgElement ? 'Trocar Imagem de Fundo' : 'Enviar Foto para o Fundo'}</span>
                                        </button>
                                        <input
                                            ref={customBgInputRef}
                                            type="file"
                                            accept="image/*"
                                            onChange={handleCustomBgUpload}
                                            className="hidden"
                                        />

                                        {customBgElement && (
                                            <div className="space-y-3 pt-2">
                                                <div className="space-y-1">
                                                    <div className="flex justify-between text-xs">
                                                        <span className="text-slate-400">Desfoque Bokeh de Fundo:</span>
                                                        <span className="font-mono text-emerald-400">{bgOptions.blurBokeh}px</span>
                                                    </div>
                                                    <input
                                                        type="range"
                                                        min="0"
                                                        max="25"
                                                        value={bgOptions.blurBokeh}
                                                        onChange={(e) => setBgOptions(prev => ({ ...prev, blurBokeh: Number(e.target.value) }))}
                                                        className="w-full accent-emerald-500 cursor-pointer"
                                                    />
                                                </div>

                                                <div className="space-y-1">
                                                    <div className="flex justify-between text-xs">
                                                        <span className="text-slate-400">Escurecer Fundo:</span>
                                                        <span className="font-mono text-emerald-400">{bgOptions.darken}%</span>
                                                    </div>
                                                    <input
                                                        type="range"
                                                        min="0"
                                                        max="80"
                                                        value={bgOptions.darken}
                                                        onChange={(e) => setBgOptions(prev => ({ ...prev, darken: Number(e.target.value) }))}
                                                        className="w-full accent-emerald-500 cursor-pointer"
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'sticker' && (
                            <div className="space-y-4 animate-in fade-in duration-200">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-xs font-black uppercase tracking-wider text-slate-200 flex items-center gap-1.5">
                                        <Square size={14} className="text-amber-400" />
                                        <span>Modo Figurinha (Sticker Die-Cut)</span>
                                    </h2>
                                    <span className="text-[10px] text-amber-300 font-bold bg-amber-500/20 px-2 py-0.5 rounded-full border border-amber-500/30">
                                        BORDAS BRANCAS
                                    </span>
                                </div>

                                {/* Toggle Ativar / Desativar Figurinha */}
                                <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
                                    <div>
                                        <div className="text-xs font-bold text-white">Ativar Bordas de Figurinha</div>
                                        <div className="text-[10px] text-slate-400">Adiciona contorno die-cut de vinil ao redor do recorte</div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setStickerOptions(prev => ({ ...prev, enabled: !prev.enabled }))}
                                        className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                                            stickerOptions.enabled ? 'bg-amber-500' : 'bg-slate-700'
                                        }`}
                                    >
                                        <div className={`w-5 h-5 rounded-full bg-white transition-transform transform absolute top-0.5 ${
                                            stickerOptions.enabled ? 'translate-x-6' : 'translate-x-0.5'
                                        }`} />
                                    </button>
                                </div>

                                {stickerOptions.enabled && (
                                    <div className="space-y-3.5 pt-1">
                                        {/* Espessura da Borda */}
                                        <div className="space-y-1">
                                            <div className="flex justify-between text-xs">
                                                <span className="text-slate-400">Espessura da Borda Branca:</span>
                                                <span className="font-mono text-amber-300 font-bold">{stickerOptions.borderWidth}px</span>
                                            </div>
                                            <input
                                                type="range"
                                                min="4"
                                                max="45"
                                                value={stickerOptions.borderWidth}
                                                onChange={(e) => setStickerOptions(prev => ({ ...prev, borderWidth: Number(e.target.value) }))}
                                                className="w-full accent-amber-500 cursor-pointer"
                                            />
                                        </div>

                                        {/* Cor do Contorno */}
                                        <div className="space-y-1.5">
                                            <div className="text-[11px] text-slate-400 font-medium">Cor do Contorno:</div>
                                            <div className="flex items-center gap-2">
                                                {['#FFFFFF', '#FFE600', '#FF2E93', '#00F0FF', '#10B981', '#000000'].map(c => (
                                                    <button
                                                        key={c}
                                                        type="button"
                                                        onClick={() => setStickerOptions(prev => ({ ...prev, borderColor: c }))}
                                                        style={{ backgroundColor: c }}
                                                        className={`w-7 h-7 rounded-lg border transition-all cursor-pointer ${
                                                            stickerOptions.borderColor.toLowerCase() === c.toLowerCase()
                                                                ? 'ring-2 ring-amber-400 border-white scale-110'
                                                                : 'border-slate-700 hover:scale-105'
                                                        }`}
                                                    />
                                                ))}
                                                <input
                                                    type="color"
                                                    value={stickerOptions.borderColor}
                                                    onChange={(e) => setStickerOptions(prev => ({ ...prev, borderColor: e.target.value }))}
                                                    className="w-7 h-7 rounded-lg bg-transparent cursor-pointer border border-slate-700 p-0.5 ml-auto"
                                                />
                                            </div>
                                        </div>

                                        {/* Sombra 3D da Figurinha */}
                                        <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2.5">
                                            <label className="flex items-center justify-between text-xs font-bold text-slate-200 cursor-pointer">
                                                <span>Sombra Realista (Drop Shadow 3D)</span>
                                                <input
                                                    type="checkbox"
                                                    checked={stickerOptions.dropShadow}
                                                    onChange={(e) => setStickerOptions(prev => ({ ...prev, dropShadow: e.target.checked }))}
                                                    className="rounded accent-amber-500 w-4 h-4 cursor-pointer"
                                                />
                                            </label>

                                            {stickerOptions.dropShadow && (
                                                <div className="space-y-2 pt-1 border-t border-slate-800">
                                                    <div className="flex justify-between text-[11px]">
                                                        <span className="text-slate-400">Intensidade da Sombra:</span>
                                                        <span className="font-mono text-amber-300 font-bold">{Math.round(stickerOptions.shadowOpacity * 100)}%</span>
                                                    </div>
                                                    <input
                                                        type="range"
                                                        min="10"
                                                        max="80"
                                                        value={Math.round(stickerOptions.shadowOpacity * 100)}
                                                        onChange={(e) => setStickerOptions(prev => ({ ...prev, shadowOpacity: Number(e.target.value) / 100 }))}
                                                        className="w-full accent-amber-500 cursor-pointer"
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'brush' && (
                            <div className="space-y-4 animate-in fade-in duration-200">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-xs font-black uppercase tracking-wider text-slate-200 flex items-center gap-1.5">
                                        <Paintbrush size={14} className="text-emerald-400" />
                                        <span>Pincel Manual de Retoque</span>
                                    </h2>
                                    <div className="flex items-center gap-1">
                                        <button
                                            type="button"
                                            onClick={handleUndo}
                                            disabled={historyIndexRef.current <= 0}
                                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 transition-all cursor-pointer"
                                            title="Desfazer traço (Ctrl+Z)"
                                        >
                                            <Undo2 size={13} />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={handleRedo}
                                            disabled={historyIndexRef.current >= historyStackRef.current.length - 1}
                                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 transition-all cursor-pointer"
                                            title="Refazer traço"
                                        >
                                            <Redo2 size={13} />
                                        </button>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setBrushTool('erase')}
                                        className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                                            brushTool === 'erase'
                                                ? 'bg-rose-500/20 border-rose-500 text-rose-200 shadow-sm'
                                                : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
                                        }`}
                                    >
                                        <Eraser size={14} />
                                        <span>Apagar Fundo</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setBrushTool('restore')}
                                        className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                                            brushTool === 'restore'
                                                ? 'bg-emerald-500/20 border-emerald-500 text-emerald-200 shadow-sm'
                                                : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
                                        }`}
                                    >
                                        <Paintbrush size={14} />
                                        <span>Restaurar Imagem</span>
                                    </button>
                                </div>

                                <div className="space-y-1.5">
                                    <div className="flex justify-between text-xs">
                                        <span className="text-slate-400">Tamanho do Pincel:</span>
                                        <span className="font-mono text-emerald-400 font-bold">{brushSize}px</span>
                                    </div>
                                    <input
                                        type="range"
                                        min="4"
                                        max="100"
                                        value={brushSize}
                                        onChange={(e) => setBrushSize(Number(e.target.value))}
                                        className="w-full accent-emerald-500 cursor-pointer"
                                    />
                                </div>

                                <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-[11px] text-slate-400">
                                    💡 <strong className="text-slate-300">Como usar:</strong> Clique e arraste o mouse diretamente sobre a imagem no painel à direita para apagar sobras de fundo ou restaurar partes que foram recortadas.
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Exportação & Download em Qualquer Tipo de Arquivo */}
                    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-3.5">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xs font-black uppercase tracking-wider text-slate-200 flex items-center gap-1.5">
                                <Download size={14} className="text-emerald-400" />
                                <span>Exportar Imagem Recortada</span>
                            </h2>
                            <span className="text-[10px] text-emerald-300 font-bold bg-emerald-500/20 px-2 py-0.5 rounded-full">
                                5 FORMATOS DISPONÍVEIS
                            </span>
                        </div>

                        {/* Seletor de Formato */}
                        <div className="grid grid-cols-5 gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
                            {EXPORT_FORMAT_OPTIONS.map(fmt => (
                                <button
                                    key={fmt.id}
                                    type="button"
                                    onClick={() => setSelectedFormat(fmt.id)}
                                    className={`py-2 px-1 rounded-lg text-[10px] font-black uppercase transition-all cursor-pointer ${
                                        selectedFormat === fmt.id
                                            ? 'bg-emerald-500 text-slate-950 shadow-md font-bold'
                                            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                                    }`}
                                >
                                    {fmt.id}
                                </button>
                            ))}
                        </div>

                        {/* Descrição do formato selecionado */}
                        <p className="text-[11px] text-slate-400 leading-snug">
                            {EXPORT_FORMAT_OPTIONS.find(f => f.id === selectedFormat)?.description}
                        </p>

                        {/* Opção de Resolução de Download (1x / 2x HD) */}
                        <div className="flex items-center justify-between pt-1 border-t border-slate-800 text-xs">
                            <span className="text-slate-400 font-medium">Resolução de Saída:</span>
                            <div className="flex items-center gap-1 bg-slate-950 p-0.5 rounded-lg border border-slate-800">
                                <button
                                    type="button"
                                    onClick={() => setExportScale(1)}
                                    className={`px-2 py-1 rounded text-[10px] font-bold transition-all cursor-pointer ${
                                        exportScale === 1
                                            ? 'bg-emerald-500 text-slate-950'
                                            : 'text-slate-400 hover:text-white'
                                    }`}
                                >
                                    1x Original
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setExportScale(2)}
                                    className={`px-2 py-1 rounded text-[10px] font-bold transition-all cursor-pointer ${
                                        exportScale === 2
                                            ? 'bg-emerald-500 text-slate-950'
                                            : 'text-slate-400 hover:text-white'
                                    }`}
                                >
                                    2x Ultra HD
                                </button>
                            </div>
                        </div>

                        {/* Botão de Download Principal */}
                        <button
                            type="button"
                            onClick={() => handleDownload()}
                            disabled={isDownloading || !hasCutout}
                            className="w-full py-3.5 px-4 rounded-xl font-black text-xs uppercase tracking-wider text-slate-950 bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 hover:from-emerald-300 hover:to-cyan-300 shadow-xl shadow-emerald-500/25 transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 cursor-pointer"
                        >
                            {isDownloading ? (
                                <>
                                    <Loader2 size={16} className="animate-spin text-slate-950" />
                                    <span>Baixando Imagem em {selectedFormat.toUpperCase()}...</span>
                                </>
                            ) : (
                                <>
                                    <Download size={16} className="text-slate-950" />
                                    <span>Baixar Arquivo {selectedFormat.toUpperCase()} {exportScale === 2 ? '(2x HD)' : ''}</span>
                                </>
                            )}
                        </button>

                        {/* Botões Rápidos de Ação: Copiar Transparente & Downloads 1-Clique */}
                        <div className="grid grid-cols-2 gap-2 pt-1">
                            <button
                                type="button"
                                onClick={handleCopyCutout}
                                disabled={!hasCutout || isDownloading}
                                className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-40 ${
                                    isCopied
                                        ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                                        : 'bg-slate-950/70 border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800'
                                }`}
                                title="Copiar PNG transparente diretamente para colar no Photoshop, Canva ou WhatsApp"
                            >
                                {isCopied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} className="text-slate-400" />}
                                <span>{isCopied ? 'Copiado!' : 'Copiar PNG'}</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => handleDownload('png')}
                                disabled={!hasCutout || isDownloading}
                                className="py-2 px-3 rounded-xl bg-slate-950/70 hover:bg-slate-800 border border-slate-800 text-emerald-400 hover:text-emerald-300 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-40"
                                title="Download direto em PNG transparente com 1 clique"
                            >
                                <Download size={14} />
                                <span>PNG Direto</span>
                            </button>
                        </div>

                        {/* Mensagem de Sucesso */}
                        {downloadSuccess && (
                            <div className="p-2.5 rounded-xl bg-emerald-950/50 border border-emerald-500/50 text-emerald-200 text-xs flex items-center gap-2 animate-in fade-in duration-200">
                                <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                                <span>{downloadSuccess}</span>
                            </div>
                        )}

                        {/* Mensagem de Erro amigável (sem alert) */}
                        {downloadError && (
                            <div className="p-2.5 rounded-xl bg-rose-950/50 border border-rose-500/50 text-rose-200 text-xs flex items-center gap-2 animate-in fade-in duration-200">
                                <AlertCircle size={16} className="text-rose-400 shrink-0" />
                                <span className="flex-1">{downloadError}</span>
                                <button
                                    type="button"
                                    onClick={() => handleDownload()}
                                    className="px-2 py-0.5 rounded bg-rose-500/30 text-[10px] font-bold text-white hover:bg-rose-500/50 cursor-pointer"
                                >
                                    Tentar Novamente
                                </button>
                            </div>
                        )}

                        {/* Ações Avançadas: Levar para Upscale 4x */}
                        {onOpenUpscale && (
                            <button
                                type="button"
                                onClick={async () => {
                                    const baseCutout = rawCutoutCanvasRef.current || displayCanvasRef.current;
                                    if (baseCutout) {
                                        const composedCanvas = await createComposedCanvas(baseCutout, stickerOptions, bgOptions, customBgElement);
                                        const url = composedCanvas.toDataURL('image/png');
                                        onOpenUpscale(url, `${sourceName}-recorte`);
                                    }
                                }}
                                disabled={!hasCutout}
                                className="w-full py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-teal-300 hover:text-white font-bold text-xs border border-teal-500/30 transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-40"
                            >
                                <Maximize2 size={13} />
                                <span>Fazer Upscale 2x / 4x desta Imagem Recortada</span>
                            </button>
                        )}
                    </div>
                </div>

                {/* Área de Visualização e Canvas Interativo (Direita) */}
                <div className="lg:col-span-7 xl:col-span-8 space-y-3">
                    {/* Barra de Ferramentas de Zoom, Comparação e Exportação Rápida */}
                    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-2.5 flex items-center justify-between gap-2 flex-wrap">
                        {/* Controles de Zoom */}
                        <div className="flex items-center gap-1.5">
                            <button
                                type="button"
                                onClick={() => setZoom(z => Math.max(0.4, z - 0.2))}
                                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all cursor-pointer"
                                title="Zoom Menos"
                            >
                                <ZoomOut size={14} />
                            </button>
                            <span className="text-xs font-mono font-bold text-slate-300 min-w-[45px] text-center">
                                {Math.round(zoom * 100)}%
                            </span>
                            <button
                                type="button"
                                onClick={() => setZoom(z => Math.min(3, z + 0.2))}
                                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all cursor-pointer"
                                title="Zoom Mais"
                            >
                                <ZoomIn size={14} />
                            </button>
                            <button
                                type="button"
                                onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }); }}
                                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all cursor-pointer ml-1"
                                title="Redefinir Zoom (100%)"
                            >
                                <RotateCcw size={14} />
                            </button>
                        </div>

                        {/* Modos de Visualização & Comparação Interativa (remove.photos & removebackgrounds.ai) */}
                        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
                            <button
                                type="button"
                                onClick={() => setViewMode('split')}
                                className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                                    viewMode === 'split'
                                        ? 'bg-emerald-500 text-slate-950 shadow-sm font-black'
                                        : 'text-slate-400 hover:text-white'
                                }`}
                                title="Divisor Interativo Antes / Depois (Arraste a linha para comparar)"
                            >
                                <SplitSquareVertical size={13} />
                                <span>Divisor Split</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => setViewMode('sideBySide')}
                                className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                                    viewMode === 'sideBySide'
                                        ? 'bg-emerald-500 text-slate-950 shadow-sm font-black'
                                        : 'text-slate-400 hover:text-white'
                                }`}
                                title="Visualizar Lado a Lado"
                            >
                                <Columns2 size={13} />
                                <span className="hidden sm:inline">Lado a Lado</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => setViewMode('cutout')}
                                className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                                    viewMode === 'cutout'
                                        ? 'bg-emerald-500 text-slate-950 shadow-sm font-black'
                                        : 'text-slate-400 hover:text-white'
                                }`}
                                title="Apenas Imagem Recortada"
                            >
                                <Scissors size={13} />
                                <span className="hidden sm:inline">Recorte</span>
                            </button>

                            <button
                                type="button"
                                onMouseDown={() => setIsComparingHold(true)}
                                onMouseUp={() => setIsComparingHold(false)}
                                onMouseLeave={() => setIsComparingHold(false)}
                                onTouchStart={() => setIsComparingHold(true)}
                                onTouchEnd={() => setIsComparingHold(false)}
                                className={`px-2 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                                    isComparingHold
                                        ? 'bg-amber-500 text-slate-950 shadow-sm font-black'
                                        : 'text-slate-400 hover:text-white'
                                }`}
                                title="Segure para espiar a foto original"
                            >
                                <Eye size={13} />
                                <span className="hidden md:inline">Segurar</span>
                            </button>
                        </div>

                        {/* Ações Rápidas no Topo do Canvas */}
                        <div className="flex items-center gap-1.5 ml-auto">
                            <button
                                type="button"
                                onClick={handleCopyCutout}
                                disabled={!hasCutout || isDownloading}
                                className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer disabled:opacity-40"
                                title="Copiar PNG para área de transferência"
                            >
                                {isCopied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} className="text-slate-400" />}
                                <span className="hidden sm:inline">{isCopied ? 'Copiado!' : 'Copiar'}</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => handleDownload('png')}
                                disabled={!hasCutout || isDownloading}
                                className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs transition-all flex items-center gap-1.5 shadow-md shadow-emerald-500/20 active:scale-95 cursor-pointer disabled:opacity-40"
                                title="Baixar PNG transparente em alta definição"
                            >
                                <Download size={13} />
                                <span>Baixar PNG HD</span>
                            </button>
                        </div>
                    </div>

                    {/* Moldura do Canvas com Padrão Xadrez Transparente e Comparação Interativa */}
                    <div
                        ref={containerRef}
                        className="relative w-full min-h-[520px] max-h-[750px] bg-[#0c1017] rounded-2xl border border-slate-800 overflow-hidden flex items-center justify-center p-3 sm:p-5 shadow-2xl select-none"
                        style={{
                            backgroundImage: bgOptions.type === 'transparent'
                                ? `linear-gradient(45deg, #161b26 25%, transparent 25%), linear-gradient(-45deg, #161b26 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #161b26 75%), linear-gradient(-45deg, transparent 75%, #161b26 75%)`
                                : undefined,
                            backgroundSize: '24px 24px',
                            backgroundPosition: '0 0, 0 12px, 12px -12px, -12px 0px'
                        }}
                    >
                        {/* Visualização: Lado a Lado (Side by Side) */}
                        {viewMode === 'sideBySide' && !isComparingHold && originalImgElement && (
                            <div className="w-full h-full grid grid-cols-1 md:grid-cols-2 gap-4 items-center justify-center">
                                {/* Imagem Original */}
                                <div className="relative flex flex-col items-center justify-center p-2 rounded-xl bg-slate-950/60 border border-slate-800">
                                    <span className="absolute top-3 left-3 z-10 px-2 py-0.5 rounded-md bg-slate-900/90 text-slate-200 border border-slate-700 font-bold text-[10px]">
                                        ORIGINAL
                                    </span>
                                    <img
                                        src={originalImgElement.src}
                                        alt="Original"
                                        style={{
                                            transform: `scale(${zoom}) translate(${pan.x}px, ${pan.y}px)`,
                                            maxWidth: '100%',
                                            maxHeight: '520px',
                                            objectFit: 'contain'
                                        }}
                                        className="rounded-lg shadow-lg"
                                    />
                                </div>

                                {/* Imagem Recortada */}
                                <div className="relative flex flex-col items-center justify-center p-2 rounded-xl bg-slate-950/60 border border-slate-800">
                                    <span className="absolute top-3 right-3 z-10 px-2 py-0.5 rounded-md bg-emerald-500 text-slate-950 font-black text-[10px]">
                                        RECORTE IA
                                    </span>
                                    <canvas
                                        ref={displayCanvasRef}
                                        onPointerDown={handlePointerDown}
                                        onPointerMove={handlePointerMove}
                                        onPointerUp={handlePointerUp}
                                        style={{
                                            transform: `scale(${zoom}) translate(${pan.x}px, ${pan.y}px)`,
                                            maxWidth: '100%',
                                            maxHeight: '520px',
                                            objectFit: 'contain',
                                            cursor: activeTab === 'brush' ? 'crosshair' : 'default'
                                        }}
                                        className="rounded-lg shadow-lg"
                                    />
                                </div>
                            </div>
                        )}

                        {/* Visualização: Divisor Interativo Split Slider (remove.photos & removebackgrounds.ai) */}
                        {viewMode === 'split' && !isComparingHold && (
                            <div className="relative w-full h-full flex items-center justify-center">
                                {/* Badges Flutuantes de Comparação */}
                                <div className="absolute top-3 left-4 z-20 pointer-events-none">
                                    <span className="px-2.5 py-1 rounded-lg bg-slate-950/80 backdrop-blur-md text-slate-200 border border-slate-700/80 font-black text-[11px] shadow-lg flex items-center gap-1.5">
                                        <Eye size={12} className="text-slate-400" />
                                        <span>ANTES (Original)</span>
                                    </span>
                                </div>

                                <div className="absolute top-3 right-4 z-20 pointer-events-none">
                                    <span className="px-2.5 py-1 rounded-lg bg-emerald-500 text-slate-950 font-black text-[11px] shadow-lg flex items-center gap-1.5">
                                        <Sparkles size={12} className="text-slate-950" />
                                        <span>DEPOIS (Recorte IA)</span>
                                    </span>
                                </div>

                                {/* Camada 1: Recorte IA com Fundo & Figurinha */}
                                <div className="w-full h-full flex items-center justify-center">
                                    <canvas
                                        ref={displayCanvasRef}
                                        onPointerDown={handlePointerDown}
                                        onPointerMove={handlePointerMove}
                                        onPointerUp={handlePointerUp}
                                        style={{
                                            transform: `scale(${zoom}) translate(${pan.x}px, ${pan.y}px)`,
                                            maxWidth: '100%',
                                            maxHeight: '680px',
                                            objectFit: 'contain',
                                            cursor: activeTab === 'brush' ? 'crosshair' : 'default'
                                        }}
                                        className="transition-transform duration-75 shadow-2xl rounded-lg"
                                    />
                                </div>

                                {/* Camada 2: Imagem Original Sobreposta com Clip-Path no compareSplit */}
                                {originalImgElement && hasCutout && (
                                    <div 
                                        className="absolute inset-0 flex items-center justify-center overflow-hidden pointer-events-none"
                                        style={{
                                            clipPath: `polygon(0 0, ${compareSplit}% 0, ${compareSplit}% 100%, 0 100%)`
                                        }}
                                    >
                                        <img
                                            src={originalImgElement.src}
                                            alt="Original"
                                            style={{
                                                transform: `scale(${zoom}) translate(${pan.x}px, ${pan.y}px)`,
                                                maxWidth: '100%',
                                                maxHeight: '680px',
                                                objectFit: 'contain'
                                            }}
                                            className="transition-transform duration-75 shadow-2xl rounded-lg"
                                        />
                                    </div>
                                )}

                                {/* Barra Divisória Interativa Arrastável com Alça Circular */}
                                {originalImgElement && hasCutout && activeTab !== 'brush' && (
                                    <div
                                        className="absolute top-0 bottom-0 z-30 cursor-ew-resize select-none"
                                        style={{ left: `${compareSplit}%` }}
                                        onPointerDown={(e) => {
                                            e.stopPropagation();
                                            setIsDraggingSplit(true);
                                        }}
                                    >
                                        {/* Linha Divisória Vertical */}
                                        <div className="absolute top-0 bottom-0 -left-[1.5px] w-[3px] bg-white shadow-[0_0_12px_rgba(0,0,0,0.9)]" />

                                        {/* Alça Circular Interativa com Ícone < > */}
                                        <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-9 h-9 rounded-full bg-white text-slate-950 shadow-2xl flex items-center justify-center border-2 border-emerald-400 font-bold active:scale-110 hover:scale-105 transition-transform cursor-ew-resize">
                                            <ArrowLeftRight size={15} className="text-slate-900" />
                                        </div>
                                    </div>
                                )}

                                {/* Atalhos Rápidos de Divisão no Rodapé do Canvas */}
                                <div className="absolute bottom-3 z-20 flex items-center gap-1.5 bg-slate-950/80 backdrop-blur-md px-2.5 py-1 rounded-full border border-slate-800 shadow-xl">
                                    <span className="text-[10px] text-slate-400 font-bold mr-1">Divisão:</span>
                                    {[25, 50, 75].map(pct => (
                                        <button
                                            key={pct}
                                            type="button"
                                            onClick={() => setCompareSplit(pct)}
                                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold transition-all cursor-pointer ${
                                                compareSplit === pct
                                                    ? 'bg-emerald-500 text-slate-950 font-black'
                                                    : 'text-slate-300 hover:text-white bg-slate-800/80'
                                            }`}
                                        >
                                            {pct}%
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Visualização: Recorte Puro ou Segurando Original */}
                        {(viewMode === 'cutout' || viewMode === 'original' || isComparingHold) && (
                            <>
                                {isComparingHold || viewMode === 'original' ? (
                                    originalImgElement && (
                                        <img
                                            src={originalImgElement.src}
                                            alt="Original"
                                            style={{
                                                transform: `scale(${zoom}) translate(${pan.x}px, ${pan.y}px)`,
                                                maxWidth: '100%',
                                                maxHeight: '680px',
                                                objectFit: 'contain'
                                            }}
                                            className="transition-transform duration-75 shadow-2xl rounded-lg"
                                        />
                                    )
                                ) : (
                                    <canvas
                                        ref={displayCanvasRef}
                                        onPointerDown={handlePointerDown}
                                        onPointerMove={handlePointerMove}
                                        onPointerUp={handlePointerUp}
                                        style={{
                                            transform: `scale(${zoom}) translate(${pan.x}px, ${pan.y}px)`,
                                            maxWidth: '100%',
                                            maxHeight: '680px',
                                            objectFit: 'contain',
                                            cursor: activeTab === 'brush' ? 'crosshair' : 'default'
                                        }}
                                        className="transition-transform duration-75 shadow-2xl rounded-lg"
                                    />
                                )}
                            </>
                        )}

                        {/* Indicador de Carregamento com IA */}
                        {isRemoving && (
                            <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-sm flex flex-col items-center justify-center gap-3 z-40">
                                <Loader2 size={38} className="animate-spin text-emerald-400" />
                                <div className="text-center">
                                    <div className="text-sm font-black text-white">Processando Remoção de Fundo com IA</div>
                                    <div className="text-xs text-slate-400 mt-1">Blindando peças brancas internas, isolando cabelos e contornos...</div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Dica de Rodapé e Status */}
                    <div className="flex items-center justify-between text-[11px] text-slate-500 px-1 flex-wrap gap-2">
                        <span className="flex items-center gap-1.5">
                            <span className="inline-block w-2.5 h-2.5 rounded-sm bg-slate-700 border border-slate-600" />
                            <span>Padrão xadrez indica fundo transparente preservado para PNG e WEBP. Arraste o divisor para comparar.</span>
                        </span>
                        <div className="flex items-center gap-3">
                            {protectInternalWhites && (
                                <span className="text-emerald-400 font-bold flex items-center gap-1">
                                    <ShieldCheck size={13} />
                                    <span>Blindagem de Branco Ativa</span>
                                </span>
                            )}
                            {stickerOptions.enabled && (
                                <span className="text-amber-400 font-bold">✓ Borda de Figurinha Ativa</span>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
