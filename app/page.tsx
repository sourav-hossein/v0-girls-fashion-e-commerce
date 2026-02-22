import { createServerSupabaseClient } from '@/lib/supabase-server'
import Header from '@/components/header'
import Hero from '@/components/hero'
import FeaturedProducts from '@/components/featured-products'
import CategoriesSection from '@/components/categories-section'
import TrendingProducts from '@/components/trending-products'
import Newsletter from '@/components/newsletter'
import Footer from '@/components/footer'

export const revalidate = 60 // revalidate every 60 seconds

export default async function Home() {
  const supabase = await createServerSupabaseClient()

  // Fetch featured products
  const { data: featuredProducts } = await supabase
    .from('products')
    .select('*')
    .eq('featured', true)
    .limit(8)

  // Fetch trending products
  const { data: trendingProducts } = await supabase
    .from('products')
    .select('*')
    .eq('trending', true)
    .limit(8)

  // Fetch categories
  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .limit(8)

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
