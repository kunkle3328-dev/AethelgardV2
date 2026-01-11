
import { VaultLink } from "./linker";

export interface IdeaCluster {
  label: string;
  nodes: string[];
  weight: number;
}

export async function buildClusters(vaultIds: string[], links: VaultLink[]): Promise<IdeaCluster[]> {
  const clusters: IdeaCluster[] = [];
  const visited = new Set<string>();

  // Simple Connected Components approach for clustering
  for (const id of vaultIds) {
    if (visited.has(id)) continue;

    const clusterNodes = new Set<string>([id]);
    let totalWeight = 0;
    
    // Breadth-first traversal to find connected nodes
    const queue = [id];
    while (queue.length > 0) {
      const current = queue.shift()!;
      visited.add(current);
      
      const relatedLinks = links.filter(l => l.from === current || l.to === current);
      for (const link of relatedLinks) {
        const neighbor = link.from === current ? link.to : link.from;
        if (!clusterNodes.has(neighbor)) {
          clusterNodes.add(neighbor);
          totalWeight += link.strength;
          queue.push(neighbor);
        }
      }
    }

    if (clusterNodes.size > 1) {
      clusters.push({
        label: `Emergent Cluster ${clusters.length + 1}`,
        nodes: Array.from(clusterNodes),
        weight: totalWeight
      });
    }
  }

  return clusters.sort((a, b) => b.weight - a.weight);
}
