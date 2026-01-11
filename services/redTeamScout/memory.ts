
import { ScoutMemory } from "../../types";
import { useVaultStore } from "../../stores/vaultStore";

/**
 * 🧠 SCOUT MEMORY
 * Tracks what the system has historically doubted or corrected.
 */
export async function loadScoutMemory(): Promise<ScoutMemory> {
  const { items } = useVaultStore.getState();
  
  // Infer interests from tag density
  const tagCounts: Record<string, number> = {};
  items.forEach(item => {
    (item.metadata.tags || []).forEach(tag => {
      tagCounts[tag] = (tagCounts[tag] || 0) + 1;
    });
  });

  const interests = Object.entries(tagCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(e => e[0]);

  // Unresolved threads are investigations with low confidence
  const unresolvedThreads = items
    .filter(i => i.metadata.tags?.includes('investigation') && i.metadata.confidence && i.metadata.confidence < 0.7)
    .map(i => i.id);

  // Extract historical errors from annotations where a correction was confirmed
  const historicalErrors = items.flatMap(item => 
    (item.annotations || [])
      .filter(a => a.type === 'red_team_scout' || a.type === 'adversarial_finding')
      .map(a => ({
        synthesisId: item.id,
        hypothesis: a.message,
        confirmed: a.severity > 0.8 // High severity findings act as confirmed corrections
      }))
  ).slice(0, 50);

  return {
    interests,
    unresolvedThreads,
    historicalErrors
  };
}
