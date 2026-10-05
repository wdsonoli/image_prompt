import React, { useState, useEffect } from 'react';
import { 
    X, Key, ShieldCheck, Bot, Brain, Sparkles, Cpu, 
    Palette, Camera, Boxes, Paintbrush, Box, Compass, Check, Settings 
} from 'lucide-react';

interface ApiSettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (openAIKey: string, deepseekKey: string, anthropicKey?: string, hfToken?: string, defaultStyle?: string) => void;
    initialOpenAIKey: string;
    initialDeepseekKey: string;
    initialAnthropicKey?: string;
    initialHfToken?: string;
    initialDefaultStyle?: string;
}

const ALL_STYLES_LIST: { id: string; name: string; category: string }[] = [
    { id: 'photorealistic', name: 'Fotorealista (8K Ultra Detalhado)', category: 'Realismo' },
    { id: '3d_render', name: '3D Render / CGI (Octane / UE5)', category: '3D & CGI' },
    { id: 'digital_art', name: 'Ilustrativo / Arte Digital', category: 'Arte' },
    { id: 'blank', name: 'Mockup Clay (Minimalista Limpo)', category: 'Design' },
    { id: 'disney_pixar', name: 'Disney Pixar 3D (Animação)', category: '3D & CGI' },
    { id: 'ghibli', name: 'Studio Ghibli (Aquarela Anime)', category: 'Anime & Manga' },
    { id: 'anime', name: 'Anime / Mangá Moderno', category: 'Anime & Manga' },
    { id: 'cartoon', name: 'Cartoon 2D (Animação Clássica)', category: 'Ilustração' },
    { id: 'watercolor', name: 'Aquarela Artística', category: 'Pintura' },
    { id: 'oil_painting', name: 'Pintura a Óleo Clássica', category: 'Pintura' },
    { id: 'claymation', name: 'Claymation (Massinha Stop-Motion)', category: '3D & CGI' },
    { id: 'cyberpunk', name: 'Cyberpunk Neon Futurista', category: 'Ficção & Temas' },
    { id: 'minimalist', name: 'Minimalista Moderno', category: 'Design' },
    { id: 'line_art', name: 'Line Art (Traço Vetorial Nítido)', category: 'Ilustração' },
    { id: 'isometric', name: 'Isométrico 3D (Diorama)', category: '3D & CGI' },
    { id: 'architectural', name: 'Fotografia Arquitetônica', category: 'Realismo' },
    { id: 'editorial', name: 'Editorial de Alta Moda Vogue', category: 'Realismo' },
    { id: 'pop_art', name: 'Pop Art (Andy Warhol)', category: 'Arte' },
    { id: 'steampunk', name: 'Steampunk Vitoriano', category: 'Ficção & Temas' },
    { id: 'synthwave', name: 'Synthwave / Retrô 80s', category: 'Ficção & Temas' },
    { id: 'pencil_sketch', name: 'Esboço a Lápis / Grafite', category: 'Ilustração' },
    { id: 'charcoal_drawing', name: 'Desenho a Carvão', category: 'Ilustração' },
    { id: 'crochet', name: 'Crochê / Amigurumi', category: 'Texturas & Artesanato' },
    { id: 'origami', name: 'Origami / Dobradura de Papel', category: 'Texturas & Artesanato' },
    { id: 'paper_cutout', name: 'Paper Cutout (Papel em Camadas)', category: 'Texturas & Artesanato' },
    { id: 'stained_glass', name: 'Vitral Colorido Mosaico', category: 'Arte' },
    { id: 'holographic', name: 'Holográfico & Furta-Cor', category: 'Ficção & Temas' },
    { id: 'noir', name: 'Film Noir Preto e Branco', category: 'Cinematográfico' },
    { id: 'vintage', name: 'Fotografia Vintage / Polaroid', category: 'Cinematográfico' },
    { id: 'surrealism', name: 'Surrealismo (Salvador Dalí)', category: 'Arte' },
    { id: 'impressionism', name: 'Impressionismo (Monet)', category: 'Pintura' },
    { id: 'baroque', name: 'Barroco (Caravaggio Chiaroscuro)', category: 'Pintura' },
    { id: 'low_poly', name: 'Low Poly 3D Geométrico', category: '3D & CGI' },
    { id: 'pixel_art', name: 'Pixel Art 16-Bit Retrô', category: 'Retro' },
    { id: 'sticker', name: 'Adesivo / Sticker Vinil', category: 'Design' },
    { id: 'blueprint', name: 'Blueprint / Planta Técnica', category: 'Design' },
    { id: 'graffiti', name: 'Graffiti / Street Art Urbana', category: 'Arte' },
    { id: 'double_exposure', name: 'Dupla Exposição Fotográfica', category: 'Cinematográfico' },
    { id: 'art_nouveau', name: 'Art Nouveau (Mucha)', category: 'Arte' },
];

