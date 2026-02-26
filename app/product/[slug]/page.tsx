import { createServerSupabaseClient } from '@/lib/supabase-server'
import { notFound } from 'next/navigation'
import Header from '@/components/header'
import Footer from '@/components/footer'
import ProductDetailClient from '@/components/product-detail-client'
import { Metadata } from 'next'

interface ProductPageProps {
  params: Promise<{
    slug: string
  }>
}

export async function generateMetadata(
  { params }: ProductPageProps,
): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createServerSupabaseClient()
  
  const { data: product } = await supabase
    .from('products')
    .select('*')
    .eq('slug', slug)
    .is('deleted_at', null)
    .single()

  if (!product) {
    return {
      title: 'Product Not Found',
    }
  }

  return {
    title: `${product.name} - Hijab & Fashion Hub`,
    description: product.description || `Shop ${product.name} - Premium girls fashion accessories`,
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params
  const supabase = await createServerSupabaseClient()

  // Fetch product
  const { data: product } = await supabase
    .from('products')
    .select('*')
    .eq('slug', slug)
    .is('deleted_at', null)
    .single()

  if (!product) {
    notFound()
  }

  // Fetch product images
  const { data: images } = await supabase
    .from('product_images')
    .select('*')
    .eq('product_id', product.id)
    .order('display_order')

  // Fetch product variants
  const { data: variants } = await supabase
    .from('product_variants')
    .select('*')
    .eq('product_id', product.id)

  // Fetch reviews
  const { data: reviews } = await supabase
    .from('reviews')
    .select('*')
    .eq('product_id', product.id)
    .order('created_at', { ascending: false })

  // Fetch related products (same category, limit 4)
  const { data: relatedProducts } = await supabase
    .from('products')
    .select('*, product_images (image_url, is_main, display_order)')
    .eq('category_id', product.category_id)
    .neq('id', product.id)
    .is('deleted_at', null)
    .limit(4)

  return (
    <main className="bg-background min-h-screen flex flex-col">
      <Header />
      <div className="flex-1">
        <ProductDetailClient
          product={product}
          images={images || []}
          variants={variants || []}
          reviews={reviews || []}
          relatedProducts={relatedProducts || []}
        />
      </div>
      <Footer />
    </main>
  )
}
