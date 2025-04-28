import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { useNavigate } from 'react-router-dom'
import { Button } from "@/components/ui/button"
import { Eye } from 'lucide-react'
import defaultNoImage from '@/assets/image-placeholder.webp'
import { useUser } from "@/contexts/UserContext"

interface ProductCardProps {
  product: {
    product_id: string;
    image_url: string;
    product_name: string;
    store_price: number;
    brand: string;
    total_quantity: number; // Changed from quantity to total_quantity
  }
}

function ProductCard({ product }: ProductCardProps) {
  const navigate = useNavigate();
  const [imageError, setImageError] = useState(false);
  const { currentUser } = useUser();
  
  function handleCardClick() {
    window.scrollTo({ top: 0, behavior: 'smooth' }); // Add smooth scroll to top
    navigate(`/product?id=${product.product_id}`);
  }
  
  const handleViewDetails = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/product?id=${product.product_id}`);
  };

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
      <CardContent className="p-2 sm:p-3 md:p-4 flex flex-col gap-2 sm:gap-3 md:gap-4">
        <div className="w-full relative bg-background/50 overflow-hidden">
          <div className="aspect-square w-full relative">
            <img 
              src={imageError || !product.image_url ? defaultNoImage : product.image_url} 
              alt={product.product_name} 
              className="absolute inset-0 w-full h-full object-contain"
              onError={() => setImageError(true)}
            />
          </div>
        </div>
        <div className='space-y-1 sm:space-y-1.5 md:space-y-2'>
          <p className="text-[10px] xs:text-xs sm:text-sm text-muted-foreground text-center truncate">{product.brand}</p>
          <h3 className='font-medium text-[11px] xs:text-xs sm:text-sm md:text-base min-h-[2.5em] line-clamp-2 text-center'>
            {product.product_name}
          </h3>
          <p className='text-sm xs:text-base sm:text-lg md:text-xl font-bold text-center text-primary'>
            {formattedPrice}
          </p>
        </div>
      </CardContent>
      <CardFooter className="px-2 sm:px-3 md:px-4 pb-3 sm:pb-4 pt-0">
        <Button 
          variant="default"
          size="sm"
          onClick={handleViewDetails}
          className="w-full flex items-center justify-center gap-1 sm:gap-2 text-[10px] xs:text-xs sm:text-sm"
        >
          <Eye size={14} className="sm:w-4 sm:h-4 md:w-5 md:h-5" />
          <span className="whitespace-nowrap">View Details</span>
        </Button>
      </CardFooter>
    </Card>
  )
}

export default ProductCard