
import { SourceResult } from "../../types";

/**
 * 🕵️‍♂️ DRIFT DETECTION
 * Assesses if new findings are actually new or just noise.
 */
export function detectDrift(newSources: SourceResult[], oldSources: { uri: string; title: string }[]) {
  if (newSources.length === 0) return { noveltyScore: 0, significant: false };

  const oldUris = new Set(oldSources.map(s => s.uri.toLowerCase()));
  const oldDomains = new Set(oldSources.map(s => {
    try { return new URL(s.uri).hostname; } catch(e) { return ''; }
  }).filter(d => d !== ''));

  let novelty = 0;
  newSources.forEach(s => {
    const domain = new URL(s.uri).hostname;
    if (!oldUris.has(s.uri.toLowerCase()) && !oldDomains.has(domain)) {
      novelty++;
    }
  });

  const score = novelty / Math.max(1, newSources.length);
  return {
    noveltyScore: score,
    significant: score > 0.4 || novelty > 2
  };
}
