import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { RegistrationData } from "@/contexts/UserContext";
import { SuccessOverlay } from "../SuccessOverlay"; // Corrected import path again

interface RegistrationFormProps {
  onToggleMode: () => void;
  isLoading: boolean;
  error: string | null; // Keep the error prop from LogInDialog
  onSuccess: () => void;
}

export function RegistrationForm({
  onToggleMode,
  isLoading, // Use isLoading from props
  error, // Use error from props
  onSuccess,
}: RegistrationFormProps) {
  const [regData, setRegData] = useState<Omit<RegistrationData, 'gender'>>({
    username: "",
    email: "",
    password: "",
    first_name: "",
    last_name: "",
    address: "",
    phone: "+63", // Initialize phone with +63 prefix
  });
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  const [registrationStatus, setRegistrationStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [showSuccessOverlay, setShowSuccessOverlay] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null); // Separate state for API errors

  useEffect(() => {
    const registerUrl = `${import.meta.env.VITE_API_URL}/api/auth/register`;
    fetch(registerUrl)
      .then(response => response.json())
      .then(data => console.log("Registration endpoint response:", data))
      .catch(err => console.error("Error fetching registration endpoint:", err));
  }, []);

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
      case "password":
        if (!value) return "Password is required";
        if (value.length < 8) return "Password must be at least 8 characters";
        if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(value)) 
          return "Password must include uppercase, lowercase, and numbers";
        return "";
      case "confirmPassword":
        if (!value) return "Please confirm your password";
        if (value !== regData.password) return "Passwords do not match";
        return "";
      default:
        return "";
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError(null); // Clear previous API errors

    const validationErrors: Record<string, string> = {};
    Object.entries(regData).forEach(([key, value]) => {
      const error = validateField(key, value as string);
      if (error) validationErrors[key] = error;
    });
    
    const confirmError = validateField("confirmPassword", confirmPassword);
    if (confirmError) validationErrors.confirmPassword = confirmError;
    
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    
    setRegistrationStatus('loading');
    const registerUrl = `${import.meta.env.VITE_API_URL}/api/auth/register`;
    try {
      const res = await fetch(registerUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(regData)
      });
      
      if (!res.ok) {
        const result = await res.json();
        console.error(result);
        setApiError(result.message || "Registration failed. Please check your details."); // Set API error message
        setRegistrationStatus('error');
        return;
      }
      
      setRegistrationStatus('success');
      setShowSuccessOverlay(true); // Show the overlay
      setTimeout(() => {
        onToggleMode(); // Toggle back to login form
        setTimeout(() => {
          setShowSuccessOverlay(false); // Hide overlay after a short delay
        }, 500);
      }, 2000); // Keep overlay for 2 seconds
      
    } catch (err) {
      console.error(err);
      setApiError("An unexpected error occurred during registration."); // Set generic error
      setRegistrationStatus('error');
    }
  };

  const handleRegDataChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    let field = id;
    
    if (id === "firstName") field = "first_name";
    if (id === "lastName") field = "last_name";
    if (id === "reg-username") field = "username";
    if (id === "reg-password") field = "password";

    let finalValue = value;
    // Ensure phone number always starts with +63 and cannot be deleted
    if (field === "phone") {
      if (!value.startsWith("+63") || value.length < 3) {
        finalValue = "+63";
      } else if (value.length > 13) { // Prevent typing more than 13 characters
        finalValue = value.slice(0, 13);
      }
    }
    
    setRegData(prev => ({
      ...prev,
      [field]: finalValue
    }));
    
    const error = validateField(field, finalValue);
    setErrors(prev => ({
      ...prev,
      [field]: error
    }));
    
    setTouched(prev => ({
      ...prev,
      [field]: true
    }));
  };
  
  const handleBlur = (field: string) => {
    setTouched(prev => ({
      ...prev,
      [field]: true
    }));
    
    const value = field === "confirmPassword" 
      ? confirmPassword 
      : regData[field as keyof Omit<RegistrationData, 'gender'>] as string;
    const error = validateField(field, value);
    setErrors(prev => ({
      ...prev,
      [field]: error
    }));
  };
  
  const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setConfirmPassword(value);
    
    const error = validateField("confirmPassword", value);
    setErrors(prev => ({
      ...prev,
      confirmPassword: error
    }));
  };

  // Use the reusable SuccessOverlay component
  if (showSuccessOverlay) {
    return <SuccessOverlay message="Registration Successful!" />;
  }

  return (
    <form onSubmit={handleRegister} className="flex flex-col">
      <div className="flex flex-col align-top py-4 w-full gap-6">
        <div className="flex flex-col sm:flex-row gap-4 w-full">
          <div className="flex-1">
            <Input
              id="firstName"
              placeholder="First name"
              value={regData.first_name}
              onChange={handleRegDataChange}
              onBlur={() => handleBlur("first_name")}
              required
              maxLength={50}
              className={errors.first_name && touched.first_name ? "border-red-500" : ""}
            />
            {errors.first_name && touched.first_name && (
              <p className="text-xs text-red-500">{errors.first_name}</p>
            )}
          </div>
          
          <div className="flex-1">
            <Input
              id="lastName"
              placeholder="Last name"
              value={regData.last_name}
              onChange={handleRegDataChange}
              onBlur={() => handleBlur("last_name")}
              required
              maxLength={50}
              className={errors.last_name && touched.last_name ? "border-red-500" : ""}
            />
            {errors.last_name && touched.last_name && (
              <p className="text-xs text-red-500">{errors.last_name}</p>
            )}
          </div>
        </div>

        <div className="w-full">
          <Input
            id="address"
            placeholder="Full address"
            value={regData.address}
            onChange={handleRegDataChange}
            onBlur={() => handleBlur("address")}
            required
            maxLength={255}
            className={errors.address && touched.address ? "border-red-500" : ""}
          />
          {errors.address && touched.address && (
            <p className="text-xs text-red-500 mt-1">{errors.address}</p>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-4 w-full">
          <div className="flex-1">
            <Input
              id="email"
              type="email"
              placeholder="Email address"
              value={regData.email}
              onChange={handleRegDataChange}
              onBlur={() => handleBlur("email")}
              required
              className={errors.email && touched.email ? "border-red-500" : ""}
            />
            {errors.email && touched.email && (
              <p className="text-xs text-red-500 mt-1">{errors.email}</p>
            )}
          </div>
          
          <div className="flex-1">
            <Input
              id="phone"
              type="tel"
              placeholder="+639XXXXXXXXX"
              value={regData.phone} // Bind to state
              onChange={handleRegDataChange} // Use updated handler
              onBlur={() => handleBlur("phone")}
              required
              maxLength={13}
              className={errors.phone && touched.phone ? "border-red-500" : ""}
            />
            {errors.phone && touched.phone && (
              <p className="text-xs text-red-500 mt-1">{errors.phone}</p>
            )}
          </div>
        </div>

        <div className="flex flex-col justify-center items-center w-full mt-2">
          <h3 className="text-sm font-medium">Login Information</h3>
          <div className="h-px bg-border my-2"></div>
        </div>

        <div className="flex flex-col sm:flex-row items-start gap-4 w-full">
          <Label htmlFor="reg-username" className="min-w-20 text-right pt-2 sm:w-auto">
            Username
          </Label>
          <div className="flex-1 w-full">
            <Input
              id="reg-username"
              placeholder="Choose a username (4-30 chars)"
              className={`${errors.username && touched.username ? "border-red-500" : ""}`}
              value={regData.username}
              onChange={handleRegDataChange}
              onBlur={() => handleBlur("username")}
              required
              maxLength={30}
            />
            {errors.username && touched.username && (
              <p className="text-xs text-red-500 mt-1">{errors.username}</p>
            )}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-start gap-4 w-full">
          <Label htmlFor="reg-password" className="min-w-20 text-right pt-2 sm:w-auto">
            Password
          </Label>
          <div className="flex-1">
            <div className="relative">
              <Input
                id="reg-password"
                type={passwordVisible ? "text" : "password"}
                placeholder="Create password"
                className={`${errors.password && touched.password ? "border-red-500" : ""} pr-12`}
                value={regData.password}
                onChange={handleRegDataChange}
                onBlur={() => handleBlur("password")}
                required
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-7 px-2 text-xs"
                onClick={() => setPasswordVisible(!passwordVisible)}
                aria-label={passwordVisible ? "Hide password" : "Show password"}
              >
                {passwordVisible ? "Hide" : "Show"}
              </Button>
            </div>
            {errors.password && touched.password && (
              <p className="text-xs text-red-500 mt-1">{errors.password}</p>
            )}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-start gap-4 w-full">
          <Label htmlFor="confirm-password" className="min-w-20 text-right pt-2 sm:w-auto">
            Confirm
          </Label>
          <div className="flex-1">
            <div className="relative">
              <Input
                id="confirm-password"
                type={confirmPasswordVisible ? "text" : "password"}
                placeholder="Confirm password"
                className={`${errors.confirmPassword && touched.confirmPassword ? "border-red-500" : ""} pr-12`}
                value={confirmPassword}
                onChange={handleConfirmPasswordChange}
                onBlur={() => handleBlur("confirmPassword")}
                required
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-7 px-2 text-xs"
                onClick={() => setConfirmPasswordVisible(!confirmPasswordVisible)}
                aria-label={confirmPasswordVisible ? "Hide password" : "Show password"}
              >
                {confirmPasswordVisible ? "Hide" : "Show"}
              </Button>
            </div>
            {errors.confirmPassword && touched.confirmPassword && (
              <p className="text-xs text-red-500 mt-1">{errors.confirmPassword}</p>
            )}
          </div>
        </div>
      </div>
      
      {/* Display API error or prop error */}
      {(apiError || error) && (
        <div className="w-full text-center py-2 px-4 text-destructive text-sm">
          {apiError || error}
        </div>
      )}
      
      <DialogDescription className="flex flex-row justify-center items-center">
        <div>Already have an account?</div>
        <Button type="button" variant="link" onClick={onToggleMode}>Log In</Button>
      </DialogDescription>
      
      <DialogFooter className="flex flex-col items-center">
        <Button className="w-full" type="submit" disabled={isLoading || registrationStatus === 'loading'}>
          {isLoading || registrationStatus === 'loading' ? "Registering..." : "Register"}
        </Button>
      </DialogFooter>
    </form>
  );
}
