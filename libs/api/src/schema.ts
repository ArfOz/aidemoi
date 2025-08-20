import { Type } from '@sinclair/typebox';

export const ErrorSchema = Type.Object({
  code: Type.Number(),
  message: Type.String(),
  // field: Type.Optional(Type.String()),
  // details: Type.Optional(Type.Any()),
});

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

export const ApiResponseSchema = Type.Object({
  success: Type.Boolean(),
  data: Type.Optional(Type.Any()),
  error: Type.Optional(ErrorSchema),
  message: Type.Optional(Type.String()),
});

export const ApiErrorSchema = Type.Object({
  success: Type.Boolean(),
  data: Type.Optional(Type.Any()),
  error: Type.Optional(ErrorSchema),
  message: Type.Optional(Type.String()),
});

export const LoginSuccessResponseSchema = Type.Intersect([
  ApiResponseSchema,
  Type.Object({
    data: Type.Object({
      tokens: TokenSchema,
      user: Type.Object({
        id: Type.String(),
        username: Type.String(),
        email: Type.String(),
        roles: Type.Optional(Type.Array(Type.String())),
      }),
    }),
  }),
]);

export const LogoutSuccessResponseSchema = Type.Intersect([
  ApiResponseSchema,
  Type.Object({
    data: Type.Object({
      loggedOut: Type.Boolean(),
    }),
  }),
]);

export const RefreshTokenSuccessResponseSchema = Type.Intersect([
  ApiResponseSchema,
  Type.Object({
    data: Type.Object({
      tokens: Type.Object({
        token: Type.String(),
        refreshToken: Type.String(),
        expiresIn: Type.String(),
        expiresAt: Type.String(),
        refreshExpiresIn: Type.String(),
        refreshExpiresAt: Type.String(),
      }),
    }),
  }),
]);

export const ProfileSuccessResponseSchema = Type.Intersect([
  ApiResponseSchema,
  Type.Object({
    data: Type.Object({
      user: Type.Object({
        id: Type.String(),
        username: Type.String(),
        email: Type.String(),
        roles: Type.Optional(Type.Array(Type.String())),
      }),
    }),
  }),
]);

export const RegisterSuccessResponseSchema = Type.Intersect([
  ApiResponseSchema,
  Type.Object({
    data: Type.Object({
      user: Type.Object({
        id: Type.String(),
        username: Type.String(),
        email: Type.String(),
        roles: Type.Optional(Type.Array(Type.String())),
      }),
    }),
  }),
]);
