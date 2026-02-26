'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'

const STATUS_FLOW: Record<string, string[]> = {
  pending: ['confirmed', 'cancelled', 'failed'],
  confirmed: ['processing', 'cancelled'],
  processing: ['shipped', 'cancelled'],
  shipped: ['delivered', 'cancelled'],
  delivered: [],
  cancelled: [],
  failed: [],
}

type OrderDetail = {
  id: string
  order_number: string
  status: string
  payment_status: string
  payment_method: string
  total_amount: number
  courier?: string | null
  tracking_number?: string | null
  created_at: string
}

type OrderItem = {
  id: string
  product_id: string | null
  variant_id: string | null
  quantity: number
  price_at_purchase: number
  product?: { name: string; slug: string }
  variant?: { variant_type: string; variant_value: string }
}

type OrderAddress = {
  full_address: string
  phone_number: string
  division: string
  district: string
  thana: string
}

type PaymentLog = {
  id: string
  status: string
  transaction_id?: string | null
  created_at: string
}

type StatusLog = {
  id: string
  previous_status?: string | null
  new_status: string
  note?: string | null
  changed_at: string
}

interface AdminOrderDetailProps {
  order: OrderDetail
  items: OrderItem[]
  address: OrderAddress | null
  payments: PaymentLog[]
  logs: StatusLog[]
}

export default function AdminOrderDetail({
  order,
  items,
  address,
  payments,
  logs,
}: AdminOrderDetailProps) {
  const [status, setStatus] = useState(order.status)
  const [note, setNote] = useState('')
  const [courier, setCourier] = useState(order.courier || '')
  const [trackingNumber, setTrackingNumber] = useState(order.tracking_number || '')
  const [saving, setSaving] = useState(false)

  const allowedNext = STATUS_FLOW[order.status] || []
  const canChange = allowedNext.includes(status) && status !== order.status
  const trackingChanged =
    courier !== (order.courier || '') || trackingNumber !== (order.tracking_number || '')

  const handleUpdate = async () => {
    if (!canChange) return
    setSaving(true)
    try {
      const response = await fetch(`/api/admin/orders/${order.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status,
          note,
          courier,
          tracking_number: trackingNumber,
        }),
      })
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data?.error || 'Failed to update order')
      }
      toast.success('Order updated')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update order')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card className="border-border">
        <CardHeader className="border-b border-border">
          <CardTitle>Order #{order.order_number}</CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <div className="flex flex-wrap gap-3 items-center">
            <Badge variant="secondary">{order.status}</Badge>
            <Badge className={order.payment_status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
              {order.payment_status}
            </Badge>
            <span className="text-sm text-muted-foreground">
              {new Date(order.created_at).toLocaleString()}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-xs uppercase text-muted-foreground">Payment Method</p>
              <p className="font-medium">{order.payment_method}</p>
            </div>
            <div>
              <p className="text-xs uppercase text-muted-foreground">Total</p>
              <p className="font-medium">৳{order.total_amount}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border">
        <CardHeader className="border-b border-border">
          <CardTitle>Update Status</CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-56">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="processing">Processing</SelectItem>
              <SelectItem value="shipped">Shipped</SelectItem>
              <SelectItem value="delivered">Delivered</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
            </SelectContent>
          </Select>
          <Textarea
            placeholder="Optional note for status change"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Courier</label>
              <Input
                value={courier}
                onChange={(e) => setCourier(e.target.value)}
                placeholder="Pathao / RedX / Paperfly"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Tracking Number</label>
              <Input
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                placeholder="Tracking ID"
              />
            </div>
          </div>
          <Button onClick={handleUpdate} disabled={saving || (!canChange && !trackingChanged)}>
            {saving ? 'Updating...' : 'Save Changes'}
          </Button>
          {!allowedNext.includes(status) && status !== order.status && (
            <p className="text-sm text-destructive">Invalid transition from {order.status} to {status}</p>
          )}
        </CardContent>
      </Card>

      <Card className="border-border">
        <CardHeader className="border-b border-border">
          <CardTitle>Items</CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-3">
          {items.length === 0 ? (
            <p className="text-sm text-muted-foreground">No items found.</p>
          ) : (
            items.map((item) => (
              <div key={item.id} className="flex justify-between text-sm">
                <div>
                  <p className="font-medium">
                    {item.product?.name || 'Product'}
                    {item.variant ? ` • ${item.variant.variant_type}: ${item.variant.variant_value}` : ''}
                  </p>
                  <p className="text-muted-foreground">Qty: {item.quantity}</p>
                </div>
                <div className="font-medium">৳{item.price_at_purchase}</div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Card className="border-border">
        <CardHeader className="border-b border-border">
          <CardTitle>Shipping Address</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {address ? (
            <div className="text-sm space-y-1">
              <p>{address.full_address}</p>
              <p>{address.thana}, {address.district}, {address.division}</p>
              <p>{address.phone_number}</p>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No address found.</p>
          )}
        </CardContent>
      </Card>

      <Card className="border-border">
        <CardHeader className="border-b border-border">
          <CardTitle>Payment Logs</CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-2">
          {payments.length === 0 ? (
            <p className="text-sm text-muted-foreground">No payment logs.</p>
          ) : (
            payments.map((log) => (
              <div key={log.id} className="text-sm flex justify-between">
                <span>{log.status}</span>
                <span className="text-muted-foreground">{new Date(log.created_at).toLocaleString()}</span>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Card className="border-border">
        <CardHeader className="border-b border-border">
          <CardTitle>Status History</CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-2">
          {logs.length === 0 ? (
            <p className="text-sm text-muted-foreground">No status history.</p>
          ) : (
            logs.map((log) => (
              <div key={log.id} className="text-sm">
                <p>
                  {log.previous_status || '—'} → {log.new_status}
                </p>
                {log.note && <p className="text-muted-foreground">{log.note}</p>}
                <p className="text-xs text-muted-foreground">{new Date(log.changed_at).toLocaleString()}</p>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  )
}
