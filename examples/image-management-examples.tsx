/**
 * Image Management System Integration Examples
 * 
 * Complete examples for integrating image upload components
 * into your admin pages
 */

// ============================================================================
// EXAMPLE 1: Product Image Upload
// ============================================================================

import { useState } from 'react'
import { ProductImageManager } from '@/components/product-image-manager'
import { UploadedImage } from '@/hooks/use-image-upload'

export function ProductEditExample() {
  const productId = 'prod-123'
  const [productImages, setProductImages] = useState<UploadedImage[]>([])
  const [featuredImageId, setFeaturedImageId] = useState<string>()

  const handleImagesChange = async (
    images: UploadedImage[],
    featured?: string
  ) => {
    // Update local state
    setProductImages(images)
    setFeaturedImageId(featured)

    // Save to database
    try {
      const response = await fetch(
        `/api/admin/products/${productId}/images`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            images: images.map((img, index) => ({
              image_url: img.url,
              alt_text: img.name,
              is_main: img.id === featured,
              display_order: index,
            })),
          }),
        }
      )

      if (!response.ok) throw new Error('Failed to save images')
      console.log('Images saved successfully')
    } catch (error) {
      console.error('Error saving images:', error)
    }
  }

  return (
    <div className="space-y-6">
      <ProductImageManager
        productId={productId}
        initialImages={productImages}
        onImagesChange={handleImagesChange}
      />

      {/* Display selected featured image */}
      {featuredImageId && (
        <div className="p-4 bg-accent rounded-lg">
          <p className="text-sm text-muted-foreground">
            Featured Image: {featuredImageId}
          </p>
        </div>
      )}
    </div>
  )
}

// ============================================================================
// EXAMPLE 2: Category Image Upload
// ============================================================================

import { CategoryImageManager } from '@/components/category-image-manager'
import { Category } from '@/lib/types'

interface CategoriesListExampleProps {
  categories: Category[]
}

export function CategoriesListExample({
  categories,
}: CategoriesListExampleProps) {
  const handleCategoryImageChange = async (
    categoryId: string,
    image: UploadedImage | null
  ) => {
    try {
      const response = await fetch(`/api/admin/categories/${categoryId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image_url: image?.url || null,
        }),
      })

      if (!response.ok) throw new Error('Failed to update category')
      console.log(`Category ${categoryId} image updated`)
    } catch (error) {
      console.error('Error updating category:', error)
    }
  }

  return (
    <div className="grid gap-6">
      {categories.map((category) => (
        <CategoryImageManager
          key={category.id}
          categoryId={category.id}
          initialImage={
            category.image_url
              ? {
                  id: category.id,
                  url: category.image_url,
                  name: category.name,
                  size: 0,
                  uploadedAt: new Date(),
                }
              : undefined
          }
          onImageChange={(image) =>
            handleCategoryImageChange(category.id, image)
          }
        />
      ))}
    </div>
  )
}

// ============================================================================
// EXAMPLE 3: Hero Banner Management
// ============================================================================

import { HeroBannerManager, Banner } from '@/components/hero-banner-manager'

export function HeroBannerExample() {
  const [banners, setBanners] = useState<Banner[]>([])

  const handleBannersChange = async (newBanners: Banner[]) => {
    // Save to database
    try {
      const response = await fetch('/api/admin/settings/banners', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          banners: newBanners.map((b) => ({
            id: b.id,
            title: b.title,
            subtitle: b.subtitle,
            ctaText: b.ctaText,
            ctaLink: b.ctaLink,
            desktopImage: b.desktopImage.url,
            mobileImage: b.mobileImage.url,
            active: b.active,
            order: b.order,
          })),
        }),
      })

      if (!response.ok) throw new Error('Failed to save banners')
      setBanners(newBanners)
      console.log('Banners saved successfully')
    } catch (error) {
      console.error('Error saving banners:', error)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Hero Banners</h2>
        <p className="text-muted-foreground">
          Manage homepage hero banners with desktop and mobile versions
        </p>
      </div>

      <HeroBannerManager
        banners={banners}
        onBannersChange={handleBannersChange}
      />
    </div>
  )
}

// ============================================================================
// EXAMPLE 4: Custom Hook Usage
// ============================================================================

import { useImageUpload } from '@/hooks/use-image-upload'
import { Button } from '@/components/ui/button'

export function CustomUploadExample() {
  const {
    isLoading,
    progress,
    uploadedImages,
    uploadImage,
    uploadMultiple,
    deleteImage,
  } = useImageUpload({
    bucket: 'products',
    folder: 'products/temp',
    maxFileSize: 3 * 1024 * 1024, // 3MB
  })

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    const results = await uploadMultiple(files)
    console.log('Uploaded images:', results)
  }

  const handleDelete = async (imageId: string) => {
    await deleteImage(imageId)
  }

  return (
    <div className="space-y-6">
      <div>
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileSelect}
          disabled={isLoading}
        />
      </div>

      {isLoading && <p>Uploading... {progress}%</p>}

      <div className="grid grid-cols-3 gap-4">
        {uploadedImages.map((img) => (
          <div key={img.id} className="relative">
            <img src={img.url} alt={img.name} className="rounded-lg" />
            <Button
              variant="destructive"
              size="sm"
              onClick={() => handleDelete(img.id)}
              className="absolute top-2 right-2"
            >
              Delete
            </Button>
          </div>
        ))}
      </div>
    </div>
  )
}

// ============================================================================
// EXAMPLE 5: API Route for Saving Images
// ============================================================================

/**
 * API Route: /api/admin/products/[id]/images/route.ts
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id: productId } = params
  const { images } = await request.json()

  try {
    // Initialize Supabase client
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
              cookieStore.set(name, value, options)
            )
          },
        },
      }
    )

    // Verify admin access
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Delete old images
    await supabase
      .from('product_images')
      .delete()
      .eq('product_id', productId)

    // Insert new images
    const { error } = await supabase
      .from('product_images')
      .insert(
        images.map((img: any) => ({
          product_id: productId,
          image_url: img.image_url,
          alt_text: img.alt_text,
          is_main: img.is_main,
          display_order: img.display_order,
        }))
      )

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to save' },
      { status: 500 }
    )
  }
}

// ============================================================================
// EXAMPLE 6: Advanced Product Form Integration
// ============================================================================

interface AdvancedProductFormProps {
  productId: string
  onSubmit: (data: any) => Promise<void>
}

export function AdvancedProductFormExample({
  productId,
  onSubmit,
}: AdvancedProductFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 0,
  })
  const [productImages, setProductImages] = useState<UploadedImage[]>([])
  const [featuredImageId, setFeaturedImageId] = useState<string>()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleImagesChange = (images: UploadedImage[], featured?: string) => {
    setProductImages(images)
    setFeaturedImageId(featured)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Combine form data with image data
      const completeData = {
        ...formData,
        images: productImages.map((img) => ({
          url: img.url,
          alt: img.name,
          featured: img.id === featuredImageId,
        })),
      }

      await onSubmit(completeData)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Form fields */}
      <div>
        <label>Product Name</label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) =>
            setFormData({ ...formData, name: e.target.value })
          }
        />
      </div>

      {/* Image Manager */}
      <ProductImageManager
        productId={productId}
        initialImages={productImages}
        onImagesChange={handleImagesChange}
      />

      {/* Submit button */}
      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Saving...' : 'Save Product'}
      </button>
    </form>
  )
}

// ============================================================================
// EXPORT ALL EXAMPLES
// ============================================================================

export {
  ProductEditExample,
  CategoriesListExample,
  HeroBannerExample,
  CustomUploadExample,
  AdvancedProductFormExample,
}
