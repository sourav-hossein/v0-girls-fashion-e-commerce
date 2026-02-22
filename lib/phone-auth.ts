import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function generateOTP(): Promise<string> {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export async function sendOTP(phoneNumber: string): Promise<{ success: boolean; message: string }> {
  try {
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

    const otp = await generateOTP()

    // Store OTP in database
    const { error } = await supabase
      .from('phone_verifications')
      .upsert(
        {
          phone_number: phoneNumber,
          otp_code: otp,
          is_verified: false,
          attempts: 0,
          expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
        },
        { onConflict: 'phone_number' }
      )

    if (error) {
      console.error('Error storing OTP:', error)
      return { success: false, message: 'Failed to send OTP' }
    }

    // In production, integrate with SMS gateway (e.g., Twilio, Nexmo)
    // For now, log the OTP for testing
    console.log(`[OTP] Phone: ${phoneNumber}, OTP: ${otp}`)

    return {
      success: true,
      message: `OTP sent to ${phoneNumber}. (Dev: ${otp})`,
    }
  } catch (error) {
    console.error('Error in sendOTP:', error)
    return { success: false, message: 'Failed to send OTP' }
  }
}

export async function verifyOTP(
  phoneNumber: string,
  otp: string
): Promise<{ success: boolean; message: string; verified?: boolean }> {
  try {
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

    // Get the stored OTP
    const { data, error } = await supabase
      .from('phone_verifications')
      .select('*')
      .eq('phone_number', phoneNumber)
      .single()

    if (error || !data) {
      return { success: false, message: 'OTP not found or expired' }
    }

    // Check if OTP is expired
    if (new Date() > new Date(data.expires_at)) {
      return { success: false, message: 'OTP has expired' }
    }

    // Check if too many attempts
    if (data.attempts >= 3) {
      return { success: false, message: 'Too many attempts. Please request a new OTP' }
    }

    // Verify OTP
    if (data.otp_code !== otp) {
      // Increment attempts
      await supabase
        .from('phone_verifications')
        .update({ attempts: data.attempts + 1 })
        .eq('phone_number', phoneNumber)

      return { success: false, message: 'Invalid OTP' }
    }

    // Mark as verified
    await supabase
      .from('phone_verifications')
      .update({ is_verified: true })
      .eq('phone_number', phoneNumber)

    return { success: true, message: 'OTP verified successfully', verified: true }
  } catch (error) {
    console.error('Error in verifyOTP:', error)
    return { success: false, message: 'Verification failed' }
  }
}

export async function formatBangladeshiPhone(phone: string): string {
  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, '')

  // If starts with 880 (country code), remove it
  if (cleaned.startsWith('880')) {
    return '0' + cleaned.substring(3)
  }

  // If starts with 0, keep as is
  if (cleaned.startsWith('0')) {
    return cleaned
  }

  // Otherwise add 0 prefix
  return '0' + cleaned
}

export const BANGLADESHI_CARRIERS = {
  'Grameenphone': ['017', '013'],
  'Banglalink': ['019', '014'],
  'Robi/Airtel': ['018', '016'],
  'Teletalk': ['015'],
  'Citycell': ['012'],
}

export function validateBangladeshiPhone(phone: string): boolean {
  const formatted = formatBangladeshiPhone(phone)

  // Must be 11 digits starting with 0
  if (!/^0\d{10}$/.test(formatted)) {
    return false
  }

  // Check if it matches known carrier prefixes
  const prefix = formatted.substring(0, 3)
  const carriers = Object.values(BANGLADESHI_CARRIERS).flat()

  return carriers.includes(prefix)
}
