
import { GoogleGenAI } from "@google/genai";
import { SynthContext } from "./contextBuilder";

export async function synthesizeKnowledge(context: SynthContext): Promise<string> {
  const apiKey = process.env.API_KEY;
  if (!apiKey) return "Neural link disconnected: Missing credentials.";

  const ai = new GoogleGenAI({ apiKey });
  
  const prompt = `
AETHELGARD GLOBAL KNOWLEDGE SYNTHESIS
Analyze the current state of user intelligence nodes.

[EMERGENT THEMES & CLUSTERS]
${context.clusters.map(c => `• ${c.theme}: ${c.density} nodes (Members: ${c.members})`).join("\n")}

[TEMPORAL DYNAMICS]
- Trend: ${context.temporal.trend}
- Volatility Index: ${Math.round(context.temporal.volatility * 100)}%
- Research Velocity: ${context.temporal.velocity.toFixed(2)} nodes/day

[SEMANTIC CROSS-LINKS]
${context.keyLinks.map(l => `• ${l.connection} (Strength: ${l.strength})`).join("\n")}

[VAULT RAW DATA (SAMPLES)]
${context.samples.join("\n")}

TASK:
Produce a "Neural Convergence" intelligence report.
1. Identify the 'Golden Thread' connecting these disparate thoughts.
2. Detect "Belief Drift": How has the focus shifted over time?
3. Pinpoint contradictions between early and recent nodes.
4. Conclude with an "Emergent Insight"—something not explicitly stated in any single node but visible across the whole.

Tone: Cold, authoritative, high-fidelity academic synthesis.
  `.trim();

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: {
        systemInstruction: "You are the Aethelgard Synthesis Core. Your goal is to find emergent wisdom in personal knowledge graphs.",
        temperature: 0.3
      }
    });

    return response.text || "Synthesis engine timed out.";
  } catch (e) {
    console.error("Gemini Synthesis Error:", e);
    return "Neural synthesis failed. Direct review of grounded nodes required.";
  }
}
