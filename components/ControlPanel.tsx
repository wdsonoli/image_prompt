
import React from 'react';
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
    Wind, Layers, Boxes, Target, Image as ImageIcon
} from 'lucide-react';
import { Tooltip } from './Tooltip';

interface ControlPanelProps {
    settings: PromptSettings;
    onSettingsChange: (settings: PromptSettings) => void;
    onGenerate: () => void;
    onAnalyzeGemini: () => void;
    onAnalyzeTF: () => void;
    onAnalyzeOpenAI: () => void;
    onAnalyzeDeepseek: () => void;
    onAnalyzeGoogleVision: () => void;
    onAnalyzeWhisk: () => void;
    onAnalyzeImageFX: () => void;
    onOpenSettings: () => void;
    isGeneratingGemini: boolean;
    isGeneratingTF: boolean;
    isGeneratingOpenAI: boolean;
    isGeneratingDeepseek: boolean;
    isGeneratingGoogleVision: boolean;
    isGeneratingWhisk: boolean;
    isGeneratingImageFX: boolean;
    hasImage: boolean;
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
    onAnalyzeTF,
    onAnalyzeOpenAI,
    onAnalyzeDeepseek,
    onAnalyzeGoogleVision,
    onAnalyzeWhisk,
    onAnalyzeImageFX,
    onOpenSettings,
    isGeneratingGemini,
    isGeneratingTF,
    isGeneratingOpenAI,
    isGeneratingDeepseek,
    isGeneratingGoogleVision,
    isGeneratingWhisk,
    isGeneratingImageFX,
    hasImage
}) => {
    
    const handleChange = (key: keyof PromptSettings, value: any) => {
        onSettingsChange({ ...settings, [key]: value });
    };

    const handleQuickMode = (modeType: 'general' | 'mockup' | 'selo3d' | 'keepcolor') => {
        switch(modeType) {
            case 'general':
                onSettingsChange({ ...settings, mode: 'general', is3dLogo: false, keepColors: true, style: 'photorealistic' });
                break;
            case 'mockup':
                onSettingsChange({ ...settings, mode: 'mockup', is3dLogo: false, keepColors: false, style: 'blank' });
                break;
            case 'selo3d':
                onSettingsChange({ ...settings, mode: 'general', is3dLogo: true, keepColors: true, style: '3d_render' });
                break;
            case 'keepcolor':
                onSettingsChange({ ...settings, mode: 'mockup', is3dLogo: false, keepColors: true, style: 'blank' });
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
    const isMockupColor = settings.mode === 'mockup' && settings.keepColors;
    const isMockupPlain = settings.mode === 'mockup' && !settings.keepColors;
    const isSeloActive = settings.is3dLogo;
    const isGeneralActive = settings.mode === 'general' && !settings.is3dLogo;

    return (
        <div className="bg-slate-800/90 rounded-xl p-5 border border-slate-700 backdrop-blur-md h-full flex flex-col relative shadow-2xl">
            <button 
                onClick={onOpenSettings} 
                className="absolute top-5 right-5 text-slate-500 hover:text-blue-400 transition-colors p-1"
                title="Configurações de API"
            >
                <Cog size={18} />
            </button>

            <h2 className="text-lg font-bold text-blue-400 mb-4 flex items-center gap-2">
                <Settings size={18} />
                <span>Arquiteto de Prompt</span>
            </h2>

            <div className="space-y-5 flex-1 overflow-y-auto pr-2 custom-scrollbar">
                
                {/* Hub de Modos Unificado */}
                <div className="space-y-2">
                    <div className="flex items-center gap-2 text-slate-400 font-bold text-[9px] uppercase tracking-widest">
                        <Target size={12} className="text-blue-400"/>
                        <span>Configuração de Saída</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                        <button 
                            onClick={() => handleQuickMode('general')}
                            className={`flex flex-col items-center gap-1.5 py-3 rounded-xl border-2 transition-all group ${isGeneralActive ? 'bg-blue-600/20 border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.3)]' : 'bg-slate-900/50 border-slate-700 hover:border-slate-500'}`}
                        >
                            <ImageIcon size={20} className={isGeneralActive ? 'text-blue-400' : 'text-slate-500 group-hover:text-slate-300'} />
                            <span className={`text-[10px] font-black uppercase ${isGeneralActive ? 'text-white' : 'text-slate-500'}`}>Geral</span>
                        </button>
                        
                        <button 
                            onClick={() => handleQuickMode('mockup')}
                            className={`flex flex-col items-center gap-1.5 py-3 rounded-xl border-2 transition-all group ${isMockupPlain ? 'bg-slate-100/10 border-slate-300 shadow-[0_0_15px_rgba(255,255,255,0.1)]' : 'bg-slate-900/50 border-slate-700 hover:border-slate-500'}`}
                        >
                            <Box size={20} className={isMockupPlain ? 'text-white' : 'text-slate-500 group-hover:text-slate-300'} />
                            <span className={`text-[10px] font-black uppercase ${isMockupPlain ? 'text-white' : 'text-slate-500'}`}>Mockup Clay</span>
                        </button>

                        <button 
                            onClick={() => handleQuickMode('selo3d')}
                            className={`flex flex-col items-center gap-1.5 py-3 rounded-xl border-2 transition-all group ${isSeloActive ? 'bg-amber-600/20 border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.3)]' : 'bg-slate-900/50 border-slate-700 hover:border-slate-500'}`}
                        >
                            <Boxes size={20} className={isSeloActive ? 'text-amber-400' : 'text-slate-500 group-hover:text-slate-300'} />
                            <span className={`text-[10px] font-black uppercase ${isSeloActive ? 'text-white' : 'text-slate-500'}`}>Selo 3D</span>
                        </button>

                        <button 
                            onClick={() => handleQuickMode('keepcolor')}
                            className={`flex flex-col items-center gap-1.5 py-3 rounded-xl border-2 transition-all group ${isMockupColor ? 'bg-pink-600/20 border-pink-500 shadow-[0_0_15px_rgba(236,72,153,0.3)]' : 'bg-slate-900/50 border-slate-700 hover:border-slate-500'}`}
                        >
                            <Palette size={20} className={isMockupColor ? 'text-pink-400' : 'text-slate-500 group-hover:text-slate-300'} />
                            <span className={`text-[10px] font-black uppercase ${isMockupColor ? 'text-white' : 'text-slate-500'}`}>Manter Cor</span>
                        </button>
                    </div>
                </div>

                {/* Reconhecimento IA */}
                <div className="space-y-2">
                    <div className="flex items-center gap-2 text-slate-400 font-bold text-[9px] uppercase tracking-widest">
                        <Sparkles size={12} className="text-violet-400"/>
                        <span>Visão Inteligente</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                        <button 
                            disabled={!hasImage || isGeneratingGoogleVision}
                            onClick={onAnalyzeGoogleVision}
                            className="flex items-center justify-center gap-2 py-2 bg-gradient-to-br from-orange-600/30 to-orange-900/40 border border-orange-500/40 rounded-lg text-[9px] font-black text-orange-200 hover:border-orange-400 transition-all disabled:opacity-50"
                        >
                            {isGeneratingGoogleVision ? <Loader2 size={14} className="animate-spin" /> : <Eye size={14} />}
                            GOOGLE VISION
                        </button>
                        <button 
                            disabled={!hasImage || isGeneratingWhisk}
                            onClick={onAnalyzeWhisk}
                            className="flex items-center justify-center gap-2 py-2 bg-slate-900 border border-slate-700 rounded-lg text-[9px] font-black text-yellow-300 hover:border-yellow-500 transition-all disabled:opacity-50"
                        >
                            {isGeneratingWhisk ? <Loader2 size={14} className="animate-spin" /> : <Wand2 size={14} />}
                            WHISK AI
                        </button>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                        {[
                            { id: 'gemini', label: 'GEMINI 3.0', icon: Bot, action: onAnalyzeGemini, loading: isGeneratingGemini, color: 'text-violet-300' },
                            { id: 'openai', label: 'GPT-4O', icon: Globe, action: onAnalyzeOpenAI, loading: isGeneratingOpenAI, color: 'text-emerald-300' },
                            { id: 'deepseek', label: 'DEEPSEEK', icon: Brain, action: onAnalyzeDeepseek, loading: isGeneratingDeepseek, color: 'text-blue-300' }
                        ].map(ai => (
                            <button 
                                key={ai.id}
                                disabled={!hasImage || ai.loading}
                                onClick={ai.action}
                                className={`flex flex-col items-center gap-1 py-1.5 bg-slate-900/50 border border-slate-700 rounded-md text-[8px] font-black ${ai.color} hover:bg-slate-700 transition-all disabled:opacity-50`}
                            >
                                {ai.loading ? <Loader2 size={12} className="animate-spin" /> : <ai.icon size={12} />}
                                {ai.label}
                            </button>
                        ))}
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
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                         <div className="flex items-center gap-2 text-slate-400 font-bold text-[9px] uppercase tracking-widest">
                            <Sun size={12} className="text-orange-400"/>
                            <span>Luz</span>
                        </div>
                        <div className="grid grid-cols-5 gap-1">
                            {LIGHTING_OPTIONS.map(light => (
                                <Tooltip key={light.id} content={light.label} position="top">
                                    <button
                                        onClick={() => handleChange('lighting', light.id)}
                                        className={`p-1.5 rounded-md border flex items-center justify-center transition-all ${settings.lighting === light.id ? 'bg-orange-600/20 border-orange-500 text-orange-400' : 'bg-slate-900/50 border-slate-700 text-slate-500'}`}
                                    >
                                        <light.icon size={12} />
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
                        <div className="grid grid-cols-5 gap-1">
                            {CAMERA_ANGLES.map(angle => (
                                <Tooltip key={angle.id} content={angle.label} position="top">
                                    <button
                                        onClick={() => handleChange('cameraAngle', angle.id)}
                                        className={`p-1.5 rounded-md border flex items-center justify-center transition-all ${settings.cameraAngle === angle.id ? 'bg-violet-600/20 border-violet-500 text-violet-400' : 'bg-slate-900/50 border-slate-700 text-slate-500'}`}
                                    >
                                        <angle.icon size={12} />
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
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-[9px] font-bold text-slate-500 uppercase flex items-center gap-1">
                            <Maximize size={10} /> Proporção
                        </label>
                        <div className="grid grid-cols-5 gap-1">
                            {ASPECT_RATIOS.map(ratio => (
                                <Tooltip key={ratio.id} content={ratio.label} position="top">
                                    <button
                                        onClick={() => handleChange('aspectRatio', ratio.id)}
                                        className={`p-1.5 rounded-md border flex items-center justify-center transition-all ${settings.aspectRatio === ratio.id ? 'bg-blue-600/20 border-blue-500 text-blue-400' : 'bg-slate-900/50 border-slate-700 text-slate-500'}`}
                                    >
                                        <ratio.icon size={12} />
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
                            className="w-full bg-slate-900 border border-slate-700 rounded-md px-1.5 py-1 text-[10px] text-slate-300 font-bold outline-none h-8 focus:border-blue-500 transition-all"
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

            <div className="pt-4 mt-auto">
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
