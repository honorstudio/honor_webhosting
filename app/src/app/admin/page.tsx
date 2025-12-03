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
}

/**
 * 관리자 대시보드 페이지
 * admin 역할을 가진 사용자만 접근 가능
 * 모든 웹사이트 목록을 표시하고 관리
 */
export default function AdminPage() {
  const router = useRouter();
  const [sites, setSites] = useState<Site[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userEmail, setUserEmail] = useState('');

  useEffect(() => {
    checkAuthAndLoadSites();
  }, []);

  // 인증 확인 및 사이트 목록 로드
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

    // 사용자 프로필에서 역할 확인
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    // admin이 아니면 /manage로 리다이렉트
    if (!profile || profile.role !== 'admin') {
      router.push('/manage');
      return;
    }

    // 모든 사이트 목록 가져오기
    const { data: sitesData, error } = await supabase
      .from('sites')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('사이트 목록 로드 실패:', error);
    } else {
      setSites(sitesData || []);
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
            <h1 className="text-xl font-semibold text-foreground">
              Honor Webhosting
            </h1>
            <p className="text-sm text-foreground-muted mt-1">
              관리자 대시보드
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
        {/* 페이지 제목 및 새 사이트 추가 버튼 */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-foreground mb-2">
              전체 웹사이트 관리
            </h2>
            <p className="text-foreground-muted">
              현재 {sites.length}개의 웹사이트가 등록되어 있습니다
            </p>
          </div>

          <button className="px-6 py-3 bg-foreground text-background font-medium rounded-lg transition-colors hover:bg-foreground-muted">
            새 사이트 추가
          </button>
        </div>

        {/* 웹사이트 목록 */}
        {sites.length > 0 ? (
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
        ) : (
          // 사이트가 없을 때
          <div className="bg-surface border border-border rounded-lg p-12 text-center">
            <p className="text-foreground-muted mb-4">
              등록된 웹사이트가 없습니다
            </p>
            <button className="px-6 py-3 bg-foreground text-background font-medium rounded-lg transition-colors hover:bg-foreground-muted">
              첫 번째 웹사이트 추가하기
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
