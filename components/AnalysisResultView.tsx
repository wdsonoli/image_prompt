import React, { useState } from 'react';
import { AnalysisResult } from '../types';
import { Palette, Sun, Contrast, Maximize, LayoutTemplate, Copy, Check } from 'lucide-react';
import { Tooltip } from './Tooltip';

interface AnalysisResultViewProps {
    analysis: AnalysisResult;
    imageName: string;
}

export const AnalysisResultView: React.FC<AnalysisResultViewProps> = ({ analysis, imageName }) => {
    const [copiedColor, setCopiedColor] = useState<string | null>(null);
    const [copiedAll, setCopiedAll] = useState(false);

    const handleCopyColor = async (color: string) => {
        try {
            await navigator.clipboard.writeText(color);
            setCopiedColor(color);
            setTimeout(() => setCopiedColor(null), 2000);
        } catch (err) {
            console.error('Falha ao copiar cor', err);
        }
    };

    const handleCopyAllPalette = async () => {
        try {
            const allColors = analysis.colors.dominantColors.join(', ');
            await navigator.clipboard.writeText(allColors);
            setCopiedAll(true);
            setTimeout(() => setCopiedAll(false), 2000);
        } catch (err) {
            console.error('Falha ao copiar paleta completa', err);
        }
    };

    return (
        <div id="visual-analysis-report" className="bg-slate-800/40 border border-violet-500/30 rounded-xl mt-6">
            <div className="bg-violet-500/10 px-4 py-3 border-b border-violet-500/20 flex items-center justify-between rounded-t-xl">
                <div className="flex items-center gap-2 text-violet-400 font-semibold">
                    <Palette size={18} />
                    <span>Visual Analysis Report</span>
                </div>
                <span className="text-xs text-slate-500 font-mono">{imageName}</span>
            </div>
            
            <div className="p-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Colors Section */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <Tooltip content="Clique em qualquer cor para copiar o código HEX." position="right">
                                <h4 className="text-sm font-medium text-slate-400 uppercase tracking-wider w-fit cursor-help">
                                    Detected Palette
                                </h4>
                            </Tooltip>

                            <button
                                id="btn-copy-all-palette"
                                type="button"
                                onClick={handleCopyAllPalette}
                                className="flex items-center gap-1 text-[11px] font-medium text-violet-300 hover:text-violet-100 bg-violet-500/10 hover:bg-violet-500/20 border border-violet-500/30 px-2 py-1 rounded-md transition-all active:scale-95"
                                title="Copiar todos os códigos HEX da paleta"
                            >
                                {copiedAll ? (
                                    <>
                                        <Check size={12} className="text-emerald-400" />
                                        <span className="text-emerald-400 font-bold">Copiada!</span>
                                    </>
                                ) : (
                                    <>
                                        <Copy size={12} />
                                        <span>Copiar Paleta</span>
                                    </>
                                )}
                            </button>
                        </div>

                        <div className="flex flex-wrap gap-2.5 items-center">
                            {analysis.colors.dominantColors.map((color, idx) => {
                                const isThisCopied = copiedColor === color;
                                return (
                                    <Tooltip 
                                        key={idx} 
                                        content={isThisCopied ? `Copiado: ${color}!` : `Clique para copiar ${color}`} 
                                        position="bottom" 
                                        width="w-auto"
                                    >
                                        <button
                                            id={`btn-color-swatch-${idx}`}
                                            type="button"
                                            onClick={() => handleCopyColor(color)}
                                            className="relative group/swatch w-12 h-12 rounded-xl shadow-lg border border-white/15 transition-all duration-200 hover:scale-110 hover:z-20 active:scale-95 flex items-center justify-center cursor-pointer focus:outline-none focus:ring-2 focus:ring-violet-400"
                                            style={{ backgroundColor: color }}
                                            aria-label={`Copiar cor ${color}`}
                                        >
                                            {/* Ícone de cópia ao passar o mouse ou feedback ao copiar */}
                                            <div className={`p-1 rounded-md backdrop-blur-md transition-opacity ${
                                                isThisCopied 
                                                    ? 'opacity-100 bg-black/70 text-emerald-300' 
                                                    : 'opacity-0 group-hover/swatch:opacity-100 bg-black/60 text-white'
                                            }`}>
                                                {isThisCopied ? <Check size={14} className="stroke-[3]" /> : <Copy size={13} />}
                                            </div>
                                        </button>
                                    </Tooltip>
                                );
                            })}
                        </div>

                        <div className="flex items-center gap-2 mt-2">
                            <Tooltip content="Classificação da harmonia das cores da imagem." position="right">
                                <span className="text-xs px-2.5 py-1 rounded-full bg-slate-700/80 border border-slate-600 text-slate-300 capitalize cursor-help font-medium">
                                    {analysis.colors.paletteType} Palette
                                </span>
                            </Tooltip>
                            {copiedColor && (
                                <span className="text-xs text-emerald-400 font-mono animate-in fade-in flex items-center gap-1">
                                    <Check size={12} /> {copiedColor} copiado!
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-3">
                        <Tooltip content="Average luminance of the image pixels." position="top" className="w-full">
                            <StatItem 
                                icon={<Sun size={14} />} 
                                label="Brightness" 
                                value={analysis.brightness} 
                            />
                        </Tooltip>
                        <Tooltip content="Intensity of colors present in the image." position="top" className="w-full">
                            <StatItem 
                                icon={<LayoutTemplate size={14} />} 
                                label="Saturation" 
                                value={analysis.saturation} 
                            />
                        </Tooltip>
                        <Tooltip content="Difference between the lightest and darkest areas." position="bottom" className="w-full">
                            <StatItem 
                                icon={<Contrast size={14} />} 
                                label="Contrast" 
                                value={analysis.contrast} 
                            />
                        </Tooltip>
                        <Tooltip content="Detected aspect ratio category based on dimensions." position="bottom" className="w-full">
                            <StatItem 
                                icon={<Maximize size={14} />} 
                                label="Composition" 
                                value={analysis.composition} 
                            />
                        </Tooltip>
                    </div>
                </div>

                {/* Technical Details */}
                <div className="mt-6 pt-4 border-t border-slate-700/50 flex flex-wrap gap-4 text-xs text-slate-400 font-mono">
                    <span className="flex items-center gap-1">
                        Resolution: <span className="text-slate-300">{analysis.stats.width}x{analysis.stats.height}</span>
                    </span>
                    <span className="flex items-center gap-1">
                        Aspect Ratio: <span className="text-slate-300">{analysis.stats.aspectRatio}:1</span>
                    </span>
                </div>
            </div>
        </div>
    );
};

const StatItem: React.FC<{ icon: React.ReactNode; label: string; value: string }> = ({ icon, label, value }) => (
    <div className="bg-slate-900/50 rounded-lg p-2.5 flex flex-col items-center justify-center border border-slate-700/50 w-full hover:border-violet-500/30 transition-colors cursor-help">
        <div className="flex items-center gap-1.5 text-slate-400 mb-1">
            {icon}
            <span className="text-[10px] uppercase font-bold tracking-wide">{label}</span>
        </div>
        <span className="text-slate-200 font-medium capitalize text-sm">{value}</span>
    </div>
);