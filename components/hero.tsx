'use client'

import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { useT } from '@/hooks/use-t'

export default function Hero() {
  const { t } = useT()
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-accent/5 to-secondary/10 py-20 sm:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div>
              <p className="text-primary font-semibold mb-2 uppercase tracking-widest text-sm">
                {t('home.welcome')}
              </p>
              <h1 className="text-5xl sm:text-6xl font-serif font-bold text-foreground leading-tight mb-4">
                {t('home.heroHeading')}
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed max-w-xl">
                {t('home.heroText')}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/shop">
                <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                  {t('home.shopNow')}
                </Button>
              </Link>
              <Link href="/shop">
                <Button size="lg" variant="outline" className="border-primary text-primary hover:bg-primary/5">
                  {t('home.browseCollection')}
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-3 gap-4 pt-8 border-t border-border/50">
              <div>
                <p className="text-2xl font-bold text-primary">500+</p>
                <p className="text-sm text-muted-foreground">{t('home.productsCountLabel')}</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-accent">10k+</p>
                <p className="text-sm text-muted-foreground">{t('home.happyCustomersLabel')}</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-secondary">24/7</p>
                <p className="text-sm text-muted-foreground">{t('home.supportLabel')}</p>
              </div>
            </div>
          </div>

          <div className="hidden md:block">
            <div className="relative aspect-square rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/20 overflow-hidden flex items-center justify-center">
              <div className="text-center">
                <img
                  src="data:image/jpeg;base64,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"
                  alt={t('home.featuredImageLabel')}
                  className="w-full h-full object-cover rounded-2xl"
                />
                <p className="text-muted-foreground text-sm">{t('home.featuredImageLabel')}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent/5 rounded-full blur-3xl -z-10" />
    </section>
  )
}
