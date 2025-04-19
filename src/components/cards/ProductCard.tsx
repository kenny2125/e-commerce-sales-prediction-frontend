import React, { useState, useCallback, useEffect } from 'react'
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { useNavigate } from 'react-router-dom'
import { Button } from "@/components/ui/button"
import { ShoppingCart, Eye, Trash2 } from 'lucide-react'
import defaultNoImage from '@/assets/image-placeholder.webp'
import { useUser } from "@/contexts/UserContext"
import { toast } from "sonner"

interface ProductCardProps {
  product: {
    product_id: string;
    image_url: string;
    product_name: string;
    store_price: number;
    brand: string;
  }
}

function ProductCard({ product }: ProductCardProps) {
  const navigate = useNavigate();
  const [isInCart, setIsInCart] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [imageError, setImageError] = useState(false);
  const { currentUser } = useUser();
  
  // On mount, check if product is already in user's cart (localStorage)
  useEffect(() => {
    if (!currentUser || currentUser.role === 'admin') return;
    const stored = localStorage.getItem('cartItems');
    const items = stored ? JSON.parse(stored) : [];
    const exists = items.some((item: any) => item.product_id === product.product_id);
    setIsInCart(exists);
  }, [currentUser, product.product_id]);
  
  function handleCardClick() {
    navigate(`/product?id=${product.product_id}`);
  }
  
  const handleActionClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (currentUser?.role === 'admin') {
      // Handle view action for admin
      navigate(`/product?id=${product.product_id}`);
      return;
    }

    if (!currentUser) {
      toast.error("Please log in to add items to your cart");
      return;
    }

    // Update localStorage cartItems
    setIsLoading(true);
    const stored = localStorage.getItem('cartItems');
    const items = stored ? JSON.parse(stored) : [];

    if (isInCart) {
      const updated = items.filter((item: any) => item.product_id !== product.product_id);
      localStorage.setItem('cartItems', JSON.stringify(updated));
      toast.success("Item removed from cart");
      setIsInCart(false);
    } else {
      const updated = [...items, { product_id: product.product_id, quantity: 1 }];
      localStorage.setItem('cartItems', JSON.stringify(updated));
      toast.success("Item added to cart");
      setIsInCart(true);
    }
    setIsLoading(false);
  }, [currentUser, isInCart, navigate, product.product_id]);

  // Format price using Intl.NumberFormat for consistent formatting
  const formattedPrice = new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(product.store_price);

  return (
    <Card 
      className="w-full sm:max-w-[200px] md:max-w-[220px] lg:max-w-[240px] xl:max-w-[260px] flex flex-col justify-between h-full cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02] active:scale-100"
      onClick={handleCardClick}
    >
      <CardContent className="p-3 sm:p-4 flex flex-col gap-3 sm:gap-4">
        <div className="aspect-square w-full relative bg-background/50 flex items-center justify-center">
          <img 
            src={imageError || !product.image_url ? defaultNoImage : product.image_url} 
            alt={product.product_name} 
            className="max-w-full max-h-full w-auto h-auto object-contain"
            onError={() => setImageError(true)}
          />
        </div>
        <div className='space-y-1.5 sm:space-y-2'>
          <p className="text-xs sm:text-sm text-muted-foreground text-center">{product.brand}</p>
          <h3 className='font-medium text-xs sm:text-sm md:text-base min-h-[2.5rem] line-clamp-2 text-center'>
            {product.product_name}
          </h3>
          <p className='text-base sm:text-lg md:text-xl font-bold text-center text-primary'>
            {formattedPrice}
          </p>
        </div>
      </CardContent>
      <CardFooter className="px-4 pb-4 pt-0">
        <Button 
          variant={isInCart ? "destructive" : "default"} 
          size="sm" 
          onClick={handleActionClick}
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-2"
        >
          {currentUser?.role === 'admin' ? (
            <>
              <Eye size={16} />
              <span>View Details</span>
            </>
          ) : (
            <>
              {isInCart ? (
                <>
                  <Trash2 size={16} />
                  <span>Remove from Cart</span>
                </>
              ) : (
                <>
                  <ShoppingCart size={16} />
                  <span>Add to Cart</span>
                </>
              )}
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}

export default ProductCard