import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface QuickCheckoutFormProps {
  className?: string;
}

export default function QuickCheckoutForm({ className = "" }: QuickCheckoutFormProps) {
  const navigate = useNavigate();
  const [customerInfo, setCustomerInfo] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    company_name: ""
  });

  const handleInputChange = (field: string, value: string) => {
    setCustomerInfo(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Store the customer information in localStorage for use in checkout
    localStorage.setItem('prefilled_customer_info', JSON.stringify(customerInfo));
    localStorage.setItem('isGuestCheckout', 'true');
    
    // Navigate to product search page
    navigate('/search');
  };

  return (
    <Card className={`shadow-lg ${className}`}>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <h3 className="text-xl font-bold mb-4">Personal Information</h3>
          
          <div className="space-y-3">
            <div>
              <Label htmlFor="quick-name">Your Name</Label>
              <Input 
                id="quick-name" 
                placeholder="Enter your full name"
                value={customerInfo.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                required
              />
            </div>
            
            <div>
              <Label htmlFor="quick-company">Company Name (Optional)</Label>
              <Input 
                id="quick-company" 
                placeholder="Enter your company name"
                value={customerInfo.company_name}
                onChange={(e) => handleInputChange("company_name", e.target.value)}
              />
            </div>
            
            <div>
              <Label htmlFor="quick-phone">Phone Number</Label>
              <Input 
                id="quick-phone" 
                placeholder="Enter your contact number"
                value={customerInfo.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                required
              />
            </div>
            
            <div>
              <Label htmlFor="quick-email">Email Address</Label>
              <Input 
                id="quick-email" 
                type="email"
                placeholder="Enter your email address"
                value={customerInfo.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
              />
            </div>
            
            <div>
              <Label htmlFor="quick-address">Address</Label>
              <Textarea 
                id="quick-address" 
                placeholder="Enter your delivery address"
                value={customerInfo.address}
                onChange={(e) => handleInputChange("address", e.target.value)}
                className="resize-none"
                rows={2}
              />
            </div>
          </div>
          
          <Button type="submit" className="w-full">
            Start Shopping <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}