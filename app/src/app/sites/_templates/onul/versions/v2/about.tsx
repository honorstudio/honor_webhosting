'use client';

import { useState, useEffect } from 'react';
import {
  ArrowRight,
  Users,
  Target,
  Heart,
  Award,
  TrendingUp,
  Shield,
  CheckCircle,
  Sparkles,
  Building2,
  Clock,
  ChevronDown
} from 'lucide-react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { createClient } from '@/lib/supabase/client';

/**
 * 오늘청소 기업소개 페이지 - v2 (리디자인)
 *
 * 디자인 컨셉: 기업소개 페이지만의 차별화된 느낌
 * - 무채색 기반 (흰색, 회색, 검정)
 * - 포인트 컬러: 브랜드 컬러 (Supabase에서 동적으로 로드)
 * - 애니메이션 숫자 카운터 (스크롤 트리거)
 * - 회사 연혁 타임라인
 * - CEO 인사말 섹션
 * - 인포그래픽 요소 (진행률 바, 원형 그래프)
 */

// 브랜딩 타입
interface SiteBranding {
  brand_color: string;
}

// 브랜드 컬러에서 다크 버전 생성 (명도와 채도를 낮춰 무채색에 가깝게)
function getDarkBrandColor(hexColor: string): string {
  const r = parseInt(hexColor.slice(1, 3), 16);
  const g = parseInt(hexColor.slice(3, 5), 16);
  const b = parseInt(hexColor.slice(5, 7), 16);

  const rNorm = r / 255;
  const gNorm = g / 255;
  const bNorm = b / 255;

  const max = Math.max(rNorm, gNorm, bNorm);
  const min = Math.min(rNorm, gNorm, bNorm);
  let h = 0;

  if (max !== min) {
    const d = max - min;
    switch (max) {
      case rNorm:
        h = ((gNorm - bNorm) / d + (gNorm < bNorm ? 6 : 0)) / 6;
        break;
      case gNorm:
        h = ((bNorm - rNorm) / d + 2) / 6;
        break;
      case bNorm:
        h = ((rNorm - gNorm) / d + 4) / 6;
        break;
    }
  }

  // 명도를 8%로 더 낮추고, 채도를 15%로 대폭 낮춤 (무채색에 가깝게)
  const darkL = 0.08;
  const darkS = 0.15;

  const hue2rgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1/6) return p + (q - p) * 6 * t;
    if (t < 1/2) return q;
    if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
    return p;
  };

  const q = darkL < 0.5 ? darkL * (1 + darkS) : darkL + darkS - darkL * darkS;
  const p = 2 * darkL - q;
  const rOut = Math.round(hue2rgb(p, q, h + 1/3) * 255);
  const gOut = Math.round(hue2rgb(p, q, h) * 255);
  const bOut = Math.round(hue2rgb(p, q, h - 1/3) * 255);

  return `#${rOut.toString(16).padStart(2, '0')}${gOut.toString(16).padStart(2, '0')}${bOut.toString(16).padStart(2, '0')}`;
}

// 회사 연혁 데이터
const COMPANY_HISTORY = [
  {
    year: '2020',
    title: '오늘청소 설립',
    description: '전문 청소 서비스 시작'
  },
  {
    year: '2021',
    title: '서비스 확장',
    description: '기업 청소 부문 진출'
  },
  {
    year: '2022',
    title: '파트너십 강화',
    description: '50개 기업과 파트너 계약'
  },
  {
    year: '2023',
    title: '품질 인증 획득',
    description: '전문 인력 100명 돌파'
  },
  {
    year: '2025',
    title: '지속 성장',
    description: '누적 프로젝트 500건 달성'
  }
];

// 핵심 역량 데이터 (인포그래픽용)
const CORE_COMPETENCIES = [
  {
    icon: Shield,
    title: '신뢰성',
    percentage: 98,
    description: '고객 만족도'
  },
  {
    icon: Users,
    title: '전문성',
    percentage: 95,
    description: '전문 인력 보유율'
  },
  {
    icon: Target,
    title: '품질',
    percentage: 100,
    description: '품질 관리 시스템'
  }
];

// 핵심 가치
const CORE_VALUES = [
  {
    icon: Shield,
    title: '투명한 가격',
    description: '불필요한 비용 없이 정직한 견적을 제공합니다'
  },
  {
    icon: Heart,
    title: '고객 중심',
    description: '고객의 만족이 우리의 최우선 가치입니다'
  },
  {
    icon: Award,
    title: '전문성',
    description: '철저한 교육을 받은 전문 마스터들이 서비스합니다'
  }
];

