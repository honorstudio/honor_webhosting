'use client';

import { usePathname, useRouter, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

interface SiteInfo {
  id: string;
  name: string;
  slug: string;
  domain: string;
}

interface UserProfile {
  id: string;
  role: 'admin' | 'user';
}

/**
 * 사이트 관리 페이지 레이아웃
 * 좌측 사이드바와 우측 콘텐츠 영역으로 구성
 * 동적 slug를 사용하여 각 사이트별 관리 페이지 제공
 */
export default function ManageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const params = useParams();
  const slug = params.slug as string;

  const [siteInfo, setSiteInfo] = useState<SiteInfo | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkAuthAndLoadData();
  }, [slug]);

  // 인증 확인 및 데이터 로드
  const checkAuthAndLoadData = async () => {
    const supabase = createClient();

    // 세션 확인
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      // 인증되지 않은 사용자는 로그인 페이지로 리다이렉트
      // 커스텀 도메인에서 접속한 경우 /manage로 리다이렉트 (middleware가 처리)
      // 기본 도메인에서 접속한 경우 전체 경로 사용
      const isCustomDomain = !window.location.hostname.includes('localhost') &&
                              !window.location.hostname.includes('vercel.app') &&
                              !window.location.hostname.includes('127.0.0.1');
      const redirectPath = isCustomDomain ? '/manage' : `/sites/${slug}/manage`;
      router.push(`/login?redirect=${encodeURIComponent(redirectPath)}`);
      return;
    }

    setIsAuthenticated(true);
    await Promise.all([loadSiteInfo(), loadUserProfile()]);
  };

  // 사이트 정보 로드
  const loadSiteInfo = async () => {
    const supabase = createClient();

    const { data: site, error } = await supabase
      .from('sites')
      .select('id, name, slug, domain')
      .eq('slug', slug)
      .single();

    if (error || !site) {
      console.error('사이트 정보 로드 실패:', error);
      router.push('/manage');
      return;
    }

    setSiteInfo(site);
    setIsLoading(false);
  };

  // 사용자 프로필 로드
  const loadUserProfile = async () => {
    const supabase = createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: profile } = await supabase
      .from('profiles')
      .select('id, role')
      .eq('id', user.id)
      .single();

    if (profile) {
      setUserProfile(profile as UserProfile);
    }
  };

  // 어드민 여부 확인
  const isAdmin = userProfile?.role === 'admin';

  // 메뉴 항목 정의
  const menuItems = [
    {
      label: '일반 설정',
      path: `/sites/${slug}/manage/settings`,
      description: '로고, 브랜드 컬러, 연락처 설정',
    },
    {
      label: '상담 관리',
      path: `/sites/${slug}/manage/consultations`,
      description: '상담 문의 내역 관리',
    },
    {
      label: '회원 관리',
      path: `/sites/${slug}/manage/members`,
      description: '회원 목록 및 관리',
    },
    {
      label: '게시물 관리',
      path: `/sites/${slug}/manage/posts`,
      description: '게시물 목록 및 관리',
    },
    {
      label: '디자인 설정',
      path: `/sites/${slug}/manage/design`,
      description: '섹션 및 디자인 관리',
    },
  ];

  // 현재 활성 메뉴 확인
  const isActive = (path: string) => {
    if (path === `/sites/${slug}/manage`) {
      return pathname === path;
    }
    return pathname.startsWith(path);
  };

  // 대시보드로 돌아가기
  const handleBackToDashboard = () => {
    router.push('/manage');
  };

  // 로그아웃
  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
  };

  // 로딩 중이거나 인증되지 않은 경우 로딩 화면 표시
  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-foreground-muted">로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* 좌측 사이드바 */}
      <aside className="w-64 bg-surface border-r border-border flex flex-col">
        {/* 헤더 */}
        <div className="p-6 border-b border-border">
          {isAdmin && (
            <button
              onClick={handleBackToDashboard}
              className="mb-4 text-sm text-foreground-muted hover:text-foreground transition-colors"
            >
              ← 대시보드로
            </button>
          )}
          <h2 className="text-lg font-semibold text-foreground">
            {siteInfo?.name || '사이트'} 관리
          </h2>
          <p className="text-sm text-foreground-muted mt-1">
            {siteInfo?.domain || slug}
          </p>
        </div>

        {/* 메뉴 목록 */}
        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.path}
              onClick={() => router.push(item.path)}
              className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                isActive(item.path)
                  ? 'bg-foreground text-background'
                  : 'text-foreground hover:bg-background'
              }`}
            >
              <div className="font-medium text-sm">{item.label}</div>
              <div
                className={`text-xs mt-1 ${
                  isActive(item.path)
                    ? 'text-background/70'
                    : 'text-foreground-muted'
                }`}
              >
                {item.description}
              </div>
            </button>
          ))}
        </nav>

        {/* 푸터 정보 */}
        <div className="p-4 border-t border-border">
          <button
            onClick={handleLogout}
            className="w-full text-left text-sm text-foreground-muted hover:text-foreground transition-colors mb-2"
          >
            로그아웃
          </button>
          <p className="text-xs text-foreground-muted">Honor Webhosting</p>
          <p className="text-xs text-foreground-muted mt-1">v1.0.0</p>
        </div>
      </aside>

      {/* 우측 콘텐츠 영역 */}
      <main className="flex-1 overflow-auto">
        <div className="max-w-5xl mx-auto p-8">{children}</div>
      </main>
    </div>
  );
}
