'use client'

import Link from 'next/link'
import { Order } from '@/lib/types'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ArrowRight, Package } from 'lucide-react'
import { useT } from '@/hooks/use-t'

interface UserOrdersListProps {
  orders: Order[]
}

export default function UserOrdersList({ orders }: UserOrdersListProps) {
  const { t } = useT()

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

  if (orders.length === 0) {
    return (
      <Card className="border-border">
        <CardContent className="p-12 text-center">
          <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-serif font-bold text-foreground mb-2">
            {t('orders.noOrdersTitle')}
          </h2>
          <p className="text-muted-foreground mb-6">
            {t('orders.noOrdersBody')}
          </p>
          <Link href="/shop">
            <Button className="bg-primary hover:bg-primary/90 gap-2">
              <ArrowRight className="w-4 h-4" />
              {t('common.continueShopping')}
            </Button>
          </Link>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {orders.map((order) => (
        <Card key={order.id} className="border-border hover:shadow-lg transition-shadow overflow-hidden">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex-1">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                  <div>
                    <h3 className="font-semibold text-lg text-foreground">
                      {t('orders.orderNumber')} {order.order_number}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {new Date(order.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                  <Badge className={getStatusColor(order.status)}>
                    {t(`status.${order.status}`)}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase mb-1">
                      {t('orders.amount')}
                    </p>
                    <p className="text-lg font-bold text-primary">
                      ৳{order.total_amount}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase mb-1">
                      {t('orders.payment')}
                    </p>
                    <p className="text-sm font-medium text-foreground capitalize">
                      {order.payment_method}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase mb-1">
                      {t('orders.items')}
                    </p>
                    <p className="text-sm font-medium text-foreground">
                      {Math.floor(Math.random() * 5) + 1} {t('orders.items')}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-2 sm:items-end">
                <Link href={`/account/orders/${order.id}`}>
                  <Button className="bg-primary hover:bg-primary/90 w-full sm:w-auto">
                    {t('orders.viewDetails')}
                  </Button>
                </Link>
                {order.status === 'shipped' && (
                  <Button variant="outline" className="border-border w-full sm:w-auto">
                    {t('orders.trackOrder')}
                  </Button>
                )}
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-border">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-muted-foreground uppercase">
                  {t('orders.deliveryProgress')}
                </span>
                <span className="text-xs font-medium text-foreground">
                  {order.status === 'pending'
                    ? '25%'
                    : order.status === 'confirmed'
                    ? '50%'
                    : order.status === 'shipped'
                    ? '75%'
                    : '100%'}
                </span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all"
                  style={{
                    width:
                      order.status === 'pending'
                        ? '25%'
                        : order.status === 'confirmed'
                        ? '50%'
                        : order.status === 'shipped'
                        ? '75%'
                        : '100%',
                  }}
                ></div>
              </div>
              <div className="flex justify-between text-xs text-muted-foreground mt-3">
                <span>{t('status.pending')}</span>
                <span>{t('status.confirmed')}</span>
                <span>{t('status.shipped')}</span>
                <span>{t('status.delivered')}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
