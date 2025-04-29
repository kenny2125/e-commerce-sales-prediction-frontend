"use client"

import * as React from "react"
import { CartesianGrid, Line, LineChart, XAxis, ResponsiveContainer } from "recharts"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

// Chart config definition
const chartConfig = {
  views: {
    label: "Sale Per Day",
  },
  actualsales: {
    label: "Actual Sales",
    color: "hsl(var(--chart-1))",
  },
  predictedsales: {
    label: "Predicted Sales",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig

export function LineChartInteractive() {
  const [chartData, setChartData] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [activeChart, setActiveChart] = 
    React.useState<keyof typeof chartConfig>("actualsales");
  const [startDate, setStartDate] = React.useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = React.useState<Date | undefined>(undefined);

  const fetchSalesData = React.useCallback(async () => {
    try {
      setLoading(true);
      
      // Build query parameters for date range
      const params = new URLSearchParams();
      if (startDate) {
        params.append('start_date', format(startDate, 'yyyy-MM-dd'));
      }
      if (endDate) {
        params.append('end_date', format(endDate, 'yyyy-MM-dd'));
      }
      
      const url = `${import.meta.env.VITE_API_URL}/api/sales/chart${params.toString() ? '?' + params.toString() : ''}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error('Failed to fetch sales data');
      }
      
      const data = await response.json();
      setChartData(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching sales data:', err);
      setError('Failed to load sales data. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate]);

  React.useEffect(() => {
    fetchSalesData();
  }, [fetchSalesData]);

  // Preload date values based on chart data
  React.useEffect(() => {
    if (chartData.length > 0 && !startDate && !endDate) {
      const firstDate = new Date(chartData[0].date);
      const lastDate = new Date(chartData[chartData.length - 1].date);
      setStartDate(firstDate);
      setEndDate(lastDate);
    }
  }, [chartData, startDate, endDate]);

  const total = React.useMemo(
    () => ({
      actualsales: chartData.reduce((acc, curr) => acc + (curr.actualsales || 0), 0),
      predictedsales: chartData.reduce((acc, curr) => acc + (curr.predictedsales || 0), 0),
    }),
    [chartData]
  )

  // Calculate average daily sales
  const averageDailySales = React.useMemo(() => {
    if (chartData.length === 0) return 0;
    return total.actualsales / chartData.length;
  }, [chartData, total.actualsales]);

  // Calculate growth percentage (if applicable)
  const growthPercentage = React.useMemo(() => {
    if (chartData.length < 2) return 0;
    const firstDayActual = chartData[0]?.actualsales || 0;
    const lastDayActual = chartData[chartData.length - 1]?.actualsales || 0;
    if (firstDayActual === 0) return 0;
    return ((lastDayActual - firstDayActual) / firstDayActual) * 100;
  }, [chartData]);

  // Calculate median daily sales
  const medianDailySales = React.useMemo(() => {
    if (chartData.length === 0) return 0;
    const values = chartData.map(d => d.actualsales || 0).sort((a, b) => a - b);
    const mid = Math.floor(values.length / 2);
    return values.length % 2 !== 0 ? values[mid] : (values[mid - 1] + values[mid]) / 2;
  }, [chartData]);

  // Find peak sales information
  const peakSales = React.useMemo(() => {
    if (chartData.length === 0) return { value: 0, date: '' };
    
    const peak = chartData.reduce((max, curr) => 
      (curr.actualsales > max.actualsales) ? curr : max, 
      { actualsales: 0 }
    );
    
    return { 
      value: peak.actualsales || 0, 
      date: peak.date ? new Date(peak.date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }) : ''
    };
  }, [chartData]);

  // Calculate total sales
  const totalSales = React.useMemo(() => total.actualsales, [total.actualsales]);

  // Find lowest sales day info
  const lowestSales = React.useMemo(() => {
    if (chartData.length === 0) return { value: 0, date: '' };
    const min = chartData.reduce((min, curr) =>
      (curr.actualsales < min.actualsales ? curr : min),
      { actualsales: chartData[0].actualsales || 0, date: chartData[0].date }
    );
    return {
      value: min.actualsales || 0,
      date: new Date(min.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })
    };
  }, [chartData]);

  // Calculate date range for growth sub message
  const dateRange = React.useMemo(() => {
    if (startDate && endDate) {
      return `${format(startDate, "MMM dd")} - ${format(endDate, "MMM dd")}`;
    }
    if (chartData.length >= 2) {
      const first = new Date(chartData[0].date);
      const last = new Date(chartData[chartData.length - 1].date);
      return `${first.toLocaleDateString("en-US", { month: "short", day: "numeric" })} - ${last.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`;
    }
    return '';
  }, [startDate, endDate, chartData]);

  if (error) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-6">
          <div className="text-center text-red-500">
            <p>{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-col items-stretch space-y-4 border-b p-4 sm:p-6">
        <div className="flex flex-col md:flex-row justify-between gap-4">
          <div className="flex flex-1 flex-col justify-center">
            <CardTitle className="text-xl">Sales Chart - Interactive</CardTitle>
            <CardDescription>
              {loading ? (
                <Skeleton className="h-4 w-[250px]" />
              ) : (
                `Showing total of ${growthPercentage.toFixed(1)}% growth over period`
              )}
            </CardDescription>
          </div>
          
          <div className="flex flex-wrap md:flex-nowrap gap-2 items-center">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-[140px] justify-start text-left font-normal",
                    !startDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {startDate ? format(startDate, "PP") : "Start date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={startDate}
                  onSelect={setStartDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-[140px] justify-start text-left font-normal",
                    !endDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {endDate ? format(endDate, "PP") : "End date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={endDate}
                  onSelect={setEndDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            <Button 
              variant="secondary"
              onClick={() => {
                // Reset to the data range available in the dataset
                if (chartData.length > 0) {
                  const firstDate = new Date(chartData[0].date);
                  const lastDate = new Date(chartData[chartData.length - 1].date);
                  setStartDate(firstDate);
                  setEndDate(lastDate);
                  // Refetch data with full range
                  fetchSalesData();
                }
              }}
              className="whitespace-nowrap"
            >
              Reset
            </Button>
          </div>
        </div>
        
        {!loading && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 pt-2">
            {/* Average Daily Sales */}
            <div className="flex flex-col items-center bg-muted/30 p-3 rounded-md">
              <span className="text-xs text-muted-foreground">Avg Sales</span>
              <span className="text-lg font-bold">{averageDailySales.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
            </div>
            {/* Median Daily Sales */}
            <div className="flex flex-col items-center bg-muted/30 p-3 rounded-md">
              <span className="text-xs text-muted-foreground">Median Sales</span>
              <span className="text-lg font-bold">{medianDailySales.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
            </div>
            {/* Peak Sales */}
            <div className="flex flex-col items-center bg-muted/30 p-3 rounded-md">
              <span className="text-xs text-muted-foreground">Peak Sales</span>
              <span className="text-lg font-bold">{peakSales.value.toLocaleString()}</span>
              {peakSales.date && <span className="text-xs text-muted-foreground">{peakSales.date}</span>}
            </div>
            {/* Total Sales */}
            <div className="flex flex-col items-center bg-muted/30 p-3 rounded-md">
              <span className="text-xs text-muted-foreground">Total Sales</span>
              <span className="text-lg font-bold">{totalSales.toLocaleString()}</span>
            </div>
            {/* Growth Percentage */}
            <div className="flex flex-col items-center bg-muted/30 p-3 rounded-md">
              <span className="text-xs text-muted-foreground">Growth</span>
              <span className="text-lg font-bold">{growthPercentage.toFixed(1)}%</span>
              <span className="text-xs text-muted-foreground">{dateRange}</span>
            </div>
            {/* Lowest Sales */}
            <div className="flex flex-col items-center bg-muted/30 p-3 rounded-md">
              <span className="text-xs text-muted-foreground">Lowest Sales</span>
              <span className="text-lg font-bold">{lowestSales.value.toLocaleString()}</span>
              <span className="text-xs text-muted-foreground">{lowestSales.date}</span>
            </div>
          </div>
        )}
      </CardHeader>
      <CardContent className="p-2 sm:p-6">
        {loading ? (
          <div className="flex justify-center items-center h-[200px] sm:h-[250px]">
            <Skeleton className="h-[180px] sm:h-[200px] w-full" />
          </div>
        ) : (
          <ChartContainer
            config={chartConfig}
            className="aspect-auto h-[200px] sm:h-[250px] w-full"
          >
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={chartData}
                margin={{
                  top: 5,
                  right: 10,
                  left: 10,
                  bottom: 5,
                }}
              >
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  minTickGap={32}
                  tickFormatter={(value) => {
                    const date = new Date(value)
                    return date.toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })
                  }}
                />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      className="w-[150px]"
                      nameKey="views"
                      labelFormatter={(value) => {
                        return new Date(value).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })
                      }}
                    />
                  }
                />
                <Line
                  dataKey={activeChart}
                  type="monotone"
                  stroke={`var(--color-${activeChart})`}
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
}
