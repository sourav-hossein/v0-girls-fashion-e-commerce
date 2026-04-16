'use client'

import { useEffect, useRef, useState } from 'react'
import { Upload, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { SafeImage } from '@/components/ui/safe-image'

interface SingleImageInputProps {
  label: string
  description?: string
  imageUrl?: string | null
  altText?: string | null
  fallbackAlt?: string
  onFileChange?: (file: File | null) => void
  onAltTextChange?: (value: string) => void
  onRemove?: () => void
  disabled?: boolean
}

export function SingleImageInput({
  label,
  description,
  imageUrl,
  altText,
  fallbackAlt = 'Image preview',
  onFileChange,
  onAltTextChange,
  onRemove,
  disabled = false,
}: SingleImageInputProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(imageUrl || null)

  useEffect(() => {
    setPreviewUrl(imageUrl || null)
  }, [imageUrl])

  const handleSelect = (file: File | null) => {
    onFileChange?.(file)

    if (!file) {
      setPreviewUrl(imageUrl || null)
      return
    }

    const objectUrl = URL.createObjectURL(file)
    setPreviewUrl((current) => {
      if (current?.startsWith('blob:')) {
        URL.revokeObjectURL(current)
      }
      return objectUrl
    })
  }

  useEffect(() => {
    return () => {
      if (previewUrl?.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl)
      }
    }
  }, [previewUrl])

  return (
    <div className="space-y-3">
      <div>
        <Label>{label}</Label>
        {description ? (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        ) : null}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        disabled={disabled}
        onChange={(event) => handleSelect(event.target.files?.[0] || null)}
      />

      <div className="rounded-xl border border-dashed border-border bg-muted/20 p-4">
        {previewUrl ? (
          <div className="space-y-3">
            <div className="relative aspect-[4/3] overflow-hidden rounded-lg border border-border bg-muted">
              <SafeImage
                src={previewUrl}
                alt={altText || fallbackAlt}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => inputRef.current?.click()}
                disabled={disabled}
              >
                Replace Image
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={onRemove}
                disabled={disabled}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Remove
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-3 py-8 text-center">
            <Upload className="h-8 w-8 text-muted-foreground" />
            <div>
              <p className="font-medium text-foreground">Upload an image</p>
              <p className="text-sm text-muted-foreground">
                JPG, PNG, or WebP up to 5MB
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={() => inputRef.current?.click()}
              disabled={disabled}
            >
              Select Image
            </Button>
          </div>
        )}
      </div>

      <div className="space-y-2">
        <Label>Alt Text</Label>
        <Input
          value={altText || ''}
          onChange={(event) => onAltTextChange?.(event.target.value)}
          disabled={disabled}
          placeholder="Describe this image for accessibility"
        />
      </div>
    </div>
  )
}
