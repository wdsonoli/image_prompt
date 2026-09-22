
import React, { useState } from 'react';
import { Copy, Check, Terminal, Edit3, ImagePlus, Sparkles, ShieldCheck, ChevronDown, RefreshCw, X } from 'lucide-react';
import { ULTRA_PREMIUM_16K_PROMPT } from '../utils/visualEffectsData';

interface PromptDisplayProps {
    prompt: string;
    onUpdatePrompt: (newPrompt: string) => void;
    onCreateImage: () => void;
    isGeneratingImage: boolean;
    onOpenGemini3ProGenerator?: () => void;
}

export const PromptDisplay: React.FC<PromptDisplayProps> = ({ 
    prompt, 
    onUpdatePrompt, 
    onCreateImage, 
    isGeneratingImage,
    onOpenGemini3ProGenerator
}) => {
    const [copied, setCopied] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [localPrompt, setLocalPrompt] = useState(prompt);
    const [show16kMenu, setShow16kMenu] = useState(false);

    // Sync local state when prop changes
    React.useEffect(() => {
        setLocalPrompt(prompt);
    }, [prompt]);

    const is16kActive = localPrompt.includes('Ultra-Premium 16K Professional Remaster');

    const handleCopy = async () => {
        if (!localPrompt) return;
        try {
            await navigator.clipboard.writeText(localPrompt);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy', err);
        }
    };

    const handleSave = () => {
        onUpdatePrompt(localPrompt);
        setIsEditing(false);
    };

    // Aplicação direta do Ultra-Premium 16K Remaster
    const handleApply16kSolo = () => {
        onUpdatePrompt(ULTRA_PREMIUM_16K_PROMPT);
        setShow16kMenu(false);
    };

    const handleMerge16k = () => {
        if (!localPrompt || !localPrompt.trim()) {
            onUpdatePrompt(ULTRA_PREMIUM_16K_PROMPT);
        } else if (!is16kActive) {
            const combined = `${localPrompt.trim()}\n\n${ULTRA_PREMIUM_16K_PROMPT}`;
            onUpdatePrompt(combined);
        }
        setShow16kMenu(false);
    };

    const handleRemove16k = () => {
        if (!is16kActive) return;
        const cleaned = localPrompt
            .replace(ULTRA_PREMIUM_16K_PROMPT, '')
            .replace(/Ultra-Premium 16K Professional Remaster & Enhancement[\s\S]*?production-ready 16K master\./gi, '')
            .trim();
        onUpdatePrompt(cleaned);
        setShow16kMenu(false);
    };

    const handleToggle16k = () => {
        if (!localPrompt || !localPrompt.trim()) {
            handleApply16kSolo();
        } else if (is16kActive) {
            handleRemove16k();
        } else {
            // Se já tem prompt, mescla automaticamente ou abre o menu
            handleMerge16k();
        }
    };

    return (
        <div className="bg-slate-800 rounded-xl overflow-hidden border border-slate-700 shadow-xl flex flex-col h-full min-h-[300px]">
            {/* Header da Barra de Ferramentas */}
            <div className="bg-slate-900/80 px-4 py-3 border-b border-slate-700/80 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-slate-300 font-medium text-sm">
                    <Terminal size={18} className="text-blue-400" />
                    <span>Generated Prompt</span>
                </div>
                
                <div className="flex items-center gap-2 relative">
                    {/* BOTÃO ULTRA-PREMIUM 16K PROFESSIONAL REMASTER & ENHANCEMENT */}
                    <div className="relative">
                        <div className="flex items-center rounded-lg overflow-hidden border border-amber-500/40 shadow-[0_0_12px_rgba(245,158,11,0.2)] bg-gradient-to-r from-amber-500/10 via-yellow-500/10 to-stone-900">
                            <button
                                onClick={handleToggle16k}
                                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold transition-all ${
                                    is16kActive
                                        ? 'bg-amber-500 text-slate-950 hover:bg-amber-400 shadow-md font-extrabold'
                                        : 'text-amber-300 hover:text-white hover:bg-amber-500/20'
                                }`}
                                title="Ultra-Premium 16K Professional Remaster & Enhancement"
                            >
                                <Sparkles size={13} className={is16kActive ? 'text-slate-950 animate-pulse' : 'text-amber-400'} />
                                <span>{is16kActive ? '16K Remaster Ativo' : 'Ultra-Premium 16K'}</span>
                            </button>

                            <button
                                onClick={() => setShow16kMenu(!show16kMenu)}
                                className={`px-1.5 py-1.5 border-l border-amber-500/30 text-amber-300 hover:text-white transition-colors ${
                                    is16kActive ? 'bg-amber-600/50 hover:bg-amber-600/70 text-slate-950' : 'hover:bg-amber-500/20'
                                }`}
                                title="Opções do Remaster 16K"
                            >
                                <ChevronDown size={13} />
                            </button>
                        </div>

                        {/* Dropdown de opções do 16K Remaster */}
                        {show16kMenu && (
                            <div className="absolute right-0 top-full mt-2 w-72 p-2.5 rounded-xl bg-slate-900/95 border border-amber-500/40 shadow-2xl backdrop-blur-xl z-50 space-y-1.5 text-xs animate-in fade-in zoom-in-95 duration-150">
                                <div className="flex items-center justify-between px-1 pb-1 border-b border-slate-800 text-[11px] font-bold text-amber-400">
                                    <span className="flex items-center gap-1">
                                        <Sparkles size={12} /> Ultra-Premium 16K Remaster
                                    </span>
                                    <button onClick={() => setShow16kMenu(false)} className="text-slate-500 hover:text-white">
                                        <X size={12} />
                                    </button>
                                </div>
                                
                                <p className="px-1 text-[10px] text-slate-400 leading-relaxed">
                                    Preserva 100% dos traços faciais, iluminação e fundo original com super-resolução 16K fiel sem alucinações.
                                </p>

                                <button
                                    onClick={handleApply16kSolo}
                                    className="w-full text-left px-2.5 py-1.5 rounded-lg bg-slate-800/80 hover:bg-amber-500/20 hover:text-amber-300 text-slate-200 font-medium transition-all flex items-center justify-between"
                                >
                                    <span>Substituir pelo Prompt 16K</span>
                                    <span className="text-[9px] font-mono text-slate-500">Solo</span>
                                </button>

                                <button
                                    onClick={handleMerge16k}
                                    className="w-full text-left px-2.5 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 font-bold transition-all flex items-center justify-between border border-amber-500/30"
                                >
                                    <span>Mesclar ao Prompt Atual</span>
                                    <span className="text-[9px] font-mono text-amber-400">Recomendado</span>
                                </button>

                                {is16kActive && (
                                    <button
                                        onClick={handleRemove16k}
                                        className="w-full text-left px-2.5 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 font-medium transition-all flex items-center gap-1.5"
                                    >
                                        <X size={12} />
                                        <span>Remover Remaster 16K</span>
                                    </button>
                                )}
                            </div>
                        )}
                    </div>

                    <button 
                        onClick={() => setIsEditing(!isEditing)}
                        className={`p-1.5 rounded-lg transition-colors ${isEditing ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-blue-400 hover:bg-slate-700'}`}
                        title="Edit Prompt"
                    >
                        <Edit3 size={16} />
                    </button>
                    <button 
                        onClick={handleCopy}
                        disabled={!localPrompt}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-medium transition-colors disabled:opacity-50"
                    >
                        {copied ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
                        {copied ? 'Copied!' : 'Copy'}
                    </button>
                </div>
            </div>

            {/* Banner de status quando o 16K Remaster está ativo */}
            {is16kActive && (
                <div className="bg-gradient-to-r from-amber-950/70 via-stone-900 to-amber-950/70 border-b border-amber-500/30 px-4 py-2 flex items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-2 text-amber-200 font-medium">
                        <ShieldCheck size={15} className="text-amber-400 shrink-0" />
                        <span className="text-[11px] leading-tight">
                            <strong>Ultra-Premium 16K Remaster Ativo:</strong> Fidelidade total ao rosto, expressão, pele e fundo original com super-resolução 16K.
                        </span>
                    </div>
                    <button
                        onClick={handleRemove16k}
                        className="text-[10px] text-amber-300/80 hover:text-rose-300 hover:underline shrink-0"
                    >
                        Desativar
                    </button>
                </div>
            )}

            <div className="relative flex-1 p-0">
                {!localPrompt ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500 p-8 text-center">
                        <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mb-4 border border-slate-700">
                            <Terminal size={32} className="opacity-50" />
                        </div>
                        <p>Analysis complete. Generated prompt will appear here.</p>
                        <p className="text-xs mt-2 text-slate-600">Click "Generate" or "AI Enhanced" to start.</p>

                        {/* Acesso rápido 16K Remaster no estado vazio */}
                        <div className="mt-5">
                            <button
                                onClick={handleApply16kSolo}
                                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500/20 via-yellow-500/20 to-stone-900 border border-amber-500/40 text-amber-300 hover:text-white hover:bg-amber-500/30 text-xs font-bold transition-all shadow-lg hover:scale-105"
                            >
                                <Sparkles size={14} className="text-amber-400" />
                                <span>Aplicar Ultra-Premium 16K Remaster & Enhancement</span>
                            </button>
                        </div>
                    </div>
                ) : (
                    isEditing ? (
                         <div className="h-full flex flex-col">
                             <textarea 
                                value={localPrompt}
                                onChange={(e) => setLocalPrompt(e.target.value)}
                                className="flex-1 w-full bg-slate-900 p-5 text-slate-200 font-mono text-sm outline-none resize-none border-none focus:ring-0 leading-relaxed"
                                spellCheck={false}
                            />
                            <div className="p-3 bg-slate-900 border-t border-slate-800 flex justify-end">
                                <button onClick={handleSave} className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded hover:bg-blue-500">Save Changes</button>
                            </div>
                         </div>
                    ) : (
                        <div className="h-full w-full bg-slate-900 p-6 overflow-auto relative">
                             <p className="font-mono text-sm text-slate-300 leading-relaxed whitespace-pre-wrap break-words">
                                {localPrompt}
                            </p>
                             {/* Floating Buttons: Gemini 3 Pro 4K & Standard Create Image */}
                             <div className="sticky bottom-0 mt-4 flex flex-wrap items-center justify-center gap-2.5">
                                <button 
                                    onClick={() => {
                                        if (onOpenGemini3ProGenerator) {
                                            onOpenGemini3ProGenerator();
                                        } else {
                                            onCreateImage();
                                        }
                                    }}
                                    disabled={isGeneratingImage}
                                    className="flex items-center gap-2 bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 hover:from-amber-400 hover:to-yellow-400 text-slate-950 px-5 py-2.5 rounded-full font-black text-xs shadow-xl shadow-amber-500/25 transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
                                    title="Abrir estúdio de renderização 4K com Gemini 3 Pro"
                                >
                                    {isGeneratingImage ? (
                                        <div className="w-4 h-4 border-2 border-slate-950/30 border-t-slate-950 rounded-full animate-spin" />
                                    ) : (
                                        <Sparkles size={16} className="text-slate-950" />
                                    )}
                                    <span>Gerar 4K com Gemini 3 Pro</span>
                                </button>

                                <button 
                                    onClick={onCreateImage}
                                    disabled={isGeneratingImage}
                                    className="flex items-center gap-1.5 bg-slate-800/90 hover:bg-slate-700 text-slate-200 border border-slate-700 px-4 py-2.5 rounded-full font-bold text-xs shadow-lg transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
                                    title="Geração Rápida Direta"
                                >
                                    <ImagePlus size={15} />
                                    <span>Geração Rápida</span>
                                </button>
                             </div>
                        </div>
                    )
                )}
            </div>
            
            {localPrompt && !isEditing && (
                <div className="bg-slate-900 border-t border-slate-800 px-5 py-3 text-xs text-slate-500 font-mono flex justify-between">
                    <span>{localPrompt.length} chars</span>
                    <span>{localPrompt.split(/\s+/).filter(Boolean).length} words</span>
                </div>
            )}
        </div>
    );
};
