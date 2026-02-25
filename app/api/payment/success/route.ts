import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

/**
 * SSLCommerz Success Callback Route
 * Called after successful payment
 */

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get('content-type') || ''
    const body =
      contentType.includes('application/json')
        ? await request.json()
        : Object.fromEntries(await request.formData())

    const { tran_id, val_id, status } = body as Record<string, string>

    if (!tran_id || !val_id) {
      return NextResponse.json(
        { error: 'Invalid payment response' },
        { status: 400 }
      )
    }

    if (status !== 'VALID') {
      return NextResponse.json(
        { error: 'Payment validation failed' },
        { status: 400 }
      )
    }

    const storeId = process.env.SSLCOMMERZ_STORE_ID || process.env.NEXT_PUBLIC_SSLCOMMERZ_STORE_ID
    const storePassword = process.env.SSLCOMMERZ_STORE_PASSWORD
    const validateUrl =
      process.env.SSLCOMMERZ_VALIDATE_URL ||
      'https://sandbox.sslcommerz.com/validator/api/validationserverAPI.php'

    if (!storeId || !storePassword) {
      return NextResponse.json({ error: 'Payment gateway not configured' }, { status: 500 })
    }

    const validationResponse = await fetch(
      `${validateUrl}?val_id=${val_id}&store_id=${storeId}&store_passwd=${storePassword}&format=json`,
    )

    if (!validationResponse.ok) {
      return NextResponse.json({ error: 'Payment validation error' }, { status: 500 })
    }

    const validationData = await validationResponse.json()
    if (validationData.status !== 'VALID' && validationData.status !== 'VALIDATED') {
      return NextResponse.json({ error: 'Payment validation failed' }, { status: 400 })
    }

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        cookies: {
          getAll() {
            return []
          },
          setAll() {},
        },
      },
    )

    const { data: order } = await supabase
      .from('orders')
      .select('id')
      .eq('order_number', tran_id)
      .single()

    if (order?.id) {
      await supabase
        .from('payment_logs')
        .update({
          status: 'completed',
          transaction_id: val_id,
          gateway_response: validationData,
        })
        .eq('order_id', order.id)

      await supabase
        .from('orders')
        .update({ payment_status: 'completed', status: 'confirmed' })
        .eq('id', order.id)
    }

    return NextResponse.json({ success: true, message: 'Payment processed' })
  } catch (error) {
    console.error('Payment success callback error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const tranId = searchParams.get('tran_id')
    const valId = searchParams.get('val_id')

    if (!tranId || !valId) {
      return NextResponse.redirect(new URL('/order-failed', request.url))
    }

    // Redirect to success page
    return NextResponse.redirect(
      new URL(`/order-success?orderId=${tranId}`, request.url)
    )
  } catch (error) {
    console.error('Payment GET callback error:', error)
    return NextResponse.redirect(new URL('/order-failed', request.url))
  }
}
