
import React, { useState, useRef, useEffect } from 'react';
import { ZoomIn, ZoomOut, RotateCcw, X, Scissors, Crop as CropIcon, Check, Ban, Circle, Square, Wand2 } from 'lucide-react';

interface ImagePreviewProps {
    src: string;
    alt: string;
    onRemove: () => void;
    onRemoveBackground: () => void;
    isRemovingBackground: boolean;
    onCropSave?: (croppedFile: File) => void;
    onOpenImageEditor?: () => void;
}

type CropShape = 'rect' | 'circle';

export const ImagePreview: React.FC<ImagePreviewProps> = ({ 
    src, 
    alt, 
    onRemove, 
    onRemoveBackground, 
    isRemovingBackground,
    onCropSave,
    onOpenImageEditor
}) => {
    const [scale, setScale] = useState(1);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    
    // Crop states
    const [isCropping, setIsCropping] = useState(false);
    const [cropShape, setCropShape] = useState<CropShape>('rect');
    const [cropRect, setCropRect] = useState({ x: 10, y: 10, width: 80, height: 80 }); // percentual
    const [isResizing, setIsResizing] = useState(false);
    const [isMovingCrop, setIsMovingCrop] = useState(false);
    
    const containerRef = useRef<HTMLDivElement>(null);
    const imgRef = useRef<HTMLImageElement>(null);

    const handleZoomIn = () => setScale(prev => Math.min(prev + 0.5, 4));
    const handleZoomOut = () => {
        setScale(prev => {
            const newScale = Math.max(prev - 0.5, 1);
            if (newScale === 1) setPosition({ x: 0, y: 0 });
            return newScale;
        });
    };
    const handleReset = () => {
        setScale(1);
        setPosition({ x: 0, y: 0 });
        setIsCropping(false);
    };

    const getEventPos = (e: React.MouseEvent | React.TouchEvent | TouchEvent | MouseEvent) => {
        if ('touches' in e) {
            return { x: e.touches[0].clientX, y: e.touches[0].clientY };
        }
        return { x: (e as MouseEvent).clientX, y: (e as MouseEvent).clientY };
    };

    const onStart = (e: React.MouseEvent | React.TouchEvent) => {
        if (isCropping) return;
        const pos = getEventPos(e);
        if (scale > 1) {
            setIsDragging(true);
            setDragStart({ x: pos.x - position.x, y: pos.y - position.y });
        }
    };

    const onMove = (e: React.MouseEvent | React.TouchEvent) => {
        if (isCropping) return;
        if (isDragging && scale > 1) {
            if (e.cancelable) e.preventDefault();
            const pos = getEventPos(e);
            setPosition({
                x: pos.x - dragStart.x,
                y: pos.y - dragStart.y
            });
        }
    };

    const onEnd = () => {
        setIsDragging(false);
        setIsResizing(false);
        setIsMovingCrop(false);
    };

    const toggleCropMode = () => {
        if (!isCropping) {
            setScale(1);
            setPosition({ x: 0, y: 0 });
        }
        setIsCropping(!isCropping);
    };

    const applyCrop = async () => {
        if (!imgRef.current || !onCropSave) return;

        const img = imgRef.current;
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const startX = (cropRect.x / 100) * img.naturalWidth;
        const startY = (cropRect.y / 100) * img.naturalHeight;
        const width = (cropRect.width / 100) * img.naturalWidth;
        const height = (cropRect.height / 100) * img.naturalHeight;

        canvas.width = width;
        canvas.height = height;

        if (cropShape === 'circle') {
            ctx.beginPath();
            ctx.arc(width / 2, height / 2, Math.min(width, height) / 2, 0, Math.PI * 2);
            ctx.clip();
        }

        ctx.drawImage(img, startX, startY, width, height, 0, 0, width, height);

        canvas.toBlob((blob) => {
            if (blob) {
                const croppedFile = new File([blob], `cropped-${Date.now()}.png`, { type: 'image/png' });
                onCropSave(croppedFile);
                setIsCropping(false);
            }
        }, 'image/png');
    };

    const handleCropInteraction = (e: React.MouseEvent | React.TouchEvent) => {
        if (!isCropping || !containerRef.current || (!isMovingCrop && !isResizing)) return;
        
        const pos = getEventPos(e);
        const rect = containerRef.current.getBoundingClientRect();
        const mouseX = ((pos.x - rect.left) / rect.width) * 100;
        const mouseY = ((pos.y - rect.top) / rect.height) * 100;

        if (isMovingCrop) {
            setCropRect(prev => ({
                ...prev,
                x: Math.max(0, Math.min(100 - prev.width, mouseX - dragStart.x)),
                y: Math.max(0, Math.min(100 - prev.height, mouseY - dragStart.y))
            }));
        } else if (isResizing) {
            // Fix: Access state safely through functional update to avoid 'prev' is not defined error
            setCropRect(prev => {
                let newWidth = Math.max(10, Math.min(100 - prev.x, mouseX - prev.x));
                let newHeight = Math.max(10, Math.min(100 - prev.y, mouseY - prev.y));
                
                if (cropShape === 'circle') {
                    const size = Math.min(newWidth, newHeight);
                    newWidth = size;
                    newHeight = size;
                }

                return {
                    ...prev,
                    width: newWidth,
                    height: newHeight
                };
            });
        }
    };

    const startMoving = (e: React.MouseEvent | React.TouchEvent) => {
        if (e.cancelable) e.preventDefault();
        e.stopPropagation();
        setIsMovingCrop(true);
        const pos = getEventPos(e);
        const rect = containerRef.current!.getBoundingClientRect();
        setDragStart({ 
            x: ((pos.x - rect.left) / rect.width) * 100 - cropRect.x,
            y: ((pos.y - rect.top) / rect.height) * 100 - cropRect.y
        });
    };

    const startResizing = (e: React.MouseEvent | React.TouchEvent) => {
        if (e.cancelable) e.preventDefault();
        e.stopPropagation();
        setIsResizing(true);
    };

    return (
        <div 
            ref={containerRef}
            className="relative group rounded-xl overflow-hidden border border-slate-700 bg-slate-900 shadow-2xl w-full h-[500px] flex items-center justify-center bg-slate-950/50 select-none touch-none"
            onMouseLeave={onEnd}
            onMouseUp={onEnd}
            onTouchEnd={onEnd}
            onMouseMove={handleCropInteraction}
            onTouchMove={isCropping ? handleCropInteraction : onMove}
        >
            <div 
                className="w-full h-full flex items-center justify-center overflow-hidden"
                onMouseDown={onStart}
                onTouchStart={onStart}
                style={{ cursor: isCropping ? 'default' : (scale > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default') }}
            >
                <img 
                    ref={imgRef}
                    src={src} 
                    alt={alt} 
                    draggable={false}
                    className={`max-w-full max-h-full object-contain transition-transform duration-200 ease-out origin-center ${isRemovingBackground ? 'brightness-110 grayscale-[0.5]' : ''}`}
                    style={{ 
                        transform: isCropping ? 'none' : `translate(${position.x}px, ${position.y}px) scale(${scale})` 
                    }}
                />
            </div>

            {/* Crop Overlay */}
            {isCropping && (
                <div className="absolute inset-0 z-30 pointer-events-none">
                    <div className="absolute inset-0 bg-black/60" />
                    <div 
                        className={`absolute border-2 border-blue-400 bg-transparent shadow-[0_0_0_9999px_rgba(0,0,0,0.5)] pointer-events-auto cursor-move ${cropShape === 'circle' ? 'rounded-full' : ''}`}
                        style={{
                            left: `${cropRect.x}%`,
                            top: `${cropRect.y}%`,
                            width: `${cropRect.width}%`,
                            height: `${cropRect.height}%`,
                        }}
                        onMouseDown={startMoving}
                        onTouchStart={startMoving}
                    >
                        {/* Resize Handle - Larger for Touch */}
                        <div 
                            className="absolute -bottom-2 -right-2 w-8 h-8 flex items-center justify-center cursor-nwse-resize z-50"
                            onMouseDown={startResizing}
                            onTouchStart={startResizing}
                        >
                            <div className="w-4 h-4 bg-blue-500 rounded-sm shadow-lg border border-white/20" />
                        </div>
                        
                        <div className="absolute top-0 left-0 p-1 text-[8px] bg-blue-500 text-white font-bold whitespace-nowrap">
                            {cropShape === 'circle' ? 'RECORTE CIRCULAR' : 'RECORTE QUADRADO'}
                        </div>
                    </div>
                </div>
            )}

            {/* Sidebar Controls */}
            <div className="absolute top-4 left-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-40">
                {onOpenImageEditor && (
                    <button 
                        onClick={onOpenImageEditor}
                        className="p-2.5 rounded-xl flex items-center gap-2 text-xs font-bold backdrop-blur-md border border-cyan-400/40 bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 text-white shadow-xl hover:from-blue-500 hover:to-violet-500 transition-all active:scale-95"
                        title="Editar imagem com IA (gemini-3.1-flash-image-preview)"
                    >
                        <Wand2 size={16} className="text-cyan-300" />
                        <span className="hidden sm:inline">Editar c/ IA</span>
                    </button>
                )}

                <button 
                    onClick={onRemoveBackground}
                    className={`p-2.5 rounded-xl flex items-center gap-2 text-xs font-semibold backdrop-blur-md border transition-all ${isRemovingBackground ? 'bg-blue-600 border-blue-500 text-white shadow-lg' : 'bg-slate-900/90 border-slate-700 text-slate-300 hover:bg-slate-800'}`}
                >
                    <Scissors size={16} />
                    <span className="hidden sm:inline">{isRemovingBackground ? 'BG Removido' : 'Remover BG'}</span>
                </button>
                
                <button 
                    onClick={toggleCropMode}
                    className={`p-2.5 rounded-xl flex items-center gap-2 text-xs font-semibold backdrop-blur-md border transition-all ${isCropping ? 'bg-orange-600 border-orange-500 text-white shadow-lg' : 'bg-slate-900/90 border-slate-700 text-slate-300 hover:bg-slate-800'}`}
                >
                    <CropIcon size={16} />
                    <span className="hidden sm:inline">{isCropping ? 'Sair Crop' : 'Recortar'}</span>
                </button>
            </div>

            {/* Crop Action Bar - Bottom UI for Mobile */}
            {isCropping && (
                <div className="absolute bottom-6 inset-x-4 flex flex-col gap-3 z-50">
                    <div className="flex justify-center gap-2">
                         <button 
                            onClick={() => {
                                setCropShape('rect');
                                setCropRect(prev => ({ ...prev, width: 80, height: 80 }));
                            }}
                            className={`p-3 rounded-full border transition-all ${cropShape === 'rect' ? 'bg-blue-500 border-blue-400 text-white' : 'bg-slate-900/90 border-slate-700 text-slate-400'}`}
                        >
                            <Square size={20} />
                        </button>
                        <button 
                            onClick={() => {
                                setCropShape('circle');
                                // Force 1:1 ratio for circle
                                setCropRect(prev => ({ ...prev, width: 60, height: 60 }));
                            }}
                            className={`p-3 rounded-full border transition-all ${cropShape === 'circle' ? 'bg-blue-500 border-blue-400 text-white' : 'bg-slate-900/90 border-slate-700 text-slate-400'}`}
                        >
                            <Circle size={20} />
                        </button>
                    </div>
                    
                    <div className="flex items-center gap-3 bg-slate-900/95 backdrop-blur-xl px-4 py-3 rounded-2xl border border-slate-700 shadow-2xl">
                        <button 
                            onClick={applyCrop}
                            className="flex-1 flex items-center justify-center gap-2 text-sm font-black text-white bg-blue-600 hover:bg-blue-500 py-3 rounded-xl transition-all uppercase tracking-widest active:scale-95"
                        >
                            <Check size={18} /> Confirmar
                        </button>
                        <button 
                            onClick={() => setIsCropping(false)}
                            className="p-3 bg-slate-800 text-slate-300 rounded-xl hover:text-white transition-all active:scale-95"
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>
            )}

            {/* Footer Navigation */}
            {!isCropping && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-3 bg-slate-900/90 backdrop-blur-md px-5 py-2.5 rounded-full border border-slate-700 shadow-xl opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0 z-10">
                    <button onClick={handleZoomOut} disabled={scale <= 1} className="p-2 hover:bg-slate-700 rounded-full text-slate-300 disabled:opacity-50 transition-colors">
                        <ZoomOut size={18} />
                    </button>
                    <span className="text-xs font-mono text-slate-400 w-12 text-center font-bold">{Math.round(scale * 100)}%</span>
                    <button onClick={handleZoomIn} disabled={scale >= 4} className="p-2 hover:bg-slate-700 rounded-full text-slate-300 disabled:opacity-50 transition-colors">
                        <ZoomIn size={18} />
                    </button>
                    <div className="w-px h-5 bg-slate-700 mx-1"></div>
                    <button onClick={handleReset} className="p-2 hover:bg-slate-700 rounded-full text-slate-300 transition-colors">
                        <RotateCcw size={18} />
                    </button>
                </div>
            )}

            {!isCropping && (
                <button 
                    onClick={onRemove}
                    className="absolute top-3 right-3 z-20 p-2.5 bg-red-500/90 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 shadow-lg active:scale-90"
                >
                    <X size={18} />
                </button>
            )}
        </div>
    );
};
