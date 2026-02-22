'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { MapPin, Plus, Edit, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

interface Address {
  id: string
  label: string
  division: string
  district: string
  thana: string
  address: string
  isDefault: boolean
}

export default function AddressesPage() {
  const [addresses, setAddresses] = useState<Address[]>([
    {
      id: '1',
      label: 'Home',
      division: 'Dhaka',
      district: 'Dhaka',
      thana: 'Dhanmondi',
      address: '123 Home Street',
      isDefault: true,
    },
    {
      id: '2',
      label: 'Office',
      division: 'Dhaka',
      district: 'Dhaka',
      thana: 'Gulshan',
      address: '456 Office Avenue',
      isDefault: false,
    },
  ])

  const [isAddingNew, setIsAddingNew] = useState(false)
  const [newAddress, setNewAddress] = useState({
    label: '',
    division: '',
    district: '',
    thana: '',
    address: '',
  })

  const handleAddAddress = () => {
    if (
      !newAddress.label ||
      !newAddress.division ||
      !newAddress.district ||
      !newAddress.thana ||
      !newAddress.address
    ) {
      toast.error('Please fill in all fields')
      return
    }

    const address: Address = {
      id: Date.now().toString(),
      ...newAddress,
      isDefault: false,
    }

    setAddresses([...addresses, address])
    setNewAddress({
      label: '',
      division: '',
      district: '',
      thana: '',
      address: '',
    })
    setIsAddingNew(false)
    toast.success('Address added successfully')
  }

  const handleDeleteAddress = (id: string) => {
    setAddresses(addresses.filter((addr) => addr.id !== id))
    toast.success('Address deleted')
  }

  const handleSetDefault = (id: string) => {
    setAddresses(
      addresses.map((addr) => ({
        ...addr,
        isDefault: addr.id === id,
      }))
    )
    toast.success('Default address updated')
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-serif font-bold text-foreground">
            Saved Addresses
          </h1>
          <p className="text-muted-foreground mt-2">
            Manage your delivery addresses
          </p>
        </div>
        <Button
          onClick={() => setIsAddingNew(!isAddingNew)}
          className="bg-primary hover:bg-primary/90 gap-2"
        >
          <Plus className="w-4 h-4" />
          Add New
        </Button>
      </div>

      {/* Add New Address Form */}
      {isAddingNew && (
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle>Add New Address</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                placeholder="Label (Home, Office, etc.)"
                value={newAddress.label}
                onChange={(e) =>
                  setNewAddress({ ...newAddress, label: e.target.value })
                }
              />
              <Input
                placeholder="Division"
                value={newAddress.division}
                onChange={(e) =>
                  setNewAddress({ ...newAddress, division: e.target.value })
                }
              />
              <Input
                placeholder="District"
                value={newAddress.district}
                onChange={(e) =>
                  setNewAddress({ ...newAddress, district: e.target.value })
                }
              />
              <Input
                placeholder="Thana/Upazila"
                value={newAddress.thana}
                onChange={(e) =>
                  setNewAddress({ ...newAddress, thana: e.target.value })
                }
              />
            </div>
            <textarea
              className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              rows={2}
              placeholder="Full address"
              value={newAddress.address}
              onChange={(e) =>
                setNewAddress({ ...newAddress, address: e.target.value })
              }
            />
            <div className="flex gap-3">
              <Button
                onClick={handleAddAddress}
                className="bg-primary hover:bg-primary/90"
              >
                Save Address
              </Button>
              <Button
                variant="outline"
                onClick={() => setIsAddingNew(false)}
                className="border-border"
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Addresses List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {addresses.map((addr) => (
          <Card key={addr.id} className={`border-border ${addr.isDefault ? 'border-primary bg-primary/5' : ''}`}>
            <CardContent className="p-6 space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1">
                  <MapPin className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground">
                      {addr.label}
                    </h3>
                    {addr.isDefault && (
                      <Badge className="mt-2 bg-primary/20 text-primary">
                        Default
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              <p className="text-sm text-muted-foreground">
                {addr.address}
                <br />
                {addr.thana}, {addr.district}, {addr.division}
              </p>

              <div className="flex gap-2 pt-4 border-t border-border">
                {!addr.isDefault && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleSetDefault(addr.id)}
                    className="flex-1 border-border"
                  >
                    Set Default
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground"
                >
                  <Edit className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-destructive"
                  onClick={() => handleDeleteAddress(addr.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
