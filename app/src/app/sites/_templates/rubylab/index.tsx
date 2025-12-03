'use client';

/**
 * 루비랩 웹사이트 템플릿
 * 루비랩 전용 디자인과 기능을 제공하는 템플릿
 */
export default function RubylabTemplate() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-red-900 via-red-950 to-black px-6 md:px-12 lg:px-24">
        <div className="relative z-10 max-w-4xl text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-8 leading-tight">
            루비랩
          </h1>

          <p className="text-lg md:text-xl text-white/90 mb-12 leading-relaxed">
            루비랩 웹사이트 템플릿입니다.<br />
            여기에 루비랩만의 고유한 콘텐츠가 들어갑니다.
          </p>

          <button className="inline-flex items-center gap-2 px-8 py-4 bg-white text-black rounded-full font-medium hover:bg-gray-100 transition-all hover:-translate-y-1 hover:shadow-xl">
            자세히 알아보기
          </button>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-24 px-6 md:px-12 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-8">
              루비랩 콘텐츠 영역
            </h2>
            <p className="text-lg text-gray-700 leading-relaxed max-w-3xl mx-auto">
              이 템플릿은 루비랩만의 고유한 디자인과 기능을 가질 수 있습니다.
              각 사이트는 완전히 독립적인 구조를 가집니다.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-6 md:px-12">
        <div className="max-w-7xl mx-auto text-center">
          <div className="text-2xl font-bold mb-4">루비랩</div>
          <p className="text-gray-400">
            루비랩과 함께하세요.
          </p>
        </div>
      </footer>
    </div>
  );
}
