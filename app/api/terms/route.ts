import { z } from 'zod';
import { NextResponse } from 'next/server';
import { searchTerms } from '@/lib/repositories/term-repository';

const searchSchema = z.object({
  q: z.string().optional(),
  domain: z.string().optional(),
  difficulty: z.enum(['novice', 'beginner', 'intermediate', 'advanced']).optional()
});

export async function GET(request: Request) {
  const searchParams = Object.fromEntries(new URL(request.url).searchParams.entries());
  const parse = searchSchema.safeParse(searchParams);
  if (!parse.success) {
    return NextResponse.json({ error: parse.error.flatten() }, { status: 400 });
  }

  const items = await searchTerms(parse.data.q, parse.data.domain, parse.data.difficulty);
  return NextResponse.json({ items, total: items.length });
}
