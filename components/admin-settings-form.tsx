'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'

type StoreSettings = {
  store_name: string
  support_email?: string | null
  support_phone?: string | null
  currency_code?: string | null
  timezone?: string | null
  address_line1?: string | null
  address_line2?: string | null
  city?: string | null
  state?: string | null
  postal_code?: string | null
  country?: string | null
  flat_shipping_rate?: number | null
  free_shipping_threshold?: number | null
  cod_enabled?: boolean | null
  sslcommerz_enabled?: boolean | null
  order_notification_emails?: string[] | null
  low_stock_default_threshold?: number | null
  theme?: 'rose' | 'lavender' | 'ocean' | null
}

const emptySettings: StoreSettings = {
  store_name: '',
  support_email: '',
  support_phone: '',
  currency_code: 'BDT',
  timezone: 'Asia/Dhaka',
  address_line1: '',
  address_line2: '',
  city: '',
  state: '',
  postal_code: '',
  country: '',
  flat_shipping_rate: 60,
  free_shipping_threshold: null,
  cod_enabled: true,
  sslcommerz_enabled: true,
  order_notification_emails: [],
  low_stock_default_threshold: 10,
  theme: 'rose',
}

export default function AdminSettingsForm() {
  const [settings, setSettings] = useState<StoreSettings>(emptySettings)
  const [emailsText, setEmailsText] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const loadSettings = async () => {
      setLoading(true)
      try {
        const response = await fetch('/api/admin/settings')
        const payload = await response.json().catch(() => ({}))
        if (!response.ok) {
          throw new Error(payload?.error || 'Failed to load settings')
        }
        setSettings(payload.settings || emptySettings)
        setEmailsText((payload.settings?.order_notification_emails || []).join(', '))
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Failed to load settings')
      } finally {
        setLoading(false)
      }
    }

    loadSettings()
  }, [])

  const handleSave = async () => {
    setSaving(true)
    try {
      const response = await fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...settings,
          order_notification_emails: emailsText,
        }),
      })
      const payload = await response.json().catch(() => ({}))
      if (!response.ok) {
        throw new Error(payload?.error || 'Failed to update settings')
      }
      setSettings(payload.settings || settings)
      setEmailsText((payload.settings?.order_notification_emails || []).join(', '))
      toast.success('Settings updated')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update settings')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <p className="text-sm text-muted-foreground">Loading settings...</p>
  }

  return (
    <div className="space-y-6">
      <Card className="border-border">
        <CardHeader className="border-b border-border">
          <CardTitle>Store Profile</CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <div className="space-y-2">
            <Label>Brand Theme</Label>
            <Select
              value={settings.theme || 'rose'}
              onValueChange={(value: 'rose' | 'lavender' | 'ocean') =>
                setSettings({ ...settings, theme: value })
              }
            >
              <SelectTrigger className="w-full md:w-72">
                <SelectValue placeholder="Select theme" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="rose">Rose</SelectItem>
                <SelectItem value="lavender">Lavender</SelectItem>
                <SelectItem value="ocean">Ocean</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Theme presets are managed globally. Users can only toggle dark mode.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Store Name</Label>
              <Input
                value={settings.store_name}
                onChange={(e) => setSettings({ ...settings, store_name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Support Email</Label>
              <Input
                value={settings.support_email || ''}
                onChange={(e) => setSettings({ ...settings, support_email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Support Phone</Label>
              <Input
                value={settings.support_phone || ''}
                onChange={(e) => setSettings({ ...settings, support_phone: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Currency Code</Label>
              <Input
                value={settings.currency_code || ''}
                onChange={(e) => setSettings({ ...settings, currency_code: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Timezone</Label>
              <Input
                value={settings.timezone || ''}
                onChange={(e) => setSettings({ ...settings, timezone: e.target.value })}
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Address Line 1</Label>
              <Input
                value={settings.address_line1 || ''}
                onChange={(e) => setSettings({ ...settings, address_line1: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Address Line 2</Label>
              <Input
                value={settings.address_line2 || ''}
                onChange={(e) => setSettings({ ...settings, address_line2: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>City</Label>
              <Input
                value={settings.city || ''}
                onChange={(e) => setSettings({ ...settings, city: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>State</Label>
              <Input
                value={settings.state || ''}
                onChange={(e) => setSettings({ ...settings, state: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Postal Code</Label>
              <Input
                value={settings.postal_code || ''}
                onChange={(e) => setSettings({ ...settings, postal_code: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Country</Label>
              <Input
                value={settings.country || ''}
                onChange={(e) => setSettings({ ...settings, country: e.target.value })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border">
        <CardHeader className="border-b border-border">
          <CardTitle>Shipping</CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Flat Shipping Rate</Label>
              <Input
                type="number"
                min={0}
                value={settings.flat_shipping_rate ?? 0}
                onChange={(e) =>
                  setSettings({ ...settings, flat_shipping_rate: Number(e.target.value) })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Free Shipping Threshold</Label>
              <Input
                type="number"
                min={0}
                value={settings.free_shipping_threshold ?? ''}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    free_shipping_threshold: e.target.value ? Number(e.target.value) : null,
                  })
                }
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border">
        <CardHeader className="border-b border-border">
          <CardTitle>Payments</CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-3">
          <label className="flex items-center justify-between border border-border rounded-lg p-4">
            <div>
              <p className="font-medium">Cash on Delivery</p>
              <p className="text-xs text-muted-foreground">Enable COD payments</p>
            </div>
            <Switch
              checked={settings.cod_enabled !== false}
              onCheckedChange={(value) => setSettings({ ...settings, cod_enabled: value })}
            />
          </label>
          <label className="flex items-center justify-between border border-border rounded-lg p-4">
            <div>
              <p className="font-medium">SSLCommerz</p>
              <p className="text-xs text-muted-foreground">Enable online payments</p>
            </div>
            <Switch
              checked={settings.sslcommerz_enabled !== false}
              onCheckedChange={(value) => setSettings({ ...settings, sslcommerz_enabled: value })}
            />
          </label>
        </CardContent>
      </Card>

      <Card className="border-border">
        <CardHeader className="border-b border-border">
          <CardTitle>Notifications</CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <div className="space-y-2">
            <Label>Order Notification Emails</Label>
            <Textarea
              value={emailsText}
              onChange={(e) => setEmailsText(e.target.value)}
              placeholder="email1@example.com, email2@example.com"
              rows={3}
            />
            <p className="text-xs text-muted-foreground">
              Separate multiple emails with commas.
            </p>
          </div>
          <div className="space-y-2">
            <Label>Default Low Stock Threshold</Label>
            <Input
              type="number"
              min={0}
              value={settings.low_stock_default_threshold ?? 10}
              onChange={(e) =>
                setSettings({ ...settings, low_stock_default_threshold: Number(e.target.value) })
              }
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving}>
          {saving ? 'Saving...' : 'Save Settings'}
        </Button>
      </div>
    </div>
  )
}
