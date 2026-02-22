# Codex Handoff - 2026-02-23

## 목적
이 문서는 2026-02-22~2026-02-23에 진행한 GitHub 업로드, Vercel 배포, 장애 대응 내역을 다음 세션에서 바로 이어가기 위한 인수인계 기록이다.

## 최종 상태 (현재)
- GitHub: `https://github.com/sbrpgr/domeineduplatform`
- 기본 브랜치: `main`
- Vercel 프로덕션: `https://domeineduplatform.vercel.app`
- 최종 HTTP 확인: `200 OK` (HEAD 기준)
- 로컬 빌드: `npm.cmd run build` 통과

## 이번 세션에서 해결한 핵심 이슈
1. `.env` 보안 처리
- `.gitignore` 생성/정비로 `.env` 및 로컬 민감 파일 제외
- `.env.example`만 추적

2. Git 초기화/원격 연결
- 로컬 프로젝트 Git 초기화
- 원격 연결 후 `main` 브랜치 푸시 완료

3. Vercel 배포 실패 연속 대응
- 타입 오류(암시적 any, Prisma 타입 차이) 수정
- Prisma Client 생성 누락 해결: `package.json`에 `postinstall: prisma generate` 추가
- `prisma/schema.prisma` BOM 제거 (Linux 빌드 파싱 실패 해결)
- Prisma relation 오류 해결: `Term` 모델에 `contributions CommunityContribution[]` 추가

4. `MIDDLEWARE_INVOCATION_FAILED` (500) 해결
- 원인: Edge 런타임에서 `__dirname is not defined`
- 조치: `middleware.ts` 제거 (핫픽스)

5. 지속 `404 NOT_FOUND` 해결
- 원인: Vercel 프로젝트가 `Framework Preset: Other`로 인식되어 Next 라우팅 미매칭
- 조치: `vercel.json` 추가
  - `{ "framework": "nextjs" }`
- 이후 프로덕션 재배포로 `200 OK` 확인

## 중요 커밋 히스토리(요약)
- `b7b462b` chore: initialize repository and secure env handling
- `2c77ca4` fix: resolve vercel build type error
- `ea8aebd` fix: use portable Prisma.sql return type
- `6720530` fix: remove Prisma.sql helper dependency for vercel build
- `445656c` fix: make vercel build compatible with prisma client generation
- `bcd04b3` fix: save prisma schema without bom for vercel
- `0301085` fix: add missing inverse relation for community contributions
- `013f27f` hotfix: remove middleware to stop edge invocation crash
- `797a27c` fix: set vercel framework to nextjs

## 이번 세션에서 실제 반영된 파일
- `.gitignore`
- `lib/repositories/curriculum-repository.ts`
- `lib/repositories/term-repository.ts`
- `package.json`
- `prisma/schema.prisma`
- `middleware.ts` (최종 삭제)
- `vercel.json` (신규)

## 다음 세션에서 바로 할 일 (우선순위)
1. 보안 헤더 복구
- 현재 `middleware.ts`를 삭제해 서비스 안정화만 우선 적용됨
- 필요 시 `vercel.json > headers` 방식으로 단계적 복구 권장

2. Next.js 버전 업데이트 검토
- 배포 로그에 `next@14.2.5` 보안 취약 경고 노출됨
- 패치 버전 업 후 재배포 권장

3. Vercel 설정 점검
- Project Settings에서 Framework가 Next.js로 유지되는지 확인
- Deployment Protection / Authentication 정책 확인 (필요 시 공개 접근 정책 재점검)

## 재현/점검 커맨드
- 빌드: `npm.cmd run build`
- Prisma generate: `npm.cmd run prisma:generate`
- Git 상태: `git status -sb`
- Vercel 배포: `npx.cmd vercel --prod --yes --public`
- 배포 확인: `curl.exe -I https://domeineduplatform.vercel.app`

## 참고
- 일부 Git 명령은 일반 권한에서 객체 접근 오류(권한/소유권 이슈)가 있었고, 관리자 권한으로는 정상 동작함.
- 동일 증상 재발 시 관리자 권한 터미널에서 `git fsck --full` 먼저 확인.
