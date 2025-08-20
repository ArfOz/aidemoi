import { Type } from '@sinclair/typebox';

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

export const LoginSuccessResponseSchema = Type.Object({
  tokens: TokenSchema,
  user: Type.Object({
    id: Type.String(),
    username: Type.String(),
    email: Type.String(),
    roles: Type.Optional(Type.Array(Type.String())),
  }),
});

export const LoginErrorResponseSchema = Type.Object({
  success: Type.Boolean(),
  error: Type.Object({
    code: Type.Number(),
    message: Type.String(),
    field: Type.Optional(Type.String()),
    details: Type.Optional(Type.Any()),
  }),
  message: Type.Optional(Type.String()),
});

export const RegisterRequestSchema = Type.Object({
  username: Type.String(),
  email: Type.String({ format: 'email' }),
  password: Type.String(),
});

export const RegisterSuccessResponseSchema = Type.Object({
  success: Type.Boolean(),
  data: Type.Object({
    user: Type.Object({
      id: Type.String(),
      username: Type.String(),
      email: Type.String(),
      roles: Type.Optional(Type.Array(Type.String())),
    }),
  }),
  error: Type.Optional(
    Type.Object({
      statusCode: Type.Number(),
      message: Type.String(),
      field: Type.Optional(Type.String()),
      details: Type.Optional(Type.Any()),
    })
  ),
  message: Type.Optional(Type.String()),
});

export const RegisterErrorResponseSchema = Type.Object({
  success: Type.Boolean(),
  error: Type.Object({
    statusCode: Type.Number(),
    message: Type.String(),
    field: Type.Optional(Type.String()),
    details: Type.Optional(Type.Any()),
  }),
  message: Type.Optional(Type.String()),
});

// Profile success schema (ApiResponse<{ user: ... }>)
export const ProfileSuccessResponseSchema = Type.Object({
  success: Type.Boolean(),
  message: Type.Optional(Type.String()),
  data: Type.Object({
    user: Type.Object({
      id: Type.String(),
      username: Type.String(),
      email: Type.String(),
      roles: Type.Optional(Type.Array(Type.String())),
    }),
  }),
  error: Type.Optional(
    Type.Object({
      statusCode: Type.Number(),
      message: Type.String(),
      field: Type.Optional(Type.String()),
      details: Type.Optional(Type.Any()),
    })
  ),
});

export const RefreshTokenRequestSchema = Type.Object({
  refreshToken: Type.String(),
});
export const RefreshTokenSuccessResponseSchema = Type.Object({
  success: Type.Boolean(),
  message: Type.Optional(Type.String()),
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
  error: Type.Optional(
    Type.Object({
      statusCode: Type.Number(),
      message: Type.String(),
      field: Type.Optional(Type.String()),
      details: Type.Optional(Type.Any()),
    })
  ),
});

// Logout success schema (ApiResponse<{ loggedOut: boolean }>)
export const LogoutSuccessResponseSchema = Type.Object({
  success: Type.Boolean(),
  message: Type.Optional(Type.String()),
  data: Type.Object({
    loggedOut: Type.Boolean(),
  }),
  error: Type.Optional(
    Type.Object({
      statusCode: Type.Number(),
      message: Type.String(),
      field: Type.Optional(Type.String()),
      details: Type.Optional(Type.Any()),
    })
  ),
});

export const LogoutRequestSchema = Type.Object({
  refreshToken: Type.String(),
});

export const ApiErrorSchema = Type.Object({
  code: Type.Number(),
  message: Type.String(),
  // field: Type.Optional(Type.String()),
  // details: Type.Optional(Type.Any()),
});

export const ApiResponseSchema = Type.Object({
  success: Type.Boolean(),
  data: Type.Optional(Type.Any()),
  error: Type.Optional(ApiErrorSchema),
  message: Type.Optional(Type.String()),
});
