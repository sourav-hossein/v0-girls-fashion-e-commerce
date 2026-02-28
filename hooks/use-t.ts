'use client'

import { useLanguage } from '@/components/language-provider'
import { getTranslation } from '@/lib/i18n'

export function useT() {
  const { language } = useLanguage()
  return {
    t: (key: string) => getTranslation(language, key),
  }
}
