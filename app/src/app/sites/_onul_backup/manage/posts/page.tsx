'use client';

import { useState } from 'react';

/**
 * 게시물 타입 정의
 */
interface Post {
  id: string;
  title: string;
  author: string;
  status: 'published' | 'draft' | 'private';
  views: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * 게시물 관리 페이지
 * 게시물 목록 조회, 검색, 상태 관리
 */
export default function PostsPage() {
  // 더미 데이터 (나중에 Supabase에서 가져올 예정)
  const [posts] = useState<Post[]>([
    {
      id: '1',
      title: '오늘 웹사이트 오픈 안내',
      author: '관리자',
      status: 'published',
      views: 1250,
      createdAt: '2025-11-01',
      updatedAt: '2025-11-01',
    },
    {
      id: '2',
      title: '서비스 이용 가이드',
      author: '김철수',
      status: 'published',
      views: 890,
      createdAt: '2025-11-05',
      updatedAt: '2025-11-10',
    },
    {
      id: '3',
      title: '11월 업데이트 예정 사항',
      author: '관리자',
      status: 'draft',
      views: 0,
      createdAt: '2025-11-20',
      updatedAt: '2025-11-23',
    },
    {
      id: '4',
      title: '회원 전용 혜택 안내',
      author: '이영희',
      status: 'private',
      views: 45,
      createdAt: '2025-11-15',
      updatedAt: '2025-11-18',
    },
    {
      id: '5',
      title: '자주 묻는 질문 (FAQ)',
      author: '관리자',
      status: 'published',
      views: 2340,
      createdAt: '2025-10-28',
      updatedAt: '2025-11-22',
    },
    {
      id: '6',
      title: '커뮤니티 이용 규칙',
      author: '박민수',
      status: 'published',
      views: 567,
      createdAt: '2025-11-12',
      updatedAt: '2025-11-12',
    },
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<
    'all' | 'published' | 'draft' | 'private'
  >('all');

  // 검색 및 필터링
  const filteredPosts = posts.filter((post) => {
    const matchesSearch =
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.author.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter =
      filterStatus === 'all' || post.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  // 상태별 스타일
  const getStatusStyle = (status: Post['status']) => {
    switch (status) {
      case 'published':
        return 'bg-success/10 text-success border-success/30';
      case 'draft':
        return 'bg-foreground-muted/10 text-foreground-muted border-foreground-muted/30';
      case 'private':
        return 'bg-warning/10 text-warning border-warning/30';
    }
  };

  const getStatusText = (status: Post['status']) => {
    switch (status) {
      case 'published':
        return '공개';
      case 'draft':
        return '임시저장';
      case 'private':
        return '비공개';
    }
  };

  return (
    <div>
      {/* 페이지 헤더 */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-foreground mb-2">
          게시물 관리
        </h1>
        <p className="text-foreground-muted">
          전체 {posts.length}개의 게시물이 등록되어 있습니다
        </p>
      </div>

      {/* 검색 및 필터 영역 */}
      <div className="mb-6 flex gap-4">
        <input
          type="text"
          placeholder="제목 또는 작성자로 검색..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 px-4 py-3 border border-border rounded-lg bg-surface text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-foreground"
        />
        <select
          value={filterStatus}
          onChange={(e) =>
            setFilterStatus(
              e.target.value as 'all' | 'published' | 'draft' | 'private'
            )
          }
          className="px-4 py-3 border border-border rounded-lg bg-surface text-foreground focus:outline-none focus:ring-2 focus:ring-foreground"
        >
          <option value="all">전체 상태</option>
          <option value="published">공개</option>
          <option value="draft">임시저장</option>
          <option value="private">비공개</option>
        </select>
      </div>

      {/* 게시물 목록 테이블 */}
      <div className="bg-surface border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-background border-b border-border">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-foreground-muted uppercase">
                  제목
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-foreground-muted uppercase">
                  작성자
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-foreground-muted uppercase">
                  상태
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-foreground-muted uppercase">
                  조회수
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-foreground-muted uppercase">
                  작성일
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-foreground-muted uppercase">
                  최종 수정일
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-foreground-muted uppercase">
                  액션
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredPosts.length > 0 ? (
                filteredPosts.map((post) => (
                  <tr
                    key={post.id}
                    className="hover:bg-background transition-colors"
                  >
                    <td className="px-6 py-4 text-sm font-medium text-foreground">
                      {post.title}
                    </td>
                    <td className="px-6 py-4 text-sm text-foreground-muted">
                      {post.author}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex px-3 py-1 rounded-full text-xs font-medium border ${getStatusStyle(
                          post.status
                        )}`}
                      >
                        {getStatusText(post.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-foreground-muted">
                      {post.views.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-foreground-muted">
                      {post.createdAt}
                    </td>
                    <td className="px-6 py-4 text-sm text-foreground-muted">
                      {post.updatedAt}
                    </td>
                    <td className="px-6 py-4">
                      <button className="text-sm text-foreground hover:text-foreground-muted transition-colors">
                        수정
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-12 text-center text-foreground-muted"
                  >
                    검색 결과가 없습니다
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 통계 정보 */}
      <div className="mt-6 grid grid-cols-4 gap-4">
        <div className="bg-surface border border-border rounded-lg p-4">
          <div className="text-sm text-foreground-muted mb-1">전체</div>
          <div className="text-2xl font-semibold text-foreground">
            {posts.length}개
          </div>
        </div>
        <div className="bg-surface border border-border rounded-lg p-4">
          <div className="text-sm text-foreground-muted mb-1">공개</div>
          <div className="text-2xl font-semibold text-foreground">
            {posts.filter((p) => p.status === 'published').length}개
          </div>
        </div>
        <div className="bg-surface border border-border rounded-lg p-4">
          <div className="text-sm text-foreground-muted mb-1">임시저장</div>
          <div className="text-2xl font-semibold text-foreground">
            {posts.filter((p) => p.status === 'draft').length}개
          </div>
        </div>
        <div className="bg-surface border border-border rounded-lg p-4">
          <div className="text-sm text-foreground-muted mb-1">비공개</div>
          <div className="text-2xl font-semibold text-foreground">
            {posts.filter((p) => p.status === 'private').length}개
          </div>
        </div>
      </div>
    </div>
  );
}
