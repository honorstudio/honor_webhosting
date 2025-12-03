'use client';

import { useState } from 'react';

/**
 * 일반 설정 페이지
 * 사이트 이름, 도메인, 상태 등 기본 설정 관리
 */
export default function GeneralSettingsPage() {
  // 폼 상태 관리 (나중에 Supabase와 연동 예정)
  const [siteName, setSiteName] = useState('오늘');
  const [domain, setDomain] = useState('onul.kr');
  const [customDomain, setCustomDomain] = useState('');
  const [siteStatus, setSiteStatus] = useState<
    'active' | 'inactive' | 'maintenance'
  >('active');
  const [isSaving, setIsSaving] = useState(false);

  // 저장 처리
  const handleSave = async () => {
    setIsSaving(true);

    // TODO: Supabase에 저장하는 로직 추가
    await new Promise((resolve) => setTimeout(resolve, 1000));

    setIsSaving(false);
    alert('설정이 저장되었습니다.');
  };

  return (
    <div>
      {/* 페이지 헤더 */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-foreground mb-2">
          일반 설정
        </h1>
        <p className="text-foreground-muted">
          사이트의 기본 정보와 도메인을 관리합니다
        </p>
      </div>

      {/* 설정 폼 */}
      <div className="space-y-6">
        {/* 사이트 이름 */}
        <div className="bg-surface border border-border rounded-lg p-6">
          <label className="block mb-2">
            <span className="text-sm font-medium text-foreground">
              사이트 이름
            </span>
            <p className="text-xs text-foreground-muted mt-1">
              관리 페이지에서 표시되는 이름입니다
            </p>
          </label>
          <input
            type="text"
            value={siteName}
            onChange={(e) => setSiteName(e.target.value)}
            className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-foreground"
            placeholder="사이트 이름을 입력하세요"
          />
        </div>

        {/* 도메인 설정 */}
        <div className="bg-surface border border-border rounded-lg p-6">
          <div className="mb-4">
            <span className="text-sm font-medium text-foreground">
              도메인 설정
            </span>
            <p className="text-xs text-foreground-muted mt-1">
              사이트에 연결할 도메인을 관리합니다
            </p>
          </div>

          {/* 기본 도메인 */}
          <div className="mb-4">
            <label className="block mb-2">
              <span className="text-xs text-foreground-muted">기본 도메인</span>
            </label>
            <input
              type="text"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-foreground"
              placeholder="example.com"
            />
          </div>

          {/* 커스텀 도메인 */}
          <div>
            <label className="block mb-2">
              <span className="text-xs text-foreground-muted">
                커스텀 도메인 (선택사항)
              </span>
            </label>
            <input
              type="text"
              value={customDomain}
              onChange={(e) => setCustomDomain(e.target.value)}
              className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-foreground"
              placeholder="custom.com"
            />
            <p className="text-xs text-foreground-muted mt-2">
              추가 도메인을 연결하려면 DNS 설정이 필요합니다
            </p>
          </div>
        </div>

        {/* 사이트 상태 */}
        <div className="bg-surface border border-border rounded-lg p-6">
          <label className="block mb-4">
            <span className="text-sm font-medium text-foreground">
              사이트 상태
            </span>
            <p className="text-xs text-foreground-muted mt-1">
              사이트의 공개 상태를 설정합니다
            </p>
          </label>

          <div className="space-y-3">
            {/* 활성 */}
            <label className="flex items-center p-4 border border-border rounded-lg cursor-pointer hover:bg-background transition-colors">
              <input
                type="radio"
                name="status"
                value="active"
                checked={siteStatus === 'active'}
                onChange={(e) =>
                  setSiteStatus(
                    e.target.value as 'active' | 'inactive' | 'maintenance'
                  )
                }
                className="mr-3"
              />
              <div>
                <div className="text-sm font-medium text-foreground">활성</div>
                <div className="text-xs text-foreground-muted">
                  사이트가 정상적으로 운영됩니다
                </div>
              </div>
            </label>

            {/* 비활성 */}
            <label className="flex items-center p-4 border border-border rounded-lg cursor-pointer hover:bg-background transition-colors">
              <input
                type="radio"
                name="status"
                value="inactive"
                checked={siteStatus === 'inactive'}
                onChange={(e) =>
                  setSiteStatus(
                    e.target.value as 'active' | 'inactive' | 'maintenance'
                  )
                }
                className="mr-3"
              />
              <div>
                <div className="text-sm font-medium text-foreground">
                  비활성
                </div>
                <div className="text-xs text-foreground-muted">
                  사이트가 비공개 상태입니다
                </div>
              </div>
            </label>

            {/* 점검 중 */}
            <label className="flex items-center p-4 border border-border rounded-lg cursor-pointer hover:bg-background transition-colors">
              <input
                type="radio"
                name="status"
                value="maintenance"
                checked={siteStatus === 'maintenance'}
                onChange={(e) =>
                  setSiteStatus(
                    e.target.value as 'active' | 'inactive' | 'maintenance'
                  )
                }
                className="mr-3"
              />
              <div>
                <div className="text-sm font-medium text-foreground">
                  점검 중
                </div>
                <div className="text-xs text-foreground-muted">
                  점검 중 페이지가 표시됩니다
                </div>
              </div>
            </label>
          </div>
        </div>

        {/* 저장 버튼 */}
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-6 py-3 bg-foreground text-background font-medium rounded-lg hover:bg-foreground-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? '저장 중...' : '설정 저장'}
          </button>
        </div>
      </div>
    </div>
  );
}
