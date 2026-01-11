
import { ResearchThread, SourceResult } from "../../types";
import { VaultEntry } from "../../schemas/vault.schema";
import { useVaultStore } from "../../stores/vaultStore";

export async function openResearchThread(params: {
  parentSynthesis: VaultEntry;
  hypothesis: string;
  sources: SourceResult[];
}) {
  const thread: ResearchThread = {
    id: crypto.randomUUID(),
    title: `Unresolved: ${params.hypothesis.slice(0, 50)}...`,
    origin: params.parentSynthesis.id,
    status: "open",
    createdBy: "RedTeamScout",
    focus: params.hypothesis,
    sources: params.sources,
    confidence: 0.5,
    createdAt: Date.now()
  };

  // Store in Vault as a new entry with specific metadata
  const { addItem } = useVaultStore.getState();
  
  addItem({
    id: thread.id,
    workspaceId: params.parentSynthesis.workspaceId,
    content: `AUTO-OPENED INVESTIGATION\nFocus: ${params.hypothesis}\n\nEvidence base: ${params.sources.length} nodes.`,
    summary: thread.title,
    metadata: {
      type: 'claim',
      tags: ['auto-opened', 'red-team', 'investigation'],
      confidence: 0.5,
      sources: params.sources,
      createdBy: 'ai',
      links: [{ targetId: params.parentSynthesis.id, relation: 'questions' }]
    },
    version: 1,
    hash: 'thread-' + thread.id,
    createdAt: thread.createdAt,
    updatedAt: thread.createdAt
  });

  return thread;
}
