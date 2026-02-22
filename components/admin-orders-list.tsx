'use client'

import Link from 'next/link'
import { Order } from '@/lib/types'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Eye, Edit } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

interface AdminOrdersListProps {
  orders: Order[]
}

export default function AdminOrdersList({ orders }: AdminOrdersListProps) {
  const [selectedStatus, setSelectedStatus] = useState<{ [key: string]: string }>({})
  const [isSaving, setIsSaving] = useState<string | null>(null)

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    setIsSaving(orderId)
    try {
      // In a real app, update order status
      // await updateOrderStatus(orderId, newStatus)
      setSelectedStatus((prev) => ({ ...prev, [orderId]: newStatus }))
      toast.success('Order status updated')
    } catch (error) {
      toast.error('Failed to update order')
    } finally {
      setIsSaving(null)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-950'
      case 'confirmed':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-950'
      case 'shipped':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-950'
      case 'delivered':
        return 'bg-green-100 text-green-800 dark:bg-green-950'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-950'
    }
  }

  const getPaymentColor = (status: string) => {
    return status === 'completed'
      ? 'bg-green-100 text-green-800 dark:bg-green-950'
      : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-950'
  }

  return (
    <Card className="border-border overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              <TableHead>Order #</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead>Order Status</TableHead>
              <TableHead>Payment</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.length > 0 ? (
              orders.map((order) => (
                <TableRow key={order.id} className="border-border hover:bg-muted/50">
                  <TableCell>
                    <p className="font-medium text-foreground">
                      {order.order_number}
                    </p>
                  </TableCell>
                  <TableCell className="text-right font-semibold text-primary">
                    ৳{order.total_amount}
                  </TableCell>
                  <TableCell>
                    <Select
                      value={
                        selectedStatus[order.id] || order.status
                      }
                      onValueChange={(value) =>
                        handleStatusChange(order.id, value)
                      }
                      disabled={isSaving === order.id}
                    >
                      <SelectTrigger className="w-32 h-8 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="confirmed">Confirmed</SelectItem>
                        <SelectItem value="shipped">Shipped</SelectItem>
                        <SelectItem value="delivered">Delivered</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Badge className={getPaymentColor(order.payment_status)}>
                      {order.payment_status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {new Date(order.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Link href={`/admin/orders/${order.id}`}>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-muted-foreground hover:text-foreground"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </Link>
                      <Link href={`/admin/orders/${order.id}/edit`}>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-muted-foreground hover:text-foreground"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                      </Link>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  <p className="text-muted-foreground">No orders found</p>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </Card>
  )
}
