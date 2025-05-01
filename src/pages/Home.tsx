import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import QuickCheckoutForm from "@/components/forms/QuickCheckoutForm";

// Import icons
import { 
  ArrowRight, 
  Building2, 
  Check, 
  FileText, 
  MapPin, 
  Phone, 
  Mail,
  School,
  Briefcase,
  Cpu,
  Users,
  Clock,
  Award,
  TrendingUp,
  Presentation
} from "lucide-react";

// Import images
import heroImage from "@/assets/banner.webp";
import logoImage from "@/assets/logo.webp";
import schoolBanner from "@/assets/school.webp";
import furnitureBanner from "@/assets/furniture.webp";

function Home() {
  return (
    <main className="overflow-hidden">
      <Helmet>
        <title>1618 Office Solutions - Premium Office Supplies and Furniture</title>
        <meta name="description" content="Premium office supplies and furniture solutions for businesses and educational institutions across the Philippines since 1989." />
      </Helmet>

      {/* Hero Section with Overlay and Form */}
      <section className="relative min-h-[700px] overflow-hidden px-12 rounded-2xl ">
        <div 
          className="absolute inset-0 bg-cover bg-center z-0"
          style={{ backgroundImage: `url(${heroImage})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/50 z-10" />
        
        <div className="relative z-20 container mx-auto h-full flex flex-col justify-center px-4 py-16 lg:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Hero Text Content */}
            <div className="text-white max-w-xl">
              <h1 className="text-5xl md:text-6xl font-bold leading-tight mb-4">
                Transform Your <span className="text-primary">Workspace</span>
              </h1>
              <p className="text-xl mb-8 text-gray-200">
                Premium office solutions tailored for businesses and educational institutions across the Philippines since 1989.
              </p>
              <div className="flex flex-wrap gap-4 md:hidden">
                <Button size="lg" asChild>
                  <Link to="/search">
                    Explore Solutions <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/20">
                  <a href="#about">Learn More</a>
                </Button>
              </div>
            </div>
            
            {/* Quick Checkout Form */}
            <div className="lg:ml-auto w-full max-w-md">
              <QuickCheckoutForm className="backdrop-blur" />
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-20 ">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Creating Efficient Workspaces Since 1989
            </h2>
            <p className="text-lg mb-10">
              Whether you're equipping a corporate office, a school, or a small business, 
              we provide quality office solutions tailored to your needs.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
            {[
              {
                icon: <Building2 className="h-10 w-10 text-primary" />,
                title: "Corporate Solutions",
                description: "Premium furniture and supplies for professional environments that enhance productivity and comfort for companies of all sizes."
              },
              {
                icon: <School className="h-10 w-10 text-primary" />,
                title: "Educational Supplies",
                description: "Quality materials and equipment to support teaching and learning in educational institutions, including our best-selling bond paper products."
              }
            ].map((item, i) => (
              <Card key={i} className="border-none shadow-lg hover:shadow-xl transition-shadow">
                <CardContent className="pt-6">
                  <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mb-4">
                    {item.icon}
                  </div>
                  <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                  <p >{item.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
            
          <div className="text-center mt-16">
            <Button size="lg" onClick={() => document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' })}>
              Contact Sales
            </Button>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">How to Get Started</h2>
            <p className="text-lg">
              Our streamlined process makes it easy to order supplies for your workspace.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              {
                icon: <Briefcase className="h-8 w-8 text-primary" />,
                step: "1",
                title: "Select Products",
                description: "Browse our extensive catalog of office supplies and furniture solutions."
              },
              {
                icon: <FileText className="h-8 w-8 text-primary" />,
                step: "2",
                title: "Add to Cart",
                description: "Easily add your selected items to your shopping cart for a seamless checkout experience."
              },
              {
                icon: <Users className="h-8 w-8 text-primary" />,
                step: "3",
                title: "Complete Checkout",
                description: "Fill out the checkout form with your details and preferred payment method."
              },
              {
                icon: <Phone className="h-8 w-8 text-primary" />,
                step: "4",
                title: "Confirmation Call",
                description: "Our team will contact you to confirm your order and discuss delivery details."
              }
            ].map((item, i) => (
              <div key={i} className="relative p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                <div className="absolute -top-4 -left-4 w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold text-lg">
                  {item.step}
                </div>
                <div className="pt-4">
                  <div className="mb-4">{item.icon}</div>
                  <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                  <p className="">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
            
          <div className="text-center mt-12">
            <Button size="lg" id="send-invoice" asChild>
              <Link to="/search">Start Your Order Now</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* About Us Section */}
      <section id="about" className="py-20 ">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-12 items-center">
            <div className="md:w-1/2">
              <img src={logoImage} alt="1618 Office Solutions Logo" className="w-16 h-16 mb-6" />
              <h2 className="text-3xl md:text-4xl font-bold mb-6">Who We Are</h2>
              <p className="text-lg  mb-4">
                1618 Office Solutions Inc. was established in 1989 and has since become a trusted provider of office supplies and furniture to businesses and educational institutions across the Philippines.
              </p>
              <p className="text-lg  mb-6">
                With 30 employees including drivers, accountants, warehouse staff, and administrators, we deliver quality products with personalized service.
              </p>
                
              <div className="grid grid-cols-2 gap-4 mb-8">
                {[
                  { icon: <Clock className="h-5 w-5 text-primary" />, text: "35+ Years Experience" },
                  { icon: <Users className="h-5 w-5 text-primary" />, text: "Serving All Businesses" },
                  { icon: <Award className="h-5 w-5 text-primary" />, text: "Quality Guaranteed" },
                  { icon: <TrendingUp className="h-5 w-5 text-primary" />, text: "Competitive Pricing" }
                ].map((item, i) => (
                  <div key={i} className="flex items-center">
                    <div className="mr-2">{item.icon}</div>
                    <span >{item.text}</span>
                  </div>
                ))}
              </div>
            </div>
                
            <div className="md:w-1/2 rounded-lg bg-muted/30 p-8">
              <h3 className="text-2xl font-bold mb-4">Contact Us</h3>
              <div className="space-y-4">
                <div className="flex items-start">
                  <MapPin className="h-5 w-5 text-primary mt-1 mr-3" />
                  <p>1618 Felix Deleon Street, Tondo, Manila</p>
                </div>
                <div className="flex items-start">
                  <Phone className="h-5 w-5 text-primary mt-1 mr-3" />
                  <div>
                    <p className="font-medium">Telephone:</p>
                    <p className="text-sm ">495-3333 | 253-9310 | 495-7878</p>
                    <p className="text-sm ">254-8940 | 253-9250 | 253-9359 | 252-3049</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Mail className="h-5 w-5 text-primary mt-1 mr-3" />
                  <div>
                    <p className="font-medium">Email:</p>
                    <p className="text-sm ">skycos@yahoo.com | acctg.sky@gmail.com</p>
                  </div>
                </div>
              </div>
                
              <div className="mt-8">
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Solutions Showcase */}
      <section className="py-20 bg-muted/30 rounded-2xl">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Our Solutions</h2>
            <p className="text-lg">
              We provide a range of products to meet the needs of corporate offices, schools, and small businesses.
            </p>
          </div>
            
          <Tabs defaultValue="office" className="w-full">
            <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto mb-8">
              <TabsTrigger value="office">Office Supplies</TabsTrigger>
              <TabsTrigger value="furniture">Furniture</TabsTrigger>
            </TabsList>
            
            <TabsContent value="office" className="mt-4">
              <div className="relative h-[400px] rounded-xl overflow-hidden">
                <img 
                  src={schoolBanner} 
                  alt="Office Supplies" 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-end p-8 text-white">
                  <h3 className="text-2xl font-bold mb-3">Office & School Supplies</h3>
                  <p className="mb-4 max-w-2xl">
                    From essential stationery to specialized materials including our best-selling bond paper, we provide everything needed for daily operations.
                  </p>
                  <Button variant="outline" className="bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/20 w-fit">
                    <Link to="/search?category=office">Explore Office Supplies</Link>
                  </Button>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="furniture" className="mt-4">
              <div className="relative h-[400px] rounded-xl overflow-hidden">
                <img 
                  src={furnitureBanner} 
                  alt="Office Furniture" 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-end p-8 text-white">
                  <h3 className="text-2xl font-bold mb-3">Furniture Solutions</h3>
                  <p className="mb-4 max-w-2xl">
                    Ergonomic and stylish furniture designed to create comfortable and productive workspaces for any setting.
                  </p>
                  <Button variant="outline" className="bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/20 w-fit">
                    <Link to="/search?category=furniture">Explore Furniture</Link>
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <Badge className="mb-4">Trusted By Businesses</Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-6">What Our Clients Say</h2>
            <p className="text-lg ">
              We've built lasting relationships with businesses and institutions across the Philippines.
            </p>
          </div>
            
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                quote:`"1618 Office Solutions transformed our workspace with high-quality furniture and supplies that improved our team's productivity and comfort."`,
                author: "Maria Santos",
                position: "Operations Director",
                company: "Manila Business Solutions"
              },
              {
                quote: `"As a school administrator, I've relied on 1618 for years. Their educational supplies are top-notch and their customer service is unmatched."`,
                author: "Jose Reyes",
                position: "School Principal",
                company: "St. Mark's Academy"
              },
              {
                quote: `"The quality of their bond paper and office supplies has been consistent for our small business. Their prices are fair and service is always reliable."`,
                author: "Anna Lim",
                position: "Business Owner",
                company: "Lim Enterprises"
              }
            ].map((item, i) => (
              <Card key={i} className="bg-muted/30 border-none">
                <CardContent className="pt-6">
                  
                  <p className="mb-6">{item.quote}</p>
                  <div>
                    <p className="font-bold">{item.author}</p>
                    <p className="text-sm text-muted-foreground">{item.position}</p>
                    <p className="text-sm text-muted-foreground">{item.company}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-primary text-primary-foreground rounded-2xl">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Transform Your Workspace?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Contact us today to discuss how we can help you create an efficient and productive environment for your business or institution.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button size="lg" variant="secondary" asChild>
              <Link to="/search">Browse Products</Link>
            </Button>
            <Button size="lg" variant="ghost" className="border border-primary-foreground hover:bg-primary-foreground/20" onClick={() => document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' })}>
              Contact Sales
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}

export default Home;
