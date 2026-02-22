import { getOpenAIClient } from '@/lib/ai/client';

type ExplainInput = {
  termName: string;
  domain: string;
  level: 'novice' | 'beginner' | 'intermediate' | 'advanced';
  context: string;
  feedback?: string;
};

export async function generateExplain(input: ExplainInput): Promise<string> {
  const client = getOpenAIClient();

  if (!client) {
    return `${input.context} 맥락에 맞춰 ${input.level} 수준으로 ${input.termName} 설명 초안을 생성했습니다.`;
  }

  const res = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    temperature: 0.4,
    messages: [
      {
        role: 'system',
        content: `당신은 ${input.domain} 전문가이자 교육자입니다. 사용자의 레벨은 ${input.level}입니다.`
      },
      {
        role: 'user',
        content: `'${input.termName}'을 ${input.context} 배경에 맞춰 쉽게 설명해줘. 피드백: ${input.feedback ?? '없음'}`
      }
    ]
  });

  return res.choices[0]?.message?.content?.trim() ?? '설명을 생성하지 못했습니다.';
}

export async function generateGlossaryAssist(termName: string, context: string): Promise<{
  oneLineDefinition: string;
  novice: string;
  beginner: string;
  intermediate: string;
  advanced: string;
}> {
  const client = getOpenAIClient();

  if (!client) {
    return {
      oneLineDefinition: `${termName}의 핵심을 팀 맥락에 맞춰 한 줄로 요약한 초안`,
      novice: `${termName}의 입문 설명`,
      beginner: `${termName}의 기초 설명`,
      intermediate: `${termName}의 중급 설명`,
      advanced: `${termName}의 고급 설명`
    };
  }

  const res = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    temperature: 0.3,
    response_format: { type: 'json_object' },
    messages: [
      {
        role: 'system',
        content: 'JSON으로만 응답하세요. keys: oneLineDefinition, novice, beginner, intermediate, advanced'
      },
      {
        role: 'user',
        content: `${context} 맥락에서 '${termName}' 용어를 4단계로 설명해줘.`
      }
    ]
  });

  try {
    const parsed = JSON.parse(res.choices[0]?.message?.content ?? '{}');
    return {
      oneLineDefinition: parsed.oneLineDefinition ?? `${termName} 정의`,
      novice: parsed.novice ?? `${termName} 입문 설명`,
      beginner: parsed.beginner ?? `${termName} 기초 설명`,
      intermediate: parsed.intermediate ?? `${termName} 중급 설명`,
      advanced: parsed.advanced ?? `${termName} 고급 설명`
    };
  } catch {
    return {
      oneLineDefinition: `${termName} 정의`,
      novice: `${termName} 입문 설명`,
      beginner: `${termName} 기초 설명`,
      intermediate: `${termName} 중급 설명`,
      advanced: `${termName} 고급 설명`
    };
  }
}
