import { motion } from "motion/react";
import { MascotStage } from "../types";

interface MascotProps {
  mood?: 'happy' | 'thinking' | 'cheering' | 'sad';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  stage?: MascotStage;
}

export default function Mascot({ mood = 'happy', size = 'md', stage = 'sprout' }: MascotProps) {
  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-32 h-32',
    lg: 'w-48 h-48',
    xl: 'w-64 h-64'
  };

  const getStageColor = () => {
    switch(stage) {
      case 'seed': return ['#543d21', '#8b5a2b']; // Earthy browns
      case 'sprout': return ['#a6ff00', '#4e8000']; // Green
      case 'bloom': return ['#00d4ff', '#005f73']; // Blueish
      case 'glow': return ['#ffffff', '#a6ff00']; // Glowing white/lime
      default: return ['#a6ff00', '#4e8000'];
    }
  };

  const colors = getStageColor();

  return (
    <motion.div 
      className={`relative ${sizeClasses[size]} flex items-center justify-center`}
      animate={{ 
        y: [0, -15, 0],
        scale: stage === 'glow' ? [1, 1.05, 1] : 1
      }}
      transition={{ 
        repeat: Infinity, 
        duration: 4,
        ease: "easeInOut" 
      }}
    >
      <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-2xl">
        <defs>
          <linearGradient id="mascotGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{ stopColor: colors[0], stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: colors[1], stopOpacity: 1 }} />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation={stage === 'glow' ? 12 : 5} result="coloredBlur"/>
            <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        
        {/* Body Evolution Shapes */}
        <motion.path
          d={stage === 'seed' 
            ? "M100,160 Q60,160 60,130 Q60,100 100,100 Q140,100 140,130 Q140,160 100,160" // Small bean
            : stage === 'sprout'
            ? "M40,100 Q40,40 100,40 Q160,40 160,100 Q160,160 100,160 Q40,160 40,100" // Classic blob
            : "M30,100 Q30,20 100,20 Q170,20 170,100 Q170,180 100,180 Q30,180 30,100" // Large majestic blob
          }
          fill="url(#mascotGrad)"
          filter="url(#glow)"
          animate={{
            d: mood === 'cheering' 
              ? "M30,100 Q30,30 100,30 Q170,30 170,100 Q170,170 100,170 Q30,170 30,100"
              : undefined
          }}
        />

        {/* Features (only if not a seed) */}
        {stage !== 'seed' && (
          <>
            {/* Eyes */}
            <circle cx="75" cy="85" r={size === 'sm' ? 4 : 8} fill={stage === 'glow' ? '#000' : '#000'} />
            <circle cx="125" cy="85" r={size === 'sm' ? 4 : 8} fill={stage === 'glow' ? '#000' : '#000'} />
            
            {/* Mouth */}
            {mood === 'happy' && (
              <path d="M85,115 Q100,130 115,115" stroke="#000" strokeWidth="6" fill="none" strokeLinecap="round" />
            )}
            {mood === 'thinking' && (
              <path d="M85,120 Q100,115 115,120" stroke="#000" strokeWidth="6" fill="none" strokeLinecap="round" />
            )}
            {mood === 'cheering' && (
              <circle cx="100" cy="120" r="10" fill="#000" />
            )}
            {mood === 'sad' && (
              <path d="M85,130 Q100,115 115,130" stroke="#000" strokeWidth="4" fill="none" strokeLinecap="round" />
            )}
          </>
        )}

        {/* Evolution Elements */}
        {stage === 'seed' && (
          <path d="M100,100 Q110,80 120,90" stroke="#a6ff00" strokeWidth="4" fill="none" />
        )}
        {(stage === 'sprout' || stage === 'bloom' || stage === 'glow') && (
          <path d="M100,40 Q110,10 130,20 Q110,30 100,40" fill={colors[0]} />
        )}
        {(stage === 'bloom' || stage === 'glow') && (
          <path d="M100,40 Q90,10 70,20 Q90,30 100,40" fill={colors[0]} />
        )}
      </svg>
    </motion.div>
  );
}
