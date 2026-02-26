-- Add courier tracking columns to orders
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS courier TEXT,
  ADD COLUMN IF NOT EXISTS tracking_number TEXT;
