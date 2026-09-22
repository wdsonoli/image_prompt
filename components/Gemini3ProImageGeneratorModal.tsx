import React, { useState, useEffect, useRef } from 'react';
import { 
    Sparkles, X, Loader2, Download, Copy, Check, Sliders, 
    Image as ImageIcon, RefreshCw, Maximize2, ShieldCheck, 
    Zap, Wand2, Eye, ChevronRight, Layers, Award
} from 'lucide-react';
import { 
    generateGemini3ProImage, 
    ImageResolution, 
    ImageAspectRatio, 
    ImageGenModel 
} from '../services/imageGenService';
import { ULTRA_PREMIUM_16K_PROMPT } from '../utils/visualEffectsData';

interface Gemini3ProImageGeneratorModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialPrompt: string;
    initialMode?: 'create' | 'edit';
    activeImage?: {
        previewUrl?: string;
        base64Data?: string;
        mimeType?: string;
        name?: string;
    } | null;
    onImageGenerated?: (imageUrl: string, promptUsed: string) => void;
    onSetAsActiveImage?: (imageUrl: string) => void;
}

export const Gemini3ProImageGeneratorModal: React.FC<Gemini3ProImageGeneratorModalProps> = ({
    isOpen,
    onClose,
    initialPrompt,
    initialMode = 'create',
    activeImage,
    onImageGenerated,
    onSetAsActiveImage
}) => {
    const [editorMode, setEditorMode] = useState<'create' | 'edit'>(initialMode);
    const [promptText, setPromptText] = useState(initialPrompt);
    const [model, setModel] = useState<ImageGenModel>(
        initialMode === 'edit' ? 'gemini-3.1-flash-image-preview' : 'gemini-3-pro-image'
    );
    const [resolution, setResolution] = useState<ImageResolution>('4K');
    const [aspectRatio, setAspectRatio] = useState<ImageAspectRatio>('1:1');
    const [useReferenceImage, setUseReferenceImage] = useState<boolean>(
        initialMode === 'edit' ? true : Boolean(activeImage?.base64Data)
    );
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedUrl, setGeneratedUrl] = useState<string | null>(null);
    const [generationHistory, setGenerationHistory] = useState<Array<{ url: string; prompt: string; size: string; time: string }>>([]);
    const [sliderPos, setSliderPos] = useState(50);
    const [isDragging, setIsDragging] = useState(false);
    const [copied, setCopied] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [elapsedTime, setElapsedTime] = useState(0);
    const sliderContainerRef = useRef<HTMLDivElement>(null);

    // Sync initial prompt and mode when modal opens
    useEffect(() => {
        if (isOpen) {
            setPromptText(initialPrompt || '');
            if (initialMode === 'edit' && activeImage?.base64Data) {
                setEditorMode('edit');
                setModel('gemini-3.1-flash-image-preview');
                setUseReferenceImage(true);
            } else if (activeImage?.base64Data) {
                setUseReferenceImage(true);
            }
        }
    }, [isOpen, initialPrompt, initialMode, activeImage]);

    // Timer for generation feedback
    useEffect(() => {
        let timer: any;
        if (isGenerating) {
            setElapsedTime(0);
            timer = setInterval(() => {
                setElapsedTime(prev => prev + 1);
            }, 1000);
        } else {
            clearInterval(timer);
        }
        return () => clearInterval(timer);
    }, [isGenerating]);

    // Escape key listener
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen && !isGenerating) {
                onClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, isGenerating, onClose]);

    if (!isOpen) return null;

    const handleApply16kRemaster = () => {
        if (promptText.includes('Ultra-Premium 16K Professional Remaster')) {
            const cleaned = promptText
                .replace(ULTRA_PREMIUM_16K_PROMPT, '')
                .replace(/Ultra-Premium 16K Professional Remaster & Enhancement[\s\S]*?production-ready 16K master\./gi, '')
                .trim();
            setPromptText(cleaned);
        } else if (!promptText.trim()) {
            setPromptText(ULTRA_PREMIUM_16K_PROMPT);
        } else {
            setPromptText(`${promptText.trim()}\n\n${ULTRA_PREMIUM_16K_PROMPT}`);
        }
    };

    const handleGenerate = async () => {
        if (!promptText.trim()) {
            setError("Por favor, digite ou compile um prompt para gerar a imagem.");
            return;
        }

        setError(null);
        setIsGenerating(true);

        try {
            const imageContext = (useReferenceImage && activeImage?.base64Data && activeImage.mimeType)
                ? { base64: activeImage.base64Data, mimeType: activeImage.mimeType }
                : undefined;

            const url = await generateGemini3ProImage({
                prompt: promptText,
                model,
                imageSize: resolution,
                aspectRatio,
                imageContext
            });

            setGeneratedUrl(url);
            setGenerationHistory(prev => [
                { url, prompt: promptText, size: resolution, time: new Date().toLocaleTimeString() },
                ...prev.slice(0, 5)
            ]);

            if (onImageGenerated) {
                onImageGenerated(url, promptText);
            }
        } catch (err: any) {
            console.error("Erro na geração Gemini 3 Pro 4K:", err);
            setError(err.message || "Erro desconhecido ao gerar imagem com Gemini 3 Pro.");
        } finally {
            setIsGenerating(false);
        }
    };

    const handleDownload = () => {
        if (!generatedUrl) return;
        const link = document.createElement('a');
        link.href = generatedUrl;
        link.download = `gemini-3-pro-4k-${Date.now()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleCopyPrompt = async () => {
        try {
            await navigator.clipboard.writeText(promptText);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy', err);
        }
    };

    // Before/After slider handlers
    const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
        setIsDragging(true);
        (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
        updateSliderPosition(e.clientX);
    };

    const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
        if (!isDragging) return;
        updateSliderPosition(e.clientX);
    };

    const handlePointerUp = () => {
        setIsDragging(false);
    };

    const updateSliderPosition = (clientX: number) => {
        if (!sliderContainerRef.current) return;
        const rect = sliderContainerRef.current.getBoundingClientRect();
        const offsetX = Math.max(0, Math.min(clientX - rect.left, rect.width));
        setSliderPos(Math.round((offsetX / rect.width) * 100));
    };

    const is16kFormulaActive = promptText.includes('Ultra-Premium 16K Professional Remaster');

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
            <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-5xl max-h-[96vh] sm:max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-slate-900 via-amber-950/30 to-slate-900 px-4 sm:px-6 py-3 sm:py-4 border-b border-slate-800 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                        <div className="p-1.5 sm:p-2 rounded-xl bg-gradient-to-br from-amber-500 to-yellow-500 text-slate-950 shadow-lg shadow-amber-500/20 font-black shrink-0">
                            <Sparkles size={18} className="sm:w-5 sm:h-5" />
                        </div>
                        <div className="min-w-0">
                            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                                <h2 className="text-sm sm:text-lg font-black text-white tracking-tight truncate">
                                    Gemini 3 Pro 4K
                                </h2>
                                <span className="px-1.5 sm:px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                                    Ultra 4K
                                </span>
                            </div>
                            <p className="text-[11px] sm:text-xs text-slate-400 truncate hidden xs:block">
                                Renderização nativa de alta fidelidade óptica com super-resolução.
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={onClose}
                        disabled={isGenerating}
                        className="p-1.5 sm:p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors disabled:opacity-50 shrink-0 min-h-[38px] min-w-[38px] flex items-center justify-center"
                        title="Fechar (Esc)"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Body Content: Grid com Controles e Preview */}
                <div className="flex-1 overflow-y-auto p-5 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 custom-scrollbar">
                    {/* Painel Esquerdo: Controles e Configurações (7 colunas) */}
                    <div className="lg:col-span-7 flex flex-col gap-4">
                        {/* Seletor de Modo: Criar vs Editar */}
                        <div className="flex items-center gap-2 p-1.5 bg-slate-950/70 border border-slate-800 rounded-xl">
                            <button
                                type="button"
                                onClick={() => {
                                    setEditorMode('create');
                                    if (model === 'gemini-3.1-flash-image-preview') {
                                        // keep or allow user to switch
                                    }
                                }}
                                className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                                    editorMode === 'create'
                                        ? 'bg-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/20'
                                        : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                                }`}
                            >
                                <Sparkles size={14} />
                                <span>Criar Nova Imagem</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => {
                                    setEditorMode('edit');
                                    setModel('gemini-3.1-flash-image-preview');
                                    setUseReferenceImage(true);
                                }}
                                className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                                    editorMode === 'edit'
                                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black shadow-md shadow-blue-500/20 ring-1 ring-blue-400'
                                        : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                                }`}
                            >
                                <Wand2 size={14} className={editorMode === 'edit' ? 'text-cyan-300' : 'text-blue-400'} />
                                <span>Editar Imagem com Texto (Preview)</span>
                            </button>
                        </div>

                        {/* Prompt Input e Ações Rápidas */}
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                                    <Zap size={14} className={editorMode === 'edit' ? 'text-blue-400' : 'text-amber-400'} />
                                    <span>
                                        {editorMode === 'edit' 
                                            ? 'Instrução de Edição Textual (gemini-3.1-flash-image-preview)' 
                                            : 'Prompt de Geração / Remasterização'}
                                    </span>
                                </label>

                                <div className="flex items-center gap-2">
                                    {editorMode === 'create' && (
                                        <button
                                            type="button"
                                            onClick={handleApply16kRemaster}
                                            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-all flex items-center gap-1.5 ${
                                                is16kFormulaActive
                                                    ? 'bg-amber-500 text-slate-950 border-amber-400 font-extrabold'
                                                    : 'bg-amber-500/10 border-amber-500/30 text-amber-300 hover:bg-amber-500/20'
                                            }`}
                                        >
                                            <Award size={12} />
                                            <span>{is16kFormulaActive ? '✓ 16K Remaster Ativo' : '+ Adicionar 16K Remaster'}</span>
                                        </button>
                                    )}

                                    <button
                                        type="button"
                                        onClick={handleCopyPrompt}
                                        className="p-1 text-slate-400 hover:text-white transition-colors"
                                        title="Copiar Prompt"
                                    >
                                        {copied ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
                                    </button>
                                </div>
                            </div>

                            <div className="relative">
                                <textarea
                                    value={promptText}
                                    onChange={(e) => setPromptText(e.target.value)}
                                    placeholder={
                                        editorMode === 'edit'
                                            ? "Ex: Substitua o fundo por uma praia com pôr do sol dourado, adicione óculos escuros estilo aviador e aumente a iluminação de estúdio..."
                                            : "Descreva a imagem que deseja gerar ou aperfeiçoar em 4K com Gemini 3 Pro..."
                                    }
                                    rows={4}
                                    className={`w-full bg-slate-950 border rounded-xl p-3.5 text-xs text-slate-200 font-mono outline-none resize-none leading-relaxed custom-scrollbar shadow-inner ${
                                        editorMode === 'edit' ? 'border-blue-500/50 focus:border-blue-400' : 'border-slate-700/80 focus:border-amber-500'
                                    }`}
                                />
                                <div className="absolute bottom-2.5 right-3 text-[10px] text-slate-500 font-mono">
                                    {promptText.length} caracteres
                                </div>
                            </div>

                            {/* Sugestões Rápidas de Edição quando no Modo Editar */}
                            {editorMode === 'edit' && (
                                <div className="space-y-1.5 pt-1">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                                        <Wand2 size={11} className="text-blue-400" /> Sugestões Rápidas de Edição:
                                    </span>
                                    <div className="flex flex-wrap gap-1.5">
                                        {[
                                            { label: '🌅 Pôr do Sol na Praia', text: 'Substitua o fundo por uma praia tropical ao pôr do sol com iluminação dourada cinematográfica' },
                                            { label: '🕶️ Óculos Aviador', text: 'Adicione óculos escuros estilo aviador com reflexo realista nas lentes' },
                                            { label: '🏙️ Metrópole Cyberpunk', text: 'Altere o cenário de fundo para uma metrópole futurista com luzes de neon azul e roxo' },
                                            { label: '💡 Luz de Estúdio High-End', text: 'Ajuste a iluminação para um esquema profissional de estúdio fotográfico com softbox suave' },
                                            { label: '✨ Nitidez & Textura', text: 'Aumente a nitidez dos detalhes ópticos, remova ruídos e aprimore a textura realista' },
                                            { label: '🎨 Pintura a Óleo', text: 'Transforme o estilo visual em uma obra de arte com pinceladas texturizadas de tinta a óleo' }
                                        ].map((chip, idx) => (
                                            <button
                                                key={idx}
                                                type="button"
                                                onClick={() => {
                                                    setPromptText(prev => prev ? `${prev}. ${chip.text}` : chip.text);
                                                }}
                                                className="px-2 py-1 rounded-md text-[10px] font-medium bg-blue-950/60 hover:bg-blue-900 border border-blue-800/60 text-blue-200 hover:text-white transition-all hover:scale-105"
                                            >
                                                {chip.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Configurações: Resolução 4K / 2K / 1K */}
                        <div className="space-y-2 bg-slate-950/60 p-4 rounded-xl border border-slate-800">
                            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                                <Sparkles size={13} className="text-amber-400" />
                                <span>Resolução de Saída (imageSize)</span>
                            </label>
                            
                            <div className="grid grid-cols-3 gap-2">
                                {(["4K", "2K", "1K"] as ImageResolution[]).map((res) => {
                                    const isSelected = resolution === res;
                                    return (
                                        <button
                                            key={res}
                                            type="button"
                                            onClick={() => setResolution(res)}
                                            className={`py-2.5 px-3 rounded-xl border text-center transition-all relative ${
                                                isSelected
                                                    ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 border-amber-400 font-black shadow-lg shadow-amber-500/20'
                                                    : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                                            }`}
                                        >
                                            <div className="text-xs font-black">{res} {res === '4K' ? 'Ultra HD' : res === '2K' ? 'Quad HD' : 'Full HD'}</div>
                                            <div className={`text-[10px] ${isSelected ? 'text-slate-900/80' : 'text-slate-500'} font-mono`}>
                                                {res === '4K' ? '3840×2160 / 4K' : res === '2K' ? '2048px' : '1024px'}
                                            </div>
                                            {res === '4K' && !isSelected && (
                                                <span className="absolute -top-2 right-2 px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 text-[9px] font-bold border border-amber-500/30">
                                                    Pro
                                                </span>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Configurações: Proporção (Aspect Ratio) */}
                        <div className="space-y-2 bg-slate-950/60 p-4 rounded-xl border border-slate-800">
                            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                                <Sliders size={13} className="text-blue-400" />
                                <span>Proporção (Aspect Ratio)</span>
                            </label>
                            
                            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                                {[
                                    { value: '1:1', label: '1:1 Quadrado', desc: 'Feed / Avatar' },
                                    { value: '16:9', label: '16:9 Paisagem', desc: 'Cinema / YouTube' },
                                    { value: '9:16', label: '9:16 Vertical', desc: 'Stories / Reels' },
                                    { value: '4:3', label: '4:3 Clássico', desc: 'Fotografia' },
                                    { value: '3:4', label: '3:4 Retrato', desc: 'Poster' },
                                ].map((ratio) => {
                                    const isSelected = aspectRatio === ratio.value;
                                    return (
                                        <button
                                            key={ratio.value}
                                            type="button"
                                            onClick={() => setAspectRatio(ratio.value as ImageAspectRatio)}
                                            className={`p-2 rounded-xl border text-center transition-all ${
                                                isSelected
                                                    ? 'bg-blue-600/30 border-blue-400 text-white font-bold'
                                                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                                            }`}
                                        >
                                            <div className="text-xs font-bold">{ratio.value}</div>
                                            <div className="text-[9px] text-slate-500 truncate">{ratio.desc}</div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Seleção de Modelo e Imagem de Referência */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {/* Modelo */}
                            <div className="space-y-1.5 bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                                <label className="text-[10px] font-bold text-slate-400 uppercase">
                                    Motor de IA
                                </label>
                                <select
                                    value={model}
                                    onChange={(e) => setModel(e.target.value as ImageGenModel)}
                                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-slate-200 outline-none focus:border-amber-500"
                                >
                                    <option value="gemini-3.1-flash-image-preview">Gemini 3.1 Flash Image Preview (Criar & Editar)</option>
                                    <option value="gemini-3-pro-image">Gemini 3 Pro Image (Ultra 4K Master)</option>
                                    <option value="gemini-3.1-flash-image">Gemini 3.1 Flash Image (Rápido 4K)</option>
                                    <option value="gemini-3.1-flash-lite-image">Gemini 3.1 Flash Lite (Econômico)</option>
                                </select>
                            </div>

                            {/* Imagem de Referência */}
                            <div className="space-y-1.5 bg-slate-950/60 p-3 rounded-xl border border-slate-800 flex flex-col justify-between">
                                <div className="flex items-center justify-between">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
                                        <ImageIcon size={12} />
                                        <span>Imagem de Referência</span>
                                    </label>
                                    {activeImage?.previewUrl && (
                                        <span className="text-[10px] text-emerald-400 font-bold">Disponível</span>
                                    )}
                                </div>

                                {activeImage?.previewUrl ? (
                                    <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                                        <input
                                            type="checkbox"
                                            checked={useReferenceImage}
                                            onChange={(e) => setUseReferenceImage(e.target.checked)}
                                            className="rounded border-slate-700 text-amber-500 focus:ring-amber-500"
                                        />
                                        <span className="text-[11px] truncate">
                                            {editorMode === 'edit' ? 'Editar a imagem ' : 'Usar '}
                                            <strong className="text-white">{activeImage.name || 'imagem'}</strong>
                                        </span>
                                    </label>
                                ) : (
                                    <span className="text-[10px] text-slate-500">
                                        Nenhuma imagem ativa (geração texto-para-imagem pura)
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Mensagem de Erro */}
                        {error && (
                            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
                                {error}
                            </div>
                        )}

                        {/* Botão de Ação Principal */}
                        <div className="pt-2">
                            <button
                                type="button"
                                onClick={handleGenerate}
                                disabled={isGenerating || !promptText.trim()}
                                className={`w-full py-4 rounded-xl font-black text-sm tracking-wide shadow-xl flex items-center justify-center gap-2.5 transition-all active:scale-98 disabled:opacity-50 ${
                                    editorMode === 'edit'
                                        ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-blue-500/25 ring-1 ring-blue-400'
                                        : 'bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 hover:from-amber-400 hover:to-yellow-400 text-slate-950 shadow-amber-500/20'
                                }`}
                            >
                                {isGenerating ? (
                                    <>
                                        <Loader2 size={18} className={`animate-spin ${editorMode === 'edit' ? 'text-white' : 'text-slate-950'}`} />
                                        <span>
                                            {editorMode === 'edit' 
                                                ? `Editando com ${model}... (${elapsedTime}s)` 
                                                : `Gerando Imagem ${resolution} com ${model}... (${elapsedTime}s)`}
                                        </span>
                                    </>
                                ) : (
                                    <>
                                        {editorMode === 'edit' ? (
                                            <>
                                                <Wand2 size={18} className="text-cyan-300" />
                                                <span>Executar Edição com {model}</span>
                                            </>
                                        ) : (
                                            <>
                                                <Sparkles size={18} className="text-slate-950" />
                                                <span>Gerar Imagem {resolution} ({model})</span>
                                            </>
                                        )}
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Painel Direito: Preview da Imagem Gerada / Comparador (5 colunas) */}
                    <div className="lg:col-span-5 flex flex-col h-full bg-slate-950/70 rounded-2xl border border-slate-800 p-4 relative min-h-[380px]">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 mb-3">
                            <div className="text-xs font-bold text-slate-300 flex items-center gap-2">
                                <Eye size={14} className={editorMode === 'edit' ? 'text-blue-400' : 'text-amber-400'} />
                                <span>{editorMode === 'edit' ? 'Resultado da Edição' : 'Resultado da Renderização'}</span>
                            </div>

                            {generatedUrl && (
                                <div className="flex items-center gap-2">
                                    {onSetAsActiveImage && (
                                        <button
                                            type="button"
                                            onClick={() => onSetAsActiveImage(generatedUrl)}
                                            className="px-2.5 py-1 rounded-lg bg-blue-600/30 text-blue-300 hover:bg-blue-600/50 hover:text-white border border-blue-500/40 text-[11px] font-bold flex items-center gap-1.5 transition-all"
                                            title="Usar esta imagem como imagem ativa no app"
                                        >
                                            <Layers size={13} />
                                            <span>Usar no App</span>
                                        </button>
                                    )}
                                    <button
                                        onClick={handleDownload}
                                        className="p-1.5 rounded-lg bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 transition-colors"
                                        title="Baixar PNG"
                                    >
                                        <Download size={14} />
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Área Principal de Exibição */}
                        <div className="flex-1 flex flex-col items-center justify-center relative rounded-xl overflow-hidden bg-slate-900/80 border border-slate-800/60 min-h-[280px]">
                            {isGenerating ? (
                                <div className="flex flex-col items-center justify-center p-6 text-center space-y-3">
                                    <div className="relative">
                                        <div className="w-16 h-16 rounded-full border-4 border-amber-500/20 border-t-amber-400 animate-spin" />
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <Sparkles size={20} className="text-amber-400 animate-pulse" />
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-xs font-bold text-white">Processando com Gemini 3 Pro</p>
                                        <p className="text-[11px] text-amber-300 font-mono">
                                            Renderizando detalhes 4K em super-resolução... ({elapsedTime}s)
                                        </p>
                                    </div>
                                </div>
                            ) : generatedUrl ? (
                                useReferenceImage && activeImage?.previewUrl ? (
                                    /* Comparador Slider Antes / Depois */
                                    <div
                                        ref={sliderContainerRef}
                                        onPointerDown={handlePointerDown}
                                        onPointerMove={handlePointerMove}
                                        onPointerUp={handlePointerUp}
                                        className="relative w-full h-full min-h-[260px] sm:min-h-[300px] select-none cursor-ew-resize overflow-hidden touch-none"
                                    >
                                        {/* Imagem Gerada 4K (Depois) */}
                                        <img
                                            src={generatedUrl}
                                            alt="Gemini 3 Pro 4K Render"
                                            className="absolute inset-0 w-full h-full object-contain pointer-events-none select-none"
                                            referrerPolicy="no-referrer"
                                        />

                                        {/* Imagem Original (Antes) com clip-path */}
                                        <div
                                            className="absolute inset-0 overflow-hidden pointer-events-none select-none"
                                            style={{ clipPath: `inset(0 ${100 - sliderPos}% 0 0)` }}
                                        >
                                            <img
                                                src={activeImage.previewUrl}
                                                alt="Original"
                                                className="absolute inset-0 w-full h-full object-contain pointer-events-none select-none"
                                                referrerPolicy="no-referrer"
                                            />
                                        </div>

                                        {/* Linha Divisória do Slider */}
                                        <div
                                            className="absolute top-0 bottom-0 w-1 bg-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.8)] pointer-events-none"
                                            style={{ left: `${sliderPos}%` }}
                                        >
                                            <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 sm:w-7 sm:h-7 rounded-full bg-slate-900 border-2 border-amber-400 flex items-center justify-center shadow-xl touch-none">
                                                <Sparkles size={14} className="text-amber-400" />
                                            </div>
                                        </div>

                                        {/* Etiquetas Antes/Depois */}
                                        <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-slate-950/80 text-[9px] font-bold text-slate-300 pointer-events-none">
                                            Original
                                        </div>
                                        <div className="absolute top-2 right-2 px-2 py-0.5 rounded bg-amber-500/80 text-[9px] font-black text-slate-950 pointer-events-none">
                                            Gemini 3 Pro 4K
                                        </div>
                                    </div>
                                ) : (
                                    /* Visualização Individual */
                                    <div className="relative w-full h-full min-h-[300px] flex items-center justify-center p-2">
                                        <img
                                            src={generatedUrl}
                                            alt="Gemini 3 Pro 4K Generated"
                                            className="max-h-[360px] w-auto object-contain rounded-lg shadow-xl"
                                            referrerPolicy="no-referrer"
                                        />
                                    </div>
                                )
                            ) : (
                                <div className="flex flex-col items-center justify-center p-8 text-center text-slate-500 space-y-2">
                                    <div className="p-3 rounded-full bg-slate-800/80 text-slate-600">
                                        <ImageIcon size={28} />
                                    </div>
                                    <p className="text-xs text-slate-400">Nenhuma imagem gerada nesta sessão ainda.</p>
                                    <p className="text-[10px] text-slate-600 max-w-xs">
                                        Configure o prompt e clique no botão dourado para renderizar em resolução 4K Ultra HD.
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Histórico Recente de Imagens 4K */}
                        {generationHistory.length > 1 && (
                            <div className="mt-3 pt-3 border-t border-slate-800/80">
                                <div className="text-[10px] font-bold text-slate-400 uppercase mb-2">
                                    Histórico de Gerações Recentes
                                </div>
                                <div className="flex gap-2 overflow-x-auto pb-1 custom-scrollbar">
                                    {generationHistory.map((item, idx) => (
                                        <button
                                            key={idx}
                                            type="button"
                                            onClick={() => {
                                                setGeneratedUrl(item.url);
                                                setPromptText(item.prompt);
                                            }}
                                            className={`relative shrink-0 w-12 h-12 rounded-lg overflow-hidden border transition-all ${
                                                generatedUrl === item.url ? 'border-amber-400 scale-105' : 'border-slate-800 opacity-60 hover:opacity-100'
                                            }`}
                                        >
                                            <img
                                                src={item.url}
                                                alt={`History ${idx}`}
                                                className="w-full h-full object-cover"
                                                referrerPolicy="no-referrer"
                                            />
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer do Modal */}
                <div className="bg-slate-950 px-6 py-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-500">
                    <div className="flex items-center gap-2">
                        <ShieldCheck size={14} className="text-amber-400" />
                        <span>Fidelidade Óptica e Super-Resolução Gemini 3 Pro</span>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium transition-colors"
                        >
                            Fechar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
