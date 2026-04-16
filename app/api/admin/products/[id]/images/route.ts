import { NextResponse } from 'next/server'
import { createAdminSupabaseClient } from '@/lib/supabase-admin'
import { requireAdminRequest } from '@/lib/admin-api'
import {
  buildStoragePath,
  revalidateStorefrontPaths,
  sanitizeText,
  uploadPublicImage,
  validateImageFile,
} from '@/lib/media'

export async function POST(request: Request, context: { params: { id: string } }) {
  const auth = await requireAdminRequest()
  if (!auth.ok) return auth.response

  const productId = context.params.id
  const formData = await request.formData()
  const file = formData.get('file')

  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'File is required.' }, { status: 400 })
  }

  try {
    validateImageFile(file)
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Invalid image.' },
      { status: 400 },
    )
  }

  const alt_text = sanitizeText(formData.get('alt_text'))
  const is_main = formData.get('is_main') === 'true'
  const display_order = Number(formData.get('display_order') ?? 0)

  const supabase = await createAdminSupabaseClient()
  const { count } = await supabase
    .from('product_images')
    .select('*', { count: 'exact', head: true })
    .eq('product_id', productId)

  const shouldBeMain = is_main || (count || 0) === 0

  let uploaded
  try {
    uploaded = await uploadPublicImage({
      supabase,
      bucket: 'product-images',
      file,
      path: buildStoragePath({
        entityId: productId,
        fileName: file.name,
      }),
    })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Upload failed.' },
      { status: 500 },
    )
  }

  if (shouldBeMain) {
    const { error: resetError } = await supabase
      .from('product_images')
      .update({ is_main: false })
      .eq('product_id', productId)
    if (resetError) {
      return NextResponse.json({ error: resetError.message }, { status: 500 })
    }
  }

  const { data, error } = await supabase
    .from('product_images')
    .insert({
      product_id: productId,
      image_url: uploaded.publicUrl,
      storage_path: uploaded.path,
      alt_text: alt_text.trim() || null,
      is_main: shouldBeMain,
      display_order: Number.isFinite(display_order) ? display_order : 0,
      mime_type: file.type || null,
      file_size: file.size,
    })
    .select('*')
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const { data: product } = await supabase
    .from('products')
    .select('slug')
    .eq('id', productId)
    .single()

  revalidateStorefrontPaths(product?.slug ? [`/product/${product.slug}`] : [])
  return NextResponse.json({ image: data })
}
