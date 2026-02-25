'use client'

import { useMemo, useState, type FormEvent } from 'react'
import { Category } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Check, Pencil, Plus, RefreshCw, Trash2, X } from 'lucide-react'

type CategoryForm = {
  name: string
  slug: string
  description: string
  image_url: string
}

const emptyForm: CategoryForm = {
  name: '',
  slug: '',
  description: '',
  image_url: '',
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
  const [createForm, setCreateForm] = useState<CategoryForm>(emptyForm)
  const [createSlugEdited, setCreateSlugEdited] = useState(false)
  const [editing, setEditing] = useState<Category | null>(null)
  const [editForm, setEditForm] = useState<CategoryForm>(emptyForm)
  const [editSlugEdited, setEditSlugEdited] = useState(false)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  const sortedCategories = useMemo(() => {
    return [...categories].sort((a, b) => a.name.localeCompare(b.name))
  }, [categories])

  const applyCreateName = (value: string) => {
    setCreateForm(prev => ({
      ...prev,
      name: value,
      slug: createSlugEdited ? prev.slug : slugify(value),
    }))
  }

  const applyEditName = (value: string) => {
    setEditForm(prev => ({
      ...prev,
      name: value,
      slug: editSlugEdited ? prev.slug : slugify(value),
    }))
  }

  const handleCreate = async (event: FormEvent) => {
    event.preventDefault()
    setMessage(null)
    setBusy(true)
    try {
      const response = await fetch('/api/admin/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(createForm),
      })
      if (!response.ok) {
        const payload = await response.json().catch(() => ({}))
        throw new Error(payload?.error || 'Failed to create category')
      }
      const payload = await response.json()
      setCategories(prev => [payload.category, ...prev])
      setCreateForm(emptyForm)
      setCreateSlugEdited(false)
      setMessage('Category created.')
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Something went wrong.')
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
      image_url: category.image_url || '',
    })
    setEditSlugEdited(false)
    setMessage(null)
  }

  const cancelEditing = () => {
    setEditing(null)
    setEditForm(emptyForm)
    setEditSlugEdited(false)
  }

  const handleUpdate = async () => {
    if (!editing) return
    setMessage(null)
    setBusy(true)
    try {
      const response = await fetch(`/api/admin/categories/${editing.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      })
      if (!response.ok) {
        const payload = await response.json().catch(() => ({}))
        throw new Error(payload?.error || 'Failed to update category')
      }
      const payload = await response.json()
      setCategories(prev =>
        prev.map(item => (item.id === editing.id ? payload.category : item)),
      )
      setEditing(null)
      setEditForm(emptyForm)
      setEditSlugEdited(false)
      setMessage('Category updated.')
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Something went wrong.')
    } finally {
      setBusy(false)
    }
  }

  const handleDelete = async (category: Category) => {
    if (!confirm(`Delete "${category.name}"? This cannot be undone.`)) return
    setMessage(null)
    setBusy(true)
    try {
      const response = await fetch(`/api/admin/categories/${category.id}`, {
        method: 'DELETE',
      })
      if (!response.ok) {
        const payload = await response.json().catch(() => ({}))
        throw new Error(payload?.error || 'Failed to delete category')
      }
      setCategories(prev => prev.filter(item => item.id !== category.id))
      if (editing?.id === category.id) cancelEditing()
      setMessage('Category deleted.')
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Something went wrong.')
    } finally {
      setBusy(false)
    }
  }

  const handleRefresh = async () => {
    setMessage(null)
    setBusy(true)
    try {
      const response = await fetch('/api/admin/categories')
      if (!response.ok) {
        const payload = await response.json().catch(() => ({}))
        throw new Error(payload?.error || 'Failed to refresh categories')
      }
      const payload = await response.json()
      setCategories(payload.categories || [])
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Something went wrong.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="text-xl font-serif">Add Category</CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={busy}
            className="gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4 md:grid-cols-2" onSubmit={handleCreate}>
            <div className="space-y-2">
              <label className="text-sm font-medium">Name</label>
              <Input
                value={createForm.name}
                onChange={event => applyCreateName(event.target.value)}
                placeholder="Hijabs"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Slug</label>
              <Input
                value={createForm.slug}
                onChange={event => {
                  setCreateSlugEdited(true)
                  setCreateForm(prev => ({ ...prev, slug: event.target.value }))
                }}
                placeholder="hijabs"
                required
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium">Image URL</label>
              <Input
                value={createForm.image_url}
                onChange={event =>
                  setCreateForm(prev => ({ ...prev, image_url: event.target.value }))
                }
                placeholder="https://..."
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium">Description</label>
              <Textarea
                value={createForm.description}
                onChange={event =>
                  setCreateForm(prev => ({ ...prev, description: event.target.value }))
                }
                placeholder="Optional description"
                rows={3}
              />
            </div>
            <div className="md:col-span-2 flex items-center gap-3">
              <Button type="submit" disabled={busy} className="gap-2">
                <Plus className="h-4 w-4" />
                Add Category
              </Button>
              {message ? <span className="text-sm text-muted-foreground">{message}</span> : null}
            </div>
          </form>
        </CardContent>
      </Card>

      {editing ? (
        <Card>
          <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="text-xl font-serif">Edit Category</CardTitle>
            <Button variant="ghost" size="sm" onClick={cancelEditing} className="gap-2">
              <X className="h-4 w-4" />
              Cancel
            </Button>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Name</label>
              <Input
                value={editForm.name}
                onChange={event => applyEditName(event.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Slug</label>
              <Input
                value={editForm.slug}
                onChange={event => {
                  setEditSlugEdited(true)
                  setEditForm(prev => ({ ...prev, slug: event.target.value }))
                }}
                required
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium">Image URL</label>
              <Input
                value={editForm.image_url}
                onChange={event =>
                  setEditForm(prev => ({ ...prev, image_url: event.target.value }))
                }
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium">Description</label>
              <Textarea
                value={editForm.description}
                onChange={event =>
                  setEditForm(prev => ({ ...prev, description: event.target.value }))
                }
                rows={3}
              />
            </div>
            <div className="md:col-span-2 flex items-center gap-3">
              <Button onClick={handleUpdate} disabled={busy} className="gap-2">
                <Check className="h-4 w-4" />
                Save Changes
              </Button>
              <Button variant="outline" onClick={cancelEditing} disabled={busy}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-serif">All Categories</CardTitle>
        </CardHeader>
        <CardContent>
          {sortedCategories.length === 0 ? (
            <p className="text-muted-foreground">No categories yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Image</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedCategories.map(category => (
                  <TableRow key={category.id}>
                    <TableCell className="font-medium">{category.name}</TableCell>
                    <TableCell>{category.slug}</TableCell>
                    <TableCell className="max-w-[280px] truncate">
                      {category.description || '—'}
                    </TableCell>
                    <TableCell className="max-w-[220px] truncate">
                      {category.image_url || '—'}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => startEditing(category)}
                          className="gap-2"
                        >
                          <Pencil className="h-4 w-4" />
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(category)}
                          className="gap-2 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                          Delete
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
