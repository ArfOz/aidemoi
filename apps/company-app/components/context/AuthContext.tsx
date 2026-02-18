'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { isTokenExpired } from './tokenUtils';
import { apiAideMoi } from '@api';

interface CompanyUser {
  id: string;
  name: string;
  email: string;
  // normalize to `role` for components expecting single role
  role?: string;
  roles?: string;
  // optional profile fields used in dashboard
  rating?: number;
  completedJobs?: number;
}

interface TokenType {
  token: string;
  refreshToken?: string;
}

interface AuthContextType {
  user: CompanyUser | null;
  tokens: TokenType | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (credentials: { email: string; password: string }) => Promise<any>;
  register: (data: {
    name: string;
    email: string;
    password: string;
  }) => Promise<any>;
  logout: () => void;
  updateUser: (data: Partial<CompanyUser>) => void;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined)
    throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<CompanyUser | null>(null);
  const [tokens, setTokens] = useState<TokenType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isAuthenticated = user !== null && tokens !== null;

  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        const storedUser = localStorage.getItem('company_user');
        const storedTokens = localStorage.getItem('company_tokens');

        if (storedUser && storedTokens) {
          const parsedUser = JSON.parse(storedUser);
          const parsedTokens = JSON.parse(storedTokens);
          if (parsedTokens?.token && isTokenExpired(parsedTokens.token)) {
            localStorage.removeItem('company_user');
            localStorage.removeItem('company_tokens');
            setUser(null);
            setTokens(null);
          } else {
            setUser(parsedUser);
            setTokens(parsedTokens);
          }
        }
      }
    } catch {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('company_user');
        localStorage.removeItem('company_tokens');
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = async (credentials: { email: string; password: string }) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiAideMoi.post<any>(
        '/companies/login',
        credentials
      );
      if (!response || !(response as any).success)
        throw new Error('Login failed');
      const data = (response as any).data;
      const rawCompany = data.company as any;
      const u: CompanyUser = {
        id: rawCompany.id,
        name: rawCompany.name,
        email: rawCompany.email,
        roles: rawCompany.roles,
        role: rawCompany.roles || 'company',
        rating: rawCompany.rating ?? 0,
        completedJobs: rawCompany.completedJobs ?? 0,
      };
      const t: TokenType = data.tokens;
      setUser(u);
      setTokens(t);
      localStorage.setItem('company_user', JSON.stringify(u));
      localStorage.setItem('company_tokens', JSON.stringify(t));
      localStorage.setItem('company_token', t.token);
      return data;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Login failed';
      setError(msg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: {
    name: string;
    email: string;
    password: string;
  }) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiAideMoi.post<any>('/companies/register', data);
      if (!response || !(response as any).success)
        throw new Error('Registration failed');
      const newUser = (response as any).data;
      // normalize register response if needed
      const normalized = {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.roles || 'company',
      };
      setUser(normalized as CompanyUser);
      localStorage.setItem('company_user', JSON.stringify(newUser));
      return (response as any).data;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Registration failed';
      setError(msg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setTokens(null);
    setError(null);
    localStorage.removeItem('company_user');
    localStorage.removeItem('company_tokens');
    localStorage.removeItem('company_token');
  };

  const updateUser = (data: Partial<CompanyUser>) => {
    if (user) {
      const updatedUser = { ...user, ...data };
      setUser(updatedUser);
      localStorage.setItem('company_user', JSON.stringify(updatedUser));
    }
  };

  const clearError = () => setError(null);

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
