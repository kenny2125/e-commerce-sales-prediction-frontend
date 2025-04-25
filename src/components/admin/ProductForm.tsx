"use client";

import * as React from "react";
import { AddProductForm } from "./AddProductForm";
import { EditProductForm } from "./EditProductForm";
import type { Inventory } from "@/components/admin/InventoryColumns";

interface ProductFormProps {
  initialData?: Inventory;
  onSuccess?: () => void;
  mode: "add" | "edit";
}

export function ProductForm({ initialData, onSuccess, mode }: ProductFormProps) {
  // This component now acts as a router between the two specialized forms
  if (mode === "edit" && initialData) {
    return <EditProductForm initialData={initialData} onSuccess={onSuccess} />;
  }
  
  return <AddProductForm onSuccess={onSuccess} />;
}

export default ProductForm;
