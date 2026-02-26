import { NextRequest, NextResponse } from 'next/server'

/**
 * SSLCommerz Payment Initiation API Route
 * This is a server-side route that communicates with SSLCommerz gateway
 * 
 * Environment Variables Required:
 * - SSLCOMMERZ_STORE_ID
 * - SSLCOMMERZ_STORE_PASSWORD
 * - SSLCOMMERZ_API_URL (sandbox or live)
 * - SSLCOMMERZ_VALIDATE_URL (optional)
 */

interface PaymentRequest {
  amount: number
  orderId: string
  customerName: string
  customerEmail: string
  customerPhone: string
  customerAddress: string
  customerCity: string
  customerState: string
  description?: string
}

export async function POST(request: NextRequest) {
  try {
    const body: PaymentRequest = await request.json()

    // Validate request
    if (
      !body.amount ||
      !body.orderId ||
      !body.customerName ||
      !body.customerEmail ||
      !body.customerPhone
    ) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate environment variables
    const storeId = process.env.SSLCOMMERZ_STORE_ID || process.env.NEXT_PUBLIC_SSLCOMMERZ_STORE_ID
    const storePassword = process.env.SSLCOMMERZ_STORE_PASSWORD
    const apiUrl = process.env.SSLCOMMERZ_API_URL || 'https://sandbox.sslcommerz.com/gwprocess/v4/api.php'

    if (!storeId || !storePassword) {
      console.error('SSLCommerz credentials not configured')
      return NextResponse.json(
        { error: 'Payment gateway not configured' },
        { status: 500 }
      )
    }

    // Prepare SSLCommerz request
    const formData = new URLSearchParams()
    formData.append('store_id', storeId)
    formData.append('store_passwd', storePassword)
    formData.append('total_amount', body.amount.toString())
    formData.append('currency', 'BDT')
    formData.append('tran_id', body.orderId)
    formData.append('success_url', `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/payment/success`)
    formData.append('fail_url', `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/payment/fail`)
    formData.append('cancel_url', `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/payment/cancel`)
    formData.append('cus_name', body.customerName)
    // formData.append('cus_email', body.customerEmail)
    formData.append('cus_phone', body.customerPhone)
    formData.append('cus_add1', body.customerAddress)
    formData.append('cus_city', body.customerCity)
    formData.append('cus_state', body.customerState)
    formData.append('cus_country', 'Bangladesh')
    formData.append('product_name', body.description || 'Fashion Accessories')
    formData.append('product_category', 'Fashion')
    formData.append('product_profile', 'general')

    // Send to SSLCommerz
    const response = await fetch(apiUrl, {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      console.error('SSLCommerz API error:', response.statusText)
      return NextResponse.json(
        { error: 'Payment gateway error' },
        { status: 500 }
      )
    }

    const data = await response.json()

    // Check if request was successful
    if (data.status !== 'success') {
      console.error('SSLCommerz request failed:', data)
      return NextResponse.json(
        { error: 'Payment request failed', details: data },
        { status: 400 }
      )
    }

    // Store transaction in database for tracking
    // await storePaymentLog({
    //   orderId: body.orderId,
    //   transactionId: data.sessionkey,
    //   status: 'initiated',
    //   gatewayResponse: data,
    // })

    return NextResponse.json({
      sessionKey: data.sessionkey,
      status: 'success',
      redirectUrl: data.redirectGatewayURL,
    })
  } catch (error) {
    console.error('Payment initiation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
