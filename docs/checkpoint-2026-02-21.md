# 체크포인트 저장 (2026-02-21)

## 1) 작업 내용 요약
- UX/UI 세부기획 기준 P0/P1 구현을 코드에 반영
- 샘플 데이터 직참조 구간을 리포지토리 기반(DB 우선 + 폴백)으로 전환
- 학습 이벤트 API에 보상/미션/스트릭/뱃지/레벨업 로직 추가
- 카드/퀴즈/그래프 화면을 `learning/event`와 실연동

## 2) 이번 세션 주요 반영 항목
- 온보딩 4단계 마법사
: 도메인 선택 → 진단 퀴즈 → 레벨 배정 → 목표 설정
- 카드 학습 UX
: 레벨 정의 탭, XP/스트릭 표시, 모바일 스와이프, AI 재설명 모달, 레벨업 전체화면 연출
- 학습 홈 UX
: 스트릭 캘린더, 일일 미션 UI
- 퀴즈/그래프 이벤트 연동
: 퀴즈 정답 제출/그래프 노드 탐색 시 이벤트 수집

## 3) 학습 이벤트 API 명세 (현재 구현)
파일: `app/api/learning/event/route.ts`

### Request
```json
{
  "user_id": "demo-user",
  "term_id": "term-id-or-slug",
  "event_type": "card_view | definition_expand | ai_explain | quiz_answer | bookmark | graph_explore",
  "metadata": {
    "domain": "design",
    "quiz_correct": true,
    "quality": 5,
    "level_viewed": "beginner",
    "rating": "easy"
  },
  "timestamp": "2026-02-21T01:00:00.000Z"
}
```

### Response (핵심)
```json
{
  "ok": true,
  "xp_gained": 20,
  "bonus_xp": 50,
  "total_xp": 620,
  "previous_level": "beginner",
  "new_level": "intermediate",
  "level_up": true,
  "streak": 7,
  "badges_unlocked": ["streak_7"],
  "missions": {
    "cards": 5,
    "quizzes": 5,
    "graph": 3,
    "cards_target": 5,
    "quizzes_target": 5,
    "graph_target": 3,
    "completed": true
  }
}
```

## 4) 반영 파일 목록
- `app/api/learning/event/route.ts`
- `components/learn/flashcard-trainer.tsx`
- `components/learn/adaptive-quiz.tsx`
- `components/graph/interactive-graph.tsx`
- `components/learn/onboarding-wizard.tsx`
- `app/onboarding/page.tsx`
- `app/learn/page.tsx`
- `app/learn/[domain]/card/page.tsx`
- `app/learn/[domain]/quiz/page.tsx`
- `app/learn/[domain]/graph/page.tsx`
- `lib/repositories/term-repository.ts`
- `lib/repositories/domain-repository.ts`
- `app/search/page.tsx`
- `app/sitemap.ts`
- `app/term/[domain]/[category]/[termSlug]/page.tsx`
- `docs/uxui-execution-log.md`
- `docs/roadmap.md`

## 5) 검증 상태
- `npm.cmd run build` 통과
- `npm.cmd run test` 통과 (47 passed)

## 6) 현재 한계/주의
- 학습 진척 상태는 현재 서버 메모리(Map) 저장
: 서버 재시작 시 초기화됨
- 다음 단계에서 DB 영속화 필요

## 7) 다음 작업 권장 순서
1. `learning/event` 진척 상태를 DB 테이블로 영속화
2. 뱃지/미션/레벨 이력 조회 API 추가 (`/api/learning/progress`)
3. 대시보드(`app/dashboard/page.tsx`)를 실데이터 기반으로 전환
