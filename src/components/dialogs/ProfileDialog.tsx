import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { UserPen, Eye, EyeOff } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";

type UserRole = "guest" | "customer" | "admin";

interface User {
  id: string;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  gender?: string;
  address?: string;
  phone?: string;
  role: UserRole;
}

export function ProfileDialog() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // Fetch user profile from backend
  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      // Get token from localStorage
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError("You are not logged in");
        return;
      }
      
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/auth/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch profile');
      }
      
      const data = await response.json();
      setCurrentUser(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
      setError("Failed to load profile data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const handleLogout = () => {
    window.location.href = '/';
    localStorage.removeItem('token');
    setCurrentUser(null);
  };

  // Function to render role-specific capabilities
  const renderRoleCapabilities = (role: UserRole) => {
    switch (role) {
      case "admin":
        return (
          <div className="bg-blue-50 border border-blue-300 text-blue-800 px-4 py-3 rounded mb-4">
            <h3 className="font-semibold text-lg mb-2">Admin Capabilities:</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>Manage all products and inventory</li>
              <li>View and analyze sales predictions</li>
              <li>Access all customer data and orders</li>
              <li>Manage other user accounts</li>
              <li>Configure system settings</li>
              <li>Generate and export sales reports</li>
            </ul>
          </div>
        );
      case "customer":
        return (
          <div className="bg-green-50 border border-green-300 text-green-800 px-4 py-3 rounded mb-4">
            <h3 className="font-semibold text-lg mb-2">Customer Capabilities:</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>Browse and purchase products</li>
              <li>View your order history</li>
              <li>Track current orders</li>
              <li>Save items to your wishlist</li>
              <li>Leave product reviews</li>
            </ul>
          </div>
        );
      case "guest":
        return (
          <div className="bg-yellow-50 border border-yellow-300 text-yellow-800 px-4 py-3 rounded mb-4">
            <h3 className="font-semibold text-lg mb-2">Guest Capabilities:</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>Browse products</li>
              <li>Add items to cart</li>
              <li>Complete checkout as a guest</li>
              <li>Register for a full customer account</li>
            </ul>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="h-10 w-10 p-1"
          aria-label="User profile"
        >
          <UserPen className="h-5 w-5 text-primary" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[867px] w-full max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex flex-row align-middle items-center gap-2">
            <UserPen size={40} className="text-primary" />
            <DialogTitle>User Profile</DialogTitle>
          </div>
          <DialogDescription>
            Your profile information and account capabilities.
          </DialogDescription>
        </DialogHeader>

        {/* Error messages */}
        {error && (
          <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}
        
        {/* User Information */}
        {loading ? (
          <div className="space-y-4 py-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : currentUser ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
              <div className="space-y-4">
                <div>
                  <Label className="font-semibold">Name</Label>
                  <p>{currentUser.first_name} {currentUser.last_name}</p>
                </div>
                <div>
                  <Label className="font-semibold">Username</Label>
                  <p>{currentUser.username}</p>
                </div>
                <div>
                  <Label className="font-semibold">Email</Label>
                  <p>{currentUser.email}</p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <Label className="font-semibold">Role</Label>
                  <p className="capitalize">{currentUser.role}</p>
                </div>
                {currentUser.address && (
                  <div>
                    <Label className="font-semibold">Address</Label>
                    <p>{currentUser.address}</p>
                  </div>
                )}
                {currentUser.phone && (
                  <div>
                    <Label className="font-semibold">Phone</Label>
                    <p>{currentUser.phone}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Role-based capabilities */}
            {renderRoleCapabilities(currentUser.role)}
          </>
        ) : (
          <div className="py-4 text-center">
            <p>Please log in to view your profile information.</p>
          </div>
        )}
        
        <DialogFooter>
          <div className="flex gap-2">
            {loading ? (
              <Skeleton className="h-10 w-24" />
            ) : currentUser ? (
              <Button type="button" variant="outline" onClick={handleLogout}>
                Logout
              </Button>
            ) : (
              <Button type="button" onClick={() => window.location.href = '/login'}>
                Login
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
