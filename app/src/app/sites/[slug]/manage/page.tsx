'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect } from 'react';

/**
 * 관리자 페이지 메인 (리다이렉트)
 * /sites/[slug]/manage 접근 시 자동으로 /sites/[slug]/manage/settings로 이동
 */
export default function ManagePage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  useEffect(() => {
    // 일반 설정 페이지로 리다이렉트
    router.replace(`/sites/${slug}/manage/settings`);
  }, [slug, router]);

  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-foreground-muted">로딩 중...</div>
    </div>
  );
}
