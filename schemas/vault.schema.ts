
import { VaultAnnotation } from "../types";

export type VaultItemType = 'note' | 'summary' | 'claim' | 'source' | 'question';

export interface VaultLink {
  targetId: string;
  relation: 'supports' | 'contradicts' | 'expands' | 'derived_from' | 'questions';
}

export interface VaultEntryMetadata {
  type: VaultItemType;
  source?: string;
  tags: string[];
  confidence?: number; // 0 to 1
  sources?: { uri: string; title: string }[];
  links?: VaultLink[];
  createdBy: 'user' | 'ai';
}

export interface VaultEntry {
  id: string;
  workspaceId: string;
  content: string;
  summary: string;
  metadata: VaultEntryMetadata;
  version: number;
  hash: string;
  createdAt: number;
  updatedAt: number;
  annotations?: VaultAnnotation[];
}
