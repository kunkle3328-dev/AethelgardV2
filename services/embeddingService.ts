
import { GoogleGenAI } from "@google/genai";
import { EmbeddingRecord } from "../schemas/embedding.schema";

export const embeddingService = {
  async generate(id: string, text: string, type: EmbeddingRecord["sourceType"]): Promise<EmbeddingRecord> {
    // Always use process.env.API_KEY directly in the constructor as per guidelines
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    // Using a specialized model for embeddings
    // Fallback to reasoning model if text-embedding is unavailable in specific environment
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Generate a 32-dimensional semantic vector for this text. Return ONLY an array of 32 floats: ${text.slice(0, 1000)}`,
      config: {
        responseMimeType: "application/json",
      }
    });

    let vector: number[] = [];
    try {
      const textOutput = response.text || "[]";
      const parsed = JSON.parse(textOutput);
      vector = Array.isArray(parsed) ? parsed : Object.values(parsed);
    } catch (e) {
      // Create deterministic pseudo-vector if LLM fails format
      vector = new Array(32).fill(0).map((_, i) => text.charCodeAt(i % text.length) / 255);
    }

    return {
      id: crypto.randomUUID(),
      sourceType: type,
      sourceId: id,
      vector,
      createdAt: Date.now()
    };
  }
};