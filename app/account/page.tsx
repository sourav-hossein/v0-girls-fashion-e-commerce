'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { User, Mail, Phone, MapPin, ExternalLink } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { toast } from 'sonner'
import { useT } from '@/hooks/use-t'

export default function AccountDashboard() {
  const { t } = useT()
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
        toast.error(error.message || t('account.loadFailed'))
      } finally {
        setLoading(false)
      }
    }

    loadAccount()
  }, [t])

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
      toast.success(t('account.profileUpdated'))
      setIsEditing(false)
    } catch (error: any) {
      toast.error(error.message || t('account.profileUpdateFailed'))
    } finally {
      setIsSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-serif font-bold text-foreground mb-2">{t('account.profileTitle')}</h1>
          <p className="text-muted-foreground">{t('account.loadingAccount')}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-serif font-bold text-foreground mb-2">
          {t('account.profileTitle')}
        </h1>
        <p className="text-muted-foreground">
          {t('account.profileSubtitle')}
        </p>
      </div>

      <Card className="border-border">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 border-b border-border">
          <CardTitle>{t('account.personalInfo')}</CardTitle>
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
            {isSaving ? t('account.saving') : isEditing ? t('common.save') : t('common.edit')}
          </Button>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                <User className="w-4 h-4" />
                {t('forms.fullName')}
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

            <div>
              <label className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                <Mail className="w-4 h-4" />
                {t('auth.email')}
              </label>
              <Input
                type="email"
                value={userData.email}
                disabled
                className="bg-muted border-muted"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                <Phone className="w-4 h-4" />
                {t('forms.phoneNumber')}
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

      <Card className="border-border">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 border-b border-border">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-primary" />
            <CardTitle>{t('addresses.title')}</CardTitle>
          </div>
          <Button asChild variant="outline" className="gap-2">
            <Link href="/account/addresses">
              {t('account.manage')}
              <ExternalLink className="w-4 h-4" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">
                {t('addresses.pageDescription')}
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-primary">{stats.addresses}</div>
              <p className="text-xs text-muted-foreground">{t('account.saved')}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-border">
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-primary mb-1">{stats.orders}</div>
            <p className="text-muted-foreground text-sm">{t('account.totalOrders')}</p>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-accent mb-1">{stats.wishlist}</div>
            <p className="text-muted-foreground text-sm">{t('account.wishlistItems')}</p>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-secondary mb-1">{stats.addresses}</div>
            <p className="text-muted-foreground text-sm">{t('account.savedAddresses')}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
