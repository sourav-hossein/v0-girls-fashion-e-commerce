import { NextResponse } from 'next/server'
import { createAdminSupabaseClient } from '@/lib/supabase-admin'
import { requireAdminRequest } from '@/lib/admin-api'

export async function POST(request: Request) {
  const auth = await requireAdminRequest()
  if (!auth.ok) return auth.response

  const body = await request.json().catch(() => ({}))
  const updates = Array.isArray(body?.updates) ? body.updates : []

  if (updates.length === 0) {
    return NextResponse.json({ error: 'No updates provided' }, { status: 400 })
  }

  const supabase = await createAdminSupabaseClient()
  const results = {
    total: updates.length,
    success: 0,
    failed: 0,
    errors: [] as string[],
  }

  // We process sequentially to ensure we can capture specific errors per row,
  // but for massive scale, this would need a batch RPC.
  for (const update of updates) {
    const { product_id, variant_id, stock_quantity } = update
    const qty = Number(stock_quantity)

    if (!product_id || !Number.isFinite(qty)) {
      results.failed++
      results.errors.push(`Invalid row: Missing product_id or invalid quantity.`)
      continue
    }

    try {
      if (variant_id) {
        const { error } = await supabase
          .from('product_variants')
          .update({ stock_quantity: qty, updated_at: new Date() })
          .eq('id', variant_id)
          .eq('product_id', product_id)
        
        if (error) throw error
      } else {
        const { error } = await supabase
          .from('products')
          .update({ stock_quantity: qty, updated_at: new Date() })
          .eq('id', product_id)
        
        if (error) throw error
      }
      results.success++
    } catch (err: any) {
      results.failed++
      results.errors.push(`Row ${product_id}: ${err.message}`)
    }
  }

  return NextResponse.json(results)
}
