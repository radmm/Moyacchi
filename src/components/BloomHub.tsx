import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageSquare, ScanLine, Sparkles, X, ChevronRight, Cloud, Info } from 'lucide-react';
import ChatInterface from './ChatInterface';
import ImageAnalyser from './ImageAnalyser';
import SkyDashboard from './SkyDashboard';

interface BloomHubProps {
  onClose: () => void;
}

type BloomTab = 'chat' | 'analyse' | 'sky';

export default function BloomHub({ onClose }: BloomHubProps) {
  const [activeTab, setActiveTab] = useState<BloomTab>('chat');

  const tabs = [
    { id: 'chat', label: 'Discuss to Bloom', icon: MessageSquare, color: 'text-primary' },
    { id: 'analyse', label: 'Analyse', icon: ScanLine, color: 'text-secondary' },
    { id: 'sky', label: 'Sky', icon: Cloud, color: 'text-sky-400' },
  ];

  const ecoTrivia = [
    "Did you know? Aluminum cans can be recycled and back on shelves in just 60 days! ♻️",
    "Switching to cold water for laundry can save up to 90% of a washing machine's energy use. ❄️",
    "A single tree can absorb about 48 pounds of CO2 per year. Plant more! 🌳",
    "Over 1 million plastic bottles are purchased every minute worldwide. Grab a reusable one! 🍼",
  ];

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-10 bg-black/90 backdrop-blur-xl transition-all"
    >
      <div className="w-full max-w-6xl h-full max-h-[850px] glass-card overflow-hidden flex flex-col md:flex-row border-primary/20 shadow-[0_0_100px_rgba(166,255,0,0.1)]">
        
        {/* Hub Sidebar */}
        <div className="w-full md:w-80 border-b md:border-b-0 md:border-r border-glass-border bg-white/5 p-8 flex flex-col gap-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center border border-primary/30">
                <Sparkles className="w-6 h-6 text-primary" />
              </div>
              <h2 className="text-2xl font-black text-white italic tracking-tight">Bloom</h2>
            </div>
            <button 
              onClick={onClose}
              className="md:hidden p-2 hover:bg-white/10 rounded-full"
            >
              <X className="w-6 h-6 text-text-dim" />
            </button>
          </div>

          <nav className="flex flex-col gap-3">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as BloomTab)}
                className={`flex items-center justify-between p-4 rounded-2xl transition-all duration-300 group ${
                  activeTab === tab.id 
                    ? 'bg-primary/20 border-primary/40 text-white shadow-[0_0_20px_rgba(166,255,0,0.1)]' 
                    : 'bg-white/2 hover:bg-white/8 text-text-dim border-transparent'
                } border`}
              >
                <div className="flex items-center gap-4">
                  <tab.icon className={`w-5 h-5 ${activeTab === tab.id ? tab.color : 'text-text-dim'}`} />
                  <span className="text-sm font-bold uppercase tracking-widest">{tab.label}</span>
                </div>
                {activeTab === tab.id && <ChevronRight className="w-4 h-4 text-primary" />}
              </button>
            ))}
          </nav>

          {/* Little Features: Eco Trivia */}
          <div className="mt-auto hidden md:block">
            <div className="p-6 rounded-2xl bg-white/5 border border-glass-border space-y-4">
              <div className="flex items-center gap-2 text-primary">
                <Info className="w-4 h-4" />
                <h4 className="text-[10px] font-black uppercase tracking-[0.2em]">Daily Trivia</h4>
              </div>
              <p className="text-xs text-text-main leading-relaxed italic opacity-80">
                {ecoTrivia[Math.floor(Math.random() * ecoTrivia.length)]}
              </p>
            </div>
          </div>
        </div>

        {/* Hub Content */}
        <div className="flex-1 relative flex flex-col min-h-0 bg-gradient-to-br from-white/[0.02] to-transparent">
          <button 
            onClick={onClose}
            className="absolute top-6 right-8 z-50 hidden md:flex p-3 bg-white/5 hover:bg-white/10 rounded-full border border-glass-border transition-all hover:scale-110 active:scale-95"
          >
            <X className="w-6 h-6 text-text-dim" />
          </button>

          <div className="flex-1 overflow-y-auto p-4 md:p-10 scrollbar-hide">
            <AnimatePresence mode="wait">
              {activeTab === 'chat' && (
                <motion.div 
                  key="chat"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  className="h-full"
                >
                  <ChatInterface onClose={() => {}} isEmbedded />
                </motion.div>
              )}

              {activeTab === 'analyse' && (
                <motion.div 
                  key="analyse"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  className="h-full flex items-center justify-center lg:pt-10"
                >
                  <ImageAnalyser onClose={() => {}} isEmbedded />
                </motion.div>
              )}

              {activeTab === 'sky' && (
                <motion.div 
                  key="sky"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  className="h-full"
                >
                  <SkyDashboard />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
