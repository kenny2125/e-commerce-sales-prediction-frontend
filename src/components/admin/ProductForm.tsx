"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { Check, ChevronsUpDown, PlusCircle } from "lucide-react"; // Import icons
import { cn } from "@/lib/utils";
import type { Inventory } from "@/components/admin/InventoryColumns";
import ImagePlaceholder from "@/assets/image-placeholder.webp";
import { Minus, Plus } from "lucide-react";

type FormData = {
  product_id: string;
  category: string;
  brand: string;
  product_name: string;
  status: "In Stock" | "Out of Stock";
  quantity: number;
  store_price: string; // Store as string in form, transform to number on submit
  image?: FileList;
};

const formSchema = z.object({
  product_id: z.string().min(2).max(20),
  category: z.string().min(2).max(100),
  brand: z.string().min(2).max(100),
  product_name: z.string().min(2).max(255),
  status: z.enum(["In Stock", "Out of Stock"]),
  quantity: z.coerce.number().min(0),
  store_price: z.string().regex(/^[\d,]*\.?\d*$/, "Invalid price format"),
  image: z.instanceof(FileList).optional(),
});

type FormSchema = z.infer<typeof formSchema>;

interface ProductFormProps {
  initialData?: Inventory;
  onSuccess?: () => void;
  mode: "add" | "edit";
}

