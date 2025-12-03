# Sites - 멀티 템플릿 시스템

이 디렉토리는 멀티 사이트 호스팅을 위한 템플릿 시스템입니다.

## 디렉토리 구조

```
sites/
├── [slug]/           # 동적 라우팅
│   └── page.tsx      # slug에 따라 템플릿 렌더링
└── _templates/       # 사이트별 템플릿 모음
    ├── onul/         # 오늘청소 템플릿
    │   ├── index.tsx
    │   └── components/
    ├── rubylab/      # 루비랩 템플릿
    │   ├── index.tsx
    │   └── components/
    └── default/      # 기본 템플릿
        ├── index.tsx
        └── components/
```

## 동작 방식

### 1. URL 구조

- `/sites/onul` → 오늘청소 템플릿 렌더링
- `/sites/rubylab` → 루비랩 템플릿 렌더링
- `/sites/newsite` → 새로운 사이트 템플릿 렌더링

### 2. 템플릿 매핑

`[slug]/page.tsx`에서 slug 값을 받아 해당하는 템플릿을 렌더링합니다.

```typescript
const SITE_TEMPLATES = {
  onul: OnulTemplate,
  rubylab: RubylabTemplate,
};
```

### 3. 템플릿 특징

- **완전히 독립적**: 각 템플릿은 고유한 디자인과 기능 보유
- **컴포넌트 분리**: 각 템플릿별로 components 폴더에 전용 컴포넌트 저장
- **확장 가능**: 새로운 사이트 추가가 간단

## 새로운 사이트 추가하기

### 1단계: 템플릿 폴더 생성

```bash
mkdir -p app/src/app/sites/_templates/newsite/components
```

### 2단계: 템플릿 컴포넌트 생성

`_templates/newsite/index.tsx` 파일 생성:

```typescript
'use client';

export default function NewSiteTemplate() {
  return (
    <div className="min-h-screen">
      {/* 사이트 콘텐츠 */}
    </div>
  );
}
```

### 3단계: 템플릿 매핑에 추가

`[slug]/page.tsx`의 `SITE_TEMPLATES` 객체에 추가:

```typescript
import NewSiteTemplate from '../_templates/newsite';

const SITE_TEMPLATES = {
  onul: OnulTemplate,
  rubylab: RubylabTemplate,
  newsite: NewSiteTemplate, // 새로 추가
};
```

## 실제 사용 시나리오

### 개발 환경

로컬에서 테스트:
- http://localhost:3000/sites/onul
- http://localhost:3000/sites/rubylab

### 프로덕션 환경 (계획)

Vercel middleware를 통해 도메인 기반 라우팅:
- onul.com → `/sites/onul` 렌더링
- rubylab.com → `/sites/rubylab` 렌더링

## 데이터 관리 (향후 계획)

현재는 코드에 직접 템플릿을 정의하지만, 향후 Supabase를 통해:

1. **사이트 정보 저장**
   - 사이트 이름, slug, 템플릿 타입
   - 메타데이터 (title, description, favicon)

2. **동적 콘텐츠 관리**
   - 각 사이트별 텍스트, 이미지, 설정
   - 사용자가 어드민에서 직접 편집 가능

3. **도메인 매핑**
   - 사이트별 커스텀 도메인 연결
   - middleware에서 도메인 → slug 변환

## 주의사항

- `_templates` 폴더는 Next.js가 라우트로 인식하지 않음 (언더스코어로 시작)
- 각 템플릿은 `'use client'` 선언 필요 (클라이언트 컴포넌트)
- 템플릿별로 완전히 다른 스타일/라이브러리 사용 가능

## 기존 코드 마이그레이션

기존 `/sites/onul/page.tsx`는 이제 `/sites/_templates/onul/index.tsx`로 이동되었습니다.
기존 코드는 참고용으로 보관하거나 삭제할 수 있습니다.
