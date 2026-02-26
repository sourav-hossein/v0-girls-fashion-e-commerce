'use client'

type AnalyticsEvent =
  | 'session_start'
  | 'product_view'
  | 'add_to_cart'
  | 'checkout_started'
  | 'purchase'

export async function trackEvent(
  event_type: AnalyticsEvent,
  payload: {
    path?: string
    product_id?: string
    order_id?: string
    metadata?: Record<string, any>
  } = {},
) {
  try {
    await fetch('/api/analytics/event', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event_type,
        ...payload,
      }),
    })
  } catch {
    // Ignore analytics failures
  }
}
