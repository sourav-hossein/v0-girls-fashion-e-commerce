# Image Management System Documentation

Complete image management system for the e-commerce admin dashboard using Supabase Storage and Next.js.

## Overview

The image management system provides:
- **Drag & drop file uploads** with preview
- **Multiple image uploads** with progress tracking
- **Image gallery** with featured image selection
- **Reorderable image grids**
- **Automatic image compression** and validation
- **Supabase Storage** integration with public URLs
- **TypeScript** support throughout

## Architecture

### File Structure

```
hooks/
  └── use-image-upload.ts         # Core upload hook with Supabase integration

components/
  ├── image-uploader.tsx           # Reusable upload component with drag & drop
  ├── image-gallery.tsx            # Gallery display with featured selection
  ├── product-image-manager.tsx    # Product-specific image management
  ├── category-image-manager.tsx   # Category image management
  └── hero-banner-manager.tsx      # Banner images (desktop + mobile)

app/api/admin/products/[id]/images/
  └── upload/route.ts              # API endpoint for saving image metadata
```

## Core Components

### 1. `useImageUpload` Hook

Manages all image upload operations with Supabase Storage.

**Usage:**

```tsx
const {
  isLoading,
  progress,
  uploadedImages,
  uploadImage,
  uploadMultiple,
  deleteImage,
  clearUploaded,
} = useImageUpload({
  bucket: 'products',
  folder: 'products/product-123',
  maxFileSize: 5 * 1024 * 1024, // 5MB
  allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
})

// Upload single image
const result = await uploadImage(file)

// Upload multiple images
const results = await uploadMultiple([file1, file2])

// Delete image
await deleteImage('products/product-123/image-1.jpg')
```

**Returns:**

```typescript
{
  id: 'path/to/image.jpg',
  url: 'https://cdn.supabase.co/path/to/image.jpg',
  name: 'image.jpg',
  size: 2048000,
  uploadedAt: Date
}
```

### 2. `ImageUploader` Component

Reusable drag & drop upload component.

**Props:**

```typescript
interface ImageUploaderProps {
  bucket: string                    // Supabase bucket name
  folder: string                    // Folder path in bucket
  multiple?: boolean                // Allow multiple files (default: true)
  onImagesChange?: (images) => void // Callback on upload
  maxFiles?: number                 // Maximum files (default: 10)
  maxFileSize?: number              // Max file size in bytes
  initialImages?: UploadedImage[]    // Pre-populated images
}
```

**Example:**

```tsx
<ImageUploader
  bucket="products"
  folder={`products/${productId}`}
  multiple={true}
  maxFiles={10}
  onImagesChange={(images) => console.log(images)}
/>
```

### 3. `ImageGallery` Component

Display images with optional featured selection.

**Props:**

```typescript
interface ImageGalleryProps {
  images: UploadedImage[]
  featuredId?: string
  onFeaturedChange?: (imageId: string) => void
  selectable?: boolean
}
```

**Example:**

```tsx
<ImageGallery
  images={uploadedImages}
  featuredId={selectedId}
  onFeaturedChange={setSelectedId}
  selectable={true}
/>
```

### 4. `ProductImageManager` Component

Complete product image management with upload and gallery tabs.

**Example:**

```tsx
<ProductImageManager
  productId="prod-123"
  initialImages={productImages}
  onImagesChange={(images, featuredId) => {
    // Save to database
  }}
/>
```

### 5. `CategoryImageManager` Component

Single image upload for categories with replace functionality.

**Example:**

```tsx
<CategoryImageManager
  categoryId="cat-123"
  initialImage={categoryImage}
  onImageChange={(image) => {
    // Save to database
  }}
/>
```

### 6. `HeroBannerManager` Component

Manage multiple hero banners with desktop + mobile versions.

**Example:**

```tsx
<HeroBannerManager
  banners={herobanners}
  onBannersChange={(banners) => {
    // Save to database
  }}
/>
```

## Supabase Storage Setup

### Required Buckets

Create these public buckets in Supabase:

1. **products** - Product images
   - Folder structure: `products/{productId}/`

2. **categories** - Category images
   - Folder structure: `categories/{categoryId}/`

3. **banners** - Hero banner images
   - Folder structure: `banners/{bannerId}/`

### Storage Policies

All buckets should have:
- **Public access**: Images are readable by anonymous users
- **Authenticated uploads**: Only logged-in admins can upload
- **Auto-generated URLs**: Public URLs are automatically generated after upload

## Integration Examples

### Product Edit Page

