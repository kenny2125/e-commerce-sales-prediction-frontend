import { Button } from "@/components/ui/button";
import { CircleArrowRight } from "lucide-react";
import ProductCard from "@/components/cards/ProductCard";
import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";

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

function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/product`
        );
        if (!response.ok) throw new Error("Failed to fetch products");
        const data = await response.json();

        // Take first 8 products for featured products section
        setFeaturedProducts(data.slice(0, 30));

        // Take next 8 products for best sellers section
        setProducts(data.slice(8, 16));
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return (
    <main className="pb-12">
      <Helmet>
        <title>Home - 1618 Office Solutions</title>
      </Helmet>

      {/* Hero Section */}
      <section className="relative h-[400px] flex items-center justify-center bg-gray-100 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-gray-800/70 to-gray-800/50 z-10"></div>
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: "url('/src/assets/office-supplies-bg.jpg')",
          }}
        ></div>
        <div className="relative z-20 text-center text-white px-4">
          <h1 className="text-5xl md:text-7xl font-bold mb-2">1618</h1>
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            Office Solutions Inc.
          </h2>
          <p className="text-xl md:text-2xl mb-8">
            Everything you need for a better workspace.
          </p>
          <Button onClick={() => (window.location.href = "/search")}>
            Shop now
          </Button>
        </div>
      </section>

      {/* Office Essentials Banner */}
      <section className="py-10 text-center">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-2">
            Office Essentials, All in One Place.
          </h2>
        </div>
      </section>

      {/* Categories Section */}
      <section className="container mx-auto px-4 mb-16">
        {/* Office Supplies Category */}
        <div className="mb-12">
          <div className="relative h-[300px] overflow-hidden">
            <img
              src="/src/assets/office-supplies-category.jpg"
              alt="Office & School Supplies"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/40 flex items-center p-8">
              <h2 className="text-4xl font-bold text-white">
                Office & School Supplies
              </h2>
            </div>
          </div>
        </div>

        {/* Furniture and Technology Categories (side by side on larger screens) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Furniture Category */}
          <div className="relative h-[250px] overflow-hidden">
            <img
              src="/src/assets/furniture-category.jpg"
              alt="Furniture"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/40 flex items-center p-8">
              <h2 className="text-4xl font-bold text-white">Furniture</h2>
            </div>
          </div>

          {/* Technology Category */}
          <div className="relative h-[250px] overflow-hidden">
            <img
              src="/src/assets/technology-category.jpg"
              alt="Technology"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/40 flex items-center p-8">
              <h2 className="text-4xl font-bold text-white">Technology</h2>
            </div>
          </div>
        </div>
      </section>

      {/* New & Featured Products Section */}
      <section className="container mx-auto px-4 mb-16">
        <h2 className="text-3xl font-bold mb-8">New & Featured Products</h2>

        {loading ? (
          <div className="flex items-center justify-center w-full py-8">
        Loading products...
          </div>
        ) : featuredProducts.length > 0 ? (
          <>
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {featuredProducts.map((product) => (
            <ProductCard key={product.product_id} product={product} />
          ))}
        </div>
        <div className="flex justify-center mt-8">
          <Button
            onClick={() => (window.location.href = "/search")}
            className="flex items-center"
          >
            See More
            <CircleArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
          </>
        ) : (
          <div className="flex items-center justify-center w-full py-8">
        No products available
          </div>
        )}
      </section>

    </main>
  );
}

export default Home;
