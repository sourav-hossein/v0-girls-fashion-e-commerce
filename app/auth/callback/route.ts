import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const origin = requestUrl.origin
  const nextPath = requestUrl.searchParams.get('next') ?? '/account'

  if (!code) {
    return NextResponse.redirect(`${origin}/auth/login?error=oauth`)
  }

  const cookieStore = await cookies()
  const response = NextResponse.redirect(`${origin}${nextPath}`)

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
            response.cookies.set(name, value, options),
          )
        },
      },
    },
  )

  const { data: exchangeData, error: exchangeError } =
    await supabase.auth.exchangeCodeForSession(code)

  if (exchangeError) {
    return NextResponse.redirect(`${origin}/auth/login?error=oauth`)
  }

  const user = exchangeData.user ?? (await supabase.auth.getUser()).data.user

  if (!user || !user.email) {
    return NextResponse.redirect(`${origin}/auth/login?error=oauth`)
  }

  const adminClient = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        getAll() {
          return []
        },
        setAll() {},
      },
    },
  )

  const fullName =
    user.user_metadata?.full_name ||
    user.user_metadata?.name ||
    null

  const profilePhotoUrl =
    user.user_metadata?.avatar_url ||
    null

  await adminClient.from('profiles').upsert(
    {
      id: user.id,
      full_name: fullName,
      profile_photo_url: profilePhotoUrl,
    },
    { onConflict: 'id' },
  )

  return response
}
