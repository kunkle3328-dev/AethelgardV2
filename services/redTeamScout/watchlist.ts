
import { VaultEntry } from "../../schemas/vault.schema";

/**
 * 🕵️‍♂️ SCOUT WATCHLIST
 * Broadened to monitor the entire vault over time.
 * Prioritizes high-confidence/low-evidence items but includes a rotation 
 * of all nodes to ensure no belief goes unchallenged indefinitely.
 */
export function getScoutWatchlist(vault: VaultEntry[]) {
  return vault.filter(v => {
    const confidence = v.metadata.confidence || 0.5;
    const sources = v.metadata.sources?.length || 0;
    const ageDays = (Date.now() - v.updatedAt) / (1000 * 60 * 60 * 24);

    // 1. High Priority: High confidence assertions with thin evidence
    const isHighPriority = confidence > 0.8 && sources < 3;
    
    // 2. Staleness: Items that haven't been reviewed in 30 days
    const isStale = ageDays > 30;

    // 3. Rotation: Random 20% of the vault to ensure coverage of "low priority" nodes
    const isInRotation = Math.random() < 0.2;

    return isHighPriority || isStale || isInRotation;
  });
}
