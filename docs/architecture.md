# 도메인 용어 백과사전 아키텍처 (v1 확장)

## 핵심 방향
- 대형 SaaS 구조를 기준으로 모듈 경계를 선제 분리
- 프론트/API/학습엔진/데이터 파이프라인을 병렬 확장 가능하게 설계
- 신규 `디자인` 도메인을 P1로 편성

## 도메인
- 총 12개 도메인
- 신규: `design` (디자인, 목표 220개, P1)

## 앱 구조
- `app/`: 화면 + API 라우트
- `components/`: 공통 UI 및 레이아웃
- `lib/learning`: SM-2, IRT, 세션 적응 로직
- `lib/graph`: 관계 그래프 순환 감지
- `data/`: Phase 0 수집/시드 자료
- `docs/`: 아키텍처/DB 스키마

## 구현 상태
- 퍼블릭/학습/사전/커뮤니티 경로 전체 기본 뼈대 구축
- API 라우트: domains, terms, graph, diagnostic quiz, learning, ai
- 학습 알고리즘 유틸: SM-2 + IRT + 세션 성과 점수
- DB 스키마: PRD 요구 핵심 테이블 전체 반영

## 다음 목표
1. React Flow 그래프 + 3-hop 클러스터링 적용
2. 인증/권한(NextAuth) 연결
3. ORM 도입 후 API를 DB 기반으로 전환
4. Phase 0 자동 워크플로우 고도화 (실데이터 소스 커넥터/품질 규칙 강화)
