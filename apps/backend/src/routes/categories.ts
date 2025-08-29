import { FastifyInstance, FastifyError } from 'fastify';
import { AppDataSource } from '../config/database';
import {
  ApiErrorResponseType,
  ApiErrorSchema,
  CategoriesListSuccessResponse,
  CategoriesListSuccessResponseSchema,
  CategoryUpsertRequest,
  CategoryUpsertRequestSchema,
  CategoryUpsertSuccessResponse,
  CategoryUpsertSuccessResponseSchema,
  SubcategoryUpsertRequest,
  SubcategoryUpsertRequestSchema,
  SubcategoryUpsertSuccessResponse,
  SubcategoryUpsertSuccessResponseSchema,
} from '@api';
import { CategoriesDBService } from '../services/CategoriesDBService';
// add back i18n entity types used in mappings
import type { CategoryI18n } from '../entities/Category';
import type { SubcategoryI18n } from '../entities/Subcategory';

export async function categoriesRoutes(fastify: FastifyInstance) {
  // Initialize services
  const categoriesDBService = new CategoriesDBService(AppDataSource);

  // Helper to generate URL-safe slug
  const slugify = (input: string): string =>
    input
      .toLowerCase()
      .normalize('NFKD')
      .replace(/[\u0300-\u036f]/g, '') // strip diacritics
      .replace(/['"]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

  const ensureUniqueCategoryId = async (base: string): Promise<string> => {
    const effectiveBase = base?.trim() || 'category';
    let candidate = effectiveBase;
    let suffix = 2;
    while (true) {
      // REPLACED: categoriesDBService.findOne -> repo.findOne with where
      const exists = await categoriesDBService.findOne({
        where: { id: candidate },
      });
      if (!exists) return candidate;
      candidate = `${effectiveBase}-${suffix++}`;
    }
  };

  // Ensure all errors in this plugin conform to ApiErrorSchema so response serialization doesn't fail
  fastify.setErrorHandler((error: FastifyError, _request, reply) => {
    // Treat validation and generic errors as 400/500 respectively
    const hasValidation =
      typeof (error as { validation?: unknown }).validation !== 'undefined';
    const isValidationCode = error.code === 'FST_ERR_VALIDATION';
    const isValidationError = hasValidation || isValidationCode;
    const statusCode = isValidationError
      ? 400
      : typeof error.statusCode === 'number'
      ? error.statusCode
      : 500;
    const message = isValidationError
      ? 'Validation error'
      : error.message || 'Internal Server Error';

    reply.status(statusCode).send({
      success: false,
      error: { message, code: statusCode },
    } satisfies ApiErrorResponseType);
  });

  // // Upsert Category
  // fastify.post<{
  //   Body: CategoryUpsertRequest;
  //   Reply: CategoryUpsertSuccessResponse | ApiErrorResponseType;
  // }>(
  //   '/categories',
  //   {
  //     schema: {
  //       body: CategoryUpsertRequestSchema,
  //       response: {
  //         200: CategoryUpsertSuccessResponseSchema,
  //         400: ApiErrorSchema,
  //         500: ApiErrorSchema,
  //       },
  //     },
  //   },
  //   async (request, reply) => {
  //     try {
  //       const { icon, sortOrder } = request.body;
  //       const { i18n } = request.body;

  //       // basic validation for i18n
  //       if (!Array.isArray(i18n) || i18n.length === 0) {
  //         return reply.status(400).send({
  //           success: false,
  //           error: {
  //             message: 'i18n is required and cannot be empty',
  //             code: 400,
  //           },
  //         });
  //       }

  //       // normalize locales and names
  //       const normalizedI18n = i18n.map((e) => ({
  //         ...e,
  //         locale: String(e.locale || '')
  //           .toLowerCase()
  //           .trim(),
  //         name: String(e.name || '').trim(),
  //         description: e.description ?? null,
  //       }));
  //       // ensure all names are present
  //       if (normalizedI18n.some((e) => !e.name)) {
  //         return reply.status(400).send({
  //           success: false,
  //           error: {
  //             message: 'All i18n entries must have a non-empty name',
  //             code: 400,
  //           },
  //         });
  //       }

  //       // Generate ID (slug) from preferred name (en, then en-*, else first)
  //       const preferred =
  //         normalizedI18n.find((e) => e.locale === 'en') ??
  //         normalizedI18n.find((e) => e.locale.startsWith('en')) ??
  //         normalizedI18n[0];

  //       const baseSlugRaw = slugify(preferred.name);
  //       const baseSlug = baseSlugRaw || 'category';
  //       const id = await ensureUniqueCategoryId(baseSlug);

  //       let created = false;
  //       const updatedLocales: string[] = [];

  //       // REPLACED: categoriesDBService.findOne -> repo.findOne with where
  //       let category = await categoriesDBService.findOne({
  //         where: { id },
  //       });
  //       if (!category) {
  //         category = categoriesDBService.create({
  //           id,
  //           name: preferred.name, // ensure Category.name is set
  //           icon: icon ?? null,
  //           sortOrder: sortOrder ?? 0,
  //         });
  //         created = true;
  //       } else {
  //         category.icon = icon ?? category.icon ?? null;
  //         if (typeof sortOrder === 'number') category.sortOrder = sortOrder;
  //       }
  //       await categoriesDBService.categoryRepo.save(category);

  //       for (const entry of normalizedI18n) {
  //         const existing = await categoriesDBService.categoryI18nRepo.findOne({
  //           where: { category: { id }, locale: entry.locale },
  //           relations: { category: true },
  //         });
  //         if (existing) {
  //           existing.name = entry.name;
  //           existing.description = entry.description;
  //           await categoriesDBService.categoryI18nRepo.save(existing);
  //         } else {
  //           const rec = categoriesDBService.categoryI18nRepo.create({
  //             category,
  //             locale: entry.locale,
  //             name: entry.name,
  //             description: entry.description,
  //           });
  //           await categoriesDBService.categoryI18nRepo.save(rec);
  //         }
  //         updatedLocales.push(entry.locale);
  //       }

  //       const res: CategoryUpsertSuccessResponse = {
  //         success: true,
  //         message: created ? 'Category created' : 'Category updated',
  //         data: { category: { id, created, updatedLocales } },
  //       };
  //       return reply.status(200).send(res);
  //     } catch (err) {
  //       fastify.log.error(err);
  //       const devMsg =
  //         process.env.NODE_ENV === 'development' && err instanceof Error
  //           ? `Failed to upsert category: ${err.message}`
  //           : 'Failed to upsert category';
  //       return reply.status(500).send({
  //         success: false,
  //         error: { message: devMsg, code: 500 },
  //       });
  //     }
  //   }
  // );

  fastify.get<{
    Reply: CategoriesListSuccessResponse | ApiErrorResponseType;
  }>(
    '/categories',
    {
      schema: {
        response: {
          200: CategoriesListSuccessResponseSchema,
          400: ApiErrorSchema,
          500: ApiErrorSchema,
        },
      },
    },
    async (_request, reply) => {
      try {
        // order for deterministic output
        const categories = await categoriesDBService.findAll({
          order: { sortOrder: 'ASC', id: 'ASC' },
        });

        return reply.status(200).send({
          success: true,
          message: 'Categories fetched',
          data: { categories },
        });
      } catch (err) {
        fastify.log.error(err);
        const devMsg =
          process.env.NODE_ENV === 'development' && err instanceof Error
            ? `Failed to fetch categories: ${err.message}`
            : 'Failed to fetch categories';
        return reply.status(500).send({
          success: false,
          error: { message: devMsg, code: 500 },
        });
      }
    }
  );

  // Upsert Subcategory
  // fastify.post<{
  //   Body: SubcategoryUpsertRequest;
  //   Reply: SubcategoryUpsertSuccessResponse | ApiErrorResponseType;
  // }>(
  //   '/subcategories',
  //   {
  //     schema: {
  //       body: SubcategoryUpsertRequestSchema,
  //       response: {
  //         200: SubcategoryUpsertSuccessResponseSchema,
  //         400: ApiErrorSchema,
  //         500: ApiErrorSchema,
  //       },
  //     },
  //   },
  //   async (request, reply) => {
  //     try {
  //       const { categoryId, icon, sortOrder } = request.body;
  //       let { slug } = request.body;
  //       const i18n = request.body.i18n;

  //       // Validate slug and i18n
  //       slug = slugify(String(slug || '').trim());
  //       if (!slug) {
  //         return reply.status(400).send({
  //           success: false,
  //           error: { message: 'Valid slug is required', code: 400 },
  //         });
  //       }
  //       if (!Array.isArray(i18n) || i18n.length === 0) {
  //         return reply.status(400).send({
  //           success: false,
  //           error: {
  //             message: 'i18n is required and cannot be empty',
  //             code: 400,
  //           },
  //         });
  //       }
  //       const normalizedI18n = i18n.map((e) => ({
  //         ...e,
  //         locale: String(e.locale || '')
  //           .toLowerCase()
  //           .trim(),
  //         name: String(e.name || '').trim(),
  //         description: e.description ?? null,
  //       }));
  //       if (normalizedI18n.some((e) => !e.name)) {
  //         return reply.status(400).send({
  //           success: false,
  //           error: {
  //             message: 'All i18n entries must have a non-empty name',
  //             code: 400,
  //           },
  //         });
  //       }

  //       // Ensure category exists
  //       const cat = await categoriesDBService.findOne({
  //         where: { id: categoryId },
  //       });
  //       if (!cat) {
  //         return reply.status(400).send({
  //           success: false,
  //           error: { message: `Category "${categoryId}" not found`, code: 400 },
  //         });
  //       }

  //       let created = false;
  //       const updatedLocales: string[] = [];

  //       let sub = await categoriesDBService.findOne({
  //         where: { categoryId, slug },
  //       });
  //       if (!sub) {
  //         sub = categoriesDBService.subcategoryRepo.create({
  //           categoryId,
  //           slug,
  //           icon: icon ?? null,
  //           sortOrder: sortOrder ?? 0,
  //           category: cat,
  //         });
  //         created = true;
  //       } else {
  //         sub.icon = icon ?? sub.icon ?? null;
  //         if (typeof sortOrder === 'number') sub.sortOrder = sortOrder;
  //       }
  //       await categoriesDBService.subcategoryRepo.save(sub);

  //       for (const entry of normalizedI18n) {
  //         const existing =
  //           await categoriesDBService.subcategoryI18nRepo.findOne({
  //             where: { subcategory: { id: sub.id }, locale: entry.locale },
  //             relations: { subcategory: true },
  //           });
  //         if (existing) {
  //           existing.name = entry.name;
  //           existing.description = entry.description;
  //           await categoriesDBService.subcategoryI18nRepo.save(existing);
  //         } else {
  //           const rec = categoriesDBService.subcategoryI18nRepo.create({
  //             subcategory: sub,
  //             locale: entry.locale,
  //             name: entry.name,
  //             description: entry.description,
  //           });
  //           await categoriesDBService.subcategoryI18nRepo.save(rec);
  //         }
  //         updatedLocales.push(entry.locale);
  //       }

  //       const res: SubcategoryUpsertSuccessResponse = {
  //         success: true,
  //         message: created ? 'Subcategory created' : 'Subcategory updated',
  //         data: { subcategory: { categoryId, slug, created, updatedLocales } },
  //       };
  //       return reply.status(200).send(res);
  //     } catch (err) {
  //       fastify.log.error(err);
  //       const devMsg =
  //         process.env.NODE_ENV === 'development' && err instanceof Error
  //           ? `Failed to upsert subcategory: ${err.message}`
  //           : 'Failed to upsert subcategory';
  //       return reply.status(500).send({
  //         success: false,
  //         error: { message: devMsg, code: 500 },
  //       });
  //     }
  //   }
  // );
}
