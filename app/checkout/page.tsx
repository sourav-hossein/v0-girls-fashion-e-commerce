import Header from '@/components/header'
import Footer from '@/components/footer'
import CheckoutClient from '@/components/checkout-client'

export const metadata = {
  title: 'Checkout - Hijab & Fashion Hub',
  description: 'Complete your purchase with secure payment options',
}

export default function CheckoutPage() {
  return (
    <main className="bg-background min-h-screen flex flex-col">
      <Header />
      <div className="flex-1">
        <CheckoutClient />
      </div>
      <Footer />
    </main>
  )
}
