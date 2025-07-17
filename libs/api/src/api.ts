/**
 * API utilities for data fetching
 */

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

// Generic API response type
export interface APIResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Request options interface
export interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: unknown;
  timeout?: number;
  cache?: RequestCache;
}

/**
 * Generic fetch wrapper with error handling and type safety
 */
async function apiRequest<T = unknown>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<APIResponse<T>> {
  const {
    method = 'GET',
    headers = {},
    body,
    timeout = API_CONFIG.timeout,
    cache = 'no-cache',
  } = options;

  const url = endpoint.startsWith('http')
    ? endpoint
    : `${API_CONFIG.baseURL}${endpoint}`;

  const config: RequestInit = {
    method,
    headers: {
      ...API_CONFIG.headers,
      ...headers,
    },
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

    console.log('response', response);

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
  get: <T>(endpoint: string, options?: Omit<RequestOptions, 'method'>) =>
    apiRequest<T>(endpoint, { ...options, method: 'GET' }),

  post: <T>(
    endpoint: string,
    body?: unknown,
    options?: Omit<RequestOptions, 'method' | 'body'>
  ) => apiRequest<T>(endpoint, { ...options, method: 'POST', body }),

  put: <T>(
    endpoint: string,
    body?: unknown,
    options?: Omit<RequestOptions, 'method' | 'body'>
  ) => apiRequest<T>(endpoint, { ...options, method: 'PUT', body }),

  delete: <T>(endpoint: string, options?: Omit<RequestOptions, 'method'>) =>
    apiRequest<T>(endpoint, { ...options, method: 'DELETE' }),

  patch: <T>(
    endpoint: string,
    body?: unknown,
    options?: Omit<RequestOptions, 'method' | 'body'>
  ) => apiRequest<T>(endpoint, { ...options, method: 'PATCH', body }),
};
