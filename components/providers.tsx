'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import type { Language } from '@/lib/translations'

interface AppContextType {
  language: Language
  setLanguage: (lang: Language) => void
  isDark: boolean
  setIsDark: (dark: boolean) => void
}

const AppContext = createContext<AppContextType | undefined>(undefined)

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en')
  const [isDark, setIsDarkState] = useState(false)
  const [mounted, setMounted] = useState(false)

  // Initialize from localStorage
  useEffect(() => {
    const savedLang = localStorage.getItem('language') as Language | null
    const savedTheme = localStorage.getItem('theme')
    
    if (savedLang) setLanguageState(savedLang)
    
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    const isDarkMode = savedTheme ? savedTheme === 'dark' : prefersDark
    setIsDarkState(isDarkMode)
    
    if (isDarkMode) {
      document.documentElement.classList.add('dark')
    }
    
    setMounted(true)
  }, [])

  const setLanguage = (lang: Language) => {
    setLanguageState(lang)
    localStorage.setItem('language', lang)
  }

  const setIsDark = (dark: boolean) => {
    setIsDarkState(dark)
    localStorage.setItem('theme', dark ? 'dark' : 'light')
    
    if (dark) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }

  if (!mounted) {
    return <>{children}</>
  }

  return (
    <AppContext.Provider value={{ language, setLanguage, isDark, setIsDark }}>
      {children}
    </AppContext.Provider>
  )
}

export function useAppContext() {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useAppContext must be used within AppProvider')
  }
  return context
}
