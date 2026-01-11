
import { GoogleGenAI } from "@google/genai";
import { VaultEntry } from "../../schemas/vault.schema";

/**
 * 🔴 RED-TEAM HYPOTHESIS GENERATOR
 * Generates concise ways a conclusion could be wrong.
 */
export async function generateHypotheses(entry: VaultEntry): Promise<string[]> {
  const apiKey = process.env.API_KEY;
  if (!apiKey) return [];

  const ai = new GoogleGenAI({ apiKey });
  
  const prompt = `
You are a Red-Team Scout.
Generate 3 concise, specific hypotheses explaining how this conclusion could be factually incorrect or logically flawed.
No explanations, just the hypotheses.

Conclusion Summary:
"${entry.summary}"

Conclusion Content:
"${entry.content.slice(0, 1000)}"
`.trim();

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        systemInstruction: "You are the Aethelgard Red-Team Scout. Your goal is to identify points of failure in established beliefs.",
        temperature: 0.15,
        maxOutputTokens: 150
      }
    });

    const text = response.text || "";
    return text.split('\n').filter(line => line.trim().length > 10).map(line => line.replace(/^\d+\.\s*/, '').trim());
  } catch (e) {
    console.warn("Hypothesis generation failed for scout", e);
    return [];
  }
}
