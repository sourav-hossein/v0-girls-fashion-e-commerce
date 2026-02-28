import en from './i18n/en'
import bn from './i18n/bn'

export type Language = 'en' | 'bn'

const translations = {
  en,
  bn,
}

export function getTranslation(lang: Language, key: string): string {
  const keys = key.split('.')
  let value: any = translations[lang]

  for (const k of keys) {
    if (value && typeof value === 'object') {
      value = value[k]
    } else {
      return key
    }
  }

  return typeof value === 'string' ? value : key
}

export function useTranslation(lang: Language) {
  return {
    t: (key: string) => getTranslation(lang, key),
  }
}

export const supportedLanguages = {
  en: 'English',
  bn: 'বাংলা',
}
