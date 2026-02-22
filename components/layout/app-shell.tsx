import Link from 'next/link';

const navItems = [
  { href: '/', label: '홈' },
  { href: '/explore', label: '탐색' },
  { href: '/search', label: '검색' },
  { href: '/learn', label: '학습' },
  { href: '/glossary', label: '사전 빌더' },
  { href: '/dashboard', label: '대시보드' }
];

export function AppShell({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="text-lg font-bold text-primary">도메인 용어 백과사전</Link>
          <nav className="flex gap-4 text-sm text-slate-600">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href} className="hover:text-primary">{item.label}</Link>
            ))}
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-primary">{title}</h1>
          {subtitle ? <p className="mt-2 text-slate-600">{subtitle}</p> : null}
        </div>
        {children}
      </main>
    </div>
  );
}
