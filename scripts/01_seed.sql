-- 01_seed.sql
-- Demo seed data for Supabase (public schema)
-- Safe to re-run: uses ON CONFLICT or NOT EXISTS checks.

SET client_min_messages = WARNING;

-- =========================
-- 1. CATEGORIES
-- =========================
INSERT INTO categories (name, slug, description, image_url)
VALUES
  ('Dresses', 'dresses', 'Party-ready and everyday dresses.', 'https://placehold.co/800x600?text=Dresses'),
  ('Tops', 'tops', 'Tops for every mood and season.', 'https://placehold.co/800x600?text=Tops'),
  ('Bottoms', 'bottoms', 'Skirts, jeans, and comfy bottoms.', 'https://placehold.co/800x600?text=Bottoms'),
  ('Outerwear', 'outerwear', 'Layering pieces for breezy days.', 'https://placehold.co/800x600?text=Outerwear'),
  ('Accessories', 'accessories', 'Finishing touches and must-haves.', 'https://placehold.co/800x600?text=Accessories')
ON CONFLICT (slug) DO UPDATE
  SET name = EXCLUDED.name,
      description = EXCLUDED.description,
      image_url = EXCLUDED.image_url;

-- =========================
-- 2. PRODUCTS
-- =========================
INSERT INTO products (
  name, slug, description, price, discount_price, category_id,
  stock_quantity, low_stock_threshold, featured, trending
)
SELECT
  'Rose Garden Party Dress',
  'rose-garden-party-dress',
  'Soft chiffon dress with floral print and twirl-ready skirt.',
  3200.00, 2800.00,
  c.id,
  40, 8, TRUE, TRUE
FROM categories c
WHERE c.slug = 'dresses'
ON CONFLICT (slug) DO UPDATE
  SET name = EXCLUDED.name,
      description = EXCLUDED.description,
      price = EXCLUDED.price,
      discount_price = EXCLUDED.discount_price,
      category_id = EXCLUDED.category_id,
      stock_quantity = EXCLUDED.stock_quantity,
      low_stock_threshold = EXCLUDED.low_stock_threshold,
      featured = EXCLUDED.featured,
      trending = EXCLUDED.trending;

INSERT INTO products (
  name, slug, description, price, discount_price, category_id,
  stock_quantity, low_stock_threshold, featured, trending
)
SELECT
  'Lavender Mist Wrap Dress',
  'lavender-mist-wrap-dress',
  'Lightweight wrap dress with adjustable waist tie.',
  2900.00, 2550.00,
  c.id,
  35, 8, FALSE, TRUE
FROM categories c
WHERE c.slug = 'dresses'
ON CONFLICT (slug) DO UPDATE
  SET name = EXCLUDED.name,
      description = EXCLUDED.description,
      price = EXCLUDED.price,
      discount_price = EXCLUDED.discount_price,
      category_id = EXCLUDED.category_id,
      stock_quantity = EXCLUDED.stock_quantity,
      low_stock_threshold = EXCLUDED.low_stock_threshold,
      featured = EXCLUDED.featured,
      trending = EXCLUDED.trending;

INSERT INTO products (
  name, slug, description, price, discount_price, category_id,
  stock_quantity, low_stock_threshold, featured, trending
)
SELECT
  'Cloudline Knit Top',
  'cloudline-knit-top',
  'Ribbed knit top with soft stretch and round neck.',
  1200.00, 990.00,
  c.id,
  60, 12, TRUE, FALSE
FROM categories c
WHERE c.slug = 'tops'
ON CONFLICT (slug) DO UPDATE
  SET name = EXCLUDED.name,
      description = EXCLUDED.description,
      price = EXCLUDED.price,
      discount_price = EXCLUDED.discount_price,
      category_id = EXCLUDED.category_id,
      stock_quantity = EXCLUDED.stock_quantity,
      low_stock_threshold = EXCLUDED.low_stock_threshold,
      featured = EXCLUDED.featured,
      trending = EXCLUDED.trending;

