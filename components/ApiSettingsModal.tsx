
import React, { useState, useEffect } from 'react';
import { X, Key, ShieldCheck, ExternalLink, Bot, Brain, Sparkles, Cpu } from 'lucide-react';

interface ApiSettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (openAIKey: string, deepseekKey: string, anthropicKey?: string, hfToken?: string) => void;
    initialOpenAIKey: string;
    initialDeepseekKey: string;
    initialAnthropicKey?: string;
    initialHfToken?: string;
}

export const ApiSettingsModal: React.FC<ApiSettingsModalProps> = ({ 
    isOpen, 
    onClose, 
    onSave, 
    initialOpenAIKey,
    initialDeepseekKey,
    initialAnthropicKey = '',
    initialHfToken = ''
}) => {
    const [openAIKey, setOpenAIKey] = useState(initialOpenAIKey);
    const [deepseekKey, setDeepseekKey] = useState(initialDeepseekKey);
    const [anthropicKey, setAnthropicKey] = useState(initialAnthropicKey);
    const [hfToken, setHfToken] = useState(initialHfToken);

    useEffect(() => {
        setOpenAIKey(initialOpenAIKey);
        setDeepseekKey(initialDeepseekKey);
        setAnthropicKey(initialAnthropicKey || '');
        setHfToken(initialHfToken || '');
    }, [initialOpenAIKey, initialDeepseekKey, initialAnthropicKey, initialHfToken, isOpen]);

    if (!isOpen) return null;

    const handleSave = () => {
        onSave(openAIKey, deepseekKey, anthropicKey, hfToken);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 sm:py-4 border-b border-slate-800 bg-slate-800/50">
                    <h3 className="text-base sm:text-lg font-semibold text-slate-100 flex items-center gap-2">
                        <Key size={18} className="text-blue-400" />
                        <span>Configurações de APIs</span>
                    </h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-slate-800 min-h-[36px] min-w-[36px] flex items-center justify-center">
                        <X size={20} />
                    </button>
                </div>
                
                <div className="p-4 sm:p-6 space-y-4 max-h-[75vh] overflow-y-auto custom-scrollbar">
                    <div className="bg-blue-900/20 border border-blue-900/50 rounded-lg p-3 sm:p-3.5 flex gap-2.5 sm:gap-3">
                        <ShieldCheck size={20} className="text-blue-400 shrink-0 mt-0.5" />
                        <div className="text-[11px] sm:text-xs text-blue-200/90 leading-relaxed">
                            Suas chaves são salvas apenas localmente no seu navegador. Os modelos Gemini, Google Vision, Whisk, Midjourney Describe e Flux.1 utilizam a infraestrutura nativa integrada.
                        </div>
                    </div>

                    {/* OpenAI Section */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-300 flex items-center gap-2">
                            <Bot size={14} className="text-emerald-400 shrink-0"/> <span>OpenAI API Key (GPT-4o Vision)</span>
                        </label>
                        <input 
                            type="password" 
                            value={openAIKey}
                            onChange={(e) => setOpenAIKey(e.target.value)}
                            placeholder="sk-..."
                            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 sm:px-3.5 py-2.5 text-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none font-mono text-xs min-h-[40px]"
                        />
                    </div>

                    {/* Deepseek Section */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-300 flex items-center gap-2">
                            <Brain size={14} className="text-blue-400 shrink-0"/> <span>DeepSeek API Key (DeepSeek-VL)</span>
                        </label>
                        <input 
                            type="password" 
                            value={deepseekKey}
                            onChange={(e) => setDeepseekKey(e.target.value)}
                            placeholder="ds-..."
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

                <div className="px-4 sm:px-6 py-3.5 sm:py-4 bg-slate-800/50 border-t border-slate-800 flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3">
                    <button 
                        onClick={onClose}
                        className="w-full sm:w-auto px-4 py-2.5 rounded-lg text-slate-300 hover:bg-slate-800 transition-colors text-xs font-medium min-h-[40px] text-center"
                    >
                        Cancelar
                    </button>
                    <button 
                        onClick={handleSave}
                        className="w-full sm:w-auto px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs transition-colors shadow-lg shadow-blue-500/20 min-h-[40px] text-center"
                    >
                        Salvar Configurações
                    </button>
                </div>
            </div>
        </div>
    );
};
