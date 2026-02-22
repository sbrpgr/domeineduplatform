import Link from 'next/link';
import { AppShell } from '@/components/layout/app-shell';

export default function GlossaryDetailPage({ params }: { params: { id: string } }) {
  return (
    <AppShell title={`사전: ${params.id}`} subtitle="용어 목록, 권한, 공유 설정">
      <div className="flex gap-3">
        <Link href={`/glossary/${params.id}/builder`} className="rounded-lg bg-primary px-4 py-2 text-white">빌더 열기</Link>
        <Link href={`/glossary/${params.id}/share`} className="rounded-lg border border-slate-300 px-4 py-2">공유 설정</Link>
      </div>
    </AppShell>
  );
}
