import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
    Box,
    Scissors,
    Download,
    FileText,
    Printer,
    Sparkles,
    Check,
    Layers,
    Info,
    ZoomIn,
    ZoomOut,
    Maximize2,
    Eye,
    RotateCw,
    HelpCircle,
    Upload,
    Sliders,
    ArrowLeft,
    RefreshCw,
    Palette,
    Tag,
    ChevronDown,
    ChevronUp,
    ExternalLink,
    AlertCircle
} from 'lucide-react';
import { UploadedImage } from '../types';
import { downloadBlob, downloadFile, getLastDownload } from '../utils/downloadHelper';
import { jsPDF } from 'jspdf';
import {
    PackagingType,
    PaperOrientation,
    LineStyleTheme,
    PackagingConfig,
    PACKAGING_PRESETS,
    A4_WIDTH_MM,
    A4_HEIGHT_MM,
    calculatePackagingNet,
    renderPackagingToCanvas
} from '../services/packagingTemplateService';

interface PackagingDieCutStudioProps {
    availableImages: UploadedImage[];
    initialImageUrl?: string | null;
    initialImageName?: string | null;
    onBackToArchitect: () => void;
    onOpenUpscale?: (url: string, name: string) => void;
}

// Modelos visuais prontos de amostra para início imediato
const SAMPLE_TEXTURES = [
    {
        name: 'Kraft Minimalista',
        color: '#dfcfb7',
        accent: '#8c6b4f',
        description: 'Papel kraft artesanal rústico com estética clean'
    },
    {
        name: 'Floral Suave',
        color: '#fdf2f8',
        accent: '#ec4899',
        description: 'Tons pasteis florais para lembrancinhas de festas e batizados'
    },
    {
        name: 'Preto & Ouro Luxo',
        color: '#18181b',
        accent: '#eab308',
        description: 'Estilo cosmético ou perfumaria premium com sofisticação'
    },
    {
        name: 'Branco Técnico & Minimalista',
        color: '#ffffff',
        accent: '#0f172a',
        description: 'Linhas puras prontas para impressão direta em papel especial'
    },
    {
        name: 'Candy Color Pastel',
        color: '#ecfeff',
        accent: '#06b6d4',
        description: 'Estética delicada para confeitaria, doces e aniversário'
    }
];

