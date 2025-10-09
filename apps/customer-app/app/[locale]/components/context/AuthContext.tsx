'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  apiAideMoi,
  LoginRequestType,
  LoginSuccessResponseType,
  RegisterRequestType,
  RegisterSuccessResponseType,
  TokenType,
  User,
} from '@api';

interface AuthContextType {
  user: User | null;
  tokens: any | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (
    credentials: LoginRequestType
  ) => Promise<LoginSuccessResponseType['data']>;
  register: (
    data: RegisterRequestType
  ) => Promise<RegisterSuccessResponseType['data']>;
  logout: () => void;
  updateUser: (data: Partial<User>) => void;
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
  const [tokens, setTokens] = useState<TokenType | null>(null);
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
          const parsedUser = JSON.parse(storedUser);
          const parsedTokens = JSON.parse(storedTokens);
          setUser(parsedUser);
          setTokens(parsedTokens);

          // Ensure the main token is available for API calls
          if (parsedTokens.token) {
            localStorage.setItem('token', parsedTokens.token);
          }
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

  const login = async (credentials: LoginRequestType) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await apiAideMoi.post<LoginSuccessResponseType>(
        '/auth/login',
        credentials,
        { cache: 'no-store' } as any
      );

      if (!response.success) throw new Error(response.message);
      const { user, tokens } = response.data;

      setUser(user);
      setTokens(tokens);

      // Store tokens in localStorage for API calls
      localStorage.setItem('auth_user', JSON.stringify(user));
      localStorage.setItem('auth_tokens', JSON.stringify(tokens));
      // Store the main token for easy access by API calls
      localStorage.setItem('token', tokens.token);
      localStorage.setItem('refreshToken', tokens.refreshToken);

      return response.data; // return data so callers can do: const { tokens } = await login(...)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: RegisterRequestType) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await apiAideMoi.post<RegisterSuccessResponseType>(
        '/auth/register',
        data
      );

      if (!response.success || !response.data) {
        const errorMessage =
          typeof response.error === 'string'
            ? response.error
            : response.message ?? 'Registration failed';
        throw new Error(errorMessage);
      }

      const newUser = response.data.user; // sadece user var
      setUser(newUser);
      // tokens yok, yani oturum açılmayacak
      localStorage.setItem('auth_user', JSON.stringify(newUser));

      return response.data;
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
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
  };

  const updateUser = (data: Partial<User>) => {
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
