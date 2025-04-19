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
import { BarChartView } from "@/components/charts/BarChart";
import { SalesPrediction } from "@/components/charts/SalesPrediction";
import { SalesRecordsTable } from "@/components/admin/SalesRecordsTable";

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
          <div className="grid gap-4 md:grid-cols-2">
            <KpiCard 
              title="Total Revenue" 
              value="₱12,345.67" // Placeholder
              icon={PhilippinePeso} 
              description="+20.1% from last month" // Placeholder
            />
            <KpiCard 
              title="Total Orders" 
              value="589" // Placeholder
              icon={ShoppingCart} 
              description="+15% from last month" // Placeholder
            />
             <KpiCard 
              title="Avg. Order Value" 
              value="₱20.96" // Placeholder
              icon={TrendingUp} 
              description="+5.1% from last month" // Placeholder
            />
             <KpiCard 
              title="New Customers" 
              value="73" // Placeholder
              icon={Users} 
              description="+10 since last week" // Placeholder
            />
          </div>

          <div className="w-full">
            <TopCategories/>
          </div>
          <div className="w-full">
            <BarChartView/>
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
