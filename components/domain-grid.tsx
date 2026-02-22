import Link from 'next/link';
import { domains } from '@/lib/data';
import { Pill } from '@/components/ui/pill';

export function DomainGrid() {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {domains.map((domain) => (
        <article key={domain.slug} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">{domain.nameKo}</h2>
            <Pill text={domain.priority} tone="accent" />
          </div>
          <p className="mt-1 text-sm text-slate-500">{domain.nameEn}</p>
          <p className="mt-3 text-sm text-slate-700">목표 용어 수 {domain.targetTermCount}개</p>
          <div className="mt-4 flex gap-2">
            <Link href={`/learn/${domain.slug}`} className="rounded-lg bg-primary px-3 py-2 text-sm font-medium text-white">학습 시작</Link>
            <Link href={`/explore?domain=${domain.slug}`} className="rounded-lg border border-slate-300 px-3 py-2 text-sm">상세 보기</Link>
          </div>
        </article>
      ))}
    </div>
  );
}
