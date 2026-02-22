'use client';

import { useMemo, useState } from 'react';

type UsageExample = {
  context: string;
  example: string;
};

export type LearningCard = {
  id: string;
  termKo: string;
  termEn: string;
  oneLineDefinition: string;
  definitions: {
    novice: string;
    beginner: string;
    intermediate: string;
    advanced: string;
  };
  usageExamples: UsageExample[];
  difficulty: 'novice' | 'beginner' | 'intermediate' | 'advanced';
};

type LearningEventResponse = {
  total_xp?: number;
  streak?: number;
  level_up?: boolean;
  new_level?: string;
  badges_unlocked?: string[];
};

const difficultyLabel: Record<LearningCard['difficulty'], string> = {
  novice: 'Novice',
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  advanced: 'Advanced'
};

export function FlashcardTrainer({ cards, domain, userId = 'demo-user' }: { cards: LearningCard[]; domain: string; userId?: string }) {
  const [index, setIndex] = useState(0);
  const [stage, setStage] = useState<'term' | 'definition' | 'example'>('term');
  const [score, setScore] = useState<{ easy: number; normal: number; hard: number }>({ easy: 0, normal: 0, hard: 0 });
  const [definitionLevel, setDefinitionLevel] = useState<keyof LearningCard['definitions']>('beginner');
  const [xp, setXp] = useState(0);
  const [streak, setStreak] = useState(0);
  const [xpToast, setXpToast] = useState<number | null>(null);
  const [badges, setBadges] = useState<string[]>([]);
  const [levelUpText, setLevelUpText] = useState<string | null>(null);
  const [aiOpen, setAiOpen] = useState(false);
  const [aiContext, setAiContext] = useState('실무 프로젝트');
  const [aiText, setAiText] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  const card = cards[index];
  const percent = useMemo(() => Math.round(((index + 1) / cards.length) * 100), [index, cards.length]);

  const applyProgress = (payload: LearningEventResponse, fallbackGain: number) => {
    if (typeof payload.total_xp === 'number') setXp(payload.total_xp);
    if (typeof payload.streak === 'number') setStreak(payload.streak);
    if (payload.level_up && payload.new_level) {
      setLevelUpText(payload.new_level.toUpperCase());
      setTimeout(() => setLevelUpText(null), 1400);
    }
    const unlocked = payload.badges_unlocked ?? [];
    if (unlocked.length > 0) {
      setBadges((prev) => Array.from(new Set([...prev, ...unlocked])));
    }
    setXpToast(fallbackGain);
    setTimeout(() => setXpToast(null), 900);
  };

  const emitEvent = async (
    eventType: 'card_view' | 'definition_expand' | 'ai_explain' | 'bookmark' | 'graph_explore' | 'quiz_answer',
    termId: string,
    metadata: Record<string, unknown>
  ) => {
    try {
      const res = await fetch('/api/learning/event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          term_id: termId,
          event_type: eventType,
          metadata: { domain, ...metadata },
          timestamp: new Date().toISOString()
        })
      });
      if (!res.ok) return null;
      return (await res.json()) as LearningEventResponse;
    } catch {
      return null;
    }
  };

  const advance = async () => {
    if (!card) return;

    if (stage === 'term') {
      setStage('definition');
      await emitEvent('definition_expand', card.id, { level_viewed: definitionLevel });
      return;
    }
    if (stage === 'definition') {
      setStage('example');
      return;
    }
    setIndex((prev) => Math.min(cards.length - 1, prev + 1));
    setStage('term');
    setDefinitionLevel('beginner');
  };

  const rate = async (rating: 'easy' | 'normal' | 'hard') => {
    if (!card) return;

    const gain = rating === 'easy' ? 20 : rating === 'normal' ? 12 : 8;
    setScore((prev) => ({ ...prev, [rating]: prev[rating] + 1 }));

    const result = await emitEvent('card_view', card.id, {
      rating,
      level_viewed: definitionLevel,
      flip_count: stage === 'example' ? 2 : 1
    });

    applyProgress(result ?? {}, gain);
    setIndex((prev) => Math.min(cards.length - 1, prev + 1));
    setStage('term');
    setDefinitionLevel('beginner');
  };

  const requestAiExplain = async () => {
    if (!card) return;
    setAiLoading(true);
    try {
      const res = await fetch('/api/ai/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          term_id: card.id,
          user_level: card.difficulty,
          user_context: aiContext
        })
      });
      if (!res.ok) {
        setAiText('AI 설명을 불러오지 못했습니다.');
      } else {
        const data = await res.json();
        setAiText(String(data.explanation ?? '설명을 생성하지 못했습니다.'));
        const result = await emitEvent('ai_explain', card.id, { level_viewed: definitionLevel });
        applyProgress(result ?? {}, 5);
      }
    } finally {
      setAiLoading(false);
    }
  };

  const goNext = () => {
    setIndex((prev) => Math.min(cards.length - 1, prev + 1));
    setStage('term');
    setDefinitionLevel('beginner');
  };

  const goPrev = () => {
    setIndex((prev) => Math.max(0, prev - 1));
    setStage('term');
    setDefinitionLevel('beginner');
  };

  if (!card) return null;

  return (
    <section className="grid gap-4">
      {levelUpText ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/60">
          <div className="rounded-2xl bg-white px-10 py-8 text-center shadow-2xl">
            <p className="text-xs uppercase tracking-wide text-slate-500">Level Up</p>
            <p className="mt-2 text-3xl font-extrabold text-primary">{levelUpText}</p>
          </div>
        </div>
      ) : null}

      {aiOpen ? (
        <div className="fixed inset-0 z-40 grid place-items-center bg-slate-950/50 p-4">
          <div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-primary">AI 재설명</h3>
            <p className="mt-1 text-sm text-slate-600">{card.termKo}를 맥락에 맞춰 다시 설명합니다.</p>
            <input
              value={aiContext}
              onChange={(event) => setAiContext(event.target.value)}
              className="mt-4 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              placeholder="예: 프론트엔드 실무 협업"
            />
            <div className="mt-3 flex gap-2">
              <button
                type="button"
                onClick={requestAiExplain}
                disabled={aiLoading}
                className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
              >
                {aiLoading ? '생성 중...' : '설명 생성'}
              </button>
              <button type="button" onClick={() => setAiOpen(false)} className="rounded-lg border border-slate-300 px-4 py-2 text-sm">
                닫기
              </button>
            </div>
            {aiText ? <p className="mt-4 rounded-lg bg-slate-50 p-3 text-sm text-slate-700">{aiText}</p> : null}
          </div>
        </div>
      ) : null}

      <div className="rounded-2xl border border-slate-200 bg-white p-4">
        <div className="mb-3 flex items-center justify-between text-sm text-slate-600">
          <span>
            Progress {index + 1}/{cards.length} ({percent}%)
          </span>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs">{difficultyLabel[card.difficulty]}</span>
        </div>
        <div className="mb-3 flex flex-wrap items-center gap-2 text-xs">
          <span className="rounded-full bg-amber-100 px-3 py-1 font-semibold text-amber-700">XP {xp}</span>
          <span className="rounded-full bg-rose-100 px-3 py-1 font-semibold text-rose-700">Streak {streak}</span>
          {xpToast ? <span className="rounded-full bg-emerald-100 px-3 py-1 font-semibold text-emerald-700">+{xpToast} XP</span> : null}
        </div>
        {badges.length > 0 ? (
          <div className="mb-3 flex flex-wrap gap-2 text-xs">
            {badges.map((badge) => (
              <span key={badge} className="rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 font-semibold text-indigo-700">
                {badge}
              </span>
            ))}
          </div>
        ) : null}
        <div className="h-2 rounded-full bg-slate-100">
          <div className="h-2 rounded-full bg-primary transition-all" style={{ width: `${percent}%` }} />
        </div>
      </div>

      <article
        className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
        onTouchStart={(event) => setTouchStartX(event.changedTouches[0]?.clientX ?? null)}
        onTouchEnd={(event) => {
          const endX = event.changedTouches[0]?.clientX ?? null;
          if (touchStartX === null || endX === null) return;
          const delta = endX - touchStartX;
          if (delta < -60) goNext();
          if (delta > 60) goPrev();
          setTouchStartX(null);
        }}
      >
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Step 1. Term</p>
        <h2 className="mt-2 text-3xl font-bold text-primary">{card.termKo}</h2>
        <p className="mt-1 text-sm text-slate-500">{card.termEn}</p>

        {stage !== 'term' ? (
          <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Step 2. Definition</p>
            <div className="mt-2 grid grid-cols-4 gap-2 text-xs">
              {(['novice', 'beginner', 'intermediate', 'advanced'] as const).map((level) => (
                <button
                  key={`${card.id}-${level}`}
                  type="button"
                  onClick={() => setDefinitionLevel(level)}
                  className={`rounded-lg px-2 py-1 ${
                    definitionLevel === level ? 'bg-primary text-white' : 'border border-slate-200 bg-white text-slate-600'
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
            <p className="mt-3 text-sm text-slate-700">{card.definitions[definitionLevel] || card.oneLineDefinition}</p>
          </div>
        ) : null}

        {stage === 'example' ? (
          <div className="mt-4 rounded-xl border border-slate-200 bg-[#fff8ef] p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Step 3. Usage Example</p>
            <p className="mt-2 text-sm text-slate-700">
              [{card.usageExamples[0]?.context ?? 'Practical'}] {card.usageExamples[0]?.example ?? `Explain ${card.termKo} with one practical sentence.`}
            </p>
          </div>
        ) : null}

        <div className="mt-6 flex flex-wrap gap-2">
          {stage !== 'example' ? (
            <button type="button" onClick={advance} className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white">
              {stage === 'term' ? 'Show definition' : 'Show usage example'}
            </button>
          ) : (
            <>
              <button type="button" onClick={() => rate('hard')} className="rounded-lg border border-red-300 px-4 py-2 text-sm text-red-700">
                Hard
              </button>
              <button type="button" onClick={() => rate('normal')} className="rounded-lg border border-amber-300 px-4 py-2 text-sm text-amber-700">
                Normal
              </button>
              <button type="button" onClick={() => rate('easy')} className="rounded-lg border border-emerald-300 px-4 py-2 text-sm text-emerald-700">
                Easy
              </button>
            </>
          )}
          <button type="button" onClick={goPrev} className="rounded-lg border border-slate-300 px-4 py-2 text-sm">
            Prev
          </button>
          <button type="button" onClick={goNext} className="rounded-lg border border-slate-300 px-4 py-2 text-sm">
            Next
          </button>
          <button type="button" onClick={() => setAiOpen(true)} className="rounded-lg border border-indigo-300 px-4 py-2 text-sm text-indigo-700">
            AI 재설명
          </button>
        </div>
      </article>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-700">
        Self-rating stats: Easy {score.easy} / Normal {score.normal} / Hard {score.hard}
      </div>
    </section>
  );
}
