'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { ArrowDown, ArrowUp, ImagePlus, Star, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { ProductImage } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { SafeImage } from '@/components/ui/safe-image'

interface ProductImageManagerProps {
  productId: string
  initialImages?: ProductImage[]
  images?: ProductImage[]
  onImagesChange: (images: ProductImage[]) => void
  onUploadingChange?: (isUploading: boolean) => void
}

function normalizeDisplayOrder(images: ProductImage[]) {
  return images.map((image, index) => ({
    ...image,
    display_order: index,
  }))
}

export function ProductImageManager({
  productId,
  initialImages = [],
  images,
  onImagesChange,
  onUploadingChange,
}: ProductImageManagerProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [localImages, setLocalImages] = useState<ProductImage[]>(images || initialImages)
  const [isUploading, setIsUploading] = useState(false)

  useEffect(() => {
    setLocalImages(images || initialImages)
  }, [images, initialImages])

  const sortedImages = useMemo(
    () => [...localImages].sort((a, b) => a.display_order - b.display_order),
    [localImages],
  )

  const commitImages = (nextImages: ProductImage[]) => {
    const normalized = normalizeDisplayOrder(nextImages)
    setLocalImages(normalized)
    onImagesChange(normalized)
  }

  const handleFilesSelected = async (files: FileList | null) => {
    if (!files?.length) return

    setIsUploading(true)
    onUploadingChange?.(true)

    try {
      const uploadedImages: ProductImage[] = []
      const startingIndex = sortedImages.length

      for (const [index, file] of Array.from(files).entries()) {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('alt_text', file.name.replace(/\.[^.]+$/, ''))
        formData.append('display_order', String(startingIndex + index))
        formData.append('is_main', String(sortedImages.length === 0 && index === 0))

        const response = await fetch(`/api/admin/products/${productId}/images`, {
          method: 'POST',
          body: formData,
        })
        const payload = await response.json().catch(() => ({}))
        if (!response.ok) {
          throw new Error(payload?.error || `Failed to upload ${file.name}`)
        }
        uploadedImages.push(payload.image)
      }

      commitImages([...sortedImages, ...uploadedImages])
      toast.success(uploadedImages.length > 1 ? 'Images uploaded' : 'Image uploaded')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Image upload failed')
    } finally {
      setIsUploading(false)
      onUploadingChange?.(false)
      if (inputRef.current) {
        inputRef.current.value = ''
      }
    }
  }

  const handleDelete = async (imageId: string) => {
    if (!confirm('Delete this image?')) return

    try {
      const response = await fetch(`/api/admin/products/${productId}/images/${imageId}`, {
        method: 'DELETE',
      })
      const payload = await response.json().catch(() => ({}))
      if (!response.ok) {
        throw new Error(payload?.error || 'Failed to delete image')
      }

      const remaining = sortedImages.filter((image) => image.id !== imageId)
      const normalized = normalizeDisplayOrder(remaining).map((image, index) => ({
        ...image,
        is_main: remaining.some((item) => item.is_main) ? image.is_main : index === 0,
      }))
      commitImages(normalized)
      toast.success('Image deleted')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete image')
    }
  }

  const handleAltTextChange = (imageId: string, value: string) => {
    commitImages(
      sortedImages.map((image) =>
        image.id === imageId ? { ...image, alt_text: value } : image,
      ),
    )
  }

  const handleSetMain = (imageId: string) => {
    commitImages(
      sortedImages.map((image) => ({
        ...image,
        is_main: image.id === imageId,
      })),
    )
  }

  const moveImage = (imageId: string, direction: 'up' | 'down') => {
    const index = sortedImages.findIndex((image) => image.id === imageId)
    if (index === -1) return

    const nextIndex = direction === 'up' ? index - 1 : index + 1
    if (nextIndex < 0 || nextIndex >= sortedImages.length) return

    const reordered = [...sortedImages]
    const [moved] = reordered.splice(index, 1)
    reordered.splice(nextIndex, 0, moved)
    commitImages(reordered)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Product Images</CardTitle>
        <CardDescription>
          Upload a gallery, choose the featured image, edit alt text, and reorder the display.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="rounded-xl border border-dashed border-border bg-muted/20 p-6">
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            className="hidden"
            disabled={isUploading}
            onChange={(event) => handleFilesSelected(event.target.files)}
          />
          <div className="flex flex-col items-center justify-center gap-3 text-center">
            <ImagePlus className="h-8 w-8 text-muted-foreground" />
            <div>
              <p className="font-medium text-foreground">Add product images</p>
              <p className="text-sm text-muted-foreground">
                JPG, PNG, and WebP supported. The first image becomes featured automatically.
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={() => inputRef.current?.click()}
              disabled={isUploading}
            >
              {isUploading ? 'Uploading...' : 'Upload Images'}
            </Button>
          </div>
        </div>

        {sortedImages.length === 0 ? (
          <div className="rounded-xl border border-border bg-muted/10 p-6 text-center text-sm text-muted-foreground">
            No images uploaded yet.
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {sortedImages.map((image, index) => (
              <div
                key={image.id}
                className="space-y-3 rounded-xl border border-border bg-card p-3 shadow-sm"
              >
                <div className="relative aspect-square overflow-hidden rounded-lg border border-border bg-muted">
                  <SafeImage
                    src={image.image_url}
                    alt={image.alt_text || `Product image ${index + 1}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                  {image.is_main ? (
                    <div className="absolute left-2 top-2 rounded-full bg-primary px-2 py-1 text-xs font-medium text-primary-foreground">
                      Featured
                    </div>
                  ) : null}
                </div>

                <Input
                  value={image.alt_text || ''}
                  onChange={(event) => handleAltTextChange(image.id, event.target.value)}
                  placeholder="Alt text"
                />

                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant={image.is_main ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleSetMain(image.id)}
                  >
                    <Star className="mr-2 h-4 w-4" />
                    {image.is_main ? 'Featured' : 'Set Featured'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => moveImage(image.id, 'up')}
                    disabled={index === 0}
                  >
                    <ArrowUp className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => moveImage(image.id, 'down')}
                    disabled={index === sortedImages.length - 1}
                  >
                    <ArrowDown className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(image.id)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
