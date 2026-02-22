import { createServerSupabaseClient } from '@/lib/supabase-server'
import Header from '@/components/header'
import Footer from '@/components/footer'
import ShopClient from '@/components/shop-client'
import { Category } from '@/lib/types'

interface ShopPageProps {
  searchParams: Promise<{
    category?: string
    minPrice?: string
    maxPrice?: string
    search?: string
    sort?: string
    page?: string
  }>
}

export const metadata = {
  title: 'Shop - Hijab & Fashion Hub',
  description: 'Browse our complete collection of premium girls fashion accessories.',
}

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const params = await searchParams
  const supabase = await createServerSupabaseClient()

  // Fetch all categories
  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .order('name')

  // Fetch all products with pagination
  let query = supabase
    .from('products')
    .select('*', { count: 'exact' })

  // Apply filters
  if (params.category) {
    const selectedCategory = categories?.find(c => c.slug === params.category)
    if (selectedCategory) {
      query = query.eq('category_id', selectedCategory.id)
    }
  }

  if (params.search) {
    query = query.ilike('name', `%${params.search}%`)
  }

  // Apply sorting
  const sortParam = params.sort || 'newest'
  if (sortParam === 'price-low') {
    query = query.order('price', { ascending: true })
  } else if (sortParam === 'price-high') {
    query = query.order('price', { ascending: false })
  } else if (sortParam === 'newest') {
    query = query.order('created_at', { ascending: false })
  }

  // Apply pagination
  const page = parseInt(params.page || '1')
  const pageSize = 12
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  const { data: products, count } = await query.range(from, to)

  const totalPages = count ? Math.ceil(count / pageSize) : 0

  return (
    <main className="bg-background min-h-screen flex flex-col">
      <Header />
      <div className="flex-1">
        <ShopClient
          initialProducts={products || []}
          categories={categories || []}
          currentCategory={params.category}
          currentSort={params.sort || 'newest'}
          currentPage={page}
          totalPages={totalPages}
          totalProducts={count || 0}
          searchQuery={params.search}
        />
      </div>
      <Footer />
    </main>
  )
}
