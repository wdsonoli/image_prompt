
import React, { useState, useEffect } from 'react';
import { DropZone } from './components/DropZone';
import { ControlPanel } from './components/ControlPanel';
import { PromptDisplay } from './components/PromptDisplay';
import { AnalysisResultView } from './components/AnalysisResultView';
import { ImagePreview } from './components/ImagePreview';
import { ApiSettingsModal } from './components/ApiSettingsModal';
import { GeneratedImageDisplay } from './components/GeneratedImageDisplay';
import { HistoryPanel } from './components/HistoryPanel';
import { UploadedImage, PromptSettings, STYLE_TEMPLATES, DETAIL_LEVEL_MAP, HistoryItem, TargetPlatform, BackgroundDecomposition } from './types';
import { analyzeImage } from './utils/analysis';
import { generateGeminiPrompt, extractBackgroundDecomposition } from './services/geminiService';
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
import { BackgroundElementsView } from './components/BackgroundElementsView';
import { VisualEffectsTab } from './components/VisualEffectsTab';
import { loadHistory, saveHistory, deleteHistoryItem, clearHistory, compressBase64Image } from './utils/historyStorage';
import { Zap, History, Sparkles, Sliders } from 'lucide-react';

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
    const [error, setError] = useState<string | null>(null);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isHistoryOpen, setIsHistoryOpen] = useState(false);
    const [history, setHistory] = useState<HistoryItem[]>([]);
    
    const [openAIKey, setOpenAIKey] = useState<string>(localStorage.getItem('openai_api_key') || '');
    const [deepseekKey, setDeepseekKey] = useState<string>(localStorage.getItem('deepseek_api_key') || '');
    const [anthropicKey, setAnthropicKey] = useState<string>(localStorage.getItem('anthropic_api_key') || '');
    const [hfToken, setHfToken] = useState<string>(localStorage.getItem('hf_token') || '');

    const [isGeneratingClaude, setIsGeneratingClaude] = useState(false);
    const [isGeneratingMidjourney, setIsGeneratingMidjourney] = useState(false);
    const [isGeneratingFlux, setIsGeneratingFlux] = useState(false);
    const [isGeneratingIdeogram, setIsGeneratingIdeogram] = useState(false);
    const [isGeneratingHuggingFace, setIsGeneratingHuggingFace] = useState(false);
    const [isGeneratingConsensus, setIsGeneratingConsensus] = useState(false);
    const [activeControlTab, setActiveControlTab] = useState<'architect' | 'effects'>('architect');
    
    const [settings, setSettings] = useState<PromptSettings>({
        basePrompt: '',
        negativePrompt: '',
        style: 'photorealistic',
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
        is3dLogo: false
    });

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

    const saveApiKeys = (newOpenAIKey: string, newDeepseekKey: string, newAnthropicKey = '', newHfToken = '') => {
        setOpenAIKey(newOpenAIKey);
        setDeepseekKey(newDeepseekKey);
        setAnthropicKey(newAnthropicKey);
        setHfToken(newHfToken);
        localStorage.setItem('openai_api_key', newOpenAIKey);
        localStorage.setItem('deepseek_api_key', newDeepseekKey);
        localStorage.setItem('anthropic_api_key', newAnthropicKey);
        localStorage.setItem('hf_token', newHfToken);
        setError(null);
    };

    const activeImage = images.find(img => img.id === selectedImageId) || null;

    const handleFilesSelected = async (files: File[]) => {
        setError(null);
        let originalFile = files[0];
        if (!originalFile) return;

        try {
            const previewUrl = URL.createObjectURL(originalFile);
            const base64Data = await fileToBase64(originalFile);
            const mimeType = originalFile.type;

            const tempId = Date.now().toString();
            const analysis = await analyzeImage(originalFile);
            
            const newImage: UploadedImage = { 
                id: tempId, 
                file: originalFile, 
                previewUrl, 
                name: originalFile.name, 
                analysis,
                base64Data,
                mimeType
            };

            setImages([newImage]);
            setSelectedImageId(tempId);
            setBackgroundData(null);
        } catch (err: any) {
            setError(`Erro ao processar imagem: ${err.message || 'Erro desconhecido'}`);
        }
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

            setImages([updatedImage]);
            setError(null);
            // Re-gera o prompt base com a nova análise se houver
            handleGeneratePrompt();
        } catch (err: any) {
            setError(`Erro ao salvar recorte: ${err.message}`);
        }
    };

    const handleDeepseekAnalysis = async () => {
        if (!activeImage) return;
        if (!deepseekKey) { setError("Adicione a chave Deepseek nas configurações."); return; }
        setIsGeneratingDeepseek(true);
        try {
            const result = await generateDeepseekPrompt(activeImage.file, deepseekKey, settings, activeImage.base64Data ? { base64: activeImage.base64Data, mimeType: activeImage.mimeType! } : undefined);
            setPrompt(result);
            if (settings.mode === 'extract_background' && !backgroundData) {
                extractBackgroundDecomposition(activeImage.file, settings, { base64: activeImage.base64Data!, mimeType: activeImage.mimeType! })
                    .then(bg => setBackgroundData(bg))
                    .catch(() => {});
            }
        } catch (err: any) {
            setError(err.message || "Falha na análise Deepseek.");
        } finally {
            setIsGeneratingDeepseek(false);
        }
    };

    const handleGeminiAnalysis = async () => {
        if (!activeImage) return;
        setIsGeneratingGemini(true); 
        try { 
            if (settings.mode === 'extract_background') {
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
            if (settings.mode === 'extract_background' && !backgroundData) {
                extractBackgroundDecomposition(activeImage.file, settings, { base64: activeImage.base64Data!, mimeType: activeImage.mimeType! })
                    .then(bg => setBackgroundData(bg))
                    .catch(() => {});
            }
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
            if (settings.mode === 'extract_background' && !backgroundData) {
                extractBackgroundDecomposition(activeImage.file, settings, { base64: activeImage.base64Data!, mimeType: activeImage.mimeType! })
                    .then(bg => setBackgroundData(bg))
                    .catch(() => {});
            }
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
            if (settings.mode === 'extract_background' && !backgroundData) {
                extractBackgroundDecomposition(activeImage.file, settings, { base64: activeImage.base64Data!, mimeType: activeImage.mimeType! })
                    .then(bg => setBackgroundData(bg))
                    .catch(() => {});
            }
        } catch (err: any) {
            setError(err.message || "Falha na análise ImageFX.");
        } finally {
            setIsGeneratingImageFX(false);
        }
    };

    const handleOpenAIAnalysis = async () => {
        if (!activeImage) return;
        if (!openAIKey) { setError("Adicione a chave OpenAI nas configurações."); return; }
        setIsGeneratingOpenAI(true); 
        try { 
            const result = await generateOpenAIPrompt(activeImage.file, openAIKey, settings, { base64: activeImage.base64Data!, mimeType: activeImage.mimeType! });
            setPrompt(result);
            if (settings.mode === 'extract_background' && !backgroundData) {
                extractBackgroundDecomposition(activeImage.file, settings, { base64: activeImage.base64Data!, mimeType: activeImage.mimeType! })
                    .then(bg => setBackgroundData(bg))
                    .catch(() => {});
            }
        } catch (err: any) {
            setError(err.message || "Falha na análise OpenAI.");
        } finally { 
            setIsGeneratingOpenAI(false); 
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
            if (settings.mode === 'extract_background' && !backgroundData) {
                extractBackgroundDecomposition(activeImage.file, settings, { base64: activeImage.base64Data!, mimeType: activeImage.mimeType! })
                    .then(bg => setBackgroundData(bg))
                    .catch(() => {});
            }
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
            if (settings.mode === 'extract_background' && !backgroundData) {
                extractBackgroundDecomposition(activeImage.file, settings, { base64: activeImage.base64Data!, mimeType: activeImage.mimeType! })
                    .then(bg => setBackgroundData(bg))
                    .catch(() => {});
            }
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
            if (settings.mode === 'extract_background' && !backgroundData) {
                extractBackgroundDecomposition(activeImage.file, settings, { base64: activeImage.base64Data!, mimeType: activeImage.mimeType! })
                    .then(bg => setBackgroundData(bg))
                    .catch(() => {});
            }
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
            if (settings.mode === 'extract_background' && !backgroundData) {
                extractBackgroundDecomposition(activeImage.file, settings, { base64: activeImage.base64Data!, mimeType: activeImage.mimeType! })
                    .then(bg => setBackgroundData(bg))
                    .catch(() => {});
            }
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
            if (settings.mode === 'extract_background' && !backgroundData) {
                extractBackgroundDecomposition(activeImage.file, settings, { base64: activeImage.base64Data!, mimeType: activeImage.mimeType! })
                    .then(bg => setBackgroundData(bg))
                    .catch(() => {});
            }
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
            if (settings.mode === 'extract_background' && !backgroundData) {
                extractBackgroundDecomposition(activeImage.file, settings, { base64: activeImage.base64Data!, mimeType: activeImage.mimeType! })
                    .then(bg => setBackgroundData(bg))
                    .catch(() => {});
            }
        } catch (err: any) {
            setError(err.message || "Falha na análise do Consenso Multi-Visão.");
        } finally {
            setIsGeneratingConsensus(false);
        }
    };

    const handleCreateVisual = async () => {
        if (!prompt) return;
        setIsGeneratingVisual(true);
        try {
            const imageContext = activeImage?.base64Data ? { base64: activeImage.base64Data, mimeType: activeImage.mimeType! } : undefined;
            const url = await generateImage(prompt, false, imageContext);
            setGeneratedImageUrl(url);
            
            if (activeImage?.base64Data && activeImage.mimeType) {
                addToHistory({
                    prompt,
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
            setError(err.message);
        } finally {
            setIsGeneratingVisual(false);
        }
    };

    const handleGeneratePrompt = () => {
        let promptParts: string[] = [];
        const analysis = activeImage?.analysis;
        const isMockup = settings.mode === 'mockup';
        const is3dLogo = settings.is3dLogo;
        const isExtractBg = settings.mode === 'extract_background';
        const isRemoveBranding = settings.mode === 'remove_branding' || !!settings.removeBranding;

        const detailInfo = DETAIL_LEVEL_MAP[settings.detailLevel === 'auto' ? 5 : settings.detailLevel];
        const platformBoost = detailInfo.platformBoosts[settings.targetPlatform] || "";
        promptParts.push(detailInfo.keywords.join(", "));

        let subject = settings.basePrompt || "[subject]";
        if (analysis) {
            const subjectType = analysis.composition === 'portrait' ? 'person' : 'subject';
            subject = subject.replace(/\[subject\]/gi, subjectType);
            subject = subject.replace(/\[product\]/gi, 'product');
            subject = subject.replace(/\[location\]/gi, 'landscape');
        }
        
        if (isRemoveBranding) {
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

        if (isRemoveBranding) {
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
            
            if ((isMockup || is3dLogo || isRemoveBranding) && settings.keepColors && analysis.colors.dominantColors.length > 0) {
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
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="bg-gradient-to-br from-blue-500 to-violet-600 p-2 rounded-lg shadow-lg shadow-blue-500/20">
                            <Zap size={24} className="text-white" />
                        </div>
                        <h1 className="text-xl font-black bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-violet-400 tracking-tight">VPA v2.5</h1>
                    </div>
                    <button 
                        onClick={() => setIsHistoryOpen(true)}
                        className="flex items-center gap-2 px-3 py-2 text-sm font-bold text-slate-300 bg-slate-800/80 border border-slate-700 rounded-lg hover:bg-slate-700 transition-all active:scale-95"
                        title="Histórico"
                    >
                        <History size={16} />
                    </button>
                </div>
            </header>

            <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-8">
                {error && (
                    <div className="mb-6 bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg flex items-center justify-between animate-in fade-in slide-in-from-top-2 duration-300">
                        <span className="text-xs font-bold uppercase tracking-wider">{error}</span>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                    <div className="lg:col-span-5 space-y-6">
                        {!activeImage ? (
                            <DropZone 
                                onFilesSelected={handleFilesSelected} 
                                onError={setError}
                            />
                        ) : (
                            <div className="space-y-4 animate-in fade-in duration-500">
                                <ImagePreview 
                                    src={activeImage.previewUrl} 
                                    alt={activeImage.name} 
                                    onRemove={() => { 
                                        if (activeImage) URL.revokeObjectURL(activeImage.previewUrl);
                                        setImages([]); 
                                        setPrompt(''); 
                                        setBackgroundData(null);
                                    }} 
                                    onRemoveBackground={() => setSettings(s => ({ ...s, removeBackground: !s.removeBackground }))}
                                    isRemovingBackground={settings.removeBackground}
                                    onCropSave={handleCropSave}
                                />
                                {activeImage.analysis && <AnalysisResultView analysis={activeImage.analysis} imageName={activeImage.name} />}
                            </div>
                        )}
                    </div>

                    <div className="lg:col-span-7">
                        {/* Tab Switcher: Arquiteto vs Galeria de Efeitos */}
                        <div className="flex items-center gap-2 p-1.5 bg-slate-900/90 border border-slate-800 rounded-xl mb-6 backdrop-blur-md shadow-lg">
                            <button 
                                onClick={() => setActiveControlTab('architect')}
                                className={`flex-1 py-2.5 px-4 rounded-lg font-bold text-xs flex items-center justify-center gap-2 transition-all ${
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
                                className={`flex-1 py-2.5 px-4 rounded-lg font-bold text-xs flex items-center justify-center gap-2 transition-all relative ${
                                    activeControlTab === 'effects' 
                                        ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-500/25 ring-1 ring-violet-400' 
                                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                                }`}
                            >
                                <Sparkles size={15} className={activeControlTab === 'effects' ? 'text-amber-300' : 'text-violet-400'} />
                                <span>Efeitos Visuais (/tags)</span>
                                <span className="px-2 py-0.5 text-[9px] font-black rounded-full bg-violet-400/20 text-violet-200 border border-violet-400/30">
                                    80+ Efeitos
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
                                    isGeneratingTF={isGeneratingTF}
                                    hasImage={!!activeImage}
                                    onSwitchToEffects={() => setActiveControlTab('effects')}
                                />
                            ) : (
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
                            )}
                            <div className="flex flex-col gap-6">
                                <PromptDisplay prompt={prompt} onUpdatePrompt={setPrompt} onCreateImage={handleCreateVisual} isGeneratingImage={isGeneratingVisual} />
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
