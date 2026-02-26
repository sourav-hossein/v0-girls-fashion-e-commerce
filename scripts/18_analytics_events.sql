-- Analytics event tracking

CREATE TABLE IF NOT EXISTS analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL,
  user_id UUID NULL REFERENCES profiles(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL,
  path TEXT,
  product_id UUID NULL REFERENCES products(id) ON DELETE SET NULL,
  order_id UUID NULL REFERENCES orders(id) ON DELETE SET NULL,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_analytics_events_created_at
  ON analytics_events(created_at);
CREATE INDEX IF NOT EXISTS idx_analytics_events_type_created
  ON analytics_events(event_type, created_at);
CREATE INDEX IF NOT EXISTS idx_analytics_events_product_created
  ON analytics_events(product_id, created_at);
CREATE INDEX IF NOT EXISTS idx_analytics_events_session_created
  ON analytics_events(session_id, created_at);

ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view analytics events" ON analytics_events;
CREATE POLICY "Admins can view analytics events" ON analytics_events
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );
