"use client";

import * as React from "react";
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
} from "@tanstack/react-table";
import { ChevronDown, MoreHorizontal, Plus, ClipboardList } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useNavigate } from "react-router-dom";

import type { Inventory } from "@/components/admin/InventoryColumns";
import { getColumns } from "@/components/admin/InventoryColumns";
import { AddProductForm } from "@/components/admin/AddProductForm"; // Import AddProductForm directly

type InventoryStats = {
  totalProducts: number;
  lowStockItems: number;
  outOfStockItems: number;
  totalInventoryValue: number;
};

export function Inventory() {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [data, setData] = React.useState<Inventory[]>([]);
  const [stats, setStats] = React.useState<InventoryStats | null>(null);
  const [statsError, setStatsError] = React.useState<string | null>(null);
  const [isStatsLoading, setIsStatsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = React.useState(false);

  const fetchData = React.useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/product`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      
      // Process the data to add the correct status
      const processedData = result.map((product: any) => {
        // Use total_quantity for status determination and overall quantity
        const totalQuantity = parseInt(product.total_quantity) || 0;
        
        let status = "In Stock";
        if (totalQuantity === 0) {
          status = "Out of Stock";
        } else if (totalQuantity <= 5) {
          status = "Low Stock";
        }
        
        return {
          ...product,
          quantity: totalQuantity, // Set quantity to total_quantity for other components
          status,
          // Ensure variant_count is available
          variant_count: parseInt(product.variant_count) || 0
        };
      });
      
      setData(processedData);
    } catch (error: any) {
      console.error("Failed to fetch products:", error);
      setError(`Failed to fetch products: ${error.message}. Please try again.`);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchStats = React.useCallback(async () => {
    setIsStatsLoading(true);
    setStatsError(null);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/product/stats`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result: InventoryStats = await response.json();
      setStats(result);
    } catch (error: any) {
      console.error("Failed to fetch inventory stats:", error);
      setStatsError(`Failed to load summary: ${error.message}.`);
    } finally {
      setIsStatsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchData();
    fetchStats();
  }, [fetchData, fetchStats]);

  const columns = React.useMemo(
    () => getColumns(() => {
      fetchData();
      fetchStats();
    }),
    [fetchData, fetchStats]
  );

  const table = useReactTable({
    data,
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
  });

  const handleAddSuccess = () => {
    setIsAddDialogOpen(false);
    fetchData();
    fetchStats();
  };

  const formatCurrency = (value: number | undefined | null) => {
    if (value === undefined || value === null) return "PHP 0.00";
    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
    }).format(value);
  };

  return (
    <div className="w-full space-y-4">
      {error && (
        <div className="p-4 mb-4 rounded-md bg-red-100 text-red-700">
          {error}
        </div>
      )}
      {statsError && (
        <div className="p-4 mb-4 rounded-md bg-yellow-100 text-yellow-700">
          {statsError}
        </div>
      )}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-4">
          <ClipboardList className="text-primary" size="40px" />
          <div>
            <h1 className="text-2xl font-bold whitespace-nowrap">Inventory Management</h1>
            <p className="text-sm text-muted-foreground">View, add, edit, and delete products.</p>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-2 flex-wrap md:flex-nowrap">
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Product
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[90vw] md:max-w-[95vw] lg:max-w-[90vw] xl:max-w-7xl max-h-[90vh] p-8 flex flex-col">
              <DialogHeader>
                <DialogTitle>Add New Product</DialogTitle>
                <DialogDescription>
                  Fill in the details below to add a new product to the
                  inventory.
                </DialogDescription>
              </DialogHeader>
              <AddProductForm onSuccess={handleAddSuccess} /> {/* Use AddProductForm directly */}
            </DialogContent>
          </Dialog>
          <Input
            placeholder="Search products..."
            value={
              (table.getColumn("product_name")?.getFilterValue() as string) ?? ""
            }
            onChange={(event) =>
              table
                .getColumn("product_name")
                ?.setFilterValue(event.target.value)
            }
            className="max-w-full sm:max-w-[200px] md:max-w-[250px]"
          />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="whitespace-nowrap">
                Columns
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => {
                  const columnName = column.id.replace(/_/g, " ");
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) =>
                        column.toggleVisibility(!!value)
                      }
                    >
                      {columnName}
                    </DropdownMenuCheckboxItem>
                  );
                })}
            </DropdownMenuContent>
          </DropdownMenu>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-muted-foreground whitespace-nowrap">
              Page {table.getState().pagination.pageIndex + 1} of{" "}
              {table.getPageCount()}
            </span>
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
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="border rounded-lg p-4 flex flex-col items-center justify-center h-32 bg-card text-card-foreground">
          <p className="text-sm text-muted-foreground">Total Products</p>
          <p className="text-2xl font-bold">
            {isStatsLoading ? "..." : stats?.totalProducts ?? "N/A"}
          </p>
        </div>
        <div className="border rounded-lg p-4 flex flex-col items-center justify-center h-32 bg-card text-card-foreground">
          <p className="text-sm text-muted-foreground">Low Stock Items</p>
          <p className="text-2xl font-bold">
            {isStatsLoading ? "..." : stats?.lowStockItems ?? "N/A"}
          </p>
        </div>
        <div className="border rounded-lg p-4 flex flex-col items-center justify-center h-32 bg-card text-card-foreground">
          <p className="text-sm text-muted-foreground">Out of Stock Items</p>
          <p className="text-2xl font-bold">
            {isStatsLoading ? "..." : stats?.outOfStockItems ?? "N/A"}
          </p>
        </div>
        <div className="border rounded-lg p-4 flex flex-col items-center justify-center h-32 bg-card text-card-foreground">
          <p className="text-sm text-muted-foreground">Inventory Value</p>
          <p className="text-2xl font-bold">
            {isStatsLoading ? "..." : formatCurrency(stats?.totalInventoryValue)}
          </p>
        </div>
      </div>
      <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  Loading inventory...
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
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
                  No products found.{" "}
                  {error
                    ? "Could not load data."
                    : "Try adding a product."}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

export default Inventory;
