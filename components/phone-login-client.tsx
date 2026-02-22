'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { Phone, ArrowRight, Lock } from 'lucide-react'

type Step = 'phone' | 'otp'

export function PhoneLoginClient() {
  const router = useRouter()
  const [step, setStep] = useState<Step>('phone')
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!phone) {
      toast.error('Please enter your phone number')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/auth/phone/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      })

      const data = await response.json()

      if (!response.ok) {
        toast.error(data.message || 'Failed to send OTP')
        return
      }

      toast.success('OTP sent to your phone')
      setStep('otp')
    } catch (error) {
      console.error('Error sending OTP:', error)
      toast.error('Failed to send OTP')
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!otp) {
      toast.error('Please enter the OTP')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/auth/phone/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, otp }),
      })

      const data = await response.json()

      if (!response.ok) {
        toast.error(data.message || 'Invalid OTP')
        return
      }

      toast.success('Login successful')
      router.push('/account')
    } catch (error) {
      console.error('Error verifying OTP:', error)
      toast.error('Failed to verify OTP')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-background to-purple-50 flex items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md border-0 shadow-lg">
        <CardHeader className="space-y-2 text-center">
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center">
              <Phone className="w-6 h-6 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl font-serif">Phone Login</CardTitle>
          <CardDescription>Quick and secure access using your phone number</CardDescription>
        </CardHeader>

        <CardContent>
          {step === 'phone' ? (
            <form onSubmit={handleSendOTP} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Phone Number</label>
                <div className="flex gap-2">
                  <span className="flex items-center px-3 bg-muted rounded-lg border border-input text-sm text-muted-foreground">
                    +880
                  </span>
                  <Input
                    type="tel"
                    placeholder="1712345678"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    maxLength="10"
                    className="flex-1"
                    disabled={loading}
                  />
                </div>
                <p className="text-xs text-muted-foreground">Enter 10 digits (without +880)</p>
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-primary to-accent hover:shadow-lg"
                disabled={loading}
              >
                {loading ? 'Sending OTP...' : 'Send OTP'}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-background text-muted-foreground">or</span>
                </div>
              </div>

              <Button variant="outline" className="w-full" asChild>
                <Link href="/auth/login">Sign In with Email</Link>
              </Button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOTP} className="space-y-4">
              <div className="bg-primary/5 border border-primary/10 rounded-lg p-3 mb-4">
                <p className="text-sm text-muted-foreground">
                  We sent a 6-digit code to <strong>+880{phone}</strong>
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Enter OTP Code</label>
                <Input
                  type="text"
                  placeholder="000000"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  maxLength="6"
                  className="text-center text-2xl tracking-widest font-mono"
                  disabled={loading}
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-primary to-accent hover:shadow-lg"
                disabled={loading}
              >
                {loading ? 'Verifying...' : 'Verify OTP'}
                <Lock className="w-4 h-4 ml-2" />
              </Button>

              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={() => {
                  setStep('phone')
                  setOtp('')
                }}
                disabled={loading}
              >
                Change Phone Number
              </Button>

              <p className="text-xs text-center text-muted-foreground">
                Did not receive the code?{' '}
                <button
                  type="button"
                  className="text-primary hover:underline font-medium"
                  onClick={handleSendOTP}
                  disabled={loading}
                >
                  Resend
                </button>
              </p>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
