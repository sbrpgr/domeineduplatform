import { AppShell } from '@/components/layout/app-shell';
import { StatCard } from '@/components/ui/stat-card';

export default function DashboardPage() {
  return (
    <AppShell title="학습 분석 대시보드" subtitle="레벨 이력, 약점, 히트맵 기반 학습 리포트">
      <section className="grid gap-4 md:grid-cols-3">
        <StatCard label="현재 레벨" value="Beginner" hint="최근 2주 유지" />
        <StatCard label="다음 승급 확률" value="67%" hint="중급 목표" />
        <StatCard label="예상 완주" value="45일" hint="IT 개발 기준" />
      </section>
    </AppShell>
  );
}
