import Link from 'next/link';
import { AppShell } from '@/components/layout/app-shell';
import { StatCard } from '@/components/ui/stat-card';
import { domains } from '@/lib/data';

const streakDays = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

export default function LearnPage() {
  return (
    <AppShell title="학습 홈" subtitle="스트릭, 오늘 학습 큐, 추천 도메인을 확인합니다.">
      <section className="grid gap-4 md:grid-cols-4">
        <StatCard label="학습 연속일" value="12일" hint="전일 대비 +1" />
        <StatCard label="오늘 목표" value="10개" hint="현재 3개 완료" />
        <StatCard label="정답률" value="78%" hint="최근 50문항" />
        <StatCard label="약점 용어" value="14개" hint="복습 권장" />
      </section>

      <section className="mt-8 grid gap-4 md:grid-cols-2">
        <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold">스트릭 캘린더</h2>
          <p className="mt-1 text-sm text-slate-600">매일 5개 이상 학습 시 스트릭이 유지됩니다.</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {streakDays.map((day, index) => {
              const active = index <= 4;
              const today = index === 5;
              return (
                <div
                  key={`${day}-${index}`}
                  className={`flex h-10 w-10 items-center justify-center rounded-lg text-xs font-semibold ${
                    today
                      ? 'bg-amber-200 text-amber-900'
                      : active
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {day}
                </div>
              );
            })}
          </div>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold">오늘의 미션</h2>
          <ul className="mt-3 grid gap-2 text-sm text-slate-700">
            <li className="rounded-lg border border-slate-200 px-3 py-2">핵심 용어 5개 카드 학습 (+50 XP)</li>
            <li className="rounded-lg border border-slate-200 px-3 py-2">퀴즈 5문항 완료 (+30 XP)</li>
            <li className="rounded-lg border border-slate-200 px-3 py-2">연관 그래프 노드 3개 탐색 (+15 XP)</li>
          </ul>
        </article>
      </section>

      <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="text-xl font-semibold">도메인별 학습 허브</h2>
        <div className="mt-4 grid gap-2 md:grid-cols-2">
          {domains.map((domain) => (
            <Link key={domain.slug} href={`/learn/${domain.slug}`} className="rounded-lg border border-slate-200 px-4 py-3 hover:border-primary">
              {domain.nameKo}
            </Link>
          ))}
        </div>
      </section>
    </AppShell>
  );
}
