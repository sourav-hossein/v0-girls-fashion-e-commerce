import { useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase'
import { toast } from 'sonner'

export interface UploadedImage {
  id: string
  url: string
  name: string
  size: number
  uploadedAt: Date
}

interface UseImageUploadOptions {
  bucket: string
  folder: string
  maxFileSize?: number // in bytes
  allowedTypes?: string[]
}

export function useImageUpload(options: UseImageUploadOptions) {
  const [isLoading, setIsLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([])

  const {
    bucket,
    folder,
    maxFileSize = 5 * 1024 * 1024, // 5MB default
    allowedTypes = ['image/jpeg', 'image/png', 'image/webp'],
  } = options

  const validateFile = useCallback(
    (file: File) => {
      if (!allowedTypes.includes(file.type)) {
        throw new Error(
          `Invalid file type. Allowed: ${allowedTypes.map((t) => t.split('/')[1]).join(', ')}`
        )
      }

      if (file.size > maxFileSize) {
        throw new Error(
          `File size exceeds ${Math.round(maxFileSize / 1024 / 1024)}MB limit`
        )
      }
    },
    [allowedTypes, maxFileSize]
  )

  const uploadImage = useCallback(
    async (file: File, fileName?: string) => {
      try {
        validateFile(file)
        setIsLoading(true)
        setProgress(0)

        const supabase = createClient()
        const uniqueName = fileName || `${Date.now()}-${file.name}`
        const filePath = `${folder}/${uniqueName}`

        // Upload file
        const { error: uploadError, data } = await supabase.storage
          .from(bucket)
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: true,
          })

        if (uploadError) throw uploadError

        // Get public URL
        const { data: urlData } = supabase.storage
          .from(bucket)
          .getPublicUrl(filePath)

        const uploadedImage: UploadedImage = {
          id: filePath,
          url: urlData.publicUrl,
          name: file.name,
          size: file.size,
          uploadedAt: new Date(),
        }

        setUploadedImages((prev) => [...prev, uploadedImage])
        setProgress(100)
        toast.success('Image uploaded successfully')
        return uploadedImage
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Upload failed'
        toast.error(message)
        throw error
      } finally {
        setIsLoading(false)
        setProgress(0)
      }
    },
    [bucket, folder, validateFile]
  )

  const uploadMultiple = useCallback(
    async (files: File[]) => {
      const results: UploadedImage[] = []

      for (let i = 0; i < files.length; i++) {
        try {
          setProgress(Math.round(((i + 1) / files.length) * 100))
          const result = await uploadImage(files[i])
          results.push(result)
        } catch (error) {
          console.error(`Failed to upload ${files[i].name}:`, error)
        }
      }

      return results
    },
    [uploadImage]
  )

  const deleteImage = useCallback(
    async (filePath: string) => {
      try {
        const supabase = createClient()

        const { error } = await supabase.storage
          .from(bucket)
          .remove([filePath])

        if (error) throw error

        setUploadedImages((prev) =>
          prev.filter((img) => img.id !== filePath)
        )
        toast.success('Image deleted successfully')
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Delete failed'
        toast.error(message)
        throw error
      }
    },
    [bucket]
  )

  const clearUploaded = useCallback(() => {
    setUploadedImages([])
  }, [])

  return {
    isLoading,
    progress,
    uploadedImages,
    uploadImage,
    uploadMultiple,
    deleteImage,
    clearUploaded,
  }
}
