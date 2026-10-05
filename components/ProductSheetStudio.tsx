import React, { useState, useRef } from 'react';
import { 
    Package, Sparkles, Copy, Check, RefreshCw, Wand2, Palette, 
    Layers, Camera, Sliders, Eye, Zap, Shield, 
    Maximize2, ChevronDown, ChevronRight, Plus, Trash2, Tag, 
    Upload, Image as ImageIcon, CheckCircle2, Lock, ArrowRight,
    Droplets, GlassWater, Wine, Coffee, Flame, AlertCircle, X
} from 'lucide-react';
import type { 
    ProductSheetData, 
    ProductRebrandUploadedImages, 
    ProductPropItem, 
    CharacterColorSwatch 
} from '../types.ts';
import { 
    BEER_REBRAND_PRESET, 
    FANICE_ICE_CREAM_PRESET, 
    COSMETIC_PERFUME_PRESET,
    DEFAULT_PRODUCT_SHEET, 
    compileProductSheetPrompt, 
    extractProductSheetFromImages 
} from '../services/productSheetService.ts';

interface ProductSheetStudioProps {
    activeImageBase64?: string;
    activeImageMimeType?: string;
    activeImageName?: string;
    targetPlatform?: string;
    onApplyPrompt: (compiledPrompt: string) => void;
    onCreateVisual?: (promptText: string) => void;
    isGeneratingVisual?: boolean;
    onSwitchToArchitect?: () => void;
}

type ProductStudioSection = 'overview' | 'rebrand' | 'hero_views' | 'closeups' | 'props' | 'palette' | 'consistency';

