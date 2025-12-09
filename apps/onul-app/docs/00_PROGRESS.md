# 개발 진행 상황

## 현재 단계: Phase 4 - 포트폴리오 기능 완료 (100%)

### Phase 2 완료 (100%)

---

## 완료된 작업

### 2024-12-07

#### 1. Expo 프로젝트 초기화
- [x] `create-expo-app` (TypeScript 템플릿) 완료
- [x] 기본 의존성 설치 완료

#### 2. NativeWind + 디자인 시스템 설정
- [x] NativeWind (Tailwind CSS) 설치 및 설정
- [x] tailwind.config.js - 포인트 컬러 #67c0a1 적용
- [x] babel.config.js, metro.config.js 설정
- [x] global.css 생성

#### 3. Expo Router 설정
- [x] expo-router 설치
- [x] app.json 업데이트 (scheme, bundleIdentifier)
- [x] package.json main 엔트리포인트 변경

#### 4. 기본 화면 구현
- [x] 루트 레이아웃 (app/_layout.tsx)
- [x] 웰컴 화면 (app/index.tsx)
- [x] 인증 레이아웃 (app/(auth)/_layout.tsx)
- [x] 로그인 화면 (app/(auth)/login.tsx)
- [x] 회원가입 화면 (app/(auth)/register.tsx)
- [x] 탭 레이아웃 (app/(tabs)/_layout.tsx)
- [x] 대시보드 (app/(tabs)/index.tsx)
- [x] 프로젝트 목록 (app/(tabs)/projects.tsx)
- [x] 매장관리 (app/(tabs)/stores.tsx)
- [x] 채팅 목록 (app/(tabs)/chat.tsx)

#### 5. 설치된 라이브러리
- expo, expo-router, expo-status-bar
- nativewind, tailwindcss
- lucide-react-native (아이콘)
- react-native-svg
- react-native-safe-area-context
- react-native-reanimated
- @supabase/supabase-js
- @react-native-async-storage/async-storage

#### 6. 앱 실행 테스트
- [x] 웹에서 UI 확인 완료
- [x] 스타일 검증 완료
- [x] 포인트 컬러 #67c0a1 적용 확인
- [x] Lucide 아이콘 정상 표시

#### 7. 햄버거 메뉴 추가
- [x] DrawerMenu 컴포넌트 생성
- [x] 탭 레이아웃에 햄버거 아이콘 추가
- [x] 메뉴 항목: 대시보드, 프로젝트, 매장관리, 채팅, 프로필 설정, 앱 설정, 로그아웃

#### 8. Supabase 테이블 생성 (honor-webhosting 프로젝트)
- [x] onul_profiles - 사용자 프로필 (역할: super_admin, project_manager, master, client)
- [x] onul_major_projects - 대형 프로젝트
- [x] onul_minor_projects - 소형 프로젝트
- [x] onul_project_participants - 프로젝트 참가자
- [x] onul_project_photos - 비포/애프터 사진 메타데이터
- [x] onul_chat_messages - 실시간 채팅 (Supabase Realtime 활성화)
- [x] onul_stores - 계약 매장
- [x] onul_store_visits - 매장 방문 기록
- [x] 모든 테이블 RLS 정책 설정 완료

#### 9. 인증 기능 연동
- [x] Supabase 클라이언트 설정 (src/lib/supabase.ts)
- [x] TypeScript 타입 생성 (src/types/database.ts)
- [x] AuthContext 생성 (src/contexts/AuthContext.tsx)
- [x] 로그인 화면 Supabase 연동
- [x] 회원가입 화면 Supabase 연동
- [x] DrawerMenu 사용자 정보 및 로그아웃 연동

#### 10. 프로필 관리 기능
- [x] 프로필 조회 화면 (app/profile/index.tsx)
- [x] 프로필 수정 화면 (app/profile/edit.tsx)
- [x] 마스터 전용 정보 (기술, 자기소개) 표시/수정

#### 11. 대시보드 데이터 연동
- [x] 실제 프로필 데이터 표시
- [x] 마스터 참가 프로젝트 목록 연동
- [x] Pull-to-refresh 기능

#### 12. 프로젝트 CRUD 기능
- [x] 프로젝트 목록 화면 - Supabase 연동 (app/(tabs)/projects.tsx)
- [x] 대형 프로젝트 상세 화면 (app/project/[id].tsx)
- [x] 대형 프로젝트 생성 화면 - 관리자용 (app/project/create.tsx)
- [x] 소형 프로젝트 생성 화면 (app/project/minor/create.tsx)
- [x] 소형 프로젝트 상세 화면 (app/project/minor/[id].tsx)
- [x] 프로젝트 필터링 (전체/모집중/내 신청)
- [x] 관리자 전용 + 버튼 (FAB)

