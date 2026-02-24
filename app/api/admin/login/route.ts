import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const { password } = await request.json()
  const adminPassword = process.env.ADMIN_PASSWORD || ''

  if (!adminPassword || password !== adminPassword) {
    return NextResponse.json({ error: 'Invalid password' }, { status: 401 })
  }

  const response = NextResponse.json({ success: true })
  response.cookies.set('admin_auth', adminPassword, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
  })

  return response
}
