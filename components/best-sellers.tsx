import { Product, ProductImage } from '@/lib/types'
import ProductCard from './product-card'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

interface BestSellersProps {
  products: (Product & { product_images?: ProductImage[] })[]
}

export default function BestSellers({ products }: BestSellersProps) {
  const getMainImage = (product: Product & { product_images?: ProductImage[] }) => {
    const images = product.product_images || []
    return images.find((img) => img.is_main) || images[0]
  }

  return (
    <section className="py-16 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-end justify-between mb-12 gap-4">
          <div>
            <p className="text-primary font-semibold mb-2 uppercase tracking-widest text-sm">
              Loved By Customers
            </p>
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-foreground">
              Best Sellers
            </h2>
          </div>
          <Link href="/shop?sort=best-sellers">
            <Button variant="outline" className="border-primary text-primary hover:bg-primary/5">
              View All
            </Button>
          </Link>
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
            <p className="text-muted-foreground">No best sellers yet.</p>
          </div>
        )}
      </div>
    </section>
  )
}
