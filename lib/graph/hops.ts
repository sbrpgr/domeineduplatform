import type { RelationshipEdge } from '@/lib/types';

export type RelationType = RelationshipEdge['relation'];

export function buildHopSubgraph(center: string, edges: RelationshipEdge[], maxHops = 3): RelationshipEdge[] {
  const visited = new Set<string>([center]);
  let frontier = new Set<string>([center]);

  for (let hop = 0; hop < maxHops; hop += 1) {
    const next = new Set<string>();
    for (const edge of edges) {
      if (frontier.has(edge.from) && !visited.has(edge.to)) {
        next.add(edge.to);
      }
      if (frontier.has(edge.to) && !visited.has(edge.from)) {
        next.add(edge.from);
      }
    }

    if (next.size === 0) break;
    for (const node of next) visited.add(node);
    frontier = next;
  }

  return edges.filter((edge) => visited.has(edge.from) && visited.has(edge.to));
}

export function filterEdgesByRelation(edges: RelationshipEdge[], relations: RelationType[]): RelationshipEdge[] {
  if (relations.length === 0) return edges;
  const relationSet = new Set(relations);
  return edges.filter((edge) => relationSet.has(edge.relation));
}

export function filterEdgesByKeyword(edges: RelationshipEdge[], keyword: string): RelationshipEdge[] {
  const q = keyword.trim().toLowerCase();
  if (!q) return edges;
  return edges.filter((edge) => edge.from.toLowerCase().includes(q) || edge.to.toLowerCase().includes(q));
}
