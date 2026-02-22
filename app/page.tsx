import type { Metadata } from 'next';
import Link from 'next/link';
import { AppShell } from '@/components/layout/app-shell';
import { DomainGrid } from '@/components/domain-grid';

export const metadata: Metadata = {
  title: '도메인 용어 백과사전',
  description: 'AI 시대, 언어가 곧 실행력이다'
};

export default function HomePage() {
  return (
    <AppShell title="도메인 용어 백과사전" subtitle="AI 시대, 언어가 곧 실행력이다">
      <section className="rounded-3xl bg-primary p-10 text-white shadow-xl">
        <p className="text-sm text-blue-100">학습플랫폼 v1 Bootstrap</p>
        <h2 className="mt-2 text-4xl font-bold">실무 용어를 빠르게 학습하고 바로 실행하세요.</h2>
        <p className="mt-4 max-w-3xl text-blue-100">
          인터랙티브 그래프, 적응형 난이도 엔진, 커스텀 사전 빌더, AI 재설명까지 하나의 워크플로우로 제공합니다.
        </p>
        <div className="mt-7 flex gap-3">
          <Link href="/onboarding" className="rounded-xl bg-white px-4 py-2 font-semibold text-primary">온보딩 시작</Link>
          <Link href="/explore" className="rounded-xl border border-white/50 px-4 py-2">도메인 탐색</Link>
        </div>
      </section>
      <section className="mt-10">
        <h3 className="mb-4 text-xl font-semibold">학습 도메인</h3>
        <DomainGrid />
      </section>
    </AppShell>
  );
}
