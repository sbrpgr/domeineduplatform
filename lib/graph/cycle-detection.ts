import type { RelationshipEdge } from '@/lib/types';

export function detectCircularRelationships(edges: RelationshipEdge[]): string[][] {
  const adjacency = new Map<string, string[]>();
  const nodes = new Set<string>();

  for (const edge of edges) {
    nodes.add(edge.from);
    nodes.add(edge.to);
    const neighbors = adjacency.get(edge.from) ?? [];
    neighbors.push(edge.to);
    adjacency.set(edge.from, neighbors);
  }

  const visited = new Set<string>();
  const stack = new Set<string>();
  const path: string[] = [];
  const cycles: string[][] = [];

  const dfs = (node: string) => {
    visited.add(node);
    stack.add(node);
    path.push(node);

    for (const neighbor of adjacency.get(node) ?? []) {
      if (!visited.has(neighbor)) {
        dfs(neighbor);
      } else if (stack.has(neighbor)) {
        const cycleStart = path.indexOf(neighbor);
        if (cycleStart >= 0) {
          cycles.push(path.slice(cycleStart));
        }
      }
    }

    stack.delete(node);
    path.pop();
  };

  for (const node of nodes) {
    if (!visited.has(node)) dfs(node);
  }

  return cycles;
}
