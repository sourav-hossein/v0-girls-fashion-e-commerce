import { Product, ProductImage } from '@/lib/types'
import ProductCard from './product-card'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

interface FlashSaleProps {
  products: (Product & { product_images?: ProductImage[] })[]
}

export default function FlashSale({ products }: FlashSaleProps) {
  const getMainImage = (product: Product & { product_images?: ProductImage[] }) => {
    const images = product.product_images || []
    return images.find((img) => img.is_main) || images[0]
  }

  return (
    <section className="py-16 bg-gradient-to-br from-accent/10 via-background to-primary/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-end justify-between mb-12 gap-4">
          <div>
            <p className="text-accent font-semibold mb-2 uppercase tracking-widest text-sm">
              Limited Time
            </p>
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-foreground">
              Flash Sale
            </h2>
          </div>
          <Link href="/shop?discounted=true">
            <Button variant="outline" className="border-accent text-accent hover:bg-accent/5">
              View All Deals
            </Button>
          </Link>
        </div>

        {products.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map((product) => (
              <div key={product.id} className="relative">
                <div className="absolute top-3 left-3 z-10 bg-accent text-accent-foreground text-xs font-semibold px-2 py-1 rounded-full">
                  Limited Time
                </div>
                <ProductCard
                  product={product}
                  image={getMainImage(product)?.image_url}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No flash deals right now.</p>
          </div>
        )}
      </div>
    </section>
  )
}
