'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      if (data.user) {
        toast.success('Login successful!')
        router.push('/account')
      }
    } catch (error: any) {
      toast.error(error.message || 'Login failed')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-accent/5">
      <div className="w-full max-w-md px-4">
        <div className="bg-card rounded-2xl shadow-sm border border-border p-8">
          <h1 className="text-3xl font-serif font-semibold text-center mb-2 text-foreground">Welcome Back</h1>
          <p className="text-center text-muted-foreground mb-8">Sign in to your account</p>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
                className="h-11"
              />
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg font-medium"
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">Or</span>
            </div>
          </div>
<div className='flex flex-col gap-2 ' >
              <Button
      type="button"
      variant="outline"
      className="w-full"
      >
      <Link href="/auth/phone">Login with Phone Number</Link>
    </Button>

          <Button
            type="button"
            variant="outline"
            className="w-full"
            disabled={isLoading}
            onClick={async () => {
              const origin = typeof window !== 'undefined' ? window.location.origin : ''
              const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                  redirectTo: `${origin}/auth/callback`,
                },
              })
              if (error) {
                toast.error(error.message || 'Google sign-in failed')
              }
            }}
          >
            Continue with Google
          </Button>
            </div>
          <p className="text-center text-sm text-muted-foreground">
            Don't have an account?{' '}
            <Link href="/auth/register" className="font-medium text-primary hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
