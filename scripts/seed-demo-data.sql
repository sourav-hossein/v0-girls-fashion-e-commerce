-- Seed demo categories
INSERT INTO categories (name, slug, description, image_url) VALUES
('Earrings', 'earrings', 'Beautiful and elegant earrings for every occasion', 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=500&h=500&fit=crop'),
('Hijabs', 'hijabs', 'Premium quality hijabs in various styles and colors', 'https://images.unsplash.com/photo-1505252585461-04db1c2a2e5d?w=500&h=500&fit=crop'),
('Handbags', 'handbags', 'Stylish and practical handbags for daily use', 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=500&h=500&fit=crop'),
('Hair Accessories', 'hair-accessories', 'Trendy hair clips, pins, and accessories', 'https://images.unsplash.com/photo-1599643478169-fc1c0df1820f?w=500&h=500&fit=crop'),
('Rings', 'rings', 'Elegant rings for every style and occasion', 'https://images.unsplash.com/photo-1599643478511-b0d5eb73b4d5?w=500&h=500&fit=crop'),
('Bracelets', 'bracelets', 'Beautiful bracelets to complete your look', 'https://images.unsplash.com/photo-1599643478173-0e4ecb84fc80?w=500&h=500&fit=crop'),
('Combo Offers', 'combo-offers', 'Special bundle deals for great value', 'https://images.unsplash.com/photo-1599643478500-0df5b4d1e5d9?w=500&h=500&fit=crop');

-- Seed demo products
INSERT INTO products (name, slug, description, price, discount_price, category_id, stock_quantity, featured, trending) VALUES
('Golden Crescent Earrings', 'golden-crescent-earrings', 'Elegant golden crescent-shaped earrings with pearl accents', 599.00, 449.00, (SELECT id FROM categories WHERE slug = 'earrings'), 45, true, true),
('Rose Gold Pearl Studs', 'rose-gold-pearl-studs', 'Classic pearl stud earrings in rose gold finish', 699.00, 549.00, (SELECT id FROM categories WHERE slug = 'earrings'), 38, true, false),
('Premium Cotton Hijab - Navy', 'premium-cotton-hijab-navy', 'Breathable premium cotton hijab in navy blue', 399.00, 299.00, (SELECT id FROM categories WHERE slug = 'hijabs'), 120, false, true),
('Floral Silk Hijab - Rose', 'floral-silk-hijab-rose', 'Luxurious floral silk hijab in rose print', 899.00, 699.00, (SELECT id FROM categories WHERE slug = 'hijabs'), 55, true, true),
('Leather Crossbody Bag', 'leather-crossbody-bag', 'Premium leather crossbody bag with adjustable strap', 1999.00, 1499.00, (SELECT id FROM categories WHERE slug = 'handbags'), 28, true, false),
('Pearl Hair Clip Set', 'pearl-hair-clip-set', 'Set of 3 decorative pearl hair clips', 349.00, 249.00, (SELECT id FROM categories WHERE slug = 'hair-accessories'), 65, false, true),
('Diamond-Cut Ring - Silver', 'diamond-cut-ring-silver', 'Stunning diamond-cut design in sterling silver', 1299.00, 999.00, (SELECT id FROM categories WHERE slug = 'rings'), 32, true, true),
('Beaded Bracelet Stack', 'beaded-bracelet-stack', 'Set of 5 colorful beaded bracelets', 449.00, 349.00, (SELECT id FROM categories WHERE slug = 'bracelets'), 80, false, true),
('Fashion Essentials Bundle', 'fashion-essentials-bundle', 'Combo: Hijab + Earrings + Hair Clip', 1299.00, 899.00, (SELECT id FROM categories WHERE slug = 'combo-offers'), 25, true, true),
('Gold & Pearl Collection', 'gold-pearl-collection', 'Premium collection with earrings, ring, and bracelet', 2499.00, 1799.00, (SELECT id FROM categories WHERE slug = 'combo-offers'), 15, true, true),
('Elegant Bracelet Set', 'elegant-bracelet-set', 'Set of 2 premium gold-plated bracelets', 799.00, 599.00, (SELECT id FROM categories WHERE slug = 'bracelets'), 42, false, false),
('Classic Hijab Combo', 'classic-hijab-combo', 'Bundle of 2 premium hijabs in trending colors', 1299.00, 999.00, (SELECT id FROM categories WHERE slug = 'hijabs'), 35, false, true);

-- Seed product variants
INSERT INTO product_variants (product_id, variant_type, variant_value, stock_quantity)
SELECT id, 'Color', 'Gold', 25 FROM products WHERE slug = 'golden-crescent-earrings' UNION ALL
SELECT id, 'Color', 'Silver', 20 FROM products WHERE slug = 'golden-crescent-earrings' UNION ALL
SELECT id, 'Color', 'Navy', 60 FROM products WHERE slug = 'premium-cotton-hijab-navy' UNION ALL
SELECT id, 'Color', 'Black', 60 FROM products WHERE slug = 'premium-cotton-hijab-navy' UNION ALL
SELECT id, 'Color', 'Rose', 35 FROM products WHERE slug = 'floral-silk-hijab-rose' UNION ALL
SELECT id, 'Color', 'Pink', 20 FROM products WHERE slug = 'floral-silk-hijab-rose';

-- Insert demo product images
INSERT INTO product_images (product_id, image_url, alt_text, is_main, display_order)
SELECT id, 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800&h=800&fit=crop', 'Golden Crescent Earrings', true, 0 FROM products WHERE slug = 'golden-crescent-earrings' UNION ALL
SELECT id, 'https://images.unsplash.com/photo-1599643478519-8f9c6b1fb9c0?w=800&h=800&fit=crop', 'Rose Gold Pearl Studs', true, 0 FROM products WHERE slug = 'rose-gold-pearl-studs' UNION ALL
SELECT id, 'https://images.unsplash.com/photo-1505252585461-04db1c2a2e5d?w=800&h=800&fit=crop', 'Premium Cotton Hijab Navy', true, 0 FROM products WHERE slug = 'premium-cotton-hijab-navy' UNION ALL
SELECT id, 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&h=800&fit=crop', 'Leather Crossbody Bag', true, 0 FROM products WHERE slug = 'leather-crossbody-bag';

-- Add demo coupons
INSERT INTO coupons (code, discount_percent, max_discount_amount, min_purchase_amount, valid_from, valid_to, usage_limit, active) VALUES
('WELCOME10', 10.00, 500.00, 500.00, CURRENT_DATE, CURRENT_DATE + INTERVAL '90 days', 100, true),
('SAVE20', 20.00, 1000.00, 1500.00, CURRENT_DATE, CURRENT_DATE + INTERVAL '60 days', 50, true),
('DHAKA50', 15.00, 300.00, 1000.00, CURRENT_DATE, CURRENT_DATE + INTERVAL '30 days', 200, true);
