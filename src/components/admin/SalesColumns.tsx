"use client"

import { ColumnDef } from "@tanstack/react-table"
import { MoreHorizontal } from "lucide-react"
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

export type SalesRecord = {
  id: number
  date: string
  amount: number
  order_id: number
  order_number: string
  user_id: number
  user_fullname?: string // Add the user's full name field
  payment_method: string
  status: string
  created_at: string
  updated_at: string
}

export const salesColumns: ColumnDef<SalesRecord>[] = [
  {
    accessorKey: "order_number",
    header: "Order Number",
    cell: ({ row }) => (
      <div>{row.getValue("order_number")}</div>
    ),
  },
  {
    accessorKey: "date",
    header: "Date",
    cell: ({ row }) => (
      <div>{new Date(row.getValue("date")).toLocaleDateString()}</div>
    ),
  },
  {
    accessorKey: "amount",
    header: () => <div className="text-right">Amount</div>,
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("amount"))

      // Format the amount as a PHP amount
      const formatted = new Intl.NumberFormat("en-PH", {
        style: "currency",
        currency: "PHP",
      }).format(amount)

      return <div className="text-right font-medium">{formatted}</div>
    },
  },
  {
    accessorKey: "user_fullname",
    header: "Customer",
    cell: ({ row }) => (
      <div className="capitalize">{row.getValue("user_fullname") || "Unknown"}</div>
    ),
  },
  {
    accessorKey: "payment_method",
    header: "Payment Method",
    cell: ({ row }) => (
      <div className="capitalize">{row.getValue("payment_method")}</div>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <div className="capitalize">{row.getValue("status")}</div>
    ),
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const sale = row.original

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
              onClick={() => navigator.clipboard.writeText(sale.order_number)}
            >
              Copy order number
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>View Details</DropdownMenuItem>
            <DropdownMenuItem>View Order</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]