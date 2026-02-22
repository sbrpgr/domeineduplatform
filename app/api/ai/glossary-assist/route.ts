import { z } from 'zod';
import { NextResponse } from 'next/server';
import { checkRateLimit } from '@/lib/rate-limit';
import { generateGlossaryAssist } from '@/lib/ai/service';

const glossaryAssistSchema = z.object({
  term_name: z.string().min(1),
  user_context: z.string().min(1),
  existing_definition: z.string().optional()
});

export async function POST(request: Request) {
  const ip = request.headers.get('x-forwarded-for') ?? 'local';
  const limit = checkRateLimit(`ai:glossary:${ip}`, 10, 60_000);
  if (!limit.ok) {
    return NextResponse.json({ error: 'rate_limited' }, { status: 429 });
  }

  const body = await request.json();
  const parse = glossaryAssistSchema.safeParse(body);

  if (!parse.success) {
    return NextResponse.json({ error: parse.error.flatten() }, { status: 400 });
  }

  const ai = await generateGlossaryAssist(parse.data.term_name, parse.data.user_context);

  return NextResponse.json({
    one_line_definition: ai.oneLineDefinition,
    definitions: {
      novice: ai.novice,
      beginner: ai.beginner,
      intermediate: ai.intermediate,
      advanced: ai.advanced
    },
    usage_examples: [
      { context: '기획 리뷰', example: `${parse.data.term_name} 기준을 명시해 일정 리스크를 줄입시다.` },
      { context: '개발 협업', example: `${parse.data.term_name} 관련 의사결정 근거를 PR에 남겨 주세요.` }
    ],
    ai_prompt_example: `${parse.data.term_name} 개념을 우리 팀 컨텍스트(${parse.data.user_context})에 맞춰 다시 설명해줘.`,
    suggested_related_terms: [
      { term_id: 't-modal', term_name: '모달', relation: 'sibling', confidence: 0.82 }
    ],
    confidence_scores: {
      one_line_definition: 0.9,
      usage_examples: 0.84
    },
    rate_limit_remaining: limit.remaining
  });
}
