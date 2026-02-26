import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { createAdminSupabaseClient } from '@/lib/supabase-admin'

async function assertAdmin() {
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

const normalizeEmails = (value: unknown) => {
  if (typeof value !== 'string') return []
  return value
    .split(',')
    .map((email) => email.trim().toLowerCase())
    .filter((email) => email.length > 0)
}

export async function GET() {
  const auth = await assertAdmin()
  if (!auth.ok) return auth.response

  const supabase = await createAdminSupabaseClient()
  const { data, error } = await supabase
    .from('store_settings')
    .select('*')
    .order('updated_at', { ascending: false })
    .limit(1)
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ settings: data })
}

export async function PATCH(request: Request) {
  const auth = await assertAdmin()
  if (!auth.ok) return auth.response

  const payload = await request.json().catch(() => ({}))
  const supabase = await createAdminSupabaseClient()

  const updatePayload: Record<string, any> = {
    updated_at: new Date().toISOString(),
  }

  const allowedFields = [
    'store_name',
    'support_email',
    'support_phone',
    'currency_code',
    'timezone',
    'address_line1',
    'address_line2',
    'city',
    'state',
    'postal_code',
    'country',
    'flat_shipping_rate',
    'free_shipping_threshold',
    'cod_enabled',
    'sslcommerz_enabled',
    'low_stock_default_threshold',
  ]

  for (const field of allowedFields) {
    if (field in payload) {
      updatePayload[field] = payload[field]
    }
  }

  if ('order_notification_emails' in payload) {
    updatePayload.order_notification_emails = normalizeEmails(payload.order_notification_emails)
  }

  const { data: existing } = await supabase
    .from('store_settings')
    .select('id')
    .order('updated_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  const { data, error } = existing?.id
    ? await supabase
        .from('store_settings')
        .update(updatePayload)
        .eq('id', existing.id)
        .select('*')
        .single()
    : await supabase
        .from('store_settings')
        .insert({
          store_name: payload?.store_name || 'Hijab & Fashion Hub',
          ...updatePayload,
        })
        .select('*')
        .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ settings: data })
}
