'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Trash2, Plus, Minus, ShoppingBag } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'

interface CartItem {
  id: string
  productId: string
  productName: string
  price: number
  quantity: number
  image?: string
}

const DELIVERY_CHARGE_INSIDE_DHAKA = 60
const DELIVERY_CHARGE_OUTSIDE_DHAKA = 120

export default function CartClient() {
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [couponCode, setCouponCode] = useState('')
  const [discountPercent, setDiscountPercent] = useState(0)
  const [location, setLocation] = useState<'dhaka' | 'outside'>('dhaka')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // In a real app, fetch cart items from database
    setIsLoading(false)
  }, [])

  const deliveryCharge =
    location === 'dhaka'
      ? DELIVERY_CHARGE_INSIDE_DHAKA
      : DELIVERY_CHARGE_OUTSIDE_DHAKA

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const discountAmount = Math.round((subtotal * discountPercent) / 100)
  const total = subtotal - discountAmount + deliveryCharge

  const handleQuantityChange = (id: string, newQuantity: number) => {
    if (newQuantity === 0) {
      handleRemoveItem(id)
    } else {
      setCartItems(
        cartItems.map((item) =>
          item.id === id ? { ...item, quantity: newQuantity } : item
        )
      )
    }
  }

  const handleRemoveItem = (id: string) => {
    setCartItems(cartItems.filter((item) => item.id !== id))
    toast.success('Item removed from cart')
  }

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      toast.error('Please enter a coupon code')
      return
    }

    // In a real app, validate coupon from database
    setDiscountPercent(10) // Example: 10% discount
    toast.success('Coupon applied!')
    setCouponCode('')
  }

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="h-96 flex items-center justify-center">
          <p className="text-muted-foreground">Loading cart...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-serif font-bold text-foreground mb-8">
        Shopping Cart
      </h1>

      {cartItems.length === 0 ? (
        <Card className="border-border">
          <CardContent className="p-12 text-center">
            <ShoppingBag className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-serif font-bold text-foreground mb-2">
              Your cart is empty
            </h2>
            <p className="text-muted-foreground mb-6">
              Start shopping to add items to your cart
            </p>
            <Link href="/shop">
              <Button className="bg-primary hover:bg-primary/90">
                Continue Shopping
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item) => (
              <Card key={item.id} className="border-border overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex gap-6">
                    {/* Product Image */}
                    <div className="w-24 h-24 bg-muted rounded-lg flex-shrink-0 flex items-center justify-center">
                      <span className="text-2xl">🛍️</span>
                    </div>

                    {/* Product Details */}
                    <div className="flex-1 min-w-0">
                      <Link href={`/product/${item.productName.toLowerCase()}`}>
                        <h3 className="font-semibold text-foreground hover:text-primary transition-colors truncate">
                          {item.productName}
                        </h3>
                      </Link>
                      <p className="text-lg font-bold text-primary mt-2">
                        ৳{item.price}
                      </p>
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex items-center gap-3 border border-border rounded-lg p-2">
                      <button
                        onClick={() =>
                          handleQuantityChange(item.id, item.quantity - 1)
                        }
                        className="p-1 hover:bg-muted transition-colors"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="px-3 font-semibold text-sm">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() =>
                          handleQuantityChange(item.id, item.quantity + 1)
                        }
                        className="p-1 hover:bg-muted transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Remove Button */}
                    <button
                      onClick={() => handleRemoveItem(item.id)}
                      className="p-2 hover:bg-destructive/10 text-destructive rounded-lg transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Order Summary */}
          <div className="h-fit">
            <Card className="border-border sticky top-20">
              <CardHeader className="border-b border-border">
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                {/* Coupon */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Coupon Code
                  </label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Enter code"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      className="text-sm"
                    />
                    <Button
                      onClick={handleApplyCoupon}
                      variant="outline"
                      className="px-3"
                    >
                      Apply
                    </Button>
                  </div>
                </div>

                {/* Location Selection */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Delivery Location
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center gap-3 p-3 border border-border rounded-lg cursor-pointer hover:bg-muted transition-colors">
                      <input
                        type="radio"
                        value="dhaka"
                        checked={location === 'dhaka'}
                        onChange={(e) =>
                          setLocation(e.target.value as 'dhaka' | 'outside')
                        }
                      />
                      <span className="text-sm">Inside Dhaka (৳{DELIVERY_CHARGE_INSIDE_DHAKA})</span>
                    </label>
                    <label className="flex items-center gap-3 p-3 border border-border rounded-lg cursor-pointer hover:bg-muted transition-colors">
                      <input
                        type="radio"
                        value="outside"
                        checked={location === 'outside'}
                        onChange={(e) =>
                          setLocation(e.target.value as 'dhaka' | 'outside')
                        }
                      />
                      <span className="text-sm">Outside Dhaka (৳{DELIVERY_CHARGE_OUTSIDE_DHAKA})</span>
                    </label>
                  </div>
                </div>

                {/* Price Breakdown */}
                <div className="space-y-3 pt-4 border-t border-border">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-medium">৳{subtotal}</span>
                  </div>
                  {discountPercent > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-green-600">
                        Discount ({discountPercent}%)
                      </span>
                      <span className="text-green-600 font-medium">
                        -৳{discountAmount}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Delivery</span>
                    <span className="font-medium">৳{deliveryCharge}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold pt-3 border-t border-border">
                    <span>Total</span>
                    <span className="text-primary">৳{total}</span>
                  </div>
                </div>

                {/* Checkout Button */}
                <Link href="/checkout" className="block">
                  <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground h-12">
                    Proceed to Checkout
                  </Button>
                </Link>

                <Link href="/shop">
                  <Button
                    variant="outline"
                    className="w-full border-border"
                  >
                    Continue Shopping
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}
