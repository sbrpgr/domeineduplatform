export type IrtQuestion = {
  id: string;
  beta: number;
};

export type IrtState = {
  theta: number;
  standardError: number;
  answered: number;
};

const logistic = (x: number): number => 1 / (1 + Math.exp(-x));

export function probabilityCorrect(theta: number, beta: number): number {
  return logistic(theta - beta);
}

export function updateThetaMLE(theta: number, beta: number, isCorrect: boolean, lr = 0.15): number {
  const p = probabilityCorrect(theta, beta);
  const y = isCorrect ? 1 : 0;
  const gradient = y - p;
  return theta + lr * gradient;
}

export function estimateStandardError(theta: number, betas: number[]): number {
  if (betas.length === 0) return 1;
  const info = betas.reduce((sum, beta) => {
    const p = probabilityCorrect(theta, beta);
    return sum + p * (1 - p);
  }, 0);
  return info <= 0 ? 1 : 1 / Math.sqrt(info);
}

export function selectNextQuestion(theta: number, questions: IrtQuestion[]): IrtQuestion | null {
  if (questions.length === 0) return null;

  const target = 0.7;
  let best = questions[0];
  let bestGap = Number.MAX_VALUE;

  for (const question of questions) {
    const p = probabilityCorrect(theta, question.beta);
    const gap = Math.abs(p - target);
    if (gap < bestGap) {
      bestGap = gap;
      best = question;
    }
  }

  return best;
}

export function mapThetaToLevel(theta: number): 'novice' | 'beginner' | 'intermediate' | 'advanced' {
  if (theta < -0.8) return 'novice';
  if (theta < 0.2) return 'beginner';
  if (theta < 1.2) return 'intermediate';
  return 'advanced';
}

export function shouldStopQuiz(state: IrtState): boolean {
  return state.answered >= 20 || state.standardError < 0.3;
}
