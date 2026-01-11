
/**
 * 😈 AETHELGARD AUTO-TRIGGER LOGIC
 * Determines if a synthesis requires a forced adversarial review.
 */
export function shouldTriggerDevil(metrics: {
  confidence: number;
  evidenceCount: number;
  claimCount: number;
  languageSignals: {
    absolutes: number;
    hedgingScore: number;
  };
}): boolean {
  // 1. Confidence vs Evidence Spike
  if (metrics.confidence > 0.82 && metrics.evidenceCount < metrics.claimCount) return true;
  
  // 2. Absolutist Language Trigger
  if (metrics.languageSignals.absolutes > 2) return true;
  
  // 3. Low Hedging with High Confidence
  if (metrics.confidence - metrics.languageSignals.hedgingScore > 0.4) return true;

  return false;
}

export function extractLanguageSignals(text: string) {
  const absoluteWords = ["clearly", "proves", "undeniable", "absolute", "fact", "certainly", "obviously"];
  const hedgingWords = ["suggests", "might", "potentially", "likely", "provisional", "hypothesized"];
  
  const words = text.toLowerCase().split(/\W+/);
  const absolutes = words.filter(w => absoluteWords.includes(w)).length;
  const hedgingCount = words.filter(w => hedgingWords.includes(w)).length;
  
  return {
    absolutes,
    hedgingScore: hedgingCount / Math.max(1, words.length / 50) // Normalized score
  };
}
