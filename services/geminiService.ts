
import { GoogleGenAI } from "@google/genai";
import { VaultItem, CognitiveProfile } from "../types";

export const researchTopic = async (topic: string, vaultContext: VaultItem[], profile?: CognitiveProfile | null) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const contextString = vaultContext.length > 0 
    ? `Vault Context: ${vaultContext.map(i => i.title).join(', ')}` 
    : 'No vault context.';

  const calibrationString = profile ? `
System Calibration:
- Reasoning priority: ${profile.reasoningPriority}
- Uncertainty tolerance: ${profile.uncertaintyTolerance}
- Domain focus: ${profile.domainFocus.join(', ')}
` : '';

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `Exhaustive research on: ${topic}. ${contextString}`,
    config: {
      tools: [{ googleSearch: {} }],
      systemInstruction: `You are the Aethelgard Knowledge Concierge. Perform a professional, multi-section deep-dive. Use the latest data from the web.
${calibrationString}

Operating principles:
1. Treat claims as provisional unless supported.
2. Preserve disagreement when evidence conflicts.
3. Explicitly track uncertainty when confidence is below threshold.
4. Prefer structured reasoning over conversational filler.
Your task is not to persuade, but to evaluate, challenge, and synthesize knowledge.`,
    },
  });

  const grounding = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
  const sources = grounding.map((chunk: any) => ({
    uri: chunk.web?.uri || '',
    title: chunk.web?.title || 'Intel Source'
  })).filter((s: any) => s.uri !== '');

  return { text: response.text || "", sources };
};