export const ApiSettingsModal: React.FC<ApiSettingsModalProps> = ({ 
    isOpen, 
    onClose, 
    onSave, 
    initialOpenAIKey,
    initialDeepseekKey,
    initialAnthropicKey = '',
    initialHfToken = '',
    initialDefaultStyle = 'photorealistic'
}) => {
    const [openAIKey, setOpenAIKey] = useState(initialOpenAIKey);
    const [deepseekKey, setDeepseekKey] = useState(initialDeepseekKey);
    const [anthropicKey, setAnthropicKey] = useState(initialAnthropicKey);
    const [hfToken, setHfToken] = useState(initialHfToken);
    const [defaultStyle, setDefaultStyle] = useState(initialDefaultStyle || 'photorealistic');

    useEffect(() => {
        setOpenAIKey(initialOpenAIKey);
        setDeepseekKey(initialDeepseekKey);
        setAnthropicKey(initialAnthropicKey || '');
        setHfToken(initialHfToken || '');
        setDefaultStyle(initialDefaultStyle || 'photorealistic');
    }, [initialOpenAIKey, initialDeepseekKey, initialAnthropicKey, initialHfToken, initialDefaultStyle, isOpen]);

    if (!isOpen) return null;

    const handleSave = () => {
        onSave(openAIKey, deepseekKey, anthropicKey, hfToken, defaultStyle);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-slate-800 bg-slate-800/40 shrink-0">
                    <div className="flex items-center gap-2.5">
                        <div className="p-2 rounded-lg bg-blue-500/20 text-blue-400 border border-blue-500/30">
                            <Settings size={18} />
                        </div>
                        <div>
                            <h3 className="text-base sm:text-lg font-bold text-slate-100 leading-tight">
                                Configurações Globais
                            </h3>
                            <p className="text-[11px] text-slate-400">
                                Estilo padrão da imagem e chaves de IA opcionais
                            </p>
                        </div>
                    </div>
                    <button 
                        onClick={onClose} 
                        className="text-slate-400 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-slate-800 min-h-[36px] min-w-[36px] flex items-center justify-center cursor-pointer"
                        title="Fechar"
                    >
                        <X size={20} />
                    </button>
                </div>
                
                {/* Body */}
                <div className="p-4 sm:p-6 space-y-5 overflow-y-auto custom-scrollbar flex-1">
                    
                    {/* SEÇÃO 1: ESTILO PADRÃO AO CARREGAR NOVA IMAGEM */}
                    <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800/90 space-y-3.5 shadow-inner">
                        <div className="flex items-center justify-between">
                            <label className="text-xs font-bold text-slate-200 flex items-center gap-2">
                                <Palette size={16} className="text-pink-400" />
                                <span>Estilo Padrão da Imagem</span>
                            </label>
                            <span className="text-[9px] font-black text-pink-300 bg-pink-500/10 px-2 py-0.5 rounded-full border border-pink-500/30 uppercase tracking-wider">
                                Auto-Aplicado
                            </span>
                        </div>
                        
                        <p className="text-[11px] text-slate-400 leading-relaxed">
                            Defina qual estilo visual será <strong>aplicado automaticamente ao painel</strong> a cada nova imagem enviada (upload, arrastar ou colar link).
                        </p>

                        {/* Grade com atalhos visuais dos estilos mais solicitados */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                            {[
                                { id: 'photorealistic', label: 'Fotorealista', sub: '8K / Realismo', icon: Camera, borderActive: 'border-cyan-500 text-cyan-300 bg-cyan-950/30 ring-1 ring-cyan-500/40' },
                                { id: '3d_render', label: '3D Render', sub: 'CGI / Octane', icon: Boxes, borderActive: 'border-amber-500 text-amber-300 bg-amber-950/30 ring-1 ring-amber-500/40' },
                                { id: 'digital_art', label: 'Ilustrativo', sub: 'Arte Digital', icon: Paintbrush, borderActive: 'border-pink-500 text-pink-300 bg-pink-950/30 ring-1 ring-pink-500/40' },
                                { id: 'blank', label: 'Mockup Clay', sub: 'Fundo Neutro', icon: Box, borderActive: 'border-slate-300 text-white bg-slate-800/50 ring-1 ring-slate-400' },
                                { id: 'disney_pixar', label: 'Disney Pixar', sub: 'Animação 3D', icon: Sparkles, borderActive: 'border-violet-500 text-violet-300 bg-violet-950/30 ring-1 ring-violet-500/40' },
                                { id: 'anime', label: 'Anime / Manga', sub: 'Japonesa', icon: Compass, borderActive: 'border-emerald-500 text-emerald-300 bg-emerald-950/30 ring-1 ring-emerald-500/40' },
                            ].map((item) => {
                                const isSelected = defaultStyle === item.id;
                                return (
                                    <button
                                        key={item.id}
                                        type="button"
                                        onClick={() => setDefaultStyle(item.id)}
                                        className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-center transition-all cursor-pointer relative ${
                                            isSelected 
                                                ? `${item.borderActive} font-bold shadow-md` 
                                                : 'border-slate-800/90 bg-slate-900/60 text-slate-400 hover:text-slate-200 hover:border-slate-700 hover:bg-slate-900'
                                        }`}
                                    >
                                        {isSelected && (
                                            <div className="absolute top-1.5 right-1.5 w-3.5 h-3.5 bg-blue-500 rounded-full flex items-center justify-center shadow-sm">
                                                <Check size={9} className="text-white stroke-[3]" />
                                            </div>
                                        )}
                                        <item.icon size={16} className={isSelected ? 'text-current mb-1' : 'text-slate-500 mb-1'} />
                                        <span className="text-[11px] font-bold leading-tight">{item.label}</span>
                                        <span className="text-[8.5px] opacity-75 font-normal leading-tight">{item.sub}</span>
                                    </button>
                                );
                            })}
                        </div>

                        {/* Seletor dropdown completo com todos os 40+ estilos */}
                        <div className="pt-1.5 space-y-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                                Ou selecione outro estilo do catálogo completo:
                            </label>
                            <div className="relative">
                                <select
                                    value={defaultStyle}
                                    onChange={(e) => setDefaultStyle(e.target.value)}
                                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2.5 text-xs text-slate-200 font-medium outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer appearance-none pr-8"
                                >
                                    {ALL_STYLES_LIST.map((style) => (
                                        <option key={style.id} value={style.id} className="bg-slate-900 text-slate-200">
                                            [{style.category}] {style.name}
                                        </option>
                                    ))}
                                </select>
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-xs">
                                    ▼
                                </div>
                            </div>
                        </div>

                        {/* Indicador de confirmação */}
                        <div className="text-[11px] text-emerald-300 bg-emerald-950/40 border border-emerald-500/30 px-3 py-2 rounded-lg flex items-center gap-2">
                            <Check size={14} className="text-emerald-400 shrink-0" />
                            <span>
                                Estilo padrão ativo: <strong className="text-white uppercase tracking-wide">{defaultStyle.replace(/_/g, ' ')}</strong>
                            </span>
                        </div>
                    </div>

                    {/* SEÇÃO 2: AVISO DE MOTORES NATIVOS GRATUITOS */}
                    <div className="bg-blue-900/20 border border-blue-900/50 rounded-xl p-3 sm:p-3.5 flex gap-2.5 sm:gap-3">
                        <ShieldCheck size={20} className="text-blue-400 shrink-0 mt-0.5" />
                        <div className="text-[11px] sm:text-xs text-blue-200/90 leading-relaxed">
                            Todos os motores de IA (Gemini, ChatGPT Grátis, DeepSeek R1 Grátis, Behance Designer, ArtStation 3D, Design Industrial, Google Vision, Whisk, Midjourney, Flux.1) possuem <strong className="text-white">motores nativos gratuitos integrados</strong>. A inserção de chaves abaixo é 100% opcional caso deseje usar sua própria conta privada.
                        </div>
                    </div>

                    {/* SEÇÃO 3: CHAVES DE API OPCIONAIS */}
                    <div className="space-y-3.5 pt-1">
                        <div className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                            <Key size={14} className="text-blue-400" />
                            <span>Chaves Privadas de API (Opcionais)</span>
                        </div>

                        {/* OpenAI Section */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                                <span className="flex items-center gap-2">
                                    <Bot size={14} className="text-emerald-400 shrink-0"/> <span>OpenAI API Key (GPT-4o Mini)</span>
                                </span>
                                <span className="text-[9px] text-emerald-400 font-bold bg-emerald-950/60 px-1.5 py-0.2 rounded border border-emerald-500/30">Livre / Opcional</span>
                            </label>
                            <input 
                                type="password" 
                                value={openAIKey}
                                onChange={(e) => setOpenAIKey(e.target.value)}
                                placeholder="sk-... (Opcional - opera 100% grátis sem chave)"
                                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 sm:px-3.5 py-2.5 text-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none font-mono text-xs min-h-[40px]"
                            />
                        </div>

                        {/* Deepseek Section */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                                <span className="flex items-center gap-2">
                                    <Brain size={14} className="text-blue-400 shrink-0"/> <span>DeepSeek API Key (DeepSeek-VL / R1)</span>
                                </span>
                                <span className="text-[9px] text-blue-400 font-bold bg-blue-950/60 px-1.5 py-0.2 rounded border border-blue-500/30">Livre / Opcional</span>
                            </label>
                            <input 
                                type="password" 
                                value={deepseekKey}
                                onChange={(e) => setDeepseekKey(e.target.value)}
                                placeholder="ds-... (Opcional - opera 100% grátis sem chave)"
                                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 sm:px-3.5 py-2.5 text-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none font-mono text-xs min-h-[40px]"
                            />
                        </div>

                        {/* Anthropic Section */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-slate-300 flex items-center gap-2">
                                <Sparkles size={14} className="text-amber-400 shrink-0"/> <span>Anthropic Claude API Key (Claude 3.7)</span>
                            </label>
                            <input 
                                type="password" 
                                value={anthropicKey}
                                onChange={(e) => setAnthropicKey(e.target.value)}
                                placeholder="sk-ant-... (Opcional - usa adaptador se vazio)"
                                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 sm:px-3.5 py-2.5 text-slate-200 focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none font-mono text-xs min-h-[40px]"
                            />
                        </div>

                        {/* Hugging Face Section */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-slate-300 flex items-center gap-2">
                                <Cpu size={14} className="text-yellow-400 shrink-0"/> <span>Hugging Face Token (BLIP-2 / Florence)</span>
                            </label>
                            <input 
                                type="password" 
                                value={hfToken}
                                onChange={(e) => setHfToken(e.target.value)}
                                placeholder="hf_... (Opcional)"
                                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 sm:px-3.5 py-2.5 text-slate-200 focus:ring-2 focus:ring-yellow-500 focus:border-transparent outline-none font-mono text-xs min-h-[40px]"
                            />
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="px-4 sm:px-6 py-3.5 sm:py-4 bg-slate-800/40 border-t border-slate-800 flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3 shrink-0">
                    <button 
                        onClick={onClose}
                        className="w-full sm:w-auto px-4 py-2.5 rounded-lg text-slate-300 hover:bg-slate-800 transition-colors text-xs font-semibold min-h-[40px] text-center cursor-pointer"
                    >
                        Cancelar
                    </button>
                    <button 
                        onClick={handleSave}
                        className="w-full sm:w-auto px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-all shadow-lg shadow-blue-500/25 min-h-[40px] text-center cursor-pointer active:scale-95"
                    >
                        Salvar Configurações
                    </button>
                </div>
            </div>
        </div>
    );
};
