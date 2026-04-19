import { AnalysisResult } from '../types';
import { motion } from 'motion/react';
import { CheckCircle2, RefreshCcw, Heart, Share2 } from 'lucide-react';

interface AnalysisViewProps {
  result: AnalysisResult;
  onShare: () => void;
  onReset: () => void;
}

export default function AnalysisView({ result, onShare, onReset }: AnalysisViewProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="h-full"
    >
      <div className="glass-card p-10 flex flex-col md:flex-row gap-10 h-full relative overflow-hidden">
        {/* Glow effect background */}
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-primary/5 to-secondary/5 pointer-events-none" />
        
        {/* Score Column */}
        <div className="flex flex-col items-center justify-center text-center space-y-2 md:border-r border-glass-border md:pr-10 min-w-[200px]">
          <span className="text-xs font-bold text-text-dim tracking-widest uppercase">Daily Eco Score</span>
          <div className="text-8xl font-black text-primary drop-shadow-[0_0_15px_rgba(166,255,0,0.5)] leading-none mb-2">
            {result.score}
          </div>
          <div className="px-4 py-1.5 bg-primary/20 text-primary rounded-full font-bold text-sm border border-primary/30">
            {result.grade}
          </div>
        </div>

        {/* Details Grid */}
        <div className="flex-1 grid md:grid-cols-2 gap-10">
          <div className="space-y-6">
            <h4 className="text-[11px] font-black tracking-[0.2em] text-primary uppercase flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              What you did well
            </h4>
            <div className="space-y-4">
              {result.pros.map((pro, i) => (
                <div key={i} className="bg-white/5 p-4 rounded-2xl text-text-main text-sm border border-glass-border leading-relaxed">
                  {pro}
                </div>
              ))}
            </div>
          </div>
          
          <div className="space-y-6">
            <h4 className="text-[11px] font-black tracking-[0.2em] text-secondary uppercase flex items-center gap-2">
              <RefreshCcw className="w-4 h-4" />
              Swaps for tomorrow
            </h4>
            <div className="space-y-4">
              {result.swaps.map((swap, i) => (
                <div key={i} className="bg-white/5 p-4 rounded-2xl text-text-main text-sm border border-glass-border leading-relaxed">
                  {swap}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Actions Button (Bottom right) */}
        <div className="absolute bottom-8 right-8 flex gap-3">
          <button
            onClick={onShare}
            className="btn-primary flex items-center gap-2 shadow-lg"
          >
            <Share2 className="w-4 h-4" />
            Share Card
          </button>
          <button
            onClick={onReset}
            className="px-6 py-3 bg-white/10 hover:bg-white/20 text-text-main rounded-full font-bold text-sm transition-colors border border-glass-border"
          >
            Reset
          </button>
        </div>
      </div>
    </motion.div>
  );
}
