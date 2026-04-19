import { AnalysisResult } from '../types';
import { motion } from 'motion/react';
import { CheckCircle2, RefreshCcw, Heart, Share2 } from 'lucide-react';

interface AnalysisViewProps {
  result: AnalysisResult;
  onShare: () => void;
  onReset: () => void;
  onEdit: () => void;
}

export default function AnalysisView({ result, onShare, onReset, onEdit }: AnalysisViewProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="h-full flex flex-col"
    >
      <div className="glass-card flex-1 flex flex-col relative overflow-hidden">
        {/* Glow effect background */}
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-primary/5 to-secondary/5 pointer-events-none" />
        
        <div className="flex-1 overflow-y-auto p-6 md:p-10 scrollbar-hide">
          <div className="flex flex-col lg:flex-row gap-10">
            {/* Score Column */}
            <div className="flex flex-col items-center justify-center text-center space-y-2 lg:border-r border-glass-border lg:pr-10 lg:min-w-[240px]">
              <span className="text-xs font-bold text-text-dim tracking-widest uppercase">Stack Score</span>
              <div className="text-8xl font-black text-primary drop-shadow-[0_0_15px_rgba(166,255,0,0.5)] leading-none mb-2">
                {result.score}
              </div>
              <div className="px-5 py-2 bg-primary/20 text-primary rounded-full font-bold text-sm border border-primary/30 mb-6">
                {result.grade}
              </div>

              <div className="mt-4 p-5 bg-white/5 rounded-2xl border border-glass-border max-w-[200px]">
                <p className="text-[10px] font-black uppercase text-primary tracking-widest mb-2">Real-World Impact</p>
                <p className="text-xs text-text-main italic leading-relaxed">
                  You helped by {result.metaphor} today!
                </p>
              </div>
            </div>

            {/* Details Grid */}
            <div className="flex-1 grid grid-cols-1 xl:grid-cols-2 gap-10">
              <div className="space-y-6">
                <h4 className="text-[11px] font-black tracking-[0.2em] text-primary uppercase flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5" />
                  Eco-Hero Wins
                </h4>
                <div className="grid grid-cols-1 gap-4">
                  {result.pros.map((pro, i) => (
                    <motion.div 
                      key={i} 
                      whileHover={{ x: 5 }}
                      className="bg-white/5 p-5 rounded-2xl text-text-main text-sm border border-glass-border flex items-center gap-5 group transition-all hover:bg-white/10"
                    >
                      <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center flex-shrink-0 text-xs font-black border border-primary/20 group-hover:scale-110 transition-transform">
                        {i + 1}
                      </div>
                      <div className="font-medium opacity-90 leading-snug">{pro}</div>
                    </motion.div>
                  ))}
                </div>
              </div>
              
              <div className="space-y-6">
                <h4 className="text-[11px] font-black tracking-[0.2em] text-secondary uppercase flex items-center gap-2">
                  <RefreshCcw className="w-5 h-5" />
                  Green Swaps
                </h4>
                <div className="grid grid-cols-1 gap-4">
                  {result.swaps.map((swap, i) => (
                    <motion.div 
                      key={i} 
                      whileHover={{ x: 5 }}
                      className="bg-white/5 p-5 rounded-2xl text-text-main text-sm border border-glass-border flex items-center gap-5 group transition-all hover:bg-white/10"
                    >
                      <div className="w-8 h-8 rounded-full bg-secondary/10 text-secondary flex items-center justify-center flex-shrink-0 text-xs font-black border border-secondary/20 group-hover:scale-110 transition-transform">
                        {i + 1}
                      </div>
                      <div className="font-medium opacity-90 leading-snug">{swap}</div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Actions Button - Now in flow at bottom */}
        <div className="p-6 md:px-10 md:pb-8 flex flex-wrap gap-4 border-t border-glass-border bg-white/5 backdrop-blur-md">
          <button
            onClick={onShare}
            className="btn-primary flex-1 md:flex-none flex items-center justify-center gap-2 shadow-lg px-8"
          >
            <Share2 className="w-5 h-5" />
            Share Card
          </button>
          <div className="flex gap-4 flex-1 md:flex-none">
            <button
              onClick={onEdit}
              className="flex-1 px-8 py-4 bg-white/10 hover:bg-white/20 text-text-main rounded-full font-bold text-sm transition-colors border border-glass-border"
            >
              Back to Stack
            </button>
            <button
              onClick={onReset}
              className="flex-1 px-8 py-4 bg-white/10 hover:bg-white/20 text-text-main rounded-full font-bold text-sm transition-colors border border-glass-border"
            >
              Clear & New
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
