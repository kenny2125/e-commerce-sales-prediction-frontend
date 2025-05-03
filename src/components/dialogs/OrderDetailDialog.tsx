import React, { useRef, useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Printer, Save, Tag, Trash, Edit } from 'lucide-react';
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export interface OrderItem {
  product_id: string;
  product_name: string;
  variant_name?: string;
  quantity: number;
  price_at_time: number;
}

export interface OrderDetail {
  orderID: string;
  paymentStatus: string;
  pickupStatus: string;
  customerName: string;
  companyName?: string; // Added company name field
  orderDate: string;
  totalAmount: number;
  originalAmount?: number; // Original amount before discount
  discountAmount?: number; // Discount amount if any
  discountReason?: string; // Reason for discount
  address: string;
  contactNumber: string;
  notes?: string;
  items: OrderItem[];
  paymentMethod?: string;
  pickupMethod?: string;
}

interface OrderDetailDialogProps {
  order: OrderDetail;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDelete?: () => void; // Add callback for deletion
  onUpdate?: () => void; // Add callback for updates (like discounts)
  onStatusChange?: () => void; // Add callback for status changes
}

export function OrderDetailDialog({ order, open, onOpenChange, onDelete, onUpdate, onStatusChange }: OrderDetailDialogProps) {
  const [updatingStatus, setUpdatingStatus] = React.useState(false);
  const [paymentStatus, setPaymentStatus] = React.useState(order.paymentStatus);
  const [pickupStatus, setPickupStatus] = React.useState(order.pickupStatus);
  const [applyingDiscount, setApplyingDiscount] = useState(false);
  const [removingDiscount, setRemovingDiscount] = useState(false);
  const [discountAmount, setDiscountAmount] = useState(order.discountAmount || 0);
  const [showDiscountForm, setShowDiscountForm] = useState(false);
  const [isEditingDiscount, setIsEditingDiscount] = useState(false);
  const [previewTotalAfterDiscount, setPreviewTotalAfterDiscount] = useState(order.totalAmount || 0);
  const [deletingOrder, setDeletingOrder] = useState(false);
  const printContentRef = useRef<HTMLDivElement>(null);

  // Format payment method from database values to user-friendly text
  const formatPaymentMethod = (method?: string) => {
    if (!method) return '';
    
    const methodMap: Record<string, string> = {
      'cod': 'Cash on Delivery',
      'cash': 'Cash Payment',
      'bank': 'Bank Transfer',
      'gcash': 'GCash',
      'maya': 'Maya',
      'credit': 'Credit Card',
    };
    
    return methodMap[method.toLowerCase()] || method;
  };
  
  // Format delivery method from database values to user-friendly text
  const formatDeliveryMethod = (method?: string) => {
    if (!method) return '';
    
    const methodMap: Record<string, string> = {
      'delivery': 'Delivery',
      'pickup': 'Store Pickup',
      'courier': 'Courier Service',
    };
    
    return methodMap[method.toLowerCase()] || method;
  };

  // Update preview total when discount amount changes
  useEffect(() => {
    const originalAmount = order.originalAmount || order.totalAmount;
    const newTotal = Math.max(0, originalAmount - discountAmount);
    setPreviewTotalAfterDiscount(newTotal);
  }, [discountAmount, order.originalAmount, order.totalAmount]);

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
      case 'paid (discounted)': return 'bg-emerald-500 text-white';
      case 'discounted': return 'bg-blue-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getPickupStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'claimed': return 'bg-green-500 text-white';
      case 'processing': return 'bg-yellow-500 text-white';
      case 'on delivery': return 'bg-blue-500 text-white';
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
      if (onStatusChange) onStatusChange(); // Call the onStatusChange callback if provided
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error('Failed to update order status');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleApplyDiscount = async () => {
    if (!discountAmount || discountAmount <= 0) {
      toast.error('Discount amount must be greater than 0');
      return;
    }

    if (order.totalAmount && discountAmount >= (order.originalAmount || order.totalAmount)) {
      toast.error('Discount cannot be greater than the total amount');
      return;
    }

    setApplyingDiscount(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/orders/${order.orderID}/discount`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          discountAmount: Number(discountAmount)
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to apply discount');
      }
      
      const updatedOrder = await response.json();
      
      // Update the current order with new values
      order.totalAmount = updatedOrder.totalAmount;
      order.originalAmount = updatedOrder.originalAmount;
      order.discountAmount = updatedOrder.discountAmount;
      
      setShowDiscountForm(false);
      setIsEditingDiscount(false);
      
      toast.success(isEditingDiscount ? 'Discount updated successfully' : 'Discount applied successfully');
      if (onUpdate) onUpdate(); // Call the onUpdate callback if provided
    } catch (error) {
      console.error('Error applying discount:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to apply discount');
    } finally {
      setApplyingDiscount(false);
    }
  };

  const handleRemoveDiscount = async () => {
    setRemovingDiscount(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      toast.promise(
        fetch(`${import.meta.env.VITE_API_URL}/api/orders/${order.orderID}/discount`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          }
        }).then(async (response) => {
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to remove discount');
          }
          
          const updatedOrder = await response.json();
          
          // Update the current order with new values
          order.totalAmount = updatedOrder.totalAmount;
          order.originalAmount = updatedOrder.originalAmount;
          order.discountAmount = 0;
          
          return 'Discount removed successfully';
        }),
        {
          loading: 'Removing discount...',
          success: (message) => message,
          error: (error) => error instanceof Error ? error.message : 'Failed to remove discount'
        }
      );
    } catch (error) {
      console.error('Error removing discount:', error);
    } finally {
      setRemovingDiscount(false);
    }
  };

  const handlePrint = () => {
    // Create a hidden iframe for printing
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    document.body.appendChild(iframe);
    
    // Calculate the grand total
    const grandTotal = order.totalAmount;
    const originalTotal = order.originalAmount || grandTotal;
    const discountAmount = order.discountAmount || 0;

    // Generate print-friendly HTML content
    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Order #${order.orderID} - Receipt</title>
        <meta charset="UTF-8">
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 20px;
            color: #333;
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 1px solid #ddd;
            padding-bottom: 10px;
          }
          .order-info {
            margin-bottom: 20px;
          }
          .order-info div {
            margin-bottom: 5px;
          }
          .label {
            font-weight: bold;
            display: inline-block;
            width: 150px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
          }
          th, td {
            padding: 10px;
            text-align: left;
            border-bottom: 1px solid #ddd;
          }
          th {
            background-color: #f2f2f2;
            font-weight: bold;
          }
          .text-right {
            text-align: right;
          }
          .total-row {
            font-weight: bold;
            font-size: 1.1em;
          }
          .discount-row {
            color: #e53e3e;
          }
          .footer {
            margin-top: 30px;
            text-align: center;
            font-size: 0.9em;
            color: #666;
          }
          @media print {
            @page { margin: 0.5cm; }
            body { font-size: 12pt; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>1618 Office Solutions</h1>
          <h2>Order Receipt</h2>
        </div>
        
        <div class="order-info">
          <h3>Order #${order.orderID}</h3>
          <div><span class="label">Date:</span> ${formatDate(order.orderDate)}</div>
          <div><span class="label">Customer:</span> ${order.customerName}</div>
          ${order.companyName ? `<div><span class="label">Company:</span> ${order.companyName}</div>` : ''}
          <div><span class="label">Address:</span> ${order.address}</div>
          <div><span class="label">Contact:</span> ${order.contactNumber}</div>
          ${order.paymentMethod ? `<div><span class="label">Payment Method:</span> ${order.paymentMethod}</div>` : ''}
          ${order.pickupMethod ? `<div><span class="label">Delivery Method:</span> ${order.pickupMethod}</div>` : ''}
          <div><span class="label">Payment Status:</span> ${paymentStatus}</div>
          <div><span class="label">Pickup Status:</span> ${pickupStatus}</div>
          ${order.notes ? `<div><span class="label">Notes:</span> ${order.notes}</div>` : ''}
          ${order.discountReason ? `<div><span class="label">Discount Reason:</span> ${order.discountReason}</div>` : ''}
        </div>
        
        <table>
          <thead>
            <tr>
              <th style="width: 50%">Product</th>
              <th className="text-right">Quantity</th>
              <th className="text-right">Price</th>
              <th className="text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            ${order.items.map(item => `
              <tr>
                <td>
                  ${item.product_name}
                  ${item.variant_name ? `<br><span style="font-size: 0.9em; color: #666;">${item.variant_name}</span>` : ''}
                </td>
                <td class="text-right">${item.quantity}</td>
                <td class="text-right">${formatCurrency(item.price_at_time)}</td>
                <td class="text-right">${formatCurrency(item.quantity * item.price_at_time)}</td>
              </tr>
            `).join('')}
          </tbody>
          <tfoot>
            ${discountAmount > 0 ? `
              <tr>
                <td colspan="3" class="text-right">Original Total:</td>
                <td class="text-right">${formatCurrency(originalTotal)}</td>
              </tr>
              <tr class="discount-row">
                <td colspan="3" class="text-right">Discount:</td>
                <td class="text-right">-${formatCurrency(discountAmount)}</td>
              </tr>
            ` : ''}
            <tr class="total-row">
              <td colspan="3" class="text-right">Grand Total:</td>
              <td class="text-right">${formatCurrency(grandTotal)}</td>
            </tr>
          </tfoot>
        </table>
        
        <div class="footer">
          <p>Thank you for your business!</p>
          <p>Receipt generated on ${new Date().toLocaleString()}</p>
        </div>
      </body>
      </html>
    `;

    // Write to the iframe and trigger printing
    if (iframe.contentWindow) {
      iframe.contentWindow.document.open();
      iframe.contentWindow.document.write(printContent);
      iframe.contentWindow.document.close();
      
      // Wait for content to load, then print
      setTimeout(() => {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
        
        // Remove the iframe after printing
        setTimeout(() => {
          document.body.removeChild(iframe);
        }, 1000);
      }, 500);
    }
    
    toast.success('Printing order...');
  };

  const hasDiscountApplied = !!order.discountAmount && order.discountAmount > 0;

  const startEditDiscount = () => {
    setDiscountAmount(order.discountAmount || 0);
    setIsEditingDiscount(true);
    setShowDiscountForm(true);
  };

  const handleDeleteOrder = async () => {
    if (!window.confirm('Are you sure you want to delete this order? This action cannot be undone.')) {
      return;
    }

    setDeletingOrder(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/orders/${order.orderID}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        if (response.status === 403) {
          throw new Error('You do not have permission to delete this order');
        }
        throw new Error(errorData.message || 'Failed to delete order');
      }

      toast.success('Order deleted successfully');
      onOpenChange(false); // Close the dialog after deletion
      if (onDelete) onDelete(); // Call the onDelete callback if provided
    } catch (error) {
      console.error('Error deleting order:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to delete order');
    } finally {
      setDeletingOrder(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 gap-0 max-w-[98vw] min-w-[1200px] h-[90vh]">
        <div className="flex flex-col h-full overflow-hidden">
          <DialogHeader className="p-5 pb-2 border-b">
            <DialogTitle className="text-2xl font-bold">Order #{order.orderID}</DialogTitle>
            <DialogDescription>
              Order details and status information
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex-1 overflow-auto px-6">
            <div className="grid grid-cols-12 gap-8 py-5">
              {/* Order Information */}
              <Card className="col-span-4 border-0 shadow-none">
                <CardContent className="pt-3">
                  <h2 className="text-base font-bold mb-3">Order Information</h2>
                  <dl className="space-y-2">
                    <div className="grid grid-cols-2 py-1">
                      <dt className="text-sm font-medium text-gray-600 dark:text-gray-300">Customer:</dt>
                      <dd className="text-sm font-medium">{order.customerName}</dd>
                    </div>
                    {order.companyName && (
                      <div className="grid grid-cols-2 py-1">
                        <dt className="text-sm font-medium text-gray-600 dark:text-gray-300">Company:</dt>
                        <dd className="text-sm font-medium">{order.companyName}</dd>
                      </div>
                    )}
                    <div className="grid grid-cols-2 py-1">
                      <dt className="text-sm font-medium text-gray-600 dark:text-gray-300">Date:</dt>
                      <dd className="text-sm font-medium">{formatDate(order.orderDate)}</dd>
                    </div>
                    <div className="grid grid-cols-2 py-1">
                      <dt className="text-sm font-medium text-gray-600 dark:text-gray-300">Address:</dt>
                      <dd className="text-sm font-medium">{order.address}</dd>
                    </div>
                    <div className="grid grid-cols-2 py-1">
                      <dt className="text-sm font-medium text-gray-600 dark:text-gray-300">Contact Number:</dt>
                      <dd className="text-sm font-medium">{order.contactNumber}</dd>
                    </div>
                    {order.paymentMethod && (
                      <div className="grid grid-cols-2 py-1">
                        <dt className="text-sm font-medium text-gray-600 dark:text-gray-300">Payment Method:</dt>
                        <dd className="text-sm font-medium">{formatPaymentMethod(order.paymentMethod)}</dd>
                      </div>
                    )}
                    {order.pickupMethod && (
                      <div className="grid grid-cols-2 py-1">
                        <dt className="text-sm font-medium text-gray-600 dark:text-gray-300">Delivery Method:</dt>
                        <dd className="text-sm font-medium">{formatDeliveryMethod(order.pickupMethod)}</dd>
                      </div>
                    )}
                    {order.notes && (
                      <div className="grid grid-cols-2 py-1">
                        <dt className="text-sm font-medium text-gray-600 dark:text-gray-300">Notes:</dt>
                        <dd className="text-sm font-medium whitespace-pre-wrap">{order.notes}</dd>
                      </div>
                    )}
                    <div className="grid grid-cols-2 py-1">
                      <dt className="text-sm font-medium text-gray-600 dark:text-gray-300">Payment Status:</dt>
                      <dd>
                        <Select 
                          defaultValue={paymentStatus}
                          onValueChange={(value) => handleUpdateStatus('paymentStatus', value)}
                          disabled={updatingStatus}
                        >
                          <SelectTrigger className={`w-full h-8 text-xs ${getPaymentStatusColor(paymentStatus)}`}>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Processing" className="bg-yellow-500 text-white my-1 text-xs">
                              Processing
                            </SelectItem>
                            <SelectItem value="Paid" className="bg-green-500 text-white my-1 text-xs">
                              Paid
                            </SelectItem>
                            <SelectItem value="Cancelled" className="bg-red-500 text-white my-1 text-xs">
                              Cancelled
                            </SelectItem>
                            <SelectItem value="Refunded" className="bg-purple-500 text-white my-1 text-xs">
                              Refunded
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </dd>
                    </div>
                    <div className="grid grid-cols-2 py-1">
                      <dt className="text-sm font-medium text-gray-600 dark:text-gray-300">Pickup Status:</dt>
                      <dd>
                        <Select 
                          defaultValue={pickupStatus}
                          onValueChange={(value) => handleUpdateStatus('pickupStatus', value)}
                          disabled={updatingStatus}
                        >
                          <SelectTrigger className={`w-full h-8 text-xs ${getPickupStatusColor(pickupStatus)}`}>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Processing" className="bg-yellow-500 text-white my-1 text-xs">
                              Processing
                            </SelectItem>
                            <SelectItem value="On Delivery" className="bg-blue-500 text-white my-1 text-xs">
                              On Delivery
                            </SelectItem>
                            <SelectItem value="Claimed" className="bg-green-500 text-white my-1 text-xs">
                              Claimed
                            </SelectItem>
                            <SelectItem value="Cancelled" className="bg-red-500 text-white my-1 text-xs">
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
                          <TableCell className="font-medium">
                            {item.product_name}
                            {item.variant_name && (
                              <span className="block text-sm text-muted-foreground">
                                {item.variant_name}
                              </span>
                            )}
                          </TableCell>
                          <TableCell className="text-right">{item.quantity}</TableCell>
                          <TableCell className="text-right">{formatCurrency(item.price_at_time)}</TableCell>
                          <TableCell className="text-right">{formatCurrency(lineTotal)}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
                
                {/* Order Summary and Discount Section */}
                <div className="mt-6 border rounded-md p-4 bg-gray-50 dark:bg-gray-900">
                  <div className="flex flex-col space-y-4">
                    {/* Order Summary */}
                    <div className="flex justify-between items-center">
                      <h3 className="font-semibold text-lg">Order Summary</h3>
                      {!hasDiscountApplied && !showDiscountForm && (
                        <Button 
                          onClick={() => setShowDiscountForm(true)} 
                          variant="outline" 
                          size="sm"
                          className="flex items-center gap-1"
                        >
                          <Tag size={16} />
                          Apply Discount
                        </Button>
                      )}
                      {hasDiscountApplied && !showDiscountForm && (
                        <div className="flex gap-2">
                          <Button 
                            onClick={startEditDiscount} 
                            variant="outline" 
                            size="sm"
                            className="flex items-center gap-1"
                          >
                            <Edit size={16} />
                            Edit Discount
                          </Button>
                          <Button 
                            onClick={handleRemoveDiscount} 
                            variant="outline" 
                            size="sm"
                            disabled={removingDiscount}
                            className="flex items-center gap-1 text-red-500 hover:text-red-600"
                          >
                            <Trash size={16} />
                            Remove
                          </Button>
                        </div>
                      )}
                    </div>
                    
                    {/* Subtotal */}
                    <div className="flex justify-between py-2 border-b">
                      <span>Subtotal:</span>
                      <span className="font-semibold">{formatCurrency(order.originalAmount || order.totalAmount)}</span>
                    </div>
                    
                    {/* Discount if applied */}
                    {hasDiscountApplied && (
                      <div className="flex justify-between py-2 text-red-500 border-b">
                        <span>Discount:</span>
                        <span>-{formatCurrency(order.discountAmount)}</span>
                      </div>
                    )}
                    
                    {/* Discount form */}
                    {showDiscountForm && (
                      <div className="py-2 space-y-3 border-b">
                        <div className="flex items-end gap-2">
                          <div className="flex-1">
                            <Label htmlFor="discount-amount" className="mb-1 block">Discount Amount (PHP)</Label>
                            <Input
                              id="discount-amount"
                                type="text"
                              placeholder="0.00"
                              value={discountAmount ? discountAmount.toString() : ''}
                              onChange={(e) => {
                                const value = e.target.value.replace(/[^0-9.]/g, ''); // Remove non-numeric characters
                                setDiscountAmount(value ? parseFloat(value) : 0);
                              }}
                              min="0"
                              max={(order.originalAmount || order.totalAmount) || 9999999}
                              step="0.01"
                            />
                          </div>
                          <Button 
                            onClick={handleApplyDiscount} 
                            disabled={applyingDiscount || !discountAmount}
                            size="sm"
                          >
                            {applyingDiscount ? 'Applying...' : isEditingDiscount ? 'Update' : 'Apply'}
                          </Button>
                          <Button 
                            onClick={() => {
                              setShowDiscountForm(false);
                              setIsEditingDiscount(false);
                            }} 
                            variant="outline"
                            size="sm"
                          >
                            Cancel
                          </Button>
                        </div>
                        
                        {/* Price preview when entering discount */}
                        <div className="flex justify-between text-red-500">
                          <span>Discount:</span>
                          <span>-{formatCurrency(discountAmount)}</span>
                        </div>
                      </div>
                    )}
                    
                    {/* Grand Total */}
                    <div className="flex justify-between pt-3">
                      <span className="text-lg font-bold">Grand Total:</span>
                      <span className="text-lg font-bold">
                        {showDiscountForm 
                          ? formatCurrency(previewTotalAfterDiscount)
                          : formatCurrency(order.totalAmount)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <DialogFooter className="p-5 py-3 border-t mt-auto">
            <Button 
              variant="outline" 
              onClick={handlePrint}
              className="flex items-center gap-2"
            >
              <Printer size={16} />
              Print Order
            </Button>
            <Button 
              variant="outline" 
              onClick={handleDeleteOrder}
              disabled={deletingOrder}
              className="flex items-center gap-2 text-red-500 hover:text-red-600"
            >
              <Trash size={16} />
              {deletingOrder ? 'Deleting...' : 'Delete Order'}
            </Button>
            <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
