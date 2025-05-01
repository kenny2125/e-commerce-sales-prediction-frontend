import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useUser, UserRole } from "../contexts/UserContext";

interface ProtectedRouteProps {
  allowedRoles: UserRole[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
  const { currentUser, isLoggedIn, isInitialized } = useUser();
  const location = useLocation();
  
  // Don't make any authorization decisions until we've loaded user data from localStorage
  if (!isInitialized) {
    // Return a loading state or null while we're initializing
    return <div className="flex items-center justify-center h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>;
  }
  
  if (!isLoggedIn || !currentUser) {
    // Not logged in -> return to home
    return <Navigate to="/" replace />;
  }
  
  // Special check for users management route - only SUPER_ADMIN can access
  if (location.pathname === "/users" && currentUser.role !== "SUPER_ADMIN") {
    return <Navigate to="/unauthorized" replace />;
  }
  
  // SUPER_ADMIN has access to everything
  if (currentUser.role === "SUPER_ADMIN") {
    return <Outlet />;
  }
  
  // Other roles have access only to their allowed routes
  if (allowedRoles.includes(currentUser.role)) {
    return <Outlet />;
  }
  
  return <Navigate to="/unauthorized" replace />;
};

export default ProtectedRoute;
