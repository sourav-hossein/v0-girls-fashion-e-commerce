'use client'

import { useEffect } from 'react'
import { trackEvent } from '@/lib/analytics-client'
import { usePathname } from 'next/navigation'

export default function AnalyticsSession() {
  const pathname = usePathname()

  useEffect(() => {
    const key = 'session_started'
    if (typeof window !== 'undefined' && !sessionStorage.getItem(key)) {
      sessionStorage.setItem(key, 'true')
      trackEvent('session_start', { path: pathname })
    }
  }, [pathname])

  return null
}
