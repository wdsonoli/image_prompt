
import React, { useRef, useState, useEffect } from 'react';
import { Upload, Image as ImageIcon, Link2, Globe, Clipboard, Loader2, AlertCircle, X, Check, Sparkles, ArrowRight, ClipboardPaste } from 'lucide-react';
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
    const fileInputRef = useRef<HTMLInputElement>(null);
    const urlInputRef = useRef<HTMLInputElement>(null);

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

    const handlePasteFromClipboard = async () => {
        try {
            if (!navigator.clipboard || !navigator.clipboard.readText) {
                setInlineError('Seu navegador não suporta leitura direta da área de transferência. Use Ctrl+V para colar.');
                return;
            }
            const text = await navigator.clipboard.readText();
            if (text) {
                const cleaned = extractImageUrlFromText(text);
                setUrlInput(cleaned);
                setPasteSuccess(true);
                setTimeout(() => setPasteSuccess(false), 2000);
                if (cleaned.startsWith('http://') || cleaned.startsWith('https://') || cleaned.startsWith('data:image/')) {
                    processUrl(cleaned);
                }
            } else {
                setInlineError('Nenhum link encontrado na área de transferência.');
            }
        } catch (err) {
            setInlineError('Permissão para acessar a área de transferência não concedida. Cole manualmente com Ctrl+V.');
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
                <div id="dropzone-link-area" className="p-6 sm:p-8 space-y-6 animate-in fade-in duration-200">
                    <div className="text-center sm:text-left">
                        <div className="flex items-center gap-2 justify-center sm:justify-start mb-1">
                            <Globe size={18} className="text-blue-400" />
                            <h3 className="text-base sm:text-lg font-bold text-slate-200">
                                Importar Imagem por Link
                            </h3>
                        </div>
                        <p className="text-slate-400 text-xs sm:text-sm">
                            Aceita qualquer link que contenha imagem: URLs diretas, Unsplash, Pinterest, Google Imagens, páginas web com imagem ou Base64.
                        </p>
                    </div>

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
                                disabled={isLoadingUrl}
                                placeholder="Cole aqui o link da imagem (ex: https://...)"
                                className="w-full bg-slate-950/80 border border-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-slate-100 placeholder-slate-500 text-sm rounded-xl pl-10 pr-24 py-3 outline-none transition-all"
                            />

                            <div className="absolute right-2.5 flex items-center gap-1.5">
                                {urlInput && !isLoadingUrl && (
                                    <button
                                        id="btn-clear-url"
                                        type="button"
                                        onClick={() => {
                                            setUrlInput('');
                                            setInlineError(null);
                                        }}
                                        className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                                        title="Limpar"
                                    >
                                        <X size={15} />
                                    </button>
                                )}

                                <button
                                    id="btn-paste-clipboard"
                                    type="button"
                                    onClick={handlePasteFromClipboard}
                                    disabled={isLoadingUrl}
                                    className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors border border-slate-700 flex items-center gap-1"
                                    title="Colar da área de transferência"
                                >
                                    {pasteSuccess ? (
                                        <>
                                            <Check size={13} className="text-emerald-400" />
                                            <span className="text-emerald-400 text-[11px]">Colado!</span>
                                        </>
                                    ) : (
                                        <>
                                            <Clipboard size={13} />
                                            <span className="hidden sm:inline text-[11px]">Colar</span>
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

