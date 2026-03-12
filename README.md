# MetaBook

김영사/주니어김영사 도서 기반 인터랙티브 독서 플랫폼.
AI 캐릭터 대화, 3D 월드 탐험, 커뮤니티 채팅, 2차 창작, 굿즈 커머스를 지원합니다.

## 기술 스택

- **Framework**: Next.js 14 (App Router) + TypeScript
- **Styling**: Tailwind CSS (OGQ 브랜드 컬러 시스템)
- **State**: Zustand + @tanstack/react-query
- **Auth**: NextAuth.js (Google OAuth)
- **AI**: Claude API (Streaming SSE)
- **DB**: Supabase (PostgreSQL) — 현재 mock data

## 로컬 개발

```bash
# 의존성 설치
npm install

# 환경변수 설정
cp .env.example .env.local
# .env.local 파일을 편집하여 실제 값 입력

# 개발 서버 실행
npm run dev
```

http://localhost:3000 에서 확인

## 환경변수

| 변수 | 필수 | 설명 |
|------|------|------|
| `GOOGLE_CLIENT_ID` | O | Google OAuth Client ID |
| `GOOGLE_CLIENT_SECRET` | O | Google OAuth Client Secret |
| `NEXTAUTH_SECRET` | O | NextAuth 암호화 키 (`openssl rand -base64 32`) |
| `NEXTAUTH_URL` | O | 앱 URL (로컬: `http://localhost:3000`) |
| `ANTHROPIC_API_KEY` | - | Claude API 키 (없으면 mock 응답) |
| `NEXT_PUBLIC_SUPABASE_URL` | - | Supabase 프로젝트 URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | - | Supabase 익명 키 |

## 배포 체크리스트 (Vercel)

### 1. Vercel 프로젝트 설정
- [ ] GitHub 리포지토리 연결
- [ ] Framework Preset: Next.js
- [ ] Node.js 18+ 설정

### 2. 환경변수 등록
- [ ] `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`
- [ ] `NEXTAUTH_SECRET` (production용 새로 생성)
- [ ] `NEXTAUTH_URL` = 배포 도메인 (e.g., `https://metabook.vercel.app`)
- [ ] `ANTHROPIC_API_KEY`

### 3. Google OAuth 콘솔
- [ ] [Google Cloud Console](https://console.cloud.google.com/) → OAuth 2.0 클라이언트 설정
- [ ] 승인된 리디렉션 URI: `https://{도메인}/api/auth/callback/google`
- [ ] 승인된 JavaScript 원본: `https://{도메인}`

### 4. Supabase (DB 연동 시)
- [ ] Supabase 프로젝트 생성
- [ ] RLS 정책 설정
- [ ] 환경변수에 URL + 키 등록

### 5. 배포 후 확인
- [ ] Google 로그인 정상 작동
- [ ] AI 채팅 응답 확인 (Claude API 키 유효성)
- [ ] QR 코드 생성 및 스캔
- [ ] 모바일 레이아웃 (320px~)
- [ ] OG 메타태그 (카카오/슬랙 공유 미리보기)

## 주요 페이지

| 경로 | 설명 |
|------|------|
| `/login` | Google 소셜 로그인 |
| `/onboarding` | 연령 확인 + 장르 선택 + 닉네임 |
| `/library` | 도서 목록 (검색, 필터, 정렬) |
| `/library/[bookId]` | 3패널 독서 뷰 (서재/본문/대화) |
| `/world/[bookId]/[imageId]` | 3D 월드 탐험 |
| `/creations/upload` | 2차 창작 업로드 |
| `/shop/[bookId]` | 굿즈 숍 |
| `/admin` | 관리자 대시보드 |

## 프로젝트 구조

```
src/
├── app/
│   ├── (auth)/        # 로그인, 온보딩
│   ├── (main)/        # 라이브러리, 북 상세, 창작, 굿즈
│   ├── admin/         # 관리자 (6개 모듈)
│   ├── api/           # auth, chat, qr API
│   └── world/         # 3D 월드 뷰어
├── components/
│   ├── panels/        # Left/Center/Right 패널
│   ├── providers/     # Auth, Query 프로바이더
│   └── ui/            # 공통 UI 컴포넌트
├── hooks/             # useAuth
├── lib/               # mock data, auth config
├── store/             # Zustand stores
└── types/             # TypeScript 타입
```
