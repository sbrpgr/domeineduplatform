import type { Term } from '@/lib/types';
import { Pill } from '@/components/ui/pill';

const levelLabels: Record<Term['difficulty'], string> = {
  novice: '입문',
  beginner: '기초',
  intermediate: '중급',
  advanced: '고급'
};

export function TermCard({ term }: { term: Term }) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <header className="flex flex-wrap items-center gap-2">
        <h1 className="text-2xl font-bold text-primary">{term.termKo}</h1>
        <span className="text-slate-500">{term.termEn}</span>
        <Pill text={levelLabels[term.difficulty]} tone="primary" />
        <Pill text={term.level2Category} />
      </header>

      <p className="mt-4 text-lg font-medium">{term.oneLineDefinition}</p>
      <p className="mt-1 text-xs text-slate-500">발음: {term.pronunciation}</p>

      <section className="mt-6 grid gap-4">
        <h2 className="text-sm font-semibold text-slate-500">레벨별 설명</h2>
        <div className="grid gap-3 text-sm">
          <p><strong>입문</strong> {term.definitions.novice}</p>
          <p><strong>기초</strong> {term.definitions.beginner}</p>
          <p><strong>중급</strong> {term.definitions.intermediate}</p>
          <p><strong>고급</strong> {term.definitions.advanced}</p>
        </div>
      </section>

      <section className="mt-6 grid gap-2 text-sm">
        <h3 className="font-semibold text-slate-500">사용 예시</h3>
        {term.usageExamples.map((item, idx) => (
          <p key={`${term.id}-${idx}`}>[{item.context}] {item.example}</p>
        ))}
      </section>

      <section className="mt-6 rounded-xl bg-slate-50 p-4 text-sm">
        <p className="font-semibold">AI 프롬프트 예시</p>
        <p className="mt-1 text-slate-700">{term.aiPromptExample}</p>
      </section>
    </article>
  );
}
