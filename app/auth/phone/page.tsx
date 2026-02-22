import { PhoneLoginClient } from '@/components/phone-login-client'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Phone Login - Hijab & Fashion Hub',
  description: 'Quick login with your phone number using OTP verification',
}

export default function PhoneLoginPage() {
  return <PhoneLoginClient />
}
