import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get('content-type') || ''
    const body =
      contentType.includes('application/json')
        ? await request.json()
        : Object.fromEntries(await request.formData())

    const { tran_id } = body as Record<string, string>
    if (!tran_id) {
      return NextResponse.json({ error: 'Invalid payment response' }, { status: 400 })
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
        .from('orders')
        .update({ payment_status: 'failed', status: 'canceled' })
        .eq('id', order.id)

      await supabase
        .from('payment_logs')
        .update({ status: 'canceled' })
        .eq('order_id', order.id)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Payment cancel callback error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const tranId = searchParams.get('tran_id')
    if (tranId) {
      return NextResponse.redirect(new URL(`/order-failed?orderId=${tranId}`, request.url))
    }
    return NextResponse.redirect(new URL('/order-failed', request.url))
  } catch (error) {
    return NextResponse.redirect(new URL('/order-failed', request.url))
  }
}
