import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { generateOrderReference } from '@/lib/sslcommerz'
import { createAdminSupabaseClient } from '@/lib/supabase-admin'

type PaymentMethod = 'sslcommerz' | 'cod'

interface CheckoutPayload {
  paymentMethod: PaymentMethod
  address: {
    full_name: string
    phoneNumber: string
    division: string
    district: string
    thana: string
    fullAddress: string
  }
  couponCode?: string
}

const DEFAULT_FLAT_SHIPPING_RATE = 60

export async function POST(request: NextRequest) {
  try {
    const body: CheckoutPayload = await request.json()

    if (!body?.paymentMethod || !body?.address) {
      return NextResponse.json({ error: 'Invalid checkout payload' }, { status: 400 })
    }

    const { paymentMethod, address } = body
    const requiredFields = [
      address.full_name,
      address.phoneNumber,
      address.division,
      address.district,
      address.thana,
      address.fullAddress,
    ]
    if (requiredFields.some((value) => !value)) {
      return NextResponse.json({ error: 'Missing address fields' }, { status: 400 })
    }

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

    const { data: authData } = await supabase.auth.getUser()
    if (!authData.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: cartItems, error: cartError } = await supabase
      .from('cart')
      .select('*, product:products(*)')
      .eq('user_id', authData.user.id)

    if (cartError) {
      return NextResponse.json({ error: cartError.message }, { status: 500 })
    }

    if (!cartItems || cartItems.length === 0) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 })
    }

    const subtotal = cartItems.reduce((sum, item) => {
      const price = item.product?.discount_price ?? item.product?.price ?? 0
      return sum + price * (item.quantity || 1)
    }, 0)

    const adminSupabase = await createAdminSupabaseClient()
    const { data: settings } = await adminSupabase
      .from('store_settings')
      .select('flat_shipping_rate, free_shipping_threshold, cod_enabled, sslcommerz_enabled')
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (paymentMethod === 'cod' && settings?.cod_enabled === false) {
      return NextResponse.json({ error: 'Cash on Delivery is disabled' }, { status: 400 })
    }

    if (paymentMethod === 'sslcommerz' && settings?.sslcommerz_enabled === false) {
      return NextResponse.json({ error: 'Online payment is disabled' }, { status: 400 })
    }

    const flatRate = typeof settings?.flat_shipping_rate === 'number'
      ? settings.flat_shipping_rate
      : DEFAULT_FLAT_SHIPPING_RATE
    const freeThreshold = typeof settings?.free_shipping_threshold === 'number'
      ? settings.free_shipping_threshold
      : null
    const deliveryCharge = freeThreshold !== null && subtotal >= freeThreshold ? 0 : flatRate
    let discountAmount = 0
    let total = subtotal + deliveryCharge

    if (body.couponCode) {
      const couponCode = String(body.couponCode).trim().toUpperCase()
      const today = new Date().toISOString().slice(0, 10)

      const { data: coupon, error: couponError } = await supabase
        .from('coupons')
        .select('*')
        .eq('code', couponCode)
        .eq('active', true)
        .lte('valid_from', today)
        .gte('valid_to', today)
        .maybeSingle()

      if (couponError || !coupon) {
        return NextResponse.json({ error: 'Invalid or expired coupon' }, { status: 400 })
      }

      if (coupon.min_purchase_amount && subtotal < coupon.min_purchase_amount) {
        return NextResponse.json({ error: 'Minimum purchase amount not met' }, { status: 400 })
      }

      discountAmount = (subtotal * Number(coupon.discount_percent)) / 100
      if (coupon.max_discount_amount && discountAmount > coupon.max_discount_amount) {
        discountAmount = Number(coupon.max_discount_amount)
      }

      const { error: usageError } = await supabase.rpc('increment_coupon_usage', { coupon_id: coupon.id })
      if (usageError) {
        return NextResponse.json({ error: 'Coupon usage limit reached' }, { status: 400 })
      }

      total = subtotal + deliveryCharge - discountAmount
    }

    const orderNumber = generateOrderReference()

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        order_number: orderNumber,
        user_id: authData.user.id,
        subtotal,
        delivery_charge: deliveryCharge,
        discount_amount: discountAmount,
        total_amount: total,
        payment_method: paymentMethod,
        payment_status: 'pending',
        status: 'pending',
      })
      .select()
      .single()

    if (orderError || !order) {
      return NextResponse.json({ error: orderError?.message || 'Failed to create order' }, { status: 500 })
    }

    const orderItems = cartItems.map((item) => ({
      order_id: order.id,
      product_id: item.product_id,
      variant_id: item.variant_id || null,
      quantity: item.quantity || 1,
      price_at_purchase: item.product?.discount_price ?? item.product?.price ?? 0,
    }))

    const { error: itemsError } = await supabase.from('order_items').insert(orderItems)
    if (itemsError) {
      return NextResponse.json({ error: itemsError.message }, { status: 500 })
    }

    const { error: addressError } = await supabase.from('order_addresses').insert({
      order_id: order.id,
      division: address.division,
      district: address.district,
      thana: address.thana,
      full_address: address.fullAddress,
      phone_number: address.phoneNumber,
    })

    if (addressError) {
      return NextResponse.json({ error: addressError.message }, { status: 500 })
    }

    await supabase.from('cart').delete().eq('user_id', authData.user.id)

    if (paymentMethod === 'cod') {
      await supabase.from('payment_logs').insert({
        order_id: order.id,
        status: 'pending',
      })
      return NextResponse.json({ success: true, orderId: order.order_number })
    }

    const origin = request.nextUrl.origin
    const paymentResponse = await fetch(`${origin}/api/payment/initiate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount: total,
        orderId: order.order_number,
        customerName: address.full_name,
        // customerEmail: address.email || authData.user.email || 'customer@example.com',
        customerPhone: address.phoneNumber,
        customerAddress: address.fullAddress,
        customerCity: address.district,
        customerState: address.division,
        description: 'Fashion Accessories',
      }),
    })

    const paymentData = await paymentResponse.json()
    if (!paymentResponse.ok || !paymentData.redirectUrl) {
      return NextResponse.json({ error: paymentData.error || 'Failed to initiate payment' }, { status: 500 })
    }

    await supabase.from('payment_logs').insert({
      order_id: order.id,
      transaction_id: paymentData.sessionKey,
      status: 'initiated',
      gateway_response: paymentData,
    })

    return NextResponse.json({
      success: true,
      redirectUrl: paymentData.redirectUrl,
      orderId: order.order_number,
    })
  } catch (error) {
    console.error('Checkout error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
