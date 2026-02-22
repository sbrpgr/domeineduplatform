# 상세 수집 로그 (2026-02-20)

## 적용 도메인
- IT 개발 (2,000)
- 디자인 (1,400)
- AI/데이터 (1,600)
- 마케팅/그로스 (1,000)
- 스타트업/PM/경영 (1,000)
- 핀테크/금융 (1,000)
- 바이오/헬스케어 (900)
- 법률/컴플라이언스 (900)
- 게임/메타버스/XR (800)
- 이커머스/물류/SCM (800)
- 에너지/스마트팩토리/ESG (800)
- 크리에이터 이코노미 (800)

총 13,000개 용어 수집

## 수집 방식
1. 도메인 카탈로그 정의 (`data/catalogs/*.catalog.json`)
2. 표준 스키마에 맞춰 상세 용어 JSON 생성 (`scripts/data/generate-detailed-data.mjs`)
3. 관계 엣지 리스트 생성 (`data/relationships/*.edges.json`)
4. 진단 퀴즈 15문항/도메인 생성 (`scripts/data/generate-diagnostic-quizzes.mjs`)
5. 필드/관계 최소조건 검증 (`scripts/data/validate-detailed-data.mjs`)
6. 수집률/난이도 분포 리포트 생성 (`scripts/data/report-collection.mjs`)

## 포함 필드
- id, slug, term_ko, term_en, pronunciation
- domain, category(level2/3), difficulty
- one_line_definition, definitions(4단계)
- usage_examples(2), ai_prompt_example
- related_terms(parent/sibling/child/opposite)
- tags, quiz_questions(2), source_urls(2)
- last_reviewed_at, reviewer

## 난이도 분배 방식
- novice 15%, beginner 35%, intermediate 35%, advanced 15%

## 검수 기준
- 용어당 source_urls 2개 이상
- 용어당 parent/sibling/child 최소 1개
- 필수 필드 누락 없음
