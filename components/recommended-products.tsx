import { Product, ProductImage } from '@/lib/types'
import ProductCard from './product-card'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

interface RecommendedProductsProps {
  title: string
  subtitle?: string
  products: (Product & { product_images?: ProductImage[] })[]
  ctaLabel?: string
  ctaHref?: string
}

export default function RecommendedProducts({
  title,
  subtitle,
  products,
  ctaLabel,
  ctaHref,
}: RecommendedProductsProps) {
  const getMainImage = (product: Product & { product_images?: ProductImage[] }) => {
    const images = product.product_images || []
    return images.find((img) => img.is_main) || images[0]
  }

  return (
    <section className="py-16 bg-gradient-to-br from-secondary/10 via-background to-accent/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-end justify-between mb-12 gap-4">
          <div>
            <p className="text-secondary font-semibold mb-2 uppercase tracking-widest text-sm">
              Personalized
            </p>
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-foreground">
              {title}
            </h2>
            {subtitle && (
              <p className="text-muted-foreground mt-2">
                {subtitle}
              </p>
            )}
          </div>
          {ctaLabel && ctaHref ? (
            <Link href={ctaHref}>
              <Button variant="outline" className="border-secondary text-secondary hover:bg-secondary/5">
                {ctaLabel}
              </Button>
            </Link>
          ) : null}
        </div>

        {products.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                image={getMainImage(product)?.image_url}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No personalized products yet.</p>
          </div>
        )}
      </div>
    </section>
  )
}
