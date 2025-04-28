import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff } from 'lucide-react';
import Logo from '@/components/Logo';
import { useUser } from '@/contexts/UserContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function AdminLogin() {
  const navigate = useNavigate();
  const [credential, setCredential] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loginStatus, setLoginStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  const { isLoggedIn, currentUser, login } = useUser();

  // If already logged in and has admin role, redirect to dashboard
  useEffect(() => {
    if (isLoggedIn && (
      currentUser?.role === 'admin' || 
      currentUser?.role === 'SUPER_ADMIN' || 
      currentUser?.role === 'accountant' || 
      currentUser?.role === 'warehouse'
    )) {
      navigate('/dashboard');
    }
  }, [isLoggedIn, currentUser, navigate]);

  // Reset error message after delay
  useEffect(() => {
    if (loginStatus === 'error') {
      const timer = setTimeout(() => {
        setLoginStatus('idle');
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [loginStatus]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginStatus('loading');
    setErrorMessage(null);
    
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
      
      if (response.ok) {
        // Login successful
        setLoginStatus('success');
        
        // Call the context login function to update app state
        await login(credential, password);
        
        // Check if user is admin and redirect accordingly
        if (data.user && (
          data.user.role === 'admin' || 
          data.user.role === 'SUPER_ADMIN' || 
          data.user.role === 'accountant' || 
          data.user.role === 'warehouse'
        )) {
          navigate('/dashboard');
        } else {
          // Not an admin user
          setLoginStatus('error');
          setErrorMessage('You do not have administrator privileges');
        }
      } else {
        // Login failed
        setLoginStatus('error');
        setErrorMessage(data.message || 'Invalid credentials');
      }
    } catch (error) {
      console.error('Login request failed:', error);
      setLoginStatus('error');
      setErrorMessage('An error occurred during login');
    }
  };

  return (
    <div className="flex justify-center items-center min-h-[80vh]">
      <Card className="w-[400px] shadow-lg">
        <CardHeader className="space-y-1 flex flex-col items-center">
          <Logo />
          <CardTitle className="text-2xl mt-4">Admin Login</CardTitle>
          <CardDescription>
            Log in to access the administrator dashboard
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="credential">Username/Email</Label>
              <Input
                id="credential"
                placeholder="Enter username or email"
                value={credential}
                onChange={(e) => setCredential(e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(prev => !prev)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {loginStatus === 'error' && (
              <div className="bg-destructive/15 text-destructive p-3 rounded-md text-sm">
                {errorMessage || 'Invalid credentials. Please try again.'}
              </div>
            )}
            
            <Button 
              className="w-full relative" 
              type="submit" 
              disabled={loginStatus === 'loading'}
            >
              {loginStatus === 'loading' ? (
                <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
              ) : 'Log In'}
            </Button>
            
            <div className="text-center mt-4">
              <Button 
                type="button" 
                variant="link" 
                onClick={() => navigate('/')}
                className="text-sm"
              >
                Return to home page
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}