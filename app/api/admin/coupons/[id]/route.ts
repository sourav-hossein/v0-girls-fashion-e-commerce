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

export async function PATCH(request: Request, context: { params: { id: string } }) {
  const auth = await requireAdminApi()
  if (!auth.ok) return auth.response

  const body = await request.json().catch(() => ({}))
  const payload = { ...body }

  if (payload.code) {
    payload.code = String(payload.code).trim().toUpperCase()
  }

  const supabase = await createAdminSupabaseClient()
  const { data, error } = await supabase
    .from('coupons')
    .update(payload)
    .eq('id', context.params.id)
    .select('*')
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ coupon: data })
}

export async function DELETE(_: Request, context: { params: { id: string } }) {
  const auth = await requireAdminApi()
  if (!auth.ok) return auth.response

  const supabase = await createAdminSupabaseClient()
  const { error } = await supabase
    .from('coupons')
    .delete()
    .eq('id', context.params.id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
