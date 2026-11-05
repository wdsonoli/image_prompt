import React, { useState, useMemo } from 'react';
import { 
    Ban, ShieldAlert, Check, Copy, Sparkles, Plus, Trash2, 
    Search, RotateCcw, ArrowRight, Layers, Eye, Camera, User, 
    Package, Palette, Film, Coffee, Box, ExternalLink, HelpCircle
} from 'lucide-react';
import { ULTRA_PREMIUM_16K_PROMPT, ULTRA_PREMIUM_16K_NEGATIVE_PROMPT } from '../utils/visualEffectsData';
import { TargetPlatform } from '../types';

export interface NegativeTagItem {
    id: string;
    text: string;
    category: string;
    isUserCustom?: boolean;
}

export interface NegativeSituationCategory {
    id: string;
    title: string;
    subtitle: string;
    icon: React.ElementType;
    badge: string;
    badgeColor: string;
    cardBorder: string;
    description: string;
    tags: string[];
}

export const NEGATIVE_SITUATIONS: NegativeSituationCategory[] = [
    {
        id: 'remaster_16k',
        title: 'Remaster 16K & Anti-Alucinação',
        subtitle: 'Preservação Absoluta (Oficial)',
        icon: Sparkles,
        badge: '16K Master',
        badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
        cardBorder: 'border-amber-500/50 hover:border-amber-400 bg-gradient-to-b from-amber-950/20 via-slate-900/90 to-slate-900',
        description: 'Bloqueia categoricamente trocas de fundo, criação de elementos não existentes, modificações de barba/cabelo, pele plástica e alucinações da IA.',
        tags: [
            'Background replacement',
            'background redesign',
            'new elements',
            'added objects',
            'added hair',
            'thicker beard',
            'extra facial hair',
            'invented skin texture',
            'generated pores',
            'AI hallucinations',
            'facial modifications',
            'identity changes',
            'age changes',
            'oversharpening',
            'plastic skin',
            'CGI',
            'illustration',
            'synthetic details',
            'unrealistic textures',
            'altered composition'
        ]
    },
    {
        id: 'portraits_anatomy',
        title: 'Retratos & Anatomia Humana',
        subtitle: 'Anti-Deformidades & Anti-Plástico',
        icon: User,
        badge: 'Anatomia',
        badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
        cardBorder: 'border-rose-500/30 hover:border-rose-400/60 bg-slate-900/90',
        description: 'Elimina dedos extras, mãos deformadas, pele excessivamente cerosa, dentes falsos e assimetrias anatômicas estranhas.',
        tags: [
            'deformed hands',
            'missing fingers',
            'extra fingers',
            'mutated anatomy',
            'bad proportions',
            'unnatural facial asymmetry',
            'crossed eyes',
            'plastic waxy skin',
            'airbrushed skin',
            'fake teeth',
            'uncanny valley',
            'cartoon eyes',
            'exaggerated makeup',
            'clone artifacts',
            'extra limbs',
            'fused fingers',
            'poorly drawn face',
            'bad neck anatomy'
        ]
    },
    {
        id: 'product_branding',
        title: 'Produto Comercial & Marca',
        subtitle: 'Fidelidade de Rótulo & Embalagem',
        icon: Package,
        badge: 'Branding',
        badgeColor: 'bg-orange-500/20 text-orange-300 border-orange-500/40',
        cardBorder: 'border-orange-500/30 hover:border-orange-400/60 bg-slate-900/90',
        description: 'Impede que o produto seja reinventado, mantendo logos nítidos, texto legível, geometria original e sem aspecto de brinquedo 3D.',
        tags: [
            'redesigned product',
            'altered packaging',
            'distorted logo',
            'blurry typography',
            'unreadable label text',
            'wrong product shape',
            'cartoon',
            'illustration',
            'low quality render',
            '3D CGI look',
            'bad studio reflections',
            'cheap plastic materials',
            'cluttered background',
            'distorted geometry',
            'invented branding',
            'misaligned labels'
        ]
    },
    {
        id: 'quality_artifacts',
        title: 'Qualidade Geral & Artefatos',
        subtitle: 'Anti-Ruído, Marcas & Compressão',
        icon: ShieldAlert,
        badge: 'Qualidade',
        badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
        cardBorder: 'border-emerald-500/30 hover:border-emerald-400/60 bg-slate-900/90',
        description: 'Remove borrões, artefatos JPEG, marcas d’água, aberrações cromáticas, vinhetas escuras e assinaturas indesejadas.',
        tags: [
            'blurry',
            'pixelated',
            'jpeg artifacts',
            'compression noise',
            'low resolution',
            'bad optics',
            'chromatic aberration',
            'lens flare distortion',
            'watermark',
            'text overlay',
            'signature',
            'copyright notice',
            'oversaturated',
            'muddy colors',
            'washed out',
            'grainy sensor noise'
        ]
    },
    {
        id: 'pure_photorealism',
        title: 'Fotorrealismo Puro (Anti-CGI)',
        subtitle: 'Bloquear Pintura, 3D e Games',
        icon: Camera,
        badge: 'Fotorrealismo',
        badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
        cardBorder: 'border-blue-500/30 hover:border-blue-400/60 bg-slate-900/90',
        description: 'Garante que o resultado pareça uma foto de câmera real em vez de uma renderização digital ou desenho estilizado.',
        tags: [
            'illustration',
            'painting',
            'drawing',
            'cartoon',
            'anime',
            '3D render',
            'Octane render',
            'Unreal Engine look',
            'video game screenshot',
            'doll-like',
            'waxy mannequin',
            'airbrushed',
            'oversaturated fantasy art',
            'sketch',
            'vector graphic',
            'digital painting'
        ]
    },
    {
        id: 'architecture_scenery',
        title: 'Cenários, Arquitetura & Interiores',
        subtitle: 'Perspectiva & Física Real',
        icon: Box,
        badge: 'Cenários',
        badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
        cardBorder: 'border-purple-500/30 hover:border-purple-400/60 bg-slate-900/90',
        description: 'Evita paredes tortas, objetos levitando no ar, quebras de ponto de fuga e vegetação sintética falsa.',
        tags: [
            'crooked walls',
            'floating objects',
            'impossible physics',
            'architectural distortion',
            'broken perspective',
            'warped horizon',
            'fake greenery',
            'artificial sky',
            'unrealistic lighting directions',
            'messy composition',
            'cluttered floor',
            'impossible shadows'
        ]
    },
    {
        id: 'fashion_wardrobe',
        title: 'Moda, Tecidos & Alta Costura',
        subtitle: 'Caimento & Textura Têxtil',
        icon: Palette,
        badge: 'Vestuário',
        badgeColor: 'bg-fuchsia-500/20 text-fuchsia-300 border-fuchsia-500/40',
        cardBorder: 'border-fuchsia-500/30 hover:border-fuchsia-400/60 bg-slate-900/90',
        description: 'Elimina costuras tortas, padrões estampados derretidos, rugas artificiais e roupas que fundem com a pele.',
        tags: [
            'distorted fabric',
            'mismatched seams',
            'awkward clothing folds',
            'unnatural wrinkles',
            'asymmetrical collar',
            'inconsistent pattern',
            'wardrobe malfunction',
            'poor tailoring',
            'flat texture',
            'fused clothes into skin'
        ]
    },
    {
        id: 'food_gastronomy',
        title: 'Gastronomia & Alimentos',
        subtitle: 'Aparência Apetitosa & Textura',
        icon: Coffee,
        badge: 'Gastronomia',
        badgeColor: 'bg-amber-600/20 text-amber-200 border-amber-600/40',
        cardBorder: 'border-amber-600/30 hover:border-amber-500/60 bg-slate-900/90',
        description: 'Bloqueia texturas gomadas, brilho plástico falso em alimentos, aparência murcha ou cores não apetitosas.',
        tags: [
            'unappetizing colors',
            'plastic food look',
            'rubbery texture',
            'rotten look',
            'messy plate splatters',
            'bad lighting on food',
            'artificial oily gloss',
            'distorted cutlery',
            'unrealistic steam'
        ]
    },
    {
        id: 'video_motion',
        title: 'Vídeo, Movimento & Storyboard',
        subtitle: 'Consistência Temporal & Sem Glitches',
        icon: Film,
        badge: 'Vídeo / Motion',
        badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
        cardBorder: 'border-cyan-500/30 hover:border-cyan-400/60 bg-slate-900/90',
        description: 'Ideal para Kling, Runway, Sora e Google Flow. Evita morfing brusco, membros extras em movimento e quebra de fisionomia entre frames.',
        tags: [
            'morphing',
            'jittery motion',
            'flickering',
            'frame skips',
            'temporal inconsistency',
            'distorted motion blur',
            'ghosting artifacts',
            'warping limbs',
            'frame stutter',
            'sudden face shift',
            'jitter'
        ]
    }
];

