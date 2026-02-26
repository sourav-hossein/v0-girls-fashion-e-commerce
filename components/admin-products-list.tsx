'use client'

import Link from 'next/link'
import { Product, ProductImage } from '@/lib/types'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Edit, Trash2, Eye } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

type ProductWithImages = Product & {
  product_images?: ProductImage[]
}

interface AdminProductsListProps {
  products: ProductWithImages[]
  onRefresh?: () => void
}

export default function AdminProductsList({ products, onRefresh }: AdminProductsListProps) {
  const [isDeleting, setIsDeleting] = useState<string | null>(null)

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return

    setIsDeleting(id)
    try {
      const response = await fetch(`/api/admin/products/${id}`, { method: 'DELETE' })
      const payload = await response.json().catch(() => ({}))
      if (!response.ok) {
        throw new Error(payload?.error || 'Failed to delete product')
      }
      toast.success('Product deleted')
      onRefresh?.()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete product')
    } finally {
      setIsDeleting(null)
    }
  }

  const handleRestore = async (id: string) => {
    setIsDeleting(id)
    try {
      const response = await fetch(`/api/admin/products/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deleted_at: null }),
      })
      const payload = await response.json().catch(() => ({}))
      if (!response.ok) {
        throw new Error(payload?.error || 'Failed to restore product')
      }
      toast.success('Product restored')
      onRefresh?.()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to restore product')
    } finally {
      setIsDeleting(null)
    }
  }

  const getMainImage = (product: ProductWithImages) => {
    const images = product.product_images || []
    return images.find((img) => img.is_main) || images[0]
  }

  return (
    <Card className="border-border overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              <TableHead>Product</TableHead>
              <TableHead>Category</TableHead>
              <TableHead className="text-right">Price</TableHead>
              <TableHead className="text-right">Stock</TableHead>
              <TableHead className="text-center">Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.length > 0 ? (
              products.map((product) => (
                <TableRow key={product.id} className="border-border hover:bg-muted/50">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-lg bg-muted overflow-hidden">
                        {getMainImage(product)?.image_url ? (
                          <img
                            src={getMainImage(product)?.image_url}
                            alt={product.name}
                            className="h-full w-full object-cover"
                          />
                        ) : null}
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{product.name}</p>
                        <p className="text-xs text-muted-foreground">{product.slug}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {product.category_id}
                  </TableCell>
                  <TableCell className="text-right">
                    <div>
                      <p className="font-semibold text-primary">৳{product.price}</p>
                      {product.discount_price && (
                        <p className="text-xs text-muted-foreground line-through">
                          ৳{product.discount_price}
                        </p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge
                      variant={
                        product.stock_quantity > 0 ? 'default' : 'destructive'
                      }
                    >
                      {product.stock_quantity}
                    </Badge>
                    {product.low_stock_threshold !== undefined &&
                      product.stock_quantity <= product.low_stock_threshold &&
                      product.stock_quantity > 0 && (
                        <Badge className="ml-2 bg-yellow-100 text-yellow-800">
                          Low Stock
                        </Badge>
                      )}
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex gap-1 justify-center">
                      {product.featured && (
                        <Badge className="bg-primary/20 text-primary">Featured</Badge>
                      )}
                      {product.trending && (
                        <Badge className="bg-accent/20 text-accent">Trending</Badge>
                      )}
                      {product.deleted_at && (
                        <Badge className="bg-destructive/10 text-destructive">Deleted</Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Link href={`/product/${product.slug}`}>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-muted-foreground hover:text-foreground"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </Link>
                      <Link href={`/admin/products/${product.id}/edit`}>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-muted-foreground hover:text-foreground"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive/90"
                        onClick={() => handleDelete(product.id)}
                        disabled={isDeleting === product.id}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                      {product.deleted_at && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-foreground"
                          onClick={() => handleRestore(product.id)}
                          disabled={isDeleting === product.id}
                        >
                          Restore
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  <p className="text-muted-foreground">No products found</p>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </Card>
  )
}
