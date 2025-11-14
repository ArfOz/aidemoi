// apiClient.ts
import { API_CONFIG, APIError, RequestOptions } from './apiConfig';
import { ApiErrorResponseType } from './interface';

/**
 * JWT decode helper
 */
function decodeJwt(token: string): { exp?: number } | null {
  try {
    const parts = token.split('.');
    if (parts.length < 2) return null;
    const payload = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const json = decodeURIComponent(
      atob(payload)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(json);
  } catch {
    return null;
  }
}

/**
 * Generic fetch wrapper with type-safe response
 */
async function apiRequest<TData>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<TData | ApiErrorResponseType> {
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

  const requestHeaders: Record<string, string> = {
    ...API_CONFIG.headers,
    ...headers,
  };

  if (useAuth && typeof window !== 'undefined') {
    const token =
      localStorage.getItem('token') ||
      localStorage.getItem('authToken') ||
      localStorage.getItem('accessToken');

    if (token) {
      // 🔹 Token expiry kontrolü
      const payload = decodeJwt(token);
      const nowSec = Math.floor(Date.now() / 1000);
      if (payload?.exp && payload.exp <= nowSec) {
        console.warn('Access token expired — removing from storage');
        localStorage.removeItem('token');
        localStorage.removeItem('authToken');
        localStorage.removeItem('accessToken');
        throw new APIError('Token expired', 401, 'TOKEN_EXPIRED');
      }

      requestHeaders.Authorization = `Bearer ${token}`;
    }
  }

  const config: RequestInit = { method, headers: requestHeaders, cache };
  if (body && method !== 'GET') config.body = JSON.stringify(body);

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, { ...config, signal: controller.signal });
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new APIError(
        `HTTP error! status: ${response.status}`,
        response.status
      );
    }

    const data = await response.json();
    return data as TData | ApiErrorResponseType;
  } catch (err) {
    clearTimeout(timeoutId);

    if (err instanceof APIError) throw err;
    if (err instanceof Error && err.name === 'AbortError')
      throw new APIError('Request timeout', 408, 'TIMEOUT');

    const message =
      err instanceof Error ? err.message : 'An unexpected error occurred';
    throw new APIError(message, 500, 'UNKNOWN_ERROR');
  }
}

/**
 * Public API wrapper
 */
export const apiAideMoi = {
  get: <TData>(endpoint: string, options?: Omit<RequestOptions, 'method'>) =>
    apiRequest<TData>(endpoint, { ...options, method: 'GET' }),

  post: <TData>(
    endpoint: string,
    body?: unknown,
    options?: Omit<RequestOptions, 'method' | 'body'>
  ) => apiRequest<TData>(endpoint, { ...options, method: 'POST', body }),

  put: <TData>(
    endpoint: string,
    body?: unknown,
    options?: Omit<RequestOptions, 'method' | 'body'>
  ) => apiRequest<TData>(endpoint, { ...options, method: 'PUT', body }),

  patch: <TData>(
    endpoint: string,
    body?: unknown,
    options?: Omit<RequestOptions, 'method' | 'body'>
  ) => apiRequest<TData>(endpoint, { ...options, method: 'PATCH', body }),

  delete: <TData>(endpoint: string, options?: Omit<RequestOptions, 'method'>) =>
    apiRequest<TData>(endpoint, { ...options, method: 'DELETE' }),
};
