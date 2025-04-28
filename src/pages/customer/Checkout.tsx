import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ShoppingCart, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useUser } from "@/contexts/UserContext";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableHead,
  TableRow,
  TableFooter,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import CheckoutDialog from "../../components/dialogs/CheckoutDialog";

interface CartItem {
  id: number;
  product_id: string;
  sku: string;
  product_name: string;
  variant_name?: string;
  quantity: number;
  store_price: number;
  image_url: string | null;
  stock?: number;
}

interface UserProfile {
  id: string;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  gender?: string;
  address?: string;
  phone?: string;
  role: string;
}

interface GuestCustomerInfo {
  name: string;
  email: string;
  phone: string;
  address: string;
  company_name: string; // Add company_name field
}

const Checkout = () => {
  const navigate = useNavigate();
  const { currentUser, isLoggedIn } = useUser();
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [isOrderSuccessful, setIsOrderSuccessful] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState<string>("cod");
  const [pickupMethod, setPickupMethod] = useState<string>("delivery");
  const [purpose, setPurpose] = useState<string>("");
  const [orderNumber, setOrderNumber] = useState<string>("");
  const [isGuestCheckout, setIsGuestCheckout] = useState(false);
  
  // Guest checkout information
  const [guestInfo, setGuestInfo] = useState<GuestCustomerInfo>({
    name: '',
    email: '',
    phone: '',
    address: '',
    company_name: '' // Initialize company_name
  });

  useEffect(() => {
    // Check if this is a guest checkout
    const guestCheckout = localStorage.getItem('isGuestCheckout');
    setIsGuestCheckout(guestCheckout === 'true');
    
    // If the user is logged in, redirect to the standard checkout flow
    if (isLoggedIn && guestCheckout === 'true') {
      localStorage.removeItem('isGuestCheckout');
    }
  }, [isLoggedIn]);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        if (!isLoggedIn) return;
        
        const token = localStorage.getItem('token');
        if (!token) return;

        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/profile`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          setUserProfile(data);
          
          // Initialize guest info from user profile for logged in users
          if (data) {
            setGuestInfo({
              name: `${data.first_name} ${data.last_name}`,
              email: data.email || '',
              phone: data.phone || '',
              address: data.address || ''
            });
          }
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
      }
    };

    fetchUserProfile();
  }, [isLoggedIn]);

  useEffect(() => {
    const fetchCheckoutItems = () => {
      try {
        setLoading(true);
        const savedItems = localStorage.getItem('checkoutItems');
        
        if (savedItems) {
          const items = JSON.parse(savedItems);
          setCartItems(items);
        } else {
          // If no items in localStorage, redirect back to home
          navigate('/');
        }
      } catch (error) {
        console.error('Error loading checkout items:', error);
        navigate('/');
      } finally {
        setLoading(false);
      }
    };

    fetchCheckoutItems();
  }, [navigate]);

  const validateGuestInfo = () => {
    if (!guestInfo.name.trim()) {
      toast.error("Please enter your name", {
        description: "Full name is required to complete your order"
      });
      return false;
    }
    
    if (!guestInfo.phone.trim()) {
      toast.error("Please enter your phone number", {
        description: "A contact number is required to complete your order"
      });
      return false;
    }
    
    if (pickupMethod === 'delivery' && !guestInfo.address.trim()) {
      toast.error("Please enter your address", {
        description: "Delivery address is required for home delivery"
      });
      return false;
    }
    
    return true;
  };

  async function payment() {
    if (!paymentMethod || !pickupMethod) {
      toast.error("Missing Information", {
        description: "Please select both payment and pickup methods"
      });
      return;
    }
    
    // For guest checkout, validate customer information first
    if (isGuestCheckout && !validateGuestInfo()) {
      return;
    }
    
    setIsProcessing(true);
    try {
      let response;
      
      if (isGuestCheckout) {
        // Handle guest checkout
        response = await fetch(`${import.meta.env.VITE_API_URL}/api/checkout/guest-checkout`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            payment_method: paymentMethod,
            pickup_method: pickupMethod,
            purpose: purpose,
            items: cartItems.map(item => ({
              product_id: item.product_id,
              sku: item.sku || '',
              quantity: item.quantity
            })),
            customer_info: {
              name: guestInfo.name,
              phone: guestInfo.phone,
              email: guestInfo.email,
              address: guestInfo.address,
              company_name: guestInfo.company_name
            }
          })
        });
      } else {
        // Regular checkout for logged-in users
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No authentication token found');
        }

        // Create order through the API using the checkout endpoint
        const orderData = {
          payment_method: paymentMethod,
          pickup_method: pickupMethod,
          purpose, 
          items: cartItems.map(item => ({
            product_id: item.product_id,
            sku: item.sku || '',
            quantity: item.quantity
          }))
        };

        response = await fetch(`${import.meta.env.VITE_API_URL}/api/checkout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(orderData)
        });
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || errorData.message || 'Failed to create order');
      }

      // Get the order data including the orderID generated by the backend
      const orderResult = await response.json();
      setOrderNumber(orderResult.orderID);

      // Clear checkout items and guest checkout flag from localStorage
      localStorage.removeItem('checkoutItems');
      localStorage.removeItem('isGuestCheckout');
      
      // Clear cart items
      localStorage.removeItem('cartItems');
      
      // Show success toast
      toast.success("Order placed successfully!", {
        description: `Your order #${orderResult.orderID || 'Unknown'} has been received.`
      });
      
      setIsOrderSuccessful(true);
      setDialogOpen(true);
    } catch (error) {
      console.error('Payment processing failed:', error);
      toast.error("Checkout Failed", {
        description: error instanceof Error ? error.message : "An error occurred during checkout"
      });
      setIsOrderSuccessful(false);
      setDialogOpen(true);
    } finally {
      setIsProcessing(false);
    }
  }

  const getTotal = () => {
    return cartItems.reduce(
      (sum, item) => sum + item.store_price * item.quantity,
      0
    );
  };

  const handleInputChange = (field: keyof GuestCustomerInfo, value: string) => {
    setGuestInfo(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (loading) {
    return <div className="flex justify-center items-center min-h-[60vh]">Loading checkout details...</div>;
  }

  // For guests who need to enter their info or logged-in users
  return (
    <div className="py-8 px-4">
      <div className="flex flex-row align-middle items-center gap-2 mb-6">
        <ShoppingCart size={30} className="text-primary" />
        <h1 className="text-2xl font-bold">Checkout</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Customer Information - Left Side */}
        <Card className="lg:col-span-4 border shadow-sm">
          <CardContent className="p-6">
            <h2 className="text-xl font-bold mb-4">Customer Information</h2>
  
            
            {/* Customer details form for guest checkout */}
            {isGuestCheckout && (
              <div className="space-y-4 mb-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input 
                    id="name" 
                    value={guestInfo.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Enter your full name"
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="company_name">Company Name (optional)</Label>
                  <Input 
                    id="company_name" 
                    value={guestInfo.company_name}
                    onChange={(e) => handleInputChange('company_name', e.target.value)}
                    placeholder="Enter your company name (if applicable)"
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input 
                    id="phone" 
                    value={guestInfo.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="Enter your phone number"
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="email">Email (optional)</Label>
                  <Input 
                    id="email" 
                    type="email"
                    value={guestInfo.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="Enter your email address"
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="address">Address</Label>
                  <Textarea
                    id="address"
                    value={guestInfo.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    placeholder="Enter your complete address"
                    rows={3}
                  />
                </div>
              </div>
            )}
            
            {/* Customer info display for logged in users */}
            {!isGuestCheckout && userProfile && (
              <dl className="space-y-4">
                <div className="grid grid-cols-2 py-2">
                  <dt className="font-medium text-gray-600 dark:text-gray-300">Customer Name:</dt>
                  <dd className="font-semibold">{userProfile.first_name} {userProfile.last_name}</dd>
                </div>
                <div className="grid grid-cols-2 py-2">
                  <dt className="font-medium text-gray-600 dark:text-gray-300">Email:</dt>
                  <dd className="font-semibold">{userProfile.email}</dd>
                </div>
                <div className="grid grid-cols-2 py-2">
                  <dt className="font-medium text-gray-600 dark:text-gray-300">Contact Number:</dt>
                  <dd className="font-semibold">{userProfile.phone || "No phone number provided"}</dd>
                </div>
                <div className="grid grid-cols-2 py-2">
                  <dt className="font-medium text-gray-600 dark:text-gray-300">Address:</dt>
                  <dd className="font-semibold">{userProfile.address || "No address provided"}</dd>
                </div>
              </dl>
            )}
            
            {/* Payment and pickup options */}
            <div className="mt-8 space-y-4">
              <h3 className="font-semibold text-lg">Order Options</h3>
              
              <div className="grid gap-3">
                <div className="grid gap-2">
                  <Label>Payment Method</Label>
                  <Select onValueChange={setPaymentMethod} value={paymentMethod} defaultValue="cod">
                    <SelectTrigger>
                      <SelectValue placeholder="Select a Payment Method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cod">Cash on Delivery</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid gap-2">
                  <Label>Pickup Method</Label>
                  <Select onValueChange={setPickupMethod} value={pickupMethod} defaultValue="delivery">
                    <SelectTrigger>
                      <SelectValue placeholder="Select a Pickup Method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="delivery">Delivery</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid gap-2 mt-2">
                  <Label>Order Notes (Optional)</Label>
                  <Textarea
                    placeholder="Add any special instructions or notes about your order"
                    value={purpose}
                    onChange={e => setPurpose(e.target.value)}
                    className="min-h-[80px]"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Order Items - Right Side */}
        <div className="lg:col-span-8">
          <h2 className="text-xl font-bold mb-4">Order Items</h2>
          <Table className="border rounded-md">
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead>Product</TableHead>
                <TableHead className="text-right">Quantity</TableHead>
                <TableHead className="text-right">Price</TableHead>
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cartItems.map((item) => (
                <TableRow key={`${item.product_id}-${item.sku || ''}`}>
                  <TableCell className="font-medium">
                    {item.product_name}
                    {item.variant_name && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {item.variant_name}
                      </p>
                    )}
                  </TableCell>
                  <TableCell className="text-right">{item.quantity}</TableCell>
                  <TableCell className="text-right">₱{item.store_price.toLocaleString()}</TableCell>
                  <TableCell className="text-right">₱{(item.store_price * item.quantity).toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
            <TableFooter>
              <TableRow>
                <TableCell colSpan={3} className="text-right font-bold">Total Amount:</TableCell>
                <TableCell className="text-right font-bold text-lg">₱{getTotal().toLocaleString()}</TableCell>
              </TableRow>
            </TableFooter>
          </Table>
          
          <Button 
            onClick={payment} 
            className="mt-6 w-full relative" 
            size="lg"
            disabled={isProcessing || cartItems.length === 0}
          >
            {isProcessing && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
            <span className={isProcessing ? "opacity-0" : "opacity-100"}>
              Place Order - ₱{getTotal().toLocaleString()}
            </span>
          </Button>
        </div>
      </div>
      
      <CheckoutDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        isSuccessful={isOrderSuccessful}
        paymentMethod={paymentMethod}
        pickupMethod={pickupMethod}
        orderNumber={orderNumber}
        total={getTotal()}
        purpose={purpose}
      />
    </div>
  );
};

export default Checkout;
