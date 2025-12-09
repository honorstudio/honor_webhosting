'use client';

import { useState, useEffect, useRef } from 'react';
import {
  ChevronDown,
  Menu,
  X,
  Shield,
  Smartphone,
  Camera,
  Calendar,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Globe,
  ArrowRight,
  Recycle,
  Building,
  Users,
  Award,
  Clock,
  MapPin,
  Phone,
  Mail
} from 'lucide-react';

/**
 * 오늘 위생산업 - 타투/반영구 바늘 폐기 서비스 랜딩 페이지
 *
 * 디자인 컨셉: Clean & Professional (shadcn 스타일)
 * - 메인: 화이트 배경
 * - 포인트: 오늘 그린 (#67c0a1)
 * - 앱 기능 강조
 * - 반응형 디자인 (PC/모바일)
 */

// 오늘 브랜드 컬러
const BRAND_COLOR = '#67c0a1';
const BRAND_COLOR_DARK = '#4fa889';
const BRAND_COLOR_LIGHT = '#e8f5f0';

export default function OnulHygieneTemplate() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [currentSection, setCurrentSection] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // 스크롤 이벤트 핸들러
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      setScrolled(container.scrollTop > 50);

      // 섹션 감지
      const sections = container.querySelectorAll('.snap-section');
      const containerHeight = container.clientHeight;

      sections.forEach((section, index) => {
        const rect = section.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();
        const relativeTop = rect.top - containerRect.top;

        if (relativeTop >= -containerHeight * 0.5 && relativeTop < containerHeight * 0.5) {
          setCurrentSection(index);
        }
      });
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

  // 섹션 이름
  const sectionNames = ['홈', '소개', '서비스', '문제인식', '해외사례', '비전', '앱소개', '신청'];

  // 섹션으로 스크롤
  const scrollToSection = (index: number) => {
    const container = containerRef.current;
    if (!container) return;

    const sections = container.querySelectorAll('.snap-section');
    if (sections[index]) {
      sections[index].scrollIntoView({ behavior: 'smooth' });
    }
  };

  // 네비게이션
  const navigation = [
    { name: '서비스 소개', href: '#services' },
    { name: '앱 기능', href: '#app' },
    { name: '신청하기', href: '#apply' },
  ];

  return (
    <div
      ref={containerRef}
      className="h-screen overflow-y-auto snap-y snap-mandatory"
      style={{ scrollBehavior: 'auto' }}
    >
      {/* 네비게이션 바 */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled || mobileMenuOpen
            ? 'bg-white/95 backdrop-blur-md shadow-sm'
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="flex items-center justify-between h-20">
            {/* 로고 */}
            <a href="#" className="flex items-center gap-2">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: BRAND_COLOR }}
              >
                <Shield className="w-5 h-5 text-white" />
              </div>
              <span className={`font-bold text-lg ${scrolled || mobileMenuOpen ? 'text-gray-900' : 'text-white'}`}>
                오늘 위생산업
              </span>
            </a>

            {/* 데스크톱 메뉴 */}
            <div className="hidden md:flex items-center gap-8">
              {navigation.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className={`text-sm font-medium transition-colors duration-300 hover:opacity-80 ${
                    scrolled ? 'text-gray-600' : 'text-white/90'
                  }`}
                >
                  {item.name}
                </a>
              ))}
              <a
                href="https://app.onul.day"
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-2 text-white text-sm rounded-full font-medium hover:opacity-90 transition-all"
                style={{ backgroundColor: BRAND_COLOR }}
              >
                앱 사용해보기
              </a>
            </div>

            {/* 모바일 햄버거 */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg transition-colors"
            >
              {mobileMenuOpen ? (
                <X className="text-gray-900 w-5 h-5" />
              ) : (
                <Menu className={`w-5 h-5 ${scrolled ? 'text-gray-900' : 'text-white'}`} />
              )}
            </button>
          </div>
        </div>

        {/* 모바일 메뉴 */}
        <div
          className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
            mobileMenuOpen ? 'max-h-80 opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="bg-white/95 backdrop-blur-md border-t border-gray-100">
            <div className="px-6 py-4 space-y-1">
              {navigation.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="block py-3 px-4 text-gray-700 font-medium rounded-xl transition-all hover:bg-gray-50"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.name}
                </a>
              ))}
              <a
                href="https://app.onul.day"
                target="_blank"
                rel="noopener noreferrer"
                className="block py-3 px-4 mt-2 text-white font-medium rounded-xl text-center transition-all"
                style={{ backgroundColor: BRAND_COLOR }}
                onClick={() => setMobileMenuOpen(false)}
              >
                앱 사용해보기
              </a>
            </div>
          </div>
        </div>
      </nav>

      {/* 섹션 인디케이터 (PC) */}
      <div className="fixed right-4 md:right-6 top-1/2 -translate-y-1/2 z-40 hidden md:flex flex-col items-end gap-2">
        {sectionNames.map((name, index) => (
          <button
            key={index}
            onClick={() => scrollToSection(index)}
            className="group flex items-center gap-3"
          >
            <span
              className={`text-xs font-medium opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0 ${
                currentSection === index ? '' : 'text-gray-500'
              }`}
              style={currentSection === index ? { color: BRAND_COLOR } : undefined}
            >
              {name}
            </span>
            <div className="relative">
              <div
                className={`absolute inset-0 rounded-full transition-all duration-500 ${
                  currentSection === index ? 'scale-[2.5]' : 'scale-100'
                }`}
                style={currentSection === index ? { backgroundColor: `${BRAND_COLOR}20` } : undefined}
              />
              <div
                className={`relative w-2 h-2 rounded-full transition-all duration-300 ${
                  currentSection === index
                    ? 'scale-150'
                    : 'bg-gray-300 group-hover:bg-gray-400 group-hover:scale-125'
                }`}
                style={currentSection === index ? { backgroundColor: BRAND_COLOR } : undefined}
              />
            </div>
          </button>
        ))}
      </div>

      {/* Section 1: Hero */}
      <section className="snap-section snap-start min-h-screen md:h-screen relative flex items-center justify-center bg-gray-900 pt-24 pb-12 md:py-0">
        {/* 배경 패턴 */}
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
              backgroundSize: '40px 40px'
            }}
          />
        </div>

        {/* 그라데이션 오버레이 */}
        <div
          className="absolute inset-0 opacity-30"
          style={{
            background: `linear-gradient(135deg, ${BRAND_COLOR}40 0%, transparent 50%, ${BRAND_COLOR}20 100%)`
          }}
        />

        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
          {/* 배지 */}
          <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-8"
            style={{ backgroundColor: `${BRAND_COLOR}20`, color: BRAND_COLOR }}
          >
            <Shield className="w-4 h-4" />
            한국 최초 타투·반영구 전문 바늘 폐기 솔루션
          </div>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
            타투와 반영구의 미래는<br />
            <span style={{ color: BRAND_COLOR }}>위생에서 시작</span>됩니다
          </h1>

          <p className="text-lg md:text-xl text-gray-400 mb-8 max-w-3xl mx-auto leading-relaxed">
            타투는 예술이지만, 바늘은 잠재적 위험물입니다.<br className="hidden md:block" />
            그동안 법의 테두리 밖에서 버려지던 바늘들, 이제는 더 이상 외면할 수 없습니다.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="https://app.onul.day"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 text-white rounded-full font-medium transition-all hover:scale-105"
              style={{ backgroundColor: BRAND_COLOR }}
            >
              <Smartphone className="w-5 h-5" />
              앱으로 시작하기
            </a>
            <a
              href="#services"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/10 text-white rounded-full font-medium hover:bg-white/20 transition-all"
            >
              서비스 알아보기
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>

          {/* 앱 프리뷰 힌트 */}
          <div className="mt-12 flex items-center justify-center gap-8 text-gray-500 text-sm">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" style={{ color: BRAND_COLOR }} />
              무료 수거함 제공
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" style={{ color: BRAND_COLOR }} />
              정기 수거 서비스
            </div>
            <div className="hidden sm:flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" style={{ color: BRAND_COLOR }} />
              위생 리포트 제공
            </div>
          </div>
        </div>

        {/* 스크롤 다운 인디케이터 */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce">
          <ChevronDown className="w-8 h-8 text-white/50" />
        </div>
      </section>

      {/* Section 2: 회사 소개 */}
      <section
        id="about"
        className="snap-section snap-start min-h-screen md:h-screen relative flex items-center bg-white pt-24 pb-12 md:py-0"
      >
        <div className="max-w-7xl mx-auto px-6 md:px-12 w-full">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* 텍스트 */}
            <div>
              <p
                className="text-sm font-medium tracking-widest uppercase mb-4"
                style={{ color: BRAND_COLOR }}
              >
                About Us
              </p>
              <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
                우리는 &apos;도덕적 책임&apos;을<br />
                산업의 기준으로 만듭니다
              </h2>
              <p className="text-base md:text-lg text-gray-500 leading-relaxed mb-8">
                한국의 타투샵과 반영구샵은 지금까지 의료폐기물도, 일반폐기물도 아닌
                회색지대에 놓여 있었습니다. 명확한 가이드가 없기 때문에
                대부분은 바늘을 &apos;그냥 버릴 수밖에&apos; 없었습니다.
              </p>
              <p className="text-base md:text-lg text-gray-500 leading-relaxed mb-8">
                하지만 해외에서는 이미 바늘폐기물 분류·전용 수거·위생 관리가
                법제화되어 있습니다. 한국 역시 곧 이 기준을 따라가야 합니다.
              </p>

              {/* 약속 항목들 */}
              <div className="space-y-4">
                {[
                  '전용 바늘 수거함 제공 (무료)',
                  '주 2회 또는 월 1회 정기 수거',
                  '전문 위생 관리 리포트 제공',
                  '법제화 대비 인증 시스템 선도'
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 flex-shrink-0" style={{ color: BRAND_COLOR }} />
                    <span className="text-gray-700">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 이미지/그래픽 영역 */}
            <div className="relative hidden lg:block">
              <div className="absolute -top-10 -left-10 w-40 h-40 rounded-full opacity-20" style={{ backgroundColor: BRAND_COLOR }} />
              <div className="absolute -bottom-10 -right-10 w-60 h-60 rounded-full opacity-10" style={{ backgroundColor: BRAND_COLOR }} />

              <div className="relative bg-gray-50 rounded-3xl p-8">
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { icon: Shield, label: '안전한 폐기', value: '100%' },
                    { icon: Recycle, label: '친환경 처리', value: 'ECO' },
                    { icon: Building, label: '전국 서비스', value: '전국' },
                    { icon: Award, label: '인증 준비', value: 'CERT' },
                  ].map((stat, idx) => (
                    <div
                      key={idx}
                      className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow"
                    >
                      <stat.icon className="w-8 h-8 mb-3" style={{ color: BRAND_COLOR }} />
                      <div className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</div>
                      <div className="text-sm text-gray-500">{stat.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 3: 서비스 소개 */}
      <section
        id="services"
        className="snap-section snap-start min-h-screen md:h-screen relative flex items-center pt-24 pb-12 md:py-0"
        style={{ backgroundColor: BRAND_COLOR_LIGHT }}
      >
        <div className="max-w-7xl mx-auto px-6 md:px-12 w-full">
          <div className="text-center mb-12">
            <p
              className="text-sm font-medium tracking-widest uppercase mb-4"
              style={{ color: BRAND_COLOR }}
            >
              Our Services
            </p>
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">
              앱으로 관리하는 위생 서비스
            </h2>
            <p className="text-gray-500 max-w-2xl mx-auto">
              오늘 위생산업 앱을 통해 간편하게 수거 신청부터 위생 관리까지
              모든 과정을 한눈에 확인하세요.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
            {/* 서비스 1 */}
            <div className="bg-white rounded-2xl p-6 lg:p-8 shadow-sm hover:shadow-lg transition-all group">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform"
                style={{ backgroundColor: `${BRAND_COLOR}15` }}
              >
                <Shield className="w-7 h-7" style={{ color: BRAND_COLOR }} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                전용 바늘 수거함 무료 지원
              </h3>
              <p className="text-gray-500 mb-4 leading-relaxed">
                자체 개발한 안전밀폐형 바늘수거함 제공. 방수·내충격·잠금 구조로 설계되어
                샵의 인테리어를 해치지 않는 미니멀한 디자인.
              </p>
              <div className="flex flex-wrap gap-2">
                {['방수 구조', '잠금 장치', '미니멀 디자인'].map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 text-xs font-medium rounded-full"
                    style={{ backgroundColor: `${BRAND_COLOR}15`, color: BRAND_COLOR }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* 서비스 2 */}
            <div className="bg-white rounded-2xl p-6 lg:p-8 shadow-sm hover:shadow-lg transition-all group">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform"
                style={{ backgroundColor: `${BRAND_COLOR}15` }}
              >
                <Calendar className="w-7 h-7" style={{ color: BRAND_COLOR }} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                정기 수거 서비스
              </h3>
              <p className="text-gray-500 mb-4 leading-relaxed">
                주 2회 방문 수거 또는 월 1회 경량 샵용 플랜. 방문 시 즉시 전량 폐기물
                안전이동 후 전문처리시설 인계.
              </p>
              <div className="flex flex-wrap gap-2">
                {['주 2회 수거', '월 1회 플랜', '전문 처리'].map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 text-xs font-medium rounded-full"
                    style={{ backgroundColor: `${BRAND_COLOR}15`, color: BRAND_COLOR }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* 서비스 3 */}
            <div className="bg-white rounded-2xl p-6 lg:p-8 shadow-sm hover:shadow-lg transition-all group">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform"
                style={{ backgroundColor: `${BRAND_COLOR}15` }}
              >
                <FileText className="w-7 h-7" style={{ color: BRAND_COLOR }} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                위생 모니터링 & 관리
              </h3>
              <p className="text-gray-500 mb-4 leading-relaxed">
                매달 위생관리 상태 체크 리포트 제공. 향후 법제화 시 가장 빠르게 적응할 수
                있도록 사전인증 시스템 적용.
              </p>
              <div className="flex flex-wrap gap-2">
                {['월간 리포트', '사전 인증', '법제화 대비'].map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 text-xs font-medium rounded-full"
                    style={{ backgroundColor: `${BRAND_COLOR}15`, color: BRAND_COLOR }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 4: 문제 인식 */}
      <section className="snap-section snap-start min-h-screen md:h-screen relative flex items-center bg-gray-900 pt-24 pb-12 md:py-0">
        <div className="max-w-7xl mx-auto px-6 md:px-12 w-full">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* 텍스트 */}
            <div>
              <p
                className="text-sm font-medium tracking-widest uppercase mb-4"
                style={{ color: BRAND_COLOR }}
              >
                Why It Matters
              </p>
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 leading-tight">
                바늘은 생명을 다루는<br />
                <span style={{ color: BRAND_COLOR }}>도구입니다</span>
              </h2>
              <p className="text-base md:text-lg text-gray-400 leading-relaxed mb-8">
                법적 기준이 없어도, 우리는 사람의 피부에서 피를 접촉한 바늘을
                그냥 분리수거함에 버릴 수 없습니다.
              </p>

              {/* 위험 요소들 */}
              <div className="space-y-4">
                {[
                  { icon: AlertTriangle, text: '교차오염, 감염 가능성' },
                  { icon: AlertTriangle, text: '일반 쓰레기와 뒤섞여 관리되지 않는 현실' },
                  { icon: AlertTriangle, text: '종이·비닐에 버려지는 바늘의 위험' },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-4 p-4 bg-white/5 rounded-xl border border-white/10"
                  >
                    <item.icon className="w-5 h-5 flex-shrink-0 text-amber-400" />
                    <span className="text-gray-300">{item.text}</span>
                  </div>
                ))}
              </div>

              <div className="mt-8 p-6 rounded-2xl border" style={{ borderColor: BRAND_COLOR, backgroundColor: `${BRAND_COLOR}10` }}>
                <p className="text-white font-medium">
                  오늘 위생산업은 이 도덕적·산업적 문제를 해결합니다.
                </p>
              </div>
            </div>

            {/* 통계 */}
            <div className="grid grid-cols-2 gap-4">
              {[
                { value: '95%', label: '관리되지 않는 바늘 폐기물', desc: '현재 추정치' },
                { value: '0개', label: '국내 전문 폐기 서비스', desc: '오늘 이전' },
                { value: '2027', label: '법제화 예상 시점', desc: '업계 전망' },
                { value: '∞', label: '잠재적 감염 위험', desc: '방치 시' },
              ].map((stat, idx) => (
                <div
                  key={idx}
                  className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 text-center"
                >
                  <div className="text-3xl md:text-4xl font-bold mb-2" style={{ color: BRAND_COLOR }}>
                    {stat.value}
                  </div>
                  <div className="text-white font-medium mb-1">{stat.label}</div>
                  <div className="text-gray-500 text-sm">{stat.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Section 5: 해외 사례 */}
      <section className="snap-section snap-start min-h-screen md:h-screen relative flex items-center bg-white pt-24 pb-12 md:py-0">
        <div className="max-w-7xl mx-auto px-6 md:px-12 w-full">
          <div className="text-center mb-12">
            <p
              className="text-sm font-medium tracking-widest uppercase mb-4"
              style={{ color: BRAND_COLOR }}
            >
              Global Standards
            </p>
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">
              해외는 이미 &apos;의무화&apos; 시대
            </h2>
            <p className="text-gray-500 max-w-2xl mx-auto">
              미국·유럽·호주 — 타투 위생 기준은 이미 &apos;폐기물 관리&apos;가 핵심입니다.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 lg:gap-8 mb-12">
            {[
              {
                country: '미국',
                flag: '🇺🇸',
                title: 'Sharps Disposal 의무화',
                desc: '대부분의 주에서 의무화. 위반 시 영업정지 및 벌금 부과.'
              },
              {
                country: '유럽연합',
                flag: '🇪🇺',
                title: 'Tattoo Hygiene Directive',
                desc: '바늘폐기 규정 명시. EU 전역 표준화된 위생 기준 적용.'
              },
              {
                country: '호주',
                flag: '🇦🇺',
                title: 'NSW 보건국 규정',
                desc: '모든 타투샵 바늘 전용폐기 의무 기준. 정기 검사 시행.'
              },
            ].map((item, idx) => (
              <div
                key={idx}
                className="bg-gray-50 rounded-2xl p-6 lg:p-8 hover:shadow-lg transition-all"
              >
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-4xl">{item.flag}</span>
                  <div>
                    <div className="font-bold text-gray-900">{item.country}</div>
                    <div className="text-sm text-gray-500">{item.title}</div>
                  </div>
                </div>
                <p className="text-gray-600 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>

          <div
            className="text-center p-8 rounded-2xl"
            style={{ backgroundColor: `${BRAND_COLOR}10` }}
          >
            <Globe className="w-12 h-12 mx-auto mb-4" style={{ color: BRAND_COLOR }} />
            <p className="text-lg font-medium text-gray-900 mb-2">
              해외 기준은 바늘폐기가 &apos;위생의 시작&apos;입니다.
            </p>
            <p className="text-gray-600">
              한국도 머지않아 동일 기준을 따르게 됩니다.
              <strong> 지금 준비하는 샵만이 법제화 시대에 살아남습니다.</strong>
            </p>
          </div>
        </div>
      </section>

      {/* Section 6: 미래 비전 */}
      <section className="snap-section snap-start min-h-screen md:h-screen relative flex items-center bg-gray-900 pt-24 pb-12 md:py-0">
        <div className="absolute inset-0 opacity-5">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
              backgroundSize: '40px 40px'
            }}
          />
        </div>

        <div className="max-w-4xl mx-auto px-6 md:px-12 w-full text-center relative z-10">
          <p
            className="text-sm font-medium tracking-widest uppercase mb-4"
            style={{ color: BRAND_COLOR }}
          >
            Our Vision
          </p>
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-8 leading-tight">
            무분별한 폐기를<br />
            <span style={{ color: BRAND_COLOR }}>끝내야 합니다</span>
          </h2>
          <p className="text-lg md:text-xl text-gray-400 mb-12 leading-relaxed">
            우리의 목표는 단순한 수거가 아닙니다.<br />
            한국 타투 산업 전체가 깨끗한 기준을 세우는 미래입니다.
          </p>

          <div className="grid grid-cols-2 gap-6 max-w-xl mx-auto mb-12">
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
              <X className="w-8 h-8 text-red-400 mx-auto mb-3" />
              <div className="text-white font-medium mb-1">바늘 폐기 = 선택</div>
              <div className="text-gray-500 text-sm">과거의 방식</div>
            </div>
            <div
              className="p-6 rounded-2xl border"
              style={{ backgroundColor: `${BRAND_COLOR}15`, borderColor: BRAND_COLOR }}
            >
              <CheckCircle2 className="w-8 h-8 mx-auto mb-3" style={{ color: BRAND_COLOR }} />
              <div className="text-white font-medium mb-1">바늘 폐기 = 의무</div>
              <div className="text-gray-400 text-sm">새로운 기준</div>
            </div>
          </div>

          <p className="text-gray-400 text-lg">
            오늘 위생산업은 한국 타투 산업이<br />
            공정하고 안전한 구조를 갖추도록<br />
            <strong className="text-white">끝까지 함께합니다.</strong>
          </p>
        </div>
      </section>

      {/* Section 7: 앱 소개 */}
      <section
        id="app"
        className="snap-section snap-start min-h-screen md:h-screen relative flex items-center pt-24 pb-12 md:py-0"
        style={{ backgroundColor: BRAND_COLOR_LIGHT }}
      >
        <div className="max-w-7xl mx-auto px-6 md:px-12 w-full">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* 앱 기능 설명 */}
            <div>
              <p
                className="text-sm font-medium tracking-widest uppercase mb-4"
                style={{ color: BRAND_COLOR }}
              >
                ONUL App
              </p>
              <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
                스마트한 위생 관리,<br />
                앱 하나로 끝
              </h2>
              <p className="text-base md:text-lg text-gray-500 leading-relaxed mb-8">
                오늘 위생산업 앱을 통해 매장 등록부터 수거 일정 관리, 비포/애프터 기록,
                위생 리포트까지 모든 것을 한 곳에서 관리하세요.
              </p>

              {/* 앱 주요 기능 */}
              <div className="space-y-4">
                {[
                  { icon: Building, title: '매장 등록', desc: '간편하게 내 샵 정보 등록' },
                  { icon: Calendar, title: '수거 일정 관리', desc: '앱에서 방문 일정 확인 및 변경' },
                  { icon: Camera, title: '비포/애프터 기록', desc: '수거 전후 사진으로 투명한 관리' },
                  { icon: FileText, title: '위생 리포트', desc: '월간 위생 상태 리포트 자동 생성' },
                  { icon: Users, title: '담당자 배정', desc: '전문 마스터 담당자 연결' },
                  { icon: Clock, title: '실시간 알림', desc: '수거 일정, 상태 변경 푸시 알림' },
                ].map((feature, idx) => (
                  <div key={idx} className="flex items-start gap-4">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: `${BRAND_COLOR}20` }}
                    >
                      <feature.icon className="w-5 h-5" style={{ color: BRAND_COLOR }} />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{feature.title}</div>
                      <div className="text-sm text-gray-500">{feature.desc}</div>
                    </div>
                  </div>
                ))}
              </div>

              <a
                href="https://app.onul.day"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-8 py-4 text-white rounded-full font-medium transition-all hover:scale-105 mt-8"
                style={{ backgroundColor: BRAND_COLOR }}
              >
                <Smartphone className="w-5 h-5" />
                지금 앱 사용해보기
              </a>
            </div>

            {/* 앱 목업 */}
            <div className="relative hidden lg:flex justify-center">
              <div className="relative w-[300px] h-[600px] bg-gray-900 rounded-[40px] p-3 shadow-2xl">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-gray-900 rounded-b-2xl" />
                <div className="w-full h-full bg-white rounded-[32px] overflow-hidden">
                  {/* 앱 화면 시뮬레이션 */}
                  <div className="h-full flex flex-col">
                    {/* 상태바 */}
                    <div className="h-12 flex items-center justify-between px-6" style={{ backgroundColor: BRAND_COLOR }}>
                      <span className="text-white text-sm font-medium">9:41</span>
                      <span className="text-white text-xs">오늘 위생산업</span>
                      <div className="flex gap-1">
                        <div className="w-4 h-2 bg-white rounded-sm" />
                      </div>
                    </div>

                    {/* 대시보드 */}
                    <div className="flex-1 p-4 bg-gray-50">
                      <div className="bg-white rounded-xl p-4 shadow-sm mb-4">
                        <div className="text-xs text-gray-500 mb-1">내 매장</div>
                        <div className="text-lg font-bold text-gray-900">인크 타투 스튜디오</div>
                        <div className="text-sm text-gray-500">서울시 강남구</div>
                      </div>

                      <div className="bg-white rounded-xl p-4 shadow-sm mb-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="text-xs text-gray-500">다음 수거일</div>
                          <span
                            className="text-xs px-2 py-0.5 rounded-full"
                            style={{ backgroundColor: `${BRAND_COLOR}20`, color: BRAND_COLOR }}
                          >
                            D-3
                          </span>
                        </div>
                        <div className="text-2xl font-bold" style={{ color: BRAND_COLOR }}>12월 12일</div>
                        <div className="text-sm text-gray-500">목요일 오후 2시</div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-white rounded-xl p-3 shadow-sm">
                          <Camera className="w-5 h-5 mb-2" style={{ color: BRAND_COLOR }} />
                          <div className="text-xs text-gray-500">비포/애프터</div>
                          <div className="text-lg font-bold text-gray-900">24건</div>
                        </div>
                        <div className="bg-white rounded-xl p-3 shadow-sm">
                          <FileText className="w-5 h-5 mb-2" style={{ color: BRAND_COLOR }} />
                          <div className="text-xs text-gray-500">위생 리포트</div>
                          <div className="text-lg font-bold text-gray-900">12건</div>
                        </div>
                      </div>
                    </div>

                    {/* 하단 탭바 */}
                    <div className="h-16 bg-white border-t border-gray-200 flex items-center justify-around px-4">
                      {[
                        { icon: Building, label: '홈', active: true },
                        { icon: Calendar, label: '일정', active: false },
                        { icon: Camera, label: '기록', active: false },
                        { icon: Users, label: '내정보', active: false },
                      ].map((tab, idx) => (
                        <div key={idx} className="flex flex-col items-center">
                          <tab.icon
                            className="w-5 h-5 mb-1"
                            style={{ color: tab.active ? BRAND_COLOR : '#9ca3af' }}
                          />
                          <span
                            className="text-xs"
                            style={{ color: tab.active ? BRAND_COLOR : '#9ca3af' }}
                          >
                            {tab.label}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 8: CTA & Footer */}
      <section
        id="apply"
        className="snap-section snap-start min-h-screen md:h-screen relative flex items-center bg-gray-900 pt-24 pb-12 md:py-0"
      >
        <div className="max-w-7xl mx-auto px-6 md:px-12 w-full">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* CTA 텍스트 */}
            <div>
              <p
                className="text-sm font-medium tracking-widest uppercase mb-4"
                style={{ color: BRAND_COLOR }}
              >
                Get Started
              </p>
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 leading-tight">
                지금, 가장 기본적인<br />
                <span style={{ color: BRAND_COLOR }}>위생을 시작하세요</span>
              </h2>

              <div className="space-y-4 mb-8">
                {[
                  '무료 수거함 설치',
                  '정기 방문 수거',
                  '관리 리포트 제공',
                  '법 대비 인증 지원'
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5" style={{ color: BRAND_COLOR }} />
                    <span className="text-gray-300">{item}</span>
                  </div>
                ))}
              </div>

              <a
                href="https://app.onul.day"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-8 py-4 text-white rounded-full font-medium transition-all hover:scale-105"
                style={{ backgroundColor: BRAND_COLOR }}
              >
                <Smartphone className="w-5 h-5" />
                앱에서 서비스 신청하기
                <ArrowRight className="w-4 h-4" />
              </a>

              {/* 연락처 */}
              <div className="mt-12 space-y-4">
                <div className="flex items-center gap-4 text-gray-400">
                  <Phone className="w-5 h-5" />
                  <span>02-1234-5678</span>
                </div>
                <div className="flex items-center gap-4 text-gray-400">
                  <Mail className="w-5 h-5" />
                  <span>contact@onul-hygiene.com</span>
                </div>
                <div className="flex items-center gap-4 text-gray-400">
                  <MapPin className="w-5 h-5" />
                  <span>서울특별시 강남구</span>
                </div>
              </div>
            </div>

            {/* 문구 카드 */}
            <div className="space-y-4">
              <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                <div className="text-2xl mb-4">&quot;위생은 비용이 아니라,</div>
                <div className="text-2xl font-bold" style={{ color: BRAND_COLOR }}>브랜드의 품격입니다.&quot;</div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 text-center">
                  <Award className="w-8 h-8 mx-auto mb-3" style={{ color: BRAND_COLOR }} />
                  <div className="text-white font-medium">한국 최초</div>
                  <div className="text-gray-500 text-sm">전문 폐기 솔루션</div>
                </div>
                <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 text-center">
                  <Shield className="w-8 h-8 mx-auto mb-3" style={{ color: BRAND_COLOR }} />
                  <div className="text-white font-medium">안전한 처리</div>
                  <div className="text-gray-500 text-sm">전문 시설 인계</div>
                </div>
              </div>
            </div>
          </div>

          {/* 푸터 */}
          <div className="mt-16 pt-8 border-t border-gray-800 flex flex-col md:flex-row items-center justify-between gap-4 text-gray-500 text-sm">
            <p>&copy; 2025 오늘 위생산업. All rights reserved.</p>
            <div className="flex gap-6">
              <a href="#" className="hover:text-white transition-colors">서비스 소개</a>
              <a href="#" className="hover:text-white transition-colors">이용약관</a>
              <a href="#" className="hover:text-white transition-colors">개인정보처리방침</a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
