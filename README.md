# Domain Glossary Platform

대규모 학습 플랫폼 부트스트랩 코드베이스입니다.

## 현재 범위
- 12개 도메인(신규 `디자인` 포함)
- Next.js 14 App Router 기반 주요 화면 라우트 전개
- 학습엔진 유틸(SM-2, IRT, 적응형 세션 점수, 온보딩 진단 점수)
- React Flow 기반 3-hop 그래프 + 필터/검색/노드 패널
- Zod 기반 API 계약 (learning, ai, domains, terms, graph, quiz, health, auth)
- PostgreSQL + Prisma 스키마 + seed
- SEO: sitemap/robots/DefinedTerm metadata
- 보안: CSP/보안 헤더 미들웨어
- 테스트: SM-2(23), IRT, graph detection/hops, onboarding

## 실행
1. `.env.example`를 `.env`로 복사
2. PostgreSQL 실행
   - Docker 사용 시: `docker compose up -d`
3. `npm.cmd install`
4. `npm.cmd run prisma:generate`
5. `npm.cmd run prisma:push`
6. `npm.cmd run prisma:seed`
7. `npm.cmd run dev`
8. `npm.cmd run test`

## 데모 로그인
- email: `demo@domain-glossary.com`
- password: `demo1234`

## 상태
- `npm.cmd run test` 통과
- `npm.cmd run build` 통과
- DB 미기동 시 `prisma:push`는 `P1001`(localhost:5432 연결 실패)
