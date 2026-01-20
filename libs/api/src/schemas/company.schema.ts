import { Static, Type } from '@sinclair/typebox';
import { ApiResponseSuccessSchema } from './schema';

export const RegisterCompanyResponseSchema = Type.Object({
  id: Type.Integer(),
  name: Type.String({ minLength: 1, maxLength: 255 }),
  email: Type.String({ format: 'email', maxLength: 255 }),
});

export const RegisterCompanySuccessResponseSchema = ApiResponseSuccessSchema(
  RegisterCompanyResponseSchema
);
