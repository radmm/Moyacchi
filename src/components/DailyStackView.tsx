import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Layers, Trash2, Footprints, Utensils, Zap, Plus, Sparkles, Edit2 } from 'lucide-react';
import { DailyLog } from '../types';

interface DailyStackViewProps {
  logs: DailyLog[];
  onRemove: (index: number) => void;
  onEdit: (index: number) => void;
  onClearAll: () => void;
  onAnalyse: () => void;
  isAnalysing: boolean;
}

export default function DailyStackView({ logs, onRemove, onEdit, onClearAll, onAnalyse, isAnalysing }: DailyStackViewProps) {
  if (logs.length === 0) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Layers className="w-5 h-5 text-primary" />
          </div>
          <h3 className="text-xl font-bold text-white italic tracking-tight">Today's Stack</h3>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={onClearAll}
            className="text-[10px] text-red-400/60 hover:text-red-400 uppercase tracking-[0.2em] font-black transition-colors"
          >
            Clear Stack
          </button>
          <div className="text-[10px] text-text-dim uppercase tracking-[0.2em] font-black">
            {logs.length} {logs.length === 1 ? 'Action' : 'Actions'} Added
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <AnimatePresence initial={false}>
          {logs.map((log, idx) => (
            <motion.div
              key={log.timestamp}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass-card group flex items-center gap-4 p-4 border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-all"
            >
              <div className="flex-1 grid grid-cols-3 gap-4">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2 text-[10px] uppercase text-text-dim tracking-widest">
                    <Footprints className="w-3 h-3" />
                  </div>
                  <span className="text-xs font-medium text-white line-clamp-1">{log.transport}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2 text-[10px] uppercase text-text-dim tracking-widest">
                    <Utensils className="w-3 h-3" />
                  </div>
                  <span className="text-xs font-medium text-white line-clamp-1">{log.food}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2 text-[10px] uppercase text-text-dim tracking-widest">
                    <Zap className="w-3 h-3" />
                  </div>
                  <span className="text-xs font-medium text-white line-clamp-1">{log.energy}</span>
                </div>
              </div>
              
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                <button 
                  onClick={() => onEdit(idx)}
                  className="p-2 hover:bg-white/10 rounded-lg text-text-dim hover:text-primary transition-all"
                  title="Edit Entry"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => onRemove(idx)}
                  className="p-2 hover:bg-red-500/20 rounded-lg text-text-dim hover:text-red-400 transition-all"
                  title="Delete Entry"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <div className="pt-4 flex flex-col md:flex-row items-center gap-4">
        <button 
          onClick={onAnalyse}
          disabled={isAnalysing}
          className="w-full md:flex-1 btn-primary py-5 rounded-[24px] flex items-center justify-center gap-3 relative overflow-hidden group shadow-[0_0_40px_rgba(166,255,0,0.15)]"
        >
          {isAnalysing ? (
             <div className="flex items-center gap-2">
               <Sparkles className="w-5 h-5 animate-pulse" />
               <span className="animate-pulse">Consulting Moyacchi...</span>
             </div>
          ) : (
            <>
              <Sparkles className="w-5 h-5 group-hover:animate-spin-slow transition-transform" />
              <span>Full Stack Analysis</span>
            </>
          )}
        </button>
        
        <p className="text-[10px] text-text-dim leading-relaxed text-center italic md:text-left md:max-w-[200px]">
          Adding more entries to your stack gives Moyacchi a better picture of your day!
        </p>
      </div>
    </div>
  );
}
