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
  product_name: string;
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
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
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
    // Read stored product IDs and quantities
    const stored = localStorage.getItem('cartItems');
    const localItems: Array<{ product_id: string; quantity: number }> = stored ? JSON.parse(stored) : [];
    if (localItems.length === 0) {
      setCartItems([]);
      setLoading(false);
      return;
    }
    // Fetch up-to-date product details
    try {
      const response = await fetch(`${API_URL}/api/cart/details`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productIds: localItems.map(i => i.product_id) })
      });
      if (!response.ok) throw new Error('Failed to fetch product details');
      const details: Array<{ product_id: string; product_name: string; store_price: number; image_url: string | null; stock: number }> = await response.json();
      // Merge stored quantities with details
      const merged: CartItem[] = details.map(d => {
        const local = localItems.find(i => i.product_id === d.product_id)!;
        return { ...d, quantity: Math.min(local.quantity, d.stock) };
      });
      setCartItems(merged);
    } catch (err) {
      console.error('Error loading cart items:', err);
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
    // Filter cart items to only include selected ones
    const selectedProducts = cartItems.filter(item => 
      selectedItems.includes(item.product_id)
    );
    
    // Store selected items in localStorage
    localStorage.setItem('checkoutItems', JSON.stringify(selectedProducts));
    // Keep cart intact until order succeeds; just clear selection
    setSelectedItems([]);
    
    setOpen(false);
    navigate('/checkout');
  };

  const toggleItemSelection = (productId: string) => {
    setSelectedItems(prev => {
      if (prev.includes(productId)) {
        return prev.filter(id => id !== productId);
      } else {
        return [...prev, productId];
      }
    });
  };

  const handleQuantityChange = (productId: string, newQuantity: number) => {
    // clamp to stock
    const updated = cartItems.map(item =>
      item.product_id === productId
        ? { ...item, quantity: Math.min(newQuantity, item.stock) }
        : item
    );
    setCartItems(updated);
    // Update localStorage stored quantities
    const storedArr = JSON.parse(localStorage.getItem('cartItems') || '[]');
    const synced = storedArr.map((i: any) =>
      i.product_id === productId ? { ...i, quantity: Math.min(newQuantity, updated.find(u => u.product_id === productId)!.stock) } : i
    );
    localStorage.setItem('cartItems', JSON.stringify(synced));
  };

  const handleRemoveItem = (productId: string) => {
    const updated = cartItems.filter(item => item.product_id !== productId);
    setCartItems(updated);
    setSelectedItems(prev => prev.filter(id => id !== productId));
    localStorage.setItem('cartItems', JSON.stringify(updated));
  };

  const getTotal = () => {
    return cartItems
      .filter(item => selectedItems.includes(item.product_id))
      .reduce((sum, item) => sum + (item.store_price * item.quantity), 0);
  };

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
                      <TableHead className="w-[50px]"></TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                      <TableHead className="w-[100px]">Image</TableHead>
                      <TableHead className="max-w-[150px] sm:max-w-[180px]">Product Name</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {cartItems.map((item) => (
                      <TableRow
                        key={item.product_id}
                        className="align-middle cursor-pointer"
                        onClick={() => toggleItemSelection(item.product_id)}
                      >
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => { e.stopPropagation(); handleRemoveItem(item.product_id); }}
                            className="h-8 w-8 p-0"
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </TableCell>
                        <TableCell
                          className="align-middle hover:cursor-pointer"
                          onClick={() => toggleItemSelection(item.product_id)}
                        >
                          <Checkbox
                            checked={selectedItems.includes(item.product_id)}
                            onCheckedChange={() => toggleItemSelection(item.product_id)}
                            className="cursor-pointer"
                          />
                        </TableCell>
                        <TableCell>
                          <img
                            src={item.image_url || "https://placehold.co/100"}
                            alt={item.product_name}
                            className="w-[100px] h-[100px] object-cover"
                          />
                        </TableCell>
                        <TableCell className="font-medium max-w-[150px] sm:max-w-[180px] py-4">
                          <span className="block">
                            {item.product_name}
                          </span>
                        </TableCell>
                        <TableCell className="text-center" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center gap-2" onClick={(e: React.MouseEvent<HTMLElement>) => e.stopPropagation()}>
                            <QuantityInput 
                              value={item.quantity}
                              onChange={(newValue) => handleQuantityChange(item.product_id, newValue)}
                              min={1}
                              max={item.stock}
                            />
                          </div>
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
                    key={item.product_id}
                    className="relative bg-card rounded-lg shadow p-4 border flex flex-col gap-3 cursor-pointer"
                    onClick={() => toggleItemSelection(item.product_id)}
                  >
                    <div className="flex items-start gap-3">
                      <Checkbox 
                        checked={selectedItems.includes(item.product_id)}
                        onCheckedChange={() => toggleItemSelection(item.product_id)}
                        className="mt-1"
                      />
                      <img
                        src={item.image_url || "https://placehold.co/60"}
                        alt={item.product_name}
                        className="w-[60px] h-[60px] object-cover rounded"
                      />
                      <div className="flex-1 min-h-[60px] flex flex-col justify-between">
                        <span className="font-medium line-clamp-2">
                          {item.product_name}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => { e.stopPropagation(); handleRemoveItem(item.product_id); }}
                          className="h-6 w-6 p-0 self-end"
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>

                    <div
                      className="flex items-center px-2 py-1 bg-muted/30 rounded"
                      onClick={(e: React.MouseEvent<HTMLElement>) => e.stopPropagation()}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">Quantity:</span>
                        <QuantityInput 
                          value={item.quantity} 
                          onChange={(newValue) => handleQuantityChange(item.product_id, newValue)}
                          min={1}
                          max={item.stock}
                        />
                      </div>
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
