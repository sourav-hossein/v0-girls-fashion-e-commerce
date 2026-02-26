-- Add per-product low stock threshold
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS low_stock_threshold INT NOT NULL DEFAULT 10;
