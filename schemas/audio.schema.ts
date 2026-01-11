
export interface AudioBriefing {
  id: string;
  vaultEntryIds: string[];
  vaultEntryHashes: string[];
  audioUrl: string;
  transcript: string;
  createdAt: number;
}
