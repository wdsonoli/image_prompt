import React, { useState, useEffect, useRef } from 'react';
import { 
    Video, Film, Clapperboard, Sparkles, Clock, Copy, Check, Download, 
    Upload, Play, ExternalLink, RefreshCw, ChevronRight, Layers, Eye,
    Maximize2, Volume2, Mic, ArrowLeft, Wand2, Camera, Palette, User, 
    Sliders, Image as ImageIcon, AlertCircle, Info, Edit3, Save, X
} from 'lucide-react';
import { VideoAdStoryboard, VideoScene, UploadedImage } from '../types';
import { generateVideoAdStoryboard, renderStoryboardToCanvas } from '../services/videoStoryboardService';

interface VideoAdStoryboardStudioProps {
    availableImages: UploadedImage[];
    activeImageBase64?: string;
    activeImageMimeType?: string;
    activeImageName?: string;
    onBackToArchitect: () => void;
    onApplyPrompt?: (prompt: string) => void;
    onCreateVisual?: (prompt: string) => Promise<void>;
}

// Preset demonstrativo inicial baseado exatamente na imagem de referência da Manteiga Damare
const DAMARE_SAMPLE_IMAGE_URL = "/assets/aistudio/IMG-20261104-WA0178_b0e20eeb.jpg";

const DEFAULT_STORYBOARD: VideoAdStoryboard = {
    productName: "Manteiga Damare",
    productCategory: "Laticínios / Manteiga de Primeira Qualidade com Sal 500g",
    brandName: "Damare",
    targetDurationSeconds: 30,
    scenesCount: 6,
    adStyle: "ugc_authentic",
    creatorType: "female_creator",
    platformTarget: "google_flow",
    callToAction: "Sabor, cremosidade e qualidade em todas as suas receitas!",
    slogan: "Manteiga Damare - A escolha perfeita na cozinha",
    musicAndSoundDesign: "Trilha acústica suave e aconchegante, som realista de frigideira chiando e mordida crocante de pão quente",
    scenes: [
        {
            sceneNumber: 1,
            badgeTitle: "1 Apresentação – UGC",
            timecodeStart: 0,
            timecodeEnd: 5,
            duration: 5,
            scenePhase: "hook",
            screenTextOverlay: "Minha escolha na cozinha!",
            audioCues: "Voz calorosa e amigável da criadora com violão acústico de fundo",
            actionDescription: "Criadora de conteúdo amigável sorri e apresenta o pote de Manteiga Damare 500g em primeiro plano na cozinha acolhedora.",
            cameraMovement: "Slow push-in, eye-level handheld camera, warm natural window light",
            lightingAndAtmosphere: "Luz natural suave de manhã, cozinha moderna acolhedora",
            voiceoverScript: "Hoje vou te mostrar por que a Manteiga Damare é a minha escolha na cozinha!",
            googleFlowPrompt: "Photorealistic 4K video shot on 35mm lens, friendly charismatic Brazilian woman wearing a navy kitchen apron holding a yellow and blue butter tub up to the camera with both hands, genuine warm smile, talking directly to viewer, soft morning sunlight through sheer kitchen curtains, realistic micro-movements, continuous cinematic motion.",
            videoPrompt: "A friendly smiling Brazilian woman in warm kitchen holding up a yellow and blue tub of premium butter towards camera, talking enthusiastically, natural morning kitchen lighting, realistic handheld phone camera motion, 4k ultra-realistic --camera slow zoom in",
            keyframeImagePrompt: "Commercial UGC video frame, young friendly brunette woman holding yellow and blue tub of butter in kitchen, smiling warmly, shallow depth of field, 85mm lens, photorealistic, 8k --ar 16:9"
        },
        {
            sceneNumber: 2,
            badgeTitle: "2 Abrindo o produto",
            timecodeStart: 5,
            timecodeEnd: 10,
            duration: 5,
            scenePhase: "unboxing",
            screenTextOverlay: "Olha a cremosidade!",
            audioCues: "Pop suave ao deslacrar o pote e som sutil de textura cremosa",
            actionDescription: "Close-up nas mãos da criadora retirando a tampa branca do pote de Manteiga Damare, revelando a textura amarela cremosa e aveludada.",
            cameraMovement: "High-angle 45-degree macro close-up, smooth tracking motion",
            lightingAndAtmosphere: "Luz de estúdio com destaque especular na textura aveludada da manteiga",
            voiceoverScript: "Olha a cremosidade! Textura perfeita e aquele aroma delicioso de manteiga.",
            googleFlowPrompt: "High-angle macro video, steady 50mm lens, manicured hands gently prying open the white snap lid of a bright yellow butter tub resting on a rustic rattan coaster, revealing pristine whipped golden yellow butter with an exquisite natural spiral swirl, crisp tactile focus, realistic studio lighting reflections.",
            videoPrompt: "Close-up shot of hands lifting the white lid of a yellow butter tub placed on woven coaster, revealing ultra-creamy fresh golden butter surface with soft swirl, steam-free, studio commercial lighting, smooth tilt motion --camera tilt down",
            keyframeImagePrompt: "Macro commercial photograph of hands lifting lid from yellow and blue tub showing rich creamy golden butter with appetizing smooth swirls, woven placemat, 8k resolution --ar 16:9"
        },
        {
            sceneNumber: 3,
            badgeTitle: "3 Preparando a receita",
            timecodeStart: 10,
            timecodeEnd: 15,
            duration: 5,
            scenePhase: "action",
            screenTextOverlay: "Derrete perfeito!",
            audioCues: "Chiado crocante e apetitoso da manteiga derretendo na frigideira quente",
            actionDescription: "Frigideira antiaderente preta no fogão com colherada de manteiga derretendo dourada e borbulhante com brilho irresistível.",
            cameraMovement: "Slight orbiting motion around sizzling pan, appetizing steam rising",
            lightingAndAtmosphere: "Iluminação quente de fogão culinário com reflexos dourados da manteiga borbulhando",
            voiceoverScript: "Eu uso a Manteiga Damare para dar mais sabor em diversas receitas.",
            googleFlowPrompt: "Slow-motion 60fps culinary commercial video, top-angle shot of a sleek black non-stick skillet over gas flame, a stainless spoon dropping a generous silky yellow dollop of rich butter that instantly glides, bubbles, and froths into clear liquid gold, gentle aromatic steam wisps, cinematic shallow focus.",
            videoPrompt: "Top-down angled shot of a metal spoon dropping a generous dollop of golden butter into a hot black skillet on stove, butter melting and sizzling gently into clear bubbling liquid, butter tub visible in blurred background, cinematic cooking commercial --camera slow push in",
            keyframeImagePrompt: "Cinematic culinary photography, spoon dropping rich golden butter into hot black skillet with appetizing bubbling melted butter, blurred butter tub in background, high dynamic range --ar 16:9"
        },
        {
            sceneNumber: 4,
            badgeTitle: "4 Em ação – no café da manhã",
            timecodeStart: 15,
            timecodeEnd: 20,
            duration: 5,
            scenePhase: "application",
            screenTextOverlay: "Pão quentinho crocante",
            audioCues: "Croc croc gostoso de pão tostado e faca deslizando na manteiga aveludada",
            actionDescription: "Mão segurando uma fatia grossa de pão artesanal tostado dourado enquanto uma faca espalha a manteiga cremosa derretendo no calor.",
            cameraMovement: "Extreme macro close-up, slow tracking along the knife stroke",
            lightingAndAtmosphere: "Luz matinal dourada lateral destacando a textura crocante do pão e o brilho cremoso",
            voiceoverScript: "No café da manhã, ela deixa o pão quentinho muito mais gostoso!",
            googleFlowPrompt: "Extreme macro 4K food shot, butter knife smoothly gliding across a golden toasted thick artisan sourdough slice, spreading a generous layer of luscious butter that gently melts into the steaming bread crevices, golden hour morning sunbeams, hyper-realistic food physics.",
            videoPrompt: "Macro close-up shot of a stainless steel knife smoothly spreading rich creamy butter across a warm slice of rustic toasted artisan bread, butter melting into bread crust pores, crisp appetizing sound, warm breakfast sunlight --camera tracking right",
            keyframeImagePrompt: "Appetite appeal commercial photo, knife spreading butter on hot toasted sourdough bread slice, melting golden butter, warm morning lighting, rustic kitchen table --ar 16:9"
        },
        {
            sceneNumber: 5,
            badgeTitle: "5 Resultado – momento de degustação",
            timecodeStart: 20,
            timecodeEnd: 25,
            duration: 5,
            scenePhase: "result",
            screenTextOverlay: "Sabor incomparável!",
            audioCues: "Mordida crocante audível, suspiro de aprovação e riso suave satisfeito",
            actionDescription: "A criadora dá uma mordida no pão amanteigado, fecha os olhos com expressão autêntica de prazer gastronômico e sorri satisfeita.",
            cameraMovement: "Medium close-up portrait, gentle handheld float, catching natural facial expressions",
            lightingAndAtmosphere: "Iluminação aconchegante de cozinha com catchlights nos olhos da modelo",
            voiceoverScript: "Sabor incrível, na medida certa, com a qualidade que eu confio.",
            googleFlowPrompt: "Medium close-up video, smiling woman taking a crunchy bite of the buttered warm toast, eyes closing in blissful gastronomic delight, subtle nod of satisfaction, natural radiant expression, soft warm rim light outlining her hair, premium TV commercial aesthetic.",
            videoPrompt: "Medium close-up of a happy woman taking a bite of toasted bread with butter, closing eyes in genuine culinary enjoyment, smiling with satisfaction, realistic facial micro-expressions, handheld natural vlog framing --camera slow zoom in",
            keyframeImagePrompt: "UGC portrait, attractive woman tasting toasted bread with butter, eyes closed in delight, genuine smile of satisfaction, warm kitchen ambiance, professional commercial photography --ar 16:9"
        },
        {
            sceneNumber: 6,
            badgeTitle: "6 Fechamento – recomendação",
            timecodeStart: 25,
            timecodeEnd: 30,
            duration: 5,
            scenePhase: "cta",
            screenTextOverlay: "Experimente Damare!",
            audioCues: "Assinatura sonora com nota final cristalina e chamada à ação confiante",
            actionDescription: "Packshot comercial impecável do pote de Manteiga Damare 500g sobre tábua rústica de madeira, fatias de pão e ramequim com flor de manteiga.",
            cameraMovement: "Low-angle hero shot, slow elegant pull-back with subtle turntable rotation",
            lightingAndAtmosphere: "Iluminação de estúdio comercial publicitário com três pontos de luz e reflexos controlados",
            voiceoverScript: "Manteiga Damare: Sabor, cremosidade e qualidade em todas as suas receitas!",
            googleFlowPrompt: "Hero packshot commercial video, 85mm prime lens, slow cinematic pedestal up and pull back, pristine yellow and blue butter tub standing tall on a rustic acacia wood table next to crusty bread slices and a white ceramic ramekin with a sculptured butter curl, warm advertising studio lighting, hyper-sharp details, high-end commercial finale.",
            videoPrompt: "Commercial hero product shot of a 500g tub of butter on a rustic wooden cutting board next to artisan bread slices and a small ceramic bowl of butter swirl, studio lighting with rim light, subtle camera pull-back, advertising text overlay space --camera slow zoom out",
            keyframeImagePrompt: "Luxury commercial hero photography, 500g tub of butter on wooden board with rustic bread slices and ceramic ramekin of butter swirl, warm studio rim light, sharp focus, 8k resolution --ar 16:9"
        }
    ],
    masterStoryboardPrompt: "A high-quality 6-panel commercial video ad storyboard grid, 3 columns by 2 rows, advertising premium butter packaging in an authentic UGC style. Panel 1 top-left: numbered blue pill badge '1 Apresentação – UGC', smiling woman creator in apron holding the butter tub to camera, white speech bubble caption below. Panel 2 top-middle: numbered badge '2 Abrindo o produto', hands opening white lid showing rich creamy golden butter swirl, white speech bubble caption below. Panel 3 top-right: numbered badge '3 Preparando a receita', skillet on stove with spoon melting butter, white speech bubble caption below. Panel 4 bottom-left: numbered badge '4 Em ação – no café da manhã', knife spreading butter on hot toasted sourdough bread slice, white speech bubble caption below. Panel 5 bottom-middle: numbered badge '5 Resultado – momento de degustação', woman closing eyes savoring the bread with genuine delight, white speech bubble caption below. Panel 6 bottom-right: numbered badge '6 Fechamento – recomendação', hero packshot of butter tub with bread slices and butter ramekin on wooden board, yellow brand banner and blue CTA bubble. Clean rounded panels, authentic photography, 8k resolution --ar 3:4 --v 6.1"
};

