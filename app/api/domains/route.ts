import { z } from 'zod';
import { NextResponse } from 'next/server';
import { listDomains } from '@/lib/repositories/domain-repository';

export async function GET() {
  const items = await listDomains();
  return NextResponse.json({ items, total: items.length });
}

const createDomainSchema = z.object({
  slug: z.string().min(2),
  nameKo: z.string().min(2),
  nameEn: z.string().min(2),
  targetTermCount: z.number().int().positive(),
  priority: z.enum(['P1', 'P2', 'P3'])
});

export async function POST(request: Request) {
  const body = await request.json();
  const parse = createDomainSchema.safeParse(body);
  if (!parse.success) {
    return NextResponse.json({ error: parse.error.flatten() }, { status: 400 });
  }

  return NextResponse.json({ ok: true, item: parse.data }, { status: 201 });
}