// KESG 비전 목표 데이터 (4개 카테고리)
const KESG_GOALS = [
  {
    category: '고객중심',
    categoryEn: 'Customer',
    icon: Users,
    color: 'blue',
    goals: [
      { id: 1, title: '고객 만족도 95% 이상 유지' },
      { id: 2, title: '투명한 견적과 정직한 서비스 제공' },
      { id: 3, title: '맞춤형 청소 솔루션 개발' },
      { id: 4, title: '24시간 신속한 고객 응대 체계' },
      { id: 5, title: '고객 소통 채널 다양화' },
    ]
  },
  {
    category: '전문성',
    categoryEn: 'Expertise',
    icon: Award,
    color: 'gray',
    goals: [
      { id: 6, title: '전문 마스터 양성 교육 프로그램 운영' },
      { id: 7, title: '체계적인 품질 관리 시스템 구축' },
      { id: 8, title: '최신 청소 기술과 장비 도입' },
      { id: 9, title: '서비스 표준화 및 매뉴얼 구축' },
      { id: 10, title: '정기적인 서비스 품질 평가' },
    ]
  },
  {
    category: '친환경',
    categoryEn: 'Environment',
    icon: Heart,
    color: 'gray',
    goals: [
      { id: 11, title: '친환경 세제 사용 확대' },
      { id: 12, title: '자원 절약형 청소 방식 도입' },
      { id: 13, title: '탄소 배출 저감 활동 실천' },
      { id: 14, title: '재활용 및 폐기물 최소화' },
      { id: 15, title: '친환경 인증 획득 및 유지' },
    ]
  },
  {
    category: '사회공헌',
    categoryEn: 'Social',
    icon: TrendingUp,
    color: 'gray',
    goals: [
      { id: 16, title: '취약계층 무료 청소 지원' },
      { id: 17, title: '지역 일자리 창출 기여' },
      { id: 18, title: '지역사회 봉사활동 참여' },
      { id: 19, title: '파트너사와 상생 협력' },
    ]
  }
];

// 애니메이션 숫자 카운터 컴포넌트
function AnimatedCounter({ end, duration = 2000, isVisible }: { end: number; duration?: number; isVisible: boolean }) {
  const [count, setCount] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    if (!isVisible || hasAnimated) return;

    setHasAnimated(true);
    const startTime = Date.now();
    const endTime = startTime + duration;

    const updateCount = () => {
      const now = Date.now();
      const progress = Math.min((now - startTime) / duration, 1);
      const easeOutQuart = 1 - Math.pow(1 - progress, 4); // easing 함수

      setCount(Math.floor(easeOutQuart * end));

      if (now < endTime) {
        requestAnimationFrame(updateCount);
      } else {
        setCount(end);
      }
    };

    requestAnimationFrame(updateCount);
  }, [isVisible, end, duration, hasAnimated]);

  return <>{count}</>;
}

// 원형 진행률 컴포넌트
function CircularProgress({ percentage, isVisible, brandColor }: { percentage: number; isVisible: boolean; brandColor: string }) {
  const [animatedPercentage, setAnimatedPercentage] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (animatedPercentage / 100) * circumference;

  useEffect(() => {
    if (!isVisible || hasAnimated) return;

    setHasAnimated(true);
    const duration = 1500;
    const startTime = Date.now();

    const updatePercentage = () => {
      const now = Date.now();
      const progress = Math.min((now - startTime) / duration, 1);
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);

      setAnimatedPercentage(easeOutQuart * percentage);

      if (progress < 1) {
        requestAnimationFrame(updatePercentage);
      }
    };

    requestAnimationFrame(updatePercentage);
  }, [isVisible, percentage, hasAnimated]);

  return (
    <svg width="160" height="160" className="transform -rotate-90">
      {/* 배경 원 */}
      <circle
        cx="80"
        cy="80"
        r={radius}
        fill="none"
        stroke="currentColor"
        strokeWidth="12"
        className="text-gray-200"
      />
      {/* 진행률 원 */}
      <circle
        cx="80"
        cy="80"
        r={radius}
        fill="none"
        stroke={brandColor}
        strokeWidth="12"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        className="transition-all duration-1000 ease-out"
      />
    </svg>
  );
}

