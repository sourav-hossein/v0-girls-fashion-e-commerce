import { requireAdmin } from '@/lib/auth'
import { createAdminSupabaseClient } from '@/lib/supabase-admin'
import AdminCouponsManager from '@/components/admin-coupons-manager'

export const metadata = {
  title: 'Coupons - Admin Dashboard',
}

export default async function AdminCouponsPage() {
  await requireAdmin()
  const supabase = await createAdminSupabaseClient()

  const { data: coupons } = await supabase
    .from('coupons')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-serif font-bold text-foreground">Coupons</h1>
        <p className="text-muted-foreground mt-2">Create and manage discount codes</p>
      </div>
      <AdminCouponsManager initialCoupons={coupons || []} />
    </div>
  )
}
