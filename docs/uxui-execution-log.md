# UX/UI 세부기획 반영 로그 (2026-02-21)

기준 문서: `도메인용어백과사전_UXUI세부기획.html`

## 1) 확인한 우선순위 항목
- P0: TermCard(레벨 탭), 카드 네비게이션, XP 즉시 피드백, 스트릭 UI, 퀴즈 UI, 온보딩 진단+레벨 배정
- P1: 그래프, 뱃지/잠금해제, 레벨업 전체화면 연출, 일일 미션, AI 재설명 모달

## 2) 이번 턴 반영 항목
- 온보딩 4단계 마법사 구현
: 도메인 선택 → 진단 5문항 → 레벨 배정 → 목표 설정
- 카드 학습 UX 강화
: 레벨별 정의 탭 전환, XP/스트릭 표시, 정답 평가 시 XP 즉시 피드백
- 학습 홈 개선
: 스트릭 캘린더, 일일 미션 카드 추가

## 3) 파일 변경
- `components/learn/onboarding-wizard.tsx`
- `app/onboarding/page.tsx`
- `components/learn/flashcard-trainer.tsx`
- `app/learn/page.tsx`

## 4) 다음 절차 (P1)
1. 뱃지 시스템 데이터 모델 + 잠금 해제 조건 엔진
: `learning/event` API에 반영 완료 (first_learning, quiz_rookie, graph_explorer, streak_7, xp_500)
2. 레벨업 전체 화면 연출 컴포넌트 추가
: 카드 학습 화면에 반영 완료
3. AI 재설명 모달을 카드 학습 화면에 인라인 연결
: 반영 완료
4. 일일 미션을 실제 이벤트(`learning/event`)와 연계
: 카드/퀴즈/그래프 화면 이벤트 연동 완료
