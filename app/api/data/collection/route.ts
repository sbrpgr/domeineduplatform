import { NextResponse } from 'next/server';
import { difficultyDistribution, loadCollectedTerms, loadCollectionSummary } from '@/lib/collected-data';

export async function GET() {
  const summary = loadCollectionSummary();

  const targets: Record<string, number> = {
    'it-dev': 2000,
    design: 1400,
    'ai-data': 1600,
    marketing: 1000,
    startup: 1000,
    fintech: 1000,
    'bio-health': 900,
    legal: 900,
    'game-xr': 800,
    ecommerce: 800,
    'energy-esg': 800,
    creator: 800
  };

  const progress = Object.fromEntries(
    Object.entries(targets).map(([slug, target]) => {
      const terms = loadCollectedTerms(slug);
      return [
        slug.replace(/-/g, '_'),
        {
          collected: terms.length,
          target,
          completion_rate: Number(((terms.length / target) * 100).toFixed(2)),
          difficulty: difficultyDistribution(terms)
        }
      ];
    })
  );

  return NextResponse.json({
    generated_at: '2026-02-20',
    summary,
    progress
  });
}
