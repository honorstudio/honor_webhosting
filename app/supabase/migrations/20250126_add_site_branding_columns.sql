-- sites 테이블에 브랜드 관련 컬럼 추가
-- logo_horizontal: 가로형 로고 URL
-- logo_vertical: 세로형 로고 URL (선택사항)
-- brand_color: 브랜드 컬러 hex 코드

ALTER TABLE sites
ADD COLUMN IF NOT EXISTS logo_horizontal TEXT,
ADD COLUMN IF NOT EXISTS logo_vertical TEXT,
ADD COLUMN IF NOT EXISTS brand_color TEXT DEFAULT '#67c0a1';

-- 기존 데이터에 기본 브랜드 컬러 적용
UPDATE sites
SET brand_color = '#67c0a1'
WHERE brand_color IS NULL;
