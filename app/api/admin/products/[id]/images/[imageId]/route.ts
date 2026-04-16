import { NextResponse } from 'next/server'
import { createAdminSupabaseClient } from '@/lib/supabase-admin'
import { requireAdminRequest } from '@/lib/admin-api'
import { deleteStoredImage, revalidateStorefrontPaths } from '@/lib/media'

export async function DELETE(_: Request, context: { params: { id: string; imageId: string } }) {
  const auth = await requireAdminRequest()
  if (!auth.ok) return auth.response

  const { id: productId, imageId } = context.params
  const supabase = await createAdminSupabaseClient()

  const { data: image, error: imageError } = await supabase
    .from('product_images')
    .select('storage_path, is_main')
    .eq('id', imageId)
    .eq('product_id', productId)
    .single()

  if (imageError) {
    return NextResponse.json({ error: imageError.message }, { status: 500 })
  }

  try {
    await deleteStoredImage({
      supabase,
      bucket: 'product-images',
      path: image?.storage_path,
    })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete image.' },
      { status: 500 },
    )
  }

  const { error: deleteError } = await supabase
    .from('product_images')
    .delete()
    .eq('id', imageId)
    .eq('product_id', productId)

  if (deleteError) {
    return NextResponse.json({ error: deleteError.message }, { status: 500 })
  }

  if (image?.is_main) {
    const { data: remaining } = await supabase
      .from('product_images')
      .select('id')
      .eq('product_id', productId)
      .order('display_order', { ascending: true })
      .limit(1)

    const nextImageId = remaining?.[0]?.id
    if (nextImageId) {
      await supabase
        .from('product_images')
        .update({ is_main: true })
        .eq('id', nextImageId)
        .eq('product_id', productId)
    }
  }

  const { data: product } = await supabase
    .from('products')
    .select('slug')
    .eq('id', productId)
    .single()

  revalidateStorefrontPaths(product?.slug ? [`/product/${product.slug}`] : [])
  return NextResponse.json({ success: true })
}
