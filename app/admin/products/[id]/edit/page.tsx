import { requireAdmin } from '@/lib/auth'
import { createAdminSupabaseClient } from '@/lib/supabase-admin'
import AdminProductForm from '@/components/admin-product-form'

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

  const [{ data: variants }, { data: images }, { data: categories }] = await Promise.all([
    supabase
      .from('product_variants')
      .select('*')
      .eq('product_id', id)
      .order('variant_type', { ascending: true }),
    supabase
      .from('product_images')
      .select('*')
      .eq('product_id', id)
      .order('display_order', { ascending: true }),
    supabase
      .from('categories')
      .select('*')
      .order('name', { ascending: true }),
  ])

  return (
    <div className="p-6 space-y-6">
      <AdminProductForm
        mode="edit"
        product={product}
        variants={variants || []}
        images={images || []}
        categories={categories || []}
      />
    </div>
  )
}
