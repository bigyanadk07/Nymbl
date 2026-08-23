// src/context/AuthContext.tsx

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AuthService from '../services/auth.services';
import { User } from '../types/auth';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, phone: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check auth status on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = AuthService.getStoredToken();
      if (token && AuthService.isAuthenticated()) {
        try {
          const userData = await AuthService.getCurrentUser();
          setUser(userData);
          setIsAuthenticated(true);
        } catch (error) {
          AuthService.logout();
          setUser(null);
          setIsAuthenticated(false);
        }
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  // Login
  const login = async (email: string, password: string): Promise<void> => {
    const response = await AuthService.login(email, password);
    setUser(response.user);
    setIsAuthenticated(true);
  };

  // Register
  const register = async (
    name: string, 
    email: string, 
    password: string, 
    phone: string
  ): Promise<void> => {
    const response = await AuthService.register(name, email, password, phone);
    setUser(response.user);
    setIsAuthenticated(true);
  };

  // Logout
  const logout = (): void => {
    AuthService.logout();
    setUser(null);
    setIsAuthenticated(false);
  };

  // Refresh user data
  const refreshUser = async (): Promise<void> => {
    if (AuthService.isAuthenticated()) {
      try {
        const userData = await AuthService.getCurrentUser();
        setUser(userData);
        setIsAuthenticated(true);
      } catch (error) {
        AuthService.logout();
        setUser(null);
        setIsAuthenticated(false);
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;