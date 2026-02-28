'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { toast } from 'sonner'
import { MapPin, Trash2, Check, Plus, Edit2 } from 'lucide-react'
import {
  divisions,
  districtsByDivisionId,
  thanasByDistrictId,
  getDivisionName,
  getDistrictName,
  getThanaName,
} from '@/lib/geo-data'
import { useT } from '@/hooks/use-t'

interface UserAddress {
  id: string
  full_name: string
  phone_number: string
  division_id: string
  district_id: string
  thana_id: string
  area?: string
  full_address: string
  is_default: boolean
}

export function UserAddressesList() {
  const { t } = useT()
  const [addresses, setAddresses] = useState<UserAddress[]>([])
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    full_name: '',
    phone_number: '',
    division_id: '',
    district_id: '',
    thana_id: '',
    area: '',
    full_address: '',
  })

  useEffect(() => {
    fetchAddresses()
  }, [])

  const fetchAddresses = async () => {
    try {
      const response = await fetch('/api/addresses', { credentials: 'include' })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data?.message || t('addresses.loadFailed'))
      }

      setAddresses(data || [])
    } catch (error) {
      console.error('Error fetching addresses:', error)
      toast.error(t('addresses.loadFailed'))
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (editingId) {
        const response = await fetch('/api/addresses', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ id: editingId, ...formData }),
        })
        const data = await response.json()
        if (!response.ok) {
          throw new Error(data?.message || t('addresses.updateFailed'))
        }
        toast.success(t('addresses.updated'))
      } else {
        const response = await fetch('/api/addresses', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(formData),
        })
        const data = await response.json()
        if (!response.ok) {
          throw new Error(data?.message || t('addresses.addFailed'))
        }
        toast.success(t('addresses.added'))
      }

      setOpen(false)
      setEditingId(null)
      setFormData({
        full_name: '',
        phone_number: '',
        division_id: '',
        district_id: '',
        thana_id: '',
        area: '',
        full_address: '',
      })

      fetchAddresses()
    } catch (error) {
      console.error('Error saving address:', error)
      toast.error(error instanceof Error ? error.message : t('addresses.saveFailed'))
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm(t('addresses.confirmDelete'))) return

    try {
      const response = await fetch(`/api/addresses?id=${id}`, {
        method: 'DELETE',
        credentials: 'include',
      })
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data?.message || t('addresses.deleteFailed'))
      }
      toast.success(t('addresses.deleted'))
      fetchAddresses()
    } catch (error) {
      console.error('Error deleting address:', error)
      toast.error(error instanceof Error ? error.message : t('addresses.deleteFailed'))
    }
  }

  const handleSetDefault = async (id: string) => {
    try {
      const response = await fetch('/api/addresses', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ id, set_default: true }),
      })
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data?.message || t('addresses.defaultFailed'))
      }
      toast.success(t('addresses.defaultUpdated'))
      fetchAddresses()
    } catch (error) {
      console.error('Error updating default address:', error)
      toast.error(error instanceof Error ? error.message : t('addresses.defaultFailed'))
    }
  }

  const handleEdit = (address: UserAddress) => {
    setFormData({
      full_name: address.full_name,
      phone_number: address.phone_number,
      division_id: address.division_id,
      district_id: address.district_id,
      thana_id: address.thana_id,
      area: address.area || '',
      full_address: address.full_address,
    })
    setEditingId(address.id)
    setOpen(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-serif font-bold">{t('addresses.title')}</h2>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                setEditingId(null)
                setFormData({
                  full_name: '',
                  phone_number: '',
                  division_id: '',
                  district_id: '',
                  thana_id: '',
                  area: '',
                  full_address: '',
                })
              }}
              className="bg-gradient-to-r from-primary to-accent"
            >
              <Plus className="w-4 h-4 mr-2" />
              {t('addresses.addAddress')}
            </Button>
          </DialogTrigger>

          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{editingId ? t('addresses.editAddress') : t('addresses.addNewAddress')}</DialogTitle>
              <DialogDescription>
                {editingId ? t('addresses.editDescription') : t('addresses.addDescription')}
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="full_name">{t('forms.fullName')} *</Label>
                <Input
                  id="full_name"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone_number">{t('forms.phoneNumber')} *</Label>
                <Input
                  id="phone_number"
                  value={formData.phone_number}
                  onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="division">{t('forms.division')} *</Label>
                  <Select
                    value={formData.division_id}
                    onValueChange={(value) =>
                      setFormData({ ...formData, division_id: value, district_id: '', thana_id: '' })
                    }
                  >
                    <SelectTrigger id="division">
                      <SelectValue placeholder={t('common.select')} />
                    </SelectTrigger>
                    <SelectContent>
                      {divisions.map((div) => (
                        <SelectItem key={div.id} value={div.id}>
                          {div.name_en}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="district">{t('forms.district')} *</Label>
                  <Select
                    value={formData.district_id}
                    onValueChange={(value) =>
                      setFormData({ ...formData, district_id: value, thana_id: '' })
                    }
                  >
                    <SelectTrigger id="district">
                      <SelectValue placeholder={t('common.select')} />
                    </SelectTrigger>
                    <SelectContent>
                      {formData.division_id &&
                        districtsByDivisionId[formData.division_id]?.map((dist) => (
                          <SelectItem key={dist.id} value={dist.id}>
                            {dist.name_en}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="thana">{t('forms.thana')} *</Label>
                <Select
                  value={formData.thana_id}
                  onValueChange={(value) => setFormData({ ...formData, thana_id: value })}
                >
                  <SelectTrigger id="thana">
                    <SelectValue placeholder={t('common.select')} />
                  </SelectTrigger>
                  <SelectContent>
                    {formData.district_id &&
                      thanasByDistrictId[formData.district_id]?.map((thana) => (
                        <SelectItem key={thana.id} value={thana.id}>
                          {thana.name_en}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="area">{t('forms.area')}</Label>
                <Input
                  id="area"
                  value={formData.area}
                  onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                  placeholder={t('checkout.areaPlaceholder')}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="full_address">{t('forms.fullAddress')} *</Label>
                <textarea
                  id="full_address"
                  value={formData.full_address}
                  onChange={(e) => setFormData({ ...formData, full_address: e.target.value })}
                  className="w-full px-3 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  rows={3}
                  placeholder={t('checkout.addressPlaceholder')}
                  required
                />
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? t('addresses.saving') : editingId ? t('addresses.updateAddress') : t('addresses.addAddress')}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {addresses.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <MapPin className="w-12 h-12 text-muted-foreground/30 mb-3" />
              <p className="text-muted-foreground">{t('addresses.noAddressesTitle')}</p>
              <p className="text-sm text-muted-foreground">{t('addresses.noAddressesBody')}</p>
            </CardContent>
          </Card>
        ) : (
          addresses.map((address) => (
            <Card key={address.id} className={address.is_default ? 'border-primary/50 bg-primary/5' : ''}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{address.full_name}</CardTitle>
                    {address.is_default && (
                      <span className="inline-flex items-center gap-1 mt-1 text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded">
                        <Check className="w-3 h-3" />
                        {t('addresses.defaultAddress')}
                      </span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(address)}
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-destructive hover:bg-destructive/10"
                      onClick={() => handleDelete(address.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-2">
                <p className="text-sm">{address.phone_number}</p>
                <p className="text-sm text-muted-foreground">
                  {address.full_address}
                  {address.area && `, ${address.area}`}
                </p>
                <p className="text-sm text-muted-foreground">
                  {getThanaName(address.thana_id)}, {getDistrictName(address.district_id)}, {getDivisionName(address.division_id)}
                </p>

                {!address.is_default && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mt-2 text-primary"
                    onClick={() => handleSetDefault(address.id)}
                  >
                    <Check className="w-4 h-4 mr-2" />
                    {t('addresses.setDefault')}
                  </Button>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
