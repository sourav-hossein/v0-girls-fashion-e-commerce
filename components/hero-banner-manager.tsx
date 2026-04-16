'use client'

import { useEffect, useMemo, useState } from 'react'
import { ArrowDown, ArrowUp, Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { HeroBanner } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { SingleImageInput } from '@/components/ui/single-image-input'
import { SafeImage } from '@/components/ui/safe-image'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'

type BannerForm = Partial<HeroBanner>

const emptyForm: BannerForm = {
  title: '',
  subtitle: '',
  cta_text: '',
  cta_url: '',
  display_order: 0,
  active: true,
  desktop_image_url: '',
  desktop_image_alt: '',
  mobile_image_url: '',
  mobile_image_alt: '',
}

export function HeroBannerManager() {
  const [banners, setBanners] = useState<HeroBanner[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<BannerForm>(emptyForm)
  const [desktopImageFile, setDesktopImageFile] = useState<File | null>(null)
  const [mobileImageFile, setMobileImageFile] = useState<File | null>(null)
  const [desktopImagePreview, setDesktopImagePreview] = useState<string | null>(null)
  const [mobileImagePreview, setMobileImagePreview] = useState<string | null>(null)
  const [removeDesktopImage, setRemoveDesktopImage] = useState(false)
  const [removeMobileImage, setRemoveMobileImage] = useState(false)

  const orderedBanners = useMemo(
    () => [...banners].sort((a, b) => a.display_order - b.display_order),
    [banners],
  )

  useEffect(() => {
    fetchBanners()
  }, [])

  const fetchBanners = async () => {
    try {
      const response = await fetch('/api/admin/banners')
      const data = await response.json().catch(() => [])
      if (!response.ok) {
        throw new Error(data?.error || 'Failed to fetch banners')
      }
      setBanners(data)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to load banners')
    } finally {
      setLoading(false)
    }
  }

  const resetEditor = () => {
    setEditingId(null)
    setEditForm(emptyForm)
    setDesktopImageFile(null)
    setMobileImageFile(null)
    setDesktopImagePreview(null)
    setMobileImagePreview(null)
    setRemoveDesktopImage(false)
    setRemoveMobileImage(false)
  }

  const handleAddBanner = () => {
    setEditingId('new')
    setEditForm({
      ...emptyForm,
      title: 'New Banner',
      display_order: orderedBanners.length,
    })
  }

  const handleEditBanner = (banner: HeroBanner) => {
    setEditingId(banner.id)
    setEditForm({ ...banner })
    setDesktopImagePreview(banner.desktop_image_url || null)
    setMobileImagePreview(banner.mobile_image_url || null)
    setDesktopImageFile(null)
    setMobileImageFile(null)
    setRemoveDesktopImage(false)
    setRemoveMobileImage(false)
  }

  const uploadBannerImage = async ({
    bannerId,
    variant,
    file,
    altText,
  }: {
    bannerId: string
    variant: 'desktop' | 'mobile'
    file: File
    altText: string
  }) => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('variant', variant)
    formData.append('alt_text', altText)

    const response = await fetch(`/api/admin/banners/${bannerId}/images`, {
      method: 'POST',
      body: formData,
    })
    const payload = await response.json().catch(() => ({}))
    if (!response.ok) {
      throw new Error(payload?.error || `Failed to upload ${variant} banner image`)
    }
    return payload.banner as HeroBanner
  }

  const deleteBannerImage = async (bannerId: string, variant: 'desktop' | 'mobile') => {
    const response = await fetch(`/api/admin/banners/${bannerId}/images?variant=${variant}`, {
      method: 'DELETE',
    })
    const payload = await response.json().catch(() => ({}))
    if (!response.ok) {
      throw new Error(payload?.error || `Failed to delete ${variant} banner image`)
    }
    return payload.banner as HeroBanner
  }

  const handleSaveBanner = async () => {
    if (!editForm.title?.trim()) {
      toast.error('Please enter a banner title')
      return
    }

    setSaving(true)

    try {
      const isNew = editingId === 'new'
      const url = isNew ? '/api/admin/banners' : `/api/admin/banners/${editingId}`
      const method = isNew ? 'POST' : 'PATCH'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      })
      const payload = await response.json().catch(() => ({}))
      if (!response.ok) {
        throw new Error(payload?.error || 'Failed to save banner')
      }

      let savedBanner = payload as HeroBanner

      if (!isNew && removeDesktopImage && savedBanner.desktop_image_url) {
        savedBanner = await deleteBannerImage(savedBanner.id, 'desktop')
      }

      if (!isNew && removeMobileImage && savedBanner.mobile_image_url) {
        savedBanner = await deleteBannerImage(savedBanner.id, 'mobile')
      }

      if (desktopImageFile) {
        savedBanner = await uploadBannerImage({
          bannerId: savedBanner.id,
          variant: 'desktop',
          file: desktopImageFile,
          altText: editForm.desktop_image_alt || editForm.title || 'Hero banner',
        })
      }

      if (mobileImageFile) {
        savedBanner = await uploadBannerImage({
          bannerId: savedBanner.id,
          variant: 'mobile',
          file: mobileImageFile,
          altText: editForm.mobile_image_alt || editForm.title || 'Hero banner',
        })
      }

      setBanners((prev) => {
        if (isNew) return [...prev, savedBanner]
        return prev.map((banner) => (banner.id === savedBanner.id ? savedBanner : banner))
      })

      toast.success(isNew ? 'Banner created' : 'Banner updated')
      resetEditor()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to save banner')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteBanner = async (bannerId: string) => {
    try {
      const response = await fetch(`/api/admin/banners/${bannerId}`, {
        method: 'DELETE',
      })
      const payload = await response.json().catch(() => ({}))
      if (!response.ok) {
        throw new Error(payload?.error || 'Failed to delete banner')
      }
      setBanners((prev) => prev.filter((banner) => banner.id !== bannerId))
      toast.success('Banner deleted')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete banner')
    }
  }

  const persistOrder = async (nextBanners: HeroBanner[]) => {
    const normalized = nextBanners.map((banner, index) => ({
      ...banner,
      display_order: index,
    }))

    setBanners(normalized)
    try {
      await Promise.all(
        normalized.map((banner) =>
          fetch(`/api/admin/banners/${banner.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              ...banner,
              display_order: banner.display_order,
            }),
          }).then(async (response) => {
            const payload = await response.json().catch(() => ({}))
            if (!response.ok) {
              throw new Error(payload?.error || 'Failed to save banner order')
            }
          }),
        ),
      )
      toast.success('Banner order updated')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update banner order')
      fetchBanners()
    }
  }

  const moveBanner = async (bannerId: string, direction: 'up' | 'down') => {
    const index = orderedBanners.findIndex((banner) => banner.id === bannerId)
    if (index === -1) return

    const nextIndex = direction === 'up' ? index - 1 : index + 1
    if (nextIndex < 0 || nextIndex >= orderedBanners.length) return

    const reordered = [...orderedBanners]
    const [moved] = reordered.splice(index, 1)
    reordered.splice(nextIndex, 0, moved)
    await persistOrder(reordered)
  }

  if (loading) {
    return <div className="py-8 text-center text-sm text-muted-foreground">Loading banners...</div>
  }

  return (
    <div className="space-y-6">
      {!editingId ? (
        <Button onClick={handleAddBanner} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Banner
        </Button>
      ) : null}

      {editingId ? (
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle>{editingId === 'new' ? 'Create Banner' : 'Edit Banner'}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Title</Label>
                <Input
                  value={editForm.title || ''}
                  onChange={(event) => setEditForm((prev) => ({ ...prev, title: event.target.value }))}
                  placeholder="Banner title"
                />
              </div>
              <div className="space-y-2">
                <Label>Display Order</Label>
                <Input
                  type="number"
                  min={0}
                  value={editForm.display_order ?? 0}
                  onChange={(event) =>
                    setEditForm((prev) => ({
                      ...prev,
                      display_order: Number(event.target.value),
                    }))
                  }
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Subtitle</Label>
                <Input
                  value={editForm.subtitle || ''}
                  onChange={(event) =>
                    setEditForm((prev) => ({ ...prev, subtitle: event.target.value }))
                  }
                  placeholder="Banner subtitle"
                />
              </div>
              <div className="space-y-2">
                <Label>CTA Text</Label>
                <Input
                  value={editForm.cta_text || ''}
                  onChange={(event) =>
                    setEditForm((prev) => ({ ...prev, cta_text: event.target.value }))
                  }
                  placeholder="Shop now"
                />
              </div>
              <div className="space-y-2">
                <Label>CTA URL</Label>
                <Input
                  value={editForm.cta_url || ''}
                  onChange={(event) =>
                    setEditForm((prev) => ({ ...prev, cta_url: event.target.value }))
                  }
                  placeholder="/shop"
                />
              </div>
            </div>

            <label className="flex items-center gap-3 text-sm font-medium">
              <Switch
                checked={editForm.active !== false}
                onCheckedChange={(checked) =>
                  setEditForm((prev) => ({ ...prev, active: checked }))
                }
              />
              Active banner
            </label>

            <div className="grid gap-6 lg:grid-cols-2">
              <SingleImageInput
                label="Desktop Image"
                description="Used on larger screens. Falls back on mobile if no mobile image exists."
                imageUrl={removeDesktopImage ? null : desktopImagePreview}
                altText={editForm.desktop_image_alt}
                fallbackAlt={editForm.title || 'Desktop banner image'}
                onFileChange={(file) => {
                  setDesktopImageFile(file)
                  setRemoveDesktopImage(false)
                  setDesktopImagePreview(file ? URL.createObjectURL(file) : editForm.desktop_image_url || null)
                }}
                onAltTextChange={(value) =>
                  setEditForm((prev) => ({ ...prev, desktop_image_alt: value }))
                }
                onRemove={() => {
                  setDesktopImageFile(null)
                  setRemoveDesktopImage(true)
                  setDesktopImagePreview(null)
                }}
                disabled={saving}
              />

              <SingleImageInput
                label="Mobile Image"
                description="Optional. If omitted, the desktop banner image is reused on mobile."
                imageUrl={removeMobileImage ? null : mobileImagePreview}
                altText={editForm.mobile_image_alt}
                fallbackAlt={editForm.title || 'Mobile banner image'}
                onFileChange={(file) => {
                  setMobileImageFile(file)
                  setRemoveMobileImage(false)
                  setMobileImagePreview(file ? URL.createObjectURL(file) : editForm.mobile_image_url || null)
                }}
                onAltTextChange={(value) =>
                  setEditForm((prev) => ({ ...prev, mobile_image_alt: value }))
                }
                onRemove={() => {
                  setMobileImageFile(null)
                  setRemoveMobileImage(true)
                  setMobileImagePreview(null)
                }}
                disabled={saving}
              />
            </div>

            <div className="flex gap-2">
              <Button onClick={handleSaveBanner} disabled={saving} className="flex-1">
                {saving ? 'Saving...' : 'Save Banner'}
              </Button>
              <Button variant="outline" onClick={resetEditor} disabled={saving} className="flex-1">
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : null}

      <div className="space-y-3">
        {orderedBanners.map((banner, index) => (
          <Card key={banner.id}>
            <CardContent className="p-4">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="flex flex-1 gap-4">
                  <div className="relative hidden aspect-[4/3] w-28 overflow-hidden rounded-lg border border-border bg-muted sm:block">
                    <SafeImage
                      src={banner.desktop_image_url || banner.mobile_image_url}
                      alt={banner.desktop_image_alt || banner.title}
                      fill
                      className="object-cover"
                      sizes="112px"
                    />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{banner.title}</h3>
                      {!banner.active ? (
                        <span className="rounded-full bg-muted px-2 py-1 text-xs text-muted-foreground">
                          Inactive
                        </span>
                      ) : null}
                    </div>
                    {banner.subtitle ? (
                      <p className="text-sm text-muted-foreground">{banner.subtitle}</p>
                    ) : null}
                    {banner.cta_text ? (
                      <p className="text-xs text-primary">
                        {banner.cta_text}
                        {banner.cta_url ? ` → ${banner.cta_url}` : ''}
                      </p>
                    ) : null}
                    <p className="text-xs text-muted-foreground">
                      Order: {banner.display_order}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => moveBanner(banner.id, 'up')}
                    disabled={index === 0}
                  >
                    <ArrowUp className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => moveBanner(banner.id, 'down')}
                    disabled={index === orderedBanners.length - 1}
                  >
                    <ArrowDown className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleEditBanner(banner)}>
                    Edit
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="sm" className="text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogTitle>Delete banner?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This removes the banner and its stored images.
                      </AlertDialogDescription>
                      <div className="flex justify-end gap-2">
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDeleteBanner(banner.id)}>
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

        {orderedBanners.length === 0 && !editingId ? (
          <p className="py-8 text-center text-muted-foreground">
            No hero banners yet. Create one to power the homepage hero.
          </p>
        ) : null}
      </div>
    </div>
  )
}
