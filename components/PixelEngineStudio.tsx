// components/PixelEngineStudio.tsx
// Estúdio Pixel Engine - Pixel Art no Tamanho Exato
// Baseado no modelo pixelengine.ai (16x16 até 128x128, formatos livres 4:1, paletas retro e comparação 4-em-1)

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
    Grid,
    Sliders,
    Eye,
    Check,
    Download,
    Sparkles,
    Copy,
    RotateCw,
    ZoomIn,
    ZoomOut,
    Palette,
    Layers,
    FileText,
    ArrowLeft,
    Share2,
    RefreshCw,
    Info,
    HelpCircle,
    Maximize2,
    Image as ImageIcon,
    Plus,
    Square
} from 'lucide-react';
import { UploadedImage } from '../types';
import {
    PIXEL_SIZE_PRESETS,
    PIXEL_PALETTES,
    PIXEL_ENGINE_SAMPLES,
    PixelSizePreset,
    PixelPalette,
    PixelEngineConfig,
    DEFAULT_PIXEL_ENGINE_CONFIG,
    processImageToPixelArt,
    generateComparisonShowcase,
    buildPixelEnginePrompt,
    exportScaledPixelCanvas,
    ProcessedPixelResult
} from '../services/pixelEngineService';
import { downloadBlob, downloadFile } from '../utils/downloadHelper';

interface PixelEngineStudioProps {
    availableImages: UploadedImage[];
    initialImageUrl?: string | null;
    initialImageName?: string | null;
    onBackToArchitect: () => void;
    onApplyPrompt?: (prompt: string) => void;
    onOpenUpscale?: (url: string, name: string) => void;
}

