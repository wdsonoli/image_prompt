import React, { useState } from 'react';
import { BackgroundDecomposition } from '../types';
import { 
    Layers, 
    Home, 
    Boxes, 
    Sun, 
    Palette, 
    Copy, 
    Check, 
    Sparkles, 
    ArrowRight, 
    Wand2,
    CheckCircle2
} from 'lucide-react';

interface BackgroundElementsViewProps {
    data: BackgroundDecomposition;
    onApplyToPrompt: (prompt: string) => void;
    onCreateVisual?: () => void;
    isGeneratingVisual?: boolean;
}

export const BackgroundElementsView: React.FC<BackgroundElementsViewProps> = ({
    data,
    onApplyToPrompt,
    onCreateVisual,
    isGeneratingVisual
}) => {
    const [copiedPrompt, setCopiedPrompt] = useState(false);
    const [copiedItem, setCopiedItem] = useState<string | null>(null);

    const handleCopyText = async (text: string, identifier: string) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopiedItem(identifier);
            setTimeout(() => setCopiedItem(null), 2000);
        } catch (err) {
            console.error('Falha ao copiar:', err);
        }
    };

    const handleCopyPrompt = async () => {
        try {
            await navigator.clipboard.writeText(data.isolatedPrompt);
            setCopiedPrompt(true);
            setTimeout(() => setCopiedPrompt(false), 2000);
        } catch (err) {
            console.error('Falha ao copiar prompt:', err);
        }
    };

    return (
        <div id="background-elements-card" className="bg-slate-800/95 border border-emerald-500/30 rounded-2xl overflow-hidden shadow-2xl flex flex-col mt-4 animate-in fade-in slide-in-from-bottom-3 duration-300">
            {/* Header */}
            <div className="bg-emerald-950/40 px-5 py-3 border-b border-emerald-500/20 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                    <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                        <Layers size={18} />
                    </div>
                    <div>
                        <h3 className="text-sm font-black text-emerald-200 tracking-tight flex items-center gap-2">
                            Decomposição do Background & Elementos
                            <span className="text-[10px] font-mono bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30">
                                IA Extrator
                            </span>
                        </h3>
                        <p className="text-[11px] text-slate-400">
                            Cenário de fundo isolado sem o sujeito principal em primeiro plano.
                        </p>
                    </div>
                </div>

                <button
                    type="button"
                    onClick={handleCopyPrompt}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
                    title="Copiar prompt isolado do fundo"
                >
                    {copiedPrompt ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                    <span className="hidden sm:inline">{copiedPrompt ? 'Copiado!' : 'Copiar Prompt'}</span>
                </button>
            </div>

            {/* Content Grid */}
            <div className="p-4 sm:p-5 space-y-4 text-xs">
                {/* 1. Ambiente Geral */}
                {data.settingDescription && (
                    <div className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-700/60">
                        <div className="flex items-center gap-2 text-slate-300 font-bold text-[11px] uppercase tracking-wider mb-1.5">
                            <Home size={13} className="text-emerald-400" />
                            <span>Ambiente & Cenário Principal</span>
                        </div>
                        <p className="text-slate-200 leading-relaxed font-sans text-xs">
                            {data.settingDescription}
                        </p>
                    </div>
                )}

                {/* 2. Elementos Estruturais & Superfícies */}
                {data.architecturalElements && data.architecturalElements.length > 0 && (
                    <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                            <span className="flex items-center gap-1.5 text-blue-400">
                                <span>🏛️</span> Superfícies & Arquitetura ({data.architecturalElements.length})
                            </span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                            {data.architecturalElements.map((elem, idx) => (
                                <button
                                    key={idx}
                                    type="button"
                                    onClick={() => handleCopyText(elem, `arch-${idx}`)}
                                    className="px-2.5 py-1 rounded-lg bg-slate-900/80 border border-slate-700/80 text-slate-300 text-[11px] hover:border-blue-500 hover:text-blue-200 transition-all flex items-center gap-1.5 active:scale-95"
                                    title="Clique para copiar elemento"
                                >
                                    {copiedItem === `arch-${idx}` ? (
                                        <CheckCircle2 size={11} className="text-emerald-400" />
                                    ) : (
                                        <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                                    )}
                                    <span>{elem}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* 3. Objetos & Cenografia de Fundo */}
                {data.propsAndObjects && data.propsAndObjects.length > 0 && (
                    <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                            <span className="flex items-center gap-1.5 text-amber-400">
                                <Boxes size={13} />
                                <span>Objetos & Elementos de Cena ({data.propsAndObjects.length})</span>
                            </span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                            {data.propsAndObjects.map((obj, idx) => (
                                <button
                                    key={idx}
                                    type="button"
                                    onClick={() => handleCopyText(obj, `prop-${idx}`)}
                                    className="px-2.5 py-1 rounded-lg bg-slate-900/80 border border-slate-700/80 text-slate-300 text-[11px] hover:border-amber-500 hover:text-amber-200 transition-all flex items-center gap-1.5 active:scale-95"
                                    title="Clique para copiar objeto"
                                >
                                    {copiedItem === `prop-${idx}` ? (
                                        <CheckCircle2 size={11} className="text-emerald-400" />
                                    ) : (
                                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                                    )}
                                    <span>{obj}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* 4. Iluminação & Atmosfera */}
                {data.lightingAndAtmosphere && (
                    <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-700/60">
                        <div className="flex items-center gap-2 text-slate-300 font-bold text-[11px] uppercase tracking-wider mb-1">
                            <Sun size={13} className="text-yellow-400" />
                            <span>Iluminação & Clima do Fundo</span>
                        </div>
                        <p className="text-slate-300 font-sans text-xs">
                            {data.lightingAndAtmosphere}
                        </p>
                    </div>
                )}

                {/* 5. Cores Dominantes do Fundo */}
                {data.dominantBackgroundColors && data.dominantBackgroundColors.length > 0 && (
                    <div className="space-y-1.5">
                        <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                            <Palette size={13} className="text-pink-400" />
                            <span>Paleta de Cores do Cenário</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {data.dominantBackgroundColors.map((color, idx) => (
                                <button
                                    key={idx}
                                    type="button"
                                    onClick={() => handleCopyText(color, `color-${idx}`)}
                                    className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-slate-900 border border-slate-700 hover:border-pink-500 transition-all text-[11px] text-slate-300 font-mono active:scale-95"
                                    title={`Copiar ${color}`}
                                >
                                    <span 
                                        className="w-3.5 h-3.5 rounded-full border border-white/20 shadow-sm"
                                        style={{ backgroundColor: color }}
                                    />
                                    <span>{color}</span>
                                    {copiedItem === `color-${idx}` && <Check size={10} className="text-emerald-400" />}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* 6. Prompt Isolado Gerado */}
                <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1">
                            <Wand2 size={12} /> Prompt do Background Isolado
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">
                            Pronto para renderização
                        </span>
                    </div>
                    <p className="text-slate-300 font-mono text-[11px] leading-relaxed bg-slate-900/90 p-2.5 rounded-lg border border-slate-800 break-words whitespace-pre-wrap">
                        {data.isolatedPrompt}
                    </p>
                </div>
            </div>

            {/* Footer com Ações */}
            <div className="bg-slate-950/70 px-5 py-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
                <button
                    type="button"
                    onClick={() => onApplyToPrompt(data.isolatedPrompt)}
                    className="flex items-center gap-2 text-xs font-bold text-emerald-400 hover:text-emerald-300 transition-colors"
                >
                    <span>Carregar no Editor de Prompt</span>
                    <ArrowRight size={14} />
                </button>

                {onCreateVisual && (
                    <button
                        type="button"
                        onClick={onCreateVisual}
                        disabled={isGeneratingVisual}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg transition-all active:scale-95 disabled:opacity-50"
                    >
                        {isGeneratingVisual ? (
                            <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <Sparkles size={14} className="text-yellow-300" />
                        )}
                        <span>Gerar Imagem do Background (IA)</span>
                    </button>
                )}
            </div>
        </div>
    );
};
