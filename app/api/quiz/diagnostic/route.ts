import { z } from 'zod';
import { NextResponse } from 'next/server';
import { listDiagnosticQuiz } from '@/lib/repositories/quiz-repository';

const submitSchema = z.object({
  domain: z.string().min(1),
  answers: z.array(z.object({ questionId: z.string(), correct: z.boolean() })).min(1)
});

export async function GET(request: Request) {
  const domain = new URL(request.url).searchParams.get('domain') ?? 'it-dev';
  const items = await listDiagnosticQuiz(domain);

  return NextResponse.json({ items });
}

export async function POST(request: Request) {
  const body = await request.json();
  const parse = submitSchema.safeParse(body);
  if (!parse.success) {
    return NextResponse.json({ error: parse.error.flatten() }, { status: 400 });
  }

  const correct = parse.data.answers.filter((item) => item.correct).length;
  const level = correct <= 3 ? 'novice' : correct <= 7 ? 'beginner' : correct <= 11 ? 'intermediate' : 'advanced';

  return NextResponse.json({
    score: correct,
    total: parse.data.answers.length,
    assignedLevel: level
  });
}
