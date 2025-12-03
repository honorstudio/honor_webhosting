'use client';

/**
 * 기본 웹사이트 템플릿
 * 새로운 사이트를 만들 때 사용하는 기본 템플릿
 */
export default function DefaultTemplate() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-950 to-black px-6 md:px-12 lg:px-24">
        <div className="relative z-10 max-w-4xl text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-8 leading-tight">
            새로운 웹사이트
          </h1>

          <p className="text-lg md:text-xl text-white/90 mb-12 leading-relaxed">
            Honor Webhosting에 오신 것을 환영합니다.<br />
            이 페이지는 기본 템플릿입니다.
          </p>

          <button className="inline-flex items-center gap-2 px-8 py-4 bg-white text-black rounded-full font-medium hover:bg-gray-100 transition-all hover:-translate-y-1 hover:shadow-xl">
            시작하기
          </button>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-6 md:px-12 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-8">
              주요 기능
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-gray-50 p-8 rounded-2xl">
              <h3 className="text-xl font-bold mb-4">독립적인 디자인</h3>
              <p className="text-gray-700">
                각 사이트는 고유한 디자인과 기능을 가질 수 있습니다.
              </p>
            </div>
            <div className="bg-gray-50 p-8 rounded-2xl">
              <h3 className="text-xl font-bold mb-4">쉬운 관리</h3>
              <p className="text-gray-700">
                하나의 플랫폼에서 모든 사이트를 관리할 수 있습니다.
              </p>
            </div>
            <div className="bg-gray-50 p-8 rounded-2xl">
              <h3 className="text-xl font-bold mb-4">확장 가능</h3>
              <p className="text-gray-700">
                필요에 따라 새로운 사이트를 쉽게 추가할 수 있습니다.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-6 md:px-12">
        <div className="max-w-7xl mx-auto text-center">
          <div className="text-2xl font-bold mb-4">Honor Webhosting</div>
          <p className="text-gray-400">
            멀티 사이트 호스팅 플랫폼
          </p>
        </div>
      </footer>
    </div>
  );
}
