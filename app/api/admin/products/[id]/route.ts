import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { createAdminSupabaseClient } from '@/lib/supabase-admin'
import { revalidatePath } from 'next/cache'

async function requireAdminApi() {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          )
        },
      },
    },
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { ok: false, response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    return { ok: false, response: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) }
  }

  return { ok: true, user }
}

export async function PATCH(request: Request, context: { params: { id: string } }) {
  const auth = await requireAdminApi()
  if (!auth.ok) return auth.response

  const body = await request.json().catch(() => ({}))
  const {
    product,
    variants_upsert,
    variants_delete_ids,
    images_update,
    deleted_at,
  } = body ?? {}

  const supabase = await createAdminSupabaseClient()
  const productId = context.params.id

  if (product && typeof product === 'object') {
    const updatePayload: Record<string, any> = {
      updated_at: new Date().toISOString(),
    }
    if (typeof product.name === 'string') updatePayload.name = product.name.trim()
    if (typeof product.slug === 'string') updatePayload.slug = product.slug.trim()
    if (typeof product.description === 'string') updatePayload.description = product.description.trim() || null
    if (typeof product.category_id === 'string') updatePayload.category_id = product.category_id
    if (Number.isFinite(Number(product.price))) updatePayload.price = Number(product.price)
    if (product.discount_price === '' || product.discount_price === null) {
      updatePayload.discount_price = null
    } else if (Number.isFinite(Number(product.discount_price))) {
      updatePayload.discount_price = Number(product.discount_price)
    }
    if (Number.isFinite(Number(product.stock_quantity))) updatePayload.stock_quantity = Number(product.stock_quantity)
    if (Number.isFinite(Number(product.low_stock_threshold))) {
      updatePayload.low_stock_threshold = Number(product.low_stock_threshold)
    }
    if (typeof product.featured === 'boolean') updatePayload.featured = product.featured
    if (typeof product.trending === 'boolean') updatePayload.trending = product.trending

    const { error: productError } = await supabase
      .from('products')
      .update(updatePayload)
      .eq('id', productId)

    if (productError) {
      return NextResponse.json({ error: productError.message }, { status: 500 })
    }
  }

  if (deleted_at === null) {
    const { error: restoreError } = await supabase
      .from('products')
      .update({ deleted_at: null, updated_at: new Date().toISOString() })
      .eq('id', productId)
    if (restoreError) {
      return NextResponse.json({ error: restoreError.message }, { status: 500 })
    }
  }

  if (Array.isArray(variants_upsert)) {
    for (const variant of variants_upsert) {
      const variantType = typeof variant?.variant_type === 'string' ? variant.variant_type.trim() : ''
      const variantValue = typeof variant?.variant_value === 'string' ? variant.variant_value.trim() : ''
      const qty = Number(variant?.stock_quantity)
      if (!variantType || !variantValue || !Number.isFinite(qty)) continue

      if (variant?.id) {
        const { error: variantError } = await supabase
          .from('product_variants')
          .update({
            variant_type: variantType,
            variant_value: variantValue,
            stock_quantity: qty,
            updated_at: new Date().toISOString(),
          })
          .eq('id', variant.id)
          .eq('product_id', productId)
        if (variantError) {
          return NextResponse.json({ error: variantError.message }, { status: 500 })
        }
      } else {
        const { error: insertError } = await supabase
          .from('product_variants')
          .insert({
            product_id: productId,
            variant_type: variantType,
            variant_value: variantValue,
            stock_quantity: qty,
            updated_at: new Date().toISOString(),
          })
        if (insertError) {
          return NextResponse.json({ error: insertError.message }, { status: 500 })
        }
      }
    }
  }

  if (Array.isArray(variants_delete_ids) && variants_delete_ids.length > 0) {
    const { error: deleteError } = await supabase
      .from('product_variants')
      .delete()
      .eq('product_id', productId)
      .in('id', variants_delete_ids)
    if (deleteError) {
      return NextResponse.json({ error: deleteError.message }, { status: 500 })
    }
  }

  if (Array.isArray(images_update) && images_update.length > 0) {
    const hasMain = images_update.some((img) => img?.is_main === true)
    if (hasMain) {
      const { error: resetError } = await supabase
        .from('product_images')
        .update({ is_main: false })
        .eq('product_id', productId)
      if (resetError) {
        return NextResponse.json({ error: resetError.message }, { status: 500 })
      }
    }

    for (const image of images_update) {
      if (!image?.id) continue
      const updatePayload: Record<string, any> = {}
      if (typeof image.alt_text === 'string') updatePayload.alt_text = image.alt_text.trim() || null
      if (typeof image.is_main === 'boolean') updatePayload.is_main = image.is_main
      if (Number.isFinite(Number(image.display_order))) updatePayload.display_order = Number(image.display_order)

      const { error: imageError } = await supabase
        .from('product_images')
        .update(updatePayload)
        .eq('id', image.id)
        .eq('product_id', productId)

      if (imageError) {
        return NextResponse.json({ error: imageError.message }, { status: 500 })
      }
    }
  }

  revalidatePath('/')
  revalidatePath('/shop')
  if (product?.slug && typeof product.slug === 'string') {
    revalidatePath(`/product/${product.slug}`)
  }

  return NextResponse.json({ success: true })
}

export async function DELETE(_: Request, context: { params: { id: string } }) {
  const auth = await requireAdminApi()
  if (!auth.ok) return auth.response

  const supabase = await createAdminSupabaseClient()
  const productId = context.params.id

  const { error } = await supabase
    .from('products')
    .update({ deleted_at: new Date().toISOString(), updated_at: new Date().toISOString() })
    .eq('id', productId)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  revalidatePath('/')
  revalidatePath('/shop')

  return NextResponse.json({ success: true })
}
