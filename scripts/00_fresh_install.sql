-- merged_schema.sql
-- Single-file production schema (final state)
-- Assumes an auth.users table (Supabase) exists.
-- Creates tables, RLS, functions, indexes, and seed data.

-- Safety / environment
SET client_min_messages = WARNING;

-- Extensions
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- =========================
-- 1. PROFILES (formerly users)
-- =========================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  profile_photo_url TEXT,
  phone_number VARCHAR(20),
  phone_verified BOOLEAN DEFAULT FALSE,
  last_login TIMESTAMP,
  role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('customer','admin')),
  is_blocked BOOLEAN NOT NULL DEFAULT FALSE,
  blocked_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
DROP POLICY IF EXISTS "Profiles can see their own profile" ON profiles;
CREATE POLICY "Profiles can see their own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Profiles can update their own profile" ON profiles;
CREATE POLICY "Profiles can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id
    AND role = (SELECT role FROM profiles WHERE id = auth.uid())
  );

DROP POLICY IF EXISTS "Profiles can insert their own profile" ON profiles;
CREATE POLICY "Profiles can insert their own profile" ON profiles
  FOR INSERT WITH CHECK (
    auth.uid() = id
    AND role = 'customer'
  );

-- =========================
-- 2. CATEGORIES
-- =========================
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL UNIQUE,
  slug VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  image_url VARCHAR(500),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Everyone can see categories" ON categories
  FOR SELECT USING (true);

-- =========================
-- 3. PRODUCTS
-- =========================
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  discount_price DECIMAL(10,2),
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  stock_quantity INT NOT NULL DEFAULT 0,
  low_stock_threshold INT NOT NULL DEFAULT 10,
  featured BOOLEAN DEFAULT FALSE,
  trending BOOLEAN DEFAULT FALSE,
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Everyone can see products" ON products
  FOR SELECT USING (deleted_at IS NULL);

-- =========================
-- 4. PRODUCT_IMAGES
-- =========================
CREATE TABLE IF NOT EXISTS product_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  image_url VARCHAR(500) NOT NULL,
  alt_text VARCHAR(255),
  is_main BOOLEAN DEFAULT FALSE,
  display_order INT DEFAULT 0,
  storage_path TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Everyone can see product images" ON product_images
  FOR SELECT USING (true);

CREATE UNIQUE INDEX IF NOT EXISTS idx_product_images_one_main
  ON product_images(product_id)
  WHERE is_main = true;

-- =========================
-- 5. PRODUCT_VARIANTS
-- =========================
CREATE TABLE IF NOT EXISTS product_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  variant_type VARCHAR(50) NOT NULL,
  variant_value VARCHAR(100) NOT NULL,
  stock_quantity INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Everyone can see product variants" ON product_variants
  FOR SELECT USING (true);

-- =========================
-- 6. CART
-- =========================
CREATE TABLE IF NOT EXISTS cart (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  variant_id UUID REFERENCES product_variants(id) ON DELETE SET NULL,
  quantity INT NOT NULL DEFAULT 1,
  added_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, product_id, variant_id)
);

ALTER TABLE cart ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Users can see their own cart" ON cart
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can manage their own cart" ON cart
  FOR ALL USING (auth.uid() = user_id);

-- =========================
-- 7. USER_ADDRESSES
-- =========================
CREATE TABLE IF NOT EXISTS user_addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  full_name VARCHAR(255) NOT NULL,
  phone_number VARCHAR(20) NOT NULL,
  division_id TEXT NOT NULL,
  district_id TEXT NOT NULL,
  thana_id TEXT NOT NULL,
  area VARCHAR(255),
  full_address TEXT NOT NULL,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE user_addresses ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Users can see their own addresses" ON user_addresses
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can manage their own addresses" ON user_addresses
  FOR ALL USING (auth.uid() = user_id);

-- =========================
-- 8. WISHLISTS
-- =========================
CREATE TABLE IF NOT EXISTS wishlists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  added_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

