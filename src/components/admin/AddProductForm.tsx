"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
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
import { Check, ChevronsUpDown, PlusCircle, XCircle, PencilIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import ImagePlaceholder from "@/assets/image-placeholder.webp";
import { Minus, Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Label } from "@/components/ui/label";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useNavigate } from "react-router-dom";

type ProductVariant = {
  id?: number;
  sku: string;
  variant_name: string;
  description?: string;
  store_price: number | string;
  quantity: number;
  image_url?: string;
  image?: File;
  hasImage?: boolean;
};

type FormData = {
  category: string;
  brand: string;
  product_name: string;
  quantity: number;
  store_price: string;
  description?: string;
  variants: ProductVariant[];
};

interface AddProductFormProps {
  onSuccess?: () => void;
}

export function AddProductForm({ onSuccess }: AddProductFormProps) {
  const navigate = useNavigate();
  const [formMessage, setFormMessage] = React.useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  
  // Form state
  const [formData, setFormData] = React.useState<FormData>({
    category: "",
    brand: "",
    product_name: "",
    quantity: 0,
    store_price: "",
    description: "",
    variants: []
  });
  
  // Form validation state
  const [formErrors, setFormErrors] = React.useState<{
    [key: string]: string;
  }>({});
  
  // State for managing product variants
  const [variants, setVariants] = React.useState<ProductVariant[]>([]);
  const [editingVariant, setEditingVariant] = React.useState<ProductVariant | null>(null);
  const [showVariantForm, setShowVariantForm] = React.useState(false);
  const [variantFormError, setVariantFormError] = React.useState<string | null>(null);
  
  // Image state
  const [mainImage, setMainImage] = React.useState<File | null>(null);
  
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

  // Handle form field changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear validation error when field is changed
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

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
      setVariants([
        ...variants,
        { ...variantToSave, id: Date.now() }
      ]);
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
    
    // Realtime validation for SKU uniqueness
    if (field === "sku" && value) {
      const duplicateSku = variants.some(
        v => v.sku === value && v.id !== editingVariant.id
      );
      
      if (duplicateSku) {
        setVariantFormError("A variant with this SKU already exists");
      } else {
        // Only clear the error if it was a duplicate SKU error
        if (variantFormError === "A variant with this SKU already exists") {
          setVariantFormError(null);
        }
      }
    }
  };

  // Process and handle variant image
  const [variantPreviewSrc, setVariantPreviewSrc] = React.useState<string>(ImagePlaceholder);
  const [variantFileName, setVariantFileName] = React.useState<string>('');

  // Handle variant image change
  const handleVariantImageChange = async (files: FileList | null) => {
    if (!editingVariant) return;
    
    if (files && files[0]) {
      const file = files[0];
      setVariantFileName(file.name);
      const processed = await processImage(file);
      const previewUrl = URL.createObjectURL(processed);
      setVariantPreviewSrc(previewUrl);
      
      // Update the editingVariant with the new image
      setEditingVariant({
        ...editingVariant,
        image: processed,
        hasImage: true
      });
    } else {
      setVariantFileName('');
      setVariantPreviewSrc(editingVariant.image_url || ImagePlaceholder);
      
      // Remove image from editingVariant
      const { image, hasImage, ...variantWithoutImage } = editingVariant;
      setEditingVariant(variantWithoutImage);
    }
  };

  // Reset variant image preview when editing a new variant
  React.useEffect(() => {
    if (editingVariant) {
      setVariantPreviewSrc(editingVariant.image_url || ImagePlaceholder);
      setVariantFileName('');
    }
  }, [editingVariant]);

  // State for categories and brands
  const [categories, setCategories] = React.useState<string[]>([]);
  const [brands, setBrands] = React.useState<string[]>([]);
  const [isAddingCategory, setIsAddingCategory] = React.useState(false);
  const [isAddingBrand, setIsAddingBrand] = React.useState(false);
  const [newCategory, setNewCategory] = React.useState("");
  const [newBrand, setNewBrand] = React.useState("");
  const [isLoadingCategories, setIsLoadingCategories] = React.useState(false);
  const [isLoadingBrands, setIsLoadingBrands] = React.useState(false);

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
      setFormData(prev => ({
        ...prev,
        category: newCategory
      }));
      setNewCategory("");
      setIsAddingCategory(false);
    }
  };

  // Handler for adding a new brand
  const handleAddBrand = () => {
    if (newBrand && !brands.includes(newBrand)) {
      setBrands([...brands, newBrand]);
      setFormData(prev => ({
        ...prev,
        brand: newBrand
      }));
      setNewBrand("");
      setIsAddingBrand(false);
    }
  };

  // Load categories and brands on component mount
  React.useEffect(() => {
    fetchCategories();
    fetchBrands();
  }, []);

  // Image preview, filename state, and processing handlers
  const [previewSrc, setPreviewSrc] = React.useState<string>(ImagePlaceholder);
  const [selectedFileName, setSelectedFileName] = React.useState<string>('');

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
    if (files && files[0]) {
      const file = files[0];
      setSelectedFileName(file.name);
      const processed = await processImage(file);
      setPreviewSrc(URL.createObjectURL(processed));
      setMainImage(processed);
    } else {
      setSelectedFileName('');
      setPreviewSrc(ImagePlaceholder);
      setMainImage(null);
    }
  };

  // Handler for quantity increment/decrement
  const handleQuantityChange = (change: number) => {
    setFormData(prev => ({
      ...prev,
      quantity: Math.max(0, prev.quantity + change)
    }));
  };

  // Validate form before submission
  const validateForm = (): boolean => {
    const errors: {[key: string]: string} = {};
    
    if (!formData.category) {
      errors.category = "Category is required";
    }
    
    if (!formData.brand) {
      errors.brand = "Brand is required";
    }
    
    if (!formData.product_name) {
      errors.product_name = "Product name is required";
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!validateForm()) {
      return;
    }
    
    try {
      setIsSubmitting(true);
      setFormMessage(null); // Clear previous messages
      const token = localStorage.getItem("token");
      
      // Prepare data for submission
      const productData = {
        ...formData,
        variants: variants.map(variant => {
          // Convert store_price from string to number if needed
          const variantData = { ...variant };
          if (typeof variantData.store_price === 'string') {
            variantData.store_price = parseFloat(variantData.store_price.replace(/,/g, ''));
          }
          return variantData;
        })
      };
      
      // Create FormData to handle file uploads
      const formDataObj = new FormData();
      
      // Add main product data as JSON
      formDataObj.append('productData', JSON.stringify(productData));
      
      // Add main image if available
      if (mainImage) {
        formDataObj.append('mainImage', mainImage);
      }
      
      // Add variant images
      variants.forEach((variant, index) => {
        if (variant.image) {
          formDataObj.append(`variantImage_${index}`, variant.image);
        }
      });

      const endpoint = `${import.meta.env.VITE_API_URL}/api/product`;

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          // Don't set Content-Type for FormData
        },
        body: formDataObj,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        throw new Error(`HTTP error! status: ${response.status}, Message: ${errorData.message || 'Failed to process request'}`);
      }

      setFormMessage({
        type: "success",
        message: "Product added successfully!"
      });

      setTimeout(() => {
        onSuccess?.(); // Close dialog
      }, 1500);
    } catch (error: any) {
        console.error("Failed to add product:", error);
        setFormMessage({
            type: "error",
            message: `Failed to add product: ${error.message || 'Please try again.'}`,
        });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Handle price input change
  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Allow only digits, commas, and a single decimal point with up to 2 digits
    if (/^[\d,]*\.?\d{0,2}$/.test(value) || value === "") {
      // Directly set the potentially unformatted value if it's valid
      setFormData(prev => ({
        ...prev,
        store_price: value
      }));
    }
  };

  // Format price on blur
  const handlePriceBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value) {
      // Remove existing commas for correct parsing
      const plainNumber = value.replace(/,/g, "");
      const number = parseFloat(plainNumber);
      if (!isNaN(number)) {
        // Format using toLocaleString and update the form state
        setFormData(prev => ({
          ...prev,
          store_price: number.toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })
        }));
      } else {
        // Handle cases where the input might be invalid after blur (e.g., just ".")
        setFormData(prev => ({
          ...prev,
          store_price: ""
        }));
      }
    }
  };

  // Set category handler
  const handleSetCategory = (category: string) => {
    setFormData(prev => ({
      ...prev,
      category
    }));
  };

  // Set brand handler
  const handleSetBrand = (brand: string) => {
    setFormData(prev => ({
      ...prev,
      brand
    }));
  };

  return (
    <div>
      {/* Use grid for two-column layout */}
      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
      >
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
          <div className="flex flex-col">
            <Label htmlFor="category">Category</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  className={cn(
                    "w-full justify-between",
                    !formData.category && "text-muted-foreground"
                  )}
                >
                  {formData.category
                    ? categories.find(
                        (category) => category === formData.category
                      ) || formData.category
                    : "Select category"}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0">
                <Command>
                  <CommandInput
                    placeholder="Search category..."
                    className="h-9"
                  />
                  <CommandList>
                    <CommandEmpty>
                      {isLoadingCategories ? "Loading..." : "No category found."}
                    </CommandEmpty>
                    <CommandGroup>
                      {categories.map((category) => (
                        <CommandItem
                          key={category}
                          value={category}
                          onSelect={() => handleSetCategory(category)}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              formData.category === category
                                ? "opacity-100"
                                : "opacity-0"
                            )}
                          />
                          {category}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                    <CommandSeparator />
                    <CommandGroup>
                      {isAddingCategory ? (
                        <div className="flex items-center p-2">
                          <Input
                            value={newCategory}
                            onChange={(e) => setNewCategory(e.target.value)}
                            className="flex-1 mr-2"
                            placeholder="Enter new category"
                            autoFocus
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                handleAddCategory();
                              }
                            }}
                          />
                          <Button
                            type="button"
                            size="sm"
                            onClick={handleAddCategory}
                            disabled={!newCategory}
                          >
                            Add
                          </Button>
                        </div>
                      ) : (
                        <CommandItem
                          onSelect={() => setIsAddingCategory(true)}
                          className="text-primary"
                        >
                          <PlusCircle className="mr-2 h-4 w-4" />
                          Add new category
                        </CommandItem>
                      )}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            {formErrors.category && (
              <p className="text-red-500 text-sm mt-1">{formErrors.category}</p>
            )}
          </div>
          <div className="flex flex-col">
            <Label htmlFor="brand">Brand</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  className={cn(
                    "w-full justify-between",
                    !formData.brand && "text-muted-foreground"
                  )}
                >
                  {formData.brand
                    ? brands.find(
                        (brand) => brand === formData.brand
                      ) || formData.brand
                    : "Select brand"}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0">
                <Command>
                  <CommandInput
                    placeholder="Search brand..."
                    className="h-9"
                  />
                  <CommandList>
                    <CommandEmpty>
                      {isLoadingBrands ? "Loading..." : "No brand found."}
                    </CommandEmpty>
                    <CommandGroup>
                      {brands.map((brand) => (
                        <CommandItem
                          key={brand}
                          value={brand}
                          onSelect={() => handleSetBrand(brand)}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              formData.brand === brand
                                ? "opacity-100"
                                : "opacity-0"
                            )}
                          />
                          {brand}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                    <CommandSeparator />
                    <CommandGroup>
                      {isAddingBrand ? (
                        <div className="flex items-center p-2">
                          <Input
                            value={newBrand}
                            onChange={(e) => setNewBrand(e.target.value)}
                            className="flex-1 mr-2"
                            placeholder="Enter new brand"
                            autoFocus
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                handleAddBrand();
                              }
                            }}
                          />
                          <Button
                            type="button"
                            size="sm"
                            onClick={handleAddBrand}
                            disabled={!newBrand}
                          >
                            Add
                          </Button>
                        </div>
                      ) : (
                        <CommandItem
                          onSelect={() => setIsAddingBrand(true)}
                          className="text-primary"
                        >
                          <PlusCircle className="mr-2 h-4 w-4" />
                          Add new brand
                        </CommandItem>
                      )}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            {formErrors.brand && (
              <p className="text-red-500 text-sm mt-1">{formErrors.brand}</p>
            )}
          </div>
          <div>
            <Label htmlFor="product_name">Product Name</Label>
            <Input 
              id="product_name"
              name="product_name"
              value={formData.product_name}
              onChange={handleInputChange}
            />
            {formErrors.product_name && (
              <p className="text-red-500 text-sm mt-1">{formErrors.product_name}</p>
            )}
          </div>
          
          {/* Product Form Guide */}
          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-md border border-blue-100 dark:border-blue-800">
            <h4 className="font-medium text-sm mb-2 text-blue-700 dark:text-blue-300">How to Use This Form</h4>
            <ul className="space-y-2 text-sm text-blue-600 dark:text-blue-300">
              <li className="flex items-start">
                <div className="mr-2 mt-0.5">•</div>
                <p><strong>Product Information:</strong> Enter the basic details like category, brand, and product name.</p>
              </li>
              <li className="flex items-start">
                <div className="mr-2 mt-0.5">•</div>
                <p><strong>Variants:</strong> Add different versions of your product (size, color, etc.) on the right panel.</p>
              </li>
              <li className="flex items-start">
                <div className="mr-2 mt-0.5">•</div>
                <p><strong>Each Variant:</strong> Must have a unique SKU, name, price, and quantity.</p>
              </li>
              <li className="flex items-start">
                <div className="mr-2 mt-0.5">•</div>
                <p><strong>Images:</strong> Upload clear product images for each variant to improve visibility.</p>
              </li>
              <li className="flex items-start">
                <div className="mr-2 mt-0.5">•</div>
                <p>Click <strong>Add Product</strong> when you've finished adding all required information.</p>
              </li>
            </ul>
          </div>
{/* Here will be the guide soon on what to do  */}
        </div>

        {/* Right Column: Product Variants */}
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
                <div className="grid grid-cols-2 gap-3">
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
                              <PencilIcon className="h-4 w-4" />
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
                              src={variant.image_url || (variant.image ? URL.createObjectURL(variant.image) : ImagePlaceholder)}
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
            disabled={isSubmitting || formMessage?.type === "success"}
            className="relative"
          >
            {isSubmitting && (
              <div className="absolute inset-0 flex items-center justify-center bg-opacity-50">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
            <span className={isSubmitting ? "opacity-0" : "opacity-100"}>
              Add Product
            </span>
          </Button>
        </DialogFooter>
      </form>
    </div>
  );
}

export default AddProductForm;