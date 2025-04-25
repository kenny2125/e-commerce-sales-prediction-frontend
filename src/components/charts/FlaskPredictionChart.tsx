import { useEffect, useState } from "react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { Brain, Loader2, TrendingUp, TrendingDown } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useMediaQuery } from "@/hooks/use-media-query";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

interface FlaskPrediction {
  year: number;
  month: number;
  month_name: string;
  predicted_sales: number;
}

interface ValidationMetrics {
  metrics: {
    mae: number;
    rmse: number;
    mape: number;
    r2: number;
  };
  details: Array<{
    date: string;
    month: number;
    year: number;
    month_name: string;
    actual: number;
    predicted: number;
    error: number;
    percentage_error: number;
  }>;
}

export function FlaskPredictionChart() {
  const [chartData, setChartData] = useState<any[]>([]);
  const [flaskPredictions, setFlaskPredictions] = useState<FlaskPrediction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [monthsAhead, setMonthsAhead] = useState(6);
  const [validationSize, setValidationSize] = useState(3);
  const [filterPandemic, setFilterPandemic] = useState(true);
  const [validationMetrics, setValidationMetrics] = useState<ValidationMetrics | null>(null);
  const [validationChartData, setValidationChartData] = useState<any[]>([]);
  
  // Check if device is mobile
  const isMobile = useMediaQuery("(max-width: 768px)");

  // Chart configuration
  const chartConfig = {
    actual_sales: {
      label: "Actual Sales",
      color: "hsl(var(--chart-1))",
    },
    flask_predicted_sales: {
      label: "Flask GRU Predictions",
      color: "hsl(var(--chart-3))",
    },
  } satisfies ChartConfig;

  useEffect(() => {
    const fetchSalesData = async () => {
      try {
        setIsLoading(true);
        // Get all monthly data
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/sales/monthly`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch monthly sales data');
        }
        
        const data = await response.json();
        
        // Transform the data for the chart
        const transformedData = data.map(item => ({
          month: `${item.month_name.slice(0, 3)} ${item.year}`,
          monthName: item.month_name,
          actual_sales: item.total_sales,
          flask_predicted_sales: null, // Will be filled by predictions
          year: item.year,
          monthIndex: item.month,
        }));
        
        // Sort by year and month
        transformedData.sort((a, b) => {
          if (a.year !== b.year) return a.year - b.year;
          return a.monthIndex - b.monthIndex;
        });
        
        setChartData(transformedData);
      } catch (err) {
        console.error('Error fetching monthly sales data:', err);
        setError('Failed to load sales data: ' + (err instanceof Error ? err.message : String(err)));
      } finally {
        setIsLoading(false);
      }
    };

    fetchSalesData();
  }, []);

  const fetchFlaskPrediction = async () => {
    setIsLoading(true);
    setError(null);
    setValidationMetrics(null);
    setValidationChartData([]);
    
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/predictions/flask-prediction?months_ahead=${monthsAhead}&validation_size=${validationSize}&filter_pandemic=${filterPandemic}`
      );
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch predictions from Flask server');
      }
      
      const data = await response.json();
      setFlaskPredictions(data.predictions);
      
      // Set validation metrics if available
      if (data.validation) {
        setValidationMetrics(data.validation);
        
        // Prepare validation chart data
        if (data.validation.details && data.validation.details.length > 0) {
          const validationData = data.validation.details.map((detail) => ({
            month: `${detail.month_name.slice(0, 3)} ${detail.year}`,
            monthName: detail.month_name,
            actual: detail.actual,
            predicted: detail.predicted,
            error: detail.error,
            percentage_error: detail.percentage_error,
            year: detail.year,
            monthIndex: detail.month
          }));
          
          setValidationChartData(validationData);
        }
      }
      
      // Merge the predictions with existing chart data
      const baseData = [...chartData];
      
      // Add future predictions
      const predictions = [...data.predictions];
      const mergedData = [...baseData];
      
      // First, add validation points if available (actual vs predicted for past months)
      if (data.validation && data.validation.details) {
        data.validation.details.forEach(detail => {
          // Try to find if this month already exists in the data
          const existingIndex = mergedData.findIndex(
            item => item.year === detail.year && item.monthIndex === detail.month
          );
          
          if (existingIndex >= 0) {
            // Update existing entry with validation data
            mergedData[existingIndex].flask_predicted_sales = detail.predicted;
            mergedData[existingIndex].validation = true;
          }
        });
      }
      
      // Then add future predictions
      predictions.forEach((prediction) => {
        mergedData.push({
          month: `${prediction.month_name.slice(0, 3)} ${prediction.year}`,
          monthName: prediction.month_name,
          actual_sales: null, // No actual data for future months
          flask_predicted_sales: prediction.predicted_sales,
          year: prediction.year,
          monthIndex: prediction.month,
          isPrediction: true,
        });
      });
      
      // Sort the combined data
      mergedData.sort((a, b) => {
        if (a.year !== b.year) return a.year - b.year;
        return a.monthIndex - b.monthIndex;
      });
      
      setChartData(mergedData);
    } catch (error) {
      console.error("Error fetching Flask predictions:", error);
      setError(error instanceof Error ? error.message : 'Unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const trainFlaskModel = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/predictions/train-flask-model`,
        { method: 'POST' }
      );
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to train model on Flask server');
      }
      
      // After training, fetch updated predictions
      await fetchFlaskPrediction();
    } catch (error) {
      console.error("Error training Flask model:", error);
      setError(error instanceof Error ? error.message : 'Unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  // Get date range for display
  const getDateRangeText = () => {
    if (chartData.length < 2) return "No data available";
    const firstItem = chartData[0];
    const lastItem = chartData[chartData.length - 1];
    return `${firstItem.month} to ${lastItem.month}`;
  };

  // Format currency for PHP
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
    }).format(amount);
  };

  return (
    <Card>
      <CardHeader className="space-y-1">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <CardTitle>Flask GRU Prediction</CardTitle>
            <CardDescription>
              Sales forecast using GRU neural network from Flask server
            </CardDescription>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <label className="flex items-center gap-1 text-sm">
              <span>Months Ahead:</span>
              <input
                type="number"
                min="1"
                max="12"
                value={monthsAhead}
                onChange={(e) => setMonthsAhead(parseInt(e.target.value))}
                className="px-2 py-1 border rounded w-16 h-9"
              />
            </label>
            <div className="flex items-center gap-2">
              <label className="flex items-center space-x-2 cursor-pointer">
                <span className="text-sm">Filter Pandemic:</span>
                <div 
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${filterPandemic ? 'bg-primary' : 'bg-gray-300'}`}
                  onClick={() => setFilterPandemic(!filterPandemic)}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${filterPandemic ? 'translate-x-6' : 'translate-x-1'}`}
                  />
                </div>
              </label>
            </div>
            <Button 
              onClick={fetchFlaskPrediction} 
              disabled={isLoading}
              variant="outline"
              className="h-9"
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Brain className="h-4 w-4 mr-1" />}
              {isLoading ? "Loading..." : "Fetch Predictions"}
            </Button>
            <Button 
              onClick={trainFlaskModel} 
              disabled={isLoading}
              variant="secondary"
              className="h-9"
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
              {isLoading ? "Training..." : "Train Model"}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-2 sm:px-6">
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {isLoading && !chartData.length ? (
          <div className="flex justify-center items-center h-[300px]">
            <Loader2 className="h-8 w-8 animate-spin mr-2" />
            <span>Loading chart data...</span>
          </div>
        ) : (
          <div className="w-full h-[300px] md:h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={chartData}
                margin={{
                  top: 10,
                  right: isMobile ? 30 : 50,
                  left: isMobile ? 20 : 50,
                  bottom: isMobile ? 90 : 50,
                }}
              >
                <defs>
                  <linearGradient id="colorActualSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0.2}/>
                  </linearGradient>
                  <linearGradient id="colorPredictedSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--chart-3))" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="hsl(var(--chart-3))" stopOpacity={0.2}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="month"
                  tickLine={true}
                  axisLine={true}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  interval={isMobile ? 3 : 2}
                  tick={{ fontSize: isMobile ? 10 : 12 }}
                />
                <YAxis 
                  tickLine={false}
                  axisLine={true}
                  tickFormatter={(value) => `₱${value.toLocaleString()}`}
                  width={isMobile ? 60 : 70}
                  tick={{ fontSize: isMobile ? 10 : 12 }}
                  domain={['auto', 'auto']}
                />
                <ChartTooltip
                  formatter={(value: any) => value ? `₱${Number(value).toLocaleString()}` : 'N/A'}
                  labelFormatter={(label) => `Month: ${label}`}
                />
                <Area
                  type="monotone"
                  dataKey="actual_sales"
                  name="Actual Sales"
                  stroke="hsl(var(--chart-1))"
                  fill="url(#colorActualSales)"
                  strokeWidth={2}
                  connectNulls
                />
                <Area
                  type="monotone"
                  dataKey="flask_predicted_sales"
                  name="GRU Predictions"
                  stroke="hsl(var(--chart-3))"
                  fill="url(#colorPredictedSales)"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  connectNulls
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
        
        {flaskPredictions.length > 0 && (
          <div className="mt-6">
            <h3 className="font-medium mb-2">Future Sales Predictions</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Period</th>
                    <th className="text-right py-2">Predicted Sales</th>
                  </tr>
                </thead>
                <tbody>
                  {flaskPredictions.map((pred, index) => (
                    <tr key={index} className="border-b last:border-0">
                      <td className="py-2">{pred.month_name} {pred.year}</td>
                      <td className="text-right py-2">{formatCurrency(pred.predicted_sales)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Validation Metrics Section */}
        {validationMetrics && (
          <div className="mt-6 space-y-4">
            <div>
              <h3 className="text-lg font-medium mb-2">Model Validation Metrics</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Validation metrics calculated by comparing model predictions against known historical values
              </p>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-muted/50 p-3 rounded-lg">
                  <h4 className="text-sm font-medium">MAE</h4>
                  <p className="text-2xl font-semibold">{formatCurrency(validationMetrics.metrics.mae)}</p>
                  <p className="text-xs text-muted-foreground">Mean Absolute Error</p>
                </div>
                
                <div className="bg-muted/50 p-3 rounded-lg">
                  <h4 className="text-sm font-medium">RMSE</h4>
                  <p className="text-2xl font-semibold">{formatCurrency(validationMetrics.metrics.rmse)}</p>
                  <p className="text-xs text-muted-foreground">Root Mean Squared Error</p>
                </div>
                
                <div className="bg-muted/50 p-3 rounded-lg">
                  <h4 className="text-sm font-medium">MAPE</h4>
                  <p className="text-2xl font-semibold">{validationMetrics.metrics.mape.toFixed(2)}%</p>
                  <p className="text-xs text-muted-foreground">Mean Absolute Percentage Error</p>
                </div>
                
                <div className="bg-muted/50 p-3 rounded-lg">
                  <h4 className="text-sm font-medium">R²</h4>
                  <p className="text-2xl font-semibold">{validationMetrics.metrics.r2.toFixed(4)}</p>
                  <p className="text-xs text-muted-foreground">Coefficient of Determination</p>
                </div>
              </div>
            </div>
            
            {validationMetrics.details && validationMetrics.details.length > 0 && (
              <div>
                <h3 className="text-lg font-medium mb-2">Validation Details</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 text-sm">
                    <thead>
                      <tr>
                        <th className="px-4 py-2 text-left font-medium">Period</th>
                        <th className="px-4 py-2 text-right font-medium">Actual</th>
                        <th className="px-4 py-2 text-right font-medium">Predicted</th>
                        <th className="px-4 py-2 text-right font-medium">Error</th>
                        <th className="px-4 py-2 text-right font-medium">Error %</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {validationMetrics.details.map((detail, index) => (
                        <tr key={index}>
                          <td className="px-4 py-2">{detail.month_name} {detail.year}</td>
                          <td className="px-4 py-2 text-right">{formatCurrency(detail.actual)}</td>
                          <td className="px-4 py-2 text-right">{formatCurrency(detail.predicted)}</td>
                          <td className="px-4 py-2 text-right font-medium" 
                              style={{ color: Math.abs(detail.error) < detail.actual * 0.1 ? 'inherit' : (detail.error > 0 ? 'red' : 'green') }}>
                            {detail.error > 0 ? '+' : ''}{formatCurrency(detail.error)}
                          </td>
                          <td className="px-4 py-2 text-right font-medium"
                              style={{ color: detail.percentage_error < 10 ? 'inherit' : (detail.percentage_error > 20 ? 'red' : 'orange') }}>
                            {detail.percentage_error.toFixed(2)}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            
            {/* Validation Chart */}
            {validationChartData.length > 0 && (
              <div>
                <h3 className="text-lg font-medium mb-2">Validation Comparison Chart</h3>
                <div className="w-full h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={validationChartData}
                      margin={{
                        top: 10,
                        right: 30,
                        left: 30,
                        bottom: 30,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis 
                        dataKey="month" 
                        angle={-45} 
                        textAnchor="end" 
                        height={60}
                      />
                      <YAxis 
                        tickFormatter={(value) => `₱${value.toLocaleString()}`}
                        width={70}
                      />
                      <Tooltip 
                        formatter={(value: any) => value ? `₱${Number(value).toLocaleString()}` : 'N/A'}
                        labelFormatter={(label) => `Month: ${label}`}
                      />
                      <Legend />
                      <Area 
                        type="monotone" 
                        dataKey="actual" 
                        name="Actual" 
                        stroke="#4f46e5" 
                        fill="#4f46e5" 
                        fillOpacity={0.3} 
                      />
                      <Area 
                        type="monotone" 
                        dataKey="predicted" 
                        name="Predicted" 
                        stroke="#16a34a" 
                        fill="#16a34a" 
                        fillOpacity={0.3}
                        strokeDasharray="5 5" 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
      <CardFooter>
        <div className="text-sm text-muted-foreground">
          {getDateRangeText()}
          {flaskPredictions.length > 0 && " (includes predictions)"}
        </div>
      </CardFooter>
    </Card>
  );
}