'use client'

import Link from 'next/link'
import { Heart, ShoppingCart, User, Menu, X, Search } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Input } from '@/components/ui/input'

export default function Header() {
  const [isOpen, setIsOpen] = useState(false)

  const navItems = [
    { href: '/shop', label: 'Shop' },
    { href: '/shop?category=earrings', label: 'Earrings' },
    { href: '/shop?category=hijabs', label: 'Hijabs' },
    { href: '/shop?category=bags', label: 'Bags' },
    { href: '/shop?category=hair-clips', label: 'Hair Clips' },
    { href: '/shop?category=rings', label: 'Rings' },
    { href: '/shop?category=bracelets', label: 'Bracelets' },
    { href: '/shop?category=combos', label: 'Combos' },
  ]

  return (
    <header className="sticky top-0 z-50 bg-card border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Bar */}
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-serif font-bold text-lg">H</span>
            </div>
            <div className="hidden sm:block">
              <h1 className="font-serif font-bold text-lg text-foreground">Hijab & Fashion</h1>
              <p className="text-xs text-muted-foreground">Premium Fashion Accessories</p>
            </div>
          </Link>

          {/* Search Bar - Desktop */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <Input
                type="search"
                placeholder="Search accessories..."
                className="w-full bg-background pr-10"
              />
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            </div>
          </div>

          {/* Right Icons */}
          <div className="flex items-center gap-2 sm:gap-4">
            <Link href="/wishlist" className="p-2 hover:bg-muted rounded-lg transition-colors">
              <Heart className="w-5 h-5 text-foreground" />
            </Link>
            <Link href="/cart" className="p-2 hover:bg-muted rounded-lg transition-colors">
              <ShoppingCart className="w-5 h-5 text-foreground" />
            </Link>
            <Link href="/account" className="p-2 hover:bg-muted rounded-lg transition-colors">
              <User className="w-5 h-5 text-foreground" />
            </Link>

            {/* Mobile Menu */}
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right">
                <nav className="flex flex-col gap-4 mt-8">
                  {navItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="text-foreground hover:text-primary transition-colors"
                      onClick={() => setIsOpen(false)}
                    >
                      {item.label}
                    </Link>
                  ))}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        {/* Navigation - Desktop */}
        <nav className="hidden md:flex items-center gap-8 pb-4 border-t border-border/50">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-foreground hover:text-primary transition-colors py-2"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  )
}
