import { notFound } from 'next/navigation';
import { AppShell } from '@/components/layout/app-shell';
import { getDomainBySlug } from '@/lib/data';
import { InteractiveGraph } from '@/components/graph/interactive-graph';
import { listGraphEdges } from '@/lib/repositories/graph-repository';

export default async function LearnGraphPage({ params }: { params: { domain: string } }) {
  const domain = getDomainBySlug(params.domain);
  if (!domain) notFound();

  const edges = await listGraphEdges(params.domain);
  const center = edges[0]?.from ?? 'modal';

  return (
    <AppShell title={`${domain.nameKo} Relationship Graph`} subtitle="Explore term connections with 3-hop expansion.">
      <InteractiveGraph center={center} edges={edges} domain={params.domain} />
    </AppShell>
  );
}
