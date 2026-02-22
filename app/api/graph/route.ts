import { NextResponse } from 'next/server';
import { detectCircularRelationships } from '@/lib/graph/cycle-detection';
import { listGraphEdges } from '@/lib/repositories/graph-repository';

export async function GET(request: Request) {
  const domain = new URL(request.url).searchParams.get('domain') ?? undefined;

  const edges = await listGraphEdges(domain);

  return NextResponse.json({
    edges,
    cycles: detectCircularRelationships(edges)
  });
}
