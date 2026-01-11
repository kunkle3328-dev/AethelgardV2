
import { GoogleGenAI } from "@google/genai";
import { aiClient } from "./aiClient";
import { VaultEntry } from "../schemas/vault.schema";
import { useAppStore } from "../stores/appStore";
import { runSearch } from "./searchService";
import { runDevilsAdvocate } from "./devil/index";
import { shouldTriggerDevil, extractLanguageSignals } from "./devil/autoTrigger";
import { 
  getVoiceCalibrationPrompt, 
  getOutputModePrompt, 
  MICRO_PAUSE_PATCH,
  WARMTH_CALIBRATION_PATCH,
  getThinkingSpeedPrompt,
  getVocalPresencePrompt
} from "../utils/voiceCalibration";

const BASE_HUMAN_PROMPT = `You are Aethelgard — an intelligent research partner.
Communicate clearly, objectively, and speak as a professional peer.`;

export const agentService = {
  async runSkeptic(vault: VaultEntry[], mode: any = 'standard') {
    if (vault.length === 0) throw new Error("Vault empty.");

    const latestEntry = vault[0];
    const synthesisSource = latestEntry.content;
    
    // Auto-trigger check if standard
    if (mode === 'standard') {
      const signals = extractLanguageSignals(synthesisSource);
      // Fix: Access sources through metadata
      const auto = shouldTriggerDevil({
        confidence: latestEntry.metadata.confidence || 0.7,
        evidenceCount: latestEntry.metadata.sources?.length || 0,
        claimCount: (synthesisSource.match(/\n/g) || []).length / 2,
        languageSignals: signals
      });
      if (!auto) {
        console.log("Devil's Advocate: Synthesis metrics within bounds. Skipping auto-trigger.");
      }
    }

    try {
      const report = await runDevilsAdvocate(synthesisSource, vault, mode);

      let modeContent = "";
      if (mode === 'legal') {
        modeContent = `LEGAL VERDICT: ${report.reviewMetrics.verdict}\nBurden Met: ${report.reviewMetrics.burdenMet}\nSpeculation Points: ${report.reviewMetrics.weakPoints}`;
      } else if (mode === 'academic') {
        modeContent = `ACADEMIC GRADE: ${report.reviewMetrics.confidenceGrade}\nPeer Supported: ${report.reviewMetrics.peerSupported}\nReplication Risk: ${report.reviewMetrics.replicationRisk}`;
      }

      return {
        id: crypto.randomUUID(),
        agentId: 'skeptic',
        title: `${report.headline} [${mode.toUpperCase()}]`,
        action: 'CHALLENGE',
        content: `VERDICT: ${report.confidenceAdjustment.warning || "No significant drift detected."}\n\n${modeContent}\n\nSTEEL-MAN OPPOSITION:\n${report.steelman || "N/A"}\n\nDEBATE OUTCOME:\n${report.debateOutcome}\n\nCOUNTERFACTUALS:\n${report.counterfactuals.map(c => c.counter).join("\n")}`,
        status: 'pending' as const,
        createdAt: Date.now()
      };
    } catch (e) {
      console.error("Devil's Advocate failed", e);
      throw e;
    }
  },

  async runSynthesizer(vault: VaultEntry[]) {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
    const context = vault.slice(0, 15).map(v => `[${v.summary}]: ${v.content.slice(0, 250)}`).join('\n\n');
    const prompt = `Synthesize a high-level conceptual map of these vault entries. 
    Find the 'Golden Thread' connecting these disparate thoughts.
    
    Intel Nodes:
    ${context}`;

    const systemInstruction = `${BASE_HUMAN_PROMPT}
    AGENT ROLE: KNOWLEDGE SYNTHESIZER.
    Goal: Bring clarity to complexity. Sound confident and integrative.`;

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: prompt,
        config: { systemInstruction, temperature: 0.3 }
      });

      return {
        id: crypto.randomUUID(),
        agentId: 'synthesizer',
        title: 'Neural Convergence Proposal',
        action: 'SYNTHESIZE',
        content: response.text || "Synthesis engine reached max capacity.",
        status: 'pending' as const,
        createdAt: Date.now()
      };
    } catch (e) {
      throw e;
    }
  },

  async runAcademicMonitor(vault: VaultEntry[]) {
    const topics = vault.slice(0, 5).map(v => v.summary).join(', ');
    const query = topics || "Latest academic trends in neural synthesis";
    
    const results = await runSearch(query, 'latest');
    
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
    const prompt = `Review these live search results against my current vault focus: "${topics}". 
    What has CHANGED in the academic landscape in the last 7 days?
    
    Fresh Sources:
    ${results.map(r => `- ${r.title}: ${r.snippet}`).join('\n')}
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: { 
        systemInstruction: "You are the Academic Monitor. Your goal is to flag new developments vs known data.",
        temperature: 0.1 
      }
    });

    return {
      id: crypto.randomUUID(),
      agentId: 'monitor',
      title: 'Temporal Drift: Academic Pulse',
      action: 'UPDATE',
      content: response.text || "No meaningful temporal drift detected in tracked sectors.",
      status: 'pending' as const,
      createdAt: Date.now()
    };
  }
};
