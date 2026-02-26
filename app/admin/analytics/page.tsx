import { requireAdmin } from '@/lib/auth'
import AdminAnalyticsDashboard from '@/components/admin-analytics-dashboard'

export const metadata = {
  title: 'Analytics - Admin Dashboard',
}

export default async function AdminAnalyticsPage() {
  await requireAdmin()

  return (
    <div className="p-6 space-y-6">
      <AdminAnalyticsDashboard />
    </div>
  )
}
