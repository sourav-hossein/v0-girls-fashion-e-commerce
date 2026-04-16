'use client'

import Image from 'next/image'
import { Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { UploadedImage } from '@/hooks/use-image-upload'

interface ImageGalleryProps {
  images: UploadedImage[]
  featuredId?: string
  onFeaturedChange?: (imageId: string) => void
  selectable?: boolean
}

export function ImageGallery({
  images,
  featuredId,
  onFeaturedChange,
  selectable = true,
}: ImageGalleryProps) {
  if (images.length === 0) {
    return (
      <div className="flex items-center justify-center p-8 text-center">
        <p className="text-muted-foreground">No images yet</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {images.map((image) => {
        const isFeatured = featuredId === image.id

        return (
          <Card
            key={image.id}
            className={`overflow-hidden cursor-pointer transition-all ${
              isFeatured ? 'ring-2 ring-primary shadow-lg' : 'hover:shadow-md'
            }`}
            onClick={() => {
              if (selectable && onFeaturedChange) {
                onFeaturedChange(image.id)
              }
            }}
          >
            <div className="relative w-full aspect-square bg-muted">
              <Image
                src={image.url}
                alt={image.name}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, (max-width: 1280px) 25vw, 20vw"
              />

              {isFeatured && (
                <div className="absolute top-2 right-2">
                  <Badge className="bg-primary text-primary-foreground gap-1">
                    <Star className="w-3 h-3" />
                    Featured
                  </Badge>
                </div>
              )}

              {selectable && (
                <div className="absolute inset-0 bg-black/0 hover:bg-black/20 transition-colors flex items-center justify-center">
                  {!isFeatured && (
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      className="opacity-0 group-hover:opacity-100"
                    >
                      <Star className="w-4 h-4 mr-1" />
                      Set as Featured
                    </Button>
                  )}
                </div>
              )}
            </div>
          </Card>
        )
      })}
    </div>
  )
}
