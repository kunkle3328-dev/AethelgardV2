
import { Contradiction } from "./contradictions";

export interface ConfidenceTest {
  originalConfidence: number;
  adjustedConfidence: number;
  warning: string | null;
}

export function stressTestConfidence(
  synthesisText: string, 
  contradictions: Contradiction[]
): ConfidenceTest {
  // Baseline confidence 0.85
  const originalConfidence = 0.85;
  const penalty = contradictions.length * 0.12;

  const adjustedConfidence = Math.max(0.3, originalConfidence - penalty);
  
  return {
    originalConfidence,
    adjustedConfidence: parseFloat(adjustedConfidence.toFixed(2)),
    warning: penalty > 0.3 
      ? "HIGH UNCERTAINTY: Multiple vault nodes contradict current synthesis." 
      : penalty > 0.1 
        ? "MODERATE DRIFT: Minor contradictions detected in archive."
        : null
  };
}
