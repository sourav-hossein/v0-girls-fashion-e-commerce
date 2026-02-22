import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Order } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'

interface RecentOrdersProps {
  orders: Order[]
}

export default function RecentOrders({ orders }: RecentOrdersProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-200'
      case 'confirmed':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-200'
      case 'shipped':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-200'
      case 'delivered':
        return 'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-200'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-950 dark:text-gray-200'
    }
  }

  return (
    <Card className="border-border">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 border-b border-border pb-4">
        <CardTitle>Recent Orders</CardTitle>
        <Link href="/admin/orders">
          <Button variant="outline" size="sm" className="gap-2">
            View All
            <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-border">
          {orders.length > 0 ? (
            orders.map((order) => (
              <Link
                key={order.id}
                href={`/admin/orders/${order.id}`}
                className="p-4 hover:bg-muted/50 transition-colors flex items-center justify-between group"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                    {order.order_number}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    ৳{order.total_amount}
                  </p>
                </div>
                <Badge className={getStatusColor(order.status)}>
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </Badge>
              </Link>
            ))
          ) : (
            <div className="p-8 text-center text-muted-foreground">
              No recent orders
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
