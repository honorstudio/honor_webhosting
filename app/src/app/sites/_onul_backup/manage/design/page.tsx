'use client';

import { useState } from 'react';

/**
 * 섹션 타입 정의
 */
interface Section {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  order: number;
}

/**
 * 디자인 설정 페이지
 * 섹션 활성화/비활성화 및 기본 설정 관리
 */
export default function DesignPage() {
  // 섹션 데이터 (나중에 Supabase에서 가져올 예정)
  const [sections, setSections] = useState<Section[]>([
    {
      id: 'section00',
      name: 'Section 00 - 히어로',
      description: '메인 히어로 섹션 (대표 이미지 및 타이틀)',
      isActive: true,
      order: 0,
    },
    {
      id: 'section01',
      name: 'Section 01 - 소개',
      description: '서비스 소개 섹션',
      isActive: true,
      order: 1,
    },
    {
      id: 'section02',
      name: 'Section 02 - 특징',
      description: '주요 특징 및 기능 소개',
      isActive: true,
      order: 2,
    },
    {
      id: 'section03',
      name: 'Section 03 - 갤러리',
      description: '이미지 갤러리 섹션',
      isActive: true,
      order: 3,
    },
    {
      id: 'section04',
      name: 'Section 04 - 통계',
      description: '주요 수치 및 통계 정보',
      isActive: false,
      order: 4,
    },
    {
      id: 'section05',
      name: 'Section 05 - 후기',
      description: '사용자 리뷰 및 후기',
      isActive: true,
      order: 5,
    },
    {
      id: 'section06',
      name: 'Section 06 - FAQ',
      description: '자주 묻는 질문',
      isActive: true,
      order: 6,
    },
    {
      id: 'section07',
      name: 'Section 07 - 문의',
      description: '문의하기 폼',
      isActive: true,
      order: 7,
    },
    {
      id: 'section08',
      name: 'Section 08 - 푸터',
      description: '하단 푸터 정보',
      isActive: true,
      order: 8,
    },
  ]);

  const [isSaving, setIsSaving] = useState(false);

  // 섹션 활성화/비활성화 토글
  const toggleSection = (sectionId: string) => {
    setSections(
      sections.map((section) =>
        section.id === sectionId
          ? { ...section, isActive: !section.isActive }
          : section
      )
    );
  };

  // 저장 처리
  const handleSave = async () => {
    setIsSaving(true);

    // TODO: Supabase에 저장하는 로직 추가
    await new Promise((resolve) => setTimeout(resolve, 1000));

    setIsSaving(false);
    alert('디자인 설정이 저장되었습니다.');
  };

  return (
    <div>
      {/* 페이지 헤더 */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-foreground mb-2">
          디자인 설정
        </h1>
        <p className="text-foreground-muted">
          웹사이트 섹션을 활성화하거나 비활성화할 수 있습니다
        </p>
      </div>

      {/* 안내 메시지 */}
      <div className="mb-6 bg-surface border border-border rounded-lg p-4">
        <div className="text-sm text-foreground-muted">
          <span className="font-medium text-foreground">안내:</span> 섹션 순서
          변경 기능은 추후 업데이트 예정입니다. 현재는 활성화/비활성화만
          가능합니다.
        </div>
      </div>

      {/* 섹션 목록 */}
      <div className="space-y-4 mb-8">
        {sections.map((section) => (
          <div
            key={section.id}
            className={`bg-surface border rounded-lg p-6 transition-all ${
              section.isActive
                ? 'border-border'
                : 'border-border opacity-60'
            }`}
          >
            <div className="flex items-start justify-between">
              {/* 섹션 정보 */}
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-semibold text-foreground">
                    {section.name}
                  </h3>
                  {section.isActive ? (
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-success/10 text-success border border-success/30">
                      활성
                    </span>
                  ) : (
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-foreground-muted/10 text-foreground-muted border border-foreground-muted/30">
                      비활성
                    </span>
                  )}
                </div>
                <p className="text-sm text-foreground-muted">
                  {section.description}
                </p>
              </div>

              {/* 토글 스위치 */}
              <button
                onClick={() => toggleSection(section.id)}
                className={`relative w-14 h-7 rounded-full transition-colors ${
                  section.isActive ? 'bg-foreground' : 'bg-border'
                }`}
              >
                <span
                  className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-transform ${
                    section.isActive ? 'translate-x-7' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* 섹션 설정 (활성화된 경우에만 표시) */}
            {section.isActive && (
              <div className="mt-4 pt-4 border-t border-border">
                <div className="text-xs text-foreground-muted mb-2">
                  섹션별 상세 설정
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-foreground-muted mb-1">
                      제목
                    </label>
                    <input
                      type="text"
                      placeholder="섹션 제목 입력"
                      className="w-full px-3 py-2 text-sm border border-border rounded bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-foreground"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-foreground-muted mb-1">
                      부제목
                    </label>
                    <input
                      type="text"
                      placeholder="섹션 부제목 입력"
                      className="w-full px-3 py-2 text-sm border border-border rounded bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-foreground"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* 저장 버튼 */}
      <div className="flex justify-end gap-4">
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-3 border border-border text-foreground font-medium rounded-lg hover:bg-background transition-colors"
        >
          초기화
        </button>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="px-6 py-3 bg-foreground text-background font-medium rounded-lg hover:bg-foreground-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSaving ? '저장 중...' : '설정 저장'}
        </button>
      </div>

      {/* 통계 정보 */}
      <div className="mt-8 grid grid-cols-2 gap-4">
        <div className="bg-surface border border-border rounded-lg p-4">
          <div className="text-sm text-foreground-muted mb-1">활성 섹션</div>
          <div className="text-2xl font-semibold text-foreground">
            {sections.filter((s) => s.isActive).length}개
          </div>
        </div>
        <div className="bg-surface border border-border rounded-lg p-4">
          <div className="text-sm text-foreground-muted mb-1">비활성 섹션</div>
          <div className="text-2xl font-semibold text-foreground">
            {sections.filter((s) => !s.isActive).length}개
          </div>
        </div>
      </div>
    </div>
  );
}
