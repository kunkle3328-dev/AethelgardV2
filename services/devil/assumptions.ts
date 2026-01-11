
export interface Assumption {
  claim: string;
  confidence: number;
}

/**
 * 😈 AETHELGARD ASSUMPTION EXTRACTION
 * Pulls implicit claims from synthesis text without LLM overhead.
 */
export function extractAssumptions(text: string): Assumption[] {
  const patterns = [
    /this suggests that (.+?)(?:\.|$)/gi,
    /it is likely that (.+?)(?:\.|$)/gi,
    /the evidence shows (.+?)(?:\.|$)/gi,
    /this means that (.+?)(?:\.|$)/gi,
    /appears to be (.+?)(?:\.|$)/gi,
    /indicates that (.+?)(?:\.|$)/gi
  ];

  const assumptions: Assumption[] = [];

  for (const pattern of patterns) {
    const matches = text.matchAll(pattern);
    for (const match of matches) {
      if (match[1] && match[1].length > 10) {
        assumptions.push({
          claim: match[1].trim(),
          confidence: 0.7
        });
      }
    }
  }

  // Deduplicate
  return assumptions.filter((v, i, a) => a.findIndex(t => t.claim === v.claim) === i);
}
