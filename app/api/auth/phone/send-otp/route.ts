import { NextRequest, NextResponse } from 'next/server'
import { sendOTP, formatBangladeshiPhone, validateBangladeshiPhone } from '@/lib/phone-auth'

export async function POST(request: NextRequest) {
  try {
    const { phone } = await request.json()

    if (!phone) {
      return NextResponse.json({ message: 'Phone number is required' }, { status: 400 })
    }

    const formatted = formatBangladeshiPhone(phone)

    if (!validateBangladeshiPhone(formatted)) {
      return NextResponse.json(
        { message: 'Invalid Bangladesh phone number' },
        { status: 400 }
      )
    }

    const result = await sendOTP(formatted)

    if (!result.success) {
      return NextResponse.json({ message: result.message }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      message: result.message,
      phone: formatted,
    })
  } catch (error) {
    console.error('Error in send-otp:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}
