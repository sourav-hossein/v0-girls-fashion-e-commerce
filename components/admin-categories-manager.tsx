'use client'

import { useMemo, useState, type FormEvent } from 'react'
import { toast } from 'sonner'
import { Check, Pencil, Plus, RefreshCw, Trash2, X, AlertCircle, Image as ImageIcon } from 'lucide-react'
import { Category } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { SingleImageInput } from '@/components/ui/single-image-input'
import { SafeImage } from '@/components/ui/safe-image'
import { cn } from '@/lib/utils'

type CategoryForm = {
  name: string
  slug: string
  description: string
  image_alt: string
}

const emptyForm: CategoryForm = {
  name: '',
  slug: '',
  description: '',
  image_alt: '',
}

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/['"]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export default function AdminCategoriesManager({
  initialCategories,
}: {
  initialCategories: Category[]
}) {
  const [categories, setCategories] = useState<Category[]>(initialCategories)
  const [isAdding, setIsAdding] = useState(false)
  const [createForm, setCreateForm] = useState<CategoryForm>(emptyForm)
  const [createSlugEdited, setCreateSlugEdited] = useState(false)
  const [createImageFile, setCreateImageFile] = useState<File | null>(null)
  const [createImagePreview, setCreateImagePreview] = useState<string | null>(null)
  
  const [editing, setEditing] = useState<Category | null>(null)
  const [editForm, setEditForm] = useState<CategoryForm>(emptyForm)
  const [editSlugEdited, setEditSlugEdited] = useState(false)
  const [editImageFile, setEditImageFile] = useState<File | null>(null)
  const [editImagePreview, setEditImagePreview] = useState<string | null>(null)
  const [editImageRemoved, setEditImageRemoved] = useState(false)
  
  const [busy, setBusy] = useState(false)
  const [refreshing, setRefreshing] = useState(false)

  const sortedCategories = useMemo(
    () => [...categories].sort((a, b) => a.name.localeCompare(b.name)),
    [categories],
  )

  const applyCreateName = (value: string) => {
    setCreateForm((prev) => ({
      ...prev,
      name: value,
      slug: createSlugEdited ? prev.slug : slugify(value),
    }))
  }

  const applyEditName = (value: string) => {
    setEditForm((prev) => ({
      ...prev,
      name: value,
      slug: editSlugEdited ? prev.slug : slugify(value),
    }))
  }

  const resetCreateImage = () => {
    setCreateImageFile(null)
    setCreateImagePreview(null)
  }

  const resetEditImage = () => {
    setEditImageFile(null)
    setEditImagePreview(null)
    setEditImageRemoved(false)
  }

  const uploadCategoryImage = async ({
    categoryId,
    file,
    altText,
  }: {
    categoryId: string
    file: File
    altText: string
  }) => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('alt_text', altText)

    const response = await fetch(`/api/admin/categories/${categoryId}/image`, {
      method: 'POST',
      body: formData,
    })
    const payload = await response.json().catch(() => ({}))
    if (!response.ok) {
      throw new Error(payload?.error || 'Image upload failed')
    }
    return payload.category as Category
  }

  const handleCreate = async (event: FormEvent) => {
    event.preventDefault()
    setBusy(true)

    const promise = async () => {
      const response = await fetch('/api/admin/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: createForm.name,
          slug: createForm.slug,
          description: createForm.description,
          image_alt: createForm.image_alt,
        }),
      })

      const payload = await response.json().catch(() => ({}))
      if (!response.ok) {
        throw new Error(payload?.error || 'Failed to create category')
      }

      let createdCategory = payload.category as Category
      if (createImageFile) {
        createdCategory = await uploadCategoryImage({
          categoryId: createdCategory.id,
          file: createImageFile,
          altText: createForm.image_alt,
        })
      }

      setCategories((prev) => [createdCategory, ...prev])
      setCreateForm(emptyForm)
      resetCreateImage()
      setCreateSlugEdited(false)
      setIsAdding(false)
      return createdCategory
    }

    toast.promise(promise(), {
      loading: 'Creating category...',
      success: 'Category created successfully',
      error: (err) => err.message || 'Failed to create category',
    })

    try {
      await promise()
    } catch (e) {
      // Handled by toast.promise
    } finally {
      setBusy(false)
    }
  }

  const startEditing = (category: Category) => {
    setEditing(category)
    setEditForm({
      name: category.name,
      slug: category.slug,
      description: category.description || '',
      image_alt: category.image_alt || '',
    })
    setEditSlugEdited(false)
    setEditImageFile(null)
    setEditImagePreview(category.image_url || null)
    setEditImageRemoved(false)
    setIsAdding(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const cancelEditing = () => {
    setEditing(null)
    setEditForm(emptyForm)
    setEditSlugEdited(false)
    resetEditImage()
  }

  const handleUpdate = async () => {
    if (!editing) return
    setBusy(true)

    const promise = async () => {
      const response = await fetch(`/api/admin/categories/${editing.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editForm.name,
          slug: editForm.slug,
          description: editForm.description,
          image_alt: editForm.image_alt,
          image_url: editImageRemoved ? null : editing.image_url,
        }),
      })

      const payload = await response.json().catch(() => ({}))
      if (!response.ok) {
        throw new Error(payload?.error || 'Failed to update category')
      }

      let updatedCategory = payload.category as Category

      if (editImageRemoved && editing.image_url) {
        const removeResponse = await fetch(`/api/admin/categories/${editing.id}/image`, {
          method: 'DELETE',
        })
        const removePayload = await removeResponse.json().catch(() => ({}))
        if (!removeResponse.ok) {
          throw new Error(removePayload?.error || 'Category updated but image delete failed')
        }
        updatedCategory = removePayload.category
      }

      if (editImageFile) {
        updatedCategory = await uploadCategoryImage({
          categoryId: editing.id,
          file: editImageFile,
          altText: editForm.image_alt,
        })
      }

      setCategories((prev) =>
        prev.map((item) => (item.id === editing.id ? updatedCategory : item)),
      )
      cancelEditing()
      return updatedCategory
    }

    toast.promise(promise(), {
      loading: 'Updating category...',
      success: 'Category updated successfully',
      error: (err) => err.message || 'Failed to update category',
    })

    try {
      await promise()
    } catch (e) {
      // Handled by toast.promise
    } finally {
      setBusy(false)
    }
  }

  const handleDelete = async (category: Category) => {
    if (!confirm(`Delete "${category.name}"? This cannot be undone.`)) return

    setBusy(true)
    const promise = async () => {
      const response = await fetch(`/api/admin/categories/${category.id}`, {
        method: 'DELETE',
      })
      const payload = await response.json().catch(() => ({}))
      if (!response.ok) {
        throw new Error(payload?.error || 'Failed to delete category')
      }
      setCategories((prev) => prev.filter((item) => item.id !== category.id))
      if (editing?.id === category.id) cancelEditing()
    }

    toast.promise(promise(), {
      loading: `Deleting ${category.name}...`,
      success: 'Category deleted',
      error: (err) => err.message || 'Failed to delete category',
    })

    try {
      await promise()
    } catch (e) {
      // Handled by toast.promise
    } finally {
      setBusy(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    try {
      const response = await fetch('/api/admin/categories')
      const payload = await response.json().catch(() => ({}))
      if (!response.ok) {
        throw new Error(payload?.error || 'Failed to refresh categories')
      }
      setCategories(payload.categories || [])
      toast.success('Categories refreshed')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to refresh')
    } finally {
      setRefreshing(false)
    }
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant={isAdding ? 'ghost' : 'default'}
            onClick={() => {
              setIsAdding(!isAdding)
              if (editing) cancelEditing()
            }}
            className="gap-2"
            disabled={busy}
          >
            {isAdding ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
            {isAdding ? 'Cancel' : 'Add Category'}
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={handleRefresh}
            disabled={busy || refreshing}
            className={cn(refreshing && 'animate-spin')}
            title="Refresh list"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {isAdding && (
        <Card className="border-primary/20 shadow-lg animate-in slide-in-from-top-4 duration-300">
          <CardHeader>
            <CardTitle className="text-xl font-serif">Create New Category</CardTitle>
            <CardDescription>Enter the details for the new product category.</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="grid gap-6 md:grid-cols-2" onSubmit={handleCreate}>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Name</label>
                  <Input
                    value={createForm.name}
                    onChange={(event) => applyCreateName(event.target.value)}
                    placeholder="e.g. Premium Hijabs"
                    required
                    disabled={busy}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Slug</label>
                  <Input
                    value={createForm.slug}
                    onChange={(event) => {
                      setCreateSlugEdited(true)
                      setCreateForm((prev) => ({ ...prev, slug: event.target.value }))
                    }}
                    placeholder="e.g. premium-hijabs"
                    required
                    disabled={busy}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Description</label>
                  <Textarea
                    value={createForm.description}
                    onChange={(event) =>
                      setCreateForm((prev) => ({ ...prev, description: event.target.value }))
                    }
                    placeholder="Tell us about this category..."
                    rows={4}
                    disabled={busy}
                  />
                </div>
              </div>
              <div className="space-y-4">
                <SingleImageInput
                  label="Category Image"
                  description="Upload a high-quality thumbnail for this category."
                  imageUrl={createImagePreview}
                  altText={createForm.image_alt}
                  fallbackAlt={createForm.name || 'Category image'}
                  onFileChange={(file) => {
                    setCreateImageFile(file)
                    setCreateImagePreview(file ? URL.createObjectURL(file) : null)
                  }}
                  onAltTextChange={(value) =>
                    setCreateForm((prev) => ({ ...prev, image_alt: value }))
                  }
                  onRemove={resetCreateImage}
                  disabled={busy}
                />
                <div className="flex items-center justify-end gap-3 pt-4 border-t">
                  <Button variant="ghost" type="button" onClick={() => setIsAdding(false)} disabled={busy}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={busy} className="gap-2">
                    {busy ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                    Create Category
                  </Button>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {editing && (
        <Card className="border-primary/20 shadow-lg animate-in slide-in-from-top-4 duration-300">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-xl font-serif">Edit Category: {editing.name}</CardTitle>
              <CardDescription>Update name, description, or image for this category.</CardDescription>
            </div>
            <Button variant="ghost" size="icon" onClick={cancelEditing} disabled={busy}>
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Name</label>
                  <Input
                    value={editForm.name}
                    onChange={(event) => applyEditName(event.target.value)}
                    required
                    disabled={busy}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Slug</label>
                  <Input
                    value={editForm.slug}
                    onChange={(event) => {
                      setEditSlugEdited(true)
                      setEditForm((prev) => ({ ...prev, slug: event.target.value }))
                    }}
                    required
                    disabled={busy}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Description</label>
                  <Textarea
                    value={editForm.description}
                    onChange={(event) =>
                      setEditForm((prev) => ({ ...prev, description: event.target.value }))
                    }
                    rows={4}
                    disabled={busy}
                  />
                </div>
              </div>
              <div className="space-y-4">
                <SingleImageInput
                  label="Category Image"
                  description="Replace or remove the current thumbnail."
                  imageUrl={editImageRemoved ? null : editImagePreview}
                  altText={editForm.image_alt}
                  fallbackAlt={editForm.name || 'Category image'}
                  onFileChange={(file) => {
                    setEditImageFile(file)
                    setEditImageRemoved(false)
                    setEditImagePreview(file ? URL.createObjectURL(file) : editing.image_url || null)
                  }}
                  onAltTextChange={(value) =>
                    setEditForm((prev) => ({ ...prev, image_alt: value }))
                  }
                  onRemove={() => {
                    setEditImageFile(null)
                    setEditImageRemoved(true)
                    setEditImagePreview(null)
                  }}
                  disabled={busy}
                />
                <div className="flex items-center justify-end gap-3 pt-4 border-t">
                  <Button variant="ghost" onClick={cancelEditing} disabled={busy}>
                    Cancel
                  </Button>
                  <Button onClick={handleUpdate} disabled={busy} className="gap-2">
                    {busy ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                    Save Changes
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="shadow-sm overflow-hidden border-border/40">
        <CardHeader className="bg-muted/30">
          <CardTitle className="text-xl font-serif">Product Categories</CardTitle>
          <CardDescription>
            You have {categories.length} categories in total.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {sortedCategories.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center">
              <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
                <AlertCircle className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground">No categories found.</p>
              <Button variant="link" onClick={() => setIsAdding(true)}>Create your first category</Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-[80px]">Image</TableHead>
                  <TableHead>Category Details</TableHead>
                  <TableHead className="hidden md:table-cell">Slug</TableHead>
                  <TableHead className="hidden md:table-cell text-right">Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedCategories.map((category) => (
                  <TableRow key={category.id} className="group transition-colors duration-200">
                    <TableCell>
                      <div className="relative h-12 w-12 overflow-hidden rounded-md border border-border bg-muted flex items-center justify-center">
                        {category.image_url ? (
                          <SafeImage
                            src={category.image_url}
                            alt={category.image_alt || category.name}
                            fill
                            className="object-cover"
                            sizes="48px"
                          />
                        ) : (
                          <ImageIcon className="h-4 w-4 text-muted-foreground/50" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-semibold text-foreground group-hover:text-primary transition-colors">
                          {category.name}
                        </span>
                        <span className="text-xs text-muted-foreground line-clamp-1 max-w-[200px] md:max-w-md">
                          {category.description || 'No description provided'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <code className="text-[10px] px-1.5 py-0.5 rounded bg-muted font-mono text-muted-foreground border">
                        {category.slug}
                      </code>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-right text-xs text-muted-foreground">
                      {category.created_at ? new Date(category.created_at).toLocaleDateString() : '—'}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => startEditing(category)}
                          className="h-8 w-8 text-muted-foreground hover:text-primary"
                          disabled={busy}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(category)}
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          disabled={busy}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

