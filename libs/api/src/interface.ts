import { Static } from '@sinclair/typebox';
import {
  ApiResponseSchema,
  ApiErrorSchema,
  LoginRequestSchema,
  LoginSuccessResponseSchema,
  LoginErrorResponseSchema,
  RegisterRequestSchema,
  RegisterSuccessResponseSchema,
  RefreshTokenSuccessResponseSchema,
  RegisterErrorResponseSchema,
  ProfileSuccessResponseSchema,
  RefreshTokenRequestSchema,
  LogoutSuccessResponseSchema,
  TokenSchema,
} from './schema';

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

// Base (static) type from the runtime schema
type ApiResponseBase = Static<typeof ApiResponseSchema>;

// Generic ApiResponse with typed data payload
export type ApiResponse<T = unknown> = Omit<ApiResponseBase, 'data'> & {
  data?: T;
};

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
