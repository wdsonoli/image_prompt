import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
    Maximize2,
    Sliders,
    Eye,
    Check,
    Download,
    Scissors,
    Sparkles,
    Grid,
    Circle,
    Square,
    Layers,
    FileText,
    FolderArchive,
    CheckCircle2,
    AlertCircle,
    RotateCw,
    User,
    ArrowLeft,
    ArrowRight,
    Palette,
    Info,
    RefreshCw,
    ZoomIn,
    ZoomOut
} from 'lucide-react';
import {
    RasterbatorConfig,
    DEFAULT_RASTERBATOR_CONFIG,
    RasterStyle,
    HalftoneMode,
    DotShape,
    RasterColorMode,
    BackgroundColorMode,
    RASTER_PALETTES,
    calculateRasterbatorLayout,
    renderRasterbatorToCanvas,
    renderRasterSheet,
    generateRasterbatorPdf,
    generateRasterbatorZip,
    RasterCalculationResult,
    RasterSheet
} from '../services/rasterbatorService';
import { PAPER_DIMENSIONS, PaperFormat, PaperOrientation } from '../services/panelSplitterService';
import { downloadBlob, downloadFile } from '../utils/downloadHelper';
import { UploadedImage } from '../types';

interface RasterbatorStudioProps {
    imageUrl: string;
    imageName?: string;
    availableImages?: UploadedImage[];
    onBack?: () => void;
    onSwitchMode?: (mode: 'cortador' | 'splitimage' | 'wall_mockup' | 'criador_poster' | 'painel_festa') => void;
    onOpenUpscale?: (imgUrl: string, name: string) => void;
}

export type RasterbatorStep = 1 | 2 | 3 | 4 | 5 | 6;

