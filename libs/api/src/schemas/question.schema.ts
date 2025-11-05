import { Type } from '@sinclair/typebox';

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
