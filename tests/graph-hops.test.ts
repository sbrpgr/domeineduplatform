import { describe, expect, it } from 'vitest';
import { buildHopSubgraph, filterEdgesByKeyword, filterEdgesByRelation } from '@/lib/graph/hops';

const edges = [
  { from: 'a', to: 'b', relation: 'child' as const },
  { from: 'b', to: 'c', relation: 'sibling' as const },
  { from: 'c', to: 'd', relation: 'parent' as const },
  { from: 'd', to: 'e', relation: 'opposite' as const }
];

describe('graph hops utils', () => {
  it('buildHopSubgraph returns within hop range', () => {
    const out = buildHopSubgraph('a', edges, 2);
    const keys = out.map((e) => `${e.from}-${e.to}`);
    expect(keys).toContain('a-b');
    expect(keys).toContain('b-c');
    expect(keys).not.toContain('d-e');
  });

  it('filter relation works', () => {
    const out = filterEdgesByRelation(edges, ['opposite']);
    expect(out.length).toBe(1);
    expect(out[0].relation).toBe('opposite');
  });

  it('keyword filter works', () => {
    const out = filterEdgesByKeyword(edges, 'd');
    expect(out.length).toBeGreaterThan(0);
  });
});
