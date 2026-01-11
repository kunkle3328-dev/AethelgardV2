
import { SourceResult } from "../types";

export interface ResultCluster {
  label: string;
  items: SourceResult[];
}

/**
 * 🧩 AETHELGARD CLUSTER ENGINE
 * Groups results into logical "Themes" based on domain and snippet terminology.
 */
export function clusterResults(results: SourceResult[]): ResultCluster[] {
  const clusters: Record<string, SourceResult[]> = {};

  // Simple heuristic for theme discovery
  const KEYWORD_MAP: Record<string, string[]> = {
    "Academic Research": ["study", "research", "paper", "journal", "university", "abstract"],
    "News & Media": ["report", "news", "today", "breaking", "update", "article"],
    "Technical Specs": ["api", "documentation", "github", "source", "code", "dev"],
    "General Strategy": ["overview", "guide", "strategy", "analysis", "framework"],
    "Market Trends": ["market", "price", "stock", "industry", "business", "commercial"]
  };

  for (const r of results) {
    let assigned = false;
    const text = (r.title + " " + r.snippet).toLowerCase();

    for (const [label, keywords] of Object.entries(KEYWORD_MAP)) {
      if (keywords.some(kw => text.includes(kw))) {
        if (!clusters[label]) clusters[label] = [];
        clusters[label].push(r);
        assigned = true;
        break;
      }
    }

    if (!assigned) {
      const label = "Grounded Intelligence";
      if (!clusters[label]) clusters[label] = [];
      clusters[label].push(r);
    }
  }

  return Object.entries(clusters)
    .map(([label, items]) => ({ label, items }))
    .sort((a, b) => b.items.length - a.items.length);
}
