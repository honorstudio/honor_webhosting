'use client';

import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Calendar, Eye, ArrowLeft, Share2, User } from 'lucide-react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { createClient } from '@/lib/supabase/client';

interface NewsDetail {
  id: string;
  title: string;
  content: string;
  thumbnail: string | null;
  excerpt: string | null;
  created_at: string;
  view_count: number;
}

export default function OnulNewsDetailV2() {
  const params = useParams();
  const newsId = params?.id as string;
  const [news, setNews] = useState<NewsDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  // Supabase에서 소식 상세 정보 가져오기
  useEffect(() => {
    const fetchNews = async () => {
      if (!newsId) {
        setError(true);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      const supabase = createClient();

      // 소식 상세 조회
      const { data: post, error: fetchError } = await supabase
        .from('posts')
        .select('id, title, content, thumbnail, excerpt, created_at, view_count')
        .eq('id', newsId)
        .eq('post_type', 'news')
        .single();

      if (fetchError || !post) {
        console.error('소식 로드 실패:', fetchError);
        setError(true);
        setIsLoading(false);
        return;
      }

      setNews(post);

      // 조회수 증가
      await supabase
        .from('posts')
        .update({ view_count: (post.view_count || 0) + 1 })
        .eq('id', newsId);

      setIsLoading(false);
    };

    fetchNews();
  }, [newsId]);

  // 날짜 포맷팅
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // 공유하기
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: news?.title || '오늘청소 소식',
          url: window.location.href,
        });
      } catch (err) {
        console.log('공유 취소됨');
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('링크가 클립보드에 복사되었습니다.');
    }
  };

  // 로딩 중
  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <Header transparentOnTop={false} />
        <div className="flex-1 pt-20">
          <div className="max-w-4xl mx-auto px-6 py-16 text-center">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-3/4 mx-auto mb-4" />
              <div className="h-4 bg-gray-100 rounded w-1/2 mx-auto" />
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // 소식을 찾을 수 없는 경우
  if (error || !news) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <Header transparentOnTop={false} />
        <div className="flex-1 pt-20">
          <div className="max-w-4xl mx-auto px-6 py-16 text-center">
            <h1 className="text-2xl font-bold text-neutral-900 mb-4">
              소식을 찾을 수 없습니다
            </h1>
            <p className="text-neutral-600 mb-8">
              요청하신 소식이 존재하지 않거나 삭제되었습니다.
            </p>
            <a
              href="/sites/onul/news"
              className="inline-flex items-center gap-2 px-6 py-3 bg-neutral-900 text-white rounded-xl font-medium hover:bg-neutral-800 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              목록으로 돌아가기
            </a>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* 공통 헤더 */}
      <Header transparentOnTop={false} />

      {/* 메인 콘텐츠 영역 */}
      <main className="flex-1 pt-20">
        {/* 히어로 이미지 */}
        {news.thumbnail && (
          <div className="relative h-64 md:h-96 bg-neutral-900">
            <img
              src={news.thumbnail}
              alt={news.title}
              className="w-full h-full object-cover opacity-60"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-neutral-900 to-transparent" />
          </div>
        )}

        {/* 콘텐츠 */}
        <article className="max-w-4xl mx-auto px-6 md:px-12 py-12 md:py-16">
        {/* 뒤로가기 */}
        <a
          href="/sites/onul/news"
          className="inline-flex items-center gap-2 text-neutral-600 hover:text-neutral-900 transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          목록으로
        </a>

        {/* 제목 */}
        <h1 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-6 leading-tight">
          {news.title}
        </h1>

        {/* 메타 정보 */}
        <div className="flex flex-wrap items-center gap-4 pb-8 border-b border-neutral-200 mb-8">
          <span className="flex items-center gap-2 text-neutral-600">
            <User className="w-4 h-4" />
            오늘청소
          </span>
          <span className="flex items-center gap-2 text-neutral-600">
            <Calendar className="w-4 h-4" />
            {formatDate(news.created_at)}
          </span>
          <span className="flex items-center gap-2 text-neutral-600">
            <Eye className="w-4 h-4" />
            {news.view_count || 0} 조회
          </span>
          <button
            onClick={handleShare}
            className="flex items-center gap-2 text-neutral-600 hover:text-neutral-900 transition-colors ml-auto"
          >
            <Share2 className="w-4 h-4" />
            공유하기
          </button>
        </div>

        {/* 본문 */}
        <div
          className="prose prose-lg max-w-none"
          dangerouslySetInnerHTML={{ __html: news.content || '<p>내용이 없습니다.</p>' }}
        />

        {/* 하단 네비게이션 */}
        <div className="mt-16 pt-8 border-t border-neutral-200">
          <div className="flex flex-col sm:flex-row gap-4 justify-between">
            <a
              href="/sites/onul/news"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-neutral-100 text-neutral-700 rounded-xl font-medium hover:bg-neutral-200 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              목록으로 돌아가기
            </a>
            <a
              href="/sites/onul#contact"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-neutral-900 text-white rounded-xl font-medium hover:bg-neutral-800 transition-colors"
            >
              상담 문의하기
            </a>
          </div>
        </div>
      </article>
      </main>

      {/* 스타일 */}
      <style jsx global>{`
        .prose h2 {
          font-size: 1.5rem;
          font-weight: 700;
          margin-top: 2rem;
          margin-bottom: 1rem;
          color: #171717;
        }
        .prose h3 {
          font-size: 1.25rem;
          font-weight: 600;
          margin-top: 1.5rem;
          margin-bottom: 0.75rem;
          color: #171717;
        }
        .prose p {
          margin-bottom: 1rem;
          color: #525252;
          line-height: 1.75;
        }
        .prose ul {
          list-style-type: disc;
          padding-left: 1.5rem;
          margin-bottom: 1rem;
        }
        .prose li {
          margin-bottom: 0.5rem;
          color: #525252;
        }
        .prose strong {
          color: #171717;
          font-weight: 600;
        }
        .prose blockquote {
          border-left: 4px solid #404040;
          padding-left: 1rem;
          margin: 1.5rem 0;
          color: #737373;
          font-style: italic;
        }
        .prose img {
          max-width: 100%;
          height: auto;
          border-radius: 0.5rem;
          margin: 1.5rem 0;
        }
      `}</style>

      {/* 공통 푸터 */}
      <Footer />
    </div>
  );
}