export const VideoAdStoryboardStudio: React.FC<VideoAdStoryboardStudioProps> = ({
    availableImages,
    activeImageBase64,
    activeImageMimeType,
    activeImageName,
    onBackToArchitect,
    onApplyPrompt,
    onCreateVisual
}) => {
    // Configurações do Anúncio de Vídeo
    const [targetDuration, setTargetDuration] = useState<number>(30); // 10s a 30s
    const [adStyle, setAdStyle] = useState<string>('ugc_authentic');
    const [creatorType, setCreatorType] = useState<string>('female_creator');
    const [platformTarget, setPlatformTarget] = useState<'google_flow' | 'kling' | 'runway' | 'luma' | 'sora'>('google_flow');
    const [productNameInput, setProductNameInput] = useState<string>('');
    const [customDirectives, setCustomDirectives] = useState<string>('');

    // Imagem do Produto Selecionada
    const [selectedProductImageBase64, setSelectedProductImageBase64] = useState<string>(activeImageBase64 || '');
    const [selectedProductMimeType, setSelectedProductMimeType] = useState<string>(activeImageMimeType || 'image/jpeg');
    const [selectedProductPreviewUrl, setSelectedProductPreviewUrl] = useState<string>(
        activeImageBase64 ? `data:${activeImageMimeType || 'image/jpeg'};base64,${activeImageBase64}` : DAMARE_SAMPLE_IMAGE_URL
    );

    // Imagem do Criador / Modelo Opcional
    const [creatorImageBase64, setCreatorImageBase64] = useState<string>('');
    const [creatorMimeType, setCreatorMimeType] = useState<string>('image/jpeg');
    const [creatorPreviewUrl, setCreatorPreviewUrl] = useState<string>('');

    // Dados do Storyboard Atual
    const [storyboard, setStoryboard] = useState<VideoAdStoryboard>(DEFAULT_STORYBOARD);
    const [isGenerating, setIsGenerating] = useState<boolean>(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    // Abas de visualização interna do Studio
    const [activeStudioTab, setActiveStudioTab] = useState<'grid_storyboard' | 'timeline_scenes' | 'master_prompt' | 'full_script'>('grid_storyboard');

    // Imagens individuais de preview para cada painel (se geradas)
    const [panelPreviews, setPanelPreviews] = useState<(string | null)[]>([
        null, null, null, null, null, null
    ]);

    // Imagem gerada da Grade Completa
    const [generatedGridUrl, setGeneratedGridUrl] = useState<string | null>(null);
    const [isGeneratingGridVisual, setIsGeneratingGridVisual] = useState<boolean>(false);

    // Edição rápida de texto de cena
    const [editingSceneIndex, setEditingSceneIndex] = useState<number | null>(null);

    // Estados de cópia para feedback visual
    const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
    const [copiedMaster, setCopiedMaster] = useState<boolean>(false);
    const [copiedScript, setCopiedScript] = useState<boolean>(false);
    const [isDownloadingCanvas, setIsDownloadingCanvas] = useState<boolean>(false);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const creatorFileInputRef = useRef<HTMLInputElement>(null);

    // Sincroniza se a imagem ativa global mudar e ainda não houver imagem local definida
    useEffect(() => {
        if (activeImageBase64 && !selectedProductImageBase64) {
            setSelectedProductImageBase64(activeImageBase64);
            setSelectedProductMimeType(activeImageMimeType || 'image/jpeg');
            setSelectedProductPreviewUrl(`data:${activeImageMimeType || 'image/jpeg'};base64,${activeImageBase64}`);
        }
    }, [activeImageBase64, activeImageMimeType]);

    // Manipula upload de nova imagem de produto
    const handleProductFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onloadend = () => {
            const dataUrl = reader.result as string;
            const base64 = dataUrl.split(',')[1];
            setSelectedProductImageBase64(base64);
            setSelectedProductMimeType(file.type || 'image/jpeg');
            setSelectedProductPreviewUrl(dataUrl);
            if (!productNameInput) {
                const autoName = file.name.replace(/\.[^/.]+$/, "").replace(/[_-]/g, " ");
                setProductNameInput(autoName);
            }
        };
        reader.readAsDataURL(file);
    };

    // Manipula upload de imagem do criador/apresentador
    const handleCreatorFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onloadend = () => {
            const dataUrl = reader.result as string;
            const base64 = dataUrl.split(',')[1];
            setCreatorImageBase64(base64);
            setCreatorMimeType(file.type || 'image/jpeg');
            setCreatorPreviewUrl(dataUrl);
        };
        reader.readAsDataURL(file);
    };

    // Aplica o exemplo de referência clássico da Manteiga Damare
    const handleApplyDamareSample = async () => {
        setProductNameInput("Manteiga Damare");
        setSelectedProductPreviewUrl(DAMARE_SAMPLE_IMAGE_URL);
        setTargetDuration(30);
        setAdStyle('ugc_authentic');
        setCreatorType('female_creator');
        setStoryboard(DEFAULT_STORYBOARD);
    };

    // Dispara a geração inteligente com IA no backend
    const handleGenerateStoryboard = async () => {
        setIsGenerating(true);
        setErrorMessage(null);

        try {
            let imgBase64 = selectedProductImageBase64;
            let mime = selectedProductMimeType || 'image/jpeg';

            // Se não houver base64 direto, tenta extrair da URL de preview ou do sample
            if (!imgBase64 && selectedProductPreviewUrl) {
                if (selectedProductPreviewUrl.startsWith('data:')) {
                    imgBase64 = selectedProductPreviewUrl.split(',')[1];
                } else {
                    try {
                        const imgRes = await fetch(selectedProductPreviewUrl);
                        if (imgRes.ok) {
                            const blob = await imgRes.blob();
                            mime = blob.type || mime;
                            imgBase64 = await new Promise<string>((resolve) => {
                                const reader = new FileReader();
                                reader.onloadend = () => {
                                    const resStr = (reader.result as string) || '';
                                    resolve(resStr.includes(',') ? resStr.split(',')[1] : resStr);
                                };
                                reader.readAsDataURL(blob);
                            });
                            if (imgBase64) {
                                setSelectedProductImageBase64(imgBase64);
                                setSelectedProductMimeType(mime);
                            }
                        }
                    } catch (fetchErr) {
                        console.warn("Não foi possível pré-carregar base64 da imagem, enviando sem base64 (backend usará fallback local):", fetchErr);
                    }
                }
            }

            const result = await generateVideoAdStoryboard({
                imageBase64: imgBase64 || undefined,
                mimeType: mime || undefined,
                creatorImageBase64: creatorImageBase64 || undefined,
                creatorMimeType: creatorMimeType || undefined,
                targetDuration: targetDuration,
                adStyle,
                creatorType,
                productName: productNameInput || undefined,
                platformTarget,
                customDirectives: customDirectives || undefined
            });

            setStoryboard(result);
        } catch (err: any) {
            console.error("Falha ao gerar storyboard com IA:", err);
            setErrorMessage(err.message || "Erro ao conectar com o motor de roteirização. Usando layout recomendado.");
        } finally {
            setIsGenerating(false);
        }
    };

    // Renderiza a folha de storyboard completa no canvas e baixa como imagem PNG
    const handleDownloadStoryboardImage = async () => {
        setIsDownloadingCanvas(true);
        try {
            const dataUrl = await renderStoryboardToCanvas(
                storyboard,
                panelPreviews,
                selectedProductPreviewUrl
            );

            const a = document.createElement('a');
            a.href = dataUrl;
            a.download = `storyboard-${storyboard.productName.toLowerCase().replace(/\s+/g, '-')}-${storyboard.targetDurationSeconds}s.png`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        } catch (err: any) {
            console.error("Erro ao gerar imagem no canvas:", err);
            alert("Não foi possível gerar a imagem: " + (err.message || err));
        } finally {
            setIsDownloadingCanvas(false);
        }
    };

    // Copia um texto para a área de transferência
    const copyToClipboard = (text: string, type: 'scene' | 'master' | 'script', index?: number) => {
        navigator.clipboard.writeText(text);
        if (type === 'scene' && typeof index === 'number') {
            setCopiedIndex(index);
            setTimeout(() => setCopiedIndex(null), 2000);
        } else if (type === 'master') {
            setCopiedMaster(true);
            setTimeout(() => setCopiedMaster(false), 2000);
        } else if (type === 'script') {
            setCopiedScript(true);
            setTimeout(() => setCopiedScript(false), 2000);
        }
    };

    // Gera imagem da grade completa via IA
    const handleGenerateGridVisual = async () => {
        if (!storyboard.masterStoryboardPrompt) return;
        setIsGeneratingGridVisual(true);
        try {
            const res = await fetch('/api/gemini/generate-image', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    prompt: storyboard.masterStoryboardPrompt,
                    aspectRatio: '3:4',
                    imageSize: '2K'
                })
            });
            const data = await res.json();
            if (data.imageUrl) {
                setGeneratedGridUrl(data.imageUrl);
            }
        } catch (err: any) {
            console.error("Erro ao gerar visual da grade com IA:", err);
        } finally {
            setIsGeneratingGridVisual(false);
        }
    };

    // Atualiza texto de uma cena durante a edição manual
    const handleSaveSceneEdit = (index: number, newTitle: string, newScript: string, newAction: string) => {
        setStoryboard(prev => {
            const updated = [...prev.scenes];
            if (updated[index]) {
                updated[index] = {
                    ...updated[index],
                    badgeTitle: newTitle,
                    voiceoverScript: newScript,
                    actionDescription: newAction
                };
            }
            return { ...prev, scenes: updated };
        });
        setEditingSceneIndex(null);
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-300 pb-16">
            {/* Header com Navegação e Título */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xl backdrop-blur-md">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={onBackToArchitect}
                            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all cursor-pointer flex items-center justify-center min-w-[38px] min-h-[38px]"
                            title="Voltar ao Arquiteto de Prompt"
                        >
                            <ArrowLeft size={18} />
                        </button>
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="p-1.5 rounded-lg bg-gradient-to-br from-indigo-500 to-pink-500 text-white shadow-md shadow-pink-500/20">
                                    <Clapperboard size={18} />
                                </span>
                                <h2 className="text-lg sm:text-xl font-black text-white tracking-tight">
                                    Estúdio de Vídeo Comercial & Storyboard UGC
                                </h2>
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-pink-500/20 text-pink-300 border border-pink-500/30">
                                    10s – 30s
                                </span>
                            </div>
                            <p className="text-xs text-slate-400 mt-1">
                                Crie cenas de vídeo com duração personalizada (10s a 30s), prompts para Kling / Runway / Sora e o <strong className="text-amber-300">Prompt Master da Grade 6 Painéis</strong> (conforme imagem de referência).
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                        <button
                            type="button"
                            onClick={handleApplyDamareSample}
                            className="px-3 py-1.5 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-200 hover:bg-amber-500/30 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                            title="Carregar exemplo idêntico à imagem de referência da Manteiga Damare"
                        >
                            <span>⭐</span>
                            <span>Exemplo Manteiga Damare</span>
                        </button>

                        <button
                            type="button"
                            onClick={handleDownloadStoryboardImage}
                            disabled={isDownloadingCanvas}
                            className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-500/20 transition-all cursor-pointer disabled:opacity-50"
                            title="Baixar a imagem da folha de storyboard com todos os quadros e balões de fala"
                        >
                            {isDownloadingCanvas ? <RefreshCw size={14} className="animate-spin" /> : <Download size={14} />}
                            <span>Baixar Imagem Storyboard</span>
                        </button>
                    </div>
                </div>

                {/* PAINEL DE CONTROLE DE CRIAÇÃO: Duração, Imagem de Referência, Estilo e Criador */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mt-5">
                    {/* Seletor de Duração (10s a 30s) - DESTAQUE PRINCIPAL */}
                    <div className="lg:col-span-4 bg-slate-950/70 p-4 rounded-xl border border-slate-800 space-y-3">
                        <div className="flex items-center justify-between">
                            <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                                <Clock size={15} className="text-pink-400" />
                                <span>Duração do Vídeo</span>
                            </label>
                            <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-pink-500/20 text-pink-300 border border-pink-500/40">
                                {targetDuration} segundos
                            </span>
                        </div>

                        {/* Slider com escala visual */}
                        <div className="space-y-1.5">
                            <input 
                                type="range" 
                                min="10" 
                                max="30" 
                                step="1"
                                value={targetDuration}
                                onChange={(e) => setTargetDuration(parseInt(e.target.value))}
                                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-pink-500"
                            />
                            <div className="flex justify-between text-[10px] text-slate-500 font-mono font-bold">
                                <span>10s (Mínimo)</span>
                                <span>15s</span>
                                <span>20s</span>
                                <span>25s</span>
                                <span>30s (Máximo)</span>
                            </div>
                        </div>

                        {/* Atalhos Rápidos de Duração de Plataforma */}
                        <div className="grid grid-cols-5 gap-1 pt-1">
                            {[10, 15, 20, 25, 30].map(sec => (
                                <button
                                    key={sec}
                                    type="button"
                                    onClick={() => setTargetDuration(sec)}
                                    className={`py-1 rounded text-[10px] font-bold transition-all cursor-pointer border ${
                                        targetDuration === sec
                                            ? 'bg-pink-600 text-white border-pink-400 shadow-sm'
                                            : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                                    }`}
                                >
                                    {sec}s
                                </button>
                            ))}
                        </div>

                        <div className="text-[10px] text-slate-400 bg-slate-900/80 p-2 rounded-lg border border-slate-800/80 leading-relaxed">
                            💡 <strong className="text-pink-300">Estrutura Sugerida:</strong> {
                                targetDuration <= 12 ? '3 Cenas (Gancho rápido 3s + Ação de produto 4s + CTA 3s)' :
                                targetDuration <= 17 ? '4 Cenas (Gancho 3s + Unboxing 4s + Ação 5s + Fechamento 3s)' :
                                targetDuration <= 22 ? '5 Cenas (Apresentação 4s + Unboxing 4s + Culinária 5s + Degustação 4s + CTA 3s)' :
                                '6 Cenas Completas (Apresentação UGC + Unboxing textura + Culinária + Pão quentinho + Degustação + Hero Packshot)'
                            }
                        </div>
                    </div>

                    {/* Imagem de Referência do Produto */}
                    <div className="lg:col-span-4 bg-slate-950/70 p-4 rounded-xl border border-slate-800 space-y-3">
                        <div className="flex items-center justify-between">
                            <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                                <ImageIcon size={15} className="text-amber-400" />
                                <span>Foto de Referência do Produto</span>
                            </label>
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="text-[10px] font-bold text-amber-400 hover:text-amber-300 underline cursor-pointer"
                            >
                                Trocar Foto
                            </button>
                            <input 
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleProductFileUpload}
                                className="hidden"
                            />
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden border border-slate-700 bg-slate-900 shrink-0 relative group">
                                {selectedProductPreviewUrl ? (
                                    <img 
                                        src={selectedProductPreviewUrl} 
                                        alt="Produto" 
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 text-[10px] p-1 text-center">
                                        <Upload size={16} className="mb-1" />
                                        <span>Sem foto</span>
                                    </div>
                                )}
                            </div>

                            <div className="space-y-1.5 flex-1 min-w-0">
                                <input
                                    type="text"
                                    placeholder="Nome do Produto (Ex: Manteiga Damare)"
                                    value={productNameInput}
                                    onChange={(e) => setProductNameInput(e.target.value)}
                                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-slate-500 font-bold outline-none focus:border-amber-400"
                                />

                                <div className="flex items-center gap-1.5 flex-wrap">
                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        className="text-[10px] font-bold px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700 cursor-pointer"
                                    >
                                        Upload Novo
                                    </button>
                                    {availableImages.length > 0 && (
                                        <select
                                            onChange={(e) => {
                                                const img = availableImages.find(i => i.id === e.target.value);
                                                if (img) {
                                                    setSelectedProductImageBase64(img.base64Data || '');
                                                    setSelectedProductMimeType(img.mimeType || 'image/jpeg');
                                                    setSelectedProductPreviewUrl(img.previewUrl || (img.base64Data ? `data:${img.mimeType};base64,${img.base64Data}` : ''));
                                                    if (!productNameInput) setProductNameInput(img.name.replace(/\.[^/.]+$/, ""));
                                                }
                                            }}
                                            className="text-[10px] bg-slate-900 border border-slate-700 text-slate-300 rounded px-1.5 py-1 outline-none cursor-pointer max-w-[130px]"
                                            defaultValue=""
                                        >
                                            <option value="" disabled>Escolher do App</option>
                                            {availableImages.map(img => (
                                                <option key={img.id} value={img.id}>{img.name}</option>
                                            ))}
                                        </select>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Foto Opcional do Criador / Apresentador */}
                        <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                            <span className="text-slate-400 flex items-center gap-1">
                                <User size={12} className="text-blue-400" />
                                Foto do Criador (Opcional):
                            </span>
                            <button
                                type="button"
                                onClick={() => creatorFileInputRef.current?.click()}
                                className="text-[10px] font-bold text-blue-400 hover:text-blue-300 underline cursor-pointer"
                            >
                                {creatorPreviewUrl ? "Alterar Criador" : "+ Adicionar Criador"}
                            </button>
                            <input 
                                ref={creatorFileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleCreatorFileUpload}
                                className="hidden"
                            />
                        </div>
                    </div>

                    {/* Estilo e Tipo de Criador */}
                    <div className="lg:col-span-4 bg-slate-950/70 p-4 rounded-xl border border-slate-800 space-y-3">
                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                                    Estilo do Anúncio
                                </label>
                                <select
                                    value={adStyle}
                                    onChange={(e) => setAdStyle(e.target.value)}
                                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-white font-bold outline-none cursor-pointer focus:border-pink-500"
                                >
                                    <option value="ugc_authentic">UGC Criador Autêntico (Recomendado)</option>
                                    <option value="cinematic_commercial">Comercial Cinematográfico</option>
                                    <option value="recipe_cooking">Receita & Preparo na Cozinha</option>
                                    <option value="unboxing_demo">Unboxing & Sensorial</option>
                                    <option value="lifestyle_routine">Rotina & Café da Manhã</option>
                                </select>
                            </div>

                            <div>
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                                    Apresentador / Modelo
                                </label>
                                <select
                                    value={creatorType}
                                    onChange={(e) => setCreatorType(e.target.value)}
                                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-white font-bold outline-none cursor-pointer focus:border-pink-500"
                                >
                                    <option value="female_creator">Mulher Criadora (Como na referência)</option>
                                    <option value="male_creator">Homem Criador</option>
                                    <option value="hands_only">Apenas Mãos & POV</option>
                                    <option value="product_only">Apenas o Produto (Sem pessoas)</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-1.5">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                                    <span>Plataforma de Vídeo IA Alvo</span>
                                    <span className="bg-blue-500/20 text-blue-300 text-[9px] px-1.5 py-0.5 rounded-full font-mono border border-blue-500/30">Google Flow Incluso</span>
                                </label>
                                <a
                                    href="https://aitestkitchen.withgoogle.com/tools/video-fx"
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-[9.5px] font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 hover:underline"
                                    title="Abrir o gerador de vídeos do Google (Google VideoFX / Veo 2 / Flow)"
                                >
                                    <span>Abrir Google Flow (VideoFX)</span>
                                    <ExternalLink size={10} />
                                </a>
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
                                {[
                                    { id: 'google_flow', label: 'Google Flow', sub: 'Veo 2 / VideoFX', isFeatured: true },
                                    { id: 'kling', label: 'Kling 1.6', sub: 'Camera Control' },
                                    { id: 'runway', label: 'Runway', sub: 'Gen-3 Alpha' },
                                    { id: 'luma', label: 'Luma', sub: 'Dream Machine' },
                                    { id: 'sora', label: 'OpenAI', sub: 'Sora Video' },
                                ].map((plat) => (
                                    <button
                                        key={plat.id}
                                        type="button"
                                        onClick={() => setPlatformTarget(plat.id as any)}
                                        className={`py-1.5 px-2 rounded-lg text-[10px] font-bold text-center transition-all border cursor-pointer flex flex-col items-center justify-center relative ${
                                            platformTarget === plat.id
                                                ? plat.isFeatured
                                                    ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 border-blue-400 text-white shadow-md shadow-blue-500/30 ring-1 ring-blue-300'
                                                    : 'bg-blue-600 border-blue-400 text-white shadow-sm'
                                                : plat.isFeatured
                                                    ? 'bg-blue-950/40 border-blue-800/60 text-blue-300 hover:bg-blue-900/50'
                                                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                                        }`}
                                    >
                                        <div className="flex items-center gap-1">
                                            {plat.isFeatured && <Sparkles size={11} className="text-amber-400" />}
                                            <span>{plat.label}</span>
                                        </div>
                                        <span className="text-[8.5px] opacity-80 font-normal">{plat.sub}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Botão de Geração com IA */}
                        <button
                            type="button"
                            onClick={handleGenerateStoryboard}
                            disabled={isGenerating}
                            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-pink-600 via-rose-600 to-amber-600 hover:from-pink-500 hover:to-amber-500 text-white font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-pink-500/25 transition-all cursor-pointer active:scale-95 disabled:opacity-50"
                        >
                            {isGenerating ? (
                                <>
                                    <RefreshCw size={15} className="animate-spin" />
                                    <span>Roteirizando Cenas com IA ({targetDuration}s)...</span>
                                </>
                            ) : (
                                <>
                                    <Wand2 size={15} />
                                    <span>Gerar Roteiro, Cenas & Storyboard com IA</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {errorMessage && (
                    <div className="mt-3 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                            <AlertCircle size={15} className="text-amber-400 shrink-0" />
                            <span>{errorMessage}</span>
                        </div>
                        <button onClick={() => setErrorMessage(null)} className="text-amber-400 hover:text-white p-1">
                            <X size={14} />
                        </button>
                    </div>
                )}
            </div>

            {/* SELETOR DE MODOS DE VISUALIZAÇÃO DO STORYBOARD */}
            <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto custom-scrollbar">
                <button
                    type="button"
                    onClick={() => setActiveStudioTab('grid_storyboard')}
                    className={`py-2 px-4 rounded-xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                        activeStudioTab === 'grid_storyboard'
                            ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25 ring-1 ring-blue-400'
                            : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                    }`}
                >
                    <Layers size={15} />
                    <span>Grade Storyboard Visual (6 Painéis)</span>
                    <span className="text-[9px] bg-blue-500/30 text-blue-200 px-1.5 py-0.2 rounded font-mono">
                        Referência
                    </span>
                </button>

                <button
                    type="button"
                    onClick={() => setActiveStudioTab('timeline_scenes')}
                    className={`py-2 px-4 rounded-xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                        activeStudioTab === 'timeline_scenes'
                            ? 'bg-pink-600 text-white shadow-lg shadow-pink-500/25 ring-1 ring-pink-400'
                            : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                    }`}
                >
                    <Video size={15} />
                    <span>Cenas Individuais para Vídeo IA</span>
                    <span className="text-[9px] bg-pink-500/30 text-pink-200 px-1.5 py-0.2 rounded font-mono">
                        {storyboard.scenes.length} cenas
                    </span>
                </button>

                <button
                    type="button"
                    onClick={() => setActiveStudioTab('master_prompt')}
                    className={`py-2 px-4 rounded-xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                        activeStudioTab === 'master_prompt'
                            ? 'bg-amber-600 text-white shadow-lg shadow-amber-500/25 ring-1 ring-amber-400'
                            : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                    }`}
                >
                    <Sparkles size={15} />
                    <span>Prompt Mestre Fora das Cenas (Midjourney / Flux)</span>
                </button>

                <button
                    type="button"
                    onClick={() => setActiveStudioTab('full_script')}
                    className={`py-2 px-4 rounded-xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                        activeStudioTab === 'full_script'
                            ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/25 ring-1 ring-emerald-400'
                            : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                    }`}
                >
                    <Volume2 size={15} />
                    <span>Roteiro de Locução Completo</span>
                </button>
            </div>

            {/* ABA 1: GRADE STORYBOARD VISUAL (IGUAL À IMAGEM DE REFERÊNCIA ANEXADA) */}
            {activeStudioTab === 'grid_storyboard' && (
                <div className="space-y-4">
                    {/* Barra de Ações Rápidas da Grade */}
                    <div className="bg-slate-900/80 p-3 sm:p-4 rounded-xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-200">
                                📋 Grade de 6 Cenas ({storyboard.targetDurationSeconds}s Total):
                            </span>
                            <span className="text-[11px] text-slate-400">
                                Cada quadro possui badge numerado e balão de fala editável com 1 clique.
                            </span>
                        </div>

                        <div className="flex items-center gap-2 flex-wrap">
                            <button
                                type="button"
                                onClick={() => copyToClipboard(storyboard.masterStoryboardPrompt, 'master')}
                                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center gap-1.5 border border-slate-700 cursor-pointer"
                            >
                                {copiedMaster ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                                <span>{copiedMaster ? "Prompt Copiado!" : "Copiar Prompt da Grade"}</span>
                            </button>

                            <button
                                type="button"
                                onClick={handleGenerateGridVisual}
                                disabled={isGeneratingGridVisual}
                                className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-blue-500/20 cursor-pointer disabled:opacity-50"
                            >
                                {isGeneratingGridVisual ? <RefreshCw size={14} className="animate-spin" /> : <Wand2 size={14} />}
                                <span>Gerar Imagem com IA</span>
                            </button>

                            <button
                                type="button"
                                onClick={handleDownloadStoryboardImage}
                                disabled={isDownloadingCanvas}
                                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-500/20 cursor-pointer disabled:opacity-50"
                            >
                                {isDownloadingCanvas ? <RefreshCw size={14} className="animate-spin" /> : <Download size={14} />}
                                <span>Baixar PNG da Grade</span>
                            </button>
                        </div>
                    </div>

                    {/* Exibição da Imagem da Grade se gerada com IA */}
                    {generatedGridUrl && (
                        <div className="bg-slate-900 p-4 rounded-2xl border border-blue-500/40 space-y-2">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-blue-300 flex items-center gap-1.5">
                                    <Sparkles size={14} /> Imagem do Storyboard Gerada com IA (3:4 High-Resolution):
                                </span>
                                <a 
                                    href={generatedGridUrl} 
                                    download="storyboard-ia-grade.png" 
                                    className="text-xs font-bold text-emerald-400 hover:underline flex items-center gap-1"
                                >
                                    <Download size={13} /> Baixar Imagem Gerada
                                </a>
                            </div>
                            <div className="max-w-2xl mx-auto rounded-xl overflow-hidden border border-slate-700 shadow-2xl bg-black">
                                <img src={generatedGridUrl} alt="Grade Storyboard IA" className="w-full h-auto object-contain" />
                            </div>
                        </div>
                    )}

                    {/* A GRADE INTERATIVA DE 6 PAINÉIS (REPLICANDO O LAYOUT EXATO DA IMAGEM) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                        {storyboard.scenes.slice(0, 6).map((scene, idx) => {
                            const isEditing = editingSceneIndex === idx;

                            return (
                                <div 
                                    key={scene.sceneNumber || idx}
                                    className="bg-slate-900/90 rounded-2xl border border-slate-800 overflow-hidden shadow-xl flex flex-col group hover:border-slate-700 transition-all relative"
                                >
                                    {/* Imagem de Fundo / Simulação Visual */}
                                    <div className="relative aspect-[4/5] bg-slate-950 flex flex-col justify-between p-3.5 overflow-hidden">
                                        {/* Foto ou Textura do Quadro */}
                                        {panelPreviews[idx] ? (
                                            <img 
                                                src={panelPreviews[idx]!} 
                                                alt={`Cena ${idx + 1}`} 
                                                className="absolute inset-0 w-full h-full object-cover"
                                            />
                                        ) : selectedProductPreviewUrl && (idx === 1 || idx === 5) ? (
                                            <img 
                                                src={selectedProductPreviewUrl} 
                                                alt={`Produto Cena ${idx + 1}`} 
                                                className="absolute inset-0 w-full h-full object-cover filter brightness-95"
                                            />
                                        ) : (
                                            <div className="absolute inset-0 bg-gradient-to-b from-slate-900/80 via-slate-950/90 to-slate-950 flex items-center justify-center p-6 text-center">
                                                <div className="space-y-2">
                                                    <span className="text-3xl">
                                                        {idx === 0 ? "👩‍🍳" : idx === 1 ? "✨" : idx === 2 ? "🍳" : idx === 3 ? "🍞" : idx === 4 ? "😋" : "⭐"}
                                                    </span>
                                                    <p className="text-xs text-slate-300 font-bold leading-relaxed line-clamp-3">
                                                        {scene.actionDescription}
                                                    </p>
                                                    <span className="text-[10px] text-pink-400 font-mono block">
                                                        Câmera: {scene.cameraMovement}
                                                    </span>
                                                </div>
                                            </div>
                                        )}

                                        {/* Gradiente escuro no rodapé para destacar balão de fala */}
                                        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black/80 via-black/40 to-transparent pointer-events-none" />

                                        {/* 1. BADGE NUMERADO AZUL ESCURO NO TOPO ESQUERDO (IGUAL À REFERÊNCIA) */}
                                        <div className="relative z-10 flex items-center justify-between w-full">
                                            <div className="flex items-center gap-1.5 bg-[#0f3a63] text-white px-3 py-1.5 rounded-full shadow-lg border border-blue-400/30">
                                                <span className="w-5 h-5 rounded-full bg-white text-[#0f3a63] font-black text-xs flex items-center justify-center shrink-0">
                                                    {scene.sceneNumber || idx + 1}
                                                </span>
                                                <span className="text-xs font-black tracking-tight">
                                                    {scene.badgeTitle.replace(/^[0-9]+\s*/, '')}
                                                </span>
                                            </div>

                                            <span className="bg-black/60 backdrop-blur-md text-amber-300 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold border border-amber-500/30">
                                                {scene.timecodeStart}s - {scene.timecodeEnd}s ({scene.duration}s)
                                            </span>
                                        </div>

                                        {/* 2. BALÃO BRANCO DE FALA / LEGENDA NO RODAPÉ (IGUAL À REFERÊNCIA) */}
                                        <div className="relative z-10 w-full mt-auto pt-3">
                                            {isEditing ? (
                                                <div className="bg-white rounded-2xl p-3 shadow-2xl text-slate-900 space-y-2">
                                                    <input
                                                        type="text"
                                                        defaultValue={scene.badgeTitle}
                                                        id={`edit-title-${idx}`}
                                                        className="w-full text-xs font-bold border-b border-slate-300 pb-1 outline-none text-blue-900"
                                                        placeholder="Título do Badge"
                                                    />
                                                    <textarea
                                                        defaultValue={scene.voiceoverScript}
                                                        id={`edit-script-${idx}`}
                                                        rows={3}
                                                        className="w-full text-xs font-medium border border-slate-300 rounded p-1.5 outline-none text-slate-800"
                                                        placeholder="Fala do Criador (Balão)"
                                                    />
                                                    <div className="flex justify-end gap-1.5">
                                                        <button
                                                            type="button"
                                                            onClick={() => setEditingSceneIndex(null)}
                                                            className="px-2 py-1 text-[10px] bg-slate-200 text-slate-700 rounded font-bold"
                                                        >
                                                            Cancelar
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                const newTitle = (document.getElementById(`edit-title-${idx}`) as HTMLInputElement)?.value || scene.badgeTitle;
                                                                const newScript = (document.getElementById(`edit-script-${idx}`) as HTMLTextAreaElement)?.value || scene.voiceoverScript;
                                                                handleSaveSceneEdit(idx, newTitle, newScript, scene.actionDescription);
                                                            }}
                                                            className="px-2 py-1 text-[10px] bg-blue-600 text-white rounded font-bold"
                                                        >
                                                            Salvar
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="bg-white/95 backdrop-blur-md text-slate-900 p-3 sm:p-3.5 rounded-2xl shadow-2xl border border-white/60 relative group-hover:scale-[1.01] transition-all">
                                                    {scene.screenTextOverlay && (
                                                        <div className="mb-1.5 flex justify-center">
                                                            <span className="text-[10px] font-black bg-amber-400 text-slate-950 px-2.5 py-0.5 rounded-full shadow-sm flex items-center gap-1 uppercase tracking-wider">
                                                                💬 {scene.screenTextOverlay}
                                                            </span>
                                                        </div>
                                                    )}
                                                    <p className="text-xs sm:text-[13px] font-bold text-center leading-snug tracking-tight text-slate-900">
                                                        "{scene.voiceoverScript}"
                                                    </p>
                                                    
                                                    {/* Botão de edição rápida */}
                                                    <button
                                                        type="button"
                                                        onClick={() => setEditingSceneIndex(idx)}
                                                        className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-blue-600 transition-all rounded hover:bg-slate-100"
                                                        title="Editar texto da legenda"
                                                    >
                                                        <Edit3 size={12} />
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Botões de Ação da Cena */}
                                    <div className="p-3 bg-slate-950/80 border-t border-slate-800 flex items-center justify-between gap-1.5 flex-wrap">
                                        <div className="text-[10px] text-slate-400 font-medium truncate max-w-[90px]">
                                            Fase: <strong className="text-slate-200 capitalize">{scene.scenePhase}</strong>
                                        </div>

                                        <div className="flex items-center gap-1.5 flex-wrap">
                                            {scene.googleFlowPrompt && (
                                                <button
                                                    type="button"
                                                    onClick={() => copyToClipboard(scene.googleFlowPrompt || scene.videoPrompt, 'scene', idx + 1000)}
                                                    className="px-2 py-1 rounded bg-blue-600/30 hover:bg-blue-600/60 text-blue-200 border border-blue-500/40 text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer"
                                                    title="Copiar prompt para Google Flow / Veo 2 / VideoFX"
                                                >
                                                    {copiedIndex === idx + 1000 ? <Check size={11} className="text-emerald-400" /> : <Sparkles size={11} className="text-amber-400" />}
                                                    <span>Flow / Veo</span>
                                                </button>
                                            )}

                                            <button
                                                type="button"
                                                onClick={() => copyToClipboard(scene.videoPrompt, 'scene', idx)}
                                                className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer"
                                                title="Copiar prompt em inglês para Kling AI ou Runway Gen-3"
                                            >
                                                {copiedIndex === idx ? <Check size={11} className="text-emerald-400" /> : <Copy size={11} />}
                                                <span>Vídeo</span>
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() => {
                                                    if (onApplyPrompt) {
                                                        onApplyPrompt(scene.keyframeImagePrompt);
                                                    }
                                                }}
                                                className="px-2 py-1 rounded bg-pink-600/30 hover:bg-pink-600/50 text-pink-300 text-[10px] font-bold transition-all cursor-pointer border border-pink-500/30"
                                                title="Usar este prompt no Arquiteto Principal"
                                            >
                                                Aplicar
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* ABA 2: CENAS INDIVIDUAIS PARA VÍDEO IA (TIMELINE RUNWAY / KLING / SORA / LUMA) */}
            {activeStudioTab === 'timeline_scenes' && (
                <div className="space-y-4">
                    <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800 flex items-center justify-between">
                        <div className="text-xs text-slate-300">
                            ⏱️ Roteiro estruturado para <strong>{storyboard.targetDurationSeconds} segundos</strong> na plataforma <strong>{platformTarget.toUpperCase()}</strong>.
                        </div>
                        <span className="text-xs text-pink-400 font-mono font-bold">
                            Total: {storyboard.scenes.length} Cenas
                        </span>
                    </div>

                    <div className="space-y-4">
                        {storyboard.scenes.map((scene, idx) => (
                            <div 
                                key={scene.sceneNumber || idx}
                                className="bg-slate-900/80 rounded-2xl border border-slate-800 p-4 sm:p-5 space-y-3.5 hover:border-slate-700 transition-all shadow-lg"
                            >
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
                                    <div className="flex items-center gap-2.5">
                                        <span className="w-7 h-7 rounded-full bg-pink-600 text-white font-black text-xs flex items-center justify-center">
                                            {scene.sceneNumber || idx + 1}
                                        </span>
                                        <div>
                                            <h4 className="text-sm font-black text-white">
                                                {scene.badgeTitle}
                                            </h4>
                                            <span className="text-[10px] text-slate-400 capitalize">
                                                Fase: {scene.scenePhase}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <span className="px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                                            ⏱️ {scene.timecodeStart}s - {scene.timecodeEnd}s ({scene.duration}s)
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() => copyToClipboard(scene.videoPrompt, 'scene', idx)}
                                            className="px-2.5 py-1 rounded-lg bg-pink-600/30 hover:bg-pink-600/50 text-pink-200 border border-pink-500/40 text-xs font-bold flex items-center gap-1 cursor-pointer"
                                        >
                                            {copiedIndex === idx ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                                            <span>Copiar Prompt {platformTarget.toUpperCase()}</span>
                                        </button>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                                    {/* 1. Ação Visual da Cena */}
                                    <div className="space-y-1 bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                                            🎬 Ação Visual da Cena:
                                        </span>
                                        <p className="text-slate-200 leading-relaxed font-medium">
                                            {scene.actionDescription}
                                        </p>
                                        <div className="pt-1.5 text-[10px] text-pink-400 font-semibold">
                                            🎥 <strong>Câmera:</strong> {scene.cameraMovement}
                                        </div>
                                    </div>

                                    {/* 2. Fala / Voiceover */}
                                    <div className="space-y-1 bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                                        <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider flex items-center gap-1">
                                            <Mic size={12} /> Fala do Criador (Voiceover):
                                        </span>
                                        <p className="text-slate-100 font-bold italic leading-relaxed text-xs sm:text-sm">
                                            "{scene.voiceoverScript}"
                                        </p>
                                    </div>

                                    {/* 3. Texto na Tela (Lettering / Caption) */}
                                    <div className="space-y-1 bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                                        <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1">
                                            💬 Texto na Tela (Lettering):
                                        </span>
                                        <p className="text-amber-200 font-black leading-relaxed text-xs">
                                            {scene.screenTextOverlay || "Sem texto em tela"}
                                        </p>
                                        <div className="pt-1 text-[9.5px] text-slate-400">
                                            Legenda animada para Reels, Shorts & TikTok
                                        </div>
                                    </div>

                                    {/* 4. Áudio & Sound Design */}
                                    <div className="space-y-1 bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                                        <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1">
                                            <Volume2 size={12} /> Áudio & Efeitos Sonoros:
                                        </span>
                                        <p className="text-emerald-200 font-medium leading-relaxed text-xs">
                                            {scene.audioCues || "Trilha sonora acústica suave com som ambiente"}
                                        </p>
                                    </div>
                                </div>

                                {/* Prompts de IA para Vídeo */}
                                <div className="space-y-3 pt-1">
                                    {/* PROMPT GOOGLE FLOW / VEO 2 / VIDEOFX (DESTACADO) */}
                                    <div className="bg-gradient-to-r from-blue-950/40 via-indigo-950/30 to-slate-950 p-3.5 rounded-xl border border-blue-500/40 space-y-2">
                                        <div className="flex items-center justify-between text-[11px] flex-wrap gap-2">
                                            <div className="flex items-center gap-1.5 font-bold text-blue-300">
                                                <Sparkles size={13} className="text-amber-400" />
                                                <span>Prompt Google Flow (Veo 2 / Google VideoFX):</span>
                                                <span className="text-[9px] bg-blue-500/20 text-blue-200 px-1.5 py-0.2 rounded font-mono border border-blue-400/30">
                                                    Motor Google
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <a
                                                    href="https://aitestkitchen.withgoogle.com/tools/video-fx"
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="text-[10px] text-blue-300 hover:text-white font-bold flex items-center gap-1 hover:underline"
                                                >
                                                    <ExternalLink size={11} /> Testar no VideoFX
                                                </a>
                                                <button
                                                    type="button"
                                                    onClick={() => copyToClipboard(scene.googleFlowPrompt || scene.videoPrompt, 'scene', idx + 2000)}
                                                    className="px-2 py-0.5 rounded bg-blue-600 hover:bg-blue-500 text-white font-bold text-[10px] flex items-center gap-1 cursor-pointer transition-all shadow-sm"
                                                >
                                                    {copiedIndex === idx + 2000 ? <Check size={11} className="text-emerald-300" /> : <Copy size={11} />}
                                                    <span>{copiedIndex === idx + 2000 ? "Copiado!" : "Copiar Flow"}</span>
                                                </button>
                                            </div>
                                        </div>
                                        <div className="bg-slate-950/90 p-2.5 rounded-lg border border-slate-800 text-xs font-mono text-blue-100 leading-relaxed select-all">
                                            {scene.googleFlowPrompt || scene.videoPrompt}
                                        </div>
                                    </div>

                                    {/* PROMPT PADRÃO MULTI-PLATAFORMA (KLING / RUNWAY / LUMA / SORA) */}
                                    <div className="space-y-1.5">
                                        <div className="flex items-center justify-between text-[10px]">
                                            <span className="font-bold text-slate-400 uppercase tracking-wider">
                                                Prompt Alternativo ({platformTarget.toUpperCase()} / Runway Gen-3 / Kling 1.6 / Sora):
                                            </span>
                                            <button
                                                type="button"
                                                onClick={() => copyToClipboard(scene.videoPrompt, 'scene', idx)}
                                                className="text-pink-400 hover:text-pink-300 font-bold underline cursor-pointer"
                                            >
                                                {copiedIndex === idx ? "Copiado!" : "Copiar"}
                                            </button>
                                        </div>
                                        <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-xs font-mono text-slate-300 leading-relaxed select-all">
                                            {scene.videoPrompt}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* ABA 3: PROMPT MESTRE FORA DAS CENAS (GRADE COMPLETA CONFORME IMAGEM DE REFERÊNCIA) */}
            {activeStudioTab === 'master_prompt' && (
                <div className="bg-slate-900/90 rounded-2xl border border-amber-500/40 p-4 sm:p-6 space-y-4 shadow-xl">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                        <div className="flex items-center gap-2">
                            <span className="p-2 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30">
                                <Sparkles size={18} />
                            </span>
                            <div>
                                <h3 className="text-base font-bold text-white">
                                    Prompt Mestre Fora das Cenas (Grade 6 Painéis Conforme Imagem de Referência)
                                </h3>
                                <p className="text-xs text-slate-400">
                                    Gera uma única imagem fotográfica de alta resolução contendo toda a folha de storyboard com os 6 painéis organizados.
                                </p>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={() => copyToClipboard(storyboard.masterStoryboardPrompt, 'master')}
                            className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-md shadow-amber-500/20 transition-all cursor-pointer"
                        >
                            {copiedMaster ? <Check size={14} /> : <Copy size={14} />}
                            <span>{copiedMaster ? "Prompt Copiado!" : "Copiar Prompt Mestre"}</span>
                        </button>
                    </div>

                    <div className="relative">
                        <textarea
                            value={storyboard.masterStoryboardPrompt}
                            onChange={(e) => setStoryboard(prev => ({ ...prev, masterStoryboardPrompt: e.target.value }))}
                            rows={8}
                            className="w-full bg-slate-950 border border-slate-700 rounded-xl p-4 text-xs font-mono text-slate-200 leading-relaxed outline-none focus:border-amber-400 transition-colors custom-scrollbar"
                        />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                        <button
                            type="button"
                            onClick={handleGenerateGridVisual}
                            disabled={isGeneratingGridVisual}
                            className="p-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg cursor-pointer disabled:opacity-50"
                        >
                            {isGeneratingGridVisual ? <RefreshCw size={15} className="animate-spin" /> : <Wand2 size={15} />}
                            <span>Gerar Imagem da Grade com IA</span>
                        </button>

                        <button
                            type="button"
                            onClick={() => {
                                if (onApplyPrompt) {
                                    onApplyPrompt(storyboard.masterStoryboardPrompt);
                                    onBackToArchitect();
                                }
                            }}
                            className="p-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center justify-center gap-2 border border-slate-700 cursor-pointer"
                        >
                            <Sliders size={15} className="text-amber-400" />
                            <span>Enviar ao Arquiteto de Prompt</span>
                        </button>

                        <a
                            href="https://aitestkitchen.withgoogle.com/tools/image-fx"
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => copyToClipboard(storyboard.masterStoryboardPrompt, 'master')}
                            className="p-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg"
                        >
                            <ExternalLink size={15} />
                            <span>Testar no Google ImageFX (Grátis)</span>
                        </a>
                    </div>

                    <div className="text-[11px] text-slate-400 bg-slate-950/70 p-3.5 rounded-xl border border-slate-800 space-y-1.5 leading-relaxed">
                        <strong className="text-amber-300 block">💡 Dicas para Melhores Resultados no Midjourney v6.1 ou Flux:</strong>
                        <ul className="list-disc list-inside space-y-1 text-slate-300">
                            <li>Use o parâmetro de proporção vertical <code className="text-amber-300 font-mono">--ar 3:4</code> ou quadrado <code className="text-amber-300 font-mono">--ar 1:1</code> para acomodar perfeitamente os 6 painéis organizados.</li>
                            <li>No Midjourney, adicione <code className="text-amber-300 font-mono">--style raw --v 6.1</code> para preservar o realismo fotográfico sem estilização excessiva de CGI.</li>
                            <li>Se quiser alterar o produto na imagem gerada, envie a foto da embalagem como imagem de referência anexada com peso alto (<code className="text-amber-300 font-mono">--iw 2.0</code>).</li>
                        </ul>
                    </div>
                </div>
            )}

            {/* ABA 4: ROTEIRO DE LOCUÇÃO COMPLETO */}
            {activeStudioTab === 'full_script' && (
                <div className="bg-slate-900/90 rounded-2xl border border-emerald-500/30 p-4 sm:p-6 space-y-4 shadow-xl">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                        <div className="flex items-center gap-2">
                            <span className="p-2 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                                <Volume2 size={18} />
                            </span>
                            <div>
                                <h3 className="text-base font-bold text-white">
                                    Roteiro Completo para Gravação do Criador / Locução ({storyboard.targetDurationSeconds}s)
                                </h3>
                                <p className="text-xs text-slate-400">
                                    Texto pronto para gravação em áudio, leitura no teleprompter ou síntese no ElevenLabs / CapCut.
                                </p>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={() => {
                                const fullScriptText = storyboard.scenes.map(s => `[${s.timecodeStart}s - ${s.timecodeEnd}s | ${s.badgeTitle}]\n${s.voiceoverScript}`).join('\n\n') + `\n\n[FECHAMENTO CTA]\n${storyboard.callToAction}`;
                                copyToClipboard(fullScriptText, 'script');
                            }}
                            className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-500/20 cursor-pointer"
                        >
                            {copiedScript ? <Check size={14} /> : <Copy size={14} />}
                            <span>{copiedScript ? "Roteiro Copiado!" : "Copiar Roteiro"}</span>
                        </button>
                    </div>

                    <div className="space-y-3 bg-slate-950 p-4 rounded-xl border border-slate-800">
                        {storyboard.scenes.map((scene, idx) => (
                            <div key={idx} className="flex items-start gap-3 border-b border-slate-800/80 pb-3 last:border-b-0 last:pb-0">
                                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-800 text-slate-300 shrink-0">
                                    {scene.timecodeStart}s - {scene.timecodeEnd}s
                                </span>
                                <div className="space-y-0.5">
                                    <span className="text-[11px] font-bold text-emerald-400 block">
                                        {scene.badgeTitle}
                                    </span>
                                    <p className="text-sm font-medium text-slate-100">
                                        "{scene.voiceoverScript}"
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-2">
                        <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                            🎵 Sugestão de Trilha Sonora & Sound Design:
                        </span>
                        <p className="text-xs text-slate-400 leading-relaxed">
                            {storyboard.musicAndSoundDesign}
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};
