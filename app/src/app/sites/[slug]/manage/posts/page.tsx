'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

/**
 * 게시물 타입 정의 (Supabase posts 테이블 구조)
 */
interface Post {
  id: string;
  title: string;
  excerpt: string | null;
  thumbnail: string | null;
  status: 'published' | 'draft';
  view_count: number;
  created_at: string;
  updated_at: string;
  post_type: string;
}

/**
 * 게시물 관리 페이지
 * 무채색 계열의 깔끔한 테이블 디자인
 */
export default function PostsPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [posts, setPosts] = useState<Post[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'published' | 'draft'>('all');
  const [siteId, setSiteId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  // 사이트 ID 로드 및 게시물 목록 가져오기
  useEffect(() => {
    const loadSiteAndPosts = async () => {
      setIsLoading(true);
      const supabase = createClient();

      const { data: site } = await supabase
        .from('sites')
        .select('id')
        .eq('slug', slug)
        .single();

      if (site) {
        setSiteId(site.id);

        const { data: postsData, error } = await supabase
          .from('posts')
          .select('id, title, excerpt, thumbnail, status, view_count, created_at, updated_at, post_type')
          .eq('site_id', site.id)
          .eq('post_type', 'news')
          .order('created_at', { ascending: false });

        if (error) {
          console.error('게시물 로드 실패:', error);
        } else {
          setPosts(postsData || []);
        }
      }
      setIsLoading(false);
    };

    loadSiteAndPosts();
  }, [slug]);

  // 게시물 삭제
  const handleDelete = async (postId: string) => {
    if (!confirm('정말로 이 게시물을 삭제하시겠습니까?')) return;

    setIsDeleting(postId);
    try {
      const response = await fetch(`/api/sites/${slug}/news/${postId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setPosts(posts.filter(post => post.id !== postId));
      } else {
        const data = await response.json();
        alert(data.error || '삭제에 실패했습니다.');
      }
    } catch (error) {
      console.error('삭제 오류:', error);
      alert('삭제 중 오류가 발생했습니다.');
    }
    setIsDeleting(null);
  };

  // 상태 변경
  const handleStatusChange = async (postId: string, newStatus: 'published' | 'draft') => {
    try {
      const response = await fetch(`/api/sites/${slug}/news/${postId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        setPosts(posts.map(post =>
          post.id === postId ? { ...post, status: newStatus } : post
        ));
      } else {
        const data = await response.json();
        alert(data.error || '상태 변경에 실패했습니다.');
      }
    } catch (error) {
      console.error('상태 변경 오류:', error);
      alert('상태 변경 중 오류가 발생했습니다.');
    }
  };

  // 검색 및 필터링
  const filteredPosts = posts.filter((post) => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || post.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  // 날짜 포맷팅
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // 로딩 스켈레톤
  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* 헤더 스켈레톤 */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-7 w-32 bg-neutral-200 rounded animate-pulse" />
            <div className="h-4 w-48 bg-neutral-100 rounded animate-pulse" />
          </div>
          <div className="h-10 w-28 bg-neutral-200 rounded animate-pulse" />
        </div>
        {/* 테이블 스켈레톤 */}
        <div className="border border-neutral-200 rounded-lg overflow-hidden">
          <div className="bg-neutral-50 px-6 py-4 border-b border-neutral-200">
            <div className="h-4 w-full bg-neutral-200 rounded animate-pulse" />
          </div>
          {[1, 2, 3].map((i) => (
            <div key={i} className="px-6 py-5 border-b border-neutral-100">
              <div className="h-4 w-3/4 bg-neutral-100 rounded animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* 페이지 헤더 */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-900 tracking-tight">
            소식 관리
          </h1>
          <p className="mt-1 text-sm text-neutral-500">
            {posts.length}개의 게시물
          </p>
        </div>
        <Link
          href={`/sites/${slug}/news/write`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-neutral-900 text-white text-sm font-medium rounded-lg hover:bg-neutral-800 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          새 소식 작성
        </Link>
      </div>

      {/* 필터 및 검색 */}
      <div className="flex items-center gap-3">
        {/* 검색 */}
        <div className="relative flex-1 max-w-sm">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="제목으로 검색"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-sm border border-neutral-200 rounded-lg bg-white text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition-shadow"
          />
        </div>

        {/* 상태 필터 탭 */}
        <div className="flex items-center bg-neutral-100 rounded-lg p-1">
          {[
            { value: 'all', label: '전체' },
            { value: 'published', label: '공개' },
            { value: 'draft', label: '임시저장' },
          ].map((tab) => (
            <button
              key={tab.value}
              onClick={() => setFilterStatus(tab.value as 'all' | 'published' | 'draft')}
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
                filterStatus === tab.value
                  ? 'bg-white text-neutral-900 shadow-sm'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* 게시물 테이블 */}
      <div className="border border-neutral-200 rounded-lg overflow-hidden bg-white">
        <table className="w-full">
          <thead>
            <tr className="border-b border-neutral-200 bg-neutral-50">
              <th className="px-6 py-3.5 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                게시물
              </th>
              <th className="px-6 py-3.5 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider w-28">
                상태
              </th>
              <th className="px-6 py-3.5 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider w-24">
                조회
              </th>
              <th className="px-6 py-3.5 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider w-32">
                작성일
              </th>
              <th className="px-6 py-3.5 text-right text-xs font-medium text-neutral-500 uppercase tracking-wider w-24">

              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {filteredPosts.length > 0 ? (
              filteredPosts.map((post) => (
                <tr
                  key={post.id}
                  className="group hover:bg-neutral-50 transition-colors"
                >
                  {/* 게시물 정보 */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      {/* 썸네일 */}
                      <div className="flex-shrink-0 w-14 h-14 rounded-lg overflow-hidden bg-neutral-100">
                        {post.thumbnail ? (
                          <img
                            src={post.thumbnail}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <svg className="w-5 h-5 text-neutral-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                        )}
                      </div>
                      {/* 제목 및 요약 */}
                      <div className="min-w-0 flex-1">
                        <Link
                          href={`/sites/${slug}/news/${post.id}`}
                          className="block text-sm font-medium text-neutral-900 hover:text-neutral-600 transition-colors truncate"
                        >
                          {post.title}
                        </Link>
                        {post.excerpt && (
                          <p className="mt-0.5 text-xs text-neutral-400 truncate">
                            {post.excerpt}
                          </p>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* 상태 */}
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleStatusChange(post.id, post.status === 'published' ? 'draft' : 'published')}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                        post.status === 'published'
                          ? 'bg-neutral-900 text-white hover:bg-neutral-700'
                          : 'bg-neutral-200 text-neutral-600 hover:bg-neutral-300'
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        post.status === 'published' ? 'bg-white' : 'bg-neutral-400'
                      }`} />
                      {post.status === 'published' ? '공개' : '임시저장'}
                    </button>
                  </td>

                  {/* 조회수 */}
                  <td className="px-6 py-4">
                    <span className="text-sm text-neutral-500 tabular-nums">
                      {(post.view_count || 0).toLocaleString()}
                    </span>
                  </td>

                  {/* 작성일 */}
                  <td className="px-6 py-4">
                    <span className="text-sm text-neutral-500">
                      {formatDate(post.created_at)}
                    </span>
                  </td>

                  {/* 액션 */}
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Link
                        href={`/sites/${slug}/news/${post.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 rounded-md transition-colors"
                        title="새 창에서 보기"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </Link>
                      <button
                        onClick={() => handleDelete(post.id)}
                        disabled={isDeleting === post.id}
                        className="p-2 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors disabled:opacity-50"
                        title="삭제"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-6 py-16 text-center">
                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 rounded-full bg-neutral-100 flex items-center justify-center mb-4">
                      <svg className="w-6 h-6 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    {posts.length === 0 ? (
                      <>
                        <p className="text-sm text-neutral-500 mb-3">등록된 소식이 없습니다</p>
                        <Link
                          href={`/sites/${slug}/news/write`}
                          className="text-sm font-medium text-neutral-900 hover:text-neutral-600 transition-colors"
                        >
                          첫 번째 소식 작성하기 →
                        </Link>
                      </>
                    ) : (
                      <p className="text-sm text-neutral-500">검색 결과가 없습니다</p>
                    )}
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-3 gap-4">
        <div className="px-5 py-4 bg-white border border-neutral-200 rounded-lg">
          <p className="text-xs font-medium text-neutral-400 uppercase tracking-wider">전체</p>
          <p className="mt-1 text-2xl font-semibold text-neutral-900 tabular-nums">
            {posts.length}
          </p>
        </div>
        <div className="px-5 py-4 bg-white border border-neutral-200 rounded-lg">
          <p className="text-xs font-medium text-neutral-400 uppercase tracking-wider">공개</p>
          <p className="mt-1 text-2xl font-semibold text-neutral-900 tabular-nums">
            {posts.filter((p) => p.status === 'published').length}
          </p>
        </div>
        <div className="px-5 py-4 bg-white border border-neutral-200 rounded-lg">
          <p className="text-xs font-medium text-neutral-400 uppercase tracking-wider">임시저장</p>
          <p className="mt-1 text-2xl font-semibold text-neutral-900 tabular-nums">
            {posts.filter((p) => p.status === 'draft').length}
          </p>
        </div>
      </div>
    </div>
  );
}
