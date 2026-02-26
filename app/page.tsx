import { createServerSupabaseClient } from '@/lib/supabase-server'
import Header from '@/components/header'
import Hero from '@/components/hero'
import FeaturedProducts from '@/components/featured-products'
import CategoriesSection from '@/components/categories-section'
import TrendingProducts from '@/components/trending-products'
import Newsletter from '@/components/newsletter'
import Footer from '@/components/footer'
import { getCachedCategories } from '@/lib/categories'

export const revalidate = 60 // revalidate every 60 seconds

export default async function Home() {
  const supabase = await createServerSupabaseClient()

  // Fetch featured products
  const { data: featuredProducts } = await supabase
    .from('products')
    .select('*, product_images (image_url, is_main, display_order)')
    .eq('featured', true)
    .is('deleted_at', null)
    .limit(8)

  // Fetch trending products
  const { data: trendingProducts } = await supabase
    .from('products')
    .select('*, product_images (image_url, is_main, display_order)')
    .eq('trending', true)
    .is('deleted_at', null)
    .limit(8)

  // Fetch categories
  const categories = await getCachedCategories()
  return (
    <main className="bg-background">
      <Header />
      <Hero />
      <CategoriesSection categories={categories || []} />
      <FeaturedProducts products={featuredProducts || []} />
      <TrendingProducts products={trendingProducts || []} />
      <Newsletter />
      <Footer />
    </main>
  )
}
