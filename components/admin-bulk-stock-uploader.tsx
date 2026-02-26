'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'

type UpdateRow = {
  product_id: string
  variant_id?: string | null
  stock_quantity: number
}

function parseCsv(input: string): UpdateRow[] {
  const lines = input.split('\n').map((line) => line.trim()).filter(Boolean)
  if (lines.length === 0) return []

  const rows: UpdateRow[] = []
  for (const line of lines) {
    const [product_id, variant_id, stock_quantity] = line.split(',').map((part) => part.trim())
    const qty = Number(stock_quantity)
    if (!product_id || !Number.isFinite(qty)) continue
    rows.push({
      product_id,
      variant_id: variant_id || null,
      stock_quantity: qty,
    })
  }
  return rows
}

export default function BulkStockUploader() {
  const [csv, setCsv] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  const handleSubmit = async () => {
    const updates = parseCsv(csv)
    if (updates.length === 0) {
      toast.error('No valid rows found')
      return
    }

    setIsSaving(true)
    try {
      const response = await fetch('/api/admin/products/bulk-stock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ updates }),
      })
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data?.error || 'Bulk update failed')
      }
      toast.success('Stock updated')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Bulk update failed')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Card className="border-border">
      <CardHeader className="border-b border-border">
        <CardTitle>Paste CSV Rows</CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-4">
        <div className="text-sm text-muted-foreground">
          Format: `product_id,variant_id(optional),stock_quantity`
        </div>
        <Textarea
          value={csv}
          onChange={(e) => setCsv(e.target.value)}
          placeholder="product_uuid,variant_uuid,20"
          rows={8}
        />
        <Button onClick={handleSubmit} disabled={isSaving}>
          {isSaving ? 'Updating...' : 'Update Stock'}
        </Button>
      </CardContent>
    </Card>
  )
}
