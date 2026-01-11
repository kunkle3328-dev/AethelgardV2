
import { VaultEntry } from "../../schemas/vault.schema";
import { Assumption } from "./assumptions";

export interface Contradiction {
  assumption: string;
  sourceId: string;
  reason: string;
  strength: number;
}

function calculateContradictionScore(claim: string, content: string): number {
  const c1 = claim.toLowerCase();
  const c2 = content.toLowerCase();
  
  // Simple heuristic: if claim has high word overlap but contains negation differences
  const negations = ["not", "never", "no", "fail", "contrary", "unlikely", "false"];
  const hasNegation1 = negations.some(n => c1.includes(n));
  const hasNegation2 = negations.some(n => c2.includes(n));
  
  const words1 = new Set(c1.match(/\w+/g) || []);
  const words2 = new Set(c2.match(/\w+/g) || []);
  const intersection = new Set([...words1].filter(x => words2.has(x)));
  const overlap = intersection.size / Math.min(words1.size, words2.size);

  // If overlap is high but one has negation and other doesn't, it's a potential contradiction
  if (overlap > 0.4 && hasNegation1 !== hasNegation2) return overlap + 0.2;
  return 0;
}

export async function findContradictions(
  assumptions: Assumption[], 
  vault: VaultEntry[]
): Promise<Contradiction[]> {
  const contradictions: Contradiction[] = [];

  for (const assumption of assumptions) {
    for (const entry of vault) {
      const score = calculateContradictionScore(assumption.claim, entry.content);
      if (score > 0.6) {
        contradictions.push({
          assumption: assumption.claim,
          sourceId: entry.id,
          reason: `Vault entry "${entry.summary}" contains potentially conflicting evidence.`,
          strength: score
        });
      }
    }
  }

  return contradictions.sort((a, b) => b.strength - a.strength);
}
