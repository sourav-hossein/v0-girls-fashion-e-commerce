import { requireAdmin } from '@/lib/auth'
import { createAdminSupabaseClient } from '@/lib/supabase-admin'
import AdminCustomersManager from '@/components/admin-customers-manager'

export const metadata = {
  title: 'Customers - Admin Dashboard',
}

export default async function AdminCustomersPage() {
  await requireAdmin()
  const supabase = await createAdminSupabaseClient()

  const { data: customers } = await supabase
    .from('profiles')
    .select('id, full_name, phone_number, phone_verified, created_at, last_login, role, is_blocked, blocked_reason')
    .order('created_at', { ascending: false })

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-serif font-bold text-foreground">Customers</h1>
        <p className="text-muted-foreground mt-2">Search, review orders, and manage suspicious accounts</p>
      </div>
      <AdminCustomersManager initialCustomers={customers || []} />
    </div>
  )
}
