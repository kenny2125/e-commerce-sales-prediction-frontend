"use client"

import * as React from "react"
import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"

// This represents the structure of our historical sales data
export interface HistoricalSalesRecord {
  id: number
  date: string
  full_date: string  // New field for full date format (March 2, 2025)
  actualsales: number
  formatted_sales: string
}

export const historicalSalesColumns: ColumnDef<HistoricalSalesRecord>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "full_date",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Date
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => <div className="font-medium">{row.getValue("full_date")}</div>,
  },
  {
    accessorKey: "formatted_sales",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Sales Amount
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => (
      <div className="font-medium">₱{row.getValue("formatted_sales")}</div>
    ),
  },
  {
    accessorKey: "id",
    header: "ID",
    cell: ({ row }) => <div>{row.getValue("id")}</div>,
    enableHiding: true,
  },
  {
    accessorKey: "actualsales",
    header: "Raw Amount",
    cell: ({ row }) => <div>{row.getValue("actualsales")}</div>,
    enableHiding: true,
  },
]