export const PixelEngineStudio: React.FC<PixelEngineStudioProps> = ({
    availableImages,
    initialImageUrl,
    initialImageName,
    onBackToArchitect,
    onApplyPrompt,
    onOpenUpscale
}) => {
    // Imagem ativa selecionada
    const [selectedImageUrl, setSelectedImageUrl] = useState<string>(() => {
        if (initialImageUrl) return initialImageUrl;
        if (availableImages.length > 0) {
            return availableImages[0].previewUrl || (availableImages[0].base64Data ? `data:${availableImages[0].mimeType || 'image/png'};base64,${availableImages[0].base64Data}` : '');
        }
        return PIXEL_ENGINE_SAMPLES[0].svgDataUrl;
    });

    const [selectedImageName, setSelectedImageName] = useState<string>(initialImageName || 'Raposa Astuta');

    // Configuração do Pixel Engine
    const [config, setConfig] = useState<PixelEngineConfig>(DEFAULT_PIXEL_ENGINE_CONFIG);
    const [activePresetId, setActivePresetId] = useState<string>('32x32');
    const [tabCategory, setTabCategory] = useState<'quadrado' | 'livre' | 'custom'>('quadrado');

    // Estado de processamento
    const [loadedSourceImg, setLoadedSourceImg] = useState<HTMLImageElement | null>(null);
    const [pixelResult, setPixelResult] = useState<ProcessedPixelResult | null>(null);
    const [isProcessing, setIsProcessing] = useState<boolean>(false);

    // Modo Showcase 4-em-1 (exatamente como o topo da imagem: 16, 32, 64, 128)
    const [showcaseMode, setShowcaseMode] = useState<boolean>(false);
    const [showcaseDataUrl, setShowcaseDataUrl] = useState<string | null>(null);
    const [isGeneratingShowcase, setIsGeneratingShowcase] = useState<boolean>(false);

    // Prompt gerado
    const [promptCopied, setPromptCopied] = useState<boolean>(false);
    const [downloadToast, setDownloadToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const canvasPreviewRef = useRef<HTMLCanvasElement>(null);

    // Carrega a imagem nativa
    useEffect(() => {
        if (!selectedImageUrl) {
            setLoadedSourceImg(null);
            return;
        }

        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
            setLoadedSourceImg(img);
        };
        img.onerror = () => {
            console.error('Falha ao carregar imagem para Pixel Engine');
        };
        img.src = selectedImageUrl;
    }, [selectedImageUrl]);

    // Executa a conversão para Pixel Art sempre que a imagem ou configurações mudarem
    const triggerPixelProcessing = useCallback(async () => {
        if (!loadedSourceImg) return;
        setIsProcessing(true);
        try {
            const res = await processImageToPixelArt(loadedSourceImg, config);
            setPixelResult(res);
        } catch (err) {
            console.error('Erro no processamento do Pixel Engine:', err);
        } finally {
            setIsProcessing(false);
        }
    }, [loadedSourceImg, config]);

    useEffect(() => {
        triggerPixelProcessing();
    }, [triggerPixelProcessing]);

    // Atualiza Showcase 4-em-1 quando solicitado ou quando a imagem/paleta mudar se o modo estiver ativo
    useEffect(() => {
        if (showcaseMode && loadedSourceImg) {
            setIsGeneratingShowcase(true);
            generateComparisonShowcase(loadedSourceImg, config.paletteId)
                .then(url => setShowcaseDataUrl(url))
                .catch(err => console.error(err))
                .finally(() => setIsGeneratingShowcase(false));
        }
    }, [showcaseMode, loadedSourceImg, config.paletteId]);

    // Aplicação de Preset de Tamanho
    const handleSelectPreset = (preset: PixelSizePreset) => {
        setActivePresetId(preset.id);
        setConfig(prev => ({
            ...prev,
            targetWidth: preset.width,
            targetHeight: preset.height,
            displayZoom: preset.width <= 32 ? 10 : preset.width <= 64 ? 6 : 4
        }));
    };

    // Prompt Mestre formatado estilo pe_image_v1
    const generatedPrompt = useMemo(() => {
        const pal = PIXEL_PALETTES.find(p => p.id === config.paletteId)?.name || 'True Color';
        return buildPixelEnginePrompt(selectedImageName, config.targetWidth, config.targetHeight, pal);
    }, [selectedImageName, config.targetWidth, config.targetHeight, config.paletteId]);

    // Copiar Prompt
    const handleCopyPrompt = () => {
        navigator.clipboard.writeText(generatedPrompt);
        setPromptCopied(true);
        setTimeout(() => setPromptCopied(false), 2000);
    };

    // Download do Sprite Nativo
    const handleDownloadNative = () => {
        if (!pixelResult?.dataUrl) return;
        downloadFile(
            pixelResult.dataUrl,
            `pixel-engine-${config.targetWidth}x${config.targetHeight}-${selectedImageName.toLowerCase().replace(/\s+/g, '-')}.png`,
            { mimeType: 'image/png' }
        );
        showToast('Sprite nativo baixado com sucesso!');
    };

    // Download em Alta Resolução (Nearest Neighbor sem borrão)
    const handleDownloadUpscaled = async (factor: number) => {
        if (!pixelResult?.dataUrl) return;
        try {
            const upscaledUrl = await exportScaledPixelCanvas(
                pixelResult.dataUrl,
                config.targetWidth,
                config.targetHeight,
                factor
            );
            downloadFile(
                upscaledUrl,
                `pixel-engine-${config.targetWidth * factor}x${config.targetHeight * factor}-hd-${selectedImageName.toLowerCase().replace(/\s+/g, '-')}.png`,
                { mimeType: 'image/png' }
            );
            showToast(`Sprite ampliado ${factor}x baixado em alta definição!`);
        } catch (err) {
            console.error(err);
            showToast('Erro ao exportar imagem ampliada.', 'error');
        }
    };

    // Download do Showcase Completo 4-em-1
    const handleDownloadShowcase = () => {
        if (!showcaseDataUrl) return;
        downloadFile(
            showcaseDataUrl,
            `pixel-engine-showcase-16-128-${selectedImageName.toLowerCase().replace(/\s+/g, '-')}.png`,
            { mimeType: 'image/png' }
        );
        showToast('Showcase comparativo 4-em-1 baixado!');
    };

    const showToast = (message: string, type: 'success' | 'error' = 'success') => {
        setDownloadToast({ message, type });
        setTimeout(() => setDownloadToast(null), 3000);
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (ev) => {
                const url = ev.target?.result as string;
                setSelectedImageUrl(url);
                setSelectedImageName(file.name.replace(/\.[^/.]+$/, ''));
            };
            reader.readAsDataURL(file);
        }
    };

    // Filtros de presets de acordo com a aba
    const filteredPresets = useMemo(() => {
        if (tabCategory === 'quadrado') {
            return PIXEL_SIZE_PRESETS.filter(p => p.category === 'quadrado');
        }
        if (tabCategory === 'livre') {
            return PIXEL_SIZE_PRESETS.filter(p => p.category !== 'quadrado');
        }
        return [];
    }, [tabCategory]);

    const currentPalette = useMemo(() => {
        return PIXEL_PALETTES.find(p => p.id === config.paletteId) || PIXEL_PALETTES[0];
    }, [config.paletteId]);

    return (
        <div className="space-y-6">
            {/* TOAST FEEDBACK */}
            {downloadToast && (
                <div className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 text-xs font-bold shadow-xl animate-in fade-in slide-in-from-top duration-300 ${
                    downloadToast.type === 'success'
                        ? 'bg-emerald-950/90 border-emerald-500/40 text-emerald-200'
                        : 'bg-rose-950/90 border-rose-500/40 text-rose-200'
                }`}>
                    <div className="flex items-center gap-2">
                        {downloadToast.type === 'success' ? <Check size={16} className="text-emerald-400" /> : <Info size={16} className="text-rose-400" />}
                        <span>{downloadToast.message}</span>
                    </div>
                    <button
                        type="button"
                        onClick={() => setDownloadToast(null)}
                        className="opacity-70 hover:opacity-100 text-[10px] uppercase font-black"
                    >
                        Fechar
                    </button>
                </div>
            )}

            {/* CABEÇALHO DO PIXEL ENGINE (Inspirado na imagem pixelengine.ai) */}
            <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-2xl relative overflow-hidden backdrop-blur-xl">
                <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-indigo-500/10 via-cyan-500/10 to-amber-500/10 rounded-full blur-3xl pointer-events-none" />

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
                            <span className="px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/40 font-mono">
                                PIXEL ENGINE IMAGE · pe_image_v1
                            </span>
                            <span className="px-2.5 py-0.5 text-[10px] font-bold rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                                16–128 px a side
                            </span>
                            <span className="px-2.5 py-0.5 text-[10px] font-bold rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                                Formatos até 4:1
                            </span>
                        </div>

                        <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2">
                            <span>Pixel Engine</span>
                            <span className="text-cyan-400 text-lg font-mono font-normal">:: Pixel Art no Tamanho Exato</span>
                        </h2>

                        <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
                            Converta qualquer imagem ou crie sprites retro com a resolução exata que você pedir (16×16, 32×32, 64×64, 128×128 ou proporções livres até 4:1) com fundo transparente e paletas clássicas.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 sm:gap-3 bg-slate-900/90 border border-slate-800 rounded-2xl p-3.5 shadow-lg">
                        <button
                            type="button"
                            onClick={() => setShowcaseMode(prev => !prev)}
                            className={`px-3.5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition cursor-pointer shadow-md ${
                                showcaseMode
                                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white ring-2 ring-cyan-400 font-black'
                                    : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                            }`}
                        >
                            <Grid size={15} />
                            <span>Showcase 4-em-1 (16–128px)</span>
                        </button>

                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
                        >
                            <RotateCw size={14} />
                            <span>Subir Outra Foto</span>
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
            </div>

            {/* SELEÇÃO DE SPRITES DE AMOSTRA (FOX, WIZARD, DRAGON, TOWER, SWORD) */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 backdrop-blur-md">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2">
                        <ImageIcon size={16} className="text-cyan-400" />
                        <span className="text-xs font-bold text-white uppercase tracking-wider">Amostras da Referência:</span>
                        <span className="text-xs text-slate-400">Clique para testar instantaneamente</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-slate-400">Ativo:</span>
                        <span className="text-xs font-black text-cyan-300 truncate max-w-xs">{selectedImageName}</span>
                    </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5">
                    {PIXEL_ENGINE_SAMPLES.map(sample => {
                        const isSelected = selectedImageName === sample.name;
                        return (
                            <button
                                key={sample.id}
                                type="button"
                                onClick={() => {
                                    setSelectedImageUrl(sample.svgDataUrl);
                                    setSelectedImageName(sample.name);
                                    setConfig(c => ({
                                        ...c,
                                        targetWidth: sample.width,
                                        targetHeight: sample.height
                                    }));
                                }}
                                className={`p-2 rounded-xl border text-left transition flex items-center gap-2.5 cursor-pointer ${
                                    isSelected
                                        ? 'bg-cyan-950/80 border-cyan-400 text-white ring-2 ring-cyan-400/40 shadow-lg'
                                        : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-900'
                                }`}
                            >
                                <div className="w-10 h-10 rounded-lg bg-slate-900 flex items-center justify-center border border-slate-800 shrink-0 overflow-hidden">
                                    <img src={sample.svgDataUrl} alt={sample.name} className="w-8 h-8 object-contain" />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <span className="text-xs font-bold block truncate">{sample.name.split(' ')[0]}</span>
                                    <span className="text-[10px] text-slate-400 font-mono block">{sample.width}×{sample.height}</span>
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* SE SHOWCASE COMPARATIVO ESTIVER ATIVO */}
            {showcaseMode && (
                <div className="bg-slate-900/90 border border-cyan-500/40 rounded-3xl p-5 sm:p-6 space-y-4 backdrop-blur-md shadow-2xl animate-in fade-in duration-300">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="px-2.5 py-0.5 text-[10px] font-black rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-mono">
                                    POSTER COMPARATIVO 4-EM-1
                                </span>
                                <h3 className="text-lg font-black text-white">Visualização em Tamanhos Múltiplos (16, 32, 64, 128 px)</h3>
                            </div>
                            <p className="text-xs text-slate-400 mt-0.5">
                                Réplica exata do layout oficial: compare o mesmo sprite renderizado em diferentes densidades de grade.
                            </p>
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={handleDownloadShowcase}
                                className="px-4 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-black text-xs rounded-xl shadow-lg flex items-center gap-1.5 transition active:scale-95 cursor-pointer"
                            >
                                <Download size={14} />
                                <span>Baixar Poster Showcase PNG</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setShowcaseMode(false)}
                                className="px-3 py-2 bg-slate-800 text-slate-300 text-xs font-bold rounded-xl hover:bg-slate-700 cursor-pointer"
                            >
                                Fechar
                            </button>
                        </div>
                    </div>

                    <div className="w-full overflow-x-auto rounded-2xl border border-slate-800 bg-white p-4 shadow-inner flex justify-center">
                        {isGeneratingShowcase ? (
                            <div className="py-20 flex flex-col items-center gap-3 text-slate-500">
                                <RefreshCw size={24} className="animate-spin text-cyan-600" />
                                <span className="text-xs font-bold font-mono">Renderizando comparação 16×16 até 128×128...</span>
                            </div>
                        ) : showcaseDataUrl ? (
                            <img src={showcaseDataUrl} alt="Showcase Comparativo" className="max-w-full h-auto rounded-xl shadow-md" />
                        ) : null}
                    </div>
                </div>
            )}

            {/* CONTEÚDO PRINCIPAL: CONTROLES À ESQUERDA (5 COLS) E PRÉ-VISUALIZAÇÃO À DIREITA (7 COLS) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* COLUNA ESQUERDA: CONTROLES DO MOTOR DE PIXEL ART */}
                <div className="lg:col-span-5 space-y-5">
                    {/* SELEÇÃO DE TAMANHO / RESOLUÇÃO EXATA */}
                    <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 space-y-4 backdrop-blur-md shadow-xl">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-base font-black text-white flex items-center gap-2">
                                    <Grid size={16} className="text-cyan-400" />
                                    <span>Tamanho Exato do Grid</span>
                                </h3>
                                <p className="text-xs text-slate-400 mt-0.5">
                                    Resolução em pixels nativos da arte
                                </p>
                            </div>
                            <span className="px-2.5 py-1 text-xs font-mono font-black rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                                {config.targetWidth} × {config.targetHeight} px
                            </span>
                        </div>

                        {/* Abas de Categoria de Tamanho */}
                        <div className="grid grid-cols-3 gap-1.5 bg-slate-950 p-1 rounded-2xl border border-slate-800 text-xs font-bold">
                            <button
                                type="button"
                                onClick={() => setTabCategory('quadrado')}
                                className={`py-2 rounded-xl transition cursor-pointer text-center ${
                                    tabCategory === 'quadrado'
                                        ? 'bg-blue-600 text-white shadow-md font-black'
                                        : 'text-slate-400 hover:text-slate-200'
                                }`}
                            >
                                Quadrados 1:1
                            </button>
                            <button
                                type="button"
                                onClick={() => setTabCategory('livre')}
                                className={`py-2 rounded-xl transition cursor-pointer text-center ${
                                    tabCategory === 'livre'
                                        ? 'bg-blue-600 text-white shadow-md font-black'
                                        : 'text-slate-400 hover:text-slate-200'
                                }`}
                            >
                                Formatos Livres
                            </button>
                            <button
                                type="button"
                                onClick={() => setTabCategory('custom')}
                                className={`py-2 rounded-xl transition cursor-pointer text-center ${
                                    tabCategory === 'custom'
                                        ? 'bg-blue-600 text-white shadow-md font-black'
                                        : 'text-slate-400 hover:text-slate-200'
                                }`}
                            >
                                Personalizado
                            </button>
                        </div>

                        {/* Presets Rápidos */}
                        {tabCategory !== 'custom' ? (
                            <div className="grid grid-cols-2 gap-2 max-h-[300px] overflow-y-auto custom-scrollbar pr-1">
                                {filteredPresets.map(preset => {
                                    const isSelected = config.targetWidth === preset.width && config.targetHeight === preset.height;
                                    return (
                                        <button
                                            key={preset.id}
                                            type="button"
                                            onClick={() => handleSelectPreset(preset)}
                                            className={`p-3 rounded-2xl border text-left transition flex items-start gap-2.5 cursor-pointer ${
                                                isSelected
                                                    ? 'bg-gradient-to-br from-blue-600/30 to-cyan-600/20 border-cyan-400 text-white ring-2 ring-cyan-400/40 shadow-lg'
                                                    : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-900'
                                            }`}
                                        >
                                            <span className="text-xl shrink-0 mt-0.5">{preset.iconEmoji}</span>
                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-center justify-between gap-1">
                                                    <span className="text-xs font-black text-white font-mono">{preset.label}</span>
                                                </div>
                                                <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">{preset.description}</p>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        ) : (
                            /* Modo Customizado com Sliders */
                            <div className="space-y-4 bg-slate-950 p-4 rounded-2xl border border-slate-800">
                                <div>
                                    <div className="flex justify-between text-xs font-bold text-slate-300 mb-1.5">
                                        <span>Largura (Width)</span>
                                        <span className="font-mono text-cyan-300">{config.targetWidth} px</span>
                                    </div>
                                    <input
                                        type="range"
                                        min="16"
                                        max="128"
                                        step="4"
                                        value={config.targetWidth}
                                        onChange={(e) => setConfig(c => ({ ...c, targetWidth: parseInt(e.target.value) }))}
                                        className="w-full accent-cyan-400 cursor-pointer"
                                    />
                                </div>
                                <div>
                                    <div className="flex justify-between text-xs font-bold text-slate-300 mb-1.5">
                                        <span>Altura (Height)</span>
                                        <span className="font-mono text-cyan-300">{config.targetHeight} px</span>
                                    </div>
                                    <input
                                        type="range"
                                        min="16"
                                        max="128"
                                        step="4"
                                        value={config.targetHeight}
                                        onChange={(e) => setConfig(c => ({ ...c, targetHeight: parseInt(e.target.value) }))}
                                        className="w-full accent-cyan-400 cursor-pointer"
                                    />
                                </div>
                                <div className="text-[11px] text-slate-400 flex items-center justify-between">
                                    <span>Proporção: <strong className="text-white">{(config.targetWidth / config.targetHeight).toFixed(2)}:1</strong></span>
                                    <span className={config.targetWidth / config.targetHeight > 4 || config.targetHeight / config.targetWidth > 4 ? 'text-amber-400 font-bold' : 'text-emerald-400'}>
                                        {config.targetWidth / config.targetHeight > 4 || config.targetHeight / config.targetWidth > 4 ? '⚠️ Limite 4:1 excedido' : '✓ Dentro do limite 4:1'}
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* PALETA RETRO & DITHERING */}
                    <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 space-y-4 backdrop-blur-md shadow-xl">
                        <div className="flex items-center justify-between">
                            <h3 className="text-base font-black text-white flex items-center gap-2">
                                <Palette size={16} className="text-purple-400" />
                                <span>Paleta de Cores Retro</span>
                            </h3>
                            <span className="text-[11px] font-bold text-purple-300">
                                {currentPalette.name.split(' ')[0]}
                            </span>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-300">Estilo de Paleta:</label>
                            <select
                                value={config.paletteId}
                                onChange={(e) => setConfig(c => ({ ...c, paletteId: e.target.value }))}
                                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-slate-200 focus:outline-none focus:border-purple-400"
                            >
                                {PIXEL_PALETTES.map(pal => (
                                    <option key={pal.id} value={pal.id}>
                                        {pal.name}
                                    </option>
                                ))}
                            </select>
                            <p className="text-[11px] text-slate-400">{currentPalette.description}</p>
                        </div>

                        {/* Amostras das Cores da Paleta Selecionada */}
                        {currentPalette.colors.length > 0 && (
                            <div className="space-y-1.5">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Amostras da Paleta ({currentPalette.colors.length} cores):</span>
                                <div className="flex flex-wrap gap-1 p-2 bg-slate-950 rounded-xl border border-slate-800/80 max-h-24 overflow-y-auto">
                                    {currentPalette.colors.map((c, i) => (
                                        <div
                                            key={i}
                                            className="w-5 h-5 rounded-md border border-black/40 shadow-sm"
                                            style={{ backgroundColor: `rgb(${c[0]}, ${c[1]}, ${c[2]})` }}
                                            title={`RGB(${c[0]}, ${c[1]}, ${c[2]})`}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Dithering */}
                        <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-800/80">
                            <div>
                                <label className="text-xs font-bold text-slate-300 block mb-1">Dithering:</label>
                                <select
                                    value={config.ditherMode}
                                    onChange={(e) => setConfig(c => ({ ...c, ditherMode: e.target.value as any }))}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-200"
                                >
                                    <option value="none">Nenhum (Sólido)</option>
                                    <option value="bayer">Bayer Matrix 4×4</option>
                                </select>
                            </div>

                            <div>
                                <label className="text-xs font-bold text-slate-300 block mb-1">Contorno Pixel:</label>
                                <button
                                    type="button"
                                    onClick={() => setConfig(c => ({ ...c, enhanceOutline: !c.enhanceOutline }))}
                                    className={`w-full py-1.5 px-2.5 rounded-xl text-xs font-bold border transition cursor-pointer flex items-center justify-center gap-1.5 ${
                                        config.enhanceOutline
                                            ? 'bg-blue-600/30 border-blue-400 text-blue-200 font-black'
                                            : 'bg-slate-950 border-slate-800 text-slate-400'
                                    }`}
                                >
                                    <Check size={13} className={config.enhanceOutline ? 'opacity-100' : 'opacity-0'} />
                                    <span>Contorno Retro</span>
                                </button>
                            </div>
                        </div>

                        {/* Fundo Transparente */}
                        <div className="space-y-2 pt-2 border-t border-slate-800/80">
                            <div className="flex items-center justify-between">
                                <label className="text-xs font-bold text-slate-300 flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={config.removeBackground}
                                        onChange={(e) => setConfig(c => ({ ...c, removeBackground: e.target.checked }))}
                                        className="rounded text-cyan-500 accent-cyan-500"
                                    />
                                    <span>Remover Fundo Transparente</span>
                                </label>
                                {config.removeBackground && (
                                    <span className="text-[10px] font-mono text-cyan-300">Tolerância: {config.backgroundTolerance}%</span>
                                )}
                            </div>

                            {config.removeBackground && (
                                <input
                                    type="range"
                                    min="5"
                                    max="50"
                                    value={config.backgroundTolerance}
                                    onChange={(e) => setConfig(c => ({ ...c, backgroundTolerance: parseInt(e.target.value) }))}
                                    className="w-full accent-cyan-400 cursor-pointer"
                                />
                            )}
                        </div>
                    </div>

                    {/* AJUSTES FINOS DE IMAGEM */}
                    <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 space-y-3.5 backdrop-blur-md shadow-xl">
                        <h3 className="text-base font-black text-white flex items-center gap-2">
                            <Sliders size={16} className="text-amber-400" />
                            <span>Ajustes de Nitidez & Imagem</span>
                        </h3>

                        <div className="grid grid-cols-3 gap-3">
                            <div>
                                <div className="flex justify-between text-[11px] font-bold text-slate-400 mb-1">
                                    <span>Brilho</span>
                                    <span className="text-slate-200 font-mono">{config.brightness}</span>
                                </div>
                                <input
                                    type="range"
                                    min="-40"
                                    max="40"
                                    value={config.brightness}
                                    onChange={(e) => setConfig(c => ({ ...c, brightness: parseInt(e.target.value) }))}
                                    className="w-full accent-amber-400"
                                />
                            </div>

                            <div>
                                <div className="flex justify-between text-[11px] font-bold text-slate-400 mb-1">
                                    <span>Contraste</span>
                                    <span className="text-slate-200 font-mono">{config.contrast}</span>
                                </div>
                                <input
                                    type="range"
                                    min="-30"
                                    max="50"
                                    value={config.contrast}
                                    onChange={(e) => setConfig(c => ({ ...c, contrast: parseInt(e.target.value) }))}
                                    className="w-full accent-amber-400"
                                />
                            </div>

                            <div>
                                <div className="flex justify-between text-[11px] font-bold text-slate-400 mb-1">
                                    <span>Saturação</span>
                                    <span className="text-slate-200 font-mono">{config.saturation}</span>
                                </div>
                                <input
                                    type="range"
                                    min="-50"
                                    max="50"
                                    value={config.saturation}
                                    onChange={(e) => setConfig(c => ({ ...c, saturation: parseInt(e.target.value) }))}
                                    className="w-full accent-amber-400"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* COLUNA DIREITA: VISUALIZAÇÃO AO VIVO EM TEMPO REAL & EXPORTAÇÃO */}
                <div className="lg:col-span-7 space-y-5">
                    {/* ÁREA DE PRÉ-VISUALIZAÇÃO COM CHECKERBOARD */}
                    <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 sm:p-6 backdrop-blur-md shadow-2xl space-y-4">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <div className="flex items-center gap-2">
                                <span className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse" />
                                <span className="text-sm font-black text-white">Preview em Tempo Real</span>
                                <span className="px-2 py-0.5 text-[10px] font-mono font-bold rounded bg-slate-800 text-slate-300">
                                    {config.targetWidth} × {config.targetHeight} px
                                </span>
                                {pixelResult && (
                                    <span className="px-2 py-0.5 text-[10px] font-mono font-bold rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                                        {pixelResult.uniqueColorsCount} cores
                                    </span>
                                )}
                            </div>

                            {/* Controles de Zoom & Grid */}
                            <div className="flex items-center gap-2 bg-slate-950 p-1 rounded-xl border border-slate-800">
                                <button
                                    type="button"
                                    onClick={() => setConfig(c => ({ ...c, showPixelGrid: !c.showPixelGrid }))}
                                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
                                        config.showPixelGrid ? 'bg-cyan-600 text-white font-black' : 'text-slate-400 hover:text-white'
                                    }`}
                                    title="Alternar grade de pixels individuais"
                                >
                                    <Grid size={13} />
                                    <span>Grid</span>
                                </button>
                                <div className="h-4 w-px bg-slate-800" />
                                <button
                                    type="button"
                                    onClick={() => setConfig(c => ({ ...c, displayZoom: Math.max(2, c.displayZoom - 2) }))}
                                    className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
                                    title="Diminuir Zoom"
                                >
                                    <ZoomOut size={14} />
                                </button>
                                <span className="text-xs font-mono font-bold text-slate-300 px-1">{config.displayZoom}×</span>
                                <button
                                    type="button"
                                    onClick={() => setConfig(c => ({ ...c, displayZoom: Math.min(20, c.displayZoom + 2) }))}
                                    className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
                                    title="Aumentar Zoom"
                                >
                                    <ZoomIn size={14} />
                                </button>
                            </div>
                        </div>

                        {/* CAIXA PRINCIPAL DO SPRITE COM FUNDO CHECKERBOARD (TRANSPARÊNCIA) */}
                        <div className="relative rounded-2xl overflow-hidden border border-slate-800 bg-[#f1f5f9] min-h-[360px] flex items-center justify-center p-6 shadow-inner">
                            {/* Padrão Xadrez Transparente CSS */}
                            <div
                                className="absolute inset-0 opacity-40 pointer-events-none"
                                style={{
                                    backgroundImage: `
                                        linear-gradient(45deg, #cbd5e1 25%, transparent 25%),
                                        linear-gradient(-45deg, #cbd5e1 25%, transparent 25%),
                                        linear-gradient(45deg, transparent 75%, #cbd5e1 75%),
                                        linear-gradient(-45deg, transparent 75%, #cbd5e1 75%)
                                    `,
                                    backgroundSize: '16px 16px',
                                    backgroundPosition: '0 0, 0 8px, 8px -8px, -8px 0px'
                                }}
                            />

                            {isProcessing ? (
                                <div className="relative z-10 flex flex-col items-center gap-2 text-slate-700 font-bold text-xs">
                                    <RefreshCw size={24} className="animate-spin text-cyan-600" />
                                    <span>Calculando redução em pixels exatos...</span>
                                </div>
                            ) : pixelResult?.dataUrl ? (
                                <div className="relative z-10 flex flex-col items-center gap-3">
                                    <div
                                        className="relative transition-all shadow-xl rounded-md"
                                        style={{
                                            width: `${config.targetWidth * config.displayZoom}px`,
                                            height: `${config.targetHeight * config.displayZoom}px`
                                        }}
                                    >
                                        <img
                                            src={pixelResult.dataUrl}
                                            alt="Pixel Art Sprite"
                                            className="w-full h-full object-contain"
                                            style={{
                                                imageRendering: 'pixelated'
                                            }}
                                        />

                                        {/* Grade sobreposta de pixels se ativada */}
                                        {config.showPixelGrid && config.displayZoom >= 4 && (
                                            <div
                                                className="absolute inset-0 pointer-events-none opacity-20"
                                                style={{
                                                    backgroundImage: `
                                                        linear-gradient(to right, #000 1px, transparent 1px),
                                                        linear-gradient(to bottom, #000 1px, transparent 1px)
                                                    `,
                                                    backgroundSize: `${config.displayZoom}px ${config.displayZoom}px`
                                                }}
                                            />
                                        )}
                                    </div>

                                    {/* Etiqueta inferior com tamanho e escala */}
                                    <div className="bg-slate-900/90 text-slate-200 px-3 py-1 rounded-full text-xs font-mono font-bold shadow-md border border-slate-700 flex items-center gap-2">
                                        <span className="text-cyan-400">{config.targetWidth} × {config.targetHeight} px</span>
                                        <span className="text-slate-500">·</span>
                                        <span>Zoom {config.displayZoom}×</span>
                                        <span className="text-slate-500">·</span>
                                        <span className="text-purple-300">{currentPalette.name.split(' ')[0]}</span>
                                    </div>
                                </div>
                            ) : null}
                        </div>

                        {/* BOTÕES DE EXPORTAÇÃO E DOWNLOAD RÁPIDO */}
                        <div className="space-y-3 pt-2">
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                                {/* Download 1x Nativo */}
                                <button
                                    type="button"
                                    onClick={handleDownloadNative}
                                    className="py-3 px-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-100 font-bold text-xs flex items-center justify-center gap-2 border border-slate-700 transition active:scale-95 cursor-pointer shadow-md"
                                >
                                    <Download size={15} className="text-cyan-400" />
                                    <span>Baixar 1× Nativo ({config.targetWidth}×{config.targetHeight})</span>
                                </button>

                                {/* Download 8x Nítido (HD) */}
                                <button
                                    type="button"
                                    onClick={() => handleDownloadUpscaled(8)}
                                    className="py-3 px-3 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-blue-600/25 transition active:scale-95 cursor-pointer"
                                >
                                    <Sparkles size={15} />
                                    <span>Baixar 8× HD ({config.targetWidth * 8}×{config.targetHeight * 8})</span>
                                </button>

                                {/* Download 16x Gigante */}
                                <button
                                    type="button"
                                    onClick={() => handleDownloadUpscaled(16)}
                                    className="py-3 px-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/25 transition active:scale-95 cursor-pointer"
                                >
                                    <Maximize2 size={15} />
                                    <span>Baixar 16× Ultra ({config.targetWidth * 16}×{config.targetHeight * 16})</span>
                                </button>
                            </div>

                            {onOpenUpscale && pixelResult?.dataUrl && (
                                <button
                                    type="button"
                                    onClick={() => onOpenUpscale(pixelResult.dataUrl, `pixel-engine-${config.targetWidth}x${config.targetHeight}`)}
                                    className="w-full py-2.5 px-4 rounded-xl bg-slate-950/80 hover:bg-slate-900 border border-emerald-500/30 text-emerald-300 font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer"
                                >
                                    <Sparkles size={14} className="text-emerald-400" />
                                    <span>Enviar para Upscale IA (Super Resolução com Filtro de Arte)</span>
                                </button>
                            )}
                        </div>
                    </div>

                    {/* GERADOR DE PROMPT MESTRE (pe_image_v1 / Pixel Engine AI) */}
                    <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 space-y-3.5 backdrop-blur-md shadow-xl">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <span className="px-2.5 py-0.5 text-[10px] font-black rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-mono">
                                    PROMPT MESTRE IA
                                </span>
                                <h4 className="text-sm font-black text-white">Prompt com Dimensões Exatas</h4>
                            </div>
                            <span className="text-[10px] text-slate-400 font-mono">pe_image_v1</span>
                        </div>

                        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-3.5 text-xs font-mono text-cyan-200 leading-relaxed select-all">
                            {generatedPrompt}
                        </div>

                        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                            <div className="text-[11px] text-slate-400">
                                Compatível com ImageFX, Midjourney v6, Stable Diffusion e Recraft.
                            </div>

                            <div className="flex items-center gap-2">
                                {onApplyPrompt && (
                                    <button
                                        type="button"
                                        onClick={() => onApplyPrompt(generatedPrompt)}
                                        className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl flex items-center gap-1.5 transition cursor-pointer"
                                    >
                                        <Sparkles size={13} className="text-amber-400" />
                                        <span>Aplicar no Arquiteto</span>
                                    </button>
                                )}

                                <button
                                    type="button"
                                    onClick={handleCopyPrompt}
                                    className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-black text-xs rounded-xl flex items-center gap-1.5 shadow-md shadow-cyan-600/20 transition active:scale-95 cursor-pointer"
                                >
                                    {promptCopied ? <Check size={14} className="text-emerald-300" /> : <Copy size={14} />}
                                    <span>{promptCopied ? 'Copiado!' : 'Copiar Prompt'}</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
