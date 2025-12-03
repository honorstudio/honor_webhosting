'use client';

import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

/**
 * 오늘청소 공통 헤더 컴포넌트
 * 모든 페이지에서 동일한 네비게이션 제공
 * Supabase에서 로고와 브랜드 컬러를 불러옴
 * 로고는 localStorage에 base64로 캐싱하여 즉시 표시
 *
 * 기능:
 * - 스크롤 시 투명 → 불투명 전환
 * - 모바일 메뉴 열림 시 투명도 제거 (항상 흰 배경)
 * - 슬라이드 다운 모바일 메뉴 애니메이션
 */

interface HeaderProps {
  /** 스크롤 시 배경색 변경 여부 (기본: true) */
  transparentOnTop?: boolean;
}

interface SiteBranding {
  logo_horizontal: string | null;
  brand_color: string;
}

// 캐시 키
const LOGO_CACHE_KEY = 'onul_logo_base64';
const BRAND_CACHE_KEY = 'onul_brand_color';

// 네비게이션 메뉴 (공통)
const NAVIGATION = [
  { name: '기업소개', href: '/sites/onul/about' },
  { name: '소식', href: '/sites/onul/news' },
];

export default function Header({ transparentOnTop = true }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [logoDataUrl, setLogoDataUrl] = useState<string | null>(null);
  const [branding, setBranding] = useState<SiteBranding>({
    logo_horizontal: null,
    brand_color: '#67c0a1'
  });

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

  // 2. Supabase에서 최신 데이터 가져오기 (백그라운드)
  useEffect(() => {
    const fetchBranding = async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from('sites')
        .select('logo_horizontal, brand_color')
        .eq('slug', 'onul')
        .single();

      if (data) {
        const brandColor = data.brand_color || '#67c0a1';
        setBranding({
          logo_horizontal: data.logo_horizontal,
          brand_color: brandColor
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

  // 스크롤 이벤트 처리
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // 초기 상태 설정
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // 배경 스타일 결정 - 모바일 메뉴가 열려있으면 항상 불투명
  const isTransparent = transparentOnTop && !scrolled && !mobileMenuOpen;

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isTransparent
          ? 'bg-transparent'
          : 'bg-white/95 backdrop-blur-md shadow-sm'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="flex items-center justify-between h-20">
          {/* 로고 - 모바일에서 크기 줄임 */}
          <a href="/sites/onul" className="flex items-center h-6 md:h-8">
            {logoDataUrl ? (
              <img
                src={logoDataUrl}
                alt="오늘청소"
                className={`h-6 md:h-8 w-auto transition-all duration-300 ${
                  isTransparent ? 'brightness-0 invert' : ''
                }`}
              />
            ) : (
              // 로고 로드 중: 빈 공간 유지 (텍스트 없음)
              <div className="h-6 md:h-8 w-20 md:w-24" />
            )}
          </a>

          {/* 데스크톱 메뉴 */}
          <div className="hidden md:flex items-center gap-8">
            {NAVIGATION.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className={`text-sm font-medium transition-colors duration-300 ${
                  isTransparent ? 'text-white/90' : 'text-gray-600'
                }`}
                style={{ '--hover-color': branding.brand_color } as React.CSSProperties}
                onMouseEnter={(e) => e.currentTarget.style.color = branding.brand_color}
                onMouseLeave={(e) => e.currentTarget.style.color = ''}
              >
                {item.name}
              </a>
            ))}
            <a
              href="/sites/onul#contact"
              className="px-5 py-2 text-white text-sm rounded-full font-medium transition-all hover:opacity-90"
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
              <Menu className={`w-5 h-5 ${isTransparent ? 'text-white' : 'text-gray-900'}`} />
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
            {NAVIGATION.map((item, index) => (
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
              href="/sites/onul#contact"
              className="block py-3 px-4 mt-2 text-white font-medium rounded-xl text-center transition-all"
              style={{
                backgroundColor: branding.brand_color,
                transitionDelay: mobileMenuOpen ? `${NAVIGATION.length * 50}ms` : '0ms',
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
  );
}
