import Link from 'next/link'
import { Category } from '@/lib/types'
import { Card, CardContent } from '@/components/ui/card'

interface CategoriesSectionProps {
  categories: Category[]
}

const defaultCategories = [



{id: 1, name: 'Combo Offers', slug: 'combo-offers', description: 'Special bundle deals for great value', image_url: 'https://images.unsplash.com/photo-1599643478500-0df5b4d1e5d9?w=500&h=500&fit=crop'},

{id: 2, name: 'Earrings', slug: 'earrings', description: 'Beautiful and elegant earrings for every occasion', image_url: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=500&h=500&fit=crop'},

{id:3, name: 'Hair Accessories', slug: 'hair-accessories', description: 'Trendy hair clips, pins, and accessories', image_url: 'https://images.unsplash.com/photo-1599643478169-fc1c0df1820f?w=500&h=500&fit=crop'},

{id: 4, name: 'Handbags', slug: 'handbags', description: 'Stylish and practical handbags for daily use', image_url: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=500&h=500&fit=crop'},

{id: 5, name: 'Hijabs', slug: 'hijabs', description: 'Premium quality hijabs in various styles and colors', image_url: 'https://images.unsplash.com/photo-1505252585461-04db1c2a2e5d?w=500&h=500&fit=crop'},

{id: 6, name: 'Rings', slug: 'rings', description: 'Elegant rings for every style and occasion', image_url: 'https://images.unsplash.com/photo-1599643478511-b0d5eb73b4d5?w=500&h=500&fit=crop'}

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
      </div>
    </section>
  )
}
