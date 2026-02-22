import { AppShell } from '@/components/layout/app-shell';

export default function GlossaryBuilderPage({ params }: { params: { id: string } }) {
  return (
    <AppShell title={`사전 빌더: ${params.id}`} subtitle="좌측 목록 + 우측 편집 + AI 제안 패널">
      <div className="grid gap-4 lg:grid-cols-5">
        <section className="rounded-xl border border-slate-200 bg-white p-4 lg:col-span-2">용어 목록</section>
        <section className="rounded-xl border border-slate-200 bg-white p-4 lg:col-span-3">편집기 및 AI 제안</section>
      </div>
    </AppShell>
  );
}
