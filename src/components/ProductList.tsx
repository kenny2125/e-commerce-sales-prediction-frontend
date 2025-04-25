import React, { useEffect, useState } from 'react'
import ProductCard from './cards/ProductCard'

interface Product {
  product_id: string;
  category: string;
  brand: string;
  product_name: string;
  status: string;
  total_quantity: number;
  store_price: number;
  image_url: string;
}

interface ProductListProps {
  searchQuery?: string;
  selectedCategories?: string[];
  priceRange?: [number, number];
  sortBy?: string;
}

export default function ProductList({ searchQuery, selectedCategories, priceRange, sortBy }: ProductListProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/product`);
        if (!response.ok) {
          throw new Error('Failed to fetch products');
        }
        const data = await response.json();
        setProducts(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load products');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const filteredProducts = products.filter(product => {
    // Search query filter
    if (searchQuery && !product.product_name.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !product.category.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !product.brand.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }

    // Category filter
    if (selectedCategories?.length && !selectedCategories.includes(product.category)) {
      return false;
    }

    // Price range filter
    if (priceRange) {
      const [min, max] = priceRange;
      if (product.store_price < min || product.store_price > max) {
        return false;
      }
    }

    return true;
  });

  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (!sortBy) return 0;
    
    switch (sortBy) {
      case 'price-asc':
        return a.store_price - b.store_price;
      case 'price-desc':
        return b.store_price - a.store_price;
      case 'name-asc':
        return a.product_name.localeCompare(b.product_name);
      case 'name-desc':
        return b.product_name.localeCompare(a.product_name);
      default:
        return 0;
    }
  });

  if (loading) {
    return <div className="w-full text-center py-8">Loading products...</div>;
  }

  if (error) {
    return <div className="w-full text-center py-8 text-red-500">{error}</div>;
  }

  if (sortedProducts.length === 0) {
    return <div className="w-full text-center py-8">No products found matching your criteria.</div>;
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3 sm:gap-4 w-full min-h-0">
      {sortedProducts.map((product) => (
        <ProductCard key={product.product_id} product={product} />
      ))}
    </div>
  );
}
