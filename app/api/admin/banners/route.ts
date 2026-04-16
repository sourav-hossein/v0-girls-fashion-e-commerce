import { NextRequest, NextResponse } from 'next/server'
import { createAdminSupabaseClient } from '@/lib/supabase-admin'
import { requireAdminRequest } from '@/lib/admin-api'
import { revalidateStorefrontPaths, sanitizeText } from '@/lib/media'

export async function GET() {
  const auth = await requireAdminRequest()
  if (!auth.ok) return auth.response

  const supabase = await createAdminSupabaseClient()
  const { data: banners, error } = await supabase
    .from('hero_banners')
    .select('*')
    .order('display_order', { ascending: true })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(banners || [])
}

export async function POST(request: NextRequest) {
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
    .insert([
      {
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
      },
    ])
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  revalidateStorefrontPaths()
  return NextResponse.json(banner)
}
