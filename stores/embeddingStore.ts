
import { create } from 'zustand';
import { EmbeddingRecord } from '../schemas/embedding.schema';

interface EmbeddingStore {
  records: EmbeddingRecord[];
  index: (record: EmbeddingRecord) => void;
  findSimilar: (vector: number[], limit?: number) => EmbeddingRecord[];
}

function cosineSimilarity(v1: number[], v2: number[]): number {
  let dotProduct = 0;
  let mA = 0;
  let mB = 0;
  for (let i = 0; i < Math.min(v1.length, v2.length); i++) {
    dotProduct += v1[i] * v2[i];
    mA += v1[i] * v1[i];
    mB += v2[i] * v2[i];
  }
  return dotProduct / (Math.sqrt(mA) * Math.sqrt(mB));
}

export const useEmbeddingStore = create<EmbeddingStore>((set, get) => ({
  records: JSON.parse(localStorage.getItem('aethel_embeddings') || '[]'),
  
  index: (record) => set((state) => {
    const next = [...state.records, record];
    localStorage.setItem('aethel_embeddings', JSON.stringify(next));
    return { records: next };
  }),

  findSimilar: (vector, limit = 5) => {
    return get().records
      .map(r => ({ ...r, similarity: cosineSimilarity(vector, r.vector) }))
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit);
  }
}));
