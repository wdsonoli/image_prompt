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
    FileCheck
} from 'lucide-react';
import { 
    upscaleImage, 
    downloadUpscaledImage, 
    copyImageToClipboard,
    EXPORT_FORMATS, 
    UpscaleFactor, 
    ExportFormat, 
    UpscaleResult,
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

    // Parâmetros de Upscale
    const [scaleFactor, setScaleFactor] = useState<UpscaleFactor>(2);
    const [enhancementEnabled, setEnhancementEnabled] = useState<boolean>(true);
    const [enhancementIntensity, setEnhancementIntensity] = useState<number>(65);
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

    // Executa o Upscale
    const handleRunUpscale = useCallback(async () => {
        if (!sourceUrl) return;

        setIsProcessing(true);
        setError(null);

        try {
            const result = await upscaleImage(sourceUrl, {
                scale: scaleFactor,
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
    }, [sourceUrl, scaleFactor, enhancementEnabled, enhancementIntensity, noiseReduction]);

    // Executa automaticamente quando a imagem ou parâmetros essenciais mudam
    useEffect(() => {
        if (sourceUrl) {
            handleRunUpscale();
        }
    }, [sourceUrl, scaleFactor, enhancementEnabled, enhancementIntensity, noiseReduction, handleRunUpscale]);

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

    // Download em qualquer modo de arquivo
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

            setDownloadSuccess(`Baixado com sucesso como ${res.filename}!`);
            setTimeout(() => setDownloadSuccess(null), 3500);
        } catch (err: any) {
            console.error("Falha ao baixar:", err);
            setError("Não foi possível gerar o arquivo para download.");
        }
    };

    // Copiar imagem para o clipboard
    const handleCopy = async () => {
        if (!upscaleResult) return;
        try {
            await copyImageToClipboard(upscaleResult.canvas);
            setCopiedSuccess(true);
            setTimeout(() => setCopiedSuccess(false), 2500);
        } catch (err: any) {
            console.error("Erro ao copiar:", err);
            setError("Seu navegador não autorizou a cópia direta de imagem para a área de transferência.");
        }
    };

    return (
        <div className="space-y-5 animate-in fade-in duration-300">
            {/* CABEÇALHO DO ESTÚDIO DE UPSCALE */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 backdrop-blur-md shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                    <div className="flex items-center gap-2.5 flex-wrap">
                        <div className="p-2 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl text-white shadow-lg shadow-emerald-500/20">
                            <Maximize2 size={18} />
                        </div>
                        <div>
                            <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                                <span>Modo Upscale Image & Super Resolução</span>
                                <span className="px-2 py-0.5 text-[10px] font-mono font-black rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                                    2x · 3x · 4x Ultra HD
                                </span>
                            </h2>
                            <p className="text-xs text-slate-400">
                                Amplie imagens em até 400% com motor de aprimoramento adaptativo, comparador antes/depois e exportação em qualquer formato.
                            </p>
                        </div>
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
                            <span>Ou escolha uma imagem já carregada no estúdio ({availableImages.length}):</span>
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
                                { factor: 2 as UpscaleFactor, label: '2x HD', sub: '200% de escala', desc: '4x mais pixels' },
                                { factor: 3 as UpscaleFactor, label: '3x Ultra', sub: '300% de escala', desc: '9x mais pixels' },
                                { factor: 4 as UpscaleFactor, label: '4x 4K', sub: '400% de escala', desc: '16x mais pixels' },
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
                                        <div className={`text-[9px] ${isSelected ? 'text-emerald-100' : 'text-slate-500'} mt-0.5`}>
                                            {btn.sub}
                                        </div>
                                        <div className={`text-[8px] font-mono mt-1 px-1 py-0.5 rounded ${
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

                        <p className="text-[11px] text-slate-400 leading-relaxed">
                            {enhancementEnabled ? (
                                <span className="text-emerald-300">
                                    ✓ <strong>Aprimoramento ATIVO:</strong> Aplica realce adaptativo de contraste, nitidez de bordas, micro-texturas de pele/tecidos e remoção de borrões.
                                </span>
                            ) : (
                                <span className="text-slate-400">
                                    ✕ <strong>Aprimoramento DESATIVADO:</strong> Interpolação neutra direta que preserva exatamente a suavidade e pixels originais sem filtros de nitidez.
                                </span>
                            )}
                        </p>

                        {/* CONTROLES AVANÇADOS QUANDO O APRIMORAMENTO ESTÁ ATIVADO */}
                        {enhancementEnabled && (
                            <div className="space-y-3 pt-2 border-t border-slate-800/80 animate-in fade-in">
                                <div className="space-y-1.5">
                                    <div className="flex items-center justify-between text-[11px]">
                                        <span className="font-bold text-slate-300">Intensidade do Aprimoramento:</span>
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
                                    <div className="flex items-center justify-between text-[9px] text-slate-500 font-mono">
                                        <span>Suave (25%)</span>
                                        <span className="text-amber-400 font-bold">Equilibrado (65%)</span>
                                        <span>Ultra Nítido (90%)</span>
                                    </div>
                                </div>

                                {/* Presets Rápidos de Intensidade */}
                                <div className="grid grid-cols-3 gap-1.5">
                                    {[
                                        { label: 'Suave', value: 35 },
                                        { label: 'Equilibrado', value: 65 },
                                        { label: 'Máximo', value: 90 },
                                    ].map(preset => (
                                        <button
                                            key={preset.value}
                                            type="button"
                                            onClick={() => setEnhancementIntensity(preset.value)}
                                            className={`py-1 text-[10px] font-bold rounded-lg border transition-all ${
                                                enhancementIntensity === preset.value 
                                                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' 
                                                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
                                            }`}
                                        >
                                            {preset.label}
                                        </button>
                                    ))}
                                </div>

                                {/* Redução de Ruído */}
                                <div className="flex items-center justify-between pt-1">
                                    <span className="text-[11px] text-slate-300 flex items-center gap-1.5">
                                        <Shield size={12} className="text-blue-400" />
                                        <span>Filtrar Ruído em Superfícies</span>
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
                                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white font-black text-xs shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95 disabled:opacity-40"
                            >
                                <Download size={15} />
                                <span>Baixar Imagem em {selectedFormat.toUpperCase()} ({scaleFactor}x)</span>
                            </button>

                            {/* Botões Rápidos 1-Clique em PNG / JPG / Copiar */}
                            <div className="grid grid-cols-3 gap-1.5">
                                <button
                                    type="button"
                                    onClick={() => handleDownload('png')}
                                    disabled={!upscaleResult || isProcessing}
                                    className="py-1.5 px-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] font-bold border border-slate-700 transition-colors flex items-center justify-center gap-1"
                                    title="Baixar diretamente em PNG sem perdas"
                                >
                                    <span>Baixar PNG</span>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => handleDownload('jpeg')}
                                    disabled={!upscaleResult || isProcessing}
                                    className="py-1.5 px-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] font-bold border border-slate-700 transition-colors flex items-center justify-center gap-1"
                                    title="Baixar diretamente em JPG alta fidelidade"
                                >
                                    <span>Baixar JPG</span>
                                </button>

                                <button
                                    type="button"
                                    onClick={handleCopy}
                                    disabled={!upscaleResult || isProcessing}
                                    className="py-1.5 px-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] font-bold border border-slate-700 transition-colors flex items-center justify-center gap-1"
                                    title="Copiar imagem para área de transferência"
                                >
                                    {copiedSuccess ? <Check size={11} className="text-emerald-400" /> : <Copy size={11} />}
                                    <span>{copiedSuccess ? 'Copiado!' : 'Copiar'}</span>
                                </button>
                            </div>
                        </div>

                        {downloadSuccess && (
                            <div className="p-2 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-1.5 font-bold animate-in fade-in">
                                <CheckCircle2 size={13} className="text-emerald-400 shrink-0" />
                                <span>{downloadSuccess}</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* COLUNA DIREITA: VISUALIZADOR DE IMAGEM INTERATIVO (8 colunas no Desktop) */}
                <div className="lg:col-span-8 space-y-3">
                    {/* BARRA DE FERRAMENTAS DO VISUALIZADOR */}
                    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3 flex flex-wrap items-center justify-between gap-2.5 backdrop-blur-md shadow-md">
                        <div className="flex items-center gap-1.5">
                            <Eye size={15} className="text-emerald-400" />
                            <span className="text-xs font-black uppercase text-slate-200">
                                Visualizador de Imagem
                            </span>
                            {upscaleResult && (
                                <span className="text-[10px] font-mono text-slate-400 bg-slate-950 px-2 py-0.5 rounded-full border border-slate-800">
                                    {upscaleResult.width} × {upscaleResult.height} px ({upscaleResult.processingTimeMs}ms)
                                </span>
                            )}
                        </div>

                        {/* Modos do Visualizador: Split Slider | Lado a Lado | Zoom 100% */}
                        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
                            <button
                                type="button"
                                onClick={() => setViewerMode('split')}
                                className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                                    viewerMode === 'split' 
                                        ? 'bg-emerald-600 text-white shadow-sm' 
                                        : 'text-slate-400 hover:text-slate-200'
                                }`}
                                title="Comparador Slider Antes / Depois"
                            >
                                <ArrowLeftRight size={13} />
                                <span className="hidden sm:inline">Antes / Depois</span>
                                <span className="sm:hidden">Slider</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => setViewerMode('side-by-side')}
                                className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                                    viewerMode === 'side-by-side' 
                                        ? 'bg-emerald-600 text-white shadow-sm' 
                                        : 'text-slate-400 hover:text-slate-200'
                                }`}
                                title="Visualização Lado a Lado"
                            >
                                <Columns2 size={13} />
                                <span className="hidden sm:inline">Lado a Lado</span>
                                <span className="sm:hidden">Lado</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => setViewerMode('zoom')}
                                className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                                    viewerMode === 'zoom' 
                                        ? 'bg-emerald-600 text-white shadow-sm' 
                                        : 'text-slate-400 hover:text-slate-200'
                                }`}
                                title="Modo Zoom & Lupa de Detalhes"
                            >
                                <ZoomIn size={13} />
                                <span>Zoom</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => setIsFullscreen(true)}
                                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors ml-1"
                                title="Abrir em Tela Cheia"
                            >
                                <Maximize2 size={14} />
                            </button>
                        </div>
                    </div>

                    {/* ÁREA PRINCIPAL DO VISUALIZADOR */}
                    <div className="bg-slate-950 rounded-2xl border border-slate-800 p-2 sm:p-3 shadow-2xl relative min-h-[420px] flex items-center justify-center overflow-hidden">
                        {isProcessing && (
                            <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm z-30 flex flex-col items-center justify-center gap-3">
                                <RefreshCw size={28} className="animate-spin text-emerald-400" />
                                <div className="text-center">
                                    <div className="text-xs font-black text-white">
                                        Processando Super Resolução {scaleFactor}x...
                                    </div>
                                    <div className="text-[10px] text-slate-400 mt-0.5">
                                        {enhancementEnabled ? "Aplicando Contrast-Adaptive Sharpening e micro-texturas" : "Realizando interpolação direta de pixels"}
                                    </div>
                                </div>
                            </div>
                        )}

                        {!sourceUrl ? (
                            <div className="text-center p-8 space-y-3">
                                <ImageIcon size={40} className="text-slate-600 mx-auto" />
                                <div className="text-xs text-slate-400">Nenhuma imagem carregada no momento.</div>
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl"
                                >
                                    Carregar Imagem para Upscale
                                </button>
                            </div>
                        ) : viewerMode === 'split' ? (
                            /* MODO 1: COMPARADOR SLIDER ANTES / DEPOIS */
                            <div 
                                ref={sliderContainerRef}
                                onPointerDown={(e) => handlePointerDown(e, false)}
                                onPointerMove={(e) => handlePointerMove(e, false)}
                                onPointerUp={handlePointerUp}
                                onPointerCancel={handlePointerUp}
                                className="relative w-full h-[450px] sm:h-[540px] rounded-xl overflow-hidden select-none cursor-ew-resize bg-black touch-none border border-slate-800 shadow-inner"
                            >
                                {/* Imagem Upscaled (Fundo / Direita) */}
                                <img 
                                    src={upscaleResult ? upscaleResult.dataUrl : sourceUrl} 
                                    alt="Upscaled content" 
                                    className="absolute inset-0 w-full h-full object-contain pointer-events-none"
                                />

                                {/* Imagem Original (Overlay / Esquerda cortada) */}
                                <div 
                                    className="absolute inset-0 overflow-hidden pointer-events-none"
                                    style={{ clipPath: `inset(0 ${100 - sliderPos}% 0 0)` }}
                                >
                                    <img 
                                        src={sourceUrl} 
                                        alt="Original content" 
                                        className="absolute inset-0 w-full h-full object-contain pointer-events-none"
                                    />
                                </div>

                                {/* Linha Divisória e Alça Central */}
                                <div 
                                    className="absolute top-0 bottom-0 w-0.5 bg-white shadow-[0_0_12px_rgba(0,0,0,0.9)] z-20 pointer-events-none"
                                    style={{ left: `${sliderPos}%` }}
                                >
                                    <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-white text-slate-950 shadow-2xl flex items-center justify-center border-2 border-emerald-500 font-bold">
                                        <ArrowLeftRight size={14} className="text-emerald-700" />
                                    </div>
                                </div>

                                {/* Etiquetas Flutuantes */}
                                <div className="absolute top-3 left-3 px-2 py-1 bg-black/80 backdrop-blur-md rounded-lg text-[10px] font-mono text-slate-300 border border-white/20 z-10 pointer-events-none">
                                    ORIGINAL (1x)
                                </div>
                                <div className="absolute top-3 right-3 px-2 py-1 bg-emerald-950/80 backdrop-blur-md rounded-lg text-[10px] font-mono text-emerald-300 border border-emerald-500/40 z-10 pointer-events-none">
                                    UPSCALE {scaleFactor}x {enhancementEnabled ? '✦ APRIMORADO' : ''}
                                </div>

                                {/* Dica de Uso no Rodapé */}
                                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-slate-950/80 backdrop-blur-md rounded-full text-[9px] font-mono text-slate-400 border border-slate-700 pointer-events-none">
                                    Arraste para comparar nitidez e resolução
                                </div>
                            </div>
                        ) : viewerMode === 'side-by-side' ? (
                            /* MODO 2: LADO A LADO */
                            <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-3 h-[450px] sm:h-[540px]">
                                <div className="relative rounded-xl overflow-hidden bg-black border border-slate-800 flex flex-col items-center justify-center">
                                    <span className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/80 text-[10px] font-mono text-slate-300 border border-slate-700 z-10">
                                        Original {originalDimensions ? `(${originalDimensions.width}x${originalDimensions.height})` : ''}
                                    </span>
                                    <img 
                                        src={sourceUrl} 
                                        alt="Original" 
                                        className="w-full h-full object-contain" 
                                    />
                                </div>
                                <div className="relative rounded-xl overflow-hidden bg-black border border-emerald-500/40 flex flex-col items-center justify-center shadow-lg shadow-emerald-500/10">
                                    <span className="absolute top-2 left-2 px-2 py-0.5 rounded bg-emerald-950/90 text-[10px] font-mono text-emerald-300 border border-emerald-500/40 z-10">
                                        Upscaled {scaleFactor}x {upscaleResult ? `(${upscaleResult.width}x${upscaleResult.height})` : ''}
                                    </span>
                                    <img 
                                        src={upscaleResult ? upscaleResult.dataUrl : sourceUrl} 
                                        alt="Upscaled" 
                                        className="w-full h-full object-contain" 
                                    />
                                </div>
                            </div>
                        ) : (
                            /* MODO 3: ZOOM & PAN */
                            <div 
                                onMouseDown={handleZoomPanStart}
                                onMouseMove={handleZoomPanMove}
                                onMouseUp={handleZoomPanEnd}
                                onMouseLeave={handleZoomPanEnd}
                                onTouchStart={handleZoomPanStart}
                                onTouchMove={handleZoomPanMove}
                                onTouchEnd={handleZoomPanEnd}
                                className={`relative w-full h-[450px] sm:h-[540px] rounded-xl overflow-hidden bg-black border border-slate-800 flex items-center justify-center select-none ${
                                    isPanning ? 'cursor-grabbing' : 'cursor-grab'
                                }`}
                            >
                                <img 
                                    src={upscaleResult ? upscaleResult.dataUrl : sourceUrl} 
                                    alt="Zoom preview"
                                    style={{
                                        transform: `scale(${zoomLevel}) translate(${panPosition.x / zoomLevel}px, ${panPosition.y / zoomLevel}px)`,
                                        transition: isPanning ? 'none' : 'transform 0.15s ease-out'
                                    }}
                                    className="max-w-full max-h-full object-contain pointer-events-none"
                                />

                                {/* Controles de Zoom Flutuantes */}
                                <div className="absolute bottom-3 right-3 flex items-center gap-1.5 bg-slate-900/90 backdrop-blur-md p-1 rounded-xl border border-slate-700 shadow-xl z-20">
                                    <button
                                        type="button"
                                        onClick={() => setZoomLevel(prev => Math.max(1, prev - 0.5))}
                                        className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                                        title="Diminuir Zoom"
                                    >
                                        <ZoomOut size={14} />
                                    </button>
                                    <span className="text-[10px] font-mono font-bold text-emerald-400 px-1">
                                        {Math.round(zoomLevel * 100)}%
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => setZoomLevel(prev => Math.min(4, prev + 0.5))}
                                        className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                                        title="Aumentar Zoom"
                                    >
                                        <ZoomIn size={14} />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setZoomLevel(1);
                                            setPanPosition({ x: 0, y: 0 });
                                        }}
                                        className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                                        title="Resetar Zoom"
                                    >
                                        <RotateCcw size={13} />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* MODAL FULLSCREEN */}
            {isFullscreen && (
                <div className="fixed inset-0 z-50 bg-black/95 flex flex-col p-4 backdrop-blur-md animate-in fade-in">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                        <div className="flex items-center gap-2">
                            <Maximize2 size={16} className="text-emerald-400" />
                            <span className="text-sm font-black text-white">Visualizador em Tela Cheia ({scaleFactor}x Upscale)</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={() => handleDownload()}
                                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5"
                            >
                                <Download size={13} />
                                <span>Baixar {selectedFormat.toUpperCase()}</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setIsFullscreen(false)}
                                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white"
                                title="Fechar Tela Cheia (ESC)"
                            >
                                <X size={16} />
                            </button>
                        </div>
                    </div>

                    <div className="flex-1 flex items-center justify-center p-2 min-h-0">
                        <div 
                            ref={fullscreenSliderRef}
                            onPointerDown={(e) => handlePointerDown(e, true)}
                            onPointerMove={(e) => handlePointerMove(e, true)}
                            onPointerUp={handlePointerUp}
                            onPointerCancel={handlePointerUp}
                            className="relative w-full h-[80vh] max-w-6xl rounded-2xl overflow-hidden select-none cursor-ew-resize bg-black touch-none border border-slate-800 shadow-2xl"
                        >
                            <img 
                                src={upscaleResult ? upscaleResult.dataUrl : sourceUrl || ''} 
                                alt="Upscaled" 
                                className="absolute inset-0 w-full h-full object-contain pointer-events-none"
                            />
                            <div 
                                className="absolute inset-0 overflow-hidden pointer-events-none"
                                style={{ clipPath: `inset(0 ${100 - sliderPos}% 0 0)` }}
                            >
                                <img 
                                    src={sourceUrl || ''} 
                                    alt="Original" 
                                    className="absolute inset-0 w-full h-full object-contain pointer-events-none"
                                />
                            </div>
                            <div 
                                className="absolute top-0 bottom-0 w-0.5 bg-white shadow-[0_0_15px_rgba(0,0,0,1)] z-20 pointer-events-none"
                                style={{ left: `${sliderPos}%` }}
                            >
                                <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-9 h-9 rounded-full bg-white text-slate-950 shadow-2xl flex items-center justify-center border-2 border-emerald-500 font-bold">
                                    <ArrowLeftRight size={15} className="text-emerald-700" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
