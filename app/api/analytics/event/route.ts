import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createAdminSupabaseClient } from '@/lib/supabase-admin'
import { createServerClient } from '@supabase/ssr'

const SESSION_COOKIE = 'session_id'

export async function POST(request: Request) {
  const payload = await request.json().catch(() => ({}))
  const event_type = typeof payload?.event_type === 'string' ? payload.event_type : ''
  const path = typeof payload?.path === 'string' ? payload.path : null
  const product_id = typeof payload?.product_id === 'string' ? payload.product_id : null
  const order_id = typeof payload?.order_id === 'string' ? payload.order_id : null
  const metadata = typeof payload?.metadata === 'object' ? payload.metadata : null

  if (!event_type) {
    return NextResponse.json({ error: 'event_type is required' }, { status: 400 })
  }

  const cookieStore = await cookies()
  let sessionId = cookieStore.get(SESSION_COOKIE)?.value
  if (!sessionId) {
    sessionId = crypto.randomUUID()
    cookieStore.set(SESSION_COOKIE, sessionId, {
      path: '/',
      httpOnly: false,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30,
    })
  }

  const supabase = await createAdminSupabaseClient()
  const authClient = createServerClient(
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
  const { data: authData } = await authClient.auth.getUser()
  const { error } = await supabase.from('analytics_events').insert({
    session_id: sessionId,
    user_id: authData?.user?.id ?? null,
    event_type,
    path,
    product_id,
    order_id,
    metadata,
  })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
