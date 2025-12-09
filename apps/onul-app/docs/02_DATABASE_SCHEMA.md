# 데이터베이스 스키마 설계

## ERD 개요

```
users (사용자)
    │
    ├── profiles (프로필 상세)
    │
    ├── major_projects (대형 프로젝트) ─────┐
    │       │                              │
    │       └── minor_projects (소형 프로젝트)
    │               │
    │               ├── project_participants (참가자)
    │               │
    │               ├── project_photos (작업 사진)
    │               │
    │               └── chat_messages (채팅)
    │
    └── stores (계약 매장)
            │
            └── store_visits (매장 방문 기록)
```

---

## 테이블 상세

### 1. users (Supabase Auth 연동)
Supabase Auth에서 자동 관리되는 테이블

| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | uuid | PK, 자동생성 |
| email | text | 이메일 |
| created_at | timestamp | 생성일 |

---

### 2. profiles (사용자 프로필)

| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | uuid | PK, users.id 참조 |
| role | enum | 'super_admin', 'project_manager', 'master', 'client' |
| name | text | 이름 |
| phone | text | 전화번호 |
| avatar_url | text | 프로필 이미지 URL |
| bio | text | 자기소개 (마스터용) |
| skills | text[] | 보유 기술 (마스터용) |
| is_active | boolean | 활성 상태 |
| created_at | timestamp | 생성일 |
| updated_at | timestamp | 수정일 |

---

### 3. major_projects (대형 프로젝트)

| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | uuid | PK |
| title | text | 프로젝트 제목 |
| description | text | 상세 설명 |
| client_id | uuid | 클라이언트 (profiles.id) |
| manager_id | uuid | 책임자 (profiles.id) |
| location | text | 위치/주소 |
| status | enum | 'draft', 'recruiting', 'in_progress', 'completed', 'cancelled' |
| scheduled_date | date | 예정일 |
| started_at | timestamp | 실제 시작일 |
| completed_at | timestamp | 완료일 |
| created_at | timestamp | 생성일 |
| updated_at | timestamp | 수정일 |

---

### 4. minor_projects (소형 프로젝트)

| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | uuid | PK |
| major_project_id | uuid | FK → major_projects.id |
| title | text | 구역/작업 이름 |
| description | text | 작업 상세 |
| required_masters | int | 필요 인원 |
| status | enum | 'pending', 'recruiting', 'in_progress', 'review', 'completed' |
| work_scope | text | 작업 범위 |
| notes | text | 특이사항 |
| started_at | timestamp | 시작일 |
| completed_at | timestamp | 완료일 |
| created_at | timestamp | 생성일 |
| updated_at | timestamp | 수정일 |

---

### 5. project_participants (프로젝트 참가자)

| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | uuid | PK |
| minor_project_id | uuid | FK → minor_projects.id |
| master_id | uuid | FK → profiles.id |
| status | enum | 'applied', 'approved', 'rejected', 'withdrawn' |
| applied_at | timestamp | 신청일 |
| approved_at | timestamp | 승인일 |
| notes | text | 메모 |
| created_at | timestamp | 생성일 |

---

### 6. project_photos (프로젝트 사진)

| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | uuid | PK |
| minor_project_id | uuid | FK → minor_projects.id |
| uploader_id | uuid | FK → profiles.id |
| photo_type | enum | 'before', 'after' |
| photo_url | text | 이미지 URL (Storage) |
| work_area | text | 작업 구역 |
| description | text | 사진 설명 |
| created_at | timestamp | 업로드일 |

---

### 7. chat_messages (채팅 메시지)

| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | uuid | PK |
| minor_project_id | uuid | FK → minor_projects.id |
| sender_id | uuid | FK → profiles.id |
| message | text | 메시지 내용 |
| message_type | enum | 'text', 'image', 'system' |
| image_url | text | 이미지 URL (선택) |
| is_read | boolean | 읽음 여부 |
| created_at | timestamp | 전송일 |

---

### 8. stores (계약 매장)

| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | uuid | PK |
| name | text | 매장명 |
| address | text | 주소 |
| contact_name | text | 담당자명 |
| contact_phone | text | 담당자 연락처 |
| contract_type | enum | 'regular', 'one_time' |
| visit_cycle | text | 방문 주기 (예: '매주 월요일') |
| notes | text | 특이사항 |
| is_active | boolean | 활성 상태 |
| created_at | timestamp | 생성일 |
| updated_at | timestamp | 수정일 |

---

### 9. store_visits (매장 방문 기록)

| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | uuid | PK |
| store_id | uuid | FK → stores.id |
| master_id | uuid | FK → profiles.id |
| visit_date | date | 방문일 |
| status | enum | 'scheduled', 'completed', 'cancelled' |
| before_photos | text[] | 비포 사진 URLs |
| after_photos | text[] | 애프터 사진 URLs |
| notes | text | 작업 내용/특이사항 |
| created_at | timestamp | 생성일 |
| updated_at | timestamp | 수정일 |

---

## Enum 타입 정의

```sql
-- 사용자 역할
CREATE TYPE user_role AS ENUM ('super_admin', 'project_manager', 'master', 'client');

-- 대형 프로젝트 상태
CREATE TYPE major_project_status AS ENUM ('draft', 'recruiting', 'in_progress', 'completed', 'cancelled');

-- 소형 프로젝트 상태
CREATE TYPE minor_project_status AS ENUM ('pending', 'recruiting', 'in_progress', 'review', 'completed');

-- 참가 상태
CREATE TYPE participant_status AS ENUM ('applied', 'approved', 'rejected', 'withdrawn');

-- 사진 타입
CREATE TYPE photo_type AS ENUM ('before', 'after');

-- 메시지 타입
CREATE TYPE message_type AS ENUM ('text', 'image', 'system');

-- 계약 타입
CREATE TYPE contract_type AS ENUM ('regular', 'one_time');

-- 방문 상태
CREATE TYPE visit_status AS ENUM ('scheduled', 'completed', 'cancelled');
```

---

## RLS (Row Level Security) 정책 개요

### profiles
- 본인 프로필: 읽기/수정 가능
- 다른 사용자: 기본 정보만 읽기 가능
- super_admin: 모든 프로필 접근 가능

### major_projects / minor_projects
- super_admin, project_manager: 모든 프로젝트 접근
- master: 참가 중인 프로젝트만 접근
- client: 본인이 신청한 프로젝트만 접근

### chat_messages
- 해당 프로젝트 참가자만 읽기/쓰기
- 프로젝트 완료 후: super_admin만 접근

### project_photos
- 해당 프로젝트 참가자: 읽기/쓰기
- client: 본인 프로젝트 사진 읽기만

---

## Storage 버킷 구조

```
supabase-storage/
├── avatars/           # 프로필 이미지
│   └── {user_id}/
│       └── avatar.jpg
│
├── project-photos/    # 프로젝트 사진
│   └── {minor_project_id}/
│       ├── before/
│       │   └── {timestamp}_{uploader_id}.jpg
│       └── after/
│           └── {timestamp}_{uploader_id}.jpg
│
├── chat-images/       # 채팅 이미지
│   └── {minor_project_id}/
│       └── {timestamp}_{sender_id}.jpg
│
└── store-photos/      # 매장 관리 사진
    └── {store_id}/
        └── {visit_id}/
            ├── before/
            └── after/
```