interface NegativePromptStudioProps {
    initialNegativePrompt?: string;
    targetPlatform?: TargetPlatform;
    onApplyNegativePrompt: (negativePrompt: string) => void;
    onApply16kRemasterPair?: () => void;
    onBackToArchitect?: () => void;
}

export const NegativePromptStudio: React.FC<NegativePromptStudioProps> = ({
    initialNegativePrompt = '',
    targetPlatform = 'midjourney',
    onApplyNegativePrompt,
    onApply16kRemasterPair,
    onBackToArchitect
}) => {
    // Lista de tags ativas no construtor
    const [selectedTags, setSelectedTags] = useState<string[]>(() => {
        if (!initialNegativePrompt.trim()) {
            // Inicia por padrão com a lista oficial de 16K Remaster
            return [...NEGATIVE_SITUATIONS[0].tags];
        }
        // Separa por vírgula mantendo termos
        return initialNegativePrompt
            .split(',')
            .map(t => t.trim())
            .filter(Boolean);
    });

    const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>('all');
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [customTagInput, setCustomTagInput] = useState<string>('');
    const [copied, setCopied] = useState<boolean>(false);
    const [appliedNotice, setAppliedNotice] = useState<boolean>(false);
    const [outputFormat, setOutputFormat] = useState<'standard' | 'midjourney' | 'weighted'>('standard');

    // Converte a lista de tags ativas para o texto final formatado
    const negativePromptText = useMemo(() => {
        const cleanTags = selectedTags.map(t => t.trim()).filter(Boolean);
        if (cleanTags.length === 0) return '';

        if (outputFormat === 'midjourney') {
            return cleanTags.join(', ');
        } else if (outputFormat === 'weighted') {
            return cleanTags.map(t => `(${t}:1.2)`).join(', ');
        }
        return cleanTags.join(', ');
    }, [selectedTags, outputFormat]);

    // Alterna uma tag (liga/desliga)
    const toggleTag = (tag: string) => {
        const normalized = tag.trim();
        setSelectedTags(prev => {
            const exists = prev.some(t => t.toLowerCase() === normalized.toLowerCase());
            if (exists) {
                return prev.filter(t => t.toLowerCase() !== normalized.toLowerCase());
            } else {
                return [...prev, normalized];
            }
        });
    };

    const isTagSelected = (tag: string) => {
        return selectedTags.some(t => t.toLowerCase() === tag.trim().toLowerCase());
    };

    // Selecionar todos de uma categoria
    const selectAllFromCategory = (tags: string[]) => {
        setSelectedTags(prev => {
            const next = [...prev];
            tags.forEach(tag => {
                if (!next.some(t => t.toLowerCase() === tag.trim().toLowerCase())) {
                    next.push(tag.trim());
                }
            });
            return next;
        });
    };

    // Desmarcar todos de uma categoria
    const deselectAllFromCategory = (tags: string[]) => {
        const removeSet = new Set(tags.map(t => t.toLowerCase().trim()));
        setSelectedTags(prev => prev.filter(t => !removeSet.has(t.toLowerCase().trim())));
    };

    // Aplica o Preset Oficial 16K Remaster (substitui todas as tags pela lista do usuário)
    const handleApply16kOfficialPreset = () => {
        setSelectedTags([...NEGATIVE_SITUATIONS[0].tags]);
    };

    // Adiciona tag personalizada
    const handleAddCustomTag = (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        const trimmed = customTagInput.trim();
        if (!trimmed) return;

        // Suporta adicionar várias tags separadas por vírgula
        const parts = trimmed.split(',').map(p => p.trim()).filter(Boolean);
        setSelectedTags(prev => {
            const next = [...prev];
            parts.forEach(part => {
                if (!next.some(t => t.toLowerCase() === part.toLowerCase())) {
                    next.push(part);
                }
            });
            return next;
        });
        setCustomTagInput('');
    };

    // Limpar tudo
    const handleClearAll = () => {
        setSelectedTags([]);
    };

    // Copiar para a área de transferência
    const handleCopy = async () => {
        if (!negativePromptText) return;
        let textToCopy = negativePromptText;
        if (outputFormat === 'midjourney') {
            textToCopy = `--no ${negativePromptText}`;
        }
        await navigator.clipboard.writeText(textToCopy);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    // Aplicar ao Arquiteto
    const handleApplyToApp = () => {
        onApplyNegativePrompt(negativePromptText);
        setAppliedNotice(true);
        setTimeout(() => {
            setAppliedNotice(false);
            if (onBackToArchitect) {
                onBackToArchitect();
            }
        }, 800);
    };

    // Mesclar 16K Positivo e 16K Negativo
    const handleApplyComplete16kMaster = () => {
        handleApply16kOfficialPreset();
        onApplyNegativePrompt(ULTRA_PREMIUM_16K_NEGATIVE_PROMPT);
        if (onApply16kRemasterPair) {
            onApply16kRemasterPair();
        }
        setAppliedNotice(true);
        setTimeout(() => {
            setAppliedNotice(false);
            if (onBackToArchitect) {
                onBackToArchitect();
            }
        }, 900);
    };

    // Filtro por busca ou categoria
    const filteredSituations = useMemo(() => {
        let list = NEGATIVE_SITUATIONS;
        if (activeCategoryFilter !== 'all') {
            list = list.filter(s => s.id === activeCategoryFilter);
        }
        if (searchTerm.trim()) {
            const query = searchTerm.toLowerCase();
            list = list.map(sit => {
                const matchedTags = sit.tags.filter(t => t.toLowerCase().includes(query));
                const titleMatch = sit.title.toLowerCase().includes(query) || sit.subtitle.toLowerCase().includes(query);
                if (titleMatch) return sit;
                return {
                    ...sit,
                    tags: matchedTags
                };
            }).filter(sit => sit.tags.length > 0);
        }
        return list;
    }, [activeCategoryFilter, searchTerm]);

    return (
        <div className="space-y-6 animate-in fade-in duration-300 pb-12">
            {/* HERO BANNER DO ESTÚDIO DE PROMPT NEGATIVO */}
            <div className="relative rounded-2xl p-5 sm:p-6 bg-gradient-to-r from-rose-950/40 via-slate-900 to-amber-950/30 border border-rose-500/30 shadow-2xl overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-rose-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
                <div className="absolute bottom-0 left-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20" />

                <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                    <div className="space-y-2 max-w-2xl">
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-black tracking-wider uppercase bg-rose-500/20 text-rose-300 border border-rose-500/40 flex items-center gap-1.5">
                                <Ban size={12} className="text-rose-400" />
                                Anti-Alucinação & Qualidade 16K
                            </span>
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-200 border border-amber-500/30 flex items-center gap-1">
                                <Sparkles size={11} className="text-amber-400" />
                                9 Categorias Profissionais
                            </span>
                        </div>

                        <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
                            <span>Prompts Negativos para Todas as Situações</span>
                        </h1>
                        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                            Controle cirúrgico do que a inteligência artificial <strong className="text-rose-300 font-bold">NÃO deve fazer</strong>: evite alterações de fundo, deformidades anatômicas, pele de plástico e alucinações.
                        </p>
                    </div>

                    {/* BOTÕES DE AÇÃO RÁPIDA NO TOPO */}
                    <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
                        <button
                            type="button"
                            onClick={handleApplyComplete16kMaster}
                            className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl font-black text-xs bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-slate-950 hover:brightness-110 shadow-lg shadow-amber-500/25 active:scale-95 transition-all flex items-center justify-center gap-2 border border-amber-300 cursor-pointer"
                            title="Ativar Combo Completo: 16K Remaster Positivo + 16K Anti-Alucinação Negativo"
                        >
                            <Sparkles size={14} className="animate-spin text-slate-950" />
                            <span>Ativar Master 16K Completo</span>
                        </button>

                        <button
                            type="button"
                            onClick={handleApplyToApp}
                            disabled={selectedTags.length === 0}
                            className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl font-bold text-xs bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-600/25 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                        >
                            {appliedNotice ? <Check size={14} className="text-emerald-300" /> : <ArrowRight size={14} />}
                            <span>{appliedNotice ? 'Aplicado com Sucesso!' : 'Aplicar ao Arquiteto'}</span>
                        </button>

                        {onBackToArchitect && (
                            <button
                                type="button"
                                onClick={onBackToArchitect}
                                className="px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700 border border-slate-700 transition-colors cursor-pointer"
                            >
                                Voltar
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* PAINEL CONSTRUTOR FIXO / AO VIVO: TEXTAREA & TAGS ATIVAS */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 backdrop-blur-xl shadow-xl space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400">
                            <Ban size={16} />
                        </div>
                        <div>
                            <h2 className="text-sm font-bold text-white flex items-center gap-2">
                                <span>Prompt Negativo Compilado</span>
                                <span className="px-2 py-0.5 text-[10px] font-mono font-bold rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                                    {selectedTags.length} termos bloqueados
                                </span>
                            </h2>
                            <p className="text-[11px] text-slate-400">
                                Este texto será enviado como exclusão no Midjourney (<code className="text-amber-300">--no</code>) ou ImageFX/Flux (<code className="text-amber-300">exclude:</code>)
                            </p>
                        </div>
                    </div>

                    {/* SELETOR DE FORMATO E AÇÕES */}
                    <div className="flex items-center gap-2 flex-wrap">
                        <div className="flex items-center rounded-lg bg-slate-950 p-0.5 border border-slate-800 text-[11px]">
                            <button
                                type="button"
                                onClick={() => setOutputFormat('standard')}
                                className={`px-2.5 py-1 rounded-md font-bold transition-all ${
                                    outputFormat === 'standard' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
                                }`}
                                title="Formato padrão com vírgulas (Ideal para Flux, Google ImageFX, DALL-E e Ideogram)"
                            >
                                Padrão
                            </button>
                            <button
                                type="button"
                                onClick={() => setOutputFormat('midjourney')}
                                className={`px-2.5 py-1 rounded-md font-bold transition-all ${
                                    outputFormat === 'midjourney' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
                                }`}
                                title="Formato Midjourney (--no termo1, termo2)"
                            >
                                Midjourney (--no)
                            </button>
                            <button
                                type="button"
                                onClick={() => setOutputFormat('weighted')}
                                className={`px-2.5 py-1 rounded-md font-bold transition-all ${
                                    outputFormat === 'weighted' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
                                }`}
                                title="Pesos reforçados para Stable Diffusion / Automatic1111"
                            >
                                SD / ComfyUI (1.2)
                            </button>
                        </div>

                        <button
                            type="button"
                            onClick={handleCopy}
                            disabled={!negativePromptText}
                            className="px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 transition-all flex items-center gap-1.5 disabled:opacity-40 cursor-pointer"
                        >
                            {copied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                            <span>{copied ? 'Copiado!' : 'Copiar'}</span>
                        </button>

                        <button
                            type="button"
                            onClick={handleClearAll}
                            disabled={selectedTags.length === 0}
                            className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-rose-300 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/30 transition-colors flex items-center gap-1 cursor-pointer disabled:opacity-40"
                            title="Limpar todos os termos selecionados"
                        >
                            <Trash2 size={13} />
                            <span className="hidden sm:inline">Limpar</span>
                        </button>
                    </div>
                </div>

                {/* TEXTAREA EDITÁVEL DO PROMPT NEGATIVO */}
                <div className="relative">
                    <textarea
                        value={negativePromptText}
                        onChange={(e) => {
                            const newTags = e.target.value.split(',').map(t => t.trim()).filter(Boolean);
                            setSelectedTags(newTags);
                        }}
                        placeholder="Nenhum termo bloqueado ainda. Clique nas tags das categorias abaixo para adicionar..."
                        rows={3}
                        className="w-full bg-slate-950 border border-slate-800 focus:border-rose-500/70 rounded-xl px-3.5 py-2.5 text-xs font-mono text-rose-200/90 placeholder:text-slate-600 outline-none transition-colors custom-scrollbar leading-relaxed"
                    />
                    <div className="absolute right-2.5 bottom-2.5 text-[10px] font-mono text-slate-500 bg-slate-950/80 px-2 py-0.5 rounded-md border border-slate-800/80 pointer-events-none">
                        {negativePromptText.length} caracteres · {selectedTags.length} tags
                    </div>
                </div>

                {/* ADICIONAR TAG PERSONALIZADA */}
                <form onSubmit={handleAddCustomTag} className="flex items-center gap-2">
                    <div className="relative flex-1">
                        <input
                            type="text"
                            value={customTagInput}
                            onChange={(e) => setCustomTagInput(e.target.value)}
                            placeholder="Adicione termo personalizado (ex: chapéu, óculos escuros, reflexo azul)..."
                            className="w-full bg-slate-950 border border-slate-800 focus:border-slate-700 rounded-xl pl-3 pr-8 py-2 text-xs text-slate-200 placeholder:text-slate-500 outline-none transition-colors"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={!customTagInput.trim()}
                        className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-xl text-xs font-bold border border-slate-700 flex items-center gap-1.5 transition-all disabled:opacity-40 cursor-pointer"
                    >
                        <Plus size={13} />
                        <span>Adicionar Termo</span>
                    </button>
                </form>

                {/* NUVEM DE TAGS ATIVAS COM BOTÃO DE REMOVER RÁPIDO */}
                {selectedTags.length > 0 && (
                    <div className="pt-2 border-t border-slate-800/80 space-y-1.5">
                        <div className="flex items-center justify-between text-[11px] text-slate-400">
                            <span className="font-semibold text-slate-300">Termos Ativos no Bloqueio:</span>
                            <span className="text-[10px] text-slate-500">Clique na tag para desativar</span>
                        </div>
                        <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto custom-scrollbar p-1">
                            {selectedTags.map((tag, idx) => (
                                <button
                                    key={`active-${idx}-${tag}`}
                                    type="button"
                                    onClick={() => toggleTag(tag)}
                                    className="px-2.5 py-1 rounded-lg text-xs font-mono font-medium bg-rose-500/20 text-rose-200 border border-rose-500/40 hover:bg-rose-500/30 hover:border-rose-400 flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer group"
                                    title={`Remover "${tag}"`}
                                >
                                    <span>{tag}</span>
                                    <span className="text-rose-400 group-hover:text-white font-bold text-[10px]">✕</span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* BARRA DE FILTROS & BUSCA DE SITUAÇÕES */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 custom-scrollbar">
                    <button
                        type="button"
                        onClick={() => setActiveCategoryFilter('all')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                            activeCategoryFilter === 'all'
                                ? 'bg-rose-600 text-white shadow-md shadow-rose-600/25 ring-1 ring-rose-400'
                                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-slate-800'
                        }`}
                    >
                        Todas as Situações ({NEGATIVE_SITUATIONS.length})
                    </button>
                    {NEGATIVE_SITUATIONS.map(sit => {
                        const Icon = sit.icon;
                        const isCurrent = activeCategoryFilter === sit.id;
                        return (
                            <button
                                key={sit.id}
                                type="button"
                                onClick={() => setActiveCategoryFilter(sit.id)}
                                className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                                    isCurrent
                                        ? 'bg-slate-800 text-white border border-slate-600 shadow-sm'
                                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 border border-slate-850'
                                }`}
                            >
                                <Icon size={12} className={isCurrent ? 'text-rose-400' : 'text-slate-500'} />
                                <span>{sit.title.split('&')[0].trim()}</span>
                            </button>
                        );
                    })}
                </div>

                <div className="relative min-w-[220px]">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Buscar termo ou situação..."
                        className="w-full bg-slate-900 border border-slate-800 focus:border-slate-700 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder:text-slate-500 outline-none transition-colors"
                    />
                    {searchTerm && (
                        <button
                            onClick={() => setSearchTerm('')}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                        >
                            ✕
                        </button>
                    )}
                </div>
            </div>

            {/* GRADE DE SITUAÇÕES COM PILL CLOUD INTERATIVO */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                {filteredSituations.map(situation => {
                    const Icon = situation.icon;
                    const allSelected = situation.tags.every(t => isTagSelected(t));
                    const selectedCount = situation.tags.filter(t => isTagSelected(t)).length;

                    return (
                        <div
                            key={situation.id}
                            className={`rounded-2xl border transition-all duration-200 p-4 sm:p-5 flex flex-col justify-between space-y-4 shadow-lg ${situation.cardBorder}`}
                        >
                            <div className="space-y-3">
                                {/* Header do Card da Situação */}
                                <div className="flex items-start justify-between gap-2">
                                    <div className="flex items-center gap-2.5">
                                        <div className="w-9 h-9 rounded-xl bg-slate-800/90 border border-slate-700/80 flex items-center justify-center text-rose-400 shadow-sm shrink-0">
                                            <Icon size={18} />
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                                                <span>{situation.title}</span>
                                            </h3>
                                            <p className="text-[11px] text-slate-400 font-medium">
                                                {situation.subtitle}
                                            </p>
                                        </div>
                                    </div>
                                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-black border uppercase tracking-wider shrink-0 ${situation.badgeColor}`}>
                                        {situation.badge}
                                    </span>
                                </div>

                                <p className="text-xs text-slate-400 leading-relaxed">
                                    {situation.description}
                                </p>

                                {/* Mini Ações da Categoria */}
                                <div className="flex items-center justify-between pt-1 border-t border-slate-800/80 text-[11px]">
                                    <div className="text-slate-400 font-mono text-[10px]">
                                        <span className="font-bold text-rose-300">{selectedCount}</span> de {situation.tags.length} selecionados
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <button
                                            type="button"
                                            onClick={() => selectAllFromCategory(situation.tags)}
                                            className="px-2 py-0.5 rounded-md text-[10px] font-bold text-blue-300 hover:text-white bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 transition-all cursor-pointer"
                                        >
                                            Todos
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => deselectAllFromCategory(situation.tags)}
                                            className="px-2 py-0.5 rounded-md text-[10px] font-medium text-slate-400 hover:text-slate-200 bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 transition-all cursor-pointer"
                                        >
                                            Nenhum
                                        </button>
                                    </div>
                                </div>

                                {/* Nuvem de Tags da Categoria */}
                                <div className="flex flex-wrap gap-1.5 pt-1">
                                    {situation.tags.map(tag => {
                                        const active = isTagSelected(tag);
                                        return (
                                            <button
                                                key={`${situation.id}-${tag}`}
                                                type="button"
                                                onClick={() => toggleTag(tag)}
                                                className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-all cursor-pointer flex items-center gap-1 active:scale-95 ${
                                                    active
                                                        ? 'bg-rose-500/25 text-rose-200 border border-rose-500/50 shadow-sm font-semibold'
                                                        : 'bg-slate-950/80 text-slate-400 border border-slate-800 hover:border-slate-700 hover:text-slate-200'
                                                }`}
                                                title={`Clique para ${active ? 'desmarcar' : 'bloquear'} este termo`}
                                            >
                                                <span>{active ? '✓' : '+'}</span>
                                                <span>{tag}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Botão de Rodapé Especial para a Categoria */}
                            {situation.id === 'remaster_16k' && (
                                <div className="pt-2">
                                    <button
                                        type="button"
                                        onClick={handleApply16kOfficialPreset}
                                        className="w-full py-2 px-3 rounded-xl text-xs font-extrabold bg-gradient-to-r from-amber-500/20 via-yellow-500/20 to-orange-500/20 hover:from-amber-500/30 hover:to-orange-500/30 text-amber-200 border border-amber-500/40 shadow-md flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                                    >
                                        <Sparkles size={13} className="text-amber-400" />
                                        <span>Carregar Preset Oficial 16K Remaster</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* SEÇÃO INFORMATIVA: COMO USAR PROMPTS NEGATIVOS COM EFICÁCIA */}
            <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 sm:p-5 text-xs text-slate-400 space-y-3">
                <div className="flex items-center gap-2 text-slate-200 font-bold text-sm">
                    <HelpCircle size={16} className="text-blue-400" />
                    <span>Dicas de Ouro para Prompts Negativos em IA de Imagem</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
                    <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/60 space-y-1">
                        <p className="font-bold text-slate-200">1. Midjourney (--no)</p>
                        <p className="text-slate-400 leading-relaxed text-[11px]">
                            O Midjourney utiliza o parâmetro <code className="text-amber-300">--no</code> no final do prompt. Ele não aceita palavras vazias ou pontuação extra. O estúdio formata automaticamente com vírgulas.
                        </p>
                    </div>
                    <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/60 space-y-1">
                        <p className="font-bold text-slate-200">2. Google ImageFX / Flux / DALL-E</p>
                        <p className="text-slate-400 leading-relaxed text-[11px]">
                            Modelos como Flux e ImageFX respondem muito bem a exclusões explícitas no formato <code className="text-amber-300">exclude: ...</code> ou instruções afirmativas combinadas.
                        </p>
                    </div>
                    <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/60 space-y-1">
                        <p className="font-bold text-slate-200">3. Preservação de Rosto e 16K</p>
                        <p className="text-slate-400 leading-relaxed text-[11px]">
                            Para manter o rosto idêntico da foto enviada, nunca deixe a IA inventar poros ou pelos extras. O preset <strong className="text-amber-300 font-bold">Remaster 16K</strong> foi calibrado para fidelidade 1:1 absoluta.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};
