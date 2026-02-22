export function Pill({ text, tone = 'neutral' }: { text: string; tone?: 'neutral' | 'primary' | 'accent' }) {
  const toneClass =
    tone === 'primary'
      ? 'bg-primary/10 text-primary'
      : tone === 'accent'
        ? 'bg-accent/10 text-accent'
        : 'bg-slate-100 text-slate-700';

  return <span className={`rounded-full px-3 py-1 text-xs font-medium ${toneClass}`}>{text}</span>;
}
