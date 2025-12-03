# 빠른 시작 가이드

## 멀티 템플릿 시스템 사용하기

### 1. 사이트 접근

개발 서버 실행:
```bash
cd app
npm run dev
```

브라우저에서 접근:
- http://localhost:3000/sites/onul - 오늘청소 사이트
- http://localhost:3000/sites/rubylab - 루비랩 사이트

### 2. 새 사이트 추가 (3단계)

#### 2-1. 템플릿 파일 생성

```bash
# 템플릿 폴더 생성
mkdir -p src/app/sites/_templates/mysite/components

# 템플릿 파일 생성
touch src/app/sites/_templates/mysite/index.tsx
```

#### 2-2. 템플릿 코드 작성

`src/app/sites/_templates/mysite/index.tsx`:

```typescript
'use client';

export default function MySiteTemplate() {
  return (
    <div className="min-h-screen bg-white">
      <section className="p-12">
        <h1 className="text-4xl font-bold">내 사이트</h1>
        <p className="text-lg">내 사이트 콘텐츠</p>
      </section>
    </div>
  );
}
```

#### 2-3. 라우팅 등록

`src/app/sites/[slug]/page.tsx` 파일에서:

```typescript
// 1. import 추가
import MySiteTemplate from '../_templates/mysite';

// 2. SITE_TEMPLATES에 추가
const SITE_TEMPLATES = {
  onul: OnulTemplate,
  rubylab: RubylabTemplate,
  mysite: MySiteTemplate,  // 이 줄 추가
};
```

### 3. 확인

브라우저에서 http://localhost:3000/sites/mysite 접속

## 주요 파일 위치

- **동적 라우팅**: `src/app/sites/[slug]/page.tsx`
- **onul 템플릿**: `src/app/sites/_templates/onul/index.tsx`
- **rubylab 템플릿**: `src/app/sites/_templates/rubylab/index.tsx`
- **기본 템플릿**: `src/app/sites/_templates/default/index.tsx`

## 문서

자세한 내용은 다음 문서를 참고하세요:

- `/MIGRATION_GUIDE.md` - 변경 사항 및 마이그레이션 가이드
- `/PROJECT_STRUCTURE.md` - 전체 프로젝트 구조
- `/app/src/app/sites/README.md` - Sites 시스템 상세 가이드

## 팁

### 템플릿 개발 시 주의사항

1. **'use client' 선언 필수**
   - 모든 템플릿은 클라이언트 컴포넌트여야 함
   - 파일 최상단에 `'use client';` 추가

2. **컴포넌트 분리**
   - 재사용 가능한 부분은 `components/` 폴더로 분리
   - 예: Header, Footer, Section 등

3. **Tailwind CSS 사용**
   - 모든 스타일링은 Tailwind CSS로
   - 커스텀 CSS가 필요하면 globals.css에 추가

### 디버깅

문제가 생기면:
1. 개발 서버 재시작 (`Ctrl+C` 후 `npm run dev`)
2. 브라우저 캐시 삭제
3. import 경로 확인
4. 터미널 에러 메시지 확인
