
import React, { useState, useEffect } from 'react';
import { DropZone } from './components/DropZone';
import { ControlPanel } from './components/ControlPanel';
import { PromptDisplay } from './components/PromptDisplay';
import { AnalysisResultView } from './components/AnalysisResultView';
import { ImagePreview } from './components/ImagePreview';
import { ApiSettingsModal } from './components/ApiSettingsModal';
import { GeneratedImageDisplay } from './components/GeneratedImageDisplay';
import { HistoryPanel } from './components/HistoryPanel';
import { UploadedImage, PromptSettings, STYLE_TEMPLATES, DETAIL_LEVEL_MAP, HistoryItem, TargetPlatform, BackgroundDecomposition, ElementDecomposition, PersonDecomposition, SearchGroundingData } from './types';
import { analyzeImage } from './utils/analysis';
import { generateGeminiPrompt, extractBackgroundDecomposition, extractElementDecomposition, extractPersonDecomposition, generateGroundedGeminiPrompt, enrichPromptWithSearchGrounding } from './services/geminiService';
import { generateOpenAIPrompt } from './services/openaiService';
import { generateDeepseekPrompt } from './services/deepseekService';
import { generateImage } from './services/imageGenService';
import { classifyImageMobileNet } from './services/tfService';
import { analyzeWithWhisk } from './services/whiskService';
import { analyzeWithGoogleVision } from './services/googleVisionService';
import { generateClaudePrompt } from './services/claudeVisionService';
import { generateMidjourneyDescribePrompt } from './services/midjourneyVisionService';
import { generateFluxPrompt } from './services/fluxVisionService';
import { generateIdeogramPrompt } from './services/ideogramVisionService';
import { generateHuggingFacePrompt } from './services/huggingFaceService';
import { generateConsensusPrompt } from './services/multiVisionConsensusService';
import { analyzeWithBehanceDesigner, analyzeWithArtStationMaster, analyzeWithProductDesigner } from './services/designerVisionService';
import { analyzeWithCinemaDirector, analyzeWithVogueEditorial, analyzeWithNatGeoMaster, analyzeWithAwwwardsDigital } from './services/eliteVisionService';
import { 
    analyzeWithOctaneRender, 
    analyzeWithUnrealEngine, 
    analyzeWithLeonardoPhoenix, 
    analyzeWithStableDiffusion3,
    analyzeWithRedshiftRender,
    analyzeWithVRayRender,
    analyzeWithCoronaRender,
    analyzeWithBlenderCycles,
    analyzeWithRecraftV3,
    analyzeWithMagnificNeural
} from './services/renderSpecialistsService';
import { BackgroundElementsView } from './components/BackgroundElementsView';
import { ElementExtractionView } from './components/ElementExtractionView';
import { PersonExtractionView } from './components/PersonExtractionView';
import { VisualEffectsTab } from './components/VisualEffectsTab';
import { ModelSheetStudio } from './components/ModelSheetStudio';
import { ProductSheetStudio } from './components/ProductSheetStudio';
import { loadHistory, saveHistory, deleteHistoryItem, clearHistory, compressBase64Image, loadActiveImages, saveActiveImages } from './utils/historyStorage';
import { Zap, History, Sparkles, Sliders, Settings, Plus, Trash2, Image as ImageIcon, AlertCircle, X, ExternalLink, Layers, Package } from 'lucide-react';

const COMPOSITION_KEYWORDS: Record<string, string> = {
    macro: "macro photography, extreme close-up, high detail texture",
    wide_angle: "wide angle lens, expansive view, panoramic perspective",
    close_up: "close-up shot, portrait framing, shallow depth of field",
    aerial: "aerial photography, bird's eye view, drone shot, high altitude",
    eye_level: "eye-level perspective, straight-on shot, natural view",
};

const CAMERA_ANGLE_PROMPTS: Record<string, string> = {
    '45_deg': 'viewed from a professional 45-degree side perspective angle',
    'zenith': 'viewed from a technical top-down zenith perspective',
    'eye_level': 'viewed from a natural eye-level camera height for clean product showcase',
    'macro_angle': 'extreme macro lens focus showing structural detail',
    'transparency': 'visualization from a translucent layering angle',
    'flat_lay': 'professional flat lay camera orientation',
    'dutch': 'cinematic dutch tilt camera perspective',
    'low_angle': 'heroic low-angle looking up perspective',
    'action': 'captured from a dynamic motion-tracking camera angle',
};

const PRODUCT_POSITION_PROMPTS: Record<string, string> = {
    'none': '',
    'center': 'positioned in the absolute center of the frame',
    'left': 'positioned on the left side of the frame',
    'right': 'positioned on the right side of the frame',
    'thirds_left': 'positioned according to the rule of thirds on the left vertical line',
    'thirds_right': 'positioned according to the rule of thirds on the right vertical line',
    'foreground': 'positioned prominently in the foreground with shallow depth of field',
    'background': 'positioned in the background as a supporting element',
    'bottom': 'positioned at the bottom of the frame',
    'top': 'positioned at the top of the frame',
};

const PLATFORM_BEST_PARAMS: Record<string, string> = {
    'midjourney': '--v 6.1 --stylize 500 --chaos 5',
    'dalle': 'cinematic photo, photorealistic lighting, wide view',
    'flux': 'hyper-realistic texture, sharp focus, 8k resolution, intricate details',
    'leonardo': 'leonardo photoreal style, cinematic contrast, 8k',
    'adobe_firefly': 'professional studio lighting, clean aesthetic, commercial photo',
    'stable_diffusion': '(masterpiece:1.4), (best quality:1.4), (ultra-detailed:1.2), highres',
    'google_imagefx': 'photorealistic masterpiece, highly detailed textures',
    'freepik': 'premium stock photography, commercial quality, high end',
};

const SOCIAL_FORMAT_KEYWORDS: Record<string, string> = {
    '1:1': "Instagram post format, square composition",
    '9:16': "optimized for Instagram Stories and TikTok, vertical mobile framing",
    '16:9': "widescreen cinematic format, YouTube thumbnail style",
    '4:5': "Instagram portrait format, professional social media framing",
    '3:2': "classic 35mm photography aspect ratio",
};

const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            const result = reader.result as string;
            resolve(result.split(',')[1]);
        };
        reader.onerror = (error) => reject(error);
        reader.readAsDataURL(file);
    });
};

