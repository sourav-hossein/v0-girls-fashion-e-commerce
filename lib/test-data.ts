import { Category, Product, ProductImage, ProductVariant, Review } from '@/lib/types'

const now = '2026-02-28T00:00:00.000Z'

export const testCategories: Category[] = [
  {
    id: 'cat-dresses',
    name: 'Dresses',
    slug: 'dresses',
    description: 'Party-ready and everyday dresses.',
    image_url: 'https://placehold.co/800x600?text=Dresses',
    created_at: now,
    updated_at: now,
  },
  {
    id: 'cat-tops',
    name: 'Tops',
    slug: 'tops',
    description: 'Tops for every mood and season.',
    image_url: 'https://placehold.co/800x600?text=Tops',
    created_at: now,
    updated_at: now,
  },
]

export const testProducts: Product[] = [
  {
    id: 'prod-rose-dress',
    name: 'Rose Garden Party Dress',
    slug: 'rose-garden-party-dress',
    description: 'Soft chiffon dress with floral print and twirl-ready skirt.',
    price: 3200,
    discount_price: 2800,
    category_id: 'cat-dresses',
    stock_quantity: 40,
    low_stock_threshold: 8,
    featured: true,
    trending: true,
    deleted_at: null,
    created_at: now,
    updated_at: now,
  },
  {
    id: 'prod-cloud-top',
    name: 'Cloudline Knit Top',
    slug: 'cloudline-knit-top',
    description: 'Ribbed knit top with soft stretch and round neck.',
    price: 1200,
    discount_price: 990,
    category_id: 'cat-tops',
    stock_quantity: 60,
    low_stock_threshold: 12,
    featured: true,
    trending: false,
    deleted_at: null,
    created_at: now,
    updated_at: now,
  },
]

export const testProductImages: ProductImage[] = [
  {
    id: 'img-rose-main',
    product_id: 'prod-rose-dress',
    image_url: 'https://placehold.co/600x800?text=Rose+Dress',
    alt_text: 'Rose Garden Party Dress front view',
    is_main: true,
    display_order: 0,
    storage_path: null,
    created_at: now,
  },
  {
    id: 'img-rose-back',
    product_id: 'prod-rose-dress',
    image_url: 'https://placehold.co/600x800?text=Rose+Back',
    alt_text: 'Rose Garden Party Dress back view',
    is_main: false,
    display_order: 1,
    storage_path: null,
    created_at: now,
  },
  {
    id: 'img-cloud-main',
    product_id: 'prod-cloud-top',
    image_url: 'https://placehold.co/600x800?text=Cloudline+Top',
    alt_text: 'Cloudline Knit Top front view',
    is_main: true,
    display_order: 0,
    storage_path: null,
    created_at: now,
  },
]

export const testVariants: ProductVariant[] = [
  {
    id: 'var-rose-s',
    product_id: 'prod-rose-dress',
    variant_type: 'size',
    variant_value: 'S',
    stock_quantity: 10,
    created_at: now,
    updated_at: now,
  },
  {
    id: 'var-rose-m',
    product_id: 'prod-rose-dress',
    variant_type: 'size',
    variant_value: 'M',
    stock_quantity: 12,
    created_at: now,
    updated_at: now,
  },
]

export const testReviews: Review[] = [
  {
    id: 'rev-rose-1',
    product_id: 'prod-rose-dress',
    user_id: 'user-1',
    rating: 5,
    comment: 'Beautiful dress and great fit.',
    created_at: now,
    updated_at: now,
  },
]
