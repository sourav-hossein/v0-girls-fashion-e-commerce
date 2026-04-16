-- Unified image management for products, categories, and hero banners

ALTER TABLE product_images
  ADD COLUMN IF NOT EXISTS storage_path TEXT,
  ADD COLUMN IF NOT EXISTS width INT,
  ADD COLUMN IF NOT EXISTS height INT,
  ADD COLUMN IF NOT EXISTS mime_type TEXT,
  ADD COLUMN IF NOT EXISTS file_size BIGINT;

ALTER TABLE categories
  ADD COLUMN IF NOT EXISTS image_path TEXT,
  ADD COLUMN IF NOT EXISTS image_alt TEXT;

CREATE TABLE IF NOT EXISTS hero_banners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  subtitle TEXT,
  desktop_image_url TEXT,
  desktop_image_path TEXT,
  desktop_image_alt TEXT,
  mobile_image_url TEXT,
  mobile_image_path TEXT,
  mobile_image_alt TEXT,
  cta_text TEXT,
  cta_url TEXT,
  display_order INT NOT NULL DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE hero_banners ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'hero_banners'
      AND policyname = 'Everyone can see hero banners'
  ) THEN
    CREATE POLICY "Everyone can see hero banners" ON hero_banners
      FOR SELECT USING (true);
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_namespace n
    JOIN pg_class c ON c.relnamespace = n.oid
    WHERE n.nspname = 'storage' AND c.relname = 'buckets'
  ) THEN
    INSERT INTO storage.buckets (id, name, public)
    VALUES
      ('product-images', 'product-images', true),
      ('category-images', 'category-images', true),
      ('hero-banners', 'hero-banners', true)
    ON CONFLICT (id) DO NOTHING;
  END IF;
END $$;
