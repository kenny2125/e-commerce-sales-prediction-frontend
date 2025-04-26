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
import { FlaskPredictionChart } from "@/components/charts/FlaskPredictionChart";
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

interface RecentSale {
  id: string;
  amount: number;
  date: string;
}

interface StockLevel {
  product_id: string;
  product_name: string;
  quantity: number;
  status: string;
}

// interface FlaskPrediction {
//   year: number;
//   month: number;
//   month_name: string;
//   predicted_sales: number;
// }

export default function Dashboard() {
  const [ongoingOrders, setOngoingOrders] = useState(0);
  const [recentSales, setRecentSales] = useState<RecentSale[]>([]);
  const [stockLevels, setStockLevels] = useState<StockLevel[]>([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [frequentItems, setFrequentItems] = useState<
    Array<{
      product_id: string;
      product_name: string;
      image_url: string;
      sold_count: number;
      total_quantity: number;
    }>
  >([]);
  // const [flaskPredictions, setFlaskPredictions] = useState<FlaskPrediction[]>([]);
  // const [isFlaskLoading, setIsFlaskLoading] = useState(false);
  // const [flaskError, setFlaskError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTotalRevenue = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/sales/total-revenue?source=historical`
        );
        const data = await response.json();
        setTotalRevenue(data.total_revenue);
      } catch (error) {
        console.error("Error fetching total revenue:", error);
      }
    };

    const fetchOngoingOrders = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/orders/ongoing-count`
        );
        const data = await response.json();
        setOngoingOrders(data.count);
      } catch (error) {
        console.error("Error fetching ongoing orders:", error);
      }
    };

    const fetchRecentSales = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/sales/recent`
        );
        const data = await response.json();
        setRecentSales(data);
      } catch (error) {
        console.error("Error fetching recent sales:", error);
      }
    };

    const fetchStockLevels = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/product/stock-levels`
        );
        const data = await response.json();
        setStockLevels(data);
      } catch (error) {
        console.error("Error fetching stock levels:", error);
      }
    };

    const fetchFrequentItems = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/sales/most-frequent`
        );
        const data = await response.json();
        setFrequentItems(data);
      } catch (error) {
        console.error("Error fetching frequent items:", error);
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

  // const fetchFlaskPrediction = async () => {
  //   setIsFlaskLoading(true);
  //   setFlaskError(null);
    
  //   try {
  //     const response = await fetch(
  //       `${import.meta.env.VITE_API_URL}/api/predictions/flask-prediction?months_ahead=6`
  //     );
      
  //     if (!response.ok) {
  //       const errorData = await response.json();
  //       throw new Error(errorData.message || 'Failed to fetch predictions from Flask server');
  //     }
      
  //     const data = await response.json();
  //     setFlaskPredictions(data.predictions);
  //   } catch (error) {
  //     console.error("Error fetching Flask predictions:", error);
  //     setFlaskError(error instanceof Error ? error.message : 'Unknown error occurred');
  //   } finally {
  //     setIsFlaskLoading(false);
  //   }
  // };

  // const trainFlaskModel = async () => {
  //   setIsFlaskLoading(true);
  //   setFlaskError(null);
    
  //   try {
  //     const response = await fetch(
  //       `${import.meta.env.VITE_API_URL}/api/predictions/train-flask-model`,
  //       { method: 'POST' }
  //     );
      
  //     if (!response.ok) {
  //       const errorData = await response.json();
  //       throw new Error(errorData.message || 'Failed to train model on Flask server');
  //     }
      
  //     // After training, fetch updated predictions
  //     await fetchFlaskPrediction();
  //   } catch (error) {
  //     console.error("Error training Flask model:", error);
  //     setFlaskError(error instanceof Error ? error.message : 'Unknown error occurred');
  //   } finally {
  //     setIsFlaskLoading(false);
  //   }
  // };

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="flex flex-col items-center">
          <CardHeader className="w-full text-center">
            <CardTitle className="text-lg">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-center">
            <div className="rounded-full bg-primary/10 p-4">
              <PhilippinePeso className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
          <CardFooter>
            <p className="text-2xl font-bold">{formatCurrency(totalRevenue)}</p>
          </CardFooter>
        </Card>

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
            <p className="text-2xl font-bold">{ongoingOrders} Orders Today</p>
          </CardFooter>
        </Card>

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

        <Card className="flex flex-col">
          <CardHeader className="text-center">
            <CardTitle className="text-lg">Top Products</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {frequentItems.slice(0, 3).map((item) => (
                <div
                  key={item.product_id}
                  className="flex items-center justify-between"
                >
                  <span className="text-sm truncate flex-1">
                    {item.product_name}
                  </span>
                  <span className="text-sm font-medium">
                    {item.total_quantity}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Chart on left */}
        <div className="lg:col-span-2 h-full">
          <LineChartInteractive />
        </div>
        {/* Small cards grid on right - Now a flex column with full height */}
        <div className="flex flex-col gap-4 h-full">
          {/* Recent Sales - with scrollable content */}
          <Card className="flex-1">
            <CardHeader>
              <CardTitle className="text-lg">Recent Sales</CardTitle>
            </CardHeader>
            <CardContent className="overflow-y-auto" style={{ maxHeight: "200px" }}>
              <div className="space-y-3">
                {recentSales.map((sale) => (
                  <div key={sale.id} className="flex items-center justify-between pb-2 border-b">
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Customer</p>
                      <p className="text-sm text-muted-foreground">{sale.date}</p>
                    </div>
                    <p className="text-sm font-medium">₱{sale.amount.toLocaleString()}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          {/* Stock Alerts - with scrollable content */}
          <Card className="flex-1">
            <CardHeader>
              <CardTitle className="text-lg">Stock Alerts</CardTitle>
              <CardDescription>Low stock items</CardDescription>
            </CardHeader>
            <CardContent className="overflow-y-auto" style={{ maxHeight: "200px" }}>
              <div className="space-y-3">
                {stockLevels.map((item) => (
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
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Flask Predictions Section */}
      {/* <div className="mt-6">
        <FlaskPredictionChart />
      </div> */}
    </div>
  );
}
