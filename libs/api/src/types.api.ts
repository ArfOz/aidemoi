import type {
  Static,
  TIntersect,
  TObject,
  TLiteral,
  TString,
  TBoolean,
} from '@sinclair/typebox';
import { ApiResponseErrorSchema, ApiResponseSuccessSchema } from './schema';
// Generic API response types for frontend usage

export type ApiErrorResponse = Static<typeof ApiResponseErrorSchema>;
export type ApiSuccessResponse<T> = Static<typeof ApiResponseSuccessSchema> & {
  data: T;
};
export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;
