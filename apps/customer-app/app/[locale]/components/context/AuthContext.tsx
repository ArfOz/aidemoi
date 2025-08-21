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

      // Optional: set default Authorization for future calls
      try {
        (apiAideMoi as any).defaults ||= { headers: { common: {} } };
        (apiAideMoi as any).defaults.headers.common[
          'Authorization'
        ] = `Bearer ${tokens.token}`;
      } catch {
        console.error('Failed to set default Authorization header');
      }

      localStorage.setItem('auth_user', JSON.stringify(user));
      localStorage.setItem('auth_tokens', JSON.stringify(tokens));

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
