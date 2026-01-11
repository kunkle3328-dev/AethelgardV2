
import { getScoutWatchlist } from "./watchlist";
import { generateHypotheses } from "./hypotheses";
import { scoutSearch } from "./scoutSearch";
import { detectDrift } from "./drift";
import { adjustConfidence } from "./confidence";
import { openResearchThread } from "./threads";
import { inferDomain, DOMAIN_SCOUTS } from "./domains/index";
import { loadScoutMemory } from "./memory";
import { deriveScoutGoals } from "./goals";
import { VaultEntry } from "../../schemas/vault.schema";
import { useVaultStore } from "../../stores/vaultStore";
import { useAppStore } from "../../stores/appStore";
import { ScoutGoal } from "../../types";

/**
 * 🎯 GOAL PURSUIT
 * Executes an autonomous search loop based on high-level research objectives.
 */
async function pursueGoal(goal: ScoutGoal) {
  console.log(`[SCOUT PARTNER] Pursuing Goal: ${goal.focus}`);
  const findings = await scoutSearch(goal.focus);
  
  if (findings.length > 3) {
    const { addScoutUpdate } = useAppStore.getState();
    addScoutUpdate({
      id: crypto.randomUUID(),
      synthesisId: "global",
      title: "Goal Pursuit Result",
      hypothesis: goal.focus,
      findings: `Autonomous investigation for "${goal.focus}" yielded ${findings.length} new nodes.`,
      driftScore: 0.5,
      timestamp: Date.now(),
      priority: goal.priority,
      read: false
    });
  }
}

/**
 * 🔴 AETHELGARD RED-TEAM SCOUT (Research Partner Orchestrator)
 */
export async function runRedTeamScout() {
  const { items, addAnnotation } = useVaultStore.getState();
  const { addScoutUpdate } = useAppStore.getState();
  
  // 1. Load Memory & Pursue Goals (Continuity)
  const memory = await loadScoutMemory();
  const goals = deriveScoutGoals(memory);
  
  for (const goal of goals.slice(0, 3)) { // Limit concurrent goals to prevent search flooding
    await pursueGoal(goal);
  }

  // 2. Continuous Vault Monitoring (Audit)
  const watchlist = getScoutWatchlist(items);
  console.log(`[SCOUT] Vault Audit Watchlist: ${watchlist.length} nodes.`);

  for (const entry of watchlist) {
    const hypotheses = await generateHypotheses(entry);
    const domain = inferDomain(entry);
    const domainScout = DOMAIN_SCOUTS[domain];
    
    for (const h of hypotheses) {
      const results = await scoutSearch(h);
      const drift = detectDrift(results, entry.metadata.sources || []);
      const domainRules = domainScout(entry, results);

      let nextConfidence = adjustConfidence(entry.metadata.confidence || 0.8, drift.noveltyScore, drift.significant);
      if (domainRules.confidenceCap) {
        nextConfidence = Math.min(nextConfidence, domainRules.confidenceCap);
      }

      // 3. Autonomous Expansion & Drift Detection
      if (drift.significant) {
        if (nextConfidence < 0.6) {
          await openResearchThread({
            parentSynthesis: entry,
            hypothesis: h,
            sources: results.slice(0, 5)
          });
        }

        const warning = domainRules.warning ? ` [${domain.toUpperCase()} WARNING: ${domainRules.warning}]` : '';
        addAnnotation(entry.id, {
          id: crypto.randomUUID(),
          type: 'red_team_scout',
          agent: 'RedTeamScout',
          message: `Long-term monitoring update: "${h}" has new contradictory evidence.${warning} Confidence adjusted.`,
          severity: drift.noveltyScore,
          timestamp: Date.now(),
          sources: results
        });

        addScoutUpdate({
          id: crypto.randomUUID(),
          synthesisId: entry.id,
          title: entry.summary,
          hypothesis: h,
          findings: `I've been keeping an eye on this. Something changed in the ${domain} landscape. New evidence challenges previous assumptions.`,
          driftScore: drift.noveltyScore,
          timestamp: Date.now(),
          priority: drift.noveltyScore > 0.7 ? 'high' : 'medium',
          read: false
        });
      }
    }
  }
}
