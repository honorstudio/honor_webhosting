import Link from 'next/link';
import Header from '@/components/Header';

/**
 * 메인 페이지 - 서비스 소개 랜딩 페이지
 * 비로그인 사용자도 접근 가능
 * Honor Webhosting 서비스를 소개하고 시작하기 버튼 제공
 */
export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* 헤더 */}
      <Header />

      {/* 히어로 섹션 */}
      <section className="max-w-7xl mx-auto px-6 py-24">
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-4xl font-bold text-foreground mb-6">
            웹사이트를 쉽게 관리하세요
          </h2>
          <p className="text-lg text-foreground-muted mb-8">
            Honor Webhosting은 여러 클라이언트 웹사이트를 하나의 플랫폼에서
            효율적으로 관리할 수 있는 웹 호스팅 서비스입니다
          </p>
          <Link
            href="/login"
            className="inline-block px-8 py-4 bg-foreground text-background text-base font-medium rounded-lg transition-colors hover:bg-foreground-muted"
          >
            시작하기
          </Link>
        </div>
      </section>

      {/* 기능 소개 섹션 */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <h3 className="text-2xl font-semibold text-foreground text-center mb-12">
          주요 기능
        </h3>

        <div className="grid gap-8 md:grid-cols-3">
          {/* 기능 1: 멀티 사이트 관리 */}
          <div className="bg-surface border border-border rounded-lg p-8">
            <h4 className="text-lg font-semibold text-foreground mb-3">
              멀티 사이트 관리
            </h4>
            <p className="text-foreground-muted leading-relaxed">
              하나의 플랫폼에서 여러 클라이언트 웹사이트를 동시에 관리할 수
              있습니다
            </p>
          </div>

          {/* 기능 2: 멀티 도메인 지원 */}
          <div className="bg-surface border border-border rounded-lg p-8">
            <h4 className="text-lg font-semibold text-foreground mb-3">
              멀티 도메인 지원
            </h4>
            <p className="text-foreground-muted leading-relaxed">
              각 도메인별로 독립적인 웹사이트 콘텐츠를 제공하고 관리할 수
              있습니다
            </p>
          </div>

          {/* 기능 3: 직관적인 어드민 */}
          <div className="bg-surface border border-border rounded-lg p-8">
            <h4 className="text-lg font-semibold text-foreground mb-3">
              직관적인 어드민
            </h4>
            <p className="text-foreground-muted leading-relaxed">
              사용자 친화적인 관리 페이지에서 사이트를 손쉽게 관리할 수 있습니다
            </p>
          </div>
        </div>
      </section>

      {/* 푸터 */}
      <footer className="bg-surface border-t border-border mt-24">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <p className="text-sm text-foreground-muted text-center">
            © 2025 Honor Webhosting. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
