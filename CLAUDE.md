# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 프로젝트 개요

**Honor Webhosting** - 웹 호스팅 관리 도구

여러 의뢰받은 웹사이트를 하나의 플랫폼에서 관리하는 웹 호스팅 서비스.

## 핵심 목표

1. **멀티 사이트 관리**: 하나의 앱에서 여러 클라이언트 웹사이트 운영
2. **멀티 도메인 지원**: 각 도메인별로 해당 사이트 콘텐츠 제공
3. **어드민 페이지**: 사용자가 계정 등록 후 직접 사이트 관리

## 기술 스택

- **프레임워크**: Next.js 16 (App Router, TypeScript)
- **스타일링**: Tailwind CSS 4
- **배포**: Vercel
- **백엔드/DB/인증**: Supabase
- **테스트**: Playwright (MCP 도구 사용)

## 프로젝트 구조

```
honor_webhosting/
├── app/                    # Next.js 메인 애플리케이션
│   └── src/app/           # App Router 페이지
└── onul/                  # 기존 프로젝트 (참고용)
    └── final/             # 리디자인 기반 섹션 파일들
```

## 아키텍처 (계획)

```
┌─────────────────────────────────────────┐
│           Vercel (하나의 앱)              │
├─────────────────────────────────────────┤
│  clientA.com ──→ 사이트 A 콘텐츠         │
│  clientB.com ──→ 사이트 B 콘텐츠         │
│  admin.honor.com ──→ 어드민 대시보드      │
└─────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────┐
│              Supabase                    │
│  - 사용자 인증 (Auth)                    │
│  - 사이트별 콘텐츠 (Database)            │
│  - 이미지/파일 (Storage)                 │
└─────────────────────────────────────────┘
```

## 멀티 도메인 처리 방식

Vercel middleware를 통해 요청 도메인을 감지하고 해당 사이트 콘텐츠 제공:

```typescript
// middleware.ts 예시
export function middleware(request) {
  const hostname = request.headers.get('host')
  // hostname 기반으로 사이트 식별 → Supabase에서 해당 사이트 데이터 로드
}
```

## 개발 명령어

```bash
# app 디렉토리에서 실행
cd app

# 의존성 설치
npm install

# 개발 서버 실행
npm run dev

# 프로덕션 빌드
npm run build

# 린트 검사
npm run lint
```

## 테스트

Playwright 테스트 시 npx 명령어 대신 MCP 도구 사용:
- `mcp__playwright__browser_navigate`
- `mcp__playwright__browser_click`
- `mcp__playwright__browser_snapshot` 등
