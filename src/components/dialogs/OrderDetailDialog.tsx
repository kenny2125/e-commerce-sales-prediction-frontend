import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
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
  address: string;
  contactNumber: string;
  notes?: string;
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
      <DialogContent className="p-0 gap-0 max-w-[98vw] min-w-[1200px] h-[90vh]">
        <div className="flex flex-col h-full overflow-hidden">
          <DialogHeader className="p-5 pb-2 border-b">
            <DialogTitle className="text-2xl font-bold">Order #{order.orderID}</DialogTitle>
          </DialogHeader>
          
          <div className="flex-1 overflow-auto px-6">
            <div className="grid grid-cols-12 gap-8 py-5">
              {/* Order Information */}
              <Card className="col-span-4 border-0 shadow-none">
                <CardContent className="pt-3">
                  <h2 className="text-xl font-bold mb-4">Order Information</h2>
                  <dl className="space-y-4">
                    <div className="grid grid-cols-2 py-2">
                      <dt className="font-medium text-gray-600 dark:text-gray-300">Customer:</dt>
                      <dd className="font-semibold">{order.customerName}</dd>
                    </div>
                    <div className="grid grid-cols-2 py-2">
                      <dt className="font-medium text-gray-600 dark:text-gray-300">Date:</dt>
                      <dd className="font-semibold">{formatDate(order.orderDate)}</dd>
                    </div>
                    <div className="grid grid-cols-2 py-2">
                      <dt className="font-medium text-gray-600 dark:text-gray-300">Address:</dt>
                      <dd className="font-semibold">{order.address}</dd>
                    </div>
                    <div className="grid grid-cols-2 py-2">
                      <dt className="font-medium text-gray-600 dark:text-gray-300">Contact Number:</dt>
                      <dd className="font-semibold">{order.contactNumber}</dd>
                    </div>
                    {order.notes && (
                      <div className="grid grid-cols-2 py-2">
                        <dt className="font-medium text-gray-600 dark:text-gray-300">Notes:</dt>
                        <dd className="font-semibold whitespace-pre-wrap">{order.notes}</dd>
                      </div>
                    )}
                    <div className="grid grid-cols-2 py-2">
                      <dt className="font-medium text-gray-600 dark:text-gray-300">Payment Status:</dt>
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
                    <div className="grid grid-cols-2 py-2">
                      <dt className="font-medium text-gray-600 dark:text-gray-300">Pickup Status:</dt>
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

              {/* Order Items */}
              <div className="col-span-8">
                <h2 className="text-xl font-bold mb-4">Order Items</h2>
                <Table className="border rounded-md">
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="w-[50%]">Product</TableHead>
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
                          <TableCell className="font-medium">{item.product_name}</TableCell>
                          <TableCell className="text-right">{item.quantity}</TableCell>
                          <TableCell className="text-right">{formatCurrency(item.price_at_time)}</TableCell>
                          <TableCell className="text-right">{formatCurrency(lineTotal)}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                  <TableFooter>
                    <TableRow>
                      <TableCell colSpan={3} className="font-semibold">Grand Total</TableCell>
                      <TableCell className="text-right font-semibold text-lg">
                        {formatCurrency(order.items.reduce((sum, i) => sum + i.quantity * i.price_at_time, 0))}
                      </TableCell>
                    </TableRow>
                  </TableFooter>
                </Table>
              </div>
            </div>
          </div>
          
          <DialogFooter className="p-5 py-3 border-t mt-auto">
            <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
