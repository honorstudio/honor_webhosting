'use client';

import { useState } from 'react';
import { ChevronRight, Sparkles, Users, Building, GraduationCap } from 'lucide-react';

/**
 * 오늘청소 웹사이트 템플릿 - v1 (초기 버전)
 * 청소 전문 서비스 기업의 랜딩 페이지
 *
 * 섹션 구성:
 * 1. Hero - 메인 비주얼
 * 2. About - 회사 소개
 * 3. Vision - 비전 및 전략
 * 4. Services - 서비스 탭 (상가/가정/공장/특수/기타)
 * 5. Care - 케어 서비스 (냉난방기/공조기/해충방역)
 * 6. Biz - 파트너 로고 슬라이더
 * 7. People - 인력 파견
 * 8. Education - 교육 프로그램
 * 9. Building - 건물종합관리
 */
export default function OnulTemplateV1() {
  // 서비스 탭 상태
  const [activeService, setActiveService] = useState<'store' | 'home' | 'factory' | 'special' | 'etc'>('store');

  // 건물관리 탭 상태
  const [activeBuildingTab, setActiveBuildingTab] = useState<'cleaning' | 'realestate' | 'facility'>('cleaning');

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section - 메인 비주얼 */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-blue-900 via-blue-950 to-black px-6 md:px-12 lg:px-24">
        {/* 배경 로고 오브젝트 */}
        <div className="absolute right-0 bottom-0 w-3/5 opacity-30 translate-x-1/4 translate-y-1/4">
          <svg viewBox="700 200 1500 800" className="w-full h-auto text-green-400">
            <defs>
              <linearGradient id="logoGradient" x1="0" y1="0" x2="0.5" y2="1">
                <stop offset="0" stopColor="currentColor" stopOpacity="0.6"/>
                <stop offset="1" stopColor="currentColor" stopOpacity="0"/>
              </linearGradient>
            </defs>
            <g transform="translate(30.419, 4.336)">
              <path d="M339.711,679.456C152.39,679.456,0,527.062,0,339.744S152.39,0,339.711,0,679.422,152.394,679.422,339.715s-152.39,339.74-339.711,339.74m0-558.626c-120.68,0-218.886,98.2-218.886,218.886,0,120.709,98.206,218.911,218.886,218.911S558.6,460.424,558.6,339.744c0-120.713-98.206-218.915-218.886-218.915"
                    transform="translate(712, 354.817)"
                    fill="url(#logoGradient)"/>
              <path d="M863.062,619.041H742.233V339.711c0-120.68-98.2-218.882-218.882-218.882s-218.886,98.2-218.886,218.882v279.33H183.636V339.711C183.636,152.394,336.03,0,523.351,0S863.062,152.394,863.062,339.711Z"
                    transform="translate(1290.65, 354.817)"
                    fill="url(#logoGradient)"/>
            </g>
          </svg>
        </div>

        <div className="relative z-10 max-w-4xl">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-8 leading-tight">
            청소의 미래를 함께하는 기업
          </h1>

          <p className="text-lg md:text-xl text-white/90 mb-12 leading-relaxed">
            단순한 청소를 넘어, 지속 가능한 공간 관리 솔루션을 제공합니다.<br />
            데이터 기반 관리, 스마트 교육 시스템으로 청소 업계의 새로운 표준을 만들어갑니다.
          </p>

          <button className="inline-flex items-center gap-2 px-8 py-4 bg-white text-black rounded-full font-medium hover:bg-gray-100 transition-all hover:-translate-y-1 hover:shadow-xl">
            함께 하러가기
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </section>

      {/* About Section - 회사 소개 */}
      <section className="py-24 md:py-32 px-6 md:px-12 lg:px-24 bg-white relative overflow-hidden">
        {/* 장식 곡선 */}
        <div className="absolute bottom-0 right-0 w-64 opacity-20 translate-x-1/3 translate-y-1/3">
          <svg viewBox="0 0 332.505 332.505" className="w-full h-auto text-blue-200">
            <path d="M190.91,516.116H352.986c93.978,0,170.429-76.451,170.429-170.429V183.611h-64.9V345.687A105.654,105.654,0,0,1,352.986,451.215H190.91Z"
                  transform="translate(-190.91 -183.611)" fill="currentColor"/>
          </svg>
        </div>

        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-start">
            {/* 텍스트 영역 */}
            <div>
              <h2 className="text-4xl md:text-5xl font-bold mb-4">
                공간의 가치를 새롭게,
              </h2>
              <h2 className="text-4xl md:text-5xl font-normal mb-12">
                일상의 청결을 책임지는 오늘 입니다.
              </h2>

              <div className="space-y-6 text-lg text-gray-700 leading-relaxed">
                <p>
                  오늘청소는 단순한 청소 서비스가 아닌, 삶의 질을 높이는 생활 솔루션을 제공하고자 하는 마음에서 시작되었습니다. 우리는 매일 수많은 공간을 만나며, 그 안에서 살아가는 사람들의 다양한 삶과 마주합니다. 그래서 오늘청소는 청소를 단순한 '일'이 아닌 <strong className="font-semibold text-black">사람과 공간을 연결하는 일</strong>로 바라봅니다.
                </p>

                <p>
                  지금까지 우리는 입주청소, 거주청소, 특수청소, 가전클리닝, 기업 및 관공서 대상의 정기 청소 등 다양한 분야에서 경험과 노하우를 쌓아왔으며, 철저한 교육을 받은 전문 마스터들과 함께 고객 만족 그 이상의 가치를 창출하고자 노력해왔습니다.
                </p>

                <p>
                  우리는 청소의 품질만큼 고객의 신뢰를 가장 중요하게 생각합니다. 불필요한 비용 없이, 투명하고 정직한 서비스로 다시 찾고 싶은 청소 브랜드가 되기 위해 오늘도 한 걸음씩 성장하고 있습니다.
                </p>

                <p className="pt-6 font-semibold text-black">
                  오늘청소 | ONUL 드림
                </p>
              </div>
            </div>

            {/* 이미지 갤러리 */}
            <div className="grid grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
                <div
                  key={i}
                  className="aspect-[4/5] rounded-full bg-gradient-to-br from-gray-200 to-gray-300 overflow-hidden hover:scale-105 transition-transform"
                >
                  <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
                    이미지 {i}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Vision Section - 비전 및 전략 */}
      <section className="py-24 px-6 md:px-12 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-blue-900 mb-4">
              오늘청소 비전 및 전략
            </h2>
          </div>

          {/* 비전 */}
          <div className="mb-8 bg-blue-900 text-white text-center py-12 rounded-2xl">
            <h3 className="text-2xl md:text-3xl font-bold">
              깨끗한 환경과 전문 서비스로 모두가 행복한 일상을 만들어갑니다
            </h3>
          </div>

          {/* 전략 그리드 */}
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            <div className="bg-red-600 text-white p-8 rounded-2xl">
              <h4 className="text-xl font-bold mb-2">고객중심</h4>
              <p className="text-sm">고객 만족과 신뢰를 최우선으로</p>
            </div>
            <div className="bg-blue-600 text-white p-8 rounded-2xl">
              <h4 className="text-xl font-bold mb-2">전문성</h4>
              <p className="text-sm">체계적 교육과 최고의 서비스 품질</p>
            </div>
            <div className="bg-green-600 text-white p-8 rounded-2xl">
              <h4 className="text-xl font-bold mb-2">친환경</h4>
              <p className="text-sm">지속 가능한 청소 문화 실천</p>
            </div>
            <div className="bg-amber-800 text-white p-8 rounded-2xl">
              <h4 className="text-xl font-bold mb-2">사회공헌</h4>
              <p className="text-sm">지역사회와 함께 성장</p>
            </div>
          </div>

          {/* 실천 목표 */}
          <div className="grid md:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm">
              <div className="space-y-2 text-sm">
                {['고객 만족도 95% 이상 유지', '투명한 견적과 정직한 서비스 제공', '맞춤형 청소 솔루션 개발', '24시간 신속한 고객 응대 체계', '고객 소통 채널 다양화'].map((goal, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span className="font-bold text-blue-900">목표{i + 1}</span>
                    <span className="text-gray-700">{goal}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm">
              <div className="space-y-2 text-sm">
                {['전문 마스터 양성 교육 프로그램 운영', '체계적인 품질 관리 시스템 구축', '최신 청소 기술과 장비 도입', '서비스 표준화 및 매뉴얼 구축', '정기적인 서비스 품질 평가'].map((goal, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span className="font-bold text-blue-900">목표{i + 6}</span>
                    <span className="text-gray-700">{goal}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm">
              <div className="space-y-2 text-sm">
                {['친환경 세제 사용 확대', '자원 절약형 청소 방식 도입', '탄소 배출 저감 활동 실천', '재활용 및 폐기물 최소화', '친환경 인증 획득 및 유지'].map((goal, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span className="font-bold text-blue-900">목표{i + 11}</span>
                    <span className="text-gray-700">{goal}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm">
              <div className="space-y-2 text-sm">
                {['취약계층 무료 청소 지원', '지역 일자리 창출 기여', '지역사회 봉사활동 참여', '파트너사와 상생 협력'].map((goal, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span className="font-bold text-blue-900">목표{i + 16}</span>
                    <span className="text-gray-700">{goal}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section - 서비스 탭 */}
      <section className="relative bg-white">
        {/* 장식 원 */}
        <div className="absolute right-0 bottom-0 w-96 h-96 opacity-10 translate-x-1/2 translate-y-1/2">
          <svg viewBox="0 0 705 705.031" className="w-full h-auto text-blue-200">
            <path d="M352.5,705.031C158.133,705.031,0,546.9,0,352.531S158.133,0,352.5,0,705,158.164,705,352.531s-158.133,352.5-352.5,352.5m0-579.653c-125.221,0-227.122,101.9-227.122,227.153,0,125.221,101.9,227.122,227.122,227.122s227.122-101.9,227.122-227.122c0-125.253-101.9-227.153-227.122-227.153" fill="currentColor"/>
          </svg>
        </div>

        {/* 탭 버튼 */}
        <div className="flex border-b border-gray-200">
          {[
            { id: 'store' as const, label: '상가 청소' },
            { id: 'home' as const, label: '가정 청소' },
            { id: 'factory' as const, label: '공장 청소' },
            { id: 'special' as const, label: '특수 청소' },
            { id: 'etc' as const, label: '기타' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveService(tab.id)}
              className={`flex-1 py-6 text-lg font-medium transition-colors ${
                activeService === tab.id
                  ? 'bg-black text-white'
                  : 'bg-white text-black hover:bg-gray-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* 탭 콘텐츠 */}
        <div className="bg-black">
          <div className="grid lg:grid-cols-2 min-h-[600px]">
            <div className="p-12 lg:p-20 flex flex-col justify-center">
              {activeService === 'store' && (
                <>
                  <p className="text-white text-xl leading-relaxed mb-8">
                    사업장 청소는 직원과 고객의 건강을 보호하고, 청결한 환경을 유지하여 직원들의 생산성을 증대시킵니다.<br /><br />
                    또한, 위생적인 환경은 고객 만족도를 높여 재방문을 유도하고, 브랜드 이미지 향상에 기여합니다. 이는 결국 매출 증가로 이어지며, 법적 규제 준수와 장비 수명 연장, 사고 예방 등의 부가적인 효과도 제공합니다.<br /><br />
                    "오늘"에게 맡겨주세요. 시간절약과 만족감을 높여드립니다.
                  </p>
                  <div className="flex flex-wrap gap-3">
                    {['상가 청소', '사무실 청소', '방문 청소', '정기 청소'].map((tag) => (
                      <span key={tag} className="px-6 py-2 bg-white text-black rounded-full text-sm font-medium">
                        {tag}
                      </span>
                    ))}
                  </div>
                </>
              )}
              {activeService === 'home' && (
                <>
                  <p className="text-white text-xl leading-relaxed mb-8">
                    깨끗하고 쾌적한 주거 환경을 위해 전문적인 가정청소 서비스를 제공합니다. 가정 청소는 먼지와 오염을 제거하고 위생을 유지하는 과정으로 거실, 주방, 욕실, 침실 등 집안 전체를 체계적으로 관리합니다.
                  </p>
                  <div className="flex flex-wrap gap-3">
                    {['가정 청소', '새집 청소', '이사 청소', '리모델링 후 청소', '이사 전 후 청소', '퇴실 청소', '입주 청소'].map((tag) => (
                      <span key={tag} className="px-6 py-2 bg-white text-black rounded-full text-sm font-medium">
                        {tag}
                      </span>
                    ))}
                  </div>
                </>
              )}
              {activeService === 'factory' && (
                <>
                  <p className="text-white text-xl leading-relaxed mb-8">
                    기업 및 제조공장 청소는 산업 환경의 안정성, 생산성, 그리고 전반적인 운영 효율성을 유지하는 데 매우 중요한 역할을 합니다. 전문적인 기업 및 제조공장 청소 서비스는 단순히 청결을 유지하는 것을 넘어 기업의 생산성, 안정성 그리고 이미지 향상에 크게 기여합니다.<br /><br />
                    정기적이고 체계적인 청소 관리는 장기적으로 기업의 경쟁력 강화에 중요한 요소가 될 수 있습니다.
                  </p>
                  <div className="flex flex-wrap gap-3">
                    {['바닥 청소', '설비 청소', '냉난방기 청소', '외벽 청소', '유리 청소'].map((tag) => (
                      <span key={tag} className="px-6 py-2 bg-white text-black rounded-full text-sm font-medium">
                        {tag}
                      </span>
                    ))}
                  </div>
                </>
              )}
              {activeService === 'special' && (
                <>
                  <p className="text-white text-xl leading-relaxed mb-8">
                    특수청소는 전문 장비와 기술을 갖춘 전문가만이 효과적으로 수행할 수 있으며, 높은 복구율을 자랑합니다.<br /><br />
                    오염물질을 철저히 제거하고, 안전한 작업 환경을 보장하며, 시설의 내구성을 높이고 사고를 예방합니다.
                  </p>
                  <div className="flex flex-wrap gap-3">
                    {['비둘기 퇴치', '고압 세척', '쓰레기집'].map((tag) => (
                      <span key={tag} className="px-6 py-2 bg-white text-black rounded-full text-sm font-medium">
                        {tag}
                      </span>
                    ))}
                  </div>
                </>
              )}
              {activeService === 'etc' && (
                <>
                  <p className="text-white text-xl leading-relaxed mb-8">
                    깨끗한 공간은 곧 신뢰의 시작입니다. 현장과 시설에 맞춘 맞춤 청소로 위생과 안전을 지켜드립니다.<br /><br />
                    전문 인력과 체계적인 관리로 보이지 않는 부분까지 세심하게 관리합니다.<br /><br />
                    쾌적하고 건강한 환경, 저희가 책임집니다.
                  </p>
                  <div className="flex flex-wrap gap-3">
                    {['식당주방 청소', '오픈 공사 후 청소', '샵 청소', '누적된 오염 청소', '유리 청소', '냉난방기 청소'].map((tag) => (
                      <span key={tag} className="px-6 py-2 bg-white text-black rounded-full text-sm font-medium">
                        {tag}
                      </span>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* 이미지 영역 */}
            <div className="relative bg-gradient-to-br from-gray-300 via-gray-400 to-gray-500 min-h-[400px] flex items-center justify-center">
              <div className="text-gray-600 text-xl">서비스 이미지</div>
            </div>
          </div>
        </div>
      </section>

      {/* Care Section - 케어 서비스 */}
      <section className="py-24 px-6 md:px-12 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="mb-16">
            <div className="text-lg font-bold text-black mb-2">오늘케어</div>
            <div className="text-8xl font-bold text-blue-50">CARE</div>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {[
              { icon: Sparkles, title: '냉난방기 청소' },
              { icon: Building, title: '공조기 청소' },
              { icon: Users, title: '해충, 방역' }
            ].map((item) => (
              <div
                key={item.title}
                className="group relative h-96 rounded-3xl overflow-hidden cursor-pointer"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-gray-600 to-gray-800"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-black/30 group-hover:from-black/40 group-hover:to-black/20 transition-all"></div>
                <div className="relative h-full flex flex-col items-center justify-center text-white p-8">
                  <item.icon className="w-24 h-24 mb-4" strokeWidth={1.5} />
                  <h3 className="text-2xl font-medium">{item.title}</h3>
                </div>
              </div>
            ))}
          </div>

          <p className="text-lg text-gray-700 leading-relaxed max-w-5xl">
            오늘케어는 단순한 청소가 아니라, 공간 전체의 위생과 쾌적함을 지키는 종합 케어 서비스를 제공합니다. 냉난방기, 공조기, 해충·방역까지 전문 장비와 노하우로 꼼꼼하게 관리해서 건강하고 깨끗한 환경을 유지합니다. 작은 먼지 하나, 눈에 보이지 않는 세균까지 철저하게 고객과 고객의 공간을 위해서 세심하게 고려해서 고객이 모든 부분가 안심할 수 있도록 관리합니다. 정기 점검과 맞춤형 솔루션으로 단기적인 청결성이 아닌 장기적으로 위생 관리까지 책임집니다.
          </p>
        </div>
      </section>

      {/* Biz Section - 파트너 로고 슬라이더 */}
      <section className="bg-black py-24 px-6 md:px-12">
        <div className="max-w-7xl mx-auto mb-16">
          <div className="text-lg font-bold text-white mb-2">오늘비즈</div>
          <div className="text-8xl font-bold text-white mb-8">BIZ</div>
          <p className="text-white text-lg leading-relaxed max-w-3xl">
            기업의 규모와 업종을 막론하고 필요한 모든 서비스를 한곳에서 제공합니다.<br />
            프랜차이즈, 대량 납품, 유지보수 등 다양한 카테고리를 아우르는 맞춤형 솔루션을 제안합니다.<br />
            효율적이고 체계적인 지원으로 비즈니스 경쟁력을 높이고 안정적인 운영을 돕습니다.
          </p>
        </div>

        {/* 로고 슬라이더 */}
        <div className="bg-white py-16 overflow-hidden">
          <div className="flex animate-scroll gap-12">
            {/* 파트너 로고들 - 실제로는 이미지를 사용 */}
            {Array.from({ length: 36 }).map((_, i) => (
              <div key={i} className="flex-shrink-0 w-48 h-28 bg-gray-100 rounded-lg flex items-center justify-center">
                <span className="text-gray-400 text-sm">Partner {(i % 18) + 1}</span>
              </div>
            ))}
          </div>
        </div>

        <style jsx>{`
          @keyframes scroll {
            0% {
              transform: translateX(0);
            }
            100% {
              transform: translateX(-33.333%);
            }
          }
          .animate-scroll {
            animation: scroll 60s linear infinite;
          }
        `}</style>
      </section>

      {/* People Section - 인력 파견 */}
      <section className="flex flex-col lg:flex-row min-h-screen bg-white">
        <div className="lg:w-1/2 bg-gradient-to-br from-blue-900 to-black p-12 lg:p-20 flex flex-col justify-center text-white">
          <div className="mb-8">
            <div className="text-lg font-bold mb-2">오늘피플</div>
            <div className="text-7xl lg:text-8xl font-bold mb-12">PEOPLE</div>

            <ul className="space-y-3 text-xl lg:text-2xl font-semibold mb-16">
              <li>- 전문 교육 후 인력 파견</li>
              <li>- 현장 맞춤 청소 인력 파견 서비스</li>
              <li>- 체계적 유지관리 서비스</li>
            </ul>
          </div>

          <div>
            <div className="h-px bg-white mb-6"></div>
            <p className="text-base lg:text-lg leading-relaxed">
              현장 맞춤 청소 인력 파견 서비스<br />
              청소 전문 교육을 받은 인력이 직접 현장을 방문해 업무를 진행합니다.<br />
              가정에는 가사도우미, 사업장에는 환경미화 인력이 투입되어 체계적인 청소를 제공합니다.<br /><br />
              시간제·단기 인력부터 정기 유지관리까지, 상황에 맞게 대응하며<br />
              청소에 필요한 장비 또한 당사에서 세팅 후 파견합니다.<br />
              전문성과 신뢰를 바탕으로, 깨끗하고 쾌적한 환경을 함께 만들어갑니다.
            </p>
          </div>
        </div>

        <div className="lg:w-1/2 bg-white relative flex items-center justify-center min-h-[400px] lg:min-h-0">
          {/* 장식 아이콘 */}
          <div className="absolute right-0 bottom-0 w-3/4 opacity-10 translate-x-1/4 translate-y-1/4">
            <Users className="w-full h-auto" strokeWidth={0.5} />
          </div>
        </div>
      </section>

      {/* Education Section - 교육 프로그램 */}
      <section className="m-6 md:m-12 rounded-3xl overflow-hidden relative min-h-[80vh] bg-black">
        {/* 배경 이미지 */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-gray-700 to-gray-900"></div>
          <div className="absolute inset-0 bg-black/40"></div>
        </div>

        <div className="relative z-10 p-12 lg:p-20 flex flex-col min-h-[80vh]">
          <div className="mb-auto">
            <div className="text-lg font-bold text-white mb-2">오늘교육</div>
            <div className="text-7xl lg:text-8xl font-bold text-white/50 mb-8">Education</div>
            <p className="text-white text-lg leading-relaxed max-w-3xl">
              탄탄한 기본기를 바탕으로 한 단계 깊은 심화 과정을 통해 실무에 필요한 전문성을 키울 수 있습니다.<br />
              가정, 상업, 냉난방기 등 상황에 맞는 과정을 선택해 자신에게 꼭 맞는 학습을 이어갈 수 있습니다.<br />
              이론과 실습을 균형 있게 구성해 배운 내용을 곧바로 현장에 적용할 수 있도록 설계했습니다.
            </p>
          </div>

          <div className="flex items-center justify-center gap-12 py-12">
            {/* 기본기 원 */}
            <div className="group">
              <div className="w-64 h-64 rounded-full bg-white flex items-center justify-center transition-transform group-hover:scale-75 cursor-pointer">
                <div className="text-3xl font-bold">기본기</div>
              </div>
            </div>

            <ChevronRight className="text-white w-12 h-12 hidden md:block" />

            {/* 심화 원 */}
            <div className="group">
              <div className="w-64 h-64 rounded-full bg-black border-2 border-white flex flex-col items-center justify-center text-white transition-transform group-hover:scale-125 cursor-pointer">
                <div className="text-3xl font-bold mb-2">심화</div>
                <div className="text-sm font-semibold mb-3">선택가능</div>
                <div className="flex flex-col gap-2">
                  {['가정', '상업', '냉난방기'].map((option) => (
                    <span key={option} className="px-4 py-1 bg-white text-black rounded-full text-sm">
                      {option}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Building Care Section - 건물종합관리 */}
      <section className="py-24 px-6 md:px-12 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="mb-12">
            <div className="text-lg font-bold text-black mb-2">오늘건물종합관리</div>
            <div className="text-7xl lg:text-8xl font-bold text-black">Building Care</div>
          </div>

          <div className="flex flex-col lg:flex-row gap-8">
            {/* 탭 버튼 */}
            <div className="flex lg:flex-col gap-0 border border-black">
              {[
                { id: 'cleaning' as const, label: '미화 관리' },
                { id: 'realestate' as const, label: '부동산중개' },
                { id: 'facility' as const, label: '시설관리' }
              ].map((tab, index) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveBuildingTab(tab.id)}
                  className={`flex-1 lg:w-56 h-28 text-lg font-medium transition-colors border-black ${
                    index > 0 ? 'border-t lg:border-t lg:border-l-0' : ''
                  } ${
                    activeBuildingTab === tab.id
                      ? 'bg-black text-white'
                      : 'bg-white text-black hover:bg-gray-100'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* 콘텐츠 */}
            <div className="flex-1 relative min-h-[400px] rounded-2xl overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-gray-400 to-gray-600"></div>

              <div className="relative h-full flex items-center justify-center p-8">
                <div className="bg-white/90 backdrop-blur rounded-2xl p-8 max-w-3xl">
                  {activeBuildingTab === 'cleaning' && (
                    <div className="flex flex-col md:flex-row gap-6">
                      <div className="flex-1">
                        <p className="text-lg leading-relaxed mb-4">
                          쾌적한 환경유지를 위해 정기적인 서비스교육과 위생교육 및 모니터링을 실시하여 고품질의 서비스를 제공합니다.<br /><br />
                          본사직원의 청소대행 서비스로 사무실, 복도, 계단, 화장실, 주차장 등을 깨끗하게 관리하세요.
                        </p>
                      </div>
                      <div className="border-l border-gray-300 pl-6 md:w-56">
                        <h4 className="font-bold text-lg mb-4">[기대효과]</h4>
                        <ul className="space-y-2 text-sm font-semibold">
                          <li>• 건물 가치 상승</li>
                          <li>• 세입자 만족도 향상</li>
                          <li>• 공실률 최소화</li>
                          <li>• 관리 비용 절감</li>
                        </ul>
                      </div>
                    </div>
                  )}
                  {activeBuildingTab === 'realestate' && (
                    <div className="flex flex-col md:flex-row gap-6">
                      <div className="flex-1">
                        <p className="text-lg leading-relaxed mb-4">
                          전문적인 부동산 중개 서비스를 통해 최적의 매물을 찾아드립니다.<br /><br />
                          시장 분석과 법률 검토를 통해 안전하고 투명한 거래를 지원하며, 고객의 자산 가치를 극대화합니다.
                        </p>
                      </div>
                      <div className="border-l border-gray-300 pl-6 md:w-56">
                        <h4 className="font-bold text-lg mb-4">[기대효과]</h4>
                        <ul className="space-y-2 text-sm font-semibold">
                          <li>• 최적의 매물 발굴</li>
                          <li>• 안전한 거래 보장</li>
                          <li>• 시장 가치 분석</li>
                          <li>• 전문 컨설팅 제공</li>
                        </ul>
                      </div>
                    </div>
                  )}
                  {activeBuildingTab === 'facility' && (
                    <div className="flex flex-col md:flex-row gap-6">
                      <div className="flex-1">
                        <p className="text-lg leading-relaxed mb-4">
                          건물의 모든 시설을 체계적으로 관리하여 안전하고 쾌적한 환경을 유지합니다.<br /><br />
                          정기점검과 예방정비를 통해 시설의 수명을 연장하고, 갑작스러운 고장을 방지합니다.
                        </p>
                      </div>
                      <div className="border-l border-gray-300 pl-6 md:w-56">
                        <h4 className="font-bold text-lg mb-4">[기대효과]</h4>
                        <ul className="space-y-2 text-sm font-semibold">
                          <li>• 시설 수명 연장</li>
                          <li>• 안전사고 예방</li>
                          <li>• 에너지 효율 향상</li>
                          <li>• 긴급 대응 체계</li>
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-6 md:px-12">
        <div className="max-w-7xl mx-auto text-center">
          <div className="text-2xl font-bold mb-4">오늘청소 | ONUL</div>
          <p className="text-gray-400">
            깨끗한 오늘, 더 나은 내일을 만들어갑니다.
          </p>
        </div>
      </footer>
    </div>
  );
}
