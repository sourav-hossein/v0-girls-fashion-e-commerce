'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { SafeImage } from '@/components/ui/safe-image'
import { HeroBanner } from '@/lib/types'
import Link from 'next/link'
import { useT } from '@/hooks/use-t'

interface HeroProps {
  banners?: HeroBanner[]
}

const fallbackBanner = {
  id: 'fallback',
  title: '',
  subtitle: '',
  desktop_image_url: '/images/hero_banner_1776280197610.png',
  desktop_image_path: null,
  desktop_image_alt: '',
  mobile_image_url: '/images/hero_banner_1776280197610.png',
  mobile_image_path: null,
  mobile_image_alt: '',
  cta_text: '',
  cta_url: '/shop',
  display_order: 0,
  active: true,
  created_at: '',
  updated_at: '',
} satisfies HeroBanner

export default function Hero({ banners = [] }: HeroProps) {
  const { t } = useT()
  const [activeIndex, setActiveIndex] = useState(0)

  const activeBanners = banners.length > 0 ? banners : [fallbackBanner]
  const activeBanner = activeBanners[activeIndex] || fallbackBanner

  useEffect(() => {
    if (activeBanners.length <= 1) return

    const interval = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % activeBanners.length)
    }, 6000)

    return () => window.clearInterval(interval)
  }, [activeBanners.length])

  useEffect(() => {
    if (activeIndex >= activeBanners.length) {
      setActiveIndex(0)
    }
  }, [activeBanners.length, activeIndex])

  const bannerTitle = activeBanner.title || t('home.heroHeading')
  const bannerSubtitle = activeBanner.subtitle || t('home.heroText')
  const primaryCtaText = activeBanner.cta_text || t('home.shopNow')
  const primaryCtaUrl = activeBanner.cta_url || '/shop'

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
                {bannerTitle}
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed max-w-xl">
                {bannerSubtitle}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link href={primaryCtaUrl}>
                <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                  {primaryCtaText}
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

            {activeBanners.length > 1 ? (
              <div className="flex items-center gap-2">
                {activeBanners.map((banner, index) => (
                  <button
                    key={banner.id}
                    type="button"
                    onClick={() => setActiveIndex(index)}
                    className={`h-2.5 rounded-full transition-all ${
                      activeIndex === index ? 'w-8 bg-primary' : 'w-2.5 bg-primary/25'
                    }`}
                    aria-label={`Show banner ${index + 1}`}
                  />
                ))}
              </div>
            ) : null}
          </div>

          <div className="block">
            <div className="relative aspect-square rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/20 overflow-hidden flex items-center justify-center">
              <div className="relative h-full w-full p-2">
                <div className="relative h-full w-full overflow-hidden rounded-2xl shadow-xl">
                  <div className="absolute inset-0 md:hidden">
                    <SafeImage
                      src={activeBanner.mobile_image_url || activeBanner.desktop_image_url}
                      alt={activeBanner.mobile_image_alt || activeBanner.desktop_image_alt || bannerTitle}
                      fill
                      priority
                      className="object-cover transition-transform duration-500 ease-out hover:scale-[1.02]"
                      sizes="100vw"
                    />
                  </div>
                  <div className="absolute inset-0 hidden md:block">
                    <SafeImage
                      src={activeBanner.desktop_image_url || activeBanner.mobile_image_url}
                      alt={activeBanner.desktop_image_alt || activeBanner.mobile_image_alt || bannerTitle}
                      fill
                      priority
                      className="object-cover transition-transform duration-500 ease-out hover:scale-[1.02]"
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                  </div>
                </div>
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

