
import { Contradiction } from "./contradictions";
import { Counterfactual } from "./counterfactuals";
import { ConfidenceTest } from "./confidence";
import { DevilsAdvocateReport, DevilMode } from "../../types";

// Fix: Add mode to params and return object to satisfy DevilsAdvocateReport interface
export function summarizeChallenges(params: {
  contradictions: Contradiction[];
  counterfactuals: Counterfactual[];
  debateOutcome: string;
  confidence: ConfidenceTest;
  mode: DevilMode;
}): DevilsAdvocateReport {
  return {
    headline: "Devil’s Advocate Intelligence Review",
    keyChallenges: params.contradictions.slice(0, 5),
    counterfactuals: params.counterfactuals.slice(0, 3),
    debateOutcome: params.debateOutcome,
    confidenceAdjustment: params.confidence,
    mode: params.mode
  };
}
