
import { VaultEntry } from "../../schemas/vault.schema";

export interface VaultLink {
  from: string;
  to: string;
  strength: number;
  reason: string;
}

function calculateSimilarity(a: string, b: string): number {
  const wordsA = new Set(a.toLowerCase().match(/\w+/g) || []);
  const wordsB = new Set(b.toLowerCase().match(/\w+/g) || []);
  const intersection = new Set([...wordsA].filter(x => wordsB.has(x)));
  return (intersection.size * 2) / (wordsA.size + wordsB.size);
}

export async function buildLinks(entries: VaultEntry[]): Promise<VaultLink[]> {
  const links: VaultLink[] = [];
  
  // O(n^2) is fine for typically sized personal vaults (< 1000 items)
  for (let i = 0; i < entries.length; i++) {
    for (let j = i + 1; j < entries.length; j++) {
      const textA = `${entries[i].summary} ${entries[i].content}`;
      const textB = `${entries[j].summary} ${entries[j].content}`;
      const score = calculateSimilarity(textA, textB);

      if (score > 0.45) { // Threshold for meaningful link
        links.push({
          from: entries[i].id,
          to: entries[j].id,
          strength: score,
          reason: "semantic overlap"
        });
      }
    }
  }

  return links.sort((a, b) => b.strength - a.strength);
}
