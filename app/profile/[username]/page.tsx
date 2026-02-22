import { AppShell } from '@/components/layout/app-shell';

export default function ProfilePage({ params }: { params: { username: string } }) {
  return (
    <AppShell title={`@${params.username}`} subtitle="공개 프로필 및 기여 이력">
      <div className="rounded-xl border border-slate-200 bg-white p-4">프로필 초기 버전</div>
    </AppShell>
  );
}
