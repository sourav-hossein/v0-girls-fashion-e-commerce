'use client'

import { Moon, Sun, Globe } from 'lucide-react'
import { useAppContext } from './providers'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export function ThemeLanguageToggle() {
  const { isDark, setIsDark, language, setLanguage } = useAppContext()

  return (
    <div className="flex items-center gap-2">
      {/* Theme Toggle */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsDark(!isDark)}
        className="relative w-9 h-9"
      >
        <Sun className="w-5 h-5 absolute rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
        <Moon className="w-5 h-5 absolute rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        <span className="sr-only">Toggle theme</span>
      </Button>

      {/* Language Toggle */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="w-9 h-9">
            <Globe className="w-5 h-5" />
            <span className="sr-only">Select language</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            onClick={() => setLanguage('en')}
            className={language === 'en' ? 'bg-accent' : ''}
          >
            English
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => setLanguage('bn')}
            className={language === 'bn' ? 'bg-accent' : ''}
          >
            বাংলা
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
