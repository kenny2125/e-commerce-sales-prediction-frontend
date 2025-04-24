import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';

export type UserRole = "guest" | "customer" | "admin" | "editor" | "viewer";

export interface User {
  id: string;
  username: string;
  email: string;
  first_name?: string;
  last_name?: string;
  role: UserRole;
}

interface UserContextType {
  currentUser: User | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  isInitialized: boolean; // Add this flag to track initialization
  error: string | null;
  login: (credential: string, password: string) => Promise<void>;
  register: (userData: RegistrationData) => Promise<void>;
  logout: () => void;
  clearError: () => void;
  authFetch: (input: RequestInfo, init?: RequestInit) => Promise<Response>;
}

export interface RegistrationData {
  username: string;
  email: string;
  password: string;
  first_name?: string;
  last_name?: string;
  gender?: string;
  address?: string;
  phone?: string;
}

// API base URL
const API_URL = `${import.meta.env.VITE_API_URL}/api`;

const UserContext = createContext<UserContextType | undefined>(undefined);

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}

interface UserProviderProps {
  children: ReactNode;
}

export function UserProvider({ children }: UserProviderProps) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isInitialized, setIsInitialized] = useState<boolean>(false); // Add initialization state
  const [error, setError] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);

  // Utility to validate JWT expiration
  const isTokenValid = (token: string): boolean => {
    try {
      const { exp } = JSON.parse(atob(token.split('.')[1]));
      return exp * 1000 > Date.now();
    } catch {
      return false;
    }
  };

  // Check for saved auth on mount
  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    let logoutTimer: number;

    if (savedToken && savedUser) {
      if (!isTokenValid(savedToken)) {
        logout();
      } else {
        setToken(savedToken);
        setCurrentUser(JSON.parse(savedUser));
        setIsLoggedIn(true);
        const { exp } = JSON.parse(atob(savedToken.split('.')[1]));
        const timeout = exp * 1000 - Date.now();
        logoutTimer = window.setTimeout(() => logout(), timeout);
      }
    }

    setIsInitialized(true); // Mark as initialized

    return () => {
      if (logoutTimer) {
        clearTimeout(logoutTimer);
      }
    };
  }, []);

  // Login function
  const login = async (credential: string, password: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ credential, password }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }
      
      // Save auth data
      setToken(data.token);
      setCurrentUser(data.user);
      setIsLoggedIn(true);
      
      // Store in localStorage
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  // Register function
  const register = async (userData: RegistrationData) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }
      
      // Save auth data
      setToken(data.token);
      setCurrentUser(data.user);
      setIsLoggedIn(true);
      
      // Store in localStorage
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    setCurrentUser(null);
    setIsLoggedIn(false);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  // Clear error
  const clearError = () => {
    setError(null);
  };

  // Authorization-aware fetch wrapper
  const authFetch = async (input: RequestInfo, init: RequestInit = {}): Promise<Response> => {
    if (!token || !isTokenValid(token)) {
      logout();
      return Promise.reject(new Error('Authentication token is missing or expired'));
    }
    const headers = {
      ...init.headers,
      Authorization: `Bearer ${token}`,
    };
    return fetch(input, { ...init, headers });
  };

  return (
    <UserContext.Provider 
      value={{ 
        currentUser, 
        isLoggedIn, 
        isLoading,
        isInitialized, // Provide initialization state
        error,
        login,
        register,
        logout,
        clearError,
        authFetch
      }}
    >
      {children}
    </UserContext.Provider>
  );
}
