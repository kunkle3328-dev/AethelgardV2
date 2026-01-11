
import { Contradiction } from "./contradictions";

export function legalReview(synthesis: string, contradictions: Contradiction[]) {
  // Simple heuristic based evaluation
  const speculativeCount = (synthesis.match(/perhaps|maybe|likely|appears/gi) || []).length;
  const evidenceWeight = contradictions.length > 3 ? "Compromised" : "Admissible";

  return {
    burdenMet: contradictions.length === 0 && speculativeCount < 5,
    weakPoints: speculativeCount,
    evidenceWeight,
    verdict: contradictions.length > 2 
      ? "Insufficient proof beyond reasonable doubt." 
      : "Provisional admissibility granted."
  };
}