```tsx
'use client'

import { ProductImageManager } from '@/components/product-image-manager'
import { UploadedImage } from '@/hooks/use-image-upload'

export default function ProductEditPage({ product, images }) {
  const handleImagesChange = async (
    newImages: UploadedImage[],
    featuredId?: string
  ) => {
    // Save images to database
    const response = await fetch(`/api/admin/products/${product.id}/images`, {
      method: 'PUT',
      body: JSON.stringify({
        images: newImages.map(img => ({
          image_url: img.url,
          alt_text: img.name,
          is_main: img.id === featuredId,
        }))
      })
    })
  }

  return (
    <ProductImageManager
      productId={product.id}
      initialImages={images}
      onImagesChange={handleImagesChange}
    />
  )
}
```

### Admin Settings Page with Hero Banners

```tsx
'use client'

import { HeroBannerManager } from '@/components/hero-banner-manager'
import { Banner } from '@/components/hero-banner-manager'

export default function AdminSettingsPage() {
  const [banners, setBanners] = useState<Banner[]>([])

  const handleBannersChange = async (newBanners: Banner[]) => {
    const response = await fetch('/api/admin/settings/banners', {
      method: 'PUT',
      body: JSON.stringify(newBanners)
    })
    setBanners(newBanners)
  }

  return (
    <HeroBannerManager
      banners={banners}
      onBannersChange={handleBannersChange}
    />
  )
}
```

### Admin Categories Page

```tsx
'use client'

import { CategoryImageManager } from '@/components/category-image-manager'

export default function CategoriesPage({ categories }) {
  const handleImageChange = async (categoryId: string, image) => {
    await fetch(`/api/admin/categories/${categoryId}`, {
      method: 'PUT',
      body: JSON.stringify({
        image_url: image?.url,
      })
    })
  }

  return (
    <div className="space-y-6">
      {categories.map(category => (
        <CategoryImageManager
          key={category.id}
          categoryId={category.id}
          initialImage={category.image}
          onImageChange={(img) => handleImageChange(category.id, img)}
        />
      ))}
    </div>
  )
}
```

## File Validation

### Supported File Types
- JPEG/JPG
- PNG
- WebP

### File Size Limits
- Default: 5MB
- Customizable per component

### Validation Process
1. File type check
2. File size validation
3. Upload to Supabase Storage
4. Generate public URL
5. Save metadata to database (optional)

## Performance Optimizations

### Image Display
- Uses Next.js `Image` component for optimization
- Automatic lazy loading
- Responsive image sizing
- Blur placeholder support

### Upload Process
- Client-side validation before upload
- Progress tracking during upload
- Batch upload for multiple files
- Error handling with user feedback

### Caching
- 1-hour cache control on uploaded images
- Browser caching for fast subsequent loads

## Error Handling

All components include comprehensive error handling:

```typescript
try {
  await uploadImage(file)
} catch (error) {
  if (error instanceof Error) {
    toast.error(error.message)
  }
}
```

Error messages include:
- Invalid file type
- File size exceeds limit
- Upload failed
- Delete failed
- Network errors

## Database Integration

### ProductImages Table

```sql
CREATE TABLE product_images (
  id UUID PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES products(id),
  image_url VARCHAR(500) NOT NULL,
  alt_text VARCHAR(255),
  is_main BOOLEAN DEFAULT FALSE,
  display_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
)
```

### Save After Upload

```typescript
// In API route or Server Action
const { data, error } = await supabase
  .from('product_images')
  .insert({
    product_id: productId,
    image_url: imageUrl,
    alt_text: imageName,
    is_main: isFeatured,
  })
```

## Troubleshooting

### Images not uploading
- Check Supabase project is active
- Verify bucket exists and is public
- Check authentication token
- Verify file size < max limit

### URLs not loading
- Ensure bucket is public
- Check image path in Supabase
- Verify CORS settings (if needed)

### Performance issues
- Use image compression before upload
- Optimize image dimensions
- Use WebP format when possible
- Implement lazy loading

## Best Practices

1. **Always validate files** before upload
2. **Use TypeScript** for type safety
3. **Optimize images** for web (use WebP)
4. **Set featured image** for product cards
5. **Use descriptive alt text** for accessibility
6. **Handle errors gracefully** with user feedback
7. **Implement progress indicators** for large files
8. **Cache images** appropriately

## Future Enhancements

- [ ] Image cropping/resizing UI
- [ ] Batch image optimization
- [ ] Image compression before upload
- [ ] AI-powered alt text generation
- [ ] Image CDN integration
- [ ] Scheduled image cleanup
- [ ] Image analytics tracking
- [ ] AI-based image recommendations
