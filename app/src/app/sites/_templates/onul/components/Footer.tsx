'use client';

import { useState, useEffect } from 'react';
import { Settings } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

/**
 * 오늘청소 공통 푸터 컴포넌트
 * 모든 페이지에서 동일한 푸터 제공
 * 브랜드 컬러 기반 다크 배경 사용
 */

// 캐시 키
const BRAND_CACHE_KEY = 'onul_brand_color';

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

// 푸터 링크 (공통)
const FOOTER_LINKS = [
  { name: '기업소개', href: '/sites/onul/about' },
  { name: '소식', href: '/sites/onul/news' },
];

export default function Footer() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [brandColor, setBrandColor] = useState('#67c0a1');

  useEffect(() => {
    // 캐시된 브랜드 컬러 먼저 확인
    const cachedBrandColor = localStorage.getItem(BRAND_CACHE_KEY);
    if (cachedBrandColor) {
      setBrandColor(cachedBrandColor);
    }

    const checkAdminStatus = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      // 브랜드 컬러 가져오기
      const { data: site } = await supabase
        .from('sites')
        .select('brand_color')
        .eq('slug', 'onul')
        .single();

      if (site?.brand_color) {
        setBrandColor(site.brand_color);
        localStorage.setItem(BRAND_CACHE_KEY, site.brand_color);
      }

      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();

        if (profile?.role === 'admin') {
          setIsAdmin(true);
        }
      }
    };

    checkAdminStatus();
  }, []);

  const darkBrandColor = getDarkBrandColor(brandColor);

  return (
    <footer className="border-t border-gray-800 py-8" style={{ backgroundColor: darkBrandColor }}>
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-gray-500 text-sm">
          <p>&copy; 2025 오늘청소. All rights reserved.</p>
          <div className="flex items-center gap-6">
            {FOOTER_LINKS.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="hover:text-white transition-colors"
              >
                {link.name}
              </a>
            ))}
            {isAdmin && (
              <a
                href="/sites/onul/manage"
                className="flex items-center gap-1.5 transition-colors"
                style={{ color: brandColor }}
                onMouseEnter={(e) => e.currentTarget.style.opacity = '0.8'}
                onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
              >
                <Settings className="w-4 h-4" />
                관리자
              </a>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
}
