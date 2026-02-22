'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Bell, Lock, Eye, EyeOff } from 'lucide-react'
import { toast } from 'sonner'

export default function SettingsPage() {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  })

  const [notifications, setNotifications] = useState({
    orderUpdates: true,
    newProducts: true,
    promotions: false,
    newsletter: true,
  })

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault()

    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error('Please fill in all password fields')
      return
    }

    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match')
      return
    }

    if (newPassword.length < 8) {
      toast.error('Password must be at least 8 characters')
      return
    }

    // In a real app, verify current password and update
    toast.success('Password changed successfully')
    setCurrentPassword('')
    setNewPassword('')
    setConfirmPassword('')
  }

  const handleNotificationChange = (key: keyof typeof notifications) => {
    setNotifications((prev) => ({
      ...prev,
      [key]: !prev[key],
    }))
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-serif font-bold text-foreground">
          Settings
        </h1>
        <p className="text-muted-foreground mt-2">
          Manage your account preferences
        </p>
      </div>

      {/* Change Password */}
      <Card className="border-border">
        <CardHeader className="border-b border-border">
          <CardTitle className="flex items-center gap-2">
            <Lock className="w-5 h-5" />
            Change Password
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleChangePassword} className="space-y-4">
            {/* Current Password */}
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Current Password
              </label>
              <div className="relative">
                <Input
                  type={showPasswords.current ? 'text' : 'password'}
                  placeholder="Enter current password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() =>
                    setShowPasswords((prev) => ({
                      ...prev,
                      current: !prev.current,
                    }))
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPasswords.current ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                New Password
              </label>
              <div className="relative">
                <Input
                  type={showPasswords.new ? 'text' : 'password'}
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() =>
                    setShowPasswords((prev) => ({
                      ...prev,
                      new: !prev.new,
                    }))
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPasswords.new ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Confirm Password
              </label>
              <div className="relative">
                <Input
                  type={showPasswords.confirm ? 'text' : 'password'}
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() =>
                    setShowPasswords((prev) => ({
                      ...prev,
                      confirm: !prev.confirm,
                    }))
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPasswords.confirm ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Password must be at least 8 characters long
              </p>
            </div>

            <Button
              type="submit"
              className="bg-primary hover:bg-primary/90"
            >
              Update Password
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Notification Preferences */}
      <Card className="border-border">
        <CardHeader className="border-b border-border">
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Notification Preferences
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          {/* Order Updates */}
          <label className="flex items-center gap-4 p-4 border border-border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
            <input
              type="checkbox"
              checked={notifications.orderUpdates}
              onChange={() => handleNotificationChange('orderUpdates')}
              className="w-4 h-4 rounded border-border"
            />
            <div className="flex-1">
              <p className="font-medium text-foreground">Order Updates</p>
              <p className="text-xs text-muted-foreground">
                Get notified about order status changes
              </p>
            </div>
            <Badge
              variant={notifications.orderUpdates ? 'default' : 'outline'}
            >
              {notifications.orderUpdates ? 'Enabled' : 'Disabled'}
            </Badge>
          </label>

          {/* New Products */}
          <label className="flex items-center gap-4 p-4 border border-border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
            <input
              type="checkbox"
              checked={notifications.newProducts}
              onChange={() => handleNotificationChange('newProducts')}
              className="w-4 h-4 rounded border-border"
            />
            <div className="flex-1">
              <p className="font-medium text-foreground">New Products</p>
              <p className="text-xs text-muted-foreground">
                Be notified about new arrivals in your favorite categories
              </p>
            </div>
            <Badge
              variant={notifications.newProducts ? 'default' : 'outline'}
            >
              {notifications.newProducts ? 'Enabled' : 'Disabled'}
            </Badge>
          </label>

          {/* Promotions */}
          <label className="flex items-center gap-4 p-4 border border-border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
            <input
              type="checkbox"
              checked={notifications.promotions}
              onChange={() => handleNotificationChange('promotions')}
              className="w-4 h-4 rounded border-border"
            />
            <div className="flex-1">
              <p className="font-medium text-foreground">Promotions</p>
              <p className="text-xs text-muted-foreground">
                Receive exclusive deals and special offers
              </p>
            </div>
            <Badge
              variant={notifications.promotions ? 'default' : 'outline'}
            >
              {notifications.promotions ? 'Enabled' : 'Disabled'}
            </Badge>
          </label>

          {/* Newsletter */}
          <label className="flex items-center gap-4 p-4 border border-border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
            <input
              type="checkbox"
              checked={notifications.newsletter}
              onChange={() => handleNotificationChange('newsletter')}
              className="w-4 h-4 rounded border-border"
            />
            <div className="flex-1">
              <p className="font-medium text-foreground">Newsletter</p>
              <p className="text-xs text-muted-foreground">
                Subscribe to our weekly newsletter
              </p>
            </div>
            <Badge
              variant={notifications.newsletter ? 'default' : 'outline'}
            >
              {notifications.newsletter ? 'Enabled' : 'Disabled'}
            </Badge>
          </label>

          <Button
            onClick={() => toast.success('Preferences updated')}
            className="w-full bg-primary hover:bg-primary/90"
          >
            Save Preferences
          </Button>
        </CardContent>
      </Card>

      {/* Account Actions */}
      <Card className="border-destructive/30 bg-destructive/5">
        <CardHeader className="border-b border-destructive/20">
          <CardTitle className="text-destructive">Danger Zone</CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <p className="text-sm text-muted-foreground">
            Be careful with these actions as they cannot be undone
          </p>
          <Button
            variant="outline"
            className="w-full border-destructive/50 text-destructive hover:bg-destructive/10"
          >
            Delete Account
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
