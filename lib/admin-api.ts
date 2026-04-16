import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'

/**
 * Shared logic for Admin API routes to verify authentication and role.
 * Returns { ok: true, user } or { ok: false, response }.
 */
export async function requireAdminRequest() {
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
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            )
          } catch (e) {
            // Silently fail if cookies cannot be set (e.g. in some API contexts)
          }
        },
      },
    },
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return {
      ok: false as const,
      response: NextResponse.json({ error: 'Unauthorized. Please login.' }, { status: 401 }),
    }
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    return {
      ok: false as const,
      response: NextResponse.json({ error: 'Forbidden. Admin access required.' }, { status: 403 }),
    }
  }

  return { ok: true as const, user }
}
