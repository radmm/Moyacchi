import { useState, useEffect } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { onSnapshot, query, orderBy, limit as fsLimit, setDoc } from 'firebase/firestore';
import { auth, loginWithGoogle, logout, getHistoryCollection, getHistoryRef, getUserRef } from './lib/firebase';
import HabitForm from './components/HabitForm';
import AnalysisView from './components/AnalysisView';
import TrendTracker from './components/TrendTracker';
import Mascot from './components/Mascot';
import ShareCard from './components/ShareCard';
import VisualEnvironment from './components/VisualEnvironment';
import ChatInterface from './components/ChatInterface';
import FoodScanner from './components/FoodScanner';
import { DailyLog, AnalysisResult, HistoryItem, MascotStage } from './types';
import { analyzeHabits } from './lib/geminiService';
import { Leaf, Info, LogIn, LogOut, MessageSquare, ScanLine } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const STORAGE_KEY = 'moyacchi_history';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [activeLog, setActiveLog] = useState<DailyLog | null>(null);
  const [currentResult, setCurrentResult] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [mascotMood, setMascotMood] = useState<'happy' | 'thinking' | 'cheering' | 'sad'>('happy');

  // Handle Auth State
  useEffect(() => {
    return onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        setDoc(getUserRef(currentUser.uid), {
          email: currentUser.email,
          displayName: currentUser.displayName,
          photoURL: currentUser.photoURL,
          lastSeen: new Date().toISOString()
        }, { merge: true });
      } else {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          try {
            setHistory(JSON.parse(saved));
          } catch (e) {
            console.error("Failed to load history", e);
          }
        }
      }
    });
  }, []);

  // Sync History
  useEffect(() => {
    if (!user) return;
    const q = query(getHistoryCollection(user.uid), orderBy('log.timestamp', 'desc'), fsLimit(30));
    return onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map(doc => doc.data() as HistoryItem);
      setHistory(items);
    });
  }, [user]);

  const saveHistoryLocally = (newHistory: HistoryItem[]) => {
    if (!user) {
      setHistory(newHistory);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newHistory));
    }
  };

  const handleSubmit = async (log: DailyLog) => {
    setIsLoading(true);
    setMascotMood('thinking');
    setActiveLog(log);
    
    try {
      // Pass last 3 days for context-aware brain
      const context = history.slice(0, 3);
      const result = await analyzeHabits(log, context);
      
      setCurrentResult(result);
      setMascotMood(result.score > 50 ? 'cheering' : 'happy');

      const dateStr = new Date().toISOString().split('T')[0];
      const newItem: HistoryItem = { log, analysis: result, date: dateStr };

      if (user) {
        await setDoc(getHistoryRef(user.uid, dateStr), newItem);
      } else {
        const filteredHistory = history.filter(h => h.date !== dateStr);
        saveHistoryLocally([newItem, ...filteredHistory].slice(0, 30));
      }
    } catch (error) {
      alert("Oops! Moyacchi link to the stars is a bit shaky. Please try again!");
      setMascotMood('sad');
    } finally {
      setIsLoading(false);
    }
  };

  const calculateStreak = (historyItems: HistoryItem[]) => {
    if (historyItems.length === 0) return 0;
    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    let currentDate = today;
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
        streak++;
        currentDate = itemDate;
        currentDate.setDate(currentDate.getDate() - 1);
      } else break;
    }
    return streak;
  };

  const streak = calculateStreak(history);
  const currentScore = currentResult?.score || (history[0]?.analysis.score) || 50;
  const currentStage = currentResult?.mascotStage || (history[0]?.analysis.mascotStage) || 'sprout';

  return (
    <VisualEnvironment score={currentScore}>
      <div className="min-h-screen p-6 md:p-10 flex flex-col md:flex-row gap-8 max-w-[1500px] mx-auto relative">
        {/* Sidebar */}
        <aside className="w-full md:w-[380px] flex flex-col gap-8">
          <div className="glass-card flex-1 flex flex-col items-center justify-center p-10 text-center space-y-6 relative overflow-hidden">
            {/* Auth Toggle */}
            <div className="absolute top-4 right-4 z-20">
              {user ? (
                <button onClick={logout} className="p-2 bg-white/5 hover:bg-white/10 rounded-full border border-glass-border">
                  <LogOut className="w-4 h-4 text-text-dim" />
                </button>
              ) : (
                <button onClick={loginWithGoogle} className="p-2 bg-primary/20 hover:bg-primary/30 rounded-full border border-primary/30">
                  <LogIn className="w-4 h-4 text-primary" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-glass-border text-primary font-bold text-sm tracking-widest uppercase">
              <Leaf className="w-4 h-4" />
              Moyacchi
            </div>

            <Mascot mood={mascotMood} stage={currentStage} size="xl" />

            {currentResult ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-text-main text-sm leading-relaxed italic">
                {currentResult.encouragement}
              </motion.div>
            ) : (
              <p className="text-text-dim text-sm leading-relaxed">
                {user ? `Welcome back, ${user.displayName?.split(' ')[0]}!` : "Ready to evolve your impact?"}
              </p>
            )}
            
            {streak > 0 && (
              <div className="flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full border border-primary/20 text-primary font-bold text-xs tracking-wider uppercase">
                🔥 {streak} Day Streak
              </div>
            )}

            {/* AI Tools Area */}
            <div className="grid grid-cols-2 gap-3 w-full pt-6">
              <button 
                onClick={() => setShowChat(true)}
                className="flex items-center justify-center gap-2 p-4 rounded-2xl bg-white/5 border border-glass-border hover:bg-white/10 transition-all group"
              >
                <MessageSquare className="w-4 h-4 text-primary group-hover:scale-110 transition-transform" />
                <span className="text-[10px] font-bold uppercase tracking-wider">AI Coaching</span>
              </button>
              <button 
                onClick={() => setShowScanner(true)}
                className="flex items-center justify-center gap-2 p-4 rounded-2xl bg-white/5 border border-glass-border hover:bg-white/10 transition-all group"
              >
                <ScanLine className="w-4 h-4 text-secondary group-hover:scale-110 transition-transform" />
                <span className="text-[10px] font-bold uppercase tracking-wider">Food Scan</span>
              </button>
            </div>
          </div>

          <TrendTracker history={history} />
        </aside>

        {/* Main Content */}
        <main className="flex-1 flex flex-col gap-8">
          <header className="hidden md:block">
            <h1 className="text-5xl font-black text-white leading-tight tracking-tight">
              Evolve your <span className="text-primary italic">impact</span>.
            </h1>
          </header>

          <AnimatePresence mode="wait">
            {!currentResult ? (
              <div key="form" className="flex flex-col gap-8 h-full">
                <HabitForm onSubmit={handleSubmit} isLoading={isLoading} initialValues={activeLog} />
                <div className="mt-auto flex items-center justify-center gap-2 text-text-dim text-xs py-4">
                  <Info className="w-4 h-4 text-primary" />
                  Wholesome AI privacy prioritized.
                </div>
              </div>
            ) : (
              <div key="result" className="flex flex-col gap-8 h-full">
                <AnalysisView 
                  result={currentResult} 
                  onShare={() => setShowShare(true)}
                  onReset={() => { setCurrentResult(null); setActiveLog(null); }}
                  onEdit={() => setCurrentResult(null)}
                />
              </div>
            )}
          </AnimatePresence>
        </main>

        {/* Modals */}
        <AnimatePresence>
          {showShare && <ShareCard result={currentResult} onClose={() => setShowShare(false)} />}
          {showChat && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-md">
              <ChatInterface onClose={() => setShowChat(false)} />
            </div>
          )}
          {showScanner && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-md">
              <FoodScanner onClose={() => setShowScanner(false)} />
            </div>
          )}
        </AnimatePresence>
      </div>
    </VisualEnvironment>
  );
}

