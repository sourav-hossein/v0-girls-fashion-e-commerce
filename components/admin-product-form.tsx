'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Product, ProductImage, ProductVariant, Category } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Plus, Trash2, Upload, Save, Package, DollarSign, Info, Layers, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'
import { ProductImageManager } from '@/components/product-image-manager'
import { cn } from '@/lib/utils'

type VariantRow = {
  id?: string
  variant_type: string
  variant_value: string
  stock_quantity: number
}

interface AdminProductFormProps {
  mode: 'create' | 'edit'
  product?: Product
  variants?: ProductVariant[]
  images?: ProductImage[]
  categories: Category[]
}

const emptyVariant: VariantRow = {
  variant_type: '',
  variant_value: '',
  stock_quantity: 0,
}

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/['"]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export default function AdminProductForm({
  mode,
  product,
  variants = [],
  images = [],
  categories,
}: AdminProductFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [name, setName] = useState(product?.name ?? '')
  const [slug, setSlug] = useState(product?.slug ?? '')
  const [slugEdited, setSlugEdited] = useState(false)
  const [description, setDescription] = useState(product?.description ?? '')
  const [categoryId, setCategoryId] = useState(product?.category_id ?? '')
  const [price, setPrice] = useState<string>(product?.price?.toString() ?? '')
  const [discountPrice, setDiscountPrice] = useState<string>(
    product?.discount_price?.toString() ?? '',
  )
  const [stockQuantity, setStockQuantity] = useState<number>(product?.stock_quantity ?? 0)
  const [lowStockThreshold, setLowStockThreshold] = useState<number>(
    product?.low_stock_threshold ?? 10,
  )
  const [featured, setFeatured] = useState<boolean>(product?.featured ?? false)
  const [trending, setTrending] = useState<boolean>(product?.trending ?? false)
  const [variantRows, setVariantRows] = useState<VariantRow[]>(
    variants.map((variant) => ({
      id: variant.id,
      variant_type: variant.variant_type,
      variant_value: variant.variant_value,
      stock_quantity: variant.stock_quantity,
    })),
  )
  const [variantsToDelete, setVariantsToDelete] = useState<string[]>([])
  const [imageRows, setImageRows] = useState<ProductImage[]>(images)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)

  const handleNameChange = (value: string) => {
    setName(value)
    if (!slugEdited) {
      setSlug(slugify(value))
    }
  }

  const handleAddVariant = () => {
    setVariantRows((prev) => [...prev, { ...emptyVariant }])
  }

  const handleRemoveVariant = (index: number) => {
    setVariantRows((prev) => {
      const next = [...prev]
      const [removed] = next.splice(index, 1)
      if (removed?.id) {
        setVariantsToDelete((ids) => [...ids, removed.id!])
      }
      return next
    })
  }

  const updateVariantField = (index: number, field: keyof VariantRow, value: string) => {
    setVariantRows((prev) => {
      const next = [...prev]
      const current = { ...next[index] }
      if (field === 'stock_quantity') {
        current.stock_quantity = Number(value)
      } else {
        current[field] = value
      }
      next[index] = current
      return next
    })
  }

  const handleSave = async () => {
    if (!name || !slug || !price || !categoryId) {
      toast.error('Please fill in all required fields.')
      return
    }

    setSaving(true)
    const promise = async () => {
      if (mode === 'create') {
        const response = await fetch('/api/admin/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name,
            slug,
            description,
            category_id: categoryId,
            price,
            discount_price: discountPrice || null,
            stock_quantity: stockQuantity,
            low_stock_threshold: lowStockThreshold,
            featured,
            trending,
          }),
        })
        const payload = await response.json().catch(() => ({}))
        if (!response.ok) {
          throw new Error(payload?.error || 'Failed to create product')
        }
        startTransition(() => {
          router.push(`/admin/products/${payload.product.id}/edit`)
          router.refresh()
        })
        return payload.product
      }

      if (!product?.id) {
        throw new Error('Missing product id')
      }

      const response = await fetch(`/api/admin/products/${product.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product: {
            name,
            slug,
            description,
            category_id: categoryId,
            price,
            discount_price: discountPrice || null,
            stock_quantity: stockQuantity,
            low_stock_threshold: lowStockThreshold,
            featured,
            trending,
          },
          variants_upsert: variantRows,
          variants_delete_ids: variantsToDelete,
          images_update: imageRows.map((img) => ({
            id: img.id,
            alt_text: img.alt_text,
            is_main: img.is_main,
            display_order: img.display_order,
          })),
        }),
      })

      const payload = await response.json().catch(() => ({}))
      if (!response.ok) {
        throw new Error(payload?.error || 'Failed to update product')
      }

      setVariantsToDelete([])
      startTransition(() => {
        router.refresh()
      })
      return payload.product
    }

    toast.promise(promise(), {
      loading: mode === 'create' ? 'Creating product...' : 'Saving changes...',
      success: mode === 'create' ? 'Product created! Redirecting...' : 'Product updated successfully.',
      error: (err) => err.message || 'Error occurred while saving.',
    })

    try {
      await promise()
    } catch (e) {
      // Handled by toast.promise
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-serif text-foreground">
          {mode === 'create' ? 'Add New Product' : `Editing: ${product?.name}`}
        </h1>
        <p className="text-muted-foreground">
          {mode === 'create' 
            ? 'Fill in the information below to create a new product in your store.'
            : 'Update the product details, inventory, and media gallery.'}
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          <Card className="shadow-sm border-border/40">
            <CardHeader className="bg-muted/30">
              <div className="flex items-center gap-2">
                <Info className="h-4 w-4 text-primary" />
                <CardTitle className="text-lg font-serif">Basic Information</CardTitle>
              </div>
              <CardDescription>Visible details that customers see first.</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="product-name" className="text-sm font-medium">Name</Label>
                  <Input
                    id="product-name"
                    value={name}
                    onChange={(event) => handleNameChange(event.target.value)}
                    placeholder="e.g. Premium Silk Scarf"
                    className="focus-visible:ring-primary"
                    disabled={saving}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="product-slug" className="text-sm font-medium">Slug</Label>
                  <Input
                    id="product-slug"
                    value={slug}
                    onChange={(event) => {
                      setSlugEdited(true)
                      setSlug(event.target.value)
                    }}
                    placeholder="premium-silk-scarf"
                    className="font-mono text-xs focus-visible:ring-primary"
                    disabled={saving}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="product-category" className="text-sm font-medium">Category</Label>
                <Select value={categoryId} onValueChange={setCategoryId} disabled={saving}>
                  <SelectTrigger id="product-category" className="focus:ring-primary">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="product-description" className="text-sm font-medium">Description</Label>
                <Textarea
                  id="product-description"
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  placeholder="Describe the product materials, fit, and style..."
                  rows={6}
                  className="resize-none focus-visible:ring-primary"
                  disabled={saving}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-border/40">
            <CardHeader className="bg-muted/30 flex flex-row items-center justify-between py-4">
              <div className="flex items-center gap-2">
                <Layers className="h-4 w-4 text-primary" />
                <CardTitle className="text-lg font-serif">Product Variants</CardTitle>
              </div>
              <Button variant="outline" size="sm" onClick={handleAddVariant} className="gap-2 h-8" disabled={saving}>
                <Plus className="w-3.5 h-3.5" />
                Add Variant
              </Button>
            </CardHeader>
            <CardContent className="p-6">
              {variantRows.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-8 border border-dashed rounded-lg text-center space-y-2">
                  <Package className="h-8 w-8 text-muted-foreground/40" />
                  <p className="text-sm text-muted-foreground">This product currently has no variants.</p>
                  <Button variant="link" size="sm" onClick={handleAddVariant}>Create one now</Button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3 px-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                    <span>Type (e.g. Color)</span>
                    <span>Value (e.g. Navy)</span>
                    <span>Stock</span>
                    <span className="text-right sr-only">Action</span>
                  </div>
                  {variantRows.map((variant, index) => (
                    <div key={variant.id ?? `new-${index}`} className="group grid grid-cols-1 md:grid-cols-4 gap-3 items-center p-2 rounded-lg hover:bg-muted/30 transition-colors">
                      <Input
                        placeholder="Type"
                        value={variant.variant_type}
                        onChange={(event) => updateVariantField(index, 'variant_type', event.target.value)}
                        className="h-9 focus-visible:ring-primary"
                        disabled={saving}
                      />
                      <Input
                        placeholder="Value"
                        value={variant.variant_value}
                        onChange={(event) => updateVariantField(index, 'variant_value', event.target.value)}
                        className="h-9 focus-visible:ring-primary"
                        disabled={saving}
                      />
                      <Input
                        type="number"
                        min={0}
                        value={variant.stock_quantity}
                        onChange={(event) => updateVariantField(index, 'stock_quantity', event.target.value)}
                        className="h-9 focus-visible:ring-primary"
                        disabled={saving}
                      />
                      <div className="flex justify-end">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => handleRemoveVariant(index)}
                          disabled={saving}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="shadow-sm border-border/40">
            <CardHeader className="bg-muted/30">
              <div className="flex items-center gap-2">
                <Upload className="h-4 w-4 text-primary" />
                <CardTitle className="text-lg font-serif">Media Gallery</CardTitle>
              </div>
              <CardDescription>Manage your product images. The first image will be the main thumbnail.</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              {product?.id ? (
                <ProductImageManager
                  productId={product.id}
                  images={imageRows}
                  onImagesChange={setImageRows}
                  onUploadingChange={setUploading}
                />
              ) : (
                <div className="flex flex-col items-center justify-center p-12 border border-dashed rounded-xl text-center space-y-4">
                  <div className="h-14 w-14 rounded-full bg-muted flex items-center justify-center">
                    <Upload className="h-7 w-7 text-muted-foreground/40" />
                  </div>
                  <div className="space-y-1">
                    <p className="font-medium text-foreground">Media Upload Locked</p>
                    <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                      Please save the basic product information first before uploading images.
                    </p>
                  </div>
                </div>
              )}

              {uploading && (
                <div className="mt-4 p-3 rounded-lg bg-primary/5 border border-primary/20 flex items-center gap-3 animate-pulse">
                  <RefreshCw className="h-4 w-4 text-primary animate-spin" />
                  <span className="text-xs font-medium text-primary">Uploading new media asset...</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="shadow-sm border-border/40 sticky top-24">
            <CardHeader className="bg-muted/30">
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-primary" />
                <CardTitle className="text-lg font-serif">Pricing & Status</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="product-price">Regular Price (AED)</Label>
                  <div className="relative">
                    <Input
                      id="product-price"
                      type="number"
                      min={0}
                      value={price}
                      onChange={(event) => setPrice(event.target.value)}
                      className="pl-12 focus-visible:ring-primary"
                      disabled={saving}
                    />
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground text-xs font-semibold">AED</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="product-discount">Discount Price (Optional)</Label>
                  <div className="relative border-b pb-4 mb-2">
                    <Input
                      id="product-discount"
                      type="number"
                      min={0}
                      value={discountPrice}
                      onChange={(event) => setDiscountPrice(event.target.value)}
                      className="pl-12 focus-visible:ring-primary"
                      disabled={saving}
                    />
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground text-xs font-semibold">AED</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="product-stock" className="flex items-center justify-between">
                    General Stock
                    {stockQuantity < lowStockThreshold && (
                      <span className="text-[10px] text-destructive bg-destructive/10 px-1.5 py-0.5 rounded font-bold uppercase">Low Stock</span>
                    )}
                  </Label>
                  <Input
                    id="product-stock"
                    type="number"
                    min={0}
                    value={stockQuantity}
                    onChange={(event) => setStockQuantity(Number(event.target.value))}
                    disabled={saving}
                  />
                </div>
                <div className="space-y-2 pb-4 border-b">
                  <Label htmlFor="product-low-stock">Low Stock Warning</Label>
                  <Input
                    id="product-low-stock"
                    type="number"
                    min={0}
                    value={lowStockThreshold}
                    onChange={(event) => setLowStockThreshold(Number(event.target.value))}
                    disabled={saving}
                  />
                </div>
              </div>

              <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex flex-col gap-0.5">
                    <Label htmlFor="featured" className="cursor-pointer font-medium">Featured</Label>
                    <span className="text-[10px] text-muted-foreground">Show in collections</span>
                  </div>
                  <Switch id="featured" checked={featured} onCheckedChange={setFeatured} disabled={saving} />
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex flex-col gap-0.5">
                    <Label htmlFor="trending" className="cursor-pointer font-medium">Trending</Label>
                    <span className="text-[10px] text-muted-foreground">Add to carousel</span>
                  </div>
                  <Switch id="trending" checked={trending} onCheckedChange={setTrending} disabled={saving} />
                </div>
              </div>

              <div className="pt-6 border-t">
                <Button 
                  onClick={handleSave} 
                  disabled={saving || uploading} 
                  className="w-full gap-2 h-11 text-base font-semibold transition-all shadow-md shadow-primary/20"
                >
                  {saving ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  {mode === 'create' ? 'Create Product' : 'Update Changes'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
