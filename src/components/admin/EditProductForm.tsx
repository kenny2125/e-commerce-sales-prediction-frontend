"use client";

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { Check, ChevronsUpDown, PlusCircle, XCircle, Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Inventory } from "@/components/admin/InventoryColumns"; // Ensure this path is correct
import { toast } from "sonner";
import ImagePlaceholder from "@/assets/image-placeholder.webp";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Label } from "@/components/ui/label";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Input } from "@/components/ui/input"; // Add missing import for Input component

// Define ProductVariant type locally or import if defined globally
type ProductVariant = {
  id?: number;
  sku: string;
  variant_name: string;
  description?: string;
  store_price: number | string;
  quantity: number;
  image_url?: string;
  image?: File;
};

const formSchema = {
  category: String,
  brand: String,
  product_name: String,
  status: String,
  quantity: Number,
  store_price: String,
  image: FileList,
  description: String, // Keep description field
};

interface EditProductFormProps {
  initialData: Inventory;
  onSuccess?: () => void;
}

export function EditProductForm({ initialData, onSuccess }: EditProductFormProps) {
  const navigate = useNavigate();
  const [formMessage, setFormMessage] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Define formatPrice at the beginning of the component
  const formatPrice = (price: number | string | null | undefined): string => {
    if (price == null || price === '') {
      return '';
    }
    if (typeof price === "string") {
      const num = parseFloat(price.replace(/,/g, ''));
      if (isNaN(num)) return '';
      return num.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
    }
    // Now price is a number
    return price.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };
  
  // State for form values
  const [category, setCategory] = useState(initialData.category);
  const [brand, setBrand] = useState(initialData.brand);
  const [productName, setProductName] = useState(initialData.product_name);
  const [status, setStatus] = useState(initialData.status || "In Stock");
  const [quantity, setQuantity] = useState(initialData.quantity || 0);
  const [storePrice, setStorePrice] = useState(formatPrice(initialData.store_price || 0));
  const [description, setDescription] = useState(initialData.description || '');
  
  // State for managing product variants
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [editingVariant, setEditingVariant] = useState<ProductVariant | null>(null);
  const [showVariantForm, setShowVariantForm] = useState(false);
  const [variantFormError, setVariantFormError] = useState<string | null>(null);
  
  // Fetch existing variants when editing a product
  useEffect(() => {
    if (initialData?.id) {
      // Check if initialData has a 'variants' property that's populated
      if (initialData.variants && Array.isArray(initialData.variants)) {
        // Map the variants array to ensure the correct property structure
        const formattedVariants = initialData.variants.map((variant: ProductVariant) => ({
          ...variant,
          store_price: formatPrice(variant.store_price), // Format price for display
        }));
        setVariants(formattedVariants);
      }
    }
  }, [initialData]);
  
  // Handle adding a new variant
  const handleAddVariant = () => {
    if (!editingVariant) {
      // Initialize with empty variant
      setEditingVariant({
        sku: "",
        variant_name: "",
        store_price: "",
        quantity: 0
      });
    }
    setShowVariantForm(true);
    setVariantFormError(null);
  };
  
  // Handle saving a variant
  const handleSaveVariant = () => {
    if (!editingVariant) return;
    
    // Validate variant
    if (!editingVariant.sku) {
      setVariantFormError("SKU is required");
      return;
    }
    
    if (!editingVariant.variant_name) {
      setVariantFormError("Variant name is required");
      return;
    }
    
    if (!editingVariant.store_price) {
      setVariantFormError("Price is required");
      return;
    }
    
    // Check for duplicate SKU
    const duplicateSku = variants.some(
      v => v.sku === editingVariant.sku && v.id !== editingVariant.id
    );
    
    if (duplicateSku) {
      setVariantFormError("A variant with this SKU already exists");
      return;
    }
    
    // Just save the variant with the file for upload to Cloudinary later
    // DO NOT create blob URLs here as they're not valid for storage
    let variantToSave = { ...editingVariant };
    
    // Add or update variant
    if (editingVariant.id) {
      // Update existing variant
      setVariants(
        variants.map(v => 
          v.id === editingVariant.id ? variantToSave : v
        )
      );
    } else {
      // Add new variant with generated ID
      setVariants([ ...variants, { ...variantToSave, id: Date.now() } ]);
    }
    
    // Reset form
    setEditingVariant(null);
    setShowVariantForm(false);
    setVariantFormError(null);
    setVariantPreviewSrc(ImagePlaceholder);
    setVariantFileName('');
  };
  
  // Handle editing a variant
  const handleEditVariant = (variant: ProductVariant) => {
    setEditingVariant(variant);
    setShowVariantForm(true);
    setVariantFormError(null);
  };
  
  // Handle deleting a variant
  const handleDeleteVariant = (variantId: number) => {
    setVariants(variants.filter(v => v.id !== variantId));
  };
  
  // Function to handle variant form field changes
  const handleVariantChange = (field: keyof ProductVariant, value: any) => {
    if (!editingVariant) return;
    
    setEditingVariant({
      ...editingVariant,
      [field]: value
    });
  };

  // Process and handle variant image
  const [variantPreviewSrc, setVariantPreviewSrc] = useState<string>(ImagePlaceholder);
  const [variantFileName, setVariantFileName] = useState<string>('');

  // Handle variant image change
  const handleVariantImageChange = async (files: FileList | null) => {
    if (!editingVariant) return;
    
    try {
      if (files && files[0]) {
        const file = files[0];
        setVariantFileName(file.name);
        const processed = await processImage(file); // Await the promise
        const previewUrl = URL.createObjectURL(processed);
        setVariantPreviewSrc(previewUrl);
        
        // Update the editingVariant with the new image File object
        setEditingVariant(prev => prev ? { ...prev, image: processed } : null);
      } else {
        setVariantFileName('');
        setVariantPreviewSrc(editingVariant.image_url || ImagePlaceholder);
        // Remove image File object if file is deselected
        setEditingVariant(prev => prev ? { ...prev, image: undefined } : null);
      }
    } catch (error) {
        console.error("Error processing variant image:", error);
        // Optionally show an error message to the user, e.g., using a state variable
        setVariantFormError("Failed to process image. Please try another file."); // Example error feedback
        // Reset image state on error
        setVariantFileName('');
        setVariantPreviewSrc(editingVariant.image_url || ImagePlaceholder);
        setEditingVariant(prev => prev ? { ...prev, image: undefined } : null);
    }
  };

  // Reset variant image preview when editing a new variant
  useEffect(() => {
    if (editingVariant) {
      setVariantPreviewSrc(editingVariant.image_url || ImagePlaceholder);
      setVariantFileName('');
    }
  }, [editingVariant]);

  // State for categories and brands
  const [categories, setCategories] = useState<string[]>([]);
  const [brands, setBrands] = useState<string[]>([]);
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [isAddingBrand, setIsAddingBrand] = useState(false);
  const [newCategory, setNewCategory] = useState("");
  const [newBrand, setNewBrand] = useState("");
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);
  const [isLoadingBrands, setIsLoadingBrands] = useState(false);

  // Fetch categories from API
  const fetchCategories = async () => {
    setIsLoadingCategories(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/product/categories`);
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    } finally {
      setIsLoadingCategories(false);
    }
  };

  // Fetch brands from all products
  const fetchBrands = async () => {
    setIsLoadingBrands(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/product`);
      if (response.ok) {
        const products = await response.json();
        // Extract unique brand names
        const uniqueBrands = Array.from(
          new Set(products.map((product: any) => product.brand))
        ).filter(Boolean) as string[];
        setBrands(uniqueBrands);
      }
    } catch (error) {
      console.error("Error fetching brands:", error);
    } finally {
      setIsLoadingBrands(false);
    }
  };

  // Handler for adding a new category
  const handleAddCategory = () => {
    if (newCategory && !categories.includes(newCategory)) {
      setCategories([...categories, newCategory]);
      setNewCategory("");
      setIsAddingCategory(false);
    }
  };

  // Handler for adding a new brand
  const handleAddBrand = () => {
    if (newBrand && !brands.includes(newBrand)) {
      setBrands([...brands, newBrand]);
      setNewBrand("");
      setIsAddingBrand(false);
    }
  };

  // Load categories and brands on component mount
  useEffect(() => {
    fetchCategories();
    fetchBrands();
  }, []);

  // Image preview, filename state, and processing handlers
  const [previewSrc, setPreviewSrc] = useState<string>(initialData?.image_url || ImagePlaceholder);
  const [selectedFileName, setSelectedFileName] = useState<string>('');

  // Crop image to square and compress
  const processImage = async (file: File): Promise<File> => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    return new Promise((resolve, reject) => {
      img.onload = () => {
        const size = Math.min(img.width, img.height);
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        if (!ctx) return reject(new Error('Canvas context not available'));
        const sx = (img.width - size) / 2;
        const sy = (img.height - size) / 2;
        ctx.drawImage(img, sx, sy, size, size, 0, 0, size, size);
        canvas.toBlob(
          (blob) => {
            if (!blob) return reject(new Error('Image compression failed'));
            const processed = new File([blob], file.name, { type: blob.type });
            resolve(processed);
          },
          file.type,
          0.8
        );
      };
      img.onerror = (e) => reject(e);
      img.src = url;
    });
  };

  // Handle file input change: crop, compress, set preview & filename
  const handleImageChange = async (files: FileList | null) => {
    try {
      if (files && files[0]) {
        const file = files[0];
        setSelectedFileName(file.name);
        const processed = await processImage(file); // Await the promise
        setPreviewSrc(URL.createObjectURL(processed));
        // Create a new FileList containing the processed file for the form
        const dt = new DataTransfer();
        dt.items.add(processed);
      } else {
        setSelectedFileName('');
        setPreviewSrc(initialData?.image_url || ImagePlaceholder);
      }
    } catch (error) {
      console.error("Error processing main product image:", error);
      // Optionally show an error message to the user
      setFormMessage({ type: 'error', message: 'Failed to process image. Please try another file.' });
      // Reset image state on error
      setSelectedFileName('');
      setPreviewSrc(initialData?.image_url || ImagePlaceholder);
    }
  };

  // Watch quantity and update status automatically
  const watchedQuantity = quantity;
  useEffect(() => {
    if (watchedQuantity === 0) {
      setStatus("Out of Stock");
    } else if (watchedQuantity <= 10) {
      setStatus("Low Stock");
    } else {
      setStatus("In Stock");
    }
  }, [watchedQuantity]);

  // Handler for quantity increment/decrement
  const handleQuantityChange = (change: number) => {
    const newQty = Math.max(0, quantity + change);
    setQuantity(newQty);
  };

  const onSubmit = async (payload: any) => {
    try {
      setIsSubmitting(true);
      setFormMessage(null);
      const token = localStorage.getItem("token");
      const endpoint = `${import.meta.env.VITE_API_URL}/api/product/${initialData.id}`;
      const body = JSON.stringify({
        ...payload,
        variants: variants.map(v => ({
          id: v.id,
          sku: v.sku,
          variant_name: v.variant_name,
          description: v.description,
          store_price: parseFloat(String(v.store_price).replace(/,/g, '')),
          quantity: v.quantity
        }))
      });
      const response = await fetch(endpoint, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body
      });

      if (!response.ok) throw new Error(`Update failed: ${response.status}`);

      const updatedProduct = await response.json();
      setFormMessage({ type: "success", message: "Product updated successfully!" });

      setTimeout(onSuccess, 1500);
    } catch (err: any) {
      console.error(err);
      setFormMessage({ type: "error", message: err.message || 'Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  }
  
  // Updated onChange handler: Only validates input, does not format
  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Allow only digits, commas, and a single decimal point with up to 2 digits
    if (/^[\d,]*\.?\d{0,2}$/.test(value) || value === "") {
      // Directly set the potentially unformatted value if it's valid
      setStorePrice(value);
    }
    // If the input is invalid, do nothing (prevents invalid characters)
  };

  // New onBlur handler: Formats the price when the input loses focus
  const handlePriceBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value) {
      // Remove existing commas for correct parsing
      const plainNumber = value.replace(/,/g, "");
      const number = parseFloat(plainNumber);
      if (!isNaN(number)) {
        // Format using toLocaleString and update the form state
        setStorePrice(
          number.toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })
        );
      } else {
        // Handle cases where the input might be invalid after blur (e.g., just ".")
        // Optionally clear or reset, here we just format 0.00
         setStorePrice((0).toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }));
      }
    } else {
        // If the field is empty on blur, set it to formatted zero or keep empty
         setStorePrice(""); // Or format 0.00 if preferred
    }
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = { category, brand, product_name: productName, status, quantity, store_price: storePrice, description };
    await onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmitForm} className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Middle Column: Base Product Information */}
      <div className="md:col-span-1 space-y-4">
        <h3 className="text-lg font-medium">Product Information</h3>
        {formMessage && (
          <div
            className={`p-4 rounded-md ${
              formMessage.type === "success"
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {formMessage.message}
          </div>
        )}
        
        {/* Category Field */}
        <div className="flex flex-col">
          <Label htmlFor="category">Category</Label>
          <Input 
            id="category"
            value={category} 
            onChange={e => setCategory(e.target.value)}
            className="w-full"
          />
        </div>
        
        {/* Brand Field */}
        <div className="flex flex-col">
          <Label htmlFor="brand">Brand</Label>
          <Input 
            id="brand"
            value={brand} 
            onChange={e => setBrand(e.target.value)}
            className="w-full"
          />
        </div>
        
        {/* Product Name Field */}
        <div className="flex flex-col">
          <Label htmlFor="product_name">Product Name</Label>
          <Input 
            id="product_name"
            value={productName} 
            onChange={e => setProductName(e.target.value)}
            className="w-full"
          />
        </div>
        
        {/* Status Field */}
        <div className="flex flex-col">
          <Label htmlFor="status">Status</Label>
          <Input 
            id="status"
            value={status} 
            onChange={e => setStatus(e.target.value)}
            className="w-full"
            disabled
          />
        </div>
        
        {/* Quantity Field with +/- buttons */}
        <div className="flex flex-col">
          <Label htmlFor="quantity">Quantity</Label>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => handleQuantityChange(-1)}
              disabled={quantity <= 0}
            >
              <Minus className="h-4 w-4" />
            </Button>
            <Input
              id="quantity"
              type="number"
              value={quantity}
              onChange={e => setQuantity(Math.max(0, parseInt(e.target.value) || 0))}
              className="w-16 text-center"
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => handleQuantityChange(1)}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        {/* Store Price Field */}
        <div className="flex flex-col">
          <Label htmlFor="store_price">Store Price (PHP)</Label>
          <Input 
            id="store_price"
            value={storePrice} 
            onChange={handlePriceChange}
            onBlur={handlePriceBlur}
            className="w-full"
          />
        </div>
        
        {/* Description Field */}
        <div className="flex flex-col">
          <Label htmlFor="description">Description</Label>
          <textarea
            id="description"
            value={description} 
            onChange={e => setDescription(e.target.value)}
            className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            placeholder="Enter product description (optional)"
          />
        </div>
      </div>

      {/* Right Column: Product Variants - keep the existing code */}
      <div className="md:col-span-1 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium">Product Variants</h3>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm" 
                  onClick={handleAddVariant}
                  disabled={showVariantForm}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Variant
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Add a new size, color, or other variant</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        
        <div className="border rounded-md p-4 bg-muted/10 h-[530px] flex flex-col">
          {showVariantForm ? (
            <div className="space-y-3 p-2">
              <h4 className="font-medium text-sm">
                {editingVariant?.id ? "Edit Variant" : "New Variant"}
              </h4>
              
              {variantFormError && (
                <div className="bg-red-100 text-red-700 p-2 rounded-md text-sm">
                  {variantFormError}
                </div>
              )}
              
              <div className="space-y-3">
                {/* Two-column layout for variant form */}
                <div className="flex flex-col md:flex-row gap-4">
                  {/* Left column: Image and upload */}
                  <div className="flex-1">
                    <Label htmlFor="variant-image">Variant Image</Label>
                    <div className="space-y-2">
                      <div className="w-full h-40 flex items-center justify-center border rounded-md overflow-hidden bg-muted/30">
                        <img
                          src={variantPreviewSrc}
                          alt="Variant preview"
                          className="max-h-36 max-w-full object-contain"
                        />
                      </div>
                      <Input
                        id="variant-image"
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleVariantImageChange(e.target.files)}
                      />
                      {variantFileName && (
                        <p className="text-xs text-muted-foreground">
                          Selected file: {variantFileName}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  {/* Right column: SKU, name, price, quantity */}
                  <div className="flex-1 space-y-3">
                    <div>
                      <Label htmlFor="variant-sku">SKU</Label>
                      <Input
                        id="variant-sku"
                        value={editingVariant?.sku || ""}
                        onChange={(e) => handleVariantChange("sku", e.target.value)}
                        placeholder="VAR-001"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="variant-name">Variant Name</Label>
                      <Input
                        id="variant-name"
                        value={editingVariant?.variant_name || ""}
                        onChange={(e) => handleVariantChange("variant_name", e.target.value)}
                        placeholder="Size: Large, Color: Red, etc."
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="variant-price">Price (PHP)</Label>
                      <Input
                        id="variant-price"
                        value={editingVariant?.store_price || ""}
                        onChange={(e) => handleVariantChange("store_price", e.target.value)}
                        placeholder="0.00"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="variant-quantity">Quantity</Label>
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => handleVariantChange("quantity", Math.max(0, (editingVariant?.quantity || 0) - 1))}
                          disabled={(editingVariant?.quantity || 0) <= 0}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <Input
                          id="variant-quantity"
                          type="number"
                          value={editingVariant?.quantity || 0}
                          onChange={(e) => handleVariantChange("quantity", Math.max(0, parseInt(e.target.value) || 0))}
                          className="w-16 text-center"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => handleVariantChange("quantity", (editingVariant?.quantity || 0) + 1)}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Description field at the bottom */}
                <div>
                  <Label htmlFor="variant-description">Description</Label>
                  <textarea
                    id="variant-description"
                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={editingVariant?.description || ''}
                    onChange={e => handleVariantChange('description', e.target.value)}
                    placeholder="Enter variant description (optional)"
                  />
                </div>
                
                {/* Buttons at the very bottom */}
                <div className="pt-4 flex justify-end space-x-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      setShowVariantForm(false);
                      setEditingVariant(null);
                      setVariantFormError(null);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="button" 
                    size="sm"
                    onClick={handleSaveVariant}
                  >
                    Save
                  </Button>
                </div>
              </div>
            </div>
          ) : variants.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
              <div className="text-center p-4">
                <p>No variants added yet.</p>
                <p className="text-sm mt-2">Add variants for different sizes, colors, or options with their own pricing and inventory.</p>
                <Button 
                  type="button" 
                  variant="outline" 
                  className="mt-4"
                  onClick={handleAddVariant}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add First Variant
                </Button>
              </div>
            </div>
          ) : (
            <ScrollArea className="h-full pr-4">
              <div className="space-y-3">
                {variants.map((variant) => (
                  <Card key={variant.id} className="overflow-hidden">
                    <CardHeader className="p-3 pb-0">
                      <div className="flex items-start justify-between">
                        <CardTitle className="text-sm font-medium">
                          {variant.variant_name}
                        </CardTitle>
                        <div className="flex space-x-1">
                          <Button 
                            type="button" 
                            variant="ghost" 
                            size="icon" 
                            className="h-7 w-7"
                            onClick={() => handleEditVariant(variant)}
                          >
                            <PlusCircle className="h-4 w-4" />
                            <span className="sr-only">Edit</span>
                          </Button>
                          <Button 
                            type="button" 
                            variant="ghost" 
                            size="icon" 
                            className="h-7 w-7 text-destructive"
                            onClick={() => handleDeleteVariant(variant.id!)}
                          >
                            <XCircle className="h-4 w-4" />
                            <span className="sr-only">Delete</span>
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-3 text-sm">
                        {/* Variant Image */}
                        <div className="mb-2 w-full h-32 flex items-center justify-center border rounded-md overflow-hidden bg-muted/30">
                          <img
                            src={variant.image_url || ImagePlaceholder}
                            alt={variant.variant_name}
                            className="max-h-28 max-w-full object-contain"
                          />
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          <div>
                            <p className="text-xs text-muted-foreground">SKU</p>
                            <p>{variant.sku}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Price</p>
                            <p>₱{typeof variant.store_price === 'number' 
                                ? variant.store_price.toLocaleString('en-US', {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                  })
                                : variant.store_price}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Qty</p>
                            <p>{variant.quantity}</p>
                          </div>
                        </div>
                      </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          )}
        </div>
      </div>

      {/* Footer spanning all columns */}
      <DialogFooter className="md:col-span-2">
        <Button
          type="submit"
          disabled={isSubmitting}
          className="relative w-full sm:w-auto min-w-[150px]"
        >
          {isSubmitting ? (
            <div className="flex items-center justify-center">
              <div className="w-5 h-5 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Updating...</span>
            </div>
          ) : (
            <span>Update Product</span>
          )}
        </Button>
      </DialogFooter>
    </form>
  );
}

export default EditProductForm;