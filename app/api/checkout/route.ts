import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { generateOrderReference } from '@/lib/sslcommerz'

type PaymentMethod = 'sslcommerz' | 'cod'

interface CheckoutPayload {
  paymentMethod: PaymentMethod
  address: {
    fullName: string
    phoneNumber: string
    email?: string
    division: string
    district: string
    thana: string
    fullAddress: string
  }
}

const DELIVERY_CHARGE_INSIDE_DHAKA = 60
const DELIVERY_CHARGE_OUTSIDE_DHAKA = 120

export async function POST(request: NextRequest) {
  try {
    const body: CheckoutPayload = await request.json()

    if (!body?.paymentMethod || !body?.address) {
      return NextResponse.json({ error: 'Invalid checkout payload' }, { status: 400 })
    }

    const { paymentMethod, address } = body
    const requiredFields = [
      address.fullName,
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

    const deliveryCharge =
      address.division === 'Dhaka'
        ? DELIVERY_CHARGE_INSIDE_DHAKA
        : DELIVERY_CHARGE_OUTSIDE_DHAKA
    const total = subtotal + deliveryCharge

    const orderNumber = generateOrderReference()

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        order_number: orderNumber,
        user_id: authData.user.id,
        subtotal,
        delivery_charge: deliveryCharge,
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
        customerName: address.fullName,
        customerEmail: address.email || authData.user.email || 'customer@example.com',
        customerPhone: address.phoneNumber,
        customerAddress: address.fullAddress,
        customerCity: address.district,
        customerState: address.division,
        customerPostcode: '',
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
