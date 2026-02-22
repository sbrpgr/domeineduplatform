import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { AppShell } from '@/components/layout/app-shell';
import { findDomainBySlug } from '@/lib/repositories/domain-repository';
import { findTermByIdOrSlug } from '@/lib/repositories/term-repository';
import { buildDefinedTermJsonLd, buildTermMetadata } from '@/lib/seo';

type TermPageParams = {
  domain: string;
  category: string;
  termSlug: string;
};

export async function generateMetadata({ params }: { params: TermPageParams }): Promise<Metadata> {
  const term = await findTermByIdOrSlug(params.termSlug);
  if (!term) {
    return { title: 'Term Not Found | 도메인 용어 백과사전' };
  }

  return buildTermMetadata({
    termKo: term.termKo,
    termEn: term.termEn,
    oneLineDefinition: term.oneLineDefinition,
    path: `/term/${params.domain}/${params.category}/${params.termSlug}`
  });
}

export default async function SeoTermPage({ params }: { params: TermPageParams }) {
  const [domain, term] = await Promise.all([findDomainBySlug(params.domain), findTermByIdOrSlug(params.termSlug)]);

  if (!domain || !term || term.domain !== params.domain) notFound();

  const jsonLd = buildDefinedTermJsonLd({
    termKo: term.termKo,
    termEn: term.termEn,
    oneLineDefinition: term.oneLineDefinition,
    path: `/term/${params.domain}/${params.category}/${params.termSlug}`
  });

  return (
    <AppShell title={`${term.termKo} 뜻`} subtitle={`${domain.nameKo} / ${params.category}`}>
      <article className="rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="text-2xl font-bold text-primary">{term.termKo} ({term.termEn})</h2>
        <p className="mt-2 text-sm text-slate-500">발음: {term.pronunciation ?? `${term.termKo} (${term.termEn})`}</p>

        <section className="mt-5">
          <h3 className="text-sm font-semibold text-slate-500">뜻</h3>
          <p className="mt-2 text-slate-800">{term.oneLineDefinition}</p>
          {term.definitions ? (
            <div className="mt-3 grid gap-2 text-sm text-slate-700">
              <p><strong>입문</strong> {term.definitions.novice}</p>
              <p><strong>기초</strong> {term.definitions.beginner}</p>
              <p><strong>중급</strong> {term.definitions.intermediate}</p>
              <p><strong>고급</strong> {term.definitions.advanced}</p>
            </div>
          ) : null}
        </section>

        <section className="mt-6">
          <h3 className="text-sm font-semibold text-slate-500">활용 예시</h3>
          <div className="mt-2 grid gap-2 text-sm text-slate-700">
            {(term.usageExamples && term.usageExamples.length > 0 ? term.usageExamples : [
              { context: '요청 예시', example: `${term.termKo}로 성능 최적화 방법을 설명해줘.` },
              { context: '업무 예시', example: `${term.termKo} 기준으로 화면/정책을 설계해줘.` }
            ]).map((item, idx) => (
              <p key={`${term.id}-usage-${idx}`}>[{item.context}] {item.example}</p>
            ))}
          </div>
        </section>

        <section className="mt-6 rounded-xl bg-slate-50 p-4">
          <h3 className="text-sm font-semibold text-slate-600">AI 프롬프트 예시</h3>
          <p className="mt-1 text-sm text-slate-700">
            {term.aiPromptExample && term.aiPromptExample.trim().length > 0
              ? term.aiPromptExample
              : `${term.termKo}를 비전공자도 이해하게 3문장으로 설명하고, 실무 활용 예시 1개를 줘.`}
          </p>
        </section>

        {term.imageUrl && term.imageUrl.trim().length > 0 ? (
          <section className="mt-6">
            <h3 className="text-sm font-semibold text-slate-500">참고 이미지</h3>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={term.imageUrl} alt={term.imageDescription ?? term.termKo} className="mt-2 w-full rounded-xl border border-slate-200" />
            {term.imageDescription ? <p className="mt-2 text-xs text-slate-500">{term.imageDescription}</p> : null}
          </section>
        ) : null}
      </article>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </AppShell>
  );
}
