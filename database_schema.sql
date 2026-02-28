-- B2B 라이선스 관리를 위한 테이블 생성
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE b2b_licenses (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  license_key TEXT UNIQUE NOT NULL,
  salon_name TEXT NOT NULL,
  plan_type TEXT NOT NULL, -- '1month', '3month'
  status TEXT DEFAULT 'active', -- 'active', 'expired', 'revoked'
  max_uses INTEGER NOT NULL,
  used_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE
);

-- 인덱스 생성 (키 검색 속도 최적화)
CREATE INDEX idx_b2b_license_key ON b2b_licenses(license_key);

-- RLS (Row Level Security) 설정
ALTER TABLE b2b_licenses ENABLE ROW LEVEL SECURITY;

-- 누구나 라이선스 유효성 검증(SELECT)은 가능하도록 허용
CREATE POLICY "Anyone can read active licenses" 
ON b2b_licenses FOR SELECT 
USING (status = 'active');

-- 라이선스 생성 및 수정(INSERT/UPDATE)은 서비스 역할(Service Role) 백엔드에서만 가능해야 함
-- 클라이언트에서 직접 생성/수정 불가.

-- 추후 B2C 결제를 위한 users 테이블 구조 예시 (토스 페이먼츠 세션)
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  device_id TEXT UNIQUE, -- 모바일 디바이스 ID 또는 로컬스토리지 식별자
  subscription_status TEXT DEFAULT 'free', -- 'free', 'premium'
  subscription_expires_at TIMESTAMP WITH TIME ZONE,
  total_scans INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 스캔 기록 저장용 로그 테이블 (기존에 정의했던 구조)
CREATE TABLE IF NOT EXISTS scan_logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    device_id TEXT, -- B2B 라이선스를 쓴 유저 등을 위한 대체 식별자
    b2b_license_id UUID REFERENCES b2b_licenses(id) ON DELETE SET NULL, -- B2B 키를 통해 스캔한 경우 추적
    heart_rate INTEGER,
    hrv INTEGER,
    stress_index INTEGER,
    respiratory_rate INTEGER,
    voice_frequency_hz NUMERIC,
    aura_energy_level NUMERIC,
    ai_summary TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
