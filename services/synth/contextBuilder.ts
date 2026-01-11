
import { VaultEntry } from "../../schemas/vault.schema";
import { VaultLink } from "./linker";
import { IdeaCluster } from "./cluster";
import { TemporalAnalysis } from "./temporal";

export interface SynthContext {
  clusters: any[];
  keyLinks: any[];
  temporal: TemporalAnalysis;
  samples: string[];
}

export function buildContext(
  entries: VaultEntry[],
  links: VaultLink[],
  clusters: IdeaCluster[],
  temporal: TemporalAnalysis
): SynthContext {
  // Select top links and clusters
  const keyLinks = links.slice(0, 10).map(l => {
    const fromItem = entries.find(e => e.id === l.from);
    const toItem = entries.find(e => e.id === l.to);
    return {
      connection: `${fromItem?.summary} <-> ${toItem?.summary}`,
      strength: Math.round(l.strength * 100) + "%"
    };
  });

  const clusterSummaries = clusters.slice(0, 5).map(c => ({
    theme: c.label,
    density: c.nodes.length,
    members: c.nodes.map(id => entries.find(e => e.id === id)?.summary).join(", ")
  }));

  return {
    clusters: clusterSummaries,
    keyLinks,
    temporal,
    samples: entries.slice(0, 15).map(e => `[${e.summary}]: ${e.content.slice(0, 200)}`)
  };
}
