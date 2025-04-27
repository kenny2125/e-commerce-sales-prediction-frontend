import React from "react";
import { ShoppingCart, UserPlus, ClipboardCheck, Bell, Truck } from "lucide-react";

const PurchasingGuide: React.FC = () => {
  return (
    <div className="max-w-2xl mx-auto p-8 bg-white dark:bg-gray-900 rounded-lg shadow-md">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 flex items-center justify-center gap-2">
          <ShoppingCart className="w-8 h-8 text-primary" /> Purchasing Guide
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-base">A step-by-step guide to a smooth shopping experience.</p>
      </div>
      <div className="flex flex-col gap-8">
        {/* Step 1: Register */}
        <div className="flex items-start gap-4">
          <UserPlus className="w-6 h-6 text-blue-500 mt-1" />
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Step 1: Register or Log In</h2>
            <p className="text-gray-600 dark:text-gray-300 text-sm">Create a new account or log in to your existing account to start shopping.</p>
          </div>
        </div>
        {/* Step 2: Add Items to Cart */}
        <div className="flex items-start gap-4">
          <ShoppingCart className="w-6 h-6 text-green-500 mt-1" />
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Step 2: Add Items to Cart</h2>
            <p className="text-gray-600 dark:text-gray-300 text-sm">Browse our products and add the items you wish to purchase to your shopping cart.</p>
          </div>
        </div>
        {/* Step 3: Place Order */}
        <div className="flex items-start gap-4">
          <ClipboardCheck className="w-6 h-6 text-yellow-500 mt-1" />
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Step 3: Place Your Order</h2>
            <p className="text-gray-600 dark:text-gray-300 text-sm">Proceed to checkout, review your order, and select either Store Pickup or Delivery. Payment is Cash on Delivery (COD). Confirm your purchase.</p>
          </div>
        </div>
        {/* Step 4: Wait for Updates */}
        <div className="flex items-start gap-4">
          <Bell className="w-6 h-6 text-purple-500 mt-1" />
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Step 4: Check Order Status</h2>
            <p className="text-gray-600 dark:text-gray-300 text-sm">You can check the status of your order, including confirmation and shipping updates, in your account section on our website/app.</p>
          </div>
        </div>
        {/* Step 5: Wait for Delivery */}
        <div className="flex items-start gap-4">
          <Truck className="w-6 h-6 text-cyan-500 mt-1" />
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Step 5: Wait for Delivery</h2>
            <p className="text-gray-600 dark:text-gray-300 text-sm">Track your package using the provided tracking number and wait for it to arrive at your doorstep.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PurchasingGuide;
