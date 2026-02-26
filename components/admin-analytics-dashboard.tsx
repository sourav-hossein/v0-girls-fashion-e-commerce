'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid } from 'recharts'

type AnalyticsResponse = {
  range: string
  kpis: {
    revenue: number
    orders: number
    aov: number
    cod_share: number
    payment_success_rate: number
  }
  trend: Array<{ date: string; revenue: number; orders: number }>
  top_products: Array<{ product_id: string; name: string; slug: string; revenue: number; quantity: number }>
  inventory: { low_stock: number; out_of_stock: number }
  funnel: Array<{ event: string; sessions: number }>
}

const RANGE_OPTIONS = [
  { label: 'Last 7 days', value: '7d' },
  { label: 'Last 30 days', value: '30d' },
  { label: 'Month to date', value: 'mtd' },
]

export default function AdminAnalyticsDashboard() {
  const [range, setRange] = useState('30d')
  const [data, setData] = useState<AnalyticsResponse | null>(null)
  const [loading, setLoading] = useState(false)

  const fetchAnalytics = async (selectedRange: string) => {
    setLoading(true)
    try {
      const response = await fetch(`/api/admin/analytics?range=${selectedRange}`)
      const payload = await response.json().catch(() => ({}))
      if (response.ok) {
        setData(payload)
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAnalytics(range)
  }, [range])

  const funnelData = useMemo(() => {
    if (!data) return []
    return data.funnel.map((item) => ({
      label: item.event.replace('_', ' '),
      sessions: item.sessions,
    }))
  }, [data])

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-serif font-bold text-foreground">Analytics</h1>
          <p className="text-muted-foreground mt-1">
            Full funnel insights for your store
          </p>
        </div>
        <div className="flex gap-2">
          {RANGE_OPTIONS.map((option) => (
            <Button
              key={option.value}
              variant={range === option.value ? 'default' : 'outline'}
              onClick={() => setRange(option.value)}
            >
              {option.label}
            </Button>
          ))}
        </div>
      </div>

      {loading || !data ? (
        <p className="text-sm text-muted-foreground">Loading analytics...</p>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="text-sm text-muted-foreground">Revenue</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-foreground">৳{Math.round(data.kpis.revenue)}</p>
              </CardContent>
            </Card>
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="text-sm text-muted-foreground">Orders</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-foreground">{data.kpis.orders}</p>
              </CardContent>
            </Card>
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="text-sm text-muted-foreground">Avg Order Value</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-foreground">৳{Math.round(data.kpis.aov)}</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="border-border">
              <CardHeader>
                <CardTitle>Revenue & Orders Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    revenue: { label: 'Revenue', color: 'var(--color-chart-1)' },
                    orders: { label: 'Orders', color: 'var(--color-chart-2)' },
                  }}
                >
                  <LineChart data={data.trend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line type="monotone" dataKey="revenue" stroke="var(--color-revenue)" strokeWidth={2} />
                    <Line type="monotone" dataKey="orders" stroke="var(--color-orders)" strokeWidth={2} />
                    <ChartLegend content={<ChartLegendContent />} />
                  </LineChart>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardHeader>
                <CardTitle>Funnel</CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    sessions: { label: 'Sessions', color: 'var(--color-chart-3)' },
                  }}
                >
                  <BarChart data={funnelData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="label" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="sessions" fill="var(--color-sessions)" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="border-border lg:col-span-2">
              <CardHeader>
                <CardTitle>Top Products</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {data.top_products.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No product sales in this range.</p>
                ) : (
                  data.top_products.map((item) => (
                    <div key={item.product_id} className="flex items-center justify-between border-b border-border/60 pb-2">
                      <div>
                        <p className="font-medium text-foreground">{item.name}</p>
                        <p className="text-xs text-muted-foreground">{item.slug}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-foreground">৳{Math.round(item.revenue)}</p>
                        <p className="text-xs text-muted-foreground">{item.quantity} units</p>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardHeader>
                <CardTitle>Inventory Alerts</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Low stock</span>
                  <Badge variant="outline">{data.inventory.low_stock}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Out of stock</span>
                  <Badge variant="outline">{data.inventory.out_of_stock}</Badge>
                </div>
                <div className="pt-2">
                  <p className="text-xs text-muted-foreground">
                    COD share: {data.kpis.cod_share.toFixed(1)}%
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Payment success: {data.kpis.payment_success_rate.toFixed(1)}%
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  )
}
