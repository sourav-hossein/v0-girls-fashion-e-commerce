'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { User, Mail, Phone, MapPin, ExternalLink } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { toast } from 'sonner'

export default function AccountDashboard() {
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    orders: 0,
    wishlist: 0,
    addresses: 0,
  })
  const [userData, setUserData] = useState({
    id: '',
    full_name: '',
    email: '',
    phoneNumber: '',
  })

  useEffect(() => {
    const loadAccount = async () => {
      try {
        const supabase = createClient()
        const { data: authData, error: authError } = await supabase.auth.getUser()
        if (authError || !authData.user) {
          throw new Error('Not authenticated')
        }

        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('id, full_name, phone_number')
          .eq('id', authData.user.id)
          .single()

        if (!profileError && profile) {
          setUserData({
            id: profile.id,
            full_name: profile.full_name || '',
            email: authData.user.email || '',
            phoneNumber: profile.phone_number || '',
          })
        } else {
          setUserData({
            id: authData.user.id,
            full_name: authData.user.user_metadata?.full_name || '',
            email: authData.user.email || '',
            phoneNumber: '',
          })
        }

        const [ordersRes, wishlistRes, addressRes] = await Promise.all([
          supabase
            .from('orders')
            .select('id', { count: 'exact', head: true })
            .eq('user_id', authData.user.id),
          supabase
            .from('wishlists')
            .select('id', { count: 'exact', head: true })
            .eq('user_id', authData.user.id),
          supabase
            .from('user_addresses')
            .select('id', { count: 'exact', head: true })
            .eq('user_id', authData.user.id),
        ])

        setStats({
          orders: ordersRes.count || 0,
          wishlist: wishlistRes.count || 0,
          addresses: addressRes.count || 0,
        })
      } catch (error: any) {
        toast.error(error.message || 'Failed to load account')
      } finally {
        setLoading(false)
      }
    }

    loadAccount()
  }, [])

  const handleSave = async () => {
    if (!userData.id) return
    setIsSaving(true)
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: userData.full_name,
          phone_number: userData.phoneNumber,
        })
        .eq('id', userData.id)

      if (error) throw error
      toast.success('Profile updated')
      setIsEditing(false)
    } catch (error: any) {
      toast.error(error.message || 'Failed to update profile')
    } finally {
      setIsSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-serif font-bold text-foreground mb-2">My Profile</h1>
          <p className="text-muted-foreground">Loading account...</p>
        </div>
      </div>
    )
  }

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
            onClick={() => {
              if (isEditing) {
                handleSave()
              } else {
                setIsEditing(true)
              }
            }}
            disabled={isSaving}
          >
            {isSaving ? 'Saving...' : isEditing ? 'Save' : 'Edit'}
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
                value={userData.full_name}
                onChange={(e) =>
                  setUserData({ ...userData, full_name: e.target.value })
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
                disabled
                className="bg-muted border-muted"
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

      {/* Addresses */}
      <Card className="border-border">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 border-b border-border">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-primary" />
            <CardTitle>Delivery Addresses</CardTitle>
          </div>
          <Button asChild variant="outline" className="gap-2">
            <Link href="/account/addresses">
              Manage
              <ExternalLink className="w-4 h-4" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">
                Manage your saved delivery addresses for faster checkout.
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-primary">{stats.addresses}</div>
              <p className="text-xs text-muted-foreground">Saved</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-border">
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-primary mb-1">{stats.orders}</div>
            <p className="text-muted-foreground text-sm">Total Orders</p>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-accent mb-1">{stats.wishlist}</div>
            <p className="text-muted-foreground text-sm">Wishlist Items</p>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-secondary mb-1">{stats.addresses}</div>
            <p className="text-muted-foreground text-sm">Saved Addresses</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
