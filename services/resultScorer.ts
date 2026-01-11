
import { SourceResult } from "../types";

const DOMAIN_AUTHORITY: Record<string, number> = {
  "nature.com": 0.95,
  "arxiv.org": 0.9,
  "bbc.com": 0.85,
  "reuters.com": 0.9,
  "medium.com": 0.5,
  "wikipedia.org": 0.8,
  "github.com": 0.75
};

function freshnessScore(date?: string) {
  if (!date) return 0.4;
  const days = (Date.now() - new Date(date).getTime()) / 86400000;
  return Math.max(0, 1 - days / 365);
}

export function rankResults(results: SourceResult[], query: string): SourceResult[] {
  const q = query.toLowerCase();

  return results.map(r => {
    const relevance =
      r.title.toLowerCase().includes(q) ? 1 :
      r.snippet.toLowerCase().includes(q) ? 0.7 : 0.4;

    const domain = new URL(r.uri).hostname.replace('www.', '');
    const authority = DOMAIN_AUTHORITY[domain] ?? 0.6;
    const fresh = freshnessScore(r.published);

    const score = 0.4 * fresh + 0.3 * relevance + 0.3 * authority;
    return { ...r, score };
  }).sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
}
