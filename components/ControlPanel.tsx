
import React, { useState } from 'react';
import { PromptSettings, TargetPlatform, STYLE_TEMPLATES, DETAIL_LEVEL_MAP } from '../types';
import { 
    Settings, Zap, Cog, Type, 
    Mountain, Hexagon, Cpu, 
    Box, Smartphone, 
    Sun, Maximize, Aperture, Monitor, Instagram, Camera,
    Ban, Sparkles, Globe, Layout, Bot, Eye, Loader2,
    MoveDiagonal, ArrowDownCircle, Search, RotateCcw, ChevronUp,
    Palette, Slash, Moon, Wand2, Flashlight, Lightbulb, Brain, Layers as LayersIcon,
    Activity, AlignCenter, AlignLeft, AlignRight, Move, Layers as Layers3d, LayoutGrid,
    Wind, Layers, Boxes, Target, Image as ImageIcon, Flame, Compass, Scan
} from 'lucide-react';
import { Tooltip } from './Tooltip';
import { ULTRA_PREMIUM_16K_PROMPT } from '../utils/visualEffectsData';

interface ControlPanelProps {
    settings: PromptSettings;
    onSettingsChange: (settings: PromptSettings) => void;
    onGenerate: () => void;
    onAnalyzeGemini: () => void;
    onAnalyzeSearchGrounding?: () => void;
    onAnalyzeTF: () => void;
    onAnalyzeOpenAI: () => void;
    onAnalyzeDeepseek: () => void;
    onAnalyzeGoogleVision: () => void;
    onAnalyzeWhisk: () => void;
    onAnalyzeImageFX: () => void;
    onAnalyzeClaude: () => void;
    onAnalyzeMidjourney: () => void;
    onAnalyzeFlux: () => void;
    onAnalyzeIdeogram: () => void;
    onAnalyzeHuggingFace: () => void;
    onAnalyzeConsensus: () => void;
    onOpenSettings: () => void;
    isGeneratingGemini: boolean;
    isGeneratingSearchGrounding?: boolean;
    isGeneratingTF: boolean;
    isGeneratingOpenAI: boolean;
    isGeneratingDeepseek: boolean;
    isGeneratingGoogleVision: boolean;
    isGeneratingWhisk: boolean;
    isGeneratingImageFX: boolean;
    isGeneratingClaude: boolean;
    isGeneratingMidjourney: boolean;
    isGeneratingFlux: boolean;
    isGeneratingIdeogram: boolean;
    isGeneratingHuggingFace: boolean;
    isGeneratingConsensus: boolean;
    hasImage: boolean;
    onSwitchToEffects?: () => void;
    onOpenGemini3ProGenerator?: () => void;
    onOpenImageEditor?: () => void;
}

const LIGHTING_OPTIONS = [
    { id: 'none', label: 'Nenhum', icon: Slash },
    { id: 'auto', label: 'Automático', icon: Zap },
    { id: 'studio', label: 'Estúdio Profissional', icon: Aperture },
    { id: 'cinematic', label: 'Cinematográfico', icon: Camera },
    { id: 'golden_hour', label: 'Golden Hour (Quente)', icon: Sun },
    { id: 'volumetric', label: 'Luz Volumétrica', icon: Lightbulb },
    { id: 'rim_lighting', label: 'Rim Light (Contorno)', icon: Flashlight },
    { id: 'neon', label: 'Neon / Cyberpunk', icon: Cpu },
    { id: 'moody', label: 'Moody (Dramático)', icon: Hexagon },
    { id: 'natural', label: 'Luz Natural Dia', icon: Mountain },
];

const ASPECT_RATIOS = [
    { id: '1:1', label: 'Quadrado (Post)', icon: Instagram },
    { id: '4:5', label: 'Retrato (IG Feed)', icon: Layout },
    { id: '3:2', label: 'Clássico 35mm', icon: Camera },
    { id: '16:9', label: 'Widescreen (YouTube)', icon: Monitor },
    { id: '9:16', label: 'Vertical (Stories)', icon: Smartphone },
];

const CAMERA_ANGLES = [
    { id: 'eye_level', label: 'Nível do Olho (Frontal)', icon: Eye },
    { id: '45_deg', label: 'Ângulo de 45° (Perspectiva)', icon: MoveDiagonal },
    { id: 'zenith', label: 'Zenital (Top-Down)', icon: ArrowDownCircle },
    { id: 'flat_lay', label: 'Composição Flat Lay', icon: Layout },
    { id: 'none', label: 'Nenhum / Auto', icon: Slash },
    { id: 'macro_angle', label: 'Foco Macro (Detalhe)', icon: Search },
    { id: 'low_angle', label: 'Contra-Plongée (Hero)', icon: ChevronUp },
    { id: 'dutch', label: 'Holandês (Artístico)', icon: RotateCcw },
    { id: 'action', label: 'Câmera Dinâmica', icon: Activity },
];

