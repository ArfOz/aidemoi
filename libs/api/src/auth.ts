/**
 * Authentication utilities for token management and API requests
 */

import { API_CONFIG } from './api';
import { User } from './interface';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: string;
}

// export interface User {
//   id: number
//   username: string
//   email: string
//   createdAt: string
//   updatedAt: string
// }

/**
 * Get stored authentication tokens from localStorage
 */
export const getStoredTokens = (): AuthTokens | null => {
  if (typeof window === 'undefined') return null;

  try {
    const storedTokens = localStorage.getItem('auth_tokens');
    return storedTokens ? JSON.parse(storedTokens) : null;
  } catch {
    return null;
  }
};

/**
 * Get stored user data from localStorage
 */
export const getStoredUser = (): User | null => {
  if (typeof window === 'undefined') return null;

  try {
    const storedUser = localStorage.getItem('auth_user');
    return storedUser ? JSON.parse(storedUser) : null;
  } catch {
    return null;
  }
};

/**
 * Get authorization header with access token
 */
export const getAuthHeader = (): Record<string, string> => {
  const tokens = getStoredTokens();

  if (!tokens?.accessToken) {
    return {};
  }

  return {
    Authorization: `Bearer ${tokens.accessToken}`,
  };
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = (): boolean => {
  const tokens = getStoredTokens();
  return !!tokens?.accessToken;
};

/**
 * Enhanced API request with automatic token inclusion
 */
export const authenticatedRequest = async <T = unknown>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
  const url = endpoint.startsWith('http')
    ? endpoint
    : `${API_CONFIG.baseURL}${endpoint}`;

  const authHeaders = getAuthHeader();

  const config: RequestInit = {
    ...options,
    headers: {
      ...API_CONFIG.headers,
      ...authHeaders,
      ...options.headers,
    },
  };

  const response = await fetch(url, config);

  if (!response.ok) {
    // Handle token expiration
    if (response.status === 401) {
      // Clear invalid tokens
      localStorage.removeItem('auth_tokens');
      localStorage.removeItem('auth_user');
      // Redirect to login page
      window.location.href = '/login';
    }

    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
};

/**
 * Clear all authentication data
 */
export const clearAuthData = (): void => {
  if (typeof window === 'undefined') return;

  localStorage.removeItem('auth_tokens');
  localStorage.removeItem('auth_user');
};
