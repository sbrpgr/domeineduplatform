'use client';

import { useMemo, useState } from 'react';
import type { QuizQuestion } from '@/lib/types';
import { estimateStandardError, mapThetaToLevel, selectNextQuestion, shouldStopQuiz, updateThetaMLE } from '@/lib/learning/irt';

type AdaptiveQuestion = QuizQuestion & { beta: number };

type AnswerLog = {
  questionId: string;
  correct: boolean;
  beta: number;
};

const getQuestionBeta = (item: QuizQuestion, index: number): number => {
  if (item.type === 'ox') return -0.4 + index * 0.05;
  if (item.type === 'matching') return 0.4 + index * 0.08;
  return 0 + index * 0.06;
};

const isCorrectAnswer = (question: QuizQuestion, selected: number | boolean | string): boolean => {
  if (typeof question.answer === 'boolean' && typeof selected === 'boolean') return question.answer === selected;
  if (typeof question.answer === 'number' && typeof selected === 'number') return question.answer === selected;
  return String(question.answer) === String(selected);
};

export function AdaptiveQuiz({ questions, domain, userId = 'demo-user' }: { questions: QuizQuestion[]; domain: string; userId?: string }) {
  const pool = useMemo<AdaptiveQuestion[]>(
    () => questions.map((item, idx) => ({ ...item, beta: getQuestionBeta(item, idx) })),
    [questions]
  );
  const [remaining, setRemaining] = useState<AdaptiveQuestion[]>(pool);
  const [theta, setTheta] = useState(0);
  const [logs, setLogs] = useState<AnswerLog[]>([]);
  const [lastFeedback, setLastFeedback] = useState<'correct' | 'incorrect' | null>(null);
  const [lastXp, setLastXp] = useState(0);

  const current = useMemo(
    () => selectNextQuestion(theta, remaining.map((item) => ({ id: item.id, beta: item.beta }))),
    [theta, remaining]
  );
  const currentQuestion = remaining.find((item) => item.id === current?.id) ?? null;
  const standardError = estimateStandardError(theta, logs.map((item) => item.beta));
  const done = shouldStopQuiz({ theta, standardError, answered: logs.length }) || !currentQuestion;
  const level = mapThetaToLevel(theta);
  const accuracy = logs.length === 0 ? 0 : Math.round((logs.filter((item) => item.correct).length / logs.length) * 100);

  const emitQuizEvent = async (termId: string, correct: boolean) => {
    try {
      const res = await fetch('/api/learning/event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          term_id: termId,
          event_type: 'quiz_answer',
          metadata: {
            domain,
            quiz_correct: correct,
            quality: correct ? 5 : 2
          },
          timestamp: new Date().toISOString()
        })
      });
      if (!res.ok) return;
      const data = await res.json();
      setLastXp(Number(data.xp_gained ?? 0) + Number(data.bonus_xp ?? 0));
    } catch {
      setLastXp(correct ? 20 : 5);
    }
  };

  const submit = async (selected: number | boolean | string) => {
    if (!currentQuestion) return;

    const correct = isCorrectAnswer(currentQuestion, selected);
    const nextTheta = updateThetaMLE(theta, currentQuestion.beta, correct);

    setLogs((prev) => [...prev, { questionId: currentQuestion.id, correct, beta: currentQuestion.beta }]);
    setTheta(nextTheta);
    setLastFeedback(correct ? 'correct' : 'incorrect');
    setRemaining((prev) => prev.filter((item) => item.id !== currentQuestion.id));
    await emitQuizEvent(currentQuestion.id, correct);
  };

  if (questions.length === 0) {
    return (
      <article className="rounded-xl border border-dashed border-slate-300 bg-white p-4 text-sm text-slate-600">
        No diagnostic questions are available for this domain yet.
      </article>
    );
  }

  if (done) {
    return (
      <section className="grid gap-4">
        <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">Quiz complete</p>
          <h2 className="mt-2 text-2xl font-bold text-primary">Estimated level: {level}</h2>
          <p className="mt-2 text-sm text-slate-700">
            Accuracy {accuracy}% / Answered {logs.length} / Standard error {standardError.toFixed(2)}
          </p>
        </article>
      </section>
    );
  }

  return (
    <section className="grid gap-4">
      <article className="rounded-2xl border border-slate-200 bg-white p-4">
        <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
          <p className="text-slate-600">
            Answered {logs.length} 쨌 Accuracy {accuracy}% 쨌 Estimated level {level}
          </p>
          <p className="rounded-full bg-slate-100 px-3 py-1 text-xs">theta {theta.toFixed(2)}</p>
        </div>
        <div className="mt-3 h-2 rounded-full bg-slate-100">
          <div className="h-2 rounded-full bg-primary transition-all" style={{ width: `${Math.min(100, logs.length * 10)}%` }} />
        </div>
      </article>

      {currentQuestion ? (
        <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Adaptive Question</p>
          <h3 className="mt-2 text-lg font-semibold">{currentQuestion.question}</h3>

          <div className="mt-5 grid gap-2">
            {currentQuestion.type === 'ox' ? (
              <>
                <button type="button" onClick={() => submit(true)} className="rounded-lg border border-slate-300 px-4 py-2 text-left text-sm">
                  O (True)
                </button>
                <button type="button" onClick={() => submit(false)} className="rounded-lg border border-slate-300 px-4 py-2 text-left text-sm">
                  X (False)
                </button>
              </>
            ) : (
              (currentQuestion.options ?? []).map((option, idx) => (
                <button
                  key={`${currentQuestion.id}-${idx}`}
                  type="button"
                  onClick={() => submit(typeof currentQuestion.answer === 'string' ? option : idx)}
                  className="rounded-lg border border-slate-300 px-4 py-2 text-left text-sm hover:border-primary"
                >
                  {option}
                </button>
              ))
            )}
          </div>

          {lastFeedback ? (
            <p className={`mt-4 text-sm ${lastFeedback === 'correct' ? 'text-emerald-700' : 'text-red-700'}`}>
              {lastFeedback === 'correct'
                ? `Correct. Next question is adjusted to your current estimate. (+${lastXp} XP)`
                : `Incorrect. Difficulty is recalibrated for the next question. (+${lastXp} XP)`}
            </p>
          ) : null}
        </article>
      ) : null}
    </section>
  );
}
