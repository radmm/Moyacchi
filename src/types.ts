export interface DailyLog {
  transport: string;
  food: string;
  energy: string;
  timestamp: number;
}

export type MascotStage = 'seed' | 'sprout' | 'bloom' | 'glow';

export interface AnalysisResult {
  score: number;
  grade: string;
  pros: string[];
  swaps: string[];
  encouragement: string;
  metaphor: string; // e.g., "saved enough energy to charge a phone 50 times"
  mascotStage: MascotStage;
}

export interface HistoryItem {
  log: DailyLog;
  analysis: AnalysisResult;
  date: string; // YYYY-MM-DD
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  id: string;
}

export interface FoodScanResult {
  productName: string;
  impactScore: number; // 0-100
  hiddenIngredients: string[]; // e.g. palm oil
  environmentImpact: string;
  healthImpact: string;
}
