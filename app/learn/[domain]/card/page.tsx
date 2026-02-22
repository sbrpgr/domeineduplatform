import { notFound } from 'next/navigation';
import { AppShell } from '@/components/layout/app-shell';
import { getDomainBySlug } from '@/lib/data';
import { listLearningTerms } from '@/lib/repositories/learning-term-repository';
import { FlashcardTrainer } from '@/components/learn/flashcard-trainer';

export default async function LearnCardPage({ params }: { params: { domain: string } }) {
  const domain = getDomainBySlug(params.domain);
  if (!domain) notFound();

  const terms = await listLearningTerms(params.domain, 40);

  return (
    <AppShell title={`${domain.nameKo} Flashcard Lab`} subtitle="Word -> Definition -> Usage example flow with self-rating.">
      {terms.length === 0 ? (
        <article className="rounded-xl border border-dashed border-slate-300 bg-white p-4 text-sm text-slate-600">
          No learnable terms found for this domain yet.
        </article>
      ) : (
        <FlashcardTrainer cards={terms} domain={params.domain} />
      )}
    </AppShell>
  );
}