export const ProductSheetStudio: React.FC<ProductSheetStudioProps> = ({
    activeImageBase64,
    activeImageMimeType = 'image/jpeg',
    activeImageName,
    targetPlatform = 'midjourney',
    onApplyPrompt,
    onCreateVisual,
    isGeneratingVisual = false,
    onSwitchToArchitect
}) => {
    // Estado principal da Ficha de Produto
    const [data, setData] = useState<ProductSheetData>(BEER_REBRAND_PRESET);
    const [activeSection, setActiveSection] = useState<ProductStudioSection>('overview');

    // Imagens enviadas para a troca de marca (Base + Logo + Rótulo + Props)
    const [uploadedImages, setUploadedImages] = useState<ProductRebrandUploadedImages>({
        baseProductImage: activeImageBase64 ? {
            base64: activeImageBase64,
            mimeType: activeImageMimeType,
            name: activeImageName || 'produto_base.jpg'
        } : undefined
    });

    const [userCustomInstruction, setUserCustomInstruction] = useState<string>('Trocar a marca original da garrafa/embalagem pelo meu novo logo e rótulo');
    const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
    const [analysisMessage, setAnalysisMessage] = useState<string | null>(null);
    const [copied, setCopied] = useState<boolean>(false);
    const [appliedSuccess, setAppliedSuccess] = useState<boolean>(false);
    const [showLivePrompt, setShowLivePrompt] = useState<boolean>(false);

    // Refs para uploaders de arquivo
    const baseInputRef = useRef<HTMLInputElement>(null);
    const logoInputRef = useRef<HTMLInputElement>(null);
    const labelInputRef = useRef<HTMLInputElement>(null);
    const propsInputRef = useRef<HTMLInputElement>(null);

    // Prompt compilado em tempo real
    const currentPrompt = compileProductSheetPrompt(data, uploadedImages, targetPlatform);

    const updateField = <K extends keyof ProductSheetData>(field: K, value: ProductSheetData[K]) => {
        setData(prev => ({ ...prev, [field]: value }));
    };

    // Leitor de arquivo para base64
    const handleFileUpload = (
        e: React.ChangeEvent<HTMLInputElement>,
        target: 'baseProductImage' | 'brandLogoImage' | 'packageLabelImage' | 'propsOrTextureImage'
    ) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = () => {
            const result = reader.result as string;
            const commaIndex = result.indexOf(',');
            const base64 = commaIndex !== -1 ? result.substring(commaIndex + 1) : result;
            
            setUploadedImages(prev => ({
                ...prev,
                [target]: {
                    base64,
                    mimeType: file.type || 'image/jpeg',
                    name: file.name
                }
            }));
            setAnalysisMessage(`Foto "${file.name}" carregada com sucesso!`);
            setTimeout(() => setAnalysisMessage(null), 3000);
        };
        reader.readAsDataURL(file);
    };

    const handleRemoveImage = (target: keyof ProductRebrandUploadedImages) => {
        setUploadedImages(prev => ({
            ...prev,
            [target]: undefined
        }));
    };

    // Auto-Análise Multimodal com IA usando as imagens fornecidas
    const handleAutoAnalyzeRebrand = async () => {
        if (!uploadedImages.baseProductImage && !uploadedImages.brandLogoImage && !uploadedImages.packageLabelImage) {
            setAnalysisMessage('Por favor envie ao menos uma foto (produto original, logo ou rótulo) para a IA analisar.');
            setTimeout(() => setAnalysisMessage(null), 4000);
            return;
        }

        setIsAnalyzing(true);
        setAnalysisMessage(null);

        try {
            const extracted = await extractProductSheetFromImages(uploadedImages, userCustomInstruction);
            setData(prev => ({
                ...prev,
                ...extracted,
                brandColors: (extracted.brandColors && extracted.brandColors.length > 0)
                    ? extracted.brandColors
                    : prev.brandColors,
                props: (extracted.props && extracted.props.length > 0)
                    ? extracted.props
                    : prev.props,
                keyFeatures: (extracted.keyFeatures && extracted.keyFeatures.length > 0)
                    ? extracted.keyFeatures
                    : prev.keyFeatures
            }));
            setAnalysisMessage('Ficha de Rebranding gerada com sucesso pela IA Multimodal!');
            setTimeout(() => setAnalysisMessage(null), 4000);
        } catch (err: any) {
            console.error('Falha na análise de rebranding:', err);
            setAnalysisMessage('Não foi possível analisar automaticamente todas as fotos. Você pode editar todos os campos manualmente abaixo.');
            setTimeout(() => setAnalysisMessage(null), 5000);
        } finally {
            setIsAnalyzing(false);
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

    // Gerenciador de Swatches de Cor
    const handleAddColor = () => {
        const newSwatch: CharacterColorSwatch = {
            id: `col_${Date.now()}`,
            label: 'Nova Cor da Marca',
            hex: '#E91E8A'
        };
        setData(prev => ({
            ...prev,
            brandColors: [...prev.brandColors, newSwatch]
        }));
    };

    const handleUpdateColor = (id: string, key: 'label' | 'hex', val: string) => {
        setData(prev => ({
            ...prev,
            brandColors: prev.brandColors.map(c => c.id === id ? { ...c, [key]: val } : c)
        }));
    };

    const handleRemoveColor = (id: string) => {
        setData(prev => ({
            ...prev,
            brandColors: prev.brandColors.filter(c => c.id !== id)
        }));
    };

    // Gerenciador de Props
    const handleAddProp = () => {
        const newProp: ProductPropItem = {
            id: `prop_${Date.now()}`,
            name: 'Novo Item de Cenário',
            purpose: 'Contextualizar o consumo do produto'
        };
        setData(prev => ({
            ...prev,
            props: [...prev.props, newProp]
        }));
    };

    const handleUpdateProp = (id: string, key: 'name' | 'purpose', val: string) => {
        setData(prev => ({
            ...prev,
            props: prev.props.map(p => p.id === id ? { ...p, [key]: val } : p)
        }));
    };

    const handleRemoveProp = (id: string) => {
        setData(prev => ({
            ...prev,
            props: prev.props.filter(p => p.id !== id)
        }));
    };

    return (
        <div className="bg-slate-900/95 border border-slate-800 rounded-2xl p-4 sm:p-5 backdrop-blur-xl shadow-2xl flex flex-col gap-5 text-slate-200">
            {/* Header da Ficha de Produto */}
            <div className="flex flex-col gap-3 pb-3 border-b border-slate-800/80">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                        <div className="p-2 rounded-xl bg-gradient-to-br from-amber-500 via-orange-600 to-red-600 text-white shadow-lg shadow-orange-500/20">
                            <Package size={18} />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h2 className="text-base font-black text-white tracking-wide">
                                    Troca de Marca & Ficha de Produto
                                </h2>
                                <span className="px-2 py-0.5 text-[9px] font-black uppercase rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                                    Product Rebrand
                                </span>
                            </div>
                            <p className="text-xs text-slate-400">
                                Envie foto da garrafa/embalagem + logo + rótulo e gere a ficha completa (estilo Fanice / Cervejas) com novo branding
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

                {/* Hub de Upload de 4 Fotos Específicas: Produto Base, Novo Logo, Novo Rótulo e Props */}
                <div className="bg-slate-950/90 p-3 sm:p-3.5 rounded-xl border border-slate-800 space-y-2.5">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-black uppercase text-amber-400 flex items-center gap-1.5">
                            <Upload size={14} className="text-amber-400" />
                            <span>1. Envie as Fotos para a Troca de Marca (Upload Multi-Imagens)</span>
                        </span>
                        <span className="text-[10px] text-slate-500 hidden sm:inline">
                            A IA lê o produto original e aplica a nova marca com perfeição
                        </span>
                    </div>

                    {/* Grid com os 4 Slots de Imagem */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                        {/* Slot 1: Produto Base / Embalagem Original (ex: Garrafa Skol) */}
                        <div className={`p-2.5 rounded-xl border flex flex-col justify-between transition-all ${
                            uploadedImages.baseProductImage 
                                ? 'bg-amber-950/20 border-amber-500/50 shadow-sm' 
                                : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                        }`}>
                            <div className="flex items-center justify-between mb-1.5">
                                <span className="text-[11px] font-bold text-white flex items-center gap-1">
                                    <Wine size={13} className="text-amber-400" />
                                    <span>Produto Base</span>
                                </span>
                                {uploadedImages.baseProductImage && (
                                    <button 
                                        type="button" 
                                        onClick={() => handleRemoveImage('baseProductImage')}
                                        className="text-slate-500 hover:text-red-400"
                                        title="Remover"
                                    >
                                        <X size={12} />
                                    </button>
                                )}
                            </div>

                            {uploadedImages.baseProductImage ? (
                                <div className="space-y-1">
                                    <div className="relative w-full h-24 rounded-lg overflow-hidden border border-slate-700 bg-black">
                                        <img 
                                            src={`data:${uploadedImages.baseProductImage.mimeType};base64,${uploadedImages.baseProductImage.base64}`} 
                                            alt="Produto Base" 
                                            className="w-full h-full object-contain"
                                        />
                                    </div>
                                    <div className="text-[9px] text-amber-300 font-mono truncate">
                                        ✓ {uploadedImages.baseProductImage.name}
                                    </div>
                                </div>
                            ) : (
                                <div 
                                    onClick={() => baseInputRef.current?.click()}
                                    className="border-2 border-dashed border-slate-700 hover:border-amber-400 rounded-lg p-3 flex flex-col items-center justify-center text-center cursor-pointer transition-colors min-h-[96px]"
                                >
                                    <Upload size={16} className="text-slate-500 mb-1" />
                                    <span className="text-[10px] font-bold text-slate-300">Garrafa / Pote Original</span>
                                    <span className="text-[8px] text-slate-500">Ex: Garrafa Skol, lata</span>
                                </div>
                            )}

                            <input 
                                ref={baseInputRef}
                                type="file" 
                                accept="image/*"
                                onChange={e => handleFileUpload(e, 'baseProductImage')} 
                                className="hidden" 
                            />
                            
                            {!uploadedImages.baseProductImage && activeImageBase64 && (
                                <button
                                    type="button"
                                    onClick={() => setUploadedImages(prev => ({
                                        ...prev,
                                        baseProductImage: {
                                            base64: activeImageBase64,
                                            mimeType: activeImageMimeType,
                                            name: activeImageName || 'foto_ativa.jpg'
                                        }
                                    }))}
                                    className="mt-1.5 py-1 text-[9px] font-bold bg-slate-800 hover:bg-slate-700 text-amber-300 rounded border border-slate-700"
                                >
                                    + Usar Foto Ativa
                                </button>
                            )}
                        </div>

                        {/* Slot 2: Logo da Nova Marca */}
                        <div className={`p-2.5 rounded-xl border flex flex-col justify-between transition-all ${
                            uploadedImages.brandLogoImage 
                                ? 'bg-blue-950/20 border-blue-500/50 shadow-sm' 
                                : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                        }`}>
                            <div className="flex items-center justify-between mb-1.5">
                                <span className="text-[11px] font-bold text-white flex items-center gap-1">
                                    <Shield size={13} className="text-blue-400" />
                                    <span>Logo da Nova Marca</span>
                                </span>
                                {uploadedImages.brandLogoImage && (
                                    <button 
                                        type="button" 
                                        onClick={() => handleRemoveImage('brandLogoImage')}
                                        className="text-slate-500 hover:text-red-400"
                                        title="Remover"
                                    >
                                        <X size={12} />
                                    </button>
                                )}
                            </div>

                            {uploadedImages.brandLogoImage ? (
                                <div className="space-y-1">
                                    <div className="relative w-full h-24 rounded-lg overflow-hidden border border-slate-700 bg-slate-950 flex items-center justify-center p-2">
                                        <img 
                                            src={`data:${uploadedImages.brandLogoImage.mimeType};base64,${uploadedImages.brandLogoImage.base64}`} 
                                            alt="Logo da Marca" 
                                            className="max-w-full max-h-full object-contain"
                                        />
                                    </div>
                                    <div className="text-[9px] text-blue-300 font-mono truncate">
                                        ✓ {uploadedImages.brandLogoImage.name}
                                    </div>
                                </div>
                            ) : (
                                <div 
                                    onClick={() => logoInputRef.current?.click()}
                                    className="border-2 border-dashed border-slate-700 hover:border-blue-400 rounded-lg p-3 flex flex-col items-center justify-center text-center cursor-pointer transition-colors min-h-[96px]"
                                >
                                    <Upload size={16} className="text-slate-500 mb-1" />
                                    <span className="text-[10px] font-bold text-slate-300">Logo da Sua Marca</span>
                                    <span className="text-[8px] text-slate-500">PNG transparente ou imagem</span>
                                </div>
                            )}

                            <input 
                                ref={logoInputRef}
                                type="file" 
                                accept="image/*"
                                onChange={e => handleFileUpload(e, 'brandLogoImage')} 
                                className="hidden" 
                            />
                        </div>

                        {/* Slot 3: Rótulo / Arte Completa da Embalagem */}
                        <div className={`p-2.5 rounded-xl border flex flex-col justify-between transition-all ${
                            uploadedImages.packageLabelImage 
                                ? 'bg-pink-950/20 border-pink-500/50 shadow-sm' 
                                : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                        }`}>
                            <div className="flex items-center justify-between mb-1.5">
                                <span className="text-[11px] font-bold text-white flex items-center gap-1">
                                    <Tag size={13} className="text-pink-400" />
                                    <span>Rótulo / Embalagem</span>
                                </span>
                                {uploadedImages.packageLabelImage && (
                                    <button 
                                        type="button" 
                                        onClick={() => handleRemoveImage('packageLabelImage')}
                                        className="text-slate-500 hover:text-red-400"
                                        title="Remover"
                                    >
                                        <X size={12} />
                                    </button>
                                )}
                            </div>

                            {uploadedImages.packageLabelImage ? (
                                <div className="space-y-1">
                                    <div className="relative w-full h-24 rounded-lg overflow-hidden border border-slate-700 bg-slate-950 flex items-center justify-center p-2">
                                        <img 
                                            src={`data:${uploadedImages.packageLabelImage.mimeType};base64,${uploadedImages.packageLabelImage.base64}`} 
                                            alt="Rótulo da Embalagem" 
                                            className="max-w-full max-h-full object-contain"
                                        />
                                    </div>
                                    <div className="text-[9px] text-pink-300 font-mono truncate">
                                        ✓ {uploadedImages.packageLabelImage.name}
                                    </div>
                                </div>
                            ) : (
                                <div 
                                    onClick={() => labelInputRef.current?.click()}
                                    className="border-2 border-dashed border-slate-700 hover:border-pink-400 rounded-lg p-3 flex flex-col items-center justify-center text-center cursor-pointer transition-colors min-h-[96px]"
                                >
                                    <Upload size={16} className="text-slate-500 mb-1" />
                                    <span className="text-[10px] font-bold text-slate-300">Arte do Novo Rótulo</span>
                                    <span className="text-[8px] text-slate-500">Design frontal ou wrap 360</span>
                                </div>
                            )}

                            <input 
                                ref={labelInputRef}
                                type="file" 
                                accept="image/*"
                                onChange={e => handleFileUpload(e, 'packageLabelImage')} 
                                className="hidden" 
                            />
                        </div>

                        {/* Slot 4: Props / Textura / Referência */}
                        <div className={`p-2.5 rounded-xl border flex flex-col justify-between transition-all ${
                            uploadedImages.propsOrTextureImage 
                                ? 'bg-emerald-950/20 border-emerald-500/50 shadow-sm' 
                                : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                        }`}>
                            <div className="flex items-center justify-between mb-1.5">
                                <span className="text-[11px] font-bold text-white flex items-center gap-1">
                                    <Droplets size={13} className="text-emerald-400" />
                                    <span>Props / Textura (Opcional)</span>
                                </span>
                                {uploadedImages.propsOrTextureImage && (
                                    <button 
                                        type="button" 
                                        onClick={() => handleRemoveImage('propsOrTextureImage')}
                                        className="text-slate-500 hover:text-red-400"
                                        title="Remover"
                                    >
                                        <X size={12} />
                                    </button>
                                )}
                            </div>

                            {uploadedImages.propsOrTextureImage ? (
                                <div className="space-y-1">
                                    <div className="relative w-full h-24 rounded-lg overflow-hidden border border-slate-700 bg-slate-950 flex items-center justify-center p-2">
                                        <img 
                                            src={`data:${uploadedImages.propsOrTextureImage.mimeType};base64,${uploadedImages.propsOrTextureImage.base64}`} 
                                            alt="Props / Textura" 
                                            className="max-w-full max-h-full object-contain"
                                        />
                                    </div>
                                    <div className="text-[9px] text-emerald-300 font-mono truncate">
                                        ✓ {uploadedImages.propsOrTextureImage.name}
                                    </div>
                                </div>
                            ) : (
                                <div 
                                    onClick={() => propsInputRef.current?.click()}
                                    className="border-2 border-dashed border-slate-700 hover:border-emerald-400 rounded-lg p-3 flex flex-col items-center justify-center text-center cursor-pointer transition-colors min-h-[96px]"
                                >
                                    <Upload size={16} className="text-slate-500 mb-1" />
                                    <span className="text-[10px] font-bold text-slate-300">Cenário / Ingredientes</span>
                                    <span className="text-[8px] text-slate-500">Ex: Gelo, frutas, copo</span>
                                </div>
                            )}

                            <input 
                                ref={propsInputRef}
                                type="file" 
                                accept="image/*"
                                onChange={e => handleFileUpload(e, 'propsOrTextureImage')} 
                                className="hidden" 
                            />
                        </div>
                    </div>

                    {/* Barra de Ação da IA: Analisar com IA Multimodal */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-1 border-t border-slate-800/80">
                        <input 
                            type="text"
                            value={userCustomInstruction}
                            onChange={e => setUserCustomInstruction(e.target.value)}
                            placeholder="Instrução: Ex: Trocar garrafa Skol pela minha marca de cerveja artesanal..."
                            className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white outline-none focus:border-amber-400"
                        />
                        <button
                            type="button"
                            onClick={handleAutoAnalyzeRebrand}
                            disabled={isAnalyzing}
                            className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 hover:from-amber-500 hover:to-orange-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20 transition-all active:scale-95 disabled:opacity-40 shrink-0 cursor-pointer"
                        >
                            {isAnalyzing ? (
                                <RefreshCw size={14} className="animate-spin text-white" />
                            ) : (
                                <Wand2 size={14} className="text-yellow-300" />
                            )}
                            <span>{isAnalyzing ? "Analisando Imagens com IA..." : "Auto-Extrair e Mesclar Marcas com IA"}</span>
                        </button>
                    </div>

                    {analysisMessage && (
                        <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-2 animate-in fade-in">
                            <Sparkles size={14} className="text-amber-400 shrink-0" />
                            <span>{analysisMessage}</span>
                        </div>
                    )}
                </div>

                {/* Presets Rápidos de 1 Clique */}
                <div className="flex items-center gap-2 flex-wrap pt-0.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Presets Prontos:</span>

                    <button
                        type="button"
                        onClick={() => setData(BEER_REBRAND_PRESET)}
                        className="px-2.5 py-1.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 border border-amber-500/40 text-amber-300 hover:text-white font-bold text-[11px] flex items-center gap-1.5 transition-all"
                        title="Trocar Skol / Cerveja Comercial por Marca Artesanal Imperial"
                    >
                        <Wine size={12} className="text-amber-400" />
                        <span>Cerveja (Skol ➔ Artesanal)</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setData(FANICE_ICE_CREAM_PRESET)}
                        className="px-2.5 py-1.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 border border-pink-500/40 text-pink-300 hover:text-white font-bold text-[11px] flex items-center gap-1.5 transition-all"
                        title="Ficha do Pote de Sorvete Fanice (Referência Exata)"
                    >
                        <span className="w-2 h-2 rounded-full bg-pink-500" />
                        <span>Pote Sorvete (Fanice Tub)</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setData(COSMETIC_PERFUME_PRESET)}
                        className="px-2.5 py-1.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 border border-indigo-500/40 text-indigo-300 hover:text-white font-bold text-[11px] flex items-center gap-1.5 transition-all"
                        title="Frasco de Perfume de Luxo / Cosmético"
                    >
                        <Sparkles size={12} className="text-indigo-400" />
                        <span>Perfume de Luxo</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setData(DEFAULT_PRODUCT_SHEET)}
                        className="px-2 py-1.5 rounded-xl bg-slate-800/60 hover:bg-slate-700 border border-slate-700 text-slate-400 hover:text-slate-200 text-[11px] font-medium transition-all ml-auto"
                        title="Restaurar padrão"
                    >
                        Limpar
                    </button>
                </div>
            </div>

            {/* Layout de Apresentação de Saída */}
            <div className="space-y-1.5 bg-slate-950/70 p-3 rounded-xl border border-slate-800">
                <label className="text-[10px] font-black uppercase text-slate-400 flex items-center gap-1.5">
                    <Maximize2 size={12} className="text-amber-400" />
                    <span>Modo de Apresentação / Layout da Imagem</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                    {[
                        { id: 'full_product_sheet', label: 'Ficha Completa (Grid)', desc: 'Hero Views + Closeups + Props + Cores Hex (Estilo Fanice)' },
                        { id: 'hero_commercial_shot', label: 'Mockup Comercial 4K', desc: 'Foto única publicitária em alta resolução da nova marca' },
                        { id: 'packaging_construction', label: 'Construção da Embalagem', desc: 'Vistas técnicas ortográficas alinhadas 360°' },
                        { id: 'lifestyle_in_use', label: 'Lifestyle / Em Uso', desc: 'Produto ambientado em cena de consumo real' },
                    ].map(opt => (
                        <button
                            key={opt.id}
                            type="button"
                            onClick={() => updateField('outputLayout', opt.id as any)}
                            className={`p-2 rounded-lg text-left border transition-all ${
                                data.outputLayout === opt.id
                                    ? 'bg-amber-600/20 border-amber-500 text-white shadow-md shadow-amber-500/20'
                                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                            }`}
                        >
                            <div className="text-[11px] font-black leading-tight">{opt.label}</div>
                            <div className="text-[9px] text-slate-500 leading-tight mt-0.5 truncate">{opt.desc}</div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Menu de Abas para Customização de Tudo */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1 border-b border-slate-800/80 custom-scrollbar">
                {[
                    { id: 'overview', label: '1. Visão Geral', icon: Package },
                    { id: 'rebrand', label: '2. Troca de Rótulo & Logo', icon: Tag },
                    { id: 'hero_views', label: '3. 5 Vistas Hero', icon: Eye },
                    { id: 'closeups', label: '4. Close-ups & Detalhes', icon: Camera },
                    { id: 'props', label: '5. Props & Cenário', icon: Droplets },
                    { id: 'palette', label: '6. Cores Hex', icon: Palette },
                    { id: 'consistency', label: '7. Trava de Consistência', icon: Lock },
                ].map(sec => {
                    const Icon = sec.icon;
                    const isActive = activeSection === sec.id;
                    return (
                        <button
                            key={sec.id}
                            type="button"
                            onClick={() => setActiveSection(sec.id as ProductStudioSection)}
                            className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap flex items-center gap-1.5 transition-all shrink-0 ${
                                isActive
                                    ? 'bg-amber-600 text-white shadow-lg shadow-amber-500/25 ring-1 ring-amber-400'
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
                
                {/* 1. VISÃO GERAL DO PRODUTO */}
                {activeSection === 'overview' && (
                    <div className="space-y-4 animate-in fade-in">
                        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                            <span className="text-xs font-black uppercase text-amber-400 tracking-wider">
                                1. Product Overview (Visão Geral e Especificações)
                            </span>
                            <span className="text-[10px] text-slate-500">Defina os nomes e especificações do produto</span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-400 uppercase">Marca Original (A Ser Substituída)</label>
                                <input 
                                    type="text"
                                    value={data.originalBrandName}
                                    onChange={e => updateField('originalBrandName', e.target.value)}
                                    placeholder="Ex: Skol / Ambev / Marca anterior"
                                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white outline-none focus:border-amber-500"
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-amber-400 uppercase">Sua Nova Marca (Novo Nome)</label>
                                <input 
                                    type="text"
                                    value={data.newBrandName}
                                    onChange={e => updateField('newBrandName', e.target.value)}
                                    placeholder="Ex: Cerveja Artesanal Imperial / Minha Marca"
                                    className="w-full bg-slate-900 border border-amber-500/50 rounded-lg px-2.5 py-1.5 text-xs text-white outline-none focus:border-amber-400"
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-400 uppercase">Categoria do Produto</label>
                                <input 
                                    type="text"
                                    value={data.productCategory}
                                    onChange={e => updateField('productCategory', e.target.value)}
                                    placeholder="Ex: Cerveja Premium / Pote de Sorvete / Cosmético"
                                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white outline-none focus:border-amber-500"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-400 uppercase">Materiais Físicos do Recipiente</label>
                                <input 
                                    type="text"
                                    value={data.productMaterials}
                                    onChange={e => updateField('productMaterials', e.target.value)}
                                    placeholder="Ex: Garrafa de vidro âmbar com condensação gelada, tampa coroa metálica"
                                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white outline-none focus:border-amber-500"
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-400 uppercase">Dimensões e Proporções</label>
                                <input 
                                    type="text"
                                    value={data.productDimensions}
                                    onChange={e => updateField('productDimensions', e.target.value)}
                                    placeholder="Ex: Long Neck 355ml (23 x 6 cm) / 18 x 12 x 6 cm tub"
                                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white outline-none focus:border-amber-500"
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase">Principais Características Visuais (Key Features)</label>
                            <input 
                                type="text"
                                value={data.keyFeatures.join(', ')}
                                onChange={e => updateField('keyFeatures', e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
                                placeholder="Separadas por vírgula: Vidro âmbar com reflexos dourados, Gotas de água gelada, Rótulo texturizado em papel nobre..."
                                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white outline-none focus:border-amber-500"
                            />
                        </div>
                    </div>
                )}

                {/* 2. TROCA DE RÓTULO & LOGO */}
                {activeSection === 'rebrand' && (
                    <div className="space-y-4 animate-in fade-in">
                        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                            <span className="text-xs font-black uppercase text-amber-400 tracking-wider">
                                2. Rebranding & Label Application (Substituição de Rótulo)
                            </span>
                            <span className="text-[10px] text-slate-500">Como a nova marca substitui a antiga</span>
                        </div>

                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase">Aplicação do Novo Rótulo na Garrafa / Pote</label>
                            <textarea 
                                value={data.labelPlacement}
                                onChange={e => updateField('labelPlacement', e.target.value)}
                                placeholder="Ex: Substituição total da marca Skol. O novo rótulo da marca enviada é posicionado centralizado no corpo cilíndrico com acabamento fosco e relevo..."
                                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-xs text-white outline-none focus:border-amber-500 h-16 custom-scrollbar"
                            />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-400 uppercase">Gargalo / Tampa / Selo Superior</label>
                                <input 
                                    type="text"
                                    value={data.neckLabelOrCap}
                                    onChange={e => updateField('neckLabelOrCap', e.target.value)}
                                    placeholder="Ex: Tampa coroa metálica gravada com logotipo e selo nobre no gargalo"
                                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white outline-none focus:border-amber-500"
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-400 uppercase">Textura e Condensação na Embalagem</label>
                                <input 
                                    type="text"
                                    value={data.surfaceTexture}
                                    onChange={e => updateField('surfaceTexture', e.target.value)}
                                    placeholder="Ex: Gotas de condensação gelada realistas escorrendo sem tampar a leitura do logo"
                                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white outline-none focus:border-amber-500"
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase">Acabamentos Especiais no Rótulo</label>
                            <input 
                                type="text"
                                value={data.specialFeatures}
                                onChange={e => updateField('specialFeatures', e.target.value)}
                                placeholder="Ex: Hot stamping dourado no logo, verniz localizado, relevo seco táctil"
                                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white outline-none focus:border-amber-500"
                            />
                        </div>
                    </div>
                )}

                {/* 3. 5 VISTAS HERO */}
                {activeSection === 'hero_views' && (
                    <div className="space-y-4 animate-in fade-in">
                        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                            <span className="text-xs font-black uppercase text-amber-400 tracking-wider">
                                3. Product Hero Views (5 Vistas Sequenciais)
                            </span>
                            <span className="text-[10px] text-slate-500">Ângulos de apresentação do produto</span>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                            {[
                                { id: 'front', label: '1. FRONT VIEW', desc: 'Vista Frontal com novo rótulo e logo' },
                                { id: 'back', label: '2. BACK VIEW', desc: 'Verso com tabela nutricional e código' },
                                { id: 'side', label: '3. SIDE VIEW', desc: 'Perfil com curvatura da embalagem' },
                                { id: 'three_quarter', label: '4. 3/4 VIEW', desc: 'Perspectiva dinâmica hero' },
                                { id: 'functional', label: '5. EM USO', desc: 'Produto aberto / servido' },
                            ].map(view => (
                                <div key={view.id} className="p-2.5 bg-slate-900 border border-slate-800 rounded-xl flex flex-col gap-1">
                                    <span className="text-xs font-black text-amber-400">{view.label}</span>
                                    <span className="text-[10px] text-slate-400 leading-tight">{view.desc}</span>
                                    <span className="text-[9px] text-emerald-400 mt-auto font-mono">✓ Ativo na Ficha</span>
                                </div>
                            ))}
                        </div>

                        <div className="space-y-1 pt-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase">Ângulo Focado para Render Único</label>
                            <select 
                                value={data.activeHeroView}
                                onChange={e => updateField('activeHeroView', e.target.value as any)}
                                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white outline-none focus:border-amber-500"
                            >
                                <option value="all_hero_views">Todas as 5 Vistas Hero (Grid Alinhado)</option>
                                <option value="front">Vista Frontal Exclusiva (Front Hero)</option>
                                <option value="three_quarter">Vista 3/4 Dinâmica (Commercial Angle)</option>
                                <option value="functional">Vista Funcional / Servida (In-Use)</option>
                                <option value="side">Vista Lateral de Perfil</option>
                                <option value="back">Vista Traseira com Tabela e Código de Barras</option>
                            </select>
                        </div>
                    </div>
                )}

                {/* 4. CLOSE-UPS & DETALHES */}
                {activeSection === 'closeups' && (
                    <div className="space-y-4 animate-in fade-in">
                        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                            <span className="text-xs font-black uppercase text-amber-400 tracking-wider">
                                4. Product Close-Ups (Detalhes em Macro)
                            </span>
                            <span className="text-[10px] text-slate-500">Mapeamento em alta aproximação</span>
                        </div>

                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase">Painel do Verso / Tabela Nutricional & Código de Barras</label>
                            <input 
                                type="text"
                                value={data.packagingNutritional}
                                onChange={e => updateField('packagingNutritional', e.target.value)}
                                placeholder="Ex: Tabela nutricional nítida, código de barras vertical, graduação alcoólica 5.2% ABV e ingredientes"
                                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white outline-none focus:border-amber-500"
                            />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-400 uppercase">Iluminação de Estúdio do Produto</label>
                                <input 
                                    type="text"
                                    value={data.lighting}
                                    onChange={e => updateField('lighting', e.target.value)}
                                    placeholder="Ex: Duas luzes de recorte (rim lights) para destacar a silhueta da garrafa e líquido"
                                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white outline-none focus:border-amber-500"
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-400 uppercase">Padrão de Qualidade & Resolução</label>
                                <input 
                                    type="text"
                                    value={data.renderQuality}
                                    onChange={e => updateField('renderQuality', e.target.value)}
                                    placeholder="Ex: Hasselblad H6D-100c RAW, 8k resolution, photorealistic commercial product photography"
                                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white outline-none focus:border-amber-500"
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* 5. PROPS & CENÁRIO DE APOIO */}
                {activeSection === 'props' && (
                    <div className="space-y-4 animate-in fade-in">
                        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                            <span className="text-xs font-black uppercase text-amber-400 tracking-wider">
                                5. Props Reference & Background (Itens de Cenário)
                            </span>
                            <button
                                type="button"
                                onClick={handleAddProp}
                                className="px-2 py-1 bg-amber-600/20 hover:bg-amber-600/40 text-amber-300 text-xs font-bold rounded-lg border border-amber-500/30 flex items-center gap-1"
                            >
                                <Plus size={12} />
                                <span>Adicionar Prop</span>
                            </button>
                        </div>

                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase">Cenário / Fundo de Apoio (Background Setting)</label>
                            <input 
                                type="text"
                                value={data.backgroundEnvironment}
                                onChange={e => updateField('backgroundEnvironment', e.target.value)}
                                placeholder="Ex: Balcão rústico de madeira com iluminação quente de bar e bokeh suave ao fundo"
                                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white outline-none focus:border-amber-500"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-400 uppercase">Itens de Apoio Contextuais (como visto na ref. Fanice: morangos, copo, colher)</label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                {data.props.map(prop => (
                                    <div key={prop.id} className="p-2.5 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between gap-2">
                                        <div className="flex-1 space-y-1">
                                            <input 
                                                type="text"
                                                value={prop.name}
                                                onChange={e => handleUpdateProp(prop.id, 'name', e.target.value)}
                                                className="w-full bg-transparent text-xs font-bold text-amber-300 outline-none"
                                                placeholder="Nome do prop (ex: Copo de cristal)"
                                            />
                                            <input 
                                                type="text"
                                                value={prop.purpose}
                                                onChange={e => handleUpdateProp(prop.id, 'purpose', e.target.value)}
                                                className="w-full bg-transparent text-[10px] text-slate-400 outline-none"
                                                placeholder="Finalidade (ex: com espuma densa de cerveja)"
                                            />
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveProp(prop.id)}
                                            className="text-slate-500 hover:text-red-400 p-1"
                                            title="Remover"
                                        >
                                            <Trash2 size={13} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* 6. PALETA DE CORES HEX DA NOVA MARCA */}
                {activeSection === 'palette' && (
                    <div className="space-y-4 animate-in fade-in">
                        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                            <span className="text-xs font-black uppercase text-amber-400 tracking-wider">
                                6. Brand Colors Palette (Cores Hex da Marca)
                            </span>
                            <button
                                type="button"
                                onClick={handleAddColor}
                                className="px-2 py-1 bg-amber-600/20 hover:bg-amber-600/40 text-amber-300 text-xs font-bold rounded-lg border border-amber-500/30 flex items-center gap-1"
                            >
                                <Plus size={12} />
                                <span>Adicionar Cor</span>
                            </button>
                        </div>

                        <p className="text-xs text-slate-400">
                            Cores exatas com códigos Hex da sua marca (como visto na ref. Fanice: #E91E8A, #4FD3F4, #1E4FA8, etc.). Clique no círculo para alterar a cor:
                        </p>

                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
                            {data.brandColors.map(col => (
                                <div key={col.id} className="p-2.5 bg-slate-900 border border-slate-800 rounded-xl flex items-center gap-2 group">
                                    <input 
                                        type="color"
                                        value={col.hex}
                                        onChange={e => handleUpdateColor(col.id, 'hex', e.target.value)}
                                        className="w-8 h-8 rounded-lg cursor-pointer border border-slate-700 bg-transparent shrink-0"
                                    />
                                    <div className="flex-1 min-w-0">
                                        <input 
                                            type="text"
                                            value={col.label}
                                            onChange={e => handleUpdateColor(col.id, 'label', e.target.value)}
                                            className="w-full bg-transparent text-[11px] font-bold text-white outline-none truncate"
                                            placeholder="Nome da cor"
                                        />
                                        <input 
                                            type="text"
                                            value={col.hex}
                                            onChange={e => handleUpdateColor(col.id, 'hex', e.target.value)}
                                            className="w-full bg-transparent font-mono text-[10px] text-amber-300 outline-none uppercase"
                                        />
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveColor(col.id)}
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

                {/* 7. TRAVA DE CONSISTÊNCIA "DO NOT CHANGE" */}
                {activeSection === 'consistency' && (
                    <div className="space-y-4 animate-in fade-in">
                        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                            <span className="text-xs font-black uppercase text-amber-400 tracking-wider">
                                7. Consistency Lock (Diretrizes Estritas "DO NOT CHANGE")
                            </span>
                            <span className="text-[10px] text-slate-500">Trave aspectos que não podem sofrer mutação</span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                            {[
                                { key: 'productShape', label: 'Formato & Proporções do Recipiente', desc: 'Mantém a curvatura e geometria da garrafa/pote original' },
                                { key: 'materials', label: 'Materiais Físicos (Vidro / Plástico)', desc: 'Preserva a textura realista, condensação e reflexos' },
                                { key: 'colorsAndBranding', label: 'Novo Logotipo & Cores da Marca', desc: 'Impede a IA de inventar cores fora da paleta enviada' },
                                { key: 'typography', label: 'Tipografia & Textos do Rótulo', desc: 'Rótulo com letras nítidas e fiéis à arte do usuário' },
                                { key: 'photorealism', label: 'Hiper-realismo Fotográfico', desc: 'Sem estilo de ilustração ou cartoon, 100% foto comercial' },
                            ].map(item => {
                                const isChecked = (data.doNotChange as any)[item.key];
                                return (
                                    <button
                                        key={item.key}
                                        type="button"
                                        onClick={() => setData(prev => ({
                                            ...prev,
                                            doNotChange: {
                                                ...prev.doNotChange,
                                                [item.key]: !isChecked
                                            }
                                        }))}
                                        className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition-all ${
                                            isChecked 
                                                ? 'bg-amber-600/20 border-amber-500 text-white shadow-sm' 
                                                : 'bg-slate-900 border-slate-800 text-slate-400'
                                        }`}
                                    >
                                        <CheckCircle2 size={16} className={isChecked ? 'text-amber-400 shrink-0 mt-0.5' : 'text-slate-600 shrink-0 mt-0.5'} />
                                        <div>
                                            <div className="text-xs font-bold">{item.label}</div>
                                            <div className="text-[9px] text-slate-500 leading-snug mt-0.5">{item.desc}</div>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>

                        <div className="space-y-1 pt-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase">Regras Personalizadas Adicionais de Consistência</label>
                            <input 
                                type="text"
                                value={data.customConsistencyRules}
                                onChange={e => updateField('customConsistencyRules', e.target.value)}
                                placeholder="Ex: Keep everything exactly as shown. Do not redesign, alter, or create variants of the product or packaging."
                                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white outline-none focus:border-amber-500"
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* Visualizador do Prompt Compilado em Tempo Real */}
            <div className="bg-slate-950/80 rounded-xl border border-slate-800 overflow-hidden">
                <button
                    type="button"
                    onClick={() => setShowLivePrompt(!showLivePrompt)}
                    className="w-full px-3.5 py-2.5 flex items-center justify-between text-left hover:bg-slate-800/40 transition-colors"
                >
                    <div className="flex items-center gap-2">
                        <Sparkles size={14} className="text-amber-400" />
                        <span className="text-xs font-bold text-slate-300">
                            Ver Prompt Mestre Compilado de Rebranding ({currentPrompt.length} caracteres)
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

            {/* Barra de Ações Principais: Copiar, Aplicar e Gerar Imagem */}
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
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 hover:from-amber-500 hover:to-orange-500 text-white font-black text-xs shadow-lg shadow-orange-500/25 flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
                    title="Gerar imagem do produto imediatamente com o Motor Neural 100% Gratuito"
                >
                    <Zap size={15} className="text-yellow-300" />
                    <span>{isGeneratingVisual ? "Gerando Produto..." : "Gerar Imagem do Produto 4K (100% Grátis)"}</span>
                </button>
            </div>
        </div>
    );
};
