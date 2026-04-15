'use client'

import { useState, useCallback } from 'react'
import Image from 'next/image'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { ImageUploader } from '@/components/image-uploader'
import { UploadedImage } from '@/hooks/use-image-upload'
import { useImageUpload } from '@/hooks/use-image-upload'
import { Trash2, Plus, GripVertical } from 'lucide-react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'

export interface Banner {
  id: string
  title: string
  subtitle: string
  ctaText: string
  ctaLink: string
  desktopImage: UploadedImage
  mobileImage: UploadedImage
  active: boolean
  order: number
}

interface HeroBannerManagerProps {
  banners: Banner[]
  onBannersChange: (banners: Banner[]) => void
}

export function HeroBannerManager({
  banners,
  onBannersChange,
}: HeroBannerManagerProps) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [newBannerMode, setNewBannerMode] = useState(false)
  const [editForm, setEditForm] = useState<Partial<Banner>>({})
  const { deleteImage } = useImageUpload({
    bucket: 'banners',
    folder: 'banners',
  })

  const handleAddBanner = () => {
    const newBanner: Banner = {
      id: `banner-${Date.now()}`,
      title: '',
      subtitle: '',
      ctaText: '',
      ctaLink: '',
      desktopImage: null as any,
      mobileImage: null as any,
      active: true,
      order: banners.length,
    }
    setEditForm(newBanner)
    setEditingId(newBanner.id)
    setNewBannerMode(true)
  }

  const handleEditBanner = (banner: Banner) => {
    setEditForm({ ...banner })
    setEditingId(banner.id)
    setNewBannerMode(false)
  }

  const handleSaveBanner = async () => {
    if (!editingId || !editForm.desktopImage || !editForm.mobileImage) {
      alert('Please upload both desktop and mobile images')
      return
    }

    if (newBannerMode) {
      const newBanner = editForm as Banner
      onBannersChange([...banners, newBanner])
    } else {
      const updated = banners.map((b) =>
        b.id === editingId ? (editForm as Banner) : b
      )
      onBannersChange(updated)
    }

    setEditingId(null)
    setEditForm({})
    setNewBannerMode(false)
  }

  const handleDeleteBanner = async (bannerId: string) => {
    const banner = banners.find((b) => b.id === bannerId)
    if (banner) {
      await deleteImage(banner.desktopImage.id)
      await deleteImage(banner.mobileImage.id)
    }
    onBannersChange(banners.filter((b) => b.id !== bannerId))
  }

  const handleReorder = (fromIndex: number, toIndex: number) => {
    const newBanners = [...banners]
    const [removed] = newBanners.splice(fromIndex, 1)
    newBanners.splice(toIndex, 0, removed)
    newBanners.forEach((b, i) => (b.order = i))
    onBannersChange(newBanners)
  }

  const handleToggleActive = (bannerId: string) => {
    const updated = banners.map((b) =>
      b.id === bannerId ? { ...b, active: !b.active } : b
    )
    onBannersChange(updated)
  }

  return (
    <div className="space-y-6">
      {/* Add Banner Button */}
      {!newBannerMode && (
        <Button onClick={handleAddBanner} className="gap-2">
          <Plus className="w-4 h-4" />
          Add Banner
        </Button>
      )}

      {/* Edit Form */}
      {editingId && (
        <Card className="border-primary/50 bg-primary/5">
          <CardHeader>
            <CardTitle>
              {newBannerMode ? 'Create Banner' : 'Edit Banner'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label>Title</Label>
                <Input
                  value={editForm.title || ''}
                  onChange={(e) =>
                    setEditForm({ ...editForm, title: e.target.value })
                  }
                  placeholder="Banner title"
                />
              </div>

              <div>
                <Label>Subtitle</Label>
                <Input
                  value={editForm.subtitle || ''}
                  onChange={(e) =>
                    setEditForm({ ...editForm, subtitle: e.target.value })
                  }
                  placeholder="Banner subtitle"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>CTA Text</Label>
                  <Input
                    value={editForm.ctaText || ''}
                    onChange={(e) =>
                      setEditForm({ ...editForm, ctaText: e.target.value })
                    }
                    placeholder="e.g., Shop Now"
                  />
                </div>
                <div>
                  <Label>CTA Link</Label>
                  <Input
                    value={editForm.ctaLink || ''}
                    onChange={(e) =>
                      setEditForm({ ...editForm, ctaLink: e.target.value })
                    }
                    placeholder="/shop"
                  />
                </div>
              </div>

              {/* Desktop Image */}
              <div>
                <Label className="mb-2 block">Desktop Image (1920x600)</Label>
                {editForm.desktopImage ? (
                  <div className="relative w-full max-w-2xl aspect-video rounded-lg overflow-hidden border border-border">
                    <Image
                      src={editForm.desktopImage.url}
                      alt="Desktop"
                      fill
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <ImageUploader
                    bucket="banners"
                    folder={`banners/${editingId}`}
                    multiple={false}
                    maxFiles={1}
                    onImagesChange={(imgs) => {
                      if (imgs[0]) {
                        setEditForm({
                          ...editForm,
                          desktopImage: imgs[0],
                        })
                      }
                    }}
                  />
                )}
              </div>

              {/* Mobile Image */}
              <div>
                <Label className="mb-2 block">Mobile Image (600x800)</Label>
                {editForm.mobileImage ? (
                  <div className="relative w-full max-w-xs aspect-[3/4] rounded-lg overflow-hidden border border-border">
                    <Image
                      src={editForm.mobileImage.url}
                      alt="Mobile"
                      fill
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <ImageUploader
                    bucket="banners"
                    folder={`banners/${editingId}`}
                    multiple={false}
                    maxFiles={1}
                    onImagesChange={(imgs) => {
                      if (imgs[0]) {
                        setEditForm({
                          ...editForm,
                          mobileImage: imgs[0],
                        })
                      }
                    }}
                  />
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  setEditingId(null)
                  setEditForm({})
                  setNewBannerMode(false)
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleSaveBanner}>
                {newBannerMode ? 'Create' : 'Save'} Banner
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Banners List */}
      {banners.length > 0 && (
        <div className="space-y-4">
          <h3 className="font-semibold">Banners ({banners.length})</h3>
          {banners.map((banner, index) => (
            <Card
              key={banner.id}
              className={banner.active ? '' : 'opacity-60'}
            >
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium">{banner.title}</h4>
                      <p className="text-sm text-muted-foreground">
                        {banner.subtitle}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={banner.active}
                        onCheckedChange={() =>
                          handleToggleActive(banner.id)
                        }
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditBanner(banner)}
                      >
                        Edit
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogTitle>Delete banner?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone.
                          </AlertDialogDescription>
                          <div className="flex gap-2 justify-end">
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteBanner(banner.id)}
                            >
                              Delete
                            </AlertDialogAction>
                          </div>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
