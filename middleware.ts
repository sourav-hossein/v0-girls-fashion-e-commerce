import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Protect admin routes
  if (request.nextUrl.pathname.startsWith('/admin')) {
    if (!request.nextUrl.pathname.startsWith('/admin/login')) {
      const adminPassword = process.env.ADMIN_PASSWORD || ''
      const adminCookie = request.cookies.get('admin_auth')?.value || ''

      if (!adminPassword || adminCookie !== adminPassword) {
        const loginUrl = new URL('/admin/login', request.url)
        loginUrl.searchParams.set('next', request.nextUrl.pathname)
        return NextResponse.redirect(loginUrl)
      }
    }
  }

  // Protect account routes
  if (request.nextUrl.pathname.startsWith('/account')) {
    if (!user) {
      return NextResponse.redirect(new URL('/auth/login', request.url))
    }
  }

  // Protect checkout route
  if (request.nextUrl.pathname === '/checkout') {
    if (!user) {
      return NextResponse.redirect(new URL('/auth/login', request.url))
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
