import { z } from 'zod';
import { NextResponse } from 'next/server';
import { checkRateLimit } from '@/lib/rate-limit';
import { generateExplain } from '@/lib/ai/service';
import { findTermByIdOrSlug } from '@/lib/repositories/term-repository';

const explainSchema = z.object({
  term_id: z.string().min(1),
  user_level: z.enum(['novice', 'beginner', 'intermediate', 'advanced']),
  user_context: z.string().min(1),
  previous_explanation_feedback: z.string().optional()
});

export async function POST(request: Request) {
  const ip = request.headers.get('x-forwarded-for') ?? 'local';
  const limit = checkRateLimit(`ai:explain:${ip}`, 10, 60_000);
  if (!limit.ok) {
    return NextResponse.json({ error: 'rate_limited' }, { status: 429 });
  }

  const body = await request.json();
  const parse = explainSchema.safeParse(body);
  if (!parse.success) {
    return NextResponse.json({ error: parse.error.flatten() }, { status: 400 });
  }

  const term = await findTermByIdOrSlug(parse.data.term_id);
  const explanation = await generateExplain({
    termName: term?.termKo ?? parse.data.term_id,
    domain: term?.domain ?? 'general',
    level: parse.data.user_level,
    context: parse.data.user_context,
    feedback: parse.data.previous_explanation_feedback
  });

  return NextResponse.json({
    term_id: parse.data.term_id,
    explanation,
    prompt_hint: 'AI에게 이렇게 말해보세요: 개념을 실무 예시 1개와 함께 다시 설명해줘.',
    rate_limit_remaining: limit.remaining
  });
}
