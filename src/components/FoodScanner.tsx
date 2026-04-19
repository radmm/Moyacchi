import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Camera, X, ShieldAlert, Leaf, CheckCircle2, Loader2, Sparkles } from 'lucide-react';
import { scanFoodPacket } from '../lib/geminiService';
import { FoodScanResult } from '../types';

interface FoodScannerProps {
  onClose: () => void;
}

export default function FoodScanner({ onClose }: FoodScannerProps) {
  const [result, setResult] = useState<FoodScanResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    try {
      const base64 = await toBase64(file);
      const scanResult = await scanFoodPacket(base64);
      setResult(scanResult);
    } catch (error) {
      alert("Moyacchi couldn't read the label! Try a clearer photo. 📸");
    } finally {
      setIsLoading(false);
    }
  };

  const toBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result?.toString().split(',')[1] || "");
      reader.onerror = error => reject(error);
    });
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="glass-card w-full max-w-xl mx-auto overflow-hidden flex flex-col min-h-[400px]"
    >
      <div className="p-6 border-b border-glass-border flex items-center justify-between bg-white/5">
        <div className="flex items-center gap-3">
          <Camera className="w-6 h-6 text-primary" />
          <h3 className="font-bold text-lg tracking-widest uppercase">Food Packet Scanner</h3>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="p-8 flex-1">
        <AnimatePresence mode="wait">
          {!result && !isLoading && (
            <motion.div 
              key="upload"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center h-full space-y-6 text-center"
            >
              <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
                <Camera className="w-10 h-10 text-primary" />
              </div>
              <div className="space-y-2">
                <h4 className="text-xl font-bold text-white">Scan for Hidden Impact</h4>
                <p className="text-text-dim text-sm max-w-xs mx-auto">
                  Take a photo of an ingredient label to see environmental and health insights.
                </p>
              </div>
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="btn-primary px-10"
              >
                Capture Photo
              </button>
              <input 
                type="file" 
                accept="image/*" 
                capture="environment"
                ref={fileInputRef}
                onChange={handleFileSelect}
                className="hidden"
              />
            </motion.div>
          )}

          {isLoading && (
            <motion.div 
              key="loading"
              className="flex flex-col items-center justify-center h-[300px] space-y-4"
            >
              <Loader2 className="w-12 h-12 text-primary animate-spin" />
              <p className="text-primary font-bold animate-pulse">Moyacchi is analyzing ingredients...</p>
            </motion.div>
          )}

          {result && (
            <motion.div 
              key="result"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
              <div className="text-center space-y-2">
                <h4 className="text-3xl font-black text-white uppercase tracking-tight">{result.productName}</h4>
                <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary/10 text-primary rounded-full border border-primary/20 text-sm font-bold">
                  <Leaf className="w-4 h-4" />
                  Eco-Score: {result.impactScore}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="glass-card p-5 border-red-500/20 bg-red-500/5">
                  <div className="flex items-center gap-2 mb-3 text-red-400">
                    <ShieldAlert className="w-5 h-5" />
                    <h5 className="font-bold text-sm uppercase tracking-wider">Hidden Ingredients</h5>
                  </div>
                  <ul className="space-y-2">
                    {result.hiddenIngredients.map((ing, i) => (
                      <li key={i} className="text-sm text-text-main flex items-center gap-2">
                        <div className="w-1 h-1 bg-red-400 rounded-full" />
                        {ing}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="glass-card p-5 border-primary/20 bg-primary/5">
                  <div className="flex items-center gap-2 mb-3 text-primary">
                    <Sparkles className="w-5 h-5" />
                    <h5 className="font-bold text-sm uppercase tracking-wider">Impact Analysis</h5>
                  </div>
                  <p className="text-xs text-text-main leading-relaxed italic border-b border-white/5 pb-3 mb-3">
                    {result.environmentImpact}
                  </p>
                  <div className="flex items-center gap-2 text-[11px] font-bold text-text-dim uppercase tracking-widest">
                    <CheckCircle2 className="w-4 h-4 text-green-400" />
                    Health: {result.healthImpact}
                  </div>
                </div>
              </div>

              <div className="flex justify-center pt-4">
                <button 
                  onClick={() => setResult(null)}
                  className="px-8 py-3 bg-white/5 hover:bg-white/10 text-text-main rounded-full font-bold text-sm transition-colors border border-glass-border"
                >
                  Scan Another
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
