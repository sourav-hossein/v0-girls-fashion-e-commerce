'use client'

import { useCallback, useRef, useState } from 'react'
import Image from 'next/image'
import { Upload, Trash2, X, GripVertical } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { useImageUpload, UploadedImage } from '@/hooks/use-image-upload'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'

interface ImageUploaderProps {
  bucket: string
  folder: string
  multiple?: boolean
  onImagesChange?: (images: UploadedImage[]) => void
  maxFiles?: number
  maxFileSize?: number
  initialImages?: UploadedImage[]
}

export function ImageUploader({
  bucket,
  folder,
  multiple = true,
  onImagesChange,
  maxFiles = 10,
  maxFileSize = 5 * 1024 * 1024,
  initialImages = [],
}: ImageUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [dragActive, setDragActive] = useState(false)
  const [localImages, setLocalImages] = useState<UploadedImage[]>(initialImages)
  const { isLoading, progress, uploadMultiple, deleteImage } = useImageUpload({
    bucket,
    folder,
    maxFileSize,
  })

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(e.type === 'dragenter' || e.type === 'dragover')
  }, [])

  const handleFiles = useCallback(
    async (files: FileList) => {
      const fileArray = Array.from(files)
      const remainingSlots = maxFiles - localImages.length

      if (fileArray.length > remainingSlots) {
        alert(
          `Can only upload ${remainingSlots} more image(s). Max is ${maxFiles}.`
        )
        return
      }

      if (!multiple && fileArray.length > 1) {
        alert('Only one image can be uploaded')
        return
      }

      try {
        const uploaded = await uploadMultiple(fileArray)
        const newImages = [...localImages, ...uploaded]
        setLocalImages(newImages)
        onImagesChange?.(newImages)
      } catch (error) {
        console.error('Upload error:', error)
      }
    },
    [localImages, maxFiles, multiple, uploadMultiple, onImagesChange]
  )

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setDragActive(false)
      handleFiles(e.dataTransfer.files)
    },
    [handleFiles]
  )

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(e.target.files)
    }
  }

  const handleDelete = async (imageId: string) => {
    await deleteImage(imageId)
    const updated = localImages.filter((img) => img.id !== imageId)
    setLocalImages(updated)
    onImagesChange?.(updated)
  }

  const handleReorder = (fromIndex: number, toIndex: number) => {
    const newImages = [...localImages]
    const [removed] = newImages.splice(fromIndex, 1)
    newImages.splice(toIndex, 0, removed)
    setLocalImages(newImages)
    onImagesChange?.(newImages)
  }

  const isMaxReached = localImages.length >= maxFiles

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`relative rounded-lg border-2 border-dashed transition-colors ${
          dragActive
            ? 'border-primary bg-primary/5'
            : 'border-border hover:border-primary/50'
        } ${isLoading ? 'opacity-50' : ''}`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple={multiple}
          accept="image/jpeg,image/png,image/webp"
          onChange={handleInputChange}
          disabled={isLoading || isMaxReached}
          className="hidden"
        />

        <div className="flex flex-col items-center justify-center gap-3 p-8">
          <Upload className="w-8 h-8 text-muted-foreground" />
          <div className="text-center">
            <p className="font-medium text-foreground">
              Drag images here or click to select
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Supports JPG, PNG, WebP up to {Math.round(maxFileSize / 1024 / 1024)}MB
            </p>
            {!isMaxReached && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading}
                className="mt-4"
              >
                Select Files
              </Button>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        {isLoading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80 rounded-lg">
            <Progress value={progress} className="w-32" />
            <p className="text-sm text-muted-foreground mt-2">{progress}%</p>
          </div>
        )}
      </div>

      {/* Image Count */}
      {localImages.length > 0 && (
        <p className="text-sm text-muted-foreground">
          {localImages.length} / {maxFiles} images uploaded
        </p>
      )}

      {/* Images Grid */}
      {localImages.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {localImages.map((image, index) => (
            <div
              key={image.id}
              className="relative group"
              draggable={multiple && localImages.length > 1}
            >
              <Card className="overflow-hidden">
                <div className="relative w-full aspect-square bg-muted">
                  <Image
                    src={image.url}
                    alt={image.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  />
                </div>

                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  {multiple && localImages.length > 1 && (
                    <GripVertical className="w-5 h-5 text-white cursor-grab active:cursor-grabbing" />
                  )}
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="bg-destructive/80 hover:bg-destructive text-white"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogTitle>Delete image?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone.
                      </AlertDialogDescription>
                      <div className="flex gap-2 justify-end">
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(image.id)}
                        >
                          Delete
                        </AlertDialogAction>
                      </div>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>

                {/* Image Name */}
                <div className="p-2 text-xs truncate text-muted-foreground">
                  {image.name}
                </div>
              </Card>
            </div>
          ))}
        </div>
      )}

      {isMaxReached && (
        <div className="p-3 bg-muted rounded-lg text-sm text-muted-foreground">
          Maximum number of images reached ({maxFiles})
        </div>
      )}
    </div>
  )
}
