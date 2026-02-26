import Header from '@/components/header'
import Footer from '@/components/footer'
import CheckoutClient from '@/components/checkout-client'
import { createAdminSupabaseClient } from '@/lib/supabase-admin'

export const metadata = {
  title: 'Checkout - Hijab & Fashion Hub',
  description: 'Complete your purchase with secure payment options',
}

export default async function CheckoutPage() {
  const supabase = await createAdminSupabaseClient()
  const { data: settings } = await supabase
    .from('store_settings')
    .select('flat_shipping_rate, free_shipping_threshold, cod_enabled, sslcommerz_enabled')
    .order('updated_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  return (
    <main className="bg-background min-h-screen flex flex-col">
      <Header />
      <div className="flex-1">
        <CheckoutClient settings={settings || undefined} />
      </div>
      <Footer />
    </main>
  )
}
