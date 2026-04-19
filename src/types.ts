export interface DailyLog {
  transport: string;
  food: string;
  energy: string;
  timestamp: number;
}

export interface AnalysisResult {
  score: number;
  grade: string;
  pros: string[];
  swaps: string[];
  encouragement: string;
}

export interface HistoryItem {
  log: DailyLog;
  analysis: AnalysisResult;
  date: string; // YYYY-MM-DD
}
