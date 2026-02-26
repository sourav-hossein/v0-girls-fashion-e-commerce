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

export async function DELETE(_: Request, context: { params: { id: string; imageId: string } }) {
  const auth = await assertAdmin()
  if (!auth.ok) return auth.response

  const { id: productId, imageId } = context.params
  const supabase = await createAdminSupabaseClient()

  const { data: image, error: imageError } = await supabase
    .from('product_images')
    .select('storage_path')
    .eq('id', imageId)
    .eq('product_id', productId)
    .single()

  if (imageError) {
    return NextResponse.json({ error: imageError.message }, { status: 500 })
  }

  if (image?.storage_path) {
    const { error: storageError } = await supabase.storage
      .from('product-images')
      .remove([image.storage_path])
    if (storageError) {
      return NextResponse.json({ error: storageError.message }, { status: 500 })
    }
  }

  const { error: deleteError } = await supabase
    .from('product_images')
    .delete()
    .eq('id', imageId)
    .eq('product_id', productId)

  if (deleteError) {
    return NextResponse.json({ error: deleteError.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
