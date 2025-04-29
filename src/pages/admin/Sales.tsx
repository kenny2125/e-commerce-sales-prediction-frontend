import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { LineChartInteractive } from "@/components/charts/LineChartInterative";
import { PhilippinePeso, TableIcon, BarChart, LineChart, ShoppingCart, TrendingUp, Users, Calendar, Repeat } from "lucide-react";
import { TopCategories } from "@/components/charts/TopCategories";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CustomerAcquisition } from "@/components/charts/CustomerAcquisition";
import { SalesPrediction } from "@/components/charts/SalesPrediction";
import { SalesRecordsTable } from "@/components/admin/SalesRecordsTable";
import { HistoricalSalesTable } from "@/components/admin/HistoricalSalesTable";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";

// Interface for KPI data structure
interface KpiData {
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  averageOrdersPerDay: number;
}

// Placeholder KPI Card Component (can be moved to a separate file later)
const KpiCard = ({ title, value, icon: Icon, description, children }: { title: string; value: string; icon: React.ElementType; description?: string; children?: React.ReactNode }) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium flex items-center gap-2">{title} {children}</CardTitle>
      <Icon className="h-4 w-4 text-muted-foreground" />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      {description && <p className="text-xs text-muted-foreground">{description}</p>}
    </CardContent>
  </Card>
);

export default function Sales() {
  const [kpiData, setKpiData] = useState<KpiData | null>(null);
  const [kpiLoading, setKpiLoading] = useState(true);
  const [kpiError, setKpiError] = useState<string | null>(null);
  const [revenueSource, setRevenueSource] = useState<'sales' | 'historical'>('sales');

  // Fetch KPI data
  useEffect(() => {
    const fetchKpiData = async () => {
      setKpiLoading(true);
      setKpiError(null);
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/sales/kpi-summary`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data: KpiData = await response.json();
        setKpiData(data);
      } catch (e) {
        if (e instanceof Error) {
          setKpiError(e.message);
        } else {
          setKpiError("An unknown error occurred fetching KPIs");
        }
        console.error("Failed to fetch KPI data:", e);
      } finally {
        setKpiLoading(false);
      }
    };

    fetchKpiData();
  }, []);

  // Fetch total revenue for the selected source
  const [totalRevenue, setTotalRevenue] = useState<number>(0);
  const [revenueLoading, setRevenueLoading] = useState(false);
  useEffect(() => {
    const fetchRevenue = async () => {
      setRevenueLoading(true);
      try {
        const url = `${import.meta.env.VITE_API_URL}/api/sales/total-revenue?source=${revenueSource}`;
        const res = await fetch(url);
        const data = await res.json();
        setTotalRevenue(data.total_revenue);
      } catch (e) {
        setTotalRevenue(0);
      } finally {
        setRevenueLoading(false);
      }
    };
    fetchRevenue();
  }, [revenueSource]);

  // Helper function to format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
    }).format(value);
  };

  // Helper function to format number to one decimal place
  const formatDecimal = (value: number) => {
    return value.toFixed(1);
  };

  return (
    <>
      {/* Header section */}
      <div className="w-full mb-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-4">
            <PhilippinePeso className="text-primary" size="40px" />
            <div>
              <h1 className="text-2xl font-bold whitespace-nowrap">Sales Management</h1>
              <p className="text-sm text-muted-foreground">View and analyze completed sales transactions.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Two-column layout with smaller left and larger right column */}
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Left column - smaller */}
        <div className="w-full lg:w-1/3 flex flex-col gap-4">
          {/* KPI Cards Row */}
          {kpiLoading ? (
            <div className="grid gap-4 md:grid-cols-2">
              {/* Skeleton KPI Cards */}
              {[1, 2, 3, 4].map((i) => (
                <Card key={i}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <Skeleton className="h-5 w-24" />
                    <Skeleton className="h-4 w-4 rounded-full" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-8 w-28 mb-2" />
                    <Skeleton className="h-3 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : kpiError ? (
            <Card><CardContent className="pt-6 text-destructive">Error loading KPIs: {kpiError}</CardContent></Card>
          ) : kpiData ? (
            <div className="grid gap-4 md:grid-cols-2">
              <KpiCard
                title={`Total Revenue (${revenueSource === 'historical' ? 'Historical Sales' : 'Sales Table'})`}
                value={revenueLoading ? '...' : formatCurrency(totalRevenue)}
                icon={PhilippinePeso}
              >
                <div className="flex items-center gap-2 ml-2">
                  <span className="text-xs">Historical</span>
                  <Switch
                    checked={revenueSource === 'sales'}
                    onCheckedChange={checked => setRevenueSource(checked ? 'sales' : 'historical')}
                    className="mx-1"
                    aria-label="Toggle revenue source"
                  />
                  <span className="text-xs">Sales</span>
                </div>
              </KpiCard>
              <KpiCard
                title="Total Orders"
                value={kpiData.totalOrders.toString()}
                icon={ShoppingCart}
              />
              <KpiCard
                title="Avg. Order Value"
                value={formatCurrency(kpiData.averageOrderValue)}
                icon={TrendingUp}
              />
              <KpiCard
                title="Avg. Orders / Day"
                value={formatDecimal(kpiData.averageOrdersPerDay)}
                icon={Calendar}
              />
            </div>
          ) : (
             <Card><CardContent className="pt-6">No KPI data available.</CardContent></Card>
          )}

          <div className="w-full">
            <CustomerAcquisition/>
          </div>
        </div>

        {/* Right column - larger with tabbed interface */}
        <div className="w-full lg:w-2/3">
          <Card>
            <CardHeader>
              <Tabs defaultValue="predictions" className="w-full">
                <div className="flex justify-between items-center mb-4">
                  <TabsList>
                    <TabsTrigger value="predictions" className="flex items-center gap-2">
                      <LineChart className="h-4 w-4" />
                      <span>Sales Predictions</span>
                    </TabsTrigger>
                    <TabsTrigger value="table" className="flex items-center gap-2">
                      <TableIcon className="h-4 w-4" />
                      <span>Sales Records</span>
                    </TabsTrigger>
                    <TabsTrigger value="historical" className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>Historical Data</span>
                    </TabsTrigger>
                  </TabsList>
                </div>

                {/* Prediction Tab Content */}
                <TabsContent value="predictions" className="mt-0">
                  <SalesPrediction />
                </TabsContent>

                {/* Table Tab Content */}
                <TabsContent value="table" className="mt-0">
                  <SalesRecordsTable />
                </TabsContent>
                
                {/* Historical Sales Tab Content */}
                <TabsContent value="historical" className="mt-0">
                  <HistoricalSalesTable />
                </TabsContent>
              </Tabs>
            </CardHeader>
          </Card>
        </div>
      </div>
    </>
  );
}
