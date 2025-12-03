'use client';

import { usePathname, useRouter } from 'next/navigation';

/**
 * 관리자 페이지 레이아웃
 * 좌측 사이드바와 우측 콘텐츠 영역으로 구성
 */
export default function ManageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  // 메뉴 항목 정의
  const menuItems = [
    {
      label: '일반 설정',
      path: '/sites/onul/manage',
      description: '도메인 및 사이트 기본 설정',
    },
    {
      label: '회원 관리',
      path: '/sites/onul/manage/members',
      description: '회원 목록 및 관리',
    },
    {
      label: '게시물 관리',
      path: '/sites/onul/manage/posts',
      description: '게시물 목록 및 관리',
    },
    {
      label: '디자인 설정',
      path: '/sites/onul/manage/design',
      description: '섹션 및 디자인 관리',
    },
  ];

  // 현재 활성 메뉴 확인
  const isActive = (path: string) => {
    if (path === '/sites/onul/manage') {
      return pathname === path;
    }
    return pathname.startsWith(path);
  };

  // 대시보드로 돌아가기
  const handleBackToDashboard = () => {
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* 좌측 사이드바 */}
      <aside className="w-64 bg-surface border-r border-border flex flex-col">
        {/* 헤더 */}
        <div className="p-6 border-b border-border">
          <button
            onClick={handleBackToDashboard}
            className="mb-4 text-sm text-foreground-muted hover:text-foreground transition-colors"
          >
            ← 대시보드로
          </button>
          <h2 className="text-lg font-semibold text-foreground">오늘 관리</h2>
          <p className="text-sm text-foreground-muted mt-1">onul.kr</p>
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
