import { UserAddressesList } from '@/components/user-addresses-list'
import { Metadata } from 'next'
import { cookies } from 'next/headers'
import { getTranslation } from '@/lib/i18n'

export const metadata: Metadata = {
  title: 'My Addresses - Hijab & Fashion Hub',
  description: 'Manage your delivery addresses',
}

export default function AddressesPage() {
  const cookieStore = cookies()
  const langValue = cookieStore.get('language')?.value
  const lang = langValue === 'bn' ? 'bn' : 'en'
  const t = (key: string) => getTranslation(lang, key)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-serif font-bold text-foreground">{t('addresses.title')}</h1>
        <p className="text-muted-foreground mt-2">{t('addresses.pageDescription')}</p>
      </div>
      <UserAddressesList />
    </div>
  )
}
