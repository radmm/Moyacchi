import { HistoryItem } from '../types';
import { motion } from 'motion/react';

interface TrendTrackerProps {
  history: HistoryItem[];
}

export default function TrendTracker({ history }: TrendTrackerProps) {
  // Pad history to 7 days for the chart
  const last7Days = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dateStr = d.toISOString().split('T')[0];
    const item = history.find(h => h.date === dateStr);
    return {
      date: dateStr,
      score: item?.analysis.score || 0,
      label: d.toLocaleDateString('en-US', { weekday: 'narrow' }),
      isCurrent: i === 6
    };
  });

  return (
    <div className="glass-card p-6 flex flex-col gap-6 h-[220px]">
      <h3 className="text-[11px] font-bold text-text-dim text-center uppercase tracking-[0.2em]">7-Day Score Trend</h3>
      
      <div className="flex items-end justify-between h-full gap-2 px-2">
        {last7Days.map((day) => (
          <div key={day.date} className="flex-1 flex flex-col items-center gap-2 group relative">
            <div className="relative w-full flex justify-center items-end h-full">
              {/* Score tooltip on hover */}
              <div className="absolute -top-6 px-1.5 py-0.5 bg-primary text-black text-[9px] font-bold rounded opacity-0 group-hover:opacity-100 transition-opacity z-10">
                {day.score}
              </div>
              
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: `${day.score || 5}%` }}
                className={`w-full max-w-[14px] rounded-t-sm transition-all duration-500 ${
                  day.isCurrent 
                    ? 'bg-primary shadow-[0_0_15px_rgba(166,255,0,0.4)]' 
                    : 'bg-white/10 group-hover:bg-white/20'
                }`}
              />
            </div>
            <span className={`text-[9px] font-bold ${day.isCurrent ? 'text-primary' : 'text-text-dim'}`}>
              {day.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
