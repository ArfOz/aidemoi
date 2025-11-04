import { Type, Static, TSchema } from '@sinclair/typebox';

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

export const LoginSuccessResponseSchema = Type.Object({
  tokens: TokenSchema,
  user: UserSchema,
});

export const LogoutSuccessResponseSchema = Type.Object({
  loggedOut: Type.Boolean(),
});

export const RefreshTokenSuccessResponseSchema = Type.Object({
  tokens: Type.Object({
    token: Type.String(),
    refreshToken: Type.String(),
    expiresIn: Type.String(),
    expiresAt: Type.String(),
    refreshExpiresIn: Type.String(),
    refreshExpiresAt: Type.String(),
  }),
});

export const ProfileSuccessResponseSchema = Type.Object({
  user: Type.Object({
    id: Type.String(),
    username: Type.String(),
    email: Type.String(),
    roles: Type.Optional(Type.Array(Type.String())),
  }),
});

export const RegisterSuccessResponseSchema = Type.Object({
  user: Type.Object({
    id: Type.String(),
    username: Type.String(),
    email: Type.String(),
    roles: Type.Optional(Type.Array(Type.String())),
  }),
});

//Category area

// Category upsert schemas/types

export const CategoryUpsertSuccessResponseSchema = Type.Object({
  category: Type.Object({
    id: Type.String(),
    created: Type.Boolean(),
    updatedLocales: Type.Array(Type.String()),
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

export const SubcategoryUpsertSuccessResponseSchema = Type.Intersect([
  Type.Object({
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
  }),
]);

export const CategoryGetRequestSchema = Type.Object({
  includeSubcategories: Type.Optional(Type.Boolean({ default: false })),
  languages: Type.Optional(
    Type.Array(Type.String({ minLength: 2, maxLength: 8 }))
  ),
});

export const SubcategoryDetailRequestSchema = Type.Object({
  includeSubcategories: Type.Optional(Type.Boolean({ default: false })),
  languages: Type.Optional(
    Type.Array(Type.String({ minLength: 2, maxLength: 8 }))
  ),
});

// export const SubcategoryDetailSuccessResponseSchema = Type.Object({
//   subcategory: SubcategoryOutSchema,
// });

export const QuestionAddSuccessResponseSchema = Type.Object({
  questionId: Type.Integer(),
  submittedAt: Type.String({ format: 'date-time' }),
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
  // allow any shape for question to avoid serializer schema mismatch
  questions: Type.Any(),
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
  questionId: Type.Integer(),
  updatedAt: Type.String({ format: 'date-time' }),
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
  answersCreated: Type.Number(),
  answers: Type.Array(
    Type.Object({
      answerId: Type.Number(),
      questionId: Type.Number(),
      submittedAt: Type.String(),
    })
  ),
});

export const AnswerGetSuccessResponseSchema = Type.Object({
  answers: Type.Array(
    Type.Object({
      id: Type.Number(),
      questionId: Type.Number(),
      userId: Type.Number(),
      optionId: Type.Union([Type.Number(), Type.Null()]),
      textValue: Type.Union([Type.String(), Type.Null()]),
      numberValue: Type.Union([Type.Number(), Type.Null()]),
      inputLanguage: Type.Union([Type.String(), Type.Null()]),

      //These are any because of serializer issues after it will be fixed we can change it to string with date-time format
      createdAt: Type.Any(),
      dateValue: Type.Any(),
      updatedAt: Type.Any(),
      question: Type.Union([Type.Any(), Type.Null()]),
      option: Type.Union([Type.Any(), Type.Null()]),
    })
  ),
});

export const AnswerGetRequestSchema = Type.Object({
  lang: Type.Optional(Type.Union([Type.Literal('en'), Type.Literal('fr')])),
});

export const JobCreateRequestSchema = Type.Object({
  subcategoryId: Type.Number(),
  title: Type.String({ minLength: 1, maxLength: 255 }),
  description: Type.String({ minLength: 1 }),

  budgetMin: Type.Optional(Type.Number()),
  budgetMax: Type.Optional(Type.Number()),
  isPublished: Type.Optional(Type.Boolean({ default: false })),
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
  // Add other fields as necessary
});

export const JobCreateSuccessResponseSchema = Type.Object({
  jobId: Type.Number(),
  createdAt: Type.String({ format: 'date-time' }),
});

// Job Schema for My Jobs Response
export const JobSchema = Type.Object({
  id: Type.Integer(),
  title: Type.String(),
  description: Type.Union([Type.String(), Type.Null()]),
  location: Type.Union([Type.String(), Type.Null()]),
  status: Type.Union([
    Type.Literal('OPEN'),
    Type.Literal('IN_PROGRESS'),
    Type.Literal('COMPLETED'),
    Type.Literal('CANCELLED'),
  ]),
  createdAt: Type.String({ format: 'date-time' }),
  updatedAt: Type.String({ format: 'date-time' }),
  subcategory: Type.Object({
    id: Type.Integer(),
    slug: Type.String(),
    name: Type.Union([Type.String(), Type.Null()]),
    i18n: Type.Array(
      Type.Object({
        locale: Type.String(),
        name: Type.String(),
        description: Type.Union([Type.String(), Type.Null()]),
      })
    ),
  }),
  user: Type.Optional(
    Type.Object({
      id: Type.Integer(),
      email: Type.String(),
      username: Type.Union([Type.String(), Type.Null()]),
    })
  ),
  answers: Type.Optional(
    Type.Array(
      Type.Object({
        id: Type.Integer(),
        textValue: Type.Union([Type.String(), Type.Null()]),
        numberValue: Type.Union([Type.Number(), Type.Null()]),
        dateValue: Type.Union([
          Type.String({ format: 'date-time' }),
          Type.Null(),
        ]),
        inputLanguage: Type.Union([Type.String(), Type.Null()]),
        createdAt: Type.String({ format: 'date-time' }),
        updatedAt: Type.String({ format: 'date-time' }),
        question: Type.Object({
          id: Type.Integer(),
          type: Type.String(),
          required: Type.Boolean(),
          sortOrder: Type.Integer(),
          validation: Type.Union([Type.String(), Type.Null()]),
          translations: Type.Array(
            Type.Object({
              locale: Type.String(),
              label: Type.String(),
              description: Type.Union([Type.String(), Type.Null()]),
            })
          ),
          options: Type.Array(
            Type.Object({
              id: Type.Integer(),
              value: Type.String(),
              translations: Type.Array(
                Type.Object({
                  locale: Type.String(),
                  label: Type.String(),
                })
              ),
            })
          ),
        }),
        option: Type.Union([
          Type.Object({
            id: Type.Integer(),
            value: Type.String(),
            translations: Type.Array(
              Type.Object({
                locale: Type.String(),
                label: Type.String(),
              })
            ),
          }),
          Type.Null(),
        ]),
      })
    )
  ),
  _count: Type.Object({
    bids: Type.Integer(),
    answers: Type.Integer(),
  }),
});

// My Jobs Request Schema
export const MyJobsGetRequestSchema = Type.Object({
  page: Type.Optional(Type.Integer({ minimum: 1, default: 1 })),
  limit: Type.Optional(Type.Integer({ minimum: 1, maximum: 100, default: 10 })),
  locale: Type.Optional(Type.String({ pattern: '^[a-z]{2}(-[A-Z]{2})?$' })),
  status: Type.Optional(
    Type.Union([
      Type.Literal('OPEN'),
      Type.Literal('IN_PROGRESS'),
      Type.Literal('COMPLETED'),
      Type.Literal('CANCELLED'),
    ])
  ),
  subcategoryId: Type.Optional(Type.Integer()),
});

// My Jobs Success Response Schema
export const MyJobsGetSuccessResponseSchema = Type.Object({
  jobs: Type.Array(JobSchema),
  pagination: Type.Object({
    page: Type.Integer(),
    limit: Type.Integer(),
    total: Type.Integer(),
    totalPages: Type.Integer(),
  }),
});

// Job Detail Schema (with full answers and questions)
export const JobDetailSchema = Type.Object({
  id: Type.Integer(),
  title: Type.String(),
  description: Type.Union([Type.String(), Type.Null()]),
  location: Type.Union([Type.String(), Type.Null()]),
  status: Type.Union([
    Type.Literal('OPEN'),
    Type.Literal('IN_PROGRESS'),
    Type.Literal('COMPLETED'),
    Type.Literal('CANCELLED'),
  ]),
  createdAt: Type.String({ format: 'date-time' }),
  updatedAt: Type.String({ format: 'date-time' }),
  subcategory: Type.Object({
    id: Type.Integer(),
    slug: Type.String(),
    name: Type.Union([Type.String(), Type.Null()]),
    i18n: Type.Array(
      Type.Object({
        locale: Type.String(),
        name: Type.String(),
        description: Type.Union([Type.String(), Type.Null()]),
      })
    ),
  }),
  user: Type.Object({
    id: Type.Integer(),
    email: Type.String(),
    username: Type.Union([Type.String(), Type.Null()]),
  }),
  answers: Type.Array(
    Type.Object({
      id: Type.Integer(),
      textValue: Type.Union([Type.String(), Type.Null()]),
      numberValue: Type.Union([Type.Number(), Type.Null()]),
      dateValue: Type.Union([
        Type.String({ format: 'date-time' }),
        Type.Null(),
      ]),
      inputLanguage: Type.Union([Type.String(), Type.Null()]),
      createdAt: Type.String({ format: 'date-time' }),
      updatedAt: Type.String({ format: 'date-time' }),
      question: Type.Object({
        id: Type.Integer(),
        type: Type.String(),
        required: Type.Boolean(),
        sortOrder: Type.Integer(),
        validation: Type.Union([Type.String(), Type.Null()]),
        translations: Type.Array(
          Type.Object({
            locale: Type.String(),
            label: Type.String(),
            description: Type.Union([Type.String(), Type.Null()]),
          })
        ),
        options: Type.Array(
          Type.Object({
            id: Type.Integer(),
            value: Type.String(),
            translations: Type.Array(
              Type.Object({
                locale: Type.String(),
                label: Type.String(),
              })
            ),
          })
        ),
      }),
      option: Type.Union([
        Type.Object({
          id: Type.Integer(),
          value: Type.String(),
          translations: Type.Array(
            Type.Object({
              locale: Type.String(),
              label: Type.String(),
            })
          ),
        }),
        Type.Null(),
      ]),
    })
  ),
});

// Job Detail Success Response Schema
export const JobDetailSuccessResponseSchema = Type.Object({
  data: JobDetailSchema,
});

export const JobGetIdRequestSchema = Type.Object({
  locale: Type.Optional(Type.String({ pattern: '^[a-z]{2}(-[A-Z]{2})?$' })),
});

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

export const MyJobDeleteSuccessResponseSchema = Type.Object({
  jobDeleted: Type.Boolean(),
});
