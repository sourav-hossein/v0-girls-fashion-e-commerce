'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'

type Coupon = {
  id: string
  code: string
  discount_percent: number
  max_discount_amount?: number | null
  min_purchase_amount?: number | null
  valid_from: string
  valid_to: string
  usage_limit?: number | null
  used_count?: number | null
  active?: boolean | null
}

interface AdminCouponsManagerProps {
  initialCoupons: Coupon[]
}

const emptyForm = {
  code: '',
  discount_percent: '',
  max_discount_amount: '',
  min_purchase_amount: '',
  valid_from: '',
  valid_to: '',
  usage_limit: '',
  active: true,
}

export default function AdminCouponsManager({ initialCoupons }: AdminCouponsManagerProps) {
  const [coupons, setCoupons] = useState<Coupon[]>(initialCoupons)
  const [form, setForm] = useState({ ...emptyForm })
  const [isSaving, setIsSaving] = useState(false)

  const handleCreate = async () => {
    if (!form.code || !form.discount_percent || !form.valid_from || !form.valid_to) {
      toast.error('Please fill required fields')
      return
    }

    setIsSaving(true)
    try {
      const response = await fetch('/api/admin/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: form.code,
          discount_percent: Number(form.discount_percent),
          max_discount_amount: form.max_discount_amount ? Number(form.max_discount_amount) : null,
          min_purchase_amount: form.min_purchase_amount ? Number(form.min_purchase_amount) : null,
          valid_from: form.valid_from,
          valid_to: form.valid_to,
          usage_limit: form.usage_limit ? Number(form.usage_limit) : null,
          active: form.active,
        }),
      })
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data?.error || 'Failed to create coupon')
      }
      setCoupons((prev) => [data.coupon, ...prev])
      setForm({ ...emptyForm })
      toast.success('Coupon created')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create coupon')
    } finally {
      setIsSaving(false)
    }
  }

  const handleToggle = async (coupon: Coupon) => {
    try {
      const response = await fetch(`/api/admin/coupons/${coupon.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: !coupon.active }),
      })
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data?.error || 'Failed to update coupon')
      }
      setCoupons((prev) => prev.map((c) => (c.id === coupon.id ? data.coupon : c)))
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update coupon')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this coupon?')) return
    try {
      const response = await fetch(`/api/admin/coupons/${id}`, { method: 'DELETE' })
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data?.error || 'Failed to delete coupon')
      }
      setCoupons((prev) => prev.filter((c) => c.id !== id))
      toast.success('Coupon deleted')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete coupon')
    }
  }

  return (
    <div className="space-y-6">
      <Card className="border-border">
        <CardHeader className="border-b border-border">
          <CardTitle>Create Coupon</CardTitle>
        </CardHeader>
        <CardContent className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label>Code *</Label>
            <Input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} />
          </div>
          <div className="space-y-2">
            <Label>Discount % *</Label>
            <Input
              type="number"
              min={0}
              value={form.discount_percent}
              onChange={(e) => setForm({ ...form, discount_percent: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>Usage Limit</Label>
            <Input
              type="number"
              min={0}
              value={form.usage_limit}
              onChange={(e) => setForm({ ...form, usage_limit: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>Min Purchase</Label>
            <Input
              type="number"
              min={0}
              value={form.min_purchase_amount}
              onChange={(e) => setForm({ ...form, min_purchase_amount: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>Max Discount</Label>
            <Input
              type="number"
              min={0}
              value={form.max_discount_amount}
              onChange={(e) => setForm({ ...form, max_discount_amount: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>Valid From *</Label>
            <Input type="date" value={form.valid_from} onChange={(e) => setForm({ ...form, valid_from: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>Valid To *</Label>
            <Input type="date" value={form.valid_to} onChange={(e) => setForm({ ...form, valid_to: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>Active</Label>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.active}
                onChange={(e) => setForm({ ...form, active: e.target.checked })}
              />
              <span className="text-sm text-muted-foreground">Enable coupon</span>
            </div>
          </div>
          <div className="md:col-span-3">
            <Button onClick={handleCreate} disabled={isSaving}>
              {isSaving ? 'Creating...' : 'Create Coupon'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border">
        <CardHeader className="border-b border-border">
          <CardTitle>Existing Coupons</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-border">
            {coupons.length === 0 ? (
              <div className="p-6 text-sm text-muted-foreground">No coupons found.</div>
            ) : (
              coupons.map((coupon) => (
                <div key={coupon.id} className="p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <p className="font-medium">{coupon.code}</p>
                    <p className="text-xs text-muted-foreground">
                      {coupon.discount_percent}% • Used {coupon.used_count || 0}
                      {coupon.usage_limit ? ` / ${coupon.usage_limit}` : ''}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {coupon.valid_from} → {coupon.valid_to}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => handleToggle(coupon)}>
                      {coupon.active ? 'Disable' : 'Enable'}
                    </Button>
                    <Button variant="destructive" onClick={() => handleDelete(coupon.id)}>
                      Delete
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
