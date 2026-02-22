import { NextResponse } from 'next/server';
import { getLearningCurriculum } from '@/lib/repositories/curriculum-repository';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const domain = searchParams.get('domain') ?? 'it-dev';
  const userId = searchParams.get('user_id') ?? 'anonymous';

  const data = await getLearningCurriculum(domain, userId);
  return NextResponse.json(data);
}
