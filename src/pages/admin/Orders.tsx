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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { OrderDetailDialog, OrderDetail } from "@/components/dialogs/OrderDetailDialog";
import { AddOrderDialog } from "@/components/dialogs/AddOrderDialog";
import { Badge } from "@/components/ui/badge";

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
  const [selectedOrder, setSelectedOrder] = React.useState<OrderDetail | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = React.useState(false);
  const [detailLoading, setDetailLoading] = React.useState(false);
  const [addOrderDialogOpen, setAddOrderDialogOpen] = React.useState(false);

  const formatCurrency = (value?: number | null) => {
    if (value == null) return 'PHP 0.00'
    return new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(value)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getPaymentStatusBadge = (status: string) => {
    let className = "";
    
    switch (status.toLowerCase()) {
      case 'paid':
        className = "bg-green-500";
        break;
      case 'processing':
        className = "bg-yellow-500";
        break;
      case 'cancelled':
        className = "bg-red-500";
        break;
      case 'refunded':
        className = "bg-purple-500";
        break;
      default:
        className = "bg-gray-500";
    }
    
    return <Badge variant="outline" className={className}>{status}</Badge>;
  };

  const getPickupStatusBadge = (status: string) => {
    let className = "";
    
    switch (status.toLowerCase()) {
      case 'claimed':
        className = "bg-green-500";
        break;
      case 'ready to claim':
        className = "bg-blue-500";
        break;
      case 'cancelled':
        className = "bg-red-500";
        break;
      default:
        className = "bg-gray-500";
    }
    
    return <Badge variant="outline" className={className}>{status}</Badge>;
  };

  // Fetch orders function
  const fetchOrders = async () => {
    setLoading(true);
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

  // Fetch orders on component mount
  React.useEffect(() => {
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

  // Load order detail including items
  const handleOpenDetail = async (orderID: string) => {
    setDetailLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No authentication token');
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/orders/${orderID}`, {
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
      });
      if (!res.ok) throw new Error('Failed to fetch order details');
      const data: OrderDetail = await res.json();
      setSelectedOrder(data);
      setDetailDialogOpen(true);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load order details');
    } finally {
      setDetailLoading(false);
    }
  };

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
        <div>{getPaymentStatusBadge(row.getValue("paymentStatus"))}</div>
      ),
    },
    {
      accessorKey: "pickupStatus",
      header: "Pickup Status",
      cell: ({ row }) => (
        <div>{getPickupStatusBadge(row.getValue("pickupStatus"))}</div>
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
        <div>{formatDate(row.getValue("orderDate"))}</div>
      ),
    },
    {
      accessorKey: "purchasedProduct",
      header: "Purchased Products",
      cell: ({ row }) => (
        <div className="capitalize max-w-[200px] truncate" title={row.getValue("purchasedProduct")}>
          {row.getValue("purchasedProduct")}
        </div>
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
        <Button onClick={() => setAddOrderDialogOpen(true)}>Add Order</Button>
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
                  className="cursor-pointer"
                  onClick={() => handleOpenDetail(row.original.orderID)}
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

      {/* Add Order Dialog */}
      <AddOrderDialog 
        open={addOrderDialogOpen}
        onOpenChange={setAddOrderDialogOpen}
        onOrderAdded={fetchOrders}
      />
      
      {/* Order Detail Dialog */}
      {selectedOrder && (
        <OrderDetailDialog
          order={selectedOrder}
          open={detailDialogOpen}
          onOpenChange={setDetailDialogOpen}
        />
      )}
    </div>
  )
}

export default Orders