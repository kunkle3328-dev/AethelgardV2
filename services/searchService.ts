
import { GoogleGenAI } from "@google/genai";
import { getCache, setCache } from "./cacheService";
import { SourceResult } from "../types";

/**
 * 🛰️ AETHELGARD NEURAL RETRIEVAL
 * 
 * Replaced Brave API with Gemini Grounding to solve browser CORS issues.
 * This provides high-fidelity grounded sources directly through the Google infrastructure.
 */
export async function runSearch(
  query: string,
  freshness: "latest" | "balanced" | "background" = "latest"
): Promise<SourceResult[]> {
  const normalized = query.trim().toLowerCase();
  const cacheKey = `search_grounding:${normalized}:${freshness}`;

  const cached = getCache<SourceResult[]>(cacheKey);
  if (cached) return cached;

  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.error("Neural Scan Failure: API_KEY missing.");
    return [];
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    
    // We use gemini-3-flash-preview for a high-speed "Fast Path" search
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Perform an objective search for the most relevant and fresh information regarding: "${query}". Return the most authoritative sources.`,
      config: {
        tools: [{ googleSearch: {} }]
      }
    });

    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    
    const results: SourceResult[] = chunks
      .map((chunk: any) => ({
        title: chunk.web?.title || 'Intelligence Node',
        uri: chunk.web?.uri || '',
        snippet: 'Grounded intelligence source verified via Google Search.',
        source: 'web' as const,
        score: 0.8 // Default score for grounded sources
      }))
      .filter(s => s.uri !== '');

    // Deduplicate by URI
    const uniqueResults = results.filter((v, i, a) => a.findIndex(t => t.uri === v.uri) === i);

    setCache(cacheKey, uniqueResults, 30 * 60 * 1000); // 30 min cache
    return uniqueResults;
  } catch (e) {
    console.warn("Neural Scan: Grounding relay failed.", e);
    return [];
  }
}
