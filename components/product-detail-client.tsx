'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Heart, ShoppingCart, Star, Truck, RefreshCw } from 'lucide-react'
import { Product, ProductImage, ProductVariant, Review } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'
import ProductCard from './product-card'
import { addToCart, CartAuthError } from '@/lib/cart-api'
import { trackEvent } from '@/lib/analytics-client'

interface ProductDetailClientProps {
  product: Product
  images: ProductImage[]
  variants: ProductVariant[]
  reviews: Review[]
  relatedProducts: (Product & { product_images?: ProductImage[] })[]
}

export default function ProductDetailClient({
  product,
  images,
  variants,
  reviews,
  relatedProducts,
}: ProductDetailClientProps) {
  const router = useRouter()
  const [quantity, setQuantity] = useState(1)
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null)
  const [selectedImageId, setSelectedImageId] = useState<string | null>(null)
  const [isWishlisted, setIsWishlisted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isWishlistLoading, setIsWishlistLoading] = useState(true)

  const mainImage = images.find(img => img.is_main) || images[0]
  const activeImage =
    images.find((img) => img.id === selectedImageId) || mainImage || images[0]
  const discount = product.discount_price
    ? Math.round(((product.price - product.discount_price) / product.price) * 100)
    : 0

  const groupedVariants = variants.reduce<Record<string, ProductVariant[]>>((acc, variant) => {
    const key = variant.variant_type || 'Variant'
    if (!acc[key]) acc[key] = []
    acc[key].push(variant)
    return acc
  }, {})

  const selectedVariant = selectedVariantId
    ? variants.find((variant) => variant.id === selectedVariantId)
    : undefined

  const availableStock = selectedVariant?.stock_quantity ?? product.stock_quantity

  useEffect(() => {
    trackEvent('product_view', { product_id: product.id, path: `/product/${product.slug}` })
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
    if (variants.length > 0 && !selectedVariantId) {
      toast.error('Please select a variant')
      return
    }

    setIsLoading(true)
    try {
      await addToCart({
        productId: product.id,
        variantId: selectedVariant?.id ?? null,
        quantity,
      })
      trackEvent('add_to_cart', { product_id: product.id, path: `/product/${product.slug}` })
      toast.success('Added to cart!')
    } catch (error) {
      if (error instanceof CartAuthError) {
        toast.error(error.message)
        router.push('/auth/login')
        return
      }
      toast.error(error instanceof Error ? error.message : 'Failed to add to cart')
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

  const getMainImage = (item: Product & { product_images?: ProductImage[] }) => {
    const gallery = item.product_images || []
    return gallery.find((img) => img.is_main) || gallery[0]
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
        {/* Images */}
        <div className="space-y-4">
          <div className="aspect-square bg-muted rounded-2xl overflow-hidden flex items-center justify-center">
            {
              <img
                src={activeImage?.image_url || "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAKwAAACUCAMAAAA5xjIqAAAA3lBMVEX////x7+Lf3dA7g4JNo6Tp6ens7Ozy8vJfX2FFR0h6fHxISUxqamvg39Xj4dQ5OTvX1ck/PkCCgn8yMjUoKS1MmptCe3rTpUdiYmH1u1BxcnHttk9NTlBBjIvx7uUwfn48nJ2trqqhoJ3Q0c0eHiK+vr7d3dxWV1bIyMGMjI7Bv7b16c315sP026rtu1nbvnvzzYrTnznSplHXrmLhxIznyojwwGjwxnn07tj1uETp1qzR2tGFraZVjYihvLdil5K6y8PK4dqOwb9srauy0srf6uFSXmA6S0xAampVdndhYC+IAAADS0lEQVR4nO3ai1aiQBzH8bhsRsQgYalFo922m12strVQUsq2ff8X2oEUUUeZzpmBcc//+wSffmcc8cTaGgRBEARBEARBEARBEARBEARBEATxrnS4zdwmc0frIqzHjm0YhsOWW2HKdd3KySl/688z0/MMZ2OPqa0aS17Fjv6yY+7YI8fzzLNzjJXssKKWWVLPz1zHqVzwtpa2Dc+sMUC/QipTCNdsx67xPralTcNzLnljVXRJsBsisBtl/thyzRaCNbYs7li1vOWuElbMsiZgAQtYwAIWsP8LFitXrSuF8ogrI/b6pr5frd5erQC2c/dcj7Dt+5b0WHxXr8fYavWhIzu29Zxg249YcuyvCbZ6L/my+Kk+wbY7cmOVVcLi36uEvU59wB4kP7NK52aCfWHBImRZCBWDVV5uxthHJRuL/K7WaPSCgrBK6+n5eb/dnrdSsMh/bWga4XZRMVilc333dPs4/2hAWza2RvVRMVjaAxcNa6moO7Y2XgtadmGzy06sRJueVkIs6muTpqaVDztlJdoAyYtFvtaY1vrFYTN+1owuLfq0smHV7oxV03o+KgpLGgThANOx1rxVa3StwrDDsEkKMQ2LgnkrybcKwg7fmjqpGVKwMxfB5PpCxWAH+qiUdkSxUL9HxSbfDDljg6ae9D677NxFkPRawLI4TFn15nAaixZaNe3r+soPi8fHNeltmMbSLoLkHPT8nJf1m9NWvTnSxliLfhGMtUG+2PcZaqxNsChYQo2ycsGO/jUezlEjbRB9o0VYf9mu0bTRb4aclp09romWXAmYMPyDjGHj3wz5YAdUadwgWnbxpZWaVkW5YN8XW3V9qCC05CJIT5sDdhjSj8BEy2QlX7risYuOa1K49NJKafuqaOxAz7DqevaH6wvbswRjlx7X72HJZ2xPJDbruH4Pq+1+CMRmHtfvYv+IeaGHYLHPZpUCS3kYkBTr1bqsVgmwHzusVgmwngisIQhr7vLHfjqiljUPeGPJsAKwaxeOR7R/d9jSdpn6jF8M3izxxp6SZSMuW47NVPwWc+WQt5VM65oec4xvW0ed7HEflnTkOYy7mqbtsmZzfy951PoP/gmiQhAEQRAEQRAEQRAEQRAEQRAEQdz7B8uxwA5hpAHmAAAAAElFTkSuQmCC"}
                alt={activeImage?.alt_text || product.name}
                className="w-full h-full object-cover"
              />
            }
          </div>
          {images.length > 1 && (
            <div className="grid grid-cols-4 gap-3">
              {images.slice(0, 4).map((image) => (
                <button
                  key={image.id}
                  onClick={() => setSelectedImageId(image.id)}
                  className={`aspect-square bg-muted rounded-lg overflow-hidden cursor-pointer border-2 transition-colors ${
                    activeImage?.id === image.id
                      ? 'border-primary'
                      : 'border-transparent hover:border-primary/50'
                  }`}
                >
                  <img
                    src={image.image_url}
                    alt={image.alt_text || product.name}
                    className="w-full h-full object-cover"
                  />
                </button>
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
                {product.discount_price || product.price}
              </span>
              {product.discount_price && (
                <>
                  <span className="text-xl text-muted-foreground line-through">
                    {product.price}
                  </span>
                  <span className="text-lg font-bold text-accent">
                    Save {discount}%
                  </span>
                </>
              )}
            </div>
            <p className={`text-sm font-semibold ${
              availableStock > 0
                ? 'text-green-600 dark:text-green-400'
                : 'text-red-600 dark:text-red-400'
            }`}>
              {availableStock > 0
                ? `${availableStock} in stock`
                : 'Out of stock'}
            </p>
          </div>

          {/* Variants */}
          {Object.entries(groupedVariants).map(([variantType, variantList]) => (
            <div key={variantType}>
              <h3 className="font-semibold text-foreground mb-3">
                {variantType.charAt(0).toUpperCase() + variantType.slice(1)}
              </h3>
              <div className="flex gap-3 flex-wrap">
                {variantList.map((variant) => (
                  <button
                    key={variant.id}
                    onClick={() => setSelectedVariantId(variant.id)}
                    className={`px-4 py-2 rounded-lg border-2 transition-colors font-medium ${
                      selectedVariantId === variant.id
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border text-foreground hover:border-primary/50'
                    }`}
                  >
                    {variant.variant_value}
                  </button>
                ))}
              </div>
            </div>
          ))}

          {/* Quantity */}
          <div>
            <h3 className="font-semibold text-foreground mb-3">Quantity</h3>
            <div className="flex items-center gap-3 w-fit border border-border rounded-lg p-1">
              <Button 
                variant={'ghost'}
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="px-4 py-2 hover:bg-muted transition-colors cursor-pointer"
              >
                -
              </Button>
              <span className="px-4 py-2 font-semibold">{quantity}</span>
              <Button
                variant={'ghost'}
                onClick={() =>
                  setQuantity(Math.min(Math.max(availableStock, 1), quantity + 1))
                }
                className="px-4 py-2 hover:bg-muted transition-colors"
              >
                +
              </Button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              onClick={handleAddToCart}
              disabled={availableStock === 0 || isLoading}
              className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground gap-2 h-12 cursor-pointer"
            >
              <ShoppingCart className="w-5 h-5" />
              Add to Cart
            </Button>
            <Button
              onClick={handleAddToWishlist}
              variant="outline"
              disabled={isWishlistLoading}
              aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
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
                {availableStock} units available
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
                image={getMainImage(relatedProduct)?.image_url}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
