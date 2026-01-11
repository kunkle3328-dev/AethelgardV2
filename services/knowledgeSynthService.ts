
import { VaultEntry } from "../schemas/vault.schema";
import { buildLinks } from "./synth/linker";
import { buildClusters } from "./synth/cluster";
import { analyzeTemporal } from "./synth/temporal";
import { buildContext } from "./synth/contextBuilder";
import { synthesizeKnowledge } from "./synth/synthesize";
import { getCache, setCache } from "./cacheService";
import { KnowledgeSynthesis } from "../types";
import { devilMonitor } from "./devil/monitor";

/**
 * 🧠 AETHELGARD KNOWLEDGE SYNTH ORCHESTRATOR
 * Modular build for deep-vault intelligence synthesis.
 */
export const knowledgeSynthService = {
  async runGlobalSynth(vault: VaultEntry[]): Promise<KnowledgeSynthesis> {
    if (vault.length === 0) {
      throw new Error("Vault empty. No intelligence nodes available.");
    }

    const cacheKey = `global_synth_v3:${vault.length}:${vault[0].id}`;
    const cached = getCache<KnowledgeSynthesis>(cacheKey);
    if (cached) return cached;

    // 1. LINK DISCOVERY (Implicit Semantic Graph)
    const links = await buildLinks(vault);
    
    // 2. CLUSTERING (Emergent Themes)
    const vaultIds = vault.map(v => v.id);
    const clusters = await buildClusters(vaultIds, links);

    // 3. TEMPORAL REASONING
    const temporal = await analyzeTemporal(vault);

    // 4. CONTEXT BUILDING (Gemini Optimization)
    const context = buildContext(vault, links, clusters, temporal);

    // 5. GEMINI SYNTHESIS (ONE CALL MAX)
    const synthesisText = await synthesizeKnowledge(context);

    const synthesis: KnowledgeSynthesis = {
      text: synthesisText,
      clusters,
      links,
      temporal,
      timestamp: Date.now()
    };

    // 😈 TRIGGER DEVIL MONITOR (Background Watchdog)
    // We pass the confidence as a heuristic from temporal trend or link density
    const heuristicConfidence = temporal.trend === 'consolidating' ? 0.92 : 0.78;
    devilMonitor({
      type: 'synthesis',
      targetId: vault[0].id, // Anchor to the most recent node
      synthesisText,
      confidence: heuristicConfidence,
      vault
    });

    setCache(cacheKey, synthesis, 12 * 60 * 60 * 1000); // 12 hours
    return synthesis;
  }
};
