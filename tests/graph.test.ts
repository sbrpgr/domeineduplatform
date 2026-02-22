import { describe, expect, it } from 'vitest';
import { detectCircularRelationships } from '@/lib/graph/cycle-detection';

describe('graph circular detection', () => {
  it('사이클이 없는 경우 빈 배열', () => {
    const cycles = detectCircularRelationships([
      { from: 'a', to: 'b', relation: 'child' },
      { from: 'b', to: 'c', relation: 'child' }
    ]);
    expect(cycles.length).toBe(0);
  });

  it('사이클이 있으면 탐지', () => {
    const cycles = detectCircularRelationships([
      { from: 'a', to: 'b', relation: 'child' },
      { from: 'b', to: 'c', relation: 'child' },
      { from: 'c', to: 'a', relation: 'child' }
    ]);
    expect(cycles.length).toBeGreaterThan(0);
  });
});
