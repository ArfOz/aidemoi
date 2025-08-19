import { Static } from '@sinclair/typebox';
import {
  LoginErrorResponseSchema,
  LoginRequestSchema,
  LoginSuccessResponseSchema,
  LogoutSuccessResponseSchema,
  ProfileSuccessResponseSchema,
  RefreshTokenRequestSchema,
  RefreshTokenSuccessResponseSchema,
  RegisterErrorResponseSchema,
  RegisterRequestSchema,
  RegisterSuccessResponseSchema,
  TokenSchema,
} from './schema';

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

export interface ApiError {
  code: number;
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
export type LoginRequestType = Static<typeof LoginRequestSchema>;
export type LoginSuccessResponseType = Static<
  typeof LoginSuccessResponseSchema
>;
export type LoginErrorResponseType = Static<typeof LoginErrorResponseSchema>;

export type LoginResponseType =
  | LoginSuccessResponseType
  | LoginErrorResponseType;

export type RegisterRequestType = Static<typeof RegisterRequestSchema>;
export type RegisterSuccessResponseType = Static<
  typeof RegisterSuccessResponseSchema
>;

export type RegisterErrorResponseType = Static<
  typeof RegisterErrorResponseSchema
>;

export type ProfileSuccessResponseType = Static<
  typeof ProfileSuccessResponseSchema
>;

export type RefreshRequest = Static<typeof RefreshTokenRequestSchema>;
export type RefreshSuccessResponseType = Static<
  typeof RefreshTokenSuccessResponseSchema
>;

export type LogoutSuccessResponseType = Static<
  typeof LogoutSuccessResponseSchema
>;

export interface LogoutHeaders {
  authorization: string;
}

export type TokenType = Static<typeof TokenSchema>;

// export type LogoutRequest = Static<typeof LogoutRequestSchema>;
