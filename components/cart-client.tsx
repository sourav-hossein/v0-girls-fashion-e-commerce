'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Trash2, Plus, Minus, ShoppingBag } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { CartAuthError, getCart, removeCartItem, updateCartItem } from '@/lib/cart-api'
import { useT } from '@/hooks/use-t'

interface CartItem {
  id: string
  product_id: string
  variant_id?: string | null
  quantity: number
  product?: {
    id: string
    name: string
    slug: string
    price: number
    discount_price?: number | null
  } | null
  variant?: {
    id: string
    variant_type: string
    variant_value: string
    stock_quantity: number
  } | null
}

const DELIVERY_CHARGE_INSIDE_DHAKA = 60
const DELIVERY_CHARGE_OUTSIDE_DHAKA = 120

export default function CartClient() {
  const { t } = useT()
  const router = useRouter()
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [couponCode, setCouponCode] = useState('')
  const [discountPercent, setDiscountPercent] = useState(0)
  const [location, setLocation] = useState<'dhaka' | 'outside'>('dhaka')
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthRequired, setIsAuthRequired] = useState(false)

  useEffect(() => {
    const loadCart = async () => {
      try {
        const data = await getCart()
        setCartItems(data || [])
      } catch (error) {
        if (error instanceof CartAuthError) {
          setIsAuthRequired(true)
          return
        }
        toast.error(error instanceof Error ? error.message : 'Failed to load cart')
      } finally {
        setIsLoading(false)
      }
    }

    loadCart()
  }, [])

  const deliveryCharge =
    location === 'dhaka'
      ? DELIVERY_CHARGE_INSIDE_DHAKA
      : DELIVERY_CHARGE_OUTSIDE_DHAKA

  const subtotal = cartItems.reduce((sum, item) => {
    const price = item.product?.discount_price ?? item.product?.price ?? 0
    return sum + price * item.quantity
  }, 0)
  const discountAmount = Math.round((subtotal * discountPercent) / 100)
  const total = subtotal - discountAmount + deliveryCharge

  const handleQuantityChange = async (id: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      await handleRemoveItem(id)
      return
    }
    try {
      const updated = await updateCartItem({ id, quantity: newQuantity })
      if (updated?.id) {
        setCartItems(items => items.map(item => item.id === id ? updated : item))
      }
    } catch (error) {
      if (error instanceof CartAuthError) {
        toast.error(error.message)
        router.push('/auth/login')
        return
      }
      toast.error(error instanceof Error ? error.message : 'Failed to update cart')
    }
  }

  const handleRemoveItem = async (id: string) => {
    try {
      await removeCartItem(id)
      setCartItems(cartItems.filter((item) => item.id !== id))
      toast.success(t('cart.itemRemoved'))
    } catch (error) {
      if (error instanceof CartAuthError) {
        toast.error(error.message)
        router.push('/auth/login')
        return
      }
      toast.error(error instanceof Error ? error.message : t('cart.removeFailed'))
    }
  }

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      toast.error(t('cart.enterCoupon'))
      return
    }

    setDiscountPercent(10)
    toast.success(t('cart.couponApplied'))
    setCouponCode('')
  }

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="h-96 flex items-center justify-center">
          <p className="text-muted-foreground">{t('common.loading')}</p>
        </div>
      </div>
    )
  }

  if (isAuthRequired) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Card className="border-border">
          <CardContent className="p-12 text-center">
            <ShoppingBag className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-serif font-bold text-foreground mb-2">
              {t('cart.loginRequiredTitle')}
            </h2>
            <p className="text-muted-foreground mb-6">
              {t('cart.loginRequiredBody')}
            </p>
            <Link href="/auth/login">
              <Button className="bg-primary hover:bg-primary/90">
                {t('nav.login')}
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-serif font-bold text-foreground mb-8">
        {t('cart.title')}
      </h1>

      {cartItems.length === 0 ? (
        <Card className="border-border">
          <CardContent className="p-12 text-center">
            <ShoppingBag className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-serif font-bold text-foreground mb-2">
              {t('cart.empty')}
            </h2>
            <p className="text-muted-foreground mb-6">
              {t('cart.emptyHint')}
            </p>
            <Link href="/shop">
              <Button className="bg-primary hover:bg-primary/90">
                {t('common.continueShopping')}
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item) => (
              <Card key={item.id} className="border-border overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex gap-6">
                    <div className="w-24 h-24 bg-muted rounded-lg flex-shrink-0 flex items-center justify-center">
                      <span className="text-2xl">*</span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <Link href={item.product?.slug ? `/product/${item.product.slug}` : '#'}>
                        <h3 className="font-semibold text-foreground hover:text-primary transition-colors truncate">
                          {item.product?.name || t('product.generic')}
                        </h3>
                      </Link>
                      {item.variant ? (
                        <p className="text-xs text-muted-foreground mt-1">
                          {item.variant.variant_type}: {item.variant.variant_value}
                        </p>
                      ) : null}
                      <p className="text-lg font-bold text-primary mt-2">
                        ৳{item.product?.discount_price ?? item.product?.price ?? 0}
                      </p>
                    </div>

                    <div className="flex items-center gap-3 border border-border rounded-lg p-2">
                      <button
                        onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                        className="p-1 hover:bg-muted transition-colors"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="px-3 font-semibold text-sm">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                        className="p-1 hover:bg-muted transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>

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

          <div className="h-fit">
            <Card className="border-border sticky top-20">
              <CardHeader className="border-b border-border">
                <CardTitle>{t('cart.orderSummary')}</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    {t('cart.coupon')}
                  </label>
                  <div className="flex gap-2">
                    <Input
                      placeholder={t('cart.enterCode')}
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      className="text-sm"
                    />
                    <Button
                      onClick={handleApplyCoupon}
                      variant="outline"
                      className="px-3"
                    >
                      {t('cart.apply')}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    {t('cart.deliveryLocation')}
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
                      <span className="text-sm">
                        {t('cart.insideDhaka')} (৳{DELIVERY_CHARGE_INSIDE_DHAKA})
                      </span>
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
                      <span className="text-sm">
                        {t('cart.outsideDhaka')} (৳{DELIVERY_CHARGE_OUTSIDE_DHAKA})
                      </span>
                    </label>
                  </div>
                </div>

                <div className="space-y-3 pt-4 border-t border-border">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{t('common.subtotal')}</span>
                    <span className="font-medium">৳{subtotal}</span>
                  </div>
                  {discountPercent > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-green-600">
                        {t('common.discount')} ({discountPercent}%)
                      </span>
                      <span className="text-green-600 font-medium">
                        -৳{discountAmount}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{t('checkout.deliveryCharge')}</span>
                    <span className="font-medium">৳{deliveryCharge}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold pt-3 border-t border-border">
                    <span>{t('common.total')}</span>
                    <span className="text-primary">৳{total}</span>
                  </div>
                </div>

                <Link href="/checkout" className="block">
                  <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground h-12">
                    {t('cart.checkout')}
                  </Button>
                </Link>

                <Link href="/shop">
                  <Button
                    variant="outline"
                    className="w-full border-border"
                  >
                    {t('common.continueShopping')}
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
