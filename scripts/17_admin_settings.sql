-- Admin store settings

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
  flat_shipping_rate NUMERIC(10, 2) DEFAULT 0,
  free_shipping_threshold NUMERIC(10, 2),
  cod_enabled BOOLEAN DEFAULT TRUE,
  sslcommerz_enabled BOOLEAN DEFAULT TRUE,
  order_notification_emails TEXT[] DEFAULT '{}'::TEXT[],
  low_stock_default_threshold INT DEFAULT 10,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Seed single row if empty
INSERT INTO store_settings (store_name)
SELECT 'Hijab & Fashion Hub'
WHERE NOT EXISTS (SELECT 1 FROM store_settings);

ALTER TABLE store_settings ENABLE ROW LEVEL SECURITY;

-- Admin-only policies
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
