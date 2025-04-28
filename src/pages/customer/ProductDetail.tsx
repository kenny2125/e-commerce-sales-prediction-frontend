import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { useUser } from "@/contexts/UserContext";
import sample from "@/assets/image-placeholder.webp";
import { Button } from "@/components/ui/button";
import ProductList from "@/components/ProductList";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";
import { ShoppingCart, Trash2, X } from 'lucide-react';
import { LogInDialog } from "@/components/dialogs/LogInDialog";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  // DialogDescription, // Removed if not used
} from "@/components/ui/dialog";

interface ProductVariant {
  sku: string;
  variant_name: string | null;
  quantity: number;
  store_price: number;
  image_url: string | null;
  description?: string; // Add description field to ProductVariant interface
}

interface Product {
  product_id: string;
  category: string;
  brand: string;
  product_name: string;
  status: string;
  quantity: number; // Base product quantity (might be sum of variants or fallback)
  store_price: number; // Base product price (fallback)
  image_url: string; // Base product image (fallback)
  description?: string; // Keep product-level description as fallback
  variants: ProductVariant[]; // Now strongly typed
}

function ProductDetail() {
  const [searchParams] = useSearchParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { currentUser } = useUser();
  const [quantity, setQuantity] = useState(1);
  const [isInCart, setIsInCart] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loginDialogOpen, setLoginDialogOpen] = useState(false);
  const [imagePreviewOpen, setImagePreviewOpen] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [selectedVariantIndex, setSelectedVariantIndex] = useState(0);

  // Helper to get the currently selected variant details
  const getSelectedVariant = useCallback((): ProductVariant | null => {
    if (!product || !product.variants || product.variants.length === 0) {
      return product?.variants?.[selectedVariantIndex] ?? null;
    }
    return product.variants[selectedVariantIndex];
  }, [product, selectedVariantIndex]);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const productId = searchParams.get("id");
        if (!productId) {
          setError("Product ID not provided");
          return;
        }

        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/product/${productId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch product');
        }
        const data = await response.json();
        setProduct(data);
        setSelectedVariantIndex(0); // Reset to first variant on product change
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load product');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [searchParams]);

  // Check if the *specific selected variant* is already in user's cart
  useEffect(() => {
    if (!currentUser || currentUser.role === 'admin' || !product) return;

    const selectedVariant = getSelectedVariant();
    if (!selectedVariant) return; // Don't check if no variant is selected/available

    const stored = localStorage.getItem('cartItems');
    const items: Array<{ product_id: string; sku: string; quantity: number }> = stored ? JSON.parse(stored) : [];
    const exists = items.some(item => item.product_id === product.product_id && item.sku === selectedVariant.sku);
    setIsInCart(exists);
    // Reset quantity to 1 if the variant changes and is not in the cart
    if (!exists) {
        setQuantity(1);
    } else {
        // If it is in the cart, potentially set quantity from cart? Or keep 1? Let's keep 1 for now.
        // const cartItem = items.find(item => item.product_id === product.product_id && item.sku === selectedVariant.sku);
        // setQuantity(cartItem ? cartItem.quantity : 1);
        setQuantity(1); // Keep it simple: always reset to 1 on variant select/load
    }

  }, [currentUser, product, selectedVariantIndex, getSelectedVariant]); // Depend on selectedVariantIndex

  const handleAddToCart = useCallback(() => {
    if (!product) return;
    const selectedVariant = getSelectedVariant();
    if (!selectedVariant) {
      toast.error("Please select a variant."); // Or handle products without variants differently
      return;
    }

    // Check if item is out of stock - prevent adding to cart
    if (selectedVariant.quantity <= 0) {
      toast.error("This item is out of stock.");
      return;
    }

    setIsLoading(true);
    const stored = localStorage.getItem('cartItems');
    // Ensure items are correctly typed
    const items: Array<{ product_id: string; sku: string; quantity: number }> = stored ? JSON.parse(stored) : [];

    if (isInCart) {
      // Remove the specific variant
      const updated = items.filter(item => !(item.product_id === product.product_id && item.sku === selectedVariant.sku));
      localStorage.setItem('cartItems', JSON.stringify(updated));
      toast.success(`${product.product_name} (${selectedVariant.variant_name || selectedVariant.sku}) removed from cart`);
      setIsInCart(false);
    } else {
      // Add the specific variant - double check that quantity doesn't exceed available stock
      const requestedQuantity = Math.min(quantity, selectedVariant.quantity);
      const newItem = {
        product_id: product.product_id,
        sku: selectedVariant.sku,
        quantity: requestedQuantity
      };
      const updated = [...items, newItem];
      localStorage.setItem('cartItems', JSON.stringify(updated));
      toast.success(`${product.product_name} (${selectedVariant.variant_name || selectedVariant.sku}) added to cart`);
      setIsInCart(true);
    }
    setIsLoading(false);
  }, [isInCart, product, quantity, selectedVariantIndex, getSelectedVariant]);

  // Handlers for quantity buttons
  const incrementQuantity = () => {
    setQuantity(prev => Math.min(displayStock, prev + 1));
  };

  const decrementQuantity = () => {
    setQuantity(prev => Math.max(1, prev - 1));
  };

  const renderActionButton = () => {
    if (!product) return null;
    
    // Get stock info from selected variant
    const selectedVariant = getSelectedVariant();
    const isOutOfStock = !selectedVariant || selectedVariant.quantity <= 0;
    
    if (currentUser && currentUser.role === "admin") {
      return <Button className="w-32">View</Button>;
    }
    
    // Show add/remove to cart for all users (including guests)
    return (
      <div className="flex flex-col gap-4 items-center w-full">
        {/* Variant Selector */}
        {product.variants && product.variants.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-2 w-full max-w-sm">
            {product.variants.map((variant: ProductVariant, idx: number) => (
              <Button
                key={`${variant.sku || idx}`} // Use SKU as key if available, fallback to index
                size="sm"
                variant={selectedVariantIndex === idx ? 'default' : 'outline'}
                onClick={() => {
                  setSelectedVariantIndex(idx);
                  setImageError(false); // Reset image error on variant change
                  
                  // Immediately check if this variant is in cart
                  if (product) {
                    const stored = localStorage.getItem('cartItems');
                    const items: Array<{ product_id: string; sku: string; quantity: number }> = stored ? JSON.parse(stored) : [];
                    const exists = items.some(item => item.product_id === product.product_id && item.sku === variant.sku);
                    setIsInCart(exists);
                    // Reset quantity to 1 if changing to a variant not in cart
                    if (!exists) {
                      setQuantity(1);
                    }
                  }
                }}
                className="flex-grow min-w-fit"
              >
                {variant.variant_name || `Variant ${idx + 1}`}
              </Button>
            ))}
          </div>
        )}
        
        {/* Out of Stock Message */}
        {isOutOfStock ? (
          <div className="text-red-500 font-medium mb-2">Out of Stock</div>
        ) : (
          <>
            {/* Quantity Control - only show if in stock */}
            <div className="flex items-center justify-center gap-2">
              <Button size="icon" variant="outline" onClick={decrementQuantity} disabled={quantity <= 1}>
                -
              </Button>
              <input
                id="quantity"
                type="number"
                min={1}
                max={displayStock}
                value={quantity}
                onChange={e => setQuantity(Math.max(1, Math.min(displayStock, Number(e.target.value))))}
                className="w-16 border rounded px-2 py-1 text-center"
              />
              <Button size="icon" variant="outline" onClick={incrementQuantity} disabled={quantity >= displayStock}>
                +
              </Button>
            </div>
            <span className="text-xs text-gray-500">/ {displayStock} in stock</span>
          </>
        )}
        
        {/* Add to Cart Button */}
        <Button
          className="w-48"
          variant={isInCart ? "destructive" : "default"}
          onClick={handleAddToCart}
          disabled={isLoading || isOutOfStock}
        >
          {isInCart ? (
            <>
              <Trash2 size={16} className="mr-2" />
              Remove from Cart
            </>
          ) : (
            <>
              <ShoppingCart size={16} className="mr-2" />
              Add to Cart
            </>
          )}
        </Button>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="container mx-auto p-4">
        {/* Desktop Skeleton Layout */}
        <div className="hidden md:flex flex-row gap-8 items-start py-24 pb-40">
          {/* Left: Image Skeleton */}
          <div className="flex-1 flex justify-center items-center">
            <Skeleton className="aspect-square w-full max-w-[400px] h-[400px] rounded-2xl" />
          </div>
          {/* Right: Details Skeleton */}
          <div className="flex-1 flex flex-col gap-4 justify-center items-center">
            <Skeleton className="h-12 w-3/4 mb-2" />
            <Skeleton className="h-8 w-1/4 mb-4" />
            <Skeleton className="h-6 w-1/2 mb-2" />
            <Skeleton className="h-24 w-4/5 mb-4" />
            <Skeleton className="h-10 w-48 mb-2" />
          </div>
        </div>

        {/* Mobile Skeleton Layout */}
        <div className="md:hidden flex flex-col gap-4 py-6">
          <Skeleton className="aspect-square w-full h-[300px] rounded-2xl mb-4" />
          <Skeleton className="h-8 w-3/4 mx-auto mb-2" />
          <Skeleton className="h-6 w-1/3 mx-auto mb-4" />
          <Skeleton className="h-20 w-5/6 mx-auto mb-4" />
          <Skeleton className="h-10 w-48 mx-auto" />
        </div>
      </div>
    );
  }

  if (error || !product) {
    return <div className="w-full text-center py-8 text-red-500">{error || 'Product not found'}</div>;
  }

  // Use selected variant for display
  const selectedVariant = getSelectedVariant();
  // Fallback logic needs refinement if product structure guarantees variants
  const displayImage = imageError || !selectedVariant?.image_url ? (product?.image_url || sample) : selectedVariant.image_url;
  const displayPrice = selectedVariant?.store_price ?? product?.store_price ?? 0; // Fallback needed
  const displayStock = selectedVariant?.quantity ?? 0; // Use variant stock, default 0

  // Format price using Intl.NumberFormat for consistent formatting
  const formattedPrice = new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(displayPrice);

  return (
    <>
      {/* Desktop Layout */}
      <div className="hidden md:flex flex-row gap-8 items-start py-24 pb-40">
        {/* Left: Image */}
        <div className="flex-1 flex justify-center items-center">
          <div 
            className="aspect-square w-full max-w-[400px] relative cursor-pointer"
            onClick={() => setImagePreviewOpen(true)}
          >
            <img
              src={displayImage}
              className="h-full w-full rounded-2xl object-cover absolute inset-0"
              alt={product.product_name}
              onError={() => setImageError(true)}
            />
          </div>
        </div>
        {/* Right: Details */}
        <div className="flex-1 flex flex-col gap-4 justify-center items-center text-center">
          {/* Centered and Larger Product Name */}
          <p className="text-5xl font-bold truncate text-center">{product.product_name}</p>
          {/* Display Variant Name if applicable */}
          {selectedVariant?.variant_name && (
            <p className="text-xl text-muted-foreground">{selectedVariant.variant_name}</p>
          )}
          {/* Centered and Smaller Price */}
          <h1 className="text-3xl font-bold text-center">{formattedPrice}</h1>
          <div className="text-lg text-gray-600">Stocks left: <span className="font-semibold">{displayStock}</span></div>
          
          {/* Display product description if available */}
          {selectedVariant?.description && (
            <div className="mt-4 mb-2">
              <h3 className="text-lg font-semibold mb-2">Description</h3>
              <p className="whitespace-pre-line">{selectedVariant.description}</p>
            </div>
          )}
          
          <p className="text-xs text-gray-500 italic mb-2">Prices are subject to change without prior notice.</p>
          {/* Render Action Button (already centered internally) */}
          <div className="flex flex-row gap-4 items-center justify-center w-full mt-4">
            {renderActionButton()}
          </div>
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="md:hidden flex flex-col gap-4 py-6">
        {/* Info part comes first */}
        <div className="w-full text-center p-4">
          <div 
            className="aspect-square w-full relative mb-4 cursor-pointer"
            onClick={() => setImagePreviewOpen(true)}
          >
            <img
              src={displayImage}
              className="h-full w-full rounded-2xl object-cover absolute inset-0"
              alt={product.product_name}
              onError={() => setImageError(true)}
            />
          </div>
          {/* Centered and Larger Product Name (Mobile) */}
          <p className="text-2xl font-bold text-center mb-2">
            {product.product_name}
          </p>
          {/* Display Variant Name if applicable */}
          {selectedVariant?.variant_name && (
            <p className="text-lg text-muted-foreground mb-2">{selectedVariant.variant_name}</p>
          )}
          {/* Centered and Smaller Price (Mobile) */}
          <h1 className="text-2xl font-bold mb-2 text-center">{formattedPrice}</h1>
          <div className="text-base text-gray-600 mb-2">Stocks left: <span className="font-semibold">{displayStock}</span></div>
          {/* Display product description on mobile layout */}
          {selectedVariant?.description && (
            <div className="mb-4 px-2">
              <h3 className="text-lg font-semibold mb-2">Description</h3>
              <p className="whitespace-pre-line text-center">{selectedVariant.description}</p>
            </div>
          )}
          <p className="text-xs text-gray-500 italic mb-2">Prices are subject to change without prior notice.</p>
          {/* Render Action Button (already centered internally) */}
          <div className="flex flex-col gap-4 items-center justify-center w-full mt-4">
            {renderActionButton()}
          </div>
        </div>
      </div>

      {/* Image Preview Dialog */}
      <Dialog open={imagePreviewOpen} onOpenChange={setImagePreviewOpen}>
        <DialogContent className="sm:max-w-3xl max-h-[90vh] p-0 overflow-hidden">
          <div className="relative h-full">
            <Button 
              variant="ghost" 
              className="absolute top-2 right-2 z-10 rounded-full bg-background/80 hover:bg-background/90"
              onClick={() => setImagePreviewOpen(false)}
            >
              <X size={24} />
            </Button>
            <img
              src={displayImage}
              className="w-full h-full object-contain p-2"
              alt={product.product_name}
              onError={() => setImageError(true)}
            />
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Login Dialog - keep hidden */}
      <div className="hidden">
        <LogInDialog open={loginDialogOpen} onOpenChange={setLoginDialogOpen} />  
      </div>
      
      {/* Optionally, related products below */}
      <div className="mt-8">
        <ProductList />
      </div>
    </>
  );
}

export default ProductDetail;
