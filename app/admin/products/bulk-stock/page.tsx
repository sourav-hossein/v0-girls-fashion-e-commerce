import { requireAdmin } from '@/lib/auth'
import BulkStockUploader from '@/components/admin-bulk-stock-uploader'

export const metadata = {
  title: 'Bulk Stock Update - Admin Dashboard',
}

export default async function BulkStockPage() {
  await requireAdmin()

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-serif font-bold text-foreground">Bulk Stock Update</h1>
        <p className="text-muted-foreground mt-2">Upload CSV or paste rows to update product/variant stock.</p>
      </div>
      <BulkStockUploader />
    </div>
  )
}
