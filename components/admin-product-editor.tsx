'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'

type Product = {
  id: string
  name: string
  slug: string
  stock_quantity: number
  low_stock_threshold?: number | null
}

type Variant = {
  id: string
  variant_type: string
  variant_value: string
  stock_quantity: number
}

interface AdminProductEditorProps {
  product: Product
  variants: Variant[]
}

export default function AdminProductEditor({ product, variants }: AdminProductEditorProps) {
  const [stockQuantity, setStockQuantity] = useState<number>(product.stock_quantity)
  const [lowStockThreshold, setLowStockThreshold] = useState<number>(
    typeof product.low_stock_threshold === 'number' ? product.low_stock_threshold : 10,
  )
  const [variantStocks, setVariantStocks] = useState<Record<string, number>>(
    Object.fromEntries(variants.map((v) => [v.id, v.stock_quantity])),
  )
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    try {
      const response = await fetch(`/api/admin/products/${product.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stock_quantity: stockQuantity,
          low_stock_threshold: lowStockThreshold,
          variants: variants.map((v) => ({
            id: v.id,
            stock_quantity: variantStocks[v.id],
          })),
        }),
      })
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data?.error || 'Failed to update product')
      }
      toast.success('Product updated')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update product')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card className="border-border">
        <CardHeader className="border-b border-border">
          <CardTitle>{product.name}</CardTitle>
          <p className="text-sm text-muted-foreground">{product.slug}</p>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="stock_quantity">Product Stock</Label>
              <Input
                id="stock_quantity"
                type="number"
                min={0}
                value={stockQuantity}
                onChange={(e) => setStockQuantity(Number(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="low_stock_threshold">Low Stock Threshold</Label>
              <Input
                id="low_stock_threshold"
                type="number"
                min={0}
                value={lowStockThreshold}
                onChange={(e) => setLowStockThreshold(Number(e.target.value))}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border">
        <CardHeader className="border-b border-border">
          <CardTitle>Variants</CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-3">
          {variants.length === 0 ? (
            <p className="text-sm text-muted-foreground">No variants for this product.</p>
          ) : (
            variants.map((variant) => (
              <div key={variant.id} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                <div className="text-sm">
                  <p className="font-medium">{variant.variant_type}</p>
                  <p className="text-muted-foreground">{variant.variant_value}</p>
                </div>
                <div className="text-sm text-muted-foreground">Current: {variant.stock_quantity}</div>
                <Input
                  type="number"
                  min={0}
                  value={variantStocks[variant.id]}
                  onChange={(e) =>
                    setVariantStocks((prev) => ({
                      ...prev,
                      [variant.id]: Number(e.target.value),
                    }))
                  }
                />
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving}>
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </div>
  )
}
