'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  ChevronRight,
  ChevronDown,
  Menu,
  X,
  Phone,
  Mail,
  MapPin,
  ArrowRight,
  Users,
  Award,
  Heart,
  TrendingUp
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

/**
 * 오늘청소 웹사이트 템플릿 - v2 (풀페이지 스냅 스크롤)
 *
 * 디자인 컨셉: Minimal Monochrome + Single Accent
 * - 메인: 무채색 (흰색, 회색, 검정)
 * - 포인트: 브랜드 컬러 (Supabase에서 동적으로 로드)
 * - 풀페이지 스냅 스크롤 (각 섹션 100vh)
 * - 부드러운 전환 애니메이션
 */

// 브랜드 컬러에서 다크 버전 생성 (명도와 채도를 낮춰 무채색에 가깝게)
function getDarkBrandColor(hexColor: string): string {
  // HEX를 RGB로 변환
  const r = parseInt(hexColor.slice(1, 3), 16);
  const g = parseInt(hexColor.slice(3, 5), 16);
  const b = parseInt(hexColor.slice(5, 7), 16);

  // RGB를 HSL로 변환
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
  const darkS = 0.15; // 채도를 크게 낮춤

  // HSL을 RGB로 변환
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

interface SiteBranding {
  logo_horizontal: string | null;
  brand_color: string;
  contact_phone: string | null;
  contact_email: string | null;
  contact_address: string | null;
}

interface SiteInfo {
  id: string;
  logo_horizontal: string | null;
  brand_color: string;
  contact_phone: string | null;
  contact_email: string | null;
  contact_address: string | null;
}
// About 섹션 인물 이미지 배열 (9장)
const ABOUT_IMAGES = [
  // 1열
  'https://cdn.imweb.me/upload/S202411166380e02dc267b/9293411fa0f34.jpg',  // 원래 2열 상단
  'https://cdn.imweb.me/upload/S202411166380e02dc267b/5adb0b6c2c0f4.jpg',
  'https://cdn.imweb.me/upload/S202411166380e02dc267b/6572b83682aca.jpg',
  // 2열
  'https://cdn.imweb.me/upload/S202411166380e02dc267b/f11dd5a595b85.jpg',  // 대표님 (원래 1열 상단)
  'https://cdn.imweb.me/upload/S202411166380e02dc267b/cba0b499f43fa.jpg',
  'https://cdn.imweb.me/upload/S202411166380e02dc267b/5be3183ff6ad3.jpg',
  // 3열
  'https://cdn.imweb.me/upload/S202411166380e02dc267b/0cc85a001f1f1.jpg',
  'https://cdn.imweb.me/upload/S202411166380e02dc267b/398a5cac3eccb.jpg',
  'https://cdn.imweb.me/upload/S202411166380e02dc267b/cb89d0965519d.jpg',
];

// Services 탭 타입 정의
type ServiceTabType = 'store' | 'home' | 'factory' | 'special' | 'etc';

// 서비스 데이터
const SERVICES_DATA: Record<ServiceTabType, {
  title: string;
  description: string;
  tags: string[];
  image: string;
}> = {
  store: {
    title: '상가 청소',
    description: '사업장 청소는 직원과 고객의 건강을 보호하고, 청결한 환경을 유지하여 직원들의 생산성을 증대시킵니다. 또한, 위생적인 환경은 고객 만족도를 높여 재방문을 유도하고, 브랜드 이미지 향상에 기여합니다. 이는 결국 매출 증가로 이어지며, 법적 규제 준수와 장비 수명 연장, 사고 예방 등의 부가적인 효과도 제공합니다.',
    tags: ['상가 청소', '사무실 청소', '방문 청소', '정기 청소'],
    image: 'https://cdn.imweb.me/upload/S202411166380e02dc267b/bd5f7008b352c.jpg'
  },
  home: {
    title: '가정 청소',
    description: '깨끗하고 쾌적한 주거 환경을 위해 전문적인 가정청소 서비스를 제공합니다. 가정 청소는 먼지와 오염을 제거하고 위생을 유지하는 과정으로 거실, 주방, 욕실, 침실 등 집안 전체를 체계적으로 관리합니다.',
    tags: ['가정 청소', '새집 청소', '이사 청소', '리모델링 후 청소', '퇴실 청소', '입주 청소'],
    image: 'https://cdn.imweb.me/upload/S202411166380e02dc267b/2d6ad53e536b2.jpg'
  },
  factory: {
    title: '공장 청소',
    description: '기업 및 제조공장 청소는 산업 환경의 안정성, 생산성, 그리고 전반적인 운영 효율성을 유지하는 데 매우 중요한 역할을 합니다. 전문적인 기업 및 제조공장 청소 서비스는 단순히 청결을 유지하는 것을 넘어 기업의 생산성, 안정성 그리고 이미지 향상에 크게 기여합니다.',
    tags: ['바닥 청소', '설비 청소', '냉난방기 청소', '외벽 청소', '유리 청소'],
    image: 'https://cdn.imweb.me/upload/S202411166380e02dc267b/eb33e32ed0322.jpg'
  },
  special: {
    title: '특수 청소',
    description: '특수청소는 전문 장비와 기술을 갖춘 전문가만이 효과적으로 수행할 수 있으며, 높은 복구율을 자랑합니다. 오염물질을 철저히 제거하고, 안전한 작업 환경을 보장하며, 시설의 내구성을 높이고 사고를 예방합니다.',
    tags: ['비둘기 퇴치', '고압 세척', '쓰레기집'],
    image: 'https://cdn.imweb.me/upload/S202411166380e02dc267b/5ce601219bd1a.jpg'
  },
  etc: {
    title: '기타 서비스',
    description: '깨끗한 공간은 곧 신뢰의 시작입니다. 현장과 시설에 맞춘 맞춤 청소로 위생과 안전을 지켜드립니다. 전문 인력과 체계적인 관리로 보이지 않는 부분까지 세심하게 관리합니다. 쾌적하고 건강한 환경, 저희가 책임집니다.',
    tags: ['식당주방 청소', '오픈 공사 후 청소', '샵 청소', '누적된 오염 청소', '유리 청소', '냉난방기 청소'],
    image: '/images/onul/service-etc.jpeg'
  }
};

const SERVICE_TABS: ServiceTabType[] = ['store', 'home', 'factory', 'special', 'etc'];

// KESG 비전 목표 데이터 (4개 카테고리)
const KESG_GOALS = [
  {
    category: '고객중심',
    categoryEn: 'Customer',
    icon: Users,
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
    goals: [
      { id: 16, title: '취약계층 무료 청소 지원' },
      { id: 17, title: '지역 일자리 창출 기여' },
      { id: 18, title: '지역사회 봉사활동 참여' },
      { id: 19, title: '파트너사와 상생 협력' },
    ]
  }
];

export default function OnulTemplateV2() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [currentSection, setCurrentSection] = useState(0);
  const [activeServiceTab, setActiveServiceTab] = useState<ServiceTabType>('store');
  const [isAnimating, setIsAnimating] = useState(false);
  const [slideDirection, setSlideDirection] = useState<'left' | 'right'>('right');
  const containerRef = useRef<HTMLDivElement>(null);
  // Building Care 섹션 - 확장된 카드 상태 (데스크톱 호버, 모바일 클릭)
  const [expandedCareCard, setExpandedCareCard] = useState<number | null>(null);
  // 브랜딩 정보 (로고, 브랜드 컬러, 연락처)
  const [branding, setBranding] = useState<SiteBranding>({
    logo_horizontal: null,
    brand_color: '#67c0a1',
    contact_phone: null,
    contact_email: null,
    contact_address: null
  });
  // 사이트 ID (상담 신청용)
  const [siteId, setSiteId] = useState<string | null>(null);
  // base64 로고 데이터
  const [logoDataUrl, setLogoDataUrl] = useState<string | null>(null);
  // 상담 신청 폼 상태
  const [consultationForm, setConsultationForm] = useState({
    name: '',
    phone: '',
    email: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // 캐시 키
  const LOGO_CACHE_KEY = 'onul_logo_base64';
  const BRAND_CACHE_KEY = 'onul_brand_color';

  // 1. 먼저 localStorage에서 캐시된 로고 확인 (즉시 실행)
  useEffect(() => {
    const cachedLogo = localStorage.getItem(LOGO_CACHE_KEY);
    const cachedBrandColor = localStorage.getItem(BRAND_CACHE_KEY);

    if (cachedLogo) {
      setLogoDataUrl(cachedLogo);
    }
    if (cachedBrandColor) {
      setBranding(prev => ({ ...prev, brand_color: cachedBrandColor }));
    }
  }, []);

  // 2. Supabase에서 최신 브랜딩 정보 로드 (백그라운드)
  useEffect(() => {
    const fetchBranding = async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from('sites')
        .select('id, logo_horizontal, brand_color, contact_phone, contact_email, contact_address')
        .eq('slug', 'onul')
        .single();

      if (data) {
        const siteData = data as SiteInfo;
        const brandColor = siteData.brand_color || '#67c0a1';
        setSiteId(siteData.id);
        setBranding({
          logo_horizontal: siteData.logo_horizontal,
          brand_color: brandColor,
          contact_phone: siteData.contact_phone,
          contact_email: siteData.contact_email,
          contact_address: siteData.contact_address
        });
        localStorage.setItem(BRAND_CACHE_KEY, brandColor);

        // 로고 URL이 있으면 base64로 변환하여 캐시
        if (data.logo_horizontal) {
          try {
            const response = await fetch(data.logo_horizontal);
            const blob = await response.blob();
            const reader = new FileReader();
            reader.onloadend = () => {
              const base64 = reader.result as string;
              localStorage.setItem(LOGO_CACHE_KEY, base64);
              setLogoDataUrl(base64);
            };
            reader.readAsDataURL(blob);
          } catch {
            // 로드 실패해도 캐시가 있으면 그대로 사용
          }
        }
      }
    };

    fetchBranding();
  }, []);

  // 브랜드 컬러의 다크 버전 계산
  const darkBrandColor = getDarkBrandColor(branding.brand_color);

  // 탭 전환 핸들러 (애니메이션 포함)
  const handleTabChange = useCallback((newTab: ServiceTabType) => {
    if (newTab === activeServiceTab || isAnimating) return;

    const currentIndex = SERVICE_TABS.indexOf(activeServiceTab);
    const newIndex = SERVICE_TABS.indexOf(newTab);
    setSlideDirection(newIndex > currentIndex ? 'right' : 'left');

    setIsAnimating(true);
    setTimeout(() => {
      setActiveServiceTab(newTab);
      setTimeout(() => setIsAnimating(false), 50);
    }, 150);
  }, [activeServiceTab, isAnimating]);

  // 섹션 이름 (인디케이터 툴팁용)
  const sectionNames = ['홈', '소개', '비전', '서비스', '케어', '파트너', '인력/교육', '건물관리', '문의'];

  // Intersection Observer를 사용한 정확한 섹션 감지
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      setScrolled(container.scrollTop > 50);

      // 스냅 스크롤 컨테이너 내에서 섹션 감지
      const sections = container.querySelectorAll('.snap-section');
      const containerHeight = container.clientHeight;

      sections.forEach((section, index) => {
        const rect = section.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();
        const relativeTop = rect.top - containerRect.top;

        // 섹션이 컨테이너 뷰포트의 50% 이상을 차지할 때 활성화
        if (relativeTop >= -containerHeight * 0.5 && relativeTop < containerHeight * 0.5) {
          setCurrentSection(index);
        }
      });
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

  // 네비게이션 메뉴 (공통)
  const navigation = [
    { name: '기업소개', href: '/sites/onul/about' },
    { name: '소식', href: '/sites/onul/news' },
  ];

  // 섹션으로 스크롤
  const scrollToSection = useCallback((index: number) => {
    const container = containerRef.current;
    if (!container) return;

    const sections = container.querySelectorAll('.snap-section');
    if (sections[index]) {
      sections[index].scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  // 상담 신청 제출 (API 호출 방식 - 이메일 알림 포함)
  const handleConsultationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    // 기본 유효성 검사
    if (!consultationForm.name.trim() || !consultationForm.phone.trim()) {
      alert('이름과 연락처를 입력해주세요.');
      return;
    }

    setIsSubmitting(true);
    try {
      // API 호출 (이메일 알림 포함)
      const response = await fetch('/api/sites/onul/consultations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: consultationForm.name.trim(),
          phone: consultationForm.phone.trim(),
          email: consultationForm.email.trim() || null,
          message: consultationForm.message.trim() || null,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        console.error('상담 신청 실패:', result.error);
        alert(result.error || '상담 신청에 실패했습니다. 다시 시도해주세요.');
      } else {
        setSubmitSuccess(true);
        setConsultationForm({ name: '', phone: '', email: '', message: '' });
        // 3초 후 성공 메시지 숨기기
        setTimeout(() => setSubmitSuccess(false), 3000);
      }
    } catch {
      alert('상담 신청 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      ref={containerRef}
      className="h-screen overflow-y-auto snap-y snap-mandatory"
      style={{ scrollBehavior: 'auto' }}
    >
      {/* 스티키 네비게이션 바 */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled || mobileMenuOpen
            ? 'bg-white/95 backdrop-blur-md shadow-sm'
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="flex items-center justify-between h-20">
            {/* 로고 - 모바일에서 크기 줄임 */}
            <a href="#" className="flex items-center h-6 md:h-8">
              {logoDataUrl ? (
                <img
                  src={logoDataUrl}
                  alt="오늘청소"
                  className={`h-6 md:h-8 w-auto transition-all duration-300 ${
                    !scrolled && !mobileMenuOpen ? 'brightness-0 invert' : ''
                  }`}
                />
              ) : (
                // 로고 로드 중: 빈 공간 유지 (텍스트 없음)
                <div className="h-6 md:h-8 w-20 md:w-24" />
              )}
            </a>

            {/* 데스크톱 메뉴 */}
            <div className="hidden md:flex items-center gap-8">
              {navigation.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className={`text-sm font-medium transition-colors duration-300 ${
                    scrolled ? 'text-gray-600' : 'text-white/90'
                  }`}
                  onMouseEnter={(e) => e.currentTarget.style.color = branding.brand_color}
                  onMouseLeave={(e) => e.currentTarget.style.color = ''}
                >
                  {item.name}
                </a>
              ))}
              <a
                href="#contact"
                className="px-5 py-2 text-white text-sm rounded-full font-medium hover:opacity-90 transition-all"
                style={{ backgroundColor: branding.brand_color }}
              >
                상담 신청
              </a>
            </div>

            {/* 모바일 햄버거 메뉴 */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg transition-colors"
              style={mobileMenuOpen ? { backgroundColor: `${branding.brand_color}15` } : undefined}
            >
              {mobileMenuOpen ? (
                <X className="text-gray-900 w-5 h-5" />
              ) : (
                <Menu className={`w-5 h-5 ${scrolled ? 'text-gray-900' : 'text-white'}`} />
              )}
            </button>
          </div>
        </div>

        {/* 모바일 메뉴 - 슬라이드 다운 애니메이션 */}
        <div
          className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
            mobileMenuOpen ? 'max-h-80 opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="bg-white/95 backdrop-blur-md border-t border-gray-100">
            <div className="px-6 py-4 space-y-1">
              {navigation.map((item, index) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="block py-3 px-4 text-gray-700 font-medium rounded-xl transition-all hover:bg-gray-50"
                  style={{
                    transitionDelay: mobileMenuOpen ? `${index * 50}ms` : '0ms',
                    transform: mobileMenuOpen ? 'translateX(0)' : 'translateX(-10px)',
                    opacity: mobileMenuOpen ? 1 : 0
                  }}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.name}
                </a>
              ))}
              <a
                href="#contact"
                className="block py-3 px-4 mt-2 text-white font-medium rounded-xl text-center transition-all"
                style={{
                  backgroundColor: branding.brand_color,
                  transitionDelay: mobileMenuOpen ? `${navigation.length * 50}ms` : '0ms',
                  transform: mobileMenuOpen ? 'translateX(0)' : 'translateX(-10px)',
                  opacity: mobileMenuOpen ? 1 : 0
                }}
                onClick={() => setMobileMenuOpen(false)}
              >
                상담 신청
              </a>
            </div>
          </div>
        </div>
      </nav>

      {/* 섹션 인디케이터 (우측) - 개선된 애니메이션 */}
      <div className="fixed right-4 md:right-6 top-1/2 -translate-y-1/2 z-40 hidden md:flex flex-col items-end gap-2">
        {sectionNames.map((name, index) => (
          <button
            key={index}
            onClick={() => scrollToSection(index)}
            className="group flex items-center gap-3"
          >
            {/* 섹션 이름 (호버 시 표시) */}
            <span
              className={`text-xs font-medium opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0 ${
                currentSection === index ? '' : 'text-gray-500'
              }`}
              style={currentSection === index ? { color: branding.brand_color } : undefined}
            >
              {name}
            </span>

            {/* 인디케이터 도트 */}
            <div className="relative">
              {/* 활성 상태 배경 링 */}
              <div
                className={`absolute inset-0 rounded-full transition-all duration-500 ${
                  currentSection === index ? 'scale-[2.5]' : 'bg-transparent scale-100'
                }`}
                style={currentSection === index ? { backgroundColor: `${branding.brand_color}20` } : undefined}
              />

              {/* 메인 도트 */}
              <div
                className={`relative w-2 h-2 rounded-full transition-all duration-300 ${
                  currentSection === index
                    ? 'scale-150'
                    : 'bg-gray-300 group-hover:bg-gray-400 group-hover:scale-125'
                }`}
                style={currentSection === index ? { backgroundColor: branding.brand_color } : undefined}
              >
                {/* 활성 상태 펄스 애니메이션 */}
                {currentSection === index && (
                  <div
                    className="absolute inset-0 rounded-full animate-ping opacity-75"
                    style={{ backgroundColor: branding.brand_color }}
                  />
                )}
              </div>
            </div>
          </button>
        ))}

        {/* 프로그레스 라인 */}
        <div className="absolute right-[3px] top-0 bottom-0 w-0.5 bg-gray-200 -z-10">
          <div
            className="w-full transition-all duration-500 ease-out"
            style={{
              height: `${(currentSection / (sectionNames.length - 1)) * 100}%`,
              backgroundColor: branding.brand_color
            }}
          />
        </div>
      </div>

      {/* Section 1: Hero */}
      <section className="snap-section snap-start min-h-screen md:h-screen relative flex items-center justify-center pt-24 pb-12 md:py-0" style={{ backgroundColor: darkBrandColor }}>
        {/* 배경 패턴 */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
            backgroundSize: '40px 40px'
          }} />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
          <p className="text-sm font-medium tracking-widest uppercase mb-6" style={{ color: branding.brand_color }}>
            Professional Cleaning Service
          </p>

          <h1 className="text-5xl md:text-7xl font-bold text-white mb-8 leading-tight">
            청소의 미래를<br />함께합니다
          </h1>

          <p className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto">
            단순한 청소를 넘어, 지속 가능한 공간 관리 솔루션을 제공합니다.
          </p>

          <a
            href="#about"
            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-gray-900 rounded-full font-medium hover:bg-gray-100 transition-all"
          >
            자세히 보기
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>

        {/* 스크롤 다운 인디케이터 */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce">
          <ChevronDown className="w-8 h-8 text-white/50" />
        </div>
      </section>

      {/* Section 2: About */}
      <section
        id="about"
        className="snap-section snap-start min-h-screen md:h-screen relative flex items-center bg-white overflow-hidden pt-24 pb-12 md:pt-20 md:pb-0"
      >
        <div className="max-w-7xl mx-auto px-6 md:px-12 w-full">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
            {/* 텍스트 */}
            <div>
              <p className="text-xs md:text-sm font-medium tracking-widest uppercase mb-3 md:mb-4" style={{ color: branding.brand_color }}>
                About Us
              </p>
              <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4 md:mb-6 leading-tight">
                공간의 가치를<br />새롭게 합니다
              </h2>
              <p className="text-base md:text-lg text-gray-500 leading-relaxed mb-6 md:mb-8">
                오늘청소는 단순한 청소 서비스가 아닌, 삶의 질을 높이는
                생활 솔루션을 제공합니다.
              </p>
              <div className="flex gap-6 md:gap-12 mb-6 md:mb-8">
                <div>
                  <div className="text-2xl md:text-4xl font-bold text-gray-900">500+</div>
                  <div className="text-xs md:text-sm text-gray-500 mt-1">프로젝트</div>
                </div>
                <div>
                  <div className="text-2xl md:text-4xl font-bold text-gray-900">98%</div>
                  <div className="text-xs md:text-sm text-gray-500 mt-1">만족도</div>
                </div>
                <div>
                  <div className="text-2xl md:text-4xl font-bold text-gray-900">50+</div>
                  <div className="text-xs md:text-sm text-gray-500 mt-1">전문 인력</div>
                </div>
              </div>

              {/* 더 알아보기 버튼 */}
              <a
                href="/sites/onul/about"
                className="inline-flex items-center gap-2 px-6 py-3 text-white rounded-full font-medium transition-all duration-300 group"
                style={{ backgroundColor: darkBrandColor }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = branding.brand_color}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = darkBrandColor}
              >
                더 알아보기
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </a>
            </div>

            {/* 3x3 캡슐 인물 사진 그리드 - 호버링 애니메이션 */}
            <div className="hidden lg:flex gap-6 h-[480px]">
              {/* 1열 */}
              <div className="flex flex-col gap-5">
                {[0, 1, 2].map((idx) => (
                  <div
                    key={`col1-${idx}`}
                    className="relative w-[130px] h-[165px] rounded-[65px] overflow-hidden"
                    style={{
                      animation: `float ${3.5 + idx * 0.3}s ease-in-out infinite`,
                      animationDelay: `${idx * 0.2}s`,
                    }}
                  >
                    <img
                      src={ABOUT_IMAGES[idx]}
                      alt={`팀원 ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>

              {/* 2열 (중앙, 오프셋) */}
              <div className="flex flex-col gap-5 -mt-6">
                {[3, 4, 5].map((idx) => (
                  <div
                    key={`col2-${idx}`}
                    className="relative w-[130px] h-[165px] rounded-[65px] overflow-hidden"
                    style={{
                      animation: `float ${3.8 + (idx - 3) * 0.3}s ease-in-out infinite`,
                      animationDelay: `${(idx - 3) * 0.2 + 0.4}s`,
                    }}
                  >
                    <img
                      src={ABOUT_IMAGES[idx]}
                      alt={`팀원 ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>

              {/* 3열 */}
              <div className="flex flex-col gap-5">
                {[6, 7, 8].map((idx) => (
                  <div
                    key={`col3-${idx}`}
                    className="relative w-[130px] h-[165px] rounded-[65px] overflow-hidden"
                    style={{
                      animation: `float ${4.1 + (idx - 6) * 0.3}s ease-in-out infinite`,
                      animationDelay: `${(idx - 6) * 0.2 + 0.8}s`,
                    }}
                  >
                    <img
                      src={ABOUT_IMAGES[idx]}
                      alt={`팀원 ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* 모바일용 캡슐 그리드 - 중앙 정렬 */}
            <div className="lg:hidden flex justify-center gap-3">
              {/* 1열 */}
              <div className="flex flex-col gap-3">
                {[0, 1, 2].map((idx) => (
                  <div
                    key={`m-col1-${idx}`}
                    className="relative w-[85px] h-[106px] rounded-[42px] overflow-hidden"
                    style={{
                      animation: `float ${3 + idx * 0.4}s ease-in-out infinite`,
                      animationDelay: `${idx * 0.15}s`,
                    }}
                  >
                    <img
                      src={ABOUT_IMAGES[idx]}
                      alt={`팀원 ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
              {/* 2열 - 중앙 */}
              <div className="flex flex-col gap-3 -mt-5">
                {[3, 4, 5].map((idx) => (
                  <div
                    key={`m-col2-${idx}`}
                    className="relative w-[85px] h-[106px] rounded-[42px] overflow-hidden"
                    style={{
                      animation: `float ${3.2 + (idx - 3) * 0.4}s ease-in-out infinite`,
                      animationDelay: `${(idx - 3) * 0.15 + 0.25}s`,
                    }}
                  >
                    <img
                      src={ABOUT_IMAGES[idx]}
                      alt={`팀원 ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
              {/* 3열 */}
              <div className="flex flex-col gap-3">
                {[6, 7, 8].map((idx) => (
                  <div
                    key={`m-col3-${idx}`}
                    className="relative w-[85px] h-[106px] rounded-[42px] overflow-hidden"
                    style={{
                      animation: `float ${3.4 + (idx - 6) * 0.4}s ease-in-out infinite`,
                      animationDelay: `${(idx - 6) * 0.15 + 0.5}s`,
                    }}
                  >
                    <img
                      src={ABOUT_IMAGES[idx]}
                      alt={`팀원 ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 3: KESG Vision - 비전 및 전략 */}
      <section
        id="vision"
        className="snap-section snap-start min-h-screen md:h-screen relative overflow-hidden pt-24 pb-12 md:pt-20 md:pb-0"
        style={{ backgroundColor: darkBrandColor }}
      >
        <div className="h-full flex flex-col justify-center py-8 md:py-0">
          <div className="max-w-7xl mx-auto px-6 md:px-12 w-full">
            {/* 헤더 */}
            <div className="text-center mb-8 md:mb-12">
              <p className="text-xs md:text-sm font-medium tracking-widest uppercase mb-3" style={{ color: branding.brand_color }}>
                Vision & Strategy
              </p>
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-4 leading-tight">
                오늘청소 <span style={{ color: branding.brand_color }}>비전 및 전략</span>
              </h2>
              <div className="inline-block backdrop-blur-sm rounded-full px-4 md:px-6 py-2 md:py-3" style={{ backgroundColor: `${branding.brand_color}33` }}>
                <p className="text-white text-sm md:text-base font-medium">
                  깨끗한 환경과 전문 서비스로 모두가 행복한 일상을 만들어갑니다
                </p>
              </div>
            </div>

            {/* 4개 카테고리 그리드 */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
              {KESG_GOALS.map((category) => (
                <div
                  key={category.category}
                  className="group bg-white/5 backdrop-blur-sm rounded-2xl p-4 md:p-6 border border-white/10 hover:bg-white/10 transition-all duration-300"
                  onMouseEnter={(e) => e.currentTarget.style.borderColor = `${branding.brand_color}4D`}
                  onMouseLeave={(e) => e.currentTarget.style.borderColor = ''}
                >
                  {/* 카테고리 헤더 */}
                  <div className="flex items-center gap-2 md:gap-3 mb-3 md:mb-4">
                    <div
                      className="w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110 bg-white/10 group-hover:bg-opacity-100"
                      style={{ '--hover-bg': branding.brand_color } as React.CSSProperties}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = branding.brand_color}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)'}
                    >
                      <category.icon className="w-5 h-5 md:w-6 md:h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-base md:text-lg font-bold text-white">{category.category}</h3>
                      <p className="text-[10px] md:text-xs text-gray-500 uppercase tracking-wider">{category.categoryEn}</p>
                    </div>
                  </div>

                  {/* 목표 리스트 */}
                  <ul className="space-y-1.5 md:space-y-2">
                    {category.goals.map((goal) => (
                      <li
                        key={goal.id}
                        className="flex items-start gap-2"
                      >
                        <span
                          className="flex-shrink-0 w-5 h-5 md:w-6 md:h-6 rounded text-[10px] md:text-xs font-bold flex items-center justify-center transition-colors bg-white/10 text-gray-400 group-hover:text-white"
                          style={{ '--hover-bg': `${branding.brand_color}33`, '--hover-color': branding.brand_color } as React.CSSProperties}
                        >
                          {String(goal.id).padStart(2, '0')}
                        </span>
                        <span className="text-gray-300 text-xs md:text-sm leading-relaxed group-hover:text-white transition-colors">
                          {goal.title}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            {/* 하단 CTA */}
            <div className="mt-6 md:mt-10 text-center">
              <a
                href="/sites/onul/about"
                className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 text-white rounded-full font-medium transition-all duration-300 border border-white/20 group"
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = branding.brand_color;
                  e.currentTarget.style.borderColor = branding.brand_color;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '';
                  e.currentTarget.style.borderColor = '';
                }}
              >
                자세히 알아보기
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Section 4: Services */}
      <section
        id="services"
        className="snap-section snap-start min-h-screen md:h-screen relative overflow-hidden pt-24 pb-12 md:pt-20 md:pb-0"
        style={{ backgroundColor: darkBrandColor }}
      >
        <div className="h-full flex flex-col">
          {/* 상단 헤더 */}
          <div className="pt-4 md:pt-8 pb-4 md:pb-6">
            <div className="max-w-7xl mx-auto px-6 md:px-12">
              <p className="text-xs md:text-sm font-medium tracking-widest uppercase mb-2 md:mb-3" style={{ color: branding.brand_color }}>
                Our Services
              </p>
              <h2 className="text-2xl md:text-4xl font-bold text-white mb-4 md:mb-6">
                전문 청소 서비스
              </h2>
            </div>
          </div>

          {/* 탭 네비게이션 */}
          <div className="border-b border-gray-700">
            <div className="max-w-7xl mx-auto px-6 md:px-12">
              <div className="flex gap-0 overflow-x-auto scrollbar-hide">
                {[
                  { id: 'store', label: '상가 청소' },
                  { id: 'home', label: '가정 청소' },
                  { id: 'factory', label: '공장 청소' },
                  { id: 'special', label: '특수 청소' },
                  { id: 'etc', label: '기타' }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => handleTabChange(tab.id as ServiceTabType)}
                    className={`relative px-4 md:px-8 py-3 md:py-4 text-sm md:text-base font-medium whitespace-nowrap transition-all duration-300 ${
                      activeServiceTab === tab.id
                        ? 'text-white'
                        : 'text-gray-400 hover:text-gray-200'
                    }`}
                  >
                    {tab.label}
                    <div
                      className={`absolute bottom-0 left-0 right-0 h-0.5 transition-all duration-300 ${
                        activeServiceTab === tab.id ? 'opacity-100 scale-x-100' : 'opacity-0 scale-x-0'
                      }`}
                      style={{ backgroundColor: branding.brand_color }}
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 콘텐츠 영역 - 애니메이션 적용 */}
          <div className="flex-1 overflow-hidden">
            <div className="max-w-7xl mx-auto px-6 md:px-12 h-full">
              <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 h-full py-6 md:py-8">
                {/* 좌측: 텍스트 콘텐츠 */}
                <div
                  className={`flex flex-col justify-center space-y-4 md:space-y-6 transition-all duration-300 ease-out ${
                    isAnimating
                      ? `opacity-0 ${slideDirection === 'right' ? '-translate-x-8' : 'translate-x-8'}`
                      : 'opacity-100 translate-x-0'
                  }`}
                >
                  {/* 숫자 인덱스 */}
                  <div className="text-6xl md:text-8xl font-bold opacity-20" style={{ color: branding.brand_color }}>
                    {String(SERVICE_TABS.indexOf(activeServiceTab) + 1).padStart(2, '0')}
                  </div>

                  {/* 설명 텍스트 */}
                  <div className="space-y-4">
                    <p className="text-white text-sm md:text-lg leading-relaxed">
                      {SERVICES_DATA[activeServiceTab].description}
                    </p>
                  </div>

                  {/* 태그 */}
                  <div className="flex flex-wrap gap-2 md:gap-3">
                    {SERVICES_DATA[activeServiceTab].tags.map((tag, index) => (
                      <span
                        key={tag}
                        className="px-3 md:px-4 py-1.5 md:py-2 text-gray-300 rounded-full text-xs md:text-sm font-medium transition-all duration-300 hover:text-white"
                        style={{
                          backgroundColor: `${branding.brand_color}25`,
                          transitionDelay: isAnimating ? '0ms' : `${index * 50}ms`,
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = branding.brand_color}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = `${branding.brand_color}25`}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* 우측: 이미지 */}
                <div className="hidden lg:flex items-center justify-center">
                  <div
                    className={`relative w-full h-full max-h-[500px] rounded-2xl overflow-hidden transition-all duration-500 ease-out ${
                      isAnimating
                        ? `opacity-0 scale-95 ${slideDirection === 'right' ? 'translate-x-12' : '-translate-x-12'}`
                        : 'opacity-100 scale-100 translate-x-0'
                    }`}
                  >
                    {SERVICES_DATA[activeServiceTab].image ? (
                      <img
                        src={SERVICES_DATA[activeServiceTab].image}
                        alt={SERVICES_DATA[activeServiceTab].title}
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center">
                        <span className="text-gray-400 text-lg">{SERVICES_DATA[activeServiceTab].title}</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900/50 to-transparent" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 서비스 탭 전환 애니메이션 CSS */}
        <style jsx>{`
          @keyframes slideInRight {
            from {
              opacity: 0;
              transform: translateX(30px);
            }
            to {
              opacity: 1;
              transform: translateX(0);
            }
          }
          @keyframes slideInLeft {
            from {
              opacity: 0;
              transform: translateX(-30px);
            }
            to {
              opacity: 1;
              transform: translateX(0);
            }
          }
        `}</style>
      </section>

      {/* Section 4: Care */}
      <section
        className="snap-section snap-start min-h-screen md:h-screen relative flex items-center overflow-hidden pt-24 pb-12 md:pt-20 md:pb-0"
        style={{ backgroundColor: darkBrandColor }}
      >
        <div className="max-w-7xl mx-auto px-6 md:px-12 w-full">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
            {/* 텍스트 */}
            <div>
              <p className="text-xs md:text-sm font-medium tracking-widest uppercase mb-3 md:mb-4" style={{ color: branding.brand_color }}>
                ONUL Care
              </p>
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-4 md:mb-6 leading-tight">
                종합 케어<br />서비스
              </h2>
              <p className="text-base md:text-lg text-gray-400 leading-relaxed mb-6 md:mb-8">
                냉난방기, 공조기, 해충 방역까지 전문 장비와 노하우로
                공간 전체의 위생과 쾌적함을 책임집니다.
              </p>

              <div className="space-y-3 md:space-y-4">
                {['냉난방기 청소', '공조기 청소', '해충 방역'].map((item, index) => (
                  <div key={item} className="flex items-center gap-3 md:gap-4">
                    <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-white/10 flex items-center justify-center text-white text-xs md:text-sm font-medium">
                      0{index + 1}
                    </div>
                    <span className="text-white text-base md:text-lg">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 이미지 - 모바일에서 숨김 */}
            <div className="hidden lg:grid grid-cols-2 gap-4">
              <div className="aspect-[3/4] rounded-2xl overflow-hidden">
                <img
                  src="/images/onul/care-hvac-1.jpeg"
                  alt="냉난방기 청소"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="aspect-[3/4] rounded-2xl overflow-hidden mt-12">
                <img
                  src="/images/onul/care-hvac-2.jpeg"
                  alt="냉난방기 청소"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 5: Partners - 모바일 상하 여백 조정 */}
      <section
        className="snap-section snap-start min-h-screen md:h-screen relative flex items-center bg-white overflow-hidden pt-24 pb-12 md:pt-20 md:pb-0"
      >
        <div className="w-full">
          <div className="max-w-7xl mx-auto px-6 md:px-12 mb-6 md:mb-16">
            <p className="text-xs md:text-sm font-medium tracking-widest uppercase mb-3 md:mb-4" style={{ color: branding.brand_color }}>
              Partners
            </p>
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-3 md:mb-4">
              신뢰할 수 있는 파트너
            </h2>
            <p className="text-base md:text-lg text-gray-500">
              다양한 기업들과 함께 청결한 환경을 만들어갑니다.
            </p>
          </div>

          {/* 로고 슬라이더 */}
          <div className="overflow-hidden">
            <div className="flex animate-scroll gap-8 md:gap-16 py-4 md:py-8">
              {[
                'https://cdn.imweb.me/upload/S202411166380e02dc267b/4072e8fea61c5.png',
                'https://cdn.imweb.me/upload/S202411166380e02dc267b/4377c8048f976.png',
                'https://cdn.imweb.me/upload/S202411166380e02dc267b/557708ac5f134.png',
                'https://cdn.imweb.me/upload/S202411166380e02dc267b/369f48a45f9f4.png',
                'https://cdn.imweb.me/upload/S202411166380e02dc267b/f11bcc4b6ad38.png',
                'https://cdn.imweb.me/upload/S202411166380e02dc267b/73c85102eaefa.png',
                'https://cdn.imweb.me/upload/S202411166380e02dc267b/2428d0a3fdd4b.png',
                'https://cdn.imweb.me/upload/S202411166380e02dc267b/ab5910e1793d9.png',
                'https://cdn.imweb.me/upload/S202411166380e02dc267b/7e1a498616045.png',
              ].map((logo, i) => (
                <div key={i} className="flex-shrink-0 w-24 h-12 md:w-40 md:h-20 grayscale hover:grayscale-0 transition-all opacity-50 hover:opacity-100">
                  <img src={logo} alt={`Partner ${i + 1}`} className="w-full h-full object-contain" />
                </div>
              ))}
              {/* 복제본 */}
              {[
                'https://cdn.imweb.me/upload/S202411166380e02dc267b/4072e8fea61c5.png',
                'https://cdn.imweb.me/upload/S202411166380e02dc267b/4377c8048f976.png',
                'https://cdn.imweb.me/upload/S202411166380e02dc267b/557708ac5f134.png',
                'https://cdn.imweb.me/upload/S202411166380e02dc267b/369f48a45f9f4.png',
                'https://cdn.imweb.me/upload/S202411166380e02dc267b/f11bcc4b6ad38.png',
                'https://cdn.imweb.me/upload/S202411166380e02dc267b/73c85102eaefa.png',
                'https://cdn.imweb.me/upload/S202411166380e02dc267b/2428d0a3fdd4b.png',
                'https://cdn.imweb.me/upload/S202411166380e02dc267b/ab5910e1793d9.png',
                'https://cdn.imweb.me/upload/S202411166380e02dc267b/7e1a498616045.png',
              ].map((logo, i) => (
                <div key={`dup-${i}`} className="flex-shrink-0 w-24 h-12 md:w-40 md:h-20 grayscale hover:grayscale-0 transition-all opacity-50 hover:opacity-100">
                  <img src={logo} alt={`Partner ${i + 1}`} className="w-full h-full object-contain" />
                </div>
              ))}
            </div>
          </div>

          {/* 통계 */}
          <div className="max-w-7xl mx-auto px-6 md:px-12 mt-8 md:mt-16">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 border-t border-gray-200 pt-6 md:pt-12">
              {[
                { num: '100+', label: '파트너사' },
                { num: '5년+', label: '업력' },
                { num: '24/7', label: '고객 지원' },
                { num: '전국', label: '서비스 지역' },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="text-xl md:text-3xl font-bold text-gray-900">{stat.num}</div>
                  <div className="text-xs md:text-sm text-gray-500 mt-1">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <style jsx global>{`
          @keyframes scroll {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
          .animate-scroll {
            animation: scroll 30s linear infinite;
          }
          @keyframes float {
            0%, 100% {
              transform: translateY(0);
            }
            50% {
              transform: translateY(-10px);
            }
          }
        `}</style>
      </section>

      {/* Section 6: People & Education */}
      <section
        className="snap-section snap-start min-h-screen md:h-screen relative flex items-center bg-gray-50 overflow-hidden pt-24 pb-12 md:pt-20 md:pb-0"
      >
        <div className="max-w-7xl mx-auto px-6 md:px-12 w-full">
          <div className="grid md:grid-cols-2 gap-4 md:gap-8">
            {/* 인력 파견 */}
            <div className="bg-white rounded-2xl md:rounded-3xl p-6 md:p-10">
              <p className="text-xs md:text-sm font-medium tracking-widest uppercase mb-2 md:mb-4" style={{ color: branding.brand_color }}>
                People
              </p>
              <h3 className="text-xl md:text-3xl font-bold text-gray-900 mb-2 md:mb-4">
                전문 인력 파견
              </h3>
              <p className="text-sm md:text-base text-gray-500 mb-4 md:mb-8">
                청소 전문 교육을 받은 인력이 직접 현장을 방문해
                체계적인 청소를 제공합니다.
              </p>
              <ul className="space-y-2 md:space-y-3 text-sm md:text-base text-gray-700">
                <li className="flex items-center gap-2 md:gap-3">
                  <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: branding.brand_color }} />
                  전문 교육 후 인력 파견
                </li>
                <li className="flex items-center gap-2 md:gap-3">
                  <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: branding.brand_color }} />
                  현장 맞춤 서비스
                </li>
                <li className="flex items-center gap-2 md:gap-3">
                  <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: branding.brand_color }} />
                  체계적 유지관리
                </li>
              </ul>
            </div>

            {/* 교육 */}
            <div className="rounded-2xl md:rounded-3xl p-6 md:p-10 text-white" style={{ backgroundColor: darkBrandColor }}>
              <p className="text-xs md:text-sm font-medium tracking-widest uppercase mb-2 md:mb-4" style={{ color: branding.brand_color }}>
                Education
              </p>
              <h3 className="text-xl md:text-3xl font-bold mb-2 md:mb-4">
                전문 교육 프로그램
              </h3>
              <p className="text-sm md:text-base text-gray-400 mb-4 md:mb-8">
                탄탄한 기본기와 심화 과정을 통해
                현장에 바로 적용할 수 있는 전문성을 키웁니다.
              </p>
              <div className="flex items-center gap-3 md:gap-6">
                <div className="w-16 h-16 md:w-24 md:h-24 rounded-full bg-white flex items-center justify-center">
                  <span className="text-gray-900 font-bold text-sm md:text-base">기본기</span>
                </div>
                <ChevronRight className="w-4 h-4 md:w-6 md:h-6 text-gray-500" />
                <div className="w-16 h-16 md:w-24 md:h-24 rounded-full border-2 border-white flex items-center justify-center">
                  <span className="font-bold text-sm md:text-base">심화</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 7: Building Care (건물종합관리) */}
      <section className="snap-section snap-start min-h-screen md:h-screen relative flex items-center bg-white overflow-hidden pt-24 pb-12 md:pt-20 md:pb-0">
        <div className="max-w-7xl mx-auto px-6 md:px-12 w-full">
          {/* 헤더 */}
          <div className="mb-8 md:mb-12">
            <p className="text-xs md:text-sm font-medium tracking-widest uppercase mb-3 md:mb-4" style={{ color: branding.brand_color }}>
              Building Care
            </p>
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-3 md:mb-4">
              건물종합관리
            </h2>
            <p className="text-base md:text-lg text-gray-500">
              미화부터 시설관리까지, 건물 전체를 책임지는 통합 솔루션
            </p>
          </div>

          {/* 데스크톱: 수평 확장 카드 */}
          <div className="hidden lg:flex gap-4 h-[400px]">
            {[
              {
                id: 1,
                title: '미화 관리',
                number: '01',
                description: '쾌적한 환경유지를 위해 정기적인 서비스교육과 위생교육 및 모니터링을 실시하여 고품질의 서비스를 제공합니다. 본사직원의 청소대행 서비스로 사무실, 복도, 계단, 화장실, 주차장 등을 깨끗하게 관리하세요.',
                tags: ['건물 가치 상승', '세입자 만족도 향상', '공실률 최소화', '관리 비용 절감']
              },
              {
                id: 2,
                title: '부동산중개',
                number: '02',
                description: '전문적인 부동산 중개 서비스를 통해 최적의 매물을 찾아드립니다. 시장 분석과 법률 검토를 통해 안전하고 투명한 거래를 지원하며, 고객의 자산 가치를 극대화합니다.',
                tags: ['최적의 매물 발굴', '안전한 거래 보장', '시장 가치 분석', '전문 컨설팅 제공']
              },
              {
                id: 3,
                title: '시설관리',
                number: '03',
                description: '건물의 모든 시설을 체계적으로 관리하여 안전하고 쾌적한 환경을 유지합니다. 정기점검과 예방정비를 통해 시설의 수명을 연장하고, 갑작스러운 고장을 방지합니다.',
                tags: ['시설 수명 연장', '안전사고 예방', '에너지 효율 향상', '긴급 대응 체계']
              }
            ].map((card, index) => (
              <div
                key={card.id}
                className={`relative flex flex-col rounded-2xl overflow-hidden transition-all duration-500 ease-out cursor-pointer ${
                  expandedCareCard === index
                    ? 'flex-[2]'
                    : 'flex-1'
                }`}
                style={{ backgroundColor: darkBrandColor }}
                onMouseEnter={() => setExpandedCareCard(index)}
                onMouseLeave={() => setExpandedCareCard(null)}
              >
                {/* 기본 상태 (축소) */}
                <div className={`absolute inset-0 flex flex-col items-center justify-center p-8 transition-opacity duration-300 ${
                  expandedCareCard === index ? 'opacity-0' : 'opacity-100'
                }`}>
                  <div className="text-7xl font-bold opacity-30 mb-4" style={{ color: branding.brand_color }}>
                    {card.number}
                  </div>
                  <h3 className="text-2xl font-bold text-white text-center writing-mode-vertical">
                    {card.title}
                  </h3>
                </div>

                {/* 확장 상태 */}
                <div className={`absolute inset-0 flex flex-col justify-center p-10 transition-opacity duration-300 ${
                  expandedCareCard === index ? 'opacity-100' : 'opacity-0 pointer-events-none'
                }`}>
                  <div className="text-5xl font-bold opacity-40 mb-4" style={{ color: branding.brand_color }}>
                    {card.number}
                  </div>
                  <h3 className="text-3xl font-bold text-white mb-6">
                    {card.title}
                  </h3>
                  <p className="text-gray-300 text-base leading-relaxed mb-6">
                    {card.description}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {card.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-4 py-2 bg-white/10 text-gray-200 rounded-full text-sm font-medium"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* 모바일: 세로 스택 카드 */}
          <div className="lg:hidden space-y-4">
            {[
              {
                id: 1,
                title: '미화 관리',
                number: '01',
                description: '쾌적한 환경유지를 위해 정기적인 서비스교육과 위생교육 및 모니터링을 실시하여 고품질의 서비스를 제공합니다.',
                tags: ['건물 가치 상승', '세입자 만족도 향상', '공실률 최소화', '관리 비용 절감']
              },
              {
                id: 2,
                title: '부동산중개',
                number: '02',
                description: '전문적인 부동산 중개 서비스를 통해 최적의 매물을 찾아드립니다. 시장 분석과 법률 검토를 통해 안전하고 투명한 거래를 지원합니다.',
                tags: ['최적의 매물 발굴', '안전한 거래 보장', '시장 가치 분석', '전문 컨설팅 제공']
              },
              {
                id: 3,
                title: '시설관리',
                number: '03',
                description: '건물의 모든 시설을 체계적으로 관리하여 안전하고 쾌적한 환경을 유지합니다. 정기점검과 예방정비를 통해 시설의 수명을 연장합니다.',
                tags: ['시설 수명 연장', '안전사고 예방', '에너지 효율 향상', '긴급 대응 체계']
              }
            ].map((card, index) => (
              <div
                key={card.id}
                className="rounded-2xl overflow-hidden transition-all duration-300"
                style={{ backgroundColor: darkBrandColor }}
                onClick={() => setExpandedCareCard(expandedCareCard === index ? null : index)}
              >
                {/* 카드 헤더 (항상 표시) */}
                <div className="p-6 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="text-3xl font-bold opacity-40" style={{ color: branding.brand_color }}>
                      {card.number}
                    </div>
                    <h3 className="text-xl font-bold text-white">
                      {card.title}
                    </h3>
                  </div>
                  <ChevronDown className={`w-5 h-5 text-white transition-transform duration-300 ${
                    expandedCareCard === index ? 'rotate-180' : ''
                  }`} />
                </div>

                {/* 카드 본문 (확장 시 표시) */}
                <div className={`transition-all duration-300 overflow-hidden ${
                  expandedCareCard === index
                    ? 'max-h-96 opacity-100'
                    : 'max-h-0 opacity-0'
                }`}>
                  <div className="px-6 pb-6 space-y-4">
                    <p className="text-gray-300 text-sm leading-relaxed">
                      {card.description}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {card.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-3 py-1.5 bg-white/10 text-gray-200 rounded-full text-xs font-medium"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 8: Contact & Footer */}
      <section
        id="contact"
        className="snap-section snap-start min-h-screen md:h-screen relative flex items-center overflow-hidden pt-24 pb-12 md:pt-20 md:pb-0"
        style={{ backgroundColor: darkBrandColor }}
      >
        <div className="max-w-7xl mx-auto px-6 md:px-12 w-full">
          <div className="grid lg:grid-cols-2 gap-6 md:gap-12 items-center">
            {/* 연락처 - 모바일에서 숨김 */}
            <div className="hidden lg:block">
              <p className="text-sm font-medium tracking-widest uppercase mb-4" style={{ color: branding.brand_color }}>
                Contact
              </p>
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                상담 문의
              </h2>
              <p className="text-lg text-gray-400 mb-12">
                깨끗한 공간을 위한 첫 걸음,<br />
                지금 바로 문의하세요.
              </p>

              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
                    <Phone className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">전화</div>
                    <div className="text-white text-lg">{branding.contact_phone || '1234-5678'}</div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
                    <Mail className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">이메일</div>
                    <div className="text-white text-lg">{branding.contact_email || 'contact@onul.com'}</div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">주소</div>
                    <div className="text-white text-lg">{branding.contact_address || '서울특별시 강남구'}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* CTA */}
            <div className="bg-white rounded-2xl md:rounded-3xl p-6 md:p-10">
              <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-2 md:mb-4">
                무료 상담 신청
              </h3>
              <p className="text-sm md:text-base text-gray-500 mb-4 md:mb-8">
                전문 상담사가 맞춤 솔루션을 제안해 드립니다.
              </p>
              {submitSuccess ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ backgroundColor: `${branding.brand_color}20` }}>
                    <svg className="w-8 h-8" style={{ color: branding.brand_color }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h4 className="text-xl font-bold text-gray-900 mb-2">상담 신청 완료!</h4>
                  <p className="text-gray-500">빠른 시일 내에 연락드리겠습니다.</p>
                </div>
              ) : (
                <form className="space-y-3 md:space-y-4" onSubmit={handleConsultationSubmit}>
                  <input
                    type="text"
                    placeholder="이름"
                    value={consultationForm.name}
                    onChange={(e) => setConsultationForm(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-4 py-3 text-sm md:text-base border border-gray-200 rounded-lg focus:outline-none transition-colors"
                    style={{ '--focus-color': branding.brand_color } as React.CSSProperties}
                    onFocus={(e) => e.currentTarget.style.borderColor = branding.brand_color}
                    onBlur={(e) => e.currentTarget.style.borderColor = ''}
                    required
                  />
                  <input
                    type="tel"
                    placeholder="연락처"
                    value={consultationForm.phone}
                    onChange={(e) => setConsultationForm(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full px-4 py-3 text-sm md:text-base border border-gray-200 rounded-lg focus:outline-none transition-colors"
                    onFocus={(e) => e.currentTarget.style.borderColor = branding.brand_color}
                    onBlur={(e) => e.currentTarget.style.borderColor = ''}
                    required
                  />
                  <input
                    type="email"
                    placeholder="이메일 (선택)"
                    value={consultationForm.email}
                    onChange={(e) => setConsultationForm(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-4 py-3 text-sm md:text-base border border-gray-200 rounded-lg focus:outline-none transition-colors"
                    onFocus={(e) => e.currentTarget.style.borderColor = branding.brand_color}
                    onBlur={(e) => e.currentTarget.style.borderColor = ''}
                  />
                  <textarea
                    placeholder="문의 내용"
                    value={consultationForm.message}
                    onChange={(e) => setConsultationForm(prev => ({ ...prev, message: e.target.value }))}
                    rows={2}
                    className="w-full px-4 py-3 text-sm md:text-base border border-gray-200 rounded-lg focus:outline-none resize-none transition-colors"
                    onFocus={(e) => e.currentTarget.style.borderColor = branding.brand_color}
                    onBlur={(e) => e.currentTarget.style.borderColor = ''}
                  />
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 md:py-4 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                    style={{ backgroundColor: branding.brand_color }}
                    onMouseEnter={(e) => !isSubmitting && (e.currentTarget.style.opacity = '0.9')}
                    onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                  >
                    {isSubmitting ? '신청 중...' : '상담 신청하기'}
                  </button>
                </form>
              )}

              {/* 모바일용 연락처 */}
              <div className="lg:hidden mt-6 pt-6 border-t border-gray-200">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <a href={`tel:${branding.contact_phone || '1234-5678'}`} className="flex flex-col items-center gap-2">
                    <Phone className="w-5 h-5" style={{ color: branding.brand_color }} />
                    <span className="text-xs text-gray-600">전화</span>
                  </a>
                  <a href={`mailto:${branding.contact_email || 'contact@onul.com'}`} className="flex flex-col items-center gap-2">
                    <Mail className="w-5 h-5" style={{ color: branding.brand_color }} />
                    <span className="text-xs text-gray-600">이메일</span>
                  </a>
                  <a href="#" className="flex flex-col items-center gap-2">
                    <MapPin className="w-5 h-5" style={{ color: branding.brand_color }} />
                    <span className="text-xs text-gray-600">위치</span>
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* 푸터 */}
          <div className="mt-8 md:mt-16 pt-6 md:pt-8 border-t border-gray-800 flex flex-col md:flex-row items-center justify-between gap-4 text-gray-500 text-xs md:text-sm">
            <p>&copy; 2025 오늘청소. All rights reserved.</p>
            <div className="flex gap-4 md:gap-6">
              {navigation.map((item) => (
                <a key={item.name} href={item.href} className="hover:text-white transition-colors">
                  {item.name}
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
