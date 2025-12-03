import { redirect } from 'next/navigation';

/**
 * /sites/[slug]/admin 페이지
 *
 * 커스텀 도메인에서 /admin으로 접속시 이 페이지로 리라이트됨
 * 예: onul.day/admin -> /sites/onul/admin -> /sites/onul/manage로 리다이렉트
 *
 * Vercel 기본 도메인에서도 접근 가능
 * 예: /sites/onul/admin -> /sites/onul/manage로 리다이렉트
 */
export default async function AdminRedirectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  // manage 페이지로 리다이렉트
  redirect(`/sites/${slug}/manage`);
}
