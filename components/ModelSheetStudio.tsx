import React, { useState, useEffect } from 'react';
import { 
    User, Sparkles, Copy, Check, RefreshCw, Wand2, Palette, 
    Layers, Camera, Sliders, Eye, Heart, Zap, Shield, 
    Maximize2, ChevronDown, ChevronRight, Plus, Trash2, Tag, 
    Shirt, Compass, Sun, Flame, Box, HelpCircle, Upload, Image as ImageIcon,
    Scissors, CheckCircle2, ArrowRight, Sparkle, AlertCircle,
    ToggleLeft, ToggleRight, Power, Baby, Smile
} from 'lucide-react';
import type { 
    ModelSheetData, 
    CharacterColorSwatch, 
    WardrobeReferenceItem, 
    UploadedImage,
    ModelSectionToggles,
    ModelGender
} from '../types.ts';
import { 
    SOAIMA_PRESET, 
    SOFIA_PRESET, 
    MALE_MODEL_PRESET,
    MALE_CASUAL_PRESET,
    MALE_BUSINESS_PRESET,
    FEMALE_CASUAL_PRESET,
    KID_BOY_PRESET,
    KID_GIRL_PRESET,
    TEEN_BOY_PRESET,
    TEEN_GIRL_PRESET,
    DEFAULT_MODEL_SHEET, 
    DEFAULT_SECTION_TOGGLES,
    extractModelSheetFromImage, 
    extractWardrobeFromImage,
    extractModelWithWardrobe,
    compileModelSheetPrompt,
    WARDROBE_PRESETS,
    WardrobePresetItem,
    POSE_DEFINITIONS,
    getResolvedPoses,
    PHOTOGRAPHY_FRAMING_OPTIONS,
    PhotographyFramingOption
} from '../services/modelSheetService.ts';

interface ModelSheetStudioProps {
    activeImageBase64?: string;
    activeImageMimeType?: string;
    activeImageName?: string;
    availableImages?: UploadedImage[];
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
    availableImages = [],
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

    // Chaves ON/OFF para cada um dos 8 tipos de preenchimento da ficha
    const [sectionToggles, setSectionToggles] = useState<ModelSectionToggles>(() => {
        return data.sectionToggles || DEFAULT_SECTION_TOGGLES;
    });

    const toggleSection = (sec: StudioSection) => {
        setSectionToggles(prev => {
            const next = { ...prev, [sec]: !prev[sec] };
            setData(d => ({ ...d, sectionToggles: next }));
            return next;
        });
    };

    const handleSetAllSections = (enabled: boolean) => {
        const next: ModelSectionToggles = {
            profile: enabled,
            turnaround: enabled,
            face: enabled,
            expressions: enabled,
            poses: enabled,
            costume: enabled,
            palette: enabled,
            lighting: enabled,
        };
        setSectionToggles(next);
        setData(d => ({ ...d, sectionToggles: next }));
    };

    // Prompt compilado em tempo real respeitando as seções ativadas/desativadas
    const currentPrompt = compileModelSheetPrompt(data, targetPlatform, sectionToggles);

    // Atualizador de campo genérico
    const updateField = <K extends keyof ModelSheetData>(field: K, value: ModelSheetData[K]) => {
        setData(prev => ({ ...prev, [field]: value }));
    };

    // Contador de Fotos a Gerar na aba de Poses (Mínimo: 1 | Máximo: 4)
    const posePhotoCount = Math.min(4, Math.max(1, data.posePhotoCount ?? (data.activePose === 'all_6_poses' ? 4 : 1)));

    const handleSetPhotoCount = (count: number) => {
        const clamped = Math.min(4, Math.max(1, count));
        setData(prev => {
            const allKeys = ['neutral_stand', 'walking', 'sitting', 'action_ready', 'relaxed', 'tense'];
            let nextSelected = prev.selectedPoses ? [...prev.selectedPoses] : [];
            if (nextSelected.length > clamped) {
                nextSelected = nextSelected.slice(0, clamped);
            } else if (nextSelected.length < clamped) {
                if (nextSelected.length === 0 && prev.activePose && prev.activePose !== 'all_6_poses') {
                    nextSelected.push(prev.activePose);
                }
                for (const k of allKeys) {
                    if (nextSelected.length >= clamped) break;
                    if (!nextSelected.includes(k)) nextSelected.push(k);
                }
            }
            return {
                ...prev,
                posePhotoCount: clamped,
                selectedPoses: nextSelected,
                outputType: 'pose_grid',
                activePose: clamped === 1 ? (nextSelected[0] || prev.activePose || 'neutral_stand') : prev.activePose
            };
        });
    };

    const handleSelectPose = (poseId: string, setAsPromptMode: boolean = true) => {
        const currentCount = posePhotoCount;
        if (currentCount === 1) {
            setData(prev => ({
                ...prev,
                activePose: poseId,
                selectedPoses: [poseId],
                outputType: setAsPromptMode ? 'pose_grid' : prev.outputType,
                poseDetails: POSE_DEFINITIONS[poseId]?.desc || prev.poseDetails,
            }));
        } else {
            setData(prev => {
                let currentSelected = prev.selectedPoses ? [...prev.selectedPoses] : [];
                if (currentSelected.includes(poseId)) {
                    if (currentSelected.length > 1) {
                        currentSelected = currentSelected.filter(id => id !== poseId);
                    }
                } else {
                    if (currentSelected.length >= currentCount) {
                        currentSelected = [...currentSelected.slice(0, currentCount - 1), poseId];
                    } else {
                        currentSelected.push(poseId);
                    }
                }
                return {
                    ...prev,
                    activePose: poseId,
                    selectedPoses: currentSelected,
                    outputType: setAsPromptMode ? 'pose_grid' : prev.outputType,
                    poseDetails: POSE_DEFINITIONS[poseId]?.desc || prev.poseDetails
                };
            });
        }
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

    const modelFileInputRef = React.useRef<HTMLInputElement>(null);
    const [customModelImage, setCustomModelImage] = useState<{ base64: string; mimeType: string; name: string } | null>(null);
    const [isSynthesizing, setIsSynthesizing] = useState<boolean>(false);

    // Modelo efetivo (imagem carregada diretamente no estúdio OU recebida via prop da imagem ativa)
    const effectiveModel = customModelImage || (activeImageBase64 ? {
        base64: activeImageBase64,
        mimeType: activeImageMimeType,
        name: activeImageName || 'Modelo Ativo'
    } : null);

    const handleModelFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = () => {
            const result = reader.result as string;
            const commaIndex = result.indexOf(',');
            const base64 = commaIndex !== -1 ? result.substring(commaIndex + 1) : result;
            setCustomModelImage({
                base64,
                mimeType: file.type || 'image/jpeg',
                name: file.name
            });
            setExtractSuccess(`Foto do Modelo "${file.name}" carregada com sucesso!`);
            setTimeout(() => setExtractSuccess(null), 4000);
        };
        reader.readAsDataURL(file);
        if (e.target) {
            e.target.value = '';
        }
    };

    const [isDragOverModel, setIsDragOverModel] = useState<boolean>(false);

