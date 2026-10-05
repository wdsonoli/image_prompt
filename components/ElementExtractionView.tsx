import React, { useState } from 'react';
import { ElementDecomposition, ExtractedVisualElement } from '../types';
import { 
    Scan, 
    Layers, 
    Boxes, 
    Sun, 
    Palette, 
    Copy, 
    Check, 
    Sparkles, 
    ArrowRight, 
    Wand2,
    CheckCircle2,
    Scissors,
    Shield,
    Eye
} from 'lucide-react';

interface ElementExtractionViewProps {
    data: ElementDecomposition;
    onApplyToPrompt: (prompt: string) => void;
    onCreateVisual?: (overridePrompt?: string) => void;
    isGeneratingVisual?: boolean;
}

export const ElementExtractionView: React.FC<ElementExtractionViewProps> = ({
    data,
    onApplyToPrompt,
    onCreateVisual,
    isGeneratingVisual
}) => {
    const [copiedPrompt, setCopiedPrompt] = useState(false);
    const [copiedItem, setCopiedItem] = useState<string | null>(null);
    const [selectedElementIndex, setSelectedElementIndex] = useState<number | null>(null);

    const handleCopyText = async (text: string, identifier: string) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopiedItem(identifier);
            setTimeout(() => setCopiedItem(null), 2000);
        } catch (err) {
            console.error('Falha ao copiar:', err);
        }
    };

    const handleCopyPrompt = async (promptToCopy: string, identifier = 'master') => {
        try {
            await navigator.clipboard.writeText(promptToCopy);
            if (identifier === 'master') {
                setCopiedPrompt(true);
                setTimeout(() => setCopiedPrompt(false), 2000);
            } else {
                setCopiedItem(identifier);
                setTimeout(() => setCopiedItem(null), 2000);
            }
        } catch (err) {
            console.error('Falha ao copiar prompt:', err);
        }
    };

    return (
        <div id="element-extraction-card" className="bg-slate-800/95 border border-violet-500/40 rounded-2xl overflow-hidden shadow-2xl flex flex-col mt-4 animate-in fade-in slide-in-from-bottom-3 duration-300">
            {/* Header */}
            <div className="bg-violet-950/40 px-5 py-3.5 border-b border-violet-500/20 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                    <div className="p-1.5 rounded-lg bg-violet-500/20 text-violet-300 border border-violet-400/30">
                        <Scan size={18} />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h3 className="text-sm font-bold text-white tracking-wide">
                                Extração de Elemento da Imagem
                            </h3>
                            <span className="px-2 py-0.5 rounded-full bg-violet-500/20 border border-violet-400/30 text-[10px] font-bold text-violet-300">
                                {data.category || 'Elemento Isolado'}
                            </span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                            Sujeito e componentes isolados com exclusão do cenário de fundo
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono bg-violet-900/40 text-violet-300 px-2.5 py-1 rounded-lg border border-violet-500/30 font-semibold">
                        {data.elements.length} {data.elements.length === 1 ? 'elemento' : 'elementos'}
                    </span>
                    <button
                        type="button"
                        onClick={() => handleCopyPrompt(data.isolatedMasterPrompt, 'master')}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-violet-600/30 hover:bg-violet-600/50 border border-violet-500/40 text-violet-200 text-xs font-semibold transition-all active:scale-95"
                        title="Copiar prompt isolado principal"
                    >
                        {copiedPrompt ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                        <span>{copiedPrompt ? 'Copiado!' : 'Copiar Master'}</span>
                    </button>
                </div>
            </div>

            {/* Content Body */}
            <div className="p-5 space-y-4">
                {/* 1. Sujeito Principal & Atributos Físicos */}
                <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-700/60 space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2 text-slate-200 font-bold text-xs uppercase tracking-wider">
                            <Sparkles size={14} className="text-amber-400" />
                            <span>Sujeito Principal:</span>
                            <span className="text-white normal-case font-semibold text-sm">
                                {data.mainSubject}
                            </span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                        {/* Contornos e Silhueta */}
                        <div className="bg-slate-950/50 p-2.5 rounded-lg border border-slate-800 flex items-start gap-2">
                            <Scissors size={14} className="text-teal-400 shrink-0 mt-0.5" />
                            <div>
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                                    Silhueta & Bordas de Recorte
                                </span>
                                <span className="text-slate-300 text-[11px] leading-snug">
                                    {data.silhouetteAndEdges}
                                </span>
                            </div>
                        </div>

                        {/* Iluminação e Reflexos */}
                        <div className="bg-slate-950/50 p-2.5 rounded-lg border border-slate-800 flex items-start gap-2">
                            <Sun size={14} className="text-yellow-400 shrink-0 mt-0.5" />
                            <div>
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                                    Iluminação & Especularidade
                                </span>
                                <span className="text-slate-300 text-[11px] leading-snug">
                                    {data.lightingAndReflections}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 2. Lista de Elementos / Componentes Decompostos */}
                {data.elements && data.elements.length > 0 && (
                    <div className="space-y-2.5">
                        <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                            <span className="flex items-center gap-1.5 text-violet-300">
                                <Boxes size={14} />
                                <span>Elementos & Componentes Extraídos ({data.elements.length})</span>
                            </span>
                            <span className="text-[10px] text-slate-500 lowercase font-normal">
                                clique para carregar ou gerar individualmente
                            </span>
                        </div>

                        <div className="grid grid-cols-1 gap-2.5">
                            {data.elements.map((elem, idx) => {
                                const isSelected = selectedElementIndex === idx;
                                return (
                                    <div
                                        key={idx}
                                        className={`p-3.5 rounded-xl border transition-all ${
                                            isSelected 
                                                ? 'bg-violet-950/30 border-violet-500 shadow-[0_0_15px_rgba(139,92,246,0.2)]' 
                                                : 'bg-slate-900/70 border-slate-700/70 hover:border-slate-600'
                                        }`}
                                    >
                                        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                                            <div className="flex items-center gap-2">
                                                <span className="w-2 h-2 rounded-full bg-violet-400" />
                                                <h4 className="text-xs font-bold text-white">
                                                    {elem.name}
                                                </h4>
                                                <span className="px-2 py-0.5 rounded-md bg-slate-800 text-[9px] font-semibold text-violet-300 border border-slate-700">
                                                    {elem.category}
                                                </span>
                                            </div>

                                            {/* Dominant Colors for this specific element */}
                                            {elem.dominantColors && elem.dominantColors.length > 0 && (
                                                <div className="flex items-center gap-1.5">
                                                    {elem.dominantColors.map((hex, cIdx) => (
                                                        <button
                                                            key={cIdx}
                                                            type="button"
                                                            onClick={() => handleCopyText(hex, `elem-${idx}-col-${cIdx}`)}
                                                            className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-slate-950 border border-slate-800 hover:border-violet-400 text-[10px] font-mono text-slate-400 transition-all active:scale-95"
                                                            title={`Copiar ${hex}`}
                                                        >
                                                            <span 
                                                                className="w-2.5 h-2.5 rounded-full border border-white/20"
                                                                style={{ backgroundColor: hex }}
                                                            />
                                                            <span>{hex}</span>
                                                            {copiedItem === `elem-${idx}-col-${cIdx}` && <Check size={9} className="text-emerald-400" />}
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        {elem.description && (
                                            <p className="text-[11px] text-slate-300 mb-2 leading-relaxed">
                                                {elem.description}
                                            </p>
                                        )}

                                        {elem.materialsAndTextures && (
                                            <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mb-2.5 bg-slate-950/40 p-1.5 rounded-lg border border-slate-800/80">
                                                <Layers size={11} className="text-indigo-400 shrink-0" />
                                                <span><strong>Materiais/Texturas:</strong> {elem.materialsAndTextures}</span>
                                            </div>
                                        )}

                                        {/* Actions per element */}
                                        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800/70 text-[11px]">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setSelectedElementIndex(idx);
                                                        onApplyToPrompt(elem.isolatedPrompt);
                                                    }}
                                                    className="flex items-center gap-1.5 text-violet-300 hover:text-white transition-colors font-semibold"
                                                >
                                                    <ArrowRight size={12} />
                                                    <span>Usar no Editor</span>
                                                </button>
                                                <span className="text-slate-600">•</span>
                                                <button
                                                    type="button"
                                                    onClick={() => handleCopyPrompt(elem.isolatedPrompt, `elem-prompt-${idx}`)}
                                                    className="flex items-center gap-1 text-slate-400 hover:text-slate-200 transition-colors"
                                                >
                                                    {copiedItem === `elem-prompt-${idx}` ? (
                                                        <Check size={11} className="text-emerald-400" />
                                                    ) : (
                                                        <Copy size={11} />
                                                    )}
                                                    <span>{copiedItem === `elem-prompt-${idx}` ? 'Copiado!' : 'Copiar Prompt'}</span>
                                                </button>
                                            </div>

                                            {onCreateVisual && (
                                                <button
                                                    type="button"
                                                    onClick={() => onCreateVisual(elem.isolatedPrompt)}
                                                    disabled={isGeneratingVisual}
                                                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-violet-600/30 hover:bg-violet-600/50 border border-violet-500/40 text-violet-200 hover:text-white text-[10px] font-bold transition-all disabled:opacity-50"
                                                >
                                                    <Sparkles size={11} className="text-amber-300" />
                                                    <span>Gerar Este Elemento (IA)</span>
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* 3. Prompt Isolado Master Gerado */}
                <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-violet-400 uppercase tracking-wider flex items-center gap-1">
                            <Wand2 size={12} /> Prompt Master do Sujeito / Elemento Isolado
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">
                            Pronto para renderização em estúdio
                        </span>
                    </div>
                    <p className="text-slate-300 font-mono text-[11px] leading-relaxed bg-slate-900/90 p-2.5 rounded-lg border border-slate-800 break-words whitespace-pre-wrap">
                        {data.isolatedMasterPrompt}
                    </p>
                </div>
            </div>

            {/* Footer com Ações */}
            <div className="bg-slate-950/70 px-5 py-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
                <button
                    type="button"
                    onClick={() => onApplyToPrompt(data.isolatedMasterPrompt)}
                    className="flex items-center gap-2 text-xs font-bold text-violet-400 hover:text-violet-300 transition-colors"
                >
                    <span>Carregar Master no Editor de Prompt</span>
                    <ArrowRight size={14} />
                </button>

                {onCreateVisual && (
                    <button
                        type="button"
                        onClick={() => onCreateVisual(data.isolatedMasterPrompt)}
                        disabled={isGeneratingVisual}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg transition-all active:scale-95 disabled:opacity-50"
                    >
                        {isGeneratingVisual ? (
                            <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <Sparkles size={14} className="text-yellow-300" />
                        )}
                        <span>Gerar Imagem do Elemento Principal (IA)</span>
                    </button>
                )}
            </div>
        </div>
    );
};
