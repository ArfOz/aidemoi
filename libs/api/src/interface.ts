// Base API Response interface

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

export interface RegisterUserResponse {
  user: User;
  token: string;
  refreshToken?: string;
  expiresAt: string;
}

// User interfaces
export interface User {
  id: string;
  email: string;
  username: string;
  // createdAt: string;
  // updatedAt: string;
}

// Extended User interface for the app
export interface AppUser extends User {
  id: string;
  username: string;
  email: string;
  role?: string[]; // Ensure this is string[]
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

export interface ApiResponse<T extends object = any> {
  success: boolean;
  data?: T;
  error?: ApiError;
  message?: string;
}

export interface LoginData {
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
    roles?: string[]; // Ensure this is string[]
  };
}

// export type LoginResponse = ApiResponse<LoginSuccessResponse>;

import { Type, Static } from '@sinclair/typebox';

// --- TypeBox schemas ---
export const LoginRequestSchema = Type.Object({
  email: Type.String({ format: 'email' }),
  password: Type.String(),
});

export const LoginSuccessResponseSchema = Type.Object({
  success: Type.Boolean(),
  data: Type.Object({
    tokens: Type.Object({
      token: Type.String(),
      refreshToken: Type.String(),
      expiresIn: Type.String(),
      expiresAt: Type.String(),
      refreshExpiresIn: Type.String(),
      refreshExpiresAt: Type.String(),
    }),
    user: Type.Object({
      id: Type.String(),
      username: Type.String(),
      email: Type.String(),
      roles: Type.Optional(Type.Array(Type.String())),
    }),
  }),
  error: Type.Optional(
    Type.Object({
      statusCode: Type.Number(),
      message: Type.String(),
      field: Type.Optional(Type.String()),
      details: Type.Optional(Type.Any()),
    })
  ),
  message: Type.Optional(Type.String()),
});

export const LoginErrorResponseSchema = Type.Object({
  success: Type.Boolean(),
  error: Type.Object({
    statusCode: Type.Number(),
    message: Type.String(),
    field: Type.Optional(Type.String()),
    details: Type.Optional(Type.Any()),
  }),
  message: Type.Optional(Type.String()),
});

// --- TypeScript interfaces for frontend/backend ---
export type LoginRequest = Static<typeof LoginRequestSchema>;
export type LoginSuccessResponseType = Static<
  typeof LoginSuccessResponseSchema
>;
export type LoginErrorResponseType = Static<typeof LoginErrorResponseSchema>;
