import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
    Maximize2, 
    Sparkles, 
    Download, 
    Sliders, 
    Eye, 
    Check, 
    RefreshCw, 
    Copy, 
    Zap, 
    ArrowLeftRight, 
    Columns2, 
    Upload, 
    Image as ImageIcon, 
    FileText, 
    Shield, 
    Layers, 
    ZoomIn, 
    ZoomOut, 
    RotateCcw,
    ChevronDown,
    SlidersHorizontal,
    ToggleLeft,
    ToggleRight,
    Camera,
    Info,
    CheckCircle2,
    X,
    FileCheck,
    ExternalLink,
    Wand2,
    Palette,
    Cpu,
    ArrowUpRight
} from 'lucide-react';
import { 
    upscaleImage, 
    downloadUpscaledImage, 
    copyImageToClipboard,
    EXPORT_FORMATS, 
    UpscaleFactor, 
    ExportFormat, 
    UpscaleResult,
    UpscaleEngine,
    UpscalePreset,
    GoogleAiAnalysisResult,
    loadImage
} from '../services/upscaleService';
import type { UploadedImage } from '../types';

interface ImageUpscaleStudioProps {
    initialImageUrl?: string | null;
    initialImageName?: string | null;
    availableImages?: UploadedImage[];
    onBackToArchitect?: () => void;
    onUseAsReference?: (file: File) => void;
}

type ViewerMode = 'split' | 'side-by-side' | 'single' | 'zoom';

