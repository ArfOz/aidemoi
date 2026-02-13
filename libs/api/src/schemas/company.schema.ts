import { Static, Type } from '@sinclair/typebox';
import { ApiResponseSuccessSchema } from './schema';
import { TokenSchema } from './auth.schema';

export const RegisterCompanyRequestSchema = Type.Object({
  name: Type.String(),
  email: Type.String({ format: 'email' }),
  password: Type.String(),
});
export const RegisterCompanyResponseSchema = Type.Object({
  id: Type.String(),
  name: Type.String({ minLength: 1, maxLength: 255 }),
  email: Type.String({ format: 'email', maxLength: 255 }),
  // roles: Type.Optional(Type.String()),
});

export const RegisterCompanySuccessResponseSchema = ApiResponseSuccessSchema(
  RegisterCompanyResponseSchema
);

export const CompanySchema = Type.Object({
  id: Type.String(),
  name: Type.String(),
  email: Type.String(),
});

export const LoginCompanyResponseSchema = Type.Object({
  tokens: TokenSchema,
  company: CompanySchema,
});

export const ProfileCompanyResponseSchema = Type.Object({
  company: Type.Object({
    id: Type.String(),
    name: Type.String(),
    email: Type.String(),
    roles: Type.Optional(Type.String()),
  }),
});
