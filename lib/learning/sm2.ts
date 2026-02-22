import type { Sm2Record } from '@/lib/types';

export function calculateNextReview(record: Sm2Record, quality: number, now = new Date()): Sm2Record {
  if (!Number.isInteger(quality) || quality < 0 || quality > 5) {
    throw new Error('quality must be an integer between 0 and 5');
  }

  const updated: Sm2Record = { ...record };

  if (quality < 3) {
    updated.repetitions = 0;
    updated.interval = 1;
  } else {
    if (updated.repetitions === 0) {
      updated.interval = 1;
    } else if (updated.repetitions === 1) {
      updated.interval = 6;
    } else {
      updated.interval = Math.max(1, Math.round(updated.interval * updated.easinessFactor));
    }
    updated.repetitions += 1;
  }

  updated.easinessFactor = Math.max(
    1.3,
    Number((updated.easinessFactor + 0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)).toFixed(4))
  );

  const nextReviewAt = new Date(now);
  nextReviewAt.setDate(nextReviewAt.getDate() + updated.interval);
  updated.nextReviewAt = nextReviewAt.toISOString();

  return updated;
}

export function qualityFromQuiz(isCorrect: boolean, confidence: 'low' | 'mid' | 'high'): number {
  if (!isCorrect) {
    return confidence === 'high' ? 2 : 1;
  }
  if (confidence === 'low') return 3;
  if (confidence === 'mid') return 4;
  return 5;
}
