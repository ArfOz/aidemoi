import { Type, TSchema } from '@sinclair/typebox';

export const ErrorSchema = Type.Object({
  code: Type.Number(),
  message: Type.String(),
  // field: Type.Optional(Type.String()),
  // details: Type.Optional(Type.Any()),
});

export const ApiResponseSuccessSchema = <T extends TSchema>(dataSchema: T) =>
  Type.Object({
    success: Type.Literal(true),
    message: Type.String(),
    data: dataSchema,
  });

export const ApiResponseErrorSchema = Type.Object({
  success: Type.Literal(false),
  error: ErrorSchema,
});