INSERT INTO products (
  name, slug, description, price, discount_price, category_id,
  stock_quantity, low_stock_threshold, featured, trending
)
SELECT
  'Sunny Day Graphic Tee',
  'sunny-day-graphic-tee',
  'Cotton tee with playful print and relaxed fit.',
  900.00, 750.00,
  c.id,
  80, 15, FALSE, TRUE
FROM categories c
WHERE c.slug = 'tops'
ON CONFLICT (slug) DO UPDATE
  SET name = EXCLUDED.name,
      description = EXCLUDED.description,
      price = EXCLUDED.price,
      discount_price = EXCLUDED.discount_price,
      category_id = EXCLUDED.category_id,
      stock_quantity = EXCLUDED.stock_quantity,
      low_stock_threshold = EXCLUDED.low_stock_threshold,
      featured = EXCLUDED.featured,
      trending = EXCLUDED.trending;

INSERT INTO products (
  name, slug, description, price, discount_price, category_id,
  stock_quantity, low_stock_threshold, featured, trending
)
SELECT
  'Blueberry Denim Skirt',
  'blueberry-denim-skirt',
  'High-rise A-line denim skirt with classic buttons.',
  1700.00, 1500.00,
  c.id,
  50, 10, TRUE, FALSE
FROM categories c
WHERE c.slug = 'bottoms'
ON CONFLICT (slug) DO UPDATE
  SET name = EXCLUDED.name,
      description = EXCLUDED.description,
      price = EXCLUDED.price,
      discount_price = EXCLUDED.discount_price,
      category_id = EXCLUDED.category_id,
      stock_quantity = EXCLUDED.stock_quantity,
      low_stock_threshold = EXCLUDED.low_stock_threshold,
      featured = EXCLUDED.featured,
      trending = EXCLUDED.trending;

INSERT INTO products (
  name, slug, description, price, discount_price, category_id,
  stock_quantity, low_stock_threshold, featured, trending
)
SELECT
  'Moonlight Pleated Skirt',
  'moonlight-pleated-skirt',
  'Soft pleated skirt with shimmery finish.',
  1900.00, 1650.00,
  c.id,
  45, 10, FALSE, TRUE
FROM categories c
WHERE c.slug = 'bottoms'
ON CONFLICT (slug) DO UPDATE
  SET name = EXCLUDED.name,
      description = EXCLUDED.description,
      price = EXCLUDED.price,
      discount_price = EXCLUDED.discount_price,
      category_id = EXCLUDED.category_id,
      stock_quantity = EXCLUDED.stock_quantity,
      low_stock_threshold = EXCLUDED.low_stock_threshold,
      featured = EXCLUDED.featured,
      trending = EXCLUDED.trending;

INSERT INTO products (
  name, slug, description, price, discount_price, category_id,
  stock_quantity, low_stock_threshold, featured, trending
)
SELECT
  'Skyline Denim Jacket',
  'skyline-denim-jacket',
  'Classic denim jacket with snap buttons.',
  2600.00, 2300.00,
  c.id,
  30, 8, TRUE, TRUE
FROM categories c
WHERE c.slug = 'outerwear'
ON CONFLICT (slug) DO UPDATE
  SET name = EXCLUDED.name,
      description = EXCLUDED.description,
      price = EXCLUDED.price,
      discount_price = EXCLUDED.discount_price,
      category_id = EXCLUDED.category_id,
      stock_quantity = EXCLUDED.stock_quantity,
      low_stock_threshold = EXCLUDED.low_stock_threshold,
      featured = EXCLUDED.featured,
      trending = EXCLUDED.trending;

INSERT INTO products (
  name, slug, description, price, discount_price, category_id,
  stock_quantity, low_stock_threshold, featured, trending
)
SELECT
  'Petal Pearl Hair Clip',
  'petal-pearl-hair-clip',
  'Pearl-accented hair clip for a polished look.',
  450.00, 350.00,
  c.id,
  120, 20, FALSE, FALSE
