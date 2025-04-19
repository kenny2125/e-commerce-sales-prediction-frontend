import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ShoppingCart } from "lucide-react";
import { useNavigate, Navigate } from "react-router-dom";
import { useUser } from "@/contexts/UserContext";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableHead,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { QuantityInput } from "@/components/ui/quantity-input";
import { Input } from "@/components/ui/input";
import CheckoutDialog from "../../components/dialogs/CheckoutDialog";

interface CartItem {
  id: number;
  product_id: string;
  product_name: string;
  quantity: number;
  store_price: number;
  image_url: string | null;
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

const Checkout = () => {
  const navigate = useNavigate();
  const { currentUser } = useUser();
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [isOrderSuccessful, setIsOrderSuccessful] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState<string>("cod");
  const [pickupMethod, setPickupMethod] = useState<string>("delivery"); // Set default to 'delivery'
  const [purpose, setPurpose] = useState<string>("");

  // If not logged in, redirect to home
  if (!currentUser) {
    return <Navigate to="/" />;
  }

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
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
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
      }
    };

    fetchUserProfile();
  }, []);

  useEffect(() => {
    const fetchCheckoutItems = () => {
      try {
        setLoading(true);
        const savedItems = localStorage.getItem('checkoutItems');
        
        if (savedItems) {
          const items = JSON.parse(savedItems);
          setCartItems(items);
          // Clear the items from localStorage after loading them
          localStorage.removeItem('checkoutItems');
        } else {
          // If no items in localStorage, redirect back to home
          // navigate('/');
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

  async function payment() {
    if (!paymentMethod || !pickupMethod) {
      alert("Please select both payment and pickup methods");
      return;
    }
    
    setIsProcessing(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      // Create order through the API using the new checkout endpoint
      const orderData = {
        user_id: currentUser?.id, // Add user_id to match backend expectations
        total_amount: getTotal(),
        payment_method: paymentMethod,
        pickup_method: pickupMethod,
        purpose, // new attribute for order purpose
        items: cartItems.map(item => ({
          product_id: item.product_id,
          quantity: item.quantity,
          price_at_time: item.store_price
        }))
      };

      const orderResponse = await fetch(`${import.meta.env.VITE_API_URL}/api/checkout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(orderData)
      });

      if (!orderResponse.ok) {
        throw new Error('Failed to create order');
      }

      // Clear the purchased items from the cart
      for (const item of cartItems) {
        await fetch(`${import.meta.env.VITE_API_URL}/api/cart/remove/${item.product_id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
      }

      // Clear checkout items from localStorage
      localStorage.removeItem('checkoutItems');
      
      setIsOrderSuccessful(true);
      setDialogOpen(true);
    } catch (error) {
      console.error('Payment processing failed:', error);
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

  if (loading || !userProfile) {
    return <div className="flex justify-center items-center min-h-[60vh]">Loading checkout details...</div>;
  }

  return (
    <div className="py-8 px-4">
      <div className="flex flex-row align-middle items-center gap-2 mb-4">
        <ShoppingCart size={30} className="text-primary" />
        <h1 className="text-2xl font-bold">Checkout</h1>
      </div>

      <div className="flex flex-col md:flex-row gap-8 justify-between">
        <div className="flex-1 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px] hidden md:table-cell"></TableHead>
                <TableHead>Product Name</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cartItems.map((item) => (
                <TableRow key={item.product_id} className="align-middle">
                  <TableCell className="hidden md:table-cell">
                    <img
                      src={item.image_url || "https://placehold.co/100"}
                      alt={item.product_name}
                      className="w-[100px] h-[100px] object-cover"
                    />
                  </TableCell>
                  <TableCell className="font-medium">
                    <span className="md:inline line-clamp-2">
                      {item.product_name}
                    </span>
                  </TableCell>
                  <TableCell className="text-center">
                    {item.quantity}
                  </TableCell>
                  <TableCell className="text-right">
                    ₱{(item.store_price * item.quantity).toLocaleString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <div className="flex flex-col gap-2 justify-start align-bottom md:w-auto w-full">
          <h1 className="text-lg font-semibold">Customer Information</h1>
          <div>
            <h1>Order# </h1>
            <p>{new Date().getTime().toString().slice(-8)}</p>
          </div>
          <div className="flex flex-col md:flex-row gap-4 md:gap-12 justify-between">
            <div className="flex flex-row gap-2 items-center">
              <Label>Payment Method</Label>
              <Select onValueChange={setPaymentMethod} value={paymentMethod}>
                <SelectTrigger className="w-full md:w-[200px]">
                  <SelectValue placeholder="Select a Payment Method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cod">Cash on Delivery</SelectItem>
                  {/* Only Cash on Delivery is available by default */}
                  {/* <SelectItem value="gcash">GCASH</SelectItem>
                  <SelectItem value="paymaya">PAYMAYA</SelectItem> */}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-row gap-2 items-center">
              <Label>Pickup Method</Label>
              <Select onValueChange={setPickupMethod} value={pickupMethod}>
                <SelectTrigger className="w-full md:w-[200px]">
                  <SelectValue placeholder="Select a Pickup Method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="delivery">Delivery</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex flex-col gap-2 mt-4">
            <Label>Purpose</Label>
            <Input
              placeholder="Enter order purpose"
              value={purpose}
              onChange={e => setPurpose(e.target.value)}
            />
          </div>
          <div className="flex flex-col md:flex-row gap-4 md:gap-8 justify-between">
            <div className="flex flex-row gap-4">
              <h1 className="font-medium">Customer Name</h1>
              <p>{userProfile.first_name} {userProfile.last_name}</p>
            </div>
            <div className="flex flex-row gap-4">
              <h1 className="font-medium">Contact Number</h1>
              <p>{userProfile.phone || "No phone number provided"}</p>
            </div>
          </div>
          <div>
            <h1 className="font-medium">Address</h1>
            <p>{userProfile.address || "No address provided"}</p>
          </div>
          <div className="flex flex-row justify-between align-bottom mt-4">
            <div>
              <h1 className="font-semibold">Order Information</h1>
              <p>Total Payment</p>
            </div>
            <div className="font-bold text-lg">
              ₱{getTotal().toLocaleString()}
            </div>
          </div>
          <Button 
            onClick={payment} 
            className="mt-6 w-full relative" 
            disabled={isProcessing || cartItems.length === 0}
          >
            {isProcessing && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
            <span className={isProcessing ? "opacity-0" : "opacity-100"}>
              Place Order
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
        orderNumber={new Date().getTime().toString().slice(-8)}
        total={getTotal()}
        purpose={purpose}
      />
    </div>
  );
};

export default Checkout;
