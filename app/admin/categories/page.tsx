import { requireAdmin } from '@/lib/auth'
import { createAdminSupabaseClient } from '@/lib/supabase-admin'
import AdminCategoriesManager from '@/components/admin-categories-manager'

export const metadata = {
  title: 'Categories - Admin Dashboard',
}

export default async function AdminCategoriesPage() {
  await requireAdmin()
  const supabase = await createAdminSupabaseClient()

  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .order('name')

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-serif font-bold text-foreground">Categories</h1>
        <p className="text-muted-foreground mt-2">
          Create and manage product categories
        </p>
      </div>
      <AdminCategoriesManager initialCategories={categories || []} />
    </div>
  )
}
