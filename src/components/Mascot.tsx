import { motion } from "motion/react";

interface MascotProps {
  mood?: 'happy' | 'thinking' | 'cheering';
  size?: 'sm' | 'md' | 'lg';
}

export default function Mascot({ mood = 'happy', size = 'md' }: MascotProps) {
  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-32 h-32',
    lg: 'w-48 h-48'
  };

  return (
    <motion.div 
      className={`relative ${sizeClasses[size]} flex items-center justify-center`}
      animate={{ 
        y: [0, -10, 0],
      }}
      transition={{ 
        repeat: Infinity, 
        duration: 3,
        ease: "easeInOut" 
      }}
    >
      {/* Wholesome Bloby Mascot (simplified SVG) */}
      <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-lg">
        <defs>
          <linearGradient id="mascotGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{ stopColor: '#a6ff00', stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: '#4e8000', stopOpacity: 1 }} />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="5" result="coloredBlur"/>
            <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        
        {/* Body */}
        <motion.path
          d="M40,100 Q40,40 100,40 Q160,40 160,100 Q160,160 100,160 Q40,160 40,100"
          fill="url(#mascotGrad)"
          filter="url(#glow)"
          animate={{
            d: mood === 'cheering' 
              ? "M30,100 Q30,30 100,30 Q170,30 170,100 Q170,170 100,170 Q30,170 30,100"
              : "M40,100 Q40,40 100,40 Q160,40 160,100 Q160,160 100,160 Q40,160 40,100"
          }}
        />

        {/* Eyes */}
        <circle cx="75" cy="85" r="8" fill="#000" />
        <circle cx="125" cy="85" r="8" fill="#000" />
        
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

        {/* Little Leaf on top */}
        <path d="M100,40 Q110,10 130,20 Q110,30 100,40" fill="#a6ff00" />
      </svg>
    </motion.div>
  );
}
