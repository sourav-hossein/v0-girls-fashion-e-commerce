// SSLCommerz Payment Gateway Integration
// Reference: https://developer.sslcommerz.com/

export interface SSLCommerzInitParams {
  amount: number
  orderId: string
  customerName: string
  customerEmail: string
  customerPhone: string
  customerAddress: string
  customerCity: string
  customerState: string
  customerPostcode: string
  currency?: string
  description?: string
}

export interface SSLCommerzResponse {
  sessionKey: string
  status: string
  failedTransactionId?: string
  redirectGatewayURL?: string
}

/**
 * Initialize SSLCommerz payment request
 * This should be called from your backend API route for security
 */
export async function initiateSSLCommerzPayment(
  params: SSLCommerzInitParams
): Promise<SSLCommerzResponse> {
  try {
    // Call your backend API that handles SSLCommerz integration
    const response = await fetch('/api/payment/initiate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    })

    if (!response.ok) {
      throw new Error('Failed to initiate payment')
    }

    return await response.json()
  } catch (error) {
    console.error('SSLCommerz payment error:', error)
    throw error
  }
}

/**
 * Validate SSLCommerz payment response
 * This should be called on your callback route
 */
export async function validateSSLCommerzPayment(
  transactionId: string
): Promise<boolean> {
  try {
    const response = await fetch('/api/payment/validate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ transactionId }),
    })

    if (!response.ok) {
      return false
    }

    const data = await response.json()
    return data.isValid
  } catch (error) {
    console.error('Payment validation error:', error)
    return false
  }
}

/**
 * Refund SSLCommerz payment
 */
export async function refundSSLCommerzPayment(
  transactionId: string,
  amount: number
): Promise<boolean> {
  try {
    const response = await fetch('/api/payment/refund', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ transactionId, amount }),
    })

    if (!response.ok) {
      return false
    }

    const data = await response.json()
    return data.success
  } catch (error) {
    console.error('Payment refund error:', error)
    return false
  }
}

/**
 * Generate order reference number
 */
export function generateOrderReference(): string {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substr(2, 9).toUpperCase()
  return `ORD-${timestamp}-${random}`
}
