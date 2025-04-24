import { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { ScrollText, Loader2, XCircle } from "lucide-react";
import { useUser } from "@/contexts/UserContext";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

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

interface OrderItem {
  product_id: string;
  quantity: number;
  price_at_time: number;
  product_name: string;
  image_url: string;
}

interface Order {
  orderID: string;
  paymentStatus: string;
  pickupStatus: string;
  customerName: string;
  orderDate: string;
  purchasedProduct: string;
  totalAmount: number;
  items: OrderItem[];
}

export function OrderDialog() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [cancellingOrderId, setCancellingOrderId] = useState<string | null>(null);
  const { currentUser } = useUser();
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        setOrders([]);
        return;
      }
      if (!currentUser?.id) {
        setOrders([]);
        return;
      }

      const endpoint = currentUser?.role === 'admin'
        ? `${import.meta.env.VITE_API_URL}/api/orders`
        : `${import.meta.env.VITE_API_URL}/api/checkout/by-user/${currentUser?.id}`;

      const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          toast.error("Authentication error. Please log in again.");
        } else {
          throw new Error('Failed to fetch orders');
        }
        setOrders([]);
        return;
      }

      const data = await response.json();
      setOrders(data);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to fetch orders');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && currentUser) {
      fetchOrders();
    } else if (!currentUser) {
      setOrders([]);
    }
  }, [isOpen, currentUser]);

  const handleCancelOrder = async (orderId: string) => {
    setCancellingOrderId(orderId);
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error("Authentication required to cancel order.");
      setCancellingOrderId(null);
      return;
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/orders/${orderId}/cancel`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const responseData = await response.json();

      if (!response.ok) {
        const errorMessage = responseData?.message || `Failed to cancel order (Status: ${response.status})`;
        throw new Error(errorMessage);
      }

      toast.success(`Order ${orderId} cancelled successfully.`);
      fetchOrders();
    } catch (error: any) {
      console.error('Error cancelling order:', error);
      toast.error(`Cancellation failed: ${error.message}`);
    } finally {
      setCancellingOrderId(null);
    }
  };

  const calculateTotal = () => {
    return orders.reduce((total, order) => total + order.totalAmount, 0);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP'
    }).format(amount);
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        setIsOpen(open);
      }}
    >
      <DialogTrigger asChild>
        <ScrollText size={40} className="text-primary cursor-pointer" />
      </DialogTrigger>

      <DialogContent className="sm:max-w-[90vw] md:max-w-[95vw] lg:max-w-[90vw] xl:max-w-7xl max-h-[90vh] p-0 flex flex-col">
        <DialogHeader className="px-4 pt-4 sm:px-6">
          <div className="flex flex-row align-middle items-center gap-2">
            <ScrollText size={40} className="text-primary" />
            <DialogTitle>Order History</DialogTitle>
          </div>
          <DialogDescription>
            View your order history and status updates
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-auto px-4 pb-2 sm:px-6">
          {loading ? (
            <div className="flex justify-center items-center h-40">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[80px]">Order#</TableHead>
                    <TableHead>Products</TableHead>
                    <TableHead className="hidden sm:table-cell">Payment</TableHead>
                    <TableHead className="hidden md:table-cell">Pickup</TableHead>
                    <TableHead className="hidden sm:table-cell">Date</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        No orders found
                      </TableCell>
                    </TableRow>
                  ) : (
                    orders.map((order) => {
                      const canCancel = order.paymentStatus !== 'Cancelled' && order.paymentStatus !== 'Claimed' && order.pickupStatus !== 'Claimed';
                      const isCancelling = cancellingOrderId === order.orderID;

                      return (
                        <TableRow key={order.orderID}>
                          <TableCell className="font-medium">{order.orderID}</TableCell>
                          <TableCell className="truncate max-w-[100px] sm:max-w-xs">
                            <div className="truncate">{order.purchasedProduct}</div>
                            <div className="sm:hidden flex flex-col mt-1 text-xs text-gray-500">
                              <div className="flex gap-1">
                                <span>Status:</span>
                                <span className={`capitalize ${
                                  order.paymentStatus === 'Paid' ? 'text-green-600' :
                                  order.paymentStatus === 'Processing' ? 'text-yellow-600' :
                                  order.paymentStatus === 'Cancelled' ? 'text-red-600' :
                                  'text-gray-600'
                                }`}>
                                  {order.paymentStatus}
                                </span>
                              </div>
                              <div>{formatDate(order.orderDate)}</div>
                            </div>
                          </TableCell>
                          <TableCell className="hidden sm:table-cell">
                            <span className={`capitalize ${
                              order.paymentStatus === 'Paid' ? 'text-green-600' :
                              order.paymentStatus === 'Processing' ? 'text-yellow-600' :
                              order.paymentStatus === 'Cancelled' ? 'text-red-600' :
                              'text-gray-600'
                            }`}>
                              {order.paymentStatus}
                            </span>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            <span className={`capitalize ${
                              order.pickupStatus === 'Claimed' ? 'text-green-600' :
                              order.pickupStatus === 'Ready to Claim' ? 'text-yellow-600' :
                              order.pickupStatus === 'Cancelled' ? 'text-red-600' :
                              'text-gray-600'
                            }`}>
                              {order.pickupStatus}
                            </span>
                          </TableCell>
                          <TableCell className="hidden sm:table-cell">{formatDate(order.orderDate)}</TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(order.totalAmount)}
                          </TableCell>
                          <TableCell className="text-center">
                            {canCancel ? (
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleCancelOrder(order.orderID)}
                                disabled={isCancelling}
                              >
                                {isCancelling ? (
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : (
                                  <XCircle className="mr-2 h-4 w-4" />
                                )}
                                <span className="hidden sm:inline">Cancel</span>
                              </Button>
                            ) : (
                              <span className="text-xs text-gray-500 italic">N/A</span>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
                {orders.length > 0 && (
                  <TableFooter>
                    <TableRow>
                      <TableCell colSpan={5} className="hidden sm:table-cell">Total</TableCell>
                      <TableCell colSpan={3} className="sm:hidden">Total</TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(calculateTotal())}
                      </TableCell>
                      <TableCell></TableCell>
                    </TableRow>
                  </TableFooter>
                )}
              </Table>
            </div>
          )}
        </div>

        <DialogFooter className="px-4 py-3 sm:px-6 border-t">
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