#### 13. 프로젝트 참가 기능
- [x] 마스터 - 소형 프로젝트 신청 기능
- [x] 마스터 - 신청 취소 기능
- [x] 관리자 - 참가 승인/거절 기능
- [x] 참가 상태 표시 (신청중/승인됨/거절됨/취소됨)

#### 14. NAS MinIO 설정 가이드 작성
- [x] docs/05_NAS_MINIO_SETUP.md 작성 완료
- [x] DSM Container Manager에서 MinIO 컨테이너 설정 완료

#### 15. 사진 업로드 기능 (NAS MinIO 사용)
- [x] NAS MinIO 컨테이너 설정 완료 (onul-minio)
  - 엔드포인트: http://192.168.219.105:9000
  - 콘솔: http://192.168.219.105:9001
  - 계정: onuladmin / Honor_2024!
- [x] onul-photos 버킷 생성 완료
- [x] MinIO 클라이언트 설정 (src/lib/minio.ts)
- [x] 사진 업로드 화면 (app/photo/upload.tsx)
- [x] 사진 조회/갤러리 화면 (app/photo/gallery.tsx)
- [x] 비포/애프터 비교 화면 (app/photo/compare.tsx)
- [x] 소형 프로젝트 상세에서 갤러리 버튼 추가

> 참고: UI 및 메타데이터 저장은 완료. NAS MinIO 설정 후 실제 파일 업로드 활성화 필요.

#### 16. 실시간 채팅 기능
- [x] 채팅 목록 화면 - Supabase 연동 (app/(tabs)/chat.tsx)
- [x] 채팅 라우트 레이아웃 (app/chat/_layout.tsx)
- [x] 채팅방 화면 (app/chat/[id].tsx)
- [x] Supabase Realtime 구독
- [x] 메시지 전송/수신
- [x] 채팅 이미지 전송 (NAS MinIO 연동 완료)
  - expo-image-picker 연동
  - 이미지 미리보기 및 취소
  - MinIO 업로드 기능
  - 이미지 메시지 표시
- [x] 읽음 처리 기능
  - onul_chat_read_status 테이블 생성
  - upsert_chat_read_status, get_unread_message_count 함수 생성
  - 채팅방 입장 시 읽음 처리
  - 내 메시지 읽음 상태 표시 (체크 아이콘)
  - 채팅 목록에서 안 읽은 메시지 수 표시

#### 17. 최고 관리자 계정 생성
- [x] designartkor@gmail.com / super_admin 역할

---

#### 18. 클라이언트 화면
- [x] 클라이언트용 대시보드 (app/(tabs)/index.tsx 수정)
- [x] 내 프로젝트 조회 (client_id로 필터링)
- [x] 클라이언트 전용 프로젝트 상세 (app/client/project/[id].tsx)
- [x] 비포/애프터 확인 (기존 photo/compare.tsx 연동)
- [x] 완료 확인 기능 (review → completed 상태 변경)

#### 19. 개발용 뷰 토글 기능
- [x] DevViewContext 생성 (src/contexts/DevViewContext.tsx)
- [x] 루트 레이아웃에 DevViewProvider 추가
- [x] DrawerMenu에 고객뷰/마스터뷰 토글 스위치 추가
- [x] 대시보드에서 effectiveRole 사용하여 뷰 전환
  - 고객뷰 ON: 클라이언트 대시보드 표시
  - 마스터뷰 ON: 마스터 대시보드 표시
  - 둘 다 OFF: 실제 역할(관리자) 대시보드 표시

---

---

## 완료 (Phase 3)

#### 20. 매장 관리 기능
- [x] 매장 목록 화면 연동 (app/(tabs)/stores.tsx)
  - [x] Supabase onul_stores 테이블 연동
  - [x] 매장 필터링 (전체/활성/비활성)
  - [x] Pull-to-refresh 기능
  - [x] 이번 주 방문 일정 표시
  - [x] 관리자 전용 FAB 버튼 (매장 등록)
- [x] 매장 상세 화면 (app/store/[id].tsx)
  - [x] 매장 정보 표시 (주소, 담당자, 연락처, 계약유형, 방문주기)
  - [x] 방문 기록 목록 표시 (상태별 아이콘)
  - [x] 전화 연결 기능
  - [x] 활성화/비활성화 토글
