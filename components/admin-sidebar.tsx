'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  BarChart3,
  Settings,
  LogOut,
} from 'lucide-react'
import { Button } from '@/components/ui/button'

const menuItems = [
  {
    label: 'Dashboard',
    href: '/admin',
    icon: LayoutDashboard,
  },
  {
    label: 'Products',
    href: '/admin/products',
    icon: Package,
  },
  {
    label: 'Orders',
    href: '/admin/orders',
    icon: ShoppingCart,
  },
  {
    label: 'Analytics',
    href: '/admin/analytics',
    icon: BarChart3,
  },
  {
    label: 'Settings',
    href: '/admin/settings',
    icon: Settings,
  },
]

export default function AdminSidebar() {
  const pathname = usePathname()

  return (
    <aside className="hidden md:flex flex-col w-64 bg-card border-r border-border">
      {/* Logo */}
      <div className="p-6 border-b border-border">
        <h2 className="font-serif font-bold text-xl text-foreground">
          Admin Panel
        </h2>
      </div>

      {/* Menu */}
      <nav className="flex-1 px-3 py-6 space-y-2 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
          
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
      </nav>

      {/* Logout */}
      <div className="p-3 border-t border-border">
        <Button variant="outline" className="w-full justify-start gap-3 text-destructive border-destructive/30 hover:bg-destructive/10">
          <LogOut className="w-5 h-5" />
          <span>Logout</span>
        </Button>
      </div>
    </aside>
  )
}
