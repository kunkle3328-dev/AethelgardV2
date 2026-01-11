
import { GoogleGenAI } from "@google/genai";
import { VaultEntry } from "../../schemas/vault.schema";

/**
 * 🕵️‍♂️ AETHELGARD RED-TEAM AGENT
 * Goal: Falsify the synthesis. Seek the weakest assumption. No politeness bias.
 */
export async function runRedTeam(synthesisText: string, vaultContext: VaultEntry[]) {
  const apiKey = process.env.API_KEY;
  if (!apiKey) return null;

  const ai = new GoogleGenAI({ apiKey });
  
  const prompt = `
You are a Red-Team Analyst. Your only goal is to FALSIFY the following conclusion.
Assume the synthesis is wrong and seek the weakest assumption, missing evidence, or alternative explanation.

[SYNTHESIS TO CHALLENGE]
${synthesisText.slice(0, 2000)}

[VAULT EVIDENCE (SAMPLES)]
${vaultContext.slice(0, 10).map(v => `• ${v.summary}: ${v.content.slice(0, 150)}`).join('\n')}

TASK:
Provide a brutally honest critique.
- Identify the "Weakest Link" in the logic.
- Highlight any "Correlation as Causation" fallacies.
- Note specific vault entries that provide a better counter-narrative.

Tone: Slower, measured, analytical, and cold.
  `.trim();

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        systemInstruction: "You are the Aethelgard Red-Team Agent. You prioritize falsification over consensus.",
        temperature: 0.1,
        maxOutputTokens: 300
      }
    });

    const critique = response.text || "No logical fractures detected in current resolution.";
    
    // Assess severity based on keywords
    let severity = 0.4;
    if (critique.toLowerCase().includes("no evidence") || critique.toLowerCase().includes("fallacy")) severity = 0.9;
    else if (critique.toLowerCase().includes("weak assumption") || critique.toLowerCase().includes("speculative")) severity = 0.7;

    return {
      agent: "RedTeam",
      critique,
      severity,
      timestamp: Date.now()
    };
  } catch (e) {
    console.error("Red-Team execution failed", e);
    return null;
  }
}
