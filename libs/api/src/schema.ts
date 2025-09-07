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

export const ApiResponseSchema = Type.Object({
  success: Type.Boolean(),
  message: Type.String(),
  error: Type.Optional(
    Type.Object({
      code: Type.Number(),
      message: Type.String(),
    })
  ),
});

export const LoginSuccessResponseSchema = Type.Intersect([
  ApiResponseSchema,
  Type.Object({
    data: Type.Object({
      tokens: TokenSchema,
      user: UserSchema,
    }),
  }),
]);

// export type ApiResponseType = Static<typeof ApiResponseSchema>;
export const ApiErrorSchema = Type.Object({
  success: Type.Boolean(),
  data: Type.Optional(Type.Any()),
  error: Type.Optional(ErrorSchema),
  message: Type.Optional(Type.String()),
});

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

// Category upsert schemas/types
export const CategoryI18nSchema = Type.Object({
  locale: Type.String({ minLength: 2, maxLength: 8 }),
  name: Type.String({ minLength: 1, maxLength: 255 }),
  description: Type.Optional(Type.String()),
});
export const CategoryUpsertRequestSchema = Type.Object({
  icon: Type.Optional(Type.String({ maxLength: 16 })),
  sortOrder: Type.Optional(Type.Integer()),
  i18n: Type.Array(CategoryI18nSchema, { minItems: 1 }),
  id: Type.Optional(Type.String()), // for updates
});

export const CategoryUpsertSuccessResponseSchema = Type.Object({
  success: Type.Literal(true),
  message: Type.String(),
  data: Type.Object({
    category: Type.Object({
      id: Type.String(),
      created: Type.Boolean(),
      updatedLocales: Type.Array(Type.String()),
    }),
  }),
});

// Subcategory upsert schemas/types
export const SubcategoryI18nSchema = Type.Object({
  locale: Type.String({ minLength: 2, maxLength: 8 }),
  name: Type.String({ minLength: 1, maxLength: 255 }),
  description: Type.Optional(Type.String()),
});
export const SubcategoryUpsertRequestSchema = Type.Object({
  categoryId: Type.String({ minLength: 1, maxLength: 64 }),
  slug: Type.String({ minLength: 1, maxLength: 128 }),
  icon: Type.Optional(Type.String({ maxLength: 16 })),
  sortOrder: Type.Optional(Type.Integer()),
  i18n: Type.Array(SubcategoryI18nSchema, { minItems: 1 }),
});

export const SubcategoryUpsertSuccessResponseSchema = Type.Object({
  success: Type.Literal(true),
  message: Type.String(),
  data: Type.Object({
    subcategory: Type.Object({
      categoryId: Type.String(),
      slug: Type.String(),
      created: Type.Boolean(),
      updatedLocales: Type.Array(Type.String()),
    }),
  }),
});

// Categories GET response schemas/types
export const CategoryI18nOutSchema = CategoryI18nSchema; // same shape as request i18n

export const SubcategoryOutSchema = Type.Object({
  id: Type.Optional(Type.String()), // internal id may be provided
  categoryId: Type.Optional(Type.String()),
  slug: Type.String(),
  icon: Type.Union([Type.String(), Type.Null()]),
  sortOrder: Type.Optional(Type.Integer()),
  i18n: Type.Array(
    Type.Object({
      locale: Type.String({ minLength: 2, maxLength: 8 }),
      name: Type.String({ minLength: 1, maxLength: 255 }),
      description: Type.Optional(Type.Union([Type.String(), Type.Null()])),
    })
  ),
});

export const CategoryOutSchema = Type.Object({
  id: Type.String(),
  name: Type.Optional(Type.String()), // may include default/original name
  icon: Type.Union([Type.String(), Type.Null()]),
  sortOrder: Type.Optional(Type.Integer()),
  i18n: Type.Array(CategoryI18nOutSchema),
  subcategories: Type.Optional(Type.Array(SubcategoryOutSchema)),
});

export const CategoriesListSuccessResponseSchema = Type.Object({
  success: Type.Literal(true),
  message: Type.String(),
  data: Type.Object({
    categories: Type.Array(CategoryOutSchema),
  }),
});

export const CategoryGetRequestSchema = Type.Object({
  includeSubcategories: Type.Optional(Type.Boolean({ default: false })),
  languages: Type.Optional(
    Type.Array(Type.String({ minLength: 2, maxLength: 8 }))
  ),
});

export const CategoryDetailSuccessResponseSchema = Type.Object({
  success: Type.Literal(true),
  message: Type.String(),
  data: Type.Object({
    category: CategoryOutSchema,
    subcategories: Type.Optional(Type.Array(SubcategoryOutSchema)),
  }),
});
