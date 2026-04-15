'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { ImageUploader } from '@/components/image-uploader'
import { Trash2, Plus } from 'lucide-react'
import { toast } from 'sonner'
import { HeroBanner } from '@/lib/types'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'

export function HeroBannerManager() {
  const [banners, setBanners] = useState<HeroBanner[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<Partial<HeroBanner>>({})

  useEffect(() => {
    fetchBanners()
  }, [])

  const fetchBanners = async () => {
    try {
      const response = await fetch('/api/admin/banners')
      if (!response.ok) throw new Error('Failed to fetch banners')
      const data = await response.json()
      setBanners(data)
    } catch (error) {
      console.error('[v0] Error fetching banners:', error)
      toast.error('Failed to load banners')
    } finally {
      setLoading(false)
    }
  }

  const handleAddBanner = () => {
    setEditingId('new')
    setEditForm({
      title: 'New Banner',
      subtitle: '',
      desktop_image_url: '',
      mobile_image_url: '',
      cta_text: '',
      cta_url: '',
      display_order: banners.length,
      active: true,
    })
  }

  const handleEditBanner = (banner: HeroBanner) => {
    setEditingId(banner.id)
    setEditForm({ ...banner })
  }

  const handleSaveBanner = async () => {
    if (!editForm.title) {
      toast.error('Please enter a banner title')
      return
    }

    try {
      const isNew = editingId === 'new'
      const url = isNew ? '/api/admin/banners' : `/api/admin/banners/${editingId}`
      const method = isNew ? 'POST' : 'PATCH'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      })

      if (!response.ok) throw new Error('Failed to save banner')
      
      const saved = await response.json()
      if (isNew) {
        setBanners([...banners, saved])
      } else {
        setBanners(banners.map(b => b.id === saved.id ? saved : b))
      }
      
      toast.success(isNew ? 'Banner created' : 'Banner updated')
      setEditingId(null)
      setEditForm({})
    } catch (error) {
      console.error('[v0] Error saving banner:', error)
      toast.error('Failed to save banner')
    }
  }

  const handleDeleteBanner = async (bannerId: string) => {
    try {
      const response = await fetch(`/api/admin/banners/${bannerId}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Failed to delete banner')
      
      setBanners(banners.filter(b => b.id !== bannerId))
      toast.success('Banner deleted')
    } catch (error) {
      console.error('[v0] Error deleting banner:', error)
      toast.error('Failed to delete banner')
    }
  }

  const handleUploadImage = (url: string, type: 'desktop' | 'mobile') => {
    if (type === 'desktop') {
      setEditForm({ ...editForm, desktop_image_url: url })
    } else {
      setEditForm({ ...editForm, mobile_image_url: url })
    }
  }

  if (loading) {
    return <div className="text-center py-8">Loading banners...</div>
  }

  return (
    <div className="space-y-6">
      {!editingId && (
        <Button onClick={handleAddBanner} className="gap-2">
          <Plus className="w-4 h-4" />
          Add Banner
        </Button>
      )}

      {editingId && (
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle>
              {editingId === 'new' ? 'Create Banner' : 'Edit Banner'}
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

              <div>
                <Label>CTA Text</Label>
                <Input
                  value={editForm.cta_text || ''}
                  onChange={(e) =>
                    setEditForm({ ...editForm, cta_text: e.target.value })
                  }
                  placeholder="Call-to-action text"
                />
              </div>

              <div>
                <Label>CTA URL</Label>
                <Input
                  value={editForm.cta_url || ''}
                  onChange={(e) =>
                    setEditForm({ ...editForm, cta_url: e.target.value })
                  }
                  placeholder="https://example.com"
                />
              </div>

              <div>
                <Label>Desktop Image</Label>
                <ImageUploader
                  bucket="banners"
                  folder="banners/desktop"
                  maxSize={5 * 1024 * 1024}
                  onUploadComplete={(url) => handleUploadImage(url, 'desktop')}
                />
                {editForm.desktop_image_url && (
                  <p className="text-xs text-muted-foreground mt-2">
                    ✓ Image selected
                  </p>
                )}
              </div>

              <div>
                <Label>Mobile Image</Label>
                <ImageUploader
                  bucket="banners"
                  folder="banners/mobile"
                  maxSize={5 * 1024 * 1024}
                  onUploadComplete={(url) => handleUploadImage(url, 'mobile')}
                />
                {editForm.mobile_image_url && (
                  <p className="text-xs text-muted-foreground mt-2">
                    ✓ Image selected
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2">
                <Switch
                  checked={editForm.active !== false}
                  onCheckedChange={(checked) =>
                    setEditForm({ ...editForm, active: checked })
                  }
                />
                <Label>Active</Label>
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleSaveBanner} className="flex-1">
                Save Banner
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setEditingId(null)
                  setEditForm({})
                }}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        {banners.map((banner) => (
          <Card key={banner.id} className="border-border">
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h3 className="font-semibold">{banner.title}</h3>
                  {banner.subtitle && (
                    <p className="text-sm text-muted-foreground">
                      {banner.subtitle}
                    </p>
                  )}
                  {banner.cta_text && (
                    <p className="text-xs text-primary mt-1">{banner.cta_text}</p>
                  )}
                  {!banner.active && (
                    <span className="inline-block mt-2 px-2 py-1 bg-muted text-muted-foreground text-xs rounded">
                      Inactive
                    </span>
                  )}
                </div>

                <div className="flex gap-2">
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
                        size="sm"
                        className="text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogTitle>Delete Banner</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete this banner? This action
                        cannot be undone.
                      </AlertDialogDescription>
                      <div className="flex gap-2 justify-end">
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDeleteBanner(banner.id)}
                          className="bg-destructive hover:bg-destructive/90"
                        >
                          Delete
                        </AlertDialogAction>
                      </div>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {banners.length === 0 && !editingId && (
          <p className="text-center text-muted-foreground py-8">
            No banners yet. Create one to get started.
          </p>
        )}
      </div>
    </div>
  )
}
