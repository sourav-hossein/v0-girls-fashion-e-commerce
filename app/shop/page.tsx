import { createServerSupabaseClient } from '@/lib/supabase-server'
import Header from '@/components/header'
import Footer from '@/components/footer'
import ShopClient from '@/components/shop-client'
import { Category } from '@/lib/types'
import { getCachedCategories } from '@/lib/categories'
import { isTestMode } from '@/lib/test-mode'
import { testCategories, testProducts, testProductImages } from '@/lib/test-data'

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
  const useTestData = isTestMode()
  if (useTestData) {
    const categories = testCategories
    let products = testProducts.filter((p) => !p.deleted_at)

    if (params.category) {
      const selectedCategory = categories.find((c) => c.slug === params.category)
      if (selectedCategory) {
        products = products.filter((p) => p.category_id === selectedCategory.id)
      }
    }

    if (params.search) {
      const q = params.search.toLowerCase()
      products = products.filter((p) => p.name.toLowerCase().includes(q))
    }

    const sortParam = params.sort || 'newest'
    if (sortParam === 'price-low') {
      products = [...products].sort((a, b) => a.price - b.price)
    } else if (sortParam === 'price-high') {
      products = [...products].sort((a, b) => b.price - a.price)
    } else if (sortParam === 'newest') {
      products = [...products].sort((a, b) => b.created_at.localeCompare(a.created_at))
    }

    const page = parseInt(params.page || '1')
    const pageSize = 12
    const from = (page - 1) * pageSize
    const to = from + pageSize - 1
    const totalProducts = products.length
    const pagedProducts = products.slice(from, to + 1).map((product) => ({
      ...product,
      product_images: testProductImages
        .filter((img) => img.product_id === product.id)
        .sort((a, b) => a.display_order - b.display_order),
    }))
    const totalPages = totalProducts ? Math.ceil(totalProducts / pageSize) : 0

    return (
      <main className="bg-background min-h-screen flex flex-col">
        <Header />
        <div className="flex-1">
          <ShopClient
            initialProducts={pagedProducts}
            categories={categories}
            currentCategory={params.category}
            currentSort={params.sort || 'newest'}
            currentPage={page}
            totalPages={totalPages}
            totalProducts={totalProducts}
            searchQuery={params.search}
          />
        </div>
        <Footer />
      </main>
    )
  }

  const supabase = await createServerSupabaseClient()

  // Fetch all categories
  const categories = await getCachedCategories()

  // Fetch all products with pagination
  let query = supabase
    .from('products')
    .select('*, product_images (image_url, is_main, display_order)', { count: 'exact' })
    .is('deleted_at', null)

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