ALTER TABLE wishlists ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Users can see their own wishlist" ON wishlists
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can manage their own wishlist" ON wishlists
  FOR ALL USING (auth.uid() = user_id);

-- =========================
-- 9. ORDERS
-- =========================
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number VARCHAR(50) UNIQUE NOT NULL,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  subtotal DECIMAL(10,2) NOT NULL,
  delivery_charge DECIMAL(10,2) DEFAULT 0,
  discount_amount DECIMAL(10,2) DEFAULT 0,
  total_amount DECIMAL(10,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','confirmed','processing','shipped','delivered','cancelled','failed')),
  payment_method TEXT NOT NULL,
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending','completed','failed')),
  notes TEXT,
  courier TEXT,
  tracking_number TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Users can see their own orders" ON orders
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can create their own orders" ON orders
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- =========================
-- 10. ORDER_ITEMS
-- =========================
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  variant_id UUID REFERENCES product_variants(id) ON DELETE SET NULL,
  quantity INT NOT NULL,
  price_at_purchase DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Users can see items from their orders" ON order_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_id AND orders.user_id = auth.uid()
    )
  );

CREATE POLICY IF NOT EXISTS "Users can create items for their orders" ON order_items
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_id AND orders.user_id = auth.uid()
    )
  );

-- =========================
-- 11. ORDER_ADDRESSES
-- =========================
CREATE TABLE IF NOT EXISTS order_addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  division VARCHAR(100) NOT NULL,
  district VARCHAR(100) NOT NULL,
  thana VARCHAR(100) NOT NULL,
  full_address TEXT NOT NULL,
  phone_number VARCHAR(20) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE order_addresses ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Users can see addresses from their orders" ON order_addresses
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_id AND orders.user_id = auth.uid()
    )
  );

CREATE POLICY IF NOT EXISTS "Users can create addresses for their orders" ON order_addresses
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_id AND orders.user_id = auth.uid()
    )
  );

-- =========================
-- 12. REVIEWS
-- =========================
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(product_id, user_id)
);

ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Everyone can see reviews" ON reviews
  FOR SELECT USING (true);

CREATE POLICY IF NOT EXISTS "Users can create reviews" ON reviews
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can update their own reviews" ON reviews
  FOR UPDATE USING (auth.uid() = user_id);

-- =========================
-- 13. COUPONS
-- =========================
CREATE TABLE IF NOT EXISTS coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) NOT NULL UNIQUE,
  discount_percent DECIMAL(5,2) NOT NULL,
  max_discount_amount DECIMAL(10,2),
  min_purchase_amount DECIMAL(10,2),
  valid_from DATE NOT NULL,
  valid_to DATE NOT NULL,
  usage_limit INT,
  used_count INT DEFAULT 0,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Everyone can see active coupons" ON coupons
  FOR SELECT USING (active = true);

-- Coupon usage function
CREATE OR REPLACE FUNCTION increment_coupon_usage(coupon_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE coupons
  SET used_count = used_count + 1
  WHERE id = coupon_id
    AND (usage_limit IS NULL OR used_count < usage_limit);

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Coupon usage limit reached';
  END IF;
END;
$$;

-- =========================
-- 14. PAYMENT_LOGS
-- =========================
CREATE TABLE IF NOT EXISTS payment_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  transaction_id VARCHAR(255),
  gateway_response JSONB,
  status VARCHAR(50) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE payment_logs
  ADD CONSTRAINT payment_logs_status_check
  CHECK (status IN ('pending','initiated','completed','failed','cancelled'));

ALTER TABLE payment_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Users can see payment logs for their orders" ON payment_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_id AND orders.user_id = auth.uid()
    )
  );

CREATE POLICY IF NOT EXISTS "Users can create payment logs for their orders" ON payment_logs
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_id AND orders.user_id = auth.uid()
    )
  );

