import { Type } from '@sinclair/typebox';
import { ApiResponseSuccessSchema } from './schema';

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

export const JobCreateResponseSchema = Type.Object({
  jobId: Type.Number(),
  createdAt: Type.String({ format: 'date-time' }),
});

export const JobCreateSuccessResponseSchema = ApiResponseSuccessSchema(
  JobCreateResponseSchema
);

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
  _count: Type.Optional(
    Type.Object({
      bids: Type.Integer(),
      answers: Type.Integer(),
    })
  ),
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

// My Job (One Job) Success Response Schema

export const MyJobGetResponseSchema = Type.Object({
  job: JobSchema,
});
export const MyJobGetSuccessResponseSchema = ApiResponseSuccessSchema(
  MyJobGetResponseSchema
);

// My Jobs (Multiple Jobs) Success Response Schema

export const MyJobsGetResponseSchema = Type.Object({
  jobs: Type.Array(JobSchema),
  pagination: Type.Object({
    page: Type.Integer(),
    limit: Type.Integer(),
    total: Type.Integer(),
    totalPages: Type.Integer(),
  }),
});

export const MyJobsGetSuccessResponseSchema = ApiResponseSuccessSchema(
  MyJobsGetResponseSchema
);
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

export const JobDetailResponseSchema = Type.Object({
  data: JobDetailSchema,
});

export const JobDetailSuccessResponseSchema = ApiResponseSuccessSchema(
  JobDetailResponseSchema
);
export const JobGetIdRequestSchema = Type.Object({
  locale: Type.Optional(Type.String({ pattern: '^[a-z]{2}(-[A-Z]{2})?$' })),
});

export const MyJobDeleteResponseSchema = Type.Object({
  jobDeleted: Type.Boolean(),
});

export const MyJobDeleteSuccessResponseSchema = ApiResponseSuccessSchema(
  MyJobDeleteResponseSchema
);
