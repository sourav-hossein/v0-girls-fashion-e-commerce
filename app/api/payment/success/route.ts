import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'

/**
 * SSLCommerz Success Callback Route
 * Called after successful payment
 */

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate SSLCommerz response
    const { tran_id, val_id, amount, status } = body

    if (!tran_id || !val_id) {
      return NextResponse.json(
        { error: 'Invalid payment response' },
        { status: 400 }
      )
    }

    // In a real app, verify the payment with SSLCommerz
    // const isValid = await verifySSLCommerzPayment(val_id)

    if (status !== 'VALID') {
      return NextResponse.json(
        { error: 'Payment validation failed' },
        { status: 400 }
      )
    }

    // Get Supabase client
    const supabase = await createServerSupabaseClient()

    // Update payment log in database
    // await supabase
    //   .from('payment_logs')
    //   .update({
    //     status: 'completed',
    //     transaction_id: val_id,
    //     gateway_response: body,
    //   })
    //   .eq('order_id', tran_id)

    // Update order status to confirmed
    // await supabase
    //   .from('orders')
    //   .update({ payment_status: 'completed', status: 'confirmed' })
    //   .eq('order_number', tran_id)

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

    // Verify payment with SSLCommerz
    // This would typically involve making an API call to SSLCommerz

    // Redirect to success page
    return NextResponse.redirect(
      new URL(`/order-success?orderId=${tranId}`, request.url)
    )
  } catch (error) {
    console.error('Payment GET callback error:', error)
    return NextResponse.redirect(new URL('/order-failed', request.url))
  }
}
