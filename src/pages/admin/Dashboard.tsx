import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LineChartInteractive } from "@/components/charts/LineChartInterative";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  PhilippinePeso,
  Package,
  TrendingUp,
  ShoppingCart,
  BarChart3,
  CpuIcon,
  Brain,
  Loader2,
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";

interface RecentSale {
  id: string;
  amount: number;
  date: string;
}

interface StockLevel {
  product_id: string;
  product_name: string;
  quantity: number;
  status?: string; 
}

// Add new interface for date range
interface DateRange {
  earliest: string | null;
  latest: string | null;
}

export default function Dashboard() {
  const [ongoingOrders, setOngoingOrders] = useState(0);
  const [recentSales, setRecentSales] = useState<RecentSale[]>([]);
  const [stockLevels, setStockLevels] = useState<StockLevel[]>([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  // Add new state for date range
  const [revenueRange, setRevenueRange] = useState<DateRange>({ earliest: null, latest: null });
  const [frequentItems, setFrequentItems] = useState<
    Array<{
      product_id: string;
      variant_id?: string;
      product_name: string;
      image_url: string;
      sold_count: number;
      total_quantity: number;
      variant_name?: string;
    }>
  >([]);
  
  // Loading states
  const [loadingRevenue, setLoadingRevenue] = useState(true);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [loadingSales, setLoadingSales] = useState(true);
  const [loadingStock, setLoadingStock] = useState(true);
  const [loadingFrequent, setLoadingFrequent] = useState(true);

  useEffect(() => {
    const fetchTotalRevenue = async () => {
      setLoadingRevenue(true);
      try {
        // Fetch total revenue
        const revenueResponse = await fetch(
          `${import.meta.env.VITE_API_URL}/api/sales/total-revenue?source=historical`
        );
        const revenueData = await revenueResponse.json();
        setTotalRevenue(revenueData.total_revenue);
        
        // Fetch historical data to get the date range
        const historicalResponse = await fetch(
          `${import.meta.env.VITE_API_URL}/api/sales/historical`
        );
        const historicalData = await historicalResponse.json();
        
        if (historicalData && historicalData.length > 0) {
          // Sort the data by date to ensure we get the correct earliest and latest
          const sortedData = [...historicalData].sort((a, b) => 
            new Date(a.date).getTime() - new Date(b.date).getTime()
          );
          
          setRevenueRange({
            earliest: sortedData[0]?.date || null,
            latest: sortedData[sortedData.length - 1]?.date || null
          });
        }
      } catch (error) {
        console.error("Error fetching total revenue:", error);
      } finally {
        setLoadingRevenue(false);
      }
    };

    const fetchOngoingOrders = async () => {
      setLoadingOrders(true);
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/orders/ongoing-count`
        );
        const data = await response.json();
        setOngoingOrders(data.count);
      } catch (error) {
        console.error("Error fetching ongoing orders:", error);
      } finally {
        setLoadingOrders(false);
      }
    };

    const fetchRecentSales = async () => {
      setLoadingSales(true);
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/sales/recent`
        );
        const data = await response.json();
        setRecentSales(data);
      } catch (error) {
        console.error("Error fetching recent sales:", error);
      } finally {
        setLoadingSales(false);
      }
    };

    const fetchStockLevels = async () => {
      setLoadingStock(true);
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/product/stock-levels`
        );
        const data = await response.json();
        
        // Calculate status based on quantity
        const stockWithStatus = data.map((item: StockLevel) => ({
          ...item,
          // Calculate status based on quantity thresholds
          status: item.quantity <= 5 ? 'Low' : 
                 item.quantity <= 20 ? 'Medium' : 'Good'
        }));
        
        setStockLevels(stockWithStatus);
      } catch (error) {
        console.error("Error fetching stock levels:", error);
      } finally {
        setLoadingStock(false);
      }
    };

    const fetchFrequentItems = async () => {
      setLoadingFrequent(true);
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/sales/most-frequent`
        );
        const data = await response.json();
        setFrequentItems(data);
      } catch (error) {
        console.error("Error fetching frequent items:", error);
      } finally {
        setLoadingFrequent(false);
      }
    };

    fetchTotalRevenue();
    fetchOngoingOrders();
    fetchRecentSales();
    fetchStockLevels();
    fetchFrequentItems();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
    }).format(amount);
  };

  // Skeleton components for loading states
  const CardSkeleton = () => (
    <Card className="flex flex-col items-center">
      <CardHeader className="w-full text-center">
        <Skeleton className="h-6 w-32 mx-auto" />
      </CardHeader>
      <CardContent className="flex items-center justify-center">
        <Skeleton className="h-16 w-16 rounded-full" />
      </CardContent>
      <CardFooter>
        <Skeleton className="h-8 w-28" />
      </CardFooter>
    </Card>
  );

  const StockSkeleton = () => (
    <div className="space-y-3 pr-4">
      {Array(5).fill(0).map((_, i) => (
        <div key={i} className="flex items-center justify-between pb-2 border-b">
          <div className="space-y-1">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-20" />
          </div>
          <Skeleton className="h-6 w-16 rounded-full" />
        </div>
      ))}
    </div>
  );

  const FrequentItemsSkeleton = () => (
    <div className="space-y-2 pr-4">
      {Array(5).fill(0).map((_, i) => (
        <div key={i} className="flex flex-col pb-2 border-b">
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-4 w-8" />
          </div>
          <Skeleton className="h-3 w-20 mt-1" />
        </div>
      ))}
    </div>
  );

  const ChartSkeleton = () => (
    <div className="space-y-4">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-[400px] w-full rounded-lg" />
    </div>
  );

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {loadingRevenue ? (
          <CardSkeleton />
        ) : (
          <Card className="flex flex-col items-center">
            <CardHeader className="w-full text-center">
              <CardTitle className="text-lg">Total Revenue</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-center">
              <div className="rounded-full bg-primary/10 p-4">
                <PhilippinePeso className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col items-center">
              <p className="text-2xl font-bold">{formatCurrency(totalRevenue)}</p>
              {revenueRange.earliest && revenueRange.latest && (
                <p className="text-xs text-muted-foreground mt-2">
                  {new Date(revenueRange.earliest).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })} - {new Date(revenueRange.latest).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </p>
              )}
            </CardFooter>
          </Card>
        )}

        {loadingOrders ? (
          <CardSkeleton />
        ) : (
          <Card className="flex flex-col items-center">
            <CardHeader className="w-full text-center">
              <CardTitle className="text-lg">Ongoing Orders</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-center">
              <div className="rounded-full bg-primary/10 p-4">
                <ShoppingCart className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
            <CardFooter>
              <p className="text-2xl font-bold">{ongoingOrders} Orders</p>
            </CardFooter>
          </Card>
        )}

        {loadingSales ? (
          <CardSkeleton />
        ) : (
          <Card className="flex flex-col items-center">
            <CardHeader className="w-full text-center">
              <CardTitle className="text-lg">Sales Today</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-center">
              <div className="rounded-full bg-primary/10 p-4">
                <TrendingUp className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
            <CardFooter>
              <p className="text-2xl font-bold">
                {recentSales.length > 0
                  ? formatCurrency(recentSales[0].amount)
                  : "No sales today"}
              </p>
            </CardFooter>
          </Card>
        )}

        {loadingFrequent ? (
          <Card className="flex flex-col">
            <CardHeader className="text-center pb-2">
              <CardTitle className="text-lg">Top Sold Products</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[120px]">
                <FrequentItemsSkeleton />
              </ScrollArea>
            </CardContent>
          </Card>
        ) : (
          <Card className="flex flex-col">
            <CardHeader className="text-center pb-2">
              <CardTitle className="text-lg">Top Sold Products</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[120px]">
                <div className="space-y-2 pr-4">
                  {frequentItems.slice(0, 5).map((item) => (
                    <div
                      key={`${item.product_id}-${item.variant_id}`}
                      className="flex flex-col pb-2 border-b"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium truncate flex-1">
                          {item.product_name}
                        </span>
                        <span className="text-sm font-medium">
                          {item.sold_count}
                        </span>
                      </div>
                      {item.product_original_name && (
                        <span className="text-xs text-muted-foreground">
                          {item.product_original_name}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Chart on left */}
        <div className="lg:col-span-2 h-full">
          {loadingRevenue || loadingSales ? (
            <Card className="h-full">
              <CardContent className="p-6">
                <ChartSkeleton />
              </CardContent>
            </Card>
          ) : (
            <LineChartInteractive />
          )}
        </div>
        {/* Right column with Stock Alerts taking full height */}
        <div className="flex flex-col h-full">
          {/* Stock Alerts - with scrollable content */}
          <Card className="flex-1">
            <CardHeader>
              <CardTitle className="text-lg">Stock Alerts</CardTitle>
              <CardDescription>Low stock items</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                {loadingStock ? (
                  <StockSkeleton />
                ) : (
                  <div className="space-y-3 pr-4">
                    {stockLevels
                      // Sort by status priority: Low first, then Medium, then Good
                      .sort((a, b) => {
                        const priority = { 'Low': 0, 'Medium': 1, 'Good': 2 };
                        return (priority[a.status as keyof typeof priority] || 0) - (priority[b.status as keyof typeof priority] || 0);
                      })
                      .map((item) => (
                      <div key={item.product_id} className="flex items-center justify-between pb-2 border-b">
                        <div className="space-y-1">
                          <p className="text-sm font-medium truncate">{item.product_name}</p>
                          <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          item.status === 'Low'
                            ? 'bg-red-100 text-red-800'
                            : item.status === 'Medium'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-green-100 text-green-800'
                        }`}>{item.status}</span>
                      </div>
                    ))}

                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
