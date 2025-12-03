-- consultations 테이블에 email 컬럼 추가
-- 상담 신청자의 이메일 주소 저장

ALTER TABLE consultations
ADD COLUMN IF NOT EXISTS email TEXT;

-- 기존 레코드에는 null 값으로 유지
