import { revalidatePath, revalidateTag } from 'next/cache'

const DEFAULT_ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const DEFAULT_MAX_FILE_SIZE = 5 * 1024 * 1024

export type UploadImageResult = {
  path: string
  publicUrl: string
}

export function sanitizeText(value: unknown) {
  return typeof value === 'string' ? value.trim() : ''
}

export function getImageExtension(fileName: string) {
  const parts = fileName.split('.')
  if (parts.length < 2) return ''
  return parts[parts.length - 1].toLowerCase()
}

export function buildStoragePath({
  entityId,
  fileName,
  variant,
}: {
  entityId: string
  fileName: string
  variant?: string
}) {
  const extension = getImageExtension(fileName)
  const fileId = crypto.randomUUID()
  const suffix = extension ? `.${extension}` : ''
  return variant
    ? `${entityId}/${variant}/${fileId}${suffix}`
    : `${entityId}/${fileId}${suffix}`
}

export function validateImageFile(
  file: File,
  options?: {
    allowedTypes?: string[]
    maxFileSize?: number
  },
) {
  const allowedTypes = options?.allowedTypes || DEFAULT_ALLOWED_TYPES
  const maxFileSize = options?.maxFileSize ?? DEFAULT_MAX_FILE_SIZE

  if (!allowedTypes.includes(file.type)) {
    throw new Error('Only JPG, PNG, and WebP images are supported.')
  }

  if (file.size > maxFileSize) {
    throw new Error(`Image must be ${Math.round(maxFileSize / 1024 / 1024)}MB or smaller.`)
  }
}

export async function uploadPublicImage({
  supabase,
  bucket,
  file,
  path,
}: {
  supabase: any
  bucket: string
  file: File
  path: string
}): Promise<UploadImageResult> {
  const { error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(path, file, {
      contentType: file.type || 'application/octet-stream',
      cacheControl: '31536000',
      upsert: false,
    })

  if (uploadError) {
    throw new Error(uploadError.message)
  }

  const { data } = supabase.storage.from(bucket).getPublicUrl(path)
  return { path, publicUrl: data.publicUrl }
}

export async function deleteStoredImage({
  supabase,
  bucket,
  path,
}: {
  supabase: any
  bucket: string
  path?: string | null
}) {
  if (!path) return

  const { error } = await supabase.storage.from(bucket).remove([path])
  if (error) {
    throw new Error(error.message)
  }
}

export function revalidateStorefrontPaths(paths: string[] = []) {
  revalidateTag('categories')
  revalidatePath('/')
  revalidatePath('/shop')
  revalidatePath('/admin/categories')
  revalidatePath('/admin/settings')

  for (const path of paths) {
    revalidatePath(path)
  }
}
