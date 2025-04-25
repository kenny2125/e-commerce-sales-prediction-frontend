import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ShoppingCart, Trash2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { QuantityInput } from "@/components/ui/quantity-input";
import { useUser } from "@/contexts/UserContext";
import { LogInDialog } from "@/components/dialogs/LogInDialog";

// Use API to fetch up‑to‑date product info
const API_URL = import.meta.env.VITE_API_URL;

interface CartItem {
  product_id: string;
  sku: string; // Added SKU
  product_name: string;
  variant_name: string | null; // Added variant name
  quantity: number;
  store_price: number;
  image_url: string | null;
  stock: number;
}

export function CartDialog() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const { currentUser } = useUser();
  const [loginDialogOpen, setLoginDialogOpen] = useState(false);
  const [selectedItems, setSelectedItems] = useState<string[]>([]); // Store composite key "product_id-sku"
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // Using localStorage for cart persistence

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Fetch cart items when dialog opens
  useEffect(() => {
    if (open) {
      fetchCartItems();
    }
  }, [open]);

  const fetchCartItems = async () => {
    setLoading(true);
    // Read stored product IDs, SKUs, and quantities
    const stored = localStorage.getItem('cartItems');
    // Expecting format: { product_id: string, sku: string, quantity: number }[]
    const localItems: Array<{ product_id: string; sku: string; quantity: number }> = stored ? JSON.parse(stored) : [];

    if (localItems.length === 0) {
      setCartItems([]);
      setLoading(false);
      return;
    }

    // Fetch up-to-date product variant details
    try {
      // *** IMPORTANT: Update this endpoint on your backend ***
      const response = await fetch(`${API_URL}/api/cart/variant-details`, { // Assuming a new/updated endpoint
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // Send product_id and sku pairs
        body: JSON.stringify({ items: localItems.map(i => ({ product_id: i.product_id, sku: i.sku })) })
      });

      if (!response.ok) throw new Error('Failed to fetch product variant details');

      // Expecting format: { product_id: string, sku: string, product_name: string, variant_name: string | null, store_price: number, image_url: string | null, stock: number }[]
      const details: Array<Omit<CartItem, 'quantity'>> = await response.json();

      // Merge stored quantities with fetched details
      const merged: CartItem[] = details.map(d => {
        const local = localItems.find(i => i.product_id === d.product_id && i.sku === d.sku);
        // Clamp quantity based on fetched stock, ensure local item exists
        const quantity = local ? Math.min(local.quantity, d.stock) : 0;
        return { ...d, quantity };
      }).filter(item => item.quantity > 0); // Filter out items that might have become unavailable or had quantity 0

      setCartItems(merged);

      // Update localStorage with potentially clamped quantities
      const updatedLocalItems = merged.map(item => ({ product_id: item.product_id, sku: item.sku, quantity: item.quantity }));
      localStorage.setItem('cartItems', JSON.stringify(updatedLocalItems));

      // Clear selection if items change significantly (optional, but safer)
      setSelectedItems([]);

    } catch (err) {
      console.error('Error loading cart items:', err);
      // Potentially clear local cart if fetch fails badly?
      // localStorage.removeItem('cartItems');
      setCartItems([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckout = () => {
    if (!currentUser) {
      setLoginDialogOpen(true);
      return;
    }
    // Filter cart items to only include selected ones based on composite key
    const selectedProducts = cartItems.filter(item =>
      selectedItems.includes(`${item.product_id}-${item.sku}`)
    );

    if (selectedProducts.length === 0) {
        // Maybe show a toast message?
        console.log("No items selected for checkout.");
        return;
    }

    // Store selected items (full details) in localStorage for checkout page
    localStorage.setItem('checkoutItems', JSON.stringify(selectedProducts));

    // Option 1: Remove selected items from cart immediately
    // const remainingCartItems = cartItems.filter(item =>
    //   !selectedItems.includes(`${item.product_id}-${item.sku}`)
    // );
    // setCartItems(remainingCartItems);
    // localStorage.setItem('cartItems', JSON.stringify(remainingCartItems.map(i => ({ product_id: i.product_id, sku: i.sku, quantity: i.quantity }))));

    // Option 2: Keep cart intact, just clear selection (current approach)
    setSelectedItems([]);

    setOpen(false);
    navigate('/checkout');
  };

  // Use composite key "product_id-sku" for selection
  const toggleItemSelection = (productId: string, sku: string) => {
    const compositeKey = `${productId}-${sku}`;
    setSelectedItems(prev => {
      if (prev.includes(compositeKey)) {
        return prev.filter(key => key !== compositeKey);
      } else {
        return [...prev, compositeKey];
      }
    });
  };

  const handleQuantityChange = (productId: string, sku: string, newQuantity: number) => {
    let updatedCartItems: CartItem[] = [];
    const clampedQuantity = Math.max(1, newQuantity); // Ensure quantity is at least 1

    setCartItems(currentItems => {
        updatedCartItems = currentItems.map(item => {
            if (item.product_id === productId && item.sku === sku) {
                // Clamp quantity based on stock
                const finalQuantity = Math.min(clampedQuantity, item.stock);
                return { ...item, quantity: finalQuantity };
            }
            return item;
        });
        return updatedCartItems;
    });

    // Update localStorage stored quantities
    const stored = localStorage.getItem('cartItems');
    const storedArr: Array<{ product_id: string; sku: string; quantity: number }> = stored ? JSON.parse(stored) : [];
    const synced = storedArr.map(i => {
        if (i.product_id === productId && i.sku === sku) {
            const itemInCart = updatedCartItems.find(u => u.product_id === productId && u.sku === sku);
            // Use the stock from the fetched cart item for clamping
            const stock = itemInCart ? itemInCart.stock : 0;
            return { ...i, quantity: Math.min(clampedQuantity, stock) };
        }
        return i;
    }).filter(i => i.quantity > 0); // Also filter here if quantity becomes 0
    localStorage.setItem('cartItems', JSON.stringify(synced));
  };

  const handleRemoveItem = (productId: string, sku: string) => {
    const compositeKey = `${productId}-${sku}`;
    // Update cartItems state
    const updatedCart = cartItems.filter(item => !(item.product_id === productId && item.sku === sku));
    setCartItems(updatedCart);

    // Update selection state
    setSelectedItems(prev => prev.filter(key => key !== compositeKey));

    // Update localStorage
    const stored = localStorage.getItem('cartItems');
    const storedArr: Array<{ product_id: string; sku: string; quantity: number }> = stored ? JSON.parse(stored) : [];
    const updatedStoredArr = storedArr.filter(item => !(item.product_id === productId && item.sku === sku));
    localStorage.setItem('cartItems', JSON.stringify(updatedStoredArr));
  };

  const getTotal = () => {
    return cartItems
      .filter(item => selectedItems.includes(`${item.product_id}-${item.sku}`))
      .reduce((sum, item) => sum + (item.store_price * item.quantity), 0);
  };

  // Composite key for React lists
  const getItemKey = (item: CartItem) => `${item.product_id}-${item.sku}`;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="h-10 w-10 p-1"
          aria-label="Shopping cart"
        >
          <ShoppingCart className="h-5 w-5 text-primary" />
        </Button>
      </DialogTrigger>

      <DialogContent className="flex flex-col sm:max-w-[1000px] min-h-[577px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex flex-row align-middle items-center gap-2">
            <ShoppingCart size={40} className="text-primary" />
            <DialogTitle>My Cart</DialogTitle>
          </div>
          <DialogDescription>
            Review your cart items before proceeding to create an invoice.
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex-1 overflow-x-auto">
          {loading ? (
            <div className="flex justify-center items-center h-40">
              Loading cart items...
            </div>
          ) : cartItems.length === 0 ? (
            <div className="flex justify-center items-center h-40">
              Your cart is empty
            </div>
          ) : (
            <>
              {/* Desktop View */}
              <div className="hidden md:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[50px]"></TableHead> {/* Remove */}
                      <TableHead className="w-[50px]"></TableHead> {/* Select */}
                      <TableHead className="w-[100px]">Image</TableHead>
                      <TableHead className="max-w-[150px] sm:max-w-[180px]">Product</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {cartItems.map((item) => (
                      <TableRow
                        key={getItemKey(item)} // Use composite key
                        className="align-middle cursor-pointer"
                        onClick={() => toggleItemSelection(item.product_id, item.sku)} // Use composite key
                      >
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => { e.stopPropagation(); handleRemoveItem(item.product_id, item.sku); }} // Use composite key
                            className="h-8 w-8 p-0"
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </TableCell>
                        <TableCell
                          className="align-middle hover:cursor-pointer"
                          onClick={(e) => { e.stopPropagation(); toggleItemSelection(item.product_id, item.sku); }} // Use composite key
                        >
                          <Checkbox
                            checked={selectedItems.includes(getItemKey(item))} // Use composite key
                            onCheckedChange={() => toggleItemSelection(item.product_id, item.sku)} // Use composite key
                            className="cursor-pointer"
                          />
                        </TableCell>
                        <TableCell>
                          <img
                            src={item.image_url || "https://placehold.co/100"}
                            alt={item.product_name + (item.variant_name ? ` - ${item.variant_name}` : '')}
                            className="w-[100px] h-[100px] object-cover"
                          />
                        </TableCell>
                        <TableCell className="font-medium max-w-[150px] sm:max-w-[180px] py-4">
                          <span className="block">
                            {item.product_name}
                          </span>
                          {/* Display Variant Name or SKU */}
                          {(item.variant_name || item.sku) && (
                            <span className="block text-sm text-muted-foreground">
                              {item.variant_name || `SKU: ${item.sku}`}
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-center" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-center gap-2" onClick={(e: React.MouseEvent<HTMLElement>) => e.stopPropagation()}> {/* Centered */}
                            <QuantityInput
                              value={item.quantity}
                              onChange={(newValue) => handleQuantityChange(item.product_id, item.sku, newValue)} // Use composite key
                              min={1}
                              max={item.stock}
                            />
                          </div>
                           <span className="text-xs text-muted-foreground block mt-1">Stock: {item.stock}</span>
                        </TableCell>
                        <TableCell className="text-right">
                          ₱{(item.store_price * item.quantity).toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                  <TableFooter>
                    <TableRow>
                      <TableCell colSpan={5} className="text-right font-bold">Total</TableCell>
                      <TableCell className="text-right font-bold">
                        ₱{getTotal().toLocaleString()}
                      </TableCell>
                    </TableRow>
                  </TableFooter>
                </Table>
              </div>

              {/* Mobile View */}
              <div className="md:hidden space-y-3 overflow-y-auto max-h-[60vh]">
                {cartItems.map((item) => (
                  <div
                    key={getItemKey(item)} // Use composite key
                    className="relative bg-card rounded-lg shadow p-4 border flex flex-col gap-3 cursor-pointer"
                    onClick={() => toggleItemSelection(item.product_id, item.sku)} // Use composite key
                  >
                    <div className="flex items-start gap-3">
                      <Checkbox
                        checked={selectedItems.includes(getItemKey(item))} // Use composite key
                        onCheckedChange={() => toggleItemSelection(item.product_id, item.sku)} // Use composite key
                        className="mt-1"
                      />
                      <img
                        src={item.image_url || "https://placehold.co/60"}
                        alt={item.product_name + (item.variant_name ? ` - ${item.variant_name}` : '')}
                        className="w-[60px] h-[60px] object-cover rounded"
                      />
                      <div className="flex-1 min-h-[60px] flex flex-col justify-between">
                        <div>
                          <span className="font-medium line-clamp-2">
                            {item.product_name}
                          </span>
                           {/* Display Variant Name or SKU */}
                           {(item.variant_name || item.sku) && (
                            <span className="block text-sm text-muted-foreground">
                              {item.variant_name || `SKU: ${item.sku}`}
                            </span>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => { e.stopPropagation(); handleRemoveItem(item.product_id, item.sku); }} // Use composite key
                          className="h-6 w-6 p-0 self-end"
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>

                    <div
                      className="flex items-center justify-between px-2 py-1 bg-muted/30 rounded"
                      onClick={(e: React.MouseEvent<HTMLElement>) => e.stopPropagation()}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">Quantity:</span>
                        <QuantityInput
                          value={item.quantity}
                          onChange={(newValue) => handleQuantityChange(item.product_id, item.sku, newValue)} // Use composite key
                          min={1}
                          max={item.stock}
                        />
                      </div>
                       <span className="text-xs text-muted-foreground">Stock: {item.stock}</span>
                    </div>

                    <div className="flex items-center px-2 py-1 bg-muted/30 rounded">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">Amount:</span>
                        <span className="font-medium">
                          ₱{(item.store_price * item.quantity).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}

                {cartItems.length > 0 && (
                  <div className="sticky bottom-0 bg-background border-t p-4 shadow-lg">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold">Total Amount:</span>
                      <span className="font-bold text-lg">
                        ₱{getTotal().toLocaleString()}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        <DialogFooter className="mt-4">
          <Button 
            type="button" 
            onClick={handleCheckout} 
            className="w-full md:w-auto"
            disabled={cartItems.length === 0 || selectedItems.length === 0 || !currentUser}
          >
            Proceed to Invoice
          </Button>
        </DialogFooter>        
      </DialogContent>
    </Dialog>
  );
}
