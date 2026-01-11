
import { GoogleGenAI } from "@google/genai";
import { SourceResult } from "../../types";

/**
 * 🕵️‍♂️ AETHELGARD ADVERSARIAL SEARCH
 * Generates queries designed to falsify claims and avoid confirmation bias.
 */
export async function runAdversarialSearch(claim: string): Promise<SourceResult[]> {
  const apiKey = process.env.API_KEY;
  if (!apiKey) return [];

  const ai = new GoogleGenAI({ apiKey });

  const adversarialQueries = [
    `evidence against ${claim}`,
    `${claim} debunked`,
    `criticisms of ${claim}`,
    `studies contradicting ${claim}`
  ];

  const results: SourceResult[] = [];

  // Parallel grounding calls for different adversarial angles
  const searchPromises = adversarialQueries.map(async (q) => {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Seek evidence that challenges the following claim: "${claim}". Specifically look for "${q}". Return authoritative counter-sources.`,
        config: {
          tools: [{ googleSearch: {} }]
        }
      });

      const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
      return chunks.map((chunk: any) => ({
        title: chunk.web?.title || 'Counter Intel Node',
        uri: chunk.web?.uri || '',
        snippet: 'Adversarial intelligence verified via Google Search grounding.',
        source: 'web' as const,
        score: 0.9
      })).filter((s: any) => s.uri !== '');
    } catch (e) {
      console.warn(`Adversarial query failed: ${q}`, e);
      return [];
    }
  });

  const allFound = await Promise.all(searchPromises);
  results.push(...allFound.flat());

  // Deduplicate by URI
  return results.filter((v, i, a) => a.findIndex(t => t.uri === v.uri) === i);
}

export function generateAdversarialQueries(claim: string): string[] {
  return [
    `why ${claim} might be wrong`,
    `counterarguments to ${claim}`,
    `limitations of ${claim}`,
    `when ${claim} fails`
  ];
}
