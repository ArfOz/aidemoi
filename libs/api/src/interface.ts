import { Static } from '@sinclair/typebox';
import {
  ApiResponseSchema,
  ApiErrorSchema,
  LoginRequestSchema,
  LoginSuccessResponseSchema,
  RegisterRequestSchema,
  RegisterSuccessResponseSchema,
  RefreshTokenSuccessResponseSchema,
  ProfileSuccessResponseSchema,
  RefreshTokenRequestSchema,
  LogoutSuccessResponseSchema,
  TokenSchema,
  CategoryUpsertRequestSchema,
  CategoryUpsertSuccessResponseSchema,
  SubcategoryUpsertRequestSchema,
  SubcategoryUpsertSuccessResponseSchema,
  CategoriesListSuccessResponseSchema,
  CategoryGetRequestSchema,
  CategoryDetailSuccessResponseSchema,
  CategoriesListRequestSchema,
} from './schema';

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

export type ApiResponseType = Static<typeof ApiResponseSchema>;

export type LoginSuccessResponseType = Static<
  typeof LoginSuccessResponseSchema
>;
export type LoginRequestType = Static<typeof LoginRequestSchema>;

export type ApiErrorResponseType = Static<typeof ApiErrorSchema>;

export type LoginResponseType = LoginSuccessResponseType | ApiErrorResponseType;

export type RegisterRequestType = Static<typeof RegisterRequestSchema>;
export type RegisterSuccessResponseType = Static<
  typeof RegisterSuccessResponseSchema
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
export type CategoryUpsertRequest = Static<typeof CategoryUpsertRequestSchema>;

export type CategoriesListRequest = Static<typeof CategoriesListRequestSchema>;

export type CategoryUpsertSuccessResponse = Static<
  typeof CategoryUpsertSuccessResponseSchema
>;

export type SubcategoryUpsertRequest = Static<
  typeof SubcategoryUpsertRequestSchema
>;

export type SubcategoryUpsertSuccessResponse = Static<
  typeof SubcategoryUpsertSuccessResponseSchema
>;

export type CategoriesListSuccessResponse = Static<
  typeof CategoriesListSuccessResponseSchema
>;

export type CategoryGetRequest = Static<typeof CategoryGetRequestSchema>;

export type CategoryGetDetailSuccessResponse = Static<
  typeof CategoryDetailSuccessResponseSchema
>;
