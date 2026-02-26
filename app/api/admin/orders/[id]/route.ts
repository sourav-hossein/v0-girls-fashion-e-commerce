import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { createAdminSupabaseClient } from '@/lib/supabase-admin'

const ALLOWED_TRANSITIONS: Record<string, string[]> = {
  pending: ['confirmed', 'cancelled', 'failed'],
  confirmed: ['processing', 'cancelled'],
  processing: ['shipped', 'cancelled'],
  shipped: ['delivered', 'cancelled'],
  delivered: [],
  cancelled: [],
  failed: [],
}

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
    return { ok: false, response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }), user: null }
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    return { ok: false, response: NextResponse.json({ error: 'Forbidden' }, { status: 403 }), user: null }
  }

  return { ok: true, user }
}

export async function GET(_: Request, context: { params: { id: string } }) {
  const auth = await requireAdminApi()
  if (!auth.ok) return auth.response

  const supabase = await createAdminSupabaseClient()
  const orderId = context.params.id

  const { data: order, error: orderError } = await supabase
    .from('orders')
    .select('*')
    .eq('id', orderId)
    .single()

  if (orderError || !order) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 })
  }

  const [itemsRes, addressRes, paymentsRes, logsRes] = await Promise.all([
    supabase
      .from('order_items')
      .select('*, product:products(name, slug), variant:product_variants(variant_type, variant_value)')
      .eq('order_id', orderId),
    supabase.from('order_addresses').select('*').eq('order_id', orderId).single(),
    supabase.from('payment_logs').select('*').eq('order_id', orderId).order('created_at', { ascending: false }),
    supabase.from('order_status_logs').select('*').eq('order_id', orderId).order('changed_at', { ascending: false }),
  ])

  return NextResponse.json({
    order,
    items: itemsRes.data || [],
    address: addressRes.data || null,
    payments: paymentsRes.data || [],
    logs: logsRes.data || [],
  })
}

export async function PATCH(request: Request, context: { params: { id: string } }) {
  const auth = await requireAdminApi()
  if (!auth.ok) return auth.response

  const body = await request.json().catch(() => ({}))
  const newStatus = String(body?.status || '').trim()
  const note = typeof body?.note === 'string' ? body.note.trim() : null

  if (!newStatus) {
    return NextResponse.json({ error: 'Status is required' }, { status: 400 })
  }

  const supabase = await createAdminSupabaseClient()
  const orderId = context.params.id

  const { data: order, error: orderError } = await supabase
    .from('orders')
    .select('*')
    .eq('id', orderId)
    .single()

  if (orderError || !order) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 })
  }

  const allowed = ALLOWED_TRANSITIONS[order.status] || []
  if (!allowed.includes(newStatus)) {
    return NextResponse.json(
      { error: `Invalid status transition from ${order.status} to ${newStatus}` },
      { status: 400 },
    )
  }

  // COD stock deduction on confirm
  if (order.payment_method === 'cod' && newStatus === 'confirmed') {
    const { data: items, error: itemsError } = await supabase
      .from('order_items')
      .select('product_id, variant_id, quantity')
      .eq('order_id', orderId)

    if (itemsError) {
      return NextResponse.json({ error: itemsError.message }, { status: 500 })
    }

    for (const item of items || []) {
      if (item.variant_id) {
        const { data: variant, error: variantError } = await supabase
          .from('product_variants')
          .select('id, stock_quantity')
          .eq('id', item.variant_id)
          .single()

        if (variantError || !variant) {
          return NextResponse.json({ error: 'Variant not found' }, { status: 400 })
        }
        if (variant.stock_quantity < item.quantity) {
          return NextResponse.json({ error: 'Insufficient variant stock' }, { status: 409 })
        }

        const { error: updateVariantError } = await supabase
          .from('product_variants')
          .update({ stock_quantity: variant.stock_quantity - item.quantity })
          .eq('id', item.variant_id)

        if (updateVariantError) {
          return NextResponse.json({ error: 'Failed to update variant stock' }, { status: 500 })
        }
      }

      if (item.product_id) {
        const { data: product, error: productError } = await supabase
          .from('products')
          .select('id, stock_quantity')
          .eq('id', item.product_id)
          .single()

        if (productError || !product) {
          return NextResponse.json({ error: 'Product not found' }, { status: 400 })
        }
        if (product.stock_quantity < item.quantity) {
          return NextResponse.json({ error: 'Insufficient product stock' }, { status: 409 })
        }

        const { error: updateProductError } = await supabase
          .from('products')
          .update({ stock_quantity: product.stock_quantity - item.quantity })
          .eq('id', item.product_id)

        if (updateProductError) {
          return NextResponse.json({ error: 'Failed to update product stock' }, { status: 500 })
        }
      }
    }
  }

  const courier = typeof body?.courier === 'string' ? body.courier.trim() : undefined
  const tracking_number =
    typeof body?.tracking_number === 'string' ? body.tracking_number.trim() : undefined

  const updatePayload: Record<string, any> = {
    status: newStatus,
    updated_at: new Date().toISOString(),
  }
  if (courier !== undefined) updatePayload.courier = courier || null
  if (tracking_number !== undefined) updatePayload.tracking_number = tracking_number || null

  const { error: updateError } = await supabase
    .from('orders')
    .update(updatePayload)
    .eq('id', orderId)

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 })
  }

  await supabase.from('order_status_logs').insert({
    order_id: orderId,
    previous_status: order.status,
    new_status: newStatus,
    changed_by_role: 'admin',
    changed_by_id: auth.user?.id ?? null,
    note,
  })

  return NextResponse.json({ success: true })
}
