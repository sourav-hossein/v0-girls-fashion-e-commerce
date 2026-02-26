import { requireAdmin } from '@/lib/auth'
import AdminProductsPageClient from '@/components/admin-products-page'

export const metadata = {
  title: 'Products - Admin Dashboard',
}

export default async function AdminProductsPage() {
  await requireAdmin()

  return (
    <AdminProductsPageClient />
  )
}
