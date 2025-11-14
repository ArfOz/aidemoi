import { Static, Type } from '@sinclair/typebox';
import { ApiResponseSuccessSchema } from './schema';

export const LoginRequestSchema = Type.Object({
  email: Type.String({ format: 'email' }),
  password: Type.String(),
});

export const TokenSchema = Type.Object({
  token: Type.String(),
  refreshToken: Type.String(),
  expiresIn: Type.String(),
  expiresAt: Type.String(),
  refreshExpiresIn: Type.String(),
  refreshExpiresAt: Type.String(),
});

export type TokenType = Static<typeof TokenSchema>;

export const UserSchema = Type.Object({
  id: Type.String(),
  username: Type.String(),
  email: Type.String(),
});
export const RegisterRequestSchema = Type.Object({
  username: Type.String(),
  email: Type.String({ format: 'email' }),
  password: Type.String(),
});

export const RefreshTokenRequestSchema = Type.Object({
  refreshToken: Type.String(),
});

export const LogoutRequestSchema = Type.Object({
  refreshToken: Type.String(),
});

export const LoginResponseSchema = Type.Object({
  tokens: TokenSchema,
  user: UserSchema,
});

export const LoginSuccessResponseSchema =
  ApiResponseSuccessSchema(LoginResponseSchema);

export const LogoutResponseSchema = Type.Object({
  loggedOut: Type.Boolean(),
});

export const LogoutSuccessResponseSchema =
  ApiResponseSuccessSchema(LogoutResponseSchema);

export const RefreshTokenResponseSchema = Type.Object({
  tokens: Type.Object({
    token: Type.String(),
    refreshToken: Type.String(),
    expiresIn: Type.String(),
    expiresAt: Type.String(),
    refreshExpiresIn: Type.String(),
    refreshExpiresAt: Type.String(),
  }),
});

export const RefreshTokenSuccessResponseSchema = ApiResponseSuccessSchema(
  RefreshTokenResponseSchema
);

export const ProfileResponseSchema = Type.Object({
  user: Type.Object({
    id: Type.String(),
    username: Type.String(),
    email: Type.String(),
    roles: Type.Optional(Type.Array(Type.String())),
  }),
});

export const ProfileSuccessResponseSchema = ApiResponseSuccessSchema(
  ProfileResponseSchema
);

export const RegisterResponseSchema = Type.Object({
  user: Type.Object({
    id: Type.String(),
    username: Type.String(),
    email: Type.String(),
    roles: Type.Optional(Type.Array(Type.String())),
  }),
});

export const RegisterSuccessResponseSchema = ApiResponseSuccessSchema(
  RegisterResponseSchema
);

export const AuthTokenSchema = Type.Object({
  headers: Type.Object({
    authorization: Type.String(),
  }),
  token: Type.String(),
});

export const AuthHeadersSchema = Type.Object({
  authorization: Type.String(),
});

export const IdParamsSchema = Type.Object({
  id: Type.String(),
});
