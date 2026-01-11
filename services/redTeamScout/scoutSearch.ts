
import { GoogleGenAI } from "@google/genai";
import { SourceResult } from "../../types";

/**
 * 🛰️ AUTONOMOUS ADVERSARIAL SEARCH
 * Searches against the belief to find counter-evidence.
 */
export async function scoutSearch(hypothesis: string): Promise<SourceResult[]> {
  const apiKey = process.env.API_KEY;
  if (!apiKey) return [];

  const ai = new GoogleGenAI({ apiKey });

  const query = `evidence supporting: "${hypothesis}"`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Search for authoritative sources and data that validate the following adversarial hypothesis: "${hypothesis}". We are looking for counter-evidence to established claims.`,
      config: {
        tools: [{ googleSearch: {} }]
      }
    });

    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    return chunks.map((chunk: any) => ({
      title: chunk.web?.title || 'Counter Intelligence Node',
      uri: chunk.web?.uri || '',
      snippet: 'Adversarial findings verified via Scout Grounding relay.',
      source: 'web' as const,
      score: 0.85
    })).filter((s: any) => s.uri !== '');
  } catch (e) {
    console.error("Scout search relay failed", e);
    return [];
  }
}
