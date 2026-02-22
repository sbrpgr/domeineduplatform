import { AppShell } from '@/components/layout/app-shell';
import { DomainGrid } from '@/components/domain-grid';

export default function ExplorePage() {
  return (
    <AppShell title="도메인 탐색" subtitle="12개 도메인의 카테고리 구조와 학습 우선순위를 제공합니다.">
      <DomainGrid />
    </AppShell>
  );
}
