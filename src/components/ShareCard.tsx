import { AnalysisResult } from '../types';
import { motion } from 'motion/react';
import { X, Download, Leaf, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { domToPng } from 'modern-screenshot';
import Mascot from './Mascot';

interface ShareCardProps {
  result: AnalysisResult | null;
  onClose: () => void;
}

export default function ShareCard({ result, onClose }: ShareCardProps) {
  const [isSaving, setIsSaving] = useState(false);
  if (!result) return null;

  const handleDownload = async () => {
    const area = document.getElementById('capture-area');
    if (!area || isSaving) return;

    setIsSaving(true);
    try {
      // modern-screenshot is much better with oklab/oklch and drop-shadows
      const dataUrl = await domToPng(area, {
        scale: 2,
        backgroundColor: '#071009',
        features: {
          // Ensure we capture everything correctly
          removeControlCharacter: true,
        }
      });
      
      const link = document.createElement('a');
      link.download = `moyacchi-eco-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error("Save failed", error);
      alert("Moyacchi's ink ran out! Try again. 🎨");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="glass-card w-full max-w-sm shadow-2xl overflow-hidden flex flex-col border-primary/20 bg-[#071009]/95 max-h-[90vh]"
      >
        <div className="flex-1 overflow-y-auto scrollbar-hide">
          <div className="relative">
            <button 
              onClick={onClose}
              className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors z-[70]"
            >
              <X className="w-5 h-5 text-text-main" />
            </button>

            {/* Card Content for Capture */}
            <div id="capture-area" className="p-10 flex flex-col items-center text-center space-y-6 bg-[#071009]">
              <div className="flex items-center gap-2 text-primary font-black tracking-[0.2em] uppercase text-[10px]">
                <Leaf className="w-4 h-4 fill-primary" />
                Moyacchi Habit Log
              </div>

              <Mascot size="md" mood="cheering" stage={result.mascotStage} />

              <div className="space-y-1">
                <div className="text-[10px] font-bold text-text-dim uppercase tracking-widest">DAILY ECO SCORE</div>
                <div className="text-8xl font-black text-primary leading-none drop-shadow-[0_0_20px_rgba(166,255,0,0.3)]">{result.score}</div>
                <div className="text-lg font-bold text-white tracking-wide uppercase">{result.grade}</div>
              </div>

              <div className="bg-white/5 p-6 rounded-3xl border border-glass-border w-full text-sm italic text-text-main leading-relaxed">
                "{result.encouragement}"
              </div>

              <div className="bg-primary/10 border border-primary/20 rounded-xl px-4 py-2 w-full">
                <p className="text-[10px] font-black uppercase text-primary tracking-widest mb-1">Impact Metaphor</p>
                <p className="text-[11px] text-text-main font-medium">Saved enough for {result.metaphor}!</p>
              </div>

              <div className="text-[9px] text-text-dim font-bold tracking-[0.3em] uppercase pt-4">
                MOYACCHI.ECO
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 bg-white/5 border-t border-glass-border">
          <button 
            onClick={handleDownload}
            disabled={isSaving}
            className="btn-primary w-full flex items-center justify-center gap-3 py-4 shadow-[0_0_20px_rgba(166,255,0,0.1)]"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Generating PNG...
              </>
            ) : (
              <>
                <Download className="w-5 h-5" />
                Save Log Image
              </>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
