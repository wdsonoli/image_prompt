import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
    Download, 
    Sparkles, 
    Loader2, 
    X, 
    Zap, 
    Columns2, 
    ArrowLeftRight, 
    Image as ImageIcon, 
    Maximize2, 
    Minimize2,
    Check
} from 'lucide-react';

interface GeneratedImageDisplayProps {
    imageUrl: string | null;
    originalImageUrl?: string | null;
    originalImageName?: string | null;
    isGenerating: boolean;
    onClose: () => void;
}

type ViewMode = 'side-by-side' | 'split' | 'single';

export const GeneratedImageDisplay: React.FC<GeneratedImageDisplayProps> = ({ 
    imageUrl, 
    originalImageUrl,
    originalImageName,
    isGenerating, 
    onClose
}) => {
    const hasOriginal = Boolean(originalImageUrl);
    const [viewMode, setViewMode] = useState<ViewMode>('side-by-side');
    const [sliderPos, setSliderPos] = useState<number>(50);
    const [isDragging, setIsDragging] = useState<boolean>(false);
    const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
    const [isDownloaded, setIsDownloaded] = useState<boolean>(false);
    const sliderContainerRef = useRef<HTMLDivElement>(null);
    const fullscreenSliderRef = useRef<HTMLDivElement>(null);

    // Ajusta o modo inicial quando a imagem original estiver disponível ou não
    useEffect(() => {
        if (hasOriginal) {
            setViewMode('side-by-side');
        } else {
            setViewMode('single');
        }
    }, [hasOriginal]);

    // Listener para fechar fullscreen com ESC
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isFullscreen) {
                setIsFullscreen(false);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isFullscreen]);

    const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
        setIsDragging(true);
        (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
        updateSliderPosition(e.clientX, sliderContainerRef.current);
    };

    const handleFullscreenPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
        setIsDragging(true);
        (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
        updateSliderPosition(e.clientX, fullscreenSliderRef.current);
    };

    const updateSliderPosition = useCallback((clientX: number, container: HTMLElement | null) => {
        if (!container) return;
        const rect = container.getBoundingClientRect();
        const offsetX = Math.max(0, Math.min(clientX - rect.left, rect.width));
        const percentage = Math.round((offsetX / rect.width) * 100);
        setSliderPos(percentage);
    }, []);

    const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
        if (!isDragging) return;
        updateSliderPosition(e.clientX, sliderContainerRef.current);
    };

    const handleFullscreenPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
        if (!isDragging) return;
        updateSliderPosition(e.clientX, fullscreenSliderRef.current);
    };

    const handlePointerUp = () => {
        setIsDragging(false);
    };

    const handleDownload = () => {
        if (!imageUrl) return;
        const link = document.createElement('a');
        link.href = imageUrl;
        link.download = `generated-${Date.now()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        setIsDownloaded(true);
        setTimeout(() => setIsDownloaded(false), 2500);
    };

    if (!imageUrl && !isGenerating) return null;

    // Renderizador do Comparador Slider Interativo
    const renderSplitSlider = (containerRef: React.RefObject<HTMLDivElement | null>, isLarge = false) => {
        if (!hasOriginal || !originalImageUrl || !imageUrl) return null;

        return (
            <div 
                ref={containerRef}
                id="split-comparison-slider"
                onPointerDown={isLarge ? handleFullscreenPointerDown : handlePointerDown}
                onPointerMove={isLarge ? handleFullscreenPointerMove : handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerUp}
                className={`relative overflow-hidden rounded-xl bg-slate-950 select-none cursor-ew-resize border border-slate-700 shadow-2xl mx-auto w-full ${
                    isLarge ? 'h-[75vh] max-w-5xl' : 'h-[360px] sm:h-[420px] max-w-full'
                }`}
            >
                {/* Imagem Gerada (Base / Direita) */}
                <img 
                    src={imageUrl} 
                    alt="Generated content" 
                    className="absolute inset-0 w-full h-full object-contain pointer-events-none"
                />

                {/* Imagem Original (Overlay / Esquerda com recorte dinâmico) */}
                <div 
                    className="absolute inset-0 overflow-hidden pointer-events-none"
                    style={{ clipPath: `inset(0 ${100 - sliderPos}% 0 0)` }}
                >
                    <img 
                        src={originalImageUrl} 
                        alt="Original content" 
                        className="absolute inset-0 w-full h-full object-contain pointer-events-none"
                    />
                </div>

                {/* Linha Divisória e Alça de Arrasto */}
                <div 
                    className="absolute top-0 bottom-0 w-0.5 bg-white shadow-[0_0_10px_rgba(0,0,0,0.8)] z-20 pointer-events-none"
                    style={{ left: `${sliderPos}%` }}
                >
                    <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-9 h-9 rounded-full bg-slate-900 border-2 border-white text-white shadow-xl flex items-center justify-center pointer-events-auto cursor-ew-resize hover:scale-110 active:scale-95 transition-transform">
                        <ArrowLeftRight size={16} />
                    </div>
                </div>

                {/* Selos de Identificação no topo */}
                <div className="absolute top-3 left-3 z-10 pointer-events-none">
                    <span className="px-2.5 py-1 rounded-md text-[11px] font-bold tracking-wider uppercase bg-slate-900/80 backdrop-blur-md text-slate-200 border border-slate-700 shadow-lg">
                        Original
                    </span>
                </div>
                <div className="absolute top-3 right-3 z-10 pointer-events-none">
                    <span className="px-2.5 py-1 rounded-md text-[11px] font-bold tracking-wider uppercase bg-blue-600/90 backdrop-blur-md text-white border border-blue-400 shadow-lg flex items-center gap-1">
                        <Sparkles size={12} className="text-yellow-300" />
                        Resultado IA
                    </span>
                </div>

                {/* Legenda de auxílio no rodapé */}
                <div className="absolute bottom-2 inset-x-0 flex justify-center z-10 pointer-events-none">
                    <span className="text-[10px] bg-black/60 backdrop-blur-sm text-slate-300 px-3 py-1 rounded-full border border-white/10">
                        Arraste para os lados para comparar os detalhes
                    </span>
                </div>
            </div>
        );
    };

    // Renderizador do Modo Lado a Lado (Side-by-Side)
    const renderSideBySide = (isLarge = false) => {
        if (!imageUrl) return null;

        return (
            <div id="side-by-side-grid" className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                {/* Coluna 1: Imagem Original */}
                {hasOriginal && originalImageUrl && (
                    <div className="flex flex-col bg-slate-900/80 rounded-xl border border-slate-700/80 overflow-hidden shadow-lg">
                        <div className="px-3.5 py-2.5 bg-slate-950/70 border-b border-slate-800 flex items-center justify-between text-xs">
                            <div className="flex items-center gap-1.5 font-bold text-slate-300 uppercase tracking-wider text-[11px]">
                                <ImageIcon size={14} className="text-slate-400" />
                                <span>Original</span>
                            </div>
                            {originalImageName && (
                                <span className="text-[11px] text-slate-500 font-mono truncate max-w-[160px]" title={originalImageName}>
                                    {originalImageName}
                                </span>
                            )}
                        </div>

                        <div className={`relative flex items-center justify-center p-3 bg-slate-950/40 ${isLarge ? 'h-[65vh]' : 'min-h-[260px] sm:min-h-[320px]'}`}>
                            <img 
                                src={originalImageUrl} 
                                alt="Original content" 
                                className="max-h-full max-w-full rounded-lg object-contain border border-slate-800 shadow-md"
                            />
                        </div>

                        <div className="px-3.5 py-2 bg-slate-950/50 border-t border-slate-800/80 text-[10px] text-slate-500 flex items-center justify-between">
                            <span>Imagem de Entrada</span>
                            <span className="font-mono">INPUT</span>
                        </div>
                    </div>
                )}

                {/* Coluna 2: Imagem Gerada (Resultado) */}
                <div className={`flex flex-col bg-slate-900/80 rounded-xl border border-blue-500/30 overflow-hidden shadow-lg relative group ${!hasOriginal ? 'md:col-span-2 max-w-xl mx-auto' : ''}`}>
                    <div className="px-3.5 py-2.5 bg-blue-950/30 border-b border-blue-500/20 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1.5 font-bold text-blue-300 uppercase tracking-wider text-[11px]">
                            <Sparkles size={14} className="text-yellow-400" />
                            <span>Resultado Gerado</span>
                        </div>
                        <span className="text-[10px] bg-blue-500/20 border border-blue-400/30 text-blue-300 px-2 py-0.5 rounded-full font-bold">
                            AI GEMINI
                        </span>
                    </div>

                    <div className={`relative flex items-center justify-center p-3 bg-slate-950/40 ${isLarge ? 'h-[65vh]' : 'min-h-[260px] sm:min-h-[320px]'}`}>
                        <img 
                            src={imageUrl} 
                            alt="Generated content" 
                            className="max-h-full max-w-full rounded-lg object-contain border border-slate-700 shadow-xl"
                        />

                        {/* Overlay de Ações ao passar o mouse */}
                        <div className="absolute inset-0 bg-slate-950/70 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-3 p-4 rounded-b-xl backdrop-blur-xs">
                            <button 
                                type="button"
                                onClick={handleDownload}
                                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-full font-bold transition-all shadow-lg text-xs sm:text-sm active:scale-95"
                            >
                                {isDownloaded ? (
                                    <>
                                        <Check size={16} className="text-emerald-300" />
                                        <span>Baixado!</span>
                                    </>
                                ) : (
                                    <>
                                        <Download size={16} />
                                        <span>Download PNG</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    <div className="px-3.5 py-2 bg-slate-950/50 border-t border-slate-800/80 text-[10px] text-slate-400 flex items-center justify-between">
                        <span className="flex items-center gap-1 text-blue-400 font-semibold">
                            <Zap size={10} /> Alta Resolução
                        </span>
                        <button 
                            type="button" 
                            onClick={handleDownload}
                            className="text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1 transition-colors"
                        >
                            <Download size={11} /> Baixar
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    // Renderizador do Modo Único (Single)
    const renderSingleView = (isLarge = false) => {
        if (!imageUrl) return null;

        return (
            <div className="relative group flex items-center justify-center w-full">
                <img 
                    src={imageUrl} 
                    alt="Generated content" 
                    className={`max-w-full rounded-lg shadow-2xl border border-slate-700 object-contain ${
                        isLarge ? 'max-h-[75vh]' : 'max-h-[500px]'
                    }`}
                />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-4 p-4 rounded-lg">
                    <button 
                        type="button"
                        onClick={handleDownload}
                        className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-6 py-2.5 rounded-full font-bold transition-all shadow-lg text-sm active:scale-95"
                    >
                        {isDownloaded ? (
                            <>
                                <Check size={16} className="text-emerald-300" />
                                <span>Imagem Baixada!</span>
                            </>
                        ) : (
                            <>
                                <Download size={16} />
                                <span>Download PNG</span>
                            </>
                        )}
                    </button>
                </div>
            </div>
        );
    };

    return (
        <>
            <div id="generated-image-card" className="bg-slate-800 rounded-2xl overflow-hidden border border-slate-700 shadow-2xl flex flex-col mt-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                {/* Cabeçalho Principal */}
                <div className="bg-slate-900/90 px-4 sm:px-5 py-3 border-b border-slate-700 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2 text-slate-200 font-semibold text-sm sm:text-base">
                        <Sparkles size={18} className="text-yellow-400 animate-pulse" />
                        <span>Visual Result</span>
                    </div>

                    {/* Barra de Alternância de Modos de Visualização / Comparação */}
                    {!isGenerating && imageUrl && (
                        <div className="flex items-center gap-1.5 bg-slate-950/70 p-1 rounded-xl border border-slate-800">
                            {hasOriginal && (
                                <>
                                    <button
                                        id="btn-mode-side-by-side"
                                        type="button"
                                        onClick={() => setViewMode('side-by-side')}
                                        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                                            viewMode === 'side-by-side'
                                                ? 'bg-blue-600 text-white shadow-md'
                                                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                                        }`}
                                        title="Ver lado a lado (Original vs Gerada)"
                                    >
                                        <Columns2 size={14} />
                                        <span className="hidden sm:inline">Lado a Lado</span>
                                    </button>

                                    <button
                                        id="btn-mode-split"
                                        type="button"
                                        onClick={() => setViewMode('split')}
                                        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                                            viewMode === 'split'
                                                ? 'bg-blue-600 text-white shadow-md'
                                                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                                        }`}
                                        title="Comparação interativa por slider"
                                    >
                                        <ArrowLeftRight size={14} />
                                        <span className="hidden sm:inline">Slider</span>
                                    </button>
                                </>
                            )}

                            <button
                                id="btn-mode-single"
                                type="button"
                                onClick={() => setViewMode('single')}
                                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                                    viewMode === 'single'
                                        ? 'bg-blue-600 text-white shadow-md'
                                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                                }`}
                                title="Apenas imagem gerada"
                            >
                                <ImageIcon size={14} />
                                <span className="hidden sm:inline">Apenas Resultado</span>
                            </button>
                        </div>
                    )}

                    <div className="flex items-center gap-1.5">
                        {!isGenerating && imageUrl && (
                            <>
                                <button
                                    id="btn-fullscreen-comparison"
                                    type="button"
                                    onClick={() => setIsFullscreen(true)}
                                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                                    title="Expandir em tela cheia"
                                >
                                    <Maximize2 size={17} />
                                </button>

                                <button
                                    id="btn-download-quick"
                                    type="button"
                                    onClick={handleDownload}
                                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                                    title="Baixar imagem gerada"
                                >
                                    <Download size={17} />
                                </button>
                            </>
                        )}

                        <button 
                            id="btn-close-generated-card"
                            onClick={onClose} 
                            className="p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-slate-800 transition-colors ml-1"
                            title="Fechar"
                        >
                            <X size={18} />
                        </button>
                    </div>
                </div>

                {/* Conteúdo Central */}
                <div className="relative min-h-[300px] flex items-center justify-center bg-slate-950/60 p-4 sm:p-5">
                    {isGenerating ? (
                        <div className="flex flex-col items-center gap-4 py-20">
                            <div className="relative">
                                <Loader2 size={44} className="text-blue-500 animate-spin" />
                                <Sparkles size={16} className="text-yellow-400 absolute top-0 right-0 animate-bounce" />
                            </div>
                            <div className="text-center px-4">
                                <p className="text-slate-200 font-semibold text-base">Gerando Imagem com IA...</p>
                                <p className="text-slate-500 text-xs mt-1 max-w-[280px] mx-auto">
                                    Renderizando composição a partir do prompt com Gemini ImageFX / Imagen.
                                </p>
                            </div>
                        </div>
                    ) : (
                        <>
                            {viewMode === 'side-by-side' && renderSideBySide()}
                            {viewMode === 'split' && renderSplitSlider(sliderContainerRef)}
                            {viewMode === 'single' && renderSingleView()}
                        </>
                    )}
                </div>
                
                {/* Rodapé Informativo */}
                {!isGenerating && imageUrl && (
                    <div className="bg-slate-900/60 px-5 py-2.5 text-[11px] text-slate-400 flex flex-wrap justify-between items-center gap-2 border-t border-slate-800">
                        <div className="flex items-center gap-2 font-medium">
                            <span className="flex items-center gap-1 uppercase tracking-widest font-bold text-emerald-400">
                                <Zap size={11} /> Pronto para uso
                            </span>
                            {hasOriginal && (
                                <span className="text-slate-500 hidden sm:inline">• Modo: {viewMode === 'side-by-side' ? 'Lado a Lado' : viewMode === 'split' ? 'Slider Interativo' : 'Imagem Única'}</span>
                            )}
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                type="button"
                                onClick={handleDownload}
                                className="text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1 transition-colors"
                            >
                                <Download size={13} />
                                Download PNG
                            </button>
                            <span className="font-mono text-slate-600 text-[10px]">GEMINI ENGINE</span>
                        </div>
                    </div>
                )}
            </div>

            {/* Modal / Dialog em Tela Cheia para Comparação Detalhada */}
            {isFullscreen && imageUrl && (
                <div 
                    id="fullscreen-comparison-modal" 
                    className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-md flex flex-col animate-in fade-in duration-200"
                >
                    <div className="px-6 py-4 border-b border-slate-800 bg-slate-900/80 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Sparkles size={20} className="text-yellow-400" />
                            <h2 className="text-lg font-bold text-slate-100">Comparação em Tela Cheia</h2>
                            {hasOriginal && (
                                <div className="hidden sm:flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 ml-4">
                                    <button
                                        type="button"
                                        onClick={() => setViewMode('side-by-side')}
                                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                                            viewMode === 'side-by-side'
                                                ? 'bg-blue-600 text-white'
                                                : 'text-slate-400 hover:text-white'
                                        }`}
                                    >
                                        <Columns2 size={14} />
                                        <span>Lado a Lado</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setViewMode('split')}
                                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                                            viewMode === 'split'
                                                ? 'bg-blue-600 text-white'
                                                : 'text-slate-400 hover:text-white'
                                        }`}
                                    >
                                        <ArrowLeftRight size={14} />
                                        <span>Slider</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setViewMode('single')}
                                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                                            viewMode === 'single'
                                                ? 'bg-blue-600 text-white'
                                                : 'text-slate-400 hover:text-white'
                                        }`}
                                    >
                                        <ImageIcon size={14} />
                                        <span>Apenas Resultado</span>
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={handleDownload}
                                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl text-xs font-semibold shadow-md active:scale-95 transition-all"
                            >
                                <Download size={14} />
                                <span>Download</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setIsFullscreen(false)}
                                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                                title="Sair do modo tela cheia (Esc)"
                            >
                                <Minimize2 size={20} />
                            </button>
                        </div>
                    </div>

                    <div className="flex-1 p-6 flex items-center justify-center overflow-auto">
                        {viewMode === 'side-by-side' && renderSideBySide(true)}
                        {viewMode === 'split' && renderSplitSlider(fullscreenSliderRef, true)}
                        {viewMode === 'single' && renderSingleView(true)}
                    </div>
                </div>
            )}
        </>
    );
};
