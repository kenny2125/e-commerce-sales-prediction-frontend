import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Search, Plus, Trash, Loader2 } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { useUser } from "@/contexts/UserContext";

// Define interfaces
interface Product {
  variant_id: string; // ID of the product variant
  product_id: string; // ID of the parent product
  product_name: string;
  sku: string; // SKU of the variant
  variant_name: string;
  store_price: number;
  quantity: number; // For stock availability
}

interface OrderItem {
  product_id: string; // This will now be the variant_id
  product_name: string;
  sku: string; // SKU for tracking
  variant_name: string;
  quantity: number;
  price_at_time: number;
}

interface AddOrderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onOrderAdded: () => void;
}

export function AddOrderDialog({ open, onOpenChange, onOrderAdded }: AddOrderDialogProps) {
  // Order form state
  const [customerName, setCustomerName] = useState('');
  const [companyName, setCompanyName] = useState(''); // Add business/company name
  const [address, setAddress] = useState('');
  // Initialize Philippine mobile prefix (+639)
  const [contactNumber, setContactNumber] = useState('+639');
  const [notes, setNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [pickupMethod, setPickupMethod] = useState('Pickup');
  const [items, setItems] = useState<OrderItem[]>([]);
  
  // Product search state
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isProductDialogOpen, setIsProductDialogOpen] = useState(false);
  
  // Add product form state
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [productQuantity, setProductQuantity] = useState(1);
  
  // Form submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Validation state
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  
  // Get users from context
  const { currentUser } = useUser();

  // Format currency helper
  const formatCurrency = (value?: number) => {
    if (value == null) return 'PHP 0.00';
    return new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(value);
  };

  // Customer field validation
  const validateField = (field: string, value: string): string => {
    switch (field) {
      case 'customerName':
        if (!value.trim()) return 'Customer name is required';
        if (!/^[A-Za-z\s]+$/.test(value)) return 'Name should contain only letters and spaces';
        if (value.length > 100) return 'Name cannot exceed 100 characters';
        return '';
      case 'companyName':
        if (value.length > 100) return 'Company name cannot exceed 100 characters';
        return '';
      case 'address':
        if (!value.trim()) return 'Address is required';
        if (value.length > 255) return 'Address cannot exceed 255 characters';
        return '';
      case 'contactNumber':
        // Remove any internal whitespace
        const cleaned = value.replace(/\s+/g, '').trim();
        if (!cleaned) return 'Contact number is required';
        if (!/^\+639\d{9}$/.test(cleaned)) return 'Phone must be in format +639XXXXXXXXX';
        return '';
      default:
        return '';
    }
  };

  const handleBlur = (field: 'customerName' | 'address' | 'contactNumber' | 'companyName') => {
    setTouched(prev => ({ ...prev, [field]: true }));
    const value = field === 'customerName' ? customerName : field === 'address' ? address : field === 'contactNumber' ? contactNumber : companyName;
    const err = validateField(field, value);
    setErrors(prev => ({ ...prev, [field]: err }));
  };

  const hasFormErrors = () => {
    const customerFields: Array<'customerName' | 'address' | 'contactNumber' | 'companyName'> = ['customerName', 'address', 'contactNumber', 'companyName'];
    const newErrors: Record<string, string> = {};
    customerFields.forEach(field => {
      const value = field === 'customerName' ? customerName : field === 'address' ? address : field === 'contactNumber' ? contactNumber : companyName;
      const err = validateField(field, value);
      if (err) newErrors[field] = err;
    });
    setErrors(newErrors);
    setTouched(customerFields.reduce((acc, f) => ({ ...acc, [f]: true }), {} as Record<string, boolean>));
    return Object.keys(newErrors).length > 0;
  };

  // Handle contact number input to enforce +639 prefix and max length
  const handleContactChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Remove whitespace as user types
    let value = e.target.value.replace(/\s+/g, '');
    
    // Ensure prefix +639 remains
    if (!value.startsWith('+639')) {
      value = '+639';
    }
    
    // Limit to +639 + 9 digits = max length 13
    if (value.length > 13) {
      value = value.slice(0, 13);
    }
    
    setContactNumber(value);
    
    // Only show error if we have a complete phone number that is invalid
    // This allows users to type without seeing errors until they finish
    if (value.length === 13) {
      const err = validateField('contactNumber', value);
      setErrors(prev => ({ ...prev, contactNumber: err }));
    } else {
      // Clear error while typing
      setErrors(prev => ({ ...prev, contactNumber: '' }));
    }
  };

  // Search products handler
  const handleSearchProducts = async () => {
    if (!searchTerm.trim()) return;
    
    setIsSearching(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/product/variant-search?query=${encodeURIComponent(searchTerm)}`, {
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to search products');
      }
      
      const data = await response.json();
      setSearchResults(data);
      setIsProductDialogOpen(true);
    } catch (error) {
      console.error('Error searching products:', error);
      toast.error('Failed to search products');
    } finally {
      setIsSearching(false);
    }
  };

  // Add product to order
  const addProductToOrder = () => {
    if (!selectedProduct) return;
    
    if (productQuantity <= 0) {
      toast.error('Quantity must be greater than zero');
      return;
    }
    
    if (productQuantity > selectedProduct.quantity) {
      toast.error(`Only ${selectedProduct.quantity} items in stock`);
      return;
    }
    
    // Check if product variant already exists in order using variant_id and SKU
    const existingItemIndex = items.findIndex(item => 
      item.product_id === selectedProduct.variant_id && 
      item.sku === selectedProduct.sku
    );
    
    if (existingItemIndex >= 0) {
      // Update existing item
      const updatedItems = [...items];
      const newQuantity = updatedItems[existingItemIndex].quantity + productQuantity;
      
      if (newQuantity > selectedProduct.quantity) {
        toast.error(`Cannot add more than ${selectedProduct.quantity} items`);
        return;
      }
      
      updatedItems[existingItemIndex].quantity = newQuantity;
      setItems(updatedItems);
    } else {
      // Add new item with variant information
      setItems([
        ...items,
        {
          product_id: selectedProduct.variant_id,
          product_name: selectedProduct.product_name,
          sku: selectedProduct.sku,
          variant_name: selectedProduct.variant_name,
          quantity: productQuantity,
          price_at_time: selectedProduct.store_price
        }
      ]);
    }
    
    // Reset product selection
    setSelectedProduct(null);
    setProductQuantity(1);
    setSearchTerm('');
    setIsProductDialogOpen(false);
  };

  // Remove product from order
  const removeProductFromOrder = (productId: string) => {
    setItems(items.filter(item => item.product_id !== productId));
  };

  // Calculate order total
  const calculateTotal = () => {
    return items.reduce((total, item) => total + (item.quantity * item.price_at_time), 0);
  };

  // Submit order
  const handleSubmitOrder = async () => {
    // Validate customer info before other checks
    if (hasFormErrors()) return;

    if (items.length === 0) {
      toast.error('Please add at least one product');
      return;
    }
    
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      // Format the order data
      const orderData = {
        payment_method: paymentMethod,
        pickup_method: pickupMethod,
        purpose: notes,
        items: items.map(item => ({
          product_id: item.product_id,
          sku: item.sku,
          quantity: item.quantity
        })),
        // Send customer info from the input fields
        customer_info: {
          name: customerName,
          company_name: companyName,
          address,
          phone: contactNumber
        }
      };

      // Fix: Use the correct API endpoint path that exists in the backend
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/orders/admin/orders`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create order');
      }
      
      toast.success('Order created successfully');
      onOrderAdded(); // Refresh orders list
      onOpenChange(false); // Close dialog
      
      // Reset form
      setCustomerName('');
      setCompanyName('');
      setAddress('');
      setContactNumber('+639');
      setNotes('');
      setPaymentMethod('COD');
      setPickupMethod('Pickup');
      setItems([]);
    } catch (error) {
      console.error('Error creating order:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to create order');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="p-0 gap-0 max-w-[98vw] min-w-[1200px] h-[90vh]">
          <div className="flex flex-col h-full overflow-hidden">
            <DialogHeader className="p-5 pb-2 border-b">
              <DialogTitle className="text-2xl font-bold">Add New Order</DialogTitle>
            </DialogHeader>
            
            <div className="flex-1 overflow-auto px-6">
              <div className="grid grid-cols-12 gap-8 py-5">
                {/* Customer Information */}
                <Card className="col-span-4 border-0 shadow-none">
                  <CardContent className="pt-3">
                    <h2 className="text-xl font-bold mb-4">Customer Information</h2>
                    <div className="space-y-4">
                      <div className="grid w-full items-center gap-1.5">
                        <Label htmlFor="customerName">Customer Name</Label>
                        <Input 
                          id="customerName" 
                          value={customerName}
                          onChange={(e) => setCustomerName(e.target.value)}
                          onBlur={() => handleBlur('customerName')}
                          placeholder="Enter customer name"
                        />
                        {errors.customerName && touched.customerName && (
                          <p className="text-xs text-red-500">{errors.customerName}</p>
                        )}
                      </div>

                      <div className="grid w-full items-center gap-1.5">
                        <Label htmlFor="companyName">Business/Company Name</Label>
                        <Input 
                          id="companyName" 
                          value={companyName}
                          onChange={(e) => setCompanyName(e.target.value)}
                          onBlur={() => handleBlur('companyName')}
                          placeholder="Enter business or company name (optional)"
                        />
                        {errors.companyName && touched.companyName && (
                          <p className="text-xs text-red-500">{errors.companyName}</p>
                        )}
                      </div>
                      
                      <div className="grid w-full items-center gap-1.5">
                        <Label htmlFor="address">Address</Label>
                        <Input 
                          id="address" 
                          value={address}
                          onChange={(e) => setAddress(e.target.value)}
                          onBlur={() => handleBlur('address')}
                          placeholder="Enter address"
                        />
                        {errors.address && touched.address && (
                          <p className="text-xs text-red-500">{errors.address}</p>
                        )}
                      </div>
                      
                      <div className="grid w-full items-center gap-1.5">
                        <Label htmlFor="contactNumber">Contact Number</Label>
                        <Input
                          id="contactNumber"
                          type="tel"
                          value={contactNumber}
                          onChange={handleContactChange}
                          onBlur={() => handleBlur('contactNumber')}
                          placeholder="+639XXXXXXXXX"
                        />
                        {errors.contactNumber && touched.contactNumber && (
                          <p className="text-xs text-red-500">{errors.contactNumber}</p>
                        )}
                      </div>
                      
                      <div className="grid w-full items-center gap-1.5">
                        <Label htmlFor="notes">Notes/Purpose</Label>
                        <Textarea 
                          id="notes" 
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          placeholder="Enter notes or purpose of order"
                        />
                      </div>
                      
                      <div className="grid w-full items-center gap-1.5">
                        <Label htmlFor="paymentMethod">Payment Method</Label>
                        <Select 
                          value={paymentMethod}
                          onValueChange={setPaymentMethod}
                        >
                          <SelectTrigger id="paymentMethod">
                            <SelectValue placeholder="Select payment method" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="COD">Cash on Delivery</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="grid w-full items-center gap-1.5">
                        <Label htmlFor="pickupMethod">Delivery Method</Label>
                        <Select 
                          value={pickupMethod}
                          onValueChange={setPickupMethod}
                        >
                          <SelectTrigger id="pickupMethod">
                            <SelectValue placeholder="Select delivery method" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Pickup">Pickup</SelectItem>
                            <SelectItem value="Delivery">Delivery</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Order Items */}
                <div className="col-span-8">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">Order Items</h2>
                    <div className="flex gap-2">
                      <div className="relative flex items-center">
                        <Input 
                          placeholder="Search products..." 
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="w-[250px] pr-8"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              handleSearchProducts();
                            }
                          }}
                        />
                        <button 
                          className="absolute right-2 text-gray-500 hover:text-gray-700"
                          onClick={handleSearchProducts}
                          disabled={isSearching}
                        >
                          {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  <Table className="border rounded-md">
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead className="w-[50%]">Product</TableHead>
                        <TableHead className="text-right">Quantity</TableHead>
                        <TableHead className="text-right">Price</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                        <TableHead className="w-[50px]"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {items.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                            No items added to this order yet. Search for products to add them.
                          </TableCell>
                        </TableRow>
                      ) : (
                        items.map((item) => {
                          const lineTotal = item.quantity * item.price_at_time;
                          return (
                            <TableRow key={item.product_id}>
                              <TableCell className="font-medium">
                                {item.product_name}
                                <span className="block text-sm text-muted-foreground">
                                  {item.variant_name}
                                </span>
                                <span className="block text-xs text-muted-foreground">
                                  SKU: {item.sku}
                                </span>
                              </TableCell>
                              <TableCell className="text-right">{item.quantity}</TableCell>
                              <TableCell className="text-right">{formatCurrency(item.price_at_time)}</TableCell>
                              <TableCell className="text-right">{formatCurrency(lineTotal)}</TableCell>
                              <TableCell>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => removeProductFromOrder(item.product_id)}
                                >
                                  <Trash className="h-4 w-4 text-red-500" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          );
                        })
                      )}
                    </TableBody>
                    <TableFooter>
                      <TableRow>
                        <TableCell colSpan={3} className="font-semibold">Grand Total</TableCell>
                        <TableCell className="text-right font-semibold text-lg">
                          {formatCurrency(calculateTotal())}
                        </TableCell>
                        <TableCell></TableCell>
                      </TableRow>
                    </TableFooter>
                  </Table>
                </div>
              </div>
            </div>
            
            <DialogFooter className="p-5 py-3 border-t mt-auto">
              <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button onClick={handleSubmitOrder} disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Order...
                  </>
                ) : 'Create Order'}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* Product search results dialog */}
      <CommandDialog open={isProductDialogOpen} onOpenChange={setIsProductDialogOpen}>
        <CommandInput 
          placeholder="Search products or SKUs..." 
          value={searchTerm}
          onValueChange={setSearchTerm}
        />
        <CommandList>
          <CommandEmpty>No products found.</CommandEmpty>
          <CommandGroup heading="Products">
            {searchResults.map((product) => (
              <CommandItem
                key={product.variant_id}
                onSelect={() => {
                  setSelectedProduct(product);
                  setIsProductDialogOpen(false);
                }}
              >
                <div className="flex justify-between items-center w-full">
                  <div className="flex flex-col">
                    <span>{product.product_name}</span>
                    <span className="text-xs text-muted-foreground">
                      {product.variant_name} - SKU: {product.sku}
                    </span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {formatCurrency(product.store_price)} • {product.quantity} in stock
                  </span>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>

      {/* Product quantity dialog */}
      {selectedProduct && (
        <Dialog open={!!selectedProduct} onOpenChange={(open) => {
          if (!open) setSelectedProduct(null);
        }}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add Product to Order</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div>
                <h3 className="font-medium">{selectedProduct.product_name}</h3>
                <p className="text-sm text-muted-foreground">
                  Price: {formatCurrency(selectedProduct.store_price)} • Available: {selectedProduct.quantity}
                </p>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="quantity" className="text-right">
                  Quantity
                </Label>
                <Input
                  id="quantity"
                  type="number"
                  value={productQuantity}
                  onChange={(e) => setProductQuantity(parseInt(e.target.value) || 1)}
                  min={1}
                  max={selectedProduct.quantity}
                  className="col-span-3"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setSelectedProduct(null)}>
                Cancel
              </Button>
              <Button onClick={addProductToOrder}>
                Add to Order
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}