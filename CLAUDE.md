# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 프로젝트 개요

**Honor Webhosting** - 웹 호스팅 관리 도구

여러 의뢰받은 웹사이트를 하나의 플랫폼에서 관리하는 웹 호스팅 서비스.
현재 **오늘(Onul)** 프로젝트가 통합되어 있음.

## 핵심 목표

1. **멀티 사이트 관리**: 하나의 앱에서 여러 클라이언트 웹사이트 운영
2. **멀티 도메인 지원**: 각 도메인별로 해당 사이트 콘텐츠 제공
3. **어드민 페이지**: 사용자가 계정 등록 후 직접 사이트 관리

## 기술 스택

- **프레임워크**: Next.js 16 (App Router, TypeScript)
- **스타일링**: Tailwind CSS 4
- **배포**: Vercel (프로젝트: `honor_webhosting`)
- **백엔드/DB/인증**: Supabase (프로젝트 ID: szibgustboctptotffbr)
- **테스트**: Playwright (MCP 도구 사용)

## Vercel 배포 정보

| 항목 | 값 |
|------|-----|
| 프로젝트명 | `honor_webhosting` |
| 팀 | honorstudios-projects |
| GitHub 연동 | https://github.com/honorstudio/honor_webhosting |
| 배포 방식 | Git push 시 자동 배포 |

**연결된 도메인:**
- `onul.day` - 오늘 기업 웹사이트
- `www.onul.day` - 오늘 기업 웹사이트 (www)
- `onulmediclean.com` - 오늘 위생산업 랜딩 페이지 (가비아 DNS)
- `onulmediclean.com/app` - 오늘 앱 (Expo)

## 프로젝트 구조

```
honor_webhosting/
├── app/                        # Next.js 메인 애플리케이션
│   ├── src/app/               # App Router 페이지
│   │   └── sites/[slug]/      # 멀티사이트 라우팅
│   │       ├── app/           # Expo 앱 서빙 (app.onul.day)
│   │       └── index/         # 랜딩 페이지 (app.onul.day/index)
│   └── public/
│       └── _expo/             # Expo 웹 빌드 정적 파일
├── apps/
│   └── onul-app/              # 오늘 앱 (Expo React Native)
│       ├── app/               # Expo Router 페이지
│       ├── src/               # 소스 코드
│       └── docs/              # 앱 문서
└── onul/                      # 기존 프로젝트 (참고용)
```

## 도메인 구조

| 도메인 | 용도 | 라우팅 |
|--------|------|--------|
| `onul.day` | 오늘 기업 웹사이트 | `/sites/onul` |
| `onulmediclean.com` | 오늘 위생산업 랜딩 페이지 | `/sites/onul/index` |
| `onulmediclean.com/app` | 오늘 앱 (Expo) | `/onul-app.html` |

## 아키텍처

```
┌─────────────────────────────────────────┐
│           Vercel (하나의 앱)              │
├─────────────────────────────────────────┤
│  onul.day          ──→ 기업 웹사이트      │
│  onulmediclean.com ──→ 위생산업 랜딩      │
│  onulmediclean.com/app ──→ Expo 앱      │
│  clientX.com       ──→ 다른 클라이언트    │
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

## 개발 명령어

```bash
# Next.js 개발 (app 디렉토리에서)
cd app
npm install
npm run dev
npm run build

# Expo 앱 개발 (apps/onul-app 디렉토리에서)
cd apps/onul-app
npm install
npx expo start --web

# Expo 웹 빌드 후 Next.js에 복사
npx expo export --platform web
cp -r dist/_expo ../app/public/
```

## 배포 절차

### Next.js 배포
Git push 시 Vercel 자동 배포

### Expo 앱 배포 (중요!)

**onulmediclean.com/app**에서 Expo 앱을 서빙하므로, 아래 절차를 정확히 따라야 함:

```bash
# 1. Expo 웹 빌드
cd apps/onul-app
npx expo export --platform web

# 2. 빌드 파일을 두 곳에 복사 (중요!)
cp -r dist/_expo ../app/public/           # /_expo 경로용
cp -r dist/_expo ../app/public/app/       # /app/_expo 경로용 (onulmediclean.com/app에서 필요)

# 3. onul-app.html의 JS 파일명 업데이트
# dist/_expo/static/js/web/ 폴더에서 새 파일명 확인 후
# app/public/onul-app.html의 script src 경로 수정

# 4. Vercel 배포
cd ../app
vercel --prod
```

**주의사항:**
- `onul-app.html`은 `/app/_expo/...` 경로로 정적 파일 참조
- `onulmediclean.com/app` 접속 시 미들웨어가 `/onul-app.html`로 리라이트
- 따라서 `_expo` 폴더가 `public/`와 `public/app/` 두 곳에 있어야 함
- 빌드할 때마다 JS 파일명이 변경되므로 HTML 업데이트 필수

## 테스트

Playwright 테스트 시 npx 명령어 대신 MCP 도구 사용:
- `mcp__playwright__browser_navigate`
- `mcp__playwright__browser_click`
- `mcp__playwright__browser_snapshot` 등

---

# 오늘 앱 (Onul App) 상세

## 개요
청소 서비스(위생 산업) 클라이언트를 위한 프로젝트 관리 앱
- 대형 프로젝트 → 소형 프로젝트 → 참가자 구조
- 프로젝트별 실시간 채팅
- 비포/애프터 사진 관리
- 포트폴리오 축적

## 기술 스택
- **프레임워크**: Expo (React Native)
- **백엔드/DB**: Supabase
- **이미지 저장소**: NAS MinIO

## 이미지 저장 (NAS MinIO)

**중요**: 이미지는 Supabase Storage가 아닌 NAS MinIO에 저장!

| 항목 | 값 |
|------|-----|
| MinIO API | http://192.168.219.105:9000 |
| MinIO Console | http://192.168.219.105:9001 |
| 사용자 이름 | onuladmin |
| 비밀번호 | Honor_2024! |
| 버킷 이름 | onul-photos |

## 주요 사용자 역할
1. **최고 관리자**: 전체 시스템 관리, 마스터 관리
2. **프로젝트 책임자**: 프로젝트 단위 관리, 참가자 승인
3. **마스터(참가자)**: 프로젝트 참여, 작업 수행
4. **클라이언트(사용자)**: 서비스 신청, 진행상황 확인

## 테스트 계정
| 역할 | 이메일 | 비밀번호 |
|------|--------|----------|
| 최고 관리자 | designartkor@gmail.com | honor_2025! |
| 마스터 | master1@test.com | master1234! |
| 클라이언트 | user1@test.com | user1234! |

## 트러블슈팅

### react-native-worklets 오류

`npm install` 후 아래 명령어 추가 실행 필요:
```bash
npm install react-native-worklets@npm:react-native-worklets-core --legacy-peer-deps
```