- [x] 매장 등록 화면 (app/store/create.tsx)
  - [x] 매장명, 주소, 담당자, 연락처, 계약유형, 방문주기 입력
  - [x] 관리자 권한 체크
- [x] 매장 수정 화면 (app/store/edit.tsx)
  - [x] 기존 정보 불러오기
  - [x] 매장 삭제 기능
- [x] 방문 기록 등록 화면 (app/store/visit/create.tsx)
  - [x] 방문일, 담당 마스터, 상태, 작업 내용 입력
  - [x] 비포/애프터 사진 업로드 (MinIO 연동)
  - [x] onul_store_visits 테이블 연동

---

## 완료 (Phase 4)

#### 21. 포트폴리오 기능
- [x] 포트폴리오 목록 화면 (app/portfolio/index.tsx)
  - [x] 완료된 프로젝트 자동 조회
  - [x] 비포/애프터 사진 카운트 표시
  - [x] 썸네일 이미지 표시
  - [x] 그리드 레이아웃
  - [x] Pull-to-refresh
- [x] 포트폴리오 상세 화면 (app/portfolio/[id].tsx)
  - [x] 프로젝트 정보 표시
  - [x] 갤러리 보기 모드
  - [x] 비포/애프터 비교 보기 모드
  - [x] 전체 화면 사진 뷰어 (모달)
  - [x] 사진 네비게이션 (좌우 이동)
- [x] 포트폴리오 공유 기능
  - [x] React Native Share API 연동
  - [x] 프로젝트 정보 텍스트 공유
- [x] DrawerMenu에 포트폴리오 메뉴 추가

---

## 진행 예정 (Phase 5)

#### 22. 푸시 알림 (예정)
- [ ] Expo Notifications 설정
- [ ] 알림 발송 로직

---

## 디자인 시스템

```
Primary Color: #67c0a1
Background: #FFFFFF (white)
Surface: #F9FAFB (gray-50)
Border: #E5E7EB (gray-200)
Text: #111827 (gray-900)
Text Muted: #6B7280 (gray-500)
```

## 기술 스택 확정

| 구분 | 기술 |
|------|------|
| 프레임워크 | Expo (SDK 54) |
| 언어 | TypeScript |
| 스타일링 | NativeWind (Tailwind CSS) |
| 아이콘 | Lucide Icons |
| 백엔드 | Supabase |
| 상태관리 | React Context |
| 네비게이션 | Expo Router |

## 파일 구조

```
app/
├── _layout.tsx           # 루트 레이아웃 (AuthProvider)
├── index.tsx             # 웰컴 화면
├── (auth)/
│   ├── _layout.tsx
│   ├── login.tsx
│   └── register.tsx
├── (tabs)/
│   ├── _layout.tsx       # 탭 네비게이션
│   ├── index.tsx         # 대시보드
│   ├── projects.tsx      # 프로젝트 목록
│   ├── stores.tsx        # 매장관리 (Supabase 연동)
│   └── chat.tsx          # 채팅 목록
├── profile/
│   ├── _layout.tsx
│   ├── index.tsx         # 프로필 조회
│   └── edit.tsx          # 프로필 수정
├── project/
│   ├── _layout.tsx
│   ├── [id].tsx          # 프로젝트 상세
│   ├── create.tsx        # 프로젝트 생성
│   └── minor/
│       ├── _layout.tsx
│       ├── create.tsx    # 소형 프로젝트 생성
│       └── [id].tsx      # 소형 프로젝트 상세
├── store/
│   ├── _layout.tsx
│   ├── [id].tsx          # 매장 상세
│   ├── create.tsx        # 매장 등록
│   ├── edit.tsx          # 매장 수정
│   └── visit/
│       └── create.tsx    # 방문 기록 등록
├── chat/
│   ├── _layout.tsx
│   └── [id].tsx          # 채팅방
├── client/
│   └── project/
│       └── [id].tsx      # 클라이언트 프로젝트 상세
└── photo/
    ├── _layout.tsx
    ├── upload.tsx        # 사진 업로드
    ├── gallery.tsx       # 사진 갤러리
    └── compare.tsx       # 비포/애프터 비교

src/
├── lib/
│   ├── supabase.ts       # Supabase 클라이언트
│   └── minio.ts          # NAS MinIO 설정
├── types/
│   └── database.ts       # TypeScript 타입
├── contexts/
│   ├── AuthContext.tsx   # 인증 컨텍스트
│   └── DevViewContext.tsx # 개발용 뷰 모드 컨텍스트
└── components/
    └── DrawerMenu.tsx    # 햄버거 메뉴 (뷰 토글 포함)
```
