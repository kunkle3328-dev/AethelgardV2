
export interface SyncEvent {
  id: string;
  type: "vault" | "audio" | "agent" | "debate";
  payload: unknown;
  version: number;
  hash: string;
  createdAt: number;
}

export interface SyncStatus {
  lastSync?: number;
  pendingEvents: number;
  isOnline: boolean;
}
