import React, { useState, useMemo } from 'react';
import { 
    Sparkles, Camera, Sun, CloudRain, Palette, Film, Compass, Flame, 
    Search, Check, X, Copy, Zap, ArrowRight, Layers, RefreshCw, 
    Wand2, Eye, Tag, Info, Filter, CheckCircle2, ChevronRight, Sliders,
    Box, Move, Split, Maximize2, User, Aperture
} from 'lucide-react';
import { 
    VISUAL_EFFECTS, VISUAL_EFFECT_CATEGORIES, EFFECT_PRESETS, VisualEffect, EffectCategory,
    ULTRA_PREMIUM_16K_PROMPT
} from '../utils/visualEffectsData';
import { TargetPlatform } from '../types';

interface VisualEffectsTabProps {
    onApplyPrompt: (promptText: string) => void;
    onCreateVisual?: (promptText: string) => void;
    currentBasePrompt?: string;
    hasActiveImage?: boolean;
    activeImageName?: string;
    detectedSubject?: string;
    targetPlatform?: TargetPlatform;
    onSwitchToArchitect?: () => void;
}

interface FeaturedEffectItem {
    id: string;
    tag: string;
    name: string;
    desc: string;
    angle: string;
}

interface FeaturedPack {
    id: 'framing' | 'portraits' | 'lighting' | 'lenses';
    title: string;
    badge: string;
    subtitle: string;
    icon: React.ComponentType<{ size?: number; className?: string }>;
    accentColor: string;
    gradient: string;
    borderColor: string;
    effectIds: string[];
    items: FeaturedEffectItem[];
}

const FEATURED_PACKS: FeaturedPack[] = [
    {
        id: 'framing',
        title: 'Comandos de Enquadramento',
        badge: 'Ângulos & Poltrona',
        subtitle: 'Enquadramentos precisos do sujeito na poltrona clássica',
        icon: Camera,
        accentColor: 'text-amber-400',
        gradient: 'from-amber-950/60 via-red-950/40 to-stone-900',
        borderColor: 'border-amber-600/40',
        effectIds: ['topdown', 'lowangle', 'closeup', 'sideview'],
        items: [
            { id: 'topdown', tag: '/topdown', name: 'Top-Down', desc: 'Zenital 90° diretamente de cima com vista aérea vertical', angle: 'Zenital 90°' },
            { id: 'lowangle', tag: '/lowangle', name: 'Low Angle', desc: 'Câmera no chão apontando para cima com imponência', angle: 'Contra-Plongée' },
            { id: 'closeup', tag: '/closeup', name: 'Close-Up', desc: 'Plano fechado no rosto capturando olhar e expressão', angle: 'Detalhes' },
            { id: 'sideview', tag: '/sideview', name: 'Side-View', desc: 'Visão lateral 90° meditativa com mão no queixo', angle: 'Perfil 90°' },
        ]
    },
    {
        id: 'portraits',
        title: 'Ensaios Fotográficos',
        badge: 'Envie seu Rosto',
        subtitle: 'Envie uma foto do seu rosto e o comando para ensaios de alta moda',
        icon: User,
        accentColor: 'text-slate-200',
        gradient: 'from-zinc-950 via-stone-900 to-black',
        borderColor: 'border-zinc-600/40',
        effectIds: ['editorialportrait', 'fashioneditorial', 'candidportrait', 'lookbook'],
        items: [
            { id: 'editorialportrait', tag: '/editorialportrait', name: 'Editorial Portrait', desc: 'Blazer preto sob medida, fundo escuro e iluminação de revista', angle: 'Capa Editorial' },
            { id: 'fashioneditorial', tag: '/fashioneditorial', name: 'Fashion Editorial', desc: 'Editorial contemporâneo de passarela com postura marcante', angle: 'Alta Costura' },
            { id: 'candidportrait', tag: '/candidportrait', name: 'Candid Portrait', desc: 'Retrato espontâneo com mão no queixo e olhar reflexivo', angle: 'Espontâneo' },
            { id: 'lookbook', tag: '/lookbook', name: 'Lookbook', desc: 'Estilo catálogo moderno com layout gráfico "LOOK BOOK"', angle: 'Catálogo de Luxo' },
        ]
    },
    {
        id: 'lighting',
        title: 'ILUMINAÇÃO',
        badge: 'Luz da Fotografia',
        subtitle: 'Comandos para transformar a iluminação da imagem',
        icon: Sun,
        accentColor: 'text-orange-400',
        gradient: 'from-amber-950/70 via-orange-950/50 to-stone-900',
        borderColor: 'border-orange-600/40',
        effectIds: ['goldenhour', 'softbox', 'rimlight', 'hardlight'],
        items: [
            { id: 'goldenhour', tag: '/goldenhour', name: 'Golden Hour', desc: 'Luz dourada quente do pôr do sol entrando pela janela', angle: 'Pôr do Sol' },
            { id: 'softbox', tag: '/softbox', name: 'Softbox', desc: 'Iluminação difusa de estúdio uniforme sem sombras duras', angle: 'Luz Suave' },
            { id: 'rimlight', tag: '/rimlight', name: 'Rim Light', desc: 'Luz de contorno traseiro brilhante desenhando a silhueta', angle: 'Luz de Borda' },
            { id: 'hardlight', tag: '/hardlight', name: 'Hard Light', desc: 'Luz direta e sombras nítidas geométricas projetadas no rosto', angle: 'Alto Contraste' },
        ]
    },
    {
        id: 'lenses',
        title: 'LENTES / CAMERA',
        badge: 'Óptica & Distorção',
        subtitle: 'Comandos para mudar a lente óptica da fotografia',
        icon: Aperture,
        accentColor: 'text-rose-400',
        gradient: 'from-red-950/60 via-zinc-950 to-black',
        borderColor: 'border-red-700/40',
        effectIds: ['lens35mm', 'lens50mm', 'lens85mm', 'fisheye'],
        items: [
            { id: 'lens35mm', tag: '/35mm', name: 'Lente 35mm', desc: 'Grande-angular documental: sujeito e carro clássico em equilíbrio', angle: '35mm Prime' },
            { id: 'lens50mm', tag: '/50mm', name: 'Lente 50mm', desc: 'Campo de visão natural do olho humano em meio corpo', angle: '50mm Normal' },
            { id: 'lens85mm', tag: '/85mm', name: 'Lente 85mm', desc: 'Teleobjetiva de retrato com fundo aproximado e bokeh cremoso', angle: '85mm Tele' },
            { id: 'fisheye', tag: '/fisheye', name: 'Lente Fisheye', desc: 'Olho de peixe 180° com distorção esférica hemisférica acentuada', angle: 'Fisheye 180°' },
        ]
    }
];

