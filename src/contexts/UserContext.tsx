import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';

export type UserRole = "guest" | "customer" | "admin" | "SUPER_ADMIN" | "accountant" | "warehouse" | "editor" | "viewer";

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

  // Initialize by fetching current user via httpOnly cookie
  useEffect(() => {
    fetch(`${API_URL}/auth/profile`, {
      credentials: 'include'
    })
      .then(res => {
        if (res.ok) return res.json();
        throw new Error('Not authenticated');
      })
      .then(user => {
        setCurrentUser(user);
        setIsLoggedIn(true);
      })
      .catch(() => {
        setCurrentUser(null);
        setIsLoggedIn(false);
      })
      .finally(() => setIsInitialized(true));
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
         credentials: 'include',
         body: JSON.stringify({ credential, password }),
       });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }
      
      setCurrentUser(data.user);
      setIsLoggedIn(true);
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
         credentials: 'include',
         body: JSON.stringify(userData),
       });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }
      
      setCurrentUser(data.user);
      setIsLoggedIn(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    await fetch(`${API_URL}/auth/logout`, { method: 'POST', credentials: 'include' });
    setCurrentUser(null);
    setIsLoggedIn(false);
  };

  // Clear error
  const clearError = () => {
    setError(null);
  };

  // Authorization-aware fetch wrapper
  const authFetch = async (input: RequestInfo, init: RequestInit = {}): Promise<Response> => {
    return fetch(input, { ...init, credentials: 'include' });
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
