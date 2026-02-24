'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { User, Mail, Phone, MapPin } from 'lucide-react'
import { useState } from 'react'

export default function AccountDashboard() {
  const [isEditing, setIsEditing] = useState(false)
  const [userData, setUserData] = useState({
    fullName: 'Sample User',
    email: 'user@example.com',
    phoneNumber: '+88001xxxxxxxxx',
    division: 'Dhaka',
    district: 'Dhaka',
    thana: 'Dhanmondi',
    fullAddress: '123 Sample Street',
  })

  
  return (
    <div className="space-y-8">
      {/* Profile Header */}
      <div>
        <h1 className="text-3xl font-serif font-bold text-foreground mb-2">
          My Profile
        </h1>
        <p className="text-muted-foreground">
          Manage your account information
        </p>
      </div>

      {/* Personal Information */}
      <Card className="border-border">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 border-b border-border">
          <CardTitle>Personal Information</CardTitle>
          <Button
            variant="outline"
            onClick={() => setIsEditing(!isEditing)}
          >
            {isEditing ? 'Save' : 'Edit'}
          </Button>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Full Name */}
            <div>
              <label className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                <User className="w-4 h-4" />
                Full Name
              </label>
              <Input
                value={userData.fullName}
                onChange={(e) =>
                  setUserData({ ...userData, fullName: e.target.value })
                }
                disabled={!isEditing}
                className={isEditing ? '' : 'bg-muted border-muted'}
              />
            </div>

            {/* Email */}
            <div>
              <label className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Email
              </label>
              <Input
                type="email"
                value={userData.email}
                onChange={(e) =>
                  setUserData({ ...userData, email: e.target.value })
                }
                disabled={!isEditing}
                className={isEditing ? '' : 'bg-muted border-muted'}
              />
            </div>

            {/* Phone */}
            <div>
              <label className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                <Phone className="w-4 h-4" />
                Phone Number
              </label>
              <Input
                value={userData.phoneNumber}
                onChange={(e) =>
                  setUserData({ ...userData, phoneNumber: e.target.value })
                }
                disabled={!isEditing}
                className={isEditing ? '' : 'bg-muted border-muted'}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Address Information */}
      <Card className="border-border">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 border-b border-border">
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Address Information
          </CardTitle>
          <Button
            variant="outline"
            onClick={() => setIsEditing(!isEditing)}
          >
            {isEditing ? 'Save' : 'Edit'}
          </Button>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
            {/* Division */}
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Division
              </label>
              <Input
                value={userData.division}
                onChange={(e) =>
                  setUserData({ ...userData, division: e.target.value })
                }
                disabled={!isEditing}
                className={isEditing ? '' : 'bg-muted border-muted'}
              />
            </div>

            {/* District */}
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                District
              </label>
              <Input
                value={userData.district}
                onChange={(e) =>
                  setUserData({ ...userData, district: e.target.value })
                }
                disabled={!isEditing}
                className={isEditing ? '' : 'bg-muted border-muted'}
              />
            </div>

            {/* Thana */}
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Thana
              </label>
              <Input
                value={userData.thana}
                onChange={(e) =>
                  setUserData({ ...userData, thana: e.target.value })
                }
                disabled={!isEditing}
                className={isEditing ? '' : 'bg-muted border-muted'}
              />
            </div>
          </div>

          {/* Full Address */}
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">
              Full Address
            </label>
            <textarea
              value={userData.fullAddress}
              onChange={(e) =>
                setUserData({ ...userData, fullAddress: e.target.value })
              }
              disabled={!isEditing}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
                isEditing
                  ? 'border-border'
                  : 'bg-muted border-muted'
              }`}
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-border">
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-primary mb-1">5</div>
            <p className="text-muted-foreground text-sm">Total Orders</p>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-accent mb-1">8</div>
            <p className="text-muted-foreground text-sm">Wishlist Items</p>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-secondary mb-1">3</div>
            <p className="text-muted-foreground text-sm">Saved Addresses</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
