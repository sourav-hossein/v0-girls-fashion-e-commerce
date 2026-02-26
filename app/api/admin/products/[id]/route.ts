import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { createAdminSupabaseClient } from '@/lib/supabase-admin'

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
  const { stock_quantity, low_stock_threshold, variants } = body ?? {}

  const supabase = await createAdminSupabaseClient()
  const productId = context.params.id

  const { error: productError } = await supabase
    .from('products')
    .update({
      stock_quantity: Number.isFinite(Number(stock_quantity)) ? Number(stock_quantity) : undefined,
      low_stock_threshold: Number.isFinite(Number(low_stock_threshold)) ? Number(low_stock_threshold) : undefined,
      updated_at: new Date().toISOString(),
    })
    .eq('id', productId)

  if (productError) {
    return NextResponse.json({ error: productError.message }, { status: 500 })
  }

  if (Array.isArray(variants)) {
    for (const variant of variants) {
      if (!variant?.id) continue
      const qty = Number(variant.stock_quantity)
      if (!Number.isFinite(qty)) continue
      const { error: variantError } = await supabase
        .from('product_variants')
        .update({ stock_quantity: qty, updated_at: new Date().toISOString() })
        .eq('id', variant.id)
        .eq('product_id', productId)
      if (variantError) {
        return NextResponse.json({ error: variantError.message }, { status: 500 })
      }
    }
  }

  return NextResponse.json({ success: true })
}
