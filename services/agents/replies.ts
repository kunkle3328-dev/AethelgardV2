
import { GoogleGenAI } from "@google/genai";
import { useVaultStore } from "../../stores/vaultStore";
import { AgentMessage } from "../../types";

/**
 * 🗨️ AGENT CONVERSATION ORCHESTRATOR
 * Handles user replies to agent objections and generates agent responses.
 */
export async function replyToAgent(
  entryId: string, 
  annotationId: string, 
  userMessage: string
) {
  const { addAnnotationReply } = useVaultStore.getState();
  
  // 1. Add user message to thread
  const userMsg: AgentMessage = {
    role: 'user',
    content: userMessage,
    timestamp: Date.now()
  };
  addAnnotationReply(entryId, annotationId, userMsg);

  // 2. Schedule Agent Response
  setTimeout(async () => {
    const entry = useVaultStore.getState().items.find(i => i.id === entryId);
    const annotation = entry?.annotations?.find(a => a.id === annotationId);
    if (!annotation || !entry) return;

    const apiKey = process.env.API_KEY;
    if (!apiKey) return;

    const ai = new GoogleGenAI({ apiKey });
    
    const threadContext = annotation.thread?.map(m => `${m.role.toUpperCase()}: ${m.content}`).join('\n') || "";
    
    const prompt = `
AETHELGARD AGENT INTERFACE
Agent: ${annotation.agent}
Original Objection: ${annotation.message}
Target Intel: ${entry.summary}

[CONVERSATION THREAD]
${threadContext}
USER: ${userMessage}

TASK:
As the ${annotation.agent}, respond to the user's defense or query. 
Maintain a cold, analytical, and objective tone. Do not apologize. 
If the user's evidence is weak, point it out. If they provide a valid counter, acknowledge the nuance.

Response Limit: 120 words.
    `.trim();

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: {
          systemInstruction: `You are the ${annotation.agent}. You prioritize intellectual honesty and falsification.`,
          temperature: 0.2
        }
      });

      const agentMsg: AgentMessage = {
        role: 'agent',
        content: response.text || "Neural link interrupted during response.",
        timestamp: Date.now()
      };

      addAnnotationReply(entryId, annotationId, agentMsg);
    } catch (e) {
      console.error("Agent reply generation failed:", e);
    }
  }, 1000);
}
