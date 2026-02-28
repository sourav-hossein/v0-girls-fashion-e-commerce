import { createServerSupabaseClient } from '@/lib/supabase-server'
import { notFound } from 'next/navigation'
import Header from '@/components/header'
import Footer from '@/components/footer'
import ProductDetailClient from '@/components/product-detail-client'
import { Metadata } from 'next'
import { isTestMode } from '@/lib/test-mode'
import {
  testProducts,
  testProductImages,
  testVariants,
  testReviews,
} from '@/lib/test-data'

interface ProductPageProps {
  params: Promise<{
    slug: string
  }>
}

export async function generateMetadata(
  { params }: ProductPageProps,
): Promise<Metadata> {
  const { slug } = await params
  if (isTestMode()) {
    const product = testProducts.find((p) => p.slug === slug && !p.deleted_at)
    if (!product) {
      return { title: 'Product Not Found' }
    }
    return {
      title: `${product.name} - Hijab & Fashion Hub`,
      description: product.description || `Shop ${product.name} - Premium girls fashion accessories`,
    }
  }

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
  if (isTestMode()) {
    const product = testProducts.find((p) => p.slug === slug && !p.deleted_at)
    if (!product) {
      notFound()
    }

    const images = testProductImages
      .filter((img) => img.product_id === product.id)
      .sort((a, b) => a.display_order - b.display_order)
    const variants = testVariants.filter((v) => v.product_id === product.id)
    const reviews = testReviews
      .filter((r) => r.product_id === product.id)
      .sort((a, b) => b.created_at.localeCompare(a.created_at))
    const relatedProducts = testProducts
      .filter((p) => p.category_id === product.category_id && p.id !== product.id && !p.deleted_at)
      .slice(0, 4)
      .map((p) => ({
        ...p,
        product_images: testProductImages
          .filter((img) => img.product_id === p.id)
          .sort((a, b) => a.display_order - b.display_order),
      }))

    return (
      <main className="bg-background min-h-screen flex flex-col">
        <Header />
        <div className="flex-1">
          <ProductDetailClient
            product={product}
            images={images}
            variants={variants}
            reviews={reviews}
            relatedProducts={relatedProducts}
          />
        </div>
        <Footer />
      </main>
    )
  }

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
