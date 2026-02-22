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
        <p className="mt-3 text-slate-700">{term.oneLineDefinition}</p>
      </article>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </AppShell>
  );
}
