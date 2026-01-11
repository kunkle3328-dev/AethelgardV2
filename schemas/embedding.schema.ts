
export interface EmbeddingRecord {
  id: string;
  sourceType: "vault" | "research" | "debate";
  sourceId: string;
  vector: number[];
  createdAt: number;
}
