import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { createAdminSupabaseClient } from '@/lib/supabase-admin'
import { getDistrictName, getDivisionName, getThanaName } from '@/lib/geo-data'

async function requireAdminApi() {
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

export async function POST(request: Request) {
  const auth = await requireAdminApi()
  if (!auth.ok) return auth.response

  const body = await request.json().catch(() => ({}))
  const orderId = String(body?.order_id || '').trim()

  if (!orderId) {
    return NextResponse.json({ error: 'order_id is required' }, { status: 400 })
  }

  const supabase = await createAdminSupabaseClient()

  const { data: order } = await supabase
    .from('orders')
    .select('*')
    .eq('id', orderId)
    .single()

  if (!order) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 })
  }

  const { data: address } = await supabase
    .from('order_addresses')
    .select('*')
    .eq('order_id', orderId)
    .single()

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, phone_number')
    .eq('id', order.user_id)
    .single()

  const origin = new URL(request.url).origin
  const divisionName = address?.division ? getDivisionName(address.division) : 'Dhaka'
  const districtName = address?.district ? getDistrictName(address.district) : 'Dhaka'
  const thanaName = address?.thana ? getThanaName(address.thana) : ''
  const customerAddress = address?.full_address || 'N/A'

  const payload = {
    amount: order.total_amount,
    orderId: order.order_number,
    customerName: profile?.full_name || 'Customer',
    customerEmail: 'customer@example.com',
    customerPhone: address?.phone_number || profile?.phone_number || '01000000000',
    customerAddress: thanaName ? `${customerAddress}, ${thanaName}` : customerAddress,
    customerCity: districtName,
    customerState: divisionName,
    description: 'Payment retry',
  }

  const initResponse = await fetch(`${origin}/api/payment/initiate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  const initData = await initResponse.json()
  if (!initResponse.ok || !initData.redirectUrl) {
    return NextResponse.json({ error: initData?.error || 'Failed to initiate payment' }, { status: 500 })
  }

  await supabase.from('payment_logs').insert({
    order_id: order.id,
    transaction_id: initData.sessionKey || null,
    status: 'initiated',
    gateway_response: initData,
  })

  return NextResponse.json({ redirectUrl: initData.redirectUrl })
}
