import Link from 'next/link';
import { AppShell } from '@/components/layout/app-shell';
import { Pill } from '@/components/ui/pill';
import { searchTerms } from '@/lib/repositories/term-repository';

const toCategorySlug = (value: string) => value.toLowerCase().replace(/\s+/g, '-');

export default async function SearchPage() {
  const items = await searchTerms();

  return (
    <AppShell title="용어 검색" subtitle="도메인/난이도/카테고리 필터를 확장할 수 있는 검색 베이스입니다.">
      <div className="grid gap-3">
        {items.map((term) => (
          <article key={term.id} className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="flex items-center justify-between">
              <Link
                href={`/term/${term.domain}/${toCategorySlug(term.level2Category ?? 'general')}/${term.slug}`}
                className="font-semibold text-primary"
              >
                {term.termKo} ({term.termEn})
              </Link>
              <Pill text={term.difficulty} />
            </div>
            <p className="mt-2 text-sm text-slate-700">{term.oneLineDefinition}</p>
            <p className="mt-1 text-xs text-slate-500">
              {term.domain} / {term.level2Category ?? '-'} / {term.level3Category ?? '-'}
            </p>
          </article>
        ))}
      </div>
    </AppShell>
  );
}
