import { requireAdmin } from '@/lib/auth'
import { createAdminSupabaseClient } from '@/lib/supabase-admin'
import AdminPaymentsManager from '@/components/admin-payments-manager'

export const metadata = {
  title: 'Payments - Admin Dashboard',
}

export default async function AdminPaymentsPage() {
  await requireAdmin()
  const supabase = await createAdminSupabaseClient()

  const { data: paymentLogs } = await supabase
    .from('payment_logs')
    .select('*, order:orders(order_number, payment_status, total_amount)')
    .order('created_at', { ascending: false })

  const { data: orders } = await supabase
    .from('orders')
    .select('id, order_number, payment_status, total_amount, status')
    .order('created_at', { ascending: false })

  const logs = paymentLogs || []
  const orderList = orders || []

  const failedPayments = logs.filter((log) => log.status !== 'completed')
  const missingPaymentLogs = orderList.filter(
    (order) => !logs.some((log) => log.order_id === order.id)
  )
  const mismatchedPayments = orderList.filter(
    (order) =>
      order.payment_status === 'completed' &&
      !logs.some((log) => log.order_id === order.id && log.status === 'completed')
  )

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-serif font-bold text-foreground">Payments</h1>
        <p className="text-muted-foreground mt-2">Monitor payment status and reconcile failures</p>
      </div>
      <AdminPaymentsManager
        paymentLogs={logs}
        failedPayments={failedPayments}
        missingPaymentLogs={missingPaymentLogs}
        mismatchedPayments={mismatchedPayments}
      />
    </div>
  )
}
