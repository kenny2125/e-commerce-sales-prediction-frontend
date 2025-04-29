import React from "react";
import { ShoppingCart, ClipboardCheck, Truck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";

const PurchasingGuide: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto p-8">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-3 flex items-center justify-center gap-2">
          <ShoppingCart className="w-8 h-8 text-primary" /> Purchasing Guide
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-base">A step-by-step guide to a smooth shopping experience.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Step 1: Add Items to Cart */}
        <Card>
          <CardHeader className="text-center pb-2">
            <div className="flex justify-center mb-4">
              <div className="bg-green-100 dark:bg-green-900 p-3 rounded-full">
                <ShoppingCart className="w-8 h-8 text-green-500 dark:text-green-400" />
              </div>
            </div>
            <CardTitle className="text-xl">Step 1: Add Items to Cart</CardTitle>
          </CardHeader>
          <CardContent className="text-center text-muted-foreground">
            Browse our products and add the items you wish to purchase to your shopping cart.
          </CardContent>
        </Card>
        
        {/* Step 2: Place Order */}
        <Card>
          <CardHeader className="text-center pb-2">
            <div className="flex justify-center mb-4">
              <div className="bg-yellow-100 dark:bg-yellow-900 p-3 rounded-full">
                <ClipboardCheck className="w-8 h-8 text-yellow-500 dark:text-yellow-400" />
              </div>
            </div>
            <CardTitle className="text-xl">Step 2: Place Your Order</CardTitle>
          </CardHeader>
          <CardContent className="text-center text-muted-foreground">
            Proceed to checkout, review your order, and select either Store Pickup or Delivery. Payment is Cash on Delivery (COD).
          </CardContent>
        </Card>
        
        {/* Step 3: Wait for Delivery */}
        <Card>
          <CardHeader className="text-center pb-2">
            <div className="flex justify-center mb-4">
              <div className="bg-cyan-100 dark:bg-cyan-900 p-3 rounded-full">
                <Truck className="w-8 h-8 text-cyan-500 dark:text-cyan-400" />
              </div>
            </div>
            <CardTitle className="text-xl">Step 3: Receive Your Order</CardTitle>
          </CardHeader>
          <CardContent className="text-center text-muted-foreground">
            Wait for your package to arrive at your doorstep or visit our store for pickup depending on your selection.
          </CardContent>
        </Card>
      </div>
      
      <Card className="mt-10">
        <CardContent className="p-6">
          <p className="text-center text-muted-foreground">
            Need help with your purchase? Contact our customer support team at <span className="font-medium">acctg.sky@gmail.com</span>
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default PurchasingGuide;
