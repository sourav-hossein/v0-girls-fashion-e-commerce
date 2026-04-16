'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { FileUp, Info, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react'
import { cn } from '@/lib/utils'

type UpdateRow = {
  product_id: string
  variant_id?: string | null
  stock_quantity: number
}

interface BulkUpdateResult {
  total: number
  success: number
  failed: number
  errors: string[]
}

function parseCsv(input: string): UpdateRow[] {
  const lines = input.split('\n').map((line) => line.trim()).filter(Boolean)
  if (lines.length === 0) return []

  const rows: UpdateRow[] = []
  for (const line of lines) {
    // Skip header if present
    if (line.toLowerCase().startsWith('product_id') || line.toLowerCase().startsWith('id')) continue
    
    const parts = line.split(',').map((part) => part.trim())
    if (parts.length < 2) continue

    const product_id = parts[0]
    // If only 2 parts, second is qty. If 3 parts, second is variant_id, third is qty.
    let variant_id: string | null = null
    let stock_quantity: number = 0

    if (parts.length === 2) {
      stock_quantity = Number(parts[1])
    } else {
      variant_id = parts[1] || null
      stock_quantity = Number(parts[2])
    }

    if (!product_id || isNaN(stock_quantity)) continue
    
    rows.push({
      product_id,
      variant_id,
      stock_quantity,
    })
  }
  return rows
}

export default function BulkStockUploader() {
  const [csv, setCsv] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [result, setResult] = useState<BulkUpdateResult | null>(null)

  const handleSubmit = async () => {
    const updates = parseCsv(csv)
    if (updates.length === 0) {
      toast.error('No valid rows found to process.')
      return
    }

    setIsSaving(true)
    setResult(null)

    const promise = async () => {
      const response = await fetch('/api/admin/products/bulk-stock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ updates }),
      })
      
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data?.error || 'Bulk update failed')
      }
      return data as BulkUpdateResult
    }

    toast.promise(promise(), {
      loading: 'Processing bulk stock updates...',
      success: (data) => {
        setResult(data)
        setCsv('')
        return `Successfully updated ${data.success} items.`
      },
      error: (err) => err.message || 'Error occurred during bulk update.',
    })

    try {
      await promise()
    } catch (e) {
      // Handled by toast.promise
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto py-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-serif text-foreground">Bulk Stock Management</h1>
        <p className="text-muted-foreground italic">Update inventory levels across multiple products and variants instantly.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card className="shadow-sm border-border/40">
            <CardHeader className="bg-muted/30">
              <div className="flex items-center gap-2">
                <FileUp className="h-4 w-4 text-primary" />
                <CardTitle className="text-lg font-serif">Paste CSV Data</CardTitle>
              </div>
              <CardDescription>Enter one item per line using commas as separators.</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <Textarea
                value={csv}
                onChange={(e) => setCsv(e.target.value)}
                placeholder="product_id, variant_id, stock_quantity&#10;550e8400-e29b-41d4-a716-446655440000, , 25&#10;550e8400-e29b-41d4-a716-446655440000, 6ba7b810-9dad-11d1-80b4-00c04fd430c8, 10"
                className="min-h-[300px] font-mono text-xs focus-visible:ring-primary p-4 leading-relaxed bg-muted/10"
                disabled={isSaving}
              />
              <div className="flex justify-between items-center bg-muted/20 p-3 rounded-lg border border-border/40">
                <div className="text-xs text-muted-foreground flex items-center gap-2">
                  <Info className="h-3.5 w-3.5" />
                  <span>Supports product and variant level updates.</span>
                </div>
                <Button 
                  onClick={handleSubmit} 
                  disabled={isSaving || !csv.trim()} 
                  className="gap-2 px-6 shadow-sm shadow-primary/20"
                >
                  {isSaving ? <RefreshCw className="h-4 w-4 animate-spin" /> : <SaveIcon className="w-4 h-4" />}
                  Run Bulk Update
                </Button>
              </div>
            </CardContent>
          </Card>

          {result && (
            <Card className={cn(
              "shadow-sm border-2 animate-in slide-in-from-bottom-2",
              result.failed > 0 ? "border-destructive/20" : "border-primary/20"
            )}>
              <CardHeader className={result.failed > 0 ? "bg-destructive/5" : "bg-primary/5"}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {result.failed > 0 ? <AlertCircle className="h-4 w-4 text-destructive" /> : <CheckCircle2 className="h-4 w-4 text-primary" />}
                    <CardTitle className="text-lg font-serif">Upload Report</CardTitle>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => setResult(null)} className="h-7 text-xs">Dismiss</Button>
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="p-3 rounded-lg bg-muted/50 border border-border/40">
                    <p className="text-xs text-muted-foreground uppercase font-bold tracking-tighter">Total</p>
                    <p className="text-2xl font-serif">{result.total}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
                    <p className="text-xs text-primary uppercase font-bold tracking-tighter">Success</p>
                    <p className="text-2xl font-serif text-primary">{result.success}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                    <p className="text-xs text-destructive uppercase font-bold tracking-tighter">Failed</p>
                    <p className="text-2xl font-serif text-destructive">{result.failed}</p>
                  </div>
                </div>

                {result.errors.length > 0 && (
                  <div className="mt-4 p-4 rounded-lg bg-destructive/5 border border-destructive/10">
                    <p className="text-xs font-bold text-destructive mb-2 flex items-center gap-1 uppercase tracking-wider">
                      Error details:
                    </p>
                    <ul className="text-[10px] space-y-1 text-destructive/80 font-mono list-disc pl-4 max-h-[150px] overflow-y-auto">
                      {result.errors.map((err, i) => (
                        <li key={i}>{err}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6 text-sm">
          <Card className="shadow-none border-none bg-muted/40 p-6 rounded-xl">
            <h3 className="font-serif text-lg mb-4 flex items-center gap-2">
              <Info className="h-4 w-4" />
              How to use
            </h3>
            <div className="space-y-4 text-muted-foreground leading-relaxed">
              <p>Prepare your data in a simple CSV format. Each line should represent one update operation.</p>
              
              <div className="p-3 rounded-lg bg-background border border-border/40 space-y-2">
                <p className="text-[10px] font-bold uppercase tracking-widest text-foreground/50">Pattern A (Product Only)</p>
                <code className="text-xs text-primary">product_id, , stock_quantity</code>
              </div>

              <div className="p-3 rounded-lg bg-background border border-border/40 space-y-2">
                <p className="text-[10px] font-bold uppercase tracking-widest text-foreground/50">Pattern B (Specific Variant)</p>
                <code className="text-xs text-primary">product_id, variant_id, stock_quantity</code>
              </div>

              <div className="bg-primary/5 p-4 rounded-lg border border-primary/20">
                <p className="text-xs italic text-primary font-medium">
                  Note: Values must be comma-separated. Leave variant_id blank if updating the main product stock directly.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

function SaveIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M15.2 3a2 2 0 0 1 1.4.6l3.8 3.8a2 2 0 0 1 .6 1.4V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z" />
      <path d="M17 21v-7a1 1 0 0 0-1-1H8a1 1 0 0 0-1 1v7" />
      <path d="M7 3v4a1 1 0 0 0 1 1h7" />
    </svg>
  )
}