-- =========================
-- 15. ORDER_STATUS_LOGS
-- =========================
CREATE TABLE IF NOT EXISTS order_status_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  previous_status TEXT,
  new_status TEXT NOT NULL,
  changed_by_role TEXT NOT NULL CHECK (changed_by_role IN ('user','admin','system')),
  changed_by_id UUID,
  note TEXT,
  changed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE order_status_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can see status logs for their orders" ON order_status_logs;
CREATE POLICY "Users can see status logs for their orders" ON order_status_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_id AND orders.user_id = auth.uid()
    )
  );

-- =========================
-- 16. PHONE_VERIFICATIONS (OTP)
-- =========================
CREATE TABLE IF NOT EXISTS phone_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone_number VARCHAR(20) NOT NULL UNIQUE,
  otp_hash TEXT,
  is_verified BOOLEAN DEFAULT FALSE,
  attempts INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '10 minutes')
);

ALTER TABLE phone_verifications ENABLE ROW LEVEL SECURITY;

-- OTP helper functions
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

-- =========================
-- 17. SOFT DELETE INDEX (products)
-- =========================
CREATE INDEX IF NOT EXISTS idx_products_deleted_at ON products(deleted_at);

-- =========================
-- 18. ANALYTICS_EVENTS
-- =========================
CREATE TABLE IF NOT EXISTS analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL,
  user_id UUID NULL REFERENCES profiles(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL,
  path TEXT,
  product_id UUID NULL REFERENCES products(id) ON DELETE SET NULL,
  order_id UUID NULL REFERENCES orders(id) ON DELETE SET NULL,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view analytics events" ON analytics_events;
CREATE POLICY "Admins can view analytics events" ON analytics_events
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

CREATE INDEX IF NOT EXISTS idx_analytics_events_created_at ON analytics_events(created_at);
CREATE INDEX IF NOT EXISTS idx_analytics_events_type_created ON analytics_events(event_type, created_at);
CREATE INDEX IF NOT EXISTS idx_analytics_events_product_created ON analytics_events(product_id, created_at);
CREATE INDEX IF NOT EXISTS idx_analytics_events_session_created ON analytics_events(session_id, created_at);

-- =========================
-- 19. STORE_SETTINGS (admin)
-- =========================
CREATE TABLE IF NOT EXISTS store_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_name TEXT NOT NULL,
  support_email TEXT,
  support_phone TEXT,
  currency_code TEXT DEFAULT 'BDT',
  timezone TEXT DEFAULT 'Asia/Dhaka',
  address_line1 TEXT,
  address_line2 TEXT,
  city TEXT,
  state TEXT,
  postal_code TEXT,
  country TEXT,
  flat_shipping_rate NUMERIC(10,2) DEFAULT 0,
  free_shipping_threshold NUMERIC(10,2),
  cod_enabled BOOLEAN DEFAULT TRUE,
  sslcommerz_enabled BOOLEAN DEFAULT TRUE,
  order_notification_emails TEXT[] DEFAULT '{}'::TEXT[],
  low_stock_default_threshold INT DEFAULT 10,
  theme TEXT NOT NULL DEFAULT 'rose' CHECK (theme IN ('rose','lavender','ocean')),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE store_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view store settings" ON store_settings;
CREATE POLICY "Admins can view store settings" ON store_settings
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Admins can update store settings" ON store_settings;
CREATE POLICY "Admins can update store settings" ON store_settings
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- Seed single row if empty
INSERT INTO store_settings (store_name)
SELECT 'Hijab & Fashion Hub'
WHERE NOT EXISTS (SELECT 1 FROM store_settings);

-- =========================
-- 20. STORAGE BUCKET (product-images) seed (if storage schema exists)
-- =========================
-- This will work in Supabase where storage.buckets exists. If not, it'll error; wrap in DO to avoid hard failures.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_catalog.pg_namespace n
    JOIN pg_catalog.pg_class c ON c.relnamespace = n.oid
    WHERE n.nspname = 'storage' AND c.relname = 'buckets'
  ) THEN
    INSERT INTO storage.buckets (id, name, public)
    VALUES ('product-images', 'product-images', true)
    ON CONFLICT (id) DO NOTHING;
  END IF;