export const PackagingDieCutStudio: React.FC<PackagingDieCutStudioProps> = ({
    availableImages,
    initialImageUrl,
    initialImageName,
    onBackToArchitect,
    onOpenUpscale
}) => {
    // Configurações da embalagem
    const [selectedType, setSelectedType] = useState<PackagingType>('caixa_milk');
    const [dimensions, setDimensions] = useState({ widthMm: 60, depthMm: 60, heightMm: 120 });
    const [orientation, setOrientation] = useState<PaperOrientation>('landscape');
    const [bleedMm, setBleedMm] = useState<number>(3);
    const [glueTabWidthMm, setGlueTabWidthMm] = useState<number>(14);
    const [lineStyle, setLineStyle] = useState<LineStyleTheme>('technical_cad');
    
    // Toggles de engenharia
    const [showBleedArea, setShowBleedArea] = useState<boolean>(true);
    const [showCreaseLines, setShowCreaseLines] = useState<boolean>(true);
    const [showGlueLabels, setShowGlueLabels] = useState<boolean>(true);
    const [showCutScissors, setShowCutScissors] = useState<boolean>(true);
    const [showDimensions, setShowDimensions] = useState<boolean>(true);
    const [showCalibrationRule, setShowCalibrationRule] = useState<boolean>(true);

    // Textos personalizados
    const [customTextTitle, setCustomTextTitle] = useState<string>('Embalagem Especial');
    const [customTextSubtitle, setCustomTextSubtitle] = useState<string>('Feito com carinho');
    const [backgroundColor, setBackgroundColor] = useState<string>('#ffffff');
    const [imageFitMode, setImageFitMode] = useState<'cover' | 'contain' | 'face_front_only' | 'tile'>('cover');

    // Imagem da embalagem
    const [packagingImageUrl, setPackagingImageUrl] = useState<string | null>(initialImageUrl || null);
    const [packagingImageName, setPackagingImageName] = useState<string>(initialImageName || 'minha-embalagem');
    const [loadedSourceImage, setLoadedSourceImage] = useState<HTMLImageElement | null>(null);

    // Estados de UI e Visualização
    const [viewMode, setViewMode] = useState<'sheet_2d' | 'mockup_3d' | 'assembly_guide'>('sheet_2d');
    const [zoomLevel, setZoomLevel] = useState<number>(1);
    const [isExportingPng, setIsExportingPng] = useState<boolean>(false);
    const [isExportingPdf, setIsExportingPdf] = useState<boolean>(false);
    const [toastMessage, setToastMessage] = useState<string | null>(null);
    const [fallbackDownload, setFallbackDownload] = useState<{ url: string; filename: string } | null>(null);

    // Rotação da visualização 3D simulada
    const [rotationY, setRotationY] = useState<number>(25);
    const [rotationX, setRotationX] = useState<number>(15);

    // Referências do canvas
    const previewCanvasRef = useRef<HTMLCanvasElement | null>(null);
    const exportCanvasRef = useRef<HTMLCanvasElement | null>(null);
    const printIframeRef = useRef<HTMLIFrameElement | null>(null);
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    // Carrega pré-definição ao trocar de tipo
    const currentPreset = useMemo(() => {
        return PACKAGING_PRESETS.find(p => p.id === selectedType) || PACKAGING_PRESETS[0];
    }, [selectedType]);

    // Aplica dimensões recomendadas do preset ao mudar
    const handleSelectPreset = (presetId: PackagingType) => {
        setSelectedType(presetId);
        const preset = PACKAGING_PRESETS.find(p => p.id === presetId);
        if (preset) {
            setDimensions(preset.defaultDimensions);
            setOrientation(preset.orientation);
        }
    };

    // Notificação Toast
    const showToast = (msg: string) => {
        setToastMessage(msg);
        setTimeout(() => setToastMessage(null), 4000);
    };

    // Carrega a imagem selecionada em um elemento Image
    useEffect(() => {
        if (!packagingImageUrl) {
            setLoadedSourceImage(null);
            return;
        }

        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
            setLoadedSourceImage(img);
        };
        img.onerror = () => {
            console.warn('Erro ao carregar imagem da embalagem:', packagingImageUrl);
            setLoadedSourceImage(null);
        };
        img.src = packagingImageUrl;
    }, [packagingImageUrl]);

    // Atualiza canvas de visualização 2D
    useEffect(() => {
        if (viewMode !== 'sheet_2d') return;
        const canvas = previewCanvasRef.current;
        if (!canvas) return;

        const config: PackagingConfig = {
            type: selectedType,
            dimensions,
            orientation,
            bleedMm,
            glueTabWidthMm,
            lineStyle,
            showBleedArea,
            showCreaseLines,
            showGlueLabels,
            showCutScissors,
            showDimensions,
            showCalibrationRule,
            customTextTitle,
            customTextSubtitle,
            backgroundColor,
            imageFitMode
        };

        renderPackagingToCanvas(canvas, config, loadedSourceImage, false);
    }, [
        viewMode,
        selectedType,
        dimensions,
        orientation,
        bleedMm,
        glueTabWidthMm,
        lineStyle,
        showBleedArea,
        showCreaseLines,
        showGlueLabels,
        showCutScissors,
        showDimensions,
        showCalibrationRule,
        customTextTitle,
        customTextSubtitle,
        backgroundColor,
        imageFitMode,
        loadedSourceImage
    ]);

    // Cálculo em tempo real se o molde cabe no A4 em 100%
    const netCheck = useMemo(() => {
        const dummyCanvas = document.createElement('canvas');
        dummyCanvas.width = 1000;
        dummyCanvas.height = 1414;
        const config: PackagingConfig = {
            type: selectedType,
            dimensions,
            orientation,
            bleedMm,
            glueTabWidthMm,
            lineStyle,
            showBleedArea,
            showCreaseLines,
            showGlueLabels,
            showCutScissors,
            showDimensions,
            showCalibrationRule,
            customTextTitle,
            customTextSubtitle,
            backgroundColor,
            imageFitMode
        };
        return calculatePackagingNet(config, dummyCanvas.width, dummyCanvas.height);
    }, [selectedType, dimensions, orientation, bleedMm, glueTabWidthMm]);

    // Ajuste automático para caber no A4 com margens seguras
    const handleAutoFitToA4 = () => {
        if (netCheck.fitsOnA4) {
            showToast('As dimensões atuais já cabem perfeitamente na folha A4!');
            return;
        }

        const ratioW = netCheck.availableWidthMm / netCheck.totalNetWidthMm;
        const ratioH = netCheck.availableHeightMm / netCheck.totalNetHeightMm;
        const factor = Math.min(ratioW, ratioH) * 0.95; // 5% de folga extra

        setDimensions(prev => ({
            widthMm: Math.max(25, Math.round(prev.widthMm * factor)),
            depthMm: Math.max(20, Math.round(prev.depthMm * factor)),
            heightMm: Math.max(30, Math.round(prev.heightMm * factor))
        }));

        showToast('Dimensões recalculadas com sucesso para encaixar no A4 100%!');
    };

    // Upload de arquivo pelo usuário
    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const url = event.target?.result as string;
            setPackagingImageUrl(url);
            setPackagingImageName(file.name.replace(/\.[^/.]+$/, ''));
            showToast(`Imagem "${file.name}" carregada com sucesso!`);
        };
        reader.readAsDataURL(file);
    };

    // EXPORTAÇÃO 1: BAIXAR IMAGEM EM ALTA RESOLUÇÃO A4 (PNG 300 DPI)
    const handleDownloadHighResPng = async () => {
        setIsExportingPng(true);
        showToast('Renderizando folha A4 em ultra resolução 300 DPI (2480 x 3508 px)...');

        try {
            const canvas = document.createElement('canvas');
            const config: PackagingConfig = {
                type: selectedType,
                dimensions,
                orientation,
                bleedMm,
                glueTabWidthMm,
                lineStyle,
                showBleedArea,
                showCreaseLines,
                showGlueLabels,
                showCutScissors,
                showDimensions,
                showCalibrationRule,
                customTextTitle,
                customTextSubtitle,
                backgroundColor,
                imageFitMode
            };

            await renderPackagingToCanvas(canvas, config, loadedSourceImage, true);

            const blob = await new Promise<Blob | null>((resolve) => {
                canvas.toBlob((b) => resolve(b), 'image/png');
            });

            if (!blob) throw new Error('Falha ao gerar blob PNG');

            const filename = `molde-${selectedType}-${dimensions.widthMm}x${dimensions.depthMm}x${dimensions.heightMm}mm-A4-300dpi.png`;
            const success = await downloadBlob(blob, filename);

            if (success) {
                showToast('Download da imagem A4 concluído com sucesso!');
            } else {
                const lastDl = getLastDownload();
                if (lastDl) {
                    setFallbackDownload({ url: lastDl.url, filename });
                }
                showToast('Clique no link manual abaixo caso seu navegador bloqueie o download.');
            }
        } catch (err: any) {
            console.error('Erro ao baixar PNG A4:', err);
            showToast(`Erro ao exportar: ${err.message || 'Tente novamente'}`);
        } finally {
            setIsExportingPng(false);
        }
    };

    // EXPORTAÇÃO 2: BAIXAR PDF A4 VETORIAL PRONTO PARA IMPRESSÃO (ESCALA 1:1)
    const handleDownloadPrintablePdf = async () => {
        setIsExportingPdf(true);
        showToast('Gerando documento PDF A4 em escala real 1:1 para impressão...');

        try {
            const canvas = document.createElement('canvas');
            const config: PackagingConfig = {
                type: selectedType,
                dimensions,
                orientation,
                bleedMm,
                glueTabWidthMm,
                lineStyle,
                showBleedArea,
                showCreaseLines,
                showGlueLabels,
                showCutScissors,
                showDimensions,
                showCalibrationRule,
                customTextTitle,
                customTextSubtitle,
                backgroundColor,
                imageFitMode
            };

            await renderPackagingToCanvas(canvas, config, loadedSourceImage, true);

            const imgData = canvas.toDataURL('image/jpeg', 0.95);
            const pdf = new jsPDF({
                orientation: orientation,
                unit: 'mm',
                format: 'a4'
            });

            const pdfWidth = orientation === 'landscape' ? A4_HEIGHT_MM : A4_WIDTH_MM;
            const pdfHeight = orientation === 'landscape' ? A4_WIDTH_MM : A4_HEIGHT_MM;

            pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);

            const filename = `molde-${selectedType}-${dimensions.widthMm}x${dimensions.depthMm}x${dimensions.heightMm}mm-A4.pdf`;
            const pdfBlob = pdf.output('blob');

            const success = await downloadBlob(pdfBlob, filename);
            if (success) {
                showToast('PDF A4 baixado! Imprima selecionando "Tamanho Real" ou "Escala 100%".');
            } else {
                const lastDl = getLastDownload();
                if (lastDl) {
                    setFallbackDownload({ url: lastDl.url, filename });
                }
                showToast('Clique no botão de download manual caso o navegador restrinja popups.');
            }
        } catch (err: any) {
            console.error('Erro ao gerar PDF:', err);
            showToast(`Erro no PDF: ${err.message || 'Tente novamente'}`);
        } finally {
            setIsExportingPdf(false);
        }
    };

    // EXPORTAÇÃO 3: IMPRESSÃO DIRETA
    const handleDirectPrint = async () => {
        showToast('Preparando página A4 para impressão...');
        try {
            const canvas = document.createElement('canvas');
            const config: PackagingConfig = {
                type: selectedType,
                dimensions,
                orientation,
                bleedMm,
                glueTabWidthMm,
                lineStyle,
                showBleedArea,
                showCreaseLines,
                showGlueLabels,
                showCutScissors,
                showDimensions,
                showCalibrationRule,
                customTextTitle,
                customTextSubtitle,
                backgroundColor,
                imageFitMode
            };

            await renderPackagingToCanvas(canvas, config, loadedSourceImage, true);
            const imgUrl = canvas.toDataURL('image/png');

            let iframe = printIframeRef.current;
            if (!iframe) {
                iframe = document.createElement('iframe');
                iframe.style.position = 'fixed';
                iframe.style.right = '0';
                iframe.style.bottom = '0';
                iframe.style.width = '0';
                iframe.style.height = '0';
                iframe.style.border = '0';
                document.body.appendChild(iframe);
                printIframeRef.current = iframe;
            }

            const doc = iframe.contentWindow?.document;
            if (!doc) throw new Error('Não foi possível acessar a janela de impressão');

            const pageCss = orientation === 'landscape' ? '@page { size: A4 landscape; margin: 0; }' : '@page { size: A4 portrait; margin: 0; }';

            doc.open();
            doc.write(`
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Imprimir Molde A4</title>
                    <style>
                        ${pageCss}
                        body { margin: 0; padding: 0; background: #ffffff; display: flex; align-items: center; justify-content: center; }
                        img { width: 100vw; height: 100vh; object-fit: contain; }
                    </style>
                </head>
                <body>
                    <img src="${imgUrl}" onload="setTimeout(() => { window.focus(); window.print(); }, 400);" />
                </body>
                </html>
            `);
            doc.close();
            showToast('Diálogo de impressão aberto! Certifique-se de marcar "Tamanho Real / 100%".');
        } catch (err: any) {
            console.error('Erro na impressão direta:', err);
            // Fallback: faz download do PDF
            handleDownloadPrintablePdf();
        }
    };

    return (
        <div className="space-y-5 animate-in fade-in duration-300 text-slate-100">
            {/* TOAST FLUTUANTE */}
            {toastMessage && (
                <div className="fixed top-5 right-5 z-50 bg-slate-900/95 text-white border border-pink-500/40 px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 backdrop-blur-md text-xs sm:text-sm animate-in slide-in-from-top-3">
                    <Sparkles size={16} className="text-pink-400 shrink-0" />
                    <span>{toastMessage}</span>
                </div>
            )}

            {/* BANNER DE CABEÇALHO */}
            <div className="bg-gradient-to-r from-slate-900 via-indigo-950/70 to-slate-900 border border-indigo-500/30 rounded-2xl p-4 sm:p-6 shadow-xl relative overflow-hidden">
                <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-pink-500/10 rounded-full blur-3xl pointer-events-none" />
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
                    <div className="space-y-1.5">
                        <div className="flex items-center gap-2.5 flex-wrap">
                            <span className="px-2.5 py-0.5 rounded-full bg-pink-500/20 text-pink-300 border border-pink-500/30 font-black text-[10px] tracking-wider uppercase flex items-center gap-1">
                                <Box size={12} /> Engenharia A4
                            </span>
                            <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-semibold text-[10px]">
                                300 DPI Ultra HD
                            </span>
                            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold text-[10px]">
                                Escala 1:1 Real
                            </span>
                        </div>
                        <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
                            <span>Molde & Planificação de Embalagem A4</span>
                        </h1>
                        <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
                            Envie a imagem da sua embalagem, ajuste as cotas e gere o modelo planificado para impressão na folha A4 com detalhes minimalistas ultra nítidos: linhas de corte ✂, vincos de dobra, abas de colagem chanfradas ("COLE AQUI"), sangrias técnicas e régua de teste de 50mm.
                        </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                        <button
                            type="button"
                            onClick={onBackToArchitect}
                            className="px-3.5 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                        >
                            <ArrowLeft size={14} /> Voltar ao Arquiteto
                        </button>
                    </div>
                </div>
            </div>

            {/* BANNER DE FALLBACK CASO NAVEGADOR BLOQUEIE DOWNLOAD AUTOMÁTICO */}
            {fallbackDownload && (
                <div className="p-3.5 bg-amber-500/15 border border-amber-500/40 rounded-xl flex items-center justify-between gap-3 text-amber-200 text-xs">
                    <div className="flex items-center gap-2">
                        <AlertCircle size={16} className="text-amber-400 shrink-0" />
                        <span>Seu arquivo está pronto: <strong>{fallbackDownload.filename}</strong></span>
                    </div>
                    <a
                        href={fallbackDownload.url}
                        download={fallbackDownload.filename}
                        className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg shrink-0 transition-colors"
                    >
                        Baixar Arquivo Diretamente
                    </a>
                </div>
            )}

            {/* GRID PRINCIPAL: CONTROLES À ESQUERDA, VISUALIZADOR & AÇÕES À DIREITA */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-start">
                
                {/* COLUNA ESQUERDA: CONTROLES DE ENGENHARIA & IMAGEM (4 COLS) */}
                <div className="lg:col-span-4 space-y-4">

                    {/* CARD 1: SELEÇÃO DA IMAGEM DA EMBALAGEM */}
                    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-lg space-y-3.5">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xs font-black uppercase tracking-wider text-pink-400 flex items-center gap-1.5">
                                <Upload size={14} /> 1. Imagem da Embalagem
                            </h2>
                            {packagingImageUrl && (
                                <button
                                    type="button"
                                    onClick={() => setPackagingImageUrl(null)}
                                    className="text-[10px] text-slate-400 hover:text-red-400 transition-colors"
                                >
                                    Remover
                                </button>
                            )}
                        </div>

                        {/* Dropzone ou Thumbnail da imagem atual */}
                        {packagingImageUrl ? (
                            <div className="relative rounded-xl overflow-hidden border border-slate-700 bg-slate-950 group">
                                <img
                                    src={packagingImageUrl}
                                    alt={packagingImageName}
                                    className="w-full h-36 object-contain bg-slate-950/60 p-2"
                                />
                                <div className="absolute inset-0 bg-slate-950/80 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-3">
                                    <span className="text-xs font-medium text-slate-200 truncate max-w-full">
                                        {packagingImageName}
                                    </span>
                                    <div className="flex items-center gap-2">
                                        <button
                                            type="button"
                                            onClick={() => fileInputRef.current?.click()}
                                            className="px-2.5 py-1 rounded-lg bg-pink-600 hover:bg-pink-500 text-white text-[11px] font-bold"
                                        >
                                            Trocar Imagem
                                        </button>
                                        {onOpenUpscale && (
                                            <button
                                                type="button"
                                                onClick={() => onOpenUpscale(packagingImageUrl, packagingImageName)}
                                                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 text-[11px] font-semibold border border-cyan-500/30"
                                            >
                                                Upscale 4x
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div
                                onClick={() => fileInputRef.current?.click()}
                                className="border-2 border-dashed border-slate-700 hover:border-pink-500/60 rounded-xl p-5 text-center cursor-pointer transition-all bg-slate-950/40 hover:bg-pink-500/5 group"
                            >
                                <div className="w-10 h-10 rounded-full bg-slate-800 group-hover:bg-pink-500/20 text-slate-400 group-hover:text-pink-400 flex items-center justify-center mx-auto mb-2 transition-colors">
                                    <Upload size={18} />
                                </div>
                                <p className="text-xs font-bold text-slate-200">
                                    Clique para enviar a imagem da embalagem
                                </p>
                                <p className="text-[11px] text-slate-400 mt-1">
                                    PNG, JPG ou WebP de alta qualidade
                                </p>
                            </div>
                        )}
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleFileUpload}
                        />

                        {/* Amostras Rápidas ou Imagens Disponíveis da Sessão */}
                        {availableImages.length > 0 && (
                            <div className="space-y-1.5 pt-1">
                                <label className="text-[10px] uppercase font-bold text-slate-400">
                                    Usar imagem da sua sessão:
                                </label>
                                <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
                                    {availableImages.slice(0, 5).map(img => (
                                        <button
                                            key={img.id}
                                            type="button"
                                            onClick={() => {
                                                const url = img.previewUrl || (img.base64Data ? `data:${img.mimeType};base64,${img.base64Data}` : '');
                                                if (url) {
                                                    setPackagingImageUrl(url);
                                                    setPackagingImageName(img.name);
                                                    showToast(`Imagem "${img.name}" aplicada!`);
                                                }
                                            }}
                                            className="w-12 h-12 rounded-lg overflow-hidden border border-slate-700 hover:border-pink-400 shrink-0 relative group"
                                            title={img.name}
                                        >
                                            <img
                                                src={img.previewUrl || (img.base64Data ? `data:${img.mimeType};base64,${img.base64Data}` : '')}
                                                alt={img.name}
                                                className="w-full h-full object-cover"
                                            />
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Texturas Prontas */}
                        <div className="space-y-1.5 pt-1 border-t border-slate-800">
                            <label className="text-[10px] uppercase font-bold text-slate-400">
                                Ou escolha um estilo rápido:
                            </label>
                            <div className="grid grid-cols-2 gap-1.5">
                                {SAMPLE_TEXTURES.map((t, idx) => (
                                    <button
                                        key={idx}
                                        type="button"
                                        onClick={() => {
                                            setBackgroundColor(t.color);
                                            showToast(`Tema "${t.name}" aplicado!`);
                                        }}
                                        className="px-2 py-1.5 rounded-lg border border-slate-800 hover:border-slate-700 bg-slate-950 text-left flex items-center gap-2 transition-all text-[11px]"
                                    >
                                        <span
                                            className="w-3.5 h-3.5 rounded-full shrink-0 border border-black/20"
                                            style={{ backgroundColor: t.color }}
                                        />
                                        <span className="truncate text-slate-300">{t.name}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Modo de Ajuste da Imagem na Rede Planificada */}
                        <div className="space-y-1 pt-1">
                            <label className="text-[10px] uppercase font-bold text-slate-400">
                                Mapeamento da Imagem:
                            </label>
                            <div className="grid grid-cols-3 gap-1 text-[10px] font-semibold">
                                <button
                                    type="button"
                                    onClick={() => setImageFitMode('cover')}
                                    className={`py-1.5 px-1 rounded-lg border text-center transition-all ${
                                        imageFitMode === 'cover'
                                            ? 'bg-pink-500/20 text-pink-300 border-pink-500/50'
                                            : 'bg-slate-950 text-slate-400 border-slate-800 hover:bg-slate-800'
                                    }`}
                                >
                                    Envolver Tudo
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setImageFitMode('face_front_only')}
                                    className={`py-1.5 px-1 rounded-lg border text-center transition-all ${
                                        imageFitMode === 'face_front_only'
                                            ? 'bg-pink-500/20 text-pink-300 border-pink-500/50'
                                            : 'bg-slate-950 text-slate-400 border-slate-800 hover:bg-slate-800'
                                    }`}
                                >
                                    Frente Destaque
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setImageFitMode('contain')}
                                    className={`py-1.5 px-1 rounded-lg border text-center transition-all ${
                                        imageFitMode === 'contain'
                                            ? 'bg-pink-500/20 text-pink-300 border-pink-500/50'
                                            : 'bg-slate-950 text-slate-400 border-slate-800 hover:bg-slate-800'
                                    }`}
                                >
                                    Todas as Faces
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* CARD 2: MODELO DE EMBALAGEM & DIMENSÕES */}
                    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-lg space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xs font-black uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                                <Box size={14} /> 2. Modelo & Dimensões
                            </h2>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                                {dimensions.widthMm}x{dimensions.depthMm}x{dimensions.heightMm} mm
                            </span>
                        </div>

                        {/* Seletor de Tipo de Embalagem */}
                        <div className="space-y-1.5">
                            <label className="text-[11px] font-bold text-slate-300">
                                Tipo de Embalagem:
                            </label>
                            <div className="grid grid-cols-2 gap-1.5">
                                {PACKAGING_PRESETS.map(p => (
                                    <button
                                        key={p.id}
                                        type="button"
                                        onClick={() => handleSelectPreset(p.id)}
                                        className={`p-2 rounded-xl border text-left transition-all ${
                                            selectedType === p.id
                                                ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200 shadow-sm'
                                                : 'bg-slate-950/70 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                                        }`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-bold truncate">{p.name.split('(')[0]}</span>
                                            {selectedType === p.id && <Check size={12} className="text-cyan-400 shrink-0" />}
                                        </div>
                                        <span className="text-[9px] text-slate-400 line-clamp-1 mt-0.5">{p.badge}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Dimensões em Milímetros (L x P x A) */}
                        <div className="space-y-2 pt-1 border-t border-slate-800">
                            <div className="flex items-center justify-between">
                                <label className="text-[11px] font-bold text-slate-300">
                                    Cotas da Embalagem (mm):
                                </label>
                                {!netCheck.fitsOnA4 && (
                                    <button
                                        type="button"
                                        onClick={handleAutoFitToA4}
                                        className="text-[10px] font-bold text-amber-400 hover:text-amber-300 underline cursor-pointer"
                                    >
                                        Ajustar para A4
                                    </button>
                                )}
                            </div>

                            <div className="grid grid-cols-3 gap-2">
                                <div className="space-y-1">
                                    <span className="text-[10px] text-slate-400 font-medium">Largura (L):</span>
                                    <div className="flex items-center bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 focus-within:border-cyan-400">
                                        <input
                                            type="number"
                                            min={20}
                                            max={180}
                                            value={dimensions.widthMm}
                                            onChange={e => setDimensions(d => ({ ...d, widthMm: Number(e.target.value) || 20 }))}
                                            className="w-full bg-transparent text-xs font-mono font-bold text-white focus:outline-none"
                                        />
                                        <span className="text-[10px] text-slate-400 font-mono">mm</span>
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <span className="text-[10px] text-slate-400 font-medium">Profundidade (P):</span>
                                    <div className="flex items-center bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 focus-within:border-cyan-400">
                                        <input
                                            type="number"
                                            min={15}
                                            max={180}
                                            value={dimensions.depthMm}
                                            onChange={e => setDimensions(d => ({ ...d, depthMm: Number(e.target.value) || 15 }))}
                                            className="w-full bg-transparent text-xs font-mono font-bold text-white focus:outline-none"
                                        />
                                        <span className="text-[10px] text-slate-400 font-mono">mm</span>
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <span className="text-[10px] text-slate-400 font-medium">Altura (A):</span>
                                    <div className="flex items-center bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 focus-within:border-cyan-400">
                                        <input
                                            type="number"
                                            min={20}
                                            max={240}
                                            value={dimensions.heightMm}
                                            onChange={e => setDimensions(d => ({ ...d, heightMm: Number(e.target.value) || 20 }))}
                                            className="w-full bg-transparent text-xs font-mono font-bold text-white focus:outline-none"
                                        />
                                        <span className="text-[10px] text-slate-400 font-mono">mm</span>
                                    </div>
                                </div>
                            </div>

                            {/* Alerta se ultrapassa folha A4 */}
                            <div className={`p-2.5 rounded-xl border text-[11px] flex items-center justify-between gap-2 ${
                                netCheck.fitsOnA4
                                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                                    : 'bg-amber-500/15 border-amber-500/40 text-amber-200'
                            }`}>
                                <div className="flex items-center gap-1.5">
                                    {netCheck.fitsOnA4 ? <Check size={14} /> : <AlertCircle size={14} />}
                                    <span>
                                        {netCheck.fitsOnA4 
                                            ? 'Cabe perfeitamente em 1 folha A4 (100% escala real)' 
                                            : 'Molde ultrapassa o limite da folha A4!'}
                                    </span>
                                </div>
                                {!netCheck.fitsOnA4 && (
                                    <button
                                        type="button"
                                        onClick={handleAutoFitToA4}
                                        className="px-2 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded text-[10px] shrink-0"
                                    >
                                        Auto-Ajustar
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Orientação da Folha A4 */}
                        <div className="space-y-1 pt-1">
                            <label className="text-[10px] uppercase font-bold text-slate-400">
                                Orientação da Folha A4:
                            </label>
                            <div className="grid grid-cols-2 gap-2 text-xs font-semibold">
                                <button
                                    type="button"
                                    onClick={() => setOrientation('portrait')}
                                    className={`py-1.5 px-2 rounded-lg border text-center transition-all ${
                                        orientation === 'portrait'
                                            ? 'bg-cyan-500/20 text-cyan-200 border-cyan-400'
                                            : 'bg-slate-950 text-slate-400 border-slate-800'
                                    }`}
                                >
                                    Vertical (Retrato)
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setOrientation('landscape')}
                                    className={`py-1.5 px-2 rounded-lg border text-center transition-all ${
                                        orientation === 'landscape'
                                            ? 'bg-cyan-500/20 text-cyan-200 border-cyan-400'
                                            : 'bg-slate-950 text-slate-400 border-slate-800'
                                    }`}
                                >
                                    Horizontal (Paisagem)
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* CARD 3: OPÇÕES DE MARGENS, SANGRIA & ACABAMENTO */}
                    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-lg space-y-3.5">
                        <h2 className="text-xs font-black uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                            <Scissors size={14} /> 3. Sangrias, Corte & Vincos
                        </h2>

                        <div className="grid grid-cols-2 gap-3 text-xs">
                            <div className="space-y-1">
                                <span className="text-[11px] text-slate-300 font-medium">Sangria Técnica:</span>
                                <select
                                    value={bleedMm}
                                    onChange={e => setBleedMm(Number(e.target.value))}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-400"
                                >
                                    <option value={0}>0 mm (Sem sangria)</option>
                                    <option value={1.5}>1.5 mm (Padrão)</option>
                                    <option value={3}>3.0 mm (Recomendado Gráfica)</option>
                                    <option value={5}>5.0 mm (Generosa)</option>
                                </select>
                            </div>

                            <div className="space-y-1">
                                <span className="text-[11px] text-slate-300 font-medium">Aba de Colagem:</span>
                                <select
                                    value={glueTabWidthMm}
                                    onChange={e => setGlueTabWidthMm(Number(e.target.value))}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-400"
                                >
                                    <option value={10}>10 mm (Compacta)</option>
                                    <option value={14}>14 mm (Equilibrada)</option>
                                    <option value={18}>18 mm (Larga / Fácil cola)</option>
                                </select>
                            </div>
                        </div>

                        {/* Toggles de Exibição */}
                        <div className="space-y-2 pt-2 border-t border-slate-800 text-xs">
                            <label className="flex items-center justify-between cursor-pointer">
                                <span className="text-slate-300">Linha de Corte com Tesourinhas (✂)</span>
                                <input
                                    type="checkbox"
                                    checked={showCutScissors}
                                    onChange={e => setShowCutScissors(e.target.checked)}
                                    className="rounded border-slate-700 text-pink-500 focus:ring-pink-500"
                                />
                            </label>

                            <label className="flex items-center justify-between cursor-pointer">
                                <span className="text-slate-300">Vincos Tracejados de Dobra</span>
                                <input
                                    type="checkbox"
                                    checked={showCreaseLines}
                                    onChange={e => setShowCreaseLines(e.target.checked)}
                                    className="rounded border-slate-700 text-pink-500 focus:ring-pink-500"
                                />
                            </label>

                            <label className="flex items-center justify-between cursor-pointer">
                                <span className="text-slate-300">Abas com Texto "COLE AQUI"</span>
                                <input
                                    type="checkbox"
                                    checked={showGlueLabels}
                                    onChange={e => setShowGlueLabels(e.target.checked)}
                                    className="rounded border-slate-700 text-pink-500 focus:ring-pink-500"
                                />
                            </label>

                            <label className="flex items-center justify-between cursor-pointer">
                                <span className="text-slate-300">Régua de Calibração 50mm (5cm)</span>
                                <input
                                    type="checkbox"
                                    checked={showCalibrationRule}
                                    onChange={e => setShowCalibrationRule(e.target.checked)}
                                    className="rounded border-slate-700 text-pink-500 focus:ring-pink-500"
                                />
                            </label>

                            <label className="flex items-center justify-between cursor-pointer">
                                <span className="text-slate-300">Cotas das Faces em Milímetros</span>
                                <input
                                    type="checkbox"
                                    checked={showDimensions}
                                    onChange={e => setShowDimensions(e.target.checked)}
                                    className="rounded border-slate-700 text-pink-500 focus:ring-pink-500"
                                />
                            </label>
                        </div>

                        {/* Personalização de Texto da Caixa */}
                        <div className="space-y-2 pt-2 border-t border-slate-800">
                            <span className="text-[11px] font-bold text-slate-300">Textos na Face Frontal:</span>
                            <div className="space-y-1.5">
                                <input
                                    type="text"
                                    placeholder="Título (ex: Lembrança da Sofia)"
                                    value={customTextTitle}
                                    onChange={e => setCustomTextTitle(e.target.value)}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none focus:border-cyan-400"
                                />
                                <input
                                    type="text"
                                    placeholder="Subtítulo (ex: 5 Aninhos - Obrigado!)"
                                    value={customTextSubtitle}
                                    onChange={e => setCustomTextSubtitle(e.target.value)}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none focus:border-cyan-400"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* COLUNA DIREITA: VISUALIZADOR 2D / 3D & BOTÕES DE EXPORTAÇÃO (8 COLS) */}
                <div className="lg:col-span-8 space-y-4">

                    {/* BARRA SUPERIOR DE VISUALIZAÇÃO (TABS 2D / 3D / GUIA + ZOOM) */}
                    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-2.5 sm:p-3 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-3">
                        <div className="flex items-center gap-1.5 p-1 bg-slate-950 rounded-xl border border-slate-800 w-full sm:w-auto">
                            <button
                                type="button"
                                onClick={() => setViewMode('sheet_2d')}
                                className={`flex-1 sm:flex-none px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                                    viewMode === 'sheet_2d'
                                        ? 'bg-pink-600 text-white shadow-md'
                                        : 'text-slate-400 hover:text-slate-200'
                                }`}
                            >
                                <FileText size={14} /> Molde A4 (2D)
                            </button>
                            <button
                                type="button"
                                onClick={() => setViewMode('mockup_3d')}
                                className={`flex-1 sm:flex-none px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                                    viewMode === 'mockup_3d'
                                        ? 'bg-cyan-600 text-white shadow-md'
                                        : 'text-slate-400 hover:text-slate-200'
                                }`}
                            >
                                <Box size={14} /> Visualização 3D Montada
                            </button>
                            <button
                                type="button"
                                onClick={() => setViewMode('assembly_guide')}
                                className={`flex-1 sm:flex-none px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                                    viewMode === 'assembly_guide'
                                        ? 'bg-emerald-600 text-white shadow-md'
                                        : 'text-slate-400 hover:text-slate-200'
                                }`}
                            >
                                <Info size={14} /> Guia de Dobra
                            </button>
                        </div>

                        {/* Controles de Zoom para 2D */}
                        {viewMode === 'sheet_2d' && (
                            <div className="flex items-center gap-1.5 text-xs text-slate-400">
                                <button
                                    type="button"
                                    onClick={() => setZoomLevel(z => Math.max(0.6, z - 0.15))}
                                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                                    title="Diminuir Zoom"
                                >
                                    <ZoomOut size={14} />
                                </button>
                                <span className="font-mono text-[11px] w-12 text-center">
                                    {Math.round(zoomLevel * 100)}%
                                </span>
                                <button
                                    type="button"
                                    onClick={() => setZoomLevel(z => Math.min(1.8, z + 0.15))}
                                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                                    title="Aumentar Zoom"
                                >
                                    <ZoomIn size={14} />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setZoomLevel(1)}
                                    className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px]"
                                    title="Restaurar 100%"
                                >
                                    100%
                                </button>
                            </div>
                        )}
                    </div>

                    {/* ÁREA DE VISUALIZAÇÃO PRINCIPAL */}
                    <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden p-4 sm:p-6 shadow-2xl relative min-h-[460px] flex items-center justify-center">
                        
                        {/* MODO 1: MOLDE 2D NA FOLHA A4 */}
                        {viewMode === 'sheet_2d' && (
                            <div className="w-full flex items-center justify-center overflow-auto p-2">
                                <div
                                    className="transition-transform duration-200 ease-out shadow-2xl rounded-lg overflow-hidden border border-slate-700/60 bg-white"
                                    style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'center center' }}
                                >
                                    <canvas
                                        ref={previewCanvasRef}
                                        className="max-w-full h-auto block"
                                        style={{ maxHeight: '72vh' }}
                                    />
                                </div>
                            </div>
                        )}

                        {/* MODO 2: VISUALIZAÇÃO 3D ISOMÉTRICA DA EMBALAGEM MONTADA */}
                        {viewMode === 'mockup_3d' && (
                            <div className="w-full max-w-lg mx-auto py-8 text-center space-y-6">
                                <div className="space-y-1">
                                    <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">
                                        Mockup 3D Interativo da Embalagem Fechada
                                    </span>
                                    <p className="text-xs text-slate-400">
                                        Veja como sua embalagem fica estruturada após ser cortada, dobrada e colada.
                                    </p>
                                </div>

                                {/* Renderização Isométrica CSS 3D */}
                                <div className="h-72 flex items-center justify-center perspective-[1000px] select-none">
                                    <div
                                        className="relative transition-transform duration-100 ease-out preserve-3d"
                                        style={{
                                            transform: `rotateX(${rotationX}deg) rotateY(${rotationY}deg)`,
                                            transformStyle: 'preserve-3d',
                                            width: `${Math.min(180, dimensions.widthMm * 2)}px`,
                                            height: `${Math.min(240, dimensions.heightMm * 1.8)}px`
                                        }}
                                    >
                                        {/* Face Frontal */}
                                        <div
                                            className="absolute inset-0 border border-slate-300 rounded shadow-xl flex flex-col items-center justify-center p-3 text-center overflow-hidden"
                                            style={{
                                                backgroundColor: backgroundColor || '#ffffff',
                                                transform: `translateZ(${Math.min(90, dimensions.depthMm)}px)`
                                            }}
                                        >
                                            {packagingImageUrl && (
                                                <img
                                                    src={packagingImageUrl}
                                                    alt="Arte"
                                                    className="w-full h-full object-cover absolute inset-0 opacity-80"
                                                />
                                            )}
                                            <div className="relative z-10 bg-white/80 backdrop-blur-xs p-2 rounded-lg border border-slate-200">
                                                <p className="text-xs font-black text-slate-900 leading-tight">
                                                    {customTextTitle || 'Minha Embalagem'}
                                                </p>
                                                {customTextSubtitle && (
                                                    <p className="text-[10px] text-slate-600 mt-0.5">
                                                        {customTextSubtitle}
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        {/* Face Traseira */}
                                        <div
                                            className="absolute inset-0 border border-slate-300 rounded shadow-lg flex items-center justify-center"
                                            style={{
                                                backgroundColor: backgroundColor || '#ffffff',
                                                transform: `rotateY(180deg) translateZ(${Math.min(90, dimensions.depthMm)}px)`
                                            }}
                                        >
                                            <span className="text-[10px] font-bold text-slate-400 uppercase">
                                                Verso
                                            </span>
                                        </div>

                                        {/* Lateral Direita */}
                                        <div
                                            className="absolute top-0 bottom-0 border border-slate-300 rounded shadow-md flex items-center justify-center overflow-hidden"
                                            style={{
                                                width: `${Math.min(180, dimensions.depthMm * 2)}px`,
                                                backgroundColor: backgroundColor || '#f8fafc',
                                                left: '100%',
                                                transformOrigin: 'left',
                                                transform: `rotateY(90deg)`
                                            }}
                                        >
                                            <span className="text-[10px] font-bold text-slate-400 rotate-90">
                                                Lateral
                                            </span>
                                        </div>

                                        {/* Lateral Esquerda */}
                                        <div
                                            className="absolute top-0 bottom-0 border border-slate-300 rounded shadow-md flex items-center justify-center overflow-hidden"
                                            style={{
                                                width: `${Math.min(180, dimensions.depthMm * 2)}px`,
                                                backgroundColor: backgroundColor || '#f8fafc',
                                                right: '100%',
                                                transformOrigin: 'right',
                                                transform: `rotateY(-90deg)`
                                            }}
                                        >
                                            <span className="text-[10px] font-bold text-slate-400 -rotate-90">
                                                Lateral
                                            </span>
                                        </div>

                                        {/* Topo / Tampa */}
                                        <div
                                            className="absolute left-0 right-0 border border-slate-300 rounded shadow-md flex items-center justify-center"
                                            style={{
                                                height: `${Math.min(180, dimensions.depthMm * 2)}px`,
                                                backgroundColor: backgroundColor || '#ffffff',
                                                bottom: '100%',
                                                transformOrigin: 'bottom',
                                                transform: `rotateX(90deg)`
                                            }}
                                        >
                                            <span className="text-[10px] font-bold text-slate-400">
                                                Tampa
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Controles de Rotação 3D */}
                                <div className="flex items-center justify-center gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setRotationY(r => r - 45)}
                                        className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 flex items-center gap-1 font-semibold"
                                    >
                                        <RotateCw size={12} className="-scale-x-100" /> Girar Esquerda
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => { setRotationY(25); setRotationX(15); }}
                                        className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 font-semibold"
                                    >
                                        Vista Padrão
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setRotationY(r => r + 45)}
                                        className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 flex items-center gap-1 font-semibold"
                                    >
                                        Girar Direita <RotateCw size={12} />
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* MODO 3: GUIA DE CORTE, VINCO E MONTAGEM PASSO A PASSO */}
                        {viewMode === 'assembly_guide' && (
                            <div className="w-full max-w-2xl mx-auto py-4 space-y-5 text-slate-200">
                                <div className="text-center space-y-1">
                                    <span className="text-xs font-black text-emerald-400 uppercase tracking-wider">
                                        Instruções Técnicas de Montagem & Acabamento
                                    </span>
                                    <h3 className="text-base sm:text-lg font-bold text-white">
                                        Como Montar Sua Embalagem Perfeita
                                    </h3>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                                    <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5">
                                        <div className="flex items-center gap-2 text-pink-400 font-bold text-xs">
                                            <span className="w-5 h-5 rounded-full bg-pink-500/20 flex items-center justify-center text-[11px]">1</span>
                                            Impressão da Folha A4
                                        </div>
                                        <p className="text-[11px] text-slate-400 leading-relaxed">
                                            Imprima em papel de gramatura entre <strong>180g e 240g</strong> (Offset, Fotográfico Matte ou Kraft). Certifique-se de marcar <strong>"Tamanho Real" ou "Escala 100%"</strong> na impressora.
                                        </p>
                                    </div>

                                    <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5">
                                        <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs">
                                            <span className="w-5 h-5 rounded-full bg-cyan-500/20 flex items-center justify-center text-[11px]">2</span>
                                            Corte nas Linhas Contínuas
                                        </div>
                                        <p className="text-[11px] text-slate-400 leading-relaxed">
                                            Utilize tesoura afiada ou estilete com régua de metal. Siga rigorosamente o contorno contínuo preto ✂.
                                        </p>
                                    </div>

                                    <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5">
                                        <div className="flex items-center gap-2 text-indigo-400 font-bold text-xs">
                                            <span className="w-5 h-5 rounded-full bg-indigo-500/20 flex items-center justify-center text-[11px]">3</span>
                                            Vincagem com Boleador
                                        </div>
                                        <p className="text-[11px] text-slate-400 leading-relaxed">
                                            Nas linhas tracejadas, passe uma ponta seca (caneta sem tinta ou boleador) com auxílio da régua. Isso garante dobras sem rachar o papel.
                                        </p>
                                    </div>

                                    <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5">
                                        <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
                                            <span className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center text-[11px]">4</span>
                                            Colagem das Abas Chanfradas
                                        </div>
                                        <p className="text-[11px] text-slate-400 leading-relaxed">
                                            Passe cola branca escolar (PVA), fita dupla-face ou cola bastão exatamente nas áreas marcadas com <strong>"COLE AQUI"</strong> e pressione por 15 segundos.
                                        </p>
                                    </div>
                                </div>

                                <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-300 flex items-center gap-2.5">
                                    <Check size={18} className="shrink-0" />
                                    <span>
                                        <strong>Dica Pro:</strong> Meça com uma régua física a linha de 50mm no rodapé da folha após imprimir para certificar que a embalagem ficou nas medidas exatas!
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* BOTÕES DE EXPORTAÇÃO & DOWNLOAD EM FOLHA A4 */}
                    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-lg space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-black uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                                <Download size={14} className="text-pink-400" /> Baixar Folha A4 Pronta para Impressão
                            </span>
                            <span className="text-[10px] text-slate-400">
                                Resolução Máxima 300 DPI
                            </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            {/* BOTÃO 1: PNG 300 DPI */}
                            <button
                                type="button"
                                disabled={isExportingPng}
                                onClick={handleDownloadHighResPng}
                                className="py-3 px-4 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-pink-600 via-rose-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 shadow-lg shadow-pink-500/20 border border-pink-400/40 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                            >
                                {isExportingPng ? (
                                    <>
                                        <RefreshCw size={15} className="animate-spin" /> Renderizando...
                                    </>
                                ) : (
                                    <>
                                        <Download size={15} /> Baixar Imagem A4 (PNG 300 DPI)
                                    </>
                                )}
                            </button>

                            {/* BOTÃO 2: PDF VETORIAL A4 */}
                            <button
                                type="button"
                                disabled={isExportingPdf}
                                onClick={handleDownloadPrintablePdf}
                                className="py-3 px-4 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 shadow-lg shadow-cyan-500/20 border border-cyan-400/40 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                            >
                                {isExportingPdf ? (
                                    <>
                                        <RefreshCw size={15} className="animate-spin" /> Gerando PDF...
                                    </>
                                ) : (
                                    <>
                                        <FileText size={15} /> Baixar PDF A4 (Escala 1:1)
                                    </>
                                )}
                            </button>

                            {/* BOTÃO 3: IMPRIMIR DIRETAMENTE */}
                            <button
                                type="button"
                                onClick={handleDirectPrint}
                                className="py-3 px-4 rounded-xl font-bold text-xs text-slate-100 bg-slate-800 hover:bg-slate-700 border border-slate-600 flex items-center justify-center gap-2 transition-all cursor-pointer"
                            >
                                <Printer size={15} className="text-emerald-400" /> Imprimir Diretamente
                            </button>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};
