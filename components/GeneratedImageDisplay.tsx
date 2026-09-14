
import React from 'react';
import { Download, Sparkles, Loader2, X, Zap } from 'lucide-react';

interface GeneratedImageDisplayProps {
    imageUrl: string | null;
    isGenerating: boolean;
    onClose: () => void;
}

export const GeneratedImageDisplay: React.FC<GeneratedImageDisplayProps> = ({ 
    imageUrl, 
    isGenerating, 
    onClose
}) => {
    if (!imageUrl && !isGenerating) return null;

    return (
        <div className="bg-slate-800 rounded-xl overflow-hidden border border-slate-700 shadow-xl flex flex-col mt-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="bg-slate-900/60 px-5 py-3 border-b border-slate-700 flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-300 font-medium">
                    <Sparkles size={18} className="text-yellow-400" />
                    Visual Result
                </div>
                <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
                    <X size={18} />
                </button>
            </div>

            <div className="relative min-h-[300px] flex items-center justify-center bg-slate-950/50 p-4">
                {isGenerating ? (
                    <div className="flex flex-col items-center gap-4 py-20">
                        <Loader2 size={40} className="text-blue-500 animate-spin" />
                        <div className="text-center px-4">
                            <p className="text-slate-200 font-medium">Generating Image...</p>
                            <p className="text-slate-500 text-xs mt-1 max-w-[250px] mx-auto">
                                Bringing your prompt to life with Gemini Flash.
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="relative group">
                        <img 
                            src={imageUrl!} 
                            alt="Generated content" 
                            className="max-w-full rounded-lg shadow-2xl border border-slate-700"
                        />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-4 p-4 rounded-lg">
                            <a 
                                href={imageUrl!} 
                                download="generated-image.png"
                                className="flex items-center justify-center gap-2 bg-slate-700 hover:bg-slate-600 text-white px-6 py-2.5 rounded-full font-bold transition-all shadow-lg text-sm"
                            >
                                <Download size={16} />
                                Download PNG
                            </a>
                        </div>
                    </div>
                )}
            </div>
            
            {!isGenerating && imageUrl && (
                <div className="bg-slate-900/40 px-5 py-2 text-[10px] text-slate-500 flex justify-between items-center border-t border-slate-800">
                    <span className="flex items-center gap-1 uppercase tracking-widest font-bold">
                        <Zap size={10} className="text-blue-400" /> Ready to use
                    </span>
                    <span className="font-mono">GEMINI GENERATIVE ENGINE</span>
                </div>
            )}
        </div>
    );
};
