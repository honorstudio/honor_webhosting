import { notFound } from 'next/navigation';

// 동적 렌더링 강제
export const dynamic = 'force-dynamic';

// About 페이지가 있는 템플릿 목록
import OnulAboutPage from '../../_templates/onul/versions/v2/about';

/**
 * 사이트별 About 페이지 매핑
 */
const ABOUT_TEMPLATES = {
  onul: OnulAboutPage,
  // 다른 사이트의 about 페이지도 여기에 추가 가능
} as const;

const VALID_SITES = Object.keys(ABOUT_TEMPLATES);

/**
 * 정적 경로 생성
 */
export function generateStaticParams() {
  return VALID_SITES.map((slug) => ({
    slug,
  }));
}

/**
 * 페이지 메타데이터 생성
 */
export async function generateMetadata({
  params
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params;

  const siteNames: Record<string, string> = {
    onul: '회사소개 | 오늘청소',
  };

  const siteName = siteNames[slug] || '회사소개';

  return {
    title: siteName,
    description: `${siteName} - 기업 소개 페이지`,
  };
}

/**
 * About 페이지
 */
export default async function AboutPage({
  params
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  // slug가 유효한지 확인
  if (!VALID_SITES.includes(slug)) {
    notFound();
  }

  // 해당 slug에 맞는 About 컴포넌트 가져오기
  const AboutComponent = ABOUT_TEMPLATES[slug as keyof typeof ABOUT_TEMPLATES];

  if (!AboutComponent) {
    notFound();
  }

  return <AboutComponent />;
}
