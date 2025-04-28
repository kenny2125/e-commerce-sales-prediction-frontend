import { Button } from "@/components/ui/button";
import { CircleArrowRight } from "lucide-react";
import ProductCard from "@/components/cards/ProductCard";
import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";

// Import images from assets
import homepageBanner from "@/assets/banner.webp";
import schoolBanner from "@/assets/school.webp";
import furnitureBanner from "@/assets/furniture.webp";
import technologyBanner from "@/assets/technology.webp";

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
            backgroundImage: `url(${homepageBanner})`,
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
          <Link to="/search" className="block relative h-[300px] overflow-hidden group cursor-pointer">
            <img
              src={schoolBanner}
              alt="Office & School Supplies"
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-black/40 flex items-center p-8 transition-all duration-300 group-hover:bg-black/50">
              <div className="transform transition-transform duration-300 group-hover:translate-x-2">
                <h2 className="text-4xl font-bold text-white">
                  Office & School Supplies
                </h2>
                <span className="inline-block mt-2 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  Shop now &rarr;
                </span>
              </div>
            </div>
          </Link>
        </div>

        {/* Furniture and Technology Categories (side by side on larger screens) */}
        <div className="flex flex-col md:flex-row gap-6">
          {/* Furniture Category */}
          <Link to="/search" className="flex-1 block relative h-[250px] overflow-hidden group cursor-pointer">
            <img
              src={furnitureBanner}
              alt="Furniture"
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-black/40 flex items-center p-8 transition-all duration-300 group-hover:bg-black/50">
              <div className="transform transition-transform duration-300 group-hover:translate-x-2">
                <h2 className="text-4xl font-bold text-white">Furniture</h2>
                <span className="inline-block mt-2 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  Shop now &rarr;
                </span>
              </div>
            </div>
          </Link>

          {/* Technology Category */}
          <Link to="/search" className="flex-1 block relative h-[250px] overflow-hidden group cursor-pointer">
            <img
              src={technologyBanner}
              alt="Technology"
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-black/40 flex items-center p-8 transition-all duration-300 group-hover:bg-black/50">
              <div className="transform transition-transform duration-300 group-hover:translate-x-2">
                <h2 className="text-4xl font-bold text-white">Technology</h2>
                <span className="inline-block mt-2 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  Shop now &rarr;
                </span>
              </div>
            </div>
          </Link>
        </div>
      </section>

      {/* Who Are We Section */}
      <section className="container mx-auto px-4 mb-16 py-8 bg-muted/30 rounded-lg">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="flex-1">
            <h2 className="text-3xl font-bold mb-4">Who Are We?</h2>
            <p className="mb-4">
              1618 Office Solutions Inc. was established in 1999 and has since become a leader in providing comprehensive office solutions to businesses and educational institutions across the Philippines.
            </p>
            <p className="mb-4">
              Our mission is to help our customers create efficient, comfortable, and productive workspaces by offering a wide range of high-quality office supplies, furniture, and technology products.
            </p>
            <p>
              What sets us apart is our commitment to exceptional customer service, competitive pricing, and our deep understanding of office environments. Whether you're outfitting a small home office or a large corporate space, we have the solutions you need.
            </p>
          </div>
          <div className="flex-1 flex justify-center">
            <div className="bg-primary/10 p-8 rounded-lg max-w-md">
              <h3 className="text-xl font-semibold mb-4">Our Values</h3>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <span className="text-primary font-bold mr-2">✓</span>
                  <span>Quality products that stand the test of time</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary font-bold mr-2">✓</span>
                  <span>Dedicated customer service and support</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary font-bold mr-2">✓</span>
                  <span>Competitive pricing and special bulk discounts</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary font-bold mr-2">✓</span>
                  <span>Extensive industry knowledge and expertise</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary font-bold mr-2">✓</span>
                  <span>Environment-friendly product options</span>
                </li>
              </ul>
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
            <div className="flex flex-wrap gap-4">
              {featuredProducts.map((product) => (
                <div key={product.product_id} className="w-[calc(50%-8px)] md:w-[calc(33.333%-11px)] lg:w-[calc(20%-13px)]">
                  <ProductCard product={product} />
                </div>
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
