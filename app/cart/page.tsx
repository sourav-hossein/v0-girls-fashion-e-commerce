import Header from '@/components/header'
import Footer from '@/components/footer'
import CartClient from '@/components/cart-client'

export const metadata = {
  title: 'Shopping Cart - Hijab & Fashion Hub',
  description: 'Review and manage your shopping cart',
}

export default function CartPage() {
  return (
    <main className="bg-background min-h-screen flex flex-col">
      <Header />
      <div className="flex-1">
        <CartClient />
      </div>
      <Footer />
    </main>
  )
}
