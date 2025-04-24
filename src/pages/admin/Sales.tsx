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
import { PhilippinePeso, TableIcon, BarChart, LineChart, ShoppingCart, TrendingUp, Users } from "lucide-react";
import { TopCategories } from "@/components/charts/TopCategories";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CustomerAcquisition } from "@/components/charts/CustomerAcquisition";
import { SalesPrediction } from "@/components/charts/SalesPrediction";
import { SalesRecordsTable } from "@/components/admin/SalesRecordsTable";

// Interface for KPI data structure
interface KpiData {
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  newCustomers: number;
}

// Placeholder KPI Card Component (can be moved to a separate file later)
const KpiCard = ({ title, value, icon: Icon, description }: { title: string; value: string; icon: React.ElementType; description?: string }) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
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

  // Helper function to format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
    }).format(value);
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
            <Card><CardContent className="pt-6">Loading KPIs...</CardContent></Card>
          ) : kpiError ? (
            <Card><CardContent className="pt-6 text-destructive">Error loading KPIs: {kpiError}</CardContent></Card>
          ) : kpiData ? (
            <div className="grid gap-4 md:grid-cols-2">
              <KpiCard 
                title="Total Revenue" 
                value={formatCurrency(kpiData.totalRevenue)}
                icon={PhilippinePeso} 
              />
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
                title="New Customers (30d)" 
                value={kpiData.newCustomers.toString()}
                icon={Users} 
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
              </Tabs>
            </CardHeader>
          </Card>
        </div>
      </div>
    </>
  );
}
