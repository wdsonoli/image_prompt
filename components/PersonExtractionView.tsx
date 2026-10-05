import React, { useState } from 'react';
import { PersonDecomposition } from '../types';
import { 
    User, 
    UserCheck, 
    Sparkles, 
    Copy, 
    Check, 
    ArrowRight, 
    Wand2, 
    Smile, 
    Scissors, 
    Shirt, 
    Glasses, 
    Sun, 
    Activity, 
    ShieldCheck, 
    Eye 
} from 'lucide-react';

interface PersonExtractionViewProps {
    data: PersonDecomposition;
    onApplyToPrompt: (prompt: string) => void;
    onCreateVisual?: (overridePrompt?: string) => void;
    isGeneratingVisual?: boolean;
}

export const PersonExtractionView: React.FC<PersonExtractionViewProps> = ({
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
            await navigator.clipboard.writeText(data.isolatedPersonPrompt);
            setCopiedPrompt(true);
            setTimeout(() => setCopiedPrompt(false), 2000);
        } catch (err) {
            console.error('Falha ao copiar prompt:', err);
        }
    };

    return (
        <div id="person-extraction-card" className="bg-slate-800/95 border border-fuchsia-500/40 rounded-2xl overflow-hidden shadow-2xl flex flex-col mt-4 animate-in fade-in slide-in-from-bottom-3 duration-300">
            {/* Header */}
            <div className="bg-gradient-to-r from-fuchsia-950/60 via-purple-950/40 to-slate-900 px-5 py-4 border-b border-fuchsia-500/30 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-fuchsia-500/20 text-fuchsia-300 border border-fuchsia-400/30 shadow-md">
                        <UserCheck size={20} />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h3 className="text-sm sm:text-base font-black text-slate-100 flex items-center gap-1.5">
                                Extração Fiel de Pessoa
                                <span className="text-[9px] bg-fuchsia-500/30 text-fuchsia-200 px-2 py-0.5 rounded-full font-bold border border-fuchsia-400/30">
                                    CLONE DE CARACTERÍSTICAS
                                </span>
                            </h3>
                        </div>
                        <p className="text-[11px] text-fuchsia-200/80 font-medium">
                            {data.mainSubject || 'Pessoa extraída com características faciais, vestuário e pose idênticos'}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={handleCopyPrompt}
                        className="px-3 py-1.5 rounded-lg bg-fuchsia-600/20 hover:bg-fuchsia-600/30 text-fuchsia-300 border border-fuchsia-500/40 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                        title="Copiar prompt completo de replicação"
                    >
                        {copiedPrompt ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                        <span>{copiedPrompt ? 'Copiado!' : 'Copiar Prompt'}</span>
                    </button>
                    <button
                        onClick={() => onApplyToPrompt(data.isolatedPersonPrompt)}
                        className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-fuchsia-600 to-pink-600 hover:from-fuchsia-500 hover:to-pink-500 text-white text-xs font-black flex items-center gap-1.5 shadow-lg shadow-fuchsia-500/25 transition-all cursor-pointer active:scale-95"
                    >
                        <ArrowRight size={14} />
                        <span>Usar no Prompt</span>
                    </button>
                </div>
            </div>

            {/* Content Body */}
            <div className="p-4 sm:p-5 space-y-4">
                
                {/* Notice banner */}
                <div className="p-3 rounded-xl bg-fuchsia-950/40 border border-fuchsia-500/30 text-[11px] text-fuchsia-200 flex items-start gap-2.5">
                    <ShieldCheck size={16} className="text-fuchsia-400 shrink-0 mt-0.5" />
                    <div className="leading-relaxed">
                        <strong className="text-fuchsia-300 font-bold block mb-0.5">Modo de Alta Fidelidade Humana:</strong>
                        Todos os traços da pessoa de referência foram mapeados com precisão forense (biometria facial, idade aparente, cabelo, caimento da roupa, pose e iluminação) para replicação consistente no gerador.
                    </div>
                </div>

                {/* Grid de Atributos Forenses */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    
                    {/* 1. Biometria & Idade */}
                    <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-700/60 space-y-1.5">
                        <div className="flex items-center justify-between text-xs font-bold text-fuchsia-300">
                            <span className="flex items-center gap-1.5">
                                <User size={14} className="text-fuchsia-400" />
                                <span>Identidade & Idade Aparente</span>
                            </span>
                            <button
                                onClick={() => handleCopyText(data.genderAndAge, 'age')}
                                className="text-slate-400 hover:text-white transition-colors"
                                title="Copiar"
                            >
                                {copiedItem === 'age' ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                            </button>
                        </div>
                        <p className="text-xs text-slate-200 leading-relaxed font-medium">
                            {data.genderAndAge}
                        </p>
                    </div>

                    {/* 2. Tom de Pele & Etnia */}
                    <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-700/60 space-y-1.5">
                        <div className="flex items-center justify-between text-xs font-bold text-pink-300">
                            <span className="flex items-center gap-1.5">
                                <Smile size={14} className="text-pink-400" />
                                <span>Tom de Pele & Textura Epidérmica</span>
                            </span>
                            <button
                                onClick={() => handleCopyText(data.ethnicityAndSkinTone, 'skin')}
                                className="text-slate-400 hover:text-white transition-colors"
                                title="Copiar"
                            >
                                {copiedItem === 'skin' ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                            </button>
                        </div>
                        <p className="text-xs text-slate-200 leading-relaxed font-medium">
                            {data.ethnicityAndSkinTone}
                        </p>
                    </div>

                    {/* 3. Estrutura Facial & Expressão */}
                    <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-700/60 space-y-1.5 md:col-span-2">
                        <div className="flex items-center justify-between text-xs font-bold text-purple-300">
                            <span className="flex items-center gap-1.5">
                                <Eye size={14} className="text-purple-400" />
                                <span>Traços Faciais, Olhar & Expressão</span>
                            </span>
                            <button
                                onClick={() => handleCopyText(data.facialFeatures, 'face')}
                                className="text-slate-400 hover:text-white transition-colors"
                                title="Copiar"
                            >
                                {copiedItem === 'face' ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                            </button>
                        </div>
                        <p className="text-xs text-slate-200 leading-relaxed font-medium">
                            {data.facialFeatures}
                        </p>
                    </div>

                    {/* 4. Cabelo & Penteado */}
                    <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-700/60 space-y-1.5">
                        <div className="flex items-center justify-between text-xs font-bold text-amber-300">
                            <span className="flex items-center gap-1.5">
                                <Scissors size={14} className="text-amber-400" />
                                <span>Cabelo, Penteado & Textura</span>
                            </span>
                            <button
                                onClick={() => handleCopyText(data.hairStyleAndColor, 'hair')}
                                className="text-slate-400 hover:text-white transition-colors"
                                title="Copiar"
                            >
                                {copiedItem === 'hair' ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                            </button>
                        </div>
                        <p className="text-xs text-slate-200 leading-relaxed font-medium">
                            {data.hairStyleAndColor}
                        </p>
                    </div>

                    {/* 5. Vestuário & Tecidos */}
                    <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-700/60 space-y-1.5">
                        <div className="flex items-center justify-between text-xs font-bold text-cyan-300">
                            <span className="flex items-center gap-1.5">
                                <Shirt size={14} className="text-cyan-400" />
                                <span>Vestuário, Corte & Tecidos</span>
                            </span>
                            <button
                                onClick={() => handleCopyText(data.clothingAndFabric, 'clothes')}
                                className="text-slate-400 hover:text-white transition-colors"
                                title="Copiar"
                            >
                                {copiedItem === 'clothes' ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                            </button>
                        </div>
                        <p className="text-xs text-slate-200 leading-relaxed font-medium">
                            {data.clothingAndFabric}
                        </p>
                    </div>

                    {/* 6. Pose & Postura Corporal */}
                    <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-700/60 space-y-1.5">
                        <div className="flex items-center justify-between text-xs font-bold text-emerald-300">
                            <span className="flex items-center gap-1.5">
                                <Activity size={14} className="text-emerald-400" />
                                <span>Pose, Postura & Ângulo Corporal</span>
                            </span>
                            <button
                                onClick={() => handleCopyText(data.poseAndBodyLanguage, 'pose')}
                                className="text-slate-400 hover:text-white transition-colors"
                                title="Copiar"
                            >
                                {copiedItem === 'pose' ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                            </button>
                        </div>
                        <p className="text-xs text-slate-200 leading-relaxed font-medium">
                            {data.poseAndBodyLanguage}
                        </p>
                    </div>

                    {/* 7. Iluminação no Sujeito */}
                    <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-700/60 space-y-1.5">
                        <div className="flex items-center justify-between text-xs font-bold text-yellow-300">
                            <span className="flex items-center gap-1.5">
                                <Sun size={14} className="text-yellow-400" />
                                <span>Iluminação Sculpt no Rosto/Corpo</span>
                            </span>
                            <button
                                onClick={() => handleCopyText(data.lightingOnSubject, 'light')}
                                className="text-slate-400 hover:text-white transition-colors"
                                title="Copiar"
                            >
                                {copiedItem === 'light' ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                            </button>
                        </div>
                        <p className="text-xs text-slate-200 leading-relaxed font-medium">
                            {data.lightingOnSubject}
                        </p>
                    </div>
                </div>

                {/* Acessórios & Detalhes */}
                {data.accessoriesAndDetails && data.accessoriesAndDetails.length > 0 && (
                    <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-700/60 space-y-2">
                        <div className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                            <Glasses size={14} className="text-amber-400" />
                            <span>Acessórios & Detalhes Específicos</span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                            {data.accessoriesAndDetails.map((acc, idx) => (
                                <span 
                                    key={idx} 
                                    className="px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-[11px] text-slate-200 font-medium flex items-center gap-1"
                                >
                                    <Sparkles size={11} className="text-amber-400" />
                                    <span>{acc}</span>
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {/* Caixa do Prompt Mestre Isolado */}
                <div className="p-4 rounded-xl bg-slate-950/80 border border-fuchsia-500/30 space-y-3">
                    <div className="flex items-center justify-between">
                        <div className="text-xs font-bold text-fuchsia-300 flex items-center gap-2">
                            <Sparkles size={14} className="text-fuchsia-400" />
                            <span>Prompt Mestre de Replicação Fiel da Pessoa</span>
                        </div>
                        <button
                            onClick={handleCopyPrompt}
                            className="text-slate-400 hover:text-fuchsia-300 text-[11px] font-bold flex items-center gap-1 transition-colors"
                        >
                            {copiedPrompt ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                            <span>{copiedPrompt ? 'Copiado!' : 'Copiar'}</span>
                        </button>
                    </div>
                    
                    <div className="bg-slate-900/90 p-3 rounded-lg border border-slate-800 font-mono text-xs text-slate-200 leading-relaxed max-h-36 overflow-y-auto custom-scrollbar select-all">
                        {data.isolatedPersonPrompt}
                    </div>

                    <div className="flex flex-wrap items-center justify-end gap-2 pt-1">
                        {onCreateVisual && (
                            <button
                                disabled={isGeneratingVisual}
                                onClick={() => onCreateVisual(data.isolatedPersonPrompt)}
                                className="px-4 py-2 rounded-lg bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 text-xs font-black flex items-center gap-1.5 shadow-lg shadow-amber-500/20 transition-all cursor-pointer active:scale-95 disabled:opacity-50"
                            >
                                <Wand2 size={14} />
                                <span>{isGeneratingVisual ? 'Gerando...' : 'Gerar com Gemini 4K'}</span>
                            </button>
                        )}
                        <button
                            onClick={() => onApplyToPrompt(data.isolatedPersonPrompt)}
                            className="px-4 py-2 rounded-lg bg-fuchsia-600 hover:bg-fuchsia-500 text-white text-xs font-black flex items-center gap-1.5 shadow-lg shadow-fuchsia-500/25 transition-all cursor-pointer active:scale-95"
                        >
                            <ArrowRight size={14} />
                            <span>Aplicar no Editor Principal</span>
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
};
