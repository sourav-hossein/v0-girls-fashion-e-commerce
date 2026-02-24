'use client'

import { Moon, Sun, Globe } from 'lucide-react'
import { useTheme } from 'next-themes'
import { useLanguage } from '@/components/language-provider'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuCheckboxItem,
} from '@/components/ui/dropdown-menu'

export function ThemeLanguageToggle() {
  const { theme, setTheme } = useTheme()
  const { language, setLanguage } = useLanguage()

  return (
    <div className="flex items-center gap-2">
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Theme & Language Settings</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel className="text-xs uppercase font-semibold text-muted-foreground">Theme</DropdownMenuLabel>
        <DropdownMenuCheckboxItem
          checked={theme === 'light'}
          onCheckedChange={() => setTheme('light')}
          >
          Light
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem
          checked={theme === 'dark'}
          onCheckedChange={() => setTheme('dark')}
          >
          Dark
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem
          checked={theme === 'system'}
          onCheckedChange={() => setTheme('system')}
          >
          System
        </DropdownMenuCheckboxItem> 
      </DropdownMenuContent>
    </DropdownMenu>
        <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          <Globe className="w-4 h-4" />
          <span className="sr-only">Language Settings</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">        
        <DropdownMenuLabel className="text-xs uppercase font-semibold text-muted-foreground">Language</DropdownMenuLabel>
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
          বাংলা (Bengali)
        </DropdownMenuCheckboxItem>
      </DropdownMenuContent>
    </DropdownMenu>
          </div>
  )
}
