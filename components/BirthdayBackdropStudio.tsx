import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
    PartyPopper,
    Cake,
    Circle,
    Frame,
    Layers,
    Type,
    Palette,
    Sparkles,
    Download,
    ZoomIn,
    ZoomOut,
    RotateCcw,
    Copy,
    Trash2,
    Eye,
    EyeOff,
    Lock,
    Unlock,
    Sliders,
    Upload,
    Ruler,
    Shield,
    CheckCircle2,
    AlertCircle,
    ArrowUp,
    ArrowDown,
    Plus,
    Maximize2,
    Scissors,
    FileText,
    Printer,
    Move,
    Check,
    Image as ImageIcon,
    SplitSquareVertical,
    Heart,
    Square,
    Star,
    Camera
} from 'lucide-react';
import {
    BackdropState,
    BackdropLayer,
    BackdropTextLayer,
    BackdropClipartLayer,
    ImageMaskShape,
    ImageBorderStyle,
    ImageShadowStyle,
    ImageFilterTreatment,
    PANEL_SIZE_PRESETS,
    THEME_PRESETS,
    PARTY_CLIPART_ITEMS,
    PanelSizePreset,
    createInitialBackdropState,
    renderBackdropToCanvas,
    downloadBackdrop
} from '../services/birthdayBackdropService';
import type { UploadedImage } from '../types';

interface BirthdayBackdropStudioProps {
    availableImages?: UploadedImage[];
    onBackToArchitect?: () => void;
    onOpenBgRemover?: () => void;
    onOpenPanelSplitter?: (imageUrl?: string) => void;
    initialImportedImage?: string | null;
}

type TabType = 'format' | 'reference' | 'theme' | 'text' | 'cliparts' | 'layers' | 'export';

