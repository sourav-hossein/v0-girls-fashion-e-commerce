'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'

type PaymentLog = {
  id: string
  order_id: string
  status: string
  transaction_id?: string | null
  created_at: string
  order?: {
    order_number?: string
    payment_status?: string
    total_amount?: number
  }
}

type OrderSummary = {
  id: string
  order_number: string
  payment_status: string
  total_amount: number
  status: string
}

interface AdminPaymentsManagerProps {
  paymentLogs: PaymentLog[]
  failedPayments: PaymentLog[]
  missingPaymentLogs: OrderSummary[]
  mismatchedPayments: OrderSummary[]
}

export default function AdminPaymentsManager({
  paymentLogs,
  failedPayments,
  missingPaymentLogs,
  mismatchedPayments,
}: AdminPaymentsManagerProps) {
  const [retrying, setRetrying] = useState<string | null>(null)

  const handleRetry = async (orderId: string) => {
    setRetrying(orderId)
    try {
      const response = await fetch('/api/admin/payments/retry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order_id: orderId }),
      })
      const data = await response.json()
      if (!response.ok || !data.redirectUrl) {
        throw new Error(data?.error || 'Failed to retry payment')
      }
      window.open(data.redirectUrl, '_blank')
      toast.success('Payment retry link opened')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to retry payment')
    } finally {
      setRetrying(null)
    }
  }

  return (
    <div className="space-y-6">
      <Card className="border-border">
        <CardHeader className="border-b border-border">
          <CardTitle>Failed Payments</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-border">
            {failedPayments.length === 0 ? (
              <div className="p-6 text-sm text-muted-foreground">No failed payments.</div>
            ) : (
              failedPayments.map((log) => (
                <div key={log.id} className="p-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium">{log.order?.order_number || log.order_id}</p>
                    <p className="text-xs text-muted-foreground">{log.status}</p>
                  </div>
                  <Button onClick={() => handleRetry(log.order_id)} disabled={retrying === log.order_id}>
                    {retrying === log.order_id ? 'Retrying...' : 'Retry'}
                  </Button>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="border-border">
        <CardHeader className="border-b border-border">
          <CardTitle>Reconciliation: Missing Payment Logs</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-border">
            {missingPaymentLogs.length === 0 ? (
              <div className="p-6 text-sm text-muted-foreground">No missing logs.</div>
            ) : (
              missingPaymentLogs.map((order) => (
                <div key={order.id} className="p-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium">{order.order_number}</p>
                    <p className="text-xs text-muted-foreground">{order.payment_status}</p>
                  </div>
                  <Badge variant="outline">৳{order.total_amount}</Badge>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="border-border">
        <CardHeader className="border-b border-border">
          <CardTitle>Reconciliation: Status Mismatch</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-border">
            {mismatchedPayments.length === 0 ? (
              <div className="p-6 text-sm text-muted-foreground">No mismatches.</div>
            ) : (
              mismatchedPayments.map((order) => (
                <div key={order.id} className="p-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium">{order.order_number}</p>
                    <p className="text-xs text-muted-foreground">{order.payment_status}</p>
                  </div>
                  <Badge variant="outline">৳{order.total_amount}</Badge>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="border-border">
        <CardHeader className="border-b border-border">
          <CardTitle>All Payment Logs</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-border">
            {paymentLogs.length === 0 ? (
              <div className="p-6 text-sm text-muted-foreground">No payment logs.</div>
            ) : (
              paymentLogs.map((log) => (
                <div key={log.id} className="p-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium">{log.order?.order_number || log.order_id}</p>
                    <p className="text-xs text-muted-foreground">
                      {log.status} • {new Date(log.created_at).toLocaleString()}
                    </p>
                  </div>
                  <Badge variant={log.status === 'completed' ? 'default' : 'secondary'}>
                    {log.status}
                  </Badge>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
