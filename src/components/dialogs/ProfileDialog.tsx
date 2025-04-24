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
  const [editing, setEditing] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    first_name: "",
    last_name: "",
    address: "",
    phone: "",
  });

  // Validation states
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Validation function adapted from RegistrationForm
  const validateField = (field: string, value: string): string => {
    switch (field) {
      case "first_name":
        if (!value.trim()) return "First name is required";
        if (!/^[A-Za-z\s]+$/.test(value)) return "Should contain only letters";
        if (value.length > 50) return "First name cannot exceed 50 characters";
        return "";
      case "last_name":
        if (!value.trim()) return "Last name is required";
        if (!/^[A-Za-z\s]+$/.test(value)) return "Should contain only letters";
        if (value.length > 50) return "Last name cannot exceed 50 characters";
        return "";
      case "address":
        if (!value.trim()) return "Address is required";
        if (value.length > 255) return "Address cannot exceed 255 characters";
        return "";
      case "email":
        if (!value.trim()) return "Email is required";
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return "Please enter a valid email";
        return "";
      case "phone":
        if (!value.trim()) return "Phone number is required";
        if (!/^\+639\d{9}$/.test(value)) return "Phone must be in the format +639XXXXXXXXX";
        return "";
      case "username":
        if (!value.trim()) return "Username is required";
        if (value.length < 4) return "Username must be at least 4 characters";
        if (value.length > 30) return "Username cannot exceed 30 characters";
        if (!/^[A-Za-z0-9_]+$/.test(value)) return "Username should be alphanumeric or underscore";
        return "";
      default:
        return "";
    }
  };

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
      setFormData({
        username: data.username || "",
        email: data.email || "",
        first_name: data.first_name || "",
        last_name: data.last_name || "",
        address: data.address || "",
        phone: data.phone || "",
      });
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    
    let finalValue = value;
    // Ensure phone number always starts with +63 and cannot be deleted
    if (id === "phone") {
      if (!value.startsWith("+63") || value.length < 3) {
        finalValue = "+63";
      } else if (value.length > 13) { // Prevent typing more than 13 characters
        finalValue = value.slice(0, 13);
      }
    }
    
    setFormData(prev => ({
      ...prev,
      [id]: finalValue
    }));
    
    // Validate on change
    const error = validateField(id, finalValue);
    setErrors(prev => ({
      ...prev,
      [id]: error
    }));
    
    setTouched(prev => ({
      ...prev,
      [id]: true
    }));
  };

  const handleBlur = (field: string) => {
    setTouched(prev => ({
      ...prev,
      [field]: true
    }));
    
    const value = formData[field as keyof typeof formData] as string;
    const error = validateField(field, value);
    setErrors(prev => ({
      ...prev,
      [field]: error
    }));
  };

  const handleLogout = () => {
    window.location.href = '/';
    localStorage.removeItem('token');
    setCurrentUser(null);
  };

  // Reset form data to original user data
  const handleCancel = () => {
    if (currentUser) {
      setFormData({
        username: currentUser.username || "",
        email: currentUser.email || "",
        first_name: currentUser.first_name || "",
        last_name: currentUser.last_name || "",
        address: currentUser.address || "",
        phone: currentUser.phone || "",
      });
    }
    setEditing(false);
    setError(null);
    setErrors({});
    setTouched({});
  };

  const handleSave = async () => {
    try {
      // Validate all fields before submission
      const validationErrors: Record<string, string> = {};
      Object.entries(formData).forEach(([key, value]) => {
        const error = validateField(key, value as string);
        if (error) validationErrors[key] = error;
      });
      
      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
        // Mark all fields as touched to show all errors
        const touchedFields: Record<string, boolean> = {};
        Object.keys(formData).forEach(key => {
          touchedFields[key] = true;
        });
        setTouched(touchedFields);
        return;
      }
      
      setLoading(true);
      setError(null);
      setSuccessMessage(null);
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError("You are not logged in");
        return;
      }
      
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        
        // Check for specific error types
        if (errorData.code === 'DUPLICATE_EMAIL') {
          setError("This email is already being used by another account");
          return;
        } else if (errorData.code === 'DUPLICATE_USERNAME') {
          setError("This username is already being used by another account");
          return;
        }
        
        throw new Error(errorData.message || 'Failed to update profile');
      }
      
      const data = await response.json();
      setCurrentUser(data.user);
      // Update form data with the returned user data
      setFormData({
        username: data.user.username || "",
        email: data.user.email || "",
        first_name: data.user.first_name || "",
        last_name: data.user.last_name || "",
        address: data.user.address || "",
        phone: data.user.phone || "",
      });
      setEditing(false);
      setSuccessMessage("Profile updated successfully");
      setErrors({});
      setTouched({});
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    } catch (error) {
      console.error('Error updating profile:', error);
      setError(error instanceof Error ? error.message : "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  if (loading && !currentUser) {
    return <div>Loading...</div>;
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <UserPen size={40} className="text-primary cursor-pointer" />
      </DialogTrigger>
      <DialogContent className="sm:max-w-[867px] w-full max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex flex-row align-middle items-center gap-2">
            <UserPen size={40} className="text-primary" />
            <DialogTitle>User Profile</DialogTitle>
          </div>
          <DialogDescription>
            {editing ? "Make changes to your profile here. Click save when you're done." : "Your profile information."}
          </DialogDescription>
        </DialogHeader>

        {/* Error and success messages */}
        {error && (
          <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}
        
        {successMessage && (
          <div className="bg-green-50 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" role="alert">
            <span className="block sm:inline">{successMessage}</span>
          </div>
        )}

        {currentUser ? (
          <div className="flex flex-col md:flex-row justify-between gap-8">
            <div className="flex flex-col align-top py-4 w-full gap-4">
              <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-4">
                <Label htmlFor="first_name" className="text-right">
                  First Name
                </Label>
                <div className="col-span-3">
                  <Input 
                    id="first_name" 
                    value={formData.first_name} 
                    onChange={handleInputChange}
                    onBlur={() => handleBlur("first_name")}
                    maxLength={50}
                    className={`${errors.first_name && touched.first_name ? "border-red-500" : ""}`}
                    disabled={!editing} 
                  />
                  {editing && errors.first_name && touched.first_name && (
                    <p className="text-xs text-red-500 mt-1">{errors.first_name}</p>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-4">
                <Label htmlFor="last_name" className="text-right">
                  Last Name
                </Label>
                <div className="col-span-3">
                  <Input 
                    id="last_name" 
                    value={formData.last_name} 
                    onChange={handleInputChange}
                    onBlur={() => handleBlur("last_name")}
                    maxLength={50}
                    className={`${errors.last_name && touched.last_name ? "border-red-500" : ""}`}
                    disabled={!editing} 
                  />
                  {editing && errors.last_name && touched.last_name && (
                    <p className="text-xs text-red-500 mt-1">{errors.last_name}</p>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-4">
                <Label htmlFor="email" className="text-right">
                  Email
                </Label>
                <div className="col-span-3">
                  <Input 
                    id="email" 
                    type="email"
                    value={formData.email} 
                    onChange={handleInputChange}
                    onBlur={() => handleBlur("email")}
                    className={`${errors.email && touched.email ? "border-red-500" : ""}`}
                    disabled={!editing} 
                  />
                  {editing && errors.email && touched.email && (
                    <p className="text-xs text-red-500 mt-1">{errors.email}</p>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-4">
                <Label htmlFor="username" className="text-right">
                  Username
                </Label>
                <div className="col-span-3">
                  <Input 
                    id="username" 
                    value={formData.username} 
                    onChange={handleInputChange}
                    onBlur={() => handleBlur("username")}
                    maxLength={30}
                    className={`${errors.username && touched.username ? "border-red-500" : ""}`}
                    disabled={!editing} 
                  />
                  {editing && errors.username && touched.username && (
                    <p className="text-xs text-red-500 mt-1">{errors.username}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="flex flex-col align-top py-4 w-full gap-4">
              <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-4">
                <Label htmlFor="address" className="text-right">
                  Address
                </Label>
                <div className="col-span-3">
                  <Input 
                    id="address" 
                    value={formData.address} 
                    onChange={handleInputChange}
                    onBlur={() => handleBlur("address")}
                    maxLength={255}
                    className={`${errors.address && touched.address ? "border-red-500" : ""}`}
                    disabled={!editing} 
                  />
                  {editing && errors.address && touched.address && (
                    <p className="text-xs text-red-500 mt-1">{errors.address}</p>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-4">
                <Label htmlFor="phone" className="text-right">
                  Phone
                </Label>
                <div className="col-span-3">
                  <Input 
                    id="phone" 
                    type="tel"
                    value={formData.phone} 
                    onChange={handleInputChange}
                    onBlur={() => handleBlur("phone")}
                    maxLength={13}
                    className={`${errors.phone && touched.phone ? "border-red-500" : ""}`}
                    disabled={!editing} 
                  />
                  {editing && errors.phone && touched.phone && (
                    <p className="text-xs text-red-500 mt-1">{errors.phone}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div>No user data available.</div>
        )}
        
        <DialogFooter>
          <div className="flex gap-2">
            {editing ? (
              <>
                <Button type="button" onClick={handleSave} disabled={loading} className="relative">
                  {loading && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  )}
                  <span className={loading ? "opacity-0" : "opacity-100"}>
                    Save
                  </span>
                </Button>
                <Button type="button" variant="outline" onClick={handleCancel} disabled={loading}>
                  Cancel
                </Button>
              </>
            ) : (
              <>
                <Button type="button" onClick={() => setEditing(true)}>
                  Edit Profile
                </Button>
                <Button type="button" variant="outline" onClick={handleLogout}>
                  Logout
                </Button>
              </>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
