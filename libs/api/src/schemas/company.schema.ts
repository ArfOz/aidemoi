import { Static, Type } from '@sinclair/typebox';
import { ApiResponseSuccessSchema } from './schema';

export const RegisterCompanyResponseSchema = Type.Object({
  id: Type.Integer(),
  name: Type.String({ minLength: 1, maxLength: 255 }),
  email: Type.String({ format: 'email', maxLength: 255 }),
  createdAt: Type.String({ format: 'date-time' }),
  updatedAt: Type.String({ format: 'date-time' }),
  description: Type.Union([Type.String({ maxLength: 1000 }), Type.Null()]),
  website: Type.Union([
    Type.String({ format: 'uri', maxLength: 255 }),
    Type.Null(),
  ]),
  phone: Type.Union([Type.String({ maxLength: 50 }), Type.Null()]),
  address: Type.Union([Type.String({ maxLength: 255 }), Type.Null()]),
  city: Type.Union([Type.String({ maxLength: 100 }), Type.Null()]),
  country: Type.Union([Type.String({ maxLength: 100 }), Type.Null()]),
  postalCode: Type.Union([Type.String({ maxLength: 20 }), Type.Null()]),
  employeeCount: Type.Union([Type.Integer({ minimum: 0 }), Type.Null()]),
  status: Type.String({ minLength: 1, maxLength: 50 }),
});

export const RegisterCompanySuccessResponseSchema = ApiResponseSuccessSchema(
  RegisterCompanyResponseSchema
);