FROM categories c
WHERE c.slug = 'accessories'
ON CONFLICT (slug) DO UPDATE
  SET name = EXCLUDED.name,
      description = EXCLUDED.description,
      price = EXCLUDED.price,
      discount_price = EXCLUDED.discount_price,
      category_id = EXCLUDED.category_id,
      stock_quantity = EXCLUDED.stock_quantity,
      low_stock_threshold = EXCLUDED.low_stock_threshold,
      featured = EXCLUDED.featured,
      trending = EXCLUDED.trending;

-- =========================
-- 3. PRODUCT IMAGES
-- =========================
INSERT INTO product_images (product_id, image_url, alt_text, is_main, display_order, storage_path)
SELECT p.id,
  'https://placehold.co/600x800?text=Rose+Garden+Dress',
  'Rose Garden Party Dress front view',
  TRUE, 0, 'product-images/rose-garden-party-dress-1.jpg'
FROM products p
WHERE p.slug = 'rose-garden-party-dress'
  AND NOT EXISTS (
    SELECT 1 FROM product_images pi
    WHERE pi.product_id = p.id AND pi.image_url = 'https://placehold.co/600x800?text=Rose+Garden+Dress'
  );

INSERT INTO product_images (product_id, image_url, alt_text, is_main, display_order, storage_path)
SELECT p.id,
  'https://placehold.co/600x800?text=Rose+Garden+Dress+Back',
  'Rose Garden Party Dress back view',
  FALSE, 1, 'product-images/rose-garden-party-dress-2.jpg'
FROM products p
WHERE p.slug = 'rose-garden-party-dress'
  AND NOT EXISTS (
    SELECT 1 FROM product_images pi
    WHERE pi.product_id = p.id AND pi.image_url = 'https://placehold.co/600x800?text=Rose+Garden+Dress+Back'
  );

INSERT INTO product_images (product_id, image_url, alt_text, is_main, display_order, storage_path)
SELECT p.id,
  'https://placehold.co/600x800?text=Lavender+Wrap+Dress',
  'Lavender Mist Wrap Dress front view',
  TRUE, 0, 'product-images/lavender-mist-wrap-dress-1.jpg'
FROM products p
WHERE p.slug = 'lavender-mist-wrap-dress'
  AND NOT EXISTS (
    SELECT 1 FROM product_images pi
    WHERE pi.product_id = p.id AND pi.image_url = 'https://placehold.co/600x800?text=Lavender+Wrap+Dress'
  );

INSERT INTO product_images (product_id, image_url, alt_text, is_main, display_order, storage_path)
SELECT p.id,
  'https://placehold.co/600x800?text=Cloudline+Knit+Top',
  'Cloudline Knit Top front view',
  TRUE, 0, 'product-images/cloudline-knit-top-1.jpg'
FROM products p
WHERE p.slug = 'cloudline-knit-top'
  AND NOT EXISTS (
    SELECT 1 FROM product_images pi
    WHERE pi.product_id = p.id AND pi.image_url = 'https://placehold.co/600x800?text=Cloudline+Knit+Top'
  );

INSERT INTO product_images (product_id, image_url, alt_text, is_main, display_order, storage_path)
SELECT p.id,
  'https://placehold.co/600x800?text=Sunny+Day+Tee',
  'Sunny Day Graphic Tee front view',
  TRUE, 0, 'product-images/sunny-day-graphic-tee-1.jpg'
FROM products p
WHERE p.slug = 'sunny-day-graphic-tee'
  AND NOT EXISTS (
    SELECT 1 FROM product_images pi
    WHERE pi.product_id = p.id AND pi.image_url = 'https://placehold.co/600x800?text=Sunny+Day+Tee'
  );

INSERT INTO product_images (product_id, image_url, alt_text, is_main, display_order, storage_path)
SELECT p.id,
  'https://placehold.co/600x800?text=Blueberry+Denim+Skirt',
  'Blueberry Denim Skirt front view',
  TRUE, 0, 'product-images/blueberry-denim-skirt-1.jpg'
