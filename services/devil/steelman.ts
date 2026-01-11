
import { GoogleGenAI } from "@google/genai";

/**
 * 🛡️ AETHELGARD STEEL-MAN GENERATOR
 * Generates the most intellectually honest and strongest possible counter-argument.
 */
export async function generateSteelman(synthesis: string): Promise<string> {
  const apiKey = process.env.API_KEY;
  if (!apiKey) return "Steelman engine disconnected.";

  const ai = new GoogleGenAI({ apiKey });
  
  const prompt = `
Steel-man the strongest possible argument AGAINST this conclusion.
Assume the opponent is highly intelligent, well-informed, and intellectually honest.
Do not weaken their position or use straw-man tactics.

Conclusion:
"${synthesis.slice(0, 1500)}"

TASK:
Produce a 200-word robust counter-thesis that addresses the core logical pillars of the synthesis.
`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: {
        systemInstruction: "You are the Aethelgard Intellectual Integrity Core. You provide the strongest possible opposing view to prevent groupthink.",
        temperature: 0.15
      }
    });

    return response.text || "No counter-argument reached threshold.";
  } catch (e) {
    console.error("Steelman failure:", e);
    return "Neural link failed during adversarial synthesis.";
  }
}