export const VisualEffectsTab: React.FC<VisualEffectsTabProps> = ({
    onApplyPrompt,
    onCreateVisual,
    currentBasePrompt = '',
    hasActiveImage = false,
    activeImageName,
    detectedSubject = '',
    targetPlatform = 'midjourney',
    onSwitchToArchitect
}) => {
    // Selection state
    const [selectedEffectIds, setSelectedEffectIds] = useState<string[]>([
        'forcedperspective', 'leadinglines', 'depthshot', '8k'
    ]);
    const [activeFeaturedPack, setActiveFeaturedPack] = useState<'framing' | 'portraits' | 'lighting' | 'lenses'>('framing');
    const [activeCategory, setActiveCategory] = useState<string>('all');
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [includeColon, setIncludeColon] = useState<boolean>(false); // Alternar entre /tag e /tag:
    const [subjectText, setSubjectText] = useState<string>(() => {
        if (detectedSubject && detectedSubject.trim().length > 0) return detectedSubject;
        if (currentBasePrompt && currentBasePrompt.trim().length > 0) return currentBasePrompt;
        return 'Homem elegante com óculos escuros e casaco marrom em ambiente urbano moderno';
    });
    const [promptFormat, setPromptFormat] = useState<'hybrid' | 'tags_only' | 'descriptive'>('hybrid');
    const [copied, setCopied] = useState<boolean>(false);
    const [appliedSuccess, setAppliedSuccess] = useState<boolean>(false);

    // Filter effects based on category and search query
    const filteredEffects = useMemo(() => {
        return VISUAL_EFFECTS.filter(eff => {
            const matchesCategory = activeCategory === 'all' || eff.category === activeCategory;
            const q = searchQuery.toLowerCase().trim();
            if (!q) return matchesCategory;

            const matchesSearch = 
                eff.name.toLowerCase().includes(q) ||
                eff.tag.toLowerCase().includes(q) ||
                eff.description.toLowerCase().includes(q) ||
                eff.categoryLabel.toLowerCase().includes(q);

            return matchesCategory && matchesSearch;
        });
    }, [activeCategory, searchQuery]);

    // Selected effects list
    const selectedEffects = useMemo(() => {
        return VISUAL_EFFECTS.filter(eff => selectedEffectIds.includes(eff.id));
    }, [selectedEffectIds]);

    // Counts by category
    const categoryCounts = useMemo(() => {
        const counts: Record<string, number> = { all: VISUAL_EFFECTS.length };
        VISUAL_EFFECTS.forEach(eff => {
            counts[eff.category] = (counts[eff.category] || 0) + 1;
        });
        return counts;
    }, []);

    // Toggle effect selection
    const handleToggleEffect = (id: string) => {
        setSelectedEffectIds(prev => 
            prev.includes(id) 
                ? prev.filter(item => item !== id) 
                : [...prev, id]
        );
    };

    // Apply preset
    const handleApplyPreset = (effectIds: string[]) => {
        setSelectedEffectIds(effectIds);
    };

    // Clear all selected
    const handleClearAll = () => {
        setSelectedEffectIds([]);
    };

    // Format individual tag with or without colon
    const formatTag = (tag: string) => {
        const cleanTag = tag.endsWith(':') ? tag.slice(0, -1) : tag;
        return includeColon ? `${cleanTag}:` : cleanTag;
    };

    // Compile the prompt based on selected effects and subject
    const compiledPrompt = useMemo(() => {
        const subject = subjectText.trim() || 'A detailed photograph of the subject';
        const formattedTags = selectedEffects.map(e => formatTag(e.tag)).join(' ');
        const descriptiveTokens = selectedEffects.map(e => e.promptToken).join(', ');

        let result = '';

        if (promptFormat === 'tags_only') {
            result = formattedTags ? `${formattedTags} ${subject}` : subject;
        } else if (promptFormat === 'descriptive') {
            result = descriptiveTokens ? `${subject}, ${descriptiveTokens}` : subject;
        } else {
            // Hybrid (Tags + Detailed Prompt)
            const parts: string[] = [];
            if (formattedTags) parts.push(formattedTags);
            parts.push(subject);
            if (descriptiveTokens) parts.push(descriptiveTokens);
            result = parts.join(', ');
        }

        // Midjourney parameters
        if (targetPlatform === 'midjourney') {
            if (!result.includes('--v') && !result.includes('--ar')) {
                result += ' --v 6.1 --q 2';
            }
        }

        return result;
    }, [subjectText, selectedEffects, promptFormat, targetPlatform, includeColon]);

    // Copy to clipboard
    const handleCopy = () => {
        navigator.clipboard.writeText(compiledPrompt);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    // Apply to current app prompt
    const handleApply = () => {
        onApplyPrompt(compiledPrompt);
        setAppliedSuccess(true);
        setTimeout(() => setAppliedSuccess(false), 2500);
    };

    // Generate Visual Now
    const handleGenerateVisual = () => {
        onApplyPrompt(compiledPrompt);
        if (onCreateVisual) {
            onCreateVisual(compiledPrompt);
        }
    };

    // Quick subject suggestions
    const subjectSuggestions = [
        'Homem com óculos escuros e casaco marrom em cenário arquitetônico urbano',
        'Retrato feminino cinematográfico em iluminação de pôr do sol dourado',
        'Carro esportivo moderno futurista com reflexos em asfalto molhado',
        'Garrafa de perfume luxuosa sobre espelho d’água com gotas condensadas',
        'Ciborgue com implantes cibernéticos e luzes neon azul e magenta'
    ];

    const renderCategoryIcon = (catId: string) => {
        switch (catId) {
            case 'portraits': return <User size={13} />;
            case 'lenses': return <Aperture size={13} />;
            case 'perspective': return <Box size={13} />;
            case 'angles': return <Camera size={13} />;
            case 'movement': return <Move size={13} />;
            case 'levels': return <Layers size={13} />;
            case 'reveals': return <Eye size={13} />;
            case 'focus': return <Maximize2 size={13} />;
            case 'reflections': return <Split size={13} />;
            case 'time': return <Zap size={13} />;
            case 'lighting': return <Sun size={13} />;
            case 'analog': return <Film size={13} />;
            case 'weather': return <CloudRain size={13} />;
            case 'styles': return <Palette size={13} />;
            case 'scenarios': return <Compass size={13} />;
            case 'quality': return <Flame size={13} />;
            case 'all':
            default: return <Sparkles size={13} />;
        }
    };

    const renderEffectIcon = (iconName: string) => {
        switch (iconName) {
            case 'User': return <User size={13} />;
            case 'Aperture': return <Aperture size={13} />;
            case 'Box': return <Box size={13} />;
            case 'Move': return <Move size={13} />;
            case 'Layers': return <Layers size={13} />;
            case 'Eye': return <Eye size={13} />;
            case 'Maximize2': return <Maximize2 size={13} />;
            case 'Split': return <Split size={13} />;
            case 'Zap': return <Zap size={13} />;
            case 'Sun': return <Sun size={13} />;
            case 'Camera': return <Camera size={13} />;
            case 'Film': return <Film size={13} />;
            case 'CloudRain': return <CloudRain size={13} />;
            case 'Palette': return <Palette size={13} />;
            case 'Compass': return <Compass size={13} />;
            case 'Flame': return <Flame size={13} />;
            case 'Sliders': return <Sliders size={13} />;
            default: return <Sparkles size={13} />;
        }
    };

    return (
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 backdrop-blur-xl shadow-2xl flex flex-col gap-5 text-slate-200">
            {/* Header com Navegação e Resumo */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
                <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-500/20">
                        <Sparkles size={18} />
                    </div>
                    <div>
                        <h2 className="text-base font-bold text-white flex items-center gap-2">
                            <span>Galeria de Efeitos Visuais & Câmera</span>
                            <span className="px-2 py-0.5 text-[10px] font-black rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/30">
                                {VISUAL_EFFECTS.length} Efeitos
                            </span>
                        </h2>
                        <p className="text-xs text-slate-400">
                            Tags fotográficas em cápsulas (/tag) baseadas nas referências visuais
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {/* Botão de Alternar Sintaxe: /tag vs /tag: */}
                    <button
                        onClick={() => setIncludeColon(!includeColon)}
                        className={`px-2.5 py-1 rounded-lg border text-xs font-mono font-bold transition-all flex items-center gap-1.5 ${
                            includeColon 
                                ? 'bg-indigo-600/30 border-indigo-400 text-indigo-200' 
                                : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
                        }`}
                        title="Alternar entre formato /tag e /tag:"
                    >
                        <Tag size={12} className={includeColon ? 'text-indigo-400' : 'text-slate-400'} />
                        <span>Sintaxe: {includeColon ? '/tag:' : '/tag'}</span>
                    </button>

                    {onSwitchToArchitect && (
                        <button
                            onClick={onSwitchToArchitect}
                            className="px-2.5 py-1 rounded-lg bg-blue-600/20 border border-blue-500/40 text-blue-300 hover:text-white hover:border-blue-400 transition-all text-xs font-bold flex items-center gap-1.5"
                        >
                            <Sliders size={13} />
                            <span>Arquiteto</span>
                        </button>
                    )}
                </div>
            </div>

            {/* BOTÃO MASTER: ULTRA-PREMIUM 16K PROFESSIONAL REMASTER & ENHANCEMENT */}
            <div className="p-3.5 rounded-2xl border border-amber-500/40 bg-gradient-to-r from-amber-950/80 via-stone-900 to-yellow-950/60 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-start gap-3">
                    <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 shrink-0 mt-0.5">
                        <Sparkles size={20} />
                    </div>
                    <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-black text-amber-300 uppercase tracking-wide">
                                Ultra-Premium 16K Professional Remaster & Enhancement
                            </span>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-200 border border-amber-500/30 font-bold">
                                16K Master Fiel
                            </span>
                        </div>
                        <p className="text-[11px] text-slate-300 leading-relaxed max-w-2xl">
                            Preserva a imagem exatamente como fornecida (rosto, expressão, cabelo, iluminação e fundo) aplicando super-resolução, nitidez óptica e micro-contraste sem alucinações.
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
                    <button
                        onClick={() => {
                            onApplyPrompt(ULTRA_PREMIUM_16K_PROMPT);
                            if (!selectedEffectIds.includes('remaster16k')) {
                                setSelectedEffectIds(prev => [...prev, 'remaster16k']);
                            }
                        }}
                        className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 transition-all active:scale-95 hover:scale-105"
                    >
                        <Sparkles size={14} className="text-slate-950" />
                        <span>Selecionar Remaster 16K</span>
                    </button>
                </div>
            </div>

            {/* COLEÇÃO ESPECIAL DE FOTOGRAFIA & ENSAIOS (Referência das Imagens) */}
            <div className="space-y-3 p-3.5 bg-slate-950/80 rounded-2xl border border-violet-500/20 shadow-xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-2.5">
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-gradient-to-br from-amber-500/20 to-violet-500/20 text-amber-300 border border-amber-500/30">
                            <Sparkles size={14} />
                        </div>
                        <div>
                            <div className="text-xs font-bold text-white flex items-center gap-2">
                                <span>Coleções Exclusivas de Fotografia</span>
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-300 font-mono border border-violet-500/30">
                                    4 Novos Packs
                                </span>
                            </div>
                            <p className="text-[10px] text-slate-400">
                                Enquadramento, Ensaios de Rosto, Iluminação de Estúdio & Lentes Ópticas
                            </p>
                        </div>
                    </div>

                    {/* Abas das 4 Coleções Especiais */}
                    <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
                        {FEATURED_PACKS.map(pack => {
                            const isTabActive = activeFeaturedPack === pack.id;
                            const IconComponent = pack.icon;
                            return (
                                <button
                                    key={pack.id}
                                    onClick={() => setActiveFeaturedPack(pack.id)}
                                    className={`px-2.5 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 border ${
                                        isTabActive
                                            ? 'bg-slate-800 text-white border-violet-400 shadow-md ring-1 ring-violet-400/40'
                                            : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:text-slate-200 hover:border-slate-700'
                                    }`}
                                >
                                    <IconComponent size={13} className={pack.accentColor} />
                                    <span>{pack.title}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Exibição do Pack Selecionado */}
                {(() => {
                    const currentPack = FEATURED_PACKS.find(p => p.id === activeFeaturedPack) || FEATURED_PACKS[0];
                    const PackIcon = currentPack.icon;
                    const allSelectedInPack = currentPack.effectIds.every(id => selectedEffectIds.includes(id));

                    return (
                        <div className={`p-3.5 rounded-xl border ${currentPack.borderColor} bg-gradient-to-br ${currentPack.gradient} space-y-3 transition-all relative overflow-hidden`}>
                            {/* Header do Pack */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 relative z-10">
                                <div className="space-y-0.5">
                                    <div className="flex items-center gap-2">
                                        <PackIcon size={16} className={currentPack.accentColor} />
                                        <h3 className="text-sm font-black text-white tracking-wide uppercase">
                                            {currentPack.title}
                                        </h3>
                                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-white/10 text-slate-200 border border-white/10">
                                            {currentPack.badge}
                                        </span>
                                    </div>
                                    <p className="text-xs text-slate-300 font-medium">
                                        {currentPack.subtitle}
                                    </p>
                                </div>

                                <div className="flex items-center gap-2 shrink-0">
                                    <button
                                        onClick={() => {
                                            if (allSelectedInPack) {
                                                setSelectedEffectIds(prev => prev.filter(id => !currentPack.effectIds.includes(id)));
                                            } else {
                                                setSelectedEffectIds(prev => Array.from(new Set([...prev, ...currentPack.effectIds])));
                                            }
                                        }}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 border shadow-sm ${
                                            allSelectedInPack
                                                ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 hover:bg-rose-500/30'
                                                : 'bg-violet-600 hover:bg-violet-500 text-white border-violet-400'
                                        }`}
                                    >
                                        <CheckCircle2 size={13} />
                                        <span>{allSelectedInPack ? 'Desmarcar Pack' : 'Selecionar os 4 Comandos'}</span>
                                    </button>
                                </div>
                            </div>

                            {/* Dica contextual de uso */}
                            {currentPack.id === 'portraits' && (
                                <div className="p-2 rounded-lg bg-black/40 border border-white/10 text-[11px] text-amber-200/90 flex items-center gap-2">
                                    <User size={14} className="text-amber-400 shrink-0" />
                                    <span>
                                        <strong>Dica Pro:</strong> Envie uma foto do seu rosto no carregador de imagem e adicione um destes comandos para gerar seu ensaio editorial com alta fidelidade facial!
                                    </span>
                                </div>
                            )}

                            {/* Grid 4 Cards no estilo exato da folha de referência */}
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 relative z-10">
                                {currentPack.items.map(item => {
                                    const isSelected = selectedEffectIds.includes(item.id);
                                    return (
                                        <button
                                            key={item.id}
                                            onClick={() => handleToggleEffect(item.id)}
                                            className={`p-3 rounded-xl border text-left transition-all duration-200 flex flex-col justify-between group relative overflow-hidden ${
                                                isSelected
                                                    ? 'bg-black/90 border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.3)] ring-1 ring-cyan-400'
                                                    : 'bg-black/60 border-white/10 hover:border-white/30 hover:bg-black/80'
                                            }`}
                                        >
                                            <div className="space-y-1.5 mb-3">
                                                <div className="flex items-center justify-between text-[10px]">
                                                    <span className="font-mono text-slate-400 uppercase tracking-wider">
                                                        {item.angle}
                                                    </span>
                                                    <div className={`w-4 h-4 rounded-full flex items-center justify-center border transition-all ${
                                                        isSelected
                                                            ? 'bg-cyan-500 border-cyan-300 text-slate-950 font-bold'
                                                            : 'border-slate-700 bg-slate-900 text-transparent'
                                                    }`}>
                                                        <Check size={10} className={isSelected ? 'block' : 'hidden'} />
                                                    </div>
                                                </div>
                                                <h4 className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors">
                                                    {item.name}
                                                </h4>
                                                <p className="text-[10px] text-slate-400 line-clamp-2 leading-tight">
                                                    {item.desc}
                                                </p>
                                            </div>

                                            {/* Tag Pill Style ChatGPT / OpenAI como na foto original */}
                                            <div className={`px-2.5 py-1 rounded-full border text-[11px] font-mono font-black flex items-center justify-center gap-1.5 transition-all ${
                                                isSelected
                                                    ? 'bg-cyan-400 text-slate-950 border-cyan-300 shadow-md font-extrabold'
                                                    : 'bg-zinc-900/90 text-cyan-300 border-zinc-700/80 group-hover:border-cyan-400/60'
                                            }`}>
                                                <Sparkles size={11} className={isSelected ? 'text-slate-950' : 'text-cyan-400'} />
                                                <span>{formatTag(item.tag)}</span>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })()}
            </div>

            {/* Presets Rápidos de 1 Clique */}
            <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-400">
                    <span className="flex items-center gap-1.5">
                        <Wand2 size={13} className="text-violet-400" />
                        <span>Combinações Prontas (Presets):</span>
                    </span>
                    <span className="text-[10px] text-slate-500 font-normal">
                        Clique para carregar conjunto
                    </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {EFFECT_PRESETS.map((preset) => {
                        const isPresetActive = preset.effectIds.every(id => selectedEffectIds.includes(id));
                        return (
                            <button
                                key={preset.id}
                                onClick={() => handleApplyPreset(preset.effectIds)}
                                className={`p-2.5 rounded-xl border text-left transition-all relative overflow-hidden group ${
                                    isPresetActive 
                                        ? 'bg-gradient-to-r from-violet-900/60 to-indigo-900/60 border-violet-400 text-white shadow-md shadow-violet-500/10' 
                                        : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700 hover:bg-slate-800/50 text-slate-300'
                                }`}
                            >
                                <div className="text-xs font-bold flex items-center justify-between mb-1">
                                    <span className="truncate group-hover:text-violet-300 transition-colors">{preset.title}</span>
                                    {isPresetActive && (
                                        <Check size={12} className="text-violet-400 shrink-0 ml-1" />
                                    )}
                                </div>
                                <div className="text-[10px] font-mono text-violet-300/80 truncate">
                                    {preset.tagDisplay}
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Configuração do Sujeito */}
            <div className="space-y-1.5 bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                <div className="flex items-center justify-between text-xs font-bold">
                    <label className="text-slate-300 flex items-center gap-1.5">
                        <Camera size={13} className="text-blue-400" />
                        <span>Assunto / Sujeito Principal do Prompt:</span>
                    </label>
                    {hasActiveImage && activeImageName && (
                        <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                            Imagem ativa vinculada
                        </span>
                    )}
                </div>
                <input
                    type="text"
                    value={subjectText}
                    onChange={(e) => setSubjectText(e.target.value)}
                    placeholder="Ex: Homem elegante com óculos escuros e casaco marrom em cenário urbano..."
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 transition-all font-sans"
                />
                
                {/* Sugestões rápidas de assunto */}
                <div className="flex items-center gap-1.5 overflow-x-auto pt-1 no-scrollbar text-[10px]">
                    <span className="text-slate-500 shrink-0">Sugestões:</span>
                    {subjectSuggestions.map((sug, idx) => (
                        <button
                            key={idx}
                            onClick={() => setSubjectText(sug)}
                            className="shrink-0 px-2 py-0.5 rounded-md bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700/60 hover:text-white transition-colors"
                        >
                            {sug.split(' ')[0]} {sug.split(' ')[1]} {sug.split(' ')[2]}...
                        </button>
                    ))}
                </div>
            </div>

            {/* Categorias & Barra de Busca */}
            <div className="space-y-2.5">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 justify-between">
                    <div className="relative flex-1">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Buscar efeito (ex: forcedperspective, bulletfreeze, prismflare, puddleframe)..."
                            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-8 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-violet-500 transition-all"
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery('')}
                                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                            >
                                <X size={13} />
                            </button>
                        )}
                    </div>

                    {selectedEffectIds.length > 0 && (
                        <button
                            onClick={handleClearAll}
                            className="text-xs text-rose-400 hover:text-rose-300 px-2.5 py-1.5 rounded-lg border border-rose-500/20 hover:border-rose-500/40 bg-rose-500/10 flex items-center justify-center gap-1 transition-all shrink-0"
                        >
                            <X size={13} />
                            <span>Limpar ({selectedEffectIds.length})</span>
                        </button>
                    )}
                </div>

                {/* Filtro de Categorias em Chips com Contadores */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 no-scrollbar">
                    {VISUAL_EFFECT_CATEGORIES.map((cat) => {
                        const isActive = activeCategory === cat.id;
                        const count = categoryCounts[cat.id] || 0;
                        return (
                            <button
                                key={cat.id}
                                onClick={() => setActiveCategory(cat.id)}
                                className={`px-2.5 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 border ${
                                    isActive
                                        ? 'bg-violet-600 text-white border-violet-400 shadow-md shadow-violet-500/20'
                                        : 'bg-slate-950/60 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-slate-200'
                                }`}
                            >
                                {renderCategoryIcon(cat.id)}
                                <span>{cat.label}</span>
                                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                                    isActive ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-400'
                                }`}>
                                    {count}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Chips de Efeitos Selecionados no Topo */}
            {selectedEffects.length > 0 && (
                <div className="p-2.5 bg-slate-950/80 rounded-xl border border-violet-500/30 flex flex-wrap items-center gap-1.5 animate-in fade-in duration-200">
                    <span className="text-[10px] font-bold text-violet-300 uppercase tracking-wider mr-1 flex items-center gap-1">
                        <CheckCircle2 size={12} className="text-violet-400" />
                        Ativos ({selectedEffects.length}):
                    </span>
                    {selectedEffects.map((eff) => (
                        <span
                            key={eff.id}
                            className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-violet-500/20 border border-violet-500/40 text-violet-200 text-[11px] font-mono shadow-sm"
                        >
                            <span className="font-black text-cyan-300">{formatTag(eff.tag)}</span>
                            <button
                                onClick={() => handleToggleEffect(eff.id)}
                                className="text-violet-400 hover:text-rose-300 ml-0.5"
                                title="Remover efeito"
                            >
                                <X size={11} />
                            </button>
                        </span>
                    ))}
                </div>
            )}

            {/* Grid de Efeitos com Estilo Visual Idêntico às Imagens de Referência */}
            <div className="flex-1 overflow-y-auto max-h-[380px] pr-1 space-y-2 custom-scrollbar">
                {filteredEffects.length === 0 ? (
                    <div className="text-center py-10 text-slate-500 text-xs">
                        Nenhum efeito encontrado para "{searchQuery}".
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                        {filteredEffects.map((effect) => {
                            const isSelected = selectedEffectIds.includes(effect.id);
                            return (
                                <button
                                    key={effect.id}
                                    onClick={() => handleToggleEffect(effect.id)}
                                    className={`relative group rounded-xl p-3 border text-left transition-all duration-200 flex flex-col justify-between overflow-hidden ${
                                        isSelected
                                            ? 'bg-gradient-to-br from-violet-950/70 via-slate-900 to-indigo-950/70 border-violet-400 shadow-[0_0_15px_rgba(139,92,246,0.25)] ring-1 ring-violet-400'
                                            : 'bg-slate-950/70 border-slate-800 hover:border-slate-600 hover:bg-slate-900/60'
                                    }`}
                                >
                                    {/* Background ambient gradient glow */}
                                    <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${effect.gradient} rounded-full blur-2xl opacity-40 group-hover:opacity-70 transition-opacity`} />

                                    <div>
                                        {/* Tag Capsule Header (Exatamente como nas fotos de referência: /forcedperspective) */}
                                        <div className="flex items-center justify-between mb-2">
                                            <span className={`px-2.5 py-0.5 rounded-full font-mono text-[11px] font-black tracking-tight border transition-all ${
                                                isSelected
                                                    ? 'bg-cyan-400 text-slate-950 border-cyan-300 shadow-sm'
                                                    : 'bg-slate-950/90 text-cyan-300 border-slate-700/80 group-hover:border-cyan-500/50'
                                            }`}>
                                                {formatTag(effect.tag)}
                                            </span>

                                            <div className={`w-5 h-5 rounded-full flex items-center justify-center border transition-all ${
                                                isSelected
                                                    ? 'bg-violet-500 border-violet-400 text-white'
                                                    : 'border-slate-700 bg-slate-900/80 text-transparent group-hover:border-slate-500'
                                            }`}>
                                                <Check size={12} className={isSelected ? 'block' : 'hidden'} />
                                            </div>
                                        </div>

                                        {/* Título & Categoria */}
                                        <div className="space-y-0.5 mb-1.5">
                                            <div className="text-xs font-bold text-slate-100 group-hover:text-violet-200 transition-colors flex items-center gap-1.5">
                                                {renderEffectIcon(effect.iconName)}
                                                <span className="truncate">{effect.name}</span>
                                            </div>
                                            <div className="text-[9px] uppercase tracking-wider text-slate-500 font-bold">
                                                {effect.categoryLabel}
                                            </div>
                                        </div>

                                        {/* Descrição resumida */}
                                        <p className="text-[10px] text-slate-400 line-clamp-2 leading-relaxed">
                                            {effect.description}
                                        </p>
                                    </div>

                                    {/* Efeito ativo indicador */}
                                    {isSelected && (
                                        <div className="mt-2 pt-1.5 border-t border-violet-500/20 flex items-center justify-between text-[9px] font-bold text-violet-300">
                                            <span>Incluído no prompt</span>
                                            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                                        </div>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Painel de Saída & Geração do Prompt */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                        <Zap size={14} className="text-amber-400" />
                        <span className="text-xs font-bold text-slate-200 uppercase tracking-wide">
                            Prompt Gerado com Efeitos
                        </span>
                    </div>

                    {/* Seletor de Formato do Prompt */}
                    <div className="flex items-center bg-slate-900 p-0.5 rounded-lg border border-slate-800 text-[10px]">
                        <button
                            onClick={() => setPromptFormat('hybrid')}
                            className={`px-2 py-1 rounded font-bold transition-all ${
                                promptFormat === 'hybrid' ? 'bg-violet-600 text-white' : 'text-slate-400 hover:text-slate-200'
                            }`}
                            title="Tags + Prompt Fluido Detalhado"
                        >
                            Híbrido
                        </button>
                        <button
                            onClick={() => setPromptFormat('tags_only')}
                            className={`px-2 py-1 rounded font-bold transition-all ${
                                promptFormat === 'tags_only' ? 'bg-violet-600 text-white' : 'text-slate-400 hover:text-slate-200'
                            }`}
                            title="Apenas Tags com o Sujeito"
                        >
                            Apenas /Tags
                        </button>
                        <button
                            onClick={() => setPromptFormat('descriptive')}
                            className={`px-2 py-1 rounded font-bold transition-all ${
                                promptFormat === 'descriptive' ? 'bg-violet-600 text-white' : 'text-slate-400 hover:text-slate-200'
                            }`}
                            title="Descritivo Natural para IAs"
                        >
                            Descritivo
                        </button>
                    </div>
                </div>

                {/* Caixa de Texto do Prompt Compilado */}
                <div className="relative group">
                    <textarea
                        readOnly
                        value={compiledPrompt}
                        rows={3}
                        className="w-full bg-slate-900/90 border border-slate-700/80 rounded-lg p-2.5 text-xs text-slate-200 font-mono focus:outline-none custom-scrollbar resize-none selection:bg-violet-600"
                    />
                    <button
                        onClick={handleCopy}
                        className="absolute top-2 right-2 p-1.5 rounded-md bg-slate-800/90 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-all opacity-80 hover:opacity-100"
                        title="Copiar prompt compilado"
                    >
                        {copied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                    </button>
                </div>

                {/* Botões de Ação */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                    <button
                        onClick={handleApply}
                        className="w-full py-2.5 px-3 rounded-lg font-bold text-xs bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 hover:text-white transition-all flex items-center justify-center gap-1.5 active:scale-95"
                    >
                        {appliedSuccess ? (
                            <>
                                <Check size={14} className="text-emerald-400" />
                                <span className="text-emerald-400 font-bold">Aplicado ao Arquiteto!</span>
                            </>
                        ) : (
                            <>
                                <ArrowRight size={14} className="text-blue-400" />
                                <span>Aplicar ao Arquiteto</span>
                            </>
                        )}
                    </button>

                    <button
                        onClick={handleGenerateVisual}
                        className="w-full py-2.5 px-3 rounded-lg font-black text-xs bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 text-white shadow-lg shadow-violet-500/25 transition-all flex items-center justify-center gap-1.5 active:scale-95"
                    >
                        <Zap size={14} className="text-amber-300" />
                        <span>Gerar Imagem com Efeitos</span>
                    </button>
                </div>
            </div>
        </div>
    );
};
