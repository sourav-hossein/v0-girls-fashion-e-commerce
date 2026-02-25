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
import {
  divisions,
  districtsByDivisionId,
  thanasByDistrictId,
  getDivisionName,
  getDistrictName,
  getThanaName,
} from '@/lib/geo-data'

const DELIVERY_CHARGE_INSIDE_DHAKA = 60
const DELIVERY_CHARGE_OUTSIDE_DHAKA = 120

interface UserAddress {
  id: string
  full_name: string
  phone_number: string
  division_id: string
  district_id: string
  thana_id: string
  area?: string
  full_address: string
  postal_code?: string
  is_default: boolean
}

export default function CheckoutClient() {
  const router = useRouter()
  const [paymentMethod, setPaymentMethod] = useState<'sslcommerz' | 'cod'>('cod')
  const [isLoading, setIsLoading] = useState(false)
  const [orderPlaced, setOrderPlaced] = useState(false)
  const [cartItems, setCartItems] = useState<any[]>([])
  const [cartLoading, setCartLoading] = useState(true)
  const [addressesLoading, setAddressesLoading] = useState(true)
  const [addresses, setAddresses] = useState<UserAddress[]>([])
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null)

  // Form states
  const [formData, setFormData] = useState({
    fullName: '',
    phoneNumber: '',
    email: '',
    divisionId: '',
    districtId: '',
    thanaId: '',
    area: '',
    fullAddress: '',
    postalCode: '',
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

  useEffect(() => {
    const loadAddresses = async () => {
      try {
        const response = await fetch('/api/addresses', { credentials: 'include' })
        if (response.status === 401) {
          setAddresses([])
          setSelectedAddressId(null)
          return
        }
        const data = await response.json()
        if (!response.ok) {
          throw new Error(data?.message || 'Failed to load addresses')
        }

        const list = data || []
        setAddresses(list)

        const defaultAddress = list.find((addr: UserAddress) => addr.is_default)
        if (defaultAddress) {
          setSelectedAddressId(defaultAddress.id)
        } else if (list.length > 0) {
          setSelectedAddressId(list[0].id)
        }
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Failed to load addresses')
      } finally {
        setAddressesLoading(false)
      }
    }

    loadAddresses()
  }, [])

  useEffect(() => {
    if (!selectedAddressId) return
    const selected = addresses.find((addr) => addr.id === selectedAddressId)
    if (!selected) return
    setFormData((prev) => ({
      ...prev,
      fullName: selected.full_name,
      phoneNumber: selected.phone_number,
      divisionId: selected.division_id,
      districtId: selected.district_id,
      thanaId: selected.thana_id,
      area: selected.area || '',
      fullAddress: selected.full_address,
      postalCode: selected.postal_code || '',
    }))
  }, [selectedAddressId, addresses])

  const subtotal = cartItems.reduce((sum, item) => {
    const price = item.product?.discount_price ?? item.product?.price ?? 0
    return sum + price * (item.quantity || 1)
  }, 0)
  const selectedDivisionName = formData.divisionId ? getDivisionName(formData.divisionId) : ''
  const deliveryCharge = selectedDivisionName ? (
    selectedDivisionName === 'Dhaka'
      ? DELIVERY_CHARGE_INSIDE_DHAKA
      : DELIVERY_CHARGE_OUTSIDE_DHAKA
  ) : 0
  const total = subtotal + deliveryCharge

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => {
      if (field === 'divisionId') {
        return { ...prev, divisionId: value, districtId: '', thanaId: '' }
      }
      if (field === 'districtId') {
        return { ...prev, districtId: value, thanaId: '' }
      }
      return { ...prev, [field]: value }
    })
  }

  const validateForm = () => {
    if (
      !formData.fullName ||
      !formData.phoneNumber ||
      !formData.email ||
      !formData.divisionId ||
      !formData.districtId ||
      !formData.thanaId ||
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

  const isFormDifferent = (address: UserAddress) => {
    return (
      address.full_name !== formData.fullName ||
      address.phone_number !== formData.phoneNumber ||
      address.division_id !== formData.divisionId ||
      address.district_id !== formData.districtId ||
      address.thana_id !== formData.thanaId ||
      (address.area || '') !== (formData.area || '') ||
      address.full_address !== formData.fullAddress ||
      (address.postal_code || '') !== (formData.postalCode || '')
    )
  }

  const buildAddressPayload = () => ({
    full_name: formData.fullName,
    phone_number: formData.phoneNumber,
    division_id: formData.divisionId,
    district_id: formData.districtId,
    thana_id: formData.thanaId,
    area: formData.area || null,
    full_address: formData.fullAddress,
    postal_code: formData.postalCode || null,
  })

  const ensureAddressSaved = async () => {
    if (!validateForm()) return false

    const payload = buildAddressPayload()
    const selected = selectedAddressId
      ? addresses.find((addr) => addr.id === selectedAddressId)
      : null

    if (selected) {
      if (!isFormDifferent(selected)) return true
      const response = await fetch('/api/addresses', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ id: selected.id, ...payload }),
      })
      const data = await response.json()
      if (!response.ok) {
        toast.error(data?.message || 'Failed to update address')
        return false
      }
      return true
    }

    const response = await fetch('/api/addresses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        ...payload,
        is_default: addresses.length === 0,
      }),
    })
    const data = await response.json()
    if (!response.ok) {
      toast.error(data?.message || 'Failed to save address')
      return false
    }
    return true
  }

  const buildCheckoutAddress = () => {
    const division = getDivisionName(formData.divisionId)
    const district = getDistrictName(formData.districtId)
    const thana = getThanaName(formData.thanaId)
    const fullAddress = [formData.fullAddress, formData.area, formData.postalCode]
      .filter(Boolean)
      .join(', ')

    return {
      fullName: formData.fullName,
      phoneNumber: formData.phoneNumber,
      email: formData.email,
      division,
      district,
      thana,
      fullAddress,
    }
  }

  const handleCODSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    setIsLoading(true)
    try {
      const saved = await ensureAddressSaved()
      if (!saved) return

      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentMethod: 'cod',
          address: buildCheckoutAddress(),
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
      const saved = await ensureAddressSaved()
      if (!saved) return

      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentMethod: 'sslcommerz',
          address: buildCheckoutAddress(),
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
              <div className="space-y-4 mb-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-foreground">Saved Addresses</h3>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setSelectedAddressId(null)
                      setFormData((prev) => ({
                        ...prev,
                        fullName: '',
                        phoneNumber: '',
                        divisionId: '',
                        districtId: '',
                        thanaId: '',
                        area: '',
                        fullAddress: '',
                        postalCode: '',
                      }))
                    }}
                  >
                    Create New
                  </Button>
                </div>

                {addressesLoading ? (
                  <p className="text-sm text-muted-foreground">Loading saved addresses...</p>
                ) : addresses.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No saved addresses found.</p>
                ) : (
                  <div className="space-y-2">
                    {addresses.map((addr) => (
                      <label
                        key={addr.id}
                        className={`flex items-start gap-3 rounded-lg border p-3 cursor-pointer ${
                          selectedAddressId === addr.id ? 'border-primary/60 bg-primary/5' : 'border-border'
                        }`}
                      >
                        <input
                          type="radio"
                          name="saved-address"
                          className="mt-1"
                          checked={selectedAddressId === addr.id}
                          onChange={() => setSelectedAddressId(addr.id)}
                        />
                        <div className="text-sm">
                          <p className="font-medium text-foreground">{addr.full_name}</p>
                          <p className="text-muted-foreground">{addr.phone_number}</p>
                          <p className="text-muted-foreground">
                            {addr.full_address}
                            {addr.area && `, ${addr.area}`}
                          </p>
                          <p className="text-muted-foreground">
                            {getThanaName(addr.thana_id)}, {getDistrictName(addr.district_id)}, {getDivisionName(addr.division_id)}
                            {addr.postal_code && ` ${addr.postal_code}`}
                          </p>
                        </div>
                      </label>
                    ))}
                  </div>
                )}
              </div>

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
                    <Select
                      value={formData.divisionId}
                      onValueChange={(value) => handleInputChange('divisionId', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select division" />
                      </SelectTrigger>
                      <SelectContent>
                        {divisions.map((div) => (
                          <SelectItem key={div.id} value={div.id}>
                            {div.name_en}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">
                      District
                    </label>
                    <Select
                      value={formData.districtId}
                      onValueChange={(value) => handleInputChange('districtId', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select district" />
                      </SelectTrigger>
                      <SelectContent>
                        {formData.divisionId &&
                          districtsByDivisionId[formData.divisionId]?.map((dist) => (
                            <SelectItem key={dist.id} value={dist.id}>
                              {dist.name_en}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">
                      Thana/Upazila
                    </label>
                    <Select
                      value={formData.thanaId}
                      onValueChange={(value) => handleInputChange('thanaId', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select thana" />
                      </SelectTrigger>
                      <SelectContent>
                        {formData.districtId &&
                          thanasByDistrictId[formData.districtId]?.map((thana) => (
                            <SelectItem key={thana.id} value={thana.id}>
                              {thana.name_en}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Area/Locality
                  </label>
                  <Input
                    placeholder="e.g., Block C, House 10"
                    value={formData.area}
                    onChange={(e) => handleInputChange('area', e.target.value)}
                  />
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

                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Postal Code
                  </label>
                  <Input
                    placeholder="e.g., 1212"
                    value={formData.postalCode}
                    onChange={(e) => handleInputChange('postalCode', e.target.value)}
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
                {selectedDivisionName && (
                  <p className="text-xs text-muted-foreground">
                    {selectedDivisionName === 'Dhaka'
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
