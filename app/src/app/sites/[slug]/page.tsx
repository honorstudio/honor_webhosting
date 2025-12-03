import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import type { Metadata } from 'next';

// 동적 렌더링 강제 - Supabase에서 실시간으로 active_version을 가져오기 위함
export const dynamic = 'force-dynamic';

// 템플릿 import
import OnulTemplate from '../_templates/onul';
import RubylabTemplate from '../_templates/rubylab';
import DefaultTemplate from '../_templates/default';

/**
 * 사이트별 템플릿 매핑
 * slug에 따라 어떤 템플릿을 렌더링할지 결정
 */
const SITE_TEMPLATES = {
  onul: OnulTemplate,
  rubylab: RubylabTemplate,
  // 새로운 사이트를 추가할 때는 여기에 추가
  // example: ExampleTemplate,
} as const;

/**
 * 유효한 사이트 slug 목록
 * 실제 환경에서는 Supabase에서 사이트 목록을 가져올 수 있음
 */
const VALID_SITES = Object.keys(SITE_TEMPLATES);

/**
 * 정적 경로 생성
 * 빌드 타임에 미리 생성할 페이지 목록
 */
export function generateStaticParams() {
  return VALID_SITES.map((slug) => ({
    slug,
  }));
}

/**
 * Supabase에서 사이트 메타데이터 가져오기
 */
async function getSiteMetadata(slugOrId: string) {
  const supabase = await createClient();

  let { data: site } = await supabase
    .from('sites')
    .select('name, slug, domain, description, og_image, favicon')
    .eq('slug', slugOrId)
    .single();

  if (!site) {
    const { data: siteById } = await supabase
      .from('sites')
      .select('name, slug, domain, description, og_image, favicon')
      .eq('id', slugOrId)
      .single();
    site = siteById;
  }

  return site;
}

/**
 * 페이지 메타데이터 생성
 */
export async function generateMetadata({
  params
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params;

  // Supabase에서 사이트 정보 가져오기
  const site = await getSiteMetadata(slug);

  // 기본값 설정
  const siteNames: Record<string, string> = {
    onul: '오늘청소 | ONUL',
    rubylab: '루비랩 | Rubylab',
  };

  const siteName = site?.name || siteNames[slug] || '사이트';
  const description = site?.description || `${siteName} 웹사이트`;

  // 메타데이터 객체 생성
  const metadata: Metadata = {
    title: siteName,
    description: description,
  };

  // OG 이미지가 있으면 추가
  if (site?.og_image) {
    metadata.openGraph = {
      title: siteName,
      description: description,
      images: [
        {
          url: site.og_image,
          width: 1200,
          height: 630,
          alt: siteName,
        },
      ],
      type: 'website',
    };
    metadata.twitter = {
      card: 'summary_large_image',
      title: siteName,
      description: description,
      images: [site.og_image],
    };
  }

  // 파비콘이 있으면 추가
  if (site?.favicon) {
    metadata.icons = {
      icon: site.favicon,
      shortcut: site.favicon,
      apple: site.favicon,
    };
  }

  return metadata;
}

/**
 * Supabase에서 사이트 정보 가져오기
 * slug 이름 또는 UUID로 조회 가능
 */
async function getSiteInfo(slugOrId: string) {
  const supabase = await createClient();

  // 먼저 slug로 조회 시도
  let { data: site, error } = await supabase
    .from('sites')
    .select('id, name, slug, domain, active_version, settings')
    .eq('slug', slugOrId)
    .single();

  // slug로 찾지 못하면 UUID(id)로 조회 시도
  if (error || !site) {
    const { data: siteById, error: errorById } = await supabase
      .from('sites')
      .select('id, name, slug, domain, active_version, settings')
      .eq('id', slugOrId)
      .single();

    if (errorById || !siteById) {
      return null;
    }
    site = siteById;
  }

  return site;
}

/**
 * 동적 사이트 페이지
 * URL의 slug 또는 UUID에 따라 해당하는 템플릿을 렌더링
 * Supabase에서 active_version을 조회하여 해당 버전을 렌더링
 *
 * 예시:
 * - /sites/onul → OnulTemplate의 active_version 버전 렌더링
 * - /sites/5c0ffa2f-be92-4e29-895b-68176ebf3b7f → UUID로 사이트 조회 후 해당 템플릿 렌더링
 * - /sites/rubylab → RubylabTemplate 렌더링
 * - /sites/unknown → 404 페이지
 */
export default async function SitePage({
  params,
  searchParams
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ preview?: string }>;
}) {
  const { slug: slugOrId } = await params;
  const { preview } = await searchParams;

  // Supabase에서 사이트 정보 가져오기 (slug 또는 UUID로 조회)
  const siteInfo = await getSiteInfo(slugOrId);

  // 사이트를 찾을 수 없으면 404
  if (!siteInfo) {
    // 기존 방식 호환: VALID_SITES에 있는지 확인
    if (!VALID_SITES.includes(slugOrId)) {
      notFound();
    }
  }

  // 실제 slug 결정 (UUID로 접근했을 경우 Supabase에서 가져온 slug 사용)
  const actualSlug = siteInfo?.slug || slugOrId;

  // 해당 slug에 맞는 템플릿이 있는지 확인
  if (!VALID_SITES.includes(actualSlug)) {
    notFound();
  }

  // 미리보기 버전이 있으면 사용, 없으면 활성 버전 사용
  // Supabase 조회 실패 시 기본값은 v2 (리디자인 버전)
  const version = preview || siteInfo?.active_version || 'v2';

  // 해당 slug에 맞는 템플릿 컴포넌트 가져오기
  const TemplateComponent = SITE_TEMPLATES[actualSlug as keyof typeof SITE_TEMPLATES];

  // 템플릿이 없으면 기본 템플릿 사용
  if (!TemplateComponent) {
    return <DefaultTemplate />;
  }

  // 템플릿 렌더링 (버전 정보 전달)
  return <TemplateComponent version={version} />;
}
