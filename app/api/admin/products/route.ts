import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { createAdminSupabaseClient } from '@/lib/supabase-admin'
import { revalidatePath } from 'next/cache'

import { requireAdminRequest } from '@/lib/admin-api'

function sanitizeInput(value: unknown) {
  if (typeof value !== 'string') return ''
  return value.trim()
}

export async function GET(request: Request) {
  const auth = await requireAdminRequest()
  if (!auth.ok) return auth.response

  const { searchParams } = new URL(request.url)
  const includeDeleted = searchParams.get('include_deleted') === 'true'
  const search = sanitizeInput(searchParams.get('search'))
  const categoryId = sanitizeInput(searchParams.get('category_id'))

  const supabase = await createAdminSupabaseClient()
  let query = supabase
    .from('products')
    .select('*, categories (name), product_images (id, image_url, is_main, display_order)')
    .order('created_at', { ascending: false })

  if (!includeDeleted) {
    query = query.is('deleted_at', null)
  }

  if (categoryId) {
    query = query.eq('category_id', categoryId)
  }

  if (search) {
    query = query.or(`name.ilike.%${search}%,slug.ilike.%${search}%`)
  }

  const { data, error } = await query
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ products: data || [] })
}

export async function POST(request: Request) {
  const auth = await requireAdminRequest()
  if (!auth.ok) return auth.response

  const payload = await request.json().catch(() => ({}))
  const name = sanitizeInput(payload?.name)
  const slug = sanitizeInput(payload?.slug)
  const description = sanitizeInput(payload?.description)
  const category_id = sanitizeInput(payload?.category_id)
  const price = Number(payload?.price)
  const discount_price = payload?.discount_price === '' ? null : Number(payload?.discount_price)

  if (!name || !slug || !category_id || !Number.isFinite(price)) {
    return NextResponse.json({ error: 'Name, slug, category, and price are required.' }, { status: 400 })
  }

  const supabase = await createAdminSupabaseClient()
  const { data, error } = await supabase
    .from('products')
    .insert({
      name,
      slug,
      description: description || null,
      category_id,
      price,
      discount_price: Number.isFinite(discount_price) ? discount_price : null,
      stock_quantity: Number.isFinite(Number(payload?.stock_quantity)) ? Number(payload?.stock_quantity) : 0,
      low_stock_threshold: Number.isFinite(Number(payload?.low_stock_threshold))
        ? Number(payload?.low_stock_threshold)
        : null,
      featured: Boolean(payload?.featured),
      trending: Boolean(payload?.trending),
      updated_at: new Date(),
    })
    .select('*')
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  revalidatePath('/')
  revalidatePath('/shop')

  return NextResponse.json({ product: data })
}
