import Link from 'next/link';
import { notFound } from 'next/navigation';
import { AppShell } from '@/components/layout/app-shell';
import { getDomainBySlug } from '@/lib/data';

export default function LearnDomainPage({ params }: { params: { domain: string } }) {
  const domain = getDomainBySlug(params.domain);
  if (!domain) notFound();

  return (
    <AppShell title={`${domain.nameKo} 학습 허브`} subtitle="카드/퀴즈/그래프 학습을 선택하세요.">
      <div className="grid gap-3 md:grid-cols-3">
        <Link className="rounded-xl bg-white p-5 shadow-sm" href={`/learn/${domain.slug}/card`}>플래시카드</Link>
        <Link className="rounded-xl bg-white p-5 shadow-sm" href={`/learn/${domain.slug}/quiz`}>적응형 퀴즈</Link>
        <Link className="rounded-xl bg-white p-5 shadow-sm" href={`/learn/${domain.slug}/graph`}>관계 그래프</Link>
      </div>
    </AppShell>
  );
}
