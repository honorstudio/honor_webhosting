-- sites 테이블에 og_image와 favicon 컬럼 추가
-- og_image: SNS 공유시 표시되는 대표 이미지 URL
-- favicon: 브라우저 탭 아이콘 URL

ALTER TABLE sites
ADD COLUMN IF NOT EXISTS og_image TEXT,
ADD COLUMN IF NOT EXISTS favicon TEXT;
