'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Heart, ShoppingCart, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { toast } from 'sonner'
import { addToCart, CartAuthError } from '@/lib/cart-api'

interface WishlistItem {
  id: string
  product_id: string
  added_at: string
  product: {
    id: string
    name: string
    slug: string
    price: number
    discount_price?: number
  } | null
}

export default function WishlistClient() {
  const router = useRouter()
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadWishlist = async () => {
      try {
        const response = await fetch('/api/wishlist')
        if (response.status === 401) {
          setWishlistItems([])
          return
        }
        const data = await response.json()
        if (!response.ok) {
          throw new Error(data.error || 'Failed to load wishlist')
        }
        setWishlistItems(data || [])
      } catch (error: any) {
        toast.error(error.message || 'Failed to load wishlist')
      } finally {
        setIsLoading(false)
      }
    }

    loadWishlist()
  }, [])

  const handleRemoveFromWishlist = async (productId: string) => {
    try {
      const response = await fetch(`/api/wishlist?product_id=${productId}`, {
        method: 'DELETE',
      })
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || 'Failed to remove from wishlist')
      }
      setWishlistItems((items) => items.filter((item) => item.product_id !== productId))
      toast.success('Removed from wishlist')
    } catch (error: any) {
      toast.error(error.message || 'Failed to remove from wishlist')
    }
  }

  const handleAddToCart = async (productId: string, productName: string) => {
    try {
      await addToCart({ productId, quantity: 1 })
      toast.success(`Added ${productName} to cart!`)
    } catch (error) {
      if (error instanceof CartAuthError) {
        toast.error(error.message)
        router.push('/auth/login')
        return
      }
      toast.error(error instanceof Error ? error.message : 'Failed to add to cart')
    }
  }

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="h-96 flex items-center justify-center">
          <p className="text-muted-foreground">Loading wishlist...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-serif font-bold text-foreground mb-8">
        My Wishlist
      </h1>

      {wishlistItems.length === 0 ? (
        <Card className="border-border">
          <CardContent className="p-12 text-center">
            <Heart className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-serif font-bold text-foreground mb-2">
              Your wishlist is empty
            </h2>
            <p className="text-muted-foreground mb-6">
              Add items to your wishlist to keep track of your favorites
            </p>
            <Link href="/shop">
              <Button className="bg-primary hover:bg-primary/90 gap-2">
                <ArrowRight className="w-4 h-4" />
                Start Shopping
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {wishlistItems.map((item) => {
            if (!item.product) return null
            const discount = item.product.discount_price
              ? Math.round(((item.product.price - item.product.discount_price) / item.product.price) * 100)
              : 0

            return (
              <Card key={item.id} className="border-border overflow-hidden hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center">
                    {/* Product Image */}
                    <div className="w-24 h-24 bg-muted rounded-lg flex-shrink-0 flex items-center justify-center">
                      <span className="text-3xl">ðŸ›ï¸</span>
                    </div>

                    {/* Product Details */}
                    <div className="flex-1 min-w-0">
                      <Link href={`/product/${item.product.slug}`}>
                        <h3 className="font-semibold text-lg text-foreground hover:text-primary transition-colors truncate">
                          {item.product.name}
                        </h3>
                      </Link>

                      {/* Pricing */}
                      <div className="flex items-baseline gap-2 mt-2">
                        <span className="text-xl font-bold text-primary">
                          à§³{item.product.discount_price || item.product.price}
                        </span>
                        {item.product.discount_price && (
                          <>
                            <span className="text-sm text-muted-foreground line-through">
                              à§³{item.product.price}
                            </span>
                            <span className="text-sm font-bold text-accent">
                              Save {discount}%
                            </span>
                          </>
                        )}
                      </div>

                      {/* Added Date */}
                      <p className="text-xs text-muted-foreground mt-2">
                        Added {new Date(item.added_at).toLocaleDateString()}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 w-full sm:w-auto">
                      <Button
                        onClick={() => handleAddToCart(item.product.id, item.product.name)}
                        className="flex-1 sm:flex-none bg-primary hover:bg-primary/90 text-primary-foreground gap-2"
                      >
                        <ShoppingCart className="w-4 h-4" />
                        <span className="hidden sm:inline">Add to Cart</span>
                      </Button>
                      <button
                        onClick={() => handleRemoveFromWishlist(item.product_id)}
                        className="p-2 hover:bg-destructive/10 text-destructive rounded-lg transition-colors"
                        aria-label="Remove from wishlist"
                      >
                        <Heart className="w-5 h-5 fill-destructive" />
                      </button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}

          {/* Summary */}
          <div className="mt-8 p-6 bg-primary/5 border border-primary/20 rounded-lg">
            <p className="text-center text-foreground">
              You have <span className="font-bold">{wishlistItems.length}</span> item
              {wishlistItems.length !== 1 ? 's' : ''} in your wishlist
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
