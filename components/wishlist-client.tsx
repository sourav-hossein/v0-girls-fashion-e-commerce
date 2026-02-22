'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Heart, ShoppingCart, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { toast } from 'sonner'

interface WishlistItem {
  id: string
  productId: string
  productName: string
  price: number
  discountPrice?: number
  image?: string
  addedAt: string
}

export default function WishlistClient() {
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // In a real app, fetch wishlist items from database
    setIsLoading(false)
  }, [])

  const handleRemoveFromWishlist = (id: string) => {
    setWishlistItems(wishlistItems.filter((item) => item.id !== id))
    toast.success('Removed from wishlist')
  }

  const handleAddToCart = (productName: string) => {
    toast.success(`Added ${productName} to cart!`)
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
            const discount = item.discountPrice
              ? Math.round(((item.price - item.discountPrice) / item.price) * 100)
              : 0

            return (
              <Card key={item.id} className="border-border overflow-hidden hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center">
                    {/* Product Image */}
                    <div className="w-24 h-24 bg-muted rounded-lg flex-shrink-0 flex items-center justify-center">
                      <span className="text-3xl">🛍️</span>
                    </div>

                    {/* Product Details */}
                    <div className="flex-1 min-w-0">
                      <Link href={`/product/${item.productName.toLowerCase()}`}>
                        <h3 className="font-semibold text-lg text-foreground hover:text-primary transition-colors truncate">
                          {item.productName}
                        </h3>
                      </Link>
                      
                      {/* Pricing */}
                      <div className="flex items-baseline gap-2 mt-2">
                        <span className="text-xl font-bold text-primary">
                          ৳{item.discountPrice || item.price}
                        </span>
                        {item.discountPrice && (
                          <>
                            <span className="text-sm text-muted-foreground line-through">
                              ৳{item.price}
                            </span>
                            <span className="text-sm font-bold text-accent">
                              Save {discount}%
                            </span>
                          </>
                        )}
                      </div>

                      {/* Added Date */}
                      <p className="text-xs text-muted-foreground mt-2">
                        Added {new Date(item.addedAt).toLocaleDateString()}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 w-full sm:w-auto">
                      <Button
                        onClick={() => handleAddToCart(item.productName)}
                        className="flex-1 sm:flex-none bg-primary hover:bg-primary/90 text-primary-foreground gap-2"
                      >
                        <ShoppingCart className="w-4 h-4" />
                        <span className="hidden sm:inline">Add to Cart</span>
                      </Button>
                      <button
                        onClick={() => handleRemoveFromWishlist(item.id)}
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
