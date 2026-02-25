export interface Profile {
  id: string
  full_name?: string
  profile_photo_url?: string
  phone_number?: string
  phone_verified?: boolean
  last_login?: string
  role?: 'customer' | 'admin'
  created_at: string
  updated_at: string
}

export interface Category {
  id: string
  name: string
  slug: string
  description?: string
  image_url?: string
  created_at: string
  updated_at: string
}

export interface Product {
  id: string
  name: string
  slug: string
  description?: string
  price: number
  discount_price?: number
  category_id: string
  stock_quantity: number
  featured: boolean
  trending: boolean
  created_at: string
  updated_at: string
}

export interface ProductImage {
  id: string
  product_id: string
  image_url: string
  alt_text?: string
  is_main: boolean
  display_order: number
  created_at: string
}

export interface ProductVariant {
  id: string
  product_id: string
  variant_type: string
  variant_value: string
  stock_quantity: number
  created_at: string
  updated_at: string
}

export interface CartItem {
  id: string
  user_id: string
  product_id: string
  variant_id?: string
  quantity: number
  added_at: string
  updated_at: string
}

export interface Wishlist {
  id: string
  user_id: string
  product_id: string
  added_at: string
}

export interface Order {
  id: string
  order_number: string
  user_id: string
  subtotal: number
  delivery_charge: number
  discount_amount?: number
  total_amount: number
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'failed'
  payment_method: 'sslcommerz' | 'cod'
  payment_status: 'pending' | 'completed' | 'failed'
  notes?: string
  created_at: string
  updated_at: string
}

export interface OrderItem {
  id: string
  order_id: string
  product_id?: string
  variant_id?: string
  quantity: number
  price_at_purchase: number
  created_at: string
}

export interface OrderAddress {
  id: string
  order_id: string
  division: string
  district: string
  thana: string
  full_address: string
  phone_number: string
  created_at: string
}

export interface Review {
  id: string
  product_id: string
  user_id: string
  rating: number
  comment?: string
  created_at: string
  updated_at: string
}

export interface Coupon {
  id: string
  code: string
  discount_percent: number
  max_discount_amount?: number
  min_purchase_amount?: number
  valid_from: string
  valid_to: string
  usage_limit?: number
  used_count: number
  active: boolean
  created_at: string
  updated_at: string
}

export interface PaymentLog {
  id: string
  order_id: string
  transaction_id?: string
  gateway_response?: Record<string, any>
  status: 'pending' | 'completed' | 'failed'
  created_at: string
  updated_at: string
}
