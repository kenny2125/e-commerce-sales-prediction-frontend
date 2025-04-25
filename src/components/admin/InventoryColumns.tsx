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
import { ProductForm } from "./ProductForm"; // Import ProductForm
import { useNavigate } from "react-router-dom"; // Import useNavigate

// Define the Inventory type here
export type Inventory = {
  product_id: string;
  category: string;
  brand: string;
  product_name: string;
  status: "In Stock" | "Out of Stock";
  quantity: number;
  store_price: number;
  image_url?: string;
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
    cell: ({ row }) => {
      const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false);
      const product = row.original;
      return (
        <>
          <div
            className="capitalize pl-4 cursor-pointer hover:bg-muted/40"
            onClick={() => setIsEditDialogOpen(true)}
          >
            {row.getValue("category")}
          </div>
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent className="sm:max-w-[90vw] md:max-w-[95vw] lg:max-w-[90vw] xl:max-w-7xl max-h-[90vh] p-0 flex flex-col">
              <DialogHeader>
                <DialogTitle>Edit Product</DialogTitle>
                <DialogDescription>
                  Make changes to the product details below. Click update when
                  you're done.
                </DialogDescription>
              </DialogHeader>
              <ProductForm
                initialData={product}
                onSuccess={() => setIsEditDialogOpen(false)}
                mode="edit"
              />
            </DialogContent>
          </Dialog>
        </>
      );
    },
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
    cell: ({ row }) => {
      const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false);
      const product = row.original;
      return (
        <>
          <div
            className="capitalize pl-4 cursor-pointer hover:bg-muted/40"
            onClick={() => setIsEditDialogOpen(true)}
          >
            {row.getValue("brand")}
          </div>
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent className="sm:max-w-[90vw] md:max-w-[90vw] lg:max-w-[80vw] xl:max-w-[1200px]">
              <DialogHeader>
                <DialogTitle>Edit Product</DialogTitle>
                <DialogDescription>
                  Make changes to the product details below. Click update when
                  you're done.
                </DialogDescription>
              </DialogHeader>
              <ProductForm
                initialData={product}
                onSuccess={() => setIsEditDialogOpen(false)}
                mode="edit"
              />
            </DialogContent>
          </Dialog>
        </>
      );
    },
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
    cell: ({ row }) => {
      const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false);
      const product = row.original;
      return (
        <>
          <div
            className="capitalize pl-4 cursor-pointer hover:bg-muted/40"
            onClick={() => setIsEditDialogOpen(true)}
          >
            {row.getValue("product_name")}
          </div>
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent className="sm:max-w-[90vw] md:max-w-[90vw] lg:max-w-[80vw] xl:max-w-[1200px]">
              <DialogHeader>
                <DialogTitle>Edit Product</DialogTitle>
                <DialogDescription>
                  Make changes to the product details below. Click update when
                  you're done.
                </DialogDescription>
              </DialogHeader>
              <ProductForm
                initialData={product}
                onSuccess={() => setIsEditDialogOpen(false)}
                mode="edit"
              />
            </DialogContent>
          </Dialog>
        </>
      );
    },
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
      const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false);
      const product = row.original;
      const status = row.getValue("status") as string;
      
      return (
        <>
          <div
            className="flex items-center justify-center cursor-pointer hover:bg-muted/40 px-4"
            onClick={() => setIsEditDialogOpen(true)}
          >
            <Badge 
              variant={status === "In Stock" ? "default" : "destructive"} 
              className={status === "In Stock" ? "bg-green-500 hover:bg-green-600" : ""}
            >
              {status}
            </Badge>
          </div>
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent className="sm:max-w-[90vw] md:max-w-[90vw] lg:max-w-[80vw] xl:max-w-[1200px]">
              <DialogHeader>
                <DialogTitle>Edit Product</DialogTitle>
                <DialogDescription>
                  Make changes to the product details below. Click update when
                  you're done.
                </DialogDescription>
              </DialogHeader>
              <ProductForm
                initialData={product}
                onSuccess={() => setIsEditDialogOpen(false)}
                mode="edit"
              />
            </DialogContent>
          </Dialog>
        </>
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
      const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false);
      const product = row.original;
      return (
        <>
          <div
            className="text-center cursor-pointer hover:bg-muted/40"
            onClick={() => setIsEditDialogOpen(true)}
          >
            {row.getValue("variant_amounts")}
          </div>
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent className="sm:max-w-[90vw] md:max-w-[95vw] lg:max-w-[90vw] xl:max-w-7xl max-h-[90vh] p-8 flex flex-col">
              <DialogHeader>
                <DialogTitle>Edit Product</DialogTitle>
                <DialogDescription>
                  Make changes to the product details below. Click update when
                  you're done.
                </DialogDescription>
              </DialogHeader>
              <ProductForm
                initialData={product}
                onSuccess={() => setIsEditDialogOpen(false)}
                mode="edit"
              />
            </DialogContent>
          </Dialog>
        </>
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

      const handleDelete = async () => {
        try {
          setIsDeleting(true);
          const token = localStorage.getItem("token");
          const response = await fetch(
            `${import.meta.env.VITE_API_URL}/api/product/${product.product_id}`,
            {
              method: "DELETE",
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({
              message: "Unknown error",
            }));
            throw new Error(
              `HTTP error! status: ${response.status}, Message: ${
                errorData.message || "Failed to delete"
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
        <>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setIsEditDialogOpen(true)}>
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
              <ProductForm
                initialData={product}
                onSuccess={handleEditSuccess}
                mode="edit"
              />
            </DialogContent>
          </Dialog>
        </>
      );
    },
    enableSorting: false,
  },
];

