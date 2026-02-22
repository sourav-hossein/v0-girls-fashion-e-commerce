import Link from 'next/link'
import { Category } from '@/lib/types'
import { Card, CardContent } from '@/components/ui/card'

interface CategoriesSectionProps {
  categories: Category[]
}

const defaultCategories = [
  { id: '1', name: 'Earrings', slug: 'earrings', icon: '💎' },
  { id: '2', name: 'Hijabs', slug: 'hijabs', icon: '🧕' },
  { id: '3', name: 'Handbags', slug: 'bags', icon: '👜' },
  { id: '4', name: 'Hair Clips', slug: 'hair-clips', icon: '✨' },
  { id: '5', name: 'Rings', slug: 'rings', icon: '💍' },
  { id: '6', name: 'Bracelets', slug: 'bracelets', icon: '⌚' },
  { id: '7', name: 'Combo Offers', slug: 'combos', icon: '🎁' },
  { id: '8', name: 'New Arrivals', slug: 'new', icon: '⭐' },
]

export default function CategoriesSection({ categories }: CategoriesSectionProps) {
  const displayCategories = categories.length > 0 ? categories : defaultCategories

  return (
    <section className="py-16 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-foreground mb-4">
            Explore Categories
          </h2>
          <p className="text-muted-foreground">
            Find exactly what you're looking for
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {displayCategories.map((category) => (
            <Link
              key={category.id}
              href={`/shop?category=${category.slug}`}
            >
              <Card className="cursor-pointer hover:shadow-lg hover:border-primary/50 transition-all duration-300 h-full group overflow-hidden">
                <CardContent className="p-6 flex flex-col items-center justify-center text-center gap-3 h-full">
                  <div className="text-4xl group-hover:scale-110 transition-transform duration-300">
                    {categories.length > 0 ? '🛍️' : (displayCategories.find(c => c.slug === category.slug) as any)?.icon || '✨'}
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground text-sm sm:text-base group-hover:text-primary transition-colors">
                      {category.name}
                    </h3>
                    {category.description && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {category.description}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
