import type { Difficulty, QuizQuestion } from '@/lib/types';

export function assignLevelByCorrectCount(correct: number): Difficulty {
  if (correct <= 3) return 'novice';
  if (correct <= 7) return 'beginner';
  if (correct <= 11) return 'intermediate';
  return 'advanced';
}

export function calculateDiagnosticScore(
  answers: { questionId: string; correct: boolean; confidence: 'heard' | 'explain' | 'used' }[],
  questions: QuizQuestion[]
): { correctCount: number; confidenceScore: number; level: Difficulty } {
  const questionIds = new Set(questions.map((q) => q.id));
  const valid = answers.filter((a) => questionIds.has(a.questionId));

  const correctCount = valid.filter((a) => a.correct).length;
  const confidenceScore = valid.reduce((sum, a) => {
    if (a.confidence === 'used') return sum + 2;
    if (a.confidence === 'explain') return sum + 1;
    return sum;
  }, 0);

  return {
    correctCount,
    confidenceScore,
    level: assignLevelByCorrectCount(correctCount)
  };
}
