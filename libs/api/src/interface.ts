// Base API Response interface
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  // timestamp: string;
  // statusCode: number;
}

// Base API Request interface
export interface ApiRequest {
  headers?: Record<string, string>;
  params?: Record<string, any>;
  query?: Record<string, any>;
}

// Pagination interfaces
export interface PaginationRequest {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginationResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Error interfaces
export interface ApiError {
  code: string;
  message: string;
  field?: string;
  details?: any;
}

export interface ValidationError extends ApiError {
  field: string;
}

// HTTP method types
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

// Common API endpoints interface
export interface ApiEndpoint {
  method: HttpMethod;
  path: string;
  requiresAuth?: boolean;
}

// Authentication interfaces
export interface AuthRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken?: string;
  expiresAt: string;
}

// User interfaces
export interface User {
  id: string;
  email: string;
  name: string;
  // createdAt: string;
  // updatedAt: string;
}

// Extended User interface for the app
export interface AppUser extends User {
  id: string;
  username: string;
  email: string;
  role?: string[];
  // phone?: string;
  // avatar?: string;
  // isVerified?: boolean;
  // Customer specific fields
  // address?: string;
  // Repairman specific fields
  // specialties?: string[];
  // hourlyRate?: number;
  // availability?: {
  //   days: string[];
  //   hours: { start: string; end: string };
  // };
  // rating?: number;
  // completedJobs?: number;
}

export interface Tokens {
  token: string;
  refreshToken: string;
  expiresIn: string;
  expiresAt: string;
  refreshExpiresIn: string;
  refreshExpiresAt: string;
}

export interface AppAuthResponse {
  user: AppUser;
  tokens: Tokens;
}
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  role: 'customer' | 'repairman';
  phone?: string;
  specialties?: string[];
}

// Generic CRUD interfaces
export interface CreateRequest<T> {
  data: Omit<T, 'id' | 'createdAt' | 'updatedAt'>;
}

export interface UpdateRequest<T> {
  id: string;
  data: Partial<Omit<T, 'id' | 'createdAt' | 'updatedAt'>>;
}

export interface DeleteRequest {
  id: string;
}

export interface GetByIdRequest {
  id: string;
}

export interface ListRequest extends PaginationRequest {
  filters?: Record<string, any>;
  search?: string;
}

// API Client configuration
export interface ApiClientConfig {
  baseUrl: string;
  timeout?: number;
  defaultHeaders?: Record<string, string>;
  retryAttempts?: number;
}

export interface AuthSession {
  user: User;
  token: string;
  expiresAt: string;
}

export interface LoginSuccessResponse {
  success: true;
  message: string;
  data: {
    tokens: {
      token: string;
      refreshToken: string;
      expiresIn: string;
      expiresAt: string; // ISO string
      refreshExpiresIn: string;
      refreshExpiresAt: string; // ISO string
    };
    user: {
      id: string;
      username: string;
      email: string;
      roles?: string[];
    };
  };
}

export interface LoginErrorResponse {
  success: false;
  error: {
    message: string;
    statusCode: number;
  };
}

export type LoginResponse = LoginSuccessResponse | LoginErrorResponse;
