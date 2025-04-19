"use client"

import React, { useState, useEffect } from "react"
import { TrendingUp } from "lucide-react"
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

// configuration for customer count
const chartConfig = {
  count: { label: 'Customers' }
} satisfies ChartConfig

export function BarChartView() {
  const [chartData, setChartData] = useState<Array<{ month: string; count: number }>>([])
  const [error, setError] = useState<string | null>(null)
  
  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/sales/customer-acquisition-churn`)
        if (!res.ok) {
          throw new Error('Failed to fetch data')
        }
        const json = await res.json()
        setChartData(json)
        setError(null)
      } catch (error) {
        console.error('Failed to fetch customer data', error)
        setError('Unable to load customer data. Please try again later.')
        setChartData([])
      }
    }
    fetchData()
  }, [])

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Customer Acquisition vs Churn</CardTitle>
          <CardDescription>Last 6 months</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[350px] text-destructive">
          {error}
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Customer Acquisition vs Churn</CardTitle>
        <CardDescription>Last 6 months</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={chartData}>
              <CartesianGrid vertical={false} />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel hideIndicator />}
              />
              <Bar dataKey="count">
                <LabelList position="top" dataKey="month" fillOpacity={1} />
                {chartData.map((item) => (
                  <Cell
                    key={item.month}
                    fill={item.count > 0 ? 'hsl(var(--chart-1))' : 'hsl(var(--chart-2))'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        {/* <div className="flex gap-2 font-medium leading-none">
          Trending up by 5.2% this month <TrendingUp className="h-4 w-4" />
        </div>
        <div className="leading-none text-muted-foreground">
          Showing total visitors for the last 6 months
        </div> */}
      </CardFooter>
    </Card>
  )
}
