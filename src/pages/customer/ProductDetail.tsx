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
import {
  Dialog,
  DialogContent,
  DialogDescription,
} from "@/components/ui/dialog";

interface Product {
  product_id: string;
  category: string;
  brand: string;
  product_name: string;
  status: string;
  quantity: number;
  store_price: number;
  image_url: string;
  description?: string;
  variants: any;
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

  // Check if this product is already in user's cart (via localStorage)
  useEffect(() => {
    if (!currentUser || currentUser.role === 'admin' || !product) return;
    const stored = localStorage.getItem('cartItems');
    const items = stored ? JSON.parse(stored) : [];
    const exists = items.some((item: any) => item.product_id === product.product_id);
    setIsInCart(exists);
  }, [currentUser, product]);

  const handleAddToCart = useCallback(() => {
    if (!product) return;

    // Update cartItems in localStorage
    setIsLoading(true);
    const stored = localStorage.getItem('cartItems');
    const items = stored ? JSON.parse(stored) : [];
    if (isInCart) {
      const updated = items.filter((item: any) => item.product_id !== product.product_id);
      localStorage.setItem('cartItems', JSON.stringify(updated));
      toast.success("Item removed from cart");
      setIsInCart(false);
    } else {
      const updated = [...items, { product_id: product.product_id, quantity }];
      localStorage.setItem('cartItems', JSON.stringify(updated));
      toast.success("Item added to cart");
      setIsInCart(true);
    }
    setIsLoading(false);
  }, [isInCart, product, quantity]);

  if (loading) {
    return <div className="w-full text-center py-8">Loading product details...</div>;
  }

  if (error || !product) {
    return <div className="w-full text-center py-8 text-red-500">{error || 'Product not found'}</div>;
  }

  // Use selected variant for display
  const selectedVariant = product.variants?.[selectedVariantIndex] || product.variants?.[0];
  const displayImage = imageError || !selectedVariant?.image_url ? sample : selectedVariant.image_url;
  const displayPrice = selectedVariant?.store_price ?? product.store_price;
  const displayStock = selectedVariant?.quantity ?? product.quantity;

  // Format price using Intl.NumberFormat for consistent formatting
  const formattedPrice = new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(displayPrice);

  const renderActionButton = () => {
    if (!product || displayStock === 0) return null;
    if (currentUser && currentUser.role === "admin") {
      return <Button className="w-32">View</Button>;
    }
    // show add/remove to cart for all users (including guests)
    return (
      <div className="flex flex-col gap-2 items-start">
        {/* Variant Selector above quantity control */}
        {product.variants && product.variants.length > 1 && (
          <div className="flex gap-2 mb-2">
            {product.variants.map((variant: any, idx: number) => (
              <Button
                key={variant.sku || idx}
                size="sm"
                variant={selectedVariantIndex === idx ? 'default' : 'outline'}
                onClick={() => {
                  setSelectedVariantIndex(idx);
                  setImageError(false);
                }}
              >
                {variant.sku || `Variant ${idx + 1}`}
              </Button>
            ))}
          </div>
        )}
        <div className="flex items-center gap-2">
          <label htmlFor="quantity" className="text-sm">Qty:</label>
          <input
            id="quantity"
            type="number"
            min={1}
            max={displayStock}
            value={quantity}
            onChange={e => setQuantity(Math.max(1, Math.min(displayStock, Number(e.target.value))))}
            className="w-16 border rounded px-2 py-1 text-center"
          />
          <span className="text-xs text-gray-500">/ {displayStock} in stock</span>
        </div>
        <Button
          className="w-48"
          variant={isInCart ? "destructive" : "default"}
          onClick={handleAddToCart}
          disabled={isLoading || displayStock === 0}
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

  return (
    <>
      {/* Desktop Layout: visible on md and above */}
      <div className="hidden md:flex flex-row gap-8 items-start py-24 pb-40">
        {/* Left: Image only */}
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
        <div className="flex-1 flex flex-col gap-4 justify-center">
          <div className="flex flex-row gap-4 items-center">
            <p className="text-4xl font-bold truncate">{product.product_name}</p>
          </div>
          <h1 className="text-4xl font-bold">{formattedPrice}</h1>
          <div className="text-lg text-gray-600">Stocks left: <span className="font-semibold">{displayStock}</span></div>
          {/* Display product description if available */}
          {product.description && (
            <div className="mt-4 mb-2">
              <h3 className="text-lg font-semibold mb-2">Description</h3>
              <p className="whitespace-pre-line">{product.description}</p>
            </div>
          )}
          <p className="text-xs text-gray-500 italic mb-2">Prices are subject to change without prior notice.</p>
          {/* Place variant selector above quantity control in action button */}
          <div className="flex flex-row gap-4 items-center">
            {renderActionButton()}
          </div>
        </div>
      </div>

      {/* Mobile Layout: visible on small devices */}
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
          <div className="flex flex-row gap-4 items-center p-4">
            <p className="text-base md:text-4xl">
              {product.product_name}
            </p>
          </div>
          <h1 className="text-4xl font-bold mb-2">{formattedPrice}</h1>
          <div className="text-lg text-gray-600 mb-2">Stocks left: <span className="font-semibold">{displayStock}</span></div>
          {/* Display product description on mobile layout */}
          {product.description && (
            <div className="mb-4 px-2">
              <h3 className="text-lg font-semibold mb-2">Description</h3>
              <p className="whitespace-pre-line text-center">{product.description}</p>
            </div>
          )}
          <p className="text-xs text-gray-500 italic mb-2">Prices are subject to change without prior notice.</p>
          {/* Place variant selector above quantity control in action button (mobile) */}
          <div className="flex flex-row gap-4 justify-center">
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
