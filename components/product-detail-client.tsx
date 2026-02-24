'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Heart, ShoppingCart, Star, Truck, RefreshCw } from 'lucide-react'
import { Product, ProductImage, ProductVariant, Review } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'
import ProductCard from './product-card'

interface ProductDetailClientProps {
  product: Product
  images: ProductImage[]
  variants: ProductVariant[]
  reviews: Review[]
  relatedProducts: Product[]
}

export default function ProductDetailClient({
  product,
  images,
  variants,
  reviews,
  relatedProducts,
}: ProductDetailClientProps) {
  const [quantity, setQuantity] = useState(1)
  const [selectedColor, setSelectedColor] = useState<string>('')
  const [selectedSize, setSelectedSize] = useState<string>('')
  const [isWishlisted, setIsWishlisted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isWishlistLoading, setIsWishlistLoading] = useState(true)

  const mainImage = images.find(img => img.is_main) || images[0]
  const discount = product.discount_price
    ? Math.round(((product.price - product.discount_price) / product.price) * 100)
    : 0

  const colorVariants = variants.filter(v => v.variant_type === 'color')
  const sizeVariants = variants.filter(v => v.variant_type === 'size')

  useEffect(() => {
    const loadWishlistState = async () => {
      try {
        const response = await fetch('/api/wishlist')
        if (response.status === 401) {
          setIsWishlisted(false)
          return
        }
        const data = await response.json()
        if (response.ok && Array.isArray(data)) {
          const exists = data.some((item: { product_id: string }) => item.product_id === product.id)
          setIsWishlisted(exists)
        }
      } catch {
        setIsWishlisted(false)
      } finally {
        setIsWishlistLoading(false)
      }
    }

    loadWishlistState()
  }, [product.id])

  const handleAddToCart = async () => {
    setIsLoading(true)
    try {
      // Cart functionality will be implemented with proper auth
      toast.success('Added to cart!')
    } catch (error) {
      toast.error('Failed to add to cart')
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddToWishlist = async () => {
    if (isWishlistLoading) return
    try {
      if (isWishlisted) {
        const response = await fetch(`/api/wishlist?product_id=${product.id}`, {
          method: 'DELETE',
        })
        const data = await response.json()
        if (!response.ok) {
          throw new Error(data.error || 'Failed to remove from wishlist')
        }
        setIsWishlisted(false)
        toast.success('Removed from wishlist')
        return
      }

      const response = await fetch('/api/wishlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product_id: product.id }),
      })
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || 'Failed to add to wishlist')
      }
      setIsWishlisted(true)
      toast.success('Added to wishlist')
    } catch (error: any) {
      toast.error(error.message || 'Wishlist action failed')
    }
  }

  const averageRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : 0

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
        {/* Images */}
        <div className="space-y-4">
          <div className="aspect-square bg-muted rounded-2xl overflow-hidden flex items-center justify-center">
            <div className="text-6xl">🛍️</div>
          </div>
          {images.length > 1 && (
            <div className="grid grid-cols-4 gap-3">
              {images.slice(0, 4).map((image, idx) => (
                <div
                  key={idx}
                  className="aspect-square bg-muted rounded-lg overflow-hidden cursor-pointer hover:border-primary border-2 border-transparent transition-colors flex items-center justify-center"
                >
                  <span className="text-2xl">📷</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-3xl sm:text-4xl font-serif font-bold text-foreground mb-2">
              {product.name}
            </h1>
            {product.description && (
              <p className="text-muted-foreground text-lg">{product.description}</p>
            )}
          </div>

          {/* Rating */}
          {reviews.length > 0 && (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < Math.round(Number(averageRating))
                        ? 'fill-accent text-accent'
                        : 'text-muted'
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-muted-foreground">
                {averageRating} ({reviews.length} reviews)
              </span>
            </div>
          )}

          {/* Pricing */}
          <div className="space-y-2">
            <div className="flex items-baseline gap-3">
              <span className="text-4xl font-bold text-primary">
                ৳{product.discount_price || product.price}
              </span>
              {product.discount_price && (
                <>
                  <span className="text-xl text-muted-foreground line-through">
                    ৳{product.price}
                  </span>
                  <span className="text-lg font-bold text-accent">
                    Save {discount}%
                  </span>
                </>
              )}
            </div>
            <p className={`text-sm font-semibold ${
              product.stock_quantity > 0
                ? 'text-green-600 dark:text-green-400'
                : 'text-red-600 dark:text-red-400'
            }`}>
              {product.stock_quantity > 0
                ? `${product.stock_quantity} in stock`
                : 'Out of stock'}
            </p>
          </div>

          {/* Variants */}
          {colorVariants.length > 0 && (
            <div>
              <h3 className="font-semibold text-foreground mb-3">Color</h3>
              <div className="flex gap-3 flex-wrap">
                {colorVariants.map((variant) => (
                  <button
                    key={variant.id}
                    onClick={() => setSelectedColor(variant.variant_value)}
                    className={`px-4 py-2 rounded-lg border-2 transition-colors font-medium ${
                      selectedColor === variant.variant_value
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border text-foreground hover:border-primary/50'
                    }`}
                  >
                    {variant.variant_value}
                  </button>
                ))}
              </div>
            </div>
          )}

          {sizeVariants.length > 0 && (
            <div>
              <h3 className="font-semibold text-foreground mb-3">Size</h3>
              <div className="flex gap-3 flex-wrap">
                {sizeVariants.map((variant) => (
                  <button
                    key={variant.id}
                    onClick={() => setSelectedSize(variant.variant_value)}
                    className={`px-4 py-2 rounded-lg border-2 transition-colors font-medium ${
                      selectedSize === variant.variant_value
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border text-foreground hover:border-primary/50'
                    }`}
                  >
                    {variant.variant_value}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity */}
          <div>
            <h3 className="font-semibold text-foreground mb-3">Quantity</h3>
            <div className="flex items-center gap-3 w-fit border border-border rounded-lg p-1">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="px-4 py-2 hover:bg-muted transition-colors"
              >
                −
              </button>
              <span className="px-4 py-2 font-semibold">{quantity}</span>
              <button
                onClick={() =>
                  setQuantity(Math.min(product.stock_quantity, quantity + 1))
                }
                className="px-4 py-2 hover:bg-muted transition-colors"
              >
                +
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              onClick={handleAddToCart}
              disabled={product.stock_quantity === 0 || isLoading}
              className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground gap-2 h-12"
            >
              <ShoppingCart className="w-5 h-5" />
              <span>Add to Cart</span>
            </Button>
            <Button
              onClick={handleAddToWishlist}
              variant="outline"
              disabled={isWishlistLoading}
              className="px-6 h-12 border-border"
            >
              <Heart
                className="w-5 h-5"
                fill={isWishlisted ? 'currentColor' : 'none'}
              />
            </Button>
          </div>

          {/* Shipping Info */}
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
            <div className="flex gap-3">
              <Truck className="w-5 h-5 text-primary flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold text-foreground">Free Shipping</p>
                <p className="text-xs text-muted-foreground">Inside Dhaka</p>
              </div>
            </div>
            <div className="flex gap-3">
              <RefreshCw className="w-5 h-5 text-primary flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold text-foreground">Easy Returns</p>
                <p className="text-xs text-muted-foreground">30-day return</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="description" className="mb-16">
        <TabsList className="grid w-full grid-cols-3 mb-8">
          <TabsTrigger value="description">Description</TabsTrigger>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="reviews">Reviews ({reviews.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="description" className="space-y-4">
          <p className="text-foreground leading-relaxed">
            {product.description || 'No description available.'}
          </p>
        </TabsContent>

        <TabsContent value="details" className="space-y-4">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-foreground mb-2">Product ID</h4>
              <p className="text-sm text-muted-foreground">{product.id}</p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2">Category</h4>
              <p className="text-sm text-muted-foreground">Fashion Accessories</p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2">Stock</h4>
              <p className="text-sm text-muted-foreground">
                {product.stock_quantity} units available
              </p>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="reviews" className="space-y-6">
          {reviews.length > 0 ? (
            <div className="space-y-4">
              {reviews.map((review) => (
                <div
                  key={review.id}
                  className="p-4 border border-border rounded-lg"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < review.rating
                              ? 'fill-accent text-accent'
                              : 'text-muted'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {review.rating} out of 5
                    </span>
                  </div>
                  {review.comment && (
                    <p className="text-foreground">{review.comment}</p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-8">
              No reviews yet. Be the first to review this product!
            </p>
          )}
        </TabsContent>
      </Tabs>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section>
          <h2 className="text-3xl font-serif font-bold text-foreground mb-8">
            Related Products
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {relatedProducts.map((relatedProduct) => (
              <ProductCard
                key={relatedProduct.id}
                product={relatedProduct}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
