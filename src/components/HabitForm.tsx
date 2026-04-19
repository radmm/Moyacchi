import React, { useState, useEffect } from 'react';
import { DailyLog } from '../types';
import { Bus, Utensils, Zap, Send } from 'lucide-react';
import { motion } from 'motion/react';

interface HabitFormProps {
  onSubmit: (log: DailyLog) => void;
  isLoading: boolean;
  initialValues?: DailyLog | null;
}

export default function HabitForm({ onSubmit, isLoading, initialValues }: HabitFormProps) {
  const [log, setLog] = useState<DailyLog>(initialValues || {
    transport: '',
    food: '',
    energy: '',
    timestamp: Date.now(),
  });

  // Update logic if initialValues change (e.g. when clicking Edit)
  useEffect(() => {
    if (initialValues) {
      setLog(initialValues);
    }
  }, [initialValues]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!log.transport || !log.food || !log.energy) return;
    onSubmit({ ...log, timestamp: Date.now() });
  };

  return (
    <motion.form 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      onSubmit={handleSubmit}
      className="glass-card p-8 flex flex-col h-full space-y-8"
    >
      <div className="grid md:grid-cols-3 gap-6 flex-1">
        <div className="space-y-3">
          <label className="flex items-center gap-2 text-text-dim text-[11px] font-bold tracking-widest uppercase">
            <Bus className="w-4 h-4 text-primary" />
            Movement
          </label>
          <textarea
            placeholder="e.g., Walked + Subway"
            className="glass-input w-full h-[120px] resize-none"
            value={log.transport}
            onChange={(e) => setLog({ ...log, transport: e.target.value })}
            required
          />
        </div>

        <div className="space-y-3">
          <label className="flex items-center gap-2 text-text-dim text-[11px] font-bold tracking-widest uppercase">
            <Utensils className="w-4 h-4 text-primary" />
            Food
          </label>
          <textarea
            placeholder="e.g., Vegetarian / Home cooked"
            className="glass-input w-full h-[120px] resize-none"
            value={log.food}
            onChange={(e) => setLog({ ...log, food: e.target.value })}
            required
          />
        </div>

        <div className="space-y-3">
          <label className="flex items-center gap-2 text-text-dim text-[11px] font-bold tracking-widest uppercase">
            <Zap className="w-4 h-4 text-primary" />
            Energy & Purchases
          </label>
          <textarea
            placeholder="e.g., No shopping, low AC use"
            className="glass-input w-full h-[120px] resize-none"
            value={log.energy}
            onChange={(e) => setLog({ ...log, energy: e.target.value })}
            required
          />
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isLoading}
          className="btn-primary min-w-[200px] flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full"
              />
              Analyzing...
            </>
          ) : (
            <>
              <Send className="w-5 h-5" />
              Analyze My Day
            </>
          )}
        </button>
      </div>
    </motion.form>
  );
}
