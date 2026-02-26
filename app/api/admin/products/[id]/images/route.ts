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

function getFileExtension(fileName: string) {
  const parts = fileName.split('.')
  if (parts.length < 2) return ''
  return parts[parts.length - 1].toLowerCase()
}

export async function POST(request: Request, context: { params: { id: string } }) {
  const auth = await assertAdmin()
  if (!auth.ok) return auth.response

  const productId = context.params.id
  const formData = await request.formData()
  const file = formData.get('file')

  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'File is required.' }, { status: 400 })
  }

  const alt_text = typeof formData.get('alt_text') === 'string' ? String(formData.get('alt_text')) : ''
  const is_main = formData.get('is_main') === 'true'
  const display_order = Number(formData.get('display_order') ?? 0)
  const extension = getFileExtension(file.name)
  const fileId = crypto.randomUUID()
  const filePath = `${productId}/${fileId}${extension ? `.${extension}` : ''}`

  const supabase = await createAdminSupabaseClient()
  const { error: uploadError } = await supabase.storage
    .from('product-images')
    .upload(filePath, file, {
      contentType: file.type || 'application/octet-stream',
      upsert: false,
    })

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 })
  }

  if (is_main) {
    const { error: resetError } = await supabase
      .from('product_images')
      .update({ is_main: false })
      .eq('product_id', productId)
    if (resetError) {
      return NextResponse.json({ error: resetError.message }, { status: 500 })
    }
  }

  const { data: publicUrlData } = supabase.storage
    .from('product-images')
    .getPublicUrl(filePath)

  const { data, error } = await supabase
    .from('product_images')
    .insert({
      product_id: productId,
      image_url: publicUrlData.publicUrl,
      storage_path: filePath,
      alt_text: alt_text.trim() || null,
      is_main,
      display_order: Number.isFinite(display_order) ? display_order : 0,
    })
    .select('*')
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ image: data })
}
