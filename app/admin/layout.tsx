import AdminSidebar from '@/components/admin-sidebar'
import AdminHeader from '@/components/admin-header'

export const metadata = {
  title: 'Admin Dashboard - Hijab & Fashion Hub',
  description: 'Admin panel for managing products and orders',
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-screen bg-background">
      <AdminSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader />
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
