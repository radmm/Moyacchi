import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Camera, X, ShieldAlert, Leaf, CheckCircle2, Loader2, Sparkles, Box, Recycle, Info } from 'lucide-react';
import { analyseImage } from '../lib/geminiService';
import { ImageAnalysisResult } from '../types';

interface ImageAnalyserProps {
  onClose: () => void;
  isEmbedded?: boolean;
}

export default function ImageAnalyser({ onClose, isEmbedded = false }: ImageAnalyserProps) {
  const [result, setResult] = useState<ImageAnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check if file is too large (> 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert("This image is a bit too heavy for Moyacchi! Try a smaller photo (under 10MB). 📸");
      return;
    }

    setIsLoading(true);
    let isStillLoading = true;
    
    // Set a client-side safety timeout
    const timeout = setTimeout(() => {
      if (isStillLoading) {
        setIsLoading(false);
        isStillLoading = false;
        alert("Moyacchi is taking longer than usual to think. Please try again! 🌿");
      }
    }, 45000); // 45 second timeout for AI vision

    try {
      const base64 = await toBase64(file);
      const scanResult = await analyseImage(base64);
      if (isStillLoading) {
        setResult(scanResult);
      }
    } catch (error) {
      if (isStillLoading) {
        console.error("Analysis Error:", error);
        alert("Moyacchi couldn't analyze the item! Try a clearer photo or a different item. 📸");
      }
    } finally {
      clearTimeout(timeout);
      if (isStillLoading) {
        setIsLoading(false);
        isStillLoading = false;
      }
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

  const containerClasses = isEmbedded 
    ? "w-full max-w-3xl mx-auto overflow-hidden flex flex-col min-h-[500px]" 
    : "glass-card w-full max-w-2xl mx-auto overflow-hidden flex flex-col min-h-[500px]";

  return (
    <motion.div 
      initial={isEmbedded ? {} : { opacity: 0, scale: 0.9 }}
      animate={isEmbedded ? {} : { opacity: 1, scale: 1 }}
      exit={isEmbedded ? {} : { opacity: 0, scale: 0.9 }}
      className={containerClasses}
    >
      {/* Header - Only show if not embedded */}
      {!isEmbedded && (
        <div className="p-6 border-b border-glass-border flex items-center justify-between bg-white/5">
          <div className="flex items-center gap-3">
            <Sparkles className="w-6 h-6 text-primary" />
            <h3 className="font-bold text-lg tracking-widest uppercase">Analyse System</h3>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

      <div className={isEmbedded ? 'p-0 flex-1' : 'p-8 flex-1'}>
        <AnimatePresence mode="wait">
          {!result && !isLoading && (
            <motion.div 
              key="upload"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={`flex flex-col items-center justify-center ${isEmbedded ? 'h-[400px]' : 'h-full'} space-y-6 text-center`}
            >
              <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
                <Camera className="w-10 h-10 text-primary" />
              </div>
              <div className="space-y-2">
                <h4 className="text-xl font-bold text-white">Green-Sight Analyse</h4>
                <p className="text-text-dim text-sm max-w-md mx-auto">
                  Scan food ingredients & packaging. Identify materials, recyclability, and waste classification in real-time.
                </p>
              </div>
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="btn-primary px-10"
              >
                Scan Item
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
              className="flex flex-col items-center justify-center h-[400px] space-y-4"
            >
              <Loader2 className="w-12 h-12 text-primary animate-spin" />
              <p className="text-primary font-bold animate-pulse uppercase tracking-widest text-xs">Green-Sight OCR Active...</p>
            </motion.div>
          )}

          {result && (
            <motion.div 
              key="result"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8 pb-10"
            >
              <div className="text-center space-y-2 pt-4">
                <h4 className="text-3xl font-black text-white uppercase tracking-tight">{result.productName}</h4>
                <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary/10 text-primary rounded-full border border-primary/20 text-sm font-bold">
                  <Leaf className="w-4 h-4" />
                  Eco-Score: {result.impactScore}
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Ingredients Column */}
                <div className="space-y-4">
                  <div className="glass-card p-5 border-yellow-500/20 bg-yellow-500/5">
                    <div className="flex items-center gap-2 mb-3 text-yellow-400">
                      <ShieldAlert className="w-5 h-5" />
                      <h5 className="font-bold text-sm uppercase tracking-wider">Food Analysis</h5>
                    </div>
                    <ul className="space-y-2 mb-4">
                      {result.hiddenIngredients.map((ing, i) => (
                        <li key={i} className="text-xs text-text-main flex items-center gap-2">
                          <div className="w-1 h-1 bg-yellow-400 rounded-full" />
                          {ing}
                        </li>
                      ))}
                    </ul>
                    <p className="text-[10px] text-text-dim italic leading-relaxed">
                      {result.healthImpact}
                    </p>
                  </div>
                </div>

                {/* Packaging/Material Column */}
                <div className="space-y-4">
                  <div className="glass-card p-5 border-secondary/20 bg-secondary/5">
                    <div className="flex items-center gap-2 mb-3 text-secondary">
                      <Box className="w-5 h-5" />
                      <h5 className="font-bold text-sm uppercase tracking-wider">Green-Sight OCR</h5>
                    </div>
                    <div className="space-y-3">
                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] uppercase tracking-widest text-text-dim">Material</span>
                        <span className="text-sm font-bold text-white">{result.packaging.material}</span>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] uppercase tracking-widest text-text-dim">Waste Category</span>
                        <span className="text-xs font-medium text-secondary">{result.packaging.wasteClassification}</span>
                      </div>
                      <div className="flex items-center gap-2 p-3 bg-white/5 rounded-xl border border-white/5">
                        <Recycle className="w-4 h-4 text-green-400" />
                        <span className="text-xs font-bold text-green-400 uppercase tracking-tighter">{result.packaging.recyclability}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Tip */}
              <div className="glass-card p-4 flex items-start gap-4 border-primary/20 bg-primary/5">
                <Info className="w-5 h-5 text-primary flex-shrink-0" />
                <p className="text-xs text-text-main leading-relaxed">
                  <span className="font-bold uppercase text-primary mr-2">Disposal Tip:</span>
                  {result.packaging.ecoTip}
                </p>
              </div>

              <div className="flex justify-center">
                <button 
                  onClick={() => setResult(null)}
                  className="px-8 py-3 bg-white/5 hover:bg-white/10 text-text-main rounded-full font-bold text-sm transition-colors border border-glass-border"
                >
                  Analyse Another
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
