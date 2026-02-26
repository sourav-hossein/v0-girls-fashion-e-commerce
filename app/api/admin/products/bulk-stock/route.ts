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

  return { ok: true }
}

export async function POST(request: Request) {
  const auth = await requireAdminApi()
  if (!auth.ok) return auth.response

  const body = await request.json().catch(() => ({}))
  const updates = Array.isArray(body?.updates) ? body.updates : []

  if (updates.length === 0) {
    return NextResponse.json({ error: 'No updates provided' }, { status: 400 })
  }

  const supabase = await createAdminSupabaseClient()

  for (const update of updates) {
    const productId = update?.product_id
    const variantId = update?.variant_id || null
    const qty = Number(update?.stock_quantity)

    if (!productId || !Number.isFinite(qty)) continue

    if (variantId) {
      const { error } = await supabase
        .from('product_variants')
        .update({ stock_quantity: qty, updated_at: new Date().toISOString() })
        .eq('id', variantId)
        .eq('product_id', productId)
      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }
    } else {
      const { error } = await supabase
        .from('products')
        .update({ stock_quantity: qty, updated_at: new Date().toISOString() })
        .eq('id', productId)
      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }
    }
  }

  return NextResponse.json({ success: true })
}
