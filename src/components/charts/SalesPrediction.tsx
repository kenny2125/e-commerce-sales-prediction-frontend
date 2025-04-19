"use client"

import { TrendingUp } from "lucide-react"
import { useEffect, useState, useRef } from "react"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useMediaQuery } from "@/hooks/use-media-query"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

interface MonthlyData {
  year: number
  month: number
  month_name: string
  total_sales: number
}

interface PredictionData {
  year: number
  month: number
  month_name: string
  predicted_sales: number
  normalized_prediction?: number
}

interface TrainingProgress {
  iterations: number
  error: number
  errorThreshold: number
}

interface ValidationMetrics {
  mse: string;
  mape: string;
  details?: Array<{
    year: number;
    month: number;
    month_name: string;
    actual_sales: number;
    predicted_sales: number;
    difference?: number;         // Add these properties to store the calculated values
    percentage_error?: number;   // so they don't need to be calculated during rendering
  }>;
}

interface NormalizationData {
  min_sales: number
  max_sales: number
  range: number
}

export function SalesPrediction() {
  const [chartData, setChartData] = useState<any[]>([]);
  const [predictionData, setPredictionData] = useState<PredictionData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPredicting, setIsPredicting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [monthsAhead, setMonthsAhead] = useState(6);
  const [maxDataPoints, setMaxDataPoints] = useState(24); // Default value of 32
  const [activeTab, setActiveTab] = useState("stacked");
  
  // Additional data from enhanced prediction endpoint
  const [rawData, setRawData] = useState<any[]>([]);
  const [normalizedData, setNormalizedData] = useState<any[]>([]);
  const [normalizationParams, setNormalizationParams] = useState<NormalizationData | null>(null);
  
  // Training progress state
  const [trainingProgress, setTrainingProgress] = useState<TrainingProgress | null>(null);
  const [validationMetrics, setValidationMetrics] = useState<ValidationMetrics | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);
  
  // Check if device is mobile
  const isMobile = useMediaQuery("(max-width: 768px)");

  // Chart configuration
  const chartConfig = {
    total_sales: {
      label: "Actual Sales",
      color: "hsl(var(--chart-1))",
    },
    predicted_sales: {
      label: "Predicted Sales",
      color: "hsl(var(--chart-2))",
    },
  } satisfies ChartConfig;

  useEffect(() => {
    const fetchAllMonthlySales = async () => {
      try {
        setIsLoading(true);
        // Get all monthly data without year filter
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/sales/monthly`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch monthly sales data');
        }
        
        const data: MonthlyData[] = await response.json();
        
        // Transform the data to match our chart format
        // Now using month_name from the API response
        const transformedData = data.map(item => ({
          month: `${item.month_name.slice(0, 3)} ${item.year}`, // Use abbreviated month name
          monthName: item.month_name,
          total_sales: item.total_sales,
          predicted_sales: null, // Placeholder for prediction data
          year: item.year,
          monthIndex: item.month,
        }));
        
        // Sort by year and month for proper timeline display
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

    fetchAllMonthlySales();
  }, []);

  // Function to predict future sales using SSE
  const predictFutureSales = async () => {
    try {
      // Clean up any existing event source
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
      
      setIsPredicting(true);
      setError(null);
      setTrainingProgress(null);
      setValidationMetrics(null);
      
      // Updated URL to include both months_ahead and max_data_points parameters
      const url = `${import.meta.env.VITE_API_URL}/api/predictions/sales?months_ahead=${monthsAhead}&max_data_points=${maxDataPoints}`;
      eventSourceRef.current = new EventSource(url);
      
      eventSourceRef.current.onmessage = (event) => {
        const data = JSON.parse(event.data);
        
        switch (data.type) {
          case 'progress':
            setTrainingProgress({
              iterations: data.iterations,
              error: data.error,
              errorThreshold: data.errorThreshold
            });
            break;
            
          case 'validation':
            // Process the validation data and add calculated fields for difference and percentage error
            if (data.details && Array.isArray(data.details)) {
              data.details.forEach(detail => {
                // Calculate and add difference and percentage error to each detail item
                detail.difference = detail.actual_sales - detail.predicted_sales;
                detail.percentage_error = detail.actual_sales !== 0 
                  ? (Math.abs(detail.difference) / detail.actual_sales) * 100 
                  : 0;
              });
            }
            
            setValidationMetrics({
              mse: data.mse,
              mape: data.mape,
              details: data.details
            });
            
            // Process validation data to show predictions on chart
            if (data.details && Array.isArray(data.details)) {
              // Find existing chart data points that match validation dates
              const updatedChartData = [...chartData];
              
              data.details.forEach((item: NonNullable<ValidationMetrics['details']>[number]) => {
                const index = updatedChartData.findIndex(
                  point => point.year === item.year && point.monthIndex === item.month
                );
                
                if (index !== -1) {
                  // Add predicted sales to existing chart data point
                  updatedChartData[index].predicted_sales = item.predicted_sales;
                  updatedChartData[index].isValidation = true;
                }
              });
              
              setChartData(updatedChartData);
            }
            break;
            
          case 'complete':
            // Store prediction data
            setPredictionData(data.predictions);
            
            // Store additional data if available
            if (data.raw_data) setRawData(data.raw_data);
            if (data.normalized_data) setNormalizedData(data.normalized_data);
            if (data.normalization) setNormalizationParams(data.normalization);
            
            // Define baseData excluding any previous predictions
            const baseData = chartData.filter(item => !item.isPrediction);
            
            // Find the last few actual months to overlap with predictions for comparison
            const lastActualMonths: Record<string, number> = {};
            baseData.slice(-monthsAhead).forEach(item => {
              const monthYearKey = `${item.monthIndex}-${item.year}`;
              lastActualMonths[monthYearKey] = item.total_sales;
            });
            
            // Create an array for merged data including predictions
            const mergedData = [...baseData];
            
            // Add validation results to show the overlap between actual and predicted values
            if (data.validation_results && Array.isArray(data.validation_results)) {
              data.validation_results.forEach((validation: any) => {
                // Create a key that matches the format in chartData
                const monthIdx = validation.month;
                const yearVal = validation.year;
                
                // Find if this validation point already exists in our base data
                const existingPointIndex = mergedData.findIndex(
                  item => item.year === yearVal && item.monthIndex === monthIdx
                );
                
                if (existingPointIndex !== -1) {
                  // If this point exists in our base data, add the predicted sales to it
                  mergedData[existingPointIndex].predicted_sales = validation.predicted_sales;
                  mergedData[existingPointIndex].isValidation = true;
                } else {
                  // If it doesn't exist (unlikely), add a new point
                  mergedData.push({
                    month: `${validation.month_name.slice(0, 3)} ${validation.year}`,
                    monthName: validation.month_name,
                    total_sales: validation.actual_sales,
                    predicted_sales: validation.predicted_sales,
                    year: validation.year,
                    monthIndex: validation.month,
                    isValidation: true,
                  });
                }
              });
            }
            
            // Add future predictions and mark them
            data.predictions.forEach((prediction: PredictionData) => {
              // Create a key to match with actual data
              const monthYearKey = `${prediction.month}-${prediction.year}`;
              
              // Add to the merged data
              mergedData.push({
                month: `${prediction.month_name.slice(0, 3)} ${prediction.year}`,
                monthName: prediction.month_name,
                total_sales: lastActualMonths[monthYearKey] || null, // If we have actual data for this month
                predicted_sales: prediction.predicted_sales,
                normalized_prediction: prediction.normalized_prediction,
                year: prediction.year,
                monthIndex: prediction.month,
                isPrediction: true,
              });
            });
            
            // Sort the merged data
            mergedData.sort((a, b) => {
              if (a.year !== b.year) return a.year - b.year;
              return a.monthIndex - b.monthIndex;
            });
            
            setChartData(mergedData);
            setIsPredicting(false);
            
            // Close the connection
            if (eventSourceRef.current) {
              eventSourceRef.current.close();
              eventSourceRef.current = null;
            }
            break;
            
          case 'error':
            setError('Error during prediction: ' + data.message);
            setIsPredicting(false);
            
            if (eventSourceRef.current) {
              eventSourceRef.current.close();
              eventSourceRef.current = null;
            }
            break;
        }
      };
      
      eventSourceRef.current.onerror = () => {
        setError('Connection error. Please try again later.');
        setIsPredicting(false);
        
        if (eventSourceRef.current) {
          eventSourceRef.current.close();
          eventSourceRef.current = null;
        }
      };
      
    } catch (err) {
      console.error('Error predicting sales:', err);
      setError('Failed to predict sales: ' + (err instanceof Error ? err.message : String(err)));
      setIsPredicting(false);
    }
  };

  // Cleanup event source on component unmount
  useEffect(() => {
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, []);

  // Calculate overall trend
  const calculateTrend = () => {
    if (chartData.length < 2) return { percentage: 0, isUp: true };
    
    // Compare first and last 3 months to determine trend
    const firstThreeMonths = chartData.slice(0, 3);
    const lastThreeMonths = chartData.slice(-3);
    
    const firstThreeAvg = firstThreeMonths.reduce((sum, item) => sum + (item.total_sales || 0), 0) / firstThreeMonths.length;
    const lastThreeAvg = lastThreeMonths.reduce((sum, item) => sum + (item.total_sales || item.predicted_sales || 0), 0) / lastThreeMonths.length;
    
    const percentChange = ((lastThreeAvg - firstThreeAvg) / firstThreeAvg) * 100;
    
    return {
      percentage: Math.abs(Math.round(percentChange * 10) / 10),
      isUp: percentChange > 0
    };
  };

  const trend = calculateTrend();

  // Get date range for display
  const getDateRangeText = () => {
    if (chartData.length < 2) return "All time sales data";
    const firstItem = chartData[0];
    const lastItem = chartData[chartData.length - 1];
    return `${firstItem.month} to ${lastItem.month}`;
  };

  // Get the last N months of actual data that overlap with predictions
  const getOverlappingMonths = () => {
    if (!predictionData.length) return [];
    
    const actualData = chartData.filter(item => !item.isPrediction && item.total_sales !== null);
    return actualData.slice(-monthsAhead);
  };

  return (
    <Card>
      <CardHeader className="space-y-3">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <CardTitle>Complete Sales Overview</CardTitle>
            <CardDescription>
              Total sales aggregated by month across all available data
            </CardDescription>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="grid grid-cols-2 md:flex md:flex-row gap-2 w-full md:w-auto">
              <label className="flex flex-col md:flex-row md:items-center gap-1 text-sm">
                <span>Months Ahead:</span>
                <input
                  type="number"
                  min="1"
                  max="12"
                  value={monthsAhead}
                  onChange={(e) => setMonthsAhead(parseInt(e.target.value))}
                  className="px-2 py-1 border rounded w-full md:w-16 h-9"
                />
              </label>
              <label className="flex flex-col md:flex-row md:items-center gap-1 text-sm">
                <span>Max Points:</span>
                <input
                  type="number"
                  min="12"
                  max="100"
                  value={maxDataPoints}
                  onChange={(e) => setMaxDataPoints(parseInt(e.target.value))}
                  className="px-2 py-1 border rounded w-full md:w-16 h-9"
                />
              </label>
            </div>
            <Button 
              onClick={predictFutureSales} 
              disabled={isLoading || isPredicting}
              variant="outline"
              className="w-full md:w-auto h-9"
            >
              {isPredicting ? "Predicting..." : "Predict Future Sales"}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Training Progress Display */}
        {isPredicting && trainingProgress && (
          <Dialog open>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Training Neural Network</DialogTitle>
              </DialogHeader>
              <div className="flex justify-between mb-1 text-sm">
                <span>Current Iteration: {trainingProgress.iterations.toLocaleString()}</span>
              </div>
              <div className="my-3 h-2 w-full bg-secondary rounded overflow-hidden">
                <div 
                  className="h-full bg-primary transition-all duration-300"
                  style={{ 
                    width: `${Math.min(100, (1 - trainingProgress.error / (trainingProgress.errorThreshold * 10)) * 100)}%` 
                  }}
                ></div>
              </div>
              <p className="text-sm text-muted-foreground">
                Current Error: {trainingProgress.error.toFixed(6)}
              </p>
              <p className="text-sm text-muted-foreground">
                Target Error Threshold: {trainingProgress.errorThreshold}
              </p>
              <p className="text-sm font-medium mt-2">
                Training will continue until error threshold is met
              </p>
            </DialogContent>
          </Dialog>
        )}
        
        {/* Validation Metrics Display */}
        {validationMetrics && (
          <Alert className="mb-4">
            <AlertTitle>Model Validation Metrics</AlertTitle>
            <AlertDescription>
              <div className="grid grid-cols-2 gap-2 mt-2">
                <div>
                  <span className="font-medium">MSE:</span> {validationMetrics.mse}
                </div>
                <div>
                  <span className="font-medium">MAPE:</span> {validationMetrics.mape}%
                </div>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {isLoading ? (
          <div className="flex justify-center items-center h-[300px] md:h-[400px]">Loading chart data...</div>
        ) : error ? (
          <div className="flex justify-center items-center h-[300px] md:h-[400px]">{error}</div>
        ) : (
          <Tabs defaultValue="stacked" value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-2">
              <TabsTrigger value="stacked">Stacked View</TabsTrigger>
              <TabsTrigger value="separate">Separate View</TabsTrigger>
            </TabsList>
            <TabsContent value="stacked" className="h-[350px] md:h-[450px]">
              <ChartContainer config={chartConfig}>
                <AreaChart
                  accessibilityLayer
                  data={chartData}
                  margin={{
                    top: 10,
                    right: isMobile ? 10 : 30,
                    left: isMobile ? 5 : 10,
                    bottom: isMobile ? 60 : 30,
                  }}
                  stackOffset="none"
                >
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="month"
                    tickLine={true}
                    axisLine={true}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                    interval={isMobile ? 2 : 0}
                    tick={{ fontSize: isMobile ? 10 : 12 }}
                  />
                  <YAxis 
                    tickLine={false}
                    axisLine={true}
                    tickFormatter={(value) => `$${value.toLocaleString()}`}
                    width={isMobile ? 50 : 60}
                    tick={{ fontSize: isMobile ? 10 : 12 }}
                  />
                  <ChartTooltip
                    cursor={false}
                    content={
                      <ChartTooltipContent 
                        formatter={(value: any) => 
                          value ? `$${Number(value).toLocaleString()}` : 'N/A'
                        }
                      />
                    }
                  />
                  <Area
                    dataKey="total_sales"
                    type="monotone"
                    name="total_sales"
                    fill="var(--color-total_sales)"
                    fillOpacity={0.6}
                    stroke="var(--color-total_sales)"
                    strokeWidth={2}
                    connectNulls
                  />
                  <Area
                    dataKey="predicted_sales"
                    type="monotone"
                    name="predicted_sales"
                    fill="var(--color-predicted_sales)"
                    fillOpacity={0.5}
                    stroke="var(--color-predicted_sales)"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    connectNulls
                  />
                </AreaChart>
              </ChartContainer>
            </TabsContent>
            <TabsContent value="separate" className="h-[350px] md:h-[450px]">
              <ChartContainer config={chartConfig}>
                <AreaChart
                  accessibilityLayer
                  data={chartData}
                  margin={{
                    top: 10,
                    right: isMobile ? 10 : 30,
                    left: isMobile ? 5 : 10,
                    bottom: isMobile ? 60 : 30,
                  }}
                >
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="month"
                    tickLine={true}
                    axisLine={true}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                    interval={isMobile ? 2 : 0}
                    tick={{ fontSize: isMobile ? 10 : 12 }}
                  />
                  <YAxis 
                    tickLine={false}
                    axisLine={true}
                    tickFormatter={(value) => `$${value.toLocaleString()}`}
                    width={isMobile ? 50 : 60}
                    tick={{ fontSize: isMobile ? 10 : 12 }}
                  />
                  <ChartTooltip
                    cursor={false}
                    content={
                      <ChartTooltipContent 
                        formatter={(value: any) => 
                          value ? `$${Number(value).toLocaleString()}` : 'N/A'
                        }
                      />
                    }
                  />
                  
                  {/* On mobile, prioritize showing predicted sales */}
                  {isMobile ? (
                    <>
                      <Area
                        dataKey="predicted_sales"
                        type="monotone"
                        name="predicted_sales"
                        fill="var(--color-predicted_sales)"
                        fillOpacity={0.6}
                        stroke="var(--color-predicted_sales)"
                        connectNulls
                      />
                      {predictionData.length > 0 && (
                        <Area
                          dataKey="total_sales"
                          type="monotone"
                          name="total_sales"
                          fill="var(--color-total_sales)"
                          fillOpacity={0.6}
                          stroke="var(--color-total_sales)"
                          connectNulls
                        />
                      )}
                    </>
                  ) : (
                    <>
                      <Area
                        dataKey="total_sales"
                        type="monotone"
                        name="total_sales"
                        fill="var(--color-total_sales)"
                        fillOpacity={0.6}
                        stroke="var(--color-total_sales)"
                        connectNulls
                      />
                      {predictionData.length > 0 && (
                        <Area
                          dataKey="predicted_sales"
                          type="monotone"
                          name="predicted_sales"
                          fill="var(--color-predicted_sales)"
                          fillOpacity={0.6}
                          stroke="var(--color-predicted_sales)"
                          connectNulls
                        />
                      )}
                    </>
                  )}
                </AreaChart>
              </ChartContainer>
            </TabsContent>
          </Tabs>
        )}
        
        {/* Prediction Results Tables */}
        {predictionData.length > 0 && (
          <>
            {/* Overlapping Months Comparison */}
            {getOverlappingMonths().length > 0 && (
              <div className="mt-4 border rounded-md p-4">
                <h3 className="font-medium mb-2">Actual vs. Predicted Sales Comparison</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Comparing actual sales with model predictions for overlapping periods
                </p>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2">Period</th>
                        <th className="text-right py-2">Actual Sales</th>
                        <th className="text-right py-2">Predicted Sales</th>
                        <th className="text-right py-2">Difference</th>
                        <th className="text-right py-2">Error %</th>
                      </tr>
                    </thead>
                    <tbody>
                      {validationMetrics?.details?.map((item, index) => (
                        <tr key={index} className="border-b last:border-0">
                          <td className="py-2">{item.month_name} {item.year}</td>
                          <td className="text-right py-2">${item.actual_sales.toLocaleString()}</td>
                          <td className="text-right py-2">${item.predicted_sales.toLocaleString()}</td>
                          <td className="text-right py-2 font-medium" 
                              style={{ color: Math.abs(item.difference) < item.actual_sales * 0.1 ? 'inherit' : (item.difference > 0 ? 'red' : 'green') }}>
                            {item.difference > 0 ? '+' : ''}{item.difference.toLocaleString()}
                          </td>
                          <td className="text-right py-2 font-medium"
                              style={{ color: Math.abs(item.percentage_error) < 10 ? 'inherit' : (Math.abs(item.percentage_error) > 20 ? 'red' : 'orange') }}>
                            {item.percentage_error.toFixed(1)}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Future Predictions */}
            <div className="mt-4 border rounded-md p-4">
              <h3 className="font-medium mb-2">Future Sales Predictions</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2">Period</th>
                      <th className="text-right py-2">Normalized Value</th>
                      <th className="text-right py-2">Predicted Sales</th>
                    </tr>
                  </thead>
                  <tbody>
                    {predictionData.map((pred, index) => (
                      <tr key={index} className="border-b last:border-0">
                        <td className="py-2">{pred.month_name} {pred.year}</td>
                        <td className="text-right py-2">
                          {pred.normalized_prediction?.toFixed(6) || 'N/A'}
                        </td>
                        <td className="text-right py-2">${pred.predicted_sales.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
        
        {/* Normalization Parameters (if available) */}
        {normalizationParams && (
          <div className="mt-4 border rounded-md p-4">
            <h3 className="font-medium mb-2">Normalization Parameters</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <p className="text-sm font-medium">Minimum Sales</p>
                <p className="text-lg">${normalizationParams.min_sales.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Maximum Sales</p>
                <p className="text-lg">${normalizationParams.max_sales.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Range</p>
                <p className="text-lg">${normalizationParams.range.toLocaleString()}</p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <div className="flex w-full flex-col sm:flex-row items-start gap-2 text-sm">
          <div className="grid gap-2">
            <div className="flex items-center gap-2 font-medium leading-none">
              {trend.isUp ? (
                <span className="text-primary">Trending up by {trend.percentage}% over time <TrendingUp className="inline h-4 w-4" /></span>
              ) : (
                <span className="text-muted-foreground">Trending down by {trend.percentage}% over time</span>
              )}
            </div>
            <div className="flex items-center gap-2 leading-none text-muted-foreground">
              {getDateRangeText()}
              {predictionData.length > 0 && " (includes predictions)"}
            </div>
          </div>
        </div>
      </CardFooter>
    </Card>
  )
}
