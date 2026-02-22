import Header from '@/components/header'
import Footer from '@/components/footer'
import WishlistClient from '@/components/wishlist-client'

export const metadata = {
  title: 'Wishlist - Hijab & Fashion Hub',
  description: 'View and manage your saved wishlist items',
}

export default function WishlistPage() {
  return (
    <main className="bg-background min-h-screen flex flex-col">
      <Header />
      <div className="flex-1">
        <WishlistClient />
      </div>
      <Footer />
    </main>
  )
}
