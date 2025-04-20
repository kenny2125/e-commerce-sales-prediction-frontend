import * as React from "react"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

interface OrdersStats {
  totalOrders: number
  processingOrders: number
  paidOrders: number
  totalRevenue: number
}

export function OrdersAnalytics() {
  const [stats, setStats] = React.useState<OrdersStats | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  const formatCurrency = (value?: number | null) => {
    if (value == null) return 'PHP 0.00'
    return new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(value)
  }

  // Fetch analytics stats
  React.useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('token')
        if (!token) throw new Error('No authentication token')
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/orders/stats`, {
          headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
        })
        if (!res.ok) throw new Error('Failed to fetch stats')
        const data = await res.json()
        setStats(data)
      } catch (err) {
        console.error(err)
        setError('Failed to fetch analytics')
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [])

  if (loading) {
    return (
      <div className="flex h-[100px] w-full items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 mb-4 rounded-md bg-yellow-100 text-yellow-700">
        {error}
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <div className="border rounded-lg p-4 flex flex-col items-center justify-center h-32 bg-card text-card-foreground">
        <p className="text-sm text-muted-foreground">Total Orders</p>
        <p className="text-2xl font-bold">{stats?.totalOrders ?? '0'}</p>
      </div>
      <div className="border rounded-lg p-4 flex flex-col items-center justify-center h-32 bg-card text-card-foreground">
        <p className="text-sm text-muted-foreground">Processing Orders</p>
        <p className="text-2xl font-bold">{stats?.processingOrders ?? '0'}</p>
      </div>
      <div className="border rounded-lg p-4 flex flex-col items-center justify-center h-32 bg-card text-card-foreground">
        <p className="text-sm text-muted-foreground">Paid Orders</p>
        <p className="text-2xl font-bold">{stats?.paidOrders ?? '0'}</p>
      </div>
      <div className="border rounded-lg p-4 flex flex-col items-center justify-center h-32 bg-card text-card-foreground">
        <p className="text-sm text-muted-foreground">Total Revenue</p>
        <p className="text-2xl font-bold">{formatCurrency(stats?.totalRevenue)}</p>
      </div>
    </div>
  )
}