FROM products p
WHERE p.slug = 'blueberry-denim-skirt'
  AND NOT EXISTS (
    SELECT 1 FROM product_images pi
    WHERE pi.product_id = p.id AND pi.image_url = 'https://placehold.co/600x800?text=Blueberry+Denim+Skirt'
  );

INSERT INTO product_images (product_id, image_url, alt_text, is_main, display_order, storage_path)
SELECT p.id,
  'https://placehold.co/600x800?text=Moonlight+Pleated+Skirt',
  'Moonlight Pleated Skirt front view',
  TRUE, 0, 'product-images/moonlight-pleated-skirt-1.jpg'
FROM products p
WHERE p.slug = 'moonlight-pleated-skirt'
  AND NOT EXISTS (
    SELECT 1 FROM product_images pi
    WHERE pi.product_id = p.id AND pi.image_url = 'https://placehold.co/600x800?text=Moonlight+Pleated+Skirt'
  );

INSERT INTO product_images (product_id, image_url, alt_text, is_main, display_order, storage_path)
SELECT p.id,
  'https://placehold.co/600x800?text=Skyline+Denim+Jacket',
  'Skyline Denim Jacket front view',
  TRUE, 0, 'product-images/skyline-denim-jacket-1.jpg'
FROM products p
WHERE p.slug = 'skyline-denim-jacket'
  AND NOT EXISTS (
    SELECT 1 FROM product_images pi
    WHERE pi.product_id = p.id AND pi.image_url = 'https://placehold.co/600x800?text=Skyline+Denim+Jacket'
  );

INSERT INTO product_images (product_id, image_url, alt_text, is_main, display_order, storage_path)
SELECT p.id,
  'https://placehold.co/600x800?text=Petal+Pearl+Clip',
  'Petal Pearl Hair Clip front view',
  TRUE, 0, 'product-images/petal-pearl-hair-clip-1.jpg'
FROM products p
WHERE p.slug = 'petal-pearl-hair-clip'
  AND NOT EXISTS (
    SELECT 1 FROM product_images pi
    WHERE pi.product_id = p.id AND pi.image_url = 'https://placehold.co/600x800?text=Petal+Pearl+Clip'
  );

-- =========================
-- 4. PRODUCT VARIANTS
-- =========================
INSERT INTO product_variants (product_id, variant_type, variant_value, stock_quantity)
SELECT p.id, 'size', 'XS', 6
FROM products p
WHERE p.slug = 'rose-garden-party-dress'
  AND NOT EXISTS (
    SELECT 1 FROM product_variants pv
    WHERE pv.product_id = p.id AND pv.variant_type = 'size' AND pv.variant_value = 'XS'
  );

INSERT INTO product_variants (product_id, variant_type, variant_value, stock_quantity)
SELECT p.id, 'size', 'S', 10
FROM products p
WHERE p.slug = 'rose-garden-party-dress'
  AND NOT EXISTS (
    SELECT 1 FROM product_variants pv
    WHERE pv.product_id = p.id AND pv.variant_type = 'size' AND pv.variant_value = 'S'
  );

INSERT INTO product_variants (product_id, variant_type, variant_value, stock_quantity)
SELECT p.id, 'size', 'M', 12
FROM products p
WHERE p.slug = 'rose-garden-party-dress'
  AND NOT EXISTS (
    SELECT 1 FROM product_variants pv
    WHERE pv.product_id = p.id AND pv.variant_type = 'size' AND pv.variant_value = 'M'
  );

INSERT INTO product_variants (product_id, variant_type, variant_value, stock_quantity)
SELECT p.id, 'size', 'L', 8
FROM products p
WHERE p.slug = 'rose-garden-party-dress'
  AND NOT EXISTS (
    SELECT 1 FROM product_variants pv
    WHERE pv.product_id = p.id AND pv.variant_type = 'size' AND pv.variant_value = 'L'
  );

INSERT INTO product_variants (product_id, variant_type, variant_value, stock_quantity)
SELECT p.id, 'color', 'Lavender', 12
FROM products p
WHERE p.slug = 'lavender-mist-wrap-dress'
  AND NOT EXISTS (
    SELECT 1 FROM product_variants pv
    WHERE pv.product_id = p.id AND pv.variant_type = 'color' AND pv.variant_value = 'Lavender'
  );

