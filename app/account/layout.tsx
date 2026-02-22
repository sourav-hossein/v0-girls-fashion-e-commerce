import Header from '@/components/header'
import Footer from '@/components/footer'
import AccountSidebar from '@/components/account-sidebar'

export const metadata = {
  title: 'My Account - Hijab & Fashion Hub',
  description: 'Manage your account and orders',
}

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <main className="bg-background min-h-screen flex flex-col">
      <Header />
      <div className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <AccountSidebar />
            <div className="md:col-span-3">
              {children}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  )
}
