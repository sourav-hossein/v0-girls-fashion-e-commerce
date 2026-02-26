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

export async function GET(request: Request) {
  const auth = await requireAdminApi()
  if (!auth.ok) return auth.response

  const url = new URL(request.url)
  const q = String(url.searchParams.get('q') || '').trim()
  const supabase = await createAdminSupabaseClient()

  let query = supabase
    .from('profiles')
    .select('id, full_name, phone_number, phone_verified, created_at, last_login, role, is_blocked, blocked_reason')
    .order('created_at', { ascending: false })

  if (q) {
    query = query.or(`full_name.ilike.%${q}%,phone_number.ilike.%${q}%`)
  }

  const { data, error } = await query
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ customers: data || [] })
}
