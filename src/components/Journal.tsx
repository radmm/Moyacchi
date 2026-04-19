import React from 'react';
import { motion } from 'motion/react';
import { Book, Calendar, Quote, Leaf, ChevronRight, Share2 } from 'lucide-react';
import { HistoryItem } from '../types';

interface JournalProps {
  history: HistoryItem[];
  onShare: (item: HistoryItem) => void;
}

export default function Journal({ history, onShare }: JournalProps) {
  if (history.length === 0) {
    return (
      <div className="py-20 text-center space-y-4">
        <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto border border-white/5">
          <Book className="w-8 h-8 text-text-dim" />
        </div>
        <p className="text-text-dim italic font-serif">Your eco-journey starts today. Begin logging to see your journal grow.</p>
      </div>
    );
  }

  // Group by month
  const groupedHistory = history.reduce((acc, item) => {
    const month = new Date(item.date).toLocaleString('default', { month: 'long', year: 'numeric' });
    if (!acc[month]) acc[month] = [];
    acc[month].push(item);
    return acc;
  }, {} as Record<string, HistoryItem[]>);

  return (
    <div className="space-y-16 py-10">
      <div className="flex items-center justify-between border-b border-white/10 pb-6">
        <div className="space-y-1">
          <h2 className="text-3xl font-serif italic text-white">Journal</h2>
          <p className="text-[10px] text-text-dim uppercase tracking-[0.3em]">The Ledger of Light</p>
        </div>
        <Quote className="w-8 h-8 text-primary/20 rotate-180" />
      </div>

      {Object.entries(groupedHistory).map(([month, items]) => (
        <section key={month} className="space-y-10 relative">
          <div className="sticky top-0 z-10 py-4 bg-black/50 backdrop-blur-md">
            <h3 className="text-lg font-bold text-primary uppercase tracking-[0.4em] flex items-center gap-4">
              <span className="w-8 h-[1px] bg-primary/30" />
              {month}
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {items.map((item, idx) => (
              <motion.div
                key={item.date}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="group relative"
              >
                <div className="glass-card p-8 border-white/5 bg-white/[0.02] hover:bg-white/[0.05] transition-all group-hover:border-primary/20 relative overflow-hidden">
                  {/* Large background date - fixed alignment */}
                  <div className="absolute -right-2 -top-4 pointer-events-none select-none opacity-5 group-hover:opacity-10 transition-opacity">
                    <span className="text-[120px] font-black font-serif leading-none">
                      {new Date(item.date).getDate()}
                    </span>
                  </div>

                  <div className="relative z-10 space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-text-dim text-[10px] uppercase tracking-widest">
                        <Calendar className="w-3 h-3" />
                        {new Date(item.date).toLocaleDateString(undefined, { weekday: 'long', day: 'numeric' })}
                      </div>
                      <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${item.isSummary ? 'bg-secondary/20 text-secondary border border-secondary/30' : 'bg-primary/20 text-primary border border-primary/30'}`}>
                        {item.isSummary ? 'Weekly Summary' : `Score: ${item.analysis.score}`}
                      </div>
                    </div>

                    <p className="text-sm text-text-main leading-relaxed italic border-l-2 border-primary/30 pl-4 opacity-90">
                      "{item.analysis.encouragement}"
                    </p>

                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="w-1 h-1 bg-primary rounded-full" />
                        <span className="text-[11px] text-text-dim uppercase tracking-wider">Top Achievement</span>
                      </div>
                      <p className="text-xs text-text-main">{item.analysis.pros[0]}</p>
                    </div>

                    <div className="pt-6 border-t border-white/5 flex items-center justify-between">
                      <div className="flex items-center gap-2 text-[10px] text-text-dim uppercase tracking-widest font-bold">
                        <Leaf className="w-3 h-3 text-secondary" />
                        {(item.logs?.length ?? 1)} Actions Recorded
                      </div>
                      <button 
                        onClick={() => onShare(item)}
                        className="p-2 hover:bg-white/10 rounded-full text-text-dim hover:text-white transition-colors"
                      >
                        <Share2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
