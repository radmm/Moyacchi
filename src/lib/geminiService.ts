import { GoogleGenAI, Type } from "@google/genai";
import { DailyLog, AnalysisResult } from "../types";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || "",
});

const ANALYSIS_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    score: {
      type: Type.NUMBER,
      description: "A green score from 0 to 100",
    },
    grade: {
      type: Type.STRING,
      description: "A grade label like 'Eco Hero', 'Planet Protector', 'Room to Grow', etc.",
    },
    pros: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "2 things the user did well today",
    },
    swaps: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "2 specific easy eco-friendly swaps for tomorrow",
    },
    encouragement: {
      type: Type.STRING,
      description: "1 warm, cute, and personal encouragement message",
    },
  },
  required: ["score", "grade", "pros", "swaps", "encouragement"],
};

export async function analyzeHabits(log: DailyLog): Promise<AnalysisResult> {
  const prompt = `
    Analyze these daily habits for their environmental impact and provide a score/feedback.
    Be wholesome, cute, and encouraging, like a personal eco-buddy.
    
    Daily Habits:
    - Transport: ${log.transport}
    - Food: ${log.food}
    - Energy/Purchases: ${log.energy}
    
    Provide the analysis in the requested JSON format.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: ANALYSIS_SCHEMA as any,
        systemInstruction: "You are Moyacchi, a wholesome and cute AI mascot that helps users live more eco-friendly lives. You talk personally and warmly, using emojis occasionally. You give objective scores but always keep the tone positive and encouraging.",
      },
    });

    if (!response.text) {
      throw new Error("No response from Gemini");
    }

    return JSON.parse(response.text.trim()) as AnalysisResult;
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    throw error;
  }
}
