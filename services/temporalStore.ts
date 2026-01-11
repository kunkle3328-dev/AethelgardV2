
export interface TemporalSnapshot {
  query: string;
  hashes: string[];
  timestamp: number;
}

const STORAGE_KEY = 'aethel_temporal_snapshots';

/**
 * ⏳ AETHELGARD TEMPORAL STORE
 * Manages snapshots of research results over time.
 */
export const temporalStore = {
  getSnapshot(query: string): TemporalSnapshot | null {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const snapshots: TemporalSnapshot[] = JSON.parse(raw);
    return snapshots.find(s => s.query.toLowerCase() === query.toLowerCase()) || null;
  },

  saveSnapshot(query: string, hashes: string[]) {
    const raw = localStorage.getItem(STORAGE_KEY);
    let snapshots: TemporalSnapshot[] = raw ? JSON.parse(raw) : [];
    
    // Update or add
    const index = snapshots.findIndex(s => s.query.toLowerCase() === query.toLowerCase());
    const newSnapshot = { query, hashes, timestamp: Date.now() };
    
    if (index >= 0) {
      snapshots[index] = newSnapshot;
    } else {
      snapshots.push(newSnapshot);
    }

    // Keep only last 50 queries to prevent storage bloat
    if (snapshots.length > 50) snapshots.shift();
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshots));
  }
};

/**
 * Generates a simple hash for a search result to detect changes.
 */
export function hashResult(uri: string, title: string): string {
  return `${uri}|${title}`.split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0);
    return a & a;
  }, 0).toString(16);
}
