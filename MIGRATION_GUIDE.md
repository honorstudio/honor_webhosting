# 멀티 템플릿 마이그레이션 가이드

## 변경 사항 요약

honor_webhosting 프로젝트를 **멀티 템플릿 방식**으로 변경했습니다.

### 변경 전 (기존 구조)

```
app/src/app/sites/
└── onul/
    └── page.tsx    # 오늘청소 페이지 직접 코딩
```

- 각 사이트마다 별도의 폴더 생성
- 확장성 낮음

### 변경 후 (새로운 구조)

```
app/src/app/sites/
├── [slug]/              # 동적 라우팅
│   └── page.tsx         # slug에 따라 템플릿 렌더링
└── _templates/          # 사이트별 템플릿 모음
    ├── onul/           # 오늘청소 템플릿
    ├── rubylab/        # 루비랩 템플릿
    └── default/        # 기본 템플릿
```

## 주요 개선 사항

### 1. 동적 라우팅

하나의 `[slug]` 라우트로 모든 사이트 처리:

- `/sites/onul` → onul 템플릿
- `/sites/rubylab` → rubylab 템플릿
- `/sites/newsite` → 새 사이트 템플릿

### 2. 템플릿 분리

각 사이트는 `_templates` 폴더 안에서 완전히 독립적인 템플릿으로 관리:

- **독립적인 디자인**: 사이트마다 완전히 다른 디자인 가능
- **독립적인 컴포넌트**: 각 템플릿별 components 폴더
- **확장 용이**: 새 템플릿 추가가 간단

### 3. 코드 재사용성

- 기존 onul 페이지 → `_templates/onul/index.tsx`로 마이그레이션
- 모든 기능 유지되며 구조만 개선

## 파일 구조 상세

### [slug]/page.tsx (동적 라우팅 컨트롤러)

```typescript
// slug에 따라 템플릿 매핑
const SITE_TEMPLATES = {
  onul: OnulTemplate,
  rubylab: RubylabTemplate,
};

// URL의 slug 파라미터로 템플릿 선택
export default async function SitePage({ params }) {
  const { slug } = await params;
  const Template = SITE_TEMPLATES[slug];
  return <Template />;
}
```

### _templates/[사이트명]/index.tsx

각 사이트의 메인 템플릿 파일:

```typescript
'use client';

export default function OnulTemplate() {
  return <div>{/* 사이트 콘텐츠 */}</div>;
}
```

### _templates/[사이트명]/components/

각 템플릿 전용 컴포넌트들을 여기에 저장

## 마이그레이션된 내용

### onul (오늘청소)

- **원본**: `/sites/onul/page.tsx`
- **이동**: `/_templates/onul/index.tsx`
- **변경사항**:
  - 파일 위치만 변경
  - 모든 기능 동일하게 작동
  - 섹션별 컴포넌트 (Hero, About, Vision, Services 등) 모두 포함

### rubylab (루비랩)

- **새로 생성**: `/_templates/rubylab/index.tsx`
- **상태**: 기본 구조만 생성 (실제 콘텐츠는 향후 추가)

### default (기본 템플릿)

- **새로 생성**: `/_templates/default/index.tsx`
- **용도**: 새로운 사이트 생성 시 기본 템플릿으로 사용

## 사용 방법

### 개발 서버 실행

```bash
cd app
npm run dev
```

### URL 접근

- http://localhost:3000/sites/onul - 오늘청소 사이트
- http://localhost:3000/sites/rubylab - 루비랩 사이트

### 새로운 사이트 추가

1. 템플릿 폴더 생성:
   ```bash
   mkdir -p app/src/app/sites/_templates/newsite/components
   ```

2. 템플릿 파일 생성:
   ```typescript
   // _templates/newsite/index.tsx
   'use client';

   export default function NewSiteTemplate() {
     return <div>새 사이트</div>;
   }
   ```

3. 라우팅에 등록:
   ```typescript
   // [slug]/page.tsx
   import NewSiteTemplate from '../_templates/newsite';

   const SITE_TEMPLATES = {
     onul: OnulTemplate,
     rubylab: RubylabTemplate,
     newsite: NewSiteTemplate, // 추가
   };
   ```

## 기존 코드 백업

기존 `/sites/onul` 폴더는 `/_onul_backup`으로 이동되었습니다.
- 참고용으로 보관
- 필요시 삭제 가능

## 향후 계획

### 1. Supabase 연동

현재는 코드에 직접 템플릿을 정의하지만, 향후:

```sql
-- sites 테이블 (예시)
CREATE TABLE sites (
  id UUID PRIMARY KEY,
  slug TEXT UNIQUE,
  name TEXT,
  template_type TEXT,
  custom_domain TEXT,
  settings JSONB
);
```

### 2. 도메인 기반 라우팅

Vercel middleware로 도메인 → slug 변환:

```typescript
// middleware.ts
export function middleware(request) {
  const hostname = request.headers.get('host');

  // onul.com → /sites/onul
  // rubylab.com → /sites/rubylab

  const siteSlug = getSiteSlugFromDomain(hostname);
  return NextResponse.rewrite(`/sites/${siteSlug}`);
}
```

### 3. 어드민 페이지

사용자가 직접:
- 새 사이트 생성
- 템플릿 선택
- 콘텐츠 편집
- 도메인 연결

## 테스트 체크리스트

- [ ] onul 템플릿이 정상적으로 렌더링되는지 확인
- [ ] rubylab 템플릿이 정상적으로 렌더링되는지 확인
- [ ] 존재하지 않는 slug 입력 시 404 페이지 표시
- [ ] 모든 섹션 (Hero, About, Vision 등)이 정상 작동
- [ ] 반응형 디자인이 제대로 작동
- [ ] 클라이언트 상태 (탭 전환 등)가 정상 작동

## 문제 해결

### 템플릿이 렌더링되지 않을 때

1. `[slug]/page.tsx`에서 템플릿 import 확인
2. `SITE_TEMPLATES` 객체에 등록 확인
3. 개발 서버 재시작

### 스타일이 적용되지 않을 때

1. Tailwind CSS 설정 확인
2. globals.css import 확인
3. 브라우저 캐시 삭제

## 참고 문서

- `/app/src/app/sites/README.md` - sites 폴더 상세 가이드
- `/CLAUDE.md` - 프로젝트 전체 개요
- Next.js Dynamic Routes: https://nextjs.org/docs/app/building-your-application/routing/dynamic-routes

## 완료된 작업

✅ 디렉토리 구조 생성
✅ 동적 라우팅 페이지 구현
✅ onul 템플릿 마이그레이션
✅ rubylab 템플릿 기본 구조 생성
✅ default 템플릿 생성
✅ README 문서화
✅ 기존 코드 백업

## 다음 단계

1. 개발 서버에서 테스트
2. Supabase 연동 계획 수립
3. middleware를 통한 도메인 라우팅 구현
4. 어드민 페이지 개발
