import { Static } from '@sinclair/typebox';
import {
  LoginErrorResponseSchema,
  LoginRequestSchema,
  LoginSuccessResponseSchema,
  RegisterErrorResponseSchema,
  RegisterRequestSchema,
  RegisterSuccessResponseSchema,
} from './schema';

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

export interface ApiError {
  code: string;
  message: string;
  field?: string;
  details?: any;
}

export interface ApiResponse<T extends object = any> {
  success: boolean;
  data?: T;
  error?: ApiError;
  message?: string;
}

// --- TypeScript interfaces for frontend/backend ---
export type LoginRequest = Static<typeof LoginRequestSchema>;
export type LoginSuccessResponseType = Static<
  typeof LoginSuccessResponseSchema
>;
export type LoginErrorResponseType = Static<typeof LoginErrorResponseSchema>;

export type RegisterRequest = Static<typeof RegisterRequestSchema>;
export type RegisterSuccessResponseType = Static<
  typeof RegisterSuccessResponseSchema
>;

export type RegisterErrorResponseType = Static<
  typeof RegisterErrorResponseSchema
>;
