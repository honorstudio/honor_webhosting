'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';

/**
 * 웹사이트 데이터 타입
 */
interface Site {
  id: string;
  name: string;
  slug: string;
  domain: string;
  status: 'active' | 'inactive' | 'maintenance';
  created_at: string;
  updated_at: string;
  owner_id: string;
}

/**
 * 사용자 관리 페이지
 * - admin: 모든 사이트를 보고 관리 가능
 * - user: 본인 사이트만 표시
 * - 사이트가 없으면 "등록된 사이트가 없습니다" 표시
 * - 사이트가 1개 있으면 해당 사이트 관리 페이지로 리다이렉트
 */
export default function ManagePage() {
  const router = useRouter();
  const [sites, setSites] = useState<Site[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userEmail, setUserEmail] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    checkAuthAndLoadSites();
  }, []);

  // 인증 확인 및 사이트 로드
  const checkAuthAndLoadSites = async () => {
    const supabase = createClient();

    // 사용자 정보 확인
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push('/login');
      return;
    }

    setUserEmail(user.email || '');

    // 사용자 역할 확인
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    const userIsAdmin = profile?.role === 'admin';
    setIsAdmin(userIsAdmin);

    // admin이면 모든 사이트, user면 본인 사이트만
    let query = supabase.from('sites').select('*');

    if (!userIsAdmin) {
      query = query.eq('owner_id', user.id);
    }

    const { data: sitesData, error } = await query.order('created_at', { ascending: false });

    if (error) {
      console.error('사이트 목록 로드 실패:', error);
      setIsLoading(false);
      return;
    }

    const userSites = sitesData || [];
    setSites(userSites);

    // 일반 사용자이고 사이트가 1개만 있으면 해당 사이트 관리 페이지로 리다이렉트
    if (!userIsAdmin && userSites.length === 1) {
      router.push(`/sites/${userSites[0].slug}/manage`);
      return;
    }

    setIsLoading(false);
  };

  // 로그아웃
  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
  };

  // 상태 배지 스타일
  const getStatusStyle = (status: Site['status']) => {
    switch (status) {
      case 'active':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'inactive':
        return 'bg-zinc-50 text-zinc-600 border-zinc-200';
      case 'maintenance':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
    }
  };

  const getStatusText = (status: Site['status']) => {
    switch (status) {
      case 'active':
        return '활성';
      case 'inactive':
        return '비활성';
      case 'maintenance':
        return '점검 중';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-foreground-muted">로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* 헤더 */}
      <header className="bg-surface border-b border-border">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-semibold text-foreground">
                Honor Webhosting
              </h1>
              {isAdmin && (
                <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs font-medium rounded">
                  Admin
                </span>
              )}
            </div>
            <p className="text-sm text-foreground-muted mt-1">
              {isAdmin ? '전체 사이트 관리' : '내 웹사이트 관리'}
            </p>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-sm text-foreground-muted">{userEmail}</span>
            <button
              onClick={handleLogout}
              className="px-4 py-2 border border-border rounded-lg text-sm font-medium text-foreground hover:bg-background transition-colors"
            >
              로그아웃
            </button>
          </div>
        </div>
      </header>

      {/* 메인 콘텐츠 */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {sites.length > 0 ? (
          <>
            {/* 페이지 제목 */}
            <div className="mb-8 flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-semibold text-foreground mb-2">
                  {isAdmin ? '전체 웹사이트' : '내 웹사이트'}
                </h2>
                <p className="text-foreground-muted">
                  {isAdmin
                    ? `총 ${sites.length}개의 웹사이트가 등록되어 있습니다`
                    : `${sites.length}개의 웹사이트를 관리하고 있습니다`}
                </p>
              </div>
              {isAdmin && (
                <Link
                  href="/manage/sites/new"
                  className="px-4 py-2 bg-foreground text-background text-sm font-medium rounded-lg transition-colors hover:bg-foreground-muted"
                >
                  + 새 사이트 추가
                </Link>
              )}
            </div>

            {/* 웹사이트 목록 */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {sites.map((site) => (
                <div
                  key={site.id}
                  className="bg-surface border border-border rounded-lg p-6 hover:border-border-strong transition-colors"
                >
                  {/* 사이트명 및 상태 */}
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-foreground mb-1">
                        {site.name}
                      </h3>
                      <p className="text-sm text-foreground-muted">
                        {site.domain}
                      </p>
                    </div>

                    {/* 상태 배지 */}
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusStyle(
                        site.status
                      )}`}
                    >
                      {getStatusText(site.status)}
                    </span>
                  </div>

                  {/* 생성일 및 수정일 */}
                  <div className="pt-4 border-t border-border space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-foreground-muted">생성일</span>
                      <span className="text-foreground">
                        {new Date(site.created_at).toLocaleDateString('ko-KR')}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-foreground-muted">마지막 수정</span>
                      <span className="text-foreground">
                        {new Date(site.updated_at).toLocaleDateString('ko-KR')}
                      </span>
                    </div>
                  </div>

                  {/* 버튼 영역 */}
                  <div className="mt-4 flex gap-3">
                    {/* 열기 버튼 */}
                    <Link
                      href={`/sites/${site.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 py-2 px-4 bg-foreground text-background text-sm font-medium rounded-lg transition-colors hover:bg-foreground-muted text-center"
                    >
                      열기
                    </Link>

                    {/* 관리 버튼 */}
                    <Link
                      href={`/sites/${site.slug}/manage`}
                      className="flex-1 py-2 px-4 border border-border text-foreground text-sm font-medium rounded-lg transition-colors hover:bg-background text-center"
                    >
                      관리
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          // 사이트가 없을 때
          <div className="mt-16">
            <div className="max-w-md mx-auto bg-surface border border-border rounded-lg p-12 text-center">
              <h2 className="text-xl font-semibold text-foreground mb-3">
                {isAdmin ? '등록된 사이트가 없습니다' : '등록된 사이트가 없습니다'}
              </h2>
              <p className="text-foreground-muted mb-6">
                {isAdmin
                  ? '새 사이트를 추가하여 시작하세요'
                  : '관리자에게 사이트 등록을 요청하세요'}
              </p>
              {isAdmin ? (
                <Link
                  href="/manage/sites/new"
                  className="inline-block px-6 py-3 bg-foreground text-background font-medium rounded-lg transition-colors hover:bg-foreground-muted"
                >
                  새 사이트 추가
                </Link>
              ) : (
                <Link
                  href="/"
                  className="inline-block px-6 py-3 border border-border text-foreground font-medium rounded-lg transition-colors hover:bg-background"
                >
                  메인 페이지로 돌아가기
                </Link>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
