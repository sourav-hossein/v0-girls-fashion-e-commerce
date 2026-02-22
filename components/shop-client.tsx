'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Product, Category } from '@/lib/types'
import ProductCard from './product-card'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet'
import { SlidersHorizontal, X } from 'lucide-react'

interface ShopClientProps {
  initialProducts: Product[]
  categories: Category[]
  currentCategory?: string
  currentSort: string
  currentPage: number
  totalPages: number
  totalProducts: number
  searchQuery?: string
}

export default function ShopClient({
  initialProducts,
  categories,
  currentCategory,
  currentSort,
  currentPage,
  totalPages,
  totalProducts,
  searchQuery,
}: ShopClientProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [minPrice, setMinPrice] = useState<string>('')
  const [maxPrice, setMaxPrice] = useState<string>('')
  const [search, setSearch] = useState(searchQuery || '')

  const handleSearch = () => {
    const params = new URLSearchParams()
    if (search) params.set('search', search)
    if (currentCategory) params.set('category', currentCategory)
    if (currentSort) params.set('sort', currentSort)
    if (minPrice) params.set('minPrice', minPrice)
    if (maxPrice) params.set('maxPrice', maxPrice)
    router.push(`/shop?${params.toString()}`)
  }

  const handleCategoryChange = (category: string) => {
    const params = new URLSearchParams()
    if (category) params.set('category', category)
    if (search) params.set('search', search)
    if (currentSort) params.set('sort', currentSort)
    if (minPrice) params.set('minPrice', minPrice)
    if (maxPrice) params.set('maxPrice', maxPrice)
    router.push(`/shop?${params.toString()}`)
  }

  const handleSortChange = (sort: string) => {
    const params = new URLSearchParams()
    if (sort) params.set('sort', sort)
    if (currentCategory) params.set('category', currentCategory)
    if (search) params.set('search', search)
    if (minPrice) params.set('minPrice', minPrice)
    if (maxPrice) params.set('maxPrice', maxPrice)
    router.push(`/shop?${params.toString()}`)
  }

  const handlePaginationChange = (page: number) => {
    const params = new URLSearchParams()
    if (page > 1) params.set('page', page.toString())
    if (currentCategory) params.set('category', currentCategory)
    if (search) params.set('search', search)
    if (currentSort) params.set('sort', currentSort)
    if (minPrice) params.set('minPrice', minPrice)
    if (maxPrice) params.set('maxPrice', maxPrice)
    router.push(`/shop?${params.toString()}`)
  }

  const clearFilters = () => {
    setMinPrice('')
    setMaxPrice('')
    setSearch('')
    router.push('/shop')
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-serif font-bold text-foreground mb-2">
          Our Collection
        </h1>
        <p className="text-muted-foreground">
          {totalProducts > 0
            ? `Showing ${(currentPage - 1) * 12 + 1}-${Math.min(currentPage * 12, totalProducts)} of ${totalProducts} products`
            : 'No products found'}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Filters - Desktop */}
        <div className="hidden lg:block space-y-6">
          <div>
            <h3 className="font-semibold text-foreground mb-4">Categories</h3>
            <div className="space-y-2">
              <button
                onClick={() => handleCategoryChange('')}
                className={`block w-full text-left px-3 py-2 rounded-lg transition-colors ${
                  !currentCategory
                    ? 'bg-primary/10 text-primary font-semibold'
                    : 'hover:bg-muted text-foreground'
                }`}
              >
                All Products
              </button>
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => handleCategoryChange(category.slug)}
                  className={`block w-full text-left px-3 py-2 rounded-lg transition-colors ${
                    currentCategory === category.slug
                      ? 'bg-primary/10 text-primary font-semibold'
                      : 'hover:bg-muted text-foreground'
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>

          {/* Price Filter */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Price Range</h3>
            <div className="space-y-3">
              <Input
                type="number"
                placeholder="Min Price"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
              />
              <Input
                type="number"
                placeholder="Max Price"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
              />
              <Button onClick={handleSearch} className="w-full bg-primary hover:bg-primary/90">
                Apply Filters
              </Button>
            </div>
          </div>

          {/* Clear Filters */}
          {(currentCategory || minPrice || maxPrice || search) && (
            <Button
              onClick={clearFilters}
              variant="outline"
              className="w-full border-border"
            >
              Clear All Filters
            </Button>
          )}
        </div>

        {/* Mobile Filter Button */}
        <div className="lg:hidden mb-6">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" className="w-full border-primary text-primary">
                <SlidersHorizontal className="w-4 h-4 mr-2" />
                Filters
              </Button>
            </SheetTrigger>
            <SheetContent side="left">
              <div className="space-y-6 mt-8">
                <div>
                  <h3 className="font-semibold text-foreground mb-4">Categories</h3>
                  <div className="space-y-2">
                    <button
                      onClick={() => handleCategoryChange('')}
                      className={`block w-full text-left px-3 py-2 rounded-lg transition-colors ${
                        !currentCategory
                          ? 'bg-primary/10 text-primary font-semibold'
                          : 'hover:bg-muted text-foreground'
                      }`}
                    >
                      All Products
                    </button>
                    {categories.map((category) => (
                      <button
                        key={category.id}
                        onClick={() => handleCategoryChange(category.slug)}
                        className={`block w-full text-left px-3 py-2 rounded-lg transition-colors ${
                          currentCategory === category.slug
                            ? 'bg-primary/10 text-primary font-semibold'
                            : 'hover:bg-muted text-foreground'
                        }`}
                      >
                        {category.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-foreground mb-4">Price Range</h3>
                  <div className="space-y-3">
                    <Input
                      type="number"
                      placeholder="Min Price"
                      value={minPrice}
                      onChange={(e) => setMinPrice(e.target.value)}
                    />
                    <Input
                      type="number"
                      placeholder="Max Price"
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(e.target.value)}
                    />
                    <Button onClick={handleSearch} className="w-full bg-primary hover:bg-primary/90">
                      Apply Filters
                    </Button>
                  </div>
                </div>

                {(currentCategory || minPrice || maxPrice || search) && (
                  <Button
                    onClick={clearFilters}
                    variant="outline"
                    className="w-full border-border"
                  >
                    Clear All Filters
                  </Button>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3 space-y-8">
          {/* Top Controls */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="w-full sm:flex-1 flex gap-2">
              <Input
                type="search"
                placeholder="Search products..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
              <Button onClick={handleSearch} className="bg-primary hover:bg-primary/90">
                Search
              </Button>
            </div>

            <Select value={currentSort} onValueChange={handleSortChange}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Products Grid */}
          {initialProducts.length > 0 ? (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {initialProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-12">
                  <Button
                    variant="outline"
                    disabled={currentPage === 1}
                    onClick={() => handlePaginationChange(currentPage - 1)}
                  >
                    Previous
                  </Button>

                  <div className="flex gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                      <Button
                        key={pageNum}
                        variant={currentPage === pageNum ? 'default' : 'outline'}
                        className={
                          currentPage === pageNum
                            ? 'bg-primary hover:bg-primary/90'
                            : ''
                        }
                        onClick={() => handlePaginationChange(pageNum)}
                      >
                        {pageNum}
                      </Button>
                    ))}
                  </div>

                  <Button
                    variant="outline"
                    disabled={currentPage === totalPages}
                    onClick={() => handlePaginationChange(currentPage + 1)}
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-16">
              <p className="text-2xl text-muted-foreground mb-4">No products found</p>
              <Button onClick={clearFilters} className="bg-primary hover:bg-primary/90">
                Clear Filters and Try Again
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
