
import { create } from 'zustand';
import { VaultEntry } from '../schemas/vault.schema';
import { embeddingService } from '../services/embeddingService';
import { useEmbeddingStore } from './embeddingStore';
import { VaultAnnotation, AgentMessage } from '../types';

interface VaultStore {
  items: VaultEntry[];
  addItem: (entry: VaultEntry) => void;
  addAnnotation: (entryId: string, annotation: VaultAnnotation) => void;
  addAnnotationReply: (entryId: string, annotationId: string, message: AgentMessage) => void;
  deleteItem: (id: string) => void;
  getLatestById: (id: string) => VaultEntry | undefined;
  getHistoryById: (id: string) => VaultEntry[];
}

export const useVaultStore = create<VaultStore>((set, get) => ({
  items: JSON.parse(localStorage.getItem('aethel_vault_v2') || '[]'),
  
  addItem: (entry) => {
    set((state) => {
      const next = [entry, ...state.items];
      localStorage.setItem('aethel_vault_v2', JSON.stringify(next));
      return { items: next };
    });

    // Background Intelligence: Generate embeddings for new entry
    embeddingService.generate(entry.id, entry.content, "vault").then(record => {
      useEmbeddingStore.getState().index(record);
    }).catch(console.error);
  },

  addAnnotation: (entryId, annotation) => {
    set((state) => {
      const next = state.items.map(item => {
        if (item.id === entryId) {
          const annotations = [...(item.annotations || []), { ...annotation, thread: annotation.thread || [] }];
          return { ...item, annotations };
        }
        return item;
      });
      localStorage.setItem('aethel_vault_v2', JSON.stringify(next));
      return { items: next };
    });
  },

  addAnnotationReply: (entryId, annotationId, message) => {
    set((state) => {
      const next = state.items.map(item => {
        if (item.id === entryId) {
          const annotations = (item.annotations || []).map(a => {
            if (a.id === annotationId) {
              const thread = [...(a.thread || []), message];
              return { ...a, thread };
            }
            return a;
          });
          return { ...item, annotations };
        }
        return item;
      });
      localStorage.setItem('aethel_vault_v2', JSON.stringify(next));
      return { items: next };
    });
  },

  deleteItem: (id) => set((state) => {
    const next = state.items.filter(e => e.id !== id);
    localStorage.setItem('aethel_vault_v2', JSON.stringify(next));
    return { items: next };
  }),

  getLatestById: (id) => {
    return get().items
      .filter(e => e.id === id)
      .sort((a, b) => b.version - a.version)[0];
  },

  getHistoryById: (id) => {
    return get().items
      .filter(e => e.id === id)
      .sort((a, b) => b.version - a.version);
  }
}));
