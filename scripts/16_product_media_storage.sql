-- Product media storage setup

-- Create public storage bucket for product images
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

-- Track storage path for cleanup
ALTER TABLE product_images
  ADD COLUMN IF NOT EXISTS storage_path TEXT;

-- Ensure one main image per product
CREATE UNIQUE INDEX IF NOT EXISTS idx_product_images_one_main
  ON product_images(product_id)
  WHERE is_main = true;

-- Ensure display_order has a default
ALTER TABLE product_images
  ALTER COLUMN display_order SET DEFAULT 0;
