'use client';

import { useState, useEffect } from 'react';
import { Calendar, Eye, ChevronRight, Search, Plus } from 'lucide-react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { createClient } from '@/lib/supabase/client';

interface NewsItem {
  id: string;
  title: string;
  excerpt: string | null;
  thumbnail: string | null;
  created_at: string;
  view_count: number;
}

// 페이지당 게시물 수
const ITEMS_PER_PAGE = 10;

export default function OnulNewsListV2() {
  const [searchQuery, setSearchQuery] = useState('');
  const [news, setNews] = useState<NewsItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // Supabase에서 소식 목록 가져오기 + 관리자 권한 확인
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      const supabase = createClient();

      // 현재 로그인한 사용자 확인
      const { data: { user } } = await supabase.auth.getUser();

      // onul 사이트의 ID 가져오기
      const { data: site } = await supabase
        .from('sites')
        .select('id, owner_id')
        .eq('slug', 'onul')
        .single();

      if (site) {
        // 관리자 권한 확인 (사이트 소유자 또는 멤버)
        if (user) {
          // 소유자인지 확인
          if (site.owner_id === user.id) {
            setIsAdmin(true);
          } else {
            // 멤버인지 확인
            const { data: member } = await supabase
              .from('site_members')
              .select('role')
              .eq('site_id', site.id)
              .eq('user_id', user.id)
              .single();

            if (member && ['owner', 'admin', 'editor'].includes(member.role)) {
              setIsAdmin(true);
            }
          }
        }

        // 해당 사이트의 공개된 소식 가져오기
        const { data: posts, error } = await supabase
          .from('posts')
          .select('id, title, excerpt, thumbnail, created_at, view_count')
          .eq('site_id', site.id)
          .eq('post_type', 'news')
          .eq('status', 'published')
          .order('created_at', { ascending: false });

        if (!error && posts) {
          setNews(posts);
        }
      }
      setIsLoading(false);
    };

    fetchData();
  }, []);

  // 검색 필터링
  const filteredNews = news.filter(
    (item) =>
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.excerpt && item.excerpt.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // 페이지네이션 계산
  const totalPages = Math.ceil(filteredNews.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedNews = filteredNews.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  // 검색어 변경 시 첫 페이지로 이동
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  // 날짜 포맷팅
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  return (
    <div className="min-h-screen bg-white">
      {/* 공통 헤더 */}
      <Header transparentOnTop={false} />

      {/* 히어로 섹션 */}
      <section className="bg-neutral-900 pt-32 pb-16">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <p className="text-neutral-400 text-sm font-medium tracking-widest uppercase mb-4">
            News & Notice
          </p>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            오늘청소 <span className="text-neutral-300">소식</span>
          </h1>
          <p className="text-neutral-400 text-lg max-w-2xl">
            오늘청소의 새로운 소식과 공지사항을 확인하세요.
          </p>
        </div>
      </section>

      {/* 검색 & 필터 */}
      <section className="border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {/* 검색 */}
            <div className="relative w-full md:w-96">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
              <input
                type="text"
                placeholder="소식 검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-neutral-200 rounded-xl bg-white text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition-shadow"
              />
            </div>

            {/* 글쓰기 버튼 (관리자에게만 표시) */}
            {isAdmin && (
              <a
                href="/sites/onul/news/write"
                className="inline-flex items-center gap-2 px-6 py-3 bg-neutral-900 text-white rounded-xl font-medium hover:bg-neutral-800 transition-colors"
              >
                <Plus className="w-5 h-5" />
                새 소식 작성
              </a>
            )}
          </div>
        </div>
      </section>

      {/* 소식 목록 */}
      <section className="py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          {isLoading ? (
            <div className="text-center py-20">
              <p className="text-neutral-500 text-lg">소식을 불러오는 중...</p>
            </div>
          ) : filteredNews.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-neutral-500 text-lg">
                {news.length === 0 ? '등록된 소식이 없습니다.' : '검색 결과가 없습니다.'}
              </p>
            </div>
          ) : (
            <div className="grid gap-6 md:gap-8">
              {paginatedNews.map((item, index) => (
                <a
                  key={item.id}
                  href={`/sites/onul/news/${item.id}`}
                  className="group block"
                >
                  <article
                    className={`flex flex-col md:flex-row gap-6 p-6 rounded-2xl border transition-all duration-300 ${
                      index === 0
                        ? 'border-neutral-300 bg-neutral-50 hover:border-neutral-400 hover:shadow-md'
                        : 'border-neutral-200 bg-white hover:border-neutral-300 hover:shadow-md'
                    }`}
                  >
                    {/* 썸네일 */}
                    <div className="flex-shrink-0 w-full md:w-64 h-48 md:h-40 rounded-xl overflow-hidden bg-neutral-100">
                      {item.thumbnail ? (
                        <img
                          src={item.thumbnail}
                          alt={item.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-neutral-400">
                          이미지 없음
                        </div>
                      )}
                    </div>

                    {/* 콘텐츠 */}
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        {/* 제목 */}
                        <h2 className="text-xl md:text-2xl font-bold text-neutral-900 mb-3 group-hover:text-neutral-700 transition-colors line-clamp-2">
                          {item.title}
                        </h2>

                        {/* 요약 */}
                        <p className="text-neutral-600 leading-relaxed line-clamp-2 mb-4">
                          {item.excerpt || ''}
                        </p>
                      </div>

                      {/* 메타 정보 */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-sm text-neutral-500">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {formatDate(item.created_at)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Eye className="w-4 h-4" />
                            {item.view_count || 0}
                          </span>
                        </div>

                        <span className="flex items-center gap-1 text-neutral-900 font-medium text-sm group-hover:gap-2 transition-all">
                          자세히 보기
                          <ChevronRight className="w-4 h-4" />
                        </span>
                      </div>
                    </div>
                  </article>
                </a>
              ))}
            </div>
          )}

          {/* 페이지네이션 - 2페이지 이상일 때만 표시 */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-12">
              <div className="flex items-center gap-2">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-10 h-10 rounded-lg font-medium transition-colors ${
                      currentPage === page
                        ? 'bg-neutral-900 text-white'
                        : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 공통 푸터 */}
      <Footer />
    </div>
  );
}
