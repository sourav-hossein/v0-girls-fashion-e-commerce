import { Product } from '@/lib/types'
import ProductCard from './product-card'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

interface TrendingProductsProps {
  products: Product[]
}

export default function TrendingProducts({ products }: TrendingProductsProps) {
  return (
    <section className="py-16 bg-gradient-to-br from-primary/5 to-accent/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-end justify-between mb-12 gap-4">
          <div>
            <p className="text-accent font-semibold mb-2 uppercase tracking-widest text-sm">
              Hot Right Now
            </p>
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-foreground">
              Trending This Week
            </h2>
          </div>
          <Link href="/shop?trending=true">
            <Button variant="outline" className="border-accent text-accent hover:bg-accent/5">
              View All Trending
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
            <p className="text-muted-foreground">No trending products yet.</p>
          </div>
        )}
      </div>
    </section>
  )
}
