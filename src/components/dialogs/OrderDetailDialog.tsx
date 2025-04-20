import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface OrderItem {
  product_id: string;
  product_name: string;
  quantity: number;
  price_at_time: number;
}

export interface OrderDetail {
  orderID: string;
  paymentStatus: string;
  pickupStatus: string;
  customerName: string;
  orderDate: string;
  totalAmount: number;
  items: OrderItem[];
}

interface OrderDetailDialogProps {
  order: OrderDetail;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function OrderDetailDialog({ order, open, onOpenChange }: OrderDetailDialogProps) {
  const [updatingStatus, setUpdatingStatus] = React.useState(false);
  const [paymentStatus, setPaymentStatus] = React.useState(order.paymentStatus);
  const [pickupStatus, setPickupStatus] = React.useState(order.pickupStatus);

  const formatCurrency = (value?: number) => {
    if (value == null) return 'PHP 0.00';
    return new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(value);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'paid': return 'bg-green-500 text-white';
      case 'processing': return 'bg-yellow-500 text-white';
      case 'cancelled': return 'bg-red-500 text-white';
      case 'refunded': return 'bg-purple-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getPickupStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'claimed': return 'bg-green-500 text-white';
      case 'ready to claim': return 'bg-blue-500 text-white';
      case 'cancelled': return 'bg-red-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const handleUpdateStatus = async (field: 'paymentStatus' | 'pickupStatus', status: string) => {
    setUpdatingStatus(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/orders/${order.orderID}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status, field })
      });
      
      if (!response.ok) {
        throw new Error('Failed to update status');
      }
      
      if (field === 'paymentStatus') {
        order.paymentStatus = status;
        setPaymentStatus(status);
      } else {
        order.pickupStatus = status;
        setPickupStatus(status);
      }
      
      toast.success(`Order ${field === 'paymentStatus' ? 'payment' : 'pickup'} status updated`);
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error('Failed to update order status');
    } finally {
      setUpdatingStatus(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-screen max-w-[95vw] min-w-[800px] p-0 gap-0">
        <DialogHeader className="p-6 pb-2">
          <DialogTitle className="text-xl">Order Details - {order.orderID}</DialogTitle>
        </DialogHeader>
        
        <div className="p-6 pt-2 printable-area">
          <div className="grid grid-cols-3 gap-6">
            {/* Left: Order Summary Card */}
            <Card className="col-span-1">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Order Information</CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="divide-y">
                  <div className="grid grid-cols-2 py-3">
                    <dt className="font-medium">Customer</dt>
                    <dd>{order.customerName}</dd>
                  </div>
                  <div className="grid grid-cols-2 py-3">
                    <dt className="font-medium">Date</dt>
                    <dd>{formatDate(order.orderDate)}</dd>
                  </div>
                  <div className="grid grid-cols-2 py-3">
                    <dt className="font-medium">Payment Status</dt>
                    <dd>
                      <Select 
                        defaultValue={paymentStatus}
                        onValueChange={(value) => handleUpdateStatus('paymentStatus', value)}
                        disabled={updatingStatus}
                      >
                        <SelectTrigger className={`w-full h-9 ${getPaymentStatusColor(paymentStatus)}`}>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Processing" className="bg-yellow-500 text-white my-1">
                            Processing
                          </SelectItem>
                          <SelectItem value="Paid" className="bg-green-500 text-white my-1">
                            Paid
                          </SelectItem>
                          <SelectItem value="Cancelled" className="bg-red-500 text-white my-1">
                            Cancelled
                          </SelectItem>
                          <SelectItem value="Refunded" className="bg-purple-500 text-white my-1">
                            Refunded
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </dd>
                  </div>
                  <div className="grid grid-cols-2 py-3">
                    <dt className="font-medium">Pickup Status</dt>
                    <dd>
                      <Select 
                        defaultValue={pickupStatus}
                        onValueChange={(value) => handleUpdateStatus('pickupStatus', value)}
                        disabled={updatingStatus}
                      >
                        <SelectTrigger className={`w-full h-9 ${getPickupStatusColor(pickupStatus)}`}>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Ready to Claim" className="bg-blue-500 text-white my-1">
                            Ready to Claim
                          </SelectItem>
                          <SelectItem value="Claimed" className="bg-green-500 text-white my-1">
                            Claimed
                          </SelectItem>
                          <SelectItem value="Cancelled" className="bg-red-500 text-white my-1">
                            Cancelled
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </dd>
                  </div>
                </dl>
              </CardContent>
            </Card>

            {/* Right: Items Table */}
            <div className="col-span-2">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Order Items</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[400px]">Product</TableHead>
                        <TableHead className="text-right">Quantity</TableHead>
                        <TableHead className="text-right">Price</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {order.items.map((item) => {
                        const lineTotal = item.quantity * item.price_at_time;
                        return (
                          <TableRow key={item.product_id}>
                            <TableCell>{item.product_name}</TableCell>
                            <TableCell className="text-right">{item.quantity}</TableCell>
                            <TableCell className="text-right">{formatCurrency(item.price_at_time)}</TableCell>
                            <TableCell className="text-right">{formatCurrency(lineTotal)}</TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                    <TableFooter>
                      <TableRow>
                        <TableCell colSpan={3} className="font-medium">Grand Total</TableCell>
                        <TableCell className="text-right font-medium">
                          {formatCurrency(order.items.reduce((sum, i) => sum + i.quantity * i.price_at_time, 0))}
                        </TableCell>
                      </TableRow>
                    </TableFooter>
                  </Table>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
        
        <DialogFooter className="px-6 py-4 border-t">
          <Button onClick={() => window.print()}>Print</Button>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
