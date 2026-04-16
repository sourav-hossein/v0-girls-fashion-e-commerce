'use client'

import { useEffect, useState } from 'react'
import Image, { type ImageProps } from 'next/image'

type SafeImageProps = Omit<ImageProps, 'src'> & {
  src?: string | null
  fallbackSrc?: string
}

export function SafeImage({
  src,
  alt,
  fallbackSrc = '/placeholder.jpg',
  ...props
}: SafeImageProps) {
  const [currentSrc, setCurrentSrc] = useState<string>(src || fallbackSrc)

  useEffect(() => {
    setCurrentSrc(src || fallbackSrc)
  }, [fallbackSrc, src])

  return (
    <Image
      {...props}
      src={currentSrc}
      alt={alt}
      onError={() => {
        if (currentSrc !== fallbackSrc) {
          setCurrentSrc(fallbackSrc)
        }
      }}
    />
  )
}
