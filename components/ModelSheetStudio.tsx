import React, { useState, useEffect } from 'react';
import { 
    User, Sparkles, Copy, Check, RefreshCw, Wand2, Palette, 
    Layers, Camera, Sliders, Eye, Heart, Zap, Shield, 
    Maximize2, ChevronDown, ChevronRight, Plus, Trash2, Tag, 
    Shirt, Compass, Sun, Flame, Box, HelpCircle
} from 'lucide-react';
import type { ModelSheetData, CharacterColorSwatch } from '../types.ts';
import { 
    SOAIMA_PRESET, 
    SOFIA_PRESET, 
    MALE_MODEL_PRESET,
    MALE_CASUAL_PRESET,
    MALE_BUSINESS_PRESET,
    FEMALE_CASUAL_PRESET,
    DEFAULT_MODEL_SHEET, 
    extractModelSheetFromImage, 
    compileModelSheetPrompt 
} from '../services/modelSheetService.ts';

interface ModelSheetStudioProps {
    activeImageBase64?: string;
    activeImageMimeType?: string;
    activeImageName?: string;
    targetPlatform?: string;
    onApplyPrompt: (compiledPrompt: string) => void;
    onCreateVisual?: (promptText: string) => void;
    isGeneratingVisual?: boolean;
    onSwitchToArchitect?: () => void;
}

type StudioSection = 'profile' | 'turnaround' | 'face' | 'expressions' | 'poses' | 'costume' | 'palette' | 'lighting';

const EMOTIONS_LIST = [
    { id: 'neutral', label: 'Neutra (Neutral)', desc: 'Olhar calmo, boca relaxada, sobrancelhas naturais' },
    { id: 'happy', label: 'Feliz (Happy)', desc: 'Sorriso radiante, olhos brilhantes e expressivos' },
    { id: 'angry', label: 'Zangada (Angry)', desc: 'Olhar firme e penetrante, testa franzida, tensão' },
    { id: 'sad', label: 'Triste (Sad)', desc: 'Olhar melancólico, cantos da boca caídos suavemente' },
    { id: 'surprised', label: 'Surpresa (Surprised)', desc: 'Olhos arregalados, sobrancelhas elevadas, boca aberta' },
    { id: 'worried', label: 'Preocupada (Worried)', desc: 'Olhar apreensivo, sobrancelhas tensas ao centro' },
    { id: 'confident', label: 'Confiante (Confident)', desc: 'Queixo erguido, meio sorriso seguro, olhar direto' },
    { id: 'determined', label: 'Determinada (Determined)', desc: 'Expressão focada, mandíbula firme, olhar obstinado' },
];

const POSES_LIST = [
    { id: 'neutral_stand', label: 'Em Pé Neutro', desc: 'Postura ereta natural, braços ao lado do corpo' },
    { id: 'walking', label: 'Caminhando', desc: 'Passo elegante para a frente, movimento fluido do tecido' },
    { id: 'sitting', label: 'Sentada', desc: 'Sentada em banqueta minimalista, pernas cruzadas ou elegantes' },
    { id: 'relaxed', label: 'Relaxada', desc: 'Peso apoiado em uma perna, ombros descontraídos' },
    { id: 'tense', label: 'Tensa / Alerta', desc: 'Postura rígida, cabeça em leve giro, mãos firmes' },
    { id: 'action_ready', label: 'Pronta para Ação', desc: 'Base corporal dinâmica, olhar concentrado' },
];

const FABRIC_OPTIONS = [
    'Seda / Cetim', 'Chiffon', 'Crepe', 'Renda (Lace)', 'Couro (Leather)', 
    'Camurça (Suede)', 'Algodão Pima', 'Linho Puro', 'Veludo Macio', 'Twill Estruturado'
];

