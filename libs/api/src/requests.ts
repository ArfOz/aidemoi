// import { Type, Static } from '@sinclair/typebox';

// // Category upsert
// export const CategoryI18nSchema = Type.Object({
//   locale: Type.String({ minLength: 2, maxLength: 8 }),
//   name: Type.String({ minLength: 1, maxLength: 255 }),
//   description: Type.Optional(Type.String()),
// });

// export const CategoryUpsertRequestSchema = Type.Object({
//   id: Type.String({ minLength: 1, maxLength: 64 }), // slug
//   icon: Type.Optional(Type.String({ maxLength: 16 })),
//   sortOrder: Type.Optional(Type.Integer()),
//   i18n: Type.Array(CategoryI18nSchema, { minItems: 1 }),
// });

// // export type CategoryUpsertRequest = Static<typeof CategoryUpsertRequestSchema>;

// export const CategoryUpsertSuccessResponseSchema = Type.Object({
//   success: Type.Literal(true),
//   message: Type.String(),
//   data: Type.Object({
//     category: Type.Object({
//       id: Type.String(),
//       created: Type.Boolean(),
//       updatedLocales: Type.Array(Type.String()),
//     }),
//   }),
// });
// export type CategoryUpsertSuccessResponse = Static<
//   typeof CategoryUpsertSuccessResponseSchema
// >;

// // Subcategory upsert
// export const SubcategoryI18nSchema = Type.Object({
//   locale: Type.String({ minLength: 2, maxLength: 8 }),
//   name: Type.String({ minLength: 1, maxLength: 255 }),
//   description: Type.Optional(Type.String()),
// });

// export const SubcategoryUpsertRequestSchema = Type.Object({
//   categoryId: Type.String({ minLength: 1, maxLength: 64 }), // FK to category slug
//   slug: Type.String({ minLength: 1, maxLength: 128 }), // subcategory slug
//   icon: Type.Optional(Type.String({ maxLength: 16 })),
//   sortOrder: Type.Optional(Type.Integer()),
//   i18n: Type.Array(SubcategoryI18nSchema, { minItems: 1 }),
// });

// export type SubcategoryUpsertRequest = Static<
//   typeof SubcategoryUpsertRequestSchema
// >;

// export const SubcategoryUpsertSuccessResponseSchema = Type.Object({
//   success: Type.Literal(true),
//   message: Type.String(),
//   data: Type.Object({
//     subcategory: Type.Object({
//       categoryId: Type.String(),
//       slug: Type.String(),
//       created: Type.Boolean(),
//       updatedLocales: Type.Array(Type.String()),
//     }),
//   }),
// });
// export type SubcategoryUpsertSuccessResponse = Static<
//   typeof SubcategoryUpsertSuccessResponseSchema
// >;
