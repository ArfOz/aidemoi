import { Static, Type } from '@sinclair/typebox';
import { ApiResponseSuccessSchema } from './schema';

export const RegisterCompanyResponseSchema = Type.Object({
    id: Type.Integer(),
    name: Type.String({ minLength: 1, maxLength: 255 }),
    email: Type.String({ format: 'email', maxLength: 255 }),
    createdAt: Type.String({ format: 'date-time' }), 
    updatedAt: Type.String({ format: 'date-time' }), 
});

export const RegisterCompanySuccessResponseSchema =
  ApiResponseSuccessSchema(RegisterCompanyResponseSchema);