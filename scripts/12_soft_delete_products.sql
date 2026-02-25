-- Phase 5: Soft delete products

ALTER TABLE products ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
CREATE INDEX IF NOT EXISTS idx_products_deleted_at ON products(deleted_at);

-- Update products select policy to exclude deleted items
DROP POLICY IF EXISTS "Everyone can see products" ON products;
CREATE POLICY "Everyone can see products" ON products
  FOR SELECT USING (deleted_at IS NULL);
