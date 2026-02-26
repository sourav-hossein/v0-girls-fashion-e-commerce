import { requireAdmin } from '@/lib/auth'
import { createAdminSupabaseClient } from '@/lib/supabase-admin'
import AdminOrderDetail from '@/components/admin-order-detail'

export const metadata = {
  title: 'Order Detail - Admin Dashboard',
}

interface OrderDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function OrderDetailPage({ params }: OrderDetailPageProps) {
  await requireAdmin()
  const { id } = await params
  const supabase = await createAdminSupabaseClient()

  const { data: order } = await supabase
    .from('orders')
    .select('*')
    .eq('id', id)
    .single()

  if (!order) {
    return (
      <div className="p-6">
        <p className="text-muted-foreground">Order not found.</p>
      </div>
    )
  }

  const [itemsRes, addressRes, paymentsRes, logsRes] = await Promise.all([
    supabase
      .from('order_items')
      .select('*, product:products(name, slug), variant:product_variants(variant_type, variant_value)')
      .eq('order_id', id),
    supabase.from('order_addresses').select('*').eq('order_id', id).single(),
    supabase.from('payment_logs').select('*').eq('order_id', id).order('created_at', { ascending: false }),
    supabase.from('order_status_logs').select('*').eq('order_id', id).order('changed_at', { ascending: false }),
  ])

  return (
    <div className="p-6 space-y-6">
      <AdminOrderDetail
        order={order}
        items={itemsRes.data || []}
        address={addressRes.data || null}
        payments={paymentsRes.data || []}
        logs={logsRes.data || []}
      />
    </div>
  )
}
