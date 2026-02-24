'use client'

import Link from 'next/link'
import { Heart, ShoppingCart } from 'lucide-react'
import { Product } from '@/lib/types'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useState } from 'react'
import { toast } from 'sonner'

interface ProductCardProps {
  product: Product
  image?: string
}

export default function ProductCard({ product, image }: ProductCardProps) {
  const [isWishlisted, setIsWishlisted] = useState(false)
  const [isWishlistLoading, setIsWishlistLoading] = useState(false)
  const discount = product.discount_price
    ? Math.round(((product.price - product.discount_price) / product.price) * 100)
    : 0

  return (
    <Link href={`/product/${product.slug}`}>
      <Card className="cursor-pointer hover:shadow-lg transition-all duration-300 overflow-hidden group h-full flex flex-col">
        {/* Image */}
        <div className="relative aspect-square overflow-hidden bg-muted">
          <div className="w-full h-full bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
            <span className="text-4xl">🛍️</span>
          </div>

          {/* Badge */}
          {discount > 0 && (
            <div className="absolute top-3 right-3 bg-accent text-accent-foreground px-2 py-1 rounded-lg text-xs font-semibold">
              -{discount}%
            </div>
          )}

          {product.stock_quantity === 0 && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <p className="text-white font-semibold">Out of Stock</p>
            </div>
          )}

          {/* Wishlist Button */}
          <button
            onClick={(e) => {
              e.preventDefault()
              if (isWishlistLoading) return
              setIsWishlistLoading(true)
              const nextState = !isWishlisted
              const action = nextState
                ? fetch('/api/wishlist', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ product_id: product.id }),
                  })
                : fetch(`/api/wishlist?product_id=${product.id}`, { method: 'DELETE' })

              action
                .then(async (response) => {
                  const data = await response.json()
                  if (!response.ok) {
                    throw new Error(data.error || 'Wishlist update failed')
                  }
                  setIsWishlisted(nextState)
                  toast.success(nextState ? 'Added to wishlist' : 'Removed from wishlist')
                })
                .catch((error) => {
                  toast.error(error.message || 'Wishlist update failed')
                })
                .finally(() => {
                  setIsWishlistLoading(false)
                })
            }}
            disabled={isWishlistLoading}
            className="absolute top-3 left-3 p-2 bg-white/90 hover:bg-primary hover:text-primary-foreground rounded-full transition-colors"
          >
            <Heart
              className="w-4 h-4"
              fill={isWishlisted ? 'currentColor' : 'none'}
            />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 flex-1 flex flex-col gap-3">
          <div>
            <h3 className="font-semibold text-foreground text-sm line-clamp-2 group-hover:text-primary transition-colors">
              {product.name}
            </h3>
            {product.description && (
              <p className="text-xs text-muted-foreground line-clamp-1 mt-1">
                {product.description}
              </p>
            )}
          </div>

          {/* Price */}
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-primary">
              {product.discount_price
                ? `৳${product.discount_price}`
                : `৳${product.price}`}
            </span>
            {product.discount_price && (
              <span className="text-sm text-muted-foreground line-through">
                ৳{product.price}
              </span>
            )}
          </div>

          {/* Stock Info */}
          <p className="text-xs text-muted-foreground">
            {product.stock_quantity > 0
              ? `${product.stock_quantity} in stock`
              : 'Out of stock'}
          </p>

          {/* Add to Cart Button */}
          <Button
            onClick={(e) => {
              e.preventDefault()
              // Add to cart functionality will be implemented
            }}
            disabled={product.stock_quantity === 0}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground gap-2 mt-auto"
          >
            <ShoppingCart className="w-4 h-4" />
            <span>Add to Cart</span>
          </Button>
        </div>
      </Card>
    </Link>
  )
}
