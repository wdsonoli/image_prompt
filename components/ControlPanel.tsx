
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
    Wind, Layers, Boxes, Target, Image as ImageIcon, Flame, Compass, Scan, PenTool, Award, Package,
    Film, Crown, Laptop, Building2, Feather, Orbit, Shapes, Gem, Wand, UserCheck, User
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
    onAnalyzeBehance?: () => void;
    onAnalyzeArtStation?: () => void;
    onAnalyzeProductDesign?: () => void;
    onAnalyzeAwwwards?: () => void;
    onAnalyzeCinema?: () => void;
    onAnalyzeVogue?: () => void;
    onAnalyzeNatGeo?: () => void;
    onAnalyzeOctane?: () => void;
    onAnalyzeUnreal?: () => void;
    onAnalyzeLeonardo?: () => void;
    onAnalyzeSD?: () => void;
    onAnalyzeRedshift?: () => void;
    onAnalyzeVRay?: () => void;
    onAnalyzeCorona?: () => void;
    onAnalyzeCycles?: () => void;
    onAnalyzeRecraft?: () => void;
    onAnalyzeMagnific?: () => void;
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
    isGeneratingBehance?: boolean;
    isGeneratingArtStation?: boolean;
    isGeneratingProductDesign?: boolean;
    isGeneratingAwwwards?: boolean;
    isGeneratingCinema?: boolean;
    isGeneratingVogue?: boolean;
    isGeneratingNatGeo?: boolean;
    isGeneratingOctane?: boolean;
    isGeneratingUnreal?: boolean;
    isGeneratingLeonardo?: boolean;
    isGeneratingSD?: boolean;
    isGeneratingRedshift?: boolean;
    isGeneratingVRay?: boolean;
    isGeneratingCorona?: boolean;
    isGeneratingCycles?: boolean;
    isGeneratingRecraft?: boolean;
    isGeneratingMagnific?: boolean;
    hasImage: boolean;
    onSwitchToEffects?: () => void;
    onSwitchToModelSheet?: () => void;
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
    onAnalyzeBehance,
    onAnalyzeArtStation,
    onAnalyzeProductDesign,
    onAnalyzeAwwwards,
    onAnalyzeCinema,
    onAnalyzeVogue,
    onAnalyzeNatGeo,
    onAnalyzeOctane,
    onAnalyzeUnreal,
    onAnalyzeLeonardo,
    onAnalyzeSD,
    onAnalyzeRedshift,
    onAnalyzeVRay,
    onAnalyzeCorona,
    onAnalyzeCycles,
    onAnalyzeRecraft,
    onAnalyzeMagnific,
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
    isGeneratingBehance = false,
    isGeneratingArtStation = false,
    isGeneratingProductDesign = false,
    isGeneratingAwwwards = false,
    isGeneratingCinema = false,
    isGeneratingVogue = false,
    isGeneratingNatGeo = false,
    isGeneratingOctane = false,
    isGeneratingUnreal = false,
    isGeneratingLeonardo = false,
    isGeneratingSD = false,
    isGeneratingRedshift = false,
    isGeneratingVRay = false,
    isGeneratingCorona = false,
    isGeneratingCycles = false,
    isGeneratingRecraft = false,
    isGeneratingMagnific = false,
    hasImage,
    onSwitchToEffects,
    onSwitchToModelSheet,
    onOpenGemini3ProGenerator,
    onOpenImageEditor
}) => {
    
    const handleChange = (key: keyof PromptSettings, value: any) => {
        onSettingsChange({ ...settings, [key]: value });
    };

    const handleQuickMode = (modeType: 'general' | 'mockup' | 'selo3d' | 'keepcolor' | 'extract_bg' | 'extract_element' | 'extract_person' | 'remove_branding') => {
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
            case 'extract_element':
                onSettingsChange({ ...settings, mode: 'extract_element', is3dLogo: false, keepColors: true, removeBranding: false, style: 'photorealistic' });
                break;
            case 'extract_person':
                onSettingsChange({ ...settings, mode: 'extract_person', is3dLogo: false, keepColors: true, removeBranding: false, style: 'photorealistic' });
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
    const isExtractPersonActive = settings.mode === 'extract_person';
    const isExtractElementActive = settings.mode === 'extract_element';
    const isExtractBgActive = settings.mode === 'extract_background';
    const isRemoveBrandingActive = settings.mode === 'remove_branding' || !!settings.removeBranding;
    const isMockupColor = settings.mode === 'mockup' && settings.keepColors && !isRemoveBrandingActive && !isExtractElementActive && !isExtractPersonActive;
    const isMockupPlain = settings.mode === 'mockup' && !settings.keepColors && !isRemoveBrandingActive && !isExtractElementActive && !isExtractPersonActive;
    const isSeloActive = settings.is3dLogo && settings.mode !== 'extract_background' && settings.mode !== 'extract_element' && settings.mode !== 'extract_person' && !isRemoveBrandingActive;
    const isGeneralActive = settings.mode === 'general' && !settings.is3dLogo && !isRemoveBrandingActive && !isExtractElementActive && !isExtractPersonActive;

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
                <div className="flex items-center gap-1.5 flex-wrap">
                    {onSwitchToModelSheet && (
                        <button
                            type="button"
                            onClick={onSwitchToModelSheet}
                            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-gradient-to-r from-red-600/20 to-amber-600/20 border border-red-500/40 text-red-300 hover:text-white hover:border-red-400 transition-all text-xs font-bold"
                            title="Abrir Estúdio de Ficha de Personagem & Consistência (Model Sheet)"
                        >
                            <Layers size={13} className="text-red-400" />
                            <span className="hidden sm:inline">Ficha de Modelo</span>
                            <span className="sm:hidden">Ficha</span>
                            <span className="text-[9px] px-1 py-0.2 rounded bg-red-500/20 text-red-200 font-mono">NOVO</span>
                        </button>
                    )}
                    {onSwitchToEffects && (
                        <button
                            type="button"
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
            </div>

            <div className="space-y-5 flex-1 overflow-y-auto pr-2 custom-scrollbar">
                
                {/* Banner do Novo Modo: Ficha de Modelo (Model Sheet) */}
                {onSwitchToModelSheet && (
                    <div className="p-3 rounded-xl bg-gradient-to-r from-red-950/60 via-slate-900 to-amber-950/40 border border-red-500/40 flex items-center justify-between gap-3 shadow-lg">
                        <div className="flex items-center gap-2.5">
                            <div className="p-2 rounded-lg bg-red-600/20 text-red-400 border border-red-500/30 shrink-0">
                                <Layers size={17} />
                            </div>
                            <div className="min-w-0">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                    <span className="text-xs font-black text-white">Novo Modo: Ficha de Modelo</span>
                                    <span className="px-1.5 py-0.2 rounded-full bg-red-500/20 text-red-300 text-[8px] font-black uppercase border border-red-500/30">
                                        Customização Total
                                    </span>
                                </div>
                                <p className="text-[10px] text-slate-400 leading-tight mt-0.5">
                                    Altere tudo antes de gerar: homem/mulher, 4 vistas, 8 expressões, 6 poses, figurino e cores Hex
                                </p>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={onSwitchToModelSheet}
                            className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-bold text-xs shrink-0 shadow-md transition-all active:scale-95"
                        >
                            Abrir Modo
                        </button>
                    </div>
                )}

                {/* Hub de Modos Unificado */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between text-slate-400 font-bold text-[9px] uppercase tracking-widest">
                        <div className="flex items-center gap-2">
                            <Target size={12} className="text-blue-400"/>
                            <span>Configuração de Saída</span>
                        </div>
                        {isExtractPersonActive && (
                            <span className="text-fuchsia-400 text-[10px] font-mono lowercase tracking-normal flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-fuchsia-400 animate-pulse" />
                                extrair pessoa (clone)
                            </span>
                        )}
                        {isExtractElementActive && (
                            <span className="text-violet-400 text-[10px] font-mono lowercase tracking-normal flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
                                extrair elemento
                            </span>
                        )}
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
                            onClick={() => handleQuickMode('selo3d')}
                            className={`flex flex-col items-center gap-1.5 py-2.5 rounded-xl border-2 transition-all group ${isSeloActive ? 'bg-amber-600/20 border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.3)]' : 'bg-slate-900/50 border-slate-700 hover:border-slate-500'}`}
                        >
                            <Boxes size={18} className={isSeloActive ? 'text-amber-400' : 'text-slate-500 group-hover:text-slate-300'} />
                            <span className={`text-[9px] font-black uppercase tracking-tight ${isSeloActive ? 'text-white' : 'text-slate-500'}`}>Selo 3D</span>
                        </button>
                    </div>

                    <div className="grid grid-cols-2 gap-2 mt-2">
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

                    {/* Suite de Extração Avançada: Pessoa vs Elemento vs Fundo */}
                    <div className="grid grid-cols-3 gap-2 mt-2 pt-1 border-t border-slate-800">
                        <button 
                            onClick={() => handleQuickMode('extract_person')}
                            className={`flex flex-col items-center gap-1.5 py-2.5 rounded-xl border-2 transition-all group ${isExtractPersonActive ? 'bg-fuchsia-600/25 border-fuchsia-500 shadow-[0_0_15px_rgba(217,70,239,0.35)]' : 'bg-slate-900/50 border-slate-700 hover:border-slate-500'}`}
                            title="Extrair pessoa com as exatas características da referência: biometria facial, cabelo, roupa, pose e iluminação"
                        >
                            <UserCheck size={18} className={isExtractPersonActive ? 'text-fuchsia-400' : 'text-slate-500 group-hover:text-fuchsia-300'} />
                            <span className={`text-[9px] font-black uppercase tracking-tight text-center ${isExtractPersonActive ? 'text-fuchsia-200' : 'text-slate-500'}`}>Extrai Pessoa</span>
                        </button>

                        <button 
                            onClick={() => handleQuickMode('extract_element')}
                            className={`flex flex-col items-center gap-1.5 py-2.5 rounded-xl border-2 transition-all group ${isExtractElementActive ? 'bg-violet-600/25 border-violet-500 shadow-[0_0_15px_rgba(139,92,246,0.35)]' : 'bg-slate-900/50 border-slate-700 hover:border-slate-500'}`}
                            title="Isolar elementos e sujeitos individuais da imagem ignorando o fundo"
                        >
                            <Scan size={18} className={isExtractElementActive ? 'text-violet-400' : 'text-slate-500 group-hover:text-violet-300'} />
                            <span className={`text-[9px] font-black uppercase tracking-tight text-center ${isExtractElementActive ? 'text-violet-200' : 'text-slate-500'}`}>Extrair Elemento</span>
                        </button>

                        <button 
                            onClick={() => handleQuickMode('extract_bg')}
                            className={`flex flex-col items-center gap-1.5 py-2.5 rounded-xl border-2 transition-all group ${isExtractBgActive ? 'bg-emerald-600/25 border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.35)]' : 'bg-slate-900/50 border-slate-700 hover:border-slate-500'}`}
                            title="Isolar o background e extrair elementos da cena sem o sujeito"
                        >
                            <LayersIcon size={18} className={isExtractBgActive ? 'text-emerald-400' : 'text-slate-500 group-hover:text-emerald-300'} />
                            <span className={`text-[9px] font-black uppercase tracking-tight text-center ${isExtractBgActive ? 'text-emerald-200' : 'text-slate-500'}`}>Extrair Fundo</span>
                        </button>
                    </div>

                    {isExtractPersonActive && (
                        <div className="p-3 rounded-xl bg-fuchsia-950/40 border border-fuchsia-500/40 text-[11px] text-fuchsia-200 flex items-start gap-2.5 animate-in fade-in duration-200">
                            <Sparkles size={16} className="text-fuchsia-400 shrink-0 mt-0.5" />
                            <div className="leading-relaxed">
                                <strong className="text-fuchsia-300 font-bold block mb-0.5">Modo Extrai Pessoa Ativo (Clone Fiel de Características):</strong>
                                Extrai e replica com máxima fidelidade os traços da pessoa na imagem de referência: biometria facial completa (olhos, formato do nariz, lábios, queixo, formato do rosto), corte e textura do cabelo, vestuário, caimento, pose corporal, olhar e iluminação fotográfica idênticos.
                            </div>
                        </div>
                    )}

                    {isExtractElementActive && (
                        <div className="p-3 rounded-xl bg-violet-950/40 border border-violet-500/40 text-[11px] text-violet-200 flex items-start gap-2.5 animate-in fade-in duration-200">
                            <Sparkles size={16} className="text-violet-400 shrink-0 mt-0.5" />
                            <div className="leading-relaxed">
                                <strong className="text-violet-300 font-bold block mb-0.5">Modo Extrair Elemento Ativo:</strong>
                                A IA isolará o elemento/sujeito em primeiro plano (produtos, objetos, modelos), catalogando materiais, cores, silhuetas e componentes individuais, excluindo o fundo e gerando prompts de alta fidelidade para estúdio e composição.
                            </div>
                        </div>
                    )}

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

                {/* Seletor Rápido de Gênero do Personagem (Homem / Mulher) */}
                <div className="space-y-1.5 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
                    <div className="flex items-center justify-between">
                        <label className="text-[9px] font-black uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
                            <User size={12} className="text-red-400" />
                            <span>Gênero do Personagem (Homem / Mulher)</span>
                        </label>
                        <span className="text-[9px] font-mono text-amber-300 font-bold">
                            {settings.characterGender === 'man' ? '👨 Homem Ativo' : settings.characterGender === 'woman' ? '👩 Mulher Ativa' : '✦ Automático'}
                        </span>
                    </div>
                    <div className="grid grid-cols-3 gap-1.5">
                        <button
                            type="button"
                            onClick={() => onSettingsChange({ ...settings, characterGender: 'auto' })}
                            className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-all border ${
                                !settings.characterGender || settings.characterGender === 'auto'
                                    ? 'bg-blue-600/30 border-blue-500 text-white shadow-sm'
                                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
                            }`}
                        >
                            ✦ Auto / Imagem
                        </button>
                        <button
                            type="button"
                            onClick={() => onSettingsChange({ ...settings, characterGender: 'woman' })}
                            className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-all border flex items-center justify-center gap-1 ${
                                settings.characterGender === 'woman'
                                    ? 'bg-pink-600/30 border-pink-500 text-pink-200 shadow-sm'
                                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-pink-300'
                            }`}
                        >
                            <span>👩</span>
                            <span>Mulher</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => onSettingsChange({ ...settings, characterGender: 'man' })}
                            className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-all border flex items-center justify-center gap-1 ${
                                settings.characterGender === 'man'
                                    ? 'bg-blue-600/30 border-blue-500 text-blue-200 shadow-sm'
                                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-blue-300'
                            }`}
                        >
                            <span>👨</span>
                            <span>Homem</span>
                        </button>
                    </div>
                </div>

                {/* Reconhecimento IA - Suíte Expandida de Visão */}
                <div className="space-y-3 bg-slate-900/40 p-3 rounded-xl border border-slate-800/80">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-slate-300 font-bold text-[10px] uppercase tracking-widest">
                            <Sparkles size={13} className="text-violet-400"/>
                            <span>Visão de Inteligências</span>
                        </div>
                        <span className="text-[9px] font-bold text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded-full border border-slate-700">
                            28 Motores IA de Elite
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

                    {/* Suíte 1: Top Designers & Direção de Arte */}
                    <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-[8px] font-black text-slate-400 uppercase tracking-wider">
                            <span className="flex items-center gap-1 text-pink-400">
                                <Award size={11} className="text-pink-400" />
                                Top Designers & Direção de Arte
                            </span>
                            <span className="text-[7.5px] bg-pink-500/20 text-pink-300 px-1.5 py-0.2 rounded font-bold border border-pink-500/30">ELITE DESIGN</span>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                            <button
                                disabled={!hasImage || isGeneratingBehance}
                                onClick={onAnalyzeBehance}
                                className="flex flex-col items-center justify-center p-2 sm:p-1.5 bg-slate-950/70 border border-slate-800 hover:border-pink-500/50 rounded-lg text-[8px] sm:text-[8px] font-black text-pink-300 hover:bg-slate-800/80 transition-all disabled:opacity-40 min-h-[52px] sm:min-h-[50px] active:scale-95 text-center"
                                title="Visão de Designer Gráfico & Branding de Elite (Behance / Dribbble Top Shot)"
                            >
                                {isGeneratingBehance ? <Loader2 size={13} className="animate-spin mb-0.5" /> : <PenTool size={13} className="mb-0.5 text-pink-400" />}
                                <span className="leading-tight">BEHANCE / DRIBBBLE</span>
                                <span className="text-[7px] text-slate-400 font-normal">Brand & Layout</span>
                            </button>

                            <button
                                disabled={!hasImage || isGeneratingArtStation}
                                onClick={onAnalyzeArtStation}
                                className="flex flex-col items-center justify-center p-2 sm:p-1.5 bg-slate-950/70 border border-slate-800 hover:border-indigo-500/50 rounded-lg text-[8px] sm:text-[8px] font-black text-indigo-300 hover:bg-slate-800/80 transition-all disabled:opacity-40 min-h-[52px] sm:min-h-[50px] active:scale-95 text-center"
                                title="Visão de Art Director 3D & Concept Artist (ArtStation Trending #1)"
                            >
                                {isGeneratingArtStation ? <Loader2 size={13} className="animate-spin mb-0.5" /> : <Layers3d size={13} className="mb-0.5 text-indigo-400" />}
                                <span className="leading-tight">ARTSTATION 3D</span>
                                <span className="text-[7px] text-slate-400 font-normal">Concept & CGI</span>
                            </button>

                            <button
                                disabled={!hasImage || isGeneratingProductDesign}
                                onClick={onAnalyzeProductDesign}
                                className="flex flex-col items-center justify-center p-2 sm:p-1.5 bg-slate-950/70 border border-slate-800 hover:border-emerald-500/50 rounded-lg text-[8px] sm:text-[8px] font-black text-emerald-300 hover:bg-slate-800/80 transition-all disabled:opacity-40 min-h-[52px] sm:min-h-[50px] active:scale-95 text-center"
                                title="Visão de Design Industrial & Embalagens CMF (Dieter Rams / Apple Studio)"
                            >
                                {isGeneratingProductDesign ? <Loader2 size={13} className="animate-spin mb-0.5" /> : <Package size={13} className="mb-0.5 text-emerald-400" />}
                                <span className="leading-tight">DESIGN PRODUTO</span>
                                <span className="text-[7px] text-slate-400 font-normal">CMF & Packaging</span>
                            </button>

                            <button
                                disabled={!hasImage || isGeneratingAwwwards}
                                onClick={onAnalyzeAwwwards}
                                className="flex flex-col items-center justify-center p-2 sm:p-1.5 bg-slate-950/70 border border-slate-800 hover:border-cyan-500/50 rounded-lg text-[8px] sm:text-[8px] font-black text-cyan-300 hover:bg-slate-800/80 transition-all disabled:opacity-40 min-h-[52px] sm:min-h-[50px] active:scale-95 text-center"
                                title="Visão de Digital Product & UI/UX Designer (Awwwards Site of the Year / Bento Grids)"
                            >
                                {isGeneratingAwwwards ? <Loader2 size={13} className="animate-spin mb-0.5" /> : <Laptop size={13} className="mb-0.5 text-cyan-400" />}
                                <span className="leading-tight">AWWWARDS UI/UX</span>
                                <span className="text-[7px] text-slate-400 font-normal">Bento & Digital</span>
                            </button>
                        </div>
                    </div>

                    {/* Suíte 2: Mestres do Cinema & Fotografia de Elite */}
                    <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-[8px] font-black text-slate-400 uppercase tracking-wider">
                            <span className="flex items-center gap-1 text-amber-400">
                                <Film size={11} className="text-amber-400" />
                                Mestres do Cinema & Fotografia de Elite
                            </span>
                            <span className="text-[7.5px] bg-amber-500/20 text-amber-300 px-1.5 py-0.2 rounded font-bold border border-amber-500/30">CINEMA & LUXO</span>
                        </div>
                        <div className="grid grid-cols-3 gap-1.5">
                            <button
                                disabled={!hasImage || isGeneratingCinema}
                                onClick={onAnalyzeCinema}
                                className="flex flex-col items-center justify-center p-2 sm:p-1.5 bg-slate-950/70 border border-slate-800 hover:border-amber-500/50 rounded-lg text-[8px] sm:text-[8px] font-black text-amber-300 hover:bg-slate-800/80 transition-all disabled:opacity-40 min-h-[52px] sm:min-h-[50px] active:scale-95 text-center"
                                title="Visão de Diretor de Fotografia de Hollywood (ARRI / IMAX 70mm / Roger Deakins)"
                            >
                                {isGeneratingCinema ? <Loader2 size={13} className="animate-spin mb-0.5" /> : <Film size={13} className="mb-0.5 text-amber-400" />}
                                <span className="leading-tight">HOLLYWOOD CINEMA</span>
                                <span className="text-[7px] text-slate-400 font-normal">ARRI / 70mm IMAX</span>
                            </button>

                            <button
                                disabled={!hasImage || isGeneratingVogue}
                                onClick={onAnalyzeVogue}
                                className="flex flex-col items-center justify-center p-2 sm:p-1.5 bg-slate-950/70 border border-slate-800 hover:border-fuchsia-500/50 rounded-lg text-[8px] sm:text-[8px] font-black text-fuchsia-300 hover:bg-slate-800/80 transition-all disabled:opacity-40 min-h-[52px] sm:min-h-[50px] active:scale-95 text-center"
                                title="Visão de Direção de Moda & Estilo Vogue (Alta Costura & Iluminação de Luxo)"
                            >
                                {isGeneratingVogue ? <Loader2 size={13} className="animate-spin mb-0.5" /> : <Crown size={13} className="mb-0.5 text-fuchsia-400" />}
                                <span className="leading-tight">VOGUE EDITORIAL</span>
                                <span className="text-[7px] text-slate-400 font-normal">Moda & Alta Costura</span>
                            </button>

                            <button
                                disabled={!hasImage || isGeneratingNatGeo}
                                onClick={onAnalyzeNatGeo}
                                className="flex flex-col items-center justify-center p-2 sm:p-1.5 bg-slate-950/70 border border-slate-800 hover:border-emerald-500/50 rounded-lg text-[8px] sm:text-[8px] font-black text-emerald-300 hover:bg-slate-800/80 transition-all disabled:opacity-40 min-h-[52px] sm:min-h-[50px] active:scale-95 text-center"
                                title="Visão de Fotógrafo Fellow National Geographic (Hasselblad H6D 100MP RAW)"
                            >
                                {isGeneratingNatGeo ? <Loader2 size={13} className="animate-spin mb-0.5" /> : <Camera size={13} className="mb-0.5 text-emerald-400" />}
                                <span className="leading-tight">NATGEO RAW</span>
                                <span className="text-[7px] text-slate-400 font-normal">Hasselblad 100MP</span>
                            </button>
                        </div>
                    </div>

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
                                title="Ativar Google Search Grounding em tempo real com gemini-3.8-flash"
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
                                    sub: settings.enableSearchGrounding ? 'gemini-3.8-flash' : 'Google', 
                                    icon: settings.enableSearchGrounding ? Globe : Bot, 
                                    action: settings.enableSearchGrounding && onAnalyzeSearchGrounding ? onAnalyzeSearchGrounding : onAnalyzeGemini, 
                                    loading: isGeneratingGemini || Boolean(isGeneratingSearchGrounding), 
                                    color: settings.enableSearchGrounding ? 'text-cyan-300' : 'text-violet-300', 
                                    border: settings.enableSearchGrounding ? 'border-cyan-500/50 bg-cyan-950/20 hover:border-cyan-400' : 'hover:border-violet-500/50' 
                                },
                                { id: 'openai', label: 'CHATGPT (GRÁTIS)', sub: 'GPT-4o Mini', icon: Bot, action: onAnalyzeOpenAI, loading: isGeneratingOpenAI, color: 'text-emerald-300', border: 'hover:border-emerald-500/50' },
                                { id: 'claude', label: 'CLAUDE 3.7', sub: 'Anthropic', icon: Compass, action: onAnalyzeClaude, loading: isGeneratingClaude, color: 'text-amber-300', border: 'hover:border-amber-500/50' },
                                { id: 'deepseek', label: 'DEEPSEEK (GRÁTIS)', sub: 'R1 Visual', icon: Brain, action: onAnalyzeDeepseek, loading: isGeneratingDeepseek, color: 'text-blue-300', border: 'hover:border-blue-500/50' }
                            ].map(ai => (
                                <button 
                                    key={ai.id}
                                    disabled={!hasImage || ai.loading}
                                    onClick={ai.action}
                                    className={`flex flex-col items-center justify-center p-2 sm:p-1.5 bg-slate-950/70 border border-slate-800 rounded-lg text-[9px] sm:text-[8px] font-black ${ai.color} ${ai.border} hover:bg-slate-800/80 transition-all disabled:opacity-40 min-h-[52px] sm:min-h-[50px] active:scale-95 text-center`}
                                >
                                    {ai.loading ? <Loader2 size={14} className="animate-spin mb-1" /> : <ai.icon size={14} className="mb-1" />}
                                    <span className="leading-tight">{ai.label}</span>
                                    <span className="text-[7px] text-slate-400 font-normal">{ai.sub}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Categoria 2: Motores de Imagem & Render Especialistas */}
                    <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-[8px] font-black text-slate-400 uppercase tracking-wider">
                            <span className="flex items-center gap-1 text-rose-400">
                                <Flame size={11} className="text-rose-400" />
                                Especialistas em Imagem & Render (13 Motores)
                            </span>
                            <span className="text-[7.5px] bg-rose-500/20 text-rose-300 px-1.5 py-0.2 rounded font-bold border border-rose-500/30">TOP IMAGE & RENDER</span>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                            {/* 1. Midjourney */}
                            <button 
                                disabled={!hasImage || isGeneratingMidjourney}
                                onClick={onAnalyzeMidjourney}
                                className="flex flex-col items-center justify-center p-2 sm:p-1.5 bg-slate-950/70 border border-slate-800 hover:border-cyan-500/50 rounded-lg text-[8px] sm:text-[8px] font-black text-cyan-300 hover:bg-slate-800/80 transition-all disabled:opacity-40 min-h-[52px] sm:min-h-[50px] active:scale-95 text-center"
                                title="Visão de Estética e Fotografia Midjourney v6.1 (/describe)"
                            >
                                {isGeneratingMidjourney ? <Loader2 size={13} className="animate-spin mb-0.5" /> : <Camera size={13} className="mb-0.5 text-cyan-400" />}
                                <span className="leading-tight">MIDJOURNEY</span>
                                <span className="text-[7px] text-slate-400 font-normal">v6.1 /describe</span>
                            </button>

                            {/* 2. Flux.1 */}
                            <button 
                                disabled={!hasImage || isGeneratingFlux}
                                onClick={onAnalyzeFlux}
                                className="flex flex-col items-center justify-center p-2 sm:p-1.5 bg-slate-950/70 border border-slate-800 hover:border-rose-500/50 rounded-lg text-[8px] sm:text-[8px] font-black text-rose-300 hover:bg-slate-800/80 transition-all disabled:opacity-40 min-h-[52px] sm:min-h-[50px] active:scale-95 text-center"
                                title="Visão de Realismo RAW e Texturas Físicas (Flux.1 Black Forest Labs)"
                            >
                                {isGeneratingFlux ? <Loader2 size={13} className="animate-spin mb-0.5" /> : <Flame size={13} className="mb-0.5 text-rose-400" />}
                                <span className="leading-tight">FLUX.1</span>
                                <span className="text-[7px] text-slate-400 font-normal">Realismo RAW</span>
                            </button>

                            {/* 3. Redshift 3D */}
                            <button 
                                disabled={!hasImage || isGeneratingRedshift}
                                onClick={onAnalyzeRedshift}
                                className="flex flex-col items-center justify-center p-2 sm:p-1.5 bg-slate-950/70 border border-slate-800 hover:border-red-500/50 rounded-lg text-[8px] sm:text-[8px] font-black text-red-300 hover:bg-slate-800/80 transition-all disabled:opacity-40 min-h-[52px] sm:min-h-[50px] active:scale-95 text-center"
                                title="Visão de GPU Motion Design e Shaders SSS (Maxon Redshift 3D / Cinema 4D)"
                            >
                                {isGeneratingRedshift ? <Loader2 size={13} className="animate-spin mb-0.5" /> : <Flame size={13} className="mb-0.5 text-red-400" />}
                                <span className="leading-tight">REDSHIFT 3D</span>
                                <span className="text-[7px] text-slate-400 font-normal">Maxon Mograph</span>
                            </button>

                            {/* 4. Octane Render */}
                            <button 
                                disabled={!hasImage || isGeneratingOctane}
                                onClick={onAnalyzeOctane}
                                className="flex flex-col items-center justify-center p-2 sm:p-1.5 bg-slate-950/70 border border-slate-800 hover:border-amber-500/50 rounded-lg text-[8px] sm:text-[8px] font-black text-amber-300 hover:bg-slate-800/80 transition-all disabled:opacity-40 min-h-[52px] sm:min-h-[50px] active:scale-95 text-center"
                                title="Visão de GPU Path Tracing e Cáusticas Físicas (Octane Render / Cinema 4D)"
                            >
                                {isGeneratingOctane ? <Loader2 size={13} className="animate-spin mb-0.5" /> : <Sun size={13} className="mb-0.5 text-amber-400" />}
                                <span className="leading-tight">OCTANE RENDER</span>
                                <span className="text-[7px] text-slate-400 font-normal">Path Tracing C4D</span>
                            </button>

                            {/* 5. Unreal Engine */}
                            <button 
                                disabled={!hasImage || isGeneratingUnreal}
                                onClick={onAnalyzeUnreal}
                                className="flex flex-col items-center justify-center p-2 sm:p-1.5 bg-slate-950/70 border border-slate-800 hover:border-blue-500/50 rounded-lg text-[8px] sm:text-[8px] font-black text-blue-300 hover:bg-slate-800/80 transition-all disabled:opacity-40 min-h-[52px] sm:min-h-[50px] active:scale-95 text-center"
                                title="Visão de Iluminação Global Lumen e Geometria Nanite (Unreal Engine 5.5)"
                            >
                                {isGeneratingUnreal ? <Loader2 size={13} className="animate-spin mb-0.5" /> : <Boxes size={13} className="mb-0.5 text-blue-400" />}
                                <span className="leading-tight">UNREAL ENGINE</span>
                                <span className="text-[7px] text-slate-400 font-normal">UE 5.5 / Lumen</span>
                            </button>

                            {/* 6. V-Ray 6 */}
                            <button 
                                disabled={!hasImage || isGeneratingVRay}
                                onClick={onAnalyzeVRay}
                                className="flex flex-col items-center justify-center p-2 sm:p-1.5 bg-slate-950/70 border border-slate-800 hover:border-emerald-500/50 rounded-lg text-[8px] sm:text-[8px] font-black text-emerald-300 hover:bg-slate-800/80 transition-all disabled:opacity-40 min-h-[52px] sm:min-h-[50px] active:scale-95 text-center"
                                title="Visão de Render Arquitetônico e Automotivo de Luxo (Chaos V-Ray 6)"
                            >
                                {isGeneratingVRay ? <Loader2 size={13} className="animate-spin mb-0.5" /> : <Building2 size={13} className="mb-0.5 text-emerald-400" />}
                                <span className="leading-tight">V-RAY 6</span>
                                <span className="text-[7px] text-slate-400 font-normal">ArchViz & Luxury</span>
                            </button>

                            {/* 7. Corona Render */}
                            <button 
                                disabled={!hasImage || isGeneratingCorona}
                                onClick={onAnalyzeCorona}
                                className="flex flex-col items-center justify-center p-2 sm:p-1.5 bg-slate-950/70 border border-slate-800 hover:border-teal-500/50 rounded-lg text-[8px] sm:text-[8px] font-black text-teal-300 hover:bg-slate-800/80 transition-all disabled:opacity-40 min-h-[52px] sm:min-h-[50px] active:scale-95 text-center"
                                title="Visão de Iluminação Escandinava e Materiais Orgânicos (Chaos Corona)"
                            >
                                {isGeneratingCorona ? <Loader2 size={13} className="animate-spin mb-0.5" /> : <Feather size={13} className="mb-0.5 text-teal-400" />}
                                <span className="leading-tight">CORONA RENDER</span>
                                <span className="text-[7px] text-slate-400 font-normal">Nordic Serenity</span>
                            </button>

                            {/* 8. Blender Cycles */}
                            <button 
                                disabled={!hasImage || isGeneratingCycles}
                                onClick={onAnalyzeCycles}
                                className="flex flex-col items-center justify-center p-2 sm:p-1.5 bg-slate-950/70 border border-slate-800 hover:border-orange-500/50 rounded-lg text-[8px] sm:text-[8px] font-black text-orange-300 hover:bg-slate-800/80 transition-all disabled:opacity-40 min-h-[52px] sm:min-h-[50px] active:scale-95 text-center"
                                title="Visão de Ray Tracing Aberto e Shaders BSDF (Blender 4 Cycles X / AgX)"
                            >
                                {isGeneratingCycles ? <Loader2 size={13} className="animate-spin mb-0.5" /> : <Orbit size={13} className="mb-0.5 text-orange-400" />}
                                <span className="leading-tight">BLENDER CYCLES</span>
                                <span className="text-[7px] text-slate-400 font-normal">Cycles X / AgX</span>
                            </button>

                            {/* 9. Leonardo Phoenix */}
                            <button 
                                disabled={!hasImage || isGeneratingLeonardo}
                                onClick={onAnalyzeLeonardo}
                                className="flex flex-col items-center justify-center p-2 sm:p-1.5 bg-slate-950/70 border border-slate-800 hover:border-yellow-500/50 rounded-lg text-[8px] sm:text-[8px] font-black text-yellow-300 hover:bg-slate-800/80 transition-all disabled:opacity-40 min-h-[52px] sm:min-h-[50px] active:scale-95 text-center"
                                title="Visão de Fotorealismo Cinematográfico (Leonardo.ai Phoenix / Kino)"
                            >
                                {isGeneratingLeonardo ? <Loader2 size={13} className="animate-spin mb-0.5" /> : <Sparkles size={13} className="mb-0.5 text-yellow-400" />}
                                <span className="leading-tight">LEONARDO PHOENIX</span>
                                <span className="text-[7px] text-slate-400 font-normal">Photoreal V2</span>
                            </button>

                            {/* 10. SD 3.5 Large */}
                            <button 
                                disabled={!hasImage || isGeneratingSD}
                                onClick={onAnalyzeSD}
                                className="flex flex-col items-center justify-center p-2 sm:p-1.5 bg-slate-950/70 border border-slate-800 hover:border-violet-500/50 rounded-lg text-[8px] sm:text-[8px] font-black text-violet-300 hover:bg-slate-800/80 transition-all disabled:opacity-40 min-h-[52px] sm:min-h-[50px] active:scale-95 text-center"
                                title="Visão de Difusão Latente ComfyUI (Stable Diffusion 3.5 Large)"
                            >
                                {isGeneratingSD ? <Loader2 size={13} className="animate-spin mb-0.5" /> : <Cpu size={13} className="mb-0.5 text-violet-400" />}
                                <span className="leading-tight">SD 3.5 LARGE</span>
                                <span className="text-[7px] text-slate-400 font-normal">ComfyUI Latent</span>
                            </button>

                            {/* 11. Recraft v3 */}
                            <button 
                                disabled={!hasImage || isGeneratingRecraft}
                                onClick={onAnalyzeRecraft}
                                className="flex flex-col items-center justify-center p-2 sm:p-1.5 bg-slate-950/70 border border-slate-800 hover:border-pink-500/50 rounded-lg text-[8px] sm:text-[8px] font-black text-pink-300 hover:bg-slate-800/80 transition-all disabled:opacity-40 min-h-[52px] sm:min-h-[50px] active:scale-95 text-center"
                                title="Visão de Design Gráfico #1 e Ícones 3D (Recraft v3 / Red Dot Best of the Best)"
                            >
                                {isGeneratingRecraft ? <Loader2 size={13} className="animate-spin mb-0.5" /> : <Gem size={13} className="mb-0.5 text-pink-400" />}
                                <span className="leading-tight">RECRAFT v3</span>
                                <span className="text-[7px] text-slate-400 font-normal">Design & 3D Icons</span>
                            </button>

                            {/* 12. Magnific AI */}
                            <button 
                                disabled={!hasImage || isGeneratingMagnific}
                                onClick={onAnalyzeMagnific}
                                className="flex flex-col items-center justify-center p-2 sm:p-1.5 bg-slate-950/70 border border-slate-800 hover:border-sky-500/50 rounded-lg text-[8px] sm:text-[8px] font-black text-sky-300 hover:bg-slate-800/80 transition-all disabled:opacity-40 min-h-[52px] sm:min-h-[50px] active:scale-95 text-center"
                                title="Visão de Micro-Texturas e Alucinação Neural 16K (Magnific AI / Krea)"
                            >
                                {isGeneratingMagnific ? <Loader2 size={13} className="animate-spin mb-0.5" /> : <Wand size={13} className="mb-0.5 text-sky-400" />}
                                <span className="leading-tight">MAGNIFIC 16K</span>
                                <span className="text-[7px] text-slate-400 font-normal">Micro-Texturas AI</span>
                            </button>

                            {/* 13. Ideogram 2.0 (Span across bottom) */}
                            <button 
                                disabled={!hasImage || isGeneratingIdeogram}
                                onClick={onAnalyzeIdeogram}
                                className="flex flex-col items-center justify-center p-2 sm:p-1.5 bg-slate-950/70 border border-slate-800 hover:border-fuchsia-500/50 rounded-lg text-[8px] sm:text-[8px] font-black text-fuchsia-300 hover:bg-slate-800/80 transition-all disabled:opacity-40 min-h-[52px] sm:min-h-[50px] active:scale-95 text-center col-span-2 sm:col-span-4"
                                title="Visão de Tipografia e Design Gráfico (Ideogram 2.0)"
                            >
                                {isGeneratingIdeogram ? <Loader2 size={13} className="animate-spin mb-0.5" /> : <Type size={13} className="mb-0.5 text-fuchsia-400" />}
                                <span className="leading-tight">IDEOGRAM 2.0</span>
                                <span className="text-[7px] text-slate-400 font-normal">Design Gráfico, Logos & Tipografia Renderizada</span>
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

                {/* Slider Nível de Detalhe e Fidelidade à Referência */}
                <div className="bg-slate-900/40 p-3 rounded-lg border border-slate-700/50 space-y-2.5">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-[9px] font-bold text-blue-400 uppercase tracking-widest">
                            <LayersIcon size={12} />
                            <span>Nível de Detalhe</span>
                        </div>
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded border uppercase transition-all ${
                            currentDetailValue >= 7 
                                ? 'text-amber-300 bg-amber-500/20 border-amber-500/40 shadow-[0_0_10px_rgba(245,158,11,0.2)]'
                                : 'text-blue-300 bg-blue-500/10 border-blue-500/20'
                        }`}>
                            {detailInfo.label} ({currentDetailValue}/10)
                        </span>
                    </div>

                    <input 
                        type="range" min="1" max="10" step="1" 
                        value={currentDetailValue}
                        onChange={(e) => {
                            handleChange('detailLevel', parseInt(e.target.value));
                        }}
                        className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                    />

                    {/* Presets Rápidos de Fidelidade */}
                    <div className="grid grid-cols-4 gap-1 pt-0.5">
                        {[
                            { val: 1, label: 'Mínimo' },
                            { val: 5, label: 'Padrão' },
                            { val: 7, label: 'Detalhado' },
                            { val: 10, label: 'Cópia Fiel' }
                        ].map(preset => (
                            <button
                                key={preset.val}
                                type="button"
                                onClick={() => handleChange('detailLevel', preset.val)}
                                className={`py-1 px-1 rounded text-[8px] font-black transition-all ${
                                    currentDetailValue === preset.val
                                        ? 'bg-blue-600 text-white shadow-sm ring-1 ring-blue-400'
                                        : 'bg-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-700'
                                }`}
                            >
                                {preset.label} ({preset.val})
                            </button>
                        ))}
                    </div>

                    {currentDetailValue >= 7 && (
                        <div className="p-2 rounded-lg bg-amber-950/30 border border-amber-500/40 text-[10px] text-amber-200 flex items-start gap-2 animate-in fade-in duration-200">
                            <Target size={14} className="text-amber-400 shrink-0 mt-0.5" />
                            <div className="leading-snug">
                                <strong className="text-amber-300 font-bold block mb-0.5">🎯 Fidelidade Máxima à Imagem de Referência Ativa:</strong>
                                A IA analisará micro-detalhes, iluminação física, texturas e paleta de cores para gerar um prompt o mais próximo possível da imagem de referência.
                            </div>
                        </div>
                    )}
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
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-slate-400 font-bold text-[9px] uppercase tracking-widest">
                            <Palette size={12} className="text-pink-400"/>
                            <span>Estilos</span>
                        </div>
                        <button
                            type="button"
                            onClick={onOpenSettings}
                            className="flex items-center gap-1 text-[8px] sm:text-[8.5px] font-bold text-slate-400 hover:text-pink-300 transition-colors bg-slate-900/80 hover:bg-slate-800 px-2 py-0.5 rounded border border-slate-700/80 cursor-pointer"
                            title="Abrir configurações para alterar o estilo padrão automático"
                        >
                            <Settings size={10} className="text-pink-400" />
                            <span>Definir Padrão Global</span>
                        </button>
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

            </div>
        </div>
    );
};
