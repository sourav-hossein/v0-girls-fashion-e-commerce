import { requireAdmin } from '@/lib/auth'
import { createAdminSupabaseClient } from '@/lib/supabase-admin'
import AdminProductEditor from '@/components/admin-product-editor'

export const metadata = {
  title: 'Edit Product - Admin Dashboard',
}

interface ProductEditPageProps {
  params: Promise<{ id: string }>
}

export default async function AdminProductEditPage({ params }: ProductEditPageProps) {
  await requireAdmin()
  const { id } = await params
  const supabase = await createAdminSupabaseClient()

  const { data: product } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single()

  if (!product) {
    return (
      <div className="p-6">
        <p className="text-muted-foreground">Product not found.</p>
      </div>
    )
  }

  const { data: variants } = await supabase
    .from('product_variants')
    .select('*')
    .eq('product_id', id)
    .order('variant_type', { ascending: true })

  return (
    <div className="p-6 space-y-6">
      <AdminProductEditor product={product} variants={variants || []} />
    </div>
  )
}
