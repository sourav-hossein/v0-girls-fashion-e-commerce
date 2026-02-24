import { requireAdmin } from '@/lib/auth'
import { createAdminSupabaseClient } from '@/lib/supabase-admin'
import DashboardStats from '@/components/admin-dashboard-stats'
import RecentOrders from '@/components/admin-recent-orders'
import LowStockProducts from '@/components/admin-low-stock'

export const metadata = {
  title: 'Admin Dashboard - Hijab & Fashion Hub',
}

export default async function AdminDashboard() {
  await requireAdmin()
  const supabase = await createAdminSupabaseClient()

  // Fetch stats
  const [orders, products, revenue] = await Promise.all([
    supabase.from('orders').select('*', { count: 'exact' }),
    supabase.from('products').select('*', { count: 'exact' }),
    supabase.from('orders').select('total_amount'),
  ])

  const totalOrders = orders.count || 0
  const totalProducts = products.count || 0
  const totalRevenue = revenue.data?.reduce((sum, o) => sum + o.total_amount, 0) || 0

  // Fetch recent orders
  const { data: recentOrders } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(5)

  // Fetch low stock products
  const { data: lowStockProducts } = await supabase
    .from('products')
    .select('*')
    .lt('stock_quantity', 10)
    .order('stock_quantity')
    .limit(5)

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-serif font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-2">Welcome back! Here's your business overview.</p>
      </div>

      {/* Stats */}
      <DashboardStats
        totalOrders={totalOrders}
        totalProducts={totalProducts}
        totalRevenue={totalRevenue}
      />

      {/* Recent Orders and Low Stock */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RecentOrders orders={recentOrders || []} />
        </div>
        <div>
          <LowStockProducts products={lowStockProducts || []} />
        </div>
      </div>
    </div>
  )
}
