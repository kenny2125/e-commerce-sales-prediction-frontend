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
import { ShoppingCart, Trash2 } from 'lucide-react';
import { LogInDialog } from "@/components/dialogs/LogInDialog";

interface Product {
  product_id: string;
  category: string;
  brand: string;
  product_name: string;
  status: string;
  quantity: number;
  store_price: number;
  image_url: string;
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
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load product');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [searchParams]);

  const handleAddToCart = useCallback(async () => {
    if (!currentUser) {
      setLoginDialogOpen(true);
      return;
    }

    if (!product) return;

    try {
      setIsLoading(true);

      if (isInCart) {
        // Remove from cart
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/cart/remove/${product.product_id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) throw new Error('Failed to remove from cart');
        
        toast.success("Item removed from cart");
        setIsInCart(false);
      } else {
        // Add to cart
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/cart/add`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            product_id: product.product_id,
            quantity: quantity
          })
        });

        if (!response.ok) throw new Error('Failed to add to cart');
        
        toast.success("Item added to cart");
        setIsInCart(true);
      }
    } catch (error) {
      console.error('Cart operation failed:', error);
      toast.error("Failed to update cart. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [currentUser, isInCart, product, quantity]);

  if (loading) {
    return <div className="w-full text-center py-8">Loading product details...</div>;
  }

  if (error || !product) {
    return <div className="w-full text-center py-8 text-red-500">{error || 'Product not found'}</div>;
  }

  // Format price using Intl.NumberFormat for consistent formatting
  const formattedPrice = new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(product.store_price);

  const renderActionButton = () => {
    if (!product || product.quantity === 0) return null;
    if (currentUser && currentUser.role === "admin") {
      return <Button className="w-32">View</Button>;
    } else {
      // Show add to cart for all, but disabled and with message if not logged in
      const isLoggedIn = !!currentUser;
      return (
        <div className="flex flex-col gap-2 items-start">
          <div className="flex items-center gap-2">
            <label htmlFor="quantity" className="text-sm">Qty:</label>
            <input
              id="quantity"
              type="number"
              min={1}
              max={product.quantity}
              value={quantity}
              onChange={e => setQuantity(Math.max(1, Math.min(product.quantity, Number(e.target.value))))}
              className="w-16 border rounded px-2 py-1 text-center"
              disabled={!isLoggedIn}
            />
            <span className="text-xs text-gray-500">/ {product.quantity} in stock</span>
          </div>
          <Button
            className="w-48"
            variant={isInCart ? "destructive" : "default"}
            onClick={isLoggedIn ? handleAddToCart : undefined}
            disabled={isLoading || product.quantity === 0 || !isLoggedIn}
          >
            {!isLoggedIn ? (
              <>Log in to add to cart</>
            ) : isInCart ? (
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
    }
  };

  return (
    <>
      {/* Desktop Layout: visible on md and above */}
      <div className="hidden md:flex flex-row gap-8 items-start">
        {/* Left: Image only */}
        <div className="flex-1 flex justify-center items-center">
          <img
            src={product.image_url || sample}
            className="h-[480px] w-full max-w-[400px] rounded-2xl object-cover"
            alt={product.product_name}
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = sample;
            }}
          />
        </div>
        {/* Right: Details */}
        <div className="flex-1 flex flex-col gap-4 justify-center">
          <div className="flex flex-row gap-4 items-center">
            <p className="text-4xl font-bold truncate">{product.product_name}</p>
          </div>
          <h1 className="text-4xl font-bold">{formattedPrice}</h1>
          <div className="text-lg text-gray-600">Stocks left: <span className="font-semibold">{product.quantity}</span></div>
          <div className="flex flex-row gap-4 items-center">
            {renderActionButton()}
          </div>
        </div>
      </div>

      {/* Mobile Layout: visible on small devices */}
      <div className="md:hidden flex flex-col gap-4">
        {/* Info part comes first */}
        <div className="w-full text-center p-4">
          <img
            src={product.image_url || sample}
            className="h-[300px] w-full rounded-2xl object-cover mb-4"
            alt={product.product_name}
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = sample;
            }}
          />
          <div className="flex flex-row gap-4 items-center p-4">
            <p className="text-base md:text-4xl">
              {product.product_name}
            </p>
          </div>
          <h1 className="text-4xl font-bold mb-2">{formattedPrice}</h1>
          <div className="text-lg text-gray-600 mb-2">Stocks left: <span className="font-semibold">{product.quantity}</span></div>
          <div className="flex flex-row gap-4 justify-center">
            {renderActionButton()}
          </div>
        </div>
      </div>
      <div className="hidden">

      <LogInDialog open={loginDialogOpen} onOpenChange={setLoginDialogOpen} />  
      </div>
      
      {/* Optionally, related products below */}
      <div className="mt-8">
        <ProductList />
      </div>

      {/* Login Dialog */}
      
    </>
  );
}

export default ProductDetail;
