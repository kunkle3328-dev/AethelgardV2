
import { extractAssumptions } from "./assumptions";
import { findContradictions } from "./contradictions";
import { generateCounterfactuals } from "./counterfactuals";
import { runDebate } from "./debate";
import { stressTestConfidence } from "./confidence";
import { summarizeChallenges } from "./summarize";
import { generateSteelman } from "./steelman";
import { legalReview } from "./legal";
import { academicReview } from "./academic";
import { VaultEntry } from "../../schemas/vault.schema";
import { DevilsAdvocateReport, DevilMode } from "../../types";

/**
 * 😈 AETHELGARD DEVIL'S ADVOCATE ORCHESTRATOR (v2.0)
 * Pressure-tests a synthesis against the local vault and logical counters.
 * Supports specialized modes: legal, academic, and steelman.
 */
export async function runDevilsAdvocate(
  synthesis: string, 
  vault: VaultEntry[],
  mode: DevilMode = 'standard'
): Promise<DevilsAdvocateReport> {
  // 1. Assumption Extraction
  const assumptions = extractAssumptions(synthesis);
  
  // 2. Contradiction Scan
  const contradictions = await findContradictions(assumptions, vault);
  
  // 3. Counterfactual Generator
  const counterfactuals = generateCounterfactuals(assumptions);

  // 4. Mode-Specific logic
  let steelman: string | undefined;
  let reviewMetrics: any;

  if (mode === 'steelman' || mode === 'standard') {
    steelman = await generateSteelman(synthesis);
  }

  if (mode === 'legal') {
    reviewMetrics = legalReview(synthesis, contradictions);
  } else if (mode === 'academic') {
    reviewMetrics = academicReview(synthesis, contradictions);
  }

  // 5. Debate Engine
  const debateOutcome = await runDebate({
    synthesis,
    assumptions,
    contradictions,
    counterfactuals
  });

  // 6. Confidence Stress Test
  const confidence = stressTestConfidence(synthesis, contradictions);

  // 7. Final Report
  // Fix: Pass mode to summarizeChallenges
  const report = summarizeChallenges({
    contradictions,
    counterfactuals,
    debateOutcome,
    confidence,
    mode
  });

  return {
    ...report,
    steelman,
    reviewMetrics
  };
}
