
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
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-800/50">
                    <h3 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
                        <Key size={18} className="text-blue-400" />
                        Configurações de APIs de Visão
                    </h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
                        <X size={20} />
                    </button>
                </div>
                
                <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto custom-scrollbar">
                    <div className="bg-blue-900/20 border border-blue-900/50 rounded-lg p-3.5 flex gap-3">
                        <ShieldCheck size={22} className="text-blue-400 shrink-0 mt-0.5" />
                        <div className="text-xs text-blue-200/90 leading-relaxed">
                            Suas chaves são salvas apenas localmente no seu navegador. Os modelos Gemini, Google Vision, Whisk, Midjourney Describe e Flux.1 utilizam a infraestrutura nativa integrada.
                        </div>
                    </div>

                    {/* OpenAI Section */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-300 flex items-center gap-2">
                            <Bot size={14} className="text-emerald-400"/> OpenAI API Key (GPT-4o Vision)
                        </label>
                        <input 
                            type="password" 
                            value={openAIKey}
                            onChange={(e) => setOpenAIKey(e.target.value)}
                            placeholder="sk-..."
                            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3.5 py-2 text-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none font-mono text-xs"
                        />
                    </div>

                    {/* Deepseek Section */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-300 flex items-center gap-2">
                            <Brain size={14} className="text-blue-400"/> DeepSeek API Key (DeepSeek-VL)
                        </label>
                        <input 
                            type="password" 
                            value={deepseekKey}
                            onChange={(e) => setDeepseekKey(e.target.value)}
                            placeholder="ds-..."
                            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3.5 py-2 text-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none font-mono text-xs"
                        />
                    </div>

                    {/* Anthropic Section */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-300 flex items-center gap-2">
                            <Sparkles size={14} className="text-amber-400"/> Anthropic Claude API Key (Claude 3.7 Vision)
                        </label>
                        <input 
                            type="password" 
                            value={anthropicKey}
                            onChange={(e) => setAnthropicKey(e.target.value)}
                            placeholder="sk-ant-... (Opcional - usa adaptador se vazio)"
                            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3.5 py-2 text-slate-200 focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none font-mono text-xs"
                        />
                    </div>

                    {/* Hugging Face Section */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-300 flex items-center gap-2">
                            <Cpu size={14} className="text-yellow-400"/> Hugging Face Token (BLIP-2 / Florence)
                        </label>
                        <input 
                            type="password" 
                            value={hfToken}
                            onChange={(e) => setHfToken(e.target.value)}
                            placeholder="hf_... (Opcional)"
                            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3.5 py-2 text-slate-200 focus:ring-2 focus:ring-yellow-500 focus:border-transparent outline-none font-mono text-xs"
                        />
                    </div>
                </div>

                <div className="px-6 py-4 bg-slate-800/50 border-t border-slate-800 flex justify-end gap-3">
                    <button 
                        onClick={onClose}
                        className="px-4 py-2 rounded-lg text-slate-300 hover:bg-slate-800 transition-colors text-xs font-medium"
                    >
                        Cancelar
                    </button>
                    <button 
                        onClick={handleSave}
                        className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs transition-colors shadow-lg shadow-blue-500/20"
                    >
                        Salvar Configurações
                    </button>
                </div>
            </div>
        </div>
    );
};
