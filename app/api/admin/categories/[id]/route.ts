import { NextResponse } from 'next/server'
import { createAdminSupabaseClient } from '@/lib/supabase-admin'
import { requireAdminRequest } from '@/lib/admin-api'
import { deleteStoredImage, revalidateStorefrontPaths, sanitizeText } from '@/lib/media'

export async function PATCH(request: Request, context: { params: { id: string } }) {
  const auth = await requireAdminRequest()
  if (!auth.ok) return auth.response

  const categoryId = context.params.id
  const payload = await request.json().catch(() => ({}))

  const name = sanitizeText(payload?.name)
  const slug = sanitizeText(payload?.slug)
  const description = sanitizeText(payload?.description)
  const image_url = sanitizeText(payload?.image_url)
  const image_alt = sanitizeText(payload?.image_alt)

  if (!name || !slug) {
    return NextResponse.json({ error: 'Name and slug are required.' }, { status: 400 })
  }

  const supabase = await createAdminSupabaseClient()
  const { data, error } = await supabase
    .from('categories')
    .update({
      name,
      slug,
      description: description || null,
      image_url: image_url || null,
      image_path: image_url ? undefined : null,
      image_alt: image_alt || null,
      updated_at: new Date(),
    })
    .eq('id', categoryId)
    .select('*')
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  revalidateStorefrontPaths()

  return NextResponse.json({ category: data })
}

export async function DELETE(_: Request, context: { params: { id: string } }) {
  const auth = await requireAdminRequest()
  if (!auth.ok) return auth.response

  const categoryId = context.params.id
  const supabase = await createAdminSupabaseClient()

  const { data: category } = await supabase
    .from('categories')
    .select('image_path')
    .eq('id', categoryId)
    .single()

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

  const { error } = await supabase
    .from('categories')
    .delete()
    .eq('id', categoryId)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  revalidateStorefrontPaths()

  return NextResponse.json({ success: true })
}
