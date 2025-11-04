import { Type } from '@sinclair/typebox';
import { ApiResponseSuccessSchema } from './schema';

export const CategoryI18nSchema = Type.Object({
  id: Type.Optional(Type.Integer()),
  locale: Type.String({ minLength: 2, maxLength: 8 }),
  name: Type.String({ minLength: 1, maxLength: 255 }),
  description: Type.Union([Type.String(), Type.Null()]),
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

//Category list success response

export const CategoriesListResponseSchema = Type.Object({
  categories: Type.Array(CategoryListSchema),
});
export const CategoriesListSuccessResponseSchema = ApiResponseSuccessSchema(
  CategoriesListResponseSchema
);

//Category detail success response

export const CategoryDetailResponseSchema = Type.Object({
  details: CategoryDetailSchema,
});

export const CategoryDetailSuccessResponseSchema = ApiResponseSuccessSchema(
  CategoryDetailResponseSchema
);

export const CategoryUpsertRequestSchema = Type.Object({
  icon: Type.Optional(Type.String({ maxLength: 16 })),
  sortOrder: Type.Optional(Type.Integer()),
  i18n: Type.Array(CategoryI18nSchema, { minItems: 1 }),
  id: Type.Optional(Type.String()), // for updates
});
