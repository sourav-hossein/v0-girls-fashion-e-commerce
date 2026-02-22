import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Product } from '@/lib/types'
import { AlertTriangle } from 'lucide-react'

interface LowStockProductsProps {
  products: Product[]
}

export default function LowStockProducts({ products }: LowStockProductsProps) {
  return (
    <Card className="border-border border-accent/30 bg-accent/5">
      <CardHeader className="border-b border-border pb-4">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-accent" />
          <CardTitle>Low Stock Alert</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-border">
          {products.length > 0 ? (
            products.map((product) => (
              <Link
                key={product.id}
                href={`/admin/products/${product.id}/edit`}
                className="p-4 hover:bg-accent/10 transition-colors flex items-center justify-between group"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground group-hover:text-accent transition-colors truncate text-sm">
                    {product.name}
                  </p>
                </div>
                <Badge variant="outline" className="border-accent/50 text-accent flex-shrink-0">
                  {product.stock_quantity} left
                </Badge>
              </Link>
            ))
          ) : (
            <div className="p-8 text-center text-muted-foreground text-sm">
              All products well stocked
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