const PRODUCT_POSITIONS = [
    { id: 'none', label: 'Livre / Aleatório', icon: Slash },
    { id: 'center', label: 'Centro Absoluto', icon: AlignCenter },
    { id: 'left', label: 'Alinhado à Esquerda', icon: AlignLeft },
    { id: 'right', label: 'Alinhado à Direita', icon: AlignRight },
    { id: 'thirds_left', label: 'Regra dos Terços (E)', icon: LayoutGrid },
    { id: 'thirds_right', label: 'Regra dos Terços (D)', icon: LayoutGrid },
    { id: 'foreground', label: 'Primeiro Plano', icon: Move },
];

const SHADOW_EFFECTS = [
    { id: 'contact', label: 'Sombra de Contato', icon: Box, prompt: 'subtle realistic contact shadow beneath the object base' },
    { id: 'cast', label: 'Sombra Projetada', icon: MoveDiagonal, prompt: 'elegant diffused cast shadow extending from the subject' },
];

export const ControlPanel: React.FC<ControlPanelProps> = ({ 
    settings, 
    onSettingsChange, 
    onGenerate,
    onAnalyzeGemini,
    onAnalyzeSearchGrounding,
    onAnalyzeTF,
    onAnalyzeOpenAI,
    onAnalyzeDeepseek,
    onAnalyzeGoogleVision,
    onAnalyzeWhisk,
    onAnalyzeImageFX,
    onAnalyzeClaude,
    onAnalyzeMidjourney,
    onAnalyzeFlux,
    onAnalyzeIdeogram,
    onAnalyzeHuggingFace,
    onAnalyzeConsensus,
    onOpenSettings,
    isGeneratingGemini,
    isGeneratingSearchGrounding = false,
    isGeneratingTF,
    isGeneratingOpenAI,
    isGeneratingDeepseek,
    isGeneratingGoogleVision,
    isGeneratingWhisk,
    isGeneratingImageFX,
    isGeneratingClaude,
    isGeneratingMidjourney,
    isGeneratingFlux,
    isGeneratingIdeogram,
    isGeneratingHuggingFace,
    isGeneratingConsensus,
    hasImage,
    onSwitchToEffects,
    onOpenGemini3ProGenerator,
    onOpenImageEditor
}) => {
    
    const handleChange = (key: keyof PromptSettings, value: any) => {
        onSettingsChange({ ...settings, [key]: value });
    };

    const handleQuickMode = (modeType: 'general' | 'mockup' | 'selo3d' | 'keepcolor' | 'extract_bg' | 'remove_branding') => {
        switch(modeType) {
            case 'general':
                onSettingsChange({ ...settings, mode: 'general', is3dLogo: false, keepColors: true, removeBranding: false, style: 'photorealistic' });
                break;
            case 'mockup':
                onSettingsChange({ ...settings, mode: 'mockup', is3dLogo: false, keepColors: false, removeBranding: false, style: 'blank' });
                break;
            case 'selo3d':
                onSettingsChange({ ...settings, mode: 'general', is3dLogo: true, keepColors: true, removeBranding: false, style: '3d_render' });
                break;
            case 'keepcolor':
                onSettingsChange({ ...settings, mode: 'mockup', is3dLogo: false, keepColors: true, removeBranding: false, style: 'blank' });
                break;
            case 'extract_bg':
                onSettingsChange({ ...settings, mode: 'extract_background', is3dLogo: false, keepColors: true, removeBranding: false, style: 'photorealistic' });
                break;
            case 'remove_branding':
                onSettingsChange({ ...settings, mode: 'remove_branding', is3dLogo: false, keepColors: true, removeBranding: true, style: 'photorealistic' });
                break;
        }
    };

    const appendToPrompt = (text: string) => {
        if (!text) return;
        const current = settings.basePrompt || '';
        if (current.toLowerCase().includes(text.toLowerCase())) return;

        const hasText = current.trim().length > 0;
        const separator = hasText ? (current.trim().endsWith(',') ? ' ' : ', ') : '';
        handleChange('basePrompt', current + separator + text);
    };

    const currentDetailValue = settings.detailLevel === 'auto' ? 5 : (settings.detailLevel as number);
    const detailInfo = DETAIL_LEVEL_MAP[currentDetailValue];

    // Determine current active visual mode
    const isExtractBgActive = settings.mode === 'extract_background';
    const isRemoveBrandingActive = settings.mode === 'remove_branding' || !!settings.removeBranding;
    const isMockupColor = settings.mode === 'mockup' && settings.keepColors && !isRemoveBrandingActive;
    const isMockupPlain = settings.mode === 'mockup' && !settings.keepColors && !isRemoveBrandingActive;
    const isSeloActive = settings.is3dLogo && settings.mode !== 'extract_background' && !isRemoveBrandingActive;
    const isGeneralActive = settings.mode === 'general' && !settings.is3dLogo && !isRemoveBrandingActive;

    return (
        <div className="bg-slate-800/90 rounded-xl p-3.5 sm:p-5 border border-slate-700 backdrop-blur-md h-full flex flex-col relative shadow-2xl">
            <button 
                onClick={onOpenSettings} 
                className="absolute top-3.5 right-3.5 sm:top-5 sm:right-5 text-slate-500 hover:text-blue-400 transition-colors p-1.5 rounded-lg hover:bg-slate-700/50"
                title="Configurações de API"
            >
                <Cog size={18} />
            </button>

            <div className="flex items-center justify-between mb-4 pr-8">
                <h2 className="text-base sm:text-lg font-bold text-blue-400 flex items-center gap-2">
                    <Settings size={18} />
                    <span>Arquiteto de Prompt</span>
                </h2>
                {onSwitchToEffects && (
                    <button
                        onClick={onSwitchToEffects}
                        className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-gradient-to-r from-violet-600/20 to-indigo-600/20 border border-violet-500/40 text-violet-300 hover:text-white hover:border-violet-400 transition-all text-xs font-bold"
                        title="Abrir Galeria de Efeitos (/tags)"
                    >
                        <Sparkles size={13} className="text-amber-300" />
                        <span className="hidden sm:inline">Ver Efeitos (/tags)</span>
                        <span className="sm:hidden">Efeitos</span>
                    </button>
                )}
            </div>

            <div className="space-y-5 flex-1 overflow-y-auto pr-2 custom-scrollbar">
                
                {/* Hub de Modos Unificado */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between text-slate-400 font-bold text-[9px] uppercase tracking-widest">
                        <div className="flex items-center gap-2">
                            <Target size={12} className="text-blue-400"/>
                            <span>Configuração de Saída</span>
                        </div>
                        {isExtractBgActive && (
                            <span className="text-emerald-400 text-[10px] font-mono lowercase tracking-normal flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                modo background
                            </span>
                        )}
                        {isRemoveBrandingActive && (
                            <span className="text-teal-400 text-[10px] font-mono lowercase tracking-normal flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
                                sem marca / rótulo
                            </span>
                        )}
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                        <button 
                            onClick={() => handleQuickMode('general')}
                            className={`flex flex-col items-center gap-1.5 py-2.5 rounded-xl border-2 transition-all group ${isGeneralActive ? 'bg-blue-600/20 border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.3)]' : 'bg-slate-900/50 border-slate-700 hover:border-slate-500'}`}
                        >
                            <ImageIcon size={18} className={isGeneralActive ? 'text-blue-400' : 'text-slate-500 group-hover:text-slate-300'} />
                            <span className={`text-[9px] font-black uppercase tracking-tight ${isGeneralActive ? 'text-white' : 'text-slate-500'}`}>Geral</span>
                        </button>
                        
                        <button 
                            onClick={() => handleQuickMode('mockup')}
                            className={`flex flex-col items-center gap-1.5 py-2.5 rounded-xl border-2 transition-all group ${isMockupPlain ? 'bg-slate-100/10 border-slate-300 shadow-[0_0_15px_rgba(255,255,255,0.1)]' : 'bg-slate-900/50 border-slate-700 hover:border-slate-500'}`}
                        >
                            <Box size={18} className={isMockupPlain ? 'text-white' : 'text-slate-500 group-hover:text-slate-300'} />
                            <span className={`text-[9px] font-black uppercase tracking-tight ${isMockupPlain ? 'text-white' : 'text-slate-500'}`}>Mockup Clay</span>
                        </button>

                        <button 
                            onClick={() => handleQuickMode('extract_bg')}
                            className={`flex flex-col items-center gap-1.5 py-2.5 rounded-xl border-2 transition-all group ${isExtractBgActive ? 'bg-emerald-600/25 border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.35)]' : 'bg-slate-900/50 border-slate-700 hover:border-slate-500'}`}
                            title="Isolar o background e extrair elementos da cena sem o sujeito"
                        >
                            <LayersIcon size={18} className={isExtractBgActive ? 'text-emerald-400' : 'text-slate-500 group-hover:text-emerald-300'} />
                            <span className={`text-[9px] font-black uppercase tracking-tight ${isExtractBgActive ? 'text-emerald-200' : 'text-slate-500'}`}>Extrair Fundo</span>
                        </button>
                    </div>

                    <div className="grid grid-cols-3 gap-2 mt-2">
                        <button 
                            onClick={() => handleQuickMode('selo3d')}
                            className={`flex flex-col items-center gap-1.5 py-2.5 rounded-xl border-2 transition-all group ${isSeloActive ? 'bg-amber-600/20 border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.3)]' : 'bg-slate-900/50 border-slate-700 hover:border-slate-500'}`}
                        >
                            <Boxes size={18} className={isSeloActive ? 'text-amber-400' : 'text-slate-500 group-hover:text-slate-300'} />
                            <span className={`text-[9px] font-black uppercase tracking-tight ${isSeloActive ? 'text-white' : 'text-slate-500'}`}>Selo 3D</span>
                        </button>

                        <button 
                            onClick={() => handleQuickMode('keepcolor')}
                            className={`flex flex-col items-center gap-1.5 py-2.5 rounded-xl border-2 transition-all group ${isMockupColor ? 'bg-pink-600/20 border-pink-500 shadow-[0_0_15px_rgba(236,72,153,0.3)]' : 'bg-slate-900/50 border-slate-700 hover:border-slate-500'}`}
                        >
                            <Palette size={18} className={isMockupColor ? 'text-pink-400' : 'text-slate-500 group-hover:text-slate-300'} />
                            <span className={`text-[9px] font-black uppercase tracking-tight ${isMockupColor ? 'text-white' : 'text-slate-500'}`}>Manter Cor</span>
                        </button>

                        <button 
                            onClick={() => handleQuickMode('remove_branding')}
                            className={`flex flex-col items-center gap-1.5 py-2.5 rounded-xl border-2 transition-all group ${isRemoveBrandingActive ? 'bg-teal-600/25 border-teal-400 shadow-[0_0_15px_rgba(20,184,166,0.35)]' : 'bg-slate-900/50 border-slate-700 hover:border-slate-500'}`}
                            title="Remover marca, rótulo e logos de bebidas ou produtos preservando 100% das cores e do líquido"
                        >
                            <Ban size={18} className={isRemoveBrandingActive ? 'text-teal-300' : 'text-slate-500 group-hover:text-teal-300'} />
                            <span className={`text-[9px] font-black uppercase tracking-tight text-center ${isRemoveBrandingActive ? 'text-teal-200' : 'text-slate-500'}`}>Sem Rótulo</span>
                        </button>
                    </div>

                    {isRemoveBrandingActive && (
                        <div className="p-3 rounded-xl bg-teal-950/40 border border-teal-500/40 text-[11px] text-teal-200 flex items-start gap-2.5 animate-in fade-in duration-200">
                            <Sparkles size={16} className="text-teal-400 shrink-0 mt-0.5" />
                            <div className="leading-relaxed">
                                <strong className="text-teal-300 font-bold block mb-0.5">Modo Sem Marca / Rótulo Ativo:</strong>
                                Remove automaticamente marcas, logotipos, rótulos impressos e textos da bebida ou embalagem. A silhueta, textura (vidro/lata), condensação e as <strong className="text-white underline decoration-teal-400">cores exatas do produto e do líquido</strong> são preservadas com máxima fidelidade.
                            </div>
                        </div>
                    )}

                    {isExtractBgActive && (
                        <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-[11px] text-emerald-200 flex items-start gap-2.5 animate-in fade-in duration-200">
                            <Sparkles size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                            <div className="leading-relaxed">
                                <strong className="text-emerald-300 font-bold block mb-0.5">Modo Extrair Background Ativo:</strong>
                                A IA selecionada identificará e isolará o cenário de fundo, detalhando todos os seus elementos (arquitetura, superfícies, móveis, iluminação e atmosfera) e removendo o sujeito em primeiro plano.
                            </div>
                        </div>
                    )}
                </div>

                {/* Reconhecimento IA - Suíte Expandida de Visão */}
                <div className="space-y-3 bg-slate-900/40 p-3 rounded-xl border border-slate-800/80">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-slate-300 font-bold text-[10px] uppercase tracking-widest">
                            <Sparkles size={13} className="text-violet-400"/>
                            <span>Visão de Inteligências</span>
                        </div>
                        <span className="text-[9px] font-bold text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded-full border border-slate-700">
                            10 Motores IA
                        </span>
                    </div>

                    {/* Consenso Multi-Visão Super Ensemble */}
                    <button
                        disabled={!hasImage || isGeneratingConsensus}
                        onClick={onAnalyzeConsensus}
                        className="w-full relative group overflow-hidden p-2.5 rounded-lg border border-violet-500/40 bg-gradient-to-r from-violet-950/60 via-purple-900/40 to-indigo-950/60 hover:border-violet-400 transition-all shadow-[0_0_15px_rgba(139,92,246,0.15)] disabled:opacity-50 text-left"
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="p-1 rounded bg-violet-500/20 text-violet-300">
                                    {isGeneratingConsensus ? <Loader2 size={15} className="animate-spin" /> : <Sparkles size={15} />}
                                </div>
                                <div>
                                    <div className="text-[10px] font-black text-violet-200 tracking-wide flex items-center gap-1.5">
                                        CONSENSO MULTI-VISÃO
                                        <span className="text-[8px] bg-violet-500/30 text-violet-200 px-1.5 py-0.2 rounded font-bold">SUPER ENSEMBLE</span>
                                    </div>
                                    <div className="text-[9px] text-violet-300/70 font-medium">
                                        Funde geometria espacial, física de luz, texturas e plataforma
                                    </div>
                                </div>
                            </div>
                            <Zap size={14} className="text-violet-400 group-hover:scale-110 transition-transform shrink-0" />
                        </div>
                    </button>

                    {/* Categoria 1: Modelos Foundation */}
                    <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-[8px] font-black text-slate-400 uppercase tracking-wider">
                            <span>Multimodais Foundation</span>
                            <button
                                type="button"
                                onClick={() => handleChange('enableSearchGrounding', !settings.enableSearchGrounding)}
                                className={`flex items-center gap-1 px-1.5 py-0.5 rounded border transition-all ${
                                    settings.enableSearchGrounding
                                        ? 'bg-blue-600/30 text-cyan-300 border-cyan-400 font-bold'
                                        : 'bg-slate-900 border-slate-700 text-slate-500 hover:text-slate-300'
                                }`}
                                title="Ativar Google Search Grounding em tempo real com gemini-3.5-flash"
                            >
                                <Globe size={9} className={settings.enableSearchGrounding ? 'text-cyan-400' : 'text-slate-500'} />
                                <span>Search Grounding: {settings.enableSearchGrounding ? 'ON' : 'OFF'}</span>
                            </button>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                            {[
                                { 
                                    id: 'gemini', 
                                    label: settings.enableSearchGrounding ? 'GEMINI SEARCH' : 'GEMINI 3.0', 
                                    sub: settings.enableSearchGrounding ? 'gemini-3.5-flash' : 'Google', 
                                    icon: settings.enableSearchGrounding ? Globe : Bot, 
                                    action: settings.enableSearchGrounding && onAnalyzeSearchGrounding ? onAnalyzeSearchGrounding : onAnalyzeGemini, 
                                    loading: isGeneratingGemini || Boolean(isGeneratingSearchGrounding), 
                                    color: settings.enableSearchGrounding ? 'text-cyan-300' : 'text-violet-300', 
                                    border: settings.enableSearchGrounding ? 'border-cyan-500/50 bg-cyan-950/20 hover:border-cyan-400' : 'hover:border-violet-500/50' 
                                },
                                { id: 'openai', label: 'GPT-4O', sub: 'OpenAI', icon: Globe, action: onAnalyzeOpenAI, loading: isGeneratingOpenAI, color: 'text-emerald-300', border: 'hover:border-emerald-500/50' },
                                { id: 'claude', label: 'CLAUDE 3.7', sub: 'Anthropic', icon: Compass, action: onAnalyzeClaude, loading: isGeneratingClaude, color: 'text-amber-300', border: 'hover:border-amber-500/50' },
                                { id: 'deepseek', label: 'DEEPSEEK', sub: 'R1/VL', icon: Brain, action: onAnalyzeDeepseek, loading: isGeneratingDeepseek, color: 'text-blue-300', border: 'hover:border-blue-500/50' }
                            ].map(ai => (
                                <button 
                                    key={ai.id}
                                    disabled={!hasImage || ai.loading}
                                    onClick={ai.action}
                                    className={`flex flex-col items-center justify-center p-2 sm:p-1.5 bg-slate-950/70 border border-slate-800 rounded-lg text-[9px] sm:text-[8px] font-black ${ai.color} ${ai.border} hover:bg-slate-800/80 transition-all disabled:opacity-40 min-h-[52px] sm:min-h-[50px] active:scale-95`}
                                >
                                    {ai.loading ? <Loader2 size={14} className="animate-spin mb-1" /> : <ai.icon size={14} className="mb-1" />}
                                    <span className="leading-tight">{ai.label}</span>
                                    <span className="text-[7px] text-slate-400 font-normal">{ai.sub}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Categoria 2: Motores de Imagem Especialistas */}
                    <div className="space-y-1.5">
                        <div className="text-[8px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1">
                            <span>Especialistas em Imagem & Render</span>
                        </div>
                        <div className="grid grid-cols-3 gap-1.5">
                            <button 
                                disabled={!hasImage || isGeneratingMidjourney}
                                onClick={onAnalyzeMidjourney}
                                className="flex flex-col items-center justify-center p-2 sm:p-1.5 bg-slate-950/70 border border-slate-800 hover:border-cyan-500/50 rounded-lg text-[8px] sm:text-[8px] font-black text-cyan-300 hover:bg-slate-800/80 transition-all disabled:opacity-40 min-h-[50px] sm:min-h-[48px] active:scale-95"
                            >
                                {isGeneratingMidjourney ? <Loader2 size={13} className="animate-spin mb-0.5" /> : <Camera size={13} className="mb-0.5 text-cyan-400" />}
                                <span className="leading-tight">MIDJOURNEY</span>
                                <span className="text-[7px] text-slate-400 font-normal">v6.1 /describe</span>
                            </button>

                            <button 
                                disabled={!hasImage || isGeneratingFlux}
                                onClick={onAnalyzeFlux}
                                className="flex flex-col items-center justify-center p-2 sm:p-1.5 bg-slate-950/70 border border-slate-800 hover:border-rose-500/50 rounded-lg text-[8px] sm:text-[8px] font-black text-rose-300 hover:bg-slate-800/80 transition-all disabled:opacity-40 min-h-[50px] sm:min-h-[48px] active:scale-95"
                            >
                                {isGeneratingFlux ? <Loader2 size={13} className="animate-spin mb-0.5" /> : <Flame size={13} className="mb-0.5 text-rose-400" />}
                                <span className="leading-tight">FLUX.1</span>
                                <span className="text-[7px] text-slate-400 font-normal">Realismo RAW</span>
                            </button>

                            <button 
                                disabled={!hasImage || isGeneratingIdeogram}
                                onClick={onAnalyzeIdeogram}
                                className="flex flex-col items-center justify-center p-2 sm:p-1.5 bg-slate-950/70 border border-slate-800 hover:border-fuchsia-500/50 rounded-lg text-[8px] sm:text-[8px] font-black text-fuchsia-300 hover:bg-slate-800/80 transition-all disabled:opacity-40 min-h-[50px] sm:min-h-[48px] active:scale-95"
                            >
                                {isGeneratingIdeogram ? <Loader2 size={13} className="animate-spin mb-0.5" /> : <Type size={13} className="mb-0.5 text-fuchsia-400" />}
                                <span className="leading-tight">IDEOGRAM 2.0</span>
                                <span className="text-[7px] text-slate-400 font-normal">Design & Fontes</span>
                            </button>
                        </div>
                    </div>

                    {/* Categoria 3: Visão Técnica & Open-Source */}
                    <div className="space-y-1.5">
                        <div className="text-[8px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1">
                            <span>Visão Técnica & Open-Source</span>
                        </div>
                        <div className="grid grid-cols-3 gap-1.5">
                            <button 
                                disabled={!hasImage || isGeneratingGoogleVision}
                                onClick={onAnalyzeGoogleVision}
                                className="flex flex-col items-center justify-center p-2 sm:p-1.5 bg-slate-950/70 border border-slate-800 hover:border-orange-500/50 rounded-lg text-[8px] sm:text-[8px] font-black text-orange-300 hover:bg-slate-800/80 transition-all disabled:opacity-40 min-h-[50px] sm:min-h-[48px] active:scale-95"
                            >
                                {isGeneratingGoogleVision ? <Loader2 size={13} className="animate-spin mb-0.5" /> : <Eye size={13} className="mb-0.5 text-orange-400" />}
                                <span className="leading-tight">GOOGLE VISION</span>
                                <span className="text-[7px] text-slate-400 font-normal">Features/Labels</span>
                            </button>

                            <button 
                                disabled={!hasImage || isGeneratingWhisk}
                                onClick={onAnalyzeWhisk}
                                className="flex flex-col items-center justify-center p-2 sm:p-1.5 bg-slate-950/70 border border-slate-800 hover:border-yellow-500/50 rounded-lg text-[8px] sm:text-[8px] font-black text-yellow-300 hover:bg-slate-800/80 transition-all disabled:opacity-40 min-h-[50px] sm:min-h-[48px] active:scale-95"
                            >
                                {isGeneratingWhisk ? <Loader2 size={13} className="animate-spin mb-0.5" /> : <Wand2 size={13} className="mb-0.5 text-yellow-400" />}
                                <span className="leading-tight">WHISK AI</span>
                                <span className="text-[7px] text-slate-400 font-normal">Estilo Artístico</span>
                            </button>

                            <button 
                                disabled={!hasImage || isGeneratingHuggingFace}
                                onClick={onAnalyzeHuggingFace}
                                className="flex flex-col items-center justify-center p-2 sm:p-1.5 bg-slate-950/70 border border-slate-800 hover:border-lime-500/50 rounded-lg text-[8px] sm:text-[8px] font-black text-lime-300 hover:bg-slate-800/80 transition-all disabled:opacity-40 min-h-[50px] sm:min-h-[48px] active:scale-95"
                            >
                                {isGeneratingHuggingFace ? <Loader2 size={13} className="animate-spin mb-0.5" /> : <Scan size={13} className="mb-0.5 text-lime-400" />}
                                <span className="leading-tight">HUGGING FACE</span>
                                <span className="text-[7px] text-slate-400 font-normal">BLIP-2 / Florence</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Slider Nível de Detalhe */}
                <div className="bg-slate-900/40 p-3 rounded-lg border border-slate-700/50 space-y-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-[9px] font-bold text-blue-400 uppercase tracking-widest">
                            <LayersIcon size={12} />
                            <span>Nível de Detalhe</span>
                        </div>
                        <span className="text-[10px] font-black text-blue-300 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20 uppercase">
                            {detailInfo.label} ({currentDetailValue})
                        </span>
                    </div>
                    <input 
                        type="range" min="1" max="10" step="1" 
                        value={currentDetailValue}
                        onChange={(e) => {
                            handleChange('detailLevel', parseInt(e.target.value));
                        }}
                        className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                    />
                </div>

                {/* Iluminação e Ângulos */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div className="space-y-2">
                         <div className="flex items-center gap-2 text-slate-400 font-bold text-[9px] uppercase tracking-widest">
                            <Sun size={12} className="text-orange-400"/>
                            <span>Luz</span>
                        </div>
                        <div className="grid grid-cols-5 gap-1.5">
                            {LIGHTING_OPTIONS.map(light => (
                                <Tooltip key={light.id} content={light.label} position="top">
                                    <button
                                        onClick={() => handleChange('lighting', light.id)}
                                        className={`p-2 sm:p-1.5 rounded-md border flex items-center justify-center transition-all min-h-[36px] ${settings.lighting === light.id ? 'bg-orange-600/20 border-orange-500 text-orange-400' : 'bg-slate-900/50 border-slate-700 text-slate-500'}`}
                                    >
                                        <light.icon size={13} />
                                    </button>
                                </Tooltip>
                            ))}
                        </div>
                    </div>
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-slate-400 font-bold text-[9px] uppercase tracking-widest">
                            <Camera size={12} className="text-violet-400"/>
                            <span>Ângulo Profissional</span>
                        </div>
                        <div className="grid grid-cols-5 gap-1.5">
                            {CAMERA_ANGLES.map(angle => (
                                <Tooltip key={angle.id} content={angle.label} position="top">
                                    <button
                                        onClick={() => handleChange('cameraAngle', angle.id)}
                                        className={`p-2 sm:p-1.5 rounded-md border flex items-center justify-center transition-all min-h-[36px] ${settings.cameraAngle === angle.id ? 'bg-violet-600/20 border-violet-500 text-violet-400' : 'bg-slate-900/50 border-slate-700 text-slate-500'}`}
                                    >
                                        <angle.icon size={13} />
                                    </button>
                                </Tooltip>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Posicionamento do Produto */}
                <div className="space-y-2">
                    <div className="flex items-center gap-2 text-slate-400 font-bold text-[9px] uppercase tracking-widest">
                        <Move size={12} className="text-blue-400"/>
                        <span>Posicionamento</span>
                    </div>
                    <div className="grid grid-cols-7 gap-1">
                        {PRODUCT_POSITIONS.map(pos => (
                            <Tooltip key={pos.id} content={pos.label} position="top">
                                <button
                                    onClick={() => handleChange('productPosition', pos.id)}
                                    className={`p-1.5 rounded-md border flex items-center justify-center transition-all ${settings.productPosition === pos.id ? 'bg-blue-600/20 border-blue-500 text-blue-400' : 'bg-slate-900/50 border-slate-700 text-slate-500'}`}
                                >
                                    <pos.icon size={12} />
                                </button>
                            </Tooltip>
                        ))}
                    </div>
                </div>

                {/* Shadow Effects Section */}
                <div className="bg-slate-900/40 p-3 rounded-lg border border-slate-700/50 space-y-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-[9px] font-bold text-emerald-400 uppercase tracking-widest">
                            <Moon size={12} />
                            <span>Sombras & Profundidade</span>
                        </div>
                        <span className="text-[10px] font-black text-emerald-300">{settings.shadowOpacity}%</span>
                    </div>
                    <input 
                        type="range" min="0" max="100" step="5" 
                        value={settings.shadowOpacity}
                        onChange={(e) => handleChange('shadowOpacity', parseInt(e.target.value))}
                        className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                    />
                    <div className="flex gap-2">
                        {SHADOW_EFFECTS.map((eff) => (
                            <Tooltip key={eff.id} content={eff.label} position="top" className="flex-1">
                                <button
                                    onClick={() => appendToPrompt(eff.prompt)}
                                    className="w-full py-1.5 bg-slate-900 border border-slate-700 rounded-md text-[8px] font-black text-slate-400 hover:text-emerald-400 hover:border-emerald-500 transition-all flex items-center justify-center gap-1 uppercase"
                                >
                                    <eff.icon size={10} /> {eff.label.split(' ')[1]}
                                </button>
                            </Tooltip>
                        ))}
                    </div>
                </div>

                {/* Estilos Artísticos */}
                <div className="space-y-2">
                    <div className="flex items-center gap-2 text-slate-400 font-bold text-[9px] uppercase tracking-widest">
                        <Palette size={12} className="text-pink-400"/>
                        <span>Estilos</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                        {Object.entries(STYLE_TEMPLATES).slice(0, 28).map(([id, _]) => (
                            <button
                                key={id}
                                onClick={() => handleChange('style', id)}
                                className={`px-2 py-1 rounded text-[8px] font-black uppercase border transition-all ${settings.style === id ? 'bg-pink-600/20 border-pink-500 text-pink-400' : 'bg-slate-900/50 border-slate-700 text-slate-500 hover:text-slate-300'}`}
                            >
                                {id.replace('_', ' ')}
                            </button>
                        ))}
                    </div>
                </div>

                {/* AR e Plataforma */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div className="space-y-2">
                        <label className="text-[9px] font-bold text-slate-500 uppercase flex items-center gap-1">
                            <Maximize size={10} /> Proporção
                        </label>
                        <div className="grid grid-cols-5 gap-1.5">
                            {ASPECT_RATIOS.map(ratio => (
                                <Tooltip key={ratio.id} content={ratio.label} position="top">
                                    <button
                                        onClick={() => handleChange('aspectRatio', ratio.id)}
                                        className={`p-2 sm:p-1.5 rounded-md border flex items-center justify-center transition-all min-h-[36px] ${settings.aspectRatio === ratio.id ? 'bg-blue-600/20 border-blue-500 text-blue-400' : 'bg-slate-900/50 border-slate-700 text-slate-500'}`}
                                    >
                                        <ratio.icon size={13} />
                                    </button>
                                </Tooltip>
                            ))}
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[9px] font-bold text-slate-500 uppercase flex items-center gap-1">
                            <Monitor size={10} /> Plataforma AI
                        </label>
                        <select 
                            value={settings.targetPlatform} 
                            onChange={(e) => handleChange('targetPlatform', e.target.value as TargetPlatform)}
                            className="w-full bg-slate-900 border border-slate-700 rounded-md px-2 py-1.5 text-xs text-slate-300 font-bold outline-none h-9 focus:border-blue-500 transition-all cursor-pointer"
                        >
                            <option value="midjourney">Midjourney (v6.1)</option>
                            <option value="flux">Flux.1 Pro</option>
                            <option value="leonardo">Leonardo.ai</option>
                            <option value="adobe_firefly">Adobe Firefly</option>
                            <option value="google_imagefx">Google ImageFX</option>
                            <option value="dalle">DALL-E 3</option>
                            <option value="stable_diffusion">Stable Diffusion XL</option>
                            <option value="freepik">Freepik Premium</option>
                            <option value="chatgpt">ChatGPT Visual</option>
                        </select>
                    </div>
                </div>

                 {/* Prompts e Textareas */}
                 <div className="space-y-3">
                    <div className="space-y-1">
                        <label className="text-[9px] font-bold text-slate-500 uppercase flex items-center gap-1">
                            <Type size={10} className="text-blue-400" /> Prompt Geral
                        </label>
                        <textarea
                            value={settings.basePrompt}
                            onChange={(e) => handleChange('basePrompt', e.target.value)}
                            placeholder="Descreva o que deseja ver..."
                            className="w-full bg-slate-950 border border-slate-700 rounded-md px-2 py-1.5 text-[11px] text-slate-200 outline-none h-14 focus:border-blue-500 transition-colors custom-scrollbar"
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-[9px] font-bold text-slate-500 uppercase flex items-center gap-1">
                            <Ban size={10} className="text-red-400" /> Prompt Negativo
                        </label>
                        <textarea
                            value={settings.negativePrompt}
                            onChange={(e) => handleChange('negativePrompt', e.target.value)}
                            placeholder="Ex: text, watermarks, blurry..."
                            className="w-full bg-slate-950 border border-slate-700 rounded-md px-2 py-1.5 text-[11px] text-red-200/60 outline-none h-12 focus:border-red-500 transition-colors custom-scrollbar"
                        />
                    </div>
                </div>
            </div>

            <div className="pt-4 mt-auto space-y-2">
                <button
                    onClick={() => {
                        const current = settings.basePrompt || '';
                        if (current.includes('Ultra-Premium 16K Professional Remaster')) {
                            const cleaned = current
                                .replace(ULTRA_PREMIUM_16K_PROMPT, '')
                                .replace(/Ultra-Premium 16K Professional Remaster & Enhancement[\s\S]*?production-ready 16K master\./gi, '')
                                .trim();
                            handleChange('basePrompt', cleaned);
                        } else if (!current.trim()) {
                            handleChange('basePrompt', ULTRA_PREMIUM_16K_PROMPT);
                        } else {
                            handleChange('basePrompt', current.trim() + '\n\n' + ULTRA_PREMIUM_16K_PROMPT);
                        }
                    }}
                    className={`w-full py-2.5 px-3 rounded-lg font-bold text-xs transition-all flex items-center justify-center gap-2 border shadow-md ${
                        settings.basePrompt?.includes('Ultra-Premium 16K Professional Remaster')
                            ? 'bg-amber-500 text-slate-950 border-amber-400 font-extrabold shadow-amber-500/20'
                            : 'bg-gradient-to-r from-amber-500/10 via-yellow-500/10 to-stone-900 border-amber-500/40 text-amber-300 hover:text-white hover:bg-amber-500/20'
                    }`}
                    title="Ultra-Premium 16K Professional Remaster & Enhancement"
                >
                    <Sparkles size={14} className={settings.basePrompt?.includes('Ultra-Premium 16K Professional Remaster') ? 'text-slate-950 animate-pulse' : 'text-amber-400'} />
                    <span>
                        {settings.basePrompt?.includes('Ultra-Premium 16K Professional Remaster')
                            ? '✓ 16K Remaster Ativo'
                            : 'Ultra-Premium 16K Remaster'}
                    </span>
                </button>

                <button 
                    onClick={onGenerate} 
                    className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-lg font-black text-xs shadow-xl transition-all flex items-center justify-center gap-2 active:scale-95 uppercase tracking-widest"
                >
                    <Zap size={16} /> Compilar Prompt Profissional
                </button>

                {onOpenGemini3ProGenerator && (
                    <button
                        type="button"
                        onClick={onOpenGemini3ProGenerator}
                        className="w-full py-2.5 px-3 rounded-lg font-black text-xs bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-yellow-300 text-slate-950 transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 active:scale-95 cursor-pointer"
                        title="Abrir Gerador de Imagem Gemini 3 Pro 4K"
                    >
                        <Sparkles size={15} className="text-slate-950" />
                        <span>Gerador Gemini 3 Pro 4K</span>
                    </button>
                )}

                {onOpenImageEditor && hasImage && (
                    <button
                        type="button"
                        onClick={onOpenImageEditor}
                        className="w-full py-2.5 px-3 rounded-lg font-bold text-xs bg-gradient-to-r from-blue-700 via-indigo-600 to-violet-700 hover:from-blue-600 hover:to-violet-600 text-white transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 active:scale-95 cursor-pointer border border-blue-400/30"
                        title="Editar imagem atual com IA (gemini-3.1-flash-image-preview)"
                    >
                        <Wand2 size={15} className="text-cyan-300" />
                        <span>Editar Imagem c/ IA (Preview)</span>
                    </button>
                )}
            </div>
        </div>
    );
};
