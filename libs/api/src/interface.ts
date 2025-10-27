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
  CategoryUpsertRequestSchema,
  CategoryUpsertSuccessResponseSchema,
  SubcategoryUpsertRequestSchema,
  SubcategoryUpsertSuccessResponseSchema,
  CategoriesListSuccessResponseSchema,
  CategoryGetRequestSchema,
  CategoryDetailSuccessResponseSchema,
  CategoriesListRequestSchema,
  QuestionAddSuccessResponseSchema,
  QuestionUpsertRequestSchema,
  QuestionGetSuccessResponseSchema,
  SubcategoryDetailRequestSchema,
  SubcategoryDetailSuccessResponseSchema,
  QuestionGetRequestSchema,
  AnswerAddSuccessResponseSchema,
  AnswersCreateRequestSchema,
  AnswerGetSuccessResponseSchema,
  AnswerGetRequestSchema,
  JobCreateRequestSchema,
  JobCreateSuccessResponseSchema,
  MyJobsGetRequestSchema,
  MyJobsGetSuccessResponseSchema,
  IdParamsSchema,
  MyJobDeleteSuccessResponseSchema,
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

export type QuestionGetRequest = Static<typeof QuestionGetRequestSchema>;

export type CategoryDetailSuccessResponse = Static<
  typeof CategoryDetailSuccessResponseSchema
>;

export type SubcategoryDetailSuccessResponse = Static<
  typeof SubcategoryDetailSuccessResponseSchema
>;

export type QuestionAddSuccessResponse = Static<
  typeof QuestionAddSuccessResponseSchema
>;

export type QuestionUpsertRequest = Static<typeof QuestionUpsertRequestSchema>;

export type QuestionGetSuccessResponse = Static<
  typeof QuestionGetSuccessResponseSchema
>;

export type SubcategoryGetRequest = Static<
  typeof SubcategoryDetailRequestSchema
>;

export type AnswersCreateRequest = Static<typeof AnswersCreateRequestSchema>;

export type AnswerAddSuccessResponse = Static<
  typeof AnswerAddSuccessResponseSchema
>;
export type AnswerGetSuccessResponse = Static<
  typeof AnswerGetSuccessResponseSchema
>;

export type AnswerGetRequest = Static<typeof AnswerGetRequestSchema>;

export type JobCreateRequest = Static<typeof JobCreateRequestSchema>;

export type JobCreateSuccessResponse = Static<
  typeof JobCreateSuccessResponseSchema
>;

export type MyJobsGetRequest = Static<typeof MyJobsGetRequestSchema>;

export type MyJobsGetSuccessResponse = Static<
  typeof MyJobsGetSuccessResponseSchema
>;

export type IdParamUrl = Static<typeof IdParamsSchema>;

export type MyJobDeleteSuccessResponse = Static<
  typeof MyJobDeleteSuccessResponseSchema
>;