export const BirthdayBackdropStudio: React.FC<BirthdayBackdropStudioProps> = ({
    availableImages = [],
    onBackToArchitect,
    onOpenBgRemover,
    onOpenPanelSplitter,
    initialImportedImage
}) => {
    const [state, setState] = useState<BackdropState>(() => createInitialBackdropState());
    const [activeTab, setActiveTab] = useState<TabType>('format');
    const [selectedLayerId, setSelectedLayerId] = useState<string | null>('layer_text_name');
    
    // Imagem de Referência do Usuário (Foto do Aniversariante, Bolo, Painel de Inspiração ou Modelo)
    const [referenceImageUrl, setReferenceImageUrl] = useState<string | null>(() => {
        if (initialImportedImage) return initialImportedImage;
        if (availableImages.length > 0) {
            const first = availableImages[0];
            return first.previewUrl || (first.base64Data ? `data:${first.mimeType || 'image/png'};base64,${first.base64Data}` : null);
        }
        return null;
    });
    const [referenceImageName, setReferenceImageName] = useState<string>(() => {
        if (availableImages.length > 0 && availableImages[0].name) return availableImages[0].name;
        return 'Minha Imagem de Referência';
    });
    const [showReferenceOverlay, setShowReferenceOverlay] = useState<boolean>(false);
    const [referenceOverlayOpacity, setReferenceOverlayOpacity] = useState<number>(0.45);
    const [referenceComparisonMode, setReferenceComparisonMode] = useState<'overlay' | 'sideBySide'>('overlay');
    const referenceFileInputRef = useRef<HTMLInputElement | null>(null);

    // Zoom & Visualização
    const [zoom, setZoom] = useState<number>(1);
    const [isRendering, setIsRendering] = useState<boolean>(false);
    const [exportFormat, setExportFormat] = useState<'pdf' | 'png' | 'jpeg' | 'webp'>('png');
    const [exportResolution, setExportResolution] = useState<1 | 2>(1);
    const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);
    const [downloadError, setDownloadError] = useState<string | null>(null);

    // Canvas de Exibição
    const displayCanvasRef = useRef<HTMLCanvasElement | null>(null);
    const customImageCacheRef = useRef<Map<string, HTMLImageElement>>(new Map());
    const customBgInputRef = useRef<HTMLInputElement | null>(null);
    const clipartUploadInputRef = useRef<HTMLInputElement | null>(null);

    // Preset de Tamanho Atual
    const currentPreset = PANEL_SIZE_PRESETS.find(p => p.id === state.sizePresetId) || PANEL_SIZE_PRESETS[0];

    // Camada selecionada
    const selectedLayer = state.layers.find(l => l.id === selectedLayerId) || null;

    // Renderiza canvas em memória e copia para o display
    const refreshCanvas = useCallback(async () => {
        setIsRendering(true);
        try {
            const master = await renderBackdropToCanvas(state, 1200, customImageCacheRef.current);
            const display = displayCanvasRef.current;
            if (display) {
                display.width = master.width;
                display.height = master.height;
                const ctx = display.getContext('2d');
                if (ctx) {
                    ctx.clearRect(0, 0, master.width, master.height);
                    ctx.drawImage(master, 0, 0);
                }
            }
        } catch (err) {
            console.error("Erro ao desenhar painel:", err);
        } finally {
            setIsRendering(false);
        }
    }, [state]);

    useEffect(() => {
        refreshCanvas();
    }, [refreshCanvas]);

    // Aplica tema completo pré-montado
    const handleApplyTheme = (themeId: string) => {
        const theme = THEME_PRESETS.find(t => t.id === themeId);
        if (!theme) return;

        setState(prev => {
            // Atualiza camadas de texto com os textos e fontes sugeridos do tema
            const updatedLayers = prev.layers.map(layer => {
                if (layer.id === 'layer_text_name' && layer.type === 'text') {
                    return {
                        ...layer,
                        text: theme.suggestedText.name,
                        fontFamily: theme.suggestedFonts[0] || layer.fontFamily,
                        textColor: '#ffffff',
                        strokeColor: theme.accentColor,
                        secondaryStrokeColor: theme.primaryColor,
                        gradientFrom: '#ffffff',
                        gradientTo: theme.secondaryColor
                    };
                }
                if (layer.id === 'layer_text_age' && layer.type === 'text') {
                    return {
                        ...layer,
                        text: theme.suggestedText.age,
                        strokeColor: theme.accentColor,
                        secondaryStrokeColor: theme.primaryColor
                    };
                }
                return layer;
            });

            return {
                ...prev,
                themeId: theme.id,
                backgroundColor: theme.secondaryColor,
                backgroundStyle: theme.backgroundStyle,
                layers: updatedLayers
            };
        });
    };

    // Atualiza campo de uma camada
    const updateLayer = (layerId: string, updates: Partial<BackdropLayer>) => {
        setState(prev => ({
            ...prev,
            layers: prev.layers.map(l => l.id === layerId ? ({ ...l, ...updates } as BackdropLayer) : l)
        }));
    };

    // Adiciona novo texto
    const handleAddText = () => {
        const newId = `text_${Date.now()}`;
        const newLayer: BackdropTextLayer = {
            id: newId,
            type: 'text',
            text: 'PARABÉNS',
            x: 50,
            y: 50,
            fontSize: 48,
            fontFamily: 'Arial Black',
            fontWeight: 'bold',
            textColor: '#ffffff',
            textAlign: 'center',
            isCurved: false,
            curveRadius: 250,
            curveDirection: 'up',
            strokeColor: '#78350f',
            strokeWidth: 6,
            secondaryStrokeColor: '#eab308',
            secondaryStrokeWidth: 12,
            gradientFill: true,
            gradientFrom: '#ffffff',
            gradientTo: '#fef08a',
            dropShadow: true,
            shadowColor: 'rgba(0,0,0,0.4)',
            shadowBlur: 10,
            shadowOffsetY: 6,
            rotation: 0,
            opacity: 1,
            visible: true,
            locked: false
        };

        setState(prev => ({ ...prev, layers: [...prev.layers, newLayer] }));
        setSelectedLayerId(newId);
        setActiveTab('text');
    };

    // Adiciona clipart de festa
    const handleAddClipart = (clipartType: string) => {
        const newId = `clipart_${Date.now()}`;
        const newLayer: BackdropClipartLayer = {
            id: newId,
            type: 'clipart',
            clipartType,
            x: 50,
            y: 50,
            width: 50,
            height: 50,
            rotation: 0,
            opacity: 1,
            flipH: false,
            flipV: false,
            visible: true,
            locked: false
        };

        setState(prev => ({ ...prev, layers: [...prev.layers, newLayer] }));
        setSelectedLayerId(newId);
    };

    // Remove camada
    const handleDeleteLayer = (layerId: string) => {
        setState(prev => ({ ...prev, layers: prev.layers.filter(l => l.id !== layerId) }));
        if (selectedLayerId === layerId) {
            setSelectedLayerId(null);
        }
    };

    // Duplica camada
    const handleDuplicateLayer = (layerId: string) => {
        const target = state.layers.find(l => l.id === layerId);
        if (!target) return;
        const copy: BackdropLayer = {
            ...target,
            id: `layer_${Date.now()}`,
            x: Math.min(90, target.x + 4),
            y: Math.min(90, target.y + 4)
        };
        setState(prev => ({ ...prev, layers: [...prev.layers, copy] }));
        setSelectedLayerId(copy.id);
    };

    // Reordenar camada (trazer para frente / enviar para trás)
    const handleMoveLayerOrder = (layerId: string, direction: 'up' | 'down') => {
        setState(prev => {
            const index = prev.layers.findIndex(l => l.id === layerId);
            if (index < 0) return prev;
            const newIndex = direction === 'up' ? index + 1 : index - 1;
            if (newIndex < 0 || newIndex >= prev.layers.length) return prev;

            const newLayers = [...prev.layers];
            const [moved] = newLayers.splice(index, 1);
            newLayers.splice(newIndex, 0, moved);
            return { ...prev, layers: newLayers };
        });
    };

    // Upload de imagem ou personagem recortado
    const handleUploadCustomClipart = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const dataUrl = event.target?.result as string;
            const newId = `custom_img_${Date.now()}`;
            const newLayer: BackdropClipartLayer = {
                id: newId,
                type: 'custom_image',
                clipartType: 'custom',
                dataUrl,
                x: 50,
                y: 50,
                width: 45,
                height: 45,
                rotation: 0,
                opacity: 1,
                flipH: false,
                flipV: false,
                visible: true,
                locked: false
            };
            setState(prev => ({ ...prev, layers: [...prev.layers, newLayer] }));
            setSelectedLayerId(newId);
        };
        reader.readAsDataURL(file);
    };

    // Handlers para Minha Imagem de Referência
    const handleUploadReferenceImage = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const dataUrl = event.target?.result as string;
            setReferenceImageUrl(dataUrl);
            setReferenceImageName(file.name);
            setShowReferenceOverlay(true);
        };
        reader.readAsDataURL(file);
    };

    const handleSelectAvailableAsReference = (img: UploadedImage) => {
        const url = img.previewUrl || (img.base64Data ? `data:${img.mimeType || 'image/png'};base64,${img.base64Data}` : null);
        if (url) {
            setReferenceImageUrl(url);
            setReferenceImageName(img.name);
        }
    };

    const handleAddReferenceAsLayer = (styleOptions?: Partial<BackdropClipartLayer>) => {
        if (!referenceImageUrl) return;
        const newId = `ref_elem_${Date.now()}`;
        const newLayer: BackdropClipartLayer = {
            id: newId,
            type: 'custom_image',
            clipartType: referenceImageName || 'Foto de Referência',
            dataUrl: referenceImageUrl,
            x: 50,
            y: 50,
            width: 40,
            height: 40,
            rotation: 0,
            opacity: 1,
            flipH: false,
            flipV: false,
            visible: true,
            locked: false,
            maskShape: 'none',
            borderStyle: 'none',
            shadowStyle: 'soft_3d',
            filterTreatment: 'none',
            ...styleOptions
        };
        setState(prev => ({ ...prev, layers: [...prev.layers, newLayer] }));
        setSelectedLayerId(newId);
        setActiveTab('layers');
    };

    const handleSetReferenceAsBackground = () => {
        if (!referenceImageUrl) return;
        setState(prev => ({
            ...prev,
            backgroundStyle: 'custom_bg',
            customBgUrl: referenceImageUrl
        }));
    };

    // Download em Alta Definição para Gráfica
    const handleDownload = async () => {
        try {
            setDownloadSuccess(null);
            setDownloadError(null);
            // Renderiza em resolução gráfica de alta fidelidade
            const targetWidthPx = exportResolution === 2 ? 3600 : 2000;
            const master = await renderBackdropToCanvas(state, targetWidthPx, customImageCacheRef.current);
            await downloadBackdrop(master, exportFormat, 'painel-aniversario-arte', currentPreset);
            setDownloadSuccess(`Arquivo ${exportFormat.toUpperCase()} gerado com sucesso em alta resolução!`);
            setTimeout(() => setDownloadSuccess(null), 6000);
        } catch (err: any) {
            console.error("Erro no download:", err);
            setDownloadError(`Falha ao exportar arte: ${err?.message || 'Tente novamente'}`);
        }
    };

    return (
        <div className="w-full space-y-4">
            {/* Header com Navegação e Resumo de Medidas Reais */}
            <div className="bg-slate-900/95 border border-slate-800 rounded-2xl p-4 sm:p-5 backdrop-blur-md shadow-2xl">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-gradient-to-tr from-pink-500 via-amber-400 to-rose-500 text-slate-950 font-black shadow-lg shadow-pink-500/20">
                            <PartyPopper size={24} />
                        </div>
                        <div>
                            <div className="flex items-center gap-2 flex-wrap">
                                <h1 className="text-base sm:text-lg font-black text-white tracking-wide flex items-center gap-2">
                                    <span>Criador de Painel de Aniversário & Topo de Bolo</span>
                                    <span className="text-[10px] bg-pink-500 text-slate-950 font-black px-2 py-0.5 rounded-full">
                                        PRO FESTA
                                    </span>
                                </h1>
                            </div>
                            <p className="text-xs text-slate-400 mt-0.5">
                                Sublimação de Painel Redondo, Arco Romano, Trio de Cilindros, Banners e Topos de Bolo com sangria e corte
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
                        {onOpenBgRemover && (
                            <button
                                type="button"
                                onClick={onOpenBgRemover}
                                className="px-3 py-2 text-xs font-bold text-teal-300 bg-teal-950/60 hover:bg-teal-900/80 rounded-lg border border-teal-500/40 transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
                                title="Recortar foto de aniversariante ou personagem para adicionar ao painel"
                            >
                                <Scissors size={14} />
                                <span>Recortar Personagem</span>
                            </button>
                        )}
                        {onOpenPanelSplitter && (
                            <button
                                type="button"
                                onClick={() => {
                                    if (displayCanvasRef.current) {
                                        const dataUrl = displayCanvasRef.current.toDataURL('image/png');
                                        onOpenPanelSplitter(dataUrl);
                                    } else if (referenceImageUrl) {
                                        onOpenPanelSplitter(referenceImageUrl);
                                    }
                                }}
                                className="px-3 py-2 text-xs font-bold text-cyan-300 bg-cyan-950/60 hover:bg-cyan-900/80 rounded-lg border border-cyan-500/40 transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
                                title="Fatiar este painel em folhas A4 ou A3 com sangria e abas de cola (FatiArt & Encantiva)"
                            >
                                <Scissors size={14} className="text-cyan-400" />
                                <span>Fatiar A4/A3 (FatiArt)</span>
                            </button>
                        )}
                        <button
                            type="button"
                            onClick={() => { setActiveTab('export'); handleDownload(); }}
                            className="px-4 py-2 text-xs font-black text-slate-950 bg-gradient-to-r from-pink-400 via-amber-300 to-rose-400 hover:from-pink-300 hover:to-rose-300 rounded-lg shadow-lg shadow-pink-500/20 transition-all flex items-center gap-1.5 active:scale-95 cursor-pointer"
                        >
                            <Download size={14} />
                            <span>Exportar Arte HD</span>
                        </button>
                    </div>
                </div>

                {/* Especificação do Painel Atual */}
                <div className="mt-3.5 pt-3 border-t border-slate-800/80 flex items-center justify-between gap-3 flex-wrap text-xs">
                    <div className="flex items-center gap-2 flex-wrap text-slate-300">
                        <span className="font-bold text-pink-400 flex items-center gap-1">
                            <Ruler size={13} />
                            <span>{currentPreset.name}</span>
                        </span>
                        <span className="text-slate-500">•</span>
                        <span>Medida Real: <strong className="text-white font-mono">{currentPreset.widthCm} × {currentPreset.heightCm} cm</strong></span>
                        <span className="text-slate-500">•</span>
                        <span>Sangria para Elástico: <strong className="text-amber-300 font-mono">+{currentPreset.bleedMarginCm} cm</strong></span>
                        <span className="text-slate-500">•</span>
                        <span>Área: <strong className="text-emerald-400 font-mono">{((currentPreset.widthCm * currentPreset.heightCm) / 10000).toFixed(2)} m²</strong></span>
                    </div>

                    <div className="flex items-center gap-1.5 ml-auto">
                        <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Guias da Gráfica:</span>
                        <button
                            type="button"
                            onClick={() => setState(prev => ({ ...prev, showBleedGuide: !prev.showBleedGuide }))}
                            className={`px-2 py-0.5 rounded text-[10px] font-bold border transition-all cursor-pointer ${
                                state.showBleedGuide ? 'bg-red-500/20 border-red-500 text-red-300' : 'bg-slate-800 border-slate-700 text-slate-500'
                            }`}
                            title="Linha pontilhada vermelha indicando onde a costura do elástico será aplicada"
                        >
                            Sangria ({currentPreset.bleedMarginCm}cm)
                        </button>
                        <button
                            type="button"
                            onClick={() => setState(prev => ({ ...prev, showSafetyGuide: !prev.showSafetyGuide }))}
                            className={`px-2 py-0.5 rounded text-[10px] font-bold border transition-all cursor-pointer ${
                                state.showSafetyGuide ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300' : 'bg-slate-800 border-slate-700 text-slate-500'
                            }`}
                            title="Área segura onde textos e elementos não correm risco de corte"
                        >
                            Segurança
                        </button>
                        <button
                            type="button"
                            onClick={() => setState(prev => ({ ...prev, showCenterAxes: !prev.showCenterAxes }))}
                            className={`px-2 py-0.5 rounded text-[10px] font-bold border transition-all cursor-pointer ${
                                state.showCenterAxes ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300' : 'bg-slate-800 border-slate-700 text-slate-500'
                            }`}
                            title="Eixos centrais para alinhamento simétrico do nome e elementos"
                        >
                            Eixos
                        </button>
                    </div>
                </div>
            </div>

            {/* Layout Principal: Ferramentas (Esquerda) + Canvas Interativo (Direita) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                {/* Coluna de Ferramentas com Abas */}
                <div className="lg:col-span-5 xl:col-span-4 space-y-4">
                    {/* Abas de Ferramentas de Festa */}
                    <div className="grid grid-cols-7 gap-1 bg-slate-900/90 p-1.5 rounded-2xl border border-slate-800 shadow-xl">
                        {[
                            { id: 'format', label: 'Tamanho', icon: Ruler },
                            { id: 'reference', label: 'Referência', icon: ImageIcon },
                            { id: 'theme', label: 'Temas', icon: Palette },
                            { id: 'text', label: 'Nome/3D', icon: Type },
                            { id: 'cliparts', label: 'Balões', icon: PartyPopper },
                            { id: 'layers', label: 'Camadas', icon: Layers },
                            { id: 'export', label: 'Gráfica', icon: Download }
                        ].map(tab => (
                            <button
                                key={tab.id}
                                type="button"
                                onClick={() => setActiveTab(tab.id as TabType)}
                                className={`py-2 px-1 rounded-xl text-[10px] font-black uppercase transition-all flex flex-col items-center gap-1 cursor-pointer ${
                                    activeTab === tab.id
                                        ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-md font-bold'
                                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                                }`}
                            >
                                <tab.icon size={14} />
                                <span className="truncate max-w-full">{tab.label}</span>
                            </button>
                        ))}
                    </div>

                    {/* Conteúdo da Aba Ativa */}
                    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-4">
                        {/* ABA 1: Formato e Tamanho do Painel */}
                        {activeTab === 'format' && (
                            <div className="space-y-4 animate-in fade-in duration-200">
                                <div>
                                    <h2 className="text-xs font-black uppercase tracking-wider text-slate-200 flex items-center gap-1.5">
                                        <Ruler size={14} className="text-pink-400" />
                                        <span>Tamanho e Estrutura de Festa</span>
                                    </h2>
                                    <p className="text-[11px] text-slate-400 mt-0.5">
                                        Escolha o tamanho padrão da estrutura de ferro ou MDF da festa
                                    </p>
                                </div>

                                {/* Categorias Rápidas */}
                                <div className="space-y-2">
                                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                        Painel Redondo Sublimado (Mais Popular):
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        {PANEL_SIZE_PRESETS.filter(p => p.category === 'painel_redondo').map(preset => (
                                            <button
                                                key={preset.id}
                                                type="button"
                                                onClick={() => setState(prev => ({ ...prev, sizePresetId: preset.id }))}
                                                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                                                    state.sizePresetId === preset.id
                                                        ? 'bg-pink-500/20 border-pink-400 shadow-md ring-1 ring-pink-400'
                                                        : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                                                }`}
                                            >
                                                <div className="flex items-center gap-1.5">
                                                    <Circle size={12} className="text-pink-400" />
                                                    <span className="text-xs font-bold text-white">{preset.name.split(' (')[0]}</span>
                                                </div>
                                                <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                                                    {preset.widthCm}cm de diâmetro
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-2 pt-2 border-t border-slate-800">
                                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                        Arco Romano & Painéis Verticais:
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        {PANEL_SIZE_PRESETS.filter(p => p.category === 'arco_romano').map(preset => (
                                            <button
                                                key={preset.id}
                                                type="button"
                                                onClick={() => setState(prev => ({ ...prev, sizePresetId: preset.id }))}
                                                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                                                    state.sizePresetId === preset.id
                                                        ? 'bg-pink-500/20 border-pink-400 shadow-md ring-1 ring-pink-400'
                                                        : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                                                }`}
                                            >
                                                <div className="text-xs font-bold text-white truncate">{preset.name}</div>
                                                <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                                                    {preset.widthCm} × {preset.heightCm} cm
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-2 pt-2 border-t border-slate-800">
                                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                        Topos de Bolo & Papelaria:
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        {PANEL_SIZE_PRESETS.filter(p => p.category === 'topo_bolo').map(preset => (
                                            <button
                                                key={preset.id}
                                                type="button"
                                                onClick={() => setState(prev => ({ ...prev, sizePresetId: preset.id }))}
                                                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                                                    state.sizePresetId === preset.id
                                                        ? 'bg-pink-500/20 border-pink-400 shadow-md ring-1 ring-pink-400'
                                                        : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                                                }`}
                                            >
                                                <div className="flex items-center gap-1.5">
                                                    <Cake size={12} className="text-amber-400" />
                                                    <span className="text-xs font-bold text-white truncate">{preset.name.split(' (')[0]}</span>
                                                </div>
                                                <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                                                    {preset.widthCm} × {preset.heightCm} cm
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Ajustes de Efeito de Luz */}
                                <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                                    <span className="text-xs font-bold text-slate-300">Spotlight Central (Luz de Destaque):</span>
                                    <button
                                        type="button"
                                        onClick={() => setState(prev => ({ ...prev, spotlightLight: !prev.spotlightLight }))}
                                        className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                                            state.spotlightLight ? 'bg-pink-500' : 'bg-slate-700'
                                        }`}
                                    >
                                        <div className={`w-5 h-5 rounded-full bg-white transition-transform transform absolute top-0.5 ${
                                            state.spotlightLight ? 'translate-x-5' : 'translate-x-0.5'
                                        }`} />
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* ABA: Minha Imagem de Referência */}
                        {activeTab === 'reference' && (
                            <div className="space-y-4 animate-in fade-in duration-200">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h2 className="text-xs font-black uppercase tracking-wider text-slate-200 flex items-center gap-1.5">
                                            <ImageIcon size={14} className="text-pink-400" />
                                            <span>Minha Imagem de Referência</span>
                                        </h2>
                                        <p className="text-[11px] text-slate-400 mt-0.5">
                                            Carregue a foto do aniversariante, bolo, modelo ou inspiração do cliente
                                        </p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => referenceFileInputRef.current?.click()}
                                        className="px-2.5 py-1.5 rounded-lg bg-pink-500 hover:bg-pink-400 text-slate-950 font-black text-xs transition-all flex items-center gap-1 cursor-pointer shadow-md"
                                    >
                                        <Upload size={13} />
                                        <span>Carregar Foto</span>
                                    </button>
                                    <input
                                        ref={referenceFileInputRef}
                                        type="file"
                                        accept="image/*"
                                        onChange={handleUploadReferenceImage}
                                        className="hidden"
                                    />
                                </div>

                                {/* Imagem de Referência Ativa */}
                                {referenceImageUrl ? (
                                    <div className="space-y-3 p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                                        <div className="flex items-start gap-3">
                                            <div className="relative w-24 h-24 rounded-lg overflow-hidden border border-slate-700 bg-slate-900 shrink-0">
                                                <img
                                                    src={referenceImageUrl}
                                                    alt={referenceImageName}
                                                    className="w-full h-full object-contain"
                                                />
                                                <div className="absolute top-1 left-1 bg-pink-500 text-slate-950 text-[9px] font-black px-1.5 py-0.5 rounded">
                                                    Ativa
                                                </div>
                                            </div>
                                            <div className="min-w-0 flex-1 space-y-1">
                                                <div className="text-xs font-bold text-white truncate">
                                                    {referenceImageName}
                                                </div>
                                                <div className="text-[10px] text-slate-400">
                                                    Foto pronta para usar na montagem do painel ou como guia de desenho
                                                </div>
                                                <div className="flex items-center gap-1.5 pt-1">
                                                    <button
                                                        type="button"
                                                        onClick={() => referenceFileInputRef.current?.click()}
                                                        className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[10px] font-bold text-slate-300 cursor-pointer"
                                                    >
                                                        Trocar Imagem
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => { setReferenceImageUrl(null); setShowReferenceOverlay(false); }}
                                                        className="px-2 py-1 rounded bg-rose-950/60 hover:bg-rose-900/60 text-[10px] font-bold text-rose-300 border border-rose-500/30 cursor-pointer"
                                                    >
                                                        Remover
                                                    </button>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Ações Rápidas com a Referência */}
                                        <div className="space-y-2 pt-2 border-t border-slate-800">
                                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                                O que você deseja fazer com esta foto?
                                            </div>

                                            <div className="grid grid-cols-1 gap-2">
                                                <button
                                                    type="button"
                                                    onClick={handleAddReferenceAsLayer}
                                                    className="p-2.5 rounded-xl bg-gradient-to-r from-pink-500/20 to-amber-500/20 border border-pink-500/40 hover:border-pink-400 hover:bg-pink-500/30 transition-all text-left flex items-center justify-between group cursor-pointer"
                                                >
                                                    <div className="flex items-center gap-2.5">
                                                        <div className="p-1.5 rounded-lg bg-pink-500 text-slate-950 font-black">
                                                            <Plus size={14} />
                                                        </div>
                                                        <div>
                                                            <div className="text-xs font-bold text-white group-hover:text-pink-300">
                                                                Adicionar como Foto / Personagem no Painel
                                                            </div>
                                                            <div className="text-[10px] text-slate-400">
                                                                Insere no centro da arte com controle de tamanho, rotação e ordem
                                                            </div>
                                                        </div>
                                                    </div>
                                                </button>

                                                {/* Jeitos das Imagens Rápidos (Formatos & Acabamentos de Festa) */}
                                                <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800 space-y-2">
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-[10px] font-black uppercase tracking-wider text-pink-400 flex items-center gap-1.5">
                                                            <Sparkles size={11} />
                                                            <span>Jeitos de Festa Rápidos:</span>
                                                        </span>
                                                        <span className="text-[9px] text-slate-500">1-clique para aplicar</span>
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-1.5">
                                                        <button
                                                            type="button"
                                                            onClick={() => handleAddReferenceAsLayer({ maskShape: 'none', borderStyle: 'white_sticker', borderWidth: 12, shadowStyle: 'soft_3d' })}
                                                            className="p-2 rounded-lg bg-slate-950 border border-slate-800 hover:border-pink-500/50 hover:bg-slate-900 text-left transition-all cursor-pointer group"
                                                        >
                                                            <div className="text-[11px] font-bold text-white group-hover:text-pink-300 flex items-center gap-1">
                                                                <span>✂️ Adesivo Topo de Bolo</span>
                                                            </div>
                                                            <div className="text-[9px] text-slate-400">Borda branca die-cut & 3D</div>
                                                        </button>

                                                        <button
                                                            type="button"
                                                            onClick={() => handleAddReferenceAsLayer({ maskShape: 'circle', borderStyle: 'gold_glitter', borderWidth: 8, shadowStyle: 'gold_glow' })}
                                                            className="p-2 rounded-lg bg-slate-950 border border-slate-800 hover:border-amber-500/50 hover:bg-slate-900 text-left transition-all cursor-pointer group"
                                                        >
                                                            <div className="text-[11px] font-bold text-white group-hover:text-amber-300 flex items-center gap-1">
                                                                <span>👑 Medalhão Ouro</span>
                                                            </div>
                                                            <div className="text-[9px] text-slate-400">Foto redonda com brilho</div>
                                                        </button>

                                                        <button
                                                            type="button"
                                                            onClick={() => handleAddReferenceAsLayer({ maskShape: 'arch', borderStyle: 'gold_glitter', borderWidth: 6, shadowStyle: 'soft_3d' })}
                                                            className="p-2 rounded-lg bg-slate-950 border border-slate-800 hover:border-pink-500/50 hover:bg-slate-900 text-left transition-all cursor-pointer group"
                                                        >
                                                            <div className="text-[11px] font-bold text-white group-hover:text-pink-300 flex items-center gap-1">
                                                                <span>🏛️ Arco Romano</span>
                                                            </div>
                                                            <div className="text-[9px] text-slate-400">Topo curvo moderno</div>
                                                        </button>

                                                        <button
                                                            type="button"
                                                            onClick={() => handleAddReferenceAsLayer({ maskShape: 'heart', borderStyle: 'rose_gold', borderWidth: 6, shadowStyle: 'soft_3d' })}
                                                            className="p-2 rounded-lg bg-slate-950 border border-slate-800 hover:border-rose-500/50 hover:bg-slate-900 text-left transition-all cursor-pointer group"
                                                        >
                                                            <div className="text-[11px] font-bold text-white group-hover:text-rose-300 flex items-center gap-1">
                                                                <span>💖 Coração Rosé</span>
                                                            </div>
                                                            <div className="text-[9px] text-slate-400">Romântico & infantil</div>
                                                        </button>

                                                        <button
                                                            type="button"
                                                            onClick={() => handleAddReferenceAsLayer({ 
                                                                maskShape: 'polaroid', 
                                                                shadowStyle: 'floating', 
                                                                polaroidCaption: referenceImageName ? referenceImageName.replace(/\.[^/.]+$/, "").replace(/[_-]/g, " ") : 'Minha Festa' 
                                                            })}
                                                            className="p-2 rounded-lg bg-slate-950 border border-slate-800 hover:border-purple-500/50 hover:bg-slate-900 text-left transition-all cursor-pointer group"
                                                        >
                                                            <div className="text-[11px] font-bold text-white group-hover:text-purple-300 flex items-center gap-1">
                                                                <span>📸 Polaroid Retrô</span>
                                                            </div>
                                                            <div className="text-[9px] text-slate-400">Com legenda e sombra</div>
                                                        </button>

                                                        <button
                                                            type="button"
                                                            onClick={() => handleAddReferenceAsLayer({ maskShape: 'star', borderStyle: 'neon', borderWidth: 5, shadowStyle: 'neon_glow' })}
                                                            className="p-2 rounded-lg bg-slate-950 border border-slate-800 hover:border-cyan-500/50 hover:bg-slate-900 text-left transition-all cursor-pointer group"
                                                        >
                                                            <div className="text-[11px] font-bold text-white group-hover:text-cyan-300 flex items-center gap-1">
                                                                <span>⭐ Estrela Neon</span>
                                                            </div>
                                                            <div className="text-[9px] text-slate-400">Brilho cósmico / balada</div>
                                                        </button>
                                                    </div>
                                                </div>

                                                {onOpenBgRemover && (
                                                    <button
                                                        type="button"
                                                        onClick={onOpenBgRemover}
                                                        className="p-2.5 rounded-xl bg-teal-950/50 border border-teal-500/40 hover:border-teal-400 hover:bg-teal-900/50 transition-all text-left flex items-center justify-between group cursor-pointer"
                                                    >
                                                        <div className="flex items-center gap-2.5">
                                                            <div className="p-1.5 rounded-lg bg-teal-500 text-slate-950 font-black">
                                                                <Scissors size={14} />
                                                            </div>
                                                            <div>
                                                                <div className="text-xs font-bold text-teal-200 group-hover:text-teal-100 flex items-center gap-1.5">
                                                                    <span>Recortar Fundo da Foto (IA)</span>
                                                                    <span className="text-[9px] bg-teal-400/20 text-teal-300 border border-teal-400/30 px-1 rounded">100% Automático</span>
                                                                </div>
                                                                <div className="text-[10px] text-slate-400">
                                                                    Remove o fundo da criança ou objeto para trazer transparente
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </button>
                                                )}

                                                <button
                                                    type="button"
                                                    onClick={handleSetReferenceAsBackground}
                                                    className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 hover:bg-slate-850 transition-all text-left flex items-center justify-between group cursor-pointer"
                                                >
                                                    <div className="flex items-center gap-2.5">
                                                        <div className="p-1.5 rounded-lg bg-slate-800 text-slate-200">
                                                            <Palette size={14} />
                                                        </div>
                                                        <div>
                                                            <div className="text-xs font-bold text-white group-hover:text-slate-200">
                                                                Definir como Papel de Parede / Fundo do Painel
                                                            </div>
                                                            <div className="text-[10px] text-slate-400">
                                                                Preenche todo o painel ou topo de bolo com esta textura
                                                            </div>
                                                        </div>
                                                    </div>
                                                </button>
                                            </div>
                                        </div>

                                        {/* Ferramentas de Guia Fantasma & Comparação */}
                                        <div className="space-y-2 pt-2 border-t border-slate-800">
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs font-bold text-slate-200">
                                                    Guia de Referência na Tela (Ghost Guide):
                                                </span>
                                                <button
                                                    type="button"
                                                    onClick={() => setShowReferenceOverlay(prev => !prev)}
                                                    className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                                                        showReferenceOverlay ? 'bg-pink-500' : 'bg-slate-700'
                                                    }`}
                                                >
                                                    <div className={`w-5 h-5 rounded-full bg-white transition-transform transform absolute top-0.5 ${
                                                        showReferenceOverlay ? 'translate-x-5' : 'translate-x-0.5'
                                                    }`} />
                                                </button>
                                            </div>

                                            {showReferenceOverlay && (
                                                <div className="space-y-2.5 p-2.5 rounded-xl bg-slate-900 border border-slate-800 animate-in fade-in">
                                                    <div className="flex items-center justify-between text-xs">
                                                        <span className="text-slate-400">Modo de Comparação:</span>
                                                        <div className="flex items-center gap-1 bg-slate-950 p-0.5 rounded-lg border border-slate-800">
                                                            <button
                                                                type="button"
                                                                onClick={() => setReferenceComparisonMode('overlay')}
                                                                className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer ${
                                                                    referenceComparisonMode === 'overlay'
                                                                        ? 'bg-pink-500 text-slate-950'
                                                                        : 'text-slate-400'
                                                                }`}
                                                            >
                                                                Sobreposto
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => setReferenceComparisonMode('sideBySide')}
                                                                className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer ${
                                                                    referenceComparisonMode === 'sideBySide'
                                                                        ? 'bg-pink-500 text-slate-950'
                                                                        : 'text-slate-400'
                                                                }`}
                                                            >
                                                                Lado a Lado
                                                            </button>
                                                        </div>
                                                    </div>

                                                    {referenceComparisonMode === 'overlay' && (
                                                        <div className="space-y-1">
                                                            <div className="flex justify-between text-[11px]">
                                                                <span className="text-slate-400">Opacidade do Modelo:</span>
                                                                <span className="font-mono text-pink-400 font-bold">
                                                                    {Math.round(referenceOverlayOpacity * 100)}%
                                                                </span>
                                                            </div>
                                                            <input
                                                                type="range"
                                                                min="0.1"
                                                                max="0.9"
                                                                step="0.05"
                                                                value={referenceOverlayOpacity}
                                                                onChange={(e) => setReferenceOverlayOpacity(Number(e.target.value))}
                                                                className="w-full accent-pink-500 cursor-pointer"
                                                            />
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ) : (
                                    /* Nenhuma Imagem Carregada: DropZone de Referência */
                                    <div
                                        onClick={() => referenceFileInputRef.current?.click()}
                                        className="p-6 border-2 border-dashed border-slate-700 hover:border-pink-500/80 rounded-2xl bg-slate-950/60 hover:bg-slate-900/60 transition-all text-center cursor-pointer space-y-2 group"
                                    >
                                        <div className="w-12 h-12 rounded-2xl bg-pink-500/10 text-pink-400 flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                                            <Upload size={22} />
                                        </div>
                                        <div>
                                            <div className="text-xs font-black text-white group-hover:text-pink-300">
                                                Clique ou arraste sua Imagem de Referência aqui
                                            </div>
                                            <p className="text-[10px] text-slate-400 mt-0.5">
                                                Envie a foto do aniversariante, modelo do bolo ou foto de inspiração (PNG, JPG, WEBP)
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {/* Galeria de Imagens do Projeto */}
                                {availableImages.length > 0 && (
                                    <div className="space-y-2 pt-2 border-t border-slate-800">
                                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                            Ou escolha das fotos já enviadas no projeto:
                                        </div>
                                        <div className="grid grid-cols-4 gap-2">
                                            {availableImages.map(img => {
                                                const url = img.previewUrl || (img.base64Data ? `data:${img.mimeType || 'image/png'};base64,${img.base64Data}` : null);
                                                if (!url) return null;
                                                const isCurrent = referenceImageUrl === url;
                                                return (
                                                    <button
                                                        key={img.id}
                                                        type="button"
                                                        onClick={() => handleSelectAvailableAsReference(img)}
                                                        className={`relative aspect-square rounded-xl overflow-hidden border transition-all cursor-pointer group ${
                                                            isCurrent
                                                                ? 'ring-2 ring-pink-500 border-pink-400 shadow-md'
                                                                : 'border-slate-800 hover:border-slate-700 bg-slate-950'
                                                        }`}
                                                        title={img.name}
                                                    >
                                                        <img
                                                            src={url}
                                                            alt={img.name}
                                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                                        />
                                                        {isCurrent && (
                                                            <div className="absolute inset-0 bg-pink-500/20 flex items-center justify-center">
                                                                <Check size={14} className="text-white drop-shadow" />
                                                            </div>
                                                        )}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* ABA 2: Temas e Papéis Digitais */}
                        {activeTab === 'theme' && (
                            <div className="space-y-4 animate-in fade-in duration-200">
                                <div>
                                    <h2 className="text-xs font-black uppercase tracking-wider text-slate-200 flex items-center gap-1.5">
                                        <Palette size={14} className="text-pink-400" />
                                        <span>Temas de Aniversário Prontos</span>
                                    </h2>
                                    <p className="text-[11px] text-slate-400 mt-0.5">
                                        Clique para trocar o tema, papéis digitais e paleta com 1 clique
                                    </p>
                                </div>

                                <div className="grid grid-cols-2 gap-2">
                                    {THEME_PRESETS.map(theme => (
                                        <button
                                            key={theme.id}
                                            type="button"
                                            onClick={() => handleApplyTheme(theme.id)}
                                            className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-2.5 ${
                                                state.themeId === theme.id
                                                    ? 'bg-pink-500/20 border-pink-400 shadow-md ring-1 ring-pink-400'
                                                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                                            }`}
                                        >
                                            <div className="text-2xl">{theme.previewSvg}</div>
                                            <div className="min-w-0">
                                                <div className="text-xs font-bold text-white truncate">{theme.name.split(' / ')[0]}</div>
                                                <div className="text-[9px] text-slate-400">{theme.category}</div>
                                            </div>
                                        </button>
                                    ))}
                                </div>

                                {/* Texturas de Fundo */}
                                <div className="space-y-2 pt-2 border-t border-slate-800">
                                    <span className="text-xs font-bold text-slate-300">Texturas & Papéis de Fundo:</span>
                                    <div className="grid grid-cols-3 gap-1.5">
                                        {[
                                            { id: 'safari', label: 'Safari Ouro' },
                                            { id: 'clouds', label: 'Céu & Nuvens' },
                                            { id: 'stars', label: 'Galáxia Espaço' },
                                            { id: 'glitter', label: 'Glitter Ouro' },
                                            { id: 'wood', label: 'Madeira Ripada' },
                                            { id: 'gradient', label: 'Candy Colors' }
                                        ].map(bg => (
                                            <button
                                                key={bg.id}
                                                type="button"
                                                onClick={() => setState(prev => ({ ...prev, backgroundStyle: bg.id as any }))}
                                                className={`py-1.5 px-2 rounded-lg text-[10px] font-bold border transition-all cursor-pointer ${
                                                    state.backgroundStyle === bg.id
                                                        ? 'bg-pink-500 text-slate-950 border-pink-400'
                                                        : 'bg-slate-950/70 border-slate-800 text-slate-300 hover:bg-slate-800'
                                                }`}
                                            >
                                                {bg.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ABA 3: Nome do Aniversariante & Tipografia 3D */}
                        {activeTab === 'text' && (
                            <div className="space-y-4 animate-in fade-in duration-200">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h2 className="text-xs font-black uppercase tracking-wider text-slate-200 flex items-center gap-1.5">
                                            <Type size={14} className="text-pink-400" />
                                            <span>Nome, Idade & Frases</span>
                                        </h2>
                                        <p className="text-[11px] text-slate-400 mt-0.5">
                                            Edite os textos com efeito curvado em arco, borda dupla e sombra 3D
                                        </p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={handleAddText}
                                        className="px-2.5 py-1 rounded-lg bg-pink-500 hover:bg-pink-400 text-slate-950 font-black text-xs transition-all flex items-center gap-1 cursor-pointer"
                                    >
                                        <Plus size={13} />
                                        <span>Novo Texto</span>
                                    </button>
                                </div>

                                {selectedLayer && selectedLayer.type === 'text' ? (
                                    <div className="space-y-3 p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                                        {/* Campo de Texto */}
                                        <div className="space-y-1">
                                            <span className="text-[11px] text-slate-400 font-bold">Conteúdo do Texto:</span>
                                            <input
                                                type="text"
                                                value={selectedLayer.text}
                                                onChange={(e) => updateLayer(selectedLayer.id, { text: e.target.value })}
                                                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white font-bold text-sm focus:outline-none focus:border-pink-500"
                                                placeholder="Ex: LORENZO, 1 ANINHO"
                                            />
                                        </div>

                                        {/* Curvatura em Arco (Texto Curvo) */}
                                        <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
                                            <label className="flex items-center justify-between text-xs font-bold text-slate-200 cursor-pointer">
                                                <span>Texto Curvado em Arco (Painel Redondo)</span>
                                                <input
                                                    type="checkbox"
                                                    checked={selectedLayer.isCurved}
                                                    onChange={(e) => updateLayer(selectedLayer.id, { isCurved: e.target.checked })}
                                                    className="w-4 h-4 rounded accent-pink-500 cursor-pointer"
                                                />
                                            </label>

                                            {selectedLayer.isCurved && (
                                                <div className="space-y-1 pt-1 border-t border-slate-800">
                                                    <div className="flex justify-between text-[11px]">
                                                        <span className="text-slate-400">Raio da Curva:</span>
                                                        <span className="font-mono text-pink-400 font-bold">{selectedLayer.curveRadius}px</span>
                                                    </div>
                                                    <input
                                                        type="range"
                                                        min="120"
                                                        max="450"
                                                        value={selectedLayer.curveRadius}
                                                        onChange={(e) => updateLayer(selectedLayer.id, { curveRadius: Number(e.target.value) })}
                                                        className="w-full accent-pink-500 cursor-pointer"
                                                    />
                                                </div>
                                            )}
                                        </div>

                                        {/* Tamanho da Fonte & Posição Vertical */}
                                        <div className="grid grid-cols-2 gap-2">
                                            <div className="space-y-1">
                                                <span className="text-[11px] text-slate-400">Tamanho da Fonte:</span>
                                                <input
                                                    type="range"
                                                    min="20"
                                                    max="130"
                                                    value={selectedLayer.fontSize}
                                                    onChange={(e) => updateLayer(selectedLayer.id, { fontSize: Number(e.target.value) })}
                                                    className="w-full accent-pink-500 cursor-pointer"
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <span className="text-[11px] text-slate-400">Posição Y:</span>
                                                <input
                                                    type="range"
                                                    min="10"
                                                    max="90"
                                                    value={selectedLayer.y}
                                                    onChange={(e) => updateLayer(selectedLayer.id, { y: Number(e.target.value) })}
                                                    className="w-full accent-pink-500 cursor-pointer"
                                                />
                                            </div>
                                        </div>

                                        {/* Contornos / Borda Dupla (Stroke 1 & Stroke 2) */}
                                        <div className="space-y-2 pt-2 border-t border-slate-800">
                                            <span className="text-[11px] font-bold text-slate-300">Bordas / Contornos da Letra:</span>
                                            <div className="grid grid-cols-2 gap-2">
                                                <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
                                                    <span className="text-[10px] text-slate-400">Contorno 1:</span>
                                                    <div className="flex items-center gap-1.5">
                                                        <input
                                                            type="color"
                                                            value={selectedLayer.strokeColor}
                                                            onChange={(e) => updateLayer(selectedLayer.id, { strokeColor: e.target.value })}
                                                            className="w-6 h-6 rounded bg-transparent cursor-pointer border border-slate-700"
                                                        />
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            max="25"
                                                            value={selectedLayer.strokeWidth}
                                                            onChange={(e) => updateLayer(selectedLayer.id, { strokeWidth: Number(e.target.value) })}
                                                            className="w-12 px-1.5 py-0.5 rounded bg-slate-950 text-white font-mono text-xs border border-slate-700 text-center"
                                                        />
                                                    </div>
                                                </div>

                                                <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
                                                    <span className="text-[10px] text-slate-400">Contorno 2 (Externo):</span>
                                                    <div className="flex items-center gap-1.5">
                                                        <input
                                                            type="color"
                                                            value={selectedLayer.secondaryStrokeColor}
                                                            onChange={(e) => updateLayer(selectedLayer.id, { secondaryStrokeColor: e.target.value })}
                                                            className="w-6 h-6 rounded bg-transparent cursor-pointer border border-slate-700"
                                                        />
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            max="35"
                                                            value={selectedLayer.secondaryStrokeWidth}
                                                            onChange={(e) => updateLayer(selectedLayer.id, { secondaryStrokeWidth: Number(e.target.value) })}
                                                            className="w-12 px-1.5 py-0.5 rounded bg-slate-950 text-white font-mono text-xs border border-slate-700 text-center"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center p-6 border border-dashed border-slate-800 rounded-xl text-slate-500 text-xs">
                                        Nenhum texto selecionado. Clique em "Novo Texto" ou selecione uma camada de texto na aba Camadas.
                                    </div>
                                )}
                            </div>
                        )}

                        {/* ABA 4: Balões & Cliparts */}
                        {activeTab === 'cliparts' && (
                            <div className="space-y-4 animate-in fade-in duration-200">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h2 className="text-xs font-black uppercase tracking-wider text-slate-200 flex items-center gap-1.5">
                                            <PartyPopper size={14} className="text-pink-400" />
                                            <span>Balões & Enfeites de Festa</span>
                                        </h2>
                                        <p className="text-[11px] text-slate-400 mt-0.5">
                                            Adicione arcos de balões, bolos, estrelas e coroas ao painel
                                        </p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => clipartUploadInputRef.current?.click()}
                                        className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer border border-slate-700"
                                    >
                                        <Upload size={13} />
                                        <span>Subir Imagem</span>
                                    </button>
                                    <input
                                        ref={clipartUploadInputRef}
                                        type="file"
                                        accept="image/*"
                                        onChange={handleUploadCustomClipart}
                                        className="hidden"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-2">
                                    {PARTY_CLIPART_ITEMS.map(item => (
                                        <button
                                            key={item.id}
                                            type="button"
                                            onClick={() => handleAddClipart(item.id)}
                                            className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-pink-500/50 hover:bg-slate-900 transition-all text-left flex items-center gap-2.5 cursor-pointer"
                                        >
                                            <div className="text-2xl">{item.icon}</div>
                                            <div className="min-w-0">
                                                <div className="text-xs font-bold text-white truncate">{item.title}</div>
                                                <div className="text-[9px] text-slate-400">{item.category}</div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* ABA 5: Lista de Camadas (Layers) */}
                        {activeTab === 'layers' && (
                            <div className="space-y-4 animate-in fade-in duration-200">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-xs font-black uppercase tracking-wider text-slate-200 flex items-center gap-1.5">
                                        <Layers size={14} className="text-pink-400" />
                                        <span>Camadas da Arte ({state.layers.length})</span>
                                    </h2>
                                </div>

                                <div className="space-y-1.5 max-h-[360px] overflow-y-auto">
                                    {state.layers.map((layer, index) => {
                                        const isSelected = layer.id === selectedLayerId;
                                        const isText = layer.type === 'text';
                                        return (
                                            <div
                                                key={layer.id}
                                                onClick={() => setSelectedLayerId(layer.id)}
                                                className={`p-2 rounded-xl border flex items-center justify-between gap-2 transition-all cursor-pointer ${
                                                    isSelected
                                                        ? 'bg-pink-500/20 border-pink-400 text-white shadow-sm'
                                                        : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:bg-slate-900'
                                                }`}
                                            >
                                                <div className="flex items-center gap-2 min-w-0">
                                                    <div className="text-xs font-bold text-pink-400 shrink-0">
                                                        {isText ? 'T' : '★'}
                                                    </div>
                                                    <span className="text-xs font-medium truncate">
                                                        {isText ? (layer as BackdropTextLayer).text : (layer as BackdropClipartLayer).clipartType}
                                                    </span>
                                                </div>

                                                <div className="flex items-center gap-1">
                                                    <button
                                                        type="button"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            updateLayer(layer.id, { visible: !layer.visible });
                                                        }}
                                                        className="p-1 rounded text-slate-400 hover:text-white"
                                                    >
                                                        {layer.visible ? <Eye size={12} /> : <EyeOff size={12} className="text-slate-600" />}
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleMoveLayerOrder(layer.id, 'up');
                                                        }}
                                                        disabled={index === state.layers.length - 1}
                                                        className="p-1 rounded text-slate-400 hover:text-white disabled:opacity-30"
                                                    >
                                                        <ArrowUp size={12} />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleMoveLayerOrder(layer.id, 'down');
                                                        }}
                                                        disabled={index === 0}
                                                        className="p-1 rounded text-slate-400 hover:text-white disabled:opacity-30"
                                                    >
                                                        <ArrowDown size={12} />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleDuplicateLayer(layer.id);
                                                        }}
                                                        className="p-1 rounded text-slate-400 hover:text-white"
                                                    >
                                                        <Copy size={12} />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleDeleteLayer(layer.id);
                                                        }}
                                                        className="p-1 rounded text-rose-400 hover:text-rose-200"
                                                    >
                                                        <Trash2 size={12} />
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Inspetor da Camada de Imagem / Clipart Selecionada */}
                                {selectedLayer && selectedLayer.type !== 'text' && (
                                    <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2.5 pt-3">
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-bold text-white flex items-center gap-1.5">
                                                <span>Ajustes da Imagem:</span>
                                                <span className="text-pink-400 truncate max-w-[140px] font-mono text-[10px]">
                                                    {selectedLayer.clipartType}
                                                </span>
                                            </span>
                                            {selectedLayer.dataUrl && onOpenBgRemover && (
                                                <button
                                                    type="button"
                                                    onClick={onOpenBgRemover}
                                                    className="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-950 text-teal-300 border border-teal-500/40 hover:bg-teal-900 flex items-center gap-1 cursor-pointer"
                                                >
                                                    <Scissors size={10} />
                                                    <span>Recortar IA</span>
                                                </button>
                                            )}
                                        </div>

                                        <div className="grid grid-cols-2 gap-2">
                                            <div className="space-y-1">
                                                <div className="flex justify-between text-[10px] text-slate-400">
                                                    <span>Tamanho:</span>
                                                    <span className="font-mono text-pink-400">{Math.round(selectedLayer.width)}%</span>
                                                </div>
                                                <input
                                                    type="range"
                                                    min="10"
                                                    max="100"
                                                    value={selectedLayer.width}
                                                    onChange={(e) => updateLayer(selectedLayer.id, { 
                                                        width: Number(e.target.value),
                                                        height: Number(e.target.value)
                                                    })}
                                                    className="w-full accent-pink-500 cursor-pointer"
                                                />
                                            </div>

                                            <div className="space-y-1">
                                                <div className="flex justify-between text-[10px] text-slate-400">
                                                    <span>Opacidade:</span>
                                                    <span className="font-mono text-pink-400">{Math.round(selectedLayer.opacity * 100)}%</span>
                                                </div>
                                                <input
                                                    type="range"
                                                    min="0.1"
                                                    max="1"
                                                    step="0.05"
                                                    value={selectedLayer.opacity}
                                                    onChange={(e) => updateLayer(selectedLayer.id, { opacity: Number(e.target.value) })}
                                                    className="w-full accent-pink-500 cursor-pointer"
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-2">
                                            <div className="space-y-1">
                                                <div className="flex justify-between text-[10px] text-slate-400">
                                                    <span>Posição X:</span>
                                                    <span className="font-mono text-pink-400">{Math.round(selectedLayer.x)}%</span>
                                                </div>
                                                <input
                                                    type="range"
                                                    min="0"
                                                    max="100"
                                                    value={selectedLayer.x}
                                                    onChange={(e) => updateLayer(selectedLayer.id, { x: Number(e.target.value) })}
                                                    className="w-full accent-pink-500 cursor-pointer"
                                                />
                                            </div>

                                            <div className="space-y-1">
                                                <div className="flex justify-between text-[10px] text-slate-400">
                                                    <span>Posição Y:</span>
                                                    <span className="font-mono text-pink-400">{Math.round(selectedLayer.y)}%</span>
                                                </div>
                                                <input
                                                    type="range"
                                                    min="0"
                                                    max="100"
                                                    value={selectedLayer.y}
                                                    onChange={(e) => updateLayer(selectedLayer.id, { y: Number(e.target.value) })}
                                                    className="w-full accent-pink-500 cursor-pointer"
                                                />
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between pt-1 border-t border-slate-800 text-xs">
                                            <div className="flex items-center gap-1.5">
                                                <span className="text-[10px] text-slate-400 font-bold">Espelhar:</span>
                                                <button
                                                    type="button"
                                                    onClick={() => updateLayer(selectedLayer.id, { flipH: !selectedLayer.flipH })}
                                                    className={`px-2 py-0.5 rounded text-[10px] font-bold border cursor-pointer ${
                                                        selectedLayer.flipH ? 'bg-pink-500 text-slate-950 border-pink-400' : 'bg-slate-900 border-slate-700 text-slate-300'
                                                    }`}
                                                >
                                                    Horizontal
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => updateLayer(selectedLayer.id, { flipV: !selectedLayer.flipV })}
                                                    className={`px-2 py-0.5 rounded text-[10px] font-bold border cursor-pointer ${
                                                        selectedLayer.flipV ? 'bg-pink-500 text-slate-950 border-pink-400' : 'bg-slate-900 border-slate-700 text-slate-300'
                                                    }`}
                                                >
                                                    Vertical
                                                </button>
                                            </div>

                                            <button
                                                type="button"
                                                onClick={() => updateLayer(selectedLayer.id, { x: 50, y: 50 })}
                                                className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
                                            >
                                                Centralizar
                                            </button>
                                        </div>

                                        {/* Jeitos e Formatos de Foto / Estilos de Imagem de Festa */}
                                        {selectedLayer.type === 'custom_image' && (
                                            <div className="pt-3 border-t border-slate-800 space-y-3">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-[11px] font-black text-pink-400 uppercase tracking-wider flex items-center gap-1.5">
                                                        <Sparkles size={12} />
                                                        <span>Jeitos da Imagem (Estilo & Formato)</span>
                                                    </span>
                                                    <span className="text-[9px] bg-pink-500/10 text-pink-300 border border-pink-500/20 px-1.5 py-0.5 rounded font-mono">
                                                        {selectedLayer.maskShape || 'original'}
                                                    </span>
                                                </div>

                                                {/* 1. Formato de Corte (Máscara de Foto) */}
                                                <div className="space-y-1.5">
                                                    <span className="text-[10px] text-slate-400 font-bold block">
                                                        Formato de Corte da Foto:
                                                    </span>
                                                    <div className="grid grid-cols-4 gap-1.5">
                                                        {[
                                                            { id: 'none', label: 'Original', icon: '🖼️' },
                                                            { id: 'circle', label: 'Círculo', icon: '⚪' },
                                                            { id: 'arch', label: 'Arco', icon: '🏛️' },
                                                            { id: 'heart', label: 'Coração', icon: '💖' },
                                                            { id: 'star', label: 'Estrela', icon: '⭐' },
                                                            { id: 'polaroid', label: 'Polaroid', icon: '📸' },
                                                            { id: 'hexagon', label: 'Hexágono', icon: '⬡' },
                                                        ].map(item => {
                                                            const isSelected = (selectedLayer.maskShape || 'none') === item.id;
                                                            return (
                                                                <button
                                                                    key={item.id}
                                                                    type="button"
                                                                    onClick={() => updateLayer(selectedLayer.id, { maskShape: item.id as ImageMaskShape })}
                                                                    className={`p-1.5 rounded-lg border text-center transition-all cursor-pointer ${
                                                                        isSelected
                                                                            ? 'bg-pink-500/20 border-pink-400 text-white font-bold shadow-sm'
                                                                            : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700 hover:text-white'
                                                                    }`}
                                                                >
                                                                    <div className="text-sm">{item.icon}</div>
                                                                    <div className="text-[9px] truncate">{item.label}</div>
                                                                </button>
                                                            );
                                                        })}
                                                    </div>
                                                </div>

                                                {/* Cantos Arredondados (se formato original) */}
                                                {(selectedLayer.maskShape === 'none' || !selectedLayer.maskShape) && (
                                                    <div className="space-y-1 bg-slate-900/60 p-2 rounded-lg border border-slate-800">
                                                        <div className="flex justify-between text-[10px] text-slate-400">
                                                            <span>Arredondar Cantos:</span>
                                                            <span className="font-mono text-pink-400">{selectedLayer.borderRadius || 0}%</span>
                                                        </div>
                                                        <input
                                                            type="range"
                                                            min="0"
                                                            max="50"
                                                            value={selectedLayer.borderRadius || 0}
                                                            onChange={(e) => updateLayer(selectedLayer.id, { borderRadius: Number(e.target.value) })}
                                                            className="w-full accent-pink-500 cursor-pointer"
                                                        />
                                                    </div>
                                                )}

                                                {/* Legenda Polaroid se polaroid */}
                                                {selectedLayer.maskShape === 'polaroid' && (
                                                    <div className="space-y-1 bg-slate-900/60 p-2 rounded-lg border border-slate-800">
                                                        <span className="text-[10px] text-slate-400 font-bold block">Legenda na Polaroid:</span>
                                                        <input
                                                            type="text"
                                                            value={selectedLayer.polaroidCaption || ''}
                                                            placeholder="Ex: Minha Festa Encantada"
                                                            onChange={(e) => updateLayer(selectedLayer.id, { polaroidCaption: e.target.value })}
                                                            className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-xs text-white"
                                                        />
                                                    </div>
                                                )}

                                                {/* 2. Estilo de Borda / Adesivo Die-Cut */}
                                                <div className="space-y-1.5">
                                                    <span className="text-[10px] text-slate-400 font-bold block">
                                                        Contorno & Borda de Festa:
                                                    </span>
                                                    <div className="grid grid-cols-3 gap-1.5">
                                                        {[
                                                            { id: 'none', label: 'Sem Borda' },
                                                            { id: 'white_sticker', label: '✂️ Adesivo Branco' },
                                                            { id: 'gold_glitter', label: '✨ Ouro Luxo' },
                                                            { id: 'rose_gold', label: '🌸 Rosé Gold' },
                                                            { id: 'neon', label: '⚡ Neon Glow' },
                                                            { id: 'custom', label: '🎨 Cor Livre' },
                                                        ].map(b => {
                                                            const isSelected = (selectedLayer.borderStyle || 'none') === b.id;
                                                            return (
                                                                <button
                                                                    key={b.id}
                                                                    type="button"
                                                                    onClick={() => updateLayer(selectedLayer.id, { borderStyle: b.id as ImageBorderStyle })}
                                                                    className={`p-1.5 rounded-lg border text-left text-[10px] transition-all cursor-pointer ${
                                                                        isSelected
                                                                            ? 'bg-pink-500/20 border-pink-400 text-white font-bold'
                                                                            : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                                                                    }`}
                                                                >
                                                                    <span className="truncate block">{b.label}</span>
                                                                </button>
                                                            );
                                                        })}
                                                    </div>
                                                    
                                                    {/* Espessura da borda se ativa */}
                                                    {selectedLayer.borderStyle && selectedLayer.borderStyle !== 'none' && (
                                                        <div className="space-y-1 bg-slate-900/60 p-2 rounded-lg border border-slate-800 mt-1">
                                                            <div className="flex justify-between text-[10px] text-slate-400">
                                                                <span>Espessura do Contorno:</span>
                                                                <span className="font-mono text-pink-400">{selectedLayer.borderWidth ?? (selectedLayer.borderStyle === 'white_sticker' ? 10 : 4)}px</span>
                                                            </div>
                                                            <input
                                                                type="range"
                                                                min="1"
                                                                max="28"
                                                                value={selectedLayer.borderWidth ?? (selectedLayer.borderStyle === 'white_sticker' ? 10 : 4)}
                                                                onChange={(e) => updateLayer(selectedLayer.id, { borderWidth: Number(e.target.value) })}
                                                                className="w-full accent-pink-500 cursor-pointer"
                                                            />
                                                        </div>
                                                    )}
                                                </div>

                                                {/* 3. Efeitos 3D / Sombra Projetada */}
                                                <div className="space-y-1.5">
                                                    <span className="text-[10px] text-slate-400 font-bold block">
                                                        Efeito 3D & Relevo do Painel:
                                                    </span>
                                                    <div className="grid grid-cols-3 gap-1.5">
                                                        {[
                                                            { id: 'none', label: 'Plano (2D)' },
                                                            { id: 'soft_3d', label: '☁️ Relevo Suave' },
                                                            { id: 'floating', label: '🎈 Flutuante 3D' },
                                                            { id: 'gold_glow', label: '🌟 Brilho Ouro' },
                                                            { id: 'neon_glow', label: '💖 Brilho Neon' },
                                                        ].map(s => {
                                                            const isSelected = (selectedLayer.shadowStyle || 'none') === s.id;
                                                            return (
                                                                <button
                                                                    key={s.id}
                                                                    type="button"
                                                                    onClick={() => updateLayer(selectedLayer.id, { shadowStyle: s.id as ImageShadowStyle })}
                                                                    className={`p-1.5 rounded-lg border text-left text-[10px] transition-all cursor-pointer ${
                                                                        isSelected
                                                                            ? 'bg-amber-500/20 border-amber-400 text-white font-bold'
                                                                            : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                                                                    }`}
                                                                >
                                                                    <span className="truncate block">{s.label}</span>
                                                                </button>
                                                            );
                                                        })}
                                                    </div>
                                                </div>

                                                {/* 4. Filtro de Cor de Festa */}
                                                <div className="space-y-1.5">
                                                    <span className="text-[10px] text-slate-400 font-bold block">
                                                        Filtro Visual da Imagem:
                                                    </span>
                                                    <div className="grid grid-cols-3 gap-1.5">
                                                        {[
                                                            { id: 'none', label: 'Original' },
                                                            { id: 'vibrant', label: '🎉 Super Vívido' },
                                                            { id: 'pastel', label: '🧸 Pastel Suave' },
                                                            { id: 'warm_gold', label: '👑 Dourado Quente' },
                                                            { id: 'monochrome', label: '🎞️ Preto & Branco' },
                                                            { id: 'pop_art', label: '🎨 Pop Art' },
                                                        ].map(f => {
                                                            const isSelected = (selectedLayer.filterTreatment || 'none') === f.id;
                                                            return (
                                                                <button
                                                                    key={f.id}
                                                                    type="button"
                                                                    onClick={() => updateLayer(selectedLayer.id, { filterTreatment: f.id as ImageFilterTreatment })}
                                                                    className={`p-1.5 rounded-lg border text-left text-[10px] transition-all cursor-pointer ${
                                                                        isSelected
                                                                            ? 'bg-purple-500/20 border-purple-400 text-white font-bold'
                                                                            : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                                                                    }`}
                                                                >
                                                                    <span className="truncate block">{f.label}</span>
                                                                </button>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* ABA 6: Exportação & Gráfica */}
                        {activeTab === 'export' && (
                            <div className="space-y-4 animate-in fade-in duration-200">
                                <div>
                                    <h2 className="text-xs font-black uppercase tracking-wider text-slate-200 flex items-center gap-1.5">
                                        <Download size={14} className="text-pink-400" />
                                        <span>Exportar para Sublimação / Impressão</span>
                                    </h2>
                                    <p className="text-[11px] text-slate-400 mt-0.5">
                                        Gere arquivos profissionais prontos para mandar para a confecção
                                    </p>
                                </div>

                                {/* Formato de Arquivo */}
                                <div className="space-y-1.5">
                                    <span className="text-[11px] font-bold text-slate-300">Formato do Arquivo:</span>
                                    <div className="grid grid-cols-4 gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
                                        {[
                                            { id: 'pdf', label: 'PDF Gráfica' },
                                            { id: 'png', label: 'PNG 300DPI' },
                                            { id: 'jpeg', label: 'JPG Foto' },
                                            { id: 'webp', label: 'WEBP' }
                                        ].map(fmt => (
                                            <button
                                                key={fmt.id}
                                                type="button"
                                                onClick={() => setExportFormat(fmt.id as any)}
                                                className={`py-2 px-1 rounded-lg text-[10px] font-black uppercase transition-all cursor-pointer ${
                                                    exportFormat === fmt.id
                                                        ? 'bg-pink-500 text-slate-950 font-black shadow-md'
                                                        : 'text-slate-400 hover:text-white'
                                                }`}
                                            >
                                                {fmt.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Resolução */}
                                <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-800">
                                    <span className="text-slate-400">Resolução do Arquivo:</span>
                                    <div className="flex items-center gap-1 bg-slate-950 p-0.5 rounded-lg border border-slate-800">
                                        <button
                                            type="button"
                                            onClick={() => setExportResolution(1)}
                                            className={`px-2 py-1 rounded text-[10px] font-bold cursor-pointer ${
                                                exportResolution === 1 ? 'bg-pink-500 text-slate-950' : 'text-slate-400'
                                            }`}
                                        >
                                            1x Padrão (2000px)
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setExportResolution(2)}
                                            className={`px-2 py-1 rounded text-[10px] font-bold cursor-pointer ${
                                                exportResolution === 2 ? 'bg-pink-500 text-slate-950' : 'text-slate-400'
                                            }`}
                                        >
                                            2x Ultra HD (3600px)
                                        </button>
                                    </div>
                                </div>

                                {/* Botão Principal de Download */}
                                <button
                                    type="button"
                                    onClick={handleDownload}
                                    className="w-full py-3.5 px-4 rounded-xl font-black text-xs uppercase tracking-wider text-slate-950 bg-gradient-to-r from-pink-400 via-amber-300 to-rose-400 hover:from-pink-300 hover:to-rose-300 shadow-xl shadow-pink-500/20 transition-all flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
                                >
                                    <Download size={16} />
                                    <span>Baixar Arquivo {exportFormat.toUpperCase()}</span>
                                </button>

                                {onOpenPanelSplitter && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            if (displayCanvasRef.current) {
                                                const dataUrl = displayCanvasRef.current.toDataURL('image/png');
                                                onOpenPanelSplitter(dataUrl);
                                            } else if (referenceImageUrl) {
                                                onOpenPanelSplitter(referenceImageUrl);
                                            }
                                        }}
                                        className="w-full py-3 px-4 rounded-xl font-bold text-xs uppercase tracking-wider text-cyan-200 bg-cyan-950/80 border border-cyan-500/40 hover:bg-cyan-900/80 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-cyan-950/50"
                                    >
                                        <Scissors size={15} className="text-cyan-400" />
                                        <span>Fatiar Painel em Folhas A4/A3 (FatiArt & Encantiva)</span>
                                    </button>
                                )}

                                {downloadSuccess && (
                                    <div className="p-2.5 rounded-xl bg-emerald-950/60 border border-emerald-500/60 text-emerald-200 text-xs flex items-center gap-2 animate-in fade-in">
                                        <CheckCircle2 size={15} className="text-emerald-400 shrink-0" />
                                        <span>{downloadSuccess}</span>
                                    </div>
                                )}

                                {downloadError && (
                                    <div className="p-2.5 rounded-xl bg-rose-950/60 border border-rose-500/60 text-rose-200 text-xs flex items-center gap-2 animate-in fade-in">
                                        <AlertCircle size={15} className="text-rose-400 shrink-0" />
                                        <span>{downloadError}</span>
                                    </div>
                                )}

                                {/* Ficha Técnica do Pedido */}
                                <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-[11px] space-y-1.5 text-slate-400">
                                    <div className="font-bold text-white uppercase text-[10px] tracking-wider mb-1">
                                        Ficha Técnica para Gráfica / Costureira:
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Estrutura:</span>
                                        <strong className="text-white">{currentPreset.name}</strong>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Diâmetro / Dimensão:</span>
                                        <strong className="text-white">{currentPreset.widthCm} × {currentPreset.heightCm} cm</strong>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Margem de Sangria (Costura):</span>
                                        <strong className="text-amber-300">+{currentPreset.bleedMarginCm} cm</strong>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Tecido Recomendado:</span>
                                        <strong className="text-slate-300">Helanca / Oxford Sublimado</strong>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Coluna Central / Direita: Canvas Interativo do Painel de Festa */}
                <div className="lg:col-span-7 xl:col-span-8 space-y-3">
                    {/* Barra de Ferramentas de Zoom & Alinhamento */}
                    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-2.5 flex items-center justify-between gap-2 flex-wrap">
                        <div className="flex items-center gap-1.5">
                            <button
                                type="button"
                                onClick={() => setZoom(z => Math.max(0.4, z - 0.15))}
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
                                onClick={() => setZoom(z => Math.min(2.5, z + 0.15))}
                                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all cursor-pointer"
                                title="Zoom Mais"
                            >
                                <ZoomIn size={14} />
                            </button>
                            <button
                                type="button"
                                onClick={() => setZoom(1)}
                                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all cursor-pointer ml-1"
                                title="Ajustar 100%"
                            >
                                <RotateCcw size={14} />
                            </button>
                        </div>

                        {/* Atalhos Rápidos de Alinhamento */}
                        {selectedLayer && (
                            <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
                                <span className="text-[10px] text-slate-400 font-bold px-1">Alinhar:</span>
                                <button
                                    type="button"
                                    onClick={() => updateLayer(selectedLayer.id, { x: 50 })}
                                    className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-[10px] font-bold text-slate-200 cursor-pointer"
                                    title="Centralizar Horizontalmente"
                                >
                                    Centro X
                                </button>
                                <button
                                    type="button"
                                    onClick={() => updateLayer(selectedLayer.id, { y: 50 })}
                                    className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-[10px] font-bold text-slate-200 cursor-pointer"
                                    title="Centralizar Verticalmente"
                                >
                                    Centro Y
                                </button>
                            </div>
                        )}

                        {/* Botão Rápido de Referência */}
                        {referenceImageUrl && (
                            <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-lg border border-slate-800">
                                <button
                                    type="button"
                                    onClick={() => setShowReferenceOverlay(prev => !prev)}
                                    className={`px-2.5 py-1 rounded text-[11px] font-bold border transition-all flex items-center gap-1.5 cursor-pointer ${
                                        showReferenceOverlay
                                            ? 'bg-pink-500 text-slate-950 border-pink-400 shadow-sm font-black'
                                            : 'bg-slate-900 border-slate-700 text-slate-300 hover:text-white'
                                    }`}
                                    title="Ativar ou ocultar foto de referência"
                                >
                                    <ImageIcon size={13} />
                                    <span>Referência: {showReferenceOverlay ? 'Visível' : 'Oculta'}</span>
                                </button>
                                {showReferenceOverlay && (
                                    <button
                                        type="button"
                                        onClick={() => setReferenceComparisonMode(m => m === 'overlay' ? 'sideBySide' : 'overlay')}
                                        className="px-2 py-1 rounded text-[10px] font-bold bg-slate-800 text-slate-300 hover:text-white border border-slate-700 cursor-pointer"
                                        title="Alternar entre modo sobreposto e lado a lado"
                                    >
                                        {referenceComparisonMode === 'overlay' ? 'Sobreposto' : 'Lado a Lado'}
                                    </button>
                                )}
                            </div>
                        )}

                        <div className="flex items-center gap-1.5 ml-auto">
                            <button
                                type="button"
                                onClick={() => { setActiveTab('export'); handleDownload(); }}
                                className="px-3 py-1.5 rounded-lg bg-pink-500 hover:bg-pink-400 text-slate-950 font-black text-xs transition-all flex items-center gap-1.5 shadow-md shadow-pink-500/20 active:scale-95 cursor-pointer"
                            >
                                <Download size={13} />
                                <span>Baixar {currentPreset.shape === 'circle' ? 'Painel Redondo' : 'Arte'}</span>
                            </button>
                        </div>
                    </div>

                    {/* Moldura do Painel com Efeito de Suporte de Festa */}
                    <div className="relative w-full min-h-[540px] max-h-[760px] bg-[#0c1017] rounded-2xl border border-slate-800 overflow-hidden flex items-center justify-center p-4 sm:p-6 shadow-2xl select-none">
                        {/* MODO LADO A LADO: Referência à esquerda, Arte à direita */}
                        {showReferenceOverlay && referenceImageUrl && referenceComparisonMode === 'sideBySide' ? (
                            <div className="w-full h-full grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                                {/* Coluna 1: Foto de Referência */}
                                <div className="h-full flex flex-col items-center justify-center bg-slate-950/70 p-4 rounded-xl border border-slate-800 space-y-2">
                                    <div className="w-full flex items-center justify-between text-xs pb-1 border-b border-slate-800">
                                        <span className="font-bold text-pink-400 flex items-center gap-1.5">
                                            <ImageIcon size={13} />
                                            <span>Foto de Referência (Cliente / Modelo)</span>
                                        </span>
                                        <button
                                            type="button"
                                            onClick={handleAddReferenceAsLayer}
                                            className="px-2 py-0.5 rounded text-[10px] font-bold bg-pink-500 text-slate-950 hover:bg-pink-400 cursor-pointer"
                                        >
                                            + Inserir no Painel
                                        </button>
                                    </div>
                                    <div className="flex-1 w-full flex items-center justify-center overflow-hidden max-h-[560px]">
                                        <img
                                            src={referenceImageUrl}
                                            alt={referenceImageName}
                                            className="max-h-[520px] max-w-full object-contain rounded-lg border border-slate-800 shadow-xl"
                                        />
                                    </div>
                                    <div className="text-[10px] text-slate-500 truncate max-w-full">
                                        {referenceImageName}
                                    </div>
                                </div>

                                {/* Coluna 2: Arte em Edição */}
                                <div className="h-full flex flex-col items-center justify-center bg-slate-950/40 p-4 rounded-xl border border-slate-800 space-y-2">
                                    <div className="w-full flex items-center justify-between text-xs pb-1 border-b border-slate-800">
                                        <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                                            <PartyPopper size={13} />
                                            <span>Painel / Topo de Bolo (Edição)</span>
                                        </span>
                                        <span className="text-[10px] text-slate-400 font-mono">
                                            {currentPreset.widthCm}×{currentPreset.heightCm}cm
                                        </span>
                                    </div>
                                    <div className="flex-1 w-full flex items-center justify-center overflow-hidden max-h-[560px]">
                                        <canvas
                                            ref={displayCanvasRef}
                                            style={{
                                                maxWidth: '100%',
                                                maxHeight: '520px',
                                                objectFit: 'contain'
                                            }}
                                            className="shadow-2xl rounded-lg border border-slate-800"
                                        />
                                    </div>
                                    <div className="text-[10px] text-slate-500">
                                        Renderização ao vivo com sangria e camadas
                                    </div>
                                </div>
                            </div>
                        ) : (
                            /* MODO PADRÃO OU SOBREPOSTO (OVERLAY FANTASMA) */
                            <div className="relative w-full h-full flex items-center justify-center">
                                {/* Suporte de ferro do painel redondo (cenografia realista) */}
                                {currentPreset.shape === 'circle' && (
                                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
                                        <div className="w-[460px] h-[460px] rounded-full border-4 border-slate-500" />
                                        <div className="absolute bottom-8 w-1 h-36 bg-slate-600" />
                                        <div className="absolute bottom-6 w-32 h-1 bg-slate-600" />
                                    </div>
                                )}

                                {/* Canvas Principal */}
                                <canvas
                                    ref={displayCanvasRef}
                                    style={{
                                        transform: `scale(${zoom})`,
                                        maxWidth: '100%',
                                        maxHeight: '680px',
                                        objectFit: 'contain'
                                    }}
                                    className="transition-transform duration-75 shadow-2xl rounded-lg border border-slate-800/80"
                                />

                                {/* Guia Fantasma de Referência Sobreposta */}
                                {showReferenceOverlay && referenceImageUrl && referenceComparisonMode === 'overlay' && (
                                    <div
                                        className="absolute inset-0 flex items-center justify-center pointer-events-none z-20"
                                        style={{ transform: `scale(${zoom})` }}
                                    >
                                        <img
                                            src={referenceImageUrl}
                                            alt="Guia Fantasma de Referência"
                                            style={{
                                                opacity: referenceOverlayOpacity,
                                                maxWidth: '100%',
                                                maxHeight: '680px',
                                                objectFit: 'contain'
                                            }}
                                            className="transition-opacity rounded-lg"
                                        />
                                        <div className="absolute top-4 right-4 bg-pink-500/90 text-slate-950 font-black text-[10px] px-2.5 py-1 rounded-lg shadow-lg pointer-events-none">
                                            Guia Fantasma ({Math.round(referenceOverlayOpacity * 100)}%)
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Dica de Rodapé */}
                    <div className="flex items-center justify-between text-[11px] text-slate-500 px-1 flex-wrap gap-2">
                        <span className="flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                            <span>Linha vermelha pontilhada: sangria para costura e elástico de sublimação do painel.</span>
                        </span>
                        <span className="text-slate-400 font-bold">
                            Tamanho selecionado: {currentPreset.widthCm} × {currentPreset.heightCm} cm
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};
