import Link from 'next/link'
import { Category } from '@/lib/types'
import { Card, CardContent } from '@/components/ui/card'

interface CategoriesSectionProps {
  categories: Category[]
}

export default function CategoriesSection({ categories }: CategoriesSectionProps) {
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

        {categories.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/shop?category=${category.slug}`}
              >
                <Card className="cursor-pointer hover:shadow-lg hover:border-primary/50 transition-all duration-300 h-full group overflow-hidden">
                  <CardContent className="p-6 flex flex-col items-center justify-center text-center gap-3 h-full">
                    <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full overflow-hidden">
                      <img
                        src={category.image_url || 'https://via.placeholder.com/150'}
                        alt={category.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
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
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No categories available yet.</p>
          </div>
        )}
      </div>
    </section>
  )
}
