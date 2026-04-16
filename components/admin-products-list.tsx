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
import { SafeImage } from '@/components/ui/safe-image'
import { Edit, Trash2, Eye, RotateCcw, Box, MoreVertical, Star, TrendingUp } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

type ProductWithImages = Product & {
  product_images?: ProductImage[]
}

interface AdminProductsListProps {
  products: ProductWithImages[]
  onRefresh?: () => void
}

export default function AdminProductsList({ products, onRefresh }: AdminProductsListProps) {
  const [isBusy, setIsBusy] = useState<string | null>(null)

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product? It will be archived (soft-deleted).')) return

    setIsBusy(id)
    try {
      const response = await fetch(`/api/admin/products/${id}`, { method: 'DELETE' })
      const payload = await response.json().catch(() => ({}))
      if (!response.ok) {
        throw new Error(payload?.error || 'Failed to delete product')
      }
      toast.success('Product archived')
      onRefresh?.()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete product')
    } finally {
      setIsBusy(null)
    }
  }

  const handleRestore = async (id: string) => {
    setIsBusy(id)
    try {
      const response = await fetch(`/api/admin/products/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product: { deleted_at: null } }),
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
      setIsBusy(null)
    }
  }

  const getMainImage = (product: ProductWithImages) => {
    const images = product.product_images || []
    return images.find((img) => img.is_main) || images[0]
  }

  return (
    <Card className="border-border/40 shadow-sm overflow-hidden bg-card/50 backdrop-blur-sm">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-border/40 bg-muted/30 hover:bg-muted/30">
              <TableHead className="w-[80px]">Image</TableHead>
              <TableHead className="min-w-[200px]">Product Details</TableHead>
              <TableHead>Category</TableHead>
              <TableHead className="text-right">Price</TableHead>
              <TableHead className="text-center">Inventory</TableHead>
              <TableHead className="text-center">Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.length > 0 ? (
              products.map((product) => (
                <TableRow key={product.id} className={cn(
                  "border-border/40 transition-colors group",
                  product.deleted_at ? "opacity-60 bg-muted/10" : "hover:bg-muted/50"
                )}>
                  <TableCell>
                    <div className="h-14 w-14 rounded-xl bg-muted overflow-hidden border border-border/20 shadow-inner group-hover:scale-105 transition-transform duration-300">
                      {getMainImage(product)?.image_url ? (
                        <div className="relative h-full w-full">
                          <SafeImage
                            src={getMainImage(product)?.image_url}
                            alt={product.name}
                            fill
                            className="object-cover"
                            sizes="56px"
                          />
                        </div>
                      ) : (
                        <div className="h-full w-full flex items-center justify-center bg-muted/40">
                          <Box className="w-6 h-6 text-muted-foreground/30" />
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <p className="font-serif font-semibold text-foreground leading-tight">{product.name}</p>
                      <p className="text-[10px] text-muted-foreground font-mono mt-1 opacity-70">{product.slug}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="font-normal border-border/60 bg-muted/20">
                      {(product as any).categories?.name || product.category_id.split('-')[0]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex flex-col items-end">
                      <p className="font-bold text-primary">AED {product.price}</p>
                      {product.discount_price && (
                        <p className="text-[10px] text-muted-foreground line-through opacity-60">
                          AED {product.discount_price}
                        </p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="inline-flex flex-col items-center gap-1">
                      <Badge
                        className={cn(
                          "px-2 py-0 h-5 font-bold tracking-tighter",
                          product.stock_quantity > 0 ? "bg-emerald-500/10 text-emerald-600 border-emerald-200" : "bg-destructive/10 text-destructive border-destructive/20"
                        )}
                        variant="outline"
                      >
                        {product.stock_quantity} in stock
                      </Badge>
                      {product.low_stock_threshold !== undefined &&
                        product.stock_quantity <= product.low_stock_threshold &&
                        product.stock_quantity > 0 && (
                          <span className="text-[9px] font-bold text-amber-600 bg-amber-50 px-1 rounded uppercase tracking-widest animate-pulse">
                            Low Stock
                          </span>
                        )}
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex gap-1.5 justify-center flex-wrap max-w-[150px] mx-auto">
                      {product.featured && (
                        <Badge className="bg-amber-100 text-amber-700 border-amber-200 h-5 px-1.5 gap-1 font-medium">
                          <Star className="w-2.5 h-2.5 fill-current" />
                          Featured
                        </Badge>
                      )}
                      {product.trending && (
                        <Badge className="bg-blue-100 text-blue-700 border-blue-200 h-5 px-1.5 gap-1 font-medium">
                          <TrendingUp className="w-2.5 h-2.5" />
                          Trending
                        </Badge>
                      )}
                      {product.deleted_at && (
                        <Badge className="bg-zinc-100 text-zinc-700 border-zinc-200 h-5 px-1.5 font-medium">Archived</Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end items-center gap-1">
                      <Link href={`/product/${product.slug}`} target="_blank">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-primary transition-colors"
                          title="View on site"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </Link>
                      <Link href={`/admin/products/${product.id}/edit`}>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-primary transition-colors"
                          title="Edit product"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                      </Link>
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48 font-serif">
                          <DropdownMenuLabel className="text-xs text-muted-foreground uppercase tracking-widest">More Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          {product.deleted_at ? (
                            <DropdownMenuItem 
                              className="text-primary focus:text-primary gap-2"
                              onClick={() => handleRestore(product.id)}
                              disabled={isBusy === product.id}
                            >
                              <RotateCcw className="w-4 h-4" />
                              Restore Product
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem 
                              className="text-destructive focus:text-destructive gap-2"
                              onClick={() => handleDelete(product.id)}
                              disabled={isBusy === product.id}
                            >
                              <Trash2 className="w-4 h-4" />
                              Archive Product
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-20 bg-muted/5">
                  <div className="flex flex-col items-center justify-center space-y-3 opacity-50">
                    <Box className="w-12 h-12 text-muted-foreground" />
                    <p className="text-lg font-serif italic text-muted-foreground">No products match your current filters.</p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </Card>
  )
}
