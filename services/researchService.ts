
/**
 * 🛡️ AETHELGARD RESEARCH ORCHESTRATOR (v1.1)
 * 
 * Orchestrates the full Intelligence Engine cycle:
 * 1. Neural Retrieval (Gemini Grounding)
 * 2. Temporal Diff (Detect what's new since last scan)
 * 3. Smart Clustering (Theme discovery)
 * 4. Vault Linking (Semantic overlap with user brain)
 * 5. Gemini Synthesis (One-call Intelligence Report)
 */

import { runSearch } from "./searchService";
import { rankResults } from "./resultScorer";
import { linkToVault } from "./vaultLinker";
import { summarizeResults } from "./summarizationService";
import { clusterResults } from "./clusterEngine";
import { temporalStore, hashResult } from "./temporalStore";
import { VaultEntry } from "../schemas/vault.schema";
import { CognitiveProfile, ScanMode, ResearchResult, SourceResult } from "../types";
import { useAppStore } from "../stores/appStore";

export const researchService = {
  async performScan(
    query: string, 
    vaultContext: VaultEntry[], 
    profile: CognitiveProfile | null, 
    scanMode: ScanMode = 'quick'
  ): Promise<ResearchResult> {
    const { freshnessLevel } = useAppStore.getState();

    // 1. NEURAL RETRIEVAL
    const rawSources = await runSearch(query, freshnessLevel === 'latest' ? 'latest' : 'balanced');
    
    // 2. TEMPORAL DIFF ENGINE
    const previousSnapshot = temporalStore.getSnapshot(query);
    const currentHashes = rawSources.map(s => hashResult(s.uri, s.title));
    
    const newFindings: SourceResult[] = rawSources.filter(s => {
      if (!previousSnapshot) return true;
      const h = hashResult(s.uri, s.title);
      return !previousSnapshot.hashes.includes(h);
    });

    // Save for next time
    temporalStore.saveSnapshot(query, currentHashes);

    // 3. RANKING & SCORING
    const ranked = rankResults(rawSources, query);
    
    // 4. SMART CLUSTERING
    const clusters = clusterResults(ranked);

    // 5. VAULT LINKING
    const linked = linkToVault(ranked, vaultContext);

    // 6. INTELLIGENCE SYNTHESIS (ONE CALL)
    try {
      const summaryText = await summarizeResults(
        query,
        newFindings.slice(0, 5).map(f => `${f.title} (${f.uri})`),
        clusters.map(c => ({ label: c.label, count: c.items.length })),
        vaultContext.slice(0, 5).map(v => v.summary)
      );

      return {
        text: summaryText,
        sources: linked,
        mode: 'live',
        status: linked.length > 0 ? 'optimal' : 'offline',
        query
      };
    } catch (e) {
      console.warn("Synthesis enrichment bypassed.", e);
      return {
        text: null,
        sources: linked,
        mode: 'live',
        status: linked.length > 0 ? 'optimal' : 'offline',
        query
      };
    }
  },

  async inferRelationships(text: string, existingItems: VaultEntry[]) {
    // Relationship inference can be expanded here using the cluster/link logic
    return [];
  }
};
