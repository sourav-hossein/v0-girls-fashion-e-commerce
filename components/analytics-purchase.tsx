'use client'

import { useEffect } from 'react'
import { trackEvent } from '@/lib/analytics-client'

export default function AnalyticsPurchase({ orderId }: { orderId?: string }) {
  useEffect(() => {
    if (!orderId) return
    trackEvent('purchase', { order_id: orderId, path: '/order-success' })
  }, [orderId])

  return null
}