export default function OnulAboutV2() {
  const [visibleSections, setVisibleSections] = useState<Set<string>>(new Set());
  const [branding, setBranding] = useState<SiteBranding>({ brand_color: '#67c0a1' });

  // Supabase에서 브랜딩 정보 로드
  useEffect(() => {
    const loadBranding = async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from('sites')
        .select('brand_color')
        .eq('slug', 'onul')
        .single();

      if (data?.brand_color) {
        setBranding({ brand_color: data.brand_color });
      }
    };
    loadBranding();
  }, []);

  // 다크 브랜드 컬러 계산
  const darkBrandColor = getDarkBrandColor(branding.brand_color);

  // Intersection Observer로 섹션 애니메이션 트리거
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisibleSections((prev) => new Set(prev).add(entry.target.id));
          }
        });
      },
      { threshold: 0.15 }
    );

    const sections = document.querySelectorAll('.animate-section');
    sections.forEach((section) => observer.observe(section));

    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* 공통 헤더 (About 페이지는 투명 배경 없이 항상 흰색) */}
      <Header transparentOnTop={false} />

      {/* Section 1: Hero - 기업소개 전용 (밝은 배경 + 큰 숫자/기하학적 요소) */}
      <section
        id="hero"
        className="animate-section relative min-h-screen flex items-center bg-white overflow-hidden pt-20"
      >
        {/* 배경 기하학적 요소 */}
        <div className="absolute inset-0 overflow-hidden">
          {/* 큰 원형 오브젝트 */}
          <div className="absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full opacity-60" style={{ backgroundColor: `${branding.brand_color}15` }} />
          <div className="absolute -bottom-48 -left-48 w-[600px] h-[600px] rounded-full bg-gray-100 opacity-50" />
          {/* 라인 패턴 */}
          <div className="absolute top-1/4 right-0 w-px h-48" style={{ background: `linear-gradient(to bottom, transparent, ${branding.brand_color}40, transparent)` }} />
          <div className="absolute bottom-1/3 left-20 w-32 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 w-full">
          <div className="grid lg:grid-cols-2 gap-12 items-center min-h-[calc(100vh-80px)]">
            {/* 왼쪽: 대형 숫자 + 텍스트 */}
            <div className={`transition-all duration-1000 ${
              visibleSections.has('hero') ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-12'
            }`}>
              {/* 대형 연도 */}
              <div className="relative mb-8">
                <span className="text-[180px] md:text-[240px] font-black text-gray-100 leading-none select-none">
                  5
                </span>
                <div className="absolute bottom-8 left-24 md:left-32">
                  <p className="text-sm font-medium tracking-widest uppercase mb-2" style={{ color: branding.brand_color }}>Since 2020</p>
                  <p className="text-2xl md:text-3xl font-bold text-gray-900">Years of Excellence</p>
                </div>
              </div>

              {/* 타이틀 */}
              <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
                공간을 넘어<br />
                <span style={{ color: branding.brand_color }}>삶의 가치</span>를 높입니다
              </h1>

              <p className="text-lg text-gray-600 mb-8 max-w-lg">
                오늘청소는 2020년 설립 이래 500건 이상의 프로젝트를 성공적으로 완료하며,
                청소 서비스의 새로운 기준을 만들어가고 있습니다.
              </p>

              {/* 핵심 지표 카드 - 모바일에서 세로 배치 */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-6">
                <div className="text-white px-5 py-3 sm:px-6 sm:py-4 rounded-2xl flex-1" style={{ backgroundColor: darkBrandColor }}>
                  <div className="text-2xl sm:text-3xl font-bold" style={{ color: branding.brand_color }}>500+</div>
                  <div className="text-xs sm:text-sm text-gray-400">프로젝트</div>
                </div>
                <div className="text-white px-5 py-3 sm:px-6 sm:py-4 rounded-2xl flex-1" style={{ backgroundColor: branding.brand_color }}>
                  <div className="text-2xl sm:text-3xl font-bold">98%</div>
                  <div className="text-xs sm:text-sm" style={{ color: `${branding.brand_color}80` }}>만족도</div>
                </div>
                <div className="border-2 border-gray-200 px-5 py-3 sm:px-6 sm:py-4 rounded-2xl flex-1">
                  <div className="text-2xl sm:text-3xl font-bold text-gray-900">50+</div>
                  <div className="text-xs sm:text-sm text-gray-500">전문 인력</div>
                </div>
              </div>
            </div>

            {/* 오른쪽: 기하학적 디자인 요소 */}
            <div className={`relative hidden lg:block transition-all duration-1000 delay-300 ${
              visibleSections.has('hero') ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-12'
            }`}>
              <div className="relative h-[500px] flex items-center justify-center">
                {/* 기하학적 도형들 */}
                <div className="absolute inset-0 flex items-center justify-center">
                  {/* 큰 원 - 배경 */}
                  <div className="absolute w-80 h-80 rounded-full border-2 border-gray-200 animate-spin-slow" style={{ animationDuration: '30s' }} />
                  {/* 중간 원 */}
                  <div className="absolute w-64 h-64 rounded-full border-2" style={{ borderColor: `${branding.brand_color}40` }} />
                  {/* 작은 원 - 채워진 */}
                  <div className="absolute w-48 h-48 rounded-full" style={{ background: `linear-gradient(to bottom right, ${branding.brand_color}25, ${branding.brand_color}10)` }} />
                </div>

                {/* 중앙 아이콘 */}
                <div className="relative z-10 w-32 h-32 bg-white rounded-3xl shadow-2xl flex items-center justify-center">
                  <Sparkles className="w-16 h-16" style={{ color: branding.brand_color }} />
                </div>

                {/* 플로팅 배지들 */}
                <div className="absolute -left-4 top-1/4 bg-white shadow-xl rounded-2xl p-4 animate-float">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: branding.brand_color }}>
                      <Award className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-gray-900">품질 인증</div>
                      <div className="text-xs text-gray-500">ISO 9001</div>
                    </div>
                  </div>
                </div>

                <div className="absolute right-0 top-1/3 text-white shadow-xl rounded-2xl p-4 animate-float-delayed" style={{ backgroundColor: darkBrandColor }}>
                  <div className="text-center">
                    <div className="text-2xl font-bold" style={{ color: branding.brand_color }}>5년</div>
                    <div className="text-xs text-gray-400">업력</div>
                  </div>
                </div>

                <div className="absolute left-8 bottom-20 text-white shadow-xl rounded-2xl p-4 animate-float" style={{ backgroundColor: branding.brand_color }}>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5" />
                    <span className="text-sm font-medium">전문 서비스</span>
                  </div>
                </div>

                <div className="absolute right-12 bottom-8 bg-white shadow-xl rounded-2xl p-4 animate-float-delayed">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                      <Users className="w-5 h-5 text-gray-600" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-gray-900">50+</div>
                      <div className="text-xs text-gray-500">전문 인력</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 스크롤 다운 인디케이터 (홈과 동일) */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce">
          <ChevronDown className="w-8 h-8 text-gray-400" />
        </div>
      </section>

      {/* Section 2: CEO Message - CEO 인사말 */}
      <section
        id="ceo-message"
        className="animate-section relative min-h-screen flex items-center bg-white py-24 md:py-32"
      >
        <div className="max-w-7xl mx-auto px-6 md:px-12 w-full">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            {/* 텍스트 */}
            <div className={`space-y-8 transition-all duration-1000 delay-200 ${
              visibleSections.has('ceo-message') ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'
            }`}>
              <div>
                <p className="text-sm font-medium tracking-widest uppercase mb-4" style={{ color: branding.brand_color }}>
                  CEO Message
                </p>
                <h2 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                  더 나은 내일을<br />
                  만드는<br />
                  <span style={{ color: branding.brand_color }}>시작</span>
                </h2>
              </div>

              <div className="prose prose-lg text-gray-600 leading-relaxed space-y-6">
                <p className="text-xl font-medium text-gray-900">
                  "깨끗한 공간은 더 나은 삶의 시작입니다."
                </p>
                <p>
                  오늘청소는 단순한 청소 서비스가 아닌, <strong className="text-gray-900">삶의 질을 높이는 생활 솔루션</strong>을 제공하고자 하는 마음에서 시작되었습니다.
                </p>
                <p>
                  우리는 매일 수많은 공간을 만나며, 그 안에서 살아가는 사람들의 다양한 삶과 마주합니다. 청소를 단순한 '일'이 아닌 <strong style={{ color: branding.brand_color }}>사람과 공간을 연결하는 일</strong>로 바라보며, 고객의 신뢰를 가장 중요하게 생각합니다.
                </p>
                <p className="text-base text-gray-500 italic pt-4 border-t border-gray-200">
                  오늘청소 대표 드림
                </p>
              </div>
            </div>

            {/* 대표 프로필 - 컴팩트 디자인 */}
            <div className={`flex justify-center lg:justify-end transition-all duration-1000 delay-400 ${
              visibleSections.has('ceo-message') ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'
            }`}>
              <div className="relative">
                {/* 배경 장식 원 */}
                <div className="absolute -inset-4 rounded-full opacity-50" style={{ backgroundColor: `${branding.brand_color}25` }} />
                <div className="absolute -inset-8 border-2 rounded-full opacity-30" style={{ borderColor: `${branding.brand_color}40` }} />

                {/* 프로필 이미지 */}
                <div className="relative w-48 h-48 md:w-56 md:h-56 rounded-full overflow-hidden shadow-2xl ring-4 ring-white">
                  <img
                    src="https://cdn.imweb.me/upload/S202411166380e02dc267b/f11dd5a595b85.jpg"
                    alt="대표 이사"
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* 이름 태그 */}
                <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-4 py-2 rounded-full shadow-lg">
                  <p className="text-sm font-medium whitespace-nowrap">오늘청소 대표</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 3: Achievements - 애니메이션 숫자로 보는 성과 */}
      <section
        id="achievements"
        className="animate-section relative bg-gray-50 py-24 md:py-32"
      >
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          {/* 헤더 */}
          <div className={`text-center mb-16 transition-all duration-1000 ${
            visibleSections.has('achievements') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}>
            <p className="text-sm font-medium tracking-widest uppercase mb-4" style={{ color: branding.brand_color }}>
              By The Numbers
            </p>
            <h2 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              숫자로 증명하는<br />
              <span style={{ color: branding.brand_color }}>신뢰</span>
            </h2>
          </div>

          {/* 애니메이션 통계 카운터 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 mb-20">
            {[
              { number: 500, label: '완료 프로젝트', suffix: '+' },
              { number: 98, label: '고객 만족도', suffix: '%' },
              { number: 50, label: '전문 인력', suffix: '+' },
              { number: 5, label: '업력 (년)', suffix: '+' }
            ].map((stat, index) => (
              <div
                key={stat.label}
                className={`text-center transition-all duration-1000 ${
                  visibleSections.has('achievements') ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
                }`}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <div className="text-5xl md:text-7xl font-bold text-gray-900 mb-2">
                  <AnimatedCounter
                    end={stat.number}
                    duration={2000}
                    isVisible={visibleSections.has('achievements')}
                  />
                  <span style={{ color: branding.brand_color }}>{stat.suffix}</span>
                </div>
                <div className="text-sm md:text-base text-gray-500 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* 진행률 바 */}
          <div className="space-y-8">
            {[
              { label: '품질 관리', percentage: 100 },
              { label: '고객 만족', percentage: 98 },
              { label: '재방문율', percentage: 95 },
              { label: '정시 완료', percentage: 97 }
            ].map((item, index) => (
              <div
                key={item.label}
                className={`transition-all duration-1000 ${
                  visibleSections.has('achievements') ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'
                }`}
                style={{ transitionDelay: `${400 + index * 100}ms` }}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-base md:text-lg font-medium text-gray-900">{item.label}</span>
                  <span className="text-base md:text-lg font-bold" style={{ color: branding.brand_color }}>{item.percentage}%</span>
                </div>
                <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-2000 ease-out"
                    style={{
                      backgroundColor: branding.brand_color,
                      width: visibleSections.has('achievements') ? `${item.percentage}%` : '0%',
                      transitionDelay: `${500 + index * 100}ms`
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 4: Values - 핵심 가치 */}
      <section
        id="values"
        className="animate-section relative py-24 md:py-32"
        style={{ backgroundColor: darkBrandColor }}
      >
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          {/* 헤더 */}
          <div className={`max-w-3xl mb-16 transition-all duration-1000 ${
            visibleSections.has('values') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}>
            <p className="text-sm font-medium tracking-widest uppercase mb-4" style={{ color: branding.brand_color }}>
              Our Values
            </p>
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 leading-tight">
              우리가 중요하게<br />생각하는 것들
            </h2>
            <p className="text-lg text-gray-400 leading-relaxed">
              우리는 청소의 품질만큼 고객의 신뢰를 가장 중요하게 생각합니다. 불필요한 비용 없이, 투명하고 정직한 서비스로 다시 찾고 싶은 청소 브랜드가 되기 위해 오늘도 한 걸음씩 성장하고 있습니다.
            </p>
          </div>

          {/* 가치 카드 */}
          <div className="grid md:grid-cols-3 gap-8">
            {CORE_VALUES.map((value, index) => (
              <div
                key={value.title}
                className={`group bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 hover:bg-white/10 transition-all duration-500 ${
                  visibleSections.has('values') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                }`}
                style={{ transitionDelay: `${200 + index * 150}ms` }}
                onMouseEnter={(e) => e.currentTarget.style.borderColor = `${branding.brand_color}50`}
                onMouseLeave={(e) => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'}
              >
                <div
                  className="w-14 h-14 mb-6 rounded-full flex items-center justify-center group-hover:scale-110 transition-all duration-300"
                  style={{ backgroundColor: `${branding.brand_color}30` }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = branding.brand_color}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = `${branding.brand_color}30`}
                >
                  <value.icon className="w-7 h-7 text-white transition-colors" style={{ color: branding.brand_color }} />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">{value.title}</h3>
                <p className="text-gray-400 leading-relaxed">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 5: Company History - 회사 연혁 타임라인 */}
      <section
        id="history"
        className="animate-section relative bg-white py-24 md:py-32"
      >
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          {/* 헤더 */}
          <div className={`text-center mb-16 transition-all duration-1000 ${
            visibleSections.has('history') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}>
            <p className="text-sm font-medium tracking-widest uppercase mb-4" style={{ color: branding.brand_color }}>
              Our History
            </p>
            <h2 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              함께 걸어온<br />
              <span style={{ color: branding.brand_color }}>5년의 여정</span>
            </h2>
          </div>

          {/* 타임라인 */}
          <div className="relative">
            {/* 중앙 세로선 (데스크톱) */}
            <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-0.5 bg-gray-200 -translate-x-1/2" />

            {/* 타임라인 아이템 */}
            <div className="space-y-16 md:space-y-24">
              {COMPANY_HISTORY.map((item, index) => {
                const isLeft = index % 2 === 0;
                return (
                  <div
                    key={item.year}
                    className={`relative transition-all duration-1000 ${
                      visibleSections.has('history') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                    }`}
                    style={{ transitionDelay: `${index * 150}ms` }}
                  >
                    {/* 모바일 레이아웃 */}
                    <div className="md:hidden flex gap-4">
                      <div className="relative flex-shrink-0">
                        {/* 원형 포인트 */}
                        <div className="w-4 h-4 rounded-full ring-4" style={{ backgroundColor: branding.brand_color, boxShadow: `0 0 0 4px ${branding.brand_color}25` }} />
                        {/* 세로선 */}
                        {index < COMPANY_HISTORY.length - 1 && (
                          <div className="absolute top-4 left-1/2 w-0.5 h-16 bg-gray-200 -translate-x-1/2" />
                        )}
                      </div>
                      <div className="flex-1 pb-12">
                        <div className="text-2xl font-bold mb-2" style={{ color: branding.brand_color }}>{item.year}</div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">{item.title}</h3>
                        <p className="text-gray-600">{item.description}</p>
                      </div>
                    </div>

                    {/* 데스크톱 레이아웃 */}
                    <div className="hidden md:grid grid-cols-2 gap-12 items-center">
                      {isLeft ? (
                        <>
                          {/* 왼쪽 콘텐츠 */}
                          <div className="text-right">
                            <div className="inline-block text-right">
                              <div className="text-3xl font-bold mb-2" style={{ color: branding.brand_color }}>{item.year}</div>
                              <h3 className="text-2xl font-bold text-gray-900 mb-2">{item.title}</h3>
                              <p className="text-gray-600">{item.description}</p>
                            </div>
                          </div>
                          {/* 오른쪽 빈 공간 */}
                          <div />
                        </>
                      ) : (
                        <>
                          {/* 왼쪽 빈 공간 */}
                          <div />
                          {/* 오른쪽 콘텐츠 */}
                          <div>
                            <div className="text-3xl font-bold mb-2" style={{ color: branding.brand_color }}>{item.year}</div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-2">{item.title}</h3>
                            <p className="text-gray-600">{item.description}</p>
                          </div>
                        </>
                      )}

                      {/* 중앙 포인트 */}
                      <div className="absolute left-1/2 top-0 w-6 h-6 rounded-full ring-4 ring-white shadow-md -translate-x-1/2" style={{ backgroundColor: branding.brand_color }}>
                        <div className="absolute inset-0 rounded-full animate-ping opacity-50" style={{ backgroundColor: branding.brand_color }} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Section 6: Core Competencies - 핵심 역량 (원형 그래프) */}
      <section
        id="competencies"
        className="animate-section relative bg-gray-50 py-24 md:py-32"
      >
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          {/* 헤더 */}
          <div className={`text-center mb-16 transition-all duration-1000 ${
            visibleSections.has('competencies') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}>
            <p className="text-sm font-medium tracking-widest uppercase mb-4" style={{ color: branding.brand_color }}>
              Core Competencies
            </p>
            <h2 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              우리의<br />
              <span style={{ color: branding.brand_color }}>핵심 역량</span>
            </h2>
          </div>

          {/* 원형 그래프 그리드 */}
          <div className="grid md:grid-cols-3 gap-12 md:gap-16">
            {CORE_COMPETENCIES.map((item, index) => (
              <div
                key={item.title}
                className={`flex flex-col items-center text-center transition-all duration-1000 ${
                  visibleSections.has('competencies') ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
                }`}
                style={{ transitionDelay: `${index * 150}ms` }}
              >
                {/* 원형 진행률 */}
                <div className="relative mb-6">
                  <CircularProgress
                    percentage={item.percentage}
                    isVisible={visibleSections.has('competencies')}
                    brandColor={branding.brand_color}
                  />
                  {/* 중앙 아이콘 및 퍼센트 */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <item.icon className="w-8 h-8 mb-2" style={{ color: branding.brand_color }} />
                    <div className="text-3xl font-bold text-gray-900">
                      {visibleSections.has('competencies') ? item.percentage : 0}%
                    </div>
                  </div>
                </div>

                {/* 텍스트 */}
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-600">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 7: Vision - 비전 (큰 타이포그래피) */}
      <section
        id="vision"
        className="animate-section relative bg-white py-24 md:py-32"
      >
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className={`text-center transition-all duration-1000 ${
            visibleSections.has('vision') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}>
            <p className="text-sm font-medium tracking-widest uppercase mb-8" style={{ color: branding.brand_color }}>
              Our Vision
            </p>

            {/* 큰 타이포그래피 */}
            <h2 className="text-5xl md:text-7xl lg:text-8xl font-bold text-gray-900 mb-12 leading-tight">
              깨끗한 공간,<br />
              <span style={{ color: branding.brand_color }}>더 나은 삶</span>
            </h2>

            <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto mb-16 leading-relaxed">
              우리는 청소를 통해 단순히 공간을 깨끗하게 하는 것을 넘어,<br className="hidden md:block" />
              사람들의 삶의 질을 높이고 더 나은 내일을 만드는 것을 목표로 합니다.
            </p>

            {/* 핵심 가치 카드 */}
            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {CORE_VALUES.map((value, index) => (
                <div
                  key={value.title}
                  className={`bg-gray-50 rounded-2xl p-8 transition-all duration-1000 ${
                    visibleSections.has('vision') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                  }`}
                  style={{ transitionDelay: `${200 + index * 100}ms` }}
                >
                  <value.icon className="w-12 h-12 mx-auto mb-4" style={{ color: branding.brand_color }} />
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{value.title}</h3>
                  <p className="text-gray-600">{value.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Section 8: KESG Goals - 비전 및 전략 목표 */}
      <section
        id="kesg-goals"
        className="animate-section relative py-24 md:py-32 overflow-hidden"
        style={{ backgroundColor: darkBrandColor }}
      >
        {/* 배경 장식 */}
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full blur-3xl" style={{ backgroundColor: `${branding.brand_color}08` }} />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-white/5 blur-3xl" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12">
          {/* 헤더 */}
          <div className={`text-center mb-16 transition-all duration-1000 ${
            visibleSections.has('kesg-goals') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}>
            <p className="text-sm font-medium tracking-widest uppercase mb-4" style={{ color: branding.brand_color }}>
              Vision & Strategy
            </p>
            <h2 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
              오늘청소<br />
              <span style={{ color: branding.brand_color }}>비전 및 전략</span>
            </h2>
            <div className="inline-block backdrop-blur-sm rounded-full px-6 py-3 mt-4" style={{ backgroundColor: `${branding.brand_color}30` }}>
              <p className="text-white text-lg md:text-xl font-medium">
                깨끗한 환경과 전문 서비스로 모두가 행복한 일상을 만들어갑니다
              </p>
            </div>
          </div>

          {/* 4개 카테고리 그리드 */}
          <div className="grid md:grid-cols-2 gap-6 md:gap-8">
            {KESG_GOALS.map((category, categoryIndex) => (
              <div
                key={category.category}
                className={`group relative bg-white/5 backdrop-blur-sm rounded-3xl p-8 border border-white/10
                  hover:bg-white/10 transition-all duration-500 ${
                  visibleSections.has('kesg-goals') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                }`}
                style={{ transitionDelay: `${200 + categoryIndex * 100}ms` }}
                onMouseEnter={(e) => e.currentTarget.style.borderColor = `${branding.brand_color}30`}
                onMouseLeave={(e) => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'}
              >
                {/* 카테고리 헤더 */}
                <div className="flex items-center gap-4 mb-6">
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 bg-white/10 group-hover:scale-110"
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = branding.brand_color}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)'}
                  >
                    <category.icon className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white">{category.category}</h3>
                    <p className="text-sm text-gray-500 uppercase tracking-wider">{category.categoryEn}</p>
                  </div>
                </div>

                {/* 목표 리스트 */}
                <ul className="space-y-3">
                  {category.goals.map((goal, goalIndex) => (
                    <li
                      key={goal.id}
                      className={`flex items-start gap-3 transition-all duration-300 ${
                        visibleSections.has('kesg-goals') ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'
                      }`}
                      style={{ transitionDelay: `${400 + categoryIndex * 100 + goalIndex * 50}ms` }}
                    >
                      <span
                        className="flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold transition-all duration-300 bg-white/10 text-gray-400"
                        style={{ }}
                      >
                        {String(goal.id).padStart(2, '0')}
                      </span>
                      <span className="text-gray-300 text-sm md:text-base leading-relaxed group-hover:text-white transition-colors">
                        {goal.title}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* 호버 시 나타나는 장식선 */}
                <div className="absolute bottom-0 left-8 right-8 h-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ background: `linear-gradient(to right, transparent, ${branding.brand_color}, transparent)` }} />
              </div>
            ))}
          </div>

          {/* 하단 요약 통계 */}
          <div className={`mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 transition-all duration-1000 ${
            visibleSections.has('kesg-goals') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`} style={{ transitionDelay: '800ms' }}>
            {[
              { number: '4', label: '핵심 영역', suffix: '' },
              { number: '19', label: '실천 목표', suffix: '' },
              { number: '95', label: '목표 만족도', suffix: '%' },
              { number: '100', label: '실천 의지', suffix: '%' },
            ].map((stat) => (
              <div
                key={stat.label}
                className="text-center p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 transition-all duration-300"
                onMouseEnter={(e) => e.currentTarget.style.borderColor = `${branding.brand_color}30`}
                onMouseLeave={(e) => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'}
              >
                <div className="text-3xl md:text-4xl font-bold text-white mb-2">
                  <AnimatedCounter
                    end={parseInt(stat.number)}
                    duration={1500}
                    isVisible={visibleSections.has('kesg-goals')}
                  />
                  <span style={{ color: branding.brand_color }}>{stat.suffix}</span>
                </div>
                <div className="text-sm text-gray-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 9: Closing - 마무리 + CTA */}
      <section
        id="closing"
        className="animate-section relative py-24 md:py-32"
        style={{ backgroundColor: darkBrandColor }}
      >
        <div className="max-w-4xl mx-auto px-6 md:px-12 text-center">
          <div className={`transition-all duration-1000 ${
            visibleSections.has('closing') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}>
            <div className="mb-12">
              <p className="text-3xl md:text-4xl text-white mb-8 leading-relaxed font-bold">
                오늘청소와 함께<br />
                <span style={{ color: branding.brand_color }}>더 나은 내일</span>을<br />
                만들어가세요
              </p>
              <p className="text-lg text-gray-400 mb-8">
                5년간의 경험과 전문성으로,<br />
                고객의 공간에 새로운 가치를 더합니다.
              </p>
            </div>

            {/* CTA 버튼 */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/sites/onul#contact"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 text-white rounded-full font-medium transition-all hover:scale-105"
                style={{ backgroundColor: branding.brand_color }}
                onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
                onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
              >
                상담 문의하기
                <ArrowRight className="w-5 h-5" />
              </a>
              <a
                href="/sites/onul"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/10 text-white rounded-full font-medium hover:bg-white/20 transition-all border border-white/20"
              >
                메인으로 돌아가기
              </a>
            </div>

            {/* 회사 로고/서명 */}
            <div className="mt-16 pt-8 border-t border-gray-800">
              <p className="text-2xl font-bold text-white mb-2">오늘청소</p>
              <p className="text-sm text-gray-500">ONUL Cleaning Service</p>
            </div>
          </div>
        </div>
      </section>

      {/* 공통 푸터 */}
      <Footer />

      {/* 애니메이션 CSS */}
      <style jsx global>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        @keyframes float-delayed {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-15px);
          }
        }

        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-float {
          animation: float 3s ease-in-out infinite;
        }

        .animate-float-delayed {
          animation: float-delayed 3.5s ease-in-out infinite;
          animation-delay: 0.5s;
        }

        @keyframes spin-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        .animate-spin-slow {
          animation: spin-slow 30s linear infinite;
        }

        .animate-fade-in {
          animation: fade-in 0.8s ease-out;
        }

        /* 스크롤바 숨기기 */
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }

        /* 부드러운 스크롤 */
        html {
          scroll-behavior: smooth;
        }
      `}</style>
    </div>
  );
}
