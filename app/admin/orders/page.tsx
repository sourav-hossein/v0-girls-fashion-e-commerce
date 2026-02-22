import { createServerSupabaseClient } from '@/lib/supabase-server'
import AdminOrdersList from '@/components/admin-orders-list'

export const metadata = {
  title: 'Orders - Admin Dashboard',
}

export default async function AdminOrdersPage() {
  const supabase = await createServerSupabaseClient()

  const { data: orders } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-serif font-bold text-foreground">Orders</h1>
        <p className="text-muted-foreground mt-2">Manage and track all customer orders</p>
      </div>

      {/* Orders List */}
      <AdminOrdersList orders={orders || []} />
    </div>
  )
}
