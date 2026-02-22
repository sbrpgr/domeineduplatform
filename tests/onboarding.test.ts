import { describe, expect, it } from 'vitest';
import { assignLevelByCorrectCount, calculateDiagnosticScore } from '@/lib/learning/onboarding';

describe('onboarding diagnostic scoring', () => {
  it('assigns novice', () => {
    expect(assignLevelByCorrectCount(2)).toBe('novice');
  });

  it('assigns beginner', () => {
    expect(assignLevelByCorrectCount(6)).toBe('beginner');
  });

  it('assigns intermediate', () => {
    expect(assignLevelByCorrectCount(9)).toBe('intermediate');
  });

  it('assigns advanced', () => {
    expect(assignLevelByCorrectCount(13)).toBe('advanced');
  });

  it('calculates score and confidence', () => {
    const out = calculateDiagnosticScore(
      [
        { questionId: 'q1', correct: true, confidence: 'heard' },
        { questionId: 'q2', correct: false, confidence: 'explain' },
        { questionId: 'q3', correct: true, confidence: 'used' }
      ],
      [
        { id: 'q1', type: 'ox', question: 'a', answer: true, explanation: 'x' },
        { id: 'q2', type: 'ox', question: 'b', answer: true, explanation: 'x' },
        { id: 'q3', type: 'ox', question: 'c', answer: true, explanation: 'x' }
      ]
    );

    expect(out.correctCount).toBe(2);
    expect(out.confidenceScore).toBe(3);
    expect(out.level).toBe('novice');
  });
});
