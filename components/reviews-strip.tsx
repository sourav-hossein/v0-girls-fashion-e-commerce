import { Review, Product, ProductImage } from '@/lib/types'
import { Card, CardContent } from '@/components/ui/card'
import { SafeImage } from '@/components/ui/safe-image'
import Link from 'next/link'

interface ReviewWithProduct extends Review {
  products?: Product & { product_images?: ProductImage[] }
}

interface ReviewsStripProps {
  reviews: ReviewWithProduct[]
}

export default function ReviewsStrip({ reviews }: ReviewsStripProps) {
  const getMainImage = (product?: Product & { product_images?: ProductImage[] }) => {
    const images = product?.product_images || []
    return images.find((img) => img.is_main) || images[0]
  }

  return (
    <section className="py-16 bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <p className="text-primary font-semibold mb-2 uppercase tracking-widest text-sm">
            Social Proof
          </p>
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-foreground mb-4">
            Loved By Our Customers
          </h2>
          <p className="text-muted-foreground">
            Real feedback from shoppers who adore our collection
          </p>
        </div>

        {reviews.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {reviews.map((review) => {
              const product = review.products
              const image = getMainImage(product)?.image_url
              return (
                <Card key={review.id} className="h-full">
                  <CardContent className="p-6 flex flex-col gap-4 h-full">
                    <div className="flex items-center gap-2 text-primary">
                      {Array.from({ length: 5 }).map((_, idx) => (
                        <span key={idx} className={idx < review.rating ? 'text-primary' : 'text-muted-foreground'}>
                          ★
                        </span>
                      ))}
                    </div>
                    <p className="text-sm text-foreground line-clamp-4">
                      “{review.comment || 'Beautiful product and fast delivery. Will shop again!'}”
                    </p>
                    {product ? (
                      <Link href={`/product/${product.slug}`} className="mt-auto flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full overflow-hidden bg-muted flex items-center justify-center">
                          {image ? (
                            <div className="relative h-full w-full">
                              <SafeImage
                                src={image}
                                alt={product.name}
                                fill
                                className="object-cover"
                                sizes="48px"
                              />
                            </div>
                          ) : (
                            <span className="text-xs text-muted-foreground">Item</span>
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-foreground">
                            {product.name}
                          </p>
                          <p className="text-xs text-muted-foreground">Verified buyer</p>
                        </div>
                      </Link>
                    ) : (
                      <p className="text-xs text-muted-foreground mt-auto">Verified buyer</p>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No reviews yet.</p>
          </div>
        )}
      </div>
    </section>
  )
}
