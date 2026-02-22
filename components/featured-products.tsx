import { Product } from '@/lib/types'
import ProductCard from './product-card'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

interface FeaturedProductsProps {
  products: Product[]
}

export default function FeaturedProducts({ products }: FeaturedProductsProps) {
  return (
    <section className="py-16 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-end justify-between mb-12 gap-4">
          <div>
            <p className="text-primary font-semibold mb-2 uppercase tracking-widest text-sm">
              Collection
            </p>
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-foreground">
              Featured Products
            </h2>
          </div>
          <Link href="/shop?featured=true">
            <Button variant="outline" className="border-primary text-primary hover:bg-primary/5">
              View All
            </Button>
          </Link>
        </div>

        {products.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No featured products yet.</p>
          </div>
        )}
      </div>
    </section>
  )
}
