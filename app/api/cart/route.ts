import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

type CartItemRow = {
  id: string
  user_id: string
  product_id: string
  variant_id: string | null
  quantity: number
}

async function getSupabaseClient() {
  const cookieStore = await cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        },
      },
    }
  )
}

async function getAuthedUser() {
  const supabase = await getSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { user: null, supabase, response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }
  }
  return { user, supabase, response: null }
}

async function validateStock({
  supabase,
  productId,
  variantId,
  quantity,
}: {
  supabase: ReturnType<typeof createServerClient>
  productId: string
  variantId?: string | null
  quantity: number
}) {
  const { data: product, error: productError } = await supabase
    .from('products')
    .select('id, stock_quantity')
    .eq('id', productId)
    .single()

  if (productError || !product) {
    return { ok: false, message: 'Product not found' }
  }

  if (variantId) {
    const { data: variant, error: variantError } = await supabase
      .from('product_variants')
      .select('id, stock_quantity')
      .eq('id', variantId)
      .eq('product_id', productId)
      .single()

    if (variantError || !variant) {
      return { ok: false, message: 'Variant not found' }
    }

    if (variant.stock_quantity < quantity) {
      return { ok: false, message: 'Insufficient stock for this variant' }
    }
    return { ok: true }
  }

  if (product.stock_quantity < quantity) {
    return { ok: false, message: 'Insufficient stock' }
  }

  return { ok: true }
}

export async function GET(request: NextRequest) {
  const { user, supabase, response } = await getAuthedUser()
  if (!user) return response!

  const { data: cartItems, error } = await supabase
    .from('cart')
    .select('*, product:products(*), variant:product_variants(*)')
    .eq('user_id', user.id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(cartItems)
}

export async function POST(request: NextRequest) {
  const { user, supabase, response } = await getAuthedUser()
  if (!user) return response!

  const body = await request.json()
  const { product_id, variant_id, quantity } = body ?? {}
  const desiredQuantity = Number.isFinite(Number(quantity)) ? Number(quantity) : 1

  if (!product_id || desiredQuantity <= 0) {
    return NextResponse.json({ error: 'Invalid cart payload' }, { status: 400 })
  }

  const { data: existing } = await supabase
    .from('cart')
    .select('*')
    .eq('user_id', user.id)
    .eq('product_id', product_id)
    .is('variant_id', variant_id ?? null)
    .maybeSingle()

  const existingQuantity = (existing as CartItemRow | null)?.quantity ?? 0
  const nextQuantity = existingQuantity + desiredQuantity

  const stockCheck = await validateStock({
    supabase,
    productId: product_id,
    variantId: variant_id ?? null,
    quantity: nextQuantity,
  })
  if (!stockCheck.ok) {
    return NextResponse.json({ error: stockCheck.message }, { status: 400 })
  }

  const payload = existing
    ? {
        id: (existing as CartItemRow).id,
        quantity: nextQuantity,
        updated_at: new Date().toISOString(),
      }
    : {
        user_id: user.id,
        product_id,
        variant_id: variant_id ?? null,
        quantity: nextQuantity,
        updated_at: new Date().toISOString(),
      }

  const { data, error } = await supabase
    .from('cart')
    .upsert(payload)
    .select('*, product:products(*), variant:product_variants(*)')
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

export async function PATCH(request: NextRequest) {
  const { user, supabase, response } = await getAuthedUser()
  if (!user) return response!

  const body = await request.json()
  const { id, quantity } = body ?? {}
  const nextQuantity = Number(quantity)

  if (!id || !Number.isFinite(nextQuantity)) {
    return NextResponse.json({ error: 'Invalid cart payload' }, { status: 400 })
  }

  if (nextQuantity <= 0) {
    const { error } = await supabase
      .from('cart')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  }

  const { data: existing, error: existingError } = await supabase
    .from('cart')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (existingError || !existing) {
    return NextResponse.json({ error: 'Cart item not found' }, { status: 404 })
  }

  const stockCheck = await validateStock({
    supabase,
    productId: existing.product_id,
    variantId: existing.variant_id,
    quantity: nextQuantity,
  })
  if (!stockCheck.ok) {
    return NextResponse.json({ error: stockCheck.message }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('cart')
    .update({
      quantity: nextQuantity,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .eq('user_id', user.id)
    .select('*, product:products(*), variant:product_variants(*)')
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

export async function DELETE(request: NextRequest) {
  const { user, supabase, response } = await getAuthedUser()
  if (!user) return response!

  const searchParams = request.nextUrl.searchParams
  const cartId = searchParams.get('id')

  if (!cartId) {
    return NextResponse.json({ error: 'Cart ID is required' }, { status: 400 })
  }

  const { error } = await supabase
    .from('cart')
    .delete()
    .eq('id', cartId)
    .eq('user_id', user.id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
