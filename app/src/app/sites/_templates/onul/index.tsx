'use client';

import dynamic from 'next/dynamic';

/**
 * 오늘청소 템플릿 버전 라우터
 *
 * props.version에 따라 해당 버전의 템플릿을 동적으로 로드합니다.
 * 새 버전 추가 시:
 * 1. versions/v{N}/index.tsx 파일 생성
 * 2. 아래 VERSION_COMPONENTS에 추가
 */

// 버전별 컴포넌트 동적 import
const VERSION_COMPONENTS = {
  v1: dynamic(() => import('./versions/v1'), { ssr: true }),
  v2: dynamic(() => import('./versions/v2'), { ssr: true }),
  hygiene: dynamic(() => import('./versions/hygiene'), { ssr: true }),
  // v3: dynamic(() => import('./versions/v3'), { ssr: true }),
};

// 사용 가능한 버전 목록 (외부에서 참조용)
export const AVAILABLE_VERSIONS = Object.keys(VERSION_COMPONENTS);

// 기본 버전 (v2로 변경 - 리디자인 버전)
export const DEFAULT_VERSION = 'v2';

interface OnulTemplateProps {
  version?: string;
}

/**
 * 오늘청소 메인 템플릿 컴포넌트
 * version prop에 따라 해당 버전을 렌더링
 */
export default function OnulTemplate({ version = DEFAULT_VERSION }: OnulTemplateProps) {
  // 유효한 버전인지 확인
  const validVersion = VERSION_COMPONENTS[version as keyof typeof VERSION_COMPONENTS]
    ? version
    : DEFAULT_VERSION;

  // 해당 버전의 컴포넌트 가져오기
  const VersionComponent = VERSION_COMPONENTS[validVersion as keyof typeof VERSION_COMPONENTS];

  return <VersionComponent />;
}
