-- Phase 4: OTP hashing and cleanup

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS phone_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone_number VARCHAR(20) NOT NULL UNIQUE,
  otp_hash TEXT,
  is_verified BOOLEAN DEFAULT FALSE,
  attempts INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP DEFAULT (CURRENT_TIMESTAMP + INTERVAL '10 minutes')
);

ALTER TABLE phone_verifications ADD COLUMN IF NOT EXISTS otp_hash TEXT;
ALTER TABLE phone_verifications DROP COLUMN IF EXISTS otp_code;

CREATE OR REPLACE FUNCTION hash_otp(otp TEXT)
RETURNS TEXT
LANGUAGE SQL
AS $$
  SELECT crypt(otp, gen_salt('bf'));
$$;

CREATE OR REPLACE FUNCTION verify_phone_otp(phone TEXT, otp TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
DECLARE
  v_row RECORD;
BEGIN
  SELECT * INTO v_row
  FROM phone_verifications
  WHERE phone_number = phone
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;

  IF v_row.expires_at < NOW() THEN
    DELETE FROM phone_verifications WHERE phone_number = phone;
    RETURN FALSE;
  END IF;

  IF v_row.attempts >= 3 THEN
    RETURN FALSE;
  END IF;

  IF v_row.otp_hash IS NULL OR crypt(otp, v_row.otp_hash) <> v_row.otp_hash THEN
    UPDATE phone_verifications
    SET attempts = attempts + 1
    WHERE phone_number = phone;
    RETURN FALSE;
  END IF;

  UPDATE phone_verifications
  SET is_verified = TRUE
  WHERE phone_number = phone;

  RETURN TRUE;
END;
$$;

CREATE OR REPLACE FUNCTION purge_expired_otps()
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
  v_deleted INTEGER;
BEGIN
  DELETE FROM phone_verifications
  WHERE expires_at < NOW();

  GET DIAGNOSTICS v_deleted = ROW_COUNT;
  RETURN v_deleted;
END;
$$;
