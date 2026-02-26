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

export async function GET(_: Request, context: { params: { id: string } }) {
  const auth = await requireAdminApi()
  if (!auth.ok) return auth.response

  const supabase = await createAdminSupabaseClient()
  const customerId = context.params.id

  const { data: customer } = await supabase
    .from('profiles')
    .select('id, full_name, phone_number, phone_verified, created_at, last_login, role, is_blocked, blocked_reason')
    .eq('id', customerId)
    .single()

  if (!customer) {
    return NextResponse.json({ error: 'Customer not found' }, { status: 404 })
  }

  const [ordersRes, addressesRes] = await Promise.all([
    supabase.from('orders').select('*').eq('user_id', customerId).order('created_at', { ascending: false }),
    supabase.from('user_addresses').select('*').eq('user_id', customerId).order('created_at', { ascending: false }),
  ])

  return NextResponse.json({
    customer,
    orders: ordersRes.data || [],
    addresses: addressesRes.data || [],
  })
}

export async function PATCH(request: Request, context: { params: { id: string } }) {
  const auth = await requireAdminApi()
  if (!auth.ok) return auth.response

  const body = await request.json().catch(() => ({}))
  const { is_blocked, blocked_reason } = body ?? {}

  const supabase = await createAdminSupabaseClient()
  const { data, error } = await supabase
    .from('profiles')
    .update({
      is_blocked: Boolean(is_blocked),
      blocked_reason: blocked_reason || null,
    })
    .eq('id', context.params.id)
    .select('*')
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ customer: data })
}
