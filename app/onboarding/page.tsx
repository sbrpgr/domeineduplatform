import { AppShell } from '@/components/layout/app-shell';
import { listDomains } from '@/lib/repositories/domain-repository';
import { OnboardingWizard } from '@/components/learn/onboarding-wizard';

export default async function OnboardingPage() {
  const domains = await listDomains();

  return (
    <AppShell title="온보딩" subtitle="도메인 선택 -> 진단 퀴즈 -> 레벨 배정 -> 학습 목표 설정">
      <OnboardingWizard domains={domains.map((domain) => ({ slug: domain.slug, nameKo: domain.nameKo }))} />
    </AppShell>
  );
}
