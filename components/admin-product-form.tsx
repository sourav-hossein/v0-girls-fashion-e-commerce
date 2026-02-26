'use client'

import { useMemo, useState, type ChangeEvent } from 'react'
import { useRouter } from 'next/navigation'
import { Product, ProductImage, ProductVariant, Category } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
import { Plus, Trash2, Upload } from 'lucide-react'
import { toast } from 'sonner'

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

  const sortedImages = useMemo(() => {
    return [...imageRows].sort((a, b) => a.display_order - b.display_order)
  }, [imageRows])

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

  const handleImageFieldChange = (id: string, field: keyof ProductImage, value: string | number | boolean) => {
    setImageRows((prev) =>
      prev.map((img) =>
        img.id === id
          ? {
              ...img,
              [field]: value,
            }
          : img,
      ),
    )
  }

  const handleSetMainImage = (id: string) => {
    setImageRows((prev) =>
      prev.map((img) => ({
        ...img,
        is_main: img.id === id,
      })),
    )
  }

  const handleUploadImages = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) return
    if (!product?.id) {
      toast.error('Save the product before uploading images.')
      return
    }

    setUploading(true)
    try {
      const uploads = Array.from(files).map(async (file, index) => {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('alt_text', file.name)
        formData.append('display_order', String(imageRows.length + index))
        formData.append('is_main', String(imageRows.length === 0 && index === 0))

        const response = await fetch(`/api/admin/products/${product.id}/images`, {
          method: 'POST',
          body: formData,
        })
        const payload = await response.json().catch(() => ({}))
        if (!response.ok) {
          throw new Error(payload?.error || 'Failed to upload image')
        }
        return payload.image as ProductImage
      })

      const uploaded = await Promise.all(uploads)
      setImageRows((prev) => [...prev, ...uploaded])
      toast.success('Images uploaded')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Image upload failed')
    } finally {
      setUploading(false)
      event.target.value = ''
    }
  }

  const handleDeleteImage = async (imageId: string) => {
    if (!product?.id) return
    if (!confirm('Delete this image?')) return
    try {
      const response = await fetch(`/api/admin/products/${product.id}/images/${imageId}`, {
        method: 'DELETE',
      })
      const payload = await response.json().catch(() => ({}))
      if (!response.ok) {
        throw new Error(payload?.error || 'Failed to delete image')
      }
      setImageRows((prev) => prev.filter((img) => img.id !== imageId))
      toast.success('Image deleted')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete image')
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
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
            discount_price: discountPrice,
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
        toast.success('Product created')
        router.push(`/admin/products/${payload.product.id}/edit`)
        return
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
            discount_price: discountPrice,
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
      toast.success('Product updated')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to save product')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card className="border-border">
        <CardHeader className="border-b border-border">
          <CardTitle className="text-xl font-serif">
            {mode === 'create' ? 'Create Product' : 'Product Details'}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="product-name">Name</Label>
              <Input
                id="product-name"
                value={name}
                onChange={(event) => handleNameChange(event.target.value)}
                placeholder="Premium Cotton Hijab"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="product-slug">Slug</Label>
              <Input
                id="product-slug"
                value={slug}
                onChange={(event) => {
                  setSlugEdited(true)
                  setSlug(event.target.value)
                }}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="product-category">Category</Label>
            <Select value={categoryId} onValueChange={setCategoryId}>
              <SelectTrigger id="product-category">
                <SelectValue placeholder="Select category" />
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
            <Label htmlFor="product-description">Description</Label>
            <Textarea
              id="product-description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              rows={4}
            />
          </div>
        </CardContent>
      </Card>

      <Card className="border-border">
        <CardHeader className="border-b border-border">
          <CardTitle className="text-xl font-serif">Pricing & Inventory</CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="product-price">Price</Label>
              <Input
                id="product-price"
                type="number"
                min={0}
                value={price}
                onChange={(event) => setPrice(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="product-discount">Discount Price</Label>
              <Input
                id="product-discount"
                type="number"
                min={0}
                value={discountPrice}
                onChange={(event) => setDiscountPrice(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="product-stock">Stock Quantity</Label>
              <Input
                id="product-stock"
                type="number"
                min={0}
                value={stockQuantity}
                onChange={(event) => setStockQuantity(Number(event.target.value))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="product-low-stock">Low Stock Threshold</Label>
              <Input
                id="product-low-stock"
                type="number"
                min={0}
                value={lowStockThreshold}
                onChange={(event) => setLowStockThreshold(Number(event.target.value))}
              />
            </div>
          </div>
          <div className="flex flex-wrap gap-6">
            <label className="flex items-center gap-3 text-sm font-medium">
              <Switch checked={featured} onCheckedChange={setFeatured} />
              Featured
            </label>
            <label className="flex items-center gap-3 text-sm font-medium">
              <Switch checked={trending} onCheckedChange={setTrending} />
              Trending
            </label>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border">
        <CardHeader className="border-b border-border flex flex-row items-center justify-between">
          <CardTitle className="text-xl font-serif">Variants</CardTitle>
          <Button variant="outline" size="sm" onClick={handleAddVariant} className="gap-2">
            <Plus className="w-4 h-4" />
            Add Variant
          </Button>
        </CardHeader>
        <CardContent className="p-6 space-y-3">
          {variantRows.length === 0 ? (
            <p className="text-sm text-muted-foreground">No variants added.</p>
          ) : (
            variantRows.map((variant, index) => (
              <div key={variant.id ?? `new-${index}`} className="grid grid-cols-1 md:grid-cols-4 gap-3 items-center">
                <Input
                  placeholder="Type (e.g. Color)"
                  value={variant.variant_type}
                  onChange={(event) => updateVariantField(index, 'variant_type', event.target.value)}
                />
                <Input
                  placeholder="Value (e.g. Navy)"
                  value={variant.variant_value}
                  onChange={(event) => updateVariantField(index, 'variant_value', event.target.value)}
                />
                <Input
                  type="number"
                  min={0}
                  value={variant.stock_quantity}
                  onChange={(event) => updateVariantField(index, 'stock_quantity', event.target.value)}
                />
                <div className="flex justify-end">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:text-destructive"
                    onClick={() => handleRemoveVariant(index)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Card className="border-border">
        <CardHeader className="border-b border-border">
          <CardTitle className="text-xl font-serif">Media</CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <label className="inline-flex items-center gap-2 text-sm font-medium">
              <span className="sr-only">Upload images</span>
              <Input
                type="file"
                accept="image/*"
                multiple
                onChange={handleUploadImages}
                disabled={uploading || !product?.id}
              />
            </label>
            {!product?.id && (
              <p className="text-xs text-muted-foreground">
                Save the product before uploading images.
              </p>
            )}
          </div>

          {sortedImages.length === 0 ? (
            <p className="text-sm text-muted-foreground">No images uploaded.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {sortedImages.map((image) => (
                <div key={image.id} className="border border-border rounded-lg p-4 space-y-3">
                  <div className="aspect-square bg-muted rounded-lg overflow-hidden">
                    <img
                      src={image.image_url}
                      alt={image.alt_text || 'Product image'}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Alt text</Label>
                    <Input
                      value={image.alt_text ?? ''}
                      onChange={(event) => handleImageFieldChange(image.id, 'alt_text', event.target.value)}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-2">
                      <Label>Order</Label>
                      <Input
                        type="number"
                        min={0}
                        value={image.display_order}
                        onChange={(event) =>
                          handleImageFieldChange(image.id, 'display_order', Number(event.target.value))
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Main</Label>
                      <Button
                        type="button"
                        variant={image.is_main ? 'default' : 'outline'}
                        onClick={() => handleSetMainImage(image.id)}
                        className="w-full"
                      >
                        {image.is_main ? 'Main Image' : 'Set Main'}
                      </Button>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    className="text-destructive hover:text-destructive w-full"
                    onClick={() => handleDeleteImage(image.id)}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Image
                  </Button>
                </div>
              ))}
            </div>
          )}

          {uploading && (
            <div className="text-sm text-muted-foreground flex items-center gap-2">
              <Upload className="w-4 h-4" />
              Uploading images...
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving}>
          {saving ? 'Saving...' : mode === 'create' ? 'Create Product' : 'Save Changes'}
        </Button>
      </div>
    </div>
  )
}
