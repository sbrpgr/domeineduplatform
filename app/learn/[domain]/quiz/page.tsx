import { notFound } from 'next/navigation';
import { AppShell } from '@/components/layout/app-shell';
import { getDomainBySlug } from '@/lib/data';
import { listDiagnosticQuiz } from '@/lib/repositories/quiz-repository';
import { AdaptiveQuiz } from '@/components/learn/adaptive-quiz';

export default async function LearnQuizPage({ params }: { params: { domain: string } }) {
  const domain = getDomainBySlug(params.domain);
  if (!domain) notFound();

  const quiz = await listDiagnosticQuiz(params.domain);

  return (
    <AppShell
      title={`${domain.nameKo} Adaptive Quiz`}
      subtitle="One question at a time. Difficulty is adjusted by your response history."
    >
      <AdaptiveQuiz questions={quiz} domain={params.domain} />
    </AppShell>
  );
}
