/**
 * API utilities for data fetching
 *
 * Usage examples:
 *
 * // Basic API call without authentication
 * const data = await apiAideMoi.get('/public-endpoint');
 *
 * // API call with manual authentication
 * const data = await apiAideMoi.get('/protected-endpoint', {
 *   useAuth: true // Automatically includes Bearer token from localStorage
 * });
 *
 * // API call with automatic authentication (recommended for protected routes)
 * const data = await authApiAideMoi.get('/protected-endpoint');
 */

import { HttpMethod } from './interface';

// Base configuration for API calls
export const API_CONFIG = {
  baseURL: process.env.NEXT_PUBLIC_API_URL || '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
};

// Custom error class for API errors
export class APIError extends Error {
  constructor(message: string, public status?: number, public code?: string) {
    super(message);
    this.name = 'APIError';
  }
}

// Request options interface
export interface RequestOptions {
  method?: HttpMethod;
  headers?: Record<string, string>;
  body?: unknown;
  timeout?: number;
  cache?: RequestCache;
  useAuth?: boolean; // If true, automatically include Bearer token from localStorage
}

/**
 * Generic fetch wrapper with error handling and type safety
 */
async function apiRequest<T extends object = object>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const {
    method = 'GET',
    headers = {},
    body,
    timeout = API_CONFIG.timeout,
    cache = 'no-cache',
    useAuth = false,
  } = options;

  const url = endpoint.startsWith('http')
    ? endpoint
    : `${API_CONFIG.baseURL}${endpoint}`;

  // Prepare headers
  const requestHeaders: Record<string, string> = {
    ...API_CONFIG.headers,
    ...headers,
  };

  // Automatically add Bearer token if useAuth is true
  if (useAuth && typeof window !== 'undefined') {
    const token =
      localStorage.getItem('token') ||
      localStorage.getItem('authToken') ||
      localStorage.getItem('accessToken');
    if (token) {
      requestHeaders.Authorization = `Bearer ${token}`;
    }
  }

  const config: RequestInit = {
    method,
    headers: requestHeaders,
    cache,
  };

  if (body && method !== 'GET') {
    config.body = JSON.stringify(body);
  }

  // Add timeout using AbortController
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...config,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new APIError(
        `HTTP error! status: ${response.status}`,
        response.status
      );
    }

    const data = await response.json();
    return data;
  } catch (error) {
    clearTimeout(timeoutId);

    if (error instanceof APIError) {
      throw error;
    }

    if (error instanceof Error && error.name === 'AbortError') {
      throw new APIError('Request timeout', 408, 'TIMEOUT');
    }

    const message =
      error instanceof Error ? error.message : 'An unexpected error occurred';
    throw new APIError(message, 500, 'UNKNOWN_ERROR');
  }
}

/**
 * Convenience methods for common HTTP operations
 */
export const apiAideMoi = {
  get: <T extends object>(
    endpoint: string,
    options?: Omit<RequestOptions, 'method'>
  ): Promise<T> => apiRequest<T>(endpoint, { ...options, method: 'GET' }),

  post: <T extends object>(
    endpoint: string,
    body?: unknown,
    options?: Omit<RequestOptions, 'method' | 'body'>
  ) => apiRequest<T>(endpoint, { ...options, method: 'POST', body }),

  put: <T extends object>(
    endpoint: string,
    body?: unknown,
    options?: Omit<RequestOptions, 'method' | 'body'>
  ) => apiRequest<T>(endpoint, { ...options, method: 'PUT', body }),

  delete: <T extends object>(
    endpoint: string,
    options?: Omit<RequestOptions, 'method'>
  ) => apiRequest<T>(endpoint, { ...options, method: 'DELETE' }),

  patch: <T extends object>(
    endpoint: string,
    body?: unknown,
    options?: Omit<RequestOptions, 'method' | 'body'>
  ) => apiRequest<T>(endpoint, { ...options, method: 'PATCH', body }),
};

/**
 * Authenticated API methods - automatically include Bearer token from localStorage
 */
export const authApiAideMoi = {
  get: <T extends object>(
    endpoint: string,
    options?: Omit<RequestOptions, 'method' | 'useAuth'>
  ): Promise<T> =>
    apiRequest<T>(endpoint, { ...options, method: 'GET', useAuth: true }),

  post: <T extends object>(
    endpoint: string,
    body?: unknown,
    options?: Omit<RequestOptions, 'method' | 'body' | 'useAuth'>
  ) =>
    apiRequest<T>(endpoint, {
      ...options,
      method: 'POST',
      body,
      useAuth: true,
    }),

  put: <T extends object>(
    endpoint: string,
    body?: unknown,
    options?: Omit<RequestOptions, 'method' | 'body' | 'useAuth'>
  ) =>
    apiRequest<T>(endpoint, { ...options, method: 'PUT', body, useAuth: true }),

  delete: <T extends object>(
    endpoint: string,
    options?: Omit<RequestOptions, 'method' | 'useAuth'>
  ) => apiRequest<T>(endpoint, { ...options, method: 'DELETE', useAuth: true }),

  patch: <T extends object>(
    endpoint: string,
    body?: unknown,
    options?: Omit<RequestOptions, 'method' | 'body' | 'useAuth'>
  ) =>
    apiRequest<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body,
      useAuth: true,
    }),
};
