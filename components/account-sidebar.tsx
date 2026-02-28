'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  User,
  ShoppingBag,
  Heart,
  MapPin,
  LogOut,
  Settings,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useT } from '@/hooks/use-t'

export default function AccountSidebar() {
  const { t } = useT()
  const pathname = usePathname()
  const router = useRouter()

  const menuItems = [
    {
      label: t('account.dashboard'),
      href: '/account',
      icon: User,
    },
    {
      label: t('account.orders'),
      href: '/account/orders',
      icon: ShoppingBag,
    },
    {
      label: t('account.wishlist'),
      href: '/account/wishlist',
      icon: Heart,
    },
    {
      label: t('account.addresses'),
      href: '/account/addresses',
      icon: MapPin,
    },
    {
      label: t('account.settings'),
      href: '/account/settings',
      icon: Settings,
    },
  ]

  return (
    <div className="md:col-span-1">
      <nav className="space-y-2 sticky top-20">
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href

          return (
            <Link key={item.href} href={item.href}>
              <Button
                variant="ghost"
                className={`w-full justify-start gap-3 px-4 ${
                  isActive
                    ? 'bg-primary/10 text-primary hover:bg-primary/20'
                    : 'text-foreground hover:bg-muted'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </Button>
            </Link>
          )
        })}

        {/* Logout */}
        <Button
          variant="outline"
          className="w-full justify-start gap-3 text-destructive border-destructive/30 hover:bg-destructive/10 mt-4"
          onClick={async () => {
            await fetch('/api/auth/logout', { method: 'POST' })
            router.push('/auth/login')
          }}
        >
          <LogOut className="w-5 h-5" />
          <span>{t('nav.logout')}</span>
        </Button>
      </nav>
    </div>
  )
}
