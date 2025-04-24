import React, { useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle } from "lucide-react";

interface CheckoutDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isSuccessful: boolean;
  paymentMethod: string;
  pickupMethod: string;
  orderNumber: string;
  total: number;
  purpose?: string; // new attribute for order purpose
}

const CheckoutDialog = ({
  open,
  onOpenChange,
  isSuccessful,
  paymentMethod,
  pickupMethod,
  orderNumber,
  total,
  purpose, // destructure new prop
}: CheckoutDialogProps) => {
  useEffect(() => {
    if (open && isSuccessful) {
      // Remove cart and checkout items from storage on successful order
      localStorage.removeItem('cartItems');
      localStorage.removeItem('checkoutItems');
    }
  }, [open, isSuccessful]);

  const navigate = useNavigate();

  const handleContinue = () => {
    if (isSuccessful) {
      // Navigate to orders page
      navigate('/');
    } else {
      // Close dialog and stay on checkout page
      onOpenChange(false);
    }
  };

  const formatPaymentMethod = (method: string) => {
    switch (method) {
      case 'cod':
        return 'Cash on Delivery';
      default:
        return method;
    }
  };

  const formatPickupMethod = (method: string) => {
    switch (method) {
      case 'delivery':
        return 'Delivery';
      default:
        return method;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex flex-row items-center gap-2">
            {isSuccessful ? (
              <>
                <CheckCircle2 className="h-6 w-6 text-green-500" />
                Invoice Sent Successfully
              </>
            ) : (
              <>
                <XCircle className="h-6 w-6 text-red-500" />
                Invoice Failed
              </>
            )}
          </DialogTitle>
        </DialogHeader>
        
        {isSuccessful ? (
          <div className="flex flex-col gap-4">
            <p>Thank you! Your invoice has been sent successfully. Here are the details:</p>
            
            <div className="bg-muted p-4 rounded-lg">
              <div className="grid grid-cols-2 gap-2">
                <span className="font-medium">Invoice Number:</span>
                <span>{orderNumber}</span>
                
                <span className="font-medium">Payment Method:</span>
                <span>{formatPaymentMethod(paymentMethod)}</span>
                
                <span className="font-medium">Pickup Method:</span>
                <span>{formatPickupMethod(pickupMethod)}</span>
                
                <span className="font-medium">Total Amount:</span>
                <span>₱{total.toLocaleString()}</span>

                <span className="font-medium">Purpose:</span>
                <span>{purpose || 'N/A'}</span>
              </div>
            </div>
            
            <p className="text-sm text-muted-foreground">
              {pickupMethod === 'store' 
                ? 'Please proceed to our store with your invoice number for pickup.'
                : 'We will process your delivery and contact you for shipping details.'}
            </p>
          </div>
        ) : (
          <p>There was an error sending your invoice. Please try again.</p>
        )}

        <div className="flex justify-end mt-4">
          <Button onClick={handleContinue}>
            {isSuccessful ? 'Back to Home' : 'Try Again'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CheckoutDialog;
