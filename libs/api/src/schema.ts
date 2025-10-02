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
  success: Type.Literal(false),
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
  id: Type.Optional(Type.Integer()),
  locale: Type.String({ minLength: 2, maxLength: 8 }),
  name: Type.String({ minLength: 1, maxLength: 255 }),
  description: Type.Union([Type.String(), Type.Null()]),
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

export const CategoriesListRequestSchema = Type.Object({
  includeSubcategories: Type.Optional(Type.Boolean({ default: false })),
  languages: Type.Optional(
    Type.Array(Type.String({ minLength: 2, maxLength: 8 }))
  ),
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

export const SubcategoryOutSchema = Type.Object({
  id: Type.Integer(),
  categoryId: Type.String(),
  slug: Type.String({ maxLength: 128 }),
  icon: Type.Union([Type.String({ maxLength: 16 }), Type.Null()]),
  sortOrder: Type.Integer({ default: 0 }),
  name: Type.Union([Type.String(), Type.Null()]),
  createdAt: Type.String({ format: 'date-time' }), // ✅ Fastify uyumlu
  updatedAt: Type.String({ format: 'date-time' }), // ✅ Fastify uyumlu
  i18n: Type.Array(
    Type.Object({
      locale: Type.String({ minLength: 2, maxLength: 8 }),
      name: Type.String({ minLength: 1, maxLength: 255 }),
      description: Type.Optional(Type.Union([Type.String(), Type.Null()])),
    })
  ),
});

export const CategoryDetailSchema = Type.Object({
  id: Type.String(),
  name: Type.String(),
  icon: Type.Union([Type.String(), Type.Null()]),
  sortOrder: Type.Integer({ default: 0 }), // Prisma default(0)
  i18n: Type.Array(CategoryI18nSchema),
  subcategories: Type.Array(SubcategoryOutSchema), // Prisma’da hep mevcut
  createdAt: Type.String({ format: 'date-time' }), // ✅ Fastify uyumlu
  updatedAt: Type.String({ format: 'date-time' }), // ✅ Fastify uyumlu
});

export const CategoryListSchema = Type.Object({
  id: Type.String(),
  name: Type.String(),
  icon: Type.Union([Type.String(), Type.Null()]),
  sortOrder: Type.Integer({ default: 0 }), // Prisma default(0)
  i18n: Type.Array(CategoryI18nSchema),
  createdAt: Type.String({ format: 'date-time' }), // ✅ Fastify uyumlu
  updatedAt: Type.String({ format: 'date-time' }), // ✅ Fastify uyumlu
});

export const CategoriesListSuccessResponseSchema = Type.Object({
  success: Type.Literal(true),
  message: Type.String(),
  data: Type.Object({
    categories: Type.Array(CategoryListSchema),
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
    category: CategoryDetailSchema,
  }),
});

export const SubcategoryDetailRequestSchema = Type.Object({
  includeSubcategories: Type.Optional(Type.Boolean({ default: false })),
  languages: Type.Optional(
    Type.Array(Type.String({ minLength: 2, maxLength: 8 }))
  ),
});

export const SubcategoryDetailSuccessResponseSchema = Type.Object({
  success: Type.Literal(true),
  message: Type.String(),
  data: Type.Object({
    subcategory: SubcategoryOutSchema,
  }),
});

export const QuestionAddSuccessResponseSchema = Type.Object({
  success: Type.Literal(true),
  message: Type.String(),
  data: Type.Object({
    questionId: Type.Integer(),
    submittedAt: Type.String({ format: 'date-time' }),
  }),
});

// add Question i18n schema
export const QuestionI18nSchema = Type.Object({
  id: Type.Optional(Type.Integer()),
  locale: Type.String({ minLength: 2, maxLength: 8 }),
  label: Type.String({ minLength: 1, maxLength: 255 }),
  description: Type.Optional(Type.Union([Type.String(), Type.Null()])),
});

// Option Translation Schema
export const OptionTranslationSchema = Type.Object({
  locale: Type.String({ minLength: 2, maxLength: 8 }),
  label: Type.String({ minLength: 1, maxLength: 255 }),
});

// Option Schema
export const OptionSchema = Type.Object({
  value: Type.String(),
  key: Type.Optional(Type.String()),
  sortOrder: Type.Optional(Type.Integer({ default: 0 })),
  meta: Type.Optional(Type.String()),
  translations: Type.Array(OptionTranslationSchema, { minItems: 1 }),
});

// Main Question Upsert Schema
export const QuestionUpsertRequestSchema = Type.Object({
  subcategoryId: Type.Integer(),
  type: Type.String({ minLength: 1, maxLength: 50 }),
  required: Type.Optional(Type.Boolean({ default: false })),
  sortOrder: Type.Optional(Type.Integer({ default: 0 })),
  isActive: Type.Optional(Type.Boolean({ default: true })),
  i18n: Type.Optional(Type.Array(QuestionI18nSchema, { minItems: 1 })),
  translations: Type.Array(QuestionI18nSchema, { minItems: 1 }),
  options: Type.Optional(Type.Array(OptionSchema)),
});

export const QuestionGetRequestSchema = Type.Object({
  includeInactive: Type.Optional(Type.Boolean({ default: false })),
  lang: Type.String({ minLength: 1, maxLength: 8 }),
});

export const QuestionGetSuccessResponseSchema = Type.Object({
  success: Type.Literal(true),
  message: Type.String(),
  data: Type.Object({
    // allow any shape for question to avoid serializer schema mismatch
    questions: Type.Any(),
  }),
});

// Questions helper removed — not used

// Question Update Request Schema (partial upsert)
export const QuestionUpdateRequestSchema = Type.Object({
  subcategoryId: Type.Optional(Type.Integer()),
  type: Type.Optional(Type.String({ minLength: 1, maxLength: 50 })),
  required: Type.Optional(Type.Boolean()),
  sortOrder: Type.Optional(Type.Integer()),
  isActive: Type.Optional(Type.Boolean()),
  translations: Type.Optional(
    Type.Array(
      Type.Object({
        locale: Type.String({ minLength: 2, maxLength: 8 }),
        label: Type.String({ minLength: 1, maxLength: 255 }),
        description: Type.Optional(Type.Union([Type.String(), Type.Null()])),
      }),
      { minItems: 1 }
    )
  ),
  options: Type.Optional(
    Type.Array(
      Type.Object({
        value: Type.String(),
        translations: Type.Optional(
          Type.Array(
            Type.Object({
              locale: Type.String({ minLength: 2, maxLength: 8 }),
              label: Type.String({ minLength: 1, maxLength: 255 }),
            }),
            { minItems: 1 }
          )
        ),
      }),
      { minItems: 1 }
    )
  ),
});

export const QuestionUpdateSuccessResponseSchema = Type.Object({
  success: Type.Literal(true),
  message: Type.String(),
  data: Type.Object({
    questionId: Type.Integer(),
    updatedAt: Type.String({ format: 'date-time' }),
  }),
});

export const AnswersCreateRequestSchema = Type.Object({
  answers: Type.Array(
    Type.Object({
      questionId: Type.Number(),
      optionId: Type.Optional(Type.Number()),
      textValue: Type.Optional(Type.String()),
      numberValue: Type.Optional(Type.Number()),
      dateValue: Type.Optional(Type.String()),
      inputLanguage: Type.Optional(Type.String()),
    })
  ),
});

export const AnswerAddSuccessResponseSchema = Type.Object({
  success: Type.Boolean(),
  message: Type.String(),
  data: Type.Object({
    answersCreated: Type.Number(),
    answers: Type.Array(
      Type.Object({
        answerId: Type.Number(),
        questionId: Type.Number(),
        submittedAt: Type.String(),
      })
    ),
  }),
});
