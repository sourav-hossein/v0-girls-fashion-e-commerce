-- Phase 1: Identity refactor (users -> profiles)
ALTER TABLE users RENAME TO profiles;

-- Remove email from profiles; use auth.users for email
ALTER TABLE profiles DROP COLUMN IF EXISTS email;

-- Ensure profiles.id references auth.users(id) with ON DELETE CASCADE
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS users_id_fkey;
ALTER TABLE profiles
  ADD CONSTRAINT profiles_id_fkey
  FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Add missing profile fields
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS phone_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_login TIMESTAMP;

-- Drop obsolete index
DROP INDEX IF EXISTS idx_users_email;