export const ImageUpscaleStudio: React.FC<ImageUpscaleStudioProps> = ({
    initialImageUrl,
    initialImageName,
    availableImages = [],
    onBackToArchitect,
    onUseAsReference,
}) => {
    // Imagem de entrada
    const [sourceUrl, setSourceUrl] = useState<string | null>(initialImageUrl || null);
    const [sourceName, setSourceName] = useState<string>(initialImageName || 'imagem-original');
    const [originalDimensions, setOriginalDimensions] = useState<{ width: number; height: number } | null>(null);

    // Parâmetros de Upscale & Motor de IA Google
    const [scaleFactor, setScaleFactor] = useState<UpscaleFactor>(2);
    const [engine, setEngine] = useState<UpscaleEngine>('google_ai');
    const [preset, setPreset] = useState<UpscalePreset>('general');
    const [enhancementEnabled, setEnhancementEnabled] = useState<boolean>(true);
    const [enhancementIntensity, setEnhancementIntensity] = useState<number>(70);
    const [noiseReduction, setNoiseReduction] = useState<boolean>(true);

    // Estado do processamento
    const [isProcessing, setIsProcessing] = useState<boolean>(false);
    const [upscaleResult, setUpscaleResult] = useState<UpscaleResult | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Visualizador de Imagem
    const [viewerMode, setViewerMode] = useState<ViewerMode>('split');
    const [sliderPos, setSliderPos] = useState<number>(50);
    const [isDraggingSlider, setIsDraggingSlider] = useState<boolean>(false);
    const [zoomLevel, setZoomLevel] = useState<number>(1);
    const [panPosition, setPanPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
    const [isPanning, setIsPanning] = useState<boolean>(false);
    const [panStart, setPanStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
    const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

    // Parâmetros de Exportação / Download
    const [selectedFormat, setSelectedFormat] = useState<ExportFormat>('png');
    const [jpegQuality, setJpegQuality] = useState<number>(95);
    const [customFilename, setCustomFilename] = useState<string>('');
    const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);
    const [copiedSuccess, setCopiedSuccess] = useState<boolean>(false);
    const [copiedPromptSuccess, setCopiedPromptSuccess] = useState<boolean>(false);
    const [showGoogleDetails, setShowGoogleDetails] = useState<boolean>(true);

    const sliderContainerRef = useRef<HTMLDivElement>(null);
    const fullscreenSliderRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Detecta as dimensões originais ao carregar uma imagem
    useEffect(() => {
        if (!sourceUrl) {
            setOriginalDimensions(null);
            setUpscaleResult(null);
            return;
        }

        loadImage(sourceUrl)
            .then(img => {
                setOriginalDimensions({
                    width: img.naturalWidth || img.width,
                    height: img.naturalHeight || img.height
                });
            })
            .catch(err => {
                console.error("Erro ao carregar dimensões da imagem:", err);
            });
    }, [sourceUrl]);

    // Atualiza nome padrão do arquivo
    useEffect(() => {
        if (sourceName) {
            const clean = sourceName.replace(/\.[^/.]+$/, "");
            setCustomFilename(`${clean}-upscaled-${scaleFactor}x`);
        }
    }, [sourceName, scaleFactor]);

    // Executa o Upscale com suporte a IA Google
    const handleRunUpscale = useCallback(async () => {
        if (!sourceUrl) return;

        setIsProcessing(true);
        setError(null);

        try {
            const result = await upscaleImage(sourceUrl, {
                scale: scaleFactor,
                engine,
                preset,
                enhancementEnabled,
                enhancementIntensity,
                noiseReduction,
            });

            setUpscaleResult(result);
        } catch (err: any) {
            console.error("Falha ao realizar upscale:", err);
            setError(err?.message || "Ocorreu um erro durante o upscale da imagem.");
        } finally {
            setIsProcessing(false);
        }
    }, [sourceUrl, scaleFactor, engine, preset, enhancementEnabled, enhancementIntensity, noiseReduction]);

    // Executa automaticamente quando a imagem ou parâmetros essenciais mudam
    useEffect(() => {
        if (sourceUrl) {
            handleRunUpscale();
        }
    }, [sourceUrl, scaleFactor, engine, preset, enhancementEnabled, enhancementIntensity, noiseReduction, handleRunUpscale]);

    // Upload de novo arquivo local
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            setError('Por favor, selecione um arquivo de imagem válido (PNG, JPG, WEBP, etc.).');
            return;
        }

        const reader = new FileReader();
        reader.onload = () => {
            if (typeof reader.result === 'string') {
                setSourceUrl(reader.result);
                setSourceName(file.name);
            }
        };
        reader.readAsDataURL(file);
    };

    // Controle do Slider de Comparação (Antes / Depois)
    const updateSlider = (clientX: number, container: HTMLElement | null) => {
        if (!container) return;
        const rect = container.getBoundingClientRect();
        const offsetX = Math.max(0, Math.min(clientX - rect.left, rect.width));
        const percentage = Math.round((offsetX / rect.width) * 100);
        setSliderPos(percentage);
    };

    const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>, isLarge: boolean = false) => {
        setIsDraggingSlider(true);
        (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
        updateSlider(e.clientX, isLarge ? fullscreenSliderRef.current : sliderContainerRef.current);
    };

    const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>, isLarge: boolean = false) => {
        if (!isDraggingSlider) return;
        updateSlider(e.clientX, isLarge ? fullscreenSliderRef.current : sliderContainerRef.current);
    };

    const handlePointerUp = () => {
        setIsDraggingSlider(false);
    };

    // Controle de Pan e Zoom
    const handleZoomPanStart = (e: React.MouseEvent | React.TouchEvent) => {
        if (viewerMode !== 'zoom') return;
        setIsPanning(true);
        const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
        const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
        setPanStart({ x: clientX - panPosition.x, y: clientY - panPosition.y });
    };

    const handleZoomPanMove = (e: React.MouseEvent | React.TouchEvent) => {
        if (!isPanning || viewerMode !== 'zoom') return;
        const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
        const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
        setPanPosition({
            x: clientX - panStart.x,
            y: clientY - panStart.y
        });
    };

    const handleZoomPanEnd = () => {
        setIsPanning(false);
    };

    // Download robusto e sem cancelamento prematuro
    const handleDownload = async (formatOverride?: ExportFormat) => {
        if (!upscaleResult) return;

        const targetFormat = formatOverride || selectedFormat;
        const quality = jpegQuality / 100;

        try {
            const res = await downloadUpscaledImage(
                upscaleResult.canvas,
                targetFormat,
                quality,
                customFilename
            );

            setDownloadSuccess(`Arquivo baixado com sucesso: ${res.filename}!`);
            setTimeout(() => setDownloadSuccess(null), 4500);
        } catch (err: any) {
            console.error("Falha ao baixar imagem:", err);
            setError("Não foi possível salvar o arquivo. Tente novamente.");
        }
    };

    // Copiar imagem para a área de transferência
    const handleCopy = async () => {
        if (!upscaleResult) return;
        try {
            await copyImageToClipboard(upscaleResult.canvas);
            setCopiedSuccess(true);
            setTimeout(() => setCopiedSuccess(false), 2500);
        } catch (err: any) {
            console.error("Falha ao copiar:", err);
            setError("Seu navegador não autorizou a cópia direta para o clipboard.");
        }
    };

    // Copiar prompt do Google ImageFX
    const handleCopyImageFXPrompt = async () => {
        if (!upscaleResult?.imageFXPrompt) return;
        try {
            await navigator.clipboard.writeText(upscaleResult.imageFXPrompt);
            setCopiedPromptSuccess(true);
            setTimeout(() => setCopiedPromptSuccess(false), 3000);
        } catch {
            // fallback
        }
    };

    // Usar resultado como imagem de referência no Arquiteto
    const handleSendToArchitect = () => {
        if (!upscaleResult || !onUseAsReference) return;
        upscaleResult.canvas.toBlob(blob => {
            if (!blob) return;
            const file = new File([blob], `${customFilename || 'upscaled'}.png`, { type: 'image/png' });
            onUseAsReference(file);
            onBackToArchitect?.();
        }, 'image/png');
    };

    return (
        <div className="space-y-5 animate-in fade-in duration-300">
            {/* CABEÇALHO DO MODO UPSCALE */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 backdrop-blur-md shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                    <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-cyan-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
                        <Sparkles size={22} />
                    </div>
                    <div>
                        <div className="flex items-center gap-2 flex-wrap">
                            <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                                <span>Modo Upscale & Super Resolução</span>
                                <span className="px-2 py-0.5 text-[10px] font-mono font-black rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                                    2x · 3x · 4x Ultra HD
                                </span>
                                <span className="px-2 py-0.5 text-[10px] font-black rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 flex items-center gap-1">
                                    <Sparkles size={10} className="text-blue-400" />
                                    Google AI Gratuito
                                </span>
                            </h2>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">
                            Aprimore a qualidade com a tecnologia gratuita do Google (Gemini Vision), restaure micro-texturas e exporte em qualquer formato.
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2 self-start md:self-center flex-wrap">
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleFileChange} 
                        accept="image/*" 
                        className="hidden" 
                    />
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 shadow-sm"
                        title="Enviar nova imagem do seu dispositivo"
                    >
                        <Upload size={14} className="text-emerald-400" />
                        <span>Carregar Imagem</span>
                    </button>

                    {onBackToArchitect && (
                        <button
                            type="button"
                            onClick={onBackToArchitect}
                            className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-slate-200 text-xs font-bold transition-all cursor-pointer"
                        >
                            Voltar ao Arquiteto
                        </button>
                    )}
                </div>
            </div>

            {/* SELETOR DE IMAGENS DISPONÍVEIS NO APP */}
            {availableImages.length > 0 && (
                <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-3 space-y-2">
                    <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase text-slate-400 flex items-center gap-1.5">
                            <ImageIcon size={12} className="text-emerald-400" />
                            <span>Ou escolha uma imagem do estúdio ({availableImages.length}):</span>
                        </span>
                        <span className="text-[9px] text-slate-500">Clique para selecionar para upscale</span>
                    </div>

                    <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar">
                        {availableImages.map(img => {
                            const isCurrent = sourceUrl === img.previewUrl || (img.base64Data && sourceUrl?.includes(img.base64Data));
                            const thumb = img.previewUrl || (img.base64Data ? `data:${img.mimeType || 'image/png'};base64,${img.base64Data}` : '');
                            return (
                                <button
                                    key={img.id}
                                    type="button"
                                    onClick={() => {
                                        setSourceUrl(thumb);
                                        setSourceName(img.name);
                                    }}
                                    className={`px-2 py-1.5 rounded-xl border flex items-center gap-2 shrink-0 transition-all cursor-pointer text-left ${
                                        isCurrent 
                                            ? 'bg-emerald-950/40 border-emerald-500 text-white ring-1 ring-emerald-400/50 shadow-md' 
                                            : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                                    }`}
                                >
                                    <img 
                                        src={thumb} 
                                        alt={img.name} 
                                        className="w-7 h-7 rounded-lg object-cover bg-black"
                                    />
                                    <div className="min-w-0 max-w-[120px]">
                                        <div className="text-[11px] font-bold truncate">{img.name}</div>
                                        <div className="text-[9px] text-slate-500">
                                            {isCurrent ? '✓ Selecionada' : 'Usar'}
                                        </div>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* PAINEL DE CONTROLE DE UPSCALE & APRIMORAMENTO */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                {/* COLUNA ESQUERDA: PARÂMETROS DE ESCALA E APRIMORAMENTO (4 colunas no Desktop) */}
                <div className="lg:col-span-4 space-y-4">
                    {/* CARD 0: MOTOR DE IA GOOGLE GRATUITO */}
                    <div className="bg-gradient-to-b from-blue-950/40 via-slate-900/90 to-slate-900/90 border border-blue-500/30 rounded-2xl p-4 space-y-3.5 shadow-xl">
                        <div className="flex items-center justify-between border-b border-blue-500/20 pb-2">
                            <span className="text-xs font-black uppercase text-blue-300 tracking-wider flex items-center gap-1.5">
                                <Sparkles size={14} className="text-blue-400" />
                                <span>Ferramenta Google AI (Gratuita)</span>
                            </span>
                            <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-200 border border-blue-500/30 font-bold">
                                Gemini 3.8 Flash
                            </span>
                        </div>

                        {/* Seletor de Modo de IA */}
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-300 uppercase">Escolha a Estratégia de Aprimoramento</label>
                            <div className="grid grid-cols-1 gap-2">
                                {[
                                    {
                                        id: 'google_ai' as UpscaleEngine,
                                        title: '🌟 Google IA Super-Resolução (Recomendado)',
                                        desc: 'Analisa defeitos via Gemini Vision e aplica calibração adaptativa de bordas e texturas.',
                                        badge: '100% Grátis'
                                    },
                                    {
                                        id: 'google_ai_remaster' as UpscaleEngine,
                                        title: '🔮 Google Remasterização Neural Completa',
                                        desc: 'Usa o modelo visual do Google para reconstruir detalhes perdidos e eliminar ruído.',
                                        badge: 'IA Visual'
                                    },
                                    {
                                        id: 'local_fast' as UpscaleEngine,
                                        title: '⚡ Motor Local Ultrarrápido (Bicúbico + CAS)',
                                        desc: 'Processamento instantâneo no navegador sem envio para servidores.',
                                        badge: 'Offline'
                                    }
                                ].map(item => {
                                    const isSel = engine === item.id;
                                    return (
                                        <button
                                            key={item.id}
                                            type="button"
                                            onClick={() => setEngine(item.id)}
                                            className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                                                isSel 
                                                    ? 'bg-blue-600/25 border-blue-400 text-white shadow-md ring-1 ring-blue-400/50' 
                                                    : 'bg-slate-950/70 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                                            }`}
                                        >
                                            <div className="flex items-center justify-between text-xs font-black">
                                                <span>{item.title}</span>
                                                <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${
                                                    isSel ? 'bg-blue-500 text-white' : 'bg-slate-800 text-slate-400'
                                                }`}>
                                                    {item.badge}
                                                </span>
                                            </div>
                                            <div className="text-[10px] text-slate-400 mt-1 leading-snug">
                                                {item.desc}
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Presets de Conteúdo para calibração da IA */}
                        <div className="space-y-1.5 pt-1 border-t border-slate-800">
                            <label className="text-[10px] font-bold text-slate-300 uppercase">Tipo de Imagem (Preset Especializado)</label>
                            <div className="grid grid-cols-2 gap-1.5">
                                {[
                                    { id: 'general' as UpscalePreset, label: 'Geral Inteligente', icon: '🌐' },
                                    { id: 'photo' as UpscalePreset, label: 'Foto / Retrato', icon: '👤' },
                                    { id: 'party_panel' as UpscalePreset, label: 'Painel Festa / A4', icon: '🎈' },
                                    { id: 'illustration' as UpscalePreset, label: 'Arte & Vetor', icon: '🎨' },
                                    { id: 'product' as UpscalePreset, label: 'Produto Comercial', icon: '🛍️' },
                                ].map(p => (
                                    <button
                                        key={p.id}
                                        type="button"
                                        onClick={() => setPreset(p.id)}
                                        className={`py-1.5 px-2 rounded-lg border text-[10px] font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                                            preset === p.id 
                                                ? 'bg-blue-500/20 border-blue-400 text-blue-200 font-black' 
                                                : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                                        }`}
                                    >
                                        <span>{p.icon}</span>
                                        <span className="truncate">{p.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Diagnóstico em tempo real da IA do Google */}
                        {upscaleResult?.googleAiAnalysis && (
                            <div className="bg-slate-950/90 rounded-xl p-3 border border-blue-500/30 space-y-2 text-xs">
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-black uppercase text-blue-400 flex items-center gap-1">
                                        <CheckCircle2 size={12} className="text-emerald-400" />
                                        <span>Diagnóstico Google Vision</span>
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => setShowGoogleDetails(!showGoogleDetails)}
                                        className="text-[10px] text-slate-400 hover:text-slate-200 underline cursor-pointer"
                                    >
                                        {showGoogleDetails ? 'Recolher' : 'Ver Matriz'}
                                    </button>
                                </div>
                                <p className="text-[11px] text-slate-300 leading-relaxed italic bg-blue-950/30 p-2 rounded-lg border border-blue-500/20">
                                    "{upscaleResult.googleAiAnalysis.aiDiagnosticSummary}"
                                </p>
                                {showGoogleDetails && (
                                    <div className="grid grid-cols-2 gap-1.5 pt-1 text-[10px] font-mono">
                                        <div className="bg-slate-900 p-1.5 rounded border border-slate-800 text-slate-300">
                                            Nitidez IA: <strong className="text-amber-400">{upscaleResult.googleAiAnalysis.parameters.unsharpAmount}x</strong>
                                        </div>
                                        <div className="bg-slate-900 p-1.5 rounded border border-slate-800 text-slate-300">
                                            Micro-Contraste: <strong className="text-emerald-400">R-{upscaleResult.googleAiAnalysis.parameters.contrastAdaptiveRadius}</strong>
                                        </div>
                                        <div className="bg-slate-900 p-1.5 rounded border border-slate-800 text-slate-300">
                                            Denoise: <strong className="text-cyan-400">{upscaleResult.googleAiAnalysis.parameters.denoiseTolerance}</strong>
                                        </div>
                                        <div className="bg-slate-900 p-1.5 rounded border border-slate-800 text-slate-300">
                                            Cores Vibrantes: <strong className="text-pink-400">{upscaleResult.googleAiAnalysis.parameters.colorVibrancyFactor}x</strong>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* CARD 1: ESCALA DE RESOLUÇÃO (2x ATÉ 4x) */}
                    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 space-y-3.5 shadow-lg">
                        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                            <span className="text-xs font-black uppercase text-emerald-400 tracking-wider flex items-center gap-1.5">
                                <Zap size={14} className="text-amber-400" />
                                <span>Escala de Resolução (2x até 4x)</span>
                            </span>
                            <span className="text-[10px] font-mono font-bold text-slate-400">
                                Multiplicador: {scaleFactor}x
                            </span>
                        </div>

                        {/* Botões 2x, 3x e 4x */}
                        <div className="grid grid-cols-3 gap-2">
                            {[
                                { factor: 2 as UpscaleFactor, label: '2x HD', sub: '200%', desc: '4x mais pixels' },
                                { factor: 3 as UpscaleFactor, label: '3x Ultra', sub: '300%', desc: '9x mais pixels' },
                                { factor: 4 as UpscaleFactor, label: '4x 4K', sub: '400%', desc: '16x mais pixels' },
                            ].map(btn => {
                                const isSelected = scaleFactor === btn.factor;
                                return (
                                    <button
                                        key={btn.factor}
                                        type="button"
                                        onClick={() => setScaleFactor(btn.factor)}
                                        className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer flex flex-col justify-between ${
                                            isSelected 
                                                ? 'bg-gradient-to-b from-emerald-600 to-teal-700 text-white border-emerald-400 shadow-md shadow-emerald-500/30 ring-1 ring-emerald-300' 
                                                : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                                        }`}
                                    >
                                        <div className="text-sm font-black">{btn.label}</div>
                                        <div className="text-[10px] opacity-80">{btn.sub}</div>
                                        <div className={`text-[9px] mt-1 py-0.5 rounded ${
                                            isSelected ? 'bg-black/30 text-amber-200 font-bold' : 'text-slate-600'
                                        }`}>
                                            {btn.desc}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>

                        {/* Métricas de Resolução Comparativa */}
                        {originalDimensions && (
                            <div className="bg-slate-950/80 rounded-xl p-3 border border-slate-800/80 space-y-2 text-[11px]">
                                <div className="flex items-center justify-between text-slate-400">
                                    <span>Dimensões Originais:</span>
                                    <span className="font-mono text-slate-200 font-bold">
                                        {originalDimensions.width} × {originalDimensions.height} px
                                    </span>
                                </div>
                                <div className="flex items-center justify-between text-emerald-300 font-bold border-t border-slate-800/80 pt-1.5">
                                    <span className="flex items-center gap-1">
                                        <Maximize2 size={12} className="text-emerald-400" />
                                        <span>Resolução Upscaled ({scaleFactor}x):</span>
                                    </span>
                                    <span className="font-mono text-white text-xs font-black">
                                        {originalDimensions.width * scaleFactor} × {originalDimensions.height * scaleFactor} px
                                    </span>
                                </div>
                                <div className="flex items-center justify-between text-[10px] text-slate-400 pt-0.5">
                                    <span>Área Total / Megapixels:</span>
                                    <span className="font-mono text-amber-400 font-bold">
                                        {((originalDimensions.width * scaleFactor * originalDimensions.height * scaleFactor) / 1_000_000).toFixed(2)} MP
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* CARD 2: FUNÇÃO DE ATIVAR E DESATIVAR APRIMORAMENTO */}
                    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 space-y-3.5 shadow-lg">
                        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                            <span className="text-xs font-black uppercase text-amber-400 tracking-wider flex items-center gap-1.5">
                                <Sparkles size={14} className="text-amber-400" />
                                <span>Aprimoramento de Detalhes</span>
                            </span>

                            {/* BOTAO ATIVAR / DESATIVAR APRIMORAMENTO (ON / OFF) */}
                            <button
                                type="button"
                                onClick={() => setEnhancementEnabled(!enhancementEnabled)}
                                className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase flex items-center gap-1 border transition-all cursor-pointer ${
                                    enhancementEnabled 
                                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 shadow-sm' 
                                        : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
                                }`}
                                title={enhancementEnabled ? "Clique para DESATIVAR o aprimoramento" : "Clique para ATIVAR o aprimoramento"}
                            >
                                {enhancementEnabled ? <ToggleRight size={14} className="text-emerald-400" /> : <ToggleLeft size={14} />}
                                <span>{enhancementEnabled ? 'Aprimorando: ON' : 'Aprimorando: OFF'}</span>
                            </button>
                        </div>

                        {enhancementEnabled && (
                            <div className="space-y-3 pt-2 border-t border-slate-800/80 animate-in fade-in">
                                <div className="space-y-1.5">
                                    <div className="flex items-center justify-between text-[11px]">
                                        <span className="font-bold text-slate-300">Intensidade do Realce:</span>
                                        <span className="font-mono font-black text-amber-400">{enhancementIntensity}%</span>
                                    </div>
                                    <input 
                                        type="range"
                                        min="10"
                                        max="100"
                                        step="5"
                                        value={enhancementIntensity}
                                        onChange={(e) => setEnhancementIntensity(Number(e.target.value))}
                                        className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                                    />
                                </div>

                                {/* Redução de Ruído */}
                                <div className="flex items-center justify-between pt-1">
                                    <span className="text-[11px] text-slate-300 flex items-center gap-1.5">
                                        <Shield size={12} className="text-blue-400" />
                                        <span>Filtrar Ruído JPEG em Superfícies</span>
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => setNoiseReduction(!noiseReduction)}
                                        className={`px-2 py-0.5 rounded text-[9px] font-black border transition-all ${
                                            noiseReduction 
                                                ? 'bg-blue-500/20 text-blue-300 border-blue-500/40' 
                                                : 'bg-slate-800 text-slate-500 border-slate-700'
                                        }`}
                                    >
                                        {noiseReduction ? 'ATIVO' : 'DESATIVADO'}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* CARD 3: OPÇÕES DE DOWNLOAD EM QUALQUER FORMATO */}
                    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 space-y-3.5 shadow-lg">
                        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                            <span className="text-xs font-black uppercase text-blue-400 tracking-wider flex items-center gap-1.5">
                                <Download size={14} className="text-blue-400" />
                                <span>Exportação & Modos de Arquivo</span>
                            </span>
                            <span className="text-[10px] font-mono text-slate-400">Qualquer Formato</span>
                        </div>

                        {/* Nome do Arquivo */}
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase">Nome do Arquivo ao Baixar</label>
                            <input 
                                type="text"
                                value={customFilename}
                                onChange={(e) => setCustomFilename(e.target.value)}
                                placeholder="Nome do arquivo..."
                                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white outline-none focus:border-emerald-500 font-mono"
                            />
                        </div>

                        {/* Seletor dos Formatos Disponíveis */}
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-400 uppercase">Escolha o Modo do Arquivo</label>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                                {EXPORT_FORMATS.map(fmt => {
                                    const isSelected = selectedFormat === fmt.id;
                                    return (
                                        <button
                                            key={fmt.id}
                                            type="button"
                                            disabled={!fmt.isSupported}
                                            onClick={() => setSelectedFormat(fmt.id)}
                                            className={`p-2 rounded-xl border text-left transition-all ${
                                                isSelected 
                                                    ? 'bg-blue-600/25 border-blue-500 text-white shadow-sm ring-1 ring-blue-400' 
                                                    : fmt.isSupported 
                                                    ? 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700' 
                                                    : 'bg-slate-950/40 border-slate-800 text-slate-600 opacity-40 cursor-not-allowed'
                                            }`}
                                        >
                                            <div className="text-xs font-black flex items-center justify-between">
                                                <span>{fmt.extension.toUpperCase()}</span>
                                                {isSelected && <Check size={11} className="text-blue-400" />}
                                            </div>
                                            <div className="text-[9px] text-slate-500 truncate mt-0.5">{fmt.label}</div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Qualidade JPEG / WebP */}
                        {(selectedFormat === 'jpeg' || selectedFormat === 'webp') && (
                            <div className="space-y-1 bg-slate-950/80 p-2.5 rounded-xl border border-slate-800">
                                <div className="flex items-center justify-between text-[10px]">
                                    <span className="text-slate-400 font-bold">Qualidade da Imagem ({selectedFormat.toUpperCase()}):</span>
                                    <span className="font-mono text-emerald-400 font-black">{jpegQuality}%</span>
                                </div>
                                <input 
                                    type="range"
                                    min="70"
                                    max="100"
                                    value={jpegQuality}
                                    onChange={(e) => setJpegQuality(Number(e.target.value))}
                                    className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
                                />
                            </div>
                        )}

                        {/* Botão de Download Principal */}
                        <div className="pt-1 space-y-2">
                            <button
                                type="button"
                                onClick={() => handleDownload()}
                                disabled={!upscaleResult || isProcessing}
                                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white font-black text-xs shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95 disabled:opacity-40"
                            >
                                <Download size={16} />
                                <span>Baixar Imagem em {selectedFormat.toUpperCase()} ({scaleFactor}x HD)</span>
                            </button>

                            {/* Botões Rápidos 1-Clique em PNG / JPG / Copiar */}
                            <div className="grid grid-cols-3 gap-1.5">
                                <button
                                    type="button"
                                    onClick={() => handleDownload('png')}
                                    disabled={!upscaleResult || isProcessing}
                                    className="py-1.5 px-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] font-bold border border-slate-700 transition-colors flex items-center justify-center gap-1 cursor-pointer"
                                    title="Baixar diretamente em PNG sem perdas"
                                >
                                    <span>Baixar PNG</span>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => handleDownload('jpeg')}
                                    disabled={!upscaleResult || isProcessing}
                                    className="py-1.5 px-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] font-bold border border-slate-700 transition-colors flex items-center justify-center gap-1 cursor-pointer"
                                    title="Baixar diretamente em JPG alta fidelidade"
                                >
                                    <span>Baixar JPG</span>
                                </button>

                                <button
                                    type="button"
                                    onClick={handleCopy}
                                    disabled={!upscaleResult || isProcessing}
                                    className="py-1.5 px-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] font-bold border border-slate-700 transition-colors flex items-center justify-center gap-1 cursor-pointer"
                                    title="Copiar para a Área de Transferência"
                                >
                                    {copiedSuccess ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                                    <span>{copiedSuccess ? 'Copiado!' : 'Copiar'}</span>
                                </button>
                            </div>
                        </div>

                        {/* Mensagem de Confirmação de Download */}
                        {downloadSuccess && (
                            <div className="bg-emerald-950/60 border border-emerald-500/40 rounded-xl p-2.5 flex items-center gap-2 text-xs text-emerald-300 font-bold animate-in fade-in">
                                <Check size={14} className="text-emerald-400 shrink-0" />
                                <span>{downloadSuccess}</span>
                            </div>
                        )}
                    </div>

                    {/* CARD 4: INTEGRAÇÃO DIRETA COM GOOGLE IMAGEFX */}
                    {upscaleResult?.imageFXPrompt && (
                        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-2.5">
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-black uppercase text-blue-400 flex items-center gap-1.5">
                                    <Sparkles size={12} className="text-blue-400" />
                                    <span>Google ImageFX Gratuito</span>
                                </span>
                                <a
                                    href={upscaleResult.imageFXUrl || "https://aitestkitchen.withgoogle.com/tools/image-fx"}
                                    target="_blank"
                                    rel="noreferrer noopener"
                                    className="text-[10px] text-blue-400 hover:underline flex items-center gap-1 font-bold"
                                >
                                    <span>Abrir ImageFX</span>
                                    <ExternalLink size={10} />
                                </a>
                            </div>
                            <p className="text-[10px] text-slate-400">
                                O Google AI sintetizou este prompt master otimizado para recriar/aprimorar esta imagem no Google ImageFX:
                            </p>
                            <div className="bg-slate-900 rounded-lg p-2 text-[10px] font-mono text-slate-300 max-h-20 overflow-y-auto border border-slate-800">
                                {upscaleResult.imageFXPrompt}
                            </div>
                            <button
                                type="button"
                                onClick={handleCopyImageFXPrompt}
                                className="w-full py-1.5 px-3 rounded-lg bg-blue-600/30 hover:bg-blue-600/50 text-blue-200 border border-blue-500/30 text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer"
                            >
                                {copiedPromptSuccess ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                                <span>{copiedPromptSuccess ? 'Prompt Copiado!' : 'Copiar Prompt para o Google ImageFX'}</span>
                            </button>
                        </div>
                    )}
                </div>

                {/* COLUNA DIREITA: VISUALIZADOR DE IMAGEM & COMPARADOR (8 colunas no Desktop) */}
                <div className="lg:col-span-8 space-y-3">
                    {/* BARRA DE MODOS DO VISUALIZADOR */}
                    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-2.5 flex items-center justify-between gap-2 flex-wrap shadow-md">
                        {/* Modos de Visualização */}
                        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
                            {[
                                { id: 'split' as ViewerMode, label: 'Comparador Dividido', icon: ArrowLeftRight },
                                { id: 'side-by-side' as ViewerMode, label: 'Lado a Lado', icon: Columns2 },
                                { id: 'single' as ViewerMode, label: 'Apenas Final', icon: Eye },
                                { id: 'zoom' as ViewerMode, label: 'Inspecionar Zoom', icon: ZoomIn },
                            ].map(btn => {
                                const Icon = btn.icon;
                                const isCurrent = viewerMode === btn.id;
                                return (
                                    <button
                                        key={btn.id}
                                        type="button"
                                        onClick={() => {
                                            setViewerMode(btn.id);
                                            if (btn.id !== 'zoom') setZoomLevel(1);
                                        }}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                                            isCurrent 
                                                ? 'bg-blue-600 text-white shadow-sm' 
                                                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                                        }`}
                                    >
                                        <Icon size={13} />
                                        <span className="hidden sm:inline">{btn.label}</span>
                                    </button>
                                );
                            })}
                        </div>

                        {/* Ações Rápidas no Topo do Visualizador */}
                        <div className="flex items-center gap-1.5">
                            {onUseAsReference && upscaleResult && (
                                <button
                                    type="button"
                                    onClick={handleSendToArchitect}
                                    className="px-2.5 py-1.5 rounded-lg bg-pink-500/20 text-pink-300 hover:bg-pink-500/30 border border-pink-500/30 text-[11px] font-bold flex items-center gap-1 transition cursor-pointer"
                                    title="Carregar esta imagem aprimorada como referência no Criador de Prompts"
                                >
                                    <Wand2 size={12} />
                                    <span className="hidden sm:inline">Usar no Arquiteto</span>
                                </button>
                            )}

                            <button
                                type="button"
                                onClick={() => handleRunUpscale()}
                                disabled={isProcessing || !sourceUrl}
                                className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition cursor-pointer"
                                title="Reprocessar Upscale com IA"
                            >
                                <RefreshCw size={14} className={isProcessing ? "animate-spin text-blue-400" : ""} />
                            </button>
                        </div>
                    </div>

                    {/* MOLDURA PRINCIPAL DO VISUALIZADOR */}
                    <div className="relative w-full min-h-[480px] max-h-[640px] bg-[#0c1017] rounded-3xl border border-slate-800 overflow-hidden flex items-center justify-center p-2 sm:p-4 shadow-2xl select-none">
                        {isProcessing && (
                            <div className="absolute inset-0 z-30 bg-slate-950/85 backdrop-blur-sm flex flex-col items-center justify-center gap-3">
                                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-500 via-teal-500 to-emerald-500 p-0.5 animate-spin">
                                    <div className="w-full h-full bg-slate-950 rounded-2xl flex items-center justify-center">
                                        <Sparkles size={20} className="text-blue-400" />
                                    </div>
                                </div>
                                <div className="text-center space-y-1">
                                    <div className="text-sm font-black text-white">
                                        {engine === 'google_ai' ? 'Diagnóstico & Upscale com IA do Google...' : 'Renderizando Super Resolução...'}
                                    </div>
                                    <div className="text-xs text-slate-400">
                                        Calculando interpolação {scaleFactor}x e reconstrução de nitidez
                                    </div>
                                </div>
                            </div>
                        )}

                        {error && (
                            <div className="absolute top-4 left-4 right-4 z-20 bg-rose-950/90 border border-rose-500/40 rounded-xl p-3 text-xs text-rose-200 flex items-center justify-between gap-2 shadow-lg">
                                <div className="flex items-center gap-2">
                                    <Info size={16} className="text-rose-400 shrink-0" />
                                    <span>{error}</span>
                                </div>
                                <button type="button" onClick={() => setError(null)} className="text-rose-400 hover:text-rose-200">
                                    <X size={14} />
                                </button>
                            </div>
                        )}

                        {!sourceUrl ? (
                            <div className="text-center space-y-3 p-8">
                                <div className="w-16 h-16 rounded-3xl bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto text-slate-500">
                                    <ImageIcon size={32} />
                                </div>
                                <div className="space-y-1">
                                    <h3 className="text-sm font-bold text-white">Nenhuma imagem carregada</h3>
                                    <p className="text-xs text-slate-500 max-w-sm">
                                        Faça upload de uma imagem ou escolha uma das miniaturas acima para aplicar o Upscale com a ferramenta gratuita do Google.
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="py-2 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs inline-flex items-center gap-2 shadow-lg cursor-pointer"
                                >
                                    <Upload size={14} />
                                    <span>Carregar do Dispositivo</span>
                                </button>
                            </div>
                        ) : upscaleResult ? (
                            <>
                                {/* 1. MODO SLIDER DIVIDIDO (ANTES / DEPOIS) */}
                                {viewerMode === 'split' && (
                                    <div 
                                        ref={sliderContainerRef}
                                        onPointerDown={(e) => handlePointerDown(e, false)}
                                        onPointerMove={(e) => handlePointerMove(e, false)}
                                        onPointerUp={handlePointerUp}
                                        className="relative w-full h-full max-h-[580px] flex items-center justify-center overflow-hidden cursor-ew-resize rounded-2xl touch-none"
                                    >
                                        {/* Imagem Ampliada com Aprimoramento (DEPOIS / DIREITA) */}
                                        <img 
                                            src={upscaleResult.dataUrl} 
                                            alt="Upscaled" 
                                            className="max-w-full max-h-[580px] object-contain pointer-events-none"
                                        />

                                        {/* Imagem Original Cortada (ANTES / ESQUERDA) */}
                                        <div 
                                            className="absolute inset-0 overflow-hidden flex items-center justify-center pointer-events-none"
                                            style={{ clipPath: `inset(0 ${100 - sliderPos}% 0 0)` }}
                                        >
                                            <img 
                                                src={sourceUrl} 
                                                alt="Original" 
                                                className="max-w-full max-h-[580px] object-contain"
                                            />
                                        </div>

                                        {/* Linha Divisória Interativa */}
                                        <div 
                                            className="absolute top-0 bottom-0 w-0.5 bg-white shadow-[0_0_10px_rgba(0,0,0,0.8)] z-10 pointer-events-none"
                                            style={{ left: `${sliderPos}%` }}
                                        >
                                            <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-white text-slate-950 flex items-center justify-center shadow-xl border-2 border-slate-900 pointer-events-auto cursor-grab active:cursor-grabbing">
                                                <ArrowLeftRight size={13} />
                                            </div>
                                        </div>

                                        {/* Rótulos Antes / Depois */}
                                        <div className="absolute top-3 left-3 bg-black/75 backdrop-blur-md px-2.5 py-1 rounded-lg text-[10px] font-black text-slate-300 border border-white/10 z-10 pointer-events-none">
                                            ANTES ({originalDimensions?.width}×{originalDimensions?.height})
                                        </div>
                                        <div className="absolute top-3 right-3 bg-emerald-950/85 backdrop-blur-md px-2.5 py-1 rounded-lg text-[10px] font-black text-emerald-300 border border-emerald-500/30 z-10 pointer-events-none">
                                            DEPOIS ({upscaleResult.width}×{upscaleResult.height} · {scaleFactor}x HD)
                                        </div>
                                    </div>
                                )}

                                {/* 2. MODO LADO A LADO */}
                                {viewerMode === 'side-by-side' && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full h-full max-h-[580px] items-center p-2">
                                        <div className="bg-slate-950/70 rounded-2xl p-2 border border-slate-800 flex flex-col items-center justify-center h-full max-h-[540px] relative overflow-hidden">
                                            <div className="absolute top-2 left-2 bg-black/80 px-2 py-0.5 rounded text-[10px] font-black text-slate-400">
                                                ORIGINAL ({originalDimensions?.width}×{originalDimensions?.height})
                                            </div>
                                            <img src={sourceUrl} alt="Original" className="max-w-full max-h-[480px] object-contain rounded" />
                                        </div>
                                        <div className="bg-slate-950/70 rounded-2xl p-2 border border-emerald-500/30 flex flex-col items-center justify-center h-full max-h-[540px] relative overflow-hidden">
                                            <div className="absolute top-2 left-2 bg-emerald-950/90 text-emerald-300 px-2 py-0.5 rounded text-[10px] font-black border border-emerald-500/40">
                                                APRIMORADO ({upscaleResult.width}×{upscaleResult.height})
                                            </div>
                                            <img src={upscaleResult.dataUrl} alt="Upscaled" className="max-w-full max-h-[480px] object-contain rounded" />
                                        </div>
                                    </div>
                                )}

                                {/* 3. MODO APENAS FINAL */}
                                {viewerMode === 'single' && (
                                    <div className="relative w-full h-full max-h-[580px] flex items-center justify-center overflow-hidden">
                                        <img src={upscaleResult.dataUrl} alt="Upscaled Final" className="max-w-full max-h-[580px] object-contain rounded-2xl shadow-2xl" />
                                        <div className="absolute bottom-3 right-3 bg-black/75 backdrop-blur-md px-3 py-1 rounded-xl text-xs font-mono text-emerald-400 border border-emerald-500/30">
                                            {upscaleResult.width} × {upscaleResult.height} px · {upscaleResult.megapixels} MP
                                        </div>
                                    </div>
                                )}

                                {/* 4. MODO ZOOM & PAN */}
                                {viewerMode === 'zoom' && (
                                    <div 
                                        onMouseDown={handleZoomPanStart}
                                        onMouseMove={handleZoomPanMove}
                                        onMouseUp={handleZoomPanEnd}
                                        onTouchStart={handleZoomPanStart}
                                        onTouchMove={handleZoomPanMove}
                                        onTouchEnd={handleZoomPanEnd}
                                        className="relative w-full h-full max-h-[580px] flex items-center justify-center overflow-hidden cursor-grab active:cursor-grabbing rounded-2xl bg-black"
                                    >
                                        <div 
                                            style={{
                                                transform: `translate(${panPosition.x}px, ${panPosition.y}px) scale(${zoomLevel})`,
                                                transition: isPanning ? 'none' : 'transform 0.15s ease-out'
                                            }}
                                            className="pointer-events-none"
                                        >
                                            <img src={upscaleResult.dataUrl} alt="Zoom View" className="max-w-full max-h-[560px] object-contain" />
                                        </div>

                                        {/* Controles de Zoom */}
                                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-slate-900/90 border border-slate-700 backdrop-blur-md px-3 py-1.5 rounded-full flex items-center gap-3 shadow-xl z-20">
                                            <button
                                                type="button"
                                                onClick={() => setZoomLevel(prev => Math.max(1, prev - 0.5))}
                                                className="p-1 rounded text-slate-300 hover:text-white cursor-pointer"
                                            >
                                                <ZoomOut size={16} />
                                            </button>
                                            <span className="text-xs font-mono font-bold text-white min-w-[50px] text-center">
                                                {Math.round(zoomLevel * 100)}%
                                            </span>
                                            <button
                                                type="button"
                                                onClick={() => setZoomLevel(prev => Math.min(4, prev + 0.5))}
                                                className="p-1 rounded text-slate-300 hover:text-white cursor-pointer"
                                            >
                                                <ZoomIn size={16} />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => { setZoomLevel(1); setPanPosition({ x: 0, y: 0 }); }}
                                                className="text-[10px] font-bold text-slate-400 hover:text-slate-200 pl-1 border-l border-slate-700 cursor-pointer"
                                            >
                                                Resetar
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </>
                        ) : null}
                    </div>
                </div>
            </div>
        </div>
    );
};
