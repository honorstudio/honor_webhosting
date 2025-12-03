# 오늘청소 웹사이트 v2 - 리디자인 버전

## 버전 정보
- **버전**: v2
- **생성일**: 2024-11-25
- **상태**: 완료

## 개요
v1 템플릿을 기반으로 더 트렌디하고 깔끔하며 일관성 있는 디자인으로 재구성한 버전입니다.
사용자 경험을 개선하고 브랜드 정체성을 강화하는 데 중점을 두었습니다.

## 주요 개선사항

### 1. 스티키 네비게이션 바
- **위치**: 상단 고정
- **동작**: 스크롤 시 배경이 투명에서 블러 처리된 흰색으로 변경
- **효과**: 그림자 효과로 깊이감 부여
- **메뉴**: 기업소개, 서비스, 문의하기 + CTA 버튼
- **모바일**: 햄버거 메뉴로 전환 (768px 이하)

### 2. 디자인 시스템

#### 색상 팔레트 (무채색 기반)
- **주요색**: 흰색 (#FFFFFF), 검정 (#000000)
- **그레이 계열**: gray-50, gray-100, gray-200, gray-700, gray-900
- **포인트 컬러**: blue-600 (#2563EB) - 버튼, 링크
- **보조 컬러**:
  - red-600 (고객중심)
  - blue-600 (전문성)
  - green-600 (친환경)
  - amber-800 (사회공헌)

#### 타이포그래피
- **제목 (Hero)**: 4xl~6xl (36px~60px), bold
- **섹션 제목**: 4xl~5xl (36px~48px), bold
- **본문**: lg~xl (18px~20px), regular
- **작은 텍스트**: sm~base (14px~16px)

#### 간격 시스템 (8px 기준)
- **섹션 패딩**: py-24 (96px), px-6 (24px) ~ px-12 (48px)
- **요소 간격**: gap-4 (16px), gap-8 (32px), gap-12 (48px), gap-16 (64px)
- **컨테이너**: max-w-7xl (1280px)

### 3. 섹션별 개선

#### Hero Section
- 블루 계열 그라디언트 배경 (from-blue-900 via-blue-950 to-black)
- 반투명 로고 워터마크 (opacity-20)
- 명확한 CTA 버튼 (흰색, 둥근 모서리)
- 부드러운 호버 애니메이션 (translate-y, shadow)

#### About Section
- 2단 레이아웃 (텍스트 + 이미지 갤러리)
- 이미지: 3x3 그리드, 둥근 모서리 (rounded-2xl)
- 호버 효과: scale-105 transition
- 실제 이미지 URL 적용

#### Vision Section
- 회색 배경 (bg-gray-50)으로 섹션 구분
- 카드형 디자인 (rounded-2xl, shadow)
- 호버 시 그림자 강화 (hover:shadow-xl)

#### Services Section
- 탭 UI: 5개 탭 (상가/가정/공장/특수/기타)
- 활성 탭: 검은 배경 + 흰색 텍스트
- 비활성 탭: 흰색 배경 + 회색 텍스트, 호버 효과
- 콘텐츠: 2단 레이아웃 (설명 + 이미지)
- 실제 서비스 이미지 적용

#### Care Section
- 3개 카드 그리드 (냉난방기/공조기/해충방역)
- 이미지 오버레이: 그라디언트 + 아이콘
- 호버 효과: 그라디언트 투명도 변경
- 실제 서비스 이미지 적용

#### Biz Section
- 어두운 배경 (bg-gray-900)
- 무한 스크롤 로고 슬라이더
- 3세트 복제로 부드러운 무한 스크롤
- 호버 시 애니메이션 일시정지
- 실제 파트너 로고 적용

#### People Section
- 2단 분할 레이아웃 (그라디언트 + 배경색)
- 왼쪽: 진한 블루 그라디언트
- 오른쪽: 연한 회색 + 아이콘 워터마크

#### Education Section
- 둥근 모서리 섹션 (rounded-3xl)
- 배경 이미지 + 오버레이 (bg-black/50)
- 인터랙티브 원형 버튼 (기본기/심화)
- 호버 애니메이션 (scale-90 / scale-110)

#### Building Care Section
- 측면 탭 UI (데스크톱), 상단 탭 (모바일)
- 배경 이미지 + 반투명 카드 (backdrop-blur)
- 실제 배경 이미지 적용 (Unsplash)

#### Footer Section
- 어두운 배경 (bg-gray-900)
- 2단 레이아웃 (회사정보 + 빠른메뉴)
- 아이콘 + 텍스트 조합
- 연락처 정보 표시

### 4. 애니메이션 및 인터랙션

#### 공통 Transition
- `transition-all duration-300`: 기본 전환
- `transition-colors`: 색상 변경
- `transition-transform`: 변형 효과
- `transition-shadow`: 그림자 효과

#### 호버 효과
- **버튼**: -translate-y-0.5 + shadow-lg
- **카드**: -translate-y-1 + shadow-xl 또는 scale-105
- **탭**: bg-gray-50 (비활성 상태)
- **링크**: text-blue-600

#### 스크롤 애니메이션
- 네비게이션 바: 배경색 + 블러 + 그림자
- 로고 슬라이더: 60초 무한 스크롤

### 5. 반응형 디자인

#### 브레이크포인트
- **모바일**: 기본 (0~767px)
- **태블릿**: md (768px~)
- **데스크톱**: lg (1024px~)

#### 주요 반응형 처리
- **네비게이션**: 데스크톱 메뉴 ↔ 모바일 햄버거
- **그리드**: lg:grid-cols-2, md:grid-cols-3, grid-cols-1
- **패딩**: px-6 md:px-12, py-12 md:py-24
- **폰트 크기**: text-4xl md:text-5xl lg:text-6xl
- **탭 레이아웃**: 수평 ↔ 수직 전환

### 6. 접근성 개선
- 의미있는 HTML 태그 사용 (nav, section, footer)
- alt 텍스트 제공
- 키보드 네비게이션 지원
- 명확한 포커스 상태
- 충분한 색상 대비

### 7. 성능 최적화
- 이미지 lazy loading 준비
- CSS-in-JS 대신 Tailwind 사용 (작은 번들 크기)
- 애니메이션 GPU 가속 (transform, opacity)

## 기술 스택
- **React**: 18.x
- **Next.js**: App Router
- **TypeScript**: 타입 안정성
- **Tailwind CSS**: 유틸리티 우선 CSS
- **Lucide Icons**: 경량 아이콘 라이브러리

## 파일 구조
```
v2/
├── index.tsx         # 메인 컴포넌트
└── VERSION.md        # 이 문서
```

## 사용 방법
```tsx
import OnulTemplateV2 from '@/app/sites/_templates/onul/versions/v2';

export default function Page() {
  return <OnulTemplateV2 />;
}
```

## v1 대비 변경사항 요약

| 항목 | v1 | v2 |
|------|----|----|
| 네비게이션 | 없음 | 스티키 네비게이션 바 |
| 색상 시스템 | 다양한 색상 | 무채색 기반 + 블루 포인트 |
| 그라디언트 | 많이 사용 | 최소화 (필요한 곳만) |
| 간격 | 일관성 부족 | 8px 단위 시스템 |
| 애니메이션 | 제한적 | 부드러운 전환 효과 |
| 반응형 | 기본 제공 | 모바일 우선 설계 |
| 타이포그래피 | 불규칙 | 명확한 계층 구조 |
| 이미지 | 플레이스홀더 | 실제 이미지 적용 |
| Footer | 단순 | 연락처 + 메뉴 |

## 향후 개선 계획
1. [ ] 다크모드 지원
2. [ ] 스크롤 기반 애니메이션 (Framer Motion)
3. [ ] 이미지 최적화 (Next.js Image)
4. [ ] SEO 메타데이터 추가
5. [ ] 성능 모니터링 (Core Web Vitals)

## 참고 자료
- v1 템플릿: `/versions/v1/index.tsx`
- 참고 섹션: `/Users/honorstudio/Desktop/dev/외주/onul/final/section00-08`
- Tailwind CSS: https://tailwindcss.com
- Lucide Icons: https://lucide.dev
