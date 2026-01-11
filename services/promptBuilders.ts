
import { VaultEntry } from "../schemas/vault.schema";

export const promptBuilders = {
  research: (topic: string, vaultContext: VaultEntry[]) => {
    const context = vaultContext.length > 0 
      ? `Existing context:\n${vaultContext.map(v => `- [${v.metadata.type}] ${v.summary}: ${v.content.slice(0, 200)}...`).join('\n')}`
      : 'No existing vault context.';

    return `
Perform an exhaustive research scan on: "${topic}".

${context}

Structure your response to include:
1. A master summary.
2. Individual key CLAIMS (distilled, factual assertions).
3. Any identified CONTRADICTIONS with existing context.
4. Primary SOURCES used.

Return a high-fidelity intelligence report.
`;
  },

  quickScan: (topic: string, vaultContext: VaultEntry[]) => {
    const context = vaultContext.length > 0 
      ? `Local intelligence found in vault:\n${vaultContext.map(v => `- ${v.summary}: ${v.content.slice(0, 300)}`).join('\n')}`
      : 'No local vault context relevant.';

    return `
Synthesize a rapid intelligence brief on: "${topic}".

Resources available:
- Internal training data.
- ${context}

Focus on immediate facts, definitions, and logical deductions. Do not use external search.
`;
  },

  localSynthesis: (topic: string, vaultContext: VaultEntry[]) => {
    const context = vaultContext.map(v => `- [${v.metadata.type}] ${v.summary}: ${v.content.slice(0, 500)}...`).join('\n');

    return `
Query: "${topic}"
Mode: Local Intelligence Synthesis (Search Engine Offline).

Task:
Synthesize an intelligence report using:
1. Your internal training data (general knowledge).
2. The provided Vault Intel below.

${context}

Requirements:
- Distinguish between "Internal Knowledge" and "Vault Intel".
- If you lack current data due to search being offline, state it clearly.
- Provide a master summary and key claims.
`;
  },

  inferLinks: (newItem: string, existingItems: VaultEntry[]) => {
    return `
Analyze this new intelligence against existing vault nodes.
New Item: "${newItem}"

Existing Nodes:
${existingItems.map(v => `- ID: ${v.id} | Summary: ${v.summary} | Type: ${v.metadata.type}`).join('\n')}

Identify semantic relationships.
Valid relations: 'supports', 'contradicts', 'expands', 'derived_from', 'questions'.

Return ONLY a JSON array of objects: { targetId: string, relation: string, reason: string }.
`;
  },

  skeptic: (claims: VaultEntry[]) => {
    return `
You are the Aethelgard Skeptic Agent. Your objective is to identify weak assertions, logical fallacies, or unsupported claims in the knowledge vault.

Claims to evaluate:
${claims.map(c => `- ID: ${c.id} | Content: ${c.content}`).join('\n')}

For each claim, identify:
1. Potential flaws or biases.
2. Missing evidence.
3. Logical contradictions.

Return a list of critical annotations and potential counter-questions.
`;
  }
};
