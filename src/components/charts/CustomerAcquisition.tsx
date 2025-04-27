"use client"

import React, { useState, useEffect } from "react"
import { TrendingUp, DollarSign } from "lucide-react"
import { Bar, BarChart, CartesianGrid, Cell, LabelList, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
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

// configuration for revenue data
const chartConfig = {
  total_sales: { label: 'Revenue' }
} satisfies ChartConfig

export function CustomerAcquisition() {
  const [chartData, setChartData] = useState<Array<{ 
    month_name: string; 
    total_sales: number; 
    year: number; 
    display_label: string;
    formatted_sales: string;
  }>>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [currentYear, setCurrentYear] = useState<number>(new Date().getFullYear())
  
  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true)
        
        // Using the new endpoint that guarantees 6 months with proper formatting
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/sales/monthly-revenue-trend?months=6`)
        if (!res.ok) {
          throw new Error('Failed to fetch revenue data')
        }
        const data = await res.json()
        
        setChartData(data)
        
        // Update current year if we have data
        if (data.length > 0) {
          setCurrentYear(data[data.length - 1].year)
        }
        setError(null)
      } catch (error) {
        console.error('Failed to fetch revenue data', error)
        setError('Unable to load revenue data. Please try again later.')
        setChartData([])
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [])

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Revenue Trend</CardTitle>
          <CardDescription>Last 6 months</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[350px] text-destructive">
          {error}
        </CardContent>
      </Card>
    )
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <DollarSign className="mr-2 h-5 w-5" />
            <Skeleton className="h-5 w-40" />
          </CardTitle>
          <CardDescription><Skeleton className="h-4 w-32" /></CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[350px] flex flex-col justify-between">
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
            </div>
            
            <div className="grid grid-cols-6 gap-2 mb-8">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="flex flex-col items-center">
                  <Skeleton className="h-[100px] w-[40px] mb-2" />
                  <Skeleton className="h-3 w-12" />
                </div>
              ))}
            </div>
            
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Skeleton className="h-4 w-full" />
        </CardFooter>
      </Card>
    )
  }

  // Calculate trend percentage compared to first month
  const calculateTrend = () => {
    if (chartData.length < 2) return { value: 0, direction: 'neutral' }
    
    const firstMonth = chartData[0].total_sales
    const lastMonth = chartData[chartData.length - 1].total_sales
    
    const change = ((lastMonth - firstMonth) / firstMonth) * 100
    return {
      value: Math.abs(change).toFixed(1),
      direction: change >= 0 ? 'up' : 'down'
    }
  }

  const trend = calculateTrend()
  
  // Get date range for the subtitle
  const getDateRangeText = () => {
    if (chartData.length === 0) return "Last 6 months"
    const firstMonth = chartData[0]
    const lastMonth = chartData[chartData.length - 1]
    return `${firstMonth.month_name.substring(0, 3)} ${firstMonth.year} - ${lastMonth.month_name.substring(0, 3)} ${lastMonth.year}`
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <DollarSign className="mr-2 h-5 w-5" />
          Revenue Trend {currentYear}
        </CardTitle>
        <CardDescription>{getDateRangeText()}</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis 
                dataKey="display_label"
                angle={-45}
                textAnchor="end"
                height={70}
                tick={{ fontSize: 12 }}
              />
              <YAxis 
                tickFormatter={(value) => `₱${(value / 1000).toLocaleString()}k`}
              />
              <Tooltip 
                formatter={(value: number, name: string) => {
                  // Find the formatted value for this data point
                  const dataPoint = chartData.find(d => d.total_sales === value)
                  return dataPoint ? dataPoint.formatted_sales : `₱${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                }}
                labelFormatter={(label) => label}
              />
              <Legend />
              <Bar 
                name="Monthly Revenue" 
                dataKey="total_sales" 
                fill="hsl(var(--chart-1))"
                maxBarSize={60}
              >
                <LabelList 
                  dataKey="formatted_sales" 
                  position="top" 
                  style={{ fontSize: '0.7rem' }}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        {chartData.length > 1 && (
          <div className={`flex gap-2 font-medium leading-none ${trend.direction === 'up' ? 'text-emerald-500' : 'text-destructive'}`}>
            {trend.direction === 'up' ? (
              <>Trending up by {trend.value}% <TrendingUp className="h-4 w-4" /></>
            ) : (
              <>Trending down by {trend.value}% <TrendingUp className="h-4 w-4 rotate-180" /></>
            )}
          </div>
        )}
        <div className="leading-none text-muted-foreground">
          Based on historical sales data in Philippine Peso (₱)
        </div>
      </CardFooter>
    </Card>
  )
}
