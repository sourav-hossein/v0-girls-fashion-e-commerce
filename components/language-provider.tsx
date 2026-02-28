'use client'

import { createContext, useContext, useState, useEffect } from 'react'

type Language = 'en' | 'bn'

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)
const LANGUAGE_COOKIE = 'language'
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365

function readLanguageCookie(): Language | null {
  if (typeof document === 'undefined') return null
  const match = document.cookie.match(new RegExp(`(?:^|; )${LANGUAGE_COOKIE}=([^;]*)`))
  if (!match) return null
  const value = decodeURIComponent(match[1])
  return value === 'bn' ? 'bn' : value === 'en' ? 'en' : null
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en')

  useEffect(() => {
    // Get language from localStorage or browser preference
    const cookieLang = readLanguageCookie()
    const stored = localStorage.getItem('language') as Language | null
    const browserLang = navigator.language.startsWith('bn') ? 'bn' : 'en'
    const initial = cookieLang || stored || browserLang
    setLanguageState(initial)
    document.documentElement.lang = initial
  }, [])

  const setLanguage = (lang: Language) => {
    setLanguageState(lang)
    localStorage.setItem('language', lang)
    document.cookie = `${LANGUAGE_COOKIE}=${encodeURIComponent(lang)}; path=/; max-age=${COOKIE_MAX_AGE}`
    document.documentElement.lang = lang
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider')
  }
  return context
}
