import { requireAdmin } from '@/lib/auth'
import { createAdminSupabaseClient } from '@/lib/supabase-admin'
import AdminProductForm from '@/components/admin-product-form'

export const metadata = {
  title: 'New Product - Admin Dashboard',
}

export default async function AdminProductCreatePage() {
  await requireAdmin()
  const supabase = await createAdminSupabaseClient()

  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .order('name', { ascending: true })

  return (
    <div className="p-6 space-y-6">
      <AdminProductForm mode="create" categories={categories || []} />
    </div>
  )
}
