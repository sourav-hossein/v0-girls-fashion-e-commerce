import { CheckCircle, Download, MessageSquare } from 'lucide-react'
import Link from 'next/link'
import Header from '@/components/header'
import Footer from '@/components/footer'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { createServerSupabaseClient } from '@/lib/supabase-server'

export const metadata = {
  title: 'Order Confirmed - Hijab & Fashion Hub',
  description: 'Your order has been successfully placed',
}

export default async function OrderSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ orderId?: string }>
}) {
  const params = await searchParams
  const orderId = params.orderId
  const supabase = await createServerSupabaseClient()

  const { data: order } = orderId
    ? await supabase
        .from('orders')
        .select('order_number, total_amount, status, created_at')
        .eq('order_number', orderId)
        .single()
    : { data: null }

  return (
    <main className="bg-background min-h-screen flex flex-col">
      <Header />
      <div className="flex-1">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Card className="border-border">
            <CardContent className="p-8 sm:p-12 text-center space-y-8">
              {/* Success Icon */}
              <div className="flex justify-center">
                <div className="relative">
                  <div className="absolute inset-0 bg-green-600/20 blur-2xl rounded-full"></div>
                  <CheckCircle className="w-24 h-24 text-green-600 relative" />
                </div>
              </div>

              {/* Heading */}
              <div>
                <h1 className="text-4xl font-serif font-bold text-foreground mb-2">
                  Order Confirmed!
                </h1>
                <p className="text-lg text-muted-foreground">
                  Thank you for your purchase
                </p>
              </div>

              {/* Order Details Box */}
              <div className="bg-primary/5 border border-primary/20 rounded-lg p-6 space-y-4 text-left">
                <div className="grid grid-cols-2 gap-4 sm:gap-6">
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase mb-1">
                      Order Number
                    </p>
                    <p className="text-xl font-bold text-foreground">
                      {order?.order_number || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase mb-1">
                      Order Date
                    </p>
                    <p className="text-xl font-bold text-foreground">
                      {order?.created_at
                        ? new Date(order.created_at).toLocaleDateString()
                        : new Date().toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase mb-1">
                      Total Amount
                    </p>
                    <p className="text-xl font-bold text-primary">
                      ৳{order?.total_amount ?? '0'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase mb-1">
                      Status
                    </p>
                    <p className="text-xl font-bold text-green-600">
                      {order?.status
                        ? order.status[0].toUpperCase() + order.status.slice(1)
                        : 'Pending'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Message */}
              <div className="space-y-4">
                <p className="text-muted-foreground">
                  Your order has been successfully placed. You will receive a confirmation email shortly with tracking information.
                </p>
                <p className="text-sm text-muted-foreground">
                  Expected delivery: 3-5 business days
                </p>
              </div>

              {/* Actions */}
              <div className="space-y-3 pt-4 border-t border-border">
                <Link href="/account/orders" className="block">
                  <Button className="w-full bg-primary hover:bg-primary/90 h-12">
                    View Order Details
                  </Button>
                </Link>
                <div className="grid grid-cols-2 gap-3">
                  <Link href="/shop" className="block">
                    <Button variant="outline" className="w-full border-border h-12">
                      Continue Shopping
                    </Button>
                  </Link>
                  <button className="px-4 py-3 border border-border rounded-lg hover:bg-muted transition-colors flex items-center justify-center gap-2 text-sm font-medium text-foreground">
                    <Download className="w-4 h-4" />
                    <span className="hidden sm:inline">Invoice</span>
                  </button>
                </div>
              </div>

              {/* Support */}
              <div className="p-4 bg-accent/5 border border-accent/20 rounded-lg flex gap-3 justify-center">
                <MessageSquare className="w-5 h-5 text-accent flex-shrink-0" />
                <div className="text-sm">
                  <p className="font-medium text-foreground">Need Help?</p>
                  <p className="text-muted-foreground text-xs">
                    Contact us at support@hijabfashion.com or call +880 1XXXXXXXXX
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <Footer />
    </main>
  )
}
