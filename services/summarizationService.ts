
import { GoogleGenAI } from "@google/genai";
import { getCache, setCache } from "./cacheService";

export async function summarizeResults(
  query: string,
  newFindings: string[],
  clusters: { label: string; count: number }[],
  vaultTitles: string[]
): Promise<string> {
  const cacheKey = `summary_v2:${query}`;
  const cached = getCache<string>(cacheKey);
  if (cached) return cached;

  const apiKey = process.env.API_KEY;
  if (!apiKey) return "Synthesis failed: No API Key found.";

  const ai = new GoogleGenAI({ apiKey });
  
  const prompt = `
AETHELGARD INTELLIGENCE SYNTHESIS ENGINE
Query: "${query}"

[FRESH FINDINGS (NEW SINCE LAST SCAN)]
${newFindings.length > 0 ? newFindings.map(f => `- ${f}`).join("\n") : "No specific deltas detected."}

[THEMATIC CLUSTERS]
${clusters.map(c => `• ${c.label} (${c.count} sources)`).join("\n")}

[LOCAL VAULT CONTEXT (USER MEMORY)]
${vaultTitles.length > 0 ? vaultTitles.map(v => `- ${v}`).join("\n") : "No relevant vault items found."}

TASK:
Produce a high-fidelity intelligence report. 
1. **Master Summary**: Synthesize the overall situation.
2. **Thematic Deep-Dive**: Briefly explain the significance of the identified clusters.
3. **Temporal Diff**: Highlight exactly what is NEW or CHANGING compared to existing vault research.
4. **Epistemic Status**: Note any major contradictions or uncertainties.

Cite sources implicitly by name. Use a cold, objective academic tone.
  `.trim();

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        temperature: 0.4,
        systemInstruction: "You are the Aethelgard Synthesis Core. You bridge live intelligence with personal research memory."
      }
    });

    const text = response.text || "Synthesis engine yielded no results.";
    setCache(cacheKey, text, 6 * 60 * 60 * 1000); // 6 hours
    return text;
  } catch (e) {
    console.error("Gemini synthesis failed", e);
    return "Neural synthesis offline. Review grounded nodes for raw intelligence.";
  }
}
