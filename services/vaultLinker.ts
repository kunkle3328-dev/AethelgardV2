
import Fuse from "fuse.js";
import { VaultEntry } from "../schemas/vault.schema";
import { SourceResult } from "../types";

let vaultIndex: Fuse<VaultEntry> | null = null;

/**
 * 🔗 AETHELGARD VAULT LINKER
 * Connects live search findings to existing user research graph.
 */
export function buildVaultIndex(items: VaultEntry[]) {
  vaultIndex = new Fuse(items, {
    keys: ["summary", "content", "metadata.tags"],
    threshold: 0.35,
    includeScore: true
  });
}

export function linkToVault(
  results: SourceResult[],
  vault: VaultEntry[]
): SourceResult[] {
  // Rebuild index for current set of items
  buildVaultIndex(vault);

  return results.map(r => {
    if (!vaultIndex) return r;

    // Search for matches in vault for each result
    const searchString = `${r.title} ${r.snippet}`;
    const matches = vaultIndex.search(searchString).slice(0, 3);

    return {
      ...r,
      explanation: matches.map(m => `Relates to: ${m.item.summary} (Match: ${Math.round((1 - (m.score || 0)) * 100)}%)`)
    };
  });
}
