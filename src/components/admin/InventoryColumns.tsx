"use client";

import * as React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, MoreHorizontal } from "lucide-react"; // Import ArrowUpDown
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { EditProductForm } from "./EditProductForm"; // Import EditProductForm directly
import { useNavigate } from "react-router-dom"; // Import useNavigate

// Define the Inventory type here
export type Inventory = {
  id: number;
  product_id: string;
  category: string;
  brand: string;
  product_name: string;
  status: "In Stock" | "Low Stock" | "Out of Stock";
  quantity: number;
  store_price: number;
  image_url?: string;
  variants?: ProductVariant[]; // Add optional variants array
  variant_count?: number;     // Number of variants
  total_quantity?: number;    // Total quantity across all variants
};

// Define ProductVariant type (copy from EditProductForm.tsx or define globally)
// This assumes ProductVariant is defined elsewhere or needs to be added here.
// If not defined globally, let's add it here for clarity:
type ProductVariant = {
  id?: number;
  sku: string;
  variant_name: string;
  description?: string;
  store_price: number | string;
  quantity: number;
  image_url?: string;
  image?: File; // Keep this if needed for form handling
};

// Define the columns as a function that accepts refreshData
export const getColumns = (refreshData: () => void): ColumnDef<Inventory>[] => [
  {
    accessorKey: "category",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Category
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => <div>{row.getValue("category")}</div>,
  },
  {
    accessorKey: "brand",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Brand
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => <div>{row.getValue("brand")}</div>,
  },
  {
    accessorKey: "product_name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Product Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => <div>{row.getValue("product_name")}</div>,
  },
  {
    accessorKey: "status",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Status
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      
      return (
        <div>
          <Badge 
            variant={status === "Out of Stock" ? "destructive" : "default"} 
            className={
              status === "In Stock" 
                ? "bg-green-500 hover:bg-green-600" 
                : status === "Low Stock" 
                  ? "bg-yellow-500 hover:bg-yellow-600" 
                  : ""
            }
          >
            {status}
          </Badge>
        </div>
      );
    },
  },
  {
    accessorKey: "variant_amounts",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Variant Amounts
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const variantCount = parseInt(row.original.variant_count as unknown as string) || 0;
      const totalQuantity = parseInt(row.original.total_quantity as unknown as string) || 0;
      
      return (
        <div>
          <span className="font-medium">{variantCount} variant{variantCount !== 1 ? 's' : ''}</span>
          <span className="text-xs text-muted-foreground block">Total Qty: {totalQuantity}</span>
        </div>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const product = row.original;
      const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
      const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false);
      const [isDeleting, setIsDeleting] = React.useState(false);
      const [fullProductData, setFullProductData] = React.useState<Inventory | null>(null);
      const [isLoadingProduct, setIsLoadingProduct] = React.useState(false);

      // Fetch complete product data including variants
      const fetchFullProductData = async () => {
        try {
          setIsLoadingProduct(true);
          const productId = product.product_id || product.id;
          const token = localStorage.getItem("token");
          
          const response = await fetch(
            `${import.meta.env.VITE_API_URL}/api/product/${productId}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            }
          );

          if (!response.ok) {
            throw new Error(`Failed to fetch product details: ${response.status}`);
          }

          const data = await response.json();
          console.log("Fetched full product data with variants:", data);
          setFullProductData(data);
          setIsEditDialogOpen(true);
        } catch (error) {
          console.error("Error fetching product details:", error);
          alert("Failed to load product details. Please try again.");
        } finally {
          setIsLoadingProduct(false);
        }
      };

      const handleDelete = async () => {
        try {
          setIsDeleting(true);
          const token = localStorage.getItem("token");
          
          // Check for both product_id and id as the backend uses 'id'
          const productId = product.product_id || product.id;
          
          // Verify product ID exists and is valid before sending the request
          if (!productId) {
            throw new Error("Product ID is missing");
          }
          
          const response = await fetch(
            `${import.meta.env.VITE_API_URL}/api/product/${productId}`,
            {
              method: "DELETE",
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            }
          );

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({
              message: "Unknown error occurred while deleting the product",
            }));
            throw new Error(
              `HTTP error! status: ${response.status}, Message: ${
                errorData.message || "Failed to delete product"
              }`
            );
          }

          setIsDeleteDialogOpen(false);
          refreshData();
        } catch (error: any) {
          console.error("Failed to delete product:", error);
          alert(`Failed to delete product: ${error.message}`);
        } finally {
          setIsDeleting(false);
        }
      };

      const handleEditSuccess = () => {
        setIsEditDialogOpen(false);
        refreshData();
      };

      return (
        <div className="flex items-center justify-center">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={fetchFullProductData}>
                Edit Product
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => setIsDeleteDialogOpen(true)}
                className="text-red-600 focus:text-red-700 focus:bg-red-100"
              >
                Delete Product
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Dialog
            open={isDeleteDialogOpen}
            onOpenChange={setIsDeleteDialogOpen}
          >
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Delete Product</DialogTitle>
                <DialogDescription>
                  Are you sure you want to delete "{product.product_name}"? This
                  action cannot be undone.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsDeleteDialogOpen(false)}
                  disabled={isDeleting}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="relative"
                >
                  {isDeleting && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  )}
                  <span className={isDeleting ? "opacity-0" : "opacity-100"}>
                    Delete
                  </span>
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent className="sm:max-w-[90vw] md:max-w-[95vw] lg:max-w-[90vw] xl:max-w-7xl max-h-[90vh] p-8 flex flex-col">
              <DialogHeader>
                <DialogTitle>Edit Product</DialogTitle>
                <DialogDescription>
                  Make changes to the product details below. Click update when
                  you're done.
                </DialogDescription>
              </DialogHeader>
              <EditProductForm // Use EditProductForm directly
                initialData={fullProductData}
                onSuccess={handleEditSuccess}
                isLoading={isLoadingProduct} // Pass loading state to form
              />
            </DialogContent>
          </Dialog>
        </div>
      );
    },
    enableSorting: false,
  },
];

