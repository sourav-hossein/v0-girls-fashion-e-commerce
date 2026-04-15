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
import { useT } from '@/hooks/use-t'

interface ProductCardProps {
  product: Product
  image?: string
}

export default function ProductCard({ product, image }: ProductCardProps) {
  const { t } = useT()
  const router = useRouter()
  const [isWishlisted, setIsWishlisted] = useState(false)
  const [isWishlistLoading, setIsWishlistLoading] = useState(false)
  const [isCartLoading, setIsCartLoading] = useState(false)
  const discount = product.discount_price
    ? Math.round(((product.price - product.discount_price) / product.price) * 100)
    : 0

  const getMockImage = (slug: string) => {
    if (slug.includes('hijab')) return '/images/hijab_product_1776280418363.png'
    if (slug.includes('bag')) return '/images/handbag_product_1776280436394.png'
    if (slug.includes('bracelet') || slug.includes('earring') || slug.includes('ring')) return '/images/bracelet_product_1776280450787.png'
    if (slug.includes('dress') || slug.includes('combo')) return '/images/dress_product_1776280403083.png'
    return '/images/dress_product_1776280403083.png'
  }

  // Use DB image iff it's not unsplash since they might be random or broken. Otherwise use our tailored mock images.
  const displayImage = image && !image.includes('unsplash') ? image : getMockImage(product.slug)

  return (
    <Card className="hover:shadow-2xl hover:shadow-primary/20 transition-all duration-500 overflow-hidden group h-full flex flex-col relative glass border-white/50">
      <Link href={`/product/${product.slug}`} className="block">
        <div className="relative aspect-square overflow-hidden bg-muted cursor-pointer">
          {displayImage ? (
            <img
              src={displayImage}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
              <span className="text-4xl">*</span>
            </div>
          )}

          {discount > 0 && (
            <div className="absolute top-3 right-3 bg-accent text-accent-foreground px-2 py-1 rounded-lg text-xs font-semibold">
              -{discount}%
            </div>
          )}

          {product.stock_quantity === 0 && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <p className="text-white font-semibold">{t('product.outOfStock')}</p>
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
                throw new Error(data.error || t('product.wishlistUpdateFailed'))
              }
              setIsWishlisted(nextState)
              toast.success(nextState ? t('product.addedToWishlist') : t('product.removedFromWishlist'))
            })
            .catch((error) => {
              toast.error(error.message || t('product.wishlistUpdateFailed'))
            })
            .finally(() => {
              setIsWishlistLoading(false)
            })
        }}
        disabled={isWishlistLoading}
        className="absolute top-3 left-3 z-10 p-2 bg-white/90 hover:bg-primary hover:text-primary-foreground rounded-full transition-colors"
        aria-label={isWishlisted ? t('common.removeFromWishlist') : t('common.addToWishlist')}
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
              ? `৳${product.discount_price}`
              : `৳${product.price}`}
          </span>
          {product.discount_price && (
            <span className="text-sm text-muted-foreground line-through">
              ৳{product.price}
            </span>
          )}
        </div>

        <p className="text-xs text-muted-foreground">
          {product.stock_quantity > 0
            ? `${product.stock_quantity} ${t('product.inStock')}`
            : t('product.outOfStock')}
        </p>

        <Button
          onClick={async (e) => {
            e.preventDefault()
            if (isCartLoading || product.stock_quantity === 0) return
            setIsCartLoading(true)
            try {
              await addToCart({ productId: product.id, quantity: 1 })
              trackEvent('add_to_cart', { product_id: product.id, path: `/product/${product.slug}` })
              toast.success(t('product.addedToCart'))
            } catch (error) {
              if (error instanceof CartAuthError) {
                toast.error(error.message)
                router.push('/auth/login')
                return
              }
              toast.error(error instanceof Error ? error.message : t('product.addToCartFailed'))
            } finally {
              setIsCartLoading(false)
            }
          }}
          disabled={product.stock_quantity === 0 || isCartLoading}
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground gap-2 mt-auto"
        >
          <ShoppingCart className="w-4 h-4" />
          <span>{isCartLoading ? t('common.adding') : t('common.addToCart')}</span>
        </Button>
      </div>
    </Card>
  )
}