INSERT INTO product_variants (product_id, variant_type, variant_value, stock_quantity)
SELECT p.id, 'color', 'Mist Blue', 9
FROM products p
WHERE p.slug = 'lavender-mist-wrap-dress'
  AND NOT EXISTS (
    SELECT 1 FROM product_variants pv
    WHERE pv.product_id = p.id AND pv.variant_type = 'color' AND pv.variant_value = 'Mist Blue'
  );

INSERT INTO product_variants (product_id, variant_type, variant_value, stock_quantity)
SELECT p.id, 'size', 'S', 15
FROM products p
WHERE p.slug = 'cloudline-knit-top'
  AND NOT EXISTS (
    SELECT 1 FROM product_variants pv
    WHERE pv.product_id = p.id AND pv.variant_type = 'size' AND pv.variant_value = 'S'
  );

INSERT INTO product_variants (product_id, variant_type, variant_value, stock_quantity)
SELECT p.id, 'size', 'M', 18
FROM products p
WHERE p.slug = 'cloudline-knit-top'
  AND NOT EXISTS (
    SELECT 1 FROM product_variants pv
    WHERE pv.product_id = p.id AND pv.variant_type = 'size' AND pv.variant_value = 'M'
  );

INSERT INTO product_variants (product_id, variant_type, variant_value, stock_quantity)
SELECT p.id, 'size', 'L', 12
FROM products p
WHERE p.slug = 'cloudline-knit-top'
  AND NOT EXISTS (
    SELECT 1 FROM product_variants pv
    WHERE pv.product_id = p.id AND pv.variant_type = 'size' AND pv.variant_value = 'L'
  );

INSERT INTO product_variants (product_id, variant_type, variant_value, stock_quantity)
SELECT p.id, 'size', 'S', 14
FROM products p
WHERE p.slug = 'skyline-denim-jacket'
  AND NOT EXISTS (
    SELECT 1 FROM product_variants pv
    WHERE pv.product_id = p.id AND pv.variant_type = 'size' AND pv.variant_value = 'S'
  );

INSERT INTO product_variants (product_id, variant_type, variant_value, stock_quantity)
SELECT p.id, 'size', 'M', 10
FROM products p
WHERE p.slug = 'skyline-denim-jacket'
  AND NOT EXISTS (
    SELECT 1 FROM product_variants pv
    WHERE pv.product_id = p.id AND pv.variant_type = 'size' AND pv.variant_value = 'M'
  );

INSERT INTO product_variants (product_id, variant_type, variant_value, stock_quantity)
SELECT p.id, 'size', 'L', 6
FROM products p
WHERE p.slug = 'skyline-denim-jacket'
  AND NOT EXISTS (
    SELECT 1 FROM product_variants pv
    WHERE pv.product_id = p.id AND pv.variant_type = 'size' AND pv.variant_value = 'L'
  );

-- =========================
-- 5. COUPONS
-- =========================
INSERT INTO coupons (
  code, discount_percent, max_discount_amount, min_purchase_amount,
  valid_from, valid_to, usage_limit, used_count, active
)
VALUES
  ('WELCOME10', 10.00, 300.00, 1200.00, CURRENT_DATE, CURRENT_DATE + INTERVAL '90 days', 500, 0, TRUE),
  ('FREESHIP', 5.00, 150.00, 900.00, CURRENT_DATE, CURRENT_DATE + INTERVAL '30 days', 1000, 0, TRUE)
ON CONFLICT (code) DO UPDATE
  SET discount_percent = EXCLUDED.discount_percent,
      max_discount_amount = EXCLUDED.max_discount_amount,
      min_purchase_amount = EXCLUDED.min_purchase_amount,
      valid_from = EXCLUDED.valid_from,
      valid_to = EXCLUDED.valid_to,
      usage_limit = EXCLUDED.usage_limit,
      active = EXCLUDED.active;

-- End of seed
