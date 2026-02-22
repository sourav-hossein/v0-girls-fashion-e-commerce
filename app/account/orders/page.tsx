import { createServerSupabaseClient } from '@/lib/supabase-server'
import UserOrdersList from '@/components/user-orders-list'

export const metadata = {
  title: 'My Orders - Hijab & Fashion Hub',
}

export default async function OrdersPage() {
  const supabase = await createServerSupabaseClient()

  // In a real app, fetch orders for authenticated user
  const { data: orders } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(20)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-serif font-bold text-foreground">
          My Orders
        </h1>
        <p className="text-muted-foreground mt-2">
          View and track all your orders
        </p>
      </div>

      <UserOrdersList orders={orders || []} />
    </div>
  )
}
