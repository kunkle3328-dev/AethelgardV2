
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

/**
 * Robust retry wrapper for AI calls. 
 * Swallows all errors to prevent AI failures from breaking the application flow or showing quota banners.
 */
async function silentAIRetry<T>(operation: () => Promise<T>, maxRetries = 1): Promise<T | null> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await operation();
    } catch (error: any) {
      // Intentionally silent. AI is an enhancement, not a core requirement.
      if (i === maxRetries - 1) {
        console.warn("Aethelgard: Neural link at capacity. Enhancement skipped.");
        return null;
      }
      const delay = 1000;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  return null;
}

export const aiClient = {
  async generate(params: {
    prompt: string;
    model?: string;
    systemInstruction?: string;
    tools?: any[];
    responseMimeType?: string;
  }): Promise<GenerateContentResponse | null> {
    const apiKey = process.env.API_KEY;
    if (!apiKey) return null;

    try {
      const ai = new GoogleGenAI({ apiKey });
      const config: any = {
        systemInstruction: params.systemInstruction,
      };

      if (params.tools) config.tools = params.tools;
      if (params.responseMimeType) config.responseMimeType = params.responseMimeType;

      return await silentAIRetry(() => ai.models.generateContent({
        model: params.model || 'gemini-3-flash-preview',
        contents: params.prompt,
        config,
      }));
    } catch (e) {
      return null;
    }
  }
};