END;
$$;

-- =========================
-- 21. INDEXES (common)
-- =========================
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(featured) WHERE featured = TRUE;
CREATE INDEX IF NOT EXISTS idx_products_trending ON products(trending) WHERE trending = TRUE;
CREATE INDEX IF NOT EXISTS idx_cart_user ON cart(user_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_cart_user_product_null_variant
  ON cart(user_id, product_id)
  WHERE variant_id IS NULL;
CREATE INDEX IF NOT EXISTS idx_user_addresses_user ON user_addresses(user_id);
CREATE INDEX IF NOT EXISTS idx_wishlists_user ON wishlists(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_reviews_product ON reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user ON reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_logs_order ON payment_logs(order_id);

-- =========================
-- 22. finalize_paid_order function (atomic payment + stock deduction + logs)
-- =========================
CREATE OR REPLACE FUNCTION finalize_paid_order(
  p_order_id UUID,
  p_transaction_id TEXT,
  p_gateway_response JSONB
) RETURNS VOID
LANGUAGE plpgsql
AS $$
DECLARE
  v_order RECORD;
  v_item RECORD;
  v_prev_status TEXT;
BEGIN
  -- Lock order row
  SELECT * INTO v_order
  FROM orders
  WHERE id = p_order_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Order not found';
  END IF;

  IF v_order.payment_status <> 'pending' THEN
    RAISE EXCEPTION 'Order already processed';
  END IF;

  v_prev_status := v_order.status;

  -- Lock all order items and deduct stock
  FOR v_item IN
    SELECT * FROM order_items WHERE order_id = p_order_id FOR UPDATE
  LOOP
    IF v_item.variant_id IS NOT NULL THEN
      UPDATE product_variants
      SET stock_quantity = stock_quantity - v_item.quantity,
          updated_at = NOW()
      WHERE id = v_item.variant_id
        AND stock_quantity >= v_item.quantity;

      IF NOT FOUND THEN
        RAISE EXCEPTION 'Insufficient variant stock for variant %', v_item.variant_id;
      END IF;
    END IF;

    IF v_item.product_id IS NOT NULL THEN
      UPDATE products
      SET stock_quantity = stock_quantity - v_item.quantity,
          updated_at = NOW()
      WHERE id = v_item.product_id
        AND stock_quantity >= v_item.quantity;

      IF NOT FOUND THEN
        RAISE EXCEPTION 'Insufficient product stock for product %', v_item.product_id;
      END IF;
    ELSE
      RAISE EXCEPTION 'Order item % missing product', v_item.id;
    END IF;
  END LOOP;

  -- Update order
  UPDATE orders
  SET payment_status = 'completed',
      status = 'confirmed',
      updated_at = NOW()
  WHERE id = p_order_id;

  -- Update or insert payment log
  UPDATE payment_logs
  SET status = 'completed',
      transaction_id = p_transaction_id,
      gateway_response = p_gateway_response,
      updated_at = NOW()
  WHERE order_id = p_order_id;

  IF NOT FOUND THEN
    INSERT INTO payment_logs (order_id, transaction_id, gateway_response, status)
    VALUES (p_order_id, p_transaction_id, p_gateway_response, 'completed');
  END IF;

  -- Insert status log
  INSERT INTO order_status_logs (
    order_id,
    previous_status,
    new_status,
    changed_by_role,
    changed_by_id,
    note,
    changed_at
  ) VALUES (
    p_order_id,
    v_prev_status,
    'confirmed',
    'system',
    NULL,
    'Payment completed',
    NOW()
  );
END;
$$;

-- Grant execute (optional depending on your security model)
-- GRANT EXECUTE ON FUNCTION finalize_paid_order(UUID, TEXT, JSONB) TO postgres;

-- =========================
-- 23. CLEANUP / NOTES
-- =========================
-- All tables have RLS enabled where appropriate and policies created.
-- This file creates the final schema state; if you are migrating an existing DB,
-- run with care (backups recommended).

-- End of merged_schema.sql
