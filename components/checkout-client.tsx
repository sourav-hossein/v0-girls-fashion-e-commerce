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
import { Label } from './ui/label'
import { trackEvent } from '@/lib/analytics-client'
import { useT } from '@/hooks/use-t'

const DEFAULT_FLAT_SHIPPING_RATE = 60

type CheckoutSettings = {
  flat_shipping_rate?: number | null
  free_shipping_threshold?: number | null
  cod_enabled?: boolean | null
  sslcommerz_enabled?: boolean | null
}

interface UserAddress {
  id: string
  full_name: string
  phone_number: string
  division_id: string
  district_id: string
  thana_id: string
  area?: string
  full_address: string
  is_default: boolean
}

export default function CheckoutClient({ settings }: { settings?: CheckoutSettings }) {
  const { t } = useT()
  const router = useRouter()
  const [paymentMethod, setPaymentMethod] = useState<'sslcommerz' | 'cod'>('cod')
  const [isLoading, setIsLoading] = useState(false)
  const [orderPlaced, setOrderPlaced] = useState(false)
  const [cartItems, setCartItems] = useState<any[]>([])
  const [cartLoading, setCartLoading] = useState(true)
  const [selectedCartItemIds, setSelectedCartItemIds] = useState<string[] | null>(null)
  const [addressesLoading, setAddressesLoading] = useState(true)
  const [addresses, setAddresses] = useState<UserAddress[]>([])
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    full_name: '',
    phone_number: '',
    division_id: '',
    district_id: '',
    thana_id: '',
    area: '',
    full_address: '',
  })

  const codEnabled = settings?.cod_enabled !== false
  const sslcommerzEnabled = settings?.sslcommerz_enabled !== false

  useEffect(() => {
    if (!codEnabled && sslcommerzEnabled) {
      setPaymentMethod('sslcommerz')
    }
    if (!sslcommerzEnabled && codEnabled) {
      setPaymentMethod('cod')
    }
  }, [codEnabled, sslcommerzEnabled])

  useEffect(() => {
    trackEvent('checkout_started', { path: '/checkout' })
    const loadCart = async () => {
      try {
        const response = await fetch('/api/cart')
        if (!response.ok) {
          throw new Error('Failed to load cart')
        }
        const data = await response.json()
        setCartItems(data || [])
      } catch (error) {
        toast.error(t('checkout.cartLoadFailed'))
      } finally {
        setCartLoading(false)
      }
    }

    loadCart()
  }, [t])

  useEffect(() => {
    const storedSelection = sessionStorage.getItem('checkout:selectedCartItemIds')
    if (!storedSelection) return
    try {
      const parsed = JSON.parse(storedSelection)
      if (Array.isArray(parsed)) {
        setSelectedCartItemIds(parsed.map((id) => String(id)))
      } else {
        sessionStorage.removeItem('checkout:selectedCartItemIds')
      }
    } catch (error) {
      sessionStorage.removeItem('checkout:selectedCartItemIds')
    }
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
        toast.error(error instanceof Error ? error.message : t('checkout.addressLoadFailed'))
      } finally {
        setAddressesLoading(false)
      }
    }

    loadAddresses()
  }, [t])

  useEffect(() => {
    if (!selectedAddressId) return
    const selected = addresses.find((addr) => addr.id === selectedAddressId)
    if (!selected) return
    setFormData((prev) => ({
      ...prev,
      full_name: selected.full_name,
      phone_number: selected.phone_number,
      division_id: String(selected.division_id || ''),
      district_id: String(selected.district_id || ''),
      thana_id: String(selected.thana_id || ''),
      area: selected.area || '',
      full_address: selected.full_address,
    }))
  }, [selectedAddressId, addresses])

  const selectionActive = selectedCartItemIds !== null
  const selectedIdSet = selectionActive ? new Set(selectedCartItemIds) : null
  const checkoutItems = selectionActive
    ? cartItems.filter((item) => selectedIdSet?.has(item.id))
    : cartItems

  const subtotal = checkoutItems.reduce((sum, item) => {
    const price = item.product?.discount_price ?? item.product?.price ?? 0
    return sum + price * (item.quantity || 1)
  }, 0)

  const divisionExists = !!formData.division_id && divisions.some((div) => div.id === formData.division_id)
  const districtExists =
    !!formData.division_id &&
    !!formData.district_id &&
    districtsByDivisionId[formData.division_id]?.some((dist) => dist.id === formData.district_id)
  const thanaExists =
    !!formData.district_id &&
    !!formData.thana_id &&
    thanasByDistrictId[formData.district_id]?.some((thana) => thana.id === formData.thana_id)
  const hasMissingGeo = selectedAddressId && (!divisionExists || !districtExists || !thanaExists)

  const flatRate = typeof settings?.flat_shipping_rate === 'number'
    ? settings.flat_shipping_rate
    : DEFAULT_FLAT_SHIPPING_RATE
  const freeThreshold = typeof settings?.free_shipping_threshold === 'number'
    ? settings.free_shipping_threshold
    : null
  const deliveryCharge = freeThreshold !== null && subtotal >= freeThreshold ? 0 : flatRate
  const total = subtotal + deliveryCharge

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => {
      if (field === 'division_id') {
        return { ...prev, division_id: value, district_id: '', thana_id: '' }
      }
      if (field === 'district_id') {
        return { ...prev, district_id: value, thana_id: '' }
      }
      return { ...prev, [field]: value }
    })
  }

  const validateForm = () => {
    if (
      !formData.full_name ||
      !formData.phone_number ||
      !formData.division_id ||
      !formData.district_id ||
      !formData.thana_id ||
      !formData.full_address
    ) {
      toast.error(t('checkout.fillRequired'))
      return false
    }

    const phoneRegex = /^01[0-9]{9}$/
    if (!phoneRegex.test(formData.phone_number)) {
      toast.error(t('checkout.invalidPhone'))
      return false
    }

    if (checkoutItems.length === 0) {
      toast.error(selectionActive ? t('checkout.selectedEmpty') : t('checkout.emptyCart'))
      return false
    }

    return true
  }

  const isFormDifferent = (address: UserAddress) => {
    return (
      address.full_name !== formData.full_name ||
      address.phone_number !== formData.phone_number ||
      address.division_id !== formData.division_id ||
      address.district_id !== formData.district_id ||
      address.thana_id !== formData.thana_id ||
      (address.area || '') !== (formData.area || '') ||
      address.full_address !== formData.full_address
    )
  }

  const buildAddressPayload = () => ({
    full_name: formData.full_name,
    phone_number: formData.phone_number,
    division_id: formData.division_id,
    district_id: formData.district_id,
    thana_id: formData.thana_id,
    area: formData.area || null,
    full_address: formData.full_address,
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
        toast.error(data?.message || t('checkout.addressUpdateFailed'))
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
      toast.error(data?.message || t('checkout.addressSaveFailed'))
      return false
    }
    return true
  }

  const buildCheckoutAddress = () => {
    const division = getDivisionName(formData.division_id)
    const district = getDistrictName(formData.district_id)
    const thana = getThanaName(formData.thana_id)
    const full_address = [formData.full_address, formData.area]
      .filter(Boolean)
      .join(', ')

    return {
      full_name: formData.full_name,
      phone_number: formData.phone_number,
      division,
      district,
      thana,
      full_address,
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
          selectedCartItemIds: selectedCartItemIds ?? undefined,
        }),
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || t('checkout.orderFailed'))
      }

      setOrderPlaced(true)
      sessionStorage.removeItem('checkout:selectedCartItemIds')
      toast.success(t('checkout.orderPlaced'))
      setTimeout(() => {
        router.push(`/order-success?orderId=${data.orderId}`)
      }, 1500)
    } catch (error) {
      toast.error(t('checkout.orderFailed'))
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
          selectedCartItemIds: selectedCartItemIds ?? undefined,
        }),
      })

      const data = await response.json()
      if (!response.ok || !data.redirectUrl) {
        throw new Error(data.error || t('checkout.paymentFailed'))
      }

      toast.success(t('checkout.paymentRedirect'))
      sessionStorage.removeItem('checkout:selectedCartItemIds')
      window.location.href = data.redirectUrl
    } catch (error) {
      toast.error(t('checkout.paymentFailed'))
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
              {t('checkout.orderPlacedTitle')}
            </h2>
            <p className="text-muted-foreground mb-6">
              {t('checkout.orderPlacedBody')}
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-serif font-bold text-foreground mb-8">
        {t('checkout.title')}
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card className="border-border">
            <CardHeader className="border-b border-border">
              <CardTitle>{t('checkout.shippingAddress')}</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4 mb-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-foreground">{t('checkout.savedAddresses')}</h3>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setSelectedAddressId(null)
                      setFormData((prev) => ({
                        ...prev,
                        full_name: '',
                        phone_number: '',
                        division_id: '',
                        district_id: '',
                        thana_id: '',
                        area: '',
                        full_address: '',
                      }))
                    }}
                  >
                    {t('checkout.createNew')}
                  </Button>
                </div>

                {addressesLoading ? (
                  <p className="text-sm text-muted-foreground">{t('checkout.loadingSavedAddresses')}</p>
                ) : addresses.length === 0 ? (
                  <p className="text-sm text-muted-foreground">{t('checkout.noSavedAddresses')}</p>
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
                          </p>
                        </div>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {hasMissingGeo && (
                <div className="mb-4 rounded-lg border border-yellow-300 bg-yellow-50 px-4 py-3 text-sm text-yellow-900">
                  <p className="font-medium">{t('checkout.locationMissingTitle')}</p>
                  <p className="mt-1">{t('checkout.locationMissingBody')}</p>
                  <Button
                    type="button"
                    variant="outline"
                    className="mt-3"
                    onClick={() =>
                      setFormData((prev) => ({
                        ...prev,
                        division_id: '',
                        district_id: '',
                        thana_id: '',
                      }))
                    }
                  >
                    {t('checkout.resetLocationFields')}
                  </Button>
                </div>
              )}

              <form className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="full_name">{t('forms.fullName')} *</Label>
                  <Input
                    id="full_name"
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone_number">{t('forms.phoneNumber')} *</Label>
                  <Input
                    id="phone_number"
                    value={formData.phone_number}
                    onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="division">{t('forms.division')} *</Label>
                    <Select
                      value={formData.division_id}
                      onValueChange={(value) => handleInputChange('division_id', value)}
                    >
                      <SelectTrigger id="division">
                        <SelectValue placeholder={t('common.select')} />
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

                  <div className="space-y-2">
                    <Label htmlFor="district">{t('forms.district')} *</Label>
                    <Select
                      value={formData.district_id}
                      onValueChange={(value) => handleInputChange('district_id', value)}
                    >
                      <SelectTrigger id="district">
                        <SelectValue placeholder={t('common.select')} />
                      </SelectTrigger>
                      <SelectContent>
                        {formData.division_id &&
                          districtsByDivisionId[formData.division_id]?.map((dist) => (
                            <SelectItem key={dist.id} value={dist.id}>
                              {dist.name_en}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="thana">{t('forms.thana')} *</Label>
                  <Select
                    value={formData.thana_id}
                    onValueChange={(value) => handleInputChange('thana_id', value)}
                  >
                    <SelectTrigger id="thana">
                      <SelectValue placeholder={t('common.select')} />
                    </SelectTrigger>
                    <SelectContent>
                      {formData.district_id &&
                        thanasByDistrictId[formData.district_id]?.map((thana) => (
                          <SelectItem key={thana.id} value={thana.id}>
                            {thana.name_en}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="area">{t('forms.area')}</Label>
                  <Input
                    id="area"
                    value={formData.area}
                    onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                    placeholder={t('checkout.areaPlaceholder')}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="full_address">{t('forms.fullAddress')} *</Label>
                  <textarea
                    id="full_address"
                    value={formData.full_address}
                    onChange={(e) => setFormData({ ...formData, full_address: e.target.value })}
                    className="w-full px-3 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    rows={3}
                    placeholder={t('checkout.addressPlaceholder')}
                    required
                  />
                </div>
              </form>
            </CardContent>
          </Card>

          <Card className="border-border mt-6">
            <CardHeader className="border-b border-border">
              <CardTitle>{t('checkout.paymentMethod')}</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <Tabs value={paymentMethod} onValueChange={(value) => setPaymentMethod(value as 'sslcommerz' | 'cod')}>
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="cod" disabled={!codEnabled}>{t('checkout.cashOnDelivery')}</TabsTrigger>
                  <TabsTrigger value="sslcommerz" disabled={!sslcommerzEnabled}>{t('checkout.onlinePayment')}</TabsTrigger>
                </TabsList>

                <TabsContent value="cod" className="space-y-4">
                  <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
                    <p className="text-sm text-foreground">
                      {t('checkout.codHint')}
                    </p>
                  </div>
                  <Button
                    onClick={handleCODSubmit}
                    disabled={!codEnabled || isLoading || cartLoading || checkoutItems.length === 0}
                    className="w-full bg-primary hover:bg-primary/90 h-12 text-primary-foreground"
                  >
                    {isLoading ? t('checkout.processing') : t('checkout.placeOrder')}
                  </Button>
                  {!codEnabled && (
                    <p className="text-xs text-muted-foreground">
                      {t('checkout.codDisabled')}
                    </p>
                  )}
                </TabsContent>

                <TabsContent value="sslcommerz" className="space-y-4">
                  <div className="p-4 bg-accent/5 border border-accent/20 rounded-lg">
                    <div className="flex gap-2 items-start">
                      <Lock className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-foreground">{t('checkout.securePayment')}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {t('checkout.securePaymentDesc')}
                        </p>
                      </div>
                    </div>
                  </div>
                  <Button
                    onClick={handleSSLCommerzSubmit}
                    disabled={!sslcommerzEnabled || isLoading || cartLoading || checkoutItems.length === 0}
                    className="w-full bg-accent hover:bg-accent/90 h-12 text-accent-foreground"
                  >
                    {isLoading ? t('checkout.processing') : t('checkout.sslButton')}
                  </Button>
                  {!sslcommerzEnabled && (
                    <p className="text-xs text-muted-foreground">
                      {t('checkout.onlineDisabled')}
                    </p>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        <div className="h-fit">
          <Card className="border-border sticky top-20">
            <CardHeader className="border-b border-border">
              <CardTitle>{t('checkout.orderSummary')}</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              {selectionActive && (
                <div className="rounded-lg border border-primary/20 bg-primary/5 p-3 text-xs text-primary">
                  {t('checkout.selectedNotice')} {checkoutItems.length}
                </div>
              )}
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{t('common.subtotal')}</span>
                  <span className="font-medium">৳{subtotal}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{t('checkout.deliveryCharge')}</span>
                  <span className="font-medium">৳{deliveryCharge}</span>
                </div>
                {freeThreshold !== null && subtotal >= freeThreshold && (
                  <p className="text-xs text-muted-foreground">
                    {t('checkout.freeShippingApplied')} (৳{freeThreshold})
                  </p>
                )}
              </div>

              <div className="border-t border-border pt-4">
                <div className="flex justify-between text-lg font-bold">
                  <span>{t('common.total')}</span>
                  <span className="text-primary">৳{total}</span>
                </div>
              </div>

              <div className="bg-muted/30 p-4 rounded-lg space-y-2 text-sm">
                <h4 className="font-semibold text-foreground mb-3">{t('checkout.yourOrder')}</h4>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t('checkout.items')} ({checkoutItems.length})</span>
                  <span>৳{subtotal}</span>
                </div>
              </div>

              <div className="p-4 bg-primary/5 border border-primary/10 rounded-lg text-xs text-muted-foreground space-y-2">
                <p>
                  <strong>{t('checkout.noteTitle')}</strong> {t('checkout.noteBody')}
                </p>
              </div>

              <Link href="/cart">
                <Button variant="outline" className="w-full border-border">
                  {t('checkout.backToCart')}
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
