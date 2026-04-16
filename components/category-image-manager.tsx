'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { SingleImageInput } from '@/components/ui/single-image-input'
import { UploadedImage } from '@/hooks/use-image-upload'

interface CategoryImageManagerProps {
  categoryId: string
  initialImage?: UploadedImage
  onImageChange: (image: UploadedImage | null) => void
}

export function CategoryImageManager({
  categoryId,
  initialImage,
  onImageChange,
}: CategoryImageManagerProps) {
  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(initialImage?.url || null)
  const [altText, setAltText] = useState(initialImage?.name || '')

  useEffect(() => {
    setPreviewUrl(initialImage?.url || null)
    setAltText(initialImage?.name || '')
  }, [initialImage])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Category Image</CardTitle>
        <CardDescription>
          Prepare a single category image preview. Persist it from the parent form.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <SingleImageInput
          label="Category Image"
          description={`Selected for category ${categoryId}`}
          imageUrl={previewUrl}
          altText={altText}
          fallbackAlt="Category image"
          onFileChange={(nextFile) => {
            setFile(nextFile)
            if (nextFile) {
              const nextImage = {
                id: `${categoryId}-${Date.now()}`,
                url: URL.createObjectURL(nextFile),
                name: nextFile.name,
                size: nextFile.size,
                uploadedAt: new Date(),
              }
              setPreviewUrl(nextImage.url)
              setAltText(nextFile.name)
              onImageChange(nextImage)
            } else {
              setPreviewUrl(null)
              onImageChange(null)
            }
          }}
          onAltTextChange={(value) => {
            setAltText(value)
            if (previewUrl) {
              onImageChange({
                id: initialImage?.id || `${categoryId}-${Date.now()}`,
                url: previewUrl,
                name: value || file?.name || initialImage?.name || 'Category image',
                size: file?.size || initialImage?.size || 0,
                uploadedAt: initialImage?.uploadedAt || new Date(),
              })
            }
          }}
          onRemove={() => {
            setFile(null)
            setPreviewUrl(null)
            setAltText('')
            onImageChange(null)
          }}
        />
      </CardContent>
    </Card>
  )
}
