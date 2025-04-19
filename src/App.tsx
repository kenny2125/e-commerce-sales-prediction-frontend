import { ThemeProvider } from "./components/theme-provider";
import { Toaster } from "sonner";
import { UserProvider } from "./contexts/UserContext";
import { Routes, Route, useLocation, BrowserRouter } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";

import Header from "./components/Header";
import Footer from "./components/Footer";
import ProtectedRoute from "./components/ProtectedRoute";

import Home from "./pages/Home";
import ProductDetail from "./pages/customer/ProductDetail";

import AboutUs from "./pages/footer/AboutUs";
import FAQ from "./pages/footer/FAQ";
import ContactUs from "./pages/footer/ContactUs";
import Terms_Conditions from "./pages/footer/Terms_Conditions";
import PrivacyPolicy from "./pages/footer/PrivacyPolicy";
import PurchasingGuide from "./pages/footer/PurchasingGuide";
import Dashboard from "./pages/admin/Dashboard";
import {Inventory} from "./pages/admin/Inventory";
import Orders from "./pages/admin/Orders";
import Sales from "./pages/admin/Sales";
import UserManagement from "./pages/admin/UserManagement";
import Search from "./pages/customer/Search";
import Checkout from "./pages/customer/Checkout";
import Unauthorized from "./pages/Unauthorized";
import NotFound from "./pages/NotFound";

const AppContent: React.FC = () => {
  const location = useLocation();
  const adminPaths = ["/dashboard", "/users", "/inventory", "/orders", "/sales"];
  const isAdminPage = adminPaths.some(path => location.pathname.startsWith(path));
  const paddingClasses = isAdminPage ? "px-4" : "sm:px-[175px] md:px-[100px] lg:px-[300px]";

  return (
    <HelmetProvider>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        {/* Add Sonner Toaster */}
        <Toaster position="top-center" richColors />
        <div className={paddingClasses}>
          <Header />

          <Routes>
            <Route index element={<Home />} />
            <Route path="/search" element={<Search />} />
            {/* <Route path="/pc-builds" element={<PackageView />} /> */}

            <Route path="/product" element={<ProductDetail />} />
            {/* <Route path="/build" element={<PackageDetail />} /> */}
            <Route path="/checkout" element={<Checkout />} />

            <Route path="/about-us" element={<AboutUs />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/contact-us" element={<ContactUs />} />
            <Route path="/terms&conditions" element={<Terms_Conditions />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/purchasing-guide" element={<PurchasingGuide />} />
            <Route path="/unauthorized" element={<Unauthorized />} />
            
            {/* Protected Admin Routes */}
            <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/users" element={<UserManagement />} />
            </Route>

            {/* Protected Admin & Editor Routes */}
            <Route element={<ProtectedRoute allowedRoles={["admin", "editor"]} />}>
              <Route path="/inventory" element={<Inventory />} />
              <Route path="/orders" element={<Orders />} />
            </Route>

            {/* Protected Admin, Editor & Viewer Routes */}
            <Route element={<ProtectedRoute allowedRoles={["admin", "editor", "viewer"]} />}>
              <Route path="/sales" element={<Sales />} />
            </Route>
                          
            
            {/* 404 Route - This should always be the last route */}
            <Route path="*" element={<NotFound />} />
          </Routes>

          <Footer />
        </div>
      </ThemeProvider>
    </HelmetProvider>
  );
};

const App: React.FC = () => (
  <UserProvider>
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  </UserProvider>
);

export default App;
