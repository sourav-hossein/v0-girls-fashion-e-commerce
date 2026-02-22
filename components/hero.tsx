import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-accent/5 to-secondary/10 py-20 sm:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            <div>
              <p className="text-primary font-semibold mb-2 uppercase tracking-widest text-sm">
                Welcome to Elegance
              </p>
              <h1 className="text-5xl sm:text-6xl font-serif font-bold text-foreground leading-tight mb-4">
                Premium Fashion Accessories
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed max-w-xl">
                Discover our exquisite collection of hijabs, earrings, bags, and more. Curated with elegance and style for the modern, fashionable you.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/shop">
                <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                  Shop Now
                </Button>
              </Link>
              <Link href="/shop">
                <Button size="lg" variant="outline" className="border-primary text-primary hover:bg-primary/5">
                  Browse Collection
                </Button>
              </Link>
            </div>

            {/* Trust Signals */}
            <div className="grid grid-cols-3 gap-4 pt-8 border-t border-border/50">
              <div>
                <p className="text-2xl font-bold text-primary">500+</p>
                <p className="text-sm text-muted-foreground">Products</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-accent">10k+</p>
                <p className="text-sm text-muted-foreground">Happy Customers</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-secondary">24/7</p>
                <p className="text-sm text-muted-foreground">Support</p>
              </div>
            </div>
          </div>

          {/* Right Image Placeholder */}
          <div className="hidden md:block">
            <div className="relative aspect-square rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/20 overflow-hidden flex items-center justify-center">
              <div className="text-center">
                <div className="text-6xl mb-4">✨</div>
                <p className="text-muted-foreground text-sm">Featured Collection Image</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent/5 rounded-full blur-3xl -z-10" />
    </section>
  )
}
