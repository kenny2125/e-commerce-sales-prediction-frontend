import ProductList from "@/components/ProductList";
import ProductCard from "@/components/cards/ProductCard";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import React, { useEffect, useState, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Search as SearchIcon } from "lucide-react";
import { useUser } from "@/contexts/UserContext";

interface Product {
  product_id: string;
  category: string;
  brand: string;
  product_name: string;
  store_price: number;
  image_url: string;
  quantity: number;
}

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { currentUser } = useUser();
  const isAdmin = currentUser?.role === "admin";
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [maxPrice, setMaxPrice] = useState(1000000);
  const [priceRange, setPriceRange] = useState<[number]>([maxPrice]);
  const [sortBy, setSortBy] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"filters" | "results">("results");
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);
  const [searchInput, setSearchInput] = useState(searchParams.get("query") || "");

  const handlePriceChange = useCallback((value: number) => {
    setPriceRange([value]);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      setSearchParams({ query: searchInput.trim() });
    } else {
      const newParams = new URLSearchParams(searchParams);
      newParams.delete("query");
      setSearchParams(newParams);
    }
  };

  // Separate effect for fetching categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/product/categories`);
        if (!response.ok) throw new Error('Failed to fetch categories');
        const categories = await response.json();
        setAvailableCategories(categories);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    fetchCategories();
  }, []); // Only fetch categories once when component mounts

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const query = searchParams.get("query");
        const category = searchParams.get("category");
        let url = `${import.meta.env.VITE_API_URL}/api/product`;
        // Add search query if present
        if (query) {
          url += `/search?query=${encodeURIComponent(query)}`;
        } else if (category) {
          url += `/search?query=${encodeURIComponent(category)}`;
        }
        const response = await fetch(url);
        if (!response.ok) throw new Error('Failed to fetch products');
        const data = await response.json();
        
        // Find max price for slider
        const maxProductPrice = Math.max(...data.map((p: Product) => p.store_price));
        setMaxPrice(maxProductPrice);
        setPriceRange([maxProductPrice]);
        
        setProducts(data);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [searchParams]);

  const handleCategoryChange = (category: string) => {
    setSelectedCategories(prev => {
      if (prev.includes(category)) {
        return prev.filter(c => c !== category);
      } else {
        return [...prev, category];
      }
    });
  };

  // Filter and sort products
  const filteredProducts = products
    .filter(product => {
        // Category filter
      const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(product.category);
      
      // Price filter
      const matchesPrice = product.store_price <= priceRange[0];
      
      // The query parameter-based filtering is now handled by the backend's enhanced search
      // This client-side filtering only applies additional filters (category, price)
      return matchesCategory && matchesPrice;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "name-asc":
          return a.product_name.localeCompare(b.product_name);
        case "name-desc":
          return b.product_name.localeCompare(a.product_name);
        case "price-asc":
          return a.store_price - b.store_price;
        case "price-desc":
          return b.store_price - a.store_price;
        default:
          return 0;
      }
    });

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 30;

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategories, priceRange, sortBy, searchParams]);

  // Paginated products
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  // Pagination controls
  const Pagination = () => (
    <div className="flex justify-center items-center gap-2 mt-4">
      <Button
        variant="outline"
        size="sm"
        disabled={currentPage === 1}
        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
      >
        Previous
      </Button>
      <span className="px-2 text-sm">
        Page {currentPage} of {totalPages || 1}
      </span>
      <Button
        variant="outline"
        size="sm"
        disabled={currentPage === totalPages || totalPages === 0}
        onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
      >
        Next
      </Button>
    </div>
  );

  // Extracted FilterCard component for reuse
  const FilterCard = () => (
    <Card className="flex flex-col w-fit h-fit p-4 rounded-lg justify-center align-top gap-4">
      <h2 className="text-xl font-bold">Filters</h2>
      {/* Computer Parts */}
      <div>
        <h1>Categories</h1>
        <div className="flex flex-col">
          {availableCategories.map(category => (
            <div key={category} className="flex p-2">
              <Checkbox 
                id={category} 
                checked={selectedCategories.includes(category)}
                onCheckedChange={() => handleCategoryChange(category)}
              />
              <Label htmlFor={category} className="ml-2">{category}</Label>
            </div>
          ))}
        </div>
      </div>
      <Separator />
      {/* Sort By */}
      <div>
        <h1>Sort By</h1>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger>
            <SelectValue placeholder="Select sorting" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="name-asc">Name (A-Z)</SelectItem>
            <SelectItem value="name-desc">Name (Z-A)</SelectItem>
            <SelectItem value="price-asc">Price (Low to High)</SelectItem>
            <SelectItem value="price-desc">Price (High to Low)</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Separator />
      {/* Adjust Price Range */}
      <div>
        <h1>Maximum Price</h1>
        <Slider 
          min={0}
          max={maxPrice}
          step={1000}
          value={priceRange[0]}
          onChange={handlePriceChange}
        />
        <p className="text-sm mt-2">₱{priceRange[0].toLocaleString()}</p>
      </div>
      <Separator />
      <Button
        onClick={() => {
          setSelectedCategories([]);
          setSortBy("");
          setPriceRange([maxPrice]);
          
          // Fetch all products when filters are reset
          setLoading(true);
          fetch(`${import.meta.env.VITE_API_URL}/api/product`)
            .then(response => {
              if (!response.ok) throw new Error('Failed to fetch products');
              return response.json();
            })
            .then(data => {
              setProducts(data);
              // Reset the search parameters in the URL to remove any query or category filters
              const params = new URLSearchParams(window.location.search);
              if (params.has('query') || params.has('category')) {
                window.history.pushState({}, '', window.location.pathname);
              }
            })
            .catch(error => {
              console.error('Error fetching products:', error);
            })
            .finally(() => {
              setLoading(false);
            });
        }}
      >
        Reset Filters
      </Button>
    </Card>
  );

  return (
    <>
      {/* Desktop View */}
      <div className="hidden md:flex gap-4 py-4">
        <FilterCard />
        <div className="flex-1">
          <div>
            <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
              <h1>
                Results for: <span className="font-bold">{searchParams.get("query") || "All Products"}</span>
              </h1>
              {isAdmin && (
                <form onSubmit={handleSearch} className="flex max-w-sm">
                  <div className="relative w-full">
                    <Input
                      type="text"
                      placeholder="Search products..."
                      value={searchInput}
                      onChange={(e) => setSearchInput(e.target.value)}
                      className="pr-10"
                    />
                    <Button 
                      type="submit" 
                      variant="ghost" 
                      size="icon" 
                      className="absolute right-0 top-0 h-full"
                    >
                      <SearchIcon className="h-4 w-4" />
                    </Button>
                  </div>
                </form>
              )}
            </div>
            {loading ? (
              <div className="flex justify-center items-center min-h-[200px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : (
              <div className="mt-4">
                {paginatedProducts.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-lg text-gray-500">No products found matching your criteria</p>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-5 gap-3 sm:gap-4">
                      {paginatedProducts.map((product) => (
                        <ProductCard key={product.product_id} product={product} />
                      ))}
                    </div>
                    <Pagination />
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile View with Tabs */}
      <div className="md:hidden">
        <div className="flex justify-around border-b">
          <button 
            onClick={() => setActiveTab("filters")} 
            className={`px-4 py-2 ${activeTab==="filters" ? "text-indigo-500 border-b-2 border-indigo-500" : ""}`}
          >
            Filters
          </button>
          <button 
            onClick={() => setActiveTab("results")} 
            className={`px-4 py-2 ${activeTab==="results" ? "text-indigo-500 border-b-2 border-indigo-500" : ""}`}
          >
            Results
          </button>
        </div>
        <div className="p-4">
          {activeTab === "filters" ? (
            <div className="flex justify-center">
              <FilterCard />
            </div>
          ) : (
            <>
              <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                <h1>
                  Results for: <span className="font-bold">{searchParams.get("query") || "All Products"}</span>
                </h1>
                {isAdmin && (
                  <form onSubmit={handleSearch} className="flex w-full sm:w-auto mt-2 sm:mt-0">
                    <div className="relative w-full">
                      <Input
                        type="text"
                        placeholder="Search products..."
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        className="pr-10"
                      />
                      <Button 
                        type="submit" 
                        variant="ghost" 
                        size="icon" 
                        className="absolute right-0 top-0 h-full"
                      >
                        <SearchIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  </form>
                )}
              </div>
              {loading ? (
                <div className="flex justify-center items-center min-h-[200px]">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 sm:grid-cols-2 gap-4">
                    {paginatedProducts.length === 0 ? (
                      <div className="text-center py-8 col-span-full">
                        <p className="text-lg text-gray-500">No products found matching your criteria</p>
                      </div>
                    ) : (
                      paginatedProducts.map((product) => (
                        <ProductCard key={product.product_id} product={product} />
                      ))
                    )}
                  </div>
                  <Pagination />
                </>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}
