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

function getVariantFields(variant: string) {
  if (variant === 'mobile') {
    return {
      url: 'mobile_image_url',
      path: 'mobile_image_path',
      alt: 'mobile_image_alt',
    } as const
  }

  return {
    url: 'desktop_image_url',
    path: 'desktop_image_path',
    alt: 'desktop_image_alt',
  } as const
}

export async function POST(request: Request, context: { params: { id: string } }) {
  const auth = await requireAdminRequest()
  if (!auth.ok) return auth.response

  const bannerId = context.params.id
  const formData = await request.formData()
  const file = formData.get('file')
  const variant = sanitizeText(formData.get('variant')) || 'desktop'

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

  const fields = getVariantFields(variant)
  const altText = sanitizeText(formData.get('alt_text'))
  const supabase = await createAdminSupabaseClient()
  const { data: existing, error: fetchError } = await supabase
    .from('hero_banners')
    .select(`${fields.path}`)
    .eq('id', bannerId)
    .single()

  if (fetchError) {
    return NextResponse.json({ error: fetchError.message }, { status: 500 })
  }

  try {
    const uploaded = await uploadPublicImage({
      supabase,
      bucket: 'hero-banners',
      file,
      path: buildStoragePath({
        entityId: bannerId,
        fileName: file.name,
        variant,
      }),
    })

    const { data: banner, error: updateError } = await supabase
      .from('hero_banners')
      .update({
        [fields.url]: uploaded.publicUrl,
        [fields.path]: uploaded.path,
        [fields.alt]: altText || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', bannerId)
      .select('*')
      .single()

    if (updateError) {
      throw new Error(updateError.message)
    }

    await deleteStoredImage({
      supabase,
      bucket: 'hero-banners',
      path: existing?.[fields.path],
    })

    revalidateStorefrontPaths()
    return NextResponse.json({ banner })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to upload banner image.' },
      { status: 500 },
    )
  }
}

export async function DELETE(request: Request, context: { params: { id: string } }) {
  const auth = await requireAdminRequest()
  if (!auth.ok) return auth.response

  const bannerId = context.params.id
  const { searchParams } = new URL(request.url)
  const variant = sanitizeText(searchParams.get('variant')) || 'desktop'
  const fields = getVariantFields(variant)
  const supabase = await createAdminSupabaseClient()

  const { data: banner, error: fetchError } = await supabase
    .from('hero_banners')
    .select(`${fields.path}`)
    .eq('id', bannerId)
    .single()

  if (fetchError) {
    return NextResponse.json({ error: fetchError.message }, { status: 500 })
  }

  try {
    await deleteStoredImage({
      supabase,
      bucket: 'hero-banners',
      path: banner?.[fields.path],
    })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete banner image.' },
      { status: 500 },
    )
  }

  const { data: updated, error: updateError } = await supabase
    .from('hero_banners')
    .update({
      [fields.url]: null,
      [fields.path]: null,
      [fields.alt]: null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', bannerId)
    .select('*')
    .single()

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 })
  }

  revalidateStorefrontPaths()
  return NextResponse.json({ banner: updated })
}
