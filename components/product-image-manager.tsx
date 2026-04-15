'use client'

import { useState, useEffect } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ImageUploader } from '@/components/image-uploader'
import { ImageGallery } from '@/components/image-gallery'
import { UploadedImage } from '@/hooks/use-image-upload'
import { Upload, Grid3x3 } from 'lucide-react'

interface ProductImageManagerProps {
  productId: string
  initialImages?: UploadedImage[]
  onImagesChange: (images: UploadedImage[], featuredId?: string) => void
}

export function ProductImageManager({
  productId,
  initialImages = [],
  onImagesChange,
}: ProductImageManagerProps) {
  const [images, setImages] = useState<UploadedImage[]>(initialImages)
  const [featuredId, setFeaturedId] = useState<string>(images[0]?.id)

  useEffect(() => {
    onImagesChange(images, featuredId)
  }, [images, featuredId, onImagesChange])

  const handleImagesChange = (newImages: UploadedImage[]) => {
    setImages(newImages)
    // Reset featured if it no longer exists
    if (featuredId && !newImages.find((img) => img.id === featuredId)) {
      setFeaturedId(newImages[0]?.id)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Product Images</CardTitle>
        <CardDescription>
          Upload and manage product images. Mark one as featured for the product card.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="upload" className="space-y-6">
          <TabsList>
            <TabsTrigger value="upload" className="gap-2">
              <Upload className="w-4 h-4" />
              Upload
            </TabsTrigger>
            <TabsTrigger value="gallery" className="gap-2">
              <Grid3x3 className="w-4 h-4" />
              Gallery
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="space-y-6">
            <ImageUploader
              bucket="products"
              folder={`products/${productId}`}
              multiple={true}
              maxFiles={10}
              maxFileSize={5 * 1024 * 1024}
              initialImages={images}
              onImagesChange={handleImagesChange}
            />
          </TabsContent>

          <TabsContent value="gallery">
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Click an image to set it as featured
              </p>
              <ImageGallery
                images={images}
                featuredId={featuredId}
                onFeaturedChange={setFeaturedId}
                selectable={true}
              />
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
