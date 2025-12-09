import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

// 동적 렌더링 강제
export const dynamic = 'force-dynamic';

// 위생산업 랜딩 페이지 템플릿
import OnulHygieneTemplate from '../../_templates/onul/versions/hygiene';

/**
 * 페이지 메타데이터 생성
 */
export async function generateMetadata({
  params
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params;

  // onul 사이트만 지원
  if (slug !== 'onul') {
    return {
      title: '페이지를 찾을 수 없습니다',
    };
  }

  return {
    title: '오늘 위생산업 | 타투·반영구 바늘 폐기 솔루션',
    description: '한국 최초의 타투·반영구 전문 바늘 폐기 솔루션. 전용 수거함 무료 제공, 정기 수거 서비스, 위생 관리 리포트를 통해 안전한 위생 관리를 시작하세요.',
    openGraph: {
      title: '오늘 위생산업 | 타투·반영구 바늘 폐기 솔루션',
      description: '한국 최초의 타투·반영구 전문 바늘 폐기 솔루션. 타투는 예술이지만, 바늘은 잠재적 위험물입니다.',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: '오늘 위생산업 | 타투·반영구 바늘 폐기 솔루션',
      description: '한국 최초의 타투·반영구 전문 바늘 폐기 솔루션',
    },
  };
}

/**
 * 오늘 위생산업 인덱스 페이지
 * app.onul.day/index 경로에서 접근
 */
export default async function OnulIndexPage({
  params
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  // onul 사이트만 지원
  if (slug !== 'onul') {
    notFound();
  }

  return <OnulHygieneTemplate />;
}
