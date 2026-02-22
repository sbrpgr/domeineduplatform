# 구현 로드맵 (대규모)

## Phase 0 데이터
- [x] 스키마 정의 (`data/term.schema.json`)
- [x] 수집 매트릭스 (`data/phase0-matrix.md`)
- [x] IT/디자인 포함 12개 도메인 수집 자동화 (`npm.cmd run data:workflow`)

## Phase 1 아키텍처/DB
- [x] 아키텍처 문서
- [x] PostgreSQL + pgvector 전체 스키마
- [x] ORM 모델 동기화 (`prisma/schema.prisma`)

## Phase 2 프론트
- [x] 주요 화면 라우트 골격
- [x] 공통 레이아웃/통계/도메인 컴포넌트
- [x] shadcn/ui + React Flow 본연동

## Phase 3 학습엔진
- [x] SM-2, IRT 유틸
- [x] 적응형 세션 점수 계산
- [ ] DB 연동 및 실시간 이벤트 큐

## Phase 4 AI
- [x] AI API 계약 + 레이트리밋
- [x] OpenAI 실제 호출/프롬프트 템플릿 운영

## Phase 5-8
- [ ] 커스텀 사전 고도화
- [ ] SEO/구조화 데이터/sitemap
- [ ] 성능/접근성 최적화
- [ ] 통합/E2E/부하 테스트
