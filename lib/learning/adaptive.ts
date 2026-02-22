import type { Difficulty } from '@/lib/types';

export type TermSessionMetric = {
  termId: string;
  dwellTimeSeconds: number;
  flipCount: number;
  aiExplainCount: number;
  quizResult: 'correct' | 'incorrect' | 'skipped';
  difficulty: Difficulty;
};

export function calculateSessionPerformance(metrics: TermSessionMetric[]): number {
  if (metrics.length === 0) return 0;

  const scoreSum = metrics.reduce((sum, item) => {
    const quiz = item.quizResult === 'correct' ? 60 : item.quizResult === 'incorrect' ? 20 : 30;
    const dwell = Math.min(20, item.dwellTimeSeconds / 3);
    const interaction = Math.min(20, item.flipCount * 3 + item.aiExplainCount * 2);
    return sum + quiz + dwell + interaction;
  }, 0);

  return Math.min(100, Number((scoreSum / metrics.length).toFixed(2)));
}

export function adjustQueueByPerformance(score: number): {
  harderTerms: number;
  reviewTerms: number;
  dailyTargetDelta: number;
} {
  if (score > 80) {
    return { harderTerms: 2, reviewTerms: 0, dailyTargetDelta: 2 };
  }
  if (score < 50) {
    return { harderTerms: 0, reviewTerms: 2, dailyTargetDelta: -2 };
  }
  return { harderTerms: 1, reviewTerms: 1, dailyTargetDelta: 0 };
}
