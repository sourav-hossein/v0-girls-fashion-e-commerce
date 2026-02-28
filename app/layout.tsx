import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono, Cormorant_Garamond } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import Script from 'next/script'
import { ThemeProvider } from '@/components/theme-provider'
import { LanguageProvider } from '@/components/language-provider'
import { Toaster } from 'sonner'
import AnalyticsSession from '@/components/analytics-session'
import { createAdminSupabaseClient } from '@/lib/supabase-admin'
import { cookies } from 'next/headers'
import './globals.css'

const geist = Geist({ subsets: ["latin"] });
const geistMono = Geist_Mono({ subsets: ["latin"] });
const cormorant = Cormorant_Garamond({ 
  weight: ['400', '500', '600', '700'],
  subsets: ["latin"],
  variable: '--font-serif'
});

export const metadata: Metadata = {
  title: 'Hijab & Fashion Hub - Girls Fashion Accessories Bangladesh',
  description: 'Elegant girls fashion accessories including hijabs, earrings, handbags, hair clips, rings, bracelets, and combo offers. Fast delivery across Bangladesh.',
  keywords: 'hijab, earrings, handbags, hair clips, rings, bracelets, girls fashion, Bangladesh',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#faf8f6' },
    { media: '(prefers-color-scheme: dark)', color: '#261425' },
  ],
}

export const revalidate = 0

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const cookieStore = await cookies()
  const langValue = cookieStore.get('language')?.value
  const lang = langValue === 'bn' ? 'bn' : 'en'
  const supabase = await createAdminSupabaseClient()
  const { data } = await supabase
    .from('store_settings')
    .select('theme')
    .order('updated_at', { ascending: false })
    .limit(1)
    .maybeSingle()
  const theme = data?.theme ?? 'rose'

  return (
    <html lang={lang} suppressHydrationWarning data-theme={theme}>
      <body className={`${geist.className} ${geistMono.variable} ${cormorant.variable} font-sans antialiased`}>
        <Script id="brand-theme" strategy="beforeInteractive">
          {`document.documentElement.setAttribute('data-theme', '${theme}')`}
        </Script>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <LanguageProvider>
            <AnalyticsSession />
            {children}
            <Toaster />
          </LanguageProvider>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  )
}
