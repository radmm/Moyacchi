import { GoogleGenAI, Type } from "@google/genai";
import { DailyLog, AnalysisResult, HistoryItem, MascotStage, ChatMessage, ImageAnalysisResult } from "../types";

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
    metaphor: {
      type: Type.STRING,
      description: "A tangible eco-metaphor (e.g., 'charging 50 phones' or 'preserving 3sqft of forest')",
    },
    mascotStage: {
      type: Type.STRING,
      enum: ['seed', 'sprout', 'bloom', 'glow'],
      description: "Based on the score and streak history, suggest the mascot's evolution stage.",
    },
  },
  required: ["score", "grade", "pros", "swaps", "encouragement", "metaphor", "mascotStage"],
};

const IMAGE_ANALYSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    productName: { type: Type.STRING },
    impactScore: { type: Type.NUMBER, description: "0-100 environmental score" },
    hiddenIngredients: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Eco-unfriendly or processed additives" },
    environmentImpact: { type: Type.STRING },
    healthImpact: { type: Type.STRING },
    packaging: {
      type: Type.OBJECT,
      properties: {
        material: { type: Type.STRING, description: "Identified packaging material (e.g. Cardboard, Plastic Type 1)" },
        recyclability: { type: Type.STRING, description: "How to recycle this (e.g. Recyclable, Return to Store)" },
        wasteClassification: { type: Type.STRING, description: "Classification (e.g. Dry Waste, Recyclable Waste)" },
        ecoTip: { type: Type.STRING, description: "A quick tip for disposing of this packaging greenly" },
      },
      required: ["material", "recyclability", "wasteClassification", "ecoTip"],
    },
  },
  required: ["productName", "impactScore", "hiddenIngredients", "environmentImpact", "healthImpact", "packaging"],
};

const HABIT_IDENTIFICATION_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    transport: { type: Type.STRING, description: "Identified transit method" },
    food: { type: Type.STRING, description: "Identified food/meal" },
    energy: { type: Type.STRING, description: "Identified activity/purchase" },
  },
  required: ["transport", "food", "energy"],
};

export async function analyzeHabits(logs: DailyLog[], context?: HistoryItem[]): Promise<AnalysisResult> {
  const historyText = context?.length 
    ? `Recent History (last 3 days):\n${context.map(h => `- Day ${h.date}: Score ${h.analysis.score}`).join('\n')}`
    : "No recent history.";

  const stackText = logs.map((log, i) => `
    Entry #${i+1}:
    - Transport: ${log.transport}
    - Food: ${log.food}
    - Energy/Purchases: ${log.energy}
  `).join('\n');

  const prompt = `
    Analyze this "Daily Stack" of habits for their cumulative environmental impact.
    ${historyText}
    
    Current Daily Stack:
    ${stackText}
    
    Provide a comprehensive analysis of the ENTIRE day based on all entries above.
    The response must be in refined JSON format.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: ANALYSIS_SCHEMA as any,
        systemInstruction: "You are Moyacchi, a wholesome AI eco-companion. You convert abstract carbon data into tangible metaphors. You watch for patterns in history and offer personalized coaching.",
      },
    });

    if (!response.text) throw new Error("No response from Gemini");
    return JSON.parse(response.text.trim()) as AnalysisResult;
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    throw error;
  }
}

export async function identifyHabitsFromImage(base64Image: string): Promise<DailyLog> {
  const prompt = "Look at this image. Identify the transit tickets, food/meals, or product labels. Fill out these three categories: transport, food, energy/purchases.";
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        { text: prompt },
        { inlineData: { mimeType: "image/jpeg", data: base64Image } }
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: HABIT_IDENTIFICATION_SCHEMA as any,
      },
    });

    const result = JSON.parse(response.text.trim());
    return {
      ...result,
      timestamp: Date.now()
    };
  } catch (error) {
    console.error("Habit Identification Error:", error);
    throw error;
  }
}

export async function analyseImage(base64Image: string): Promise<ImageAnalysisResult> {
  const prompt = "Scan this product label/ingredients and its packaging. Identify hidden ingredients (like palm oil, additives) and assess environmental and health impact. ALSO, identify the packaging material and classify its waste/recyclability type (Green-Sight OCR).";
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        { text: prompt },
        { inlineData: { mimeType: "image/jpeg", data: base64Image } }
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: IMAGE_ANALYSE_SCHEMA as any,
      },
    });

    return JSON.parse(response.text.trim());
  } catch (error) {
    console.error("Image Analysis Error:", error);
    throw error;
  }
}

export async function chatWithMoyacchi(messages: ChatMessage[]): Promise<string> {
  const prompt = messages.map(m => `${m.role === 'user' ? 'User' : 'Moyacchi'}: ${m.content}`).join('\n');
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        systemInstruction: "You are Moyacchi, a cute and wholesome AI companion. Your goal is to be a non-judgmental strategist for a greener life. Use markdown for lists, bolding, and headings to keep your thoughts organized and beautiful.",
      },
    });

    return response.text || "Moyacchi is feeling a little shy right now. Could you repeat that? 🌿";
  } catch (error) {
    console.error("Chat Error:", error);
    return "Moyacchi lost focus for a second! Let's try again. 🌍";
  }
}
