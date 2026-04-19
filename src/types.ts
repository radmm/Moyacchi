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
  logs: DailyLog[];
  analysis: AnalysisResult;
  date: string; // YYYY-MM-DD
  isSummary?: boolean; // True for Sunday weekly summaries
}

export interface JournalEntry {
  id: string;
  date: string;
  logs: DailyLog[];
  analysis: AnalysisResult;
  mood?: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  id: string;
}

export interface ImageAnalysisResult {
  productName: string;
  impactScore: number; // 0-100
  hiddenIngredients: string[]; // e.g. palm oil
  environmentImpact: string;
  healthImpact: string;
  packaging: {
    material: string; // e.g. "Plastic PET", "Cardboard"
    recyclability: string; // e.g. "Recyclable", "Check Local", "Landfill"
    wasteClassification: string; // e.g. "Dry Waste", "Hazardous"
    ecoTip: string;
  };
}

export interface SkyData {
  aqi: number;
  aqiLabel: string;
  pollutants: {
    pm25: number;
    pm10: number;
    no2: number;
    so2: number;
    co: number;
    o3: number;
  };
  pollen: {
    grass: number;
    tree: number;
    weed: number;
  };
  location: string;
  timestamp: number;
}
