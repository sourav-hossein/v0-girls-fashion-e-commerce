import { NextResponse } from 'next/server'
import { createAdminSupabaseClient } from '@/lib/supabase-admin'
import { requireAdminRequest } from '@/lib/admin-api'
import { revalidateStorefrontPaths, sanitizeText } from '@/lib/media'

export async function GET() {
  const auth = await requireAdminRequest()
  if (!auth.ok) return auth.response

  const supabase = await createAdminSupabaseClient()
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('name')

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ categories: data || [] })
}

export async function POST(request: Request) {
  const auth = await requireAdminRequest()
  if (!auth.ok) return auth.response

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
    .insert({
      name,
      slug,
      description: description || null,
      image_url: image_url || null,
      image_alt: image_alt || null,
    })
    .select('*')
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  revalidateStorefrontPaths()

  return NextResponse.json({ category: data })
}
