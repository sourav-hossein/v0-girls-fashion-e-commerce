-- Add admin support flags for profiles
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS is_blocked BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS blocked_reason TEXT;
