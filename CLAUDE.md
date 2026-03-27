# MetaBook — Claude 작업 규칙

## 배포 규칙 (CRITICAL — 절대 준수)

- **배포 = `git push`만. `vercel` 명령어 절대 실행 금지.**
- `vercel deploy`, `vercel --prod`, `vercel` 단독 실행 모두 금지.
- GitHub push 시 Vercel이 자동으로 감지해서 배포함 → 중복 배포 방지.
- 배포 명령 순서: `git add` → `git commit` → `git push` 까지만.
- **사용자가 명시적으로 "배포해"라고 말할 때만 git push 실행.**
- 평소 수정은 로컬(http://localhost:3001)에서 확인. 배포 요청 없으면 push 하지 않음.

## 로컬 개발 환경

- 로컬 주소: http://localhost:3001
- 개발 서버 실행: `npm run dev` (포트 3001)
- 수정 후 로컬에서 확인 → 사용자가 "배포해"라고 할 때만 git push

## 기술 스택

- Framework: Next.js 14 (App Router) + TypeScript
- Styling: Tailwind CSS + OGQ 브랜드 컬러 시스템 (GLOBAL_OGQ_CLAUDE.md 참조)
- State: Zustand + @tanstack/react-query
- Auth: NextAuth.js (Google OAuth)
- AI: Claude API (Streaming SSE)
- DB: mock data (추후 Supabase 연동 예정)

## 코드 규칙

- OGQ 컬러 시스템 사용: `var(--color-primary-500)` 형태 CSS 변수 사용, hex 하드코딩 금지
- 수정 후 반드시 `npx tsc --noEmit` 타입 체크
- 에러 있으면 수정 후 완료 보고
