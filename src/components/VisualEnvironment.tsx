import React from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface VisualEnvironmentProps {
  score: number;
  children: React.ReactNode;
}

export default function VisualEnvironment({ score, children }: VisualEnvironmentProps) {
  // Score 0-100: 0 is industrial gray, 100 is lush sun-drenched green
  // We'll calculate colors based on score
  const getColors = () => {
    if (score < 30) {
      return {
        bg: 'from-[#1a1a1a] via-[#2d2d2d] to-[#121212]', // Industrial Gray
        glow: 'bg-white/5',
        tint: 'rgba(255, 255, 255, 0.02)'
      };
    } else if (score < 70) {
      return {
        bg: 'from-[#071009] via-[#112a1a] to-[#071009]', // Dark Green (Standard)
        glow: 'bg-primary/5',
        tint: 'rgba(166, 255, 0, 0.02)'
      };
    } else {
      return {
        bg: 'from-[#0d1f0d] via-[#1a3d1a] to-[#0d1f0d]', // Lush Green
        glow: 'bg-primary/10',
        tint: 'rgba(166, 255, 0, 0.05)'
      };
    }
  };

  const colors = getColors();

  return (
    <div className={`min-h-screen transition-all duration-1000 bg-gradient-to-br ${colors.bg} relative overflow-hidden`}>
      {/* Dynamic Background Glows */}
      <motion.div 
        animate={{ 
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
          x: [0, 50, 0],
          y: [0, -30, 0]
        }}
        transition={{ duration: 15, repeat: Infinity }}
        className={`absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full blur-[120px] ${colors.glow}`} 
      />
      <motion.div 
        animate={{ 
          scale: [1, 1.1, 1],
          opacity: [0.2, 0.4, 0.2],
          x: [0, -40, 0],
          y: [0, 20, 0]
        }}
        transition={{ duration: 12, repeat: Infinity }}
        className="absolute -bottom-40 -right-40 w-[500px] h-[500px] bg-secondary/5 rounded-full blur-[100px]" 
      />

      {/* Main Content Overlay */}
      <div className="relative z-10 w-full">
        {children}
      </div>
      
      {/* Noise/Atmosphere Overlay */}
      <div className="fixed inset-0 pointer-events-none opacity-20 mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
    </div>
  );
}
