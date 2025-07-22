'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiAideMoi } from '@api';
import type {
  AppUser,
  Tokens,
  AppAuthResponse,
  LoginCredentials,
  RegisterData,
  LoginSuccessResponse,
  User,
} from '@api';
import { LoginResponse, ApiResponse } from '@api';

interface AuthContextType {
  user: AppUser | null;
  tokens: Tokens | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  updateUser: (data: Partial<AppUser>) => void;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [tokens, setTokens] = useState<Tokens | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isAuthenticated = user !== null && tokens !== null;

  // Load auth data from localStorage on mount
  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        const storedUser = localStorage.getItem('auth_user');
        const storedTokens = localStorage.getItem('auth_tokens');

        if (storedUser && storedTokens) {
          setUser(JSON.parse(storedUser));
          setTokens(JSON.parse(storedTokens));
        }
      }
    } catch (error) {
      console.error('Error loading auth data from localStorage:', error);
      // Clear corrupted data
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth_user');
        localStorage.removeItem('auth_tokens');
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = async (credentials: LoginCredentials) => {
    setIsLoading(true);
    setError(null);

    try {
      // API call to backend server using api library
      const response = await apiAideMoi.post<LoginSuccessResponse>(
        '/auth/login',
        credentials
      );

      console.log('Login response:', response);

      if (!response) {
        throw new Error('No response from server');
      }

      if (!response.success) {
        throw new Error(response.message || 'Login failed');
      }

      // The LoginResponse has tokens and user directly under data
      if (!response.data) {
        throw new Error('No data in response');
      }


      const { user, tokens } = response.data
  

      setUser(user);
      setTokens(tokens);

      localStorage.setItem('auth_user', JSON.stringify(user));
      localStorage.setItem('auth_tokens', JSON.stringify(tokens));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: RegisterData) => {
    setIsLoading(true);
    setError(null);

    try {
      // API call to backend server using api library
      const response = await apiAideMoi.post<AppAuthResponse>(
        '/auth/register',
        data
      );

      if (!response.success || !response.data) {
        const errorMessage =
          response.error ?? response.message ?? 'Registration failed';
        throw new Error(errorMessage);
      }

      const { user: userData, tokens: tokenData } = response.data;

      setUser(userData);
      setTokens(tokenData);
      localStorage.setItem('auth_user', JSON.stringify(userData));
      localStorage.setItem('auth_tokens', JSON.stringify(tokenData));
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Registration failed';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setTokens(null);
    setError(null);
    localStorage.removeItem('auth_user');
    localStorage.removeItem('auth_tokens');
  };

  const updateUser = (data: Partial<AppUser>) => {
    if (user) {
      const updatedUser = { ...user, ...data };
      setUser(updatedUser);
      localStorage.setItem('auth_user', JSON.stringify(updatedUser));
    }
  };

  const clearError = () => {
    setError(null);
  };

  const value: AuthContextType = {
    user,
    tokens,
    isAuthenticated,
    isLoading,
    error,
    login,
    register,
    logout,
    updateUser,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
};
