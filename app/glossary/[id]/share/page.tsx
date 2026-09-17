import { AppShell } from '@/components/layout/app-shell';

export default async function GlossarySharePage({ params: routeParams }: { params: Promise<{ id: string }> }) {
  const params = await routeParams;
  return (
    <AppShell title={`공유: ${params.id}`} subtitle="공유 URL, 임베드 코드, PDF/CSV 내보내기">
      <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm">https://domain-glossary.com/g/{params.id}</div>
    </AppShell>
  );
}
