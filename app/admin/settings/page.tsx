import { requireAdmin } from '@/lib/auth'
import AdminSettingsForm from '@/components/admin-settings-form'

export const metadata = {
  title: 'Settings - Admin Dashboard',
}

export default async function AdminSettingsPage() {
  await requireAdmin()

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-serif font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground mt-2">
          Manage store configuration and payment options
        </p>
      </div>
      <AdminSettingsForm />
    </div>
  )
}
