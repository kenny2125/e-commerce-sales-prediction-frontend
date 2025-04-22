import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DialogDescription } from "@/components/ui/dialog";
import { Eye } from "lucide-react"; // Import Eye icon
import { SuccessOverlay } from "../SuccessOverlay"; // Corrected import path again

interface LoginFormProps {
  onToggleMode: () => void;
  isLoading: boolean;
  error: string | null;
  login: (credential: string, password: string) => Promise<void>;
}

export function LoginForm({ onToggleMode, isLoading, error, login }: LoginFormProps) {
  const navigate = useNavigate();
  const [credential, setCredential] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false); // new state for password visibility
  const [loginStatus, setLoginStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [loginResponse, setLoginResponse] = useState<any>(null);
  const [showSuccessOverlay, setShowSuccessOverlay] = useState(false);

  // Add useEffect to reset error state after a delay
  useEffect(() => {
    if (loginStatus === 'error') {
      const timer = setTimeout(() => {
        setLoginStatus('idle');
      }, 3000); // Reset after 3 seconds
      
      return () => clearTimeout(timer);
    }
  }, [loginStatus]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginStatus('loading');
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          credential: credential,
          password: password,
        }),
      });
      
      const data = await response.json();
      setLoginResponse(data);
      console.log('Login response:', data);
      
      if (response.ok) {
        console.log('Login successful');
        setLoginStatus('success');
        setShowSuccessOverlay(true); // Show the overlay
        
        // Add delay before completing login process
        setTimeout(async () => {
          // Call the context login function to update app state
          await login(credential, password);
          
          // Check if user is admin and redirect accordingly
          if (data.user && data.user.role === 'admin') {
            navigate('/dashboard');
          }
          
          // Hide success overlay after delay
          setTimeout(() => {
            setShowSuccessOverlay(false);
          }, 500);
        }, 2000);
      } else {
        console.error('Login failed:', data.message || 'Unknown error');
        setLoginStatus('error');
      }
    } catch (error) {
      console.error('Login request failed:', error);
      setLoginStatus('error');
      setLoginResponse({ error: 'Login request failed' });
    }
  };

  // Use the reusable SuccessOverlay component
  if (showSuccessOverlay) {
    return <SuccessOverlay message="Login Successful!" />;
  }

  return (
    <form onSubmit={handleLogin} className="flex flex-col gap-8">
      <div className="flex flex-col md:flex-row justify-between gap-8">
        <div className="flex flex-col align-top py-4 w-full gap-8">
          <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-4">
            <Label htmlFor="credential" className="text-left md:text-right">
              Username/Email
            </Label>
            <Input
              id="credential"
              placeholder="Enter username or email"
              className="w-full md:col-span-3"
              value={credential}
              onChange={(e) => setCredential(e.target.value)}
              required
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-4">
            <Label htmlFor="password" className="text-left md:text-right">
              Password
            </Label>
            <div className="relative w-full md:col-span-3">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter password"
                className="w-full"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button 
                type="button"
                onClick={() => setShowPassword(prev => !prev)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                <Eye className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <DialogDescription className="flex flex-col md:flex-row justify-center items-center">
        <div>Don't have an account?</div>
        <Button type="button" variant="link" onClick={onToggleMode}>Create New Account</Button>
      </DialogDescription>
      
      <div className="flex flex-col w-full mt-2 gap-4">
        {loginStatus === 'error' && (
          <div className="w-full text-center py-2 px-4 text-destructive text-sm ">
            Invalid credentials. Please try again.
          </div>
        )}
        {loginStatus === 'success' && !showSuccessOverlay && (
          <div className="w-full text-center py-2 px-4 text-green-600 text-sm ">
            Login successful!
          </div>
        )}
        
        <Button 
          className="w-full relative" 
          type="submit" 
          disabled={loginStatus === 'loading' || loginStatus === 'success'}
        >
          {loginStatus === 'loading' && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
          <span className={loginStatus === 'loading' ? "opacity-0" : "opacity-100"}>
            Log In
          </span>
        </Button>
      </div>
    </form>
  );
}
