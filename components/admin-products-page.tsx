'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import AdminProductsList from '@/components/admin-products-list'
import { Category, Product, ProductImage } from '@/lib/types'

type ProductWithImages = Product & { product_images?: ProductImage[] }

export default function AdminProductsPageClient() {
  const [products, setProducts] = useState<ProductWithImages[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [search, setSearch] = useState('')
  const [categoryId, setCategoryId] = useState<string>('all')
  const [includeDeleted, setIncludeDeleted] = useState(false)
  const [loading, setLoading] = useState(false)

  const queryString = useMemo(() => {
    const params = new URLSearchParams()
    if (search) params.set('search', search)
    if (categoryId !== 'all') params.set('category_id', categoryId)
    if (includeDeleted) params.set('include_deleted', 'true')
    return params.toString()
  }, [search, categoryId, includeDeleted])

  const fetchCategories = async () => {
    const response = await fetch('/api/admin/categories')
    const payload = await response.json().catch(() => ({}))
    if (response.ok) {
      setCategories(payload.categories || [])
    }
  }

  const fetchProducts = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/admin/products?${queryString}`)
      const payload = await response.json().catch(() => ({}))
      if (response.ok) {
        setProducts(payload.products || [])
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  useEffect(() => {
    fetchProducts()
  }, [queryString])

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-foreground">Products</h1>
          <p className="text-muted-foreground mt-2">Manage your product inventory</p>
        </div>
        <div className="flex gap-2">
          <Link href="/admin/products/bulk-stock">
            <Button variant="outline">Bulk Stock</Button>
          </Link>
          <Link href="/admin/products/new">
            <Button className="bg-primary hover:bg-primary/90 gap-2">
              <Plus className="w-4 h-4" />
              Add Product
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Input
          placeholder="Search by name or slug"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
        <Select value={categoryId} onValueChange={setCategoryId}>
          <SelectTrigger>
            <SelectValue placeholder="All categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="flex items-center gap-3">
          <Switch checked={includeDeleted} onCheckedChange={setIncludeDeleted} />
          <span className="text-sm text-muted-foreground">Include deleted</span>
        </div>
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading products...</p>
      ) : (
        <AdminProductsList products={products} onRefresh={fetchProducts} />
      )}
    </div>
  )
}
