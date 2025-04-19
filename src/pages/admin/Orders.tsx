"use client"

import * as React from "react"
import { toast } from "sonner"
import { useUser } from "@/contexts/UserContext"
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { ArrowUpDown, ChevronDown, MoreHorizontal, Loader2, ClipboardList } from "lucide-react"

import { Button } from "@/components/ui/button"
import { ScrollText } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export type Orders = {
  orderID: string
  paymentStatus: "Paid" | "Processing" | "Cancelled" | "Refunded",
  pickupStatus: "Claimed" | "Ready to Claim" | "Cancelled"
  customerName: string
  orderDate: string
  purchasedProduct: string
  totalAmount: number
}

export function Orders() {
  const [orders, setOrders] = React.useState<Orders[]>([])
  const [loading, setLoading] = React.useState(true)
  const { currentUser } = useUser()
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState({})
  const [stats, setStats] = React.useState<{ totalOrders: number; processingOrders: number; paidOrders: number; totalRevenue: number } | null>(null)
  const [statsLoading, setStatsLoading] = React.useState(true)
  const [statsError, setStatsError] = React.useState<string | null>(null)

  const formatCurrency = (value?: number | null) => {
    if (value == null) return 'PHP 0.00'
    return new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(value)
  }

  // Fetch orders
  React.useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem('token')
        if (!token) {
          throw new Error('No authentication token found')
        }

        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/orders`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          console.error('Failed to fetch orders:', {
            status: response.status,
            statusText: response.statusText,
            error: errorData
          })
          throw new Error('Failed to fetch orders')
        }

        const data = await response.json()
        setOrders(data)
      } catch (error) {
        console.error('Error fetching orders:', error)
        toast.error('Failed to fetch orders')
      } finally {
        setLoading(false)
      }
    }

    fetchOrders()
  }, [])

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
        setStatsError('Failed to fetch analytics')
      } finally {
        setStatsLoading(false)
      }
    }
    fetchStats()
  }, [])

  const columns: ColumnDef<Orders>[] = [
    {
      accessorKey: "orderID",
      header: "Order ID",
      cell: ({ row }) => (
        <div className="capitalize">{row.getValue("orderID")}</div>
      ),
    },
    {
      accessorKey: "paymentStatus",
      header: "Payment Status",
      cell: ({ row }) => (
        <div className="capitalize">{row.getValue("paymentStatus")}</div>
      ),
    },
    {
      accessorKey: "pickupStatus",
      header: "Pickup Status",
      cell: ({ row }) => (
        <div className="capitalize">{row.getValue("pickupStatus")}</div>
      ),
    },
    {
      accessorKey: "customerName",
      header: "Customer Name",
      cell: ({ row }) => (
        <div className="capitalize">{row.getValue("customerName")}</div>
      ),
    },
    {
      accessorKey: "orderDate",
      header: "Order Date",
      cell: ({ row }) => (
        <div className="capitalize">{row.getValue("orderDate")}</div>
      ),
    },
    {
      accessorKey: "purchasedProduct",
      header: "Purchased Products",
      cell: ({ row }) => (
        <div className="capitalize">{row.getValue("purchasedProduct")}</div>
      ),
    },
    {
      accessorKey: "totalAmount",
      header: () => <div className="text-right">Total Amount</div>,
      cell: ({ row }) => {
        const amount = parseFloat(row.getValue("totalAmount"))
        const formatted = new Intl.NumberFormat("en-PH", {
          style: "currency",
          currency: "PHP",
        }).format(amount)
        return <div className="text-right font-medium">{formatted}</div>
      },
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const order = row.original

        const handleUpdateStatus = async (status: string) => {
          try {
            const token = localStorage.getItem('token')
            if (!token) {
              throw new Error('No authentication token found')
            }

            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/orders/${order.orderID}/status`, {
              method: 'PUT',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ status })
            })
            
            if (!response.ok) {
              const errorData = await response.json().catch(() => ({}))
              console.error('Failed to update status:', {
                status: response.status,
                statusText: response.statusText,
                error: errorData
              })
              throw new Error('Failed to update status')
            }
            
            const updatedOrder = await response.json()
            setOrders(prev => prev.map(o => 
              o.orderID === order.orderID ? updatedOrder : o
            ))
            
            toast.success('Order status updated successfully')
          } catch (error) {
            console.error('Error updating order status:', error)
            toast.error('Failed to update order status')
          }
        }

        const handleDelete = async () => {
          try {
            const token = localStorage.getItem('token')
            if (!token) {
              throw new Error('No authentication token found')
            }

            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/orders/${order.orderID}`, {
              method: 'DELETE',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
              }
            })
            
            if (!response.ok) {
              const errorData = await response.json().catch(() => ({}))
              console.error('Failed to delete order:', {
                status: response.status,
                statusText: response.statusText,
                error: errorData
              })
              throw new Error('Failed to delete order')
            }
            
            setOrders(prev => prev.filter(o => o.orderID !== order.orderID))
            toast.success('Order deleted successfully')
          } catch (error) {
            console.error('Error deleting order:', error)
            toast.error('Failed to delete order')
          }
        }

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => navigator.clipboard.writeText(order.orderID)}
              >
                Copy order ID
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuLabel>Update Status</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => handleUpdateStatus("Processing")}>
                Mark as Processing
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleUpdateStatus("Paid")}>
                Mark as Paid
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleUpdateStatus("Ready to Claim")}>
                Mark as Ready to Claim
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleUpdateStatus("Claimed")}>
                Mark as Claimed
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleUpdateStatus("Cancelled")}>
                Mark as Cancelled
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={handleDelete}
                className="text-red-600"
              >
                Delete Order
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]

  const table = useReactTable({
    data: orders,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  })

  if (loading) {
    return (
      <div className="flex h-[200px] w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="w-full space-y-6">
      {/* Page header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-4">
          <ClipboardList className="text-primary" size="40px" />
          <div>
            <h1 className="text-2xl font-bold whitespace-nowrap">Orders</h1>
            <p className="text-sm text-muted-foreground">View and manage customer orders.</p>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
        <Button>Add Order</Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-full sm:w-auto">
                Columns <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[200px]">
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => {
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) =>
                        column.toggleVisibility(!!value)
                      }
                    >
                      {column.id}
                    </DropdownMenuCheckboxItem>
                  )
                })}
            </DropdownMenuContent>
          </DropdownMenu>
          <Input
            placeholder="Search customer name..."
            value={(table.getColumn("customerName")?.getFilterValue() as string) ?? ""}
            onChange={(event) =>
              table.getColumn("customerName")?.setFilterValue(event.target.value)
            }
            className="w-full sm:w-[300px]"
          />
          
        </div>
      </div>

      {/* Analytics insights */}
      {statsError && (
        <div className="p-4 mb-4 rounded-md bg-yellow-100 text-yellow-700">
          {statsError}
        </div>
      )}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="border rounded-lg p-4 flex flex-col items-center justify-center h-32 bg-card text-card-foreground">
          <p className="text-sm text-muted-foreground">Total Orders</p>
          <p className="text-2xl font-bold">{statsLoading ? '...' : stats?.totalOrders ?? '0'}</p>
        </div>
        <div className="border rounded-lg p-4 flex flex-col items-center justify-center h-32 bg-card text-card-foreground">
          <p className="text-sm text-muted-foreground">Processing Orders</p>
          <p className="text-2xl font-bold">{statsLoading ? '...' : stats?.processingOrders ?? '0'}</p>
        </div>
        <div className="border rounded-lg p-4 flex flex-col items-center justify-center h-32 bg-card text-card-foreground">
          <p className="text-sm text-muted-foreground">Paid Orders</p>
          <p className="text-2xl font-bold">{statsLoading ? '...' : stats?.paidOrders ?? '0'}</p>
        </div>
        <div className="border rounded-lg p-4 flex flex-col items-center justify-center h-32 bg-card text-card-foreground">
          <p className="text-sm text-muted-foreground">Total Revenue</p>
          <p className="text-2xl font-bold">{statsLoading ? '...' : formatCurrency(stats?.totalRevenue)}</p>
        </div>
      </div>

      <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id} className="whitespace-nowrap">
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="whitespace-nowrap">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No orders found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      
      <div className="flex flex-col sm:flex-row items-center justify-end gap-4 py-4">
        <div className="flex-1 text-sm text-muted-foreground text-center sm:text-left">
          {table.getFilteredSelectedRowModel().rows.length} of{" "}
          {table.getFilteredRowModel().rows.length} row(s) selected.
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}

export default Orders