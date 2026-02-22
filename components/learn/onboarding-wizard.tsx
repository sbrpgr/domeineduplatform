'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';

type DomainOption = {
  slug: string;
  nameKo: string;
};

type Question = {
  id: string;
  prompt: string;
  options: string[];
  answer: number;
};

const levelByScore = (score: number) => {
  if (score <= 1) return 'novice';
  if (score <= 3) return 'beginner';
  if (score <= 4) return 'intermediate';
  return 'advanced';
};

export function OnboardingWizard({ domains }: { domains: DomainOption[] }) {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [selectedDomain, setSelectedDomain] = useState<string>(domains[0]?.slug ?? 'it-dev');
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [goal, setGoal] = useState<'career' | 'project' | 'interview'>('project');

  const questions = useMemo<Question[]>(
    () => [
      {
        id: 'q1',
        prompt: '새로운 용어를 빠르게 익힐 때 가장 적절한 방식은?',
        options: ['정의만 암기', '예시와 함께 반복', '문장 분석만 수행', '무작위 검색'],
        answer: 1
      },
      {
        id: 'q2',
        prompt: '학습 루틴을 유지하기 위한 핵심 지표는?',
        options: ['스크롤 시간', '연속 학습일(스트릭)', '탭 개수', '알림 수'],
        answer: 1
      },
      {
        id: 'q3',
        prompt: '용어 간 관계 학습의 직접적인 이점은?',
        options: ['디자인 색상 고정', '암기 속도 저하', '개념 연결 강화', 'API 호출 감소'],
        answer: 2
      },
      {
        id: 'q4',
        prompt: '퀴즈 결과가 낮게 나왔을 때 가장 먼저 할 일은?',
        options: ['학습 중단', '난도 재조정 후 복습', '임의 용어 전환', '정답 공개만 반복'],
        answer: 1
      },
      {
        id: 'q5',
        prompt: '실무 전환에 가장 효과적인 복습 단위는?',
        options: ['용어 1개 정의', '용어+사용 예시+관련 용어', 'UI 캡처', '랜덤 뉴스'],
        answer: 1
      }
    ],
    []
  );

  const answeredCount = Object.keys(answers).length;
  const allAnswered = answeredCount === questions.length;
  const score = questions.reduce((sum, question) => sum + (answers[question.id] === question.answer ? 1 : 0), 0);
  const estimatedLevel = levelByScore(score);

  return (
    <section className="grid gap-4">
      <article className="rounded-2xl border border-slate-200 bg-white p-4">
        <div className="flex items-center justify-between text-sm text-slate-600">
          <p>온보딩 단계 {step}/4</p>
          <p className="rounded-full bg-slate-100 px-3 py-1 text-xs">도메인 {selectedDomain}</p>
        </div>
        <div className="mt-3 h-2 rounded-full bg-slate-100">
          <div className="h-2 rounded-full bg-primary transition-all" style={{ width: `${step * 25}%` }} />
        </div>
      </article>

      {step === 1 ? (
        <article className="rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="text-lg font-semibold">1) 학습 도메인 선택</h2>
          <p className="mt-2 text-sm text-slate-600">첫 주 학습에 집중할 도메인을 선택합니다.</p>
          <div className="mt-4 grid gap-2 md:grid-cols-3">
            {domains.map((domain) => (
              <button
                key={domain.slug}
                type="button"
                onClick={() => setSelectedDomain(domain.slug)}
                className={`rounded-lg border px-4 py-3 text-left text-sm ${
                  selectedDomain === domain.slug ? 'border-primary bg-blue-50 text-primary' : 'border-slate-200'
                }`}
              >
                {domain.nameKo}
              </button>
            ))}
          </div>
          <div className="mt-5">
            <button type="button" onClick={() => setStep(2)} className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white">
              진단 퀴즈 시작
            </button>
          </div>
        </article>
      ) : null}

      {step === 2 ? (
        <article className="rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="text-lg font-semibold">2) 진단 퀴즈</h2>
          <p className="mt-2 text-sm text-slate-600">총 {questions.length}문항, 정답 수로 초기 레벨을 배정합니다.</p>
          <div className="mt-4 grid gap-4">
            {questions.map((question, index) => (
              <div key={question.id} className="rounded-xl border border-slate-200 p-4">
                <p className="text-sm font-semibold">{index + 1}. {question.prompt}</p>
                <div className="mt-3 grid gap-2">
                  {question.options.map((option, optionIndex) => (
                    <button
                      key={`${question.id}-${optionIndex}`}
                      type="button"
                      onClick={() => setAnswers((prev) => ({ ...prev, [question.id]: optionIndex }))}
                      className={`rounded-lg border px-3 py-2 text-left text-sm ${
                        answers[question.id] === optionIndex ? 'border-primary bg-blue-50 text-primary' : 'border-slate-200'
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-5 flex items-center gap-2">
            <button type="button" onClick={() => setStep(1)} className="rounded-lg border border-slate-300 px-4 py-2 text-sm">
              이전
            </button>
            <button
              type="button"
              onClick={() => setStep(3)}
              disabled={!allAnswered}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              레벨 배정 보기
            </button>
            <p className="text-xs text-slate-500">완료 {answeredCount}/{questions.length}</p>
          </div>
        </article>
      ) : null}

      {step === 3 ? (
        <article className="rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="text-lg font-semibold">3) 초기 레벨 배정</h2>
          <p className="mt-2 text-sm text-slate-600">정답 {score}/{questions.length} 기준으로 학습 난도를 시작합니다.</p>
          <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4">
            <p className="text-sm text-amber-800">추천 레벨: <strong className="uppercase">{estimatedLevel}</strong></p>
          </div>
          <div className="mt-5 flex items-center gap-2">
            <button type="button" onClick={() => setStep(2)} className="rounded-lg border border-slate-300 px-4 py-2 text-sm">
              이전
            </button>
            <button type="button" onClick={() => setStep(4)} className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white">
              목표 설정
            </button>
          </div>
        </article>
      ) : null}

      {step === 4 ? (
        <article className="rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="text-lg font-semibold">4) 학습 목표 설정</h2>
          <div className="mt-3 grid gap-2 md:grid-cols-3">
            <button
              type="button"
              onClick={() => setGoal('project')}
              className={`rounded-lg border px-3 py-2 text-sm ${goal === 'project' ? 'border-primary bg-blue-50 text-primary' : 'border-slate-200'}`}
            >
              실무 프로젝트
            </button>
            <button
              type="button"
              onClick={() => setGoal('career')}
              className={`rounded-lg border px-3 py-2 text-sm ${goal === 'career' ? 'border-primary bg-blue-50 text-primary' : 'border-slate-200'}`}
            >
              커리어 전환
            </button>
            <button
              type="button"
              onClick={() => setGoal('interview')}
              className={`rounded-lg border px-3 py-2 text-sm ${goal === 'interview' ? 'border-primary bg-blue-50 text-primary' : 'border-slate-200'}`}
            >
              면접 준비
            </button>
          </div>
          <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
            선택 결과: 도메인 <strong>{selectedDomain}</strong>, 레벨 <strong className="uppercase">{estimatedLevel}</strong>, 목표 <strong>{goal}</strong>
          </div>
          <div className="mt-5 flex flex-wrap items-center gap-2">
            <button type="button" onClick={() => setStep(3)} className="rounded-lg border border-slate-300 px-4 py-2 text-sm">
              이전
            </button>
            <Link href={`/learn/${selectedDomain}/card`} className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white">
              첫 카드 학습 시작
            </Link>
          </div>
        </article>
      ) : null}
    </section>
  );
}
