import { XCircle } from 'lucide-react'
import Link from 'next/link'
import Header from '@/components/header'
import Footer from '@/components/footer'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

export const metadata = {
  title: 'Payment Failed - Hijab & Fashion Hub',
  description: 'Your payment could not be completed',
}

export default function OrderFailedPage() {
  return (
    <main className="bg-background min-h-screen flex flex-col">
      <Header />
      <div className="flex-1">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Card className="border-border">
            <CardContent className="p-8 sm:p-12 text-center space-y-6">
              <div className="flex justify-center">
                <XCircle className="w-20 h-20 text-destructive" />
              </div>
              <div>
                <h1 className="text-3xl font-serif font-bold text-foreground mb-2">
                  Payment Failed
                </h1>
                <p className="text-muted-foreground">
                  We could not process your payment. You can try again or choose Cash on Delivery.
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Link href="/checkout" className="block">
                  <Button className="w-full bg-primary hover:bg-primary/90 h-12">
                    Try Again
                  </Button>
                </Link>
                <Link href="/cart" className="block">
                  <Button variant="outline" className="w-full border-border h-12">
                    Back to Cart
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <Footer />
    </main>
  )
}
