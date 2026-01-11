
import { VaultEntry } from "../../../schemas/vault.schema";
import { SourceResult } from "../../../types";

export interface DomainScoutResult {
  warning?: string;
  confidenceCap?: number;
  requiresRCT?: boolean;
  volatility?: 'low' | 'medium' | 'high';
  recheckIntervalDays?: number;
  jurisdictionConflicts?: string[];
}

export function inferDomain(entry: VaultEntry): 'medical' | 'legal' | 'tech' | 'general' {
  const text = (entry.summary + " " + entry.content).toLowerCase();
  const tags = entry.metadata.tags || [];

  if (tags.includes('medical') || text.includes('treatment') || text.includes('study') || text.includes('clinical')) return 'medical';
  if (tags.includes('legal') || text.includes('statute') || text.includes('court') || text.includes('law')) return 'legal';
  if (tags.includes('tech') || text.includes('api') || text.includes('software') || text.includes('version')) return 'tech';
  
  return 'general';
}

export const DOMAIN_SCOUTS = {
  medical: (synthesis: VaultEntry, sources: SourceResult[]): DomainScoutResult => {
    const hasRCT = sources.some(s => s.type === 'rct');
    return {
      requiresRCT: true,
      confidenceCap: hasRCT ? 0.95 : 0.7,
      warning: hasRCT ? undefined : "Clinical evidence relies on observational data. Confidence capped."
    };
  },
  legal: (synthesis: VaultEntry, sources: SourceResult[]): DomainScoutResult => {
    // Basic heuristic: check if multiple states/countries are mentioned in sources
    return {
      warning: "Legal interpretations are jurisdiction-sensitive. Verify local statutes."
    };
  },
  tech: (synthesis: VaultEntry, sources: SourceResult[]): DomainScoutResult => {
    return {
      volatility: "high",
      recheckIntervalDays: 7
    };
  },
  general: (): DomainScoutResult => ({})
};