const App: React.FC = () => {
    const [images, setImages] = useState<UploadedImage[]>([]);
    const [selectedImageId, setSelectedImageId] = useState<string | null>(null);
    const [prompt, setPrompt] = useState<string>('');
    const [isGeneratingGemini, setIsGeneratingGemini] = useState(false);
    const [isGeneratingDeepseek, setIsGeneratingDeepseek] = useState(false);
    const [isGeneratingOpenAI, setIsGeneratingOpenAI] = useState(false);
    const [isGeneratingGoogleVision, setIsGeneratingGoogleVision] = useState(false);
    const [isGeneratingWhisk, setIsGeneratingWhisk] = useState(false);
    const [isGeneratingImageFX, setIsGeneratingImageFX] = useState(false);
    const [isGeneratingTF, setIsGeneratingTF] = useState(false);
    const [isGeneratingVisual, setIsGeneratingVisual] = useState(false);
    const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
    const [backgroundData, setBackgroundData] = useState<BackgroundDecomposition | null>(null);
    const [elementData, setElementData] = useState<ElementDecomposition | null>(null);
    const [personData, setPersonData] = useState<PersonDecomposition | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isHistoryOpen, setIsHistoryOpen] = useState(false);
    const [history, setHistory] = useState<HistoryItem[]>([]);
    
    const [openAIKey, setOpenAIKey] = useState<string>(localStorage.getItem('openai_api_key') || '');
    const [deepseekKey, setDeepseekKey] = useState<string>(localStorage.getItem('deepseek_api_key') || '');
    const [anthropicKey, setAnthropicKey] = useState<string>(localStorage.getItem('anthropic_api_key') || '');
    const [hfToken, setHfToken] = useState<string>(localStorage.getItem('hf_token') || '');
    const [defaultStyle, setDefaultStyle] = useState<string>(() => {
        try {
            return localStorage.getItem('default_prompt_style') || 'photorealistic';
        } catch {
            return 'photorealistic';
        }
    });

    const [isGeneratingClaude, setIsGeneratingClaude] = useState(false);
    const [isGeneratingMidjourney, setIsGeneratingMidjourney] = useState(false);
    const [isGeneratingFlux, setIsGeneratingFlux] = useState(false);
    const [isGeneratingIdeogram, setIsGeneratingIdeogram] = useState(false);
    const [isGeneratingHuggingFace, setIsGeneratingHuggingFace] = useState(false);
    const [isGeneratingConsensus, setIsGeneratingConsensus] = useState(false);
    const [isGeneratingBehance, setIsGeneratingBehance] = useState(false);
    const [isGeneratingArtStation, setIsGeneratingArtStation] = useState(false);
    const [isGeneratingProductDesign, setIsGeneratingProductDesign] = useState(false);
    const [isGeneratingAwwwards, setIsGeneratingAwwwards] = useState(false);
    const [isGeneratingCinema, setIsGeneratingCinema] = useState(false);
    const [isGeneratingVogue, setIsGeneratingVogue] = useState(false);
    const [isGeneratingNatGeo, setIsGeneratingNatGeo] = useState(false);
    const [isGeneratingOctane, setIsGeneratingOctane] = useState(false);
    const [isGeneratingUnreal, setIsGeneratingUnreal] = useState(false);
    const [isGeneratingLeonardo, setIsGeneratingLeonardo] = useState(false);
    const [isGeneratingSD, setIsGeneratingSD] = useState(false);
    const [isGeneratingRedshift, setIsGeneratingRedshift] = useState(false);
    const [isGeneratingVRay, setIsGeneratingVRay] = useState(false);
    const [isGeneratingCorona, setIsGeneratingCorona] = useState(false);
    const [isGeneratingCycles, setIsGeneratingCycles] = useState(false);
    const [isGeneratingRecraft, setIsGeneratingRecraft] = useState(false);
    const [isGeneratingMagnific, setIsGeneratingMagnific] = useState(false);
    const [activeControlTab, setActiveControlTab] = useState<'architect' | 'effects' | 'modelsheet' | 'productsheet'>('architect');
    const [searchGroundingData, setSearchGroundingData] = useState<SearchGroundingData | null>(null);
    const [isGeneratingSearchGrounding, setIsGeneratingSearchGrounding] = useState(false);
    
    const [settings, setSettings] = useState<PromptSettings>(() => {
        const initialStyle = (typeof window !== 'undefined' ? localStorage.getItem('default_prompt_style') : null) || 'photorealistic';
        return {
            basePrompt: '',
            negativePrompt: '',
            style: initialStyle,
            detailLevel: 5,
            lighting: 'none',
            composition: 'auto',
            cameraAngle: 'none',
            productPosition: 'none',
            aspectRatio: '1:1',
            removeBackground: false,
            targetPlatform: 'midjourney',
            extraParams: '',
            mode: 'general',
            activeTemplateId: '',
            shadowOpacity: 100,
            material: 'none',
            environment: 'studio',
            keepColors: false,
            is3dLogo: initialStyle === '3d_render'
        };
    });

    const [isImagesLoadedFromStorage, setIsImagesLoadedFromStorage] = useState(false);
    const extraFileInputRef = React.useRef<HTMLInputElement>(null);

    // Carrega imagens de referência ativas persistidas no IndexedDB ao iniciar a aplicação
    useEffect(() => {
        loadActiveImages().then(res => {
            if (res.images && res.images.length > 0) {
                setImages(res.images);
                setSelectedImageId(res.selectedId || res.images[0].id);
            }
        }).catch(err => {
            console.warn("Falha ao carregar imagens ativas do banco:", err);
        }).finally(() => {
            setIsImagesLoadedFromStorage(true);
        });
    }, []);

    // Persiste imagens de referência ativas no IndexedDB para nunca sumirem ao recarregar
    useEffect(() => {
        if (isImagesLoadedFromStorage) {
            saveActiveImages(images, selectedImageId).catch(err => {
                console.warn("Falha ao salvar imagens de referência ativas:", err);
            });
        }
    }, [images, selectedImageId, isImagesLoadedFromStorage]);

    useEffect(() => {
        // Load history safely from IndexedDB and automatically migrate/free legacy localStorage
        loadHistory().then(saved => {
            if (saved && saved.length > 0) {
                setHistory(saved);
            }
        }).catch(err => {
            console.warn("Failed to load history from storage", err);
        });
    }, []);

    useEffect(() => {
        // Persist history safely without hitting localStorage quotas
        saveHistory(history).catch(err => {
            console.warn("Failed to save history", err);
        });
    }, [history]);

    const addToHistory = async (item: Omit<HistoryItem, 'id' | 'timestamp'>) => {
        let compressedBase64 = item.baseImage.base64Data;
        let mime = item.baseImage.mimeType;

        try {
            const compressed = await compressBase64Image(item.baseImage.base64Data, item.baseImage.mimeType, 1024, 0.82);
            compressedBase64 = compressed.base64Data;
            mime = compressed.mimeType;
        } catch {
            // Keep original if compression fails
        }

        const newItem: HistoryItem = {
            ...item,
            baseImage: {
                ...item.baseImage,
                base64Data: compressedBase64,
                mimeType: mime
            },
            id: Date.now().toString(),
            timestamp: Date.now()
        };
        setHistory(prev => [newItem, ...prev].slice(0, 50));
    };

    const handleRevisitHistory = async (id: string) => {
        const item = history.find(h => h.id === id);
        if (!item) return;

        try {
            const byteCharacters = atob(item.baseImage.base64Data);
            const byteArrays = [];
            for (let offset = 0; offset < byteCharacters.length; offset += 512) {
                const slice = byteCharacters.slice(offset, offset + 512);
                const byteNumbers = new Array(slice.length);
                for (let i = 0; i < slice.length; i++) {
                    byteNumbers[i] = slice.charCodeAt(i);
                }
                const byteArray = new Uint8Array(byteNumbers);
                byteArrays.push(byteArray);
            }
            const blob = new Blob(byteArrays, { type: item.baseImage.mimeType });
            const file = new File([blob], item.baseImage.name, { type: item.baseImage.mimeType });
            const previewUrl = URL.createObjectURL(file);
            
            const newImage: UploadedImage = {
                id: `history-${item.id}`, file, previewUrl, name: file.name, analysis: null,
                base64Data: item.baseImage.base64Data, mimeType: item.baseImage.mimeType,
            };
            setImages([newImage]);
            setSelectedImageId(newImage.id);

            try {
                const analysis = await analyzeImage(file);
                setImages(prev => prev.map(img => img.id === newImage.id ? { ...img, analysis } : img));
            } catch (err) {
                console.error("Failed to re-analyze", err);
            }
        } catch (err) {
            console.error("Failed to restore history image", err);
        }

        setBackgroundData(null);
        setElementData(null);
        setPersonData(null);
        setSettings(item.settings);
        setPrompt(item.prompt);
        setGeneratedImageUrl(item.generatedImageUrl);
        setIsHistoryOpen(false);
    };

    const handleDeleteHistory = (id: string) => {
        setHistory(prev => prev.filter(item => item.id !== id));
        deleteHistoryItem(id).catch(() => {});
    };

    const handleClearHistory = () => {
        setHistory([]);
        clearHistory().catch(() => {});
    };

    const saveApiKeys = (
        newOpenAIKey: string, 
        newDeepseekKey: string, 
        newAnthropicKey = '', 
        newHfToken = '',
        newDefaultStyle = 'photorealistic'
    ) => {
        setOpenAIKey(newOpenAIKey);
        setDeepseekKey(newDeepseekKey);
        setAnthropicKey(newAnthropicKey);
        setHfToken(newHfToken);
        setDefaultStyle(newDefaultStyle);
        localStorage.setItem('openai_api_key', newOpenAIKey);
        localStorage.setItem('deepseek_api_key', newDeepseekKey);
        localStorage.setItem('anthropic_api_key', newAnthropicKey);
        localStorage.setItem('hf_token', newHfToken);
        localStorage.setItem('default_prompt_style', newDefaultStyle);
        
        // Atualiza imediatamente o estilo atual nas configurações
        setSettings(prev => ({
            ...prev,
            style: newDefaultStyle,
            is3dLogo: newDefaultStyle === '3d_render',
        }));
        setError(null);
    };

    const activeImage = images.find(img => img.id === selectedImageId) || null;

    const handleFilesSelected = async (files: File[]) => {
        setError(null);
        if (!files || files.length === 0) return;

        try {
            const processedImages: UploadedImage[] = [];

            for (let i = 0; i < files.length; i++) {
                const originalFile = files[i];
                const previewUrl = URL.createObjectURL(originalFile);
                const base64Data = await fileToBase64(originalFile);
                const mimeType = originalFile.type || 'image/png';
                const tempId = `img-${Date.now()}-${i}-${Math.random().toString(36).substring(2, 7)}`;

                const newImage: UploadedImage = { 
                    id: tempId, 
                    file: originalFile, 
                    previewUrl, 
                    name: originalFile.name, 
                    analysis: null,
                    base64Data,
                    mimeType
                };
                processedImages.push(newImage);
            }

            if (processedImages.length === 0) return;

            // Mantém imagens anteriores e adiciona as novas no topo da lista sem perder nada
            setImages(prev => [...processedImages, ...prev]);
            setSelectedImageId(processedImages[0].id);
            setBackgroundData(null);
            setElementData(null);
            setPersonData(null);

            // Aplica automaticamente o Estilo Padrão configurado globalmente
            const activeDefaultStyle = localStorage.getItem('default_prompt_style') || defaultStyle || 'photorealistic';
            setSettings(prev => ({
                ...prev,
                style: activeDefaultStyle,
                is3dLogo: activeDefaultStyle === '3d_render',
            }));

            // Executa a análise computacional de canvas em segundo plano de forma segura
            for (const imgItem of processedImages) {
                analyzeImage(imgItem.file)
                    .then(analysis => {
                        setImages(prev => prev.map(img => img.id === imgItem.id ? { ...img, analysis } : img));
                    })
                    .catch(err => {
                        console.warn("Análise de canvas secundária (não fatal):", err);
                    });
            }
        } catch (err: any) {
            setError(`Erro ao processar imagem: ${err.message || 'Erro desconhecido'}`);
        }
    };

    const handleRemoveImage = (idToRemove: string) => {
        setImages(prev => {
            const remaining = prev.filter(img => img.id !== idToRemove);
            if (selectedImageId === idToRemove) {
                setSelectedImageId(remaining.length > 0 ? remaining[0].id : null);
            }
            if (remaining.length === 0) {
                setBackgroundData(null);
                setElementData(null);
                setPersonData(null);
                setSearchGroundingData(null);
            }
            return remaining;
        });
    };

    const handleClearAllImages = () => {
        images.forEach(img => {
            try {
                URL.revokeObjectURL(img.previewUrl);
            } catch {}
        });
        setImages([]);
        setSelectedImageId(null);
        setBackgroundData(null);
        setElementData(null);
        setPersonData(null);
        setSearchGroundingData(null);
        const activeDefaultStyle = localStorage.getItem('default_prompt_style') || defaultStyle || 'photorealistic';
        setSettings(s => ({ ...s, style: activeDefaultStyle, is3dLogo: activeDefaultStyle === '3d_render' }));
    };

    const handleCropSave = async (croppedFile: File) => {
        if (!activeImage) return;
        try {
            const previewUrl = URL.createObjectURL(croppedFile);
            const base64Data = await fileToBase64(croppedFile);
            const analysis = await analyzeImage(croppedFile);
            
            const updatedImage: UploadedImage = {
                ...activeImage,
                file: croppedFile,
                previewUrl,
                base64Data,
                analysis
            };

            setImages(prev => prev.map(img => img.id === activeImage.id ? updatedImage : img));
            setBackgroundData(null);
            setElementData(null);
            setPersonData(null);
            setError(null);
            // Re-gera o prompt base com a nova análise se houver
            handleGeneratePrompt();
        } catch (err: any) {
            setError(`Erro ao salvar recorte: ${err.message}`);
        }
    };

    const triggerDecompositionIfNeeded = (file: File, base64: string, mime: string) => {
        if (settings.mode === 'extract_person' && !personData) {
            extractPersonDecomposition(file, settings, { base64, mimeType: mime })
                .then(p => setPersonData(p))
                .catch(() => {});
        } else if (settings.mode === 'extract_element' && !elementData) {
            extractElementDecomposition(file, settings, { base64, mimeType: mime })
                .then(elem => setElementData(elem))
                .catch(() => {});
        } else if (settings.mode === 'extract_background' && !backgroundData) {
            extractBackgroundDecomposition(file, settings, { base64, mimeType: mime })
                .then(bg => setBackgroundData(bg))
                .catch(() => {});
        }
    };

    const handleDeepseekAnalysis = async () => {
        if (!activeImage) return;
        setIsGeneratingDeepseek(true);
        try {
            const result = await generateDeepseekPrompt(activeImage.file, deepseekKey || '', settings, activeImage.base64Data ? { base64: activeImage.base64Data, mimeType: activeImage.mimeType! } : undefined);
            setPrompt(result);
            triggerDecompositionIfNeeded(activeImage.file, activeImage.base64Data!, activeImage.mimeType!);
        } catch (err: any) {
            setError(err.message || "Falha na análise Deepseek.");
        } finally {
            setIsGeneratingDeepseek(false);
        }
    };

    const handleAnalyzeSearchGrounding = async () => {
        if (!activeImage) return;
        setIsGeneratingSearchGrounding(true);
        setError(null);
        try {
            const result = await generateGroundedGeminiPrompt(
                activeImage.file, 
                { ...settings, enableSearchGrounding: true },
                activeImage.base64Data ? { base64: activeImage.base64Data, mimeType: activeImage.mimeType! } : undefined
            );
            setPrompt(result.prompt);
            setSearchGroundingData(result.grounding);
            triggerDecompositionIfNeeded(activeImage.file, activeImage.base64Data!, activeImage.mimeType!);
        } catch (err: any) {
            console.error("Erro na análise com Search Grounding:", err);
            setError(err.message || "Falha na análise com Google Search Grounding.");
        } finally {
            setIsGeneratingSearchGrounding(false);
        }
    };

    const handleEnrichWithSearch = async () => {
        if (!prompt) return;
        setIsGeneratingSearchGrounding(true);
        setError(null);
        try {
            const result = await enrichPromptWithSearchGrounding(prompt, settings.targetPlatform);
            setPrompt(result.prompt);
            setSearchGroundingData(result.grounding);
        } catch (err: any) {
            console.error("Erro ao enriquecer prompt com pesquisa Google:", err);
            setError(err.message || "Falha ao enriquecer prompt com pesquisa Google.");
        } finally {
            setIsGeneratingSearchGrounding(false);
        }
    };

    const handleSetAsActiveImage = async (dataUrl: string, name: string) => {
        try {
            const parts = dataUrl.split(',');
            const mimeMatch = parts[0]?.match(/:(.*?);/);
            const mimeType = mimeMatch ? mimeMatch[1] : 'image/png';
            const base64Data = parts[1] || '';

            const byteCharacters = atob(base64Data);
            const byteArrays = [];
            for (let offset = 0; offset < byteCharacters.length; offset += 512) {
                const slice = byteCharacters.slice(offset, offset + 512);
                const byteNumbers = new Array(slice.length);
                for (let i = 0; i < slice.length; i++) {
                    byteNumbers[i] = slice.charCodeAt(i);
                }
                byteArrays.push(new Uint8Array(byteNumbers));
            }
            const blob = new Blob(byteArrays, { type: mimeType });
            const file = new File([blob], name || 'gemini-edited.png', { type: mimeType });
            const previewUrl = URL.createObjectURL(file);

            const newImage: UploadedImage = {
                id: `gen-${Date.now()}`,
                file,
                previewUrl,
                name: file.name,
                analysis: null,
                base64Data,
                mimeType,
            };

            setImages(prev => [newImage, ...prev]);
            setSelectedImageId(newImage.id);
            setSearchGroundingData(null);
            setBackgroundData(null);
            setElementData(null);
            setPersonData(null);

            const activeDefaultStyle = localStorage.getItem('default_prompt_style') || defaultStyle || 'photorealistic';
            setSettings(prev => ({
                ...prev,
                style: activeDefaultStyle,
                is3dLogo: activeDefaultStyle === '3d_render',
            }));

            try {
                const analysis = await analyzeImage(file);
                setImages(prev => prev.map(img => img.id === newImage.id ? { ...img, analysis } : img));
            } catch (err) {
                console.error("Failed to analyze newly set image", err);
            }
        } catch (err) {
            console.error("Failed to set as active image", err);
            setError("Erro ao carregar a imagem gerada no aplicativo.");
        }
    };

    const handleGeminiAnalysis = async () => {
        if (!activeImage) return;
        if (settings.enableSearchGrounding) {
            await handleAnalyzeSearchGrounding();
            return;
        }
        setIsGeneratingGemini(true); 
        try { 
            if (settings.mode === 'extract_person') {
                const [result, decomposition] = await Promise.all([
                    generateGeminiPrompt(activeImage.file, settings, { base64: activeImage.base64Data!, mimeType: activeImage.mimeType! }),
                    extractPersonDecomposition(activeImage.file, settings, { base64: activeImage.base64Data!, mimeType: activeImage.mimeType! }).catch(() => null)
                ]);
                setPrompt(result);
                if (decomposition) {
                    setPersonData(decomposition);
                }
            } else if (settings.mode === 'extract_element') {
                const [result, decomposition] = await Promise.all([
                    generateGeminiPrompt(activeImage.file, settings, { base64: activeImage.base64Data!, mimeType: activeImage.mimeType! }),
                    extractElementDecomposition(activeImage.file, settings, { base64: activeImage.base64Data!, mimeType: activeImage.mimeType! }).catch(() => null)
                ]);
                setPrompt(result);
                if (decomposition) {
                    setElementData(decomposition);
                }
            } else if (settings.mode === 'extract_background') {
                const [result, decomposition] = await Promise.all([
                    generateGeminiPrompt(activeImage.file, settings, { base64: activeImage.base64Data!, mimeType: activeImage.mimeType! }),
                    extractBackgroundDecomposition(activeImage.file, settings, { base64: activeImage.base64Data!, mimeType: activeImage.mimeType! }).catch(() => null)
                ]);
                setPrompt(result);
                if (decomposition) {
                    setBackgroundData(decomposition);
                }
            } else {
                const result = await generateGeminiPrompt(activeImage.file, settings, { base64: activeImage.base64Data!, mimeType: activeImage.mimeType! });
                setPrompt(result);
            }
        } catch (err: any) {
            setError(err.message || "Falha na análise Gemini.");
        } finally { 
            setIsGeneratingGemini(false); 
        } 
    };

    const handleGoogleVisionAnalysis = async () => {
        if (!activeImage) return;
        setIsGeneratingGoogleVision(true);
        try {
            const result = await analyzeWithGoogleVision(activeImage.file, settings, { base64: activeImage.base64Data!, mimeType: activeImage.mimeType! });
            setPrompt(result);
            triggerDecompositionIfNeeded(activeImage.file, activeImage.base64Data!, activeImage.mimeType!);
        } catch (err: any) {
            setError(err.message || "Falha na análise Google Vision.");
        } finally {
            setIsGeneratingGoogleVision(false);
        }
    };

    const handleWhiskAnalysis = async () => {
        if (!activeImage) return;
        setIsGeneratingWhisk(true);
        try {
            const result = await analyzeWithWhisk(activeImage.file, settings, { base64: activeImage.base64Data!, mimeType: activeImage.mimeType! });
            setPrompt(result);
            triggerDecompositionIfNeeded(activeImage.file, activeImage.base64Data!, activeImage.mimeType!);
        } catch (err: any) {
            setError(err.message || "Falha na análise Whisk AI.");
        } finally {
            setIsGeneratingWhisk(false);
        }
    };

    const handleAnalyzeImageFX = async () => {
        if (!activeImage) return;
        setIsGeneratingImageFX(true);
        try {
            const result = await generateGeminiPrompt(activeImage.file, { ...settings, targetPlatform: 'google_imagefx' }, { base64: activeImage.base64Data!, mimeType: activeImage.mimeType! });
            setPrompt(result);
            triggerDecompositionIfNeeded(activeImage.file, activeImage.base64Data!, activeImage.mimeType!);
        } catch (err: any) {
            setError(err.message || "Falha na análise ImageFX.");
        } finally {
            setIsGeneratingImageFX(false);
        }
    };

    const handleOpenAIAnalysis = async () => {
        if (!activeImage) return;
        setIsGeneratingOpenAI(true); 
        try { 
            const result = await generateOpenAIPrompt(activeImage.file, openAIKey || '', settings, { base64: activeImage.base64Data!, mimeType: activeImage.mimeType! });
            setPrompt(result);
            triggerDecompositionIfNeeded(activeImage.file, activeImage.base64Data!, activeImage.mimeType!);
        } catch (err: any) {
            setError(err.message || "Falha na análise ChatGPT.");
        } finally { 
            setIsGeneratingOpenAI(false); 
        } 
    };

    const handleBehanceAnalysis = async () => {
        if (!activeImage) return;
        setIsGeneratingBehance(true);
        try {
            const result = await analyzeWithBehanceDesigner(activeImage.file, settings, { base64: activeImage.base64Data!, mimeType: activeImage.mimeType! });
            setPrompt(result);
            triggerDecompositionIfNeeded(activeImage.file, activeImage.base64Data!, activeImage.mimeType!);
        } catch (err: any) {
            setError(err.message || "Falha na análise Behance / Dribbble.");
        } finally {
            setIsGeneratingBehance(false);
        }
    };

    const handleArtStationAnalysis = async () => {
        if (!activeImage) return;
        setIsGeneratingArtStation(true);
        try {
            const result = await analyzeWithArtStationMaster(activeImage.file, settings, { base64: activeImage.base64Data!, mimeType: activeImage.mimeType! });
            setPrompt(result);
            triggerDecompositionIfNeeded(activeImage.file, activeImage.base64Data!, activeImage.mimeType!);
        } catch (err: any) {
            setError(err.message || "Falha na análise ArtStation 3D.");
        } finally {
            setIsGeneratingArtStation(false);
        }
    };

    const handleProductDesignAnalysis = async () => {
        if (!activeImage) return;
        setIsGeneratingProductDesign(true);
        try {
            const result = await analyzeWithProductDesigner(activeImage.file, settings, { base64: activeImage.base64Data!, mimeType: activeImage.mimeType! });
            setPrompt(result);
            triggerDecompositionIfNeeded(activeImage.file, activeImage.base64Data!, activeImage.mimeType!);
        } catch (err: any) {
            setError(err.message || "Falha na análise Design de Produto / CMF.");
        } finally {
            setIsGeneratingProductDesign(false);
        }
    };

    const handleAwwwardsAnalysis = async () => {
        if (!activeImage) return;
        setIsGeneratingAwwwards(true);
        try {
            const result = await analyzeWithAwwwardsDigital(activeImage.file, settings, { base64: activeImage.base64Data!, mimeType: activeImage.mimeType! });
            setPrompt(result);
            triggerDecompositionIfNeeded(activeImage.file, activeImage.base64Data!, activeImage.mimeType!);
        } catch (err: any) {
            setError(err.message || "Falha na análise Awwwards UI/UX.");
        } finally {
            setIsGeneratingAwwwards(false);
        }
    };

    const handleCinemaAnalysis = async () => {
        if (!activeImage) return;
        setIsGeneratingCinema(true);
        try {
            const result = await analyzeWithCinemaDirector(activeImage.file, settings, { base64: activeImage.base64Data!, mimeType: activeImage.mimeType! });
            setPrompt(result);
            triggerDecompositionIfNeeded(activeImage.file, activeImage.base64Data!, activeImage.mimeType!);
        } catch (err: any) {
            setError(err.message || "Falha na análise Hollywood Cinema.");
        } finally {
            setIsGeneratingCinema(false);
        }
    };

    const handleVogueAnalysis = async () => {
        if (!activeImage) return;
        setIsGeneratingVogue(true);
        try {
            const result = await analyzeWithVogueEditorial(activeImage.file, settings, { base64: activeImage.base64Data!, mimeType: activeImage.mimeType! });
            setPrompt(result);
            triggerDecompositionIfNeeded(activeImage.file, activeImage.base64Data!, activeImage.mimeType!);
        } catch (err: any) {
            setError(err.message || "Falha na análise Vogue Editorial.");
        } finally {
            setIsGeneratingVogue(false);
        }
    };

    const handleNatGeoAnalysis = async () => {
        if (!activeImage) return;
        setIsGeneratingNatGeo(true);
        try {
            const result = await analyzeWithNatGeoMaster(activeImage.file, settings, { base64: activeImage.base64Data!, mimeType: activeImage.mimeType! });
            setPrompt(result);
            triggerDecompositionIfNeeded(activeImage.file, activeImage.base64Data!, activeImage.mimeType!);
        } catch (err: any) {
            setError(err.message || "Falha na análise NatGeo RAW.");
        } finally {
            setIsGeneratingNatGeo(false);
        }
    };

    const handleOctaneAnalysis = async () => {
        if (!activeImage) return;
        setIsGeneratingOctane(true);
        try {
            const result = await analyzeWithOctaneRender(activeImage.file, settings, { base64: activeImage.base64Data!, mimeType: activeImage.mimeType! });
            setPrompt(result);
            triggerDecompositionIfNeeded(activeImage.file, activeImage.base64Data!, activeImage.mimeType!);
        } catch (err: any) {
            setError(err.message || "Falha na análise Octane Render.");
        } finally {
            setIsGeneratingOctane(false);
        }
    };

    const handleUnrealAnalysis = async () => {
        if (!activeImage) return;
        setIsGeneratingUnreal(true);
        try {
            const result = await analyzeWithUnrealEngine(activeImage.file, settings, { base64: activeImage.base64Data!, mimeType: activeImage.mimeType! });
            setPrompt(result);
            triggerDecompositionIfNeeded(activeImage.file, activeImage.base64Data!, activeImage.mimeType!);
        } catch (err: any) {
            setError(err.message || "Falha na análise Unreal Engine 5.5.");
        } finally {
            setIsGeneratingUnreal(false);
        }
    };

    const handleLeonardoAnalysis = async () => {
        if (!activeImage) return;
        setIsGeneratingLeonardo(true);
        try {
            const result = await analyzeWithLeonardoPhoenix(activeImage.file, settings, { base64: activeImage.base64Data!, mimeType: activeImage.mimeType! });
            setPrompt(result);
            triggerDecompositionIfNeeded(activeImage.file, activeImage.base64Data!, activeImage.mimeType!);
        } catch (err: any) {
            setError(err.message || "Falha na análise Leonardo Phoenix.");
        } finally {
            setIsGeneratingLeonardo(false);
        }
    };

    const handleSDAnalysis = async () => {
        if (!activeImage) return;
        setIsGeneratingSD(true);
        try {
            const result = await analyzeWithStableDiffusion3(activeImage.file, settings, { base64: activeImage.base64Data!, mimeType: activeImage.mimeType! });
            setPrompt(result);
            triggerDecompositionIfNeeded(activeImage.file, activeImage.base64Data!, activeImage.mimeType!);
        } catch (err: any) {
            setError(err.message || "Falha na análise Stable Diffusion 3.5.");
        } finally {
            setIsGeneratingSD(false);
        }
    };

    const handleRedshiftAnalysis = async () => {
        if (!activeImage) return;
        setIsGeneratingRedshift(true);
        try {
            const result = await analyzeWithRedshiftRender(activeImage.file, settings, { base64: activeImage.base64Data!, mimeType: activeImage.mimeType! });
            setPrompt(result);
            triggerDecompositionIfNeeded(activeImage.file, activeImage.base64Data!, activeImage.mimeType!);
        } catch (err: any) {
            setError(err.message || "Falha na análise Redshift 3D.");
        } finally {
            setIsGeneratingRedshift(false);
        }
    };

    const handleVRayAnalysis = async () => {
        if (!activeImage) return;
        setIsGeneratingVRay(true);
        try {
            const result = await analyzeWithVRayRender(activeImage.file, settings, { base64: activeImage.base64Data!, mimeType: activeImage.mimeType! });
            setPrompt(result);
            triggerDecompositionIfNeeded(activeImage.file, activeImage.base64Data!, activeImage.mimeType!);
        } catch (err: any) {
            setError(err.message || "Falha na análise V-Ray 6.");
        } finally {
            setIsGeneratingVRay(false);
        }
    };

    const handleCoronaAnalysis = async () => {
        if (!activeImage) return;
        setIsGeneratingCorona(true);
        try {
            const result = await analyzeWithCoronaRender(activeImage.file, settings, { base64: activeImage.base64Data!, mimeType: activeImage.mimeType! });
            setPrompt(result);
            triggerDecompositionIfNeeded(activeImage.file, activeImage.base64Data!, activeImage.mimeType!);
        } catch (err: any) {
            setError(err.message || "Falha na análise Corona Renderer.");
        } finally {
            setIsGeneratingCorona(false);
        }
    };

    const handleCyclesAnalysis = async () => {
        if (!activeImage) return;
        setIsGeneratingCycles(true);
        try {
            const result = await analyzeWithBlenderCycles(activeImage.file, settings, { base64: activeImage.base64Data!, mimeType: activeImage.mimeType! });
            setPrompt(result);
            triggerDecompositionIfNeeded(activeImage.file, activeImage.base64Data!, activeImage.mimeType!);
        } catch (err: any) {
            setError(err.message || "Falha na análise Blender Cycles.");
        } finally {
            setIsGeneratingCycles(false);
        }
    };

    const handleRecraftAnalysis = async () => {
        if (!activeImage) return;
        setIsGeneratingRecraft(true);
        try {
            const result = await analyzeWithRecraftV3(activeImage.file, settings, { base64: activeImage.base64Data!, mimeType: activeImage.mimeType! });
            setPrompt(result);
            triggerDecompositionIfNeeded(activeImage.file, activeImage.base64Data!, activeImage.mimeType!);
        } catch (err: any) {
            setError(err.message || "Falha na análise Recraft v3.");
        } finally {
            setIsGeneratingRecraft(false);
        }
    };

    const handleMagnificAnalysis = async () => {
        if (!activeImage) return;
        setIsGeneratingMagnific(true);
        try {
            const result = await analyzeWithMagnificNeural(activeImage.file, settings, { base64: activeImage.base64Data!, mimeType: activeImage.mimeType! });
            setPrompt(result);
            triggerDecompositionIfNeeded(activeImage.file, activeImage.base64Data!, activeImage.mimeType!);
        } catch (err: any) {
            setError(err.message || "Falha na análise Magnific AI 16K.");
        } finally {
            setIsGeneratingMagnific(false);
        }
    };

    const handleTFAnalysis = async () => {
        if (!activeImage) return;
        setIsGeneratingTF(true);
        try {
            const result = await classifyImageMobileNet(activeImage.file, settings);
            setPrompt(result);
        } catch (err: any) {
            setError(err.message || "Falha na análise TensorFlow.");
        } finally {
            setIsGeneratingTF(false);
        }
    };

    const handleClaudeAnalysis = async () => {
        if (!activeImage) return;
        setIsGeneratingClaude(true);
        try {
            const result = await generateClaudePrompt(activeImage.file, anthropicKey, settings, { base64: activeImage.base64Data!, mimeType: activeImage.mimeType! });
            setPrompt(result);
            triggerDecompositionIfNeeded(activeImage.file, activeImage.base64Data!, activeImage.mimeType!);
        } catch (err: any) {
            setError(err.message || "Falha na análise Claude 3.7.");
        } finally {
            setIsGeneratingClaude(false);
        }
    };

    const handleMidjourneyAnalysis = async () => {
        if (!activeImage) return;
        setIsGeneratingMidjourney(true);
        try {
            const result = await generateMidjourneyDescribePrompt(activeImage.file, settings, { base64: activeImage.base64Data!, mimeType: activeImage.mimeType! });
            setPrompt(result);
            triggerDecompositionIfNeeded(activeImage.file, activeImage.base64Data!, activeImage.mimeType!);
        } catch (err: any) {
            setError(err.message || "Falha na análise Midjourney.");
        } finally {
            setIsGeneratingMidjourney(false);
        }
    };

    const handleFluxAnalysis = async () => {
        if (!activeImage) return;
        setIsGeneratingFlux(true);
        try {
            const result = await generateFluxPrompt(activeImage.file, settings, { base64: activeImage.base64Data!, mimeType: activeImage.mimeType! });
            setPrompt(result);
            triggerDecompositionIfNeeded(activeImage.file, activeImage.base64Data!, activeImage.mimeType!);
        } catch (err: any) {
            setError(err.message || "Falha na análise Flux.1.");
        } finally {
            setIsGeneratingFlux(false);
        }
    };

    const handleIdeogramAnalysis = async () => {
        if (!activeImage) return;
        setIsGeneratingIdeogram(true);
        try {
            const result = await generateIdeogramPrompt(activeImage.file, settings, { base64: activeImage.base64Data!, mimeType: activeImage.mimeType! });
            setPrompt(result);
            triggerDecompositionIfNeeded(activeImage.file, activeImage.base64Data!, activeImage.mimeType!);
        } catch (err: any) {
            setError(err.message || "Falha na análise Ideogram 2.0.");
        } finally {
            setIsGeneratingIdeogram(false);
        }
    };

    const handleHuggingFaceAnalysis = async () => {
        if (!activeImage) return;
        setIsGeneratingHuggingFace(true);
        try {
            const result = await generateHuggingFacePrompt(activeImage.file, hfToken, settings, { base64: activeImage.base64Data!, mimeType: activeImage.mimeType! });
            setPrompt(result);
            triggerDecompositionIfNeeded(activeImage.file, activeImage.base64Data!, activeImage.mimeType!);
        } catch (err: any) {
            setError(err.message || "Falha na análise Hugging Face.");
        } finally {
            setIsGeneratingHuggingFace(false);
        }
    };

    const handleConsensusAnalysis = async () => {
        if (!activeImage) return;
        setIsGeneratingConsensus(true);
        try {
            const result = await generateConsensusPrompt(activeImage.file, settings, { base64: activeImage.base64Data!, mimeType: activeImage.mimeType! });
            setPrompt(result);
            triggerDecompositionIfNeeded(activeImage.file, activeImage.base64Data!, activeImage.mimeType!);
        } catch (err: any) {
            setError(err.message || "Falha na análise do Consenso Multi-Visão.");
        } finally {
            setIsGeneratingConsensus(false);
        }
    };

    const handleCreateVisual = async (overridePrompt?: string) => {
        const targetPrompt = (typeof overridePrompt === 'string' && overridePrompt.trim()) ? overridePrompt : prompt;
        if (!targetPrompt) return;
        setIsGeneratingVisual(true);
        setError(null);
        try {
            const imageContext = activeImage?.base64Data ? { base64: activeImage.base64Data, mimeType: activeImage.mimeType! } : undefined;
            const url = await generateImage(targetPrompt, true, imageContext, "4K");
            setGeneratedImageUrl(url);
            
            if (activeImage?.base64Data && activeImage.mimeType) {
                addToHistory({
                    prompt: targetPrompt,
                    generatedImageUrl: url,
                    baseImage: {
                        base64Data: activeImage.base64Data,
                        mimeType: activeImage.mimeType,
                        name: activeImage.name,
                    },
                    settings,
                });
            }

        } catch (err: any) {
            let msg = err?.message || "Falha ao gerar imagem com IA.";
            try {
                const jsonStart = msg.indexOf('{');
                if (jsonStart !== -1) {
                    const parsed = JSON.parse(msg.slice(jsonStart));
                    if (parsed.error?.message) {
                        msg = parsed.error.message;
                    }
                }
            } catch {}
            if (msg.includes('429') || msg.includes('RESOURCE_EXHAUSTED') || msg.includes('quota') || msg.includes('Quota exceeded')) {
                msg = "Limite de requisições temporariamente atingido. Você pode copiar o prompt master gerado com 1 clique para testar gratuitamente no Google ImageFX, Midjourney ou Flux.";
            }
            setError(msg);
        } finally {
            setIsGeneratingVisual(false);
        }
    };

    const handleGeneratePrompt = () => {
        let promptParts: string[] = [];
        const analysis = activeImage?.analysis;
        const isMockup = settings.mode === 'mockup';
        const is3dLogo = settings.is3dLogo;
        const isExtractPerson = settings.mode === 'extract_person';
        const isExtractBg = settings.mode === 'extract_background';
        const isExtractElement = settings.mode === 'extract_element';
        const isRemoveBranding = settings.mode === 'remove_branding' || !!settings.removeBranding;

        const detailVal = settings.detailLevel === 'auto' ? 5 : settings.detailLevel;
        const detailInfo = DETAIL_LEVEL_MAP[detailVal];
        const platformBoost = detailInfo.platformBoosts[settings.targetPlatform] || "";
        promptParts.push(detailInfo.keywords.join(", "));

        if (detailVal >= 7) {
            promptParts.push("extreme 1:1 reference fidelity, precise chromatic match to source image, authentic surface micro-textures, identical lighting angles and specular reflections, photographic replication of reference");
        }

        let subject = settings.basePrompt || "[subject]";
        if (analysis) {
            const subjectType = analysis.composition === 'portrait' ? 'person' : 'subject';
            subject = subject.replace(/\[subject\]/gi, subjectType);
            subject = subject.replace(/\[product\]/gi, 'product');
            subject = subject.replace(/\[location\]/gi, 'landscape');
        }
        
        if (isExtractPerson) {
            subject = `Exact portrait replication of ${subject}, cloned identical facial features, precise eyes, nose, lips and jawline geometry, identical hairstyle and hair texture, exact wardrobe fabrics and cut, authentic natural pose and facial expression, 1:1 biometric match to reference image`;
        } else if (isExtractElement) {
            subject = `Clean isolated foreground ${subject}, completely separated from background scenery, razor-sharp silhouette cutout, studio cyclorama lighting, authentic materials and tactile surface textures, pristine asset isolation`;
        } else if (isRemoveBranding) {
            subject = `Commercial UNBRANDED ${subject}, blank unprinted container surface, zero logos, zero paper labels, zero brand typography or stickers, authentic container geometry, strictly preserving the exact original container and liquid color palette`;
        } else if (isExtractBg) {
            subject = "Pristine empty scenic background plate, completely empty environment without foreground people or subjects, isolated background setting";
        } else if (is3dLogo) {
            subject = `High-fidelity 3D reconstruction of ${subject}, maintaining identical design details and branding, isometric perspective, clean vector silhouette, professional 3D branding aesthetic, identical to the source reference`;
        } else if (isMockup) {
            if (settings.keepColors) {
                subject = `A professional UNBRANDED ${subject}, maintaining exact original shape and proportions, preserving original color palette and material appearance, strictly no logos, no text`;
            } else {
                subject = `A professional BLANK WHITE UNBRANDED ${subject}, maintaining exact original shape and proportions, white clay texture, matte finish, strictly no logos, no text, minimal untextured surface`;
            }
        }
        promptParts.push(subject);

        if (isExtractPerson) {
            promptParts.push("extreme biometric fidelity, natural skin pore detail, soft studio portrait lighting with catchlights, isolated subject presentation, sharp focus, 8k resolution master portrait");
        } else if (isExtractElement) {
            promptParts.push("isolated on clean studio backdrop, zero background clutter, high-end commercial product isolation, crystal clear edge delineation, authentic specular reflections, 8k resolution, photorealistic master asset");
        } else if (isRemoveBranding) {
            promptParts.push("completely devoid of trademarks or commercial text, clean seamless unprinted packaging finish, authentic reflections, subtle condensation droplets, high-end commercial beverage photography");
        } else if (isExtractBg) {
            promptParts.push("hyper-detailed architectural surfaces, ambient scene props, pristine spatial environment, clean background composition, no foreground elements, photographic empty plate");
        } else if (is3dLogo) {
            promptParts.push("Octane render, Cinema 4D, Unreal Engine 5, ray tracing, sharp clean edges, volumetric lighting, premium high-gloss finish, masterfully rendered 3D asset");
        }

        if (analysis) {
            if (analysis.sharpness === 'crisp') promptParts.push("ultra sharp focus, crisp edges");
            if (analysis.depthOfField === 'shallow') promptParts.push("shallow depth of field, elegant bokeh");
            if (analysis.contourComplexity === 'high') promptParts.push("intricate structural detail, complex topology");
            
            if ((isMockup || is3dLogo || isRemoveBranding || isExtractElement) && settings.keepColors && analysis.colors.dominantColors.length > 0) {
                promptParts.push(`maintaining authentic color palette: ${analysis.colors.dominantColors.join(', ')}`);
            }
        }

        if (settings.productPosition !== 'none') {
            const posText = PRODUCT_POSITION_PROMPTS[settings.productPosition];
            if (posText) {
                promptParts.push(posText);
            }
        }

        if (isRemoveBranding) {
            promptParts.push("clean commercial advertising studio backdrop, soft studio lighting, sharp focus on unbranded beverage container");
        } else if (is3dLogo) {
            promptParts.push("clean solid neutral studio background, professional lighting setup, minimal distractions, high-end commercial presentation");
        } else if (isMockup) {
            promptParts.push("clean minimal professional studio background, solid neutral grey surface, high-end catalog presentation");
            promptParts.push("soft professional studio shadows, diffused lighting environment");
        } else if (settings.environment !== 'none') {
            promptParts.push(`${settings.environment.replace('_', ' ')} environment`);
        } else if (analysis) {
             promptParts.push(`${analysis.composition} setting`);
        }

        const baseStyle = STYLE_TEMPLATES[settings.style] || settings.style;
        promptParts.push(baseStyle);

        if (settings.material !== 'none') {
            promptParts.push(`${settings.material.replace('_', ' ')} material`);
        }

        if (settings.lighting !== 'none' && settings.lighting !== 'auto') {
            promptParts.push(`${settings.lighting.replace('_', ' ')} lighting`);
        } else if (settings.lighting === 'auto' && analysis) {
            promptParts.push(`${analysis.brightness} key lighting`);
        }

        if (settings.shadowOpacity !== 100) {
            promptParts.push(`shadow density ${settings.shadowOpacity}%`);
        }

        if (settings.composition !== 'auto') {
            promptParts.push(COMPOSITION_KEYWORDS[settings.composition] || `${settings.composition.replace('_', ' ')} shot`);
        }

        if (settings.cameraAngle !== 'none') {
            const angleText = CAMERA_ANGLE_PROMPTS[settings.cameraAngle];
            if (angleText) {
                promptParts.push(angleText);
            }
        }

        const socialContext = SOCIAL_FORMAT_KEYWORDS[settings.aspectRatio];
        if (socialContext) {
            promptParts.push(socialContext);
        }
        
        const platformGoldenParams = PLATFORM_BEST_PARAMS[settings.targetPlatform];
        if (platformGoldenParams) promptParts.push(platformGoldenParams);

        if (platformBoost) promptParts.push(platformBoost);
        if (settings.extraParams) promptParts.push(settings.extraParams);

        let finalPrompt = promptParts.filter(Boolean).join(", ");

        if (settings.negativePrompt) {
            if (settings.targetPlatform === 'midjourney') {
                finalPrompt += ` --no ${settings.negativePrompt}`;
            } else {
                finalPrompt += `, exclude: ${settings.negativePrompt}`;
            }
        }

        if (settings.targetPlatform === 'midjourney' && settings.aspectRatio !== '1:1') {
            finalPrompt += ` --ar ${settings.aspectRatio}`;
        }
        
        setPrompt(finalPrompt);
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
            <header className="bg-slate-900/50 backdrop-blur-md border-b border-slate-800 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-3 sm:px-6 py-3 sm:py-4 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                        <div className="bg-gradient-to-br from-blue-500 to-violet-600 p-1.5 sm:p-2 rounded-lg shadow-lg shadow-blue-500/20">
                            <Zap size={20} className="text-white sm:w-6 sm:h-6" />
                        </div>
                        <h1 className="text-lg sm:text-xl font-black bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-violet-400 tracking-tight">VPA v2.5</h1>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-3">
                        {prompt && (
                            <button
                                onClick={() => {
                                    navigator.clipboard.writeText(prompt);
                                    window.open('https://aitestkitchen.withgoogle.com/tools/image-fx', '_blank');
                                }}
                                className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3.5 py-2 text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 rounded-lg shadow-lg shadow-emerald-500/20 transition-all active:scale-95 cursor-pointer min-h-[38px]"
                                title="Copiar prompt e abrir o Google ImageFX (gerador de imagem 100% gratuito)"
                            >
                                <ExternalLink size={14} className="shrink-0" />
                                <span className="hidden sm:inline">Testar no ImageFX (Grátis)</span>
                                <span className="sm:hidden font-bold">ImageFX</span>
                            </button>
                        )}
                        <button 
                            onClick={() => setIsHistoryOpen(true)}
                            className="flex items-center justify-center gap-2 p-2 sm:px-3 sm:py-2 text-sm font-bold text-slate-300 bg-slate-800/80 border border-slate-700 rounded-lg hover:bg-slate-700 transition-all active:scale-95 min-h-[38px] min-w-[38px] cursor-pointer"
                            title="Histórico"
                        >
                            <History size={16} />
                            <span className="hidden md:inline text-xs">Histórico</span>
                        </button>
                        <button 
                            onClick={() => setIsSettingsOpen(true)}
                            className="flex items-center justify-center gap-1.5 sm:gap-2 p-2 sm:px-3 sm:py-2 text-sm font-bold text-slate-300 bg-slate-800/80 border border-slate-700 rounded-lg hover:bg-slate-700 transition-all active:scale-95 min-h-[38px] min-w-[38px] cursor-pointer"
                            title="Configurações Globais (Estilo Padrão & APIs)"
                        >
                            <Settings size={16} className="text-slate-300" />
                            <span className="hidden md:inline text-xs">Configurações</span>
                        </button>
                    </div>
                </div>
            </header>

            <main className="flex-1 max-w-7xl w-full mx-auto px-2.5 sm:px-4 py-4 sm:py-8">
                {error && (
                    <div className="mb-4 sm:mb-6 bg-red-500/10 border border-red-500/30 text-red-300 p-4 rounded-xl flex items-start justify-between gap-3 animate-in fade-in slide-in-from-top-2 duration-300 text-xs shadow-lg">
                        <div className="flex items-start gap-3 min-w-0">
                            <AlertCircle size={18} className="text-red-400 shrink-0 mt-0.5" />
                            <div className="space-y-2 min-w-0">
                                <p className="font-medium text-red-200 leading-relaxed break-words">{error}</p>
                                {prompt && (
                                    <div className="flex items-center gap-2 pt-1 flex-wrap">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                navigator.clipboard.writeText(prompt);
                                            }}
                                            className="px-2.5 py-1 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-white font-bold text-[11px] transition-all"
                                        >
                                            Copiar Prompt Master
                                        </button>
                                        <a
                                            href="https://aitestkitchen.withgoogle.com/tools/image-fx"
                                            target="_blank"
                                            rel="noreferrer"
                                            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-[11px] inline-flex items-center gap-1.5 transition-all"
                                        >
                                            <span>Testar no Google ImageFX</span>
                                            <ExternalLink size={11} className="text-slate-400" />
                                        </a>
                                    </div>
                                )}
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={() => setError(null)}
                            className="text-red-400 hover:text-white p-1 rounded-lg hover:bg-red-500/20 transition-colors shrink-0"
                            title="Fechar aviso"
                        >
                            <X size={16} />
                        </button>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-start">
                    <div className="lg:col-span-5 space-y-5 sm:space-y-6">
                        {!activeImage ? (
                            <DropZone 
                                onFilesSelected={handleFilesSelected} 
                                onError={setError}
                            />
                        ) : (
                            <div className="space-y-4 animate-in fade-in duration-500">
                                {/* Galeria e Seletor de Imagens de Referência */}
                                <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 backdrop-blur-md shadow-lg space-y-2">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <ImageIcon size={15} className="text-blue-400" />
                                            <span className="text-xs font-bold text-slate-200">
                                                Imagens de Referência ({images.length})
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-1.5 sm:gap-2">
                                            <button
                                                type="button"
                                                onClick={() => extraFileInputRef.current?.click()}
                                                className="px-2 py-1 text-[11px] font-bold text-blue-300 hover:text-white bg-blue-600/20 hover:bg-blue-600/40 border border-blue-500/30 rounded-lg flex items-center gap-1 transition-all active:scale-95"
                                                title="Adicionar mais imagens de referência"
                                            >
                                                <Plus size={13} />
                                                <span>Adicionar</span>
                                            </button>
                                            <button
                                                type="button"
                                                onClick={handleClearAllImages}
                                                className="px-2 py-1 text-[11px] font-medium text-slate-400 hover:text-red-300 hover:bg-red-500/10 border border-slate-800 hover:border-red-500/30 rounded-lg flex items-center gap-1 transition-colors"
                                                title="Remover todas as imagens de referência"
                                            >
                                                <Trash2 size={12} />
                                                <span className="hidden sm:inline">Limpar</span>
                                            </button>
                                        </div>
                                    </div>

                                    {/* Miniaturas de todas as imagens de referência carregadas */}
                                    <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar">
                                        {images.map((img, idx) => {
                                            const isSelected = img.id === selectedImageId;
                                            const thumbSrc = img.previewUrl || (img.base64Data ? `data:${img.mimeType || 'image/png'};base64,${img.base64Data}` : '');
                                            return (
                                                <div
                                                    key={img.id}
                                                    className={`relative group shrink-0 w-14 h-14 sm:w-16 sm:h-16 rounded-lg overflow-hidden border cursor-pointer transition-all ${
                                                        isSelected 
                                                            ? 'border-blue-500 ring-2 ring-blue-500/40 shadow-md shadow-blue-500/20' 
                                                            : 'border-slate-800 hover:border-slate-600 opacity-70 hover:opacity-100'
                                                    }`}
                                                    onClick={() => setSelectedImageId(img.id)}
                                                    title={`Ref #${idx + 1}: ${img.name}`}
                                                >
                                                    <img 
                                                        src={thumbSrc} 
                                                        alt={img.name} 
                                                        className="w-full h-full object-cover"
                                                        onError={(e) => {
                                                            if (img.base64Data) {
                                                                (e.target as HTMLImageElement).src = `data:${img.mimeType || 'image/png'};base64,${img.base64Data}`;
                                                            }
                                                        }}
                                                    />
                                                    {isSelected && (
                                                        <div className="absolute top-1 left-1 w-2 h-2 rounded-full bg-blue-400 shadow-sm" />
                                                    )}
                                                    <button
                                                        type="button"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleRemoveImage(img.id);
                                                        }}
                                                        className="absolute top-0.5 right-0.5 p-0.5 rounded-full bg-slate-950/80 text-slate-400 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                                                        title="Remover esta imagem"
                                                    >
                                                        <Trash2 size={11} />
                                                    </button>
                                                    <div className="absolute bottom-0 inset-x-0 bg-slate-950/85 text-[8px] text-slate-300 px-0.5 truncate text-center font-mono">
                                                        #{idx + 1}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    {/* Input oculto para upload de referências adicionais */}
                                    <input 
                                        type="file"
                                        ref={extraFileInputRef}
                                        className="hidden"
                                        multiple
                                        accept="image/jpeg,image/png,image/webp,image/avif,image/gif,image/svg+xml,.jiff,.jfif"
                                        onChange={(e) => {
                                            if (e.target.files && e.target.files.length > 0) {
                                                handleFilesSelected(Array.from(e.target.files));
                                                e.target.value = '';
                                            }
                                        }}
                                    />
                                </div>

                                <ImagePreview 
                                    src={activeImage.previewUrl} 
                                    fallbackSrc={activeImage.base64Data ? `data:${activeImage.mimeType || 'image/png'};base64,${activeImage.base64Data}` : undefined}
                                    alt={activeImage.name} 
                                    onRemove={() => handleRemoveImage(activeImage.id)} 
                                    onRemoveBackground={() => setSettings(s => ({ ...s, removeBackground: !s.removeBackground }))}
                                    isRemovingBackground={settings.removeBackground}
                                    onCropSave={handleCropSave}
                                />
                                {activeImage.analysis && <AnalysisResultView analysis={activeImage.analysis} imageName={activeImage.name} />}
                            </div>
                        )}
                    </div>

                    <div className="lg:col-span-7">
                        {/* Tab Switcher: Arquiteto vs Galeria de Efeitos vs Ficha de Modelo */}
                        <div className="flex items-center gap-1.5 sm:gap-2 p-1.5 bg-slate-900/90 border border-slate-800 rounded-xl mb-5 sm:mb-6 backdrop-blur-md shadow-lg">
                            <button 
                                onClick={() => setActiveControlTab('architect')}
                                className={`flex-1 py-2 sm:py-2.5 px-2 sm:px-3 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 sm:gap-2 transition-all min-h-[40px] ${
                                    activeControlTab === 'architect' 
                                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25 ring-1 ring-blue-400' 
                                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                                }`}
                            >
                                <Sliders size={15} className={activeControlTab === 'architect' ? 'text-white' : 'text-blue-400'} />
                                <span>Arquiteto de Prompt</span>
                            </button>
                            <button 
                                onClick={() => setActiveControlTab('effects')}
                                className={`flex-1 py-2 sm:py-2.5 px-2 sm:px-3 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 sm:gap-2 transition-all relative min-h-[40px] ${
                                    activeControlTab === 'effects' 
                                        ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-500/25 ring-1 ring-violet-400' 
                                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                                }`}
                            >
                                <Sparkles size={15} className={activeControlTab === 'effects' ? 'text-amber-300' : 'text-violet-400'} />
                                <span>Efeitos Visuais</span>
                                <span className="hidden sm:inline-block px-1.5 py-0.5 text-[9px] font-black rounded-full bg-violet-400/20 text-violet-200 border border-violet-400/30">
                                    80+
                                </span>
                            </button>
                            <button 
                                onClick={() => setActiveControlTab('modelsheet')}
                                className={`flex-1 py-2 sm:py-2.5 px-2 sm:px-3 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 sm:gap-2 transition-all relative min-h-[40px] ${
                                    activeControlTab === 'modelsheet' 
                                        ? 'bg-gradient-to-r from-red-600 via-pink-600 to-amber-600 text-white shadow-lg shadow-red-500/25 ring-1 ring-red-400' 
                                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                                }`}
                            >
                                <Layers size={15} className={activeControlTab === 'modelsheet' ? 'text-white' : 'text-red-400'} />
                                <span>Ficha de Modelo</span>
                            </button>
                            <button 
                                onClick={() => setActiveControlTab('productsheet')}
                                className={`flex-1 py-2 sm:py-2.5 px-2 sm:px-3 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 sm:gap-2 transition-all relative min-h-[40px] ${
                                    activeControlTab === 'productsheet' 
                                        ? 'bg-gradient-to-r from-amber-500 via-orange-600 to-red-600 text-white shadow-lg shadow-orange-500/25 ring-1 ring-amber-400' 
                                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                                }`}
                                title="Troca de Marca & Ficha de Produto (Envie garrafa, logo e rótulo)"
                            >
                                <Package size={15} className={activeControlTab === 'productsheet' ? 'text-white' : 'text-amber-400'} />
                                <span>Troca de Marca</span>
                                <span className="px-1.5 py-0.5 text-[9px] font-black rounded-full bg-amber-400/20 text-amber-200 border border-amber-400/30">
                                    NOVO
                                </span>
                            </button>
                        </div>

                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                            {activeControlTab === 'architect' ? (
                                <ControlPanel 
                                    settings={settings} 
                                    onSettingsChange={setSettings} 
                                    onGenerate={handleGeneratePrompt}
                                    onAnalyzeGemini={handleGeminiAnalysis}
                                    onAnalyzeOpenAI={handleOpenAIAnalysis}
                                    onAnalyzeDeepseek={handleDeepseekAnalysis}
                                    onAnalyzeGoogleVision={handleGoogleVisionAnalysis}
                                    onAnalyzeWhisk={handleWhiskAnalysis}
                                    onAnalyzeImageFX={handleAnalyzeImageFX}
                                    onAnalyzeClaude={handleClaudeAnalysis}
                                    onAnalyzeMidjourney={handleMidjourneyAnalysis}
                                    onAnalyzeFlux={handleFluxAnalysis}
                                    onAnalyzeIdeogram={handleIdeogramAnalysis}
                                    onAnalyzeHuggingFace={handleHuggingFaceAnalysis}
                                    onAnalyzeConsensus={handleConsensusAnalysis}
                                    onAnalyzeBehance={handleBehanceAnalysis}
                                    onAnalyzeArtStation={handleArtStationAnalysis}
                                    onAnalyzeProductDesign={handleProductDesignAnalysis}
                                    onAnalyzeAwwwards={handleAwwwardsAnalysis}
                                    onAnalyzeCinema={handleCinemaAnalysis}
                                    onAnalyzeVogue={handleVogueAnalysis}
                                    onAnalyzeNatGeo={handleNatGeoAnalysis}
                                    onAnalyzeOctane={handleOctaneAnalysis}
                                    onAnalyzeUnreal={handleUnrealAnalysis}
                                    onAnalyzeLeonardo={handleLeonardoAnalysis}
                                    onAnalyzeSD={handleSDAnalysis}
                                    onAnalyzeRedshift={handleRedshiftAnalysis}
                                    onAnalyzeVRay={handleVRayAnalysis}
                                    onAnalyzeCorona={handleCoronaAnalysis}
                                    onAnalyzeCycles={handleCyclesAnalysis}
                                    onAnalyzeRecraft={handleRecraftAnalysis}
                                    onAnalyzeMagnific={handleMagnificAnalysis}
                                    onAnalyzeTF={handleTFAnalysis}
                                    onOpenSettings={() => setIsSettingsOpen(true)}
                                    isGeneratingGemini={isGeneratingGemini}
                                    isGeneratingOpenAI={isGeneratingOpenAI}
                                    isGeneratingDeepseek={isGeneratingDeepseek}
                                    isGeneratingGoogleVision={isGeneratingGoogleVision}
                                    isGeneratingWhisk={isGeneratingWhisk}
                                    isGeneratingImageFX={isGeneratingImageFX}
                                    isGeneratingClaude={isGeneratingClaude}
                                    isGeneratingMidjourney={isGeneratingMidjourney}
                                    isGeneratingFlux={isGeneratingFlux}
                                    isGeneratingIdeogram={isGeneratingIdeogram}
                                    isGeneratingHuggingFace={isGeneratingHuggingFace}
                                    isGeneratingConsensus={isGeneratingConsensus}
                                    isGeneratingBehance={isGeneratingBehance}
                                    isGeneratingArtStation={isGeneratingArtStation}
                                    isGeneratingProductDesign={isGeneratingProductDesign}
                                    isGeneratingAwwwards={isGeneratingAwwwards}
                                    isGeneratingCinema={isGeneratingCinema}
                                    isGeneratingVogue={isGeneratingVogue}
                                    isGeneratingNatGeo={isGeneratingNatGeo}
                                    isGeneratingOctane={isGeneratingOctane}
                                    isGeneratingUnreal={isGeneratingUnreal}
                                    isGeneratingLeonardo={isGeneratingLeonardo}
                                    isGeneratingSD={isGeneratingSD}
                                    isGeneratingRedshift={isGeneratingRedshift}
                                    isGeneratingVRay={isGeneratingVRay}
                                    isGeneratingCorona={isGeneratingCorona}
                                    isGeneratingCycles={isGeneratingCycles}
                                    isGeneratingRecraft={isGeneratingRecraft}
                                    isGeneratingMagnific={isGeneratingMagnific}
                                    isGeneratingTF={isGeneratingTF}
                                    hasImage={!!activeImage}
                                    onSwitchToEffects={() => setActiveControlTab('effects')}
                                    onSwitchToModelSheet={() => setActiveControlTab('modelsheet')}
                                    onSwitchToProductSheet={() => setActiveControlTab('productsheet')}
                                    onAnalyzeSearchGrounding={handleAnalyzeSearchGrounding}
                                    isGeneratingSearchGrounding={isGeneratingSearchGrounding}
                                />
                            ) : activeControlTab === 'effects' ? (
                                <VisualEffectsTab 
                                    onApplyPrompt={(newPrompt) => {
                                        setPrompt(newPrompt);
                                        setSettings(s => ({ ...s, basePrompt: newPrompt }));
                                    }}
                                    onCreateVisual={handleCreateVisual}
                                    currentBasePrompt={settings.basePrompt}
                                    hasActiveImage={!!activeImage}
                                    activeImageName={activeImage?.name}
                                    detectedSubject={activeImage?.name ? activeImage.name.replace(/\.[^/.]+$/, "").replace(/[_-]/g, " ") : ''}
                                    targetPlatform={settings.targetPlatform}
                                    onSwitchToArchitect={() => setActiveControlTab('architect')}
                                />
                            ) : activeControlTab === 'modelsheet' ? (
                                <ModelSheetStudio 
                                    activeImageBase64={activeImage?.base64Data}
                                    activeImageMimeType={activeImage?.mimeType}
                                    activeImageName={activeImage?.name}
                                    targetPlatform={settings.targetPlatform}
                                    onApplyPrompt={(newPrompt) => {
                                        setPrompt(newPrompt);
                                        setSettings(s => ({ ...s, basePrompt: newPrompt }));
                                    }}
                                    onCreateVisual={handleCreateVisual}
                                    isGeneratingVisual={isGeneratingVisual}
                                    onSwitchToArchitect={() => setActiveControlTab('architect')}
                                />
                            ) : (
                                <ProductSheetStudio 
                                    activeImageBase64={activeImage?.base64Data}
                                    activeImageMimeType={activeImage?.mimeType}
                                    activeImageName={activeImage?.name}
                                    targetPlatform={settings.targetPlatform}
                                    onApplyPrompt={(newPrompt) => {
                                        setPrompt(newPrompt);
                                        setSettings(s => ({ ...s, basePrompt: newPrompt }));
                                    }}
                                    onCreateVisual={handleCreateVisual}
                                    isGeneratingVisual={isGeneratingVisual}
                                    onSwitchToArchitect={() => setActiveControlTab('architect')}
                                />
                            )}
                            <div className="flex flex-col gap-6">
                                <PromptDisplay 
                                    prompt={prompt} 
                                    onUpdatePrompt={setPrompt} 
                                    searchGroundingData={searchGroundingData}
                                    onEnrichWithSearch={handleEnrichWithSearch}
                                    isGeneratingSearchGrounding={isGeneratingSearchGrounding}
                                />
                                {personData && (
                                    <PersonExtractionView 
                                        data={personData}
                                        onApplyToPrompt={(newPrompt) => setPrompt(newPrompt)}
                                        onCreateVisual={handleCreateVisual}
                                        isGeneratingVisual={isGeneratingVisual}
                                    />
                                )}
                                {elementData && (
                                    <ElementExtractionView 
                                        data={elementData}
                                        onApplyToPrompt={(newPrompt) => setPrompt(newPrompt)}
                                        onCreateVisual={handleCreateVisual}
                                        isGeneratingVisual={isGeneratingVisual}
                                    />
                                )}
                                {backgroundData && (
                                    <BackgroundElementsView 
                                        data={backgroundData}
                                        onApplyToPrompt={(newPrompt) => setPrompt(newPrompt)}
                                        onCreateVisual={handleCreateVisual}
                                        isGeneratingVisual={isGeneratingVisual}
                                    />
                                )}
                                <GeneratedImageDisplay 
                                    imageUrl={generatedImageUrl} 
                                    originalImageUrl={activeImage?.previewUrl || null}
                                    originalImageName={activeImage?.name || null}
                                    isGenerating={isGeneratingVisual} 
                                    onClose={() => setGeneratedImageUrl(null)} 
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </main>
            
            <ApiSettingsModal 
                isOpen={isSettingsOpen} 
                onClose={() => setIsSettingsOpen(false)} 
                onSave={saveApiKeys} 
                initialOpenAIKey={openAIKey} 
                initialDeepseekKey={deepseekKey} 
                initialAnthropicKey={anthropicKey}
                initialHfToken={hfToken}
                initialDefaultStyle={defaultStyle}
            />
            <HistoryPanel 
                isOpen={isHistoryOpen}
                onClose={() => setIsHistoryOpen(false)}
                history={history}
                onRevisit={handleRevisitHistory}
                onDelete={handleDeleteHistory}
                onClear={handleClearHistory}
            />
        </div>
    );
};

export default App;
