import { NextRequest, NextResponse } from 'next/server'
import { createAdminSupabaseClient } from '@/lib/supabase-admin'
import { requireAdminRequest } from '@/lib/admin-api'
import { deleteStoredImage, revalidateStorefrontPaths, sanitizeText } from '@/lib/media'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await requireAdminRequest()
  if (!auth.ok) return auth.response

  const supabase = await createAdminSupabaseClient()
  const { data: banner, error } = await supabase
    .from('hero_banners')
    .select('*')
    .eq('id', params.id)
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(banner)
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await requireAdminRequest()
  if (!auth.ok) return auth.response

  const body = await request.json().catch(() => ({}))
  const title = sanitizeText(body.title)

  if (!title) {
    return NextResponse.json({ error: 'Banner title is required.' }, { status: 400 })
  }

  const supabase = await createAdminSupabaseClient()
  const { data: banner, error } = await supabase
    .from('hero_banners')
    .update({
      title,
      subtitle: sanitizeText(body.subtitle) || null,
      desktop_image_url: sanitizeText(body.desktop_image_url) || null,
      desktop_image_alt: sanitizeText(body.desktop_image_alt) || null,
      mobile_image_url: sanitizeText(body.mobile_image_url) || null,
      mobile_image_alt: sanitizeText(body.mobile_image_alt) || null,
      cta_text: sanitizeText(body.cta_text) || null,
      cta_url: sanitizeText(body.cta_url) || null,
      display_order: Number.isFinite(Number(body.display_order)) ? Number(body.display_order) : 0,
      active: body.active !== false,
      updated_at: new Date().toISOString(),
    })
    .eq('id', params.id)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  revalidateStorefrontPaths()
  return NextResponse.json(banner)
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await requireAdminRequest()
  if (!auth.ok) return auth.response

  const supabase = await createAdminSupabaseClient()
  const { data: banner, error: fetchError } = await supabase
    .from('hero_banners')
    .select('desktop_image_path, mobile_image_path')
    .eq('id', params.id)
    .single()

  if (fetchError) {
    return NextResponse.json({ error: fetchError.message }, { status: 500 })
  }

  try {
    await deleteStoredImage({
      supabase,
      bucket: 'hero-banners',
      path: banner?.desktop_image_path,
    })
    await deleteStoredImage({
      supabase,
      bucket: 'hero-banners',
      path: banner?.mobile_image_path,
    })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete banner images.' },
      { status: 500 },
    )
  }

  const { error } = await supabase
    .from('hero_banners')
    .delete()
    .eq('id', params.id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  revalidateStorefrontPaths()
  return NextResponse.json({ success: true })
}
