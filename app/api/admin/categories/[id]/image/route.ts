import { NextResponse } from 'next/server'
import { createAdminSupabaseClient } from '@/lib/supabase-admin'
import { requireAdminRequest } from '@/lib/admin-api'
import {
  buildStoragePath,
  deleteStoredImage,
  revalidateStorefrontPaths,
  sanitizeText,
  uploadPublicImage,
  validateImageFile,
} from '@/lib/media'

export async function POST(request: Request, context: { params: { id: string } }) {
  const auth = await requireAdminRequest()
  if (!auth.ok) return auth.response

  const categoryId = context.params.id
  const formData = await request.formData()
  const file = formData.get('file')

  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'Image file is required.' }, { status: 400 })
  }

  try {
    validateImageFile(file)
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Invalid image.' },
      { status: 400 },
    )
  }

  const imageAlt = sanitizeText(formData.get('alt_text'))
  const supabase = await createAdminSupabaseClient()
  const { data: existing, error: existingError } = await supabase
    .from('categories')
    .select('image_path')
    .eq('id', categoryId)
    .single()

  if (existingError) {
    return NextResponse.json({ error: existingError.message }, { status: 500 })
  }

  try {
    const uploaded = await uploadPublicImage({
      supabase,
      bucket: 'category-images',
      file,
      path: buildStoragePath({
        entityId: categoryId,
        fileName: file.name,
      }),
    })

    const { data: category, error: updateError } = await supabase
      .from('categories')
      .update({
        image_url: uploaded.publicUrl,
        image_path: uploaded.path,
        image_alt: imageAlt || null,
        updated_at: new Date(),
      })
      .eq('id', categoryId)
      .select('*')
      .single()

    if (updateError) {
      throw new Error(updateError.message)
    }

    await deleteStoredImage({
      supabase,
      bucket: 'category-images',
      path: existing?.image_path,
    })

    revalidateStorefrontPaths()
    return NextResponse.json({ category })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to upload category image.' },
      { status: 500 },
    )
  }
}

export async function DELETE(_: Request, context: { params: { id: string } }) {
  const auth = await requireAdminRequest()
  if (!auth.ok) return auth.response

  const categoryId = context.params.id
  const supabase = await createAdminSupabaseClient()

  const { data: category, error: fetchError } = await supabase
    .from('categories')
    .select('image_path')
    .eq('id', categoryId)
    .single()

  if (fetchError) {
    return NextResponse.json({ error: fetchError.message }, { status: 500 })
  }

  try {
    await deleteStoredImage({
      supabase,
      bucket: 'category-images',
      path: category?.image_path,
    })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete category image.' },
      { status: 500 },
    )
  }

  const { data: updated, error: updateError } = await supabase
    .from('categories')
    .update({
      image_url: null,
      image_path: null,
      image_alt: null,
      updated_at: new Date(),
    })
    .eq('id', categoryId)
    .select('*')
    .single()

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 })
  }

  revalidateStorefrontPaths()
  return NextResponse.json({ category: updated })
}
