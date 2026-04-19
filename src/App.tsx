import { useState, useEffect } from 'react';
import HabitForm from './components/HabitForm';
import AnalysisView from './components/AnalysisView';
import TrendTracker from './components/TrendTracker';
import Mascot from './components/Mascot';
import ShareCard from './components/ShareCard';
import { DailyLog, AnalysisResult, HistoryItem } from './types';
import { analyzeHabits } from './lib/geminiService';
import { Leaf, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const STORAGE_KEY = 'moyacchi_history';

export default function App() {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [currentResult, setCurrentResult] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [mascotMood, setMascotMood] = useState<'happy' | 'thinking' | 'cheering'>('happy');

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load history", e);
      }
    }
  }, []);

  const saveHistory = (newHistory: HistoryItem[]) => {
    setHistory(newHistory);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newHistory));
  };

  const handleSubmit = async (log: DailyLog) => {
    setIsLoading(true);
    setMascotMood('thinking');
    
    try {
      const result = await analyzeHabits(log);
      setCurrentResult(result);
      setMascotMood('cheering');

      const dateStr = new Date().toISOString().split('T')[0];
      const newItem: HistoryItem = {
        log,
        analysis: result,
        date: dateStr
      };

      // Keep only one entry per day, and max 30 entries
      const filteredHistory = history.filter(h => h.date !== dateStr);
      saveHistory([newItem, ...filteredHistory].slice(0, 30));
    } catch (error) {
      alert("Oops! Moyacchi link to the stars is a bit shaky. Please try again!");
      setMascotMood('happy');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setCurrentResult(null);
    setMascotMood('happy');
  };

  const calculateStreak = (historyItems: HistoryItem[]) => {
    if (historyItems.length === 0) return 0;
    
    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let currentDate = today;
    
    // Sort history by date descending
    const sorted = [...historyItems].sort((a, b) => b.date.localeCompare(a.date));
    
    for (let i = 0; i < sorted.length; i++) {
      const itemDate = new Date(sorted[i].date);
      itemDate.setHours(0, 0, 0, 0);
      
      const diffTime = currentDate.getTime() - itemDate.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 0) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else if (diffDays === 1) {
        // This handles cases where the streak continues from yesterday
        streak++;
        currentDate = itemDate;
        currentDate.setDate(currentDate.getDate() - 1);
      } else {
        break;
      }
    }
    return streak;
  };

  const streak = calculateStreak(history);

  return (
    <div className="min-h-screen p-6 md:p-10 flex flex-col md:flex-row gap-8 max-w-[1400px] mx-auto">
      {/* Sidebar - Left side on desktop */}
      <aside className="w-full md:w-[350px] flex flex-col gap-8">
        <div className="glass-card flex-1 flex flex-col items-center justify-center p-10 text-center space-y-6">
          <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-glass-border text-primary font-bold text-sm tracking-widest uppercase">
            <Leaf className="w-4 h-4" />
            Moyacchi
          </div>

          <Mascot mood={mascotMood} size="lg" />

          {currentResult ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-text-main text-sm leading-relaxed italic"
            >
              "{currentResult.encouragement}"
            </motion.div>
          ) : (
            <div className="text-text-dim text-sm leading-relaxed">
              Log your habits to see how we can save the planet together! 🌍
            </div>
          )}
          
          {streak > 0 && (
            <div className="flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full border border-primary/20 text-primary font-bold text-xs tracking-wider uppercase">
              🔥 {streak} Day Streak
            </div>
          )}
        </div>

        <TrendTracker history={history} />
      </aside>

      {/* Main Content - Right side on desktop */}
      <main className="flex-1 flex flex-col gap-8">
        <header className="hidden md:block">
          <h1 className="text-4xl font-black text-white leading-tight">
            How green was your <span className="text-primary italic">day</span>?
          </h1>
        </header>

        <AnimatePresence mode="wait">
          {!currentResult ? (
            <div key="form" className="flex flex-col gap-8 h-full">
              <HabitForm onSubmit={handleSubmit} isLoading={isLoading} />
              
              <div className="mt-auto flex items-center justify-center gap-2 text-text-dim text-xs py-4">
                <Info className="w-4 h-4 text-primary" />
                No data leaves your device. Moyacchi respects your privacy.
              </div>
            </div>
          ) : (
            <div key="result" className="flex flex-col gap-8 h-full">
              <AnalysisView 
                result={currentResult} 
                onShare={() => setShowShare(true)}
                onReset={handleReset}
              />
            </div>
          )}
        </AnimatePresence>
      </main>

      <AnimatePresence>
        {showShare && (
          <ShareCard 
            result={currentResult} 
            onClose={() => setShowShare(false)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}

