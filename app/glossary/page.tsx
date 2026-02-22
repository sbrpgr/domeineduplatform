import Link from 'next/link';
import { AppShell } from '@/components/layout/app-shell';

export default function GlossaryPage() {
  return (
    <AppShell title="내 사전" subtitle="커스텀 용어사전 생성 및 공유">
      <div className="grid gap-3 md:grid-cols-2">
        <article className="rounded-xl border border-slate-200 bg-white p-4">
          <h2 className="font-semibold">우리팀 UX 사전</h2>
          <p className="mt-1 text-sm text-slate-600">공개범위: team</p>
          <Link className="mt-3 inline-block text-primary" href="/glossary/team-ux">열기</Link>
        </article>
      </div>
    </AppShell>
  );
}
