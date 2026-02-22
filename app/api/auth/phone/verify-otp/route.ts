import { NextRequest, NextResponse } from 'next/server'
import { verifyOTP, formatBangladeshiPhone } from '@/lib/phone-auth'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    const { phone, otp } = await request.json()

    if (!phone || !otp) {
      return NextResponse.json({ message: 'Phone and OTP are required' }, { status: 400 })
    }

    const formatted = formatBangladeshiPhone(phone)

    // Verify OTP
    const result = await verifyOTP(formatted, otp)

    if (!result.verified) {
      return NextResponse.json({ message: result.message }, { status: 400 })
    }

    // Get or create user based on phone
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              )
            } catch {}
          },
        },
      }
    )

    // Check if user exists with this phone
    let user = await supabase
      .from('users')
      .select('id, email')
      .eq('phone_number', formatted)
      .single()

    if (user.error) {
      // Create a new user with phone number
      const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
        email: `phone_${formatted}@placeholder.local`,
        password: Math.random().toString(36).slice(-12),
        email_confirm: true,
      })

      if (authError) {
        console.error('Error creating auth user:', authError)
        return NextResponse.json({ message: 'Failed to create user' }, { status: 500 })
      }

      // Create profile
      const { error: profileError } = await supabase.from('users').insert({
        id: authUser.user.id,
        email: authUser.user.email,
        phone_number: formatted,
        phone_verified: true,
      })

      if (profileError) {
        console.error('Error creating profile:', profileError)
        return NextResponse.json({ message: 'Failed to create profile' }, { status: 500 })
      }

      // Create user role
      await supabase.from('user_roles').insert({
        user_id: authUser.user.id,
        role: 'customer',
      })
    } else {
      // Update last_login and phone_verified
      await supabase
        .from('users')
        .update({
          phone_verified: true,
          last_login: new Date().toISOString(),
        })
        .eq('id', user.data.id)
    }

    // Set session
    const { data, error } = await supabase.auth.admin.createSession(
      user.data?.id || (await supabase.from('users').select('id').eq('phone_number', formatted).single()).data.id
    )

    if (error) {
      console.error('Error creating session:', error)
      return NextResponse.json({ message: 'Failed to create session' }, { status: 500 })
    }

    // Create response with cookies
    const response = NextResponse.json({
      success: true,
      message: 'Login successful',
    })

    return response
  } catch (error) {
    console.error('Error in verify-otp:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}
