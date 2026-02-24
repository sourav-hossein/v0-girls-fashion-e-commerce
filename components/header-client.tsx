'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Heart, ShoppingCart, Menu, Search, User } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Input } from '@/components/ui/input'
import { ThemeLanguageToggle } from '@/components/theme-language-toggle'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Category } from '@/lib/types'
import { supabase } from '@/lib/supabase'

const fallbackNavItems = [
  { href: '/shop', label: 'Shop' },
  { href: '/shop?category=earrings', label: 'Earrings' },
  { href: '/shop?category=hijabs', label: 'Hijabs' },
  { href: '/shop?category=bags', label: 'Bags' },
  { href: '/shop?category=hair-clips', label: 'Hair Clips' },
  { href: '/shop?category=rings', label: 'Rings' },
  { href: '/shop?category=bracelets', label: 'Bracelets' },
  { href: '/shop?category=combos', label: 'Combos' },
]

interface HeaderClientProps {
  categories: Category[]
}

export default function HeaderClient({ categories }: HeaderClientProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [user, setUser] = useState<Awaited<ReturnType<typeof supabase.auth.getUser>>['data']['user']>(null)
  const [isAuthLoading, setIsAuthLoading] = useState(true)
  const router = useRouter()

  const categoryItems =
    categories.length > 0
      ? [
          { href: '/shop', label: 'Shop' },
          ...categories.slice(0, 8).map((category) => ({
            href: `/shop?category=${category.slug}`,
            label: category.name,
          })),
        ]
      : fallbackNavItems

  useEffect(() => {
    let isMounted = true

    const loadUser = async () => {
      const { data, error } = await supabase.auth.getUser()
      if (error) {
        if (isMounted) {
          setUser(null)
          setIsAuthLoading(false)
        }
        return
      }
      if (isMounted) {
        setUser(data.user)
        setIsAuthLoading(false)
      }
    }

    loadUser()

    const { data: authListener } = supabase.auth.onAuthStateChange((_, session) => {
      if (!isMounted) return
      setUser(session?.user ?? null)
      setIsAuthLoading(false)
    })

    return () => {
      isMounted = false
      authListener.subscription.unsubscribe()
    }
  }, [])

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    setUser(null)
    router.push('/auth/login')
  }

  return (
    <header className="sticky top-0 z-50 bg-card border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Bar */}
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-serif font-bold text-lg">L</span>
            </div>
            <div className="hidden sm:block">
              <h1 className="font-serif font-bold text-lg text-foreground">Lubaba Fashion</h1>
              <p className="text-xs text-muted-foreground">Premium Fashion Accessories</p>
            </div>
          </Link>

          {/* Search Bar - Desktop */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <form
              className="relative w-full"
              onSubmit={(e) => {
                e.preventDefault()
                const params = new URLSearchParams()
                if (search) params.set('search', search)
                router.push(`/shop?${params.toString()}`)
              }}
            >
              <Input
                type="search"
                placeholder="Search accessories..."
                className="w-full bg-background pr-10"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <button
                type="submit"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                aria-label="Search"
              >
                <Search className="w-4 h-4" />
              </button>
            </form>
          </div>

          {/* Right Icons */}
          <div className="flex items-center gap-2 sm:gap-4">
            <Link href="/wishlist" className="p-2 hover:bg-muted rounded-lg transition-colors">
              <Heart className="w-5 h-5 text-foreground" />
            </Link>
            <Link href="/cart" className="p-2 hover:bg-muted rounded-lg transition-colors">
              <ShoppingCart className="w-5 h-5 text-foreground" />
            </Link>
            <ThemeLanguageToggle />
            {!isAuthLoading && !user && (
              <Button asChild className="hidden sm:inline-flex">
                <Link href="/auth/login">Login</Link>
              </Button>
            )}
            {!isAuthLoading && user && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <User className="w-5 h-5 text-foreground" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem asChild>
                    <Link href="/account" className="cursor-pointer">
                      My Account
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/account/orders" className="cursor-pointer">
                      Order History
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-destructive">
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {/* Mobile Menu */}
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right">
                <nav className="flex flex-col gap-4 mt-8">
                  {categoryItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="text-foreground hover:text-primary transition-colors"
                      onClick={() => setIsOpen(false)}
                    >
                      {item.label}
                    </Link>
                  ))}
                  {!isAuthLoading && !user && (
                    <Link
                      href="/auth/login"
                      className="text-foreground hover:text-primary transition-colors"
                      onClick={() => setIsOpen(false)}
                    >
                      Login
                    </Link>
                  )}
                  {!isAuthLoading && user && (
                    <>
                      <Link
                        href="/account"
                        className="text-foreground hover:text-primary transition-colors"
                        onClick={() => setIsOpen(false)}
                      >
                        My Account
                      </Link>
                      <Link
                        href="/account/orders"
                        className="text-foreground hover:text-primary transition-colors"
                        onClick={() => setIsOpen(false)}
                      >
                        Order History
                      </Link>
                      <button
                        type="button"
                        className="text-left text-destructive hover:text-destructive/80 transition-colors"
                        onClick={async () => {
                          await handleLogout()
                          setIsOpen(false)
                        }}
                      >
                        Logout
                      </button>
                    </>
                  )}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        {/* Navigation - Desktop */}
        <nav className="hidden md:flex items-center gap-8 pb-4 border-t border-border/50">
          {categoryItems.map((item) => (
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
