'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'

type Customer = {
  id: string
  full_name?: string | null
  phone_number?: string | null
  phone_verified?: boolean | null
  created_at?: string | null
  last_login?: string | null
  role?: string | null
  is_blocked?: boolean | null
  blocked_reason?: string | null
}

type Order = {
  id: string
  order_number: string
  status: string
  total_amount: number
  created_at: string
}

type Address = {
  id: string
  full_address: string
  phone_number: string
  division_id: string
  district_id: string
  thana_id: string
  area?: string | null
}

interface AdminCustomersManagerProps {
  initialCustomers: Customer[]
}

export default function AdminCustomersManager({ initialCustomers }: AdminCustomersManagerProps) {
  const [customers, setCustomers] = useState<Customer[]>(initialCustomers)
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState<Customer | null>(null)
  const [orders, setOrders] = useState<Order[]>([])
  const [addresses, setAddresses] = useState<Address[]>([])
  const [note, setNote] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const response = await fetch(`/api/admin/customers?q=${encodeURIComponent(query)}`)
        const data = await response.json()
        if (!response.ok) {
          throw new Error(data?.error || 'Failed to load customers')
        }
        setCustomers(data.customers || [])
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Failed to load customers')
      } finally {
        setLoading(false)
      }
    }

    const handle = setTimeout(load, 300)
    return () => clearTimeout(handle)
  }, [query])

  const loadDetails = async (customer: Customer) => {
    setSelected(customer)
    setNote(customer.blocked_reason || '')
    setOrders([])
    setAddresses([])
    try {
      const response = await fetch(`/api/admin/customers/${customer.id}`)
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data?.error || 'Failed to load customer details')
      }
      setOrders(data.orders || [])
      setAddresses(data.addresses || [])
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to load customer details')
    }
  }

  const handleBlockToggle = async () => {
    if (!selected) return
    try {
      const response = await fetch(`/api/admin/customers/${selected.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          is_blocked: !selected.is_blocked,
          blocked_reason: note,
        }),
      })
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data?.error || 'Failed to update customer')
      }
      setSelected(data.customer)
      setCustomers((prev) => prev.map((c) => (c.id === data.customer.id ? data.customer : c)))
      toast.success('Customer updated')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update customer')
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Card className="border-border">
        <CardHeader className="border-b border-border">
          <CardTitle>Customers</CardTitle>
          <Input
            placeholder="Search by name or phone"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-border">
            {loading ? (
              <div className="p-4 text-sm text-muted-foreground">Loading...</div>
            ) : customers.length === 0 ? (
              <div className="p-4 text-sm text-muted-foreground">No customers found.</div>
            ) : (
              customers.map((customer) => (
                <button
                  key={customer.id}
                  type="button"
                  onClick={() => loadDetails(customer)}
                  className="w-full text-left p-4 hover:bg-muted/50"
                >
                  <p className="font-medium">{customer.full_name || 'Unnamed Customer'}</p>
                  <p className="text-xs text-muted-foreground">{customer.phone_number || 'No phone'}</p>
                  <div className="mt-2 flex gap-2">
                    {customer.phone_verified && <Badge variant="secondary">Phone Verified</Badge>}
                    {customer.is_blocked && <Badge variant="destructive">Blocked</Badge>}
                  </div>
                </button>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      <div className="lg:col-span-2 space-y-6">
        <Card className="border-border">
          <CardHeader className="border-b border-border">
            <CardTitle>Customer Detail</CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            {!selected ? (
              <p className="text-sm text-muted-foreground">Select a customer to view details.</p>
            ) : (
              <>
                <div>
                  <p className="text-sm text-muted-foreground">Name</p>
                  <p className="font-medium">{selected.full_name || 'Unnamed Customer'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <p className="font-medium">{selected.phone_number || 'No phone'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Created</p>
                  <p className="font-medium">
                    {selected.created_at ? new Date(selected.created_at).toLocaleDateString() : '-'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Last Login</p>
                  <p className="font-medium">
                    {selected.last_login ? new Date(selected.last_login).toLocaleDateString() : '-'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Block Reason</p>
                  <Textarea value={note} onChange={(e) => setNote(e.target.value)} />
                </div>
                <Button onClick={handleBlockToggle}>
                  {selected.is_blocked ? 'Unblock Customer' : 'Block Customer'}
                </Button>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader className="border-b border-border">
            <CardTitle>Orders</CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-3">
            {orders.length === 0 ? (
              <p className="text-sm text-muted-foreground">No orders found.</p>
            ) : (
              orders.map((order) => (
                <div key={order.id} className="text-sm flex justify-between">
                  <div>
                    <p className="font-medium">{order.order_number}</p>
                    <p className="text-muted-foreground">{order.status}</p>
                  </div>
                  <div className="font-medium">৳{order.total_amount}</div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader className="border-b border-border">
            <CardTitle>Addresses</CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-3">
            {addresses.length === 0 ? (
              <p className="text-sm text-muted-foreground">No addresses found.</p>
            ) : (
              addresses.map((address) => (
                <div key={address.id} className="text-sm">
                  <p className="font-medium">{address.full_address}</p>
                  <p className="text-muted-foreground">{address.phone_number}</p>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
