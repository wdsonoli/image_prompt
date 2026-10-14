
import React, { useState } from 'react';
import { PromptSettings, TargetPlatform, STYLE_TEMPLATES, DETAIL_LEVEL_MAP, VISION_MODELS_DATA, PHOTOGRAPHY_FRAMING_OPTIONS } from '../types';
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
    Film, Crown, Laptop, Building2, Feather, Orbit, Shapes, Gem, Wand, UserCheck, User, Scissors
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
    onSwitchToProductSheet?: () => void;
    onSwitchToBgRemover?: () => void;
    onSwitchToUpscale?: () => void;
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
    { id: 'waist_up', label: 'Foto até meio da barriga', icon: User },
    { id: 'full_body', label: 'Foto completa', icon: Maximize },
    { id: 'chest_up', label: 'Foto peito pra cima', icon: Camera },
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
    onSwitchToProductSheet,
    onSwitchToBgRemover,
    onSwitchToUpscale,
    onOpenGemini3ProGenerator,
    onOpenImageEditor
}) => {
    
    const handleChange = (key: keyof PromptSettings, value: any) => {
        onSettingsChange({ ...settings, [key]: value });
    };

    const selectedVision = settings.selectedVisionModel || 'none';

    const handleSelectVision = (modelId: string) => {
        if (selectedVision === modelId) {
            handleChange('selectedVisionModel', 'none');
        } else {
            handleChange('selectedVisionModel', modelId);
        }
    };

    const activeVisionInfo = selectedVision !== 'none' ? VISION_MODELS_DATA[selectedVision] : null;
    const activeVisionName = activeVisionInfo?.label || selectedVision;

    const isCurrentVisionLoading = (() => {
        if (selectedVision === 'none') return false;
        switch (selectedVision) {
            case 'gemini': return Boolean(isGeneratingGemini || isGeneratingSearchGrounding);
            case 'openai': return Boolean(isGeneratingOpenAI);
            case 'claude': return Boolean(isGeneratingClaude);
            case 'deepseek': return Boolean(isGeneratingDeepseek);
            case 'consensus': return Boolean(isGeneratingConsensus);
            case 'behance': return Boolean(isGeneratingBehance);
            case 'artstation': return Boolean(isGeneratingArtStation);
            case 'product_design': return Boolean(isGeneratingProductDesign);
            case 'awwwards': return Boolean(isGeneratingAwwwards);
            case 'cinema': return Boolean(isGeneratingCinema);
            case 'vogue': return Boolean(isGeneratingVogue);
            case 'natgeo': return Boolean(isGeneratingNatGeo);
            case 'octane': return Boolean(isGeneratingOctane);
            case 'unreal': return Boolean(isGeneratingUnreal);
            case 'leonardo': return Boolean(isGeneratingLeonardo);
            case 'sd': return Boolean(isGeneratingSD);
            case 'redshift': return Boolean(isGeneratingRedshift);
            case 'vray': return Boolean(isGeneratingVRay);
            case 'corona': return Boolean(isGeneratingCorona);
            case 'cycles': return Boolean(isGeneratingCycles);
            case 'recraft': return Boolean(isGeneratingRecraft);
            case 'magnific': return Boolean(isGeneratingMagnific);
            case 'midjourney': return Boolean(isGeneratingMidjourney);
            case 'flux': return Boolean(isGeneratingFlux);
            case 'ideogram': return Boolean(isGeneratingIdeogram);
            case 'google_vision': return Boolean(isGeneratingGoogleVision);
            case 'whisk': return Boolean(isGeneratingWhisk);
            case 'huggingface': return Boolean(isGeneratingHuggingFace);
            case 'imagefx': return Boolean(isGeneratingImageFX);
            case 'tf': return Boolean(isGeneratingTF);
            default: return false;
        }
    })();

    const isAnyVisionGenerating = Boolean(
        isGeneratingGemini || isGeneratingSearchGrounding || isGeneratingOpenAI || isGeneratingDeepseek ||
        isGeneratingConsensus || isGeneratingBehance || isGeneratingArtStation || isGeneratingProductDesign ||
        isGeneratingAwwwards || isGeneratingCinema || isGeneratingVogue || isGeneratingNatGeo ||
        isGeneratingOctane || isGeneratingUnreal || isGeneratingLeonardo || isGeneratingSD ||
        isGeneratingRedshift || isGeneratingVRay || isGeneratingCorona || isGeneratingCycles ||
        isGeneratingRecraft || isGeneratingMagnific || isGeneratingMidjourney || isGeneratingFlux ||
        isGeneratingIdeogram || isGeneratingGoogleVision || isGeneratingWhisk || isGeneratingHuggingFace ||
        isGeneratingImageFX || isGeneratingTF
    );

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
                        </button>
                    )}
                    {onSwitchToProductSheet && (
                        <button
                            type="button"
                            onClick={onSwitchToProductSheet}
                            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-gradient-to-r from-amber-600/20 to-orange-600/20 border border-amber-500/40 text-amber-300 hover:text-white hover:border-amber-400 transition-all text-xs font-bold"
                            title="Troca de Marca & Ficha de Produto (Envie garrafa, logo e rótulo)"
                        >
                            <Package size={13} className="text-amber-400" />
                            <span className="hidden sm:inline">Troca de Marca</span>
                            <span className="sm:hidden">Produto</span>
                            <span className="text-[9px] px-1 py-0.2 rounded bg-amber-500/20 text-amber-200 font-mono">NOVO</span>
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
                
                {/* Banner do Novo Modo: Troca de Marca & Ficha de Produto */}
                {onSwitchToProductSheet && (
                    <div className="p-3 rounded-xl bg-gradient-to-r from-amber-950/60 via-slate-900 to-orange-950/40 border border-amber-500/50 flex items-center justify-between gap-3 shadow-lg">
                        <div className="flex items-center gap-2.5">
                            <div className="p-2 rounded-lg bg-amber-600/20 text-amber-400 border border-amber-500/30 shrink-0">
                                <Package size={17} />
                            </div>
                            <div className="min-w-0">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                    <span className="text-xs font-black text-white">Novo Modo: Troca de Marca & Produto</span>
                                    <span className="px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-300 text-[8px] font-black uppercase border border-amber-500/30">
                                        Multi-Upload
                                    </span>
                                </div>
                                <p className="text-[10px] text-slate-400 leading-tight mt-0.5">
                                    Envie garrafa/embalagem + seu logo + rótulo e gere a ficha completa estilo Fanice ou cervejas com a nova marca
                                </p>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={onSwitchToProductSheet}
                            className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-bold text-xs shrink-0 shadow-md transition-all active:scale-95"
                        >
                            Abrir Modo
                        </button>
                    </div>
                )}

                {/* Banner do Novo Modo: Ficha de Modelo (Model Sheet) */}
                {onSwitchToModelSheet && (
                    <div className="p-3 rounded-xl bg-gradient-to-r from-red-950/60 via-slate-900 to-amber-950/40 border border-red-500/40 flex items-center justify-between gap-3 shadow-lg">
                        <div className="flex items-center gap-2.5">
                            <div className="p-2 rounded-lg bg-red-600/20 text-red-400 border border-red-500/30 shrink-0">
                                <Layers size={17} />
                            </div>
                            <div className="min-w-0">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                    <span className="text-xs font-black text-white">Ficha de Personagem & Modelo</span>
                                    <span className="px-1.5 py-0.2 rounded-full bg-red-500/20 text-red-300 text-[8px] font-black uppercase border border-red-500/30">
                                        Homem / Mulher
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
                            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-red-300 hover:text-white font-bold text-xs shrink-0 border border-red-500/30 transition-all active:scale-95"
                        >
                            Abrir Ficha
                        </button>
                    </div>
                )}

                {/* Banner do Modo: Removedor de Fundo & Figurinhas */}
                {onSwitchToBgRemover && (
                    <div className="p-3 rounded-xl bg-gradient-to-r from-emerald-950/60 via-slate-900 to-teal-950/40 border border-emerald-500/50 flex items-center justify-between gap-3 shadow-lg">
                        <div className="flex items-center gap-2.5">
                            <div className="p-2 rounded-lg bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 shrink-0">
                                <Scissors size={17} />
                            </div>
                            <div className="min-w-0">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                    <span className="text-xs font-black text-white">Removedor de Fundo & Figurinhas</span>
                                    <span className="px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 text-[8px] font-black uppercase border border-emerald-500/30">
                                        Novo Estúdio
                                    </span>
                                </div>
                                <p className="text-[10px] text-slate-400 leading-tight mt-0.5">
                                    Recorte automático, troca de fundo, pincel restaurador, refino de cabelos e bordas brancas die-cut
                                </p>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={onSwitchToBgRemover}
                            className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shrink-0 shadow-md transition-all active:scale-95 cursor-pointer"
                        >
                            Abrir Modo
                        </button>
                    </div>
                )}
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

                {/* Modo Fotografia: Enquadramento de Cenário (Meio da barriga, Foto completa, Peito pra cima) */}
                <div className="space-y-2 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
                    <div className="flex items-center justify-between">
                        <label className="text-[9px] font-black uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
                            <Camera size={12} className="text-cyan-400" />
                            <span>Modo Fotografia (Enquadramento)</span>
                        </label>
                        <span className="text-[9px] font-mono text-cyan-300 font-bold">
                            {settings.photographyFraming === 'chest_up'
                                ? '👤 Peito pra Cima'
                                : settings.photographyFraming === 'waist_up'
                                ? '🧍 Meio da Barriga'
                                : settings.photographyFraming === 'full_body'
                                ? '🚶 Foto Completa'
                                : '✦ Automático'}
                        </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                        {PHOTOGRAPHY_FRAMING_OPTIONS.map((opt) => {
                            const isSelected = (!settings.photographyFraming && opt.id === 'none') || settings.photographyFraming === opt.id;
                            return (
                                <button
                                    key={opt.id}
                                    type="button"
                                    onClick={() => onSettingsChange({ ...settings, photographyFraming: opt.id })}
                                    className={`p-2 rounded-lg text-left transition-all border flex flex-col justify-between min-h-[50px] cursor-pointer ${
                                        isSelected
                                            ? 'bg-cyan-950/60 border-cyan-400 text-white shadow-[0_0_12px_rgba(6,182,212,0.25)] ring-1 ring-cyan-400'
                                            : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                                    }`}
                                    title={opt.description}
                                >
                                    <div className="flex items-center justify-between w-full">
                                        <span className={`text-[10px] font-black ${isSelected ? 'text-cyan-200' : 'text-slate-300'}`}>
                                            {opt.label}
                                        </span>
                                        {isSelected && <span className="text-[8px] text-cyan-300 font-bold">✓</span>}
                                    </div>
                                    <span className="text-[8px] text-slate-400 font-medium leading-tight">
                                        {opt.sub}
                                    </span>
                                </button>
                            );
                        })}
                    </div>

                    {settings.photographyFraming && settings.photographyFraming !== 'none' && (
                        <div className="text-[9.5px] text-cyan-300/80 bg-cyan-950/30 p-2 rounded-lg border border-cyan-500/20 leading-relaxed">
                            📷 <strong className="text-cyan-200">Enquadramento Ativo:</strong> {PHOTOGRAPHY_FRAMING_OPTIONS.find(o => o.id === settings.photographyFraming)?.description}
                        </div>
                    )}
                </div>

                {/* Reconhecimento IA - Suíte Expandida de Visão (Modo Seleção de Modelo para Compilação) */}
                <div className="space-y-3 bg-slate-900/40 p-3 rounded-xl border border-slate-800/80">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-slate-300 font-bold text-[10px] uppercase tracking-widest">
                            <Sparkles size={13} className="text-violet-400"/>
                            <span>Modo de Visão IA</span>
                        </div>
                        {selectedVision !== 'none' ? (
                            <div className="flex items-center gap-1.5">
                                <span className="text-[8.5px] font-bold text-violet-300 bg-violet-500/20 px-2 py-0.5 rounded-full border border-violet-500/40 flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                                    Ativo: {activeVisionName}
                                </span>
                                <button
                                    type="button"
                                    onClick={() => handleSelectVision('none')}
                                    className="text-[8.5px] text-slate-400 hover:text-rose-300 px-1.5 py-0.5 rounded hover:bg-slate-800 transition-colors"
                                    title="Desmarcar modo de visão e voltar ao compilador padrão"
                                >
                                    ✕ Desmarcar
                                </button>
                            </div>
                        ) : (
                            <span className="text-[8.5px] font-bold text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded-full border border-slate-700">
                                28 Motores IA (Clique para Selecionar)
                            </span>
                        )}
                    </div>

                    {/* Banner explicativo do modo de visão */}
                    <div className={`p-2 rounded-lg border text-[9px] transition-all flex items-start gap-2 ${
                        selectedVision !== 'none'
                            ? 'bg-violet-950/40 border-violet-500/40 text-violet-200'
                            : 'bg-slate-950/60 border-slate-800/80 text-slate-400'
                    }`}>
                        <Eye size={13} className={selectedVision !== 'none' ? 'text-violet-400 shrink-0 mt-0.5 animate-pulse' : 'text-slate-500 shrink-0 mt-0.5'} />
                        <div className="leading-snug">
                            {selectedVision !== 'none' ? (
                                <span>
                                    Motor selecionado: <strong className="text-white font-bold">{activeVisionName}</strong>. Quando você clicar no botão <strong className="text-cyan-300 font-bold">"Compilar Prompt"</strong>, este modelo analisará sua foto e gerará o prompt especialista!
                                </span>
                            ) : (
                                <span>
                                    <strong className="text-slate-300 font-bold">Modo de Visão</strong>: Clique em um dos modelos abaixo para <strong className="text-violet-300">selecioná-lo</strong>. Ao clicar em <strong className="text-cyan-300">"Compilar Prompt"</strong>, o prompt será gerado pelo modelo escolhido.
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Consenso Multi-Visão Super Ensemble */}
                    <button
                        type="button"
                        onClick={() => handleSelectVision('consensus')}
                        className={`w-full relative group overflow-hidden p-2.5 rounded-lg border transition-all text-left ${
                            selectedVision === 'consensus'
                                ? 'border-violet-400 ring-2 ring-violet-400 bg-gradient-to-r from-violet-900/90 via-purple-900/80 to-indigo-900/90 shadow-[0_0_20px_rgba(139,92,246,0.35)] scale-[1.01]'
                                : 'border-violet-500/40 bg-gradient-to-r from-violet-950/60 via-purple-900/40 to-indigo-950/60 hover:border-violet-400'
                        }`}
                        title="Selecionar Consenso Multi-Visão Super Ensemble para a compilação do prompt"
                    >
                        {selectedVision === 'consensus' && (
                            <span className="absolute top-1.5 right-2 text-[8px] bg-violet-500 text-white font-black px-1.5 py-0.2 rounded-full flex items-center gap-1 shadow">
                                ✓ SELECIONADO
                            </span>
                        )}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className={`p-1 rounded ${selectedVision === 'consensus' ? 'bg-violet-400 text-slate-950 font-bold' : 'bg-violet-500/20 text-violet-300'}`}>
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
                            <Zap size={14} className={`${selectedVision === 'consensus' ? 'text-yellow-300 scale-110' : 'text-violet-400'} group-hover:scale-110 transition-transform shrink-0`} />
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
                                type="button"
                                onClick={() => handleSelectVision('behance')}
                                className={`relative flex flex-col items-center justify-center p-2 sm:p-1.5 rounded-lg text-[8px] sm:text-[8px] font-black transition-all min-h-[52px] sm:min-h-[50px] active:scale-95 text-center ${
                                    selectedVision === 'behance'
                                        ? 'ring-2 ring-pink-400 bg-pink-950/80 border border-pink-400 text-white shadow-[0_0_12px_rgba(244,114,182,0.35)] scale-[1.02]'
                                        : 'bg-slate-950/70 border border-slate-800 hover:border-pink-500/50 text-pink-300 hover:bg-slate-800/80'
                                }`}
                                title="Selecionar Visão de Designer Gráfico & Branding de Elite (Behance / Dribbble)"
                            >
                                {selectedVision === 'behance' && <span className="absolute top-1 right-1 text-[7px] bg-pink-500 text-white font-black px-1 rounded-full">✓</span>}
                                {isGeneratingBehance ? <Loader2 size={13} className="animate-spin mb-0.5" /> : <PenTool size={13} className="mb-0.5 text-pink-400" />}
                                <span className="leading-tight">BEHANCE / DRIBBBLE</span>
                                <span className="text-[7px] text-slate-400 font-normal">Brand & Layout</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => handleSelectVision('artstation')}
                                className={`relative flex flex-col items-center justify-center p-2 sm:p-1.5 rounded-lg text-[8px] sm:text-[8px] font-black transition-all min-h-[52px] sm:min-h-[50px] active:scale-95 text-center ${
                                    selectedVision === 'artstation'
                                        ? 'ring-2 ring-indigo-400 bg-indigo-950/80 border border-indigo-400 text-white shadow-[0_0_12px_rgba(129,140,248,0.35)] scale-[1.02]'
                                        : 'bg-slate-950/70 border border-slate-800 hover:border-indigo-500/50 text-indigo-300 hover:bg-slate-800/80'
                                }`}
                                title="Selecionar Visão de Art Director 3D & Concept Artist (ArtStation Trending #1)"
                            >
                                {selectedVision === 'artstation' && <span className="absolute top-1 right-1 text-[7px] bg-indigo-500 text-white font-black px-1 rounded-full">✓</span>}
                                {isGeneratingArtStation ? <Loader2 size={13} className="animate-spin mb-0.5" /> : <Layers3d size={13} className="mb-0.5 text-indigo-400" />}
                                <span className="leading-tight">ARTSTATION 3D</span>
                                <span className="text-[7px] text-slate-400 font-normal">Concept & CGI</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => handleSelectVision('product_design')}
                                className={`relative flex flex-col items-center justify-center p-2 sm:p-1.5 rounded-lg text-[8px] sm:text-[8px] font-black transition-all min-h-[52px] sm:min-h-[50px] active:scale-95 text-center ${
                                    selectedVision === 'product_design'
                                        ? 'ring-2 ring-emerald-400 bg-emerald-950/80 border border-emerald-400 text-white shadow-[0_0_12px_rgba(52,211,153,0.35)] scale-[1.02]'
                                        : 'bg-slate-950/70 border border-slate-800 hover:border-emerald-500/50 text-emerald-300 hover:bg-slate-800/80'
                                }`}
                                title="Selecionar Visão de Design Industrial & Embalagens CMF"
                            >
                                {selectedVision === 'product_design' && <span className="absolute top-1 right-1 text-[7px] bg-emerald-500 text-white font-black px-1 rounded-full">✓</span>}
                                {isGeneratingProductDesign ? <Loader2 size={13} className="animate-spin mb-0.5" /> : <Package size={13} className="mb-0.5 text-emerald-400" />}
                                <span className="leading-tight">DESIGN PRODUTO</span>
                                <span className="text-[7px] text-slate-400 font-normal">CMF & Packaging</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => handleSelectVision('awwwards')}
                                className={`relative flex flex-col items-center justify-center p-2 sm:p-1.5 rounded-lg text-[8px] sm:text-[8px] font-black transition-all min-h-[52px] sm:min-h-[50px] active:scale-95 text-center ${
                                    selectedVision === 'awwwards'
                                        ? 'ring-2 ring-cyan-400 bg-cyan-950/80 border border-cyan-400 text-white shadow-[0_0_12px_rgba(34,211,238,0.35)] scale-[1.02]'
                                        : 'bg-slate-950/70 border border-slate-800 hover:border-cyan-500/50 text-cyan-300 hover:bg-slate-800/80'
                                }`}
                                title="Selecionar Visão de Digital Product & UI/UX Designer (Awwwards)"
                            >
                                {selectedVision === 'awwwards' && <span className="absolute top-1 right-1 text-[7px] bg-cyan-500 text-white font-black px-1 rounded-full">✓</span>}
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
                                type="button"
                                onClick={() => handleSelectVision('cinema')}
                                className={`relative flex flex-col items-center justify-center p-2 sm:p-1.5 rounded-lg text-[8px] sm:text-[8px] font-black transition-all min-h-[52px] sm:min-h-[50px] active:scale-95 text-center ${
                                    selectedVision === 'cinema'
                                        ? 'ring-2 ring-amber-400 bg-amber-950/80 border border-amber-400 text-white shadow-[0_0_12px_rgba(251,191,36,0.35)] scale-[1.02]'
                                        : 'bg-slate-950/70 border border-slate-800 hover:border-amber-500/50 text-amber-300 hover:bg-slate-800/80'
                                }`}
                                title="Selecionar Visão de Diretor de Fotografia de Hollywood (ARRI / IMAX 70mm)"
                            >
                                {selectedVision === 'cinema' && <span className="absolute top-1 right-1 text-[7px] bg-amber-500 text-slate-950 font-black px-1 rounded-full">✓</span>}
                                {isGeneratingCinema ? <Loader2 size={13} className="animate-spin mb-0.5" /> : <Film size={13} className="mb-0.5 text-amber-400" />}
                                <span className="leading-tight">HOLLYWOOD CINEMA</span>
                                <span className="text-[7px] text-slate-400 font-normal">ARRI / 70mm IMAX</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => handleSelectVision('vogue')}
                                className={`relative flex flex-col items-center justify-center p-2 sm:p-1.5 rounded-lg text-[8px] sm:text-[8px] font-black transition-all min-h-[52px] sm:min-h-[50px] active:scale-95 text-center ${
                                    selectedVision === 'vogue'
                                        ? 'ring-2 ring-fuchsia-400 bg-fuchsia-950/80 border border-fuchsia-400 text-white shadow-[0_0_12px_rgba(232,121,249,0.35)] scale-[1.02]'
                                        : 'bg-slate-950/70 border border-slate-800 hover:border-fuchsia-500/50 text-fuchsia-300 hover:bg-slate-800/80'
                                }`}
                                title="Selecionar Visão de Direção de Moda & Estilo Vogue (Alta Costura)"
                            >
                                {selectedVision === 'vogue' && <span className="absolute top-1 right-1 text-[7px] bg-fuchsia-500 text-white font-black px-1 rounded-full">✓</span>}
                                {isGeneratingVogue ? <Loader2 size={13} className="animate-spin mb-0.5" /> : <Crown size={13} className="mb-0.5 text-fuchsia-400" />}
                                <span className="leading-tight">VOGUE EDITORIAL</span>
                                <span className="text-[7px] text-slate-400 font-normal">Moda & Alta Costura</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => handleSelectVision('natgeo')}
                                className={`relative flex flex-col items-center justify-center p-2 sm:p-1.5 rounded-lg text-[8px] sm:text-[8px] font-black transition-all min-h-[52px] sm:min-h-[50px] active:scale-95 text-center ${
                                    selectedVision === 'natgeo'
                                        ? 'ring-2 ring-emerald-400 bg-emerald-950/80 border border-emerald-400 text-white shadow-[0_0_12px_rgba(52,211,153,0.35)] scale-[1.02]'
                                        : 'bg-slate-950/70 border border-slate-800 hover:border-emerald-500/50 text-emerald-300 hover:bg-slate-800/80'
                                }`}
                                title="Selecionar Visão de Fotógrafo Fellow National Geographic (Hasselblad 100MP RAW)"
                            >
                                {selectedVision === 'natgeo' && <span className="absolute top-1 right-1 text-[7px] bg-emerald-500 text-white font-black px-1 rounded-full">✓</span>}
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
                                    loading: isGeneratingGemini || Boolean(isGeneratingSearchGrounding), 
                                    color: settings.enableSearchGrounding ? 'text-cyan-300' : 'text-violet-300', 
                                    border: settings.enableSearchGrounding ? 'hover:border-cyan-400' : 'hover:border-violet-500/50',
                                    ringColor: 'ring-cyan-400 border-cyan-400 bg-cyan-950/80'
                                },
                                { id: 'openai', label: 'CHATGPT (GRÁTIS)', sub: 'GPT-4o Mini', icon: Bot, loading: isGeneratingOpenAI, color: 'text-emerald-300', border: 'hover:border-emerald-500/50', ringColor: 'ring-emerald-400 border-emerald-400 bg-emerald-950/80' },
                                { id: 'claude', label: 'CLAUDE 3.7', sub: 'Anthropic', icon: Compass, loading: isGeneratingClaude, color: 'text-amber-300', border: 'hover:border-amber-500/50', ringColor: 'ring-amber-400 border-amber-400 bg-amber-950/80' },
                                { id: 'deepseek', label: 'DEEPSEEK (GRÁTIS)', sub: 'R1 Visual', icon: Brain, loading: isGeneratingDeepseek, color: 'text-blue-300', border: 'hover:border-blue-500/50', ringColor: 'ring-blue-400 border-blue-400 bg-blue-950/80' }
                            ].map(ai => {
                                const isSelected = selectedVision === ai.id;
                                return (
                                    <button 
                                        key={ai.id}
                                        type="button"
                                        onClick={() => handleSelectVision(ai.id)}
                                        className={`relative flex flex-col items-center justify-center p-2 sm:p-1.5 rounded-lg text-[9px] sm:text-[8px] font-black transition-all min-h-[52px] sm:min-h-[50px] active:scale-95 text-center ${
                                            isSelected
                                                ? `ring-2 ${ai.ringColor} text-white shadow-lg scale-[1.02]`
                                                : `bg-slate-950/70 border border-slate-800 ${ai.color} ${ai.border} hover:bg-slate-800/80`
                                        }`}
                                        title={`Selecionar ${ai.label} para a compilação do prompt`}
                                    >
                                        {isSelected && <span className="absolute top-1 right-1 text-[7px] bg-violet-500 text-white font-black px-1 rounded-full">✓</span>}
                                        {ai.loading ? <Loader2 size={14} className="animate-spin mb-1" /> : <ai.icon size={14} className="mb-1" />}
                                        <span className="leading-tight">{ai.label}</span>
                                        <span className="text-[7px] text-slate-400 font-normal">{ai.sub}</span>
                                    </button>
                                );
                            })}
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
                                type="button"
                                onClick={() => handleSelectVision('midjourney')}
                                className={`relative flex flex-col items-center justify-center p-2 sm:p-1.5 rounded-lg text-[8px] sm:text-[8px] font-black transition-all min-h-[52px] sm:min-h-[50px] active:scale-95 text-center ${
                                    selectedVision === 'midjourney'
                                        ? 'ring-2 ring-cyan-400 bg-cyan-950/80 border border-cyan-400 text-white shadow-[0_0_12px_rgba(34,211,238,0.35)] scale-[1.02]'
                                        : 'bg-slate-950/70 border border-slate-800 hover:border-cyan-500/50 text-cyan-300 hover:bg-slate-800/80'
                                }`}
                                title="Selecionar Visão Midjourney v6.1 (/describe) para compilar o prompt"
                            >
                                {selectedVision === 'midjourney' && <span className="absolute top-1 right-1 text-[7px] bg-cyan-500 text-slate-950 font-black px-1 rounded-full">✓</span>}
                                {isGeneratingMidjourney ? <Loader2 size={13} className="animate-spin mb-0.5" /> : <Camera size={13} className="mb-0.5 text-cyan-400" />}
                                <span className="leading-tight">MIDJOURNEY</span>
                                <span className="text-[7px] text-slate-400 font-normal">v6.1 /describe</span>
                            </button>

                            {/* 2. Flux.1 */}
                            <button 
                                type="button"
                                onClick={() => handleSelectVision('flux')}
                                className={`relative flex flex-col items-center justify-center p-2 sm:p-1.5 rounded-lg text-[8px] sm:text-[8px] font-black transition-all min-h-[52px] sm:min-h-[50px] active:scale-95 text-center ${
                                    selectedVision === 'flux'
                                        ? 'ring-2 ring-rose-400 bg-rose-950/80 border border-rose-400 text-white shadow-[0_0_12px_rgba(251,113,133,0.35)] scale-[1.02]'
                                        : 'bg-slate-950/70 border border-slate-800 hover:border-rose-500/50 text-rose-300 hover:bg-slate-800/80'
                                }`}
                                title="Selecionar Visão Flux.1 RAW Realism para compilar o prompt"
                            >
                                {selectedVision === 'flux' && <span className="absolute top-1 right-1 text-[7px] bg-rose-500 text-white font-black px-1 rounded-full">✓</span>}
                                {isGeneratingFlux ? <Loader2 size={13} className="animate-spin mb-0.5" /> : <Flame size={13} className="mb-0.5 text-rose-400" />}
                                <span className="leading-tight">FLUX.1</span>
                                <span className="text-[7px] text-slate-400 font-normal">Realismo RAW</span>
                            </button>

                            {/* 3. Redshift 3D */}
                            <button 
                                type="button"
                                onClick={() => handleSelectVision('redshift')}
                                className={`relative flex flex-col items-center justify-center p-2 sm:p-1.5 rounded-lg text-[8px] sm:text-[8px] font-black transition-all min-h-[52px] sm:min-h-[50px] active:scale-95 text-center ${
                                    selectedVision === 'redshift'
                                        ? 'ring-2 ring-red-400 bg-red-950/80 border border-red-400 text-white shadow-[0_0_12px_rgba(248,113,113,0.35)] scale-[1.02]'
                                        : 'bg-slate-950/70 border border-slate-800 hover:border-red-500/50 text-red-300 hover:bg-slate-800/80'
                                }`}
                                title="Selecionar Visão de GPU Motion Design e Shaders SSS (Maxon Redshift 3D)"
                            >
                                {selectedVision === 'redshift' && <span className="absolute top-1 right-1 text-[7px] bg-red-500 text-white font-black px-1 rounded-full">✓</span>}
                                {isGeneratingRedshift ? <Loader2 size={13} className="animate-spin mb-0.5" /> : <Flame size={13} className="mb-0.5 text-red-400" />}
                                <span className="leading-tight">REDSHIFT 3D</span>
                                <span className="text-[7px] text-slate-400 font-normal">Maxon Mograph</span>
                            </button>

                            {/* 4. Octane Render */}
                            <button 
                                type="button"
                                onClick={() => handleSelectVision('octane')}
                                className={`relative flex flex-col items-center justify-center p-2 sm:p-1.5 rounded-lg text-[8px] sm:text-[8px] font-black transition-all min-h-[52px] sm:min-h-[50px] active:scale-95 text-center ${
                                    selectedVision === 'octane'
                                        ? 'ring-2 ring-amber-400 bg-amber-950/80 border border-amber-400 text-white shadow-[0_0_12px_rgba(251,191,36,0.35)] scale-[1.02]'
                                        : 'bg-slate-950/70 border border-slate-800 hover:border-amber-500/50 text-amber-300 hover:bg-slate-800/80'
                                }`}
                                title="Selecionar Visão de GPU Path Tracing e Cáusticas Físicas (Octane Render)"
                            >
                                {selectedVision === 'octane' && <span className="absolute top-1 right-1 text-[7px] bg-amber-500 text-slate-950 font-black px-1 rounded-full">✓</span>}
                                {isGeneratingOctane ? <Loader2 size={13} className="animate-spin mb-0.5" /> : <Sun size={13} className="mb-0.5 text-amber-400" />}
                                <span className="leading-tight">OCTANE RENDER</span>
                                <span className="text-[7px] text-slate-400 font-normal">Path Tracing C4D</span>
                            </button>

                            {/* 5. Unreal Engine */}
                            <button 
                                type="button"
                                onClick={() => handleSelectVision('unreal')}
                                className={`relative flex flex-col items-center justify-center p-2 sm:p-1.5 rounded-lg text-[8px] sm:text-[8px] font-black transition-all min-h-[52px] sm:min-h-[50px] active:scale-95 text-center ${
                                    selectedVision === 'unreal'
                                        ? 'ring-2 ring-blue-400 bg-blue-950/80 border border-blue-400 text-white shadow-[0_0_12px_rgba(96,165,250,0.35)] scale-[1.02]'
                                        : 'bg-slate-950/70 border border-slate-800 hover:border-blue-500/50 text-blue-300 hover:bg-slate-800/80'
                                }`}
                                title="Selecionar Visão de Iluminação Global Lumen e Nanite (Unreal Engine 5.5)"
                            >
                                {selectedVision === 'unreal' && <span className="absolute top-1 right-1 text-[7px] bg-blue-500 text-white font-black px-1 rounded-full">✓</span>}
                                {isGeneratingUnreal ? <Loader2 size={13} className="animate-spin mb-0.5" /> : <Boxes size={13} className="mb-0.5 text-blue-400" />}
                                <span className="leading-tight">UNREAL ENGINE</span>
                                <span className="text-[7px] text-slate-400 font-normal">UE 5.5 / Lumen</span>
                            </button>

                            {/* 6. V-Ray 6 */}
                            <button 
                                type="button"
                                onClick={() => handleSelectVision('vray')}
                                className={`relative flex flex-col items-center justify-center p-2 sm:p-1.5 rounded-lg text-[8px] sm:text-[8px] font-black transition-all min-h-[52px] sm:min-h-[50px] active:scale-95 text-center ${
                                    selectedVision === 'vray'
                                        ? 'ring-2 ring-emerald-400 bg-emerald-950/80 border border-emerald-400 text-white shadow-[0_0_12px_rgba(52,211,153,0.35)] scale-[1.02]'
                                        : 'bg-slate-950/70 border border-slate-800 hover:border-emerald-500/50 text-emerald-300 hover:bg-slate-800/80'
                                }`}
                                title="Selecionar Visão de Render Arquitetônico e Automotivo de Luxo (Chaos V-Ray 6)"
                            >
                                {selectedVision === 'vray' && <span className="absolute top-1 right-1 text-[7px] bg-emerald-500 text-white font-black px-1 rounded-full">✓</span>}
                                {isGeneratingVRay ? <Loader2 size={13} className="animate-spin mb-0.5" /> : <Building2 size={13} className="mb-0.5 text-emerald-400" />}
                                <span className="leading-tight">V-RAY 6</span>
                                <span className="text-[7px] text-slate-400 font-normal">ArchViz & Luxury</span>
                            </button>

                            {/* 7. Corona Render */}
                            <button 
                                type="button"
                                onClick={() => handleSelectVision('corona')}
                                className={`relative flex flex-col items-center justify-center p-2 sm:p-1.5 rounded-lg text-[8px] sm:text-[8px] font-black transition-all min-h-[52px] sm:min-h-[50px] active:scale-95 text-center ${
                                    selectedVision === 'corona'
                                        ? 'ring-2 ring-teal-400 bg-teal-950/80 border border-teal-400 text-white shadow-[0_0_12px_rgba(45,212,191,0.35)] scale-[1.02]'
                                        : 'bg-slate-950/70 border border-slate-800 hover:border-teal-500/50 text-teal-300 hover:bg-slate-800/80'
                                }`}
                                title="Selecionar Visão de Iluminação Escandinava e Materiais Orgânicos (Chaos Corona)"
                            >
                                {selectedVision === 'corona' && <span className="absolute top-1 right-1 text-[7px] bg-teal-500 text-slate-950 font-black px-1 rounded-full">✓</span>}
                                {isGeneratingCorona ? <Loader2 size={13} className="animate-spin mb-0.5" /> : <Feather size={13} className="mb-0.5 text-teal-400" />}
                                <span className="leading-tight">CORONA RENDER</span>
                                <span className="text-[7px] text-slate-400 font-normal">Nordic Serenity</span>
                            </button>

                            {/* 8. Blender Cycles */}
                            <button 
                                type="button"
                                onClick={() => handleSelectVision('cycles')}
                                className={`relative flex flex-col items-center justify-center p-2 sm:p-1.5 rounded-lg text-[8px] sm:text-[8px] font-black transition-all min-h-[52px] sm:min-h-[50px] active:scale-95 text-center ${
                                    selectedVision === 'cycles'
                                        ? 'ring-2 ring-orange-400 bg-orange-950/80 border border-orange-400 text-white shadow-[0_0_12px_rgba(251,146,60,0.35)] scale-[1.02]'
                                        : 'bg-slate-950/70 border border-slate-800 hover:border-orange-500/50 text-orange-300 hover:bg-slate-800/80'
                                }`}
                                title="Selecionar Visão de Ray Tracing Aberto e Shaders BSDF (Blender 4 Cycles X)"
                            >
                                {selectedVision === 'cycles' && <span className="absolute top-1 right-1 text-[7px] bg-orange-500 text-slate-950 font-black px-1 rounded-full">✓</span>}
                                {isGeneratingCycles ? <Loader2 size={13} className="animate-spin mb-0.5" /> : <Orbit size={13} className="mb-0.5 text-orange-400" />}
                                <span className="leading-tight">BLENDER CYCLES</span>
                                <span className="text-[7px] text-slate-400 font-normal">Cycles X / AgX</span>
                            </button>

                            {/* 9. Leonardo Phoenix */}
                            <button 
                                type="button"
                                onClick={() => handleSelectVision('leonardo')}
                                className={`relative flex flex-col items-center justify-center p-2 sm:p-1.5 rounded-lg text-[8px] sm:text-[8px] font-black transition-all min-h-[52px] sm:min-h-[50px] active:scale-95 text-center ${
                                    selectedVision === 'leonardo'
                                        ? 'ring-2 ring-yellow-400 bg-yellow-950/80 border border-yellow-400 text-white shadow-[0_0_12px_rgba(250,204,21,0.35)] scale-[1.02]'
                                        : 'bg-slate-950/70 border border-slate-800 hover:border-yellow-500/50 text-yellow-300 hover:bg-slate-800/80'
                                }`}
                                title="Selecionar Visão de Fotorealismo Cinematográfico (Leonardo.ai Phoenix / Kino)"
                            >
                                {selectedVision === 'leonardo' && <span className="absolute top-1 right-1 text-[7px] bg-yellow-500 text-slate-950 font-black px-1 rounded-full">✓</span>}
                                {isGeneratingLeonardo ? <Loader2 size={13} className="animate-spin mb-0.5" /> : <Sparkles size={13} className="mb-0.5 text-yellow-400" />}
                                <span className="leading-tight">LEONARDO PHOENIX</span>
                                <span className="text-[7px] text-slate-400 font-normal">Photoreal V2</span>
                            </button>

                            {/* 10. SD 3.5 Large */}
                            <button 
                                type="button"
                                onClick={() => handleSelectVision('sd')}
                                className={`relative flex flex-col items-center justify-center p-2 sm:p-1.5 rounded-lg text-[8px] sm:text-[8px] font-black transition-all min-h-[52px] sm:min-h-[50px] active:scale-95 text-center ${
                                    selectedVision === 'sd'
                                        ? 'ring-2 ring-violet-400 bg-violet-950/80 border border-violet-400 text-white shadow-[0_0_12px_rgba(167,139,250,0.35)] scale-[1.02]'
                                        : 'bg-slate-950/70 border border-slate-800 hover:border-violet-500/50 text-violet-300 hover:bg-slate-800/80'
                                }`}
                                title="Selecionar Visão de Difusão Latente ComfyUI (Stable Diffusion 3.5 Large)"
                            >
                                {selectedVision === 'sd' && <span className="absolute top-1 right-1 text-[7px] bg-violet-500 text-white font-black px-1 rounded-full">✓</span>}
                                {isGeneratingSD ? <Loader2 size={13} className="animate-spin mb-0.5" /> : <Cpu size={13} className="mb-0.5 text-violet-400" />}
                                <span className="leading-tight">SD 3.5 LARGE</span>
                                <span className="text-[7px] text-slate-400 font-normal">ComfyUI Latent</span>
                            </button>

                            {/* 11. Recraft v3 */}
                            <button 
                                type="button"
                                onClick={() => handleSelectVision('recraft')}
                                className={`relative flex flex-col items-center justify-center p-2 sm:p-1.5 rounded-lg text-[8px] sm:text-[8px] font-black transition-all min-h-[52px] sm:min-h-[50px] active:scale-95 text-center ${
                                    selectedVision === 'recraft'
                                        ? 'ring-2 ring-pink-400 bg-pink-950/80 border border-pink-400 text-white shadow-[0_0_12px_rgba(244,114,182,0.35)] scale-[1.02]'
                                        : 'bg-slate-950/70 border border-slate-800 hover:border-pink-500/50 text-pink-300 hover:bg-slate-800/80'
                                }`}
                                title="Selecionar Visão de Design Gráfico #1 e Ícones 3D (Recraft v3)"
                            >
                                {selectedVision === 'recraft' && <span className="absolute top-1 right-1 text-[7px] bg-pink-500 text-white font-black px-1 rounded-full">✓</span>}
                                {isGeneratingRecraft ? <Loader2 size={13} className="animate-spin mb-0.5" /> : <Gem size={13} className="mb-0.5 text-pink-400" />}
                                <span className="leading-tight">RECRAFT v3</span>
                                <span className="text-[7px] text-slate-400 font-normal">Design & 3D Icons</span>
                            </button>

                            {/* 12. Magnific AI */}
                            <button 
                                type="button"
                                onClick={() => handleSelectVision('magnific')}
                                className={`relative flex flex-col items-center justify-center p-2 sm:p-1.5 rounded-lg text-[8px] sm:text-[8px] font-black transition-all min-h-[52px] sm:min-h-[50px] active:scale-95 text-center ${
                                    selectedVision === 'magnific'
                                        ? 'ring-2 ring-sky-400 bg-sky-950/80 border border-sky-400 text-white shadow-[0_0_12px_rgba(56,189,248,0.35)] scale-[1.02]'
                                        : 'bg-slate-950/70 border border-slate-800 hover:border-sky-500/50 text-sky-300 hover:bg-slate-800/80'
                                }`}
                                title="Selecionar Visão de Micro-Texturas e Alucinação Neural 16K (Magnific AI / Krea)"
                            >
                                {selectedVision === 'magnific' && <span className="absolute top-1 right-1 text-[7px] bg-sky-500 text-slate-950 font-black px-1 rounded-full">✓</span>}
                                {isGeneratingMagnific ? <Loader2 size={13} className="animate-spin mb-0.5" /> : <Wand size={13} className="mb-0.5 text-sky-400" />}
                                <span className="leading-tight">MAGNIFIC 16K</span>
                                <span className="text-[7px] text-slate-400 font-normal">Micro-Texturas AI</span>
                            </button>

                            {/* 13. Ideogram 2.0 (Span across bottom) */}
                            <button 
                                type="button"
                                onClick={() => handleSelectVision('ideogram')}
                                className={`relative flex flex-col items-center justify-center p-2 sm:p-1.5 rounded-lg text-[8px] sm:text-[8px] font-black transition-all min-h-[52px] sm:min-h-[50px] active:scale-95 text-center col-span-2 sm:col-span-4 ${
                                    selectedVision === 'ideogram'
                                        ? 'ring-2 ring-fuchsia-400 bg-fuchsia-950/80 border border-fuchsia-400 text-white shadow-[0_0_12px_rgba(232,121,249,0.35)] scale-[1.02]'
                                        : 'bg-slate-950/70 border border-slate-800 hover:border-fuchsia-500/50 text-fuchsia-300 hover:bg-slate-800/80'
                                }`}
                                title="Selecionar Visão de Tipografia e Design Gráfico (Ideogram 2.0)"
                            >
                                {selectedVision === 'ideogram' && <span className="absolute top-1 right-1 text-[7px] bg-fuchsia-500 text-white font-black px-1 rounded-full">✓</span>}
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
                                type="button"
                                onClick={() => handleSelectVision('google_vision')}
                                className={`relative flex flex-col items-center justify-center p-2 sm:p-1.5 rounded-lg text-[8px] sm:text-[8px] font-black transition-all min-h-[50px] sm:min-h-[48px] active:scale-95 text-center ${
                                    selectedVision === 'google_vision'
                                        ? 'ring-2 ring-orange-400 bg-orange-950/80 border border-orange-400 text-white shadow-[0_0_12px_rgba(251,146,60,0.35)] scale-[1.02]'
                                        : 'bg-slate-950/70 border border-slate-800 hover:border-orange-500/50 text-orange-300 hover:bg-slate-800/80'
                                }`}
                                title="Selecionar Visão Técnica do Google Cloud Vision (Features & Labels)"
                            >
                                {selectedVision === 'google_vision' && <span className="absolute top-1 right-1 text-[7px] bg-orange-500 text-slate-950 font-black px-1 rounded-full">✓</span>}
                                {isGeneratingGoogleVision ? <Loader2 size={13} className="animate-spin mb-0.5" /> : <Eye size={13} className="mb-0.5 text-orange-400" />}
                                <span className="leading-tight">GOOGLE VISION</span>
                                <span className="text-[7px] text-slate-400 font-normal">Features/Labels</span>
                            </button>

                            <button 
                                type="button"
                                onClick={() => handleSelectVision('whisk')}
                                className={`relative flex flex-col items-center justify-center p-2 sm:p-1.5 rounded-lg text-[8px] sm:text-[8px] font-black transition-all min-h-[50px] sm:min-h-[48px] active:scale-95 text-center ${
                                    selectedVision === 'whisk'
                                        ? 'ring-2 ring-yellow-400 bg-yellow-950/80 border border-yellow-400 text-white shadow-[0_0_12px_rgba(250,204,21,0.35)] scale-[1.02]'
                                        : 'bg-slate-950/70 border border-slate-800 hover:border-yellow-500/50 text-yellow-300 hover:bg-slate-800/80'
                                }`}
                                title="Selecionar Visão Artística Whisk AI"
                            >
                                {selectedVision === 'whisk' && <span className="absolute top-1 right-1 text-[7px] bg-yellow-500 text-slate-950 font-black px-1 rounded-full">✓</span>}
                                {isGeneratingWhisk ? <Loader2 size={13} className="animate-spin mb-0.5" /> : <Wand2 size={13} className="mb-0.5 text-yellow-400" />}
                                <span className="leading-tight">WHISK AI</span>
                                <span className="text-[7px] text-slate-400 font-normal">Estilo Artístico</span>
                            </button>

                            <button 
                                type="button"
                                onClick={() => handleSelectVision('huggingface')}
                                className={`relative flex flex-col items-center justify-center p-2 sm:p-1.5 rounded-lg text-[8px] sm:text-[8px] font-black transition-all min-h-[50px] sm:min-h-[48px] active:scale-95 text-center ${
                                    selectedVision === 'huggingface'
                                        ? 'ring-2 ring-lime-400 bg-lime-950/80 border border-lime-400 text-white shadow-[0_0_12px_rgba(163,230,53,0.35)] scale-[1.02]'
                                        : 'bg-slate-950/70 border border-slate-800 hover:border-lime-500/50 text-lime-300 hover:bg-slate-800/80'
                                }`}
                                title="Selecionar Visão Open-Source Hugging Face (BLIP-2 / Florence)"
                            >
                                {selectedVision === 'huggingface' && <span className="absolute top-1 right-1 text-[7px] bg-lime-500 text-slate-950 font-black px-1 rounded-full">✓</span>}
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

                <div className="space-y-1.5 pt-1">
                    <button 
                        type="button"
                        onClick={onGenerate} 
                        disabled={isAnyVisionGenerating}
                        className={`w-full py-3.5 rounded-lg font-black text-xs shadow-xl transition-all flex items-center justify-center gap-2 active:scale-95 uppercase tracking-widest disabled:opacity-50 ${
                            selectedVision !== 'none'
                                ? 'bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white shadow-violet-500/25 ring-2 ring-violet-400/50'
                                : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-blue-500/20'
                        }`}
                        title={selectedVision !== 'none' ? `Gerar prompt analisando a imagem com ${activeVisionName}` : "Compilar prompt profissional com os parâmetros configurados"}
                    >
                        {isCurrentVisionLoading ? (
                            <>
                                <Loader2 size={16} className="animate-spin text-white" />
                                <span>Compilando com {activeVisionName}...</span>
                            </>
                        ) : selectedVision !== 'none' ? (
                            <>
                                <Zap size={16} className="text-yellow-300 animate-pulse" />
                                <span>Compilar Prompt com {activeVisionName}</span>
                            </>
                        ) : (
                            <>
                                <Zap size={16} />
                                <span>Compilar Prompt Profissional</span>
                            </>
                        )}
                    </button>

                    {selectedVision !== 'none' && (
                        <div className="flex items-center justify-between px-1 text-[10px] text-violet-300">
                            <span className="flex items-center gap-1.5 font-medium">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                                <span>Modo de Visão: <strong className="text-white font-bold">{activeVisionName}</strong></span>
                            </span>
                            <button
                                type="button"
                                onClick={() => handleSelectVision('none')}
                                className="text-[9px] text-slate-400 hover:text-rose-300 underline cursor-pointer transition-colors"
                                title="Voltar ao modo compilador padrão sem IA Vision"
                            >
                                Voltar ao Padrão
                            </button>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
};
