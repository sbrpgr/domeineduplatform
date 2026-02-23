import Link from 'next/link';
import { AppShell } from '@/components/layout/app-shell';
import { loadAllGeneratedTerms } from '@/lib/generated-data';

export default function GlossaryDetailPage({ params }: { params: { id: string } }) {
  const items = loadAllGeneratedTerms().slice(0, 60);

  return (
    <AppShell title={`사전: ${params.id}`} subtitle="용어 / 뜻 / 활용예시">
      <div className="flex flex-wrap gap-3">
        <Link href={`/glossary/${params.id}/builder`} className="rounded-lg bg-primary px-4 py-2 text-white">빌더 열기</Link>
        <Link href={`/glossary/${params.id}/share`} className="rounded-lg border border-slate-300 px-4 py-2">공유 설정</Link>
      </div>

      <section className="mt-6 grid gap-3">
        {items.map((term) => {
          const categorySlug = 'general';
          const usage = term.usageExamples[0]?.example ?? `${term.termKo}를 실무에서 어떻게 쓰는지 예시를 만들어줘.`;

          return (
            <article key={term.id} className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-lg font-semibold text-primary">
                  {term.termKo} <span className="text-slate-500">({term.termEn})</span>
                </h2>
                <Link
                  href={`/term/${term.domainSlug}/${categorySlug}/${term.slug}`}
                  className="text-sm font-medium text-primary underline-offset-2 hover:underline"
                >
                  상세 보기
                </Link>
              </div>
              <p className="mt-2 text-sm text-slate-800"><strong>뜻:</strong> {term.oneLineDefinition}</p>
              <p className="mt-1 text-sm text-slate-700"><strong>활용예시:</strong> {usage}</p>
            </article>
          );
        })}
      </section>
    </AppShell>
  );
}
