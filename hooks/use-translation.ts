'use client'

import { useAppContext } from '@/components/providers'
import { getTranslation } from '@/lib/translations'

export function useTranslation() {
  const { language } = useAppContext()
  
  return {
    t: (key: string) => getTranslation(key, language),
    lang: language,
  }
}
