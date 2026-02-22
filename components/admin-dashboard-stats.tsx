import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ShoppingCart, Package, TrendingUp, AlertTriangle } from 'lucide-react'

interface DashboardStatsProps {
  totalOrders: number
  totalProducts: number
  totalRevenue: number
}

export default function DashboardStats({
  totalOrders,
  totalProducts,
  totalRevenue,
}: DashboardStatsProps) {
  const stats = [
    {
      title: 'Total Orders',
      value: totalOrders,
      icon: ShoppingCart,
      color: 'text-blue-600 bg-blue-50 dark:bg-blue-950',
      trend: '+12% this month',
    },
    {
      title: 'Products',
      value: totalProducts,
      icon: Package,
      color: 'text-primary bg-primary/10',
      trend: 'Active products',
    },
    {
      title: 'Total Revenue',
      value: `৳${(totalRevenue / 1000).toFixed(1)}K`,
      icon: TrendingUp,
      color: 'text-green-600 bg-green-50 dark:bg-green-950',
      trend: '+24% this month',
    },
    {
      title: 'Low Stock Items',
      value: '8',
      icon: AlertTriangle,
      color: 'text-accent bg-accent/10',
      trend: 'Requires attention',
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat) => {
        const Icon = stat.icon
        return (
          <Card key={stat.title} className="border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className={`p-3 rounded-lg ${stat.color}`}>
                <Icon className="w-5 h-5" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {stat.value}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {stat.trend}
              </p>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