export function ProductForm({ initialData, onSuccess, mode }: ProductFormProps) {
  const navigate = useNavigate();
  const [formMessage, setFormMessage] = React.useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const formatPrice = (price: number | string): string => {
    if (typeof price === "string") {
      // Assuming the string is already formatted or needs formatting
      const number = parseFloat(String(price).replace(/,/g, ''));
      if (isNaN(number)) return typeof price === 'string' ? price : '0.00'; // Return original string or default if conversion fails
      return number.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
    }
    // If it's already a number
    return price.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData
      ? {
          ...initialData,
          store_price: formatPrice(initialData.store_price), // Ensure price is formatted correctly
        }
      : {
          product_id: "",
          category: "",
          brand: "",
          product_name: "",
          status: "In Stock",
          quantity: 0,
          store_price: "",
        },
  });

  // State for tracking product ID uniqueness
  const [productIdState, setProductIdState] = React.useState<{
    isChecking: boolean;
    isDuplicate: boolean;
    message: string;
  }>({
    isChecking: false,
    isDuplicate: false,
    message: "",
  });

  // States for categories and brands
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
      form.setValue("category", newCategory);
      setNewCategory("");
      setIsAddingCategory(false);
    }
  };

  // Handler for adding a new brand
  const handleAddBrand = () => {
    if (newBrand && !brands.includes(newBrand)) {
      setBrands([...brands, newBrand]);
      form.setValue("brand", newBrand);
      setNewBrand("");
      setIsAddingBrand(false);
    }
  };

  // Load categories and brands on component mount
  React.useEffect(() => {
    fetchCategories();
    fetchBrands();
  }, []);

  // Function to check if product ID already exists
  const checkProductIdExists = async (id: string) => {
    if (!id) return;
    
    try {
      setProductIdState({ isChecking: true, isDuplicate: false, message: "Checking..." });
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/product/${id}`);
      
      if (response.ok) {
        // Product with this ID exists
        setProductIdState({
          isChecking: false,
          isDuplicate: true,
          message: "Warning: This Product ID already exists!",
        });
        return true;
      } else if (response.status === 404) {
        // Product ID is available
        setProductIdState({
          isChecking: false,
          isDuplicate: false,
          message: "Product ID is available",
        });
        return false;
      }
    } catch (error) {
      console.error("Error checking product ID:", error);
      setProductIdState({
        isChecking: false,
        isDuplicate: false,
        message: "Failed to check Product ID",
      });
    }
    return false;
  };

  // Image preview, filename state, and processing handlers
  const [previewSrc, setPreviewSrc] = React.useState<string>(initialData?.image_url || ImagePlaceholder);
  const [selectedFileName, setSelectedFileName] = React.useState<string>(initialData?.image_url ? '' : '');

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
      const dt = new DataTransfer();
      dt.items.add(processed);
      form.setValue('image', dt.files, { shouldValidate: true });
    } else {
      setSelectedFileName('');
      setPreviewSrc(initialData?.image_url || ImagePlaceholder);
      form.setValue('image', undefined);
    }
  };

  // Watch quantity and update status automatically
  const watchedQuantity = form.watch("quantity");
  React.useEffect(() => {
    form.setValue("status", watchedQuantity > 0 ? "In Stock" : "Out of Stock");
  }, [watchedQuantity, form]);

  // Handler for quantity increment/decrement
  const handleQuantityChange = (change: number) => {
    const current = form.getValues("quantity");
    const newQty = Math.max(0, current + change);
    form.setValue("quantity", newQty, { shouldValidate: true });
  };

  // Function to generate product ID based on input fields
  const generateProductId = () => {
    const category = form.getValues("category");
    const brand = form.getValues("brand");
    const productName = form.getValues("product_name");
    
    if (!category && !brand && !productName) return "";
    
    // Get first 3 chars of category (or fewer if shorter)
    const categoryPrefix = category.slice(0, 3).toUpperCase();
    
    // Get first 2 chars of brand (or fewer if shorter)
    const brandCode = brand.slice(0, 2).toUpperCase();
    
    // Get first 3 chars of product name
    const nameCode = productName.slice(0, 3).toUpperCase();
    
    // Add timestamp to ensure uniqueness
    const timestamp = new Date().getTime().toString().slice(-4);
    
    return `${categoryPrefix}${brandCode}${nameCode}-${timestamp}`;
  };

  // Watch product_id to check for duplicates
  const watchProductId = form.watch("product_id");

  React.useEffect(() => {
    // Debounce the check to avoid too many API calls while typing
    const handler = setTimeout(() => {
      if (watchProductId && mode === "add") {
        checkProductIdExists(watchProductId);
      }
    }, 500); // Wait 500ms after typing stops
    
    return () => clearTimeout(handler);
  }, [watchProductId, mode]);

  // Watch category, brand and product_name to update product_id
  const watchCategory = form.watch("category");
  const watchBrand = form.watch("brand");
  const watchProductName = form.watch("product_name");

  React.useEffect(() => {
    // Only generate ID automatically in add mode and if product_id is empty
    if (mode === "add" && !form.getValues("product_id")) {
      const generatedId = generateProductId();
      if (generatedId) {
        form.setValue("product_id", generatedId);
      }
    }
  }, [watchCategory, watchBrand, watchProductName, mode]);

  async function onSubmit(values: FormSchema) {
    try {
      // Check for duplicate product ID before submitting in "add" mode
      if (mode === "add") {
        const isDuplicate = await checkProductIdExists(values.product_id);
        if (isDuplicate) {
          setFormMessage({
            type: "error",
            message: "Cannot add product: Product ID already exists. Please use a different ID.",
          });
          return; // Stop form submission
        }
      }
      
      setIsSubmitting(true);
      setFormMessage(null); // Clear previous messages
      const token = localStorage.getItem("token");
      const formData = new FormData();

      // Append all text fields
      Object.entries(values).forEach(([key, value]) => {
        if (key !== "image") {
          if (key === "store_price" && typeof value === "string") {
            // Convert formatted price string back to number before sending
            formData.append(key, String(Number(value.replace(/,/g, ""))));
          } else {
            formData.append(key, String(value));
          }
        }
      });

      // Only append image if a new one is selected
      if (values.image?.[0]) {
        formData.append("image", values.image[0]);
      } else if (mode === "edit" && initialData?.image_url) {
        // If editing and no new image, keep the existing one (send URL or handle on backend)
        // Depending on backend logic, you might not need to send anything,
        // or send the existing URL to indicate no change.
        // Let's assume backend preserves image if 'image' field is not sent.
        // If backend requires image_url, uncomment below:
        // formData.append("image_url", initialData.image_url);
      }

      const endpoint =
        mode === "add"
          ? `${import.meta.env.VITE_API_URL}/api/product`
          : `${import.meta.env.VITE_API_URL}/api/product/${values.product_id}`;

      const response = await fetch(endpoint, {
        method: mode === "add" ? "POST" : "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          // 'Content-Type' is not set for FormData; browser sets it with boundary
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        throw new Error(`HTTP error! status: ${response.status}, Message: ${errorData.message || 'Failed to process request'}`);
      }

      setFormMessage({
        type: "success",
        message:
          mode === "add"
            ? "Product added successfully!"
            : "Product updated successfully!",
      });

      setTimeout(() => {
        onSuccess?.(); // Close dialog
        // navigate(0); // Refresh page - consider a better state update instead
      }, 1500);
    } catch (error: any) {
        console.error(`Failed to ${mode} product:`, error);
        setFormMessage({
            type: "error",
            message: `Failed to ${mode} product: ${error.message || 'Please try again.'}`,
        });
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
      form.setValue("store_price", value);
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
        form.setValue(
          "store_price",
          number.toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })
        );
      } else {
        // Handle cases where the input might be invalid after blur (e.g., just ".")
        // Optionally clear or reset, here we just format 0.00
         form.setValue("store_price", (0).toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }));
      }
    } else {
        // If the field is empty on blur, set it to formatted zero or keep empty
         form.setValue("store_price", ""); // Or format 0.00 if preferred
    }
  };

  return (
    <Form {...form}>
      {/* Use grid for two-column layout */}
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="grid grid-cols-1 md:grid-cols-3 gap-6" /* Changed to grid layout */
      >
        {/* Left Column: Image */}
        <div className="md:col-span-1 space-y-4">
          <FormField
            control={form.control}
            name="image"
            render={({ field: { onChange, value, ...fieldProps } }) => (
              <FormItem>
                <FormLabel>Product Image</FormLabel>
                <FormControl>
                  <div className="space-y-4">
                    {/* Image Preview Area */}
                    <div className="w-full h-auto max-h-48 flex items-center justify-center border rounded-md overflow-hidden bg-muted/30">
                      <img
                        src={previewSrc}
                        alt="Product preview"
                        className="w-full h-full object-contain"
                      />
                    </div>
                    {/* File Input */}
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageChange(e.target.files)}
                      {...fieldProps}
                    />
                    {selectedFileName && (
                      <p className="text-sm text-muted-foreground">
                        Selected file: {selectedFileName}
                      </p>
                    )}
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Right Column: Other Fields */}
        <div className="md:col-span-2 space-y-4"> {/* Takes 2 columns on medium+ screens */}
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
          <FormField
            control={form.control}
            name="product_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Product ID</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input 
                      {...field} 
                      disabled={mode === "edit"} 
                      className={productIdState.isDuplicate ? "border-red-500 pr-10" : ""}
                    />
                    {productIdState.isChecking && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <div className="w-4 h-4 border-2 border-gray-500 border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    )}
                  </div>
                </FormControl>
                {productIdState.message && (
                  <p className={`text-sm mt-1 ${productIdState.isDuplicate ? "text-red-500 font-medium" : "text-green-600"}`}>
                    {productIdState.message}
                  </p>
                )}
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Category</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        role="combobox"
                        className={cn(
                          "w-full justify-between",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value
                          ? categories.find(
                              (category) => category === field.value
                            ) || field.value
                          : "Select category"}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </FormControl>
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
                              onSelect={() => {
                                form.setValue("category", category);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  field.value === category
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
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="brand"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Brand</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        role="combobox"
                        className={cn(
                          "w-full justify-between",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value
                          ? brands.find(
                              (brand) => brand === field.value
                            ) || field.value
                          : "Select brand"}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </FormControl>
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
                              onSelect={() => {
                                form.setValue("brand", brand);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  field.value === brand
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
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="product_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Product Name</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {/* Grid for Status and Quantity */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select value={field.value} disabled>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="In Stock">In Stock</SelectItem>
                      <SelectItem value="Out of Stock">Out of Stock</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="quantity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Quantity</FormLabel>
                  <FormControl>
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => handleQuantityChange(-1)}
                        disabled={field.value <= 0}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <Input
                        type="number"
                        {...field}
                        min={0}
                        className="w-16 text-center"
                        onChange={(e) => {
                          const val = parseInt(e.target.value, 10);
                          field.onChange(isNaN(val) || val < 0 ? 0 : val);
                        }}
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
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={form.control}
            name="store_price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Store Price (PHP)</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="text" // Keep as text to allow commas/decimals during typing
                    placeholder="0.00"
                    onChange={handlePriceChange} // Use updated change handler
                    onBlur={handlePriceBlur} // Add the blur handler for formatting
                    value={field.value || ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Footer spanning both columns */}
        <DialogFooter className="md:col-span-3"> {/* Span all 3 columns */}
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
              {mode === "add" ? "Add Product" : "Update Product"}
            </span>
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
}

export default ProductForm;