export const RasterbatorStudio: React.FC<RasterbatorStudioProps> = ({
    imageUrl,
    imageName = 'rasterbator-poster',
    availableImages = [],
    onBack,
    onSwitchMode,
    onOpenUpscale
}) => {
    // Imagem carregada
    const [loadedImage, setLoadedImage] = useState<HTMLImageElement | null>(null);
    const [currentImageUrl, setCurrentImageUrl] = useState<string>(imageUrl);
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    // Passo atual do Stepper (1: Image, 2: Size, 3: Style, 4: Color, 5: Options, 6: Rasterbate)
    const [currentStep, setCurrentStep] = useState<RasterbatorStep>(2);

    // Configuração do Rasterbator
    const [config, setConfig] = useState<RasterbatorConfig>(DEFAULT_RASTERBATOR_CONFIG);

    // Canvas de renderização
    const previewCanvasRef = useRef<HTMLCanvasElement | null>(null);
    const [isRenderingPreview, setIsRenderingPreview] = useState(false);
    const [previewMode, setPreviewMode] = useState<'halftone' | 'original' | 'sheets' | 'human_scale'>('halftone');
    const [zoom, setZoom] = useState(1);
    const [selectedSheetIndex, setSelectedSheetIndex] = useState<number>(1);

    // Progresso de Download e feedback
    const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
    const [isGeneratingZip, setIsGeneratingZip] = useState(false);
    const [generationProgress, setGenerationProgress] = useState<{ current: number; total: number } | null>(null);
    const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

    const showToast = (text: string, type: 'success' | 'error' | 'info' = 'info') => {
        setToastMessage({ text, type });
        setTimeout(() => setToastMessage(null), 5000);
    };

    // Sincroniza imageUrl se mudar externamente
    useEffect(() => {
        if (imageUrl) {
            setCurrentImageUrl(imageUrl);
        }
    }, [imageUrl]);

    // Carrega a imagem original
    useEffect(() => {
        if (!currentImageUrl) {
            setLoadedImage(null);
            return;
        }
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
            setLoadedImage(img);
        };
        img.onerror = () => {
            console.warn("crossOrigin anonymous falhou no Rasterbator, tentando direto...");
            const directImg = new Image();
            directImg.onload = () => {
                setLoadedImage(directImg);
            };
            directImg.onerror = () => {
                console.error("Erro ao carregar imagem para o Rasterbator");
                setLoadedImage(null);
            };
            directImg.src = currentImageUrl;
        };
        img.src = currentImageUrl;
    }, [currentImageUrl]);

    // Troca de imagem local
    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => {
            if (typeof reader.result === 'string') {
                setCurrentImageUrl(reader.result);
                showToast('Nova imagem carregada para o Rasterbator!', 'success');
            }
        };
        reader.readAsDataURL(file);
    };

    // Cálculo do layout
    const layout: RasterCalculationResult = loadedImage
        ? calculateRasterbatorLayout(loadedImage.naturalWidth, loadedImage.naturalHeight, config)
        : {
            cols: config.sheetsWide,
            rows: config.sheetsHigh,
            totalSheets: config.sheetsWide * config.sheetsHigh,
            posterWidthMm: 840,
            posterHeightMm: 1188,
            posterWidthCm: 84,
            posterHeightCm: 119,
            paperWidthMm: 210,
            paperHeightMm: 297,
            printableWidthMm: 190,
            printableHeightMm: 277,
            sheets: []
        };

    // Atualiza preview no Canvas
    const updatePreview = useCallback(async () => {
        if (!loadedImage || !previewCanvasRef.current) return;
        setIsRenderingPreview(true);

        try {
            // Renderiza o pôster em resolução de visualização ágil (1200px)
            const targetWidth = 1200;
            const rendered = renderRasterbatorToCanvas(loadedImage, config, targetWidth);

            const display = previewCanvasRef.current;
            display.width = rendered.width;
            display.height = rendered.height;
            const ctx = display.getContext('2d');
            if (ctx) {
                ctx.clearRect(0, 0, display.width, display.height);
                
                if (previewMode === 'original') {
                    ctx.drawImage(loadedImage, 0, 0, display.width, display.height);
                } else {
                    ctx.drawImage(rendered, 0, 0);
                }

                // Se estiver no modo 'sheets' (grade de páginas), sobrepõe as linhas de corte e códigos
                if (previewMode === 'sheets' || previewMode === 'halftone') {
                    const scaleX = display.width / layout.posterWidthMm;
                    const scaleY = display.height / layout.posterHeightMm;

                    ctx.save();
                    ctx.strokeStyle = 'rgba(59, 130, 246, 0.6)';
                    ctx.lineWidth = 1.5;
                    ctx.setLineDash([6, 6]);

                    layout.sheets.forEach(sh => {
                        const x = sh.xMm * scaleX;
                        const y = sh.yMm * scaleY;
                        const w = sh.widthMm * scaleX;
                        const h = sh.heightMm * scaleY;

                        ctx.strokeRect(x, y, w, h);

                        // Marcador da coordenada no centro da folha
                        ctx.fillStyle = 'rgba(15, 23, 42, 0.75)';
                        ctx.fillRect(x + 4, y + 4, 34, 18);
                        ctx.fillStyle = '#60a5fa';
                        ctx.font = 'bold 11px monospace';
                        ctx.fillText(sh.posCode, x + 8, y + 17);
                    });
                    ctx.restore();
                }
            }
        } catch (err) {
            console.error("Erro no preview Rasterbator:", err);
        } finally {
            setIsRenderingPreview(false);
        }
    }, [loadedImage, config, previewMode, layout]);

    useEffect(() => {
        const timeout = setTimeout(() => {
            updatePreview();
        }, 150);
        return () => clearTimeout(timeout);
    }, [updatePreview]);

    // Download do PDF Multipágina
    const handleDownloadPdf = async () => {
        if (!loadedImage) return;
        setIsGeneratingPdf(true);
        setGenerationProgress({ current: 0, total: layout.totalSheets });

        try {
            const pdfBlob = await generateRasterbatorPdf(loadedImage, config, (current, total) => {
                setGenerationProgress({ current, total });
            });

            const safeFilename = `Rasterbator_${imageName.replace(/[^a-z0-9]/gi, '_')}_${layout.posterWidthCm}x${layout.posterHeightCm}cm_${layout.totalSheets}folhas.pdf`;
            await downloadBlob(pdfBlob, safeFilename, 60000);
            showToast(`PDF com ${layout.totalSheets} folhas gerado com sucesso!`, 'success');
        } catch (err: any) {
            console.error("Erro ao gerar PDF:", err);
            showToast(`Falha ao gerar PDF: ${err?.message || 'Tente novamente'}`, 'error');
        } finally {
            setIsGeneratingPdf(false);
            setGenerationProgress(null);
        }
    };

    // Download do ZIP das Folhas
    const handleDownloadZip = async () => {
        if (!loadedImage) return;
        setIsGeneratingZip(true);
        setGenerationProgress({ current: 0, total: layout.totalSheets });

        try {
            const zipBlob = await generateRasterbatorZip(loadedImage, config, (current, total) => {
                setGenerationProgress({ current, total });
            });

            const safeFilename = `Rasterbator_${imageName.replace(/[^a-z0-9]/gi, '_')}_${layout.posterWidthCm}x${layout.posterHeightCm}cm_folhas.zip`;
            await downloadBlob(zipBlob, safeFilename, 60000);
            showToast(`Arquivo ZIP com ${layout.totalSheets} folhas baixado!`, 'success');
        } catch (err: any) {
            console.error("Erro ao gerar ZIP:", err);
            showToast(`Falha ao gerar ZIP: ${err?.message || 'Tente novamente'}`, 'error');
        } finally {
            setIsGeneratingZip(false);
            setGenerationProgress(null);
        }
    };

    // Download do Pôster Único em Alta Resolução
    const handleDownloadFullPoster = async () => {
        if (!loadedImage) return;
        try {
            const masterCanvas = renderRasterbatorToCanvas(loadedImage, config, 3000);
            const dataUrl = masterCanvas.toDataURL('image/jpeg', 0.95);
            const filename = `Rasterbator_PosterCompleto_${layout.posterWidthCm}x${layout.posterHeightCm}cm.jpg`;
            await downloadFile(dataUrl, filename);
            showToast('Pôster completo em alta resolução baixado!', 'success');
        } catch (err: any) {
            console.error("Erro ao baixar pôster:", err);
            showToast('Erro ao baixar pôster.', 'error');
        }
    };

    const steps = [
        { num: 1, label: 'Imagem' },
        { num: 2, label: 'Tamanho' },
        { num: 3, label: 'Estilo' },
        { num: 4, label: 'Cores' },
        { num: 5, label: 'Opções' },
        { num: 6, label: 'Rasterbate' },
    ];

    return (
        <div className="space-y-6">
            {/* Feedback / Toast */}
            {toastMessage && (
                <div className={`p-4 rounded-2xl border flex items-center justify-between gap-3 text-sm font-bold shadow-2xl animate-in fade-in ${
                    toastMessage.type === 'success'
                        ? 'bg-emerald-950/90 border-emerald-500 text-emerald-200 shadow-emerald-950/50'
                        : toastMessage.type === 'error'
                        ? 'bg-rose-950/90 border-rose-500 text-rose-200 shadow-rose-950/50'
                        : 'bg-indigo-950/90 border-indigo-500 text-indigo-200 shadow-indigo-950/50'
                }`}>
                    <div className="flex items-center gap-2">
                        {toastMessage.type === 'success' ? <CheckCircle2 size={18} className="text-emerald-400" /> : <AlertCircle size={18} className="text-rose-400" />}
                        <span>{toastMessage.text}</span>
                    </div>
                    <button
                        type="button"
                        onClick={() => setToastMessage(null)}
                        className="text-xs opacity-70 hover:opacity-100 uppercase font-mono cursor-pointer"
                    >
                        ✕
                    </button>
                </div>
            )}

            {/* CABEÇALHO DO RASTERBATOR */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-4 sm:p-6 backdrop-blur-md shadow-2xl">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                    <div className="flex items-center gap-3">
                        {onBack && (
                            <button
                                type="button"
                                onClick={onBack}
                                className="p-2.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition cursor-pointer"
                                title="Voltar"
                            >
                                <ArrowLeft size={18} />
                            </button>
                        )}
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-xl shadow-cyan-500/25">
                            <span className="font-mono font-black text-xl tracking-tighter">::</span>
                        </div>
                        <div>
                            <div className="flex items-center gap-2 flex-wrap">
                                <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                                    The Rasterbator
                                </h1>
                                <span className="px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                                    Pôsteres Gigantes Halftone
                                </span>
                            </div>
                            <p className="text-xs text-slate-400 mt-0.5">
                                Crie murais e pôsteres gigantes com estética reticulada (pontos meio-tom) para imprimir em folhas comuns
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                        {onSwitchMode && (
                            <>
                                <button
                                    type="button"
                                    onClick={() => onSwitchMode('painel_festa')}
                                    className="px-3 py-2 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                                    title="Voltar para o Painel de Festa & Bolo"
                                >
                                    <span>🎈</span>
                                    <span>Painel Festa</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => onSwitchMode('cortador')}
                                    className="px-3 py-2 rounded-xl bg-pink-500/10 hover:bg-pink-500/20 text-pink-300 border border-pink-500/30 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                                    title="Ir para o Fatiador de Festa A4/A3"
                                >
                                    <Scissors size={14} />
                                    <span>Fatiador Festa</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => onSwitchMode('criador_poster')}
                                    className="px-3 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                                    title="Ir para o Criador de Pôster A4 com Abas Cole Aqui"
                                >
                                    <Sparkles size={14} />
                                    <span>Pôster A4 Cole</span>
                                </button>
                            </>
                        )}
                        {onOpenUpscale && (
                            <button
                                type="button"
                                onClick={() => onOpenUpscale(currentImageUrl, imageName)}
                                className="px-3 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                            >
                                <Sparkles size={14} />
                                <span>Upscale IA</span>
                            </button>
                        )}
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                        >
                            <RotateCw size={14} />
                            <span>Trocar Foto</span>
                        </button>
                        <input
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            accept="image/*"
                            onChange={handleFileUpload}
                        />
                    </div>
                </div>

                {/* STEPPER HORIZONTAL (1 a 6 inspirado em rasterbator.net) */}
                <div className="pt-4 overflow-x-auto pb-1">
                    <div className="flex items-center min-w-[560px] justify-between">
                        {steps.map((st, idx) => {
                            const isCurrent = currentStep === st.num;
                            const isCompleted = currentStep > st.num;

                            return (
                                <React.Fragment key={st.num}>
                                    <button
                                        type="button"
                                        onClick={() => setCurrentStep(st.num as RasterbatorStep)}
                                        className="flex items-center gap-2 group cursor-pointer"
                                    >
                                        <div
                                            className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black transition-all ${
                                                isCurrent
                                                    ? 'bg-cyan-500 text-slate-950 font-black ring-4 ring-cyan-500/30'
                                                    : isCompleted
                                                    ? 'bg-blue-600 text-white'
                                                    : 'bg-slate-800 text-slate-400 group-hover:bg-slate-700'
                                            }`}
                                        >
                                            {isCompleted ? <Check size={14} /> : st.num}
                                        </div>
                                        <span
                                            className={`text-xs font-bold ${
                                                isCurrent
                                                    ? 'text-cyan-300'
                                                    : isCompleted
                                                    ? 'text-white'
                                                    : 'text-slate-500 group-hover:text-slate-300'
                                            }`}
                                        >
                                            {st.label}
                                        </span>
                                    </button>

                                    {idx < steps.length - 1 && (
                                        <div
                                            className={`h-0.5 flex-1 mx-3 rounded ${
                                                currentStep > idx + 1 ? 'bg-cyan-500/80' : 'bg-slate-800'
                                            }`}
                                        />
                                    )}
                                </React.Fragment>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* CONTEÚDO PRINCIPAL: CONTROLES À ESQUERDA (5 COLS) E PREVIEW À DIREITA (7 COLS) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* COLUNA ESQUERDA: CONTROLES DO PASSO ATUAL */}
                <div className="lg:col-span-5 space-y-5">
                    <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 space-y-5 backdrop-blur-md">
                        {/* ETAPA 1: IMAGEM */}
                        {currentStep === 1 && (
                            <div className="space-y-4 animate-in fade-in">
                                <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                                    <span>🖼️</span>
                                    <span>Imagem do Pôster</span>
                                </h3>

                                {currentImageUrl ? (
                                    <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 text-center space-y-3">
                                        <img
                                            src={currentImageUrl}
                                            alt="Preview"
                                            className="max-h-56 mx-auto rounded-xl object-contain shadow-lg border border-slate-800"
                                        />
                                        <div className="text-xs text-slate-400 font-mono">
                                            Dimensões: {loadedImage?.naturalWidth || 0} × {loadedImage?.naturalHeight || 0} px
                                        </div>
                                        <div className="flex items-center justify-center gap-2">
                                            <button
                                                type="button"
                                                onClick={() => fileInputRef.current?.click()}
                                                className="py-2 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition cursor-pointer"
                                            >
                                                Escolher Outra Imagem
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div
                                        onClick={() => fileInputRef.current?.click()}
                                        className="p-8 rounded-2xl bg-slate-950/60 border-2 border-dashed border-cyan-500/40 hover:border-cyan-400 text-center cursor-pointer transition-all space-y-3"
                                    >
                                        <div className="w-14 h-14 mx-auto rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                                            <RotateCw size={24} />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-white">Clique para enviar uma foto ou imagem</p>
                                            <p className="text-xs text-slate-400 mt-1">PNG, JPG ou WEBP de qualquer resolução</p>
                                        </div>
                                    </div>
                                )}

                                {/* Galeria de Imagens da Sessão */}
                                {availableImages.length > 0 && (
                                    <div className="space-y-2 pt-2 border-t border-slate-800">
                                        <label className="text-[11px] font-bold text-slate-400 uppercase">Imagens disponíveis na sessão:</label>
                                        <div className="flex items-center gap-2 overflow-x-auto pb-2 custom-scrollbar">
                                            {availableImages.map(img => {
                                                const src = img.previewUrl || (img.base64Data ? `data:${img.mimeType || 'image/png'};base64,${img.base64Data}` : '');
                                                const isSel = src === currentImageUrl;
                                                return (
                                                    <button
                                                        key={img.id}
                                                        type="button"
                                                        onClick={() => {
                                                            setCurrentImageUrl(src);
                                                            showToast(`Imagem "${img.name}" selecionada!`, 'info');
                                                        }}
                                                        className={`shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition cursor-pointer ${
                                                            isSel ? 'border-cyan-400 ring-2 ring-cyan-400/30' : 'border-slate-800 hover:border-slate-600'
                                                        }`}
                                                        title={img.name}
                                                    >
                                                        <img src={src} alt={img.name} className="w-full h-full object-cover" />
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}

                                <div className="flex justify-end pt-2">
                                    <button
                                        type="button"
                                        onClick={() => setCurrentStep(2)}
                                        disabled={!currentImageUrl}
                                        className="py-2.5 px-5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center gap-2 cursor-pointer shadow-lg shadow-cyan-500/20 disabled:opacity-50"
                                    >
                                        <span>Continuar para Tamanho</span>
                                        <ArrowRight size={14} />
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* ETAPA 2: PAPEL E TAMANHO (SCREENSHOT 1) */}
                        {currentStep === 2 && (
                            <div className="space-y-4 animate-in fade-in">
                                <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                                    <span>📏</span>
                                    <span>Papel e Tamanho do Pôster</span>
                                </h3>

                                {/* Configurações de Papel */}
                                <div className="space-y-2">
                                    <label className="text-[11px] font-bold text-slate-400 uppercase">Configurações de Papel:</label>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div>
                                            <label className="text-[10px] text-slate-500 block mb-1">Formato:</label>
                                            <select
                                                value={config.paperFormat}
                                                onChange={(e) => setConfig(p => ({ ...p, paperFormat: e.target.value as PaperFormat }))}
                                                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white font-bold outline-none focus:border-cyan-500 cursor-pointer"
                                            >
                                                <option value="A4">A4 (210 × 297 mm)</option>
                                                <option value="A3">A3 (297 × 420 mm)</option>
                                                <option value="A2">A2 (420 × 594 mm)</option>
                                                <option value="A5">A5 (148 × 210 mm)</option>
                                                <option value="Carta">US Letter (216 × 279 mm)</option>
                                                <option value="Legal">US Legal (216 × 356 mm)</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="text-[10px] text-slate-500 block mb-1">Orientação:</label>
                                            <select
                                                value={config.paperOrientation}
                                                onChange={(e) => setConfig(p => ({ ...p, paperOrientation: e.target.value as PaperOrientation }))}
                                                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white font-bold outline-none focus:border-cyan-500 cursor-pointer"
                                            >
                                                <option value="portrait">Retrato (Vertical)</option>
                                                <option value="landscape">Paisagem (Horizontal)</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                {/* Margens e Sobreposição */}
                                <div className="grid grid-cols-2 gap-2 pt-1">
                                    <div className="bg-slate-950/70 p-2.5 rounded-xl border border-slate-800 space-y-1">
                                        <div className="flex items-center justify-between text-xs">
                                            <span className="font-bold text-slate-300">Margem:</span>
                                            <span className="font-mono text-cyan-400 font-bold">{config.marginMm} mm</span>
                                        </div>
                                        <input
                                            type="range"
                                            min="0"
                                            max="30"
                                            step="1"
                                            value={config.marginMm}
                                            onChange={(e) => setConfig(p => ({ ...p, marginMm: Number(e.target.value) }))}
                                            className="w-full accent-cyan-500 cursor-pointer"
                                        />
                                    </div>
                                    <div className="bg-slate-950/70 p-2.5 rounded-xl border border-slate-800 space-y-1">
                                        <div className="flex items-center justify-between text-xs">
                                            <span className="font-bold text-slate-300">Sobreposição:</span>
                                            <span className="font-mono text-cyan-400 font-bold">{config.overlapMm} mm</span>
                                        </div>
                                        <input
                                            type="range"
                                            min="0"
                                            max="25"
                                            step="1"
                                            value={config.overlapMm}
                                            onChange={(e) => setConfig(p => ({ ...p, overlapMm: Number(e.target.value) }))}
                                            className="w-full accent-cyan-500 cursor-pointer"
                                        />
                                    </div>
                                </div>

                                {/* Tamanho de Saída (Output Size) */}
                                <div className="space-y-2 pt-2 border-t border-slate-800">
                                    <label className="text-[11px] font-bold text-slate-400 uppercase">Tamanho do Pôster de Saída:</label>
                                    
                                    <div className="grid grid-cols-3 gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
                                        <button
                                            type="button"
                                            onClick={() => setConfig(p => ({ ...p, defineSizeBy: 'sheets_wide' }))}
                                            className={`py-1.5 rounded-lg font-bold text-[11px] transition cursor-pointer ${
                                                config.defineSizeBy === 'sheets_wide' ? 'bg-cyan-500 text-slate-950 font-black' : 'text-slate-400 hover:text-white'
                                            }`}
                                        >
                                            Por Largura (Folhas)
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setConfig(p => ({ ...p, defineSizeBy: 'sheets_high' }))}
                                            className={`py-1.5 rounded-lg font-bold text-[11px] transition cursor-pointer ${
                                                config.defineSizeBy === 'sheets_high' ? 'bg-cyan-500 text-slate-950 font-black' : 'text-slate-400 hover:text-white'
                                            }`}
                                        >
                                            Por Altura (Folhas)
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setConfig(p => ({ ...p, defineSizeBy: 'total_width_cm' }))}
                                            className={`py-1.5 rounded-lg font-bold text-[11px] transition cursor-pointer ${
                                                config.defineSizeBy === 'total_width_cm' ? 'bg-cyan-500 text-slate-950 font-black' : 'text-slate-400 hover:text-white'
                                            }`}
                                        >
                                            Por Medida (CM)
                                        </button>
                                    </div>

                                    {config.defineSizeBy === 'sheets_wide' && (
                                        <div className="bg-slate-950/80 p-3 rounded-2xl border border-slate-800 flex items-center justify-between gap-3">
                                            <span className="text-xs font-bold text-slate-300">Quantidade de folhas na largura:</span>
                                            <div className="flex items-center gap-1">
                                                <button
                                                    type="button"
                                                    onClick={() => setConfig(p => ({ ...p, sheetsWide: Math.max(1, p.sheetsWide - 1) }))}
                                                    className="w-8 h-8 rounded-lg bg-slate-900 text-white font-bold border border-slate-700 hover:bg-slate-800 cursor-pointer"
                                                >
                                                    -
                                                </button>
                                                <input
                                                    type="number"
                                                    min="1"
                                                    max="50"
                                                    value={config.sheetsWide}
                                                    onChange={(e) => setConfig(p => ({ ...p, sheetsWide: Math.max(1, Math.min(50, Number(e.target.value) || 1)) }))}
                                                    className="w-14 bg-slate-900 border border-slate-700 rounded-lg p-1.5 text-center text-sm font-mono font-bold text-cyan-400 outline-none"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setConfig(p => ({ ...p, sheetsWide: Math.min(50, p.sheetsWide + 1) }))}
                                                    className="w-8 h-8 rounded-lg bg-slate-900 text-white font-bold border border-slate-700 hover:bg-slate-800 cursor-pointer"
                                                >
                                                    +
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {config.defineSizeBy === 'sheets_high' && (
                                        <div className="bg-slate-950/80 p-3 rounded-2xl border border-slate-800 flex items-center justify-between gap-3">
                                            <span className="text-xs font-bold text-slate-300">Quantidade de folhas na altura:</span>
                                            <div className="flex items-center gap-1">
                                                <button
                                                    type="button"
                                                    onClick={() => setConfig(p => ({ ...p, sheetsHigh: Math.max(1, p.sheetsHigh - 1) }))}
                                                    className="w-8 h-8 rounded-lg bg-slate-900 text-white font-bold border border-slate-700 hover:bg-slate-800 cursor-pointer"
                                                >
                                                    -
                                                </button>
                                                <input
                                                    type="number"
                                                    min="1"
                                                    max="50"
                                                    value={config.sheetsHigh}
                                                    onChange={(e) => setConfig(p => ({ ...p, sheetsHigh: Math.max(1, Math.min(50, Number(e.target.value) || 1)) }))}
                                                    className="w-14 bg-slate-900 border border-slate-700 rounded-lg p-1.5 text-center text-sm font-mono font-bold text-cyan-400 outline-none"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setConfig(p => ({ ...p, sheetsHigh: Math.min(50, p.sheetsHigh + 1) }))}
                                                    className="w-8 h-8 rounded-lg bg-slate-900 text-white font-bold border border-slate-700 hover:bg-slate-800 cursor-pointer"
                                                >
                                                    +
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {config.defineSizeBy === 'total_width_cm' && (
                                        <div className="bg-slate-950/80 p-3 rounded-2xl border border-slate-800 flex items-center justify-between gap-3">
                                            <span className="text-xs font-bold text-slate-300">Largura total do pôster:</span>
                                            <div className="flex items-center gap-1">
                                                <input
                                                    type="number"
                                                    min="10"
                                                    max="1000"
                                                    value={config.totalWidthCm}
                                                    onChange={(e) => setConfig(p => ({ ...p, totalWidthCm: Math.max(10, Number(e.target.value) || 10) }))}
                                                    className="w-20 bg-slate-900 border border-slate-700 rounded-lg p-1.5 text-center text-sm font-mono font-bold text-cyan-400 outline-none"
                                                />
                                                <span className="text-xs font-bold text-slate-400">cm</span>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="flex justify-between items-center pt-2">
                                    <button
                                        type="button"
                                        onClick={() => setCurrentStep(1)}
                                        className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs uppercase cursor-pointer"
                                    >
                                        « Voltar
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setCurrentStep(3)}
                                        className="py-2.5 px-5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center gap-2 cursor-pointer shadow-lg shadow-cyan-500/20"
                                    >
                                        <span>Continuar para Estilo</span>
                                        <ArrowRight size={14} />
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* ETAPA 3: ESTILO (SCREENSHOT 2) */}
                        {currentStep === 3 && (
                            <div className="space-y-4 animate-in fade-in">
                                <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                                    <span>🎨</span>
                                    <span>Estilo do Pôster (Style)</span>
                                </h3>
                                <p className="text-xs text-slate-400">
                                    Selecione o estilo do pôster. Você poderá personalizar as cores e detalhes no próximo passo.
                                </p>

                                <div className="space-y-3">
                                    {/* Opção 1: Rasterbation (Color Halftone) */}
                                    <button
                                        type="button"
                                        onClick={() => setConfig(p => ({ ...p, style: 'rasterbation', rasterColorMode: 'multicolor' }))}
                                        className={`w-full p-4 rounded-2xl border text-left transition flex items-center gap-4 cursor-pointer ${
                                            config.style === 'rasterbation'
                                                ? 'bg-cyan-500/15 border-cyan-400 shadow-lg ring-1 ring-cyan-400'
                                                : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                                        }`}
                                    >
                                        <div className="w-16 h-16 rounded-xl bg-gradient-to-tr from-cyan-500 via-pink-500 to-amber-400 flex items-center justify-center shrink-0 shadow-md">
                                            <div className="grid grid-cols-3 gap-1">
                                                <div className="w-2.5 h-2.5 rounded-full bg-white" />
                                                <div className="w-1.5 h-1.5 rounded-full bg-slate-950" />
                                                <div className="w-3 h-3 rounded-full bg-white" />
                                                <div className="w-2 h-2 rounded-full bg-white" />
                                                <div className="w-2.5 h-2.5 rounded-full bg-slate-950" />
                                                <div className="w-1.5 h-1.5 rounded-full bg-white" />
                                            </div>
                                        </div>
                                        <div>
                                            <div className="text-sm font-black text-white">Rasterbation (Colorido)</div>
                                            <div className="text-xs text-slate-400 mt-0.5">Halftoning em cores completas da imagem original ou paletas estilizadas.</div>
                                        </div>
                                    </button>

                                    {/* Opção 2: No effects (Ampliação Pura) */}
                                    <button
                                        type="button"
                                        onClick={() => setConfig(p => ({ ...p, style: 'no_effects' }))}
                                        className={`w-full p-4 rounded-2xl border text-left transition flex items-center gap-4 cursor-pointer ${
                                            config.style === 'no_effects'
                                                ? 'bg-cyan-500/15 border-cyan-400 shadow-lg ring-1 ring-cyan-400'
                                                : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                                        }`}
                                    >
                                        <div className="w-16 h-16 rounded-xl bg-slate-800 flex items-center justify-center shrink-0 border border-slate-700 overflow-hidden">
                                            <img src={currentImageUrl} alt="Thumb" className="w-full h-full object-cover" />
                                        </div>
                                        <div>
                                            <div className="text-sm font-black text-white">No effects (Sem Efeitos)</div>
                                            <div className="text-xs text-slate-400 mt-0.5">Apenas amplia a imagem contínua dividida em múltiplas páginas para montar.</div>
                                        </div>
                                    </button>

                                    {/* Opção 3: Black and white rasterbation (O Original) */}
                                    <button
                                        type="button"
                                        onClick={() => setConfig(p => ({ ...p, style: 'bw_rasterbation', rasterColorMode: 'black' }))}
                                        className={`w-full p-4 rounded-2xl border text-left transition flex items-center gap-4 cursor-pointer ${
                                            config.style === 'bw_rasterbation'
                                                ? 'bg-cyan-500/15 border-cyan-400 shadow-lg ring-1 ring-cyan-400'
                                                : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                                        }`}
                                    >
                                        <div className="w-16 h-16 rounded-xl bg-white flex items-center justify-center shrink-0 shadow-md">
                                            <div className="grid grid-cols-3 gap-1">
                                                <div className="w-3 h-3 rounded-full bg-slate-950" />
                                                <div className="w-1.5 h-1.5 rounded-full bg-slate-950" />
                                                <div className="w-2.5 h-2.5 rounded-full bg-slate-950" />
                                                <div className="w-2 h-2 rounded-full bg-slate-950" />
                                                <div className="w-3.5 h-3.5 rounded-full bg-slate-950" />
                                                <div className="w-1 h-1 rounded-full bg-slate-950" />
                                            </div>
                                        </div>
                                        <div>
                                            <div className="text-sm font-black text-white">Black and white rasterbation</div>
                                            <div className="text-xs text-slate-400 mt-0.5">O estilo clássico e icônico original do Rasterbator: pontos pretos no fundo branco.</div>
                                        </div>
                                    </button>
                                </div>

                                <div className="flex justify-between items-center pt-2">
                                    <button
                                        type="button"
                                        onClick={() => setCurrentStep(2)}
                                        className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs uppercase cursor-pointer"
                                    >
                                        « Voltar
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setCurrentStep(4)}
                                        className="py-2.5 px-5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center gap-2 cursor-pointer shadow-lg shadow-cyan-500/20"
                                    >
                                        <span>Continuar para Cores</span>
                                        <ArrowRight size={14} />
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* ETAPA 4: CORES (SCREENSHOT 3) */}
                        {currentStep === 4 && (
                            <div className="space-y-4 animate-in fade-in">
                                <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                                    <span>🌈</span>
                                    <span>Cores e Paletas (Color)</span>
                                </h3>

                                <div className="grid grid-cols-2 gap-3">
                                    {/* Cor dos Pontos (Raster Color) */}
                                    <div className="space-y-2">
                                        <label className="text-[11px] font-bold text-slate-400 uppercase">Cor dos Pontos (Raster):</label>
                                        <div className="space-y-1.5">
                                            {[
                                                { id: 'black', label: 'Preto (Black)' },
                                                { id: 'multicolor', label: 'Multicolor' },
                                                { id: 'single_color', label: 'Cor Única' },
                                            ].map(opt => (
                                                <label
                                                    key={opt.id}
                                                    className={`flex items-center gap-2 p-2 rounded-xl border text-xs cursor-pointer transition ${
                                                        config.rasterColorMode === opt.id
                                                            ? 'bg-cyan-500/15 border-cyan-400 text-white font-bold'
                                                            : 'bg-slate-950 border-slate-800 text-slate-300'
                                                    }`}
                                                >
                                                    <input
                                                        type="radio"
                                                        name="rasterColor"
                                                        checked={config.rasterColorMode === opt.id}
                                                        onChange={() => setConfig(p => ({ ...p, rasterColorMode: opt.id as RasterColorMode }))}
                                                        className="accent-cyan-500"
                                                    />
                                                    <span>{opt.label}</span>
                                                </label>
                                            ))}
                                            {config.rasterColorMode === 'single_color' && (
                                                <div className="flex items-center gap-2 p-1.5 bg-slate-950 rounded-lg border border-slate-800">
                                                    <input
                                                        type="color"
                                                        value={config.singleRasterColor}
                                                        onChange={(e) => setConfig(p => ({ ...p, singleRasterColor: e.target.value }))}
                                                        className="w-7 h-7 rounded cursor-pointer border-0 bg-transparent"
                                                    />
                                                    <span className="text-xs font-mono text-slate-300">{config.singleRasterColor}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Cor de Fundo (Background Color) */}
                                    <div className="space-y-2">
                                        <label className="text-[11px] font-bold text-slate-400 uppercase">Cor de Fundo (Background):</label>
                                        <div className="space-y-1.5">
                                            {[
                                                { id: 'white', label: 'Branco (White)' },
                                                { id: 'black', label: 'Preto (Black)' },
                                                { id: 'single_color', label: 'Cor Única' },
                                            ].map(opt => (
                                                <label
                                                    key={opt.id}
                                                    className={`flex items-center gap-2 p-2 rounded-xl border text-xs cursor-pointer transition ${
                                                        config.backgroundColorMode === opt.id
                                                            ? 'bg-cyan-500/15 border-cyan-400 text-white font-bold'
                                                            : 'bg-slate-950 border-slate-800 text-slate-300'
                                                    }`}
                                                >
                                                    <input
                                                        type="radio"
                                                        name="bgColor"
                                                        checked={config.backgroundColorMode === opt.id}
                                                        onChange={() => setConfig(p => ({ ...p, backgroundColorMode: opt.id as BackgroundColorMode }))}
                                                        className="accent-cyan-500"
                                                    />
                                                    <span>{opt.label}</span>
                                                </label>
                                            ))}
                                            {config.backgroundColorMode === 'single_color' && (
                                                <div className="flex items-center gap-2 p-1.5 bg-slate-950 rounded-lg border border-slate-800">
                                                    <input
                                                        type="color"
                                                        value={config.singleBackgroundColor}
                                                        onChange={(e) => setConfig(p => ({ ...p, singleBackgroundColor: e.target.value }))}
                                                        className="w-7 h-7 rounded cursor-pointer border-0 bg-transparent"
                                                    />
                                                    <span className="text-xs font-mono text-slate-300">{config.singleBackgroundColor}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Matriz de Presets de Paleta (Screenshot 3) */}
                                <div className="space-y-2 pt-2 border-t border-slate-800">
                                    <div className="flex items-center justify-between">
                                        <label className="text-[11px] font-bold text-slate-400 uppercase">Presets de Paleta Estilizada:</label>
                                        <span className="text-[10px] text-cyan-400 font-bold">10 paletas temáticas</span>
                                    </div>
                                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                                        {RASTER_PALETTES.map(pal => {
                                            const isSelected = config.selectedPaletteId === pal.id;
                                            return (
                                                <button
                                                    key={pal.id}
                                                    type="button"
                                                    onClick={() => setConfig(p => ({
                                                        ...p,
                                                        selectedPaletteId: pal.id,
                                                        rasterColorMode: pal.id === 'original' ? 'multicolor' : pal.id === 'classic_bw' ? 'black' : 'multicolor',
                                                        backgroundColorMode: pal.backgroundColor === '#ffffff' ? 'white' : pal.backgroundColor === '#0a0a0a' ? 'black' : 'single_color',
                                                        singleBackgroundColor: pal.backgroundColor
                                                    }))}
                                                    className={`p-2 rounded-xl border text-center transition flex flex-col items-center gap-1 cursor-pointer ${
                                                        isSelected
                                                            ? 'bg-cyan-500/20 border-cyan-400 ring-2 ring-cyan-400 shadow-md'
                                                            : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                                                    }`}
                                                    title={pal.description}
                                                >
                                                    {/* Círculos de Demonstração de Cor */}
                                                    <div className="flex items-center justify-center gap-1 py-1">
                                                        <div className="w-3.5 h-3.5 rounded-full border border-slate-700" style={{ backgroundColor: pal.primaryColor }} />
                                                        <div className="w-3.5 h-3.5 rounded-full border border-slate-700" style={{ backgroundColor: pal.secondaryColor }} />
                                                        <div className="w-3.5 h-3.5 rounded-full border border-slate-700" style={{ backgroundColor: pal.backgroundColor }} />
                                                    </div>
                                                    <span className="text-[10px] font-bold text-slate-200 truncate w-full">{pal.name}</span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                <div className="flex justify-between items-center pt-2">
                                    <button
                                        type="button"
                                        onClick={() => setCurrentStep(3)}
                                        className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs uppercase cursor-pointer"
                                    >
                                        « Voltar
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setCurrentStep(5)}
                                        className="py-2.5 px-5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center gap-2 cursor-pointer shadow-lg shadow-cyan-500/20"
                                    >
                                        <span>Continuar para Opções</span>
                                        <ArrowRight size={14} />
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* ETAPA 5: OPÇÕES DE HALFTONE (SCREENSHOT 4) */}
                        {currentStep === 5 && (
                            <div className="space-y-4 animate-in fade-in">
                                <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                                    <span>⚙️</span>
                                    <span>Opções de Halftone (Output Options)</span>
                                </h3>

                                {/* Modo de Grade do Halftone */}
                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-bold text-slate-400 uppercase">Modo de Retícula (Output):</label>
                                    <select
                                        value={config.halftoneMode}
                                        onChange={(e) => setConfig(p => ({ ...p, halftoneMode: e.target.value as HalftoneMode }))}
                                        className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white font-bold outline-none focus:border-cyan-500 cursor-pointer"
                                    >
                                        <option value="interlaced">Interlaced halftone (Colunas alternadas / Hexagonal)</option>
                                        <option value="grid">Halftone padrão (Grade ortogonal alinhada)</option>
                                        <option value="lines">Lines (Linhas horizontais de espessura variável)</option>
                                    </select>
                                    <span className="text-[10px] text-slate-500 block">
                                        O modo entrelaçado (interlaced) é o visual clássico e característico do Rasterbator.
                                    </span>
                                </div>

                                {/* Formato dos Pontos (Dot Shape) */}
                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-bold text-slate-400 uppercase">Formato do Ponto (Dot Shape):</label>
                                    <div className="grid grid-cols-4 gap-2">
                                        {[
                                            { id: 'circle', label: 'Círculo', icon: Circle },
                                            { id: 'square', label: 'Quadrado', icon: Square },
                                            { id: 'diamond', label: 'Losango', icon: Maximize2 },
                                            { id: 'triangle', label: 'Triângulo', icon: Sliders },
                                        ].map(sh => {
                                            const Icon = sh.icon;
                                            return (
                                                <button
                                                    key={sh.id}
                                                    type="button"
                                                    onClick={() => setConfig(p => ({ ...p, dotShape: sh.id as DotShape }))}
                                                    className={`p-2 rounded-xl border text-center transition flex flex-col items-center gap-1 cursor-pointer ${
                                                        config.dotShape === sh.id
                                                            ? 'bg-cyan-500/20 border-cyan-400 text-white font-bold ring-1 ring-cyan-400'
                                                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                                                    }`}
                                                >
                                                    <Icon size={16} />
                                                    <span className="text-[10px]">{sh.label}</span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Grid Size (Tamanho da Célula em mm) */}
                                <div className="bg-slate-950/70 p-3 rounded-2xl border border-slate-800 space-y-2">
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="font-bold text-slate-300">Tamanho da Grade (Grid Size):</span>
                                        <span className="font-mono text-cyan-400 font-bold">{config.gridSizeMm} mm</span>
                                    </div>
                                    <input
                                        type="range"
                                        min="4"
                                        max="35"
                                        step="1"
                                        value={config.gridSizeMm}
                                        onChange={(e) => setConfig(p => ({ ...p, gridSizeMm: Number(e.target.value) }))}
                                        className="w-full accent-cyan-500 cursor-pointer"
                                    />
                                    <div className="flex justify-between text-[10px] text-slate-500">
                                        <span>5mm (Micro pontos detalhados)</span>
                                        <span>15mm (Padrão)</span>
                                        <span>30mm (Pontos gigantes)</span>
                                    </div>
                                </div>

                                {/* Raster Size Min e Max (% do tamanho da grade) */}
                                <div className="bg-slate-950/70 p-3 rounded-2xl border border-slate-800 space-y-2">
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="font-bold text-slate-300">Escala dos Pontos (Raster Size):</span>
                                        <span className="font-mono text-cyan-400 font-bold">{config.minDotPercent}% — {config.maxDotPercent}%</span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <span className="text-[10px] text-slate-400 block mb-1">Mínimo (%):</span>
                                            <input
                                                type="number"
                                                min="0"
                                                max="50"
                                                value={config.minDotPercent}
                                                onChange={(e) => setConfig(p => ({ ...p, minDotPercent: Number(e.target.value) }))}
                                                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-1.5 text-center text-xs text-white font-mono"
                                            />
                                        </div>
                                        <div>
                                            <span className="text-[10px] text-slate-400 block mb-1">Máximo (%):</span>
                                            <input
                                                type="number"
                                                min="50"
                                                max="120"
                                                value={config.maxDotPercent}
                                                onChange={(e) => setConfig(p => ({ ...p, maxDotPercent: Number(e.target.value) }))}
                                                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-1.5 text-center text-xs text-white font-mono"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Opções Adicionais (Crop marks & Page position) */}
                                <div className="space-y-2 pt-1 border-t border-slate-800">
                                    <label className="text-[11px] font-bold text-slate-400 uppercase">Auxiliares de Impressão:</label>
                                    <div className="space-y-1.5">
                                        <label className="flex items-center gap-2 p-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={config.showCropMarks}
                                                onChange={(e) => setConfig(p => ({ ...p, showCropMarks: e.target.checked }))}
                                                className="accent-cyan-500 rounded"
                                            />
                                            <span><strong>Crop marks</strong> (Cruzetas de corte para aparar margens de impressão)</span>
                                        </label>
                                        <label className="flex items-center gap-2 p-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={config.showPagePosition}
                                                onChange={(e) => setConfig(p => ({ ...p, showPagePosition: e.target.checked }))}
                                                className="accent-cyan-500 rounded"
                                            />
                                            <span><strong>Page position</strong> (Coordenadas [A1, B2] para saber a ordem de colagem)</span>
                                        </label>
                                    </div>
                                </div>

                                <div className="flex justify-between items-center pt-2">
                                    <button
                                        type="button"
                                        onClick={() => setCurrentStep(4)}
                                        className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs uppercase cursor-pointer"
                                    >
                                        « Voltar
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setCurrentStep(6)}
                                        className="py-2.5 px-5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center gap-2 cursor-pointer shadow-lg shadow-cyan-500/20"
                                    >
                                        <span>Ir para Finalizar Pôster</span>
                                        <ArrowRight size={14} />
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* ETAPA 6: RASTERBATE & DOWNLOAD (SCREENSHOT 4 / FINAL) */}
                        {currentStep === 6 && (
                            <div className="space-y-4 animate-in fade-in">
                                <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                                    <span>🎉</span>
                                    <span>Rasterbate! (Gerar e Baixar Pôster)</span>
                                </h3>

                                {/* Resumo de Produção */}
                                <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800 space-y-2 text-xs">
                                    <div className="font-black text-cyan-300 uppercase text-[11px] tracking-wider mb-2">
                                        Ficha de Produção do Pôster:
                                    </div>
                                    <div className="flex justify-between py-1 border-b border-slate-800/80">
                                        <span className="text-slate-400">Dimensão Final do Pôster:</span>
                                        <strong className="text-white font-mono">{layout.posterWidthCm} × {layout.posterHeightCm} cm</strong>
                                    </div>
                                    <div className="flex justify-between py-1 border-b border-slate-800/80">
                                        <span className="text-slate-400">Consumo de Papel:</span>
                                        <strong className="text-emerald-400 font-mono font-bold">{layout.totalSheets} folhas {config.paperFormat} ({layout.cols} colunas × {layout.rows} linhas)</strong>
                                    </div>
                                    <div className="flex justify-between py-1 border-b border-slate-800/80">
                                        <span className="text-slate-400">Estilo de Retícula:</span>
                                        <strong className="text-slate-200 capitalize">{config.style === 'rasterbation' ? 'Color Halftone' : config.style === 'bw_rasterbation' ? 'Black & White Halftone' : 'Ampliação Sem Efeitos'}</strong>
                                    </div>
                                    <div className="flex justify-between py-1 border-b border-slate-800/80">
                                        <span className="text-slate-400">Tamanho da Célula / Ponto:</span>
                                        <strong className="text-cyan-400 font-mono">{config.gridSizeMm} mm</strong>
                                    </div>
                                    <div className="flex justify-between py-1">
                                        <span className="text-slate-400">Margem / Aba de Colagem:</span>
                                        <strong className="text-slate-300 font-mono">{config.marginMm} mm / {config.overlapMm} mm</strong>
                                    </div>
                                </div>

                                {/* Barra de Progresso durante geração */}
                                {(isGeneratingPdf || isGeneratingZip) && generationProgress && (
                                    <div className="p-4 rounded-2xl bg-cyan-950/40 border border-cyan-500/40 space-y-2 animate-pulse">
                                        <div className="flex justify-between text-xs text-cyan-300 font-bold">
                                            <span>Processando folhas em alta resolução...</span>
                                            <span>{generationProgress.current} de {generationProgress.total}</span>
                                        </div>
                                        <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                                            <div
                                                className="bg-cyan-500 h-full transition-all duration-150"
                                                style={{ width: `${(generationProgress.current / generationProgress.total) * 100}%` }}
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* Botão Principal: Complete X page poster (Estilo Rasterbator) */}
                                <button
                                    type="button"
                                    onClick={handleDownloadPdf}
                                    disabled={isGeneratingPdf || isGeneratingZip}
                                    className="w-full py-4 px-5 rounded-2xl font-black text-sm uppercase tracking-wider text-slate-950 bg-gradient-to-r from-cyan-400 via-teal-300 to-cyan-500 hover:from-cyan-300 hover:to-teal-300 shadow-xl shadow-cyan-500/25 transition-all flex items-center justify-center gap-2 active:scale-95 cursor-pointer disabled:opacity-50"
                                >
                                    <Download size={20} />
                                    <span>Complete {layout.totalSheets} page poster! (Baixar PDF)</span>
                                </button>

                                {/* Opções secundárias de download */}
                                <div className="grid grid-cols-2 gap-2 pt-1">
                                    <button
                                        type="button"
                                        onClick={handleDownloadZip}
                                        disabled={isGeneratingPdf || isGeneratingZip}
                                        className="py-2.5 px-3 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-xs text-slate-200 font-bold flex items-center justify-center gap-1.5 transition cursor-pointer disabled:opacity-50"
                                    >
                                        <FolderArchive size={15} className="text-cyan-400" />
                                        <span>Baixar Folhas em ZIP</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleDownloadFullPoster}
                                        disabled={isGeneratingPdf || isGeneratingZip}
                                        className="py-2.5 px-3 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-xs text-slate-200 font-bold flex items-center justify-center gap-1.5 transition cursor-pointer disabled:opacity-50"
                                    >
                                        <FileText size={15} className="text-emerald-400" />
                                        <span>Pôster Único HD (JPG)</span>
                                    </button>
                                </div>

                                <div className="flex justify-start pt-2">
                                    <button
                                        type="button"
                                        onClick={() => setCurrentStep(5)}
                                        className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs uppercase cursor-pointer"
                                    >
                                        « Voltar para Opções
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* COLUNA DIREITA: PRÉ-VISUALIZAÇÃO INTERATIVA & ESCALA HUMANA (7 COLS) */}
                <div className="lg:col-span-7 space-y-4">
                    {/* Barra de Ferramentas de Visualização */}
                    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3 backdrop-blur-md flex items-center justify-between flex-wrap gap-2">
                        {/* Seletor de Modo de Exibição */}
                        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
                            {[
                                { id: 'halftone', label: 'Reticulado Halftone' },
                                { id: 'sheets', label: 'Folhas (A1, B2)' },
                                { id: 'original', label: 'Original' },
                                { id: 'human_scale', label: 'Escala Humana (Parede)' },
                            ].map(m => (
                                <button
                                    key={m.id}
                                    type="button"
                                    onClick={() => setPreviewMode(m.id as any)}
                                    className={`py-1.5 px-3 rounded-lg text-xs font-bold transition cursor-pointer ${
                                        previewMode === m.id
                                            ? 'bg-cyan-500 text-slate-950 font-black shadow-sm'
                                            : 'text-slate-400 hover:text-white'
                                    }`}
                                >
                                    {m.label}
                                </button>
                            ))}
                        </div>

                        {/* Zoom */}
                        <div className="flex items-center gap-1 text-slate-400">
                            <button
                                type="button"
                                onClick={() => setZoom(z => Math.max(0.6, z - 0.2))}
                                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 cursor-pointer"
                                title="Reduzir Zoom"
                            >
                                <ZoomOut size={14} />
                            </button>
                            <span className="text-[11px] font-mono px-1 font-bold">{Math.round(zoom * 100)}%</span>
                            <button
                                type="button"
                                onClick={() => setZoom(z => Math.min(2.5, z + 0.2))}
                                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 cursor-pointer"
                                title="Aumentar Zoom"
                            >
                                <ZoomIn size={14} />
                            </button>
                            <button
                                type="button"
                                onClick={() => setZoom(1)}
                                className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-[10px] text-slate-200 font-bold cursor-pointer"
                            >
                                Reset
                            </button>
                        </div>
                    </div>

                    {/* Canvas / Visor do Pôster */}
                    <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 min-h-[500px] flex flex-col items-center justify-center relative overflow-hidden backdrop-blur-md">
                        {isRenderingPreview && (
                            <div className="absolute top-4 right-4 z-20 flex items-center gap-2 bg-slate-950/80 px-3 py-1.5 rounded-full border border-cyan-500/30 text-xs text-cyan-300 font-bold animate-pulse">
                                <RefreshCw size={12} className="animate-spin" />
                                <span>Calculando retícula...</span>
                            </div>
                        )}

                        {previewMode === 'human_scale' ? (
                            /* MODO ESCALA HUMANA (SILHUETA 1.75M AO LADO DO PÔSTER, COMO NO RASTERBATOR ORIGINAL) */
                            <div className="w-full flex items-end justify-center gap-8 py-6 px-4 overflow-x-auto min-h-[460px]">
                                {/* Pôster na parede */}
                                <div className="flex flex-col items-center">
                                    <div
                                        className="relative rounded shadow-2xl border-2 border-slate-700 bg-white"
                                        style={{
                                            width: `${Math.min(380, Math.max(140, layout.posterWidthCm * 2.2))}px`,
                                            aspectRatio: `${loadedImage?.naturalWidth || 1} / ${loadedImage?.naturalHeight || 1}`
                                        }}
                                    >
                                        <canvas
                                            ref={previewCanvasRef}
                                            className="w-full h-full object-contain"
                                        />
                                        <div className="absolute -top-6 left-0 right-0 text-center text-[11px] font-mono font-bold text-cyan-400">
                                            {layout.posterWidthCm} × {layout.posterHeightCm} cm
                                        </div>
                                    </div>
                                    <div className="text-[11px] font-bold text-slate-400 mt-2">
                                        Pôster ({layout.totalSheets} folhas)
                                    </div>
                                </div>

                                {/* Silhueta humana com altura de referência de 1.75m */}
                                <div className="flex flex-col items-center shrink-0">
                                    <div
                                        className="w-16 rounded-t-full bg-gradient-to-b from-slate-600 to-slate-800 flex flex-col items-center justify-start pt-2 border border-slate-600 shadow-lg relative"
                                        style={{ height: '320px' }}
                                    >
                                        {/* Cabeça */}
                                        <div className="w-8 h-9 rounded-full bg-slate-400 mb-1" />
                                        {/* Ombros / Corpo */}
                                        <div className="w-12 h-36 bg-slate-500 rounded-t-xl" />
                                        <div className="w-10 flex-1 bg-slate-600" />
                                        
                                        <div className="absolute -top-6 text-center text-[10px] font-mono font-bold text-slate-400 whitespace-nowrap">
                                            Pessoa (1,75 m)
                                        </div>
                                    </div>
                                    <div className="text-[11px] font-bold text-slate-400 mt-2">
                                        Escala Real
                                    </div>
                                </div>
                            </div>
                        ) : (
                            /* MODO DE CANVAS PADRÃO COM ZOOM */
                            <div className="w-full flex items-center justify-center overflow-auto max-h-[640px] p-2">
                                <div
                                    style={{ transform: `scale(${zoom})`, transformOrigin: 'center center' }}
                                    className="transition-transform duration-75 shadow-2xl rounded-xl border border-slate-800 overflow-hidden"
                                >
                                    <canvas
                                        ref={previewCanvasRef}
                                        style={{ maxWidth: '100%', maxHeight: '580px', objectFit: 'contain' }}
                                        className="block"
                                    />
                                </div>
                            </div>
                        )}

                        {/* Estatísticas no Rodapé do Visor (Inspirado em rasterbator.net) */}
                        <div className="w-full pt-4 mt-2 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                            <div className="bg-slate-950/70 p-2.5 rounded-xl border border-slate-800">
                                <span className="text-[10px] text-slate-400 block font-bold">Paper size</span>
                                <span className="text-white font-mono font-bold">
                                    {config.paperFormat} ({PAPER_DIMENSIONS[config.paperFormat]?.width} × {PAPER_DIMENSIONS[config.paperFormat]?.height} mm)
                                </span>
                            </div>
                            <div className="bg-slate-950/70 p-2.5 rounded-xl border border-slate-800">
                                <span className="text-[10px] text-slate-400 block font-bold">Poster size</span>
                                <span className="text-cyan-400 font-mono font-bold">
                                    {layout.posterWidthCm} × {layout.posterHeightCm} cm
                                </span>
                            </div>
                            <div className="bg-slate-950/70 p-2.5 rounded-xl border border-slate-800">
                                <span className="text-[10px] text-slate-400 block font-bold">Paper consumption</span>
                                <span className="text-emerald-400 font-mono font-bold">
                                    {layout.totalSheets} pages ({layout.cols}×{layout.rows})
                                </span>
                            </div>
                            <div className="bg-slate-950/70 p-2.5 rounded-xl border border-slate-800">
                                <span className="text-[10px] text-slate-400 block font-bold">Grid / Dot size</span>
                                <span className="text-indigo-300 font-mono font-bold">
                                    {config.gridSizeMm} mm ({config.dotShape})
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
