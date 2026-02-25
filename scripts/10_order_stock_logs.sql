-- Phase 3: Order status logs and atomic stock deduction

CREATE TABLE IF NOT EXISTS order_status_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  previous_status TEXT,
  new_status TEXT NOT NULL,
  changed_by_role TEXT NOT NULL CHECK (changed_by_role IN ('user', 'admin', 'system')),
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

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'orders_status_check'
  ) THEN
    ALTER TABLE orders
      ADD CONSTRAINT orders_status_check
      CHECK (status IN ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'failed'))
      NOT VALID;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'orders_payment_status_check'
  ) THEN
    ALTER TABLE orders
      ADD CONSTRAINT orders_payment_status_check
      CHECK (payment_status IN ('pending', 'completed', 'failed'))
      NOT VALID;
  END IF;
END $$;

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

  FOR v_item IN
    SELECT * FROM order_items WHERE order_id = p_order_id FOR UPDATE
  LOOP
    IF v_item.variant_id IS NOT NULL THEN
      UPDATE product_variants
      SET stock_quantity = stock_quantity - v_item.quantity
      WHERE id = v_item.variant_id
        AND stock_quantity >= v_item.quantity;

      IF NOT FOUND THEN
        RAISE EXCEPTION 'Insufficient variant stock';
      END IF;
    END IF;

    IF v_item.product_id IS NOT NULL THEN
      UPDATE products
      SET stock_quantity = stock_quantity - v_item.quantity
      WHERE id = v_item.product_id
        AND stock_quantity >= v_item.quantity;

      IF NOT FOUND THEN
        RAISE EXCEPTION 'Insufficient product stock';
      END IF;
    ELSE
      RAISE EXCEPTION 'Order item missing product';
    END IF;
  END LOOP;

  UPDATE orders
  SET payment_status = 'completed',
      status = 'confirmed',
      updated_at = NOW()
  WHERE id = p_order_id;

  UPDATE payment_logs
  SET status = 'completed',
      transaction_id = p_transaction_id,
      gateway_response = p_gateway_response,
      updated_at = NOW()
  WHERE order_id = p_order_id;

  IF NOT FOUND THEN
    INSERT INTO payment_logs (
      order_id,
      transaction_id,
      gateway_response,
      status
    ) VALUES (
      p_order_id,
      p_transaction_id,
      p_gateway_response,
      'completed'
    );
  END IF;

  INSERT INTO order_status_logs (
    order_id,
    previous_status,
    new_status,
    changed_by_role,
    changed_by_id,
    note
  ) VALUES (
    p_order_id,
    v_prev_status,
    'confirmed',
    'system',
    NULL,
    'Payment completed'
  );
END;
$$;