export const ModelSheetStudio: React.FC<ModelSheetStudioProps> = ({
    activeImageBase64,
    activeImageMimeType = 'image/jpeg',
    activeImageName,
    targetPlatform = 'midjourney',
    onApplyPrompt,
    onCreateVisual,
    isGeneratingVisual = false,
    onSwitchToArchitect
}) => {
    const [data, setData] = useState<ModelSheetData>(DEFAULT_MODEL_SHEET);
    const [activeSection, setActiveSection] = useState<StudioSection>('profile');
    const [isExtracting, setIsExtracting] = useState<boolean>(false);
    const [extractSuccess, setExtractSuccess] = useState<string | null>(null);
    const [copied, setCopied] = useState<boolean>(false);
    const [appliedSuccess, setAppliedSuccess] = useState<boolean>(false);
    const [showLivePrompt, setShowLivePrompt] = useState<boolean>(false);

    // Prompt compilado em tempo real
    const currentPrompt = compileModelSheetPrompt(data, targetPlatform);

    // Atualizador de campo genérico
    const updateField = <K extends keyof ModelSheetData>(field: K, value: ModelSheetData[K]) => {
        setData(prev => ({ ...prev, [field]: value }));
    };

    // Auto-preencher com IA a partir da imagem ativa
    const handleAutoExtract = async () => {
        if (!activeImageBase64) return;
        setIsExtracting(true);
        setExtractSuccess(null);
        try {
            const extracted = await extractModelSheetFromImage(activeImageBase64, activeImageMimeType);
            setData(prev => ({
                ...prev,
                ...extracted,
                // Garante que swatches e arrays não fiquem vazios
                colorSwatches: (extracted.colorSwatches && extracted.colorSwatches.length > 0) 
                    ? extracted.colorSwatches 
                    : prev.colorSwatches,
                materialReferences: (extracted.materialReferences && extracted.materialReferences.length > 0)
                    ? extracted.materialReferences
                    : prev.materialReferences,
                fabricTextures: (extracted.fabricTextures && extracted.fabricTextures.length > 0)
                    ? extracted.fabricTextures
                    : prev.fabricTextures,
            }));
            setExtractSuccess(`Ficha técnica extraída com sucesso de "${activeImageName || 'imagem'}"!`);
            setTimeout(() => setExtractSuccess(null), 4000);
        } catch (err: any) {
            console.error('Falha ao extrair ficha de modelo:', err);
            setExtractSuccess('Não foi possível extrair automaticamente. Você pode preencher manualmente ou usar um preset.');
            setTimeout(() => setExtractSuccess(null), 5000);
        } finally {
            setIsExtracting(false);
        }
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(currentPrompt);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleApply = () => {
        onApplyPrompt(currentPrompt);
        setAppliedSuccess(true);
        setTimeout(() => setAppliedSuccess(false), 2500);
    };

    const handleGenerateVisual = () => {
        onApplyPrompt(currentPrompt);
        if (onCreateVisual) {
            onCreateVisual(currentPrompt);
        }
    };

    const handleAddColorSwatch = () => {
        const newId = `c_${Date.now()}`;
        const newSwatch: CharacterColorSwatch = { id: newId, label: 'Nova Cor', hex: '#FFFFFF' };
        setData(prev => ({
            ...prev,
            colorSwatches: [...prev.colorSwatches, newSwatch]
        }));
    };

    const handleUpdateColorSwatch = (id: string, key: 'label' | 'hex', value: string) => {
        setData(prev => ({
            ...prev,
            colorSwatches: prev.colorSwatches.map(c => c.id === id ? { ...c, [key]: value } : c)
        }));
    };

    const handleRemoveColorSwatch = (id: string) => {
        setData(prev => ({
            ...prev,
            colorSwatches: prev.colorSwatches.filter(c => c.id !== id)
        }));
    };

    const handleToggleFabric = (fabric: string) => {
        setData(prev => {
            const exists = prev.fabricTextures.includes(fabric);
            return {
                ...prev,
                fabricTextures: exists 
                    ? prev.fabricTextures.filter(f => f !== fabric)
                    : [...prev.fabricTextures, fabric]
            };
        });
    };

    // Alternador inteligente de Gênero (Homem / Mulher) com adaptação automática de biometria e traje
    const handleSwitchGender = (newGender: 'woman' | 'man') => {
        if (newGender === data.gender) return;

        if (newGender === 'man') {
            setData(prev => {
                const isCurrentlyDefaultFemale = 
                    prev.characterName === 'Aura' || 
                    prev.characterName === 'Soaima AI' || 
                    prev.characterName === 'Sofia' || 
                    prev.characterName === 'Clara';

                return {
                    ...prev,
                    gender: 'man',
                    characterName: isCurrentlyDefaultFemale ? 'Lucas' : prev.characterName,
                    role: prev.role.includes('Feminina') || prev.role.includes('Model') ? 'Protagonista / Modelo Masculino' : prev.role,
                    bodyType: prev.bodyType === 'Slim' || prev.bodyType === 'Slim / Elegante' || prev.bodyType === 'Curvy' ? 'Athletic / Fit Masculine' : prev.bodyType,
                    facialStructure: (prev.facialStructure.includes('feminina') || prev.facialStructure.includes('oval') || prev.facialStructure.includes('suave'))
                        ? 'Estrutura óssea facial masculina definida, mandíbula angular esculpida, maçãs do rosto marcadas'
                        : prev.facialStructure || 'Estrutura óssea facial masculina definida, mandíbula angular esculpida',
                    facialHair: prev.facialHair && prev.facialHair !== 'Nenhum' ? prev.facialHair : 'Barba por fazer bem aparada e alinhada (clean stubble)',
                    hair: (prev.hair.includes('longo') || prev.hair.includes('ondulado') || prev.hair.includes('ondas'))
                        ? 'Cabelo curto texturizado masculino, corte moderno com fade sutil nas têmporas'
                        : prev.hair,
                    hairColorHex: prev.hairColorHex || '#251E1A',
                    makeup: 'Pele limpa e natural sem maquiagem',
                    outfitType: prev.outfitType.toLowerCase().includes('vestido')
                        ? 'Jaqueta bomber ou blazer de alfaiataria carmesim moderno sobre camiseta escura e calça chino ajustada'
                        : prev.outfitType,
                    topNeckline: prev.topNeckline.toLowerCase().includes('decote') || prev.topNeckline.toLowerCase().includes('ombro')
                        ? 'Gola estruturada de jaqueta/blazer moderno'
                        : prev.topNeckline,
                    bottomPiece: prev.bottomPiece.toLowerCase().includes('vestido') || prev.bottomPiece.toLowerCase().includes('saia') || prev.bottomPiece.toLowerCase().includes('fenda')
                        ? 'Calça alfaiataria escura de caimento reto contemporâneo'
                        : prev.bottomPiece,
                    footwear: prev.footwear.toLowerCase().includes('salto') || prev.footwear.toLowerCase().includes('sandália')
                        ? 'Bota chelsea de couro legítimo ou tênis minimalista premium'
                        : prev.footwear,
                    accessories: prev.accessories.toLowerCase().includes('brinco')
                        ? 'Relógio analógico minimalista com pulseira de couro'
                        : prev.accessories,
                    renderStyle: 'Fotorealista 8K, Master Studio Male Character Sheet'
                };
            });
            setExtractSuccess('Modo Masculino (Homem) ativado: traços anatômicos, corte de cabelo e figurino adaptados!');
            setTimeout(() => setExtractSuccess(null), 3000);
        } else {
            setData(prev => {
                const isCurrentlyDefaultMale = 
                    prev.characterName === 'Lucas' || 
                    prev.characterName === 'Alex' || 
                    prev.characterName === 'Gabriel';

                return {
                    ...prev,
                    gender: 'woman',
                    characterName: isCurrentlyDefaultMale ? 'Aura' : prev.characterName,
                    role: prev.role.includes('Masculino') ? 'Protagonista / Modelo Feminina' : prev.role,
                    bodyType: prev.bodyType === 'Athletic / Fit Masculine' || prev.bodyType.includes('Masculine') ? 'Slim / Elegante' : prev.bodyType,
                    facialStructure: (prev.facialStructure.includes('masculina') || prev.facialStructure.includes('mandíbula angular'))
                        ? 'Rosto oval simétrico, maçãs do rosto suaves, linha de mandíbula graciosa'
                        : prev.facialStructure || 'Rosto oval simétrico, maçãs do rosto definidas',
                    facialHair: 'Nenhum',
                    hair: (prev.hair.includes('curto') || prev.hair.includes('fade') || prev.hair.includes('slick back'))
                        ? 'Cabelo longo ondulado castanho escuro com divisão central fluida'
                        : prev.hair,
                    hairColorHex: prev.hairColorHex || '#3B2A1F',
                    makeup: 'Maquiagem natural glow com contorno suave e iluminador discreto',
                    outfitType: prev.outfitType.toLowerCase().includes('jaqueta bomber') || prev.outfitType.toLowerCase().includes('costume') || prev.outfitType.toLowerCase().includes('blazer masculino')
                        ? 'Vestido contemporâneo elegante ou conjunto sofisticado com corte fluido'
                        : prev.outfitType,
                    topNeckline: prev.topNeckline.toLowerCase().includes('colarinho') || prev.topNeckline.toLowerCase().includes('gola estruturada')
                        ? 'Decote assimétrico moderno com drapeado'
                        : prev.topNeckline,
                    bottomPiece: prev.bottomPiece.toLowerCase().includes('chino')
                        ? 'Comprimento midi com fenda sutil ou calça alfaiataria elegante'
                        : prev.bottomPiece,
                    footwear: prev.footwear.toLowerCase().includes('bota chelsea') || prev.footwear.toLowerCase().includes('oxford')
                        ? 'Sandália de salto fino delicada ou tênis minimalista'
                        : prev.footwear,
                    accessories: prev.accessories.toLowerCase().includes('relógio') || prev.accessories.toLowerCase().includes('abotoaduras')
                        ? 'Brincos pequenos dourados e colar delicado'
                        : prev.accessories,
                    renderStyle: 'Fotorealista 8K, Master Studio Portrait'
                };
            });
            setExtractSuccess('Modo Feminino (Mulher) ativado: traços anatômicos, cabelo e vestuário adaptados!');
            setTimeout(() => setExtractSuccess(null), 3000);
        }
    };

    return (
        <div className="bg-slate-900/95 border border-slate-800 rounded-2xl p-4 sm:p-5 backdrop-blur-xl shadow-2xl flex flex-col gap-5 text-slate-200">
            {/* Header com Navegação e Presets de 1 Clique */}
            <div className="flex flex-col gap-3 pb-3 border-b border-slate-800/80">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                        <div className="p-2 rounded-xl bg-gradient-to-br from-red-600 via-pink-600 to-amber-600 text-white shadow-lg shadow-red-500/20">
                            <Layers size={18} />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h2 className="text-base font-black text-white tracking-wide">
                                    Ficha de Personagem & Consistência
                                </h2>
                                <span className="px-2 py-0.5 text-[9px] font-black uppercase rounded-full bg-red-500/20 text-red-300 border border-red-500/30">
                                    Model Sheet
                                </span>
                            </div>
                            <p className="text-xs text-slate-400">
                                Altere tudo antes de gerar o prompt: gênero (homem/mulher), 4 vistas, biometria, 8 expressões, 6 poses, figurino e cores Hex
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {onSwitchToArchitect && (
                            <button
                                onClick={onSwitchToArchitect}
                                className="px-2.5 py-1.5 rounded-lg bg-blue-600/20 border border-blue-500/40 text-blue-300 hover:text-white transition-all text-xs font-bold flex items-center gap-1.5"
                            >
                                <Sliders size={13} />
                                <span>Arquiteto Geral</span>
                            </button>
                        )}
                    </div>
                </div>

                {/* Seletor Master de Gênero: Mulher / Homem (Destacado no Topo) */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-slate-950/90 p-3 rounded-xl border border-slate-800 gap-3">
                    <div className="flex items-center gap-3">
                        <span className="text-xs font-black uppercase text-slate-300 flex items-center gap-1.5">
                            <User size={14} className={data.gender === 'man' ? 'text-blue-400' : 'text-pink-400'} />
                            <span>Gênero do Personagem:</span>
                        </span>
                        
                        <div className="inline-flex p-1 bg-slate-900 border border-slate-700/80 rounded-xl shadow-inner">
                            <button
                                type="button"
                                onClick={() => handleSwitchGender('woman')}
                                className={`px-3.5 py-1.5 rounded-lg text-xs font-black flex items-center gap-2 transition-all cursor-pointer ${
                                    data.gender === 'woman'
                                        ? 'bg-gradient-to-r from-pink-600 via-rose-600 to-red-600 text-white shadow-lg shadow-pink-500/30 ring-1 ring-pink-400'
                                        : 'text-slate-400 hover:text-slate-200'
                                }`}
                            >
                                <span className="text-sm">👩</span>
                                <span>Mulher (Woman)</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => handleSwitchGender('man')}
                                className={`px-3.5 py-1.5 rounded-lg text-xs font-black flex items-center gap-2 transition-all cursor-pointer ${
                                    data.gender === 'man'
                                        ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 text-white shadow-lg shadow-blue-500/30 ring-1 ring-blue-400'
                                        : 'text-slate-400 hover:text-slate-200'
                                }`}
                            >
                                <span className="text-sm">👨</span>
                                <span>Homem (Man)</span>
                            </button>
                        </div>
                    </div>

                    <div className="text-[11px] text-slate-400 flex items-center gap-2">
                        <span className={`font-mono text-[10px] px-2.5 py-1 rounded-md border font-bold ${
                            data.gender === 'woman' 
                                ? 'bg-pink-500/10 border-pink-500/30 text-pink-300' 
                                : 'bg-blue-500/10 border-blue-500/30 text-blue-300'
                        }`}>
                            {data.gender === 'woman' ? '✓ Modo Mulher Ativo' : '✓ Modo Homem Ativo'}
                        </span>
                        <span className="text-slate-500 text-[10px] hidden md:inline">
                            (adapta automaticamente traços, barba, cabelo e figurino)
                        </span>
                    </div>
                </div>

                {/* Presets Rápidos Contextuais por Gênero */}
                <div className="flex items-center gap-2 flex-wrap pt-0.5">
                    <button
                        onClick={handleAutoExtract}
                        disabled={!activeImageBase64 || isExtracting}
                        className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-blue-500/20 transition-all active:scale-95 disabled:opacity-40"
                        title={activeImageBase64 ? "Usar IA Vision para analisar a foto e preencher todos os campos" : "Carregue uma imagem na esquerda para auto-preencher"}
                    >
                        {isExtracting ? (
                            <RefreshCw size={13} className="animate-spin text-white" />
                        ) : (
                            <Wand2 size={13} className="text-amber-300" />
                        )}
                        <span>{isExtracting ? "Analisando com IA..." : "Auto-Preencher com IA da Foto"}</span>
                    </button>

                    {data.gender === 'woman' ? (
                        <>
                            <button
                                onClick={() => setData(SOAIMA_PRESET)}
                                className="px-2.5 py-1.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 border border-red-500/40 text-red-300 hover:text-white font-bold text-[11px] flex items-center gap-1.5 transition-all"
                                title="Carregar Template Soaima AI (Vestido Vermelho / Red Dress da referência 1)"
                            >
                                <span className="w-2 h-2 rounded-full bg-red-500" />
                                <span>Preset Soaima (Vestido)</span>
                            </button>

                            <button
                                onClick={() => setData(SOFIA_PRESET)}
                                className="px-2.5 py-1.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 border border-amber-500/40 text-amber-300 hover:text-white font-bold text-[11px] flex items-center gap-1.5 transition-all"
                                title="Carregar Template Sofia (Conjunto Vermelho & Tênis Branco da referência 2)"
                            >
                                <span className="w-2 h-2 rounded-full bg-amber-400" />
                                <span>Preset Sofia (Conjunto)</span>
                            </button>

                            <button
                                onClick={() => setData(FEMALE_CASUAL_PRESET)}
                                className="px-2.5 py-1.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 border border-pink-500/40 text-pink-300 hover:text-white font-bold text-[11px] flex items-center gap-1.5 transition-all"
                                title="Carregar Template Clara (Blazer Bege & Jeans Casual)"
                            >
                                <span className="w-2 h-2 rounded-full bg-pink-400" />
                                <span>Preset Clara (Casual Chic)</span>
                            </button>
                        </>
                    ) : (
                        <>
                            <button
                                onClick={() => setData(MALE_MODEL_PRESET)}
                                className="px-2.5 py-1.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 border border-blue-500/40 text-blue-300 hover:text-white font-bold text-[11px] flex items-center gap-1.5 transition-all"
                                title="Carregar Template Masculino (Lucas - Jaqueta Carmesim & Alfaiataria)"
                            >
                                <span className="w-2 h-2 rounded-full bg-blue-500" />
                                <span>Preset Lucas (Jaqueta Carmesim)</span>
                            </button>

                            <button
                                onClick={() => setData(MALE_CASUAL_PRESET)}
                                className="px-2.5 py-1.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 border border-cyan-500/40 text-cyan-300 hover:text-white font-bold text-[11px] flex items-center gap-1.5 transition-all"
                                title="Carregar Template Masculino Alex (Camisa Linho & Calça Chino)"
                            >
                                <span className="w-2 h-2 rounded-full bg-cyan-400" />
                                <span>Preset Alex (Casual Linho)</span>
                            </button>

                            <button
                                onClick={() => setData(MALE_BUSINESS_PRESET)}
                                className="px-2.5 py-1.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 border border-indigo-500/40 text-indigo-300 hover:text-white font-bold text-[11px] flex items-center gap-1.5 transition-all"
                                title="Carregar Template Masculino Gabriel (Editorial Business & Terno Slim)"
                            >
                                <span className="w-2 h-2 rounded-full bg-indigo-400" />
                                <span>Preset Gabriel (Terno Editorial)</span>
                            </button>
                        </>
                    )}

                    <button
                        onClick={() => setData(data.gender === 'man' ? MALE_MODEL_PRESET : DEFAULT_MODEL_SHEET)}
                        className="px-2 py-1.5 rounded-xl bg-slate-800/60 hover:bg-slate-700 border border-slate-700 text-slate-400 hover:text-slate-200 text-[11px] font-medium transition-all ml-auto"
                        title="Restaurar padrão limpo para o gênero atual"
                    >
                        Limpar
                    </button>
                </div>

                {extractSuccess && (
                    <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in">
                        <Sparkles size={14} className="text-emerald-400 shrink-0" />
                        <span>{extractSuccess}</span>
                    </div>
                )}
            </div>

            {/* Seletor de Tipo de Saída (Layout do Prompt) */}
            <div className="space-y-1.5 bg-slate-950/70 p-3 rounded-xl border border-slate-800">
                <label className="text-[10px] font-black uppercase text-slate-400 flex items-center gap-1.5">
                    <Maximize2 size={12} className="text-red-400" />
                    <span>Modo de Apresentação / Layout de Saída</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-1.5">
                    {[
                        { id: 'full_model_sheet', label: 'Ficha Completa (Grid)', desc: 'Turnaround + Rosto + 8 Expressões + 6 Poses' },
                        { id: 'turnaround_4_views', label: 'Turnaround 4 Vistas', desc: 'Frontal, 3/4, Perfil e Costas alinhados' },
                        { id: 'expression_grid', label: 'Grade 8 Emoções', desc: 'Tabela 2x4 com expressões faciais' },
                        { id: 'pose_grid', label: 'Grade 6 Poses', desc: 'Tabela com posturas corporais' },
                        { id: 'single_shot', label: 'Ensaio Individual', desc: 'Render fotográfico único personalizado' },
                    ].map(opt => (
                        <button
                            key={opt.id}
                            onClick={() => updateField('outputType', opt.id as any)}
                            className={`p-2 rounded-lg text-left border transition-all ${
                                data.outputType === opt.id
                                    ? 'bg-red-600/20 border-red-500 text-white shadow-md shadow-red-500/20'
                                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                            }`}
                        >
                            <div className="text-[11px] font-black leading-tight">{opt.label}</div>
                            <div className="text-[9px] text-slate-500 leading-tight mt-0.5 truncate">{opt.desc}</div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Menu de Abas de Seções */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1 border-b border-slate-800/80 custom-scrollbar">
                {[
                    { id: 'profile', label: '1. Perfil', icon: User },
                    { id: 'turnaround', label: '2. 4 Vistas', icon: Compass },
                    { id: 'face', label: '3. Rosto & Biometria', icon: Eye },
                    { id: 'expressions', label: '4. Expressões (8)', icon: Heart },
                    { id: 'poses', label: '5. Poses (6)', icon: Zap },
                    { id: 'costume', label: '6. Figurino', icon: Shirt },
                    { id: 'palette', label: '7. Cores Hex', icon: Palette },
                    { id: 'lighting', label: '8. Estúdio & Luz', icon: Sun },
                ].map(sec => {
                    const Icon = sec.icon;
                    const isActive = activeSection === sec.id;
                    return (
                        <button
                            key={sec.id}
                            onClick={() => setActiveSection(sec.id as StudioSection)}
                            className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap flex items-center gap-1.5 transition-all shrink-0 ${
                                isActive
                                    ? 'bg-red-600 text-white shadow-lg shadow-red-500/25 ring-1 ring-red-400'
                                    : 'text-slate-400 hover:text-white hover:bg-slate-800/70'
                            }`}
                        >
                            <Icon size={13} className={isActive ? 'text-white' : 'text-slate-400'} />
                            <span>{sec.label}</span>
                        </button>
                    );
                })}
            </div>

            {/* Conteúdo da Seção Ativa */}
            <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800/80 space-y-4">
                
                {/* 1. PERFIL DO PERSONAGEM */}
                {activeSection === 'profile' && (
                    <div className="space-y-4 animate-in fade-in">
                        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                            <span className="text-xs font-black uppercase text-red-400 tracking-wider">
                                1. Character Profile (Perfil do Personagem)
                            </span>
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] text-slate-400 font-bold uppercase">Gênero:</span>
                                <div className="inline-flex p-0.5 bg-slate-900 border border-slate-700 rounded-lg">
                                    <button
                                        type="button"
                                        onClick={() => handleSwitchGender('woman')}
                                        className={`px-2.5 py-1 rounded text-[11px] font-black flex items-center gap-1 transition-all ${
                                            data.gender === 'woman'
                                                ? 'bg-pink-600 text-white shadow'
                                                : 'text-slate-400 hover:text-white'
                                        }`}
                                    >
                                        <span>👩</span>
                                        <span>Mulher</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleSwitchGender('man')}
                                        className={`px-2.5 py-1 rounded text-[11px] font-black flex items-center gap-1 transition-all ${
                                            data.gender === 'man'
                                                ? 'bg-blue-600 text-white shadow'
                                                : 'text-slate-400 hover:text-white'
                                        }`}
                                    >
                                        <span>👨</span>
                                        <span>Homem</span>
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-400 uppercase">Nome / Sujeito</label>
                                <input 
                                    type="text"
                                    value={data.characterName}
                                    onChange={e => updateField('characterName', e.target.value)}
                                    placeholder={data.gender === 'man' ? "Ex: Lucas / Alex / Gabriel" : "Ex: Soaima AI / Sofia / Clara"}
                                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white outline-none focus:border-red-500"
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-400 uppercase">Papel / Função</label>
                                <input 
                                    type="text"
                                    value={data.role}
                                    onChange={e => updateField('role', e.target.value)}
                                    placeholder={data.gender === 'man' ? "Ex: Protagonista / Modelo Masculino" : "Ex: Creator / Modelo Feminina"}
                                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white outline-none focus:border-red-500"
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-400 uppercase">Idade Estimada</label>
                                <input 
                                    type="text"
                                    value={data.age}
                                    onChange={e => updateField('age', e.target.value)}
                                    placeholder="Ex: 22-26 / Mid 20s"
                                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white outline-none focus:border-red-500"
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-400 uppercase">Altura / Biótipo</label>
                                <input 
                                    type="text"
                                    value={data.height}
                                    onChange={e => updateField('height', e.target.value)}
                                    placeholder={data.gender === 'man' ? "Ex: 6'0\" (183 cm) - Athletic" : "Ex: 5'8\" (173 cm) - Slim"}
                                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white outline-none focus:border-red-500"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-400 uppercase">Personalidade / Atitude</label>
                                <input 
                                    type="text"
                                    value={data.personality}
                                    onChange={e => updateField('personality', e.target.value)}
                                    placeholder={data.gender === 'man' ? "Ex: Confiante, carismático, determinado, moderno" : "Ex: Criativa, confiante, empática, profissional, elegante"}
                                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white outline-none focus:border-red-500"
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-400 uppercase">Biótipo Corporal ({data.gender === 'man' ? 'Masculino' : 'Feminino'})</label>
                                <select 
                                    value={data.bodyType}
                                    onChange={e => updateField('bodyType', e.target.value)}
                                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white outline-none focus:border-red-500 h-8"
                                >
                                    {data.gender === 'man' ? (
                                        <>
                                            <option value="Athletic / Fit Masculine">Athletic / Fit Masculine (Atlético e Definido)</option>
                                            <option value="Muscular / Broad Shoulders">Muscular / Broad Shoulders (Musculoso / Ombros Largos)</option>
                                            <option value="Tall / Lean Masculine">Tall / Lean Masculine (Alto e Esguio)</option>
                                            <option value="Slim Fit">Slim Fit (Magro Elegante)</option>
                                            <option value="Stocky / Sturdy">Stocky / Sturdy (Forte / Robusto)</option>
                                            <option value="Natural Average">Natural Average (Médio Natural)</option>
                                        </>
                                    ) : (
                                        <>
                                            <option value="Slim">Slim (Magro / Elegante)</option>
                                            <option value="Slim / Athletic">Slim / Athletic (Atlético Definido)</option>
                                            <option value="Curvy">Curvy (Curvilíneo)</option>
                                            <option value="Petite">Petite (Baixa / Delicada)</option>
                                            <option value="Muscular">Muscular (Feminino Muscular)</option>
                                            <option value="Average">Average (Médio Natural)</option>
                                        </>
                                    )}
                                </select>
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase">Traços Distintivos (Distinctive Traits)</label>
                            <textarea 
                                value={data.distinctiveTraits}
                                onChange={e => updateField('distinctiveTraits', e.target.value)}
                                placeholder="Ex: Olhos amendoados marcantes, mecha suave na divisão do cabelo, postura elegante e sorriso caloroso..."
                                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white outline-none focus:border-red-500 h-14 custom-scrollbar"
                            />
                        </div>
                    </div>
                )}

                {/* 2. 4 VISTAS / FULL-BODY TURNAROUND */}
                {activeSection === 'turnaround' && (
                    <div className="space-y-4 animate-in fade-in">
                        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                            <span className="text-xs font-black uppercase text-red-400 tracking-wider">
                                2. Full-Body Turnaround (4 Vistas Sequenciais)
                            </span>
                            <span className="text-[10px] text-slate-500">Alinhamento corporal 360°</span>
                        </div>

                        <p className="text-xs text-slate-400">
                            Configure o enquadramento de corpo inteiro. No modo de ficha completa, as 4 vistas são renderizadas lado a lado com escala e proporções perfeitamente alinhadas:
                        </p>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            {[
                                { id: 'front', label: 'FRONT VIEW', desc: 'Vista Frontal 100% de frente' },
                                { id: 'three_quarter', label: '3/4 VIEW', desc: 'Ângulo de 45° clássico' },
                                { id: 'profile', label: 'SIDE VIEW', desc: 'Perfil Lateral 90°' },
                                { id: 'back', label: 'BACK VIEW', desc: 'Vista Traseira / Costas' },
                            ].map(view => (
                                <div key={view.id} className="p-3 bg-slate-900 border border-slate-800 rounded-xl flex flex-col gap-1">
                                    <span className="text-xs font-black text-amber-300">{view.label}</span>
                                    <span className="text-[10px] text-slate-400">{view.desc}</span>
                                    <span className="text-[9px] text-emerald-400 mt-auto font-mono">✓ Ativo na Ficha</span>
                                </div>
                            ))}
                        </div>

                        <div className="space-y-1 pt-2">
                            <label className="text-[10px] font-bold text-slate-400 uppercase">Ângulo Específico para Ensaio Individual</label>
                            <select 
                                value={data.activeView}
                                onChange={e => updateField('activeView', e.target.value as any)}
                                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white outline-none focus:border-red-500"
                            >
                                <option value="all_turnaround">Todas as 4 Vistas (Turnaround Completo)</option>
                                <option value="front">Apenas Vista Frontal (Front View)</option>
                                <option value="three_quarter">Apenas Vista 3/4 (3/4 View)</option>
                                <option value="profile">Apenas Perfil Lateral (Side View)</option>
                                <option value="back">Apenas Costas (Back View)</option>
                            </select>
                        </div>
                    </div>
                )}

                {/* 3. ROSTO & BIOMETRIA */}
                {activeSection === 'face' && (
                    <div className="space-y-4 animate-in fade-in">
                        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                            <span className="text-xs font-black uppercase text-red-400 tracking-wider">
                                3. Face and Identity Details (Rosto & Biometria)
                            </span>
                            <span className="text-[10px] text-slate-500">Mapeamento anatômico do rosto</span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-400 uppercase">Estrutura Facial</label>
                                <input 
                                    type="text"
                                    value={data.facialStructure}
                                    onChange={e => updateField('facialStructure', e.target.value)}
                                    placeholder="Ex: Oval, maçãs do rosto altas, mandíbula suave"
                                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white outline-none focus:border-red-500"
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-400 uppercase">Olhos (Formato & Brilho)</label>
                                <input 
                                    type="text"
                                    value={data.eyes}
                                    onChange={e => updateField('eyes', e.target.value)}
                                    placeholder="Ex: Castanhos amendoados expressivos"
                                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white outline-none focus:border-red-500"
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-400 uppercase">Sobrancelhas & Nariz</label>
                                <input 
                                    type="text"
                                    value={data.eyebrows}
                                    onChange={e => updateField('eyebrows', e.target.value)}
                                    placeholder="Ex: Arqueadas, nariz reto e refinado"
                                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white outline-none focus:border-red-500"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="space-y-1 bg-slate-900 p-3 rounded-xl border border-slate-800">
                                <div className="flex items-center justify-between">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase">Tom de Pele & Subtom</label>
                                    <div className="flex items-center gap-1.5">
                                        <input 
                                            type="color" 
                                            value={data.skinToneHex}
                                            onChange={e => updateField('skinToneHex', e.target.value)}
                                            className="w-6 h-6 rounded cursor-pointer border-0 bg-transparent"
                                            title="Seletor de cor da pele"
                                        />
                                        <span className="font-mono text-[10px] text-amber-300 font-bold">{data.skinToneHex}</span>
                                    </div>
                                </div>
                                <input 
                                    type="text"
                                    value={data.skinTone}
                                    onChange={e => updateField('skinTone', e.target.value)}
                                    placeholder="Ex: Pele clara de porcelana com subtom neutro"
                                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white outline-none focus:border-red-500"
                                />
                            </div>

                            <div className="space-y-1 bg-slate-900 p-3 rounded-xl border border-slate-800">
                                <div className="flex items-center justify-between">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase">Cabelo & Textura</label>
                                    <div className="flex items-center gap-1.5">
                                        <input 
                                            type="color" 
                                            value={data.hairColorHex}
                                            onChange={e => updateField('hairColorHex', e.target.value)}
                                            className="w-6 h-6 rounded cursor-pointer border-0 bg-transparent"
                                            title="Seletor de cor do cabelo"
                                        />
                                        <span className="font-mono text-[10px] text-amber-300 font-bold">{data.hairColorHex}</span>
                                    </div>
                                </div>
                                <input 
                                    type="text"
                                    value={data.hair}
                                    onChange={e => updateField('hair', e.target.value)}
                                    placeholder="Ex: Longo ondulado castanho escuro, ondas suaves"
                                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white outline-none focus:border-red-500"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {data.gender === 'man' ? (
                                <div className="space-y-1.5">
                                    <div className="flex items-center justify-between">
                                        <label className="text-[10px] font-bold text-blue-400 uppercase">Barba / Pêlos Faciais (Facial Hair)</label>
                                        <span className="text-[9px] text-slate-500 font-mono">Masculino</span>
                                    </div>
                                    <input 
                                        type="text"
                                        value={data.facialHair || ''}
                                        onChange={e => updateField('facialHair', e.target.value)}
                                        placeholder="Ex: Barba por fazer bem aparada e alinhada (clean stubble)"
                                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white outline-none focus:border-blue-500"
                                    />
                                    <div className="flex flex-wrap gap-1 pt-0.5">
                                        {[
                                            'Sem barba (Clean-shaven)',
                                            'Barba por fazer (Stubble)',
                                            'Barba cheia alinhada',
                                            'Cavanhaque desenhado'
                                        ].map(tag => (
                                            <button
                                                key={tag}
                                                type="button"
                                                onClick={() => updateField('facialHair', tag)}
                                                className="px-2 py-0.5 text-[9px] font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700"
                                            >
                                                {tag}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-pink-400 uppercase">Lábios & Maquiagem</label>
                                    <input 
                                        type="text"
                                        value={data.makeup}
                                        onChange={e => updateField('makeup', e.target.value)}
                                        placeholder="Ex: Maquiagem natural, blush sutil, batom pêssego nude"
                                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white outline-none focus:border-pink-500"
                                    />
                                </div>
                            )}

                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-400 uppercase">Marcas / Tatuagens / Cicatrizes</label>
                                <input 
                                    type="text"
                                    value={data.scarsOrMarks}
                                    onChange={e => updateField('scarsOrMarks', e.target.value)}
                                    placeholder="Ex: Nenhuma cicatriz / sarda delicada"
                                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white outline-none focus:border-red-500"
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* 4. TABELA DE 8 EXPRESSÕES */}
                {activeSection === 'expressions' && (
                    <div className="space-y-4 animate-in fade-in">
                        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                            <span className="text-xs font-black uppercase text-red-400 tracking-wider">
                                4. Expression Sheet (Grade de 8 Emoções)
                            </span>
                            <span className="text-[10px] text-slate-500">Consistência facial sob diferentes sentimentos</span>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                            {EMOTIONS_LIST.map(item => {
                                const isSelected = data.activeExpression === item.id;
                                return (
                                    <button
                                        key={item.id}
                                        type="button"
                                        onClick={() => updateField('activeExpression', item.id as any)}
                                        className={`p-2.5 rounded-xl border text-left transition-all ${
                                            isSelected 
                                                ? 'bg-red-600/30 border-red-500 text-white shadow-md shadow-red-500/20' 
                                                : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                                        }`}
                                    >
                                        <div className="text-xs font-bold flex items-center justify-between">
                                            <span>{item.label}</span>
                                            {isSelected && <span className="w-2 h-2 rounded-full bg-red-400" />}
                                        </div>
                                        <p className="text-[9px] text-slate-500 leading-snug mt-1">{item.desc}</p>
                                    </button>
                                );
                            })}
                        </div>

                        <div className="flex items-center justify-between pt-2">
                            <button
                                onClick={() => updateField('activeExpression', 'all_8_emotions')}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                                    data.activeExpression === 'all_8_emotions'
                                        ? 'bg-red-600 text-white border-red-500'
                                        : 'bg-slate-900 text-slate-400 border-slate-700 hover:text-white'
                                }`}
                            >
                                ✓ Incluir Todas as 8 Emoções na Folha de Expressões (Grid 2x4)
                            </button>
                        </div>
                    </div>
                )}

                {/* 5. TABELA DE 6 POSES */}
                {activeSection === 'poses' && (
                    <div className="space-y-4 animate-in fade-in">
                        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                            <span className="text-xs font-black uppercase text-red-400 tracking-wider">
                                5. Pose & Body Language (Grade de 6 Poses)
                            </span>
                            <span className="text-[10px] text-slate-500">Linguagem corporal e anatomia dinâmica</span>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                            {POSES_LIST.map(pose => {
                                const isSelected = data.activePose === pose.id;
                                return (
                                    <button
                                        key={pose.id}
                                        type="button"
                                        onClick={() => updateField('activePose', pose.id as any)}
                                        className={`p-2.5 rounded-xl border text-left transition-all ${
                                            isSelected 
                                                ? 'bg-red-600/30 border-red-500 text-white shadow-md shadow-red-500/20' 
                                                : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                                        }`}
                                    >
                                        <div className="text-xs font-bold flex items-center justify-between">
                                            <span>{pose.label}</span>
                                            {isSelected && <span className="w-2 h-2 rounded-full bg-red-400" />}
                                        </div>
                                        <p className="text-[9px] text-slate-500 leading-snug mt-1">{pose.desc}</p>
                                    </button>
                                );
                            })}
                        </div>

                        <div className="flex items-center justify-between pt-2">
                            <button
                                onClick={() => updateField('activePose', 'all_6_poses')}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                                    data.activePose === 'all_6_poses'
                                        ? 'bg-red-600 text-white border-red-500'
                                        : 'bg-slate-900 text-slate-400 border-slate-700 hover:text-white'
                                }`}
                            >
                                ✓ Incluir Todas as 6 Poses na Folha de Corpo Inteiro
                            </button>
                        </div>
                    </div>
                )}

                {/* 6. FIGURINO & DETALHES DE TECIDO */}
                {activeSection === 'costume' && (
                    <div className="space-y-4 animate-in fade-in">
                        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                            <span className="text-xs font-black uppercase text-red-400 tracking-wider">
                                6. Costume & Fabric Details (Figurino e Detalhes)
                            </span>
                            <span className="text-[10px] text-slate-500">Costura, tecidos e calçados</span>
                        </div>

                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase">Descrição Completa do Traje</label>
                            <input 
                                type="text"
                                value={data.outfitType}
                                onChange={e => updateField('outfitType', e.target.value)}
                                placeholder="Ex: Vestido vermelho assimétrico com drapeado / Conjunto camisa e calça vermelha com tênis branco"
                                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white outline-none focus:border-red-500"
                            />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-400 uppercase">Gola / Decote</label>
                                <input 
                                    type="text"
                                    value={data.topNeckline}
                                    onChange={e => updateField('topNeckline', e.target.value)}
                                    placeholder="Ex: Decote ombro único com babados"
                                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white outline-none focus:border-red-500"
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-400 uppercase">Parte Inferior / Calça / Saia</label>
                                <input 
                                    type="text"
                                    value={data.bottomPiece}
                                    onChange={e => updateField('bottomPiece', e.target.value)}
                                    placeholder="Ex: Calça de corte reto / Saia com fenda"
                                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white outline-none focus:border-red-500"
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-400 uppercase">Calçado (Footwear)</label>
                                <input 
                                    type="text"
                                    value={data.footwear}
                                    onChange={e => updateField('footwear', e.target.value)}
                                    placeholder="Ex: Sandália de salto fino vermelha / Tênis branco minimalista"
                                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white outline-none focus:border-red-500"
                                />
                            </div>
                        </div>

                        {/* Texturas e Tecidos Clicáveis */}
                        <div className="space-y-2 pt-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1.5">
                                <Tag size={12} className="text-amber-400" />
                                <span>Amostras de Tecido & Texturas Selecionadas</span>
                            </label>
                            <div className="flex flex-wrap gap-1.5">
                                {FABRIC_OPTIONS.map(fabric => {
                                    const isSelected = data.fabricTextures.includes(fabric);
                                    return (
                                        <button
                                            key={fabric}
                                            type="button"
                                            onClick={() => handleToggleFabric(fabric)}
                                            className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-all ${
                                                isSelected 
                                                    ? 'bg-amber-500/20 text-amber-300 border-amber-500 shadow-sm' 
                                                    : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
                                            }`}
                                        >
                                            {isSelected && '✓ '} {fabric}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                )}

                {/* 7. PALETA DE CORES HEX & MATERIAIS */}
                {activeSection === 'palette' && (
                    <div className="space-y-4 animate-in fade-in">
                        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                            <span className="text-xs font-black uppercase text-red-400 tracking-wider">
                                7. Color and Material Palette (Amostras Hex & Materiais)
                            </span>
                            <button
                                type="button"
                                onClick={handleAddColorSwatch}
                                className="px-2 py-1 bg-red-600/20 hover:bg-red-600/40 text-red-300 text-xs font-bold rounded-lg border border-red-500/30 flex items-center gap-1"
                            >
                                <Plus size={12} />
                                <span>Adicionar Cor</span>
                            </button>
                        </div>

                        <p className="text-xs text-slate-400">
                            Amostras de cores exatas (Hex) como visto nas referências (#B31217, #E63946, #D6BFAF, etc.). Você pode clicar no círculo de cor para abrir o seletor ou digitar o código:
                        </p>

                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
                            {data.colorSwatches.map(swatch => (
                                <div key={swatch.id} className="p-2.5 bg-slate-900 border border-slate-800 rounded-xl flex items-center gap-2 group">
                                    <input 
                                        type="color"
                                        value={swatch.hex}
                                        onChange={e => handleUpdateColorSwatch(swatch.id, 'hex', e.target.value)}
                                        className="w-8 h-8 rounded-lg cursor-pointer border border-slate-700 bg-transparent shrink-0"
                                    />
                                    <div className="flex-1 min-w-0">
                                        <input 
                                            type="text"
                                            value={swatch.label}
                                            onChange={e => handleUpdateColorSwatch(swatch.id, 'label', e.target.value)}
                                            className="w-full bg-transparent text-[11px] font-bold text-white outline-none truncate"
                                            placeholder="Nome da cor"
                                        />
                                        <input 
                                            type="text"
                                            value={swatch.hex}
                                            onChange={e => handleUpdateColorSwatch(swatch.id, 'hex', e.target.value)}
                                            className="w-full bg-transparent font-mono text-[10px] text-amber-300 outline-none uppercase"
                                        />
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveColorSwatch(swatch.id)}
                                        className="text-slate-500 hover:text-red-400 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                        title="Remover cor"
                                    >
                                        <Trash2 size={13} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* 8. ESTÚDIO, ILUMINAÇÃO & DIRETIVAS */}
                {activeSection === 'lighting' && (
                    <div className="space-y-4 animate-in fade-in">
                        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                            <span className="text-xs font-black uppercase text-red-400 tracking-wider">
                                8. Lighting, Setting & Directives (Iluminação & Cenário)
                            </span>
                            <span className="text-[10px] text-slate-500">Atmosfera fotográfica</span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-400 uppercase">Esquema de Iluminação</label>
                                <input 
                                    type="text"
                                    value={data.lighting}
                                    onChange={e => updateField('lighting', e.target.value)}
                                    placeholder="Ex: Luz natural suave de estúdio com preenchimento quente"
                                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white outline-none focus:border-red-500"
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-400 uppercase">Fundo / Cenário (Setting)</label>
                                <input 
                                    type="text"
                                    value={data.backgroundSetting}
                                    onChange={e => updateField('backgroundSetting', e.target.value)}
                                    placeholder="Ex: Parede bege minimalista com textura suave"
                                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white outline-none focus:border-red-500"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-400 uppercase">Estilo de Renderização</label>
                                <input 
                                    type="text"
                                    value={data.renderStyle}
                                    onChange={e => updateField('renderStyle', e.target.value)}
                                    placeholder="Ex: Fotorealista 8K, Master Studio Portrait"
                                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white outline-none focus:border-red-500"
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-400 uppercase">Notas & Diretrizes de Consistência</label>
                                <input 
                                    type="text"
                                    value={data.additionalNotes}
                                    onChange={e => updateField('additionalNotes', e.target.value)}
                                    placeholder="Ex: Manter identidade facial idêntica em todas as folhas e poses"
                                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white outline-none focus:border-red-500"
                                />
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Visualizador / Acordeão do Prompt Compilado em Tempo Real */}
            <div className="bg-slate-950/80 rounded-xl border border-slate-800 overflow-hidden">
                <button
                    type="button"
                    onClick={() => setShowLivePrompt(!showLivePrompt)}
                    className="w-full px-3.5 py-2.5 flex items-center justify-between text-left hover:bg-slate-800/40 transition-colors"
                >
                    <div className="flex items-center gap-2">
                        <Sparkles size={14} className="text-amber-400" />
                        <span className="text-xs font-bold text-slate-300">
                            Ver Prompt Mestre Compilado ({currentPrompt.length} caracteres)
                        </span>
                    </div>
                    {showLivePrompt ? <ChevronDown size={14} className="text-slate-400" /> : <ChevronRight size={14} className="text-slate-400" />}
                </button>
                {showLivePrompt && (
                    <div className="p-3 border-t border-slate-800 bg-slate-950 text-[11px] font-mono text-slate-300 leading-relaxed max-h-48 overflow-y-auto custom-scrollbar select-all whitespace-pre-wrap">
                        {currentPrompt}
                    </div>
                )}
            </div>

            {/* Barra de Ações Principais: Compilar, Copiar e Gerar Imagem */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pt-2 border-t border-slate-800">
                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={handleCopy}
                        className="flex-1 sm:flex-none px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-bold flex items-center justify-center gap-1.5 transition-all active:scale-95"
                    >
                        {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                        <span>{copied ? "Copiado!" : "Copiar Prompt"}</span>
                    </button>

                    <button
                        type="button"
                        onClick={handleApply}
                        className="flex-1 sm:flex-none px-3.5 py-2 rounded-xl bg-blue-600/30 hover:bg-blue-600/50 border border-blue-500/50 text-blue-200 text-xs font-bold flex items-center justify-center gap-1.5 transition-all active:scale-95"
                        title="Aplicar este prompt ao Arquiteto Principal na tela"
                    >
                        {appliedSuccess ? <Check size={14} className="text-emerald-400" /> : <Sparkles size={14} className="text-blue-300" />}
                        <span>{appliedSuccess ? "Aplicado ao Arquiteto!" : "Aplicar ao Arquiteto"}</span>
                    </button>
                </div>

                <button
                    type="button"
                    onClick={handleGenerateVisual}
                    disabled={isGeneratingVisual}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-600 via-pink-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-black text-xs shadow-lg shadow-red-500/25 flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
                    title="Gerar imagem imediatamente com o Motor Neural 100% Gratuito"
                >
                    <Zap size={15} className="text-amber-300" />
                    <span>{isGeneratingVisual ? "Gerando Visual..." : "Gerar Imagem da Ficha (100% Grátis)"}</span>
                </button>
            </div>
        </div>
    );
};
