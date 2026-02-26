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

export async function GET() {
  const auth = await requireAdminApi()
  if (!auth.ok) return auth.response

  const supabase = await createAdminSupabaseClient()
  const { data, error } = await supabase.from('coupons').select('*').order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ coupons: data || [] })
}

export async function POST(request: Request) {
  const auth = await requireAdminApi()
  if (!auth.ok) return auth.response

  const body = await request.json().catch(() => ({}))
  const {
    code,
    discount_percent,
    max_discount_amount,
    min_purchase_amount,
    valid_from,
    valid_to,
    usage_limit,
    active,
  } = body ?? {}

  if (!code || !discount_percent || !valid_from || !valid_to) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const supabase = await createAdminSupabaseClient()
  const { data, error } = await supabase
    .from('coupons')
    .insert({
      code: String(code).trim().toUpperCase(),
      discount_percent,
      max_discount_amount: max_discount_amount ?? null,
      min_purchase_amount: min_purchase_amount ?? null,
      valid_from,
      valid_to,
      usage_limit: usage_limit ?? null,
      active: active ?? true,
    })
    .select('*')
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ coupon: data })
}
