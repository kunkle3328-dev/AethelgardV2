
import { Assumption } from "./assumptions";

export interface Counterfactual {
  original: string;
  counter: string;
  risk: string;
}

function invertClaim(claim: string): string {
  if (claim.includes("is ")) return claim.replace("is ", "is NOT ");
  if (claim.includes("will ")) return claim.replace("will ", "will NOT ");
  if (claim.includes("can ")) return claim.replace("can ", "cannot ");
  return `the inverse of "${claim}"`;
}

export function generateCounterfactuals(assumptions: Assumption[]): Counterfactual[] {
  return assumptions.map(a => ({
    original: a.claim,
    counter: `Hypothesis: What if the opposite is true—specifically, that ${invertClaim(a.claim)}?`,
    risk: "Unexamined alternative logic or confirmation bias."
  }));
}
