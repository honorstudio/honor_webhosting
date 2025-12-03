-- sites 테이블에 notification_email 컬럼 추가
-- 상담 문의가 들어오면 이 이메일로 알림 발송
-- null인 경우 contact_email로 대체 사용

ALTER TABLE sites
ADD COLUMN IF NOT EXISTS notification_email TEXT;

-- 기존 onul 사이트에 기본값 설정
UPDATE sites
SET notification_email = 'today365@onul.day'
WHERE slug = 'onul' AND notification_email IS NULL;
