'use client'

import { Moon, Sun, Globe } from 'lucide-react'
import { useTheme } from 'next-themes'
import { useLanguage } from '@/components/language-provider'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuCheckboxItem,
} from '@/components/ui/dropdown-menu'
import { useEffect, useState } from 'react'

export function ThemeLanguageToggle() {
  const { resolvedTheme, setTheme } = useTheme()
  const { language, setLanguage } = useLanguage()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const isDark = resolvedTheme === 'dark'

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-2 rounded-full border border-border px-3 py-1.5">
        <Sun className="h-4 w-4 text-muted-foreground" />
        {mounted ? (
          <Switch
            checked={isDark}
            onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
            aria-label="Toggle dark mode"
          />
        ) : (
          <span className="h-5 w-9 rounded-full border border-border bg-muted" />
        )}
        <Moon className="h-4 w-4 text-muted-foreground" />
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon">
            <Globe className="w-4 h-4" />
            <span className="sr-only">Language Settings</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuLabel className="text-xs uppercase font-semibold text-muted-foreground">
            Language
          </DropdownMenuLabel>
          <DropdownMenuCheckboxItem
            checked={language === 'en'}
            onCheckedChange={() => setLanguage('en')}
            className="flex items-center gap-2"
          >
            English
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem
            checked={language === 'bn'}
            onCheckedChange={() => setLanguage('bn')}
          >
            à¦¬à¦¾à¦‚à¦²à¦¾ (Bengali)
          </DropdownMenuCheckboxItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
