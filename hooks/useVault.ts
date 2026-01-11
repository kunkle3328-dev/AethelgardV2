
import { useVaultStore } from '../stores/vaultStore';
import { VaultEntry, VaultEntryMetadata } from '../schemas/vault.schema';
import { hashVaultEntry } from '../utils/crypto';
import { researchService } from '../services/researchService';

/**
 * Generates a unique ID compatible with all browser environments.
 */
function generateSafeId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  // Fallback for non-secure contexts
  return 'id-' + Date.now().toString(36) + '-' + Math.random().toString(36).substring(2, 15);
}

export function useVault() {
  const store = useVaultStore();
  
  const saveResearch = async (title: string, text: string, sources: any[], existingId?: string) => {
    const id = existingId || generateSafeId();
    
    // 1. Initial Metadata
    const metadata: VaultEntryMetadata = {
      type: 'summary',
      tags: ['deep-scan'],
      sources: sources,
      createdBy: 'ai',
      confidence: 0.9,
      links: []
    };

    // 2. Semantic Inference (Auto-linking)
    // We treat this as an enhancement. If it takes too long (> 3s), we proceed without links
    // to ensure the user's data is saved immediately.
    try {
      const existingItems = store.items.filter(i => i.id !== id);
      if (existingItems.length > 0) {
        // Simple race to prevent AI hanging from blocking the user's save
        const inferencePromise = researchService.inferRelationships(text, existingItems);
        const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), 3000));
        
        const inferredLinks = await Promise.race([inferencePromise, timeoutPromise]) as any[];
        
        metadata.links = inferredLinks.map((l: any) => ({
          targetId: l.targetId,
          relation: l.relation as any
        }));
      }
    } catch (error) {
      console.warn("Archival proceeding without semantic links (inference skipped or failed).", error);
    }

    const hash = await hashVaultEntry(text, metadata);
    const latest = store.getLatestById(id);
    const version = latest ? latest.version + 1 : 1;

    // Avoid duplicate versions if content hasn't changed
    if (latest && latest.hash === hash) return latest;

    const entry: VaultEntry = {
      id,
      workspaceId: 'main',
      content: text,
      summary: title,
      metadata,
      version,
      hash,
      createdAt: latest ? latest.createdAt : Date.now(),
      updatedAt: Date.now(),
    };

    store.addItem(entry);
    return entry;
  };

  return {
    items: store.items.filter((v, i, a) => a.findIndex(t => t.id === v.id) === i),
    allEntries: store.items,
    saveResearch,
    deleteItem: store.deleteItem,
    getLatest: store.getLatestById,
    getHistory: store.getHistoryById
  };
}
