'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

/**
 * 사이트 정보 타입
 */
interface SiteSettings {
  id: string;
  name: string;
  slug: string;
  domain: string;
  description: string | null;
  logo_horizontal: string | null;
  logo_vertical: string | null;
  og_image: string | null;
  favicon: string | null;
  brand_color: string;
  contact_phone: string | null;
  contact_email: string | null;
  contact_address: string | null;
  notification_email: string | null;
}

/**
 * 관리자 일반설정 페이지
 * 로고 업로드 및 브랜드 컬러 설정
 */
export default function SettingsPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [uploadingHorizontal, setUploadingHorizontal] = useState(false);
  const [uploadingVertical, setUploadingVertical] = useState(false);
  const [uploadingOgImage, setUploadingOgImage] = useState(false);
  const [uploadingFavicon, setUploadingFavicon] = useState(false);

  // 폼 상태
  const [siteName, setSiteName] = useState('');
  const [siteDescription, setSiteDescription] = useState('');
  const [domain, setDomain] = useState('');
  const [brandColor, setBrandColor] = useState('#67c0a1');
  const [logoHorizontal, setLogoHorizontal] = useState<string | null>(null);
  const [logoVertical, setLogoVertical] = useState<string | null>(null);
  const [ogImage, setOgImage] = useState<string | null>(null);
  const [favicon, setFavicon] = useState<string | null>(null);
  const [contactPhone, setContactPhone] = useState('1234-5678');
  const [contactEmail, setContactEmail] = useState('contact@onul.com');
  const [contactAddress, setContactAddress] = useState('서울특별시 강남구');
  const [notificationEmail, setNotificationEmail] = useState('');

  // 사이트 설정 로드
  useEffect(() => {
    const loadSettings = async () => {
      setIsLoading(true);
      const supabase = createClient();

      const { data: site, error } = await supabase
        .from('sites')
        .select('id, name, slug, domain, description, logo_horizontal, logo_vertical, og_image, favicon, brand_color, contact_phone, contact_email, contact_address, notification_email')
        .eq('slug', slug)
        .single();

      if (error) {
        console.error('설정 로드 실패:', error);
      } else if (site) {
        setSettings(site);
        setSiteName(site.name || '');
        setSiteDescription(site.description || '');
        setDomain(site.domain || '');
        setBrandColor(site.brand_color || '#67c0a1');
        setLogoHorizontal(site.logo_horizontal);
        setLogoVertical(site.logo_vertical);
        setOgImage(site.og_image);
        setFavicon(site.favicon);
        setContactPhone(site.contact_phone || '1234-5678');
        setContactEmail(site.contact_email || 'contact@onul.com');
        setContactAddress(site.contact_address || '서울특별시 강남구');
        setNotificationEmail(site.notification_email || '');
      }

      setIsLoading(false);
    };

    loadSettings();
  }, [slug]);

  // 가로형 로고 업로드
  const handleHorizontalLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !settings) return;

    // 파일 타입 체크
    if (!file.type.startsWith('image/')) {
      alert('이미지 파일만 업로드 가능합니다.');
      return;
    }

    // 파일 크기 체크 (5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('파일 크기는 5MB 이하여야 합니다.');
      return;
    }

    setUploadingHorizontal(true);
    const supabase = createClient();

    try {
      // Supabase Storage에 업로드
      const fileExt = file.name.split('.').pop();
      const fileName = `${settings.id}_horizontal_${Date.now()}.${fileExt}`;
      const filePath = `logos/${fileName}`;

      const { error: uploadError, data } = await supabase.storage
        .from('site-assets')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Public URL 가져오기
      const { data: { publicUrl } } = supabase.storage
        .from('site-assets')
        .getPublicUrl(filePath);

      setLogoHorizontal(publicUrl);
      alert('가로형 로고가 업로드되었습니다. 변경사항을 저장해주세요.');
    } catch (error) {
      console.error('업로드 실패:', error);
      alert('로고 업로드에 실패했습니다.');
    }

    setUploadingHorizontal(false);
  };

  // 세로형 로고 업로드
  const handleVerticalLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !settings) return;

    if (!file.type.startsWith('image/')) {
      alert('이미지 파일만 업로드 가능합니다.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('파일 크기는 5MB 이하여야 합니다.');
      return;
    }

    setUploadingVertical(true);
    const supabase = createClient();

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${settings.id}_vertical_${Date.now()}.${fileExt}`;
      const filePath = `logos/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('site-assets')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('site-assets')
        .getPublicUrl(filePath);

      setLogoVertical(publicUrl);
      alert('세로형 로고가 업로드되었습니다. 변경사항을 저장해주세요.');
    } catch (error) {
      console.error('업로드 실패:', error);
      alert('로고 업로드에 실패했습니다.');
    }

    setUploadingVertical(false);
  };

  // OG 대표이미지 업로드
  const handleOgImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !settings) return;

    // 파일 타입 체크 (PNG, JPG만)
    if (!['image/png', 'image/jpeg', 'image/jpg'].includes(file.type)) {
      alert('PNG 또는 JPG 파일만 업로드 가능합니다.');
      return;
    }

    // 파일 크기 체크 (2MB)
    if (file.size > 2 * 1024 * 1024) {
      alert('파일 크기는 2MB 이하여야 합니다.');
      return;
    }

    setUploadingOgImage(true);
    const supabase = createClient();

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${settings.id}_og_${Date.now()}.${fileExt}`;
      const filePath = `og-images/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('site-assets')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('site-assets')
        .getPublicUrl(filePath);

      setOgImage(publicUrl);
      alert('대표 이미지가 업로드되었습니다. 변경사항을 저장해주세요.');
    } catch (error) {
      console.error('업로드 실패:', error);
      alert('이미지 업로드에 실패했습니다.');
    }

    setUploadingOgImage(false);
  };

  // 파비콘 업로드
  const handleFaviconUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !settings) return;

    // 파일 타입 체크 (PNG, ICO만)
    if (!['image/png', 'image/x-icon', 'image/vnd.microsoft.icon', 'image/ico'].includes(file.type)) {
      alert('PNG 또는 ICO 파일만 업로드 가능합니다.');
      return;
    }

    // 파일 크기 체크 (500KB)
    if (file.size > 500 * 1024) {
      alert('파일 크기는 500KB 이하여야 합니다.');
      return;
    }

    setUploadingFavicon(true);
    const supabase = createClient();

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${settings.id}_favicon_${Date.now()}.${fileExt}`;
      const filePath = `favicons/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('site-assets')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('site-assets')
        .getPublicUrl(filePath);

      setFavicon(publicUrl);
      alert('파비콘이 업로드되었습니다. 변경사항을 저장해주세요.');
    } catch (error) {
      console.error('업로드 실패:', error);
      alert('파비콘 업로드에 실패했습니다.');
    }

    setUploadingFavicon(false);
  };

  // 설정 저장 (Supabase 직접 사용)
  const handleSave = async () => {
    if (!settings) return;

    setIsSaving(true);
    const supabase = createClient();

    try {
      // UPDATE 요청 실행
      const { error, data } = await supabase
        .from('sites')
        .update({
          name: siteName,
          description: siteDescription,
          domain: domain,
          logo_horizontal: logoHorizontal,
          logo_vertical: logoVertical,
          og_image: ogImage,
          favicon: favicon,
          brand_color: brandColor,
          contact_phone: contactPhone,
          contact_email: contactEmail,
          contact_address: contactAddress,
          notification_email: notificationEmail || null,
        })
        .eq('id', settings.id)
        .select();

      if (error) {
        console.error('UPDATE 에러:', error);
        throw new Error(`저장 실패: ${error.message}`);
      }

      // UPDATE가 실제로 적용되었는지 확인
      if (!data || data.length === 0) {
        console.warn('UPDATE 결과 없음 - RLS 정책에 의해 차단됨');
        throw new Error('권한이 없어 저장할 수 없습니다.');
      }

      alert('설정이 저장되었습니다.');

      // 반환된 데이터로 상태 업데이트
      if (data[0]) {
        setSettings(data[0]);
      }
    } catch (error) {
      console.error('저장 실패:', error);
      const message = error instanceof Error ? error.message : '설정 저장에 실패했습니다.';
      alert(message);
    }

    setIsSaving(false);
  };

  // 로딩 스켈레톤
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-7 w-32 bg-neutral-200 rounded animate-pulse" />
        <div className="h-4 w-48 bg-neutral-100 rounded animate-pulse" />
        <div className="space-y-4 mt-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-neutral-100 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="text-center py-16">
        <p className="text-neutral-500">설정을 불러올 수 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* 페이지 헤더 */}
      <div>
        <h1 className="text-2xl font-semibold text-neutral-900 tracking-tight">
          일반 설정
        </h1>
        <p className="mt-1 text-sm text-neutral-500">
          사이트의 로고와 브랜드 컬러를 설정합니다
        </p>
      </div>

      {/* 설정 폼 */}
      <div className="space-y-6">
        {/* 사이트 기본 정보 */}
        <div className="bg-white border border-neutral-200 rounded-lg p-6">
          <h2 className="text-base font-medium text-neutral-900 mb-4">
            사이트 정보
          </h2>
          <p className="text-sm text-neutral-500 mb-4">
            사이트의 기본 정보를 설정합니다.
          </p>

          <div className="space-y-4">
            {/* 사이트 이름 */}
            <div>
              <label className="block text-xs font-medium text-neutral-500 uppercase mb-2">
                사이트 이름
              </label>
              <input
                type="text"
                value={siteName}
                onChange={(e) => setSiteName(e.target.value)}
                placeholder="오늘청소"
                className="w-full max-w-sm px-4 py-2.5 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition-shadow"
              />
            </div>

            {/* 슬러그 (읽기 전용) */}
            <div>
              <label className="block text-xs font-medium text-neutral-500 uppercase mb-2">
                슬러그 (URL 경로)
              </label>
              <input
                type="text"
                value={settings?.slug || slug}
                disabled
                className="w-full max-w-sm px-4 py-2.5 border border-neutral-200 rounded-lg text-sm bg-neutral-50 text-neutral-500 cursor-not-allowed"
              />
              <p className="mt-1 text-xs text-neutral-400">
                슬러그는 변경할 수 없습니다
              </p>
            </div>

            {/* 사이트 설명 */}
            <div>
              <label className="block text-xs font-medium text-neutral-500 uppercase mb-2">
                사이트 설명
              </label>
              <textarea
                value={siteDescription}
                onChange={(e) => setSiteDescription(e.target.value)}
                placeholder="사이트에 대한 간단한 설명을 입력하세요"
                rows={2}
                className="w-full max-w-lg px-4 py-2.5 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition-shadow resize-none"
              />
              <p className="mt-1 text-xs text-neutral-400">
                링크 공유시 표시되는 설명입니다 (OG Description)
              </p>
            </div>
          </div>
        </div>

        {/* 도메인 설정 */}
        <div className="bg-white border border-neutral-200 rounded-lg p-6">
          <h2 className="text-base font-medium text-neutral-900 mb-4">
            도메인 설정
          </h2>
          <p className="text-sm text-neutral-500 mb-4">
            사이트에 연결할 커스텀 도메인을 설정합니다.
          </p>

          <div className="space-y-4">
            {/* 도메인 입력 */}
            <div>
              <label className="block text-xs font-medium text-neutral-500 uppercase mb-2">
                커스텀 도메인
              </label>
              <input
                type="text"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                placeholder="example.com"
                className="w-full max-w-sm px-4 py-2.5 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition-shadow"
              />
              <p className="mt-1 text-xs text-neutral-400">
                www 없이 입력하세요 (예: onulcleaning.com)
              </p>
            </div>

            {/* 도메인 연결 가이드 */}
            {domain && (
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h3 className="text-sm font-medium text-blue-900 mb-2">
                  도메인 연결 방법
                </h3>
                <div className="text-sm text-blue-800 space-y-3">
                  <div>
                    <p className="font-medium mb-1">1. 네임칩(Namecheap) DNS 설정:</p>
                    <ul className="list-disc list-inside text-xs space-y-1 ml-2">
                      <li>네임칩 대시보드 → 도메인 관리 → Advanced DNS</li>
                      <li>A Record: Host: @, Value: <code className="px-1 py-0.5 bg-blue-100 rounded">76.76.21.21</code></li>
                      <li>CNAME Record: Host: www, Value: <code className="px-1 py-0.5 bg-blue-100 rounded">cname.vercel-dns.com</code></li>
                    </ul>
                  </div>
                  <div>
                    <p className="font-medium mb-1">2. Vercel 도메인 추가:</p>
                    <ul className="list-disc list-inside text-xs space-y-1 ml-2">
                      <li>Vercel 프로젝트 → Settings → Domains</li>
                      <li>도메인 추가: <code className="px-1 py-0.5 bg-blue-100 rounded">{domain}</code></li>
                      <li>www.{domain} 리다이렉트 설정</li>
                    </ul>
                  </div>
                  <p className="text-xs text-blue-600 mt-2">
                    DNS 변경 후 적용까지 최대 48시간이 소요될 수 있습니다.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 로고 섹션 - 2열 그리드 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 가로형 로고 */}
          <div className="bg-white border border-neutral-200 rounded-lg p-6">
            <h2 className="text-base font-medium text-neutral-900 mb-1">
              가로형 로고
            </h2>
            <p className="text-sm text-neutral-500 mb-4">
              헤더나 랜딩페이지에 사용됩니다
            </p>
            <p className="text-xs text-neutral-400 mb-4">
              권장: 너비 200-400px
            </p>

            {/* 현재 로고 미리보기 */}
            <div className="mb-4 p-4 bg-neutral-50 rounded-lg border border-neutral-200 min-h-[100px] flex items-center justify-center">
              {logoHorizontal ? (
                <img
                  src={logoHorizontal}
                  alt="가로형 로고"
                  className="max-h-16 max-w-full object-contain"
                />
              ) : (
                <span className="text-xs text-neutral-400">로고 없음</span>
              )}
            </div>

            {/* 파일 업로드 */}
            <div className="relative">
              <input
                type="file"
                accept="image/*"
                onChange={handleHorizontalLogoUpload}
                disabled={uploadingHorizontal}
                className="hidden"
                id="horizontal-logo-upload"
              />
              <label
                htmlFor="horizontal-logo-upload"
                className={`inline-flex items-center gap-2 px-4 py-2.5 border border-neutral-200 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                  uploadingHorizontal
                    ? 'bg-neutral-100 text-neutral-400 cursor-not-allowed'
                    : 'bg-white text-neutral-700 hover:bg-neutral-50'
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                {uploadingHorizontal ? '업로드 중...' : logoHorizontal ? '파일 변경' : '파일 선택'}
              </label>
              <p className="mt-2 text-xs text-neutral-400">
                JPG, PNG, SVG (최대 5MB)
              </p>
            </div>
          </div>

          {/* 세로형 로고 */}
          <div className="bg-white border border-neutral-200 rounded-lg p-6">
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-base font-medium text-neutral-900">
                세로형 로고
              </h2>
              <span className="px-2 py-0.5 text-xs font-medium bg-neutral-100 text-neutral-500 rounded">
                선택
              </span>
            </div>
            <p className="text-sm text-neutral-500 mb-4">
              모바일 메뉴에 사용됩니다
            </p>
            <p className="text-xs text-neutral-400 mb-4">
              권장: 높이 80-120px
            </p>

            {/* 현재 로고 미리보기 */}
            <div className="mb-4 p-4 bg-neutral-50 rounded-lg border border-neutral-200 min-h-[100px] flex items-center justify-center">
              {logoVertical ? (
                <img
                  src={logoVertical}
                  alt="세로형 로고"
                  className="max-h-20 max-w-full object-contain"
                />
              ) : (
                <span className="text-xs text-neutral-400">로고 없음</span>
              )}
            </div>

            {/* 파일 업로드 */}
            <div className="relative">
              <input
                type="file"
                accept="image/*"
                onChange={handleVerticalLogoUpload}
                disabled={uploadingVertical}
                className="hidden"
                id="vertical-logo-upload"
              />
              <label
                htmlFor="vertical-logo-upload"
                className={`inline-flex items-center gap-2 px-4 py-2.5 border border-neutral-200 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                  uploadingVertical
                    ? 'bg-neutral-100 text-neutral-400 cursor-not-allowed'
                    : 'bg-white text-neutral-700 hover:bg-neutral-50'
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                {uploadingVertical ? '업로드 중...' : logoVertical ? '파일 변경' : '파일 선택'}
              </label>
              <p className="mt-2 text-xs text-neutral-400">
                JPG, PNG, SVG (최대 5MB)
              </p>
            </div>
          </div>
        </div>

        {/* 대표 이미지 & 파비콘 - 2열 그리드 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* OG 대표이미지 */}
          <div className="bg-white border border-neutral-200 rounded-lg p-6">
            <h2 className="text-base font-medium text-neutral-900 mb-1">
              대표 이미지 (OG Image)
            </h2>
            <p className="text-sm text-neutral-500 mb-4">
              링크 공유시 표시되는 미리보기 이미지
            </p>
            <p className="text-xs text-neutral-400 mb-4">
              권장: 1200 x 630px (PNG, JPG)
            </p>

            {/* 미리보기 */}
            <div className="mb-4 p-4 bg-neutral-50 rounded-lg border border-neutral-200 min-h-[100px] flex items-center justify-center">
              {ogImage ? (
                <img
                  src={ogImage}
                  alt="대표 이미지"
                  className="max-h-24 max-w-full object-contain rounded"
                />
              ) : (
                <div className="text-center">
                  <svg className="w-8 h-8 mx-auto text-neutral-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="text-xs text-neutral-400">이미지 없음</span>
                </div>
              )}
            </div>

            {/* 파일 업로드 */}
            <div className="relative">
              <input
                type="file"
                accept="image/png,image/jpeg,image/jpg"
                onChange={handleOgImageUpload}
                disabled={uploadingOgImage}
                className="hidden"
                id="og-image-upload"
              />
              <label
                htmlFor="og-image-upload"
                className={`inline-flex items-center gap-2 px-4 py-2.5 border border-neutral-200 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                  uploadingOgImage
                    ? 'bg-neutral-100 text-neutral-400 cursor-not-allowed'
                    : 'bg-white text-neutral-700 hover:bg-neutral-50'
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                {uploadingOgImage ? '업로드 중...' : ogImage ? '파일 변경' : '파일 선택'}
              </label>
              <p className="mt-2 text-xs text-neutral-400">
                PNG, JPG (최대 2MB)
              </p>
            </div>
          </div>

          {/* 파비콘 */}
          <div className="bg-white border border-neutral-200 rounded-lg p-6">
            <h2 className="text-base font-medium text-neutral-900 mb-1">
              파비콘
            </h2>
            <p className="text-sm text-neutral-500 mb-4">
              브라우저 탭에 표시되는 아이콘
            </p>
            <p className="text-xs text-neutral-400 mb-4">
              권장: 32 x 32px 또는 16 x 16px (PNG, ICO)
            </p>

            {/* 미리보기 */}
            <div className="mb-4 p-4 bg-neutral-50 rounded-lg border border-neutral-200 min-h-[100px] flex items-center justify-center">
              {favicon ? (
                <div className="text-center">
                  <img
                    src={favicon}
                    alt="파비콘"
                    className="w-8 h-8 mx-auto object-contain"
                  />
                  <p className="mt-2 text-xs text-neutral-500">실제 크기 미리보기</p>
                </div>
              ) : (
                <div className="text-center">
                  <svg className="w-8 h-8 mx-auto text-neutral-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                  </svg>
                  <span className="text-xs text-neutral-400">아이콘 없음</span>
                </div>
              )}
            </div>

            {/* 파일 업로드 */}
            <div className="relative">
              <input
                type="file"
                accept="image/png,image/x-icon,image/vnd.microsoft.icon,.ico"
                onChange={handleFaviconUpload}
                disabled={uploadingFavicon}
                className="hidden"
                id="favicon-upload"
              />
              <label
                htmlFor="favicon-upload"
                className={`inline-flex items-center gap-2 px-4 py-2.5 border border-neutral-200 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                  uploadingFavicon
                    ? 'bg-neutral-100 text-neutral-400 cursor-not-allowed'
                    : 'bg-white text-neutral-700 hover:bg-neutral-50'
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                {uploadingFavicon ? '업로드 중...' : favicon ? '파일 변경' : '파일 선택'}
              </label>
              <p className="mt-2 text-xs text-neutral-400">
                PNG, ICO (최대 500KB)
              </p>
            </div>
          </div>
        </div>

        {/* 연락처 정보 */}
        <div className="bg-white border border-neutral-200 rounded-lg p-6">
          <h2 className="text-base font-medium text-neutral-900 mb-4">
            연락처 정보
          </h2>
          <p className="text-sm text-neutral-500 mb-4">
            사이트의 상담 문의 섹션에 표시되는 연락처 정보입니다.
          </p>

          <div className="space-y-4">
            {/* 전화번호 */}
            <div>
              <label className="block text-xs font-medium text-neutral-500 uppercase mb-2">
                전화번호
              </label>
              <input
                type="tel"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                placeholder="1234-5678"
                className="w-full max-w-sm px-4 py-2.5 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition-shadow"
              />
            </div>

            {/* 이메일 */}
            <div>
              <label className="block text-xs font-medium text-neutral-500 uppercase mb-2">
                이메일 (사이트 표시용)
              </label>
              <input
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                placeholder="contact@example.com"
                className="w-full max-w-sm px-4 py-2.5 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition-shadow"
              />
              <p className="mt-1 text-xs text-neutral-400">
                사이트 푸터나 연락처 섹션에 표시됩니다
              </p>
            </div>

            {/* 주소 */}
            <div>
              <label className="block text-xs font-medium text-neutral-500 uppercase mb-2">
                주소
              </label>
              <input
                type="text"
                value={contactAddress}
                onChange={(e) => setContactAddress(e.target.value)}
                placeholder="서울특별시 강남구"
                className="w-full max-w-md px-4 py-2.5 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition-shadow"
              />
            </div>
          </div>
        </div>

        {/* 알림 설정 */}
        <div className="bg-white border border-neutral-200 rounded-lg p-6">
          <h2 className="text-base font-medium text-neutral-900 mb-4">
            알림 설정
          </h2>
          <p className="text-sm text-neutral-500 mb-4">
            상담 문의가 접수되면 지정된 이메일로 알림이 발송됩니다.
          </p>

          <div className="space-y-4">
            {/* 알림 이메일 */}
            <div>
              <label className="block text-xs font-medium text-neutral-500 uppercase mb-2">
                알림 수신 이메일
              </label>
              <input
                type="email"
                value={notificationEmail}
                onChange={(e) => setNotificationEmail(e.target.value)}
                placeholder="today365@onul.day"
                className="w-full max-w-sm px-4 py-2.5 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition-shadow"
              />
              <p className="mt-1 text-xs text-neutral-400">
                상담 신청이 들어오면 이 이메일로 알림이 발송됩니다
              </p>
            </div>

            {/* 알림 미리보기 */}
            {notificationEmail && (
              <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <p className="text-sm font-medium text-green-800">알림 설정 완료</p>
                    <p className="text-xs text-green-700 mt-1">
                      새로운 상담 문의가 접수되면 <strong>{notificationEmail}</strong>으로 알림이 발송됩니다.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 브랜드 컬러 */}
        <div className="bg-white border border-neutral-200 rounded-lg p-6">
          <h2 className="text-base font-medium text-neutral-900 mb-4">
            브랜드 컬러
          </h2>
          <p className="text-sm text-neutral-500 mb-4">
            사이트의 대표 컬러를 설정합니다. 버튼, 링크 등에 사용됩니다.
          </p>

          <div className="flex items-center gap-4">
            {/* 컬러 피커 */}
            <div className="relative">
              <input
                type="color"
                value={brandColor}
                onChange={(e) => setBrandColor(e.target.value)}
                className="w-16 h-16 rounded-lg border-2 border-neutral-200 cursor-pointer"
              />
            </div>

            {/* HEX 입력 */}
            <div className="flex-1 max-w-xs">
              <label className="block text-xs font-medium text-neutral-500 uppercase mb-2">
                HEX 코드
              </label>
              <input
                type="text"
                value={brandColor}
                onChange={(e) => {
                  const value = e.target.value;
                  if (/^#[0-9A-F]{6}$/i.test(value) || value === '#' || value.length <= 7) {
                    setBrandColor(value);
                  }
                }}
                placeholder="#67c0a1"
                className="w-full px-4 py-2.5 border border-neutral-200 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition-shadow"
              />
            </div>

            {/* 미리보기 */}
            <div className="flex-1">
              <p className="text-xs font-medium text-neutral-500 uppercase mb-2">
                미리보기
              </p>
              <div className="flex items-center gap-2">
                <button
                  style={{ backgroundColor: brandColor }}
                  className="px-4 py-2 text-white text-sm font-medium rounded-lg"
                  disabled
                >
                  버튼 예시
                </button>
                <span style={{ color: brandColor }} className="text-sm font-medium">
                  링크 예시
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 저장 버튼 */}
      <div className="flex items-center gap-3 pt-6 border-t border-neutral-200">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-colors ${
            isSaving
              ? 'bg-neutral-300 text-neutral-500 cursor-not-allowed'
              : 'bg-neutral-900 text-white hover:bg-neutral-800'
          }`}
        >
          {isSaving ? '저장 중...' : '변경사항 저장'}
        </button>
        <p className="text-xs text-neutral-500">
          변경사항은 즉시 사이트에 반영됩니다
        </p>
      </div>
    </div>
  );
}
