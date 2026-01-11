
import { GoogleGenAI } from "@google/genai";
import { Assumption } from "./assumptions";
import { Contradiction } from "./contradictions";
import { Counterfactual } from "./counterfactuals";

export async function runDebate(params: {
  synthesis: string;
  assumptions: Assumption[];
  contradictions: Contradiction[];
  counterfactuals: Counterfactual[];
}): Promise<string> {
  const apiKey = process.env.API_KEY;
  if (!apiKey) return "Debate engine offline: Missing credentials.";

  const ai = new GoogleGenAI({ apiKey });
  
  const prompt = `
AETHELGARD INTERNAL DEBATE ORCHESTRATOR
Goal: Pressure-test the current intelligence synthesis.

[CURRENT SYNTHESIS]
${params.synthesis.slice(0, 1000)}...

[ASSUMPTIONS EXTRACTED]
${params.assumptions.map(a => `- ${a.claim}`).join("\n")}

[CONTRADICTIONS FOUND IN VAULT]
${params.contradictions.map(c => `- ${c.reason}`).join("\n")}

[COUNTERFACTUAL SCENARIOS]
${params.counterfactuals.map(c => `- ${c.counter}`).join("\n")}

TASK:
Conduct a high-fidelity internal debate between three personas:
1. **The Defender**: Validates the synthesis based on current data.
2. **The Skeptic**: Challenges the assumptions and highlights the vault contradictions.
3. **The Judge**: Evaluates the exchange and identifies the "Epistemic Blindspot."

Return exactly:
- The strongest argument for the Defender.
- The most damaging critique from the Skeptic.
- The Judge's final verdict on the synthesis confidence.

Tone: Cold, sharp, academic.
  `.trim();

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        systemInstruction: "You are the Aethelgard Devil's Advocate Engine. You perform adversarial reasoning to ensure research integrity.",
        temperature: 0.2
      }
    });

    return response.text || "Debate logic yielded no significant fractures.";
  } catch (e) {
    console.error("Internal debate failed:", e);
    return "Adversarial reasoning link interrupted.";
  }
}
