import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { createAdminSupabaseClient } from '@/lib/supabase-admin'

async function assertAdmin() {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          )
        },
      },
    },
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { ok: false, response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    return { ok: false, response: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) }
  }

  return { ok: true }
}

function getRangeStart(range: string) {
  const now = new Date()
  if (range === '7d') {
    return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  }
  if (range === 'mtd') {
    return new Date(now.getFullYear(), now.getMonth(), 1)
  }
  return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
}

export async function GET(request: Request) {
  const auth = await assertAdmin()
  if (!auth.ok) return auth.response

  const { searchParams } = new URL(request.url)
  const range = searchParams.get('range') || '30d'
  const rangeStart = getRangeStart(range)
  const rangeIso = rangeStart.toISOString()

  const supabase = await createAdminSupabaseClient()

  const [{ data: orders }, { data: payments }, { data: products }, { data: events }] =
    await Promise.all([
      supabase
        .from('orders')
        .select('id, total_amount, payment_status, payment_method, created_at')
        .gte('created_at', rangeIso),
      supabase
        .from('payment_logs')
        .select('status, created_at')
        .gte('created_at', rangeIso),
      supabase
        .from('products')
        .select('stock_quantity, low_stock_threshold, deleted_at')
        .is('deleted_at', null),
      supabase
        .from('analytics_events')
        .select('event_type, session_id, created_at')
        .gte('created_at', rangeIso),
    ])

  const completedOrders = (orders || []).filter((order) => order.payment_status === 'completed')
  const totalRevenue = completedOrders.reduce((sum, order) => sum + Number(order.total_amount || 0), 0)
  const totalOrders = (orders || []).length
  const averageOrderValue = completedOrders.length > 0 ? totalRevenue / completedOrders.length : 0
  const codOrders = completedOrders.filter((order) => order.payment_method === 'cod').length
  const codShare = completedOrders.length > 0 ? (codOrders / completedOrders.length) * 100 : 0

  const successfulPayments = (payments || []).filter((log) => log.status === 'completed').length
  const paymentSuccessRate = (payments || []).length
    ? (successfulPayments / payments.length) * 100
    : 0

  const trendMap = new Map<string, { revenue: number; orders: number }>()
  for (const order of orders || []) {
    const dateKey = new Date(order.created_at).toISOString().slice(0, 10)
    const entry = trendMap.get(dateKey) || { revenue: 0, orders: 0 }
    entry.orders += 1
    if (order.payment_status === 'completed') {
      entry.revenue += Number(order.total_amount || 0)
    }
    trendMap.set(dateKey, entry)
  }
  const trend = Array.from(trendMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, entry]) => ({ date, ...entry }))

  const { data: settings } = await supabase
    .from('store_settings')
    .select('low_stock_default_threshold')
    .order('updated_at', { ascending: false })
    .limit(1)
    .maybeSingle()
  const defaultThreshold = settings?.low_stock_default_threshold ?? 10
  const lowStockCount = (products || []).filter((product) => {
    const threshold = product.low_stock_threshold ?? defaultThreshold
    return product.stock_quantity > 0 && product.stock_quantity <= threshold
  }).length
  const outOfStockCount = (products || []).filter((product) => product.stock_quantity === 0).length

  const orderIds = completedOrders.map((order) => order.id)
  let topProducts: Array<{ product_id: string; name: string; slug: string; revenue: number; quantity: number }> = []
  if (orderIds.length > 0) {
    const { data: orderItems } = await supabase
      .from('order_items')
      .select('product_id, quantity, price_at_purchase, product:products(name, slug)')
      .in('order_id', orderIds)
    const map = new Map<string, { name: string; slug: string; revenue: number; quantity: number }>()
    for (const item of orderItems || []) {
      if (!item.product_id || !item.product) continue
      const entry = map.get(item.product_id) || {
        name: item.product.name,
        slug: item.product.slug,
        revenue: 0,
        quantity: 0,
      }
      entry.quantity += Number(item.quantity || 0)
      entry.revenue += Number(item.price_at_purchase || 0) * Number(item.quantity || 0)
      map.set(item.product_id, entry)
    }
    topProducts = Array.from(map.entries())
      .map(([product_id, entry]) => ({
        product_id,
        ...entry,
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 8)
  }

  const funnelEvents = ['session_start', 'product_view', 'add_to_cart', 'checkout_started', 'purchase']
  const funnel = funnelEvents.map((eventType) => {
    const sessions = new Set(
      (events || [])
        .filter((event) => event.event_type === eventType)
        .map((event) => event.session_id),
    )
    return { event: eventType, sessions: sessions.size }
  })

  return NextResponse.json({
    range,
    kpis: {
      revenue: totalRevenue,
      orders: totalOrders,
      aov: averageOrderValue,
      cod_share: codShare,
      payment_success_rate: paymentSuccessRate,
    },
    trend,
    top_products: topProducts,
    inventory: {
      low_stock: lowStockCount,
      out_of_stock: outOfStockCount,
    },
    funnel,
  })
}
