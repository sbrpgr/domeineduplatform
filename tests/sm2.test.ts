import { describe, expect, it } from 'vitest';
import { calculateNextReview, qualityFromQuiz } from '@/lib/learning/sm2';

describe('SM-2 calculateNextReview', () => {
  it('1. quality 범위를 벗어나면 에러', () => {
    expect(() => calculateNextReview({ repetitions: 0, interval: 1, easinessFactor: 2.5 }, -1)).toThrow();
  });

  it('2. quality는 정수여야 한다', () => {
    expect(() => calculateNextReview({ repetitions: 0, interval: 1, easinessFactor: 2.5 }, 2.2)).toThrow();
  });

  it('3. quality < 3이면 반복 초기화', () => {
    const out = calculateNextReview({ repetitions: 5, interval: 12, easinessFactor: 2.2 }, 2);
    expect(out.repetitions).toBe(0);
    expect(out.interval).toBe(1);
  });

  it('4. 첫 성공은 interval=1', () => {
    const out = calculateNextReview({ repetitions: 0, interval: 7, easinessFactor: 2.5 }, 4);
    expect(out.repetitions).toBe(1);
    expect(out.interval).toBe(1);
  });

  it('5. 두번째 성공은 interval=6', () => {
    const out = calculateNextReview({ repetitions: 1, interval: 1, easinessFactor: 2.5 }, 4);
    expect(out.repetitions).toBe(2);
    expect(out.interval).toBe(6);
  });

  it('6. 세번째부터 EF 곱 적용', () => {
    const out = calculateNextReview({ repetitions: 2, interval: 6, easinessFactor: 2.5 }, 5);
    expect(out.interval).toBe(15);
  });

  it('7. easiness 하한은 1.3', () => {
    const out = calculateNextReview({ repetitions: 1, interval: 1, easinessFactor: 1.3 }, 0);
    expect(out.easinessFactor).toBe(1.3);
  });

  it('8. high quality는 EF 증가', () => {
    const out = calculateNextReview({ repetitions: 2, interval: 6, easinessFactor: 2.5 }, 5);
    expect(out.easinessFactor).toBeGreaterThan(2.5);
  });

  it('9. mid quality는 EF 감소', () => {
    const out = calculateNextReview({ repetitions: 2, interval: 6, easinessFactor: 2.5 }, 3);
    expect(out.easinessFactor).toBeLessThan(2.5);
  });

  it('10. nextReviewAt이 생성된다', () => {
    const out = calculateNextReview({ repetitions: 2, interval: 6, easinessFactor: 2.5 }, 4);
    expect(typeof out.nextReviewAt).toBe('string');
  });

  it('11. 복습일은 미래다', () => {
    const now = new Date('2026-02-20T00:00:00.000Z');
    const out = calculateNextReview({ repetitions: 0, interval: 1, easinessFactor: 2.5 }, 4, now);
    expect(new Date(out.nextReviewAt ?? '').getTime()).toBeGreaterThan(now.getTime());
  });

  it('12. interval은 최소 1', () => {
    const out = calculateNextReview({ repetitions: 3, interval: 0, easinessFactor: 0.1 }, 5);
    expect(out.interval).toBeGreaterThanOrEqual(1);
  });

  it('13. quality=0 오답 처리', () => {
    const out = calculateNextReview({ repetitions: 4, interval: 20, easinessFactor: 2.1 }, 0);
    expect(out.repetitions).toBe(0);
  });

  it('14. quality=1 오답 처리', () => {
    const out = calculateNextReview({ repetitions: 4, interval: 20, easinessFactor: 2.1 }, 1);
    expect(out.interval).toBe(1);
  });

  it('15. quality=2 오답 처리', () => {
    const out = calculateNextReview({ repetitions: 4, interval: 20, easinessFactor: 2.1 }, 2);
    expect(out.interval).toBe(1);
  });

  it('16. quality=3 정답 처리', () => {
    const out = calculateNextReview({ repetitions: 0, interval: 1, easinessFactor: 2.5 }, 3);
    expect(out.repetitions).toBe(1);
  });

  it('17. quality=4 정답 처리', () => {
    const out = calculateNextReview({ repetitions: 0, interval: 1, easinessFactor: 2.5 }, 4);
    expect(out.repetitions).toBe(1);
  });

  it('18. quality=5 정답 처리', () => {
    const out = calculateNextReview({ repetitions: 0, interval: 1, easinessFactor: 2.5 }, 5);
    expect(out.repetitions).toBe(1);
  });

  it('19. qualityFromQuiz 정답 high -> 5', () => {
    expect(qualityFromQuiz(true, 'high')).toBe(5);
  });

  it('20. qualityFromQuiz 정답 mid -> 4', () => {
    expect(qualityFromQuiz(true, 'mid')).toBe(4);
  });

  it('21. qualityFromQuiz 정답 low -> 3', () => {
    expect(qualityFromQuiz(true, 'low')).toBe(3);
  });

  it('22. qualityFromQuiz 오답 high -> 2', () => {
    expect(qualityFromQuiz(false, 'high')).toBe(2);
  });

  it('23. qualityFromQuiz 오답 low -> 1', () => {
    expect(qualityFromQuiz(false, 'low')).toBe(1);
  });
});
