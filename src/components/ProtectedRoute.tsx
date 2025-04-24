import { Navigate, Outlet } from "react-router-dom";
import { useUser, UserRole } from "../contexts/UserContext";

interface ProtectedRouteProps {
  allowedRoles: UserRole[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
  const { currentUser, isLoggedIn, isInitialized } = useUser();
  
  // Don't make any authorization decisions until we've loaded user data from localStorage
  if (!isInitialized) {
    // Return a loading state or null while we're initializing
    return <div className="flex items-center justify-center h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>;
  }
  
  if (!isLoggedIn || !currentUser) {
    return <Navigate to="/unauthorized" replace />;
  }
  
  // Admin has access to everything
  if (currentUser.role === "admin") {
    return <Outlet />;
  }
  
  // Editor and Viewer have access to their allowed routes
  if (allowedRoles.includes(currentUser.role)) {
    return <Outlet />;
  }
  
  return <Navigate to="/unauthorized" replace />;
};

export default ProtectedRoute;
