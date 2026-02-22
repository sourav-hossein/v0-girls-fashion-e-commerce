'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useState } from 'react'

export default function Newsletter() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Newsletter subscription logic will be implemented
    setSubmitted(true)
    setTimeout(() => setSubmitted(false), 3000)
  }

  return (
    <section className="py-16 bg-background">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 rounded-2xl p-8 sm:p-12 text-center">
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-foreground mb-4">
            Stay Updated
          </h2>
          <p className="text-muted-foreground mb-8">
            Get exclusive deals, new arrivals, and fashion tips delivered to your inbox.
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
            <Input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="bg-card border-border"
            />
            <Button
              type="submit"
              className="bg-primary hover:bg-primary/90 text-primary-foreground whitespace-nowrap"
            >
              {submitted ? 'Subscribed!' : 'Subscribe'}
            </Button>
          </form>
        </div>
      </div>
    </section>
  )
}
