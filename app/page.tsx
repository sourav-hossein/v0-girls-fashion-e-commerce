import { cookies } from 'next/headers'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { createAdminSupabaseClient } from '@/lib/supabase-admin'
import Header from '@/components/header'
import Hero from '@/components/hero'
import FeaturedProducts from '@/components/featured-products'
import CategoriesSection from '@/components/categories-section'
import TrendingProducts from '@/components/trending-products'
import RecommendedProducts from '@/components/recommended-products'
import BestSellers from '@/components/best-sellers'
import FlashSale from '@/components/flash-sale'
import NewArrivals from '@/components/new-arrivals'
import ReviewsStrip from '@/components/reviews-strip'
import Newsletter from '@/components/newsletter'
import Footer from '@/components/footer'
import { getCachedCategories } from '@/lib/categories'
import { Product, ProductImage } from '@/lib/types'

export const revalidate = 60 // revalidate every 60 seconds

type ProductWithImages = Product & { product_images?: ProductImage[] }

async function getPersonalizedProducts({
  userId,
  sessionId,
}: {
  userId?: string | null
  sessionId?: string | null
}): Promise<ProductWithImages[]> {
  if (!userId && !sessionId) return []

  const supabase = await createAdminSupabaseClient()
  const sinceDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()

  const eventsQuery = supabase
    .from('analytics_events')
    .select('event_type, product_id, created_at, products (category_id)')
    .in('event_type', ['product_view', 'add_to_cart', 'purchase'])
    .not('product_id', 'is', null)
    .gte('created_at', sinceDate)
    .order('created_at', { ascending: false })
    .limit(200)

  if (userId) {
    eventsQuery.eq('user_id', userId)
  } else if (sessionId) {
    eventsQuery.eq('session_id', sessionId)
  }

  const { data: events } = await eventsQuery

  if (!events || events.length === 0) return []

  const categoryScores = new Map<string, number>()
  const viewedProductIds = new Set<string>()

  for (const event of events) {
    const categoryId = (event as any)?.products?.category_id as string | undefined
    if (!categoryId || !event.product_id) continue

    if (event.event_type === 'product_view') {
      viewedProductIds.add(event.product_id)
    }

    const weight =
      event.event_type === 'purchase' ? 3 :
      event.event_type === 'add_to_cart' ? 2 : 1
    categoryScores.set(categoryId, (categoryScores.get(categoryId) || 0) + weight)
  }

  const topCategories = Array.from(categoryScores.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([categoryId]) => categoryId)

  if (topCategories.length === 0) return []

  const { data: products } = await supabase
    .from('products')
    .select('*, product_images (image_url, is_main, display_order)')
    .in('category_id', topCategories)
    .is('deleted_at', null)
    .limit(24)

  const filtered = (products || []).filter((product) => !viewedProductIds.has(product.id))
  return filtered.slice(0, 8)
}

async function getBestSellers(): Promise<ProductWithImages[]> {
  const supabase = await createAdminSupabaseClient()
  const { data: events } = await supabase
    .from('analytics_events')
    .select('event_type, product_id')
    .in('event_type', ['add_to_cart', 'purchase'])
    .not('product_id', 'is', null)
    .order('created_at', { ascending: false })
    .limit(1000)

  const counts = new Map<string, number>()
  for (const event of events || []) {
    if (!event.product_id) continue
    const weight = event.event_type === 'purchase' ? 3 : 1
    counts.set(event.product_id, (counts.get(event.product_id) || 0) + weight)
  }

  const topProductIds = Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([productId]) => productId)

  if (topProductIds.length === 0) return []

  const { data: products } = await supabase
    .from('products')
    .select('*, product_images (image_url, is_main, display_order)')
    .in('id', topProductIds)
    .is('deleted_at', null)

  const productMap = new Map((products || []).map((product) => [product.id, product]))
  return topProductIds.map((id) => productMap.get(id)).filter(Boolean) as ProductWithImages[]
}

async function getFlashSaleProducts(): Promise<ProductWithImages[]> {
  const supabase = await createServerSupabaseClient()
  const { data: products } = await supabase
    .from('products')
    .select('*, product_images (image_url, is_main, display_order)')
    .not('discount_price', 'is', null)
    .gt('stock_quantity', 0)
    .is('deleted_at', null)
    .limit(20)

  const sorted = (products || []).sort((a, b) => {
    const discountA = (a.price ?? 0) - (a.discount_price ?? a.price ?? 0)
    const discountB = (b.price ?? 0) - (b.discount_price ?? b.price ?? 0)
    return discountB - discountA
  })
  return sorted.slice(0, 8)
}

async function getNewArrivals(): Promise<ProductWithImages[]> {
  const supabase = await createServerSupabaseClient()
  const { data: products } = await supabase
    .from('products')
    .select('*, product_images (image_url, is_main, display_order)')
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
    .limit(8)
  return products || []
}

async function getLatestReviews() {
  const supabase = await createServerSupabaseClient()
  const { data: reviews } = await supabase
    .from('reviews')
    .select('*, products (*, product_images (image_url, is_main, display_order))')
    .order('created_at', { ascending: false })
    .limit(6)
  return reviews || []
}

export default async function Home() {
  const supabase = await createServerSupabaseClient()
  const cookieStore = await cookies()
  const sessionId = cookieStore.get('session_id')?.value ?? null
  const { data: authData } = await supabase.auth.getUser()
  const userId = authData?.user?.id ?? null

  const [
    featuredProductsResult,
    trendingProductsResult,
    categories,
    personalizedProducts,
    bestSellers,
    flashSaleProducts,
    newArrivals,
    latestReviews,
  ] = await Promise.all([
    supabase
      .from('products')
      .select('*, product_images (image_url, is_main, display_order)')
      .eq('featured', true)
      .is('deleted_at', null)
      .limit(8),
    supabase
      .from('products')
      .select('*, product_images (image_url, is_main, display_order)')
      .eq('trending', true)
      .is('deleted_at', null)
      .limit(8),
    getCachedCategories(),
    getPersonalizedProducts({ userId, sessionId }),
    getBestSellers(),
    getFlashSaleProducts(),
    getNewArrivals(),
    getLatestReviews(),
  ])

  const featuredProducts = featuredProductsResult.data || []
  const trendingProducts = trendingProductsResult.data || []
  const hasPersonalized = personalizedProducts.length > 0

  return (
    <main className="bg-background">
      <Header />
      <Hero />
      <RecommendedProducts
        title={hasPersonalized ? 'Recommended For You' : 'Curated Picks'}
        subtitle={hasPersonalized ? 'Based on your recent activity' : 'Trending styles picked just for you'}
        products={hasPersonalized ? personalizedProducts : trendingProducts}
        ctaLabel="Explore More"
        ctaHref="/shop"
      />
      <CategoriesSection categories={categories || []} />
      <BestSellers products={bestSellers} />
      <FlashSale products={flashSaleProducts} />
      <NewArrivals products={newArrivals} />
      <TrendingProducts products={trendingProducts} />
      <FeaturedProducts products={featuredProducts} />
      <ReviewsStrip reviews={latestReviews} />
      <Newsletter />
      <Footer />
    </main>
  )
}
