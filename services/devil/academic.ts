
import { Contradiction } from "./contradictions";

export function academicReview(synthesis: string, contradictions: Contradiction[]) {
  const peerReviewedHeuristic = !synthesis.toLowerCase().includes("i think") && synthesis.length > 500;
  
  return {
    peerSupported: peerReviewedHeuristic,
    replicationRisk: contradictions.length > 0 ? "High" : "Low",
    missingCitations: (synthesis.match(/\*/g) || []).length < 4,
    confidenceGrade: contradictions.length > 1 ? "Provisional" : "Peer-Verified"
  };
}
