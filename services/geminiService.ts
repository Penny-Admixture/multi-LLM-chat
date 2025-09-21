import { GoogleGenAI, Chat } from "@google/genai";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  // Instead of throwing an error, we can handle this gracefully in the UI
  // The app will check for the provider and won't call this if API key is missing for Gemini
  console.error("API_KEY environment variable is not set for Gemini.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY! });

export const startChat = (modelName: string = 'gemini-2.5-flash'): Chat => {
  if (!API_KEY) {
    throw new Error("Gemini API Key is not configured.");
  }
  return ai.chats.create({
    model: modelName,
    config: {
      tools: [{ googleSearch: {} }],
      systemInstruction: "You are a helpful AI assistant. You can have conversations, and you can also search the web for current information. When you use web search, provide the sources for your information.",
    },
  });
};
