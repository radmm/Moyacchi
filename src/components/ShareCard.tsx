import { AnalysisResult } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { X, Download, Leaf } from 'lucide-react';
import Mascot from './Mascot';

interface ShareCardProps {
  result: AnalysisResult | null;
  onClose: () => void;
}

export default function ShareCard({ result, onClose }: ShareCardProps) {
  if (!result) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="glass-card w-full max-w-sm shadow-2xl overflow-hidden relative border-primary/20 bg-bg-dark/95"
      >
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors z-20"
        >
          <X className="w-5 h-5 text-text-main" />
        </button>

        {/* Card Content */}
        <div id="capture-area" className="p-10 flex flex-col items-center text-center space-y-6">
          <div className="flex items-center gap-2 text-primary font-black tracking-[0.2em] uppercase text-[10px]">
            <Leaf className="w-4 h-4 fill-primary" />
            Moyacchi Habit Log
          </div>

          <Mascot size="md" mood="cheering" />

          <div className="space-y-1">
            <div className="text-[10px] font-bold text-text-dim uppercase tracking-widest">ECO SCORE</div>
            <div className="text-8xl font-black text-primary leading-none drop-shadow-[0_0_20px_rgba(166,255,0,0.3)]">{result.score}</div>
            <div className="text-lg font-bold text-white tracking-wide">{result.grade}</div>
          </div>

          <div className="bg-white/5 p-5 rounded-3xl border border-glass-border w-full text-sm italic text-text-main leading-relaxed">
            {result.encouragement}
          </div>

          <div className="text-[9px] text-text-dim font-bold tracking-[0.3em] uppercase pt-4">
            MOYACCHI.ECO
          </div>
        </div>

        <div className="p-6 bg-white/5 border-t border-glass-border">
          <button 
            onClick={() => {
              alert("Ready to share with the world! 🌍");
            }}
            className="btn-primary w-full flex items-center justify-center gap-2"
          >
            <Download className="w-5 h-5" />
            Keep on Device
          </button>
        </div>
      </motion.div>
    </div>
  );
}
