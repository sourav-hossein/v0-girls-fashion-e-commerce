'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Heart, ShoppingCart } from 'lucide-react'
import { Product } from '@/lib/types'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useState } from 'react'
import { toast } from 'sonner'
import { addToCart, CartAuthError } from '@/lib/cart-api'
import { trackEvent } from '@/lib/analytics-client'

interface ProductCardProps {
  product: Product
  image?: string
}

export default function ProductCard({ product, image }: ProductCardProps) {
  const router = useRouter()
  const [isWishlisted, setIsWishlisted] = useState(false)
  const [isWishlistLoading, setIsWishlistLoading] = useState(false)
  const [isCartLoading, setIsCartLoading] = useState(false)
  const discount = product.discount_price
    ? Math.round(((product.price - product.discount_price) / product.price) * 100)
    : 0

  return (
    <Card className="hover:shadow-lg transition-all duration-300 overflow-hidden group h-full flex flex-col relative">
      <Link href={`/product/${product.slug}`} className="block">
        <div className="relative aspect-square overflow-hidden bg-muted cursor-pointer">
          {image ? (
            <img
              src={image}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
              <span className="text-4xl">Ã°Å¸â€ºÂÃ¯Â¸Â</span>
            </div>
          )}

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
        </div>
      </Link>

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
        className="absolute top-3 left-3 z-10 p-2 bg-white/90 hover:bg-primary hover:text-primary-foreground rounded-full transition-colors"
        aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
      >
        <Heart
          className="w-4 h-4"
          fill={isWishlisted ? 'currentColor' : 'none'}
        />
      </button>

      <div className="p-4 flex-1 flex flex-col gap-3">
        <div>
          <Link href={`/product/${product.slug}`} className="block">
            <h3 className="font-semibold text-foreground text-sm line-clamp-2 group-hover:text-primary transition-colors cursor-pointer">
              {product.name}
            </h3>
          </Link>
          {product.description && (
            <p className="text-xs text-muted-foreground line-clamp-1 mt-1">
              {product.description}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-lg font-bold text-primary">
            {product.discount_price
              ? `Ã Â§Â³${product.discount_price}`
              : `Ã Â§Â³${product.price}`}
          </span>
          {product.discount_price && (
            <span className="text-sm text-muted-foreground line-through">
              Ã Â§Â³{product.price}
            </span>
          )}
        </div>

        <p className="text-xs text-muted-foreground">
          {product.stock_quantity > 0
            ? `${product.stock_quantity} in stock`
            : 'Out of stock'}
        </p>

        <Button
          onClick={async (e) => {
            e.preventDefault()
            if (isCartLoading || product.stock_quantity === 0) return
            setIsCartLoading(true)
            try {
              await addToCart({ productId: product.id, quantity: 1 })
              trackEvent('add_to_cart', { product_id: product.id, path: `/product/${product.slug}` })
              toast.success('Added to cart')
            } catch (error) {
              if (error instanceof CartAuthError) {
                toast.error(error.message)
                router.push('/auth/login')
                return
              }
              toast.error(error instanceof Error ? error.message : 'Failed to add to cart')
            } finally {
              setIsCartLoading(false)
            }
          }}
          disabled={product.stock_quantity === 0 || isCartLoading}
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground gap-2 mt-auto"
        >
          <ShoppingCart className="w-4 h-4" />
          <span>{isCartLoading ? 'Adding...' : 'Add to Cart'}</span>
        </Button>
      </div>
    </Card>
  )
}
