-- RLS Policies for users table
CREATE POLICY "Users can see their own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

-- RLS Policies for categories table
CREATE POLICY "Everyone can see categories" ON categories
  FOR SELECT USING (true);

-- RLS Policies for products table
CREATE POLICY "Everyone can see products" ON products
  FOR SELECT USING (true);

-- RLS Policies for product_images table
CREATE POLICY "Everyone can see product images" ON product_images
  FOR SELECT USING (true);

-- RLS Policies for product_variants table
CREATE POLICY "Everyone can see product variants" ON product_variants
  FOR SELECT USING (true);

-- RLS Policies for cart table
CREATE POLICY "Users can see their own cart" ON cart
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own cart" ON cart
  FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for wishlists table
CREATE POLICY "Users can see their own wishlist" ON wishlists
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own wishlist" ON wishlists
  FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for orders table
CREATE POLICY "Users can see their own orders" ON orders
  FOR SELECT USING (auth.uid() = user_id);

-- RLS Policies for order_items table
CREATE POLICY "Users can see items from their orders" ON order_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_id AND orders.user_id = auth.uid()
    )
  );

-- RLS Policies for order_addresses table
CREATE POLICY "Users can see addresses from their orders" ON order_addresses
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_id AND orders.user_id = auth.uid()
    )
  );

-- RLS Policies for reviews table
CREATE POLICY "Everyone can see reviews" ON reviews
  FOR SELECT USING (true);

CREATE POLICY "Users can create reviews" ON reviews
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reviews" ON reviews
  FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for coupons table
CREATE POLICY "Everyone can see active coupons" ON coupons
  FOR SELECT USING (active = true);

-- RLS Policies for payment_logs table
CREATE POLICY "Users can see payment logs for their orders" ON payment_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_id AND orders.user_id = auth.uid()
    )
  );
