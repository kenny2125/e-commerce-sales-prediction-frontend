"use client"

import * as React from "react"
import { useEffect, useState } from "react"
import {
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
import { ChevronDown, Calendar, Search } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { historicalSalesColumns, HistoricalSalesRecord } from "./HistoricalSalesColumns"

export function HistoricalSalesTable() {
  const [data, setData] = useState<HistoricalSalesRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({
    id: false,
    actualsales: false,
    select: false,
  })
  const [rowSelection, setRowSelection] = React.useState({})
  const [searchQuery, setSearchQuery] = useState("")

  // Function to format date to full format (March 2, 2025)
  const formatDateToFull = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  // Fetch historical sales data function
  const fetchHistoricalSalesData = async () => {
    setLoading(true)
    setError(null)
    try {
      const url = `${import.meta.env.VITE_API_URL}/api/sales/historical`;
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const result = await response.json()
      
      // Format the data on the frontend
      const formattedData = result.map((item: any) => ({
        id: item.id,
        date: item.date,
        full_date: formatDateToFull(item.date),
        actualsales: parseFloat(item.actualsales),
        formatted_sales: new Intl.NumberFormat('en-PH', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        }).format(parseFloat(item.actualsales))
      }));
      
      setData(formattedData)
    } catch (e) {
      if (e instanceof Error) {
        setError(e.message)
      } else {
        setError("An unknown error occurred")
      }
      console.error("Failed to fetch historical sales data:", e)
    } finally {
      setLoading(false)
    }
  }

  // Initial data fetch
  useEffect(() => {
    fetchHistoricalSalesData()
  }, [])

  const table = useReactTable({
    data: data,
    columns: historicalSalesColumns,
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

  // Filter data based on search query
  const filteredData = React.useMemo(() => {
    if (!searchQuery) return data;
    return data.filter(item => 
      item.full_date.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [data, searchQuery]);

  // Split data into two arrays for side-by-side tables
  const leftTableData = React.useMemo(() => {
    const filtered = searchQuery ? filteredData : data;
    const halfLength = Math.ceil(filtered.length / 2);
    return filtered.slice(0, halfLength);
  }, [filteredData, data, searchQuery]);

  const rightTableData = React.useMemo(() => {
    const filtered = searchQuery ? filteredData : data;
    const halfLength = Math.ceil(filtered.length / 2);
    return filtered.slice(halfLength);
  }, [filteredData, data, searchQuery]);

  if (loading) {
    return <div>Loading historical sales records...</div>
  }

  if (error) {
    return <div>Error loading historical sales records: {error}</div>
  }

  return (
    <>
      <div className="flex flex-col sm:flex-row items-center justify-between py-4 gap-4">
        <div className="flex items-center gap-2">
          <Calendar size="24px" />
          <div className="text-lg font-semibold">Monthly Sales Data</div>
        </div>
        <div className="flex items-center gap-2 w-full max-w-xs">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by date..."
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            className="flex-1"
          />
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        {/* Left Table */}
        <div className="flex-1 rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="font-semibold">Date</TableHead>
                <TableHead className="font-semibold">Sales Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {leftTableData.length > 0 ? (
                leftTableData.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell className="font-medium">{row.full_date}</TableCell>
                    <TableCell className="font-medium">₱{row.formatted_sales}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={2} className="h-24 text-center">
                    No sales records found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        
        {/* Right Table */}
        <div className="flex-1 rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="font-semibold">Date</TableHead>
                <TableHead className="font-semibold">Sales Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rightTableData.length > 0 ? (
                rightTableData.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell className="font-medium">{row.full_date}</TableCell>
                    <TableCell className="font-medium">₱{row.formatted_sales}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={2} className="h-24 text-center">
                    No sales records found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Total records summary */}
      <div className="flex items-center justify-end py-4">
        <div className="text-sm text-muted-foreground">
          {searchQuery ? filteredData.length : data.length} total records
        </div>
      </div>
    </>
  )
}