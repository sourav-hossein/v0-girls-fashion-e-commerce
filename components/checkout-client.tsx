'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Lock, CheckCircle } from 'lucide-react'

const DIVISIONS = [
  'Dhaka',
  'Chittagong',
  'Khulna',
  'Rajshahi',
  'Barisal',
  'Sylhet',
  'Rangpur',
  'Mymensingh',
]

const DELIVERY_CHARGE_INSIDE_DHAKA = 60
const DELIVERY_CHARGE_OUTSIDE_DHAKA = 120

export default function CheckoutClient() {
  const router = useRouter()
  const [paymentMethod, setPaymentMethod] = useState<'sslcommerz' | 'cod'>('cod')
  const [isLoading, setIsLoading] = useState(false)
  const [orderPlaced, setOrderPlaced] = useState(false)
  const [cartItems, setCartItems] = useState<any[]>([])
  const [cartLoading, setCartLoading] = useState(true)

  // Form states
  const [formData, setFormData] = useState({
    fullName: '',
    phoneNumber: '',
    email: '',
    division: '',
    district: '',
    thana: '',
    fullAddress: '',
  })

  useEffect(() => {
    const loadCart = async () => {
      try {
        const response = await fetch('/api/cart')
        if (!response.ok) {
          throw new Error('Failed to load cart')
        }
        const data = await response.json()
        setCartItems(data || [])
      } catch (error) {
      toast.error('Failed to load cart')
      } finally {
        setCartLoading(false)
      }
    }

    loadCart()
  }, [])

  const subtotal = cartItems.reduce((sum, item) => {
    const price = item.product?.discount_price ?? item.product?.price ?? 0
    return sum + price * (item.quantity || 1)
  }, 0)
  const deliveryCharge = formData.division ? (
    formData.division === 'Dhaka'
      ? DELIVERY_CHARGE_INSIDE_DHAKA
      : DELIVERY_CHARGE_OUTSIDE_DHAKA
  ) : 0
  const total = subtotal + deliveryCharge

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const validateForm = () => {
    if (
      !formData.fullName ||
      !formData.phoneNumber ||
      !formData.email ||
      !formData.division ||
      !formData.district ||
      !formData.thana ||
      !formData.fullAddress
    ) {
      toast.error('Please fill in all fields')
      return false
    }

    const phoneRegex = /^01[0-9]{9}$/
    if (!phoneRegex.test(formData.phoneNumber)) {
      toast.error('Please enter a valid Bangladesh phone number')
      return false
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      toast.error('Please enter a valid email')
      return false
    }

    if (cartItems.length === 0) {
      toast.error('Your cart is empty')
      return false
    }

    return true
  }

  const handleCODSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    setIsLoading(true)
    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentMethod: 'cod',
          address: formData,
        }),
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || 'Failed to place order')
      }

      setOrderPlaced(true)
      toast.success('Order placed successfully!')
      setTimeout(() => {
        router.push(`/order-success?orderId=${data.orderId}`)
      }, 1500)
    } catch (error) {
      toast.error('Failed to place order')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSSLCommerzSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    setIsLoading(true)
    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentMethod: 'sslcommerz',
          address: formData,
        }),
      })

      const data = await response.json()
      if (!response.ok || !data.redirectUrl) {
        throw new Error(data.error || 'Failed to initiate payment')
      }

      toast.success('Redirecting to payment gateway...')
      window.location.href = data.redirectUrl
    } catch (error) {
      toast.error('Failed to process payment')
    } finally {
      setIsLoading(false)
    }
  }

  if (orderPlaced) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Card className="border-border max-w-md mx-auto">
          <CardContent className="p-12 text-center">
            <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
            <h2 className="text-2xl font-serif font-bold text-foreground mb-2">
              Order Placed!
            </h2>
            <p className="text-muted-foreground mb-6">
              Redirecting to your order confirmation...
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-serif font-bold text-foreground mb-8">
        Checkout
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Checkout Form */}
        <div className="lg:col-span-2">
          <Card className="border-border">
            <CardHeader className="border-b border-border">
              <CardTitle>Shipping Address</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <form className="space-y-4">
                {/* Name and Phone */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">
                      Full Name
                    </label>
                    <Input
                      placeholder="Your full name"
                      value={formData.fullName}
                      onChange={(e) => handleInputChange('fullName', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">
                      Phone Number
                    </label>
                    <Input
                      placeholder="01xxxxxxxxx"
                      value={formData.phoneNumber}
                      onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Email Address
                  </label>
                  <Input
                    type="email"
                    placeholder="your@email.com"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                  />
                </div>

                {/* Division, District, Thana */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">
                      Division
                    </label>
                    <Select value={formData.division} onValueChange={(value) => handleInputChange('division', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select division" />
                      </SelectTrigger>
                      <SelectContent>
                        {DIVISIONS.map((div) => (
                          <SelectItem key={div} value={div}>
                            {div}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">
                      District
                    </label>
                    <Input
                      placeholder="District"
                      value={formData.district}
                      onChange={(e) => handleInputChange('district', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">
                      Thana/Upazila
                    </label>
                    <Input
                      placeholder="Thana"
                      value={formData.thana}
                      onChange={(e) => handleInputChange('thana', e.target.value)}
                    />
                  </div>
                </div>

                {/* Full Address */}
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Full Address
                  </label>
                  <textarea
                    className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    rows={3}
                    placeholder="Enter your complete address"
                    value={formData.fullAddress}
                    onChange={(e) => handleInputChange('fullAddress', e.target.value)}
                  />
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Payment Method */}
          <Card className="border-border mt-6">
            <CardHeader className="border-b border-border">
              <CardTitle>Payment Method</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <Tabs value={paymentMethod} onValueChange={(value) => setPaymentMethod(value as 'sslcommerz' | 'cod')}>
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="cod">Cash on Delivery</TabsTrigger>
                  <TabsTrigger value="sslcommerz">Online Payment</TabsTrigger>
                </TabsList>

                <TabsContent value="cod" className="space-y-4">
                  <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
                    <p className="text-sm text-foreground">
                      Pay when you receive your order. No extra charges!
                    </p>
                  </div>
                  <Button
                    onClick={handleCODSubmit}
                    disabled={isLoading || cartLoading || cartItems.length === 0}
                    className="w-full bg-primary hover:bg-primary/90 h-12 text-primary-foreground"
                  >
                    {isLoading ? 'Processing...' : 'Place Order'}
                  </Button>
                </TabsContent>

                <TabsContent value="sslcommerz" className="space-y-4">
                  <div className="p-4 bg-accent/5 border border-accent/20 rounded-lg">
                    <div className="flex gap-2 items-start">
                      <Lock className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-foreground">Secure Payment</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Pay securely with Card, bKash, Nagad, and other methods
                        </p>
                      </div>
                    </div>
                  </div>
                  <Button
                    onClick={handleSSLCommerzSubmit}
                    disabled={isLoading || cartLoading || cartItems.length === 0}
                    className="w-full bg-accent hover:bg-accent/90 h-12 text-accent-foreground"
                  >
                    {isLoading ? 'Processing...' : 'Pay with SSLCommerz'}
                  </Button>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Order Summary */}
        <div className="h-fit">
          <Card className="border-border sticky top-20">
            <CardHeader className="border-b border-border">
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium">৳{subtotal}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Delivery</span>
                  <span className="font-medium">৳{deliveryCharge}</span>
                </div>
                {formData.division && (
                  <p className="text-xs text-muted-foreground">
                    {formData.division === 'Dhaka'
                      ? 'Inside Dhaka - Free/Standard'
                      : 'Outside Dhaka - Standard Delivery'}
                  </p>
                )}
              </div>

              <div className="border-t border-border pt-4">
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span className="text-primary">৳{total}</span>
                </div>
              </div>

              {/* Order Details */}
              <div className="bg-muted/30 p-4 rounded-lg space-y-2 text-sm">
                <h4 className="font-semibold text-foreground mb-3">Your Order</h4>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Items ({cartItems.length})</span>
                  <span>৳{subtotal}</span>
                </div>
              </div>

              {/* Info Box */}
              <div className="p-4 bg-primary/5 border border-primary/10 rounded-lg text-xs text-muted-foreground space-y-2">
                <p>
                  <strong>Note:</strong> Please ensure all details are correct before placing your order.
                </p>
                <p>
                  You will receive an order confirmation via email and SMS.
                </p>
              </div>

              <Link href="/cart">
                <Button variant="outline" className="w-full border-border">
                  Back to Cart
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
