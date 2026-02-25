import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { createAdminSupabaseClient } from '@/lib/supabase-admin'
import { revalidateTag } from 'next/cache'

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
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    return { ok: false, response: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) }
  }

  return { ok: true }
}

function sanitizeInput(value: unknown) {
  if (typeof value !== 'string') return ''
  return value.trim()
}

export async function PATCH(request: Request, context: { params: { id: string } }) {
  const auth = await assertAdmin()
  if (!auth.ok) return auth.response

  const categoryId = context.params.id
  const payload = await request.json().catch(() => ({}))

  const name = sanitizeInput(payload?.name)
  const slug = sanitizeInput(payload?.slug)
  const description = sanitizeInput(payload?.description)
  const image_url = sanitizeInput(payload?.image_url)

  if (!name || !slug) {
    return NextResponse.json({ error: 'Name and slug are required.' }, { status: 400 })
  }

  const supabase = await createAdminSupabaseClient()
  const { data, error } = await supabase
    .from('categories')
    .update({
      name,
      slug,
      description: description || null,
      image_url: image_url || null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', categoryId)
    .select('*')
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  revalidateTag('categories')

  return NextResponse.json({ category: data })
}

export async function DELETE(_: Request, context: { params: { id: string } }) {
  const auth = await assertAdmin()
  if (!auth.ok) return auth.response

  const categoryId = context.params.id
  const supabase = await createAdminSupabaseClient()
  const { error } = await supabase
    .from('categories')
    .delete()
    .eq('id', categoryId)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  revalidateTag('categories')

  return NextResponse.json({ success: true })
}