    const handleModelDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOverModel(true);
    };

    const handleModelDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOverModel(false);
    };

    const handleModelDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOverModel(false);
        const files = Array.from(e.dataTransfer.files) as File[];
        if (files.length > 0) {
            const file = files[0];
            const reader = new FileReader();
            reader.onload = () => {
                const result = reader.result as string;
                const commaIndex = result.indexOf(',');
                const base64 = commaIndex !== -1 ? result.substring(commaIndex + 1) : result;
                setCustomModelImage({
                    base64,
                    mimeType: file.type || 'image/jpeg',
                    name: file.name
                });
                setExtractSuccess(`Foto do Modelo "${file.name}" carregada com sucesso!`);
                setTimeout(() => setExtractSuccess(null), 4000);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRemoveModelImage = () => {
        setCustomModelImage(null);
    };

    // Auto-preencher biometria do modelo a partir do modelo efetivo
    const handleExtractModelIdentity = async () => {
        if (!effectiveModel?.base64) {
            setExtractSuccess('Envie uma foto do modelo para a IA extrair a biometria facial e corporal.');
            setTimeout(() => setExtractSuccess(null), 4000);
            return;
        }
        setIsExtracting(true);
        setExtractSuccess(null);
        try {
            const extracted = await extractModelSheetFromImage(effectiveModel.base64, effectiveModel.mimeType);
            setData(prev => ({
                ...prev,
                ...extracted,
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
            setExtractSuccess(`Biometria, traços faciais e identidade extraídos com sucesso de "${effectiveModel.name}"!`);
            setTimeout(() => setExtractSuccess(null), 4000);
        } catch (err: any) {
            console.error('Falha ao extrair biometria do modelo:', err);
            setExtractSuccess('Não foi possível extrair a identidade do modelo. Tente novamente.');
            setTimeout(() => setExtractSuccess(null), 5000);
        } finally {
            setIsExtracting(false);
        }
    };

    // Ação Mestre: Vestir o Modelo com a Roupa da Foto
    const handleSynthesizeModelAndWardrobe = async () => {
        const clothingImg = wardrobeImages[0];
        if (!effectiveModel && !clothingImg) {
            setExtractWardrobeMsg({
                text: 'Por favor, envie a foto do modelo ou a foto da roupa para extrair o visual.',
                type: 'error'
            });
            setTimeout(() => setExtractWardrobeMsg(null), 4000);
            return;
        }

        setIsSynthesizing(true);
        setExtractWardrobeMsg(null);
        try {
            const combined = await extractModelWithWardrobe(
                effectiveModel ? { base64: effectiveModel.base64, mimeType: effectiveModel.mimeType } : undefined,
                clothingImg ? { base64: clothingImg.base64, mimeType: clothingImg.mimeType } : undefined,
                data.gender,
                data.wardrobeReferenceNotes
            );

            setData(prev => ({
                ...prev,
                ...combined,
                colorSwatches: (combined.colorSwatches && combined.colorSwatches.length > 0)
                    ? combined.colorSwatches
                    : prev.colorSwatches,
                fabricTextures: (combined.fabricTextures && combined.fabricTextures.length > 0)
                    ? combined.fabricTextures
                    : prev.fabricTextures,
                materialReferences: (combined.materialReferences && combined.materialReferences.length > 0)
                    ? combined.materialReferences
                    : prev.materialReferences
            }));

            setExtractWardrobeMsg({
                text: `Sucesso! O Modelo (${effectiveModel?.name || data.characterName}) foi vestido com o figurino da foto de referência!`,
                type: 'success'
            });
            setTimeout(() => setExtractWardrobeMsg(null), 5000);
        } catch (err: any) {
            console.error('Erro na síntese de modelo e roupa:', err);
            setExtractWardrobeMsg({
                text: `Não foi possível combinar modelo e roupa automaticamente: ${err.message || 'Erro de conexão'}.`,
                type: 'error'
            });
            setTimeout(() => setExtractWardrobeMsg(null), 5000);
        } finally {
            setIsSynthesizing(false);
        }
    };

    const wardrobeInputRef = React.useRef<HTMLInputElement>(null);
    const [selectedRole, setSelectedRole] = useState<WardrobeReferenceItem['role']>('full_outfit');
    const [wardrobeImages, setWardrobeImages] = useState<WardrobeReferenceItem[]>([]);
    const [isExtractingWardrobe, setIsExtractingWardrobe] = useState<boolean>(false);
    const [extractWardrobeMsg, setExtractWardrobeMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
    const [activeWardrobePreset, setActiveWardrobePreset] = useState<string | null>(null);
    const [isDragOverWardrobe, setIsDragOverWardrobe] = useState<boolean>(false);

    // Processamento robusto de arquivos de vestuário / figurino
    const processWardrobeFiles = (filesList: File[]) => {
        if (!filesList || filesList.length === 0) return;

        const newItems: WardrobeReferenceItem[] = [];
        let processedCount = 0;

        filesList.forEach((file: File, index: number) => {
            const reader = new FileReader();
            reader.onload = () => {
                const result = reader.result as string;
                const commaIndex = result.indexOf(',');
                const base64 = commaIndex !== -1 ? result.substring(commaIndex + 1) : result;
                
                const ext = file.name.split('.').pop()?.toLowerCase();
                const mime = file.type && file.type.startsWith('image/') 
                    ? file.type 
                    : (ext === 'png' ? 'image/png' : ext === 'webp' ? 'image/webp' : ext === 'gif' ? 'image/gif' : ext === 'svg' ? 'image/svg+xml' : 'image/jpeg');

                newItems.push({
                    id: `w_ref_${Date.now()}_${index}_${Math.random().toString(36).substring(2, 6)}`,
                    role: selectedRole,
                    label: selectedRole === 'full_outfit' ? 'Look Completo' 
                         : selectedRole === 'top_piece' ? 'Parte Superior (Top/Blusa)' 
                         : selectedRole === 'bottom_piece' ? 'Parte Inferior (Calça/Saia)' 
                         : selectedRole === 'shoes_accessories' ? 'Calçados & Acessórios' 
                         : 'Textura & Estampa',
                    base64,
                    mimeType: mime,
                    fileName: file.name
                });

                processedCount++;
                if (processedCount === filesList.length) {
                    setWardrobeImages(prev => {
                        const updated = [...prev, ...newItems];
                        setData(d => ({ ...d, wardrobeReferences: updated }));
                        return updated;
                    });
                    setExtractWardrobeMsg({
                        text: `${filesList.length === 1 ? `Foto "${file.name}"` : `${filesList.length} fotos`} de vestuário adicionada(s)! Clique em "✨ Extrair com IA" para preencher a ficha.`,
                        type: 'success'
                    });
                    setTimeout(() => setExtractWardrobeMsg(null), 5000);
                }
            };
            reader.onerror = () => {
                processedCount++;
            };
            reader.readAsDataURL(file);
        });
    };

    // Manipulador de upload de imagens de vestuário
    const handleWardrobeFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;
        processWardrobeFiles(Array.from(files));
        if (e.target) {
            e.target.value = '';
        }
    };

    const handleWardrobeDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOverWardrobe(true);
    };

    const handleWardrobeDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOverWardrobe(false);
    };

    const handleWardrobeDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOverWardrobe(false);
        const files = Array.from(e.dataTransfer.files) as File[];
        if (files.length > 0) {
            processWardrobeFiles(files);
        }
    };

    // Adiciona uma das fotos já enviadas no app principal como referência de figurino
    const handleAddAvailableImageAsWardrobe = (img: UploadedImage) => {
        if (!img.base64Data) return;
        const newItem: WardrobeReferenceItem = {
            id: `w_ref_${Date.now()}_${img.id}`,
            role: selectedRole,
            label: selectedRole === 'full_outfit' ? 'Look Completo' 
                 : selectedRole === 'top_piece' ? 'Parte Superior' 
                 : selectedRole === 'bottom_piece' ? 'Parte Inferior' 
                 : selectedRole === 'shoes_accessories' ? 'Calçados & Acessórios' 
                 : 'Textura & Estampa',
            base64: img.base64Data,
            mimeType: img.mimeType || 'image/jpeg',
            fileName: img.name
        };
        setWardrobeImages(prev => {
            const updated = [...prev, newItem];
            setData(d => ({ ...d, wardrobeReferences: updated }));
            return updated;
        });
        setExtractWardrobeMsg({
            text: `Foto "${img.name}" adicionada como referência de figurino!`,
            type: 'success'
        });
        setTimeout(() => setExtractWardrobeMsg(null), 4000);
    };

    // Define uma das fotos já enviadas no app principal como Foto do Modelo
    const handleSelectAvailableImageAsModel = (img: UploadedImage) => {
        if (!img.base64Data) return;
        setCustomModelImage({
            base64: img.base64Data,
            mimeType: img.mimeType || 'image/jpeg',
            name: img.name
        });
        setExtractSuccess(`Foto "${img.name}" selecionada como Modelo!`);
        setTimeout(() => setExtractSuccess(null), 4000);
    };

    const handleRemoveWardrobeImage = (id: string) => {
        setWardrobeImages(prev => {
            const updated = prev.filter(img => img.id !== id);
            setData(d => ({ ...d, wardrobeReferences: updated }));
            return updated;
        });
    };

    const handleUpdateWardrobeRole = (id: string, newRole: WardrobeReferenceItem['role']) => {
        setWardrobeImages(prev => {
            const updated = prev.map(img => img.id === id ? { 
                ...img, 
                role: newRole,
                label: newRole === 'full_outfit' ? 'Look Completo' 
                     : newRole === 'top_piece' ? 'Parte Superior' 
                     : newRole === 'bottom_piece' ? 'Parte Inferior' 
                     : newRole === 'shoes_accessories' ? 'Calçados & Acessórios' 
                     : 'Textura & Estampa'
            } : img);
            setData(d => ({ ...d, wardrobeReferences: updated }));
            return updated;
        });
    };

    // Auto-extrair vestuário da foto de referência usando Gemini Multimodal Vision
    const handleExtractWardrobeItem = async (item: WardrobeReferenceItem) => {
        setIsExtractingWardrobe(true);
        setExtractWardrobeMsg(null);
        try {
            const extracted = await extractWardrobeFromImage(
                item.base64,
                item.mimeType,
                item.role,
                data.gender,
                data.wardrobeReferenceNotes
            );

            setData(prev => {
                const existingHexes = new Set(prev.colorSwatches.map(c => c.hex.toUpperCase()));
                const newSwatches = (extracted.colorSwatches || []).filter(c => !existingHexes.has(c.hex.toUpperCase()));
                const updatedColors = [...prev.colorSwatches, ...newSwatches];
                const updatedFabrics = Array.from(new Set([...prev.fabricTextures, ...(extracted.fabricTextures || [])]));

                return {
                    ...prev,
                    outfitType: extracted.outfitType || prev.outfitType,
                    topNeckline: extracted.topNeckline || prev.topNeckline,
                    sleevesOrStraps: extracted.sleevesOrStraps || prev.sleevesOrStraps,
                    bottomPiece: extracted.bottomPiece || prev.bottomPiece,
                    footwear: extracted.footwear || prev.footwear,
                    accessories: extracted.accessories || prev.accessories,
                    fabricTextures: updatedFabrics,
                    colorSwatches: updatedColors,
                    materialReferences: Array.from(new Set([...prev.materialReferences, ...(extracted.materialReferences || [])]))
                };
            });

            setWardrobeImages(prev => {
                const updated = prev.map(img => img.id === item.id ? { 
                    ...img, 
                    analysisSummary: extracted.wardrobeSummary || extracted.outfitType 
                } : img);
                setData(d => ({ ...d, wardrobeReferences: updated }));
                return updated;
            });

            setExtractWardrobeMsg({
                text: `Vestuário extraído com sucesso da imagem "${item.fileName}"! Todos os campos de figurino, tecidos e cores foram atualizados.`,
                type: 'success'
            });
            setTimeout(() => setExtractWardrobeMsg(null), 5000);
        } catch (err: any) {
            console.error('Falha ao extrair vestuário:', err);
            setExtractWardrobeMsg({
                text: `Não foi possível extrair automaticamente o figurino: ${err.message || 'Erro de conexão'}.`,
                type: 'error'
            });
            setTimeout(() => setExtractWardrobeMsg(null), 6000);
        } finally {
            setIsExtractingWardrobe(false);
        }
    };

    // Aplicar preset de vestuário pronto
    const handleApplyWardrobePreset = (preset: WardrobePresetItem) => {
        setActiveWardrobePreset(preset.id);
        setData(prev => {
            const existingHexes = new Set(prev.colorSwatches.map(c => c.hex.toUpperCase()));
            const newSwatches = preset.colorSwatches.filter(c => !existingHexes.has(c.hex.toUpperCase()));
            return {
                ...prev,
                outfitType: preset.outfitType,
                topNeckline: preset.topNeckline,
                sleevesOrStraps: preset.sleevesOrStraps,
                bottomPiece: preset.bottomPiece,
                footwear: preset.footwear,
                accessories: preset.accessories,
                fabricTextures: preset.fabricTextures,
                colorSwatches: [...prev.colorSwatches, ...newSwatches],
                materialReferences: Array.from(new Set([...prev.materialReferences, ...preset.materialReferences]))
            };
        });
        setExtractWardrobeMsg({
            text: `Preset de figurino "${preset.name}" aplicado à ficha com sucesso!`,
            type: 'success'
        });
        setTimeout(() => setExtractWardrobeMsg(null), 4000);
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

    // Alternador inteligente de Categoria & Gênero do Modelo (Mulher, Homem, Crianças e Adolescentes)
    const handleSwitchGender = (newGender: ModelGender) => {
        if (newGender === 'boy') {
            setData(KID_BOY_PRESET);
            setExtractSuccess('Modelo Criança (Menino 8 anos) ativado: proporções infantis e figurino lúdico!');
        } else if (newGender === 'girl') {
            setData(KID_GIRL_PRESET);
            setExtractSuccess('Modelo Criança (Menina 7 anos) ativada: proporções infantis e vestidinho doce!');
        } else if (newGender === 'teen_boy') {
            setData(TEEN_BOY_PRESET);
            setExtractSuccess('Modelo Adolescente (Garoto 15 anos) ativado: estilo streetwear teen!');
        } else if (newGender === 'teen_girl') {
            setData(TEEN_GIRL_PRESET);
            setExtractSuccess('Modelo Adolescente (Garota 16 anos) ativada: estilo aesthetic Gen-Z!');
        } else if (newGender === 'man') {
            setData(MALE_MODEL_PRESET);
            setExtractSuccess('Modelo Adulto Masculino (Homem) ativado!');
        } else {
            setData(SOAIMA_PRESET);
            setExtractSuccess('Modelo Adulto Feminino (Mulher) ativada!');
        }
        setTimeout(() => setExtractSuccess(null), 3500);
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

                {/* Seletor Master de Modelo: Adultos, Crianças e Adolescentes */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between bg-slate-950/90 p-3 rounded-xl border border-slate-800 gap-3">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2.5">
                        <span className="text-xs font-black uppercase text-slate-300 flex items-center gap-1.5 shrink-0">
                            <User size={14} className={data.gender === 'boy' || data.gender === 'man' || data.gender === 'teen_boy' ? 'text-blue-400' : 'text-pink-400'} />
                            <span>Categoria / Idade do Modelo:</span>
                        </span>
                        
                        <div className="flex flex-wrap p-1 bg-slate-900 border border-slate-700/80 rounded-xl gap-1">
                            {/* ADULTOS */}
                            <button
                                type="button"
                                onClick={() => handleSwitchGender('woman')}
                                className={`px-2.5 py-1.5 rounded-lg text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer ${
                                    data.gender === 'woman'
                                        ? 'bg-gradient-to-r from-pink-600 via-rose-600 to-red-600 text-white shadow-md shadow-pink-500/30 ring-1 ring-pink-400'
                                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                                }`}
                                title="Modelo Adulta Feminina (22-28 anos)"
                            >
                                <span>👩 Mulher</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => handleSwitchGender('man')}
                                className={`px-2.5 py-1.5 rounded-lg text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer ${
                                    data.gender === 'man'
                                        ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 text-white shadow-md shadow-blue-500/30 ring-1 ring-blue-400'
                                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                                }`}
                                title="Modelo Adulto Masculino (24-30 anos)"
                            >
                                <span>👨 Homem</span>
                            </button>

                            {/* CRIANÇAS */}
                            <button
                                type="button"
                                onClick={() => handleSwitchGender('boy')}
                                className={`px-2.5 py-1.5 rounded-lg text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer ${
                                    data.gender === 'boy'
                                        ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-md shadow-amber-500/30 ring-1 ring-amber-400'
                                        : 'text-amber-400/80 hover:text-amber-200 hover:bg-amber-950/30'
                                }`}
                                title="Modelo Infantil Masculino (Criança de 8 anos)"
                            >
                                <span>👦 Criança (Menino)</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => handleSwitchGender('girl')}
                                className={`px-2.5 py-1.5 rounded-lg text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer ${
                                    data.gender === 'girl'
                                        ? 'bg-gradient-to-r from-rose-500 to-pink-600 text-white shadow-md shadow-pink-500/30 ring-1 ring-pink-400'
                                        : 'text-rose-400/80 hover:text-rose-200 hover:bg-rose-950/30'
                                }`}
                                title="Modelo Infantil Feminino (Criança de 7 anos)"
                            >
                                <span>👧 Criança (Menina)</span>
                            </button>

                            {/* ADOLESCENTES */}
                            <button
                                type="button"
                                onClick={() => handleSwitchGender('teen_boy')}
                                className={`px-2.5 py-1.5 rounded-lg text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer ${
                                    data.gender === 'teen_boy'
                                        ? 'bg-gradient-to-r from-cyan-600 to-blue-700 text-white shadow-md shadow-cyan-500/30 ring-1 ring-cyan-400'
                                        : 'text-cyan-400/80 hover:text-cyan-200 hover:bg-cyan-950/30'
                                }`}
                                title="Modelo Adolescente Masculino (Teen de 15 anos)"
                            >
                                <span>🛹 Teen (Garoto)</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => handleSwitchGender('teen_girl')}
                                className={`px-2.5 py-1.5 rounded-lg text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer ${
                                    data.gender === 'teen_girl'
                                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md shadow-purple-500/30 ring-1 ring-purple-400'
                                        : 'text-purple-400/80 hover:text-purple-200 hover:bg-purple-950/30'
                                }`}
                                title="Modelo Adolescente Feminino (Teen de 16 anos)"
                            >
                                <span>🌸 Teen (Garota)</span>
                            </button>
                        </div>
                    </div>

                    <div className="text-[11px] text-slate-400 flex items-center gap-2">
                        <span className={`font-mono text-[10px] px-2.5 py-1 rounded-md border font-bold ${
                            data.gender === 'boy' || data.gender === 'girl'
                                ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                                : data.gender === 'teen_boy' || data.gender === 'teen_girl'
                                ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-300'
                                : data.gender === 'woman'
                                ? 'bg-pink-500/10 border-pink-500/30 text-pink-300'
                                : 'bg-blue-500/10 border-blue-500/30 text-blue-300'
                        }`}>
                            {data.gender === 'boy' ? '✓ Criança (Menino 8a)'
                             : data.gender === 'girl' ? '✓ Criança (Menina 7a)'
                             : data.gender === 'teen_boy' ? '✓ Teen (Garoto 15a)'
                             : data.gender === 'teen_girl' ? '✓ Teen (Garota 16a)'
                             : data.gender === 'woman' ? '✓ Mulher Adulta'
                             : '✓ Homem Adulto'}
                        </span>
                    </div>
                </div>

                {/* Presets Rápidos Contextuais por Categoria & Gênero */}
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

                    <button
                        type="button"
                        onClick={() => {
                            setActiveSection('costume');
                            setTimeout(() => wardrobeInputRef.current?.click(), 100);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 hover:from-amber-500 hover:to-orange-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-amber-500/20 transition-all active:scale-95 cursor-pointer"
                        title="Enviar fotos de vestidos, jaquetas ou roupas de referência para trocar o vestuário"
                    >
                        <Shirt size={13} className="text-amber-200" />
                        <span>Upar Fotos de Vestuário</span>
                        <span className="px-1.5 py-0.5 text-[9px] bg-black/40 rounded-full text-amber-200 font-black border border-amber-400/30">
                            NOVO
                        </span>
                    </button>

                    {/* Presets específicos de Crianças */}
                    {(data.gender === 'boy' || data.gender === 'girl') && (
                        <>
                            <button
                                onClick={() => setData(KID_BOY_PRESET)}
                                className={`px-2.5 py-1.5 rounded-xl border text-[11px] font-bold flex items-center gap-1.5 transition-all ${
                                    data.gender === 'boy'
                                        ? 'bg-amber-600/30 border-amber-500 text-amber-200'
                                        : 'bg-slate-800/90 hover:bg-slate-700 border-slate-700 text-slate-300'
                                }`}
                            >
                                <span>👦 Lucas (Criança 8a - Aventura)</span>
                            </button>
                            <button
                                onClick={() => setData(KID_GIRL_PRESET)}
                                className={`px-2.5 py-1.5 rounded-xl border text-[11px] font-bold flex items-center gap-1.5 transition-all ${
                                    data.gender === 'girl'
                                        ? 'bg-rose-600/30 border-rose-500 text-rose-200'
                                        : 'bg-slate-800/90 hover:bg-slate-700 border-slate-700 text-slate-300'
                                }`}
                            >
                                <span>👧 Maya (Criança 7a - Vestidinho)</span>
                            </button>
                        </>
                    )}

                    {/* Presets específicos de Adolescentes */}
                    {(data.gender === 'teen_boy' || data.gender === 'teen_girl') && (
                        <>
                            <button
                                onClick={() => setData(TEEN_BOY_PRESET)}
                                className={`px-2.5 py-1.5 rounded-xl border text-[11px] font-bold flex items-center gap-1.5 transition-all ${
                                    data.gender === 'teen_boy'
                                        ? 'bg-cyan-600/30 border-cyan-500 text-cyan-200'
                                        : 'bg-slate-800/90 hover:bg-slate-700 border-slate-700 text-slate-300'
                                }`}
                            >
                                <span>🛹 Theo (Teen 15a - Streetwear Cargo)</span>
                            </button>
                            <button
                                onClick={() => setData(TEEN_GIRL_PRESET)}
                                className={`px-2.5 py-1.5 rounded-xl border text-[11px] font-bold flex items-center gap-1.5 transition-all ${
                                    data.gender === 'teen_girl'
                                        ? 'bg-purple-600/30 border-purple-500 text-purple-200'
                                        : 'bg-slate-800/90 hover:bg-slate-700 border-slate-700 text-slate-300'
                                }`}
                            >
                                <span>🌸 Clara (Teen 16a - Aesthetic Gen-Z)</span>
                            </button>
                        </>
                    )}

                    {/* Presets de Mulher Adulta */}
                    {data.gender === 'woman' && (
                        <>
                            <button
                                onClick={() => setData(SOAIMA_PRESET)}
                                className="px-2.5 py-1.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 border border-red-500/40 text-red-300 hover:text-white font-bold text-[11px] flex items-center gap-1.5 transition-all"
                            >
                                <span className="w-2 h-2 rounded-full bg-red-500" />
                                <span>Soaima (Vestido Gala)</span>
                            </button>
                            <button
                                onClick={() => setData(SOFIA_PRESET)}
                                className="px-2.5 py-1.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 border border-amber-500/40 text-amber-300 hover:text-white font-bold text-[11px] flex items-center gap-1.5 transition-all"
                            >
                                <span className="w-2 h-2 rounded-full bg-amber-400" />
                                <span>Sofia (Conjunto & Tênis)</span>
                            </button>
                            <button
                                onClick={() => setData(FEMALE_CASUAL_PRESET)}
                                className="px-2.5 py-1.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 border border-pink-500/40 text-pink-300 hover:text-white font-bold text-[11px] flex items-center gap-1.5 transition-all"
                            >
                                <span className="w-2 h-2 rounded-full bg-pink-400" />
                                <span>Clara (Casual Chic)</span>
                            </button>
                        </>
                    )}

                    {/* Presets de Homem Adulto */}
                    {data.gender === 'man' && (
                        <>
                            <button
                                onClick={() => setData(MALE_MODEL_PRESET)}
                                className="px-2.5 py-1.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 border border-blue-500/40 text-blue-300 hover:text-white font-bold text-[11px] flex items-center gap-1.5 transition-all"
                            >
                                <span className="w-2 h-2 rounded-full bg-blue-500" />
                                <span>Lucas (Jaqueta Carmesim)</span>
                            </button>
                            <button
                                onClick={() => setData(MALE_CASUAL_PRESET)}
                                className="px-2.5 py-1.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 border border-cyan-500/40 text-cyan-300 hover:text-white font-bold text-[11px] flex items-center gap-1.5 transition-all"
                            >
                                <span className="w-2 h-2 rounded-full bg-cyan-400" />
                                <span>Alex (Casual Linho)</span>
                            </button>
                            <button
                                onClick={() => setData(MALE_BUSINESS_PRESET)}
                                className="px-2.5 py-1.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 border border-indigo-500/40 text-indigo-300 hover:text-white font-bold text-[11px] flex items-center gap-1.5 transition-all"
                            >
                                <span className="w-2 h-2 rounded-full bg-indigo-400" />
                                <span>Gabriel (Terno Slim)</span>
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

            {/* Inputs Ocultos para Upload do Modelo e Vestuário (Sempre Ativos em Qualquer Seção) */}
            <input 
                type="file"
                ref={modelFileInputRef}
                onChange={handleModelFileUpload}
                accept="image/*,.jpg,.jpeg,.png,.webp,.gif,.bmp,.tiff,.tif,.jfif,.jiff,.heic,.heif,.svg,.avif,.dng,.raw"
                className="hidden"
            />
            <input 
                type="file"
                ref={wardrobeInputRef}
                onChange={handleWardrobeFileUpload}
                multiple
                accept="image/*,.jpg,.jpeg,.png,.webp,.gif,.bmp,.tiff,.tif,.jfif,.jiff,.heic,.heif,.svg,.avif,.dng,.raw"
                className="hidden"
            />

            {/* PAINEL CENTRAL DE REFERÊNCIAS: FOTO DO MODELO + FOTO DA ROUPA */}
            <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-3.5 sm:p-4 rounded-2xl border border-slate-800 shadow-xl space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 border-b border-slate-800/80 pb-2">
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-black uppercase text-amber-400 flex items-center gap-1.5">
                            <Camera size={14} className="text-amber-400" />
                            <span>Central de Referências: Modelo & Vestuário</span>
                        </span>
                        <span className="px-1.5 py-0.2 text-[9px] font-black uppercase rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                            Extração Visual
                        </span>
                    </div>
                    <span className="text-[10px] text-slate-400">
                        Carregue a foto de quem vai vestir (Modelo) e a foto do que vai vestir (Roupa / Figurino)
                    </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                    {/* CARD 1: FOTO DO MODELO / PERSONAGEM (Com Drag & Drop direto) */}
                    <div 
                        onDragOver={handleModelDragOver}
                        onDragLeave={handleModelDragLeave}
                        onDrop={handleModelDrop}
                        className={`p-3 rounded-xl border transition-all flex flex-col justify-between gap-2.5 ${
                            isDragOverModel
                                ? 'bg-blue-950/60 border-blue-400 ring-2 ring-blue-400/50 shadow-lg'
                                : effectiveModel 
                                ? 'bg-slate-900/90 border-blue-500/40 shadow-md shadow-blue-500/10' 
                                : 'bg-slate-950/70 border-slate-800 border-dashed hover:border-blue-500/60'
                        }`}
                    >
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                                <User size={13} className={data.gender === 'boy' || data.gender === 'man' || data.gender === 'teen_boy' ? 'text-blue-400' : 'text-pink-400'} />
                                <span>1. Foto do Modelo / Pessoa</span>
                            </span>
                            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${
                                effectiveModel 
                                    ? 'bg-blue-500/20 text-blue-300 border-blue-500/40' 
                                    : 'bg-slate-800 text-slate-400 border-slate-700'
                            }`}>
                                {effectiveModel ? '✓ Foto Carregada' : 'Aguardando Foto / Arraste Aqui'}
                            </span>
                        </div>

                        {effectiveModel ? (
                            <div className="flex items-center gap-3">
                                <div className="w-20 h-24 rounded-lg overflow-hidden border border-slate-700 bg-black shrink-0 relative shadow">
                                    <img 
                                        src={`data:${effectiveModel.mimeType};base64,${effectiveModel.base64}`} 
                                        alt={effectiveModel.name}
                                        className="w-full h-full object-cover"
                                    />
                                    <span className="absolute bottom-0.5 right-0.5 px-1 py-0.2 bg-black/80 text-[8px] text-blue-300 font-mono rounded">
                                        Modelo
                                    </span>
                                </div>
                                <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5 space-y-1.5">
                                    <div>
                                        <p className="text-xs font-bold text-white truncate" title={effectiveModel.name}>
                                            {effectiveModel.name}
                                        </p>
                                        <p className="text-[10px] text-slate-400 leading-tight">
                                            Rosto, biometria facial, tom de pele e cabelo serão preservados na ficha.
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                        <button
                                            type="button"
                                            onClick={handleExtractModelIdentity}
                                            disabled={isExtracting}
                                            className="px-2 py-1 rounded bg-blue-600 hover:bg-blue-500 text-white font-bold text-[10px] flex items-center gap-1 transition-all active:scale-95 disabled:opacity-40 cursor-pointer"
                                            title="Extrair biometria e traços faciais desta foto"
                                        >
                                            {isExtracting ? <RefreshCw size={10} className="animate-spin" /> : <Wand2 size={10} />}
                                            <span>{isExtracting ? "Extraindo..." : "Extrair Biometria"}</span>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => modelFileInputRef.current?.click()}
                                            className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-bold text-[10px] border border-slate-700 transition-all cursor-pointer"
                                        >
                                            Trocar Foto
                                        </button>
                                        {customModelImage && (
                                            <button
                                                type="button"
                                                onClick={handleRemoveModelImage}
                                                className="p-1 text-slate-400 hover:text-red-400 transition-colors cursor-pointer"
                                                title="Remover foto personalizada"
                                            >
                                                <Trash2 size={13} />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div 
                                onClick={() => modelFileInputRef.current?.click()}
                                className="py-5 px-3 flex flex-col items-center justify-center text-center cursor-pointer group"
                            >
                                <div className="w-10 h-10 rounded-full bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 mb-2 group-hover:scale-105 transition-transform">
                                    <Upload size={18} />
                                </div>
                                <p className="text-xs font-bold text-slate-300 group-hover:text-blue-300 transition-colors">
                                    Clique ou Arraste a Foto do Modelo Aqui
                                </p>
                                <p className="text-[10px] text-slate-500 mt-0.5">
                                    Envie foto de pessoa ou use o preset ativo ({data.characterName})
                                </p>
                            </div>
                        )}
                    </div>

                    {/* CARD 2: FOTO DO VESTUÁRIO / ROUPA A EXTRAIR (Com Drag & Drop direto e clique imediato) */}
                    <div 
                        onDragOver={handleWardrobeDragOver}
                        onDragLeave={handleWardrobeDragLeave}
                        onDrop={handleWardrobeDrop}
                        className={`p-3 rounded-xl border transition-all flex flex-col justify-between gap-2.5 ${
                            isDragOverWardrobe
                                ? 'bg-amber-950/60 border-amber-400 ring-2 ring-amber-400/50 shadow-lg'
                                : wardrobeImages.length > 0 
                                ? 'bg-slate-900/90 border-amber-500/40 shadow-md shadow-amber-500/10' 
                                : 'bg-slate-950/70 border-slate-800 border-dashed hover:border-amber-500/60'
                        }`}
                    >
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                                <Shirt size={13} className="text-amber-400" />
                                <span>2. Foto da Roupa / Figurino</span>
                            </span>
                            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${
                                wardrobeImages.length > 0 
                                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' 
                                    : 'bg-slate-800 text-slate-400 border-slate-700'
                            }`}>
                                {wardrobeImages.length > 0 ? `✓ ${wardrobeImages.length} Foto(s) de Roupa` : 'Aguardando Roupa / Arraste Aqui'}
                            </span>
                        </div>

                        {wardrobeImages.length > 0 ? (
                            <div className="flex items-center gap-3">
                                <div className="w-20 h-24 rounded-lg overflow-hidden border border-slate-700 bg-black shrink-0 relative shadow">
                                    <img 
                                        src={`data:${wardrobeImages[0].mimeType};base64,${wardrobeImages[0].base64}`} 
                                        alt={wardrobeImages[0].fileName}
                                        className="w-full h-full object-cover"
                                    />
                                    <span className="absolute bottom-0.5 right-0.5 px-1 py-0.2 bg-black/80 text-[8px] text-amber-300 font-mono rounded">
                                        Roupa
                                    </span>
                                </div>
                                <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5 space-y-1.5">
                                    <div>
                                        <p className="text-xs font-bold text-white truncate" title={wardrobeImages[0].fileName}>
                                            {wardrobeImages[0].fileName}
                                        </p>
                                        <p className="text-[10px] text-slate-400 leading-tight truncate">
                                            {data.outfitType || 'Cortes, tecidos, gola, calçados e cores extraídos.'}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                        <button
                                            type="button"
                                            onClick={() => handleExtractWardrobeItem(wardrobeImages[0])}
                                            disabled={isExtractingWardrobe}
                                            className="px-2 py-1 rounded bg-amber-600 hover:bg-amber-500 text-white font-bold text-[10px] flex items-center gap-1 transition-all active:scale-95 disabled:opacity-40 cursor-pointer"
                                            title="Extrair cortes e cores desta roupa para a ficha"
                                        >
                                            {isExtractingWardrobe ? <RefreshCw size={10} className="animate-spin" /> : <Wand2 size={10} />}
                                            <span>{isExtractingWardrobe ? "Extraindo..." : "Extrair Roupa"}</span>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => wardrobeInputRef.current?.click()}
                                            className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-bold text-[10px] border border-slate-700 transition-all cursor-pointer"
                                        >
                                            + Mais Roupas
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setActiveSection('costume')}
                                            className="px-2 py-1 rounded bg-slate-800/80 hover:bg-slate-700 text-amber-300 font-bold text-[10px] border border-slate-700/80 transition-all cursor-pointer"
                                        >
                                            Ver Figurino
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div 
                                onClick={() => wardrobeInputRef.current?.click()}
                                className="py-5 px-3 flex flex-col items-center justify-center text-center cursor-pointer group"
                            >
                                <div className="w-10 h-10 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-2 group-hover:scale-105 transition-transform">
                                    <Upload size={18} />
                                </div>
                                <p className="text-xs font-bold text-slate-300 group-hover:text-amber-300 transition-colors">
                                    Clique ou Arraste a Foto da Roupa Aqui
                                </p>
                                <p className="text-[10px] text-slate-500 mt-0.5">
                                    Envie fotos de vestidos, jaquetas, camisas ou calças para vestir no modelo
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* BOTÃO MESTRE COMBINADO: VESTIR MODELO COM A ROUPA DA FOTO */}
                {(effectiveModel || wardrobeImages.length > 0) && (
                    <div className="pt-2 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-2.5">
                        <div className="text-[11px] text-slate-300 flex items-center gap-1.5">
                            <Sparkle size={13} className="text-amber-400 shrink-0" />
                            <span>
                                {effectiveModel && wardrobeImages.length > 0 
                                    ? `Pronto para transferir a roupa de "${wardrobeImages[0].fileName}" para o modelo "${effectiveModel.name}".`
                                    : wardrobeImages.length > 0 
                                    ? `Roupa carregada! A IA vestirá no modelo ${data.characterName} preservando biometria.`
                                    : `Modelo carregado! Carregue a foto da roupa para fazer a transferência de figurino.`}
                            </span>
                        </div>

                        <button
                            type="button"
                            onClick={handleSynthesizeModelAndWardrobe}
                            disabled={isSynthesizing || (!effectiveModel && wardrobeImages.length === 0)}
                            className="w-full sm:w-auto px-4 py-2 bg-gradient-to-r from-amber-500 via-orange-600 to-red-600 hover:from-amber-400 hover:to-red-500 text-white font-black text-xs rounded-xl shadow-lg shadow-orange-500/25 flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-40 cursor-pointer"
                        >
                            {isSynthesizing ? (
                                <RefreshCw size={13} className="animate-spin text-white" />
                            ) : (
                                <Sparkles size={13} className="text-amber-200" />
                            )}
                            <span>{isSynthesizing ? "Vestindo Modelo com IA..." : "✨ Vestir Modelo com a Roupa da Foto (IA)"}</span>
                        </button>
                    </div>
                )}

                {/* GALERIA DE FOTOS JÁ ENVIADAS NO APP (1 CLIQUE PARA USAR COMO MODELO OU ROUPA) */}
                {availableImages && availableImages.length > 0 && (
                    <div className="pt-2 border-t border-slate-800/80">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-[11px] font-black uppercase text-slate-300 flex items-center gap-1.5">
                                <ImageIcon size={13} className="text-amber-400" />
                                <span>Fotos Já Enviadas no Aplicativo ({availableImages.length}):</span>
                            </span>
                            <span className="text-[10px] text-slate-500">Clique para definir como Modelo ou como Roupa sem re-enviar</span>
                        </div>
                        <div className="flex items-center gap-2 overflow-x-auto pb-1.5 custom-scrollbar">
                            {availableImages.map(img => (
                                <div key={img.id} className="p-1.5 rounded-xl bg-slate-900 border border-slate-700/80 flex items-center gap-2 shrink-0 hover:border-amber-500/50 transition-all shadow-sm">
                                    <img 
                                        src={img.previewUrl || `data:${img.mimeType};base64,${img.base64Data}`} 
                                        alt={img.name} 
                                        className="w-10 h-10 rounded-lg object-cover bg-black shrink-0" 
                                    />
                                    <div className="flex flex-col gap-1 min-w-0">
                                        <span className="text-[10px] font-bold text-slate-200 truncate max-w-[130px]" title={img.name}>
                                            {img.name}
                                        </span>
                                        <div className="flex items-center gap-1">
                                            <button
                                                type="button"
                                                onClick={() => handleSelectAvailableImageAsModel(img)}
                                                className="px-1.5 py-0.5 rounded bg-blue-600/30 hover:bg-blue-600/60 border border-blue-500/40 text-[9px] font-black text-blue-300 hover:text-white transition-all cursor-pointer"
                                                title="Definir esta foto como o Modelo"
                                            >
                                                👤 Modelo
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handleAddAvailableImageAsWardrobe(img)}
                                                className="px-1.5 py-0.5 rounded bg-amber-600/30 hover:bg-amber-600/60 border border-amber-500/40 text-[9px] font-black text-amber-300 hover:text-white transition-all cursor-pointer"
                                                title="Adicionar esta foto como Roupa / Figurino"
                                            >
                                                👗 Roupa
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* PAINEL MASTER ON/OFF DOS 8 TIPOS DE PREENCHIMENTO DA FICHA */}
            <div className="bg-slate-950/90 p-3 sm:p-3.5 rounded-2xl border border-slate-800 space-y-2.5 shadow-md">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-2">
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-red-600/20 text-red-400 border border-red-500/30">
                            <Power size={14} />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-black uppercase text-slate-200 tracking-wide">
                                    Controle de Ativação dos 8 Tipos de Preenchimento (ON / OFF)
                                </span>
                                <span className={`px-2 py-0.5 rounded-full text-[9px] font-black border ${
                                    Object.values(sectionToggles).filter(Boolean).length === 8
                                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                                        : Object.values(sectionToggles).filter(Boolean).length > 0
                                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                                        : 'bg-red-500/20 text-red-300 border-red-500/40'
                                }`}>
                                    {Object.values(sectionToggles).filter(Boolean).length}/8 Seções Ativas no Prompt
                                </span>
                            </div>
                            <p className="text-[10px] text-slate-400 mt-0.5">
                                Ative ou desative qualquer seção com 1 clique para incluí-la ou removê-la do prompt master final gerado.
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                        <button
                            type="button"
                            onClick={() => handleSetAllSections(true)}
                            className="px-2.5 py-1 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/40 border border-emerald-500/40 text-emerald-300 text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer"
                            title="Ligar todas as 8 seções"
                        >
                            <CheckCircle2 size={12} />
                            <span>Ligar Todas (ON)</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => handleSetAllSections(false)}
                            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-400 hover:text-slate-200 text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer"
                            title="Desligar todas as 8 seções"
                        >
                            <Power size={12} />
                            <span>Desligar Todas (OFF)</span>
                        </button>
                    </div>
                </div>

                {/* 8 BOTOES SWITCHES INTERATIVOS ON/OFF */}
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-1.5">
                    {[
                        { id: 'profile', number: '1', label: '1. Perfil', desc: 'Identidade & Biótipo', icon: User },
                        { id: 'turnaround', number: '2', label: '2. 4 Vistas', desc: 'Turnaround 360°', icon: Compass },
                        { id: 'face', number: '3', label: '3. Rosto', desc: 'Biometria Facial', icon: Eye },
                        { id: 'expressions', number: '4', label: '4. Expressões', desc: '8 Emoções', icon: Heart },
                        { id: 'poses', number: '5', label: '5. Poses', desc: `${posePhotoCount} ${posePhotoCount === 1 ? 'Foto' : 'Fotos'}`, icon: Zap },
                        { id: 'costume', number: '6', label: '6. Figurino', desc: 'Roupas & Fotos', icon: Shirt },
                        { id: 'palette', number: '7', label: '7. Cores Hex', desc: 'Amostras de Cores', icon: Palette },
                        { 
                            id: 'lighting', 
                            number: '8', 
                            label: '8. Cenário & Luz', 
                            desc: data.photographyFraming === 'waist_up' ? 'Meio da barriga' : data.photographyFraming === 'chest_up' ? 'Peito pra cima' : 'Foto completa', 
                            icon: Sun 
                        },
                    ].map(item => {
                        const isEnabled = sectionToggles[item.id as StudioSection];
                        const Icon = item.icon;
                        return (
                            <button
                                key={item.id}
                                type="button"
                                onClick={() => toggleSection(item.id as StudioSection)}
                                className={`p-2 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer group ${
                                    isEnabled 
                                        ? 'bg-slate-900 border-emerald-500/50 shadow-sm hover:border-emerald-400' 
                                        : 'bg-slate-950/60 border-slate-800 text-slate-500 hover:border-slate-700 opacity-60 hover:opacity-90'
                                }`}
                                title={`Clique para ${isEnabled ? 'DESLIGAR (OFF)' : 'LIGAR (ON)'} a seção ${item.label}`}
                            >
                                <div className="flex items-center justify-between gap-1 mb-1">
                                    <span className={`text-[10px] font-mono font-bold ${isEnabled ? 'text-amber-400' : 'text-slate-500'}`}>
                                        #{item.number}
                                    </span>
                                    <span className={`px-1.5 py-0.2 rounded text-[8px] font-black uppercase flex items-center gap-0.5 border ${
                                        isEnabled 
                                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' 
                                            : 'bg-red-500/10 text-red-400 border-red-500/30'
                                    }`}>
                                        {isEnabled ? <ToggleRight size={10} /> : <ToggleLeft size={10} />}
                                        <span>{isEnabled ? 'ON' : 'OFF'}</span>
                                    </span>
                                </div>
                                <div className="flex items-center gap-1 text-[11px] font-bold truncate">
                                    <Icon size={12} className={isEnabled ? 'text-red-400' : 'text-slate-500'} />
                                    <span className={isEnabled ? 'text-slate-200' : 'text-slate-500'}>{item.label}</span>
                                </div>
                                <div className="text-[9px] text-slate-500 truncate mt-0.5">{item.desc}</div>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Seletor de Tipo de Saída (Layout do Prompt) */}
            <div className="space-y-1.5 bg-slate-950/70 p-3 rounded-xl border border-slate-800">
                <label className="text-[10px] font-black uppercase text-slate-400 flex items-center gap-1.5">
                    <Maximize2 size={12} className="text-red-400" />
                    <span>Modo de Apresentação / Layout de Saída</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-1.5">
                    {[
                        { id: 'full_model_sheet', label: 'Ficha Completa (Grid)', desc: 'Turnaround + Rosto + 8 Expressões + Poses' },
                        { id: 'turnaround_4_views', label: 'Turnaround 4 Vistas', desc: 'Frontal, 3/4, Perfil e Costas alinhados' },
                        { id: 'expression_grid', label: 'Grade 8 Emoções', desc: 'Tabela 2x4 com expressões faciais' },
                        { 
                            id: 'pose_grid', 
                            label: `Ensaio de Poses (${posePhotoCount} ${posePhotoCount === 1 ? 'Foto' : 'Fotos'})`, 
                            desc: posePhotoCount === 1 
                                ? '1 foto individual com a pose escolhida' 
                                : posePhotoCount === 2 
                                ? 'Díptico: 2 fotos lado a lado' 
                                : posePhotoCount === 3 
                                ? 'Tríptico: 3 fotos sequenciais' 
                                : 'Grade 2x2 com 4 fotos sequenciais' 
                        },
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

            {/* Menu de Abas de Seções com Indicador e Toggle ON/OFF */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-slate-800/80 custom-scrollbar">
                {[
                    { id: 'profile', number: '1', label: '1. Perfil', icon: User },
                    { id: 'turnaround', number: '2', label: '2. 4 Vistas', icon: Compass },
                    { id: 'face', number: '3', label: '3. Rosto', icon: Eye },
                    { id: 'expressions', number: '4', label: '4. Expressões (8)', icon: Heart },
                    { 
                        id: 'poses', 
                        number: '5', 
                        label: `5. Poses (${posePhotoCount} ${posePhotoCount === 1 ? 'Foto' : 'Fotos'})`, 
                        icon: Zap, 
                        isPoseTab: true
                    },
                    { id: 'costume', number: '6', label: '6. Figurino & Roupas', icon: Shirt, badge: 'Fotos & IA' },
                    { id: 'palette', number: '7', label: '7. Cores Hex', icon: Palette },
                    { 
                        id: 'lighting', 
                        number: '8', 
                        label: '8. Cenário & Luz', 
                        icon: Sun,
                        badge: data.photographyFraming === 'waist_up' ? 'Meio da barriga' : data.photographyFraming === 'chest_up' ? 'Peito pra cima' : 'Foto completa'
                    },
                ].map(sec => {
                    const Icon = sec.icon;
                    const isActive = activeSection === sec.id;
                    const isEnabled = sectionToggles[sec.id as StudioSection];
                    return (
                        <div
                            key={sec.id}
                            className={`flex items-center rounded-xl p-0.5 border transition-all shrink-0 ${
                                isActive
                                    ? 'bg-red-600/30 border-red-500 shadow-md ring-1 ring-red-400/50'
                                    : isEnabled
                                    ? 'bg-slate-900/90 border-slate-800 hover:border-slate-700'
                                    : 'bg-slate-950/60 border-slate-800/60 opacity-60 hover:opacity-90'
                            }`}
                        >
                            <button
                                type="button"
                                onClick={() => setActiveSection(sec.id as StudioSection)}
                                className={`px-2.5 py-1.5 text-xs font-bold whitespace-nowrap flex items-center gap-1.5 transition-all cursor-pointer ${
                                    isActive
                                        ? 'text-white'
                                        : isEnabled
                                        ? 'text-slate-300 hover:text-white'
                                        : 'text-slate-500 hover:text-slate-300'
                                }`}
                            >
                                <Icon size={13} className={isActive ? 'text-white' : isEnabled ? 'text-amber-400' : 'text-slate-500'} />
                                <span>{sec.label}</span>
                                {sec.isPoseTab ? (
                                    /* Contador Interativo Diretamente na Aba de Poses (Mín 1 e Máx 4) */
                                    <div className="flex items-center gap-0.5 ml-1 bg-slate-950/80 p-0.5 rounded-lg border border-slate-700/80" onClick={(e) => e.stopPropagation()}>
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleSetPhotoCount(posePhotoCount - 1);
                                            }}
                                            disabled={posePhotoCount <= 1}
                                            className="w-4 h-4 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-20 text-slate-200 text-[9px] font-black flex items-center justify-center transition-colors border border-slate-700 cursor-pointer"
                                            title="Diminuir fotos a gerar (Mínimo: 1)"
                                        >
                                            -
                                        </button>
                                        <span className="px-1 text-[9px] font-mono font-black text-amber-300" title="Quantidade de fotos a gerar">
                                            {posePhotoCount}
                                        </span>
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleSetPhotoCount(posePhotoCount + 1);
                                            }}
                                            disabled={posePhotoCount >= 4}
                                            className="w-4 h-4 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-20 text-slate-200 text-[9px] font-black flex items-center justify-center transition-colors border border-slate-700 cursor-pointer"
                                            title="Aumentar fotos a gerar (Máximo: 4)"
                                        >
                                            +
                                        </button>
                                    </div>
                                ) : sec.badge ? (
                                    <span className={`px-1.5 py-0.2 text-[8px] font-black rounded-full uppercase border ${
                                        isActive 
                                            ? 'bg-amber-400 text-slate-950 border-amber-300' 
                                            : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                                    }`}>
                                        {sec.badge}
                                    </span>
                                ) : null}
                            </button>

                            {/* Mini Toggle ON/OFF individual por Aba */}
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    toggleSection(sec.id as StudioSection);
                                }}
                                className={`px-1.5 py-0.5 mr-1 rounded-md text-[9px] font-mono font-black uppercase flex items-center gap-0.5 border transition-all cursor-pointer ${
                                    isEnabled
                                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/40'
                                        : 'bg-red-500/10 text-red-400 border-red-500/30 hover:bg-red-500/30'
                                }`}
                                title={`Clique para ${isEnabled ? 'DESLIGAR (OFF)' : 'LIGAR (ON)'} esta seção no prompt`}
                            >
                                {isEnabled ? <ToggleRight size={10} /> : <ToggleLeft size={10} />}
                                <span>{isEnabled ? 'ON' : 'OFF'}</span>
                            </button>
                        </div>
                    );
                })}
            </div>

            {/* Conteúdo da Seção Ativa */}
            <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800/80 space-y-4">
                {/* Banner de Status ON/OFF da Seção Ativa */}
                <div className={`p-2.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-2 transition-all ${
                    sectionToggles[activeSection]
                        ? 'bg-slate-900/80 border-emerald-500/30 text-slate-200'
                        : 'bg-red-950/30 border-red-500/40 text-red-200'
                }`}>
                    <div className="flex items-center gap-2">
                        <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                            sectionToggles[activeSection] 
                                ? 'bg-emerald-400 shadow-sm shadow-emerald-400/50' 
                                : 'bg-red-500'
                        }`} />
                        <span className="text-xs">
                            {sectionToggles[activeSection] ? (
                                <span>Esta seção está <strong className="text-emerald-400 font-black">LIGADA (ON)</strong> e será incluída no Prompt Mestre.</span>
                            ) : (
                                <span>⚠️ Esta seção está <strong className="text-red-400 font-black">DESLIGADA (OFF)</strong>. Os dados abaixo não serão incluídos no prompt compilado.</span>
                            )}
                        </span>
                    </div>

                    <button
                        type="button"
                        onClick={() => toggleSection(activeSection)}
                        className={`px-3 py-1 rounded-lg text-xs font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                            sectionToggles[activeSection]
                                ? 'bg-red-600/20 hover:bg-red-600/40 text-red-300 border border-red-500/40'
                                : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
                        }`}
                    >
                        {sectionToggles[activeSection] ? <ToggleLeft size={14} /> : <ToggleRight size={14} />}
                        <span>{sectionToggles[activeSection] ? 'Desligar Seção (OFF)' : 'Ligar Seção no Prompt (ON)'}</span>
                    </button>
                </div>
                
                {/* 1. PERFIL DO PERSONAGEM */}
                {activeSection === 'profile' && (
                    <div className="space-y-4 animate-in fade-in">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800 pb-2.5 gap-2">
                            <span className="text-xs font-black uppercase text-red-400 tracking-wider">
                                1. Character Profile (Perfil do Personagem)
                            </span>
                            <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="text-[10px] text-slate-400 font-bold uppercase">Categoria / Idade:</span>
                                <div className="inline-flex p-0.5 bg-slate-900 border border-slate-700 rounded-lg flex-wrap gap-0.5">
                                    <button
                                        type="button"
                                        onClick={() => handleSwitchGender('woman')}
                                        className={`px-2 py-1 rounded text-[10px] font-black flex items-center gap-1 transition-all ${
                                            data.gender === 'woman'
                                                ? 'bg-pink-600 text-white shadow'
                                                : 'text-slate-400 hover:text-white'
                                        }`}
                                    >
                                        <span>👩 Mulher</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleSwitchGender('man')}
                                        className={`px-2 py-1 rounded text-[10px] font-black flex items-center gap-1 transition-all ${
                                            data.gender === 'man'
                                                ? 'bg-blue-600 text-white shadow'
                                                : 'text-slate-400 hover:text-white'
                                        }`}
                                    >
                                        <span>👨 Homem</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleSwitchGender('boy')}
                                        className={`px-2 py-1 rounded text-[10px] font-black flex items-center gap-1 transition-all ${
                                            data.gender === 'boy'
                                                ? 'bg-amber-600 text-white shadow'
                                                : 'text-amber-400 hover:text-white'
                                        }`}
                                    >
                                        <span>👦 Criança (Menino)</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleSwitchGender('girl')}
                                        className={`px-2 py-1 rounded text-[10px] font-black flex items-center gap-1 transition-all ${
                                            data.gender === 'girl'
                                                ? 'bg-rose-600 text-white shadow'
                                                : 'text-rose-400 hover:text-white'
                                        }`}
                                    >
                                        <span>👧 Criança (Menina)</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleSwitchGender('teen_boy')}
                                        className={`px-2 py-1 rounded text-[10px] font-black flex items-center gap-1 transition-all ${
                                            data.gender === 'teen_boy'
                                                ? 'bg-cyan-600 text-white shadow'
                                                : 'text-cyan-400 hover:text-white'
                                        }`}
                                    >
                                        <span>🛹 Teen (Garoto)</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleSwitchGender('teen_girl')}
                                        className={`px-2 py-1 rounded text-[10px] font-black flex items-center gap-1 transition-all ${
                                            data.gender === 'teen_girl'
                                                ? 'bg-purple-600 text-white shadow'
                                                : 'text-purple-400 hover:text-white'
                                        }`}
                                    >
                                        <span>🌸 Teen (Garota)</span>
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
                                    placeholder={data.gender === 'boy' ? "Ex: Lucas (Criança)" : data.gender === 'girl' ? "Ex: Maya (Criança)" : data.gender === 'teen_boy' ? "Ex: Theo (Adolescente)" : data.gender === 'teen_girl' ? "Ex: Clara (Adolescente)" : data.gender === 'man' ? "Ex: Lucas / Alex / Gabriel" : "Ex: Soaima AI / Sofia / Clara"}
                                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white outline-none focus:border-red-500"
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-400 uppercase">Papel / Função</label>
                                <input 
                                    type="text"
                                    value={data.role}
                                    onChange={e => updateField('role', e.target.value)}
                                    placeholder={data.gender === 'boy' || data.gender === 'girl' ? "Ex: Protagonista Kids / Aventureiro Infantil" : data.gender === 'teen_boy' || data.gender === 'teen_girl' ? "Ex: Teen Protagonista / Jovem Creator" : data.gender === 'man' ? "Ex: Protagonista / Modelo Masculino" : "Ex: Creator / Modelo Feminina"}
                                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white outline-none focus:border-red-500"
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-400 uppercase">Idade Estimada</label>
                                <input 
                                    type="text"
                                    value={data.age}
                                    onChange={e => updateField('age', e.target.value)}
                                    placeholder={data.gender === 'boy' ? "8 anos (8 years old)" : data.gender === 'girl' ? "7 anos (7 years old)" : data.gender === 'teen_boy' ? "15 anos (15 years old)" : data.gender === 'teen_girl' ? "16 anos (16 years old)" : "22-26 / Mid 20s"}
                                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white outline-none focus:border-red-500"
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-400 uppercase">Altura / Biótipo</label>
                                <input 
                                    type="text"
                                    value={data.height}
                                    onChange={e => updateField('height', e.target.value)}
                                    placeholder={data.gender === 'boy' ? "4'2\" (128 cm)" : data.gender === 'girl' ? "3'11\" (120 cm)" : data.gender === 'teen_boy' ? "5'8\" (173 cm)" : data.gender === 'teen_girl' ? "5'5\" (165 cm)" : data.gender === 'man' ? "6'0\" (183 cm) - Athletic" : "5'8\" (173 cm) - Slim"}
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
                                    placeholder={data.gender === 'boy' || data.gender === 'girl' ? "Ex: Curioso, alegre, expressivo, imaginativo e carismático" : data.gender === 'teen_boy' || data.gender === 'teen_girl' ? "Ex: Descolado, criativo, conectado, espontâneo e autêntico" : data.gender === 'man' ? "Ex: Confiante, carismático, determinado, moderno" : "Ex: Criativa, confiante, empática, profissional, elegante"}
                                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white outline-none focus:border-red-500"
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-400 uppercase">
                                    Biótipo Corporal ({data.gender === 'boy' || data.gender === 'girl' ? 'Infantil' : data.gender === 'teen_boy' || data.gender === 'teen_girl' ? 'Adolescente' : data.gender === 'man' ? 'Masculino' : 'Feminino'})
                                </label>
                                <select 
                                    value={data.bodyType}
                                    onChange={e => updateField('bodyType', e.target.value)}
                                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white outline-none focus:border-red-500 h-8"
                                >
                                    {data.gender === 'boy' || data.gender === 'girl' ? (
                                        <>
                                            <option value="Infantil Natural / Criança Saudável">Infantil Natural / Criança Saudável (Proporções 7-8 anos)</option>
                                            <option value="Infantil Delicada / Slim Child">Infantil Delicada / Slim Child</option>
                                            <option value="Infantil Ativo / Ágil">Infantil Ativo / Ágil e Enérgico</option>
                                            <option value="Infantil Robusto / Forte">Infantil Robusto / Forte</option>
                                        </>
                                    ) : data.gender === 'teen_boy' || data.gender === 'teen_girl' ? (
                                        <>
                                            <option value="Adolescente Longilíneo / Slim Teen">Adolescente Longilíneo / Slim Teen (15-16 anos)</option>
                                            <option value="Teen Atlético Juvenil">Teen Atlético Juvenil (Esportivo)</option>
                                            <option value="Jovem Delicada / Slim Teen Feminina">Jovem Delicada / Slim Teen Feminina</option>
                                            <option value="Teen Médio Natural">Teen Médio Natural</option>
                                        </>
                                    ) : data.gender === 'man' ? (
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

                {/* 5. TABELA DE POSES & CONTADOR DE FOTOS (1 MÍN E 4 MÁX) */}
                {activeSection === 'poses' && (
                    <div className="space-y-4 animate-in fade-in">
                        {/* Header da Seção 5 com Status do Modo */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800 pb-2.5 gap-2">
                            <div>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-black uppercase text-red-400 tracking-wider flex items-center gap-1.5">
                                        <Zap size={14} className="text-amber-400" />
                                        <span>5. Pose & Body Language (Linguagem Corporal & Ensaio)</span>
                                    </span>
                                    <span className="px-2 py-0.5 text-[9px] font-black rounded-full bg-red-500/20 text-red-300 border border-red-500/30 font-mono">
                                        {posePhotoCount} {posePhotoCount === 1 ? 'Foto' : 'Fotos'} (Mín: 1 | Máx: 4)
                                    </span>
                                </div>
                                <p className="text-[11px] text-slate-400 mt-0.5">
                                    Defina quantas fotos serão geradas e escolha as posturas corporais. O prompt master gerado reflete com precisão o modo e a pose escolhida!
                                </p>
                            </div>

                            {/* Botão de Atalho para Ativar o Modo Pose no Layout de Saída */}
                            <button
                                type="button"
                                onClick={() => updateField('outputType', 'pose_grid')}
                                className={`px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer shrink-0 border ${
                                    data.outputType === 'pose_grid'
                                        ? 'bg-gradient-to-r from-red-600 to-amber-600 text-white border-red-500 shadow-md shadow-red-500/25 ring-1 ring-red-400'
                                        : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-700 hover:text-white'
                                }`}
                                title="Configurar o Prompt Master para focar exclusivamente no ensaio das poses selecionadas"
                            >
                                <Sparkles size={13} className={data.outputType === 'pose_grid' ? 'text-amber-300' : 'text-slate-400'} />
                                <span>{data.outputType === 'pose_grid' ? '✓ Modo Pose Ativo no Prompt' : 'Ativar Modo Pose no Prompt'}</span>
                            </button>
                        </div>

                        {/* CONTADOR DE QUANTAS FOTOS SERÃO GERADAS: 1 MÍN E 4 MÁX */}
                        <div className="bg-slate-950/90 border border-slate-800 rounded-2xl p-3.5 space-y-3 shadow-lg">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                <div className="space-y-0.5">
                                    <div className="flex items-center gap-2">
                                        <Camera size={15} className="text-amber-400" />
                                        <span className="text-xs font-black uppercase text-slate-200">
                                            Contador de Fotos a Gerar:
                                        </span>
                                        <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-mono text-[11px] font-black">
                                            {posePhotoCount} {posePhotoCount === 1 ? 'Foto' : 'Fotos'} (Mín 1 · Máx 4)
                                        </span>
                                    </div>
                                    <p className="text-[10px] text-slate-400">
                                        Escolha quantas fotos/variações de pose o motor de IA irá renderizar:
                                    </p>
                                </div>

                                {/* Stepper e Botões 1 a 4 */}
                                <div className="flex items-center gap-1.5 shrink-0">
                                    <button
                                        type="button"
                                        onClick={() => handleSetPhotoCount(posePhotoCount - 1)}
                                        disabled={posePhotoCount <= 1}
                                        className="w-8 h-8 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed border border-slate-700 text-slate-200 font-black text-sm flex items-center justify-center transition-all cursor-pointer"
                                        title="Diminuir quantidade de fotos (Mínimo: 1)"
                                    >
                                        -
                                    </button>

                                    <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-700/80">
                                        {[1, 2, 3, 4].map(num => {
                                            const isCurrent = posePhotoCount === num;
                                            return (
                                                <button
                                                    key={num}
                                                    type="button"
                                                    onClick={() => handleSetPhotoCount(num)}
                                                    className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
                                                        isCurrent
                                                            ? 'bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 text-white shadow-md shadow-red-500/30 ring-1 ring-red-400'
                                                            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/80'
                                                    }`}
                                                    title={`Gerar exatamente ${num} ${num === 1 ? 'foto' : 'fotos'}`}
                                                >
                                                    {num} {num === 1 ? 'Foto' : 'Fotos'}
                                                </button>
                                            );
                                        })}
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => handleSetPhotoCount(posePhotoCount + 1)}
                                        disabled={posePhotoCount >= 4}
                                        className="w-8 h-8 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed border border-slate-700 text-slate-200 font-black text-sm flex items-center justify-center transition-all cursor-pointer"
                                        title="Aumentar quantidade de fotos (Máximo: 4)"
                                    >
                                        +
                                    </button>
                                </div>
                            </div>

                            {/* Cards Informativos do Modo Escolhido pelo Contador */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 pt-1 border-t border-slate-800/80 text-[10px]">
                                {[
                                    { count: 1, title: '1 Foto (Master Individual)', desc: 'Render vertical de corpo inteiro com foco exclusivo na pose escolhida' },
                                    { count: 2, title: '2 Fotos (Díptico Lado a Lado)', desc: '2 fotos sequenciais ou 2 poses complementares na mesma folha' },
                                    { count: 3, title: '3 Fotos (Tríptico Dinâmico)', desc: '3 poses sequenciais em progressão de movimento elegante' },
                                    { count: 4, title: '4 Fotos (Grade 2x2 Master)', desc: '4 poses completas em grade simétrica com perfeita continuidade' },
                                ].map(card => {
                                    const isCurrent = posePhotoCount === card.count;
                                    return (
                                        <div
                                            key={card.count}
                                            onClick={() => handleSetPhotoCount(card.count)}
                                            className={`p-2 rounded-xl border transition-all cursor-pointer ${
                                                isCurrent
                                                    ? 'bg-red-950/40 border-red-500/60 text-red-200 shadow-sm'
                                                    : 'bg-slate-900/40 border-slate-800/80 text-slate-400 hover:border-slate-700 hover:text-slate-300'
                                            }`}
                                        >
                                            <div className="flex items-center justify-between font-black mb-0.5">
                                                <span className={isCurrent ? 'text-amber-300' : 'text-slate-300'}>{card.title}</span>
                                                {isCurrent && <Check size={11} className="text-amber-400" />}
                                            </div>
                                            <p className="text-[9px] text-slate-500 leading-tight">{card.desc}</p>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Grade Interativa das 6 Poses */}
                        <div className="space-y-1.5">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-1">
                                <label className="text-[10px] font-black uppercase text-slate-400 flex items-center gap-1.5">
                                    <span>Poses Disponíveis no Estúdio:</span>
                                    <span className="text-slate-500 font-normal">
                                        {posePhotoCount === 1 
                                            ? '(Clique na pose que deseja gerar na foto)' 
                                            : `(Selecione até ${posePhotoCount} poses para compor as ${posePhotoCount} fotos)`}
                                    </span>
                                </label>
                                <span className="text-[10px] font-mono text-amber-400">
                                    Pose Principal: {POSE_DEFINITIONS[data.activePose]?.label || data.activePose}
                                </span>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                                {POSES_LIST.map(pose => {
                                    const isCurrentActive = data.activePose === pose.id;
                                    const resolvedPoses = getResolvedPoses(data).poses;
                                    const selectedIndex = resolvedPoses.findIndex(p => p.id === pose.id);
                                    const isIncludedInBatch = selectedIndex >= 0;

                                    // Adaptação de gênero na etiqueta
                                    let displayLabel = pose.label;
                                    if (data.gender === 'man' || data.gender === 'teen_boy' || data.gender === 'boy') {
                                        displayLabel = displayLabel.replace('Sentada', 'Sentado').replace('Relaxada', 'Relaxado').replace('Tensa', 'Tenso').replace('Pronta', 'Pronto');
                                    }

                                    return (
                                        <button
                                            key={pose.id}
                                            type="button"
                                            onClick={() => handleSelectPose(pose.id)}
                                            className={`p-3 rounded-xl border text-left transition-all relative flex flex-col justify-between cursor-pointer group ${
                                                isCurrentActive
                                                    ? 'bg-gradient-to-br from-red-950/60 via-slate-900 to-amber-950/40 border-red-500 text-white shadow-md shadow-red-500/20 ring-1 ring-red-400'
                                                    : isIncludedInBatch
                                                    ? 'bg-slate-900 border-amber-500/50 text-slate-200'
                                                    : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-900'
                                            }`}
                                        >
                                            <div className="flex items-start justify-between gap-1 mb-1">
                                                <span className="text-xs font-bold text-white group-hover:text-red-300 transition-colors">
                                                    {displayLabel}
                                                </span>
                                                {isIncludedInBatch && (
                                                    <span className={`px-1.5 py-0.2 rounded text-[9px] font-mono font-black border ${
                                                        isCurrentActive 
                                                            ? 'bg-red-500 text-white border-red-400' 
                                                            : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                                                    }`}>
                                                        #{selectedIndex + 1}
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-[10px] text-slate-400 leading-snug">{pose.desc}</p>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Detalhes / Nuances Adicionais da Pose */}
                        <div className="space-y-1 bg-slate-950/70 p-3 rounded-xl border border-slate-800">
                            <label className="text-[10px] font-bold text-slate-400 uppercase flex items-center justify-between">
                                <span>Nuances & Ajustes Específicos da Pose</span>
                                <span className="text-[9px] text-slate-500 font-mono">Aplicado ao Prompt Master</span>
                            </label>
                            <input 
                                type="text"
                                value={data.poseDetails || ''}
                                onChange={e => updateField('poseDetails', e.target.value)}
                                placeholder="Ex: Mãos no bolso com leve inclinação, olhar seguro direcionado para a câmera"
                                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white outline-none focus:border-red-500"
                            />
                        </div>

                        {/* Botões de Ação Imediata da Aba de Poses */}
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 pt-2">
                            <button
                                type="button"
                                onClick={() => {
                                    updateField('outputType', 'pose_grid');
                                    handleSetPhotoCount(posePhotoCount);
                                }}
                                className="px-3.5 py-2 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-1.5 cursor-pointer bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700 hover:text-white"
                                title="Aplicar as poses configuradas ao layout do prompt"
                            >
                                <Check size={14} className="text-emerald-400" />
                                <span>Aplicar Pose ({posePhotoCount} {posePhotoCount === 1 ? 'Foto' : 'Fotos'}) ao Modo de Saída</span>
                            </button>

                            {onCreateVisual && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        updateField('outputType', 'pose_grid');
                                        const promptToGenerate = compileModelSheetPrompt(
                                            { ...data, outputType: 'pose_grid', posePhotoCount },
                                            targetPlatform,
                                            sectionToggles
                                        );
                                        onApplyPrompt(promptToGenerate);
                                        onCreateVisual(promptToGenerate);
                                    }}
                                    disabled={isGeneratingVisual}
                                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-red-600 via-pink-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-black text-xs shadow-md shadow-red-500/25 flex items-center justify-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
                                    title="Gerar as fotos da pose agora com o Motor Neural"
                                >
                                    <Zap size={14} className="text-amber-300" />
                                    <span>{isGeneratingVisual ? "Gerando Fotos..." : `Gerar ${posePhotoCount} ${posePhotoCount === 1 ? 'Foto' : 'Fotos'} de Pose Agora (Grátis)`}</span>
                                </button>
                            )}
                        </div>
                    </div>
                )}

                {/* 6. FIGURINO & REFERÊNCIAS DE VESTUÁRIO (UPLOAD DE FOTOS) */}
                {activeSection === 'costume' && (
                    <div className="space-y-5 animate-in fade-in">
                        {/* Cabeçalho da Seção */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800 pb-2.5 gap-2">
                            <div>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-black uppercase text-red-400 tracking-wider flex items-center gap-1.5">
                                        <Shirt size={14} className="text-amber-400" />
                                        <span>6. Vestuário, Figurino & Upload de Imagens de Referência</span>
                                    </span>
                                    <span className="px-1.5 py-0.5 text-[9px] font-black rounded-full bg-red-500/20 text-red-300 border border-red-500/30">
                                        NOVO MODO
                                    </span>
                                </div>
                                <p className="text-[11px] text-slate-400 mt-0.5">
                                    Envie fotos de vestidos, jaquetas, conjuntos ou roupas de referência para trocar o figurino do modelo com IA ou alterar manualmente cada peça.
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={() => wardrobeInputRef.current?.click()}
                                className="px-3 py-1.5 bg-gradient-to-r from-amber-500 to-red-600 hover:from-amber-400 hover:to-red-500 text-white rounded-xl text-xs font-black flex items-center gap-1.5 shadow-md shadow-amber-500/20 transition-all cursor-pointer shrink-0"
                            >
                                <Upload size={13} />
                                <span>+ Enviar Foto de Roupa</span>
                            </button>
                        </div>

                        {/* Mensagem de Feedback de Extração de Vestuário */}
                        {extractWardrobeMsg && (
                            <div className={`p-3 rounded-xl border text-xs flex items-center gap-2.5 animate-in fade-in ${
                                extractWardrobeMsg.type === 'success' 
                                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200' 
                                    : 'bg-red-500/10 border-red-500/30 text-red-200'
                            }`}>
                                {extractWardrobeMsg.type === 'success' ? (
                                    <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                                ) : (
                                    <AlertCircle size={16} className="text-red-400 shrink-0" />
                                )}
                                <span className="leading-snug">{extractWardrobeMsg.text}</span>
                            </div>
                        )}

                        {/* Input de arquivo invisível para a Seção 6 */}
                        <input 
                            type="file" 
                            ref={wardrobeInputRef}
                            onChange={handleWardrobeFileUpload}
                            multiple
                            accept="image/*,.jpg,.jpeg,.png,.webp,.gif,.bmp,.tiff,.tif,.jfif,.jiff,.heic,.heif,.svg,.avif,.dng,.raw"
                            className="hidden"
                        />

                        {/* Dropzone e Área de Upload de Roupas */}
                        <div 
                            onDragOver={handleWardrobeDragOver}
                            onDragLeave={handleWardrobeDragLeave}
                            onDrop={handleWardrobeDrop}
                            className={`border-2 border-dashed rounded-2xl p-4 sm:p-5 transition-all space-y-3 ${
                                isDragOverWardrobe
                                    ? 'bg-amber-950/50 border-amber-400 ring-2 ring-amber-400/50 shadow-lg'
                                    : 'bg-slate-950/80 border-slate-700/80 hover:border-amber-500/60'
                            }`}
                        >
                            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                                <div 
                                    onClick={() => wardrobeInputRef.current?.click()}
                                    className="flex items-center gap-3 cursor-pointer group"
                                >
                                    <div className="w-11 h-11 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0 group-hover:scale-105 transition-transform">
                                        <Shirt size={22} />
                                    </div>
                                    <div>
                                        <h4 className="text-xs font-bold text-white flex items-center gap-1.5 group-hover:text-amber-300 transition-colors">
                                            <span>Carregar Fotos de Roupas / Peças de Referência</span>
                                            <span className="text-[10px] text-amber-400 font-normal">(Multi-Upload & Arraste)</span>
                                        </h4>
                                        <p className="text-[11px] text-slate-400">
                                            Clique ou arraste imagens de vestidos, jaquetas, camisas ou estampas (JPG, PNG, WEBP, JFIF, etc.).
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 flex-wrap">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase">Papel da Foto:</span>
                                    <select
                                        value={selectedRole}
                                        onChange={e => setSelectedRole(e.target.value as any)}
                                        className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-slate-200 outline-none focus:border-amber-500"
                                    >
                                        <option value="full_outfit">👗 Look Completo / Traje</option>
                                        <option value="top_piece">👕 Parte Superior (Top / Jaqueta / Camisa)</option>
                                        <option value="bottom_piece">👖 Parte Inferior (Calça / Saia)</option>
                                        <option value="shoes_accessories">👟 Calçado & Acessórios</option>
                                        <option value="pattern_texture">🧵 Estampa / Textura de Tecido</option>
                                    </select>
                                    <button
                                        type="button"
                                        onClick={() => wardrobeInputRef.current?.click()}
                                        className="px-3 py-1.5 bg-gradient-to-r from-amber-600 to-red-600 hover:from-amber-500 hover:to-red-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-md shadow-amber-500/20 active:scale-95"
                                    >
                                        <Upload size={13} />
                                        <span>Procurar Imagens</span>
                                    </button>
                                </div>
                            </div>

                            {/* Seletor Rápido de Fotos Já Carregadas no App para Figurino */}
                            {availableImages && availableImages.length > 0 && (
                                <div className="pt-2 border-t border-slate-800/80">
                                    <div className="flex items-center justify-between mb-1.5">
                                        <span className="text-[10px] font-bold uppercase text-slate-400 flex items-center gap-1">
                                            <ImageIcon size={12} className="text-amber-400" />
                                            <span>Ou escolha uma foto já enviada no app ({availableImages.length}):</span>
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar">
                                        {availableImages.map(img => (
                                            <button
                                                key={img.id}
                                                type="button"
                                                onClick={() => handleAddAvailableImageAsWardrobe(img)}
                                                className="px-2 py-1 rounded-lg bg-slate-900 border border-slate-700 hover:border-amber-500/80 flex items-center gap-1.5 shrink-0 transition-all cursor-pointer text-left group"
                                                title={`Adicionar "${img.name}" como foto de roupa`}
                                            >
                                                <img 
                                                    src={img.previewUrl || `data:${img.mimeType};base64,${img.base64Data}`}
                                                    alt={img.name}
                                                    className="w-6 h-6 rounded object-cover bg-black"
                                                />
                                                <span className="text-[10px] text-slate-300 group-hover:text-amber-300 font-medium truncate max-w-[100px]">
                                                    {img.name}
                                                </span>
                                                <span className="text-[9px] text-amber-400 font-black">+ Usar</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Galeria de Fotos de Vestuário Já Carregadas */}
                            {wardrobeImages.length > 0 && (
                                <div className="pt-2 border-t border-slate-800/80 space-y-2.5">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[11px] font-bold uppercase text-slate-300 flex items-center gap-1.5">
                                            <ImageIcon size={13} className="text-amber-400" />
                                            <span>Fotos de Referência de Vestuário ({wardrobeImages.length}):</span>
                                        </span>
                                        <span className="text-[10px] text-slate-500">
                                            Clique em "Extrair com IA" para preencher automaticamente os campos da ficha
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                        {wardrobeImages.map((img, idx) => (
                                            <div 
                                                key={img.id}
                                                className="bg-slate-900/90 border border-slate-700/80 rounded-xl p-2.5 flex flex-col gap-2 relative group hover:border-amber-500/50 transition-all shadow-md"
                                            >
                                                <div className="flex items-start gap-2.5">
                                                    <div className="w-16 h-20 rounded-lg overflow-hidden border border-slate-700 bg-black shrink-0 relative">
                                                        <img 
                                                            src={`data:${img.mimeType};base64,${img.base64}`}
                                                            alt={img.fileName}
                                                            className="w-full h-full object-cover"
                                                        />
                                                        <span className="absolute bottom-0.5 right-0.5 px-1 py-0.2 bg-black/80 text-[8px] text-slate-300 font-mono rounded">
                                                            #{idx + 1}
                                                        </span>
                                                    </div>

                                                    <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                                                        <div>
                                                            <div className="flex items-center justify-between gap-1">
                                                                <span className="text-[10px] font-black text-slate-200 truncate" title={img.fileName}>
                                                                    {img.fileName}
                                                                </span>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleRemoveWardrobeImage(img.id)}
                                                                    className="text-slate-500 hover:text-red-400 p-1 transition-colors"
                                                                    title="Remover foto"
                                                                >
                                                                    <Trash2 size={13} />
                                                                </button>
                                                            </div>

                                                            <select
                                                                value={img.role}
                                                                onChange={e => handleUpdateWardrobeRole(img.id, e.target.value as any)}
                                                                className="mt-1 w-full bg-slate-950 border border-slate-800 rounded px-1.5 py-0.5 text-[10px] text-amber-300 font-bold outline-none"
                                                            >
                                                                <option value="full_outfit">Look Completo</option>
                                                                <option value="top_piece">Parte Superior</option>
                                                                <option value="bottom_piece">Parte Inferior</option>
                                                                <option value="shoes_accessories">Calçado / Acessório</option>
                                                                <option value="pattern_texture">Textura / Estampa</option>
                                                            </select>
                                                        </div>

                                                        <button
                                                            type="button"
                                                            disabled={isExtractingWardrobe}
                                                            onClick={() => handleExtractWardrobeItem(img)}
                                                            className="mt-2 w-full py-1 px-2 rounded-lg bg-gradient-to-r from-amber-600 to-red-600 hover:from-amber-500 hover:to-red-500 text-white font-bold text-[10px] flex items-center justify-center gap-1 shadow transition-all active:scale-95 disabled:opacity-40"
                                                        >
                                                            {isExtractingWardrobe ? (
                                                                <RefreshCw size={11} className="animate-spin" />
                                                            ) : (
                                                                <Wand2 size={11} className="text-amber-200" />
                                                            )}
                                                            <span>{isExtractingWardrobe ? "Analisando..." : "Extrair com IA"}</span>
                                                        </button>
                                                    </div>
                                                </div>

                                                {img.analysisSummary && (
                                                    <div className="bg-slate-950/80 p-1.5 rounded-lg border border-slate-800/80 text-[10px] text-slate-300 leading-snug line-clamp-2">
                                                        <span className="text-amber-400 font-bold">Identificado:</span> {img.analysisSummary}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Presets de Looks de Alta Costura e Estilos Prontos (1 Clique) */}
                        <div className="space-y-1.5 bg-slate-950/70 p-3 rounded-xl border border-slate-800">
                            <div className="flex items-center justify-between">
                                <label className="text-[10px] font-black uppercase text-amber-400 flex items-center gap-1.5">
                                    <Sparkles size={12} />
                                    <span>Presets de Figurino Rápidos (1 Clique para Aplicar Estilo Completo)</span>
                                </label>
                                <span className="text-[9px] text-slate-500">Clique para carregar corte, caimento e tecidos</span>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                                {WARDROBE_PRESETS.map(preset => {
                                    const isSelected = activeWardrobePreset === preset.id;
                                    return (
                                        <button
                                            key={preset.id}
                                            type="button"
                                            onClick={() => handleApplyWardrobePreset(preset)}
                                            className={`p-2 rounded-xl text-left border transition-all ${
                                                isSelected 
                                                    ? 'bg-amber-600/20 border-amber-500 text-white shadow-sm ring-1 ring-amber-400/50' 
                                                    : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700 hover:text-white'
                                            }`}
                                        >
                                            <div className="text-[11px] font-bold truncate flex items-center justify-between">
                                                <span>{preset.name}</span>
                                                {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />}
                                            </div>
                                            <div className="text-[9px] text-slate-500 truncate mt-0.5">{preset.category}</div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Modo de Substituição de Figurino */}
                        <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                            <span className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5">
                                <Scissors size={13} className="text-red-400" />
                                <span>Modo de Aplicação do Vestuário:</span>
                            </span>

                            <div className="flex items-center gap-1.5 flex-wrap">
                                {[
                                    { id: 'replace_entire_outfit', label: 'Substituir Figurino Inteiro' },
                                    { id: 'keep_character_change_clothing', label: 'Preservar Rosto & Mudar Roupa' },
                                    { id: 'mix_pieces', label: 'Mesclar Peças de Referência' },
                                ].map(mode => (
                                    <button
                                        key={mode.id}
                                        type="button"
                                        onClick={() => updateField('wardrobeChangeMode', mode.id as any)}
                                        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-all ${
                                            (data.wardrobeChangeMode || 'replace_entire_outfit') === mode.id
                                                ? 'bg-red-600 text-white border-red-500 shadow-sm'
                                                : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
                                        }`}
                                    >
                                        {mode.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Campos de Customização e Alteração do Figurino */}
                        <div className="space-y-3 bg-slate-950/40 p-3 rounded-xl border border-slate-800/80">
                            <div className="flex items-center justify-between border-b border-slate-800/80 pb-1.5">
                                <span className="text-[11px] font-black uppercase text-slate-300">
                                    Especificações do Figurino (Edite e Altere Livremente)
                                </span>
                                <span className="text-[10px] text-slate-500">Campos sincronizados com o prompt mestre</span>
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-400 uppercase">Descrição Completa do Traje / Look</label>
                                <input 
                                    type="text"
                                    value={data.outfitType}
                                    onChange={e => updateField('outfitType', e.target.value)}
                                    placeholder="Ex: Vestido vermelho assimétrico com drapeado / Terno slim azul marinho italiano"
                                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white outline-none focus:border-red-500"
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase">Gola / Decote / Lapela</label>
                                    <input 
                                        type="text"
                                        value={data.topNeckline}
                                        onChange={e => updateField('topNeckline', e.target.value)}
                                        placeholder="Ex: Decote ombro único com babados / Lapela notch clássica"
                                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white outline-none focus:border-red-500"
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase">Mangas / Alças / Punhos</label>
                                    <input 
                                        type="text"
                                        value={data.sleevesOrStraps}
                                        onChange={e => updateField('sleevesOrStraps', e.target.value)}
                                        placeholder="Ex: Alça fina à esquerda e babado à direita / Manga longa estruturada"
                                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white outline-none focus:border-red-500"
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase">Parte Inferior / Calça / Saia</label>
                                    <input 
                                        type="text"
                                        value={data.bottomPiece}
                                        onChange={e => updateField('bottomPiece', e.target.value)}
                                        placeholder="Ex: Saia midi com fenda lateral / Calça slim alfaiataria com vinco"
                                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white outline-none focus:border-red-500"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase">Calçado (Footwear)</label>
                                    <input 
                                        type="text"
                                        value={data.footwear}
                                        onChange={e => updateField('footwear', e.target.value)}
                                        placeholder="Ex: Sandália de salto agulha vermelha / Tênis branco minimalista / Botas de couro"
                                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white outline-none focus:border-red-500"
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase">Acessórios, Joias & Detalhes</label>
                                    <input 
                                        type="text"
                                        value={data.accessories}
                                        onChange={e => updateField('accessories', e.target.value)}
                                        placeholder="Ex: Brincos pequenos dourados, anel solitário, relógio minimalista"
                                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white outline-none focus:border-red-500"
                                    />
                                </div>
                            </div>

                            {/* Texturas e Tecidos Clicáveis */}
                            <div className="space-y-2 pt-1">
                                <label className="text-[10px] font-bold text-slate-400 uppercase flex items-center justify-between">
                                    <span className="flex items-center gap-1.5">
                                        <Tag size={12} className="text-amber-400" />
                                        <span>Amostras de Tecido & Texturas Selecionadas</span>
                                    </span>
                                    <span className="text-[9px] text-slate-500 font-normal">Clique para alternar</span>
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

                            {/* Notas adicionais de figurino */}
                            <div className="space-y-1 pt-1">
                                <label className="text-[10px] font-bold text-slate-400 uppercase">
                                    Instruções Especiais de Figurino para o Gerador
                                </label>
                                <input 
                                    type="text"
                                    value={data.wardrobeReferenceNotes || ''}
                                    onChange={e => updateField('wardrobeReferenceNotes', e.target.value)}
                                    placeholder="Ex: Manter exatamente as dobras da foto de referência, botões dourados e costura pespontada visível"
                                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white outline-none focus:border-red-500"
                                />
                            </div>
                        </div>

                        {/* Barra de Ações Rápidas no Rodapé da Seção de Figurino */}
                        <div className="flex items-center justify-between pt-2 border-t border-slate-800 gap-2 flex-wrap">
                            <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                                <Sparkle size={13} className="text-amber-400" />
                                <span>O prompt é compilado instantaneamente com todas as referências de vestuário.</span>
                            </div>

                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={handleCopy}
                                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-bold rounded-lg flex items-center gap-1.5 transition-all cursor-pointer"
                                >
                                    {copied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                                    <span>{copied ? "Copiado!" : "Copiar Prompt"}</span>
                                </button>

                                <button
                                    type="button"
                                    onClick={handleApply}
                                    className="px-3 py-1.5 bg-red-600/30 hover:bg-red-600/50 border border-red-500/50 text-red-200 text-xs font-bold rounded-lg flex items-center gap-1.5 transition-all cursor-pointer"
                                >
                                    {appliedSuccess ? <Check size={13} className="text-emerald-400" /> : <Wand2 size={13} />}
                                    <span>{appliedSuccess ? "Aplicado!" : "Aplicar ao Arquiteto"}</span>
                                </button>

                                {onCreateVisual && (
                                    <button
                                        type="button"
                                        onClick={handleGenerateVisual}
                                        disabled={isGeneratingVisual}
                                        className="px-3.5 py-1.5 bg-gradient-to-r from-amber-500 via-orange-600 to-red-600 hover:from-amber-400 hover:to-red-500 text-white text-xs font-black rounded-lg flex items-center gap-1.5 shadow-lg shadow-orange-500/25 transition-all cursor-pointer active:scale-95 disabled:opacity-40"
                                    >
                                        {isGeneratingVisual ? (
                                            <RefreshCw size={13} className="animate-spin text-white" />
                                        ) : (
                                            <Sparkles size={13} className="text-amber-200" />
                                        )}
                                        <span>{isGeneratingVisual ? "Gerando..." : "Gerar Visual 4K com este Figurino"}</span>
                                    </button>
                                )}
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

                {/* 8. ESTÚDIO, ILUMINAÇÃO & DIRETIVAS (CENÁRIO) */}
                {activeSection === 'lighting' && (
                    <div className="space-y-4 animate-in fade-in">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800 pb-2.5 gap-2">
                            <div>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-black uppercase text-red-400 tracking-wider flex items-center gap-1.5">
                                        <Sun size={14} className="text-amber-400" />
                                        <span>8. Lighting, Setting & Directives (Iluminação & Cenário)</span>
                                    </span>
                                    <span className="px-2 py-0.5 text-[9px] font-black rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-mono">
                                        {PHOTOGRAPHY_FRAMING_OPTIONS[data.photographyFraming as 'waist_up' | 'full_body' | 'chest_up' || 'full_body']?.labelShort || 'Foto completa'}
                                    </span>
                                </div>
                                <p className="text-[11px] text-slate-400 mt-0.5">
                                    Defina o enquadramento do modo fotografia no cenário, atmosfera de luz e ambiente de fundo.
                                </p>
                            </div>

                            <span className="text-[10px] text-slate-400 font-mono self-start sm:self-auto bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800">
                                Enquadramento: <strong className="text-amber-400">{PHOTOGRAPHY_FRAMING_OPTIONS[data.photographyFraming as 'waist_up' | 'full_body' | 'chest_up' || 'full_body']?.label || 'Foto completa'}</strong>
                            </span>
                        </div>

                        {/* MODO FOTOGRAFIA NO CENÁRIO (1-CLIQUE): Foto até meio da barriga, Foto completa ou Foto peito pra cima */}
                        <div className="bg-slate-950/90 border border-slate-800 rounded-2xl p-3.5 space-y-3 shadow-lg">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-2">
                                <div className="space-y-0.5">
                                    <div className="flex items-center gap-2">
                                        <Camera size={15} className="text-amber-400" />
                                        <span className="text-xs font-black uppercase text-slate-200">
                                            Modo Fotografia & Enquadramento da Câmera no Cenário
                                        </span>
                                    </div>
                                    <p className="text-[10px] text-slate-400">
                                        Selecione como a câmera irá enquadrar o personagem inserido no cenário de fundo:
                                    </p>
                                </div>

                                <div className="flex items-center gap-1.5 self-start sm:self-auto">
                                    <span className="text-[9px] font-bold uppercase text-slate-500">Modo Ativo:</span>
                                    <span className="px-2 py-0.5 rounded-full bg-red-500/20 text-red-300 border border-red-500/30 text-[10px] font-black">
                                        {data.photographyFraming === 'waist_up' ? 'Meio da barriga' : data.photographyFraming === 'chest_up' ? 'Peito pra cima' : 'Foto completa'}
                                    </span>
                                </div>
                            </div>

                            {/* 3 Opções do Modo Fotografia */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                                {[
                                    {
                                        id: 'waist_up',
                                        title: 'Foto até meio da barriga',
                                        badge: 'Plano Médio (Waist-Up)',
                                        desc: 'Enquadramento da cintura / meio da barriga para cima, destacando tronco, braços, postura e expressão facial com o cenário de fundo perfeitamente ambientado.',
                                        icon: User,
                                        aspectRatio: 'Retrato 4:5 / 2:3',
                                        highlight: 'Foco no tronco e olhar'
                                    },
                                    {
                                        id: 'full_body',
                                        title: 'Foto completa',
                                        badge: 'Corpo Inteiro (Full-Body)',
                                        desc: 'Enquadramento total da cabeça aos pés, mostrando calçados, silhueta anatômica, caimento do figurino e o chão/superfície do cenário.',
                                        icon: Maximize2,
                                        aspectRatio: 'Corpo Todo 2:3 / 16:9',
                                        highlight: 'Visão total cabeça aos pés'
                                    },
                                    {
                                        id: 'chest_up',
                                        title: 'Foto peito pra cima',
                                        badge: 'Plano Busto (Chest-Up Portrait)',
                                        desc: 'Enquadramento do peito para cima, realçando decote, ombros, pescoço e biometria facial detalhada com profundidade de campo cinematográfica.',
                                        icon: Camera,
                                        aspectRatio: 'Close-Up 4:5 / 1:1',
                                        highlight: 'Foco na face e ombros'
                                    }
                                ].map(opt => {
                                    const isSelected = (data.photographyFraming || 'full_body') === opt.id;
                                    const Icon = opt.icon;
                                    return (
                                        <button
                                            key={opt.id}
                                            type="button"
                                            onClick={() => updateField('photographyFraming', opt.id as any)}
                                            className={`p-3 rounded-xl border text-left transition-all relative flex flex-col justify-between cursor-pointer group ${
                                                isSelected
                                                    ? 'bg-gradient-to-br from-red-950/70 via-slate-900 to-amber-950/50 border-red-500 text-white shadow-md shadow-red-500/25 ring-1 ring-red-400'
                                                    : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700 hover:text-white'
                                            }`}
                                        >
                                            <div>
                                                <div className="flex items-center justify-between gap-1 mb-1.5">
                                                    <span className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wider border ${
                                                        isSelected 
                                                            ? 'bg-red-500/20 text-red-300 border-red-500/40' 
                                                            : 'bg-slate-800 text-slate-400 border-slate-700'
                                                    }`}>
                                                        {opt.badge}
                                                    </span>
                                                    <div className="flex items-center gap-1">
                                                        <span className="text-[8px] font-mono text-slate-500">{opt.aspectRatio}</span>
                                                        {isSelected && (
                                                            <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400/50 animate-pulse" />
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-2 mt-1">
                                                    <div className={`p-1.5 rounded-lg border ${
                                                        isSelected ? 'bg-red-500/20 border-red-500/40 text-amber-300' : 'bg-slate-800 border-slate-700 text-slate-400'
                                                    }`}>
                                                        <Icon size={14} />
                                                    </div>
                                                    <span className={`text-xs font-black leading-tight ${isSelected ? 'text-white' : 'text-slate-200'}`}>
                                                        {opt.title}
                                                    </span>
                                                </div>

                                                <p className="text-[10px] text-slate-400 leading-snug mt-2">
                                                    {opt.desc}
                                                </p>
                                            </div>

                                            <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[9px]">
                                                <span className={`font-bold flex items-center gap-1 ${isSelected ? 'text-amber-400' : 'text-slate-500'}`}>
                                                    {isSelected ? '✓ Modo Selecionado' : 'Clique para Escolher'}
                                                </span>
                                                <span className={`text-[8px] font-mono px-1.5 py-0.5 rounded border ${
                                                    isSelected 
                                                        ? 'text-emerald-400 bg-emerald-950/60 border-emerald-500/40 font-black' 
                                                        : 'text-slate-500 bg-slate-900 border-slate-800'
                                                }`}>
                                                    {opt.highlight}
                                                </span>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Campos de Iluminação e Cenário com Presets Rápidos */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-slate-400 uppercase flex items-center justify-between">
                                    <span>Esquema de Iluminação</span>
                                    <span className="text-[9px] text-slate-500">Luz suave, quente ou estúdio</span>
                                </label>
                                <input 
                                    type="text"
                                    value={data.lighting}
                                    onChange={e => updateField('lighting', e.target.value)}
                                    placeholder="Ex: Luz natural suave de estúdio com preenchimento quente"
                                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-2 text-xs text-white outline-none focus:border-red-500"
                                />
                                <div className="flex flex-wrap gap-1 pt-1">
                                    {[
                                        'Luz suave de estúdio',
                                        'Golden Hour quente',
                                        'Luz difusa de janela',
                                        'Rim Light de contorno',
                                        'High-Key comercial'
                                    ].map(lPreset => (
                                        <button
                                            key={lPreset}
                                            type="button"
                                            onClick={() => updateField('lighting', lPreset)}
                                            className="px-2 py-0.5 text-[9px] rounded bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
                                        >
                                            + {lPreset}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-slate-400 uppercase flex items-center justify-between">
                                    <span>Fundo / Cenário (Setting)</span>
                                    <span className="text-[9px] text-slate-500">Ambiente de fundo</span>
                                </label>
                                <input 
                                    type="text"
                                    value={data.backgroundSetting}
                                    onChange={e => updateField('backgroundSetting', e.target.value)}
                                    placeholder="Ex: Parede bege minimalista com textura suave"
                                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-2 text-xs text-white outline-none focus:border-red-500"
                                />
                                <div className="flex flex-wrap gap-1 pt-1">
                                    {[
                                        'Parede bege minimalista',
                                        'Fundo branco estúdio',
                                        'Loft urbano moderno',
                                        'Cinza ardósia editorial',
                                        'Piso de madeira clara'
                                    ].map(sPreset => (
                                        <button
                                            key={sPreset}
                                            type="button"
                                            onClick={() => updateField('backgroundSetting', sPreset)}
                                            className="px-2 py-0.5 text-[9px] rounded bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
                                        >
                                            + {sPreset}
                                        </button>
                                    ))}
                                </div>
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
