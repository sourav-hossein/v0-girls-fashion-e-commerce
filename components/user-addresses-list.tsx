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
        throw new Error(data?.message || 'Failed to load addresses')
      }

      setAddresses(data || [])
    } catch (error) {
      console.error('Error fetching addresses:', error)
      toast.error('Failed to load addresses')
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
          throw new Error(data?.message || 'Failed to update address')
        }
        toast.success('Address updated successfully')
      } else {
        const response = await fetch('/api/addresses', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(formData),
        })
        const data = await response.json()
        if (!response.ok) {
          throw new Error(data?.message || 'Failed to add address')
        }
        toast.success('Address added successfully')
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
      toast.error(error instanceof Error ? error.message : 'Failed to save address')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this address?')) return

    try {
      const response = await fetch(`/api/addresses?id=${id}`, {
        method: 'DELETE',
        credentials: 'include',
      })
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data?.message || 'Failed to delete address')
      }
      toast.success('Address deleted')
      fetchAddresses()
    } catch (error) {
      console.error('Error deleting address:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to delete address')
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
        throw new Error(data?.message || 'Failed to update default address')
      }
      toast.success('Default address updated')
      fetchAddresses()
    } catch (error) {
      console.error('Error updating default address:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to update default address')
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
    <div>
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-serif font-bold">Delivery Addresses</h2>
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
              Add Address
            </Button>
          </DialogTrigger>

          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{editingId ? 'Edit Address' : 'Add New Address'}</DialogTitle>
              <DialogDescription>
                {editingId ? 'Update your delivery address details' : 'Add a new delivery address for faster checkout'}
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="full_name">Full Name *</Label>
                <Input
                  id="full_name"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone_number">Phone Number *</Label>
                <Input
                  id="phone_number"
                  value={formData.phone_number}
                  onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="division">Division *</Label>
                <Select
                  value={formData.division_id}
                  onValueChange={(value) =>
                    setFormData({ ...formData, division_id: value, district_id: '', thana_id: '' })
                  }
                >
                  <SelectTrigger id="division">
                    <SelectValue placeholder="Select" />
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
                <Label htmlFor="district">District *</Label>
                <Select
                  value={formData.district_id}
                  onValueChange={(value) =>
                    setFormData({ ...formData, district_id: value, thana_id: '' })
                  }
                >
                  <SelectTrigger id="district">
                    <SelectValue placeholder="Select" />
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
                <Label htmlFor="thana">Thana/Upazila *</Label>
              <Select
                value={formData.thana_id}
                onValueChange={(value) => setFormData({ ...formData, thana_id: value })}
              >
                <SelectTrigger id="thana">
                  <SelectValue placeholder="Select" />
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
                <Label htmlFor="area">Area/Locality</Label>
                <Input
                  id="area"
                  value={formData.area}
                  onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                  placeholder="e.g., Block C, House 10"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="full_address">Full Address *</Label>
                <textarea
                  id="full_address"
                  value={formData.full_address}
                  onChange={(e) => setFormData({ ...formData, full_address: e.target.value })}
                  className="w-full px-3 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  rows={3}
                  placeholder="Complete address details"
                  required
                />
              </div>



              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Saving...' : editingId ? 'Update Address' : 'Add Address'}
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
              <p className="text-muted-foreground">No addresses saved yet</p>
              <p className="text-sm text-muted-foreground">Add your first delivery address</p>
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
                        Default Address
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
                    Set as Default
                  </Button>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
    </div>
  )
}
