
import React, { useRef, useState, useEffect } from 'react';
import { 
    Upload, Image as ImageIcon, Link2, Globe, Clipboard, Loader2, 
    AlertCircle, X, Check, Sparkles, ArrowRight, ClipboardPaste, 
    MousePointerClick, ShieldCheck, KeyRound, CheckCircle2, AlertTriangle 
} from 'lucide-react';
import { loadImageFromAnyUrl, extractImageUrlFromText } from '../utils/urlImageLoader';

interface DropZoneProps {
    onFilesSelected: (files: File[]) => void;
    onError?: (message: string | null) => void;
}

type UploadTab = 'file' | 'link';

const EXAMPLE_LINKS = [
    {
        name: 'Natureza HD (Unsplash)',
        url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80'
    },
    {
        name: 'Produto Studio Minimal',
        url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1200&q=80'
    },
    {
        name: 'Arte / Ilustração',
        url: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=1200&q=80'
    }
];

export const DropZone: React.FC<DropZoneProps> = ({ onFilesSelected, onError }) => {
    const [activeTab, setActiveTab] = useState<UploadTab>('file');
    const [isDragOver, setIsDragOver] = useState(false);
    const [urlInput, setUrlInput] = useState('');
    const [isLoadingUrl, setIsLoadingUrl] = useState(false);
    const [inlineError, setInlineError] = useState<string | null>(null);
    const [pasteSuccess, setPasteSuccess] = useState(false);
    const [filePasteFeedback, setFilePasteFeedback] = useState(false);
    const [isReadingClipboard, setIsReadingClipboard] = useState(false);
    const [showPermissionGuide, setShowPermissionGuide] = useState(false);
    const [pasteOnClickEnabled, setPasteOnClickEnabled] = useState<boolean>(() => {
        try {
            const saved = localStorage.getItem('paste_on_click_enabled');
            return saved !== null ? saved === 'true' : true;
        } catch {
            return true;
        }
    });
    const fileInputRef = useRef<HTMLInputElement>(null);
    const urlInputRef = useRef<HTMLInputElement>(null);

    const togglePasteOnClick = () => {
        const next = !pasteOnClickEnabled;
        setPasteOnClickEnabled(next);
        try {
            localStorage.setItem('paste_on_click_enabled', String(next));
        } catch {}
    };

    // Ouvinte para atalho de colagem (Ctrl+V ou Cmd+V)
    useEffect(() => {
        const handleGlobalPaste = async (e: ClipboardEvent) => {
            if (!e.clipboardData) return;

            // 1. Se colou arquivo/blob de imagem diretamente (ex: print da tela, botão direito -> Copiar Imagem)
            const items = Array.from(e.clipboardData.items);
            const imageItem = items.find(item => item.type.startsWith('image/'));
            if (imageItem) {
                const file = imageItem.getAsFile();
                if (file) {
                    const ext = file.type.split('/')[1] || 'png';
                    const namedFile = new File([file], `pasted-image-${Date.now()}.${ext}`, { type: file.type || 'image/png' });
                    setFilePasteFeedback(true);
                    setTimeout(() => setFilePasteFeedback(false), 2000);
                    onFilesSelected([namedFile]);
                    return;
                }
            }

            // 2. Se colou texto com link de imagem ou data URL enquanto o foco não está em outro campo de texto qualquer
            const text = e.clipboardData.getData('text');
            if (text) {
                const trimmed = text.trim();
                if (trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('data:image/')) {
                    const activeEl = document.activeElement;
                    if (activeEl && (activeEl.tagName === 'TEXTAREA' || (activeEl.tagName === 'INPUT' && activeEl !== urlInputRef.current))) {
                        return;
                    }

                    setUrlInput(trimmed);
                    setActiveTab('link');
                    processUrl(trimmed);
                }
            }
        };

        window.addEventListener('paste', handleGlobalPaste);
        return () => window.removeEventListener('paste', handleGlobalPaste);
    }, [onFilesSelected]);

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
    };

    const handleDrop = async (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
        setInlineError(null);

        // 1. Verifica se são arquivos soltos
        const files = (Array.from(e.dataTransfer.files) as File[]).filter(file => {
            const name = file.name.toLowerCase();
            return file.type.startsWith('image/') || name.endsWith('.jiff') || name.endsWith('.jfif');
        });

        if (files.length > 0) {
            onFilesSelected(files);
            return;
        }

        // 2. Se não são arquivos, verifica se arrastou um link de outra aba/site
        const uriList = e.dataTransfer.getData('text/uri-list') || e.dataTransfer.getData('text/plain');
        if (uriList && (uriList.startsWith('http://') || uriList.startsWith('https://') || uriList.startsWith('data:image/'))) {
            setActiveTab('link');
            setUrlInput(uriList);
            await processUrl(uriList);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setInlineError(null);
            onFilesSelected(Array.from(e.target.files));
        }
    };

    const processUrl = async (urlToProcess: string) => {
        const raw = urlToProcess.trim();
        if (!raw) {
            setInlineError('Por favor, informe uma URL ou link de imagem válido.');
            return;
        }

        setIsLoadingUrl(true);
        setInlineError(null);
        if (onError) onError(null);

        try {
            const file = await loadImageFromAnyUrl(raw);
            onFilesSelected([file]);
            setUrlInput('');
        } catch (err: any) {
            const message = err?.message || 'Falha ao carregar imagem a partir do link. Verifique a URL e tente novamente.';
            setInlineError(message);
            if (onError) onError(message);
        } finally {
            setIsLoadingUrl(false);
        }
    };

    const handleUrlSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        processUrl(urlInput);
    };

    const handlePasteFromClipboard = async (autoProcess: boolean = true) => {
        setIsReadingClipboard(true);
        setInlineError(null);
        setShowPermissionGuide(false);
        if (onError) onError(null);

        try {
            // 1. Tenta verificar permissão se a API permissions for suportada
            if (navigator.permissions && navigator.permissions.query) {
                try {
                    const status = await navigator.permissions.query({ name: 'clipboard-read' as any });
                    if (status.state === 'denied') {
                        setShowPermissionGuide(true);
                        setInlineError('Acesso à área de transferência bloqueado pelo navegador. Autorize nas opções do site ou use Ctrl+V.');
                        setIsReadingClipboard(false);
                        return;
                    }
                } catch {
                    // query de clipboard-read não é suportada por todos os navegadores, prossegue para leitura direta
                }
            }

            // 2. Tenta ler texto (link de imagem ou data URI)
            if (navigator.clipboard && navigator.clipboard.readText) {
                const text = await navigator.clipboard.readText();
                if (text && text.trim()) {
                    const cleaned = extractImageUrlFromText(text.trim());
                    setUrlInput(cleaned);
                    setPasteSuccess(true);
                    setTimeout(() => setPasteSuccess(false), 2500);

                    if (autoProcess && (cleaned.startsWith('http://') || cleaned.startsWith('https://') || cleaned.startsWith('data:image/'))) {
                        setIsReadingClipboard(false);
                        await processUrl(cleaned);
                        return;
                    }
                    setIsReadingClipboard(false);
                    return;
                }
            }

            // 3. Se não havia texto no clipboard, verifica se o usuário copiou um arquivo de imagem direto
            if (navigator.clipboard && navigator.clipboard.read) {
                try {
                    const clipboardItems = await navigator.clipboard.read();
                    for (const item of clipboardItems) {
                        const imageType = item.types.find(type => type.startsWith('image/'));
                        if (imageType) {
                            const blob = await item.getType(imageType);
                            const ext = imageType.split('/')[1] || 'png';
                            const file = new File([blob], `pasted-image-${Date.now()}.${ext}`, { type: imageType });
                            setFilePasteFeedback(true);
                            setPasteSuccess(true);
                            setTimeout(() => {
                                setFilePasteFeedback(false);
                                setPasteSuccess(false);
                            }, 2500);
                            onFilesSelected([file]);
                            setIsReadingClipboard(false);
                            return;
                        }
                    }
                } catch (readErr) {
                    console.log('Tentativa de ler blob da área de transferência:', readErr);
                }
            }

            setInlineError('Nenhum link ou imagem foi encontrado na sua área de transferência. Copie um link de imagem (Ctrl+C) e clique novamente.');
        } catch (err: any) {
            console.warn('Permissão ou acesso ao clipboard bloqueado:', err);
            setShowPermissionGuide(true);
            setInlineError('O navegador solicitou autorização para acessar a área de transferência. Clique em "Permitir" na notificação do navegador ou use o atalho Ctrl+V.');
        } finally {
            setIsReadingClipboard(false);
        }
    };

    /**
     * Lê a área de transferência do sistema tentando pegar arquivo de imagem ou link
     */
    const handlePasteImageFromClipboard = async () => {
        setInlineError(null);
        if (onError) onError(null);

        try {
            // Tenta obter via navigator.clipboard.read() (Blob de imagem nativo)
            if (navigator.clipboard && navigator.clipboard.read) {
                try {
                    const clipboardItems = await navigator.clipboard.read();
                    for (const item of clipboardItems) {
                        const imageType = item.types.find(type => type.startsWith('image/'));
                        if (imageType) {
                            const blob = await item.getType(imageType);
                            const ext = imageType.split('/')[1] || 'png';
                            const file = new File([blob], `pasted-image-${Date.now()}.${ext}`, { type: imageType });
                            setFilePasteFeedback(true);
                            setTimeout(() => setFilePasteFeedback(false), 2000);
                            onFilesSelected([file]);
                            return;
                        }
                    }
                } catch (readErr) {
                    console.log('navigator.clipboard.read não permitiu blob direto, tentando readText fallback:', readErr);
                }
            }

            // Se não encontrou blob direto de imagem, tenta ler o texto (link de imagem ou data URI)
            if (navigator.clipboard && navigator.clipboard.readText) {
                const text = await navigator.clipboard.readText();
                if (text && text.trim()) {
                    const cleaned = extractImageUrlFromText(text.trim());
                    if (cleaned.startsWith('http://') || cleaned.startsWith('https://') || cleaned.startsWith('data:image/')) {
                        setActiveTab('link');
                        setUrlInput(cleaned);
                        await processUrl(cleaned);
                        return;
                    }
                }
            }

            setInlineError('Nenhuma imagem ou link de imagem foi detectado na sua área de transferência. Copie uma imagem (Ctrl+C) ou use o atalho Ctrl+V.');
        } catch (err: any) {
            setInlineError('Não foi possível acessar a área de transferência diretamente. Por favor, pressione Ctrl+V no teclado para colar.');
        }
    };

    return (
        <div id="image-upload-container" className="rounded-2xl border border-slate-800 bg-slate-900/90 backdrop-blur-sm overflow-hidden shadow-xl transition-all">
            {/* Seletor de Modo (Abas) */}
            <div className="flex border-b border-slate-800 bg-slate-950/60 p-1.5 gap-1.5">
                <button
                    id="tab-upload-file"
                    type="button"
                    onClick={() => {
                        setActiveTab('file');
                        setInlineError(null);
                    }}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                        activeTab === 'file'
                            ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                    }`}
                >
                    <Upload size={16} />
                    <span>Upload de Arquivo</span>
                </button>

                <button
                    id="tab-upload-link"
                    type="button"
                    onClick={() => {
                        setActiveTab('link');
                        setInlineError(null);
                        setTimeout(() => urlInputRef.current?.focus(), 100);
                    }}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                        activeTab === 'link'
                            ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                    }`}
                >
                    <Link2 size={16} />
                    <span>Enviar via Link (URL)</span>
                </button>
            </div>

            {/* Conteúdo da Aba 1: Arquivo Local / Arrastar */}
            {activeTab === 'file' && (
                <div
                    id="dropzone-file-area"
                    className={`
                        relative border-2 border-dashed m-4 rounded-xl p-8 sm:p-10 text-center transition-all duration-300 group
                        ${isDragOver
                            ? 'border-blue-500 bg-blue-500/10 scale-[0.99]'
                            : 'border-slate-700 hover:border-blue-400 hover:bg-slate-800/40 bg-slate-800/10'
                        }
                    `}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                >
                    <input
                        id="file-input-element"
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept="image/jpeg,image/png,image/webp,image/avif,image/gif,image/svg+xml,.jiff,.jfif"
                        multiple
                        onChange={handleFileChange}
                    />

                    <div className="flex flex-col items-center justify-center space-y-4">
                        <div
                            onClick={() => fileInputRef.current?.click()}
                            className={`p-4 rounded-full bg-slate-800 border border-slate-700 transition-transform duration-300 cursor-pointer ${
                                isDragOver ? 'scale-110 text-blue-400 border-blue-500' : 'text-slate-400 group-hover:text-blue-400 group-hover:border-blue-500/50'
                            }`}
                        >
                            {isDragOver ? <Upload size={38} className="animate-bounce" /> : <ImageIcon size={38} />}
                        </div>

                        <div>
                            <h3 className="text-base sm:text-lg font-bold text-slate-200 mb-1">
                                {isDragOver ? 'Solte as imagens aqui' : 'Arraste e solte imagens ou arquivos aqui'}
                            </h3>
                            <p className="text-slate-400 text-xs sm:text-sm">
                                Suporta JPEG, PNG, WebP, AVIF, GIF, SVG, JFIF • Máx 20MB
                            </p>
                        </div>

                        <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
                            <button
                                id="btn-select-files"
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs sm:text-sm transition-all shadow-lg shadow-blue-600/20 active:scale-95 flex items-center gap-2"
                            >
                                <Upload size={16} />
                                Selecionar do Computador
                            </button>

                            <button
                                id="btn-paste-clipboard-image"
                                type="button"
                                onClick={handlePasteImageFromClipboard}
                                className={`px-4 py-2.5 rounded-xl font-medium text-xs sm:text-sm transition-all border flex items-center gap-2 active:scale-95 ${
                                    filePasteFeedback
                                        ? 'bg-emerald-600/20 border-emerald-500 text-emerald-300'
                                        : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700 hover:border-blue-500/50'
                                }`}
                                title="Colar imagem copiada na área de transferência (Ctrl+V)"
                            >
                                {filePasteFeedback ? (
                                    <>
                                        <Check size={16} className="text-emerald-400" />
                                        <span>Imagem Colada!</span>
                                    </>
                                ) : (
                                    <>
                                        <ClipboardPaste size={16} className="text-blue-400" />
                                        <span>Colar Imagem</span>
                                    </>
                                )}
                            </button>

                            <button
                                id="btn-switch-to-link"
                                type="button"
                                onClick={() => {
                                    setActiveTab('link');
                                    setTimeout(() => urlInputRef.current?.focus(), 100);
                                }}
                                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-xs sm:text-sm transition-all border border-slate-700 flex items-center gap-2 active:scale-95"
                            >
                                <Link2 size={16} />
                                Usar Link / URL
                            </button>
                        </div>

                        <div className="pt-2 text-[11px] text-slate-400 flex items-center gap-1.5 bg-slate-950/40 px-3 py-1.5 rounded-lg border border-slate-800">
                            <Sparkles size={13} className="text-blue-400 shrink-0" />
                            <span>Pressione <strong>Ctrl+V</strong> (ou <strong>Cmd+V</strong>) em qualquer lugar para colar imagens direto da área de transferência</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Conteúdo da Aba 2: Enviar via Link */}
            {activeTab === 'link' && (
                <div id="dropzone-link-area" className="p-6 sm:p-8 space-y-5 animate-in fade-in duration-200">
                    <div className="text-center sm:text-left">
                        <div className="flex items-center gap-2 justify-center sm:justify-start mb-1">
                            <Globe size={18} className="text-blue-400" />
                            <h3 className="text-base sm:text-lg font-bold text-slate-200">
                                Importar Imagem por Link
                            </h3>
                        </div>
                        <p className="text-slate-400 text-xs sm:text-sm">
                            Aceita qualquer link que contenha imagem: URLs diretas, Unsplash, Pinterest, Google Imagens, páginas web ou Base64.
                        </p>
                    </div>

                    {/* Barra de Ação Rápida: Colar com 1 Clique e Autorização */}
                    <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex flex-wrap items-center justify-between gap-3">
                        <button
                            id="btn-prominent-paste-click"
                            type="button"
                            onClick={() => handlePasteFromClipboard(true)}
                            disabled={isLoadingUrl || isReadingClipboard}
                            className={`flex-1 sm:flex-initial px-4 py-2.5 rounded-xl font-semibold text-xs sm:text-sm transition-all shadow-md active:scale-95 flex items-center justify-center gap-2 border ${
                                pasteSuccess
                                    ? 'bg-emerald-600/30 border-emerald-500 text-emerald-200 shadow-emerald-600/20'
                                    : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white border-blue-500/50 shadow-blue-500/25'
                            }`}
                            title="Clique para colar automaticamente o link da sua área de transferência"
                        >
                            {isReadingClipboard ? (
                                <>
                                    <Loader2 size={16} className="animate-spin text-white" />
                                    <span>Lendo Área de Transferência...</span>
                                </>
                            ) : pasteSuccess ? (
                                <>
                                    <CheckCircle2 size={16} className="text-emerald-400" />
                                    <span>Link Colado com Sucesso!</span>
                                </>
                            ) : (
                                <>
                                    <MousePointerClick size={16} className="text-blue-200 animate-pulse" />
                                    <span>Colar Link com 1 Clique</span>
                                </>
                            )}
                        </button>

                        <button
                            id="btn-toggle-paste-on-click"
                            type="button"
                            onClick={togglePasteOnClick}
                            className={`px-3 py-2 rounded-xl text-xs font-medium border flex items-center gap-2 transition-all ${
                                pasteOnClickEnabled
                                    ? 'bg-emerald-950/50 border-emerald-500/50 text-emerald-300 hover:bg-emerald-900/40'
                                    : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                            }`}
                            title="Clique para ativar/desativar a colagem automática ao clicar dentro do campo de texto"
                        >
                            <ShieldCheck size={15} className={pasteOnClickEnabled ? 'text-emerald-400' : 'text-slate-500'} />
                            <span>Colar ao clicar no campo: <strong className="uppercase font-bold tracking-wide">{pasteOnClickEnabled ? 'Autorizado' : 'Inativo'}</strong></span>
                        </button>
                    </div>

                    {/* Card de Ajuda de Permissão quando solicitado ou bloqueado pelo navegador */}
                    {showPermissionGuide && (
                        <div id="clipboard-permission-card" className="p-4 rounded-xl bg-indigo-950/40 border border-indigo-500/40 text-xs text-indigo-200 space-y-2.5 animate-in fade-in duration-200">
                            <div className="flex items-center gap-2 font-bold text-indigo-300 text-sm">
                                <KeyRound size={16} className="text-indigo-400 shrink-0" />
                                <span>Autorizar Colar com 1 Clique no Navegador</span>
                            </div>
                            <p className="text-slate-300 leading-relaxed">
                                Para colar diretamente com um clique, o navegador pode solicitar confirmação de segurança para ler sua área de transferência:
                            </p>
                            <div className="bg-slate-900/80 p-3 rounded-lg border border-indigo-900/50 text-slate-300 space-y-1.5">
                                <div className="flex items-center gap-2">
                                    <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-[11px] shrink-0">1</span>
                                    <span>Clique no botão azul <strong>"Autorizar Agora"</strong> abaixo.</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-[11px] shrink-0">2</span>
                                    <span>Quando o navegador exibir a janela perguntando se permite ver texto/imagens, clique em <strong>"Permitir"</strong>.</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="w-5 h-5 rounded-full bg-slate-700 text-slate-300 flex items-center justify-center font-bold text-[11px] shrink-0">3</span>
                                    <span>Atalho alternativo: você também pode clicar no campo de texto e pressionar <strong>Ctrl+V</strong> (ou <strong>Cmd+V</strong>).</span>
                                </div>
                            </div>
                            <div className="flex flex-wrap items-center gap-2 pt-1">
                                <button
                                    type="button"
                                    onClick={() => handlePasteFromClipboard(true)}
                                    className="px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs flex items-center gap-1.5 transition-all shadow-sm"
                                >
                                    <MousePointerClick size={14} />
                                    <span>Autorizar Agora (Solicitar Permissão)</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        urlInputRef.current?.focus();
                                        setShowPermissionGuide(false);
                                    }}
                                    className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition-colors border border-slate-700"
                                >
                                    <span>Focar Campo para Ctrl+V</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowPermissionGuide(false)}
                                    className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 ml-auto"
                                    title="Fechar"
                                >
                                    <X size={15} />
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Formulário de Input de URL */}
                    <form onSubmit={handleUrlSubmit} className="space-y-3">
                        <div className="relative flex items-center">
                            <div className="absolute left-3.5 text-slate-500 pointer-events-none">
                                <Link2 size={18} />
                            </div>

                            <input
                                id="input-image-url"
                                ref={urlInputRef}
                                type="text"
                                value={urlInput}
                                onChange={(e) => {
                                    setUrlInput(e.target.value);
                                    if (inlineError) setInlineError(null);
                                }}
                                onClick={() => {
                                    if (pasteOnClickEnabled && !urlInput && !isLoadingUrl && !isReadingClipboard) {
                                        handlePasteFromClipboard(true);
                                    }
                                }}
                                disabled={isLoadingUrl}
                                placeholder={pasteOnClickEnabled ? "Clique para colar link automaticamente (ou digite uma URL)" : "Cole aqui o link da imagem (ex: https://...)"}
                                className="w-full bg-slate-950/80 border border-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-slate-100 placeholder-slate-500 text-sm rounded-xl pl-10 pr-36 py-3.5 outline-none transition-all cursor-text"
                            />

                            <div className="absolute right-2 flex items-center gap-1.5">
                                {urlInput && !isLoadingUrl && (
                                    <button
                                        id="btn-clear-url"
                                        type="button"
                                        onClick={() => {
                                            setUrlInput('');
                                            setInlineError(null);
                                        }}
                                        className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                                        title="Limpar link"
                                    >
                                        <X size={15} />
                                    </button>
                                )}

                                <button
                                    id="btn-paste-clipboard"
                                    type="button"
                                    onClick={() => handlePasteFromClipboard(true)}
                                    disabled={isLoadingUrl || isReadingClipboard}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border flex items-center gap-1.5 active:scale-95 ${
                                        pasteSuccess
                                            ? 'bg-emerald-600/30 border-emerald-500 text-emerald-300'
                                            : 'bg-blue-600/20 hover:bg-blue-600/40 text-blue-300 border-blue-500/40 hover:border-blue-400'
                                    }`}
                                    title="Colar link da área de transferência com 1 clique"
                                >
                                    {isReadingClipboard ? (
                                        <>
                                            <Loader2 size={13} className="animate-spin text-blue-400" />
                                            <span className="text-[11px]">Lendo...</span>
                                        </>
                                    ) : pasteSuccess ? (
                                        <>
                                            <Check size={13} className="text-emerald-400" />
                                            <span className="text-emerald-400 text-[11px]">Colado!</span>
                                        </>
                                    ) : (
                                        <>
                                            <MousePointerClick size={14} className="text-blue-400" />
                                            <span className="text-[11px]">Colar com Clique</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Botão de Envio Principal */}
                        <div className="flex flex-col sm:flex-row gap-3">
                            <button
                                id="btn-submit-url"
                                type="submit"
                                disabled={!urlInput.trim() || isLoadingUrl}
                                className="flex-1 py-3 px-5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed text-white font-semibold text-sm transition-all shadow-lg shadow-blue-600/20 active:scale-98 flex items-center justify-center gap-2"
                            >
                                {isLoadingUrl ? (
                                    <>
                                        <Loader2 size={16} className="animate-spin text-white" />
                                        <span>Baixando e Processando Imagem...</span>
                                    </>
                                ) : (
                                    <>
                                        <span>Carregar Imagem</span>
                                        <ArrowRight size={16} />
                                    </>
                                )}
                            </button>

                            <button
                                id="btn-back-to-file"
                                type="button"
                                onClick={() => setActiveTab('file')}
                                disabled={isLoadingUrl}
                                className="py-3 px-4 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 text-sm font-medium transition-all border border-slate-700 flex items-center justify-center gap-2"
                            >
                                <Upload size={15} />
                                <span>Usar Arquivo</span>
                            </button>
                        </div>
                    </form>

                    {/* Mensagem de Erro Inline */}
                    {inlineError && (
                        <div id="url-error-alert" className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-start gap-2.5 animate-in fade-in slide-in-from-top-1">
                            <AlertCircle size={16} className="text-red-400 shrink-0 mt-0.5" />
                            <div className="space-y-1">
                                <p className="font-semibold text-red-200">Não foi possível carregar a imagem</p>
                                <p className="text-red-300/90">{inlineError}</p>
                            </div>
                        </div>
                    )}

                    {/* Exemplos Rápidos para Teste */}
                    <div className="pt-2 border-t border-slate-800/80 space-y-2">
                        <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
                            <span>Exemplos rápidos para testar:</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {EXAMPLE_LINKS.map((item, idx) => (
                                <button
                                    key={idx}
                                    type="button"
                                    onClick={() => {
                                        setUrlInput(item.url);
                                        processUrl(item.url);
                                    }}
                                    disabled={isLoadingUrl}
                                    className="px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-blue-600/20 hover:border-blue-500/50 hover:text-blue-300 text-slate-300 text-xs border border-slate-700/70 transition-all flex items-center gap-1.5"
                                >
                                    <Sparkles size={12} className="text-blue-400" />
                                    <span>{item.name}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Chips de Recursos Aceitos */}
                    <div className="pt-1">
                        <div className="flex flex-wrap gap-1.5">
                            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-1 rounded bg-slate-800 text-slate-400 border border-slate-700/50">
                                URLs Diretas (JPG, PNG, WebP)
                            </span>
                            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-1 rounded bg-slate-800 text-slate-400 border border-slate-700/50">
                                Google Imagens & Unsplash
                            </span>
                            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-1 rounded bg-slate-800 text-slate-400 border border-slate-700/50">
                                Páginas com Foto (OG Image)
                            </span>
                            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-1 rounded bg-slate-800 text-slate-400 border border-slate-700/50">
                                Base64 Data URI
                            </span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

