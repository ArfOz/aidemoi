// apiClient.ts
import { API_CONFIG, APIError, RequestOptions } from './apiConfig';
import { ApiErrorResponseType } from './interface';

/**
 * Generic fetch wrapper with type-safe response (no schema required)
 */
async function apiRequest<TData>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<
  { success: true; message: string; data: TData } | ApiErrorResponseType
> {
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
    if (token) requestHeaders.Authorization = `Bearer ${token}`;
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
    return data as
      | { success: true; message: string; data: TData }
      | ApiErrorResponseType;
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
 * Public API wrapper (no schema parameter needed)
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
