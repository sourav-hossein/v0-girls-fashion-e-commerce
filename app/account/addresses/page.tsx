import { UserAddressesList } from '@/components/user-addresses-list'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'My Addresses - Hijab & Fashion Hub',
  description: 'Manage your delivery addresses',
}

export default function AddressesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-serif font-bold text-foreground">Delivery Addresses</h1>
        <p className="text-muted-foreground mt-2">Manage your saved delivery addresses for faster checkout</p>
      </div>
      <UserAddressesList />
    </div>
  )
}
