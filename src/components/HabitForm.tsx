import React, { useState, useEffect, useRef } from 'react';
import { DailyLog } from '../types';
import { Bus, Utensils, Zap, Send, Camera, Sparkles, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { identifyHabitsFromImage } from '../lib/geminiService';

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
  const [isIdentifying, setIsIdentifying] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Update logic if initialValues change (e.g. when clicking Edit)
  useEffect(() => {
    if (initialValues) {
      setLog(initialValues);
    }
  }, [initialValues]);

  const toBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result?.toString().split(',')[1] || "");
      reader.onerror = error => reject(error);
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsIdentifying(true);
    try {
      const base64 = await toBase64(file);
      const identifiedLog = await identifyHabitsFromImage(base64);
      setLog(identifiedLog);
    } catch (error) {
      alert("Moyacchi's vision is a bit blurred! Try another photo? 📸");
    } finally {
      setIsIdentifying(false);
    }
  };

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
      className="glass-card p-10 flex flex-col h-full space-y-8 relative overflow-hidden"
    >
      <div className="flex items-center justify-between border-b border-white/5 pb-6">
        <div className="space-y-1">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            Daily Logger
            <Sparkles className="w-4 h-4 text-primary animate-pulse" />
          </h3>
          <p className="text-text-dim text-[10px] uppercase tracking-widest font-bold">Manual or Vision Mode</p>
        </div>
        
        <div className="relative">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isIdentifying || isLoading}
            className="px-5 py-2.5 bg-secondary/10 hover:bg-secondary/20 text-secondary border border-secondary/30 rounded-full text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 group disabled:opacity-50"
          >
            <Camera className="w-4 h-4" />
            Easy Mode
          </button>
          <input 
            type="file" 
            accept="image/*" 
            ref={fileInputRef} 
            onChange={handleImageUpload}
            className="hidden" 
          />
        </div>
      </div>

      {isIdentifying && (
        <div className="absolute inset-0 z-20 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center space-y-4">
          <Loader2 className="w-10 h-10 text-primary animate-spin" />
          <p className="text-primary font-bold animate-pulse uppercase tracking-widest text-xs">Moyacchi is seeing your day...</p>
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-8 flex-1">
        <div className="space-y-4">
          <label className="flex items-center gap-2 text-text-dim text-[11px] font-bold tracking-widest uppercase">
            <Bus className="w-4 h-4 text-primary" />
            Transport
          </label>
          <textarea
            placeholder="e.g., Subway commute"
            className="glass-input w-full h-[150px] resize-none p-5"
            value={log.transport}
            onChange={(e) => setLog({ ...log, transport: e.target.value })}
            required
          />
        </div>

        <div className="space-y-4">
          <label className="flex items-center gap-2 text-text-dim text-[11px] font-bold tracking-widest uppercase">
            <Utensils className="w-4 h-4 text-primary" />
            Food
          </label>
          <textarea
            placeholder="e.g., Veggie burger"
            className="glass-input w-full h-[150px] resize-none p-5"
            value={log.food}
            onChange={(e) => setLog({ ...log, food: e.target.value })}
            required
          />
        </div>

        <div className="space-y-4">
          <label className="flex items-center gap-2 text-text-dim text-[11px] font-bold tracking-widest uppercase">
            <Zap className="w-4 h-4 text-primary" />
            Energy
          </label>
          <textarea
            placeholder="e.g., No purchases"
            className="glass-input w-full h-[150px] resize-none p-5"
            value={log.energy}
            onChange={(e) => setLog({ ...log, energy: e.target.value })}
            required
          />
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <button
          type="submit"
          disabled={isLoading || isIdentifying}
          className="btn-primary w-full md:w-auto md:min-w-[280px] py-5 flex items-center justify-center gap-3 text-sm"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Gemini Brain Analyzing...
            </>
          ) : (
            <>
              <Send className="w-5 h-5" />
              Record Habits
            </>
          )}
        </button>
      </div>
    </motion.form>
  );
}
