import { describe, expect, it } from 'vitest';
import {
  estimateStandardError,
  mapThetaToLevel,
  probabilityCorrect,
  selectNextQuestion,
  shouldStopQuiz,
  updateThetaMLE
} from '@/lib/learning/irt';

describe('IRT utilities', () => {
  it('probability theta=beta -> 0.5', () => {
    expect(probabilityCorrect(0, 0)).toBeCloseTo(0.5, 5);
  });

  it('theta 상승 시 정답확률 증가', () => {
    expect(probabilityCorrect(1, 0)).toBeGreaterThan(probabilityCorrect(0, 0));
  });

  it('정답이면 theta 상승', () => {
    expect(updateThetaMLE(0, 0, true)).toBeGreaterThan(0);
  });

  it('오답이면 theta 하락', () => {
    expect(updateThetaMLE(0, 0, false)).toBeLessThan(0);
  });

  it('target 0.7 근접 문항 선택', () => {
    const next = selectNextQuestion(0, [
      { id: 'a', beta: -2 },
      { id: 'b', beta: 0.5 },
      { id: 'c', beta: 2 }
    ]);
    expect(next?.id).toBe('a');
  });

  it('빈 문항은 null', () => {
    expect(selectNextQuestion(0, [])).toBeNull();
  });

  it('SE 계산 가능', () => {
    expect(estimateStandardError(0, [-1, 0, 1])).toBeGreaterThan(0);
  });

  it('SE가 0.3 미만이면 종료', () => {
    expect(shouldStopQuiz({ theta: 1, standardError: 0.2, answered: 8 })).toBe(true);
  });

  it('20문항 답변이면 종료', () => {
    expect(shouldStopQuiz({ theta: 0, standardError: 0.5, answered: 20 })).toBe(true);
  });

  it('종료 조건 미충족', () => {
    expect(shouldStopQuiz({ theta: 0, standardError: 0.5, answered: 10 })).toBe(false);
  });

  it('level mapping novice', () => {
    expect(mapThetaToLevel(-2)).toBe('novice');
  });

  it('level mapping beginner', () => {
    expect(mapThetaToLevel(-0.2)).toBe('beginner');
  });

  it('level mapping intermediate', () => {
    expect(mapThetaToLevel(0.9)).toBe('intermediate');
  });

  it('level mapping advanced', () => {
    expect(mapThetaToLevel(2)).toBe('advanced');
  });
});
