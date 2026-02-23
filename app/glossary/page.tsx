import Link from 'next/link';
import { AppShell } from '@/components/layout/app-shell';

export default function GlossaryPage() {
  return (
    <AppShell title="내 사전" subtitle="용어/뜻/활용예시를 바로 학습할 수 있는 사전 목록">
      <div className="grid gap-3 md:grid-cols-2">
        <article className="rounded-xl border border-slate-200 bg-white p-4">
          <h2 className="font-semibold">우리팀 UX 사전</h2>
          <p className="mt-1 text-sm text-slate-600">공개범위: team</p>
          <p className="mt-2 text-sm text-slate-700">용어마다 뜻과 활용예시가 보이는 학습형 목록으로 확인할 수 있습니다.</p>
          <Link className="mt-3 inline-block text-primary" href="/glossary/team-ux">열기</Link>
        </article>
      </div>
    </AppShell>
  );
}
