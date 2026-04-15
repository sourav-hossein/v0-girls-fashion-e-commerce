'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ImageUploader } from '@/components/image-uploader'
import { UploadedImage } from '@/hooks/use-image-upload'
import { Trash2, Upload } from 'lucide-react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { useImageUpload } from '@/hooks/use-image-upload'

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
  const [image, setImage] = useState<UploadedImage | null>(initialImage || null)
  const { deleteImage } = useImageUpload({
    bucket: 'categories',
    folder: `categories/${categoryId}`,
  })

  const handleImageChange = (images: UploadedImage[]) => {
    const newImage = images[0] || null
    setImage(newImage)
    onImageChange(newImage)
  }

  const handleDelete = async () => {
    if (!image) return
    await deleteImage(image.id)
    setImage(null)
    onImageChange(null)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Category Image</CardTitle>
        <CardDescription>
          Upload a single image for this category. You can replace it anytime.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {image ? (
          <div className="space-y-4">
            <div className="relative w-full max-w-xs mx-auto aspect-square rounded-lg overflow-hidden border border-border">
              <Image
                src={image.url}
                alt={image.name}
                fill
                className="object-cover"
                priority
              />
            </div>
            <div className="flex gap-2 justify-center">
              <Button
                variant="outline"
                size="sm"
                onClick={() => document.getElementById('category-file-input')?.click()}
              >
                Replace Image
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm" className="gap-2">
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogTitle>Delete image?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This category image will be removed. You can upload a new one anytime.
                  </AlertDialogDescription>
                  <div className="flex gap-2 justify-end">
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete}>
                      Delete
                    </AlertDialogAction>
                  </div>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        ) : (
          <ImageUploader
            bucket="categories"
            folder={`categories/${categoryId}`}
            multiple={false}
            maxFiles={1}
            maxFileSize={5 * 1024 * 1024}
            onImagesChange={handleImageChange}
          />
        )}
      </CardContent>
    </Card>
  )
}
