import { FastifyInstance, FastifyError } from 'fastify';
import { Type, Static } from '@sinclair/typebox';
import { AppDataSource } from '../config/database';
import { Category, CategoryI18n } from '../entities/Category';
import { Subcategory, SubcategoryI18n } from '../entities/Subcategory';
import {
  ApiErrorResponseType,
  ApiErrorSchema,
  CategoryUpsertRequest,
  CategoryUpsertRequestSchema,
  CategoryUpsertSuccessResponse,
  CategoryUpsertSuccessResponseSchema,
  SubcategoryUpsertRequest,
  SubcategoryUpsertRequestSchema,
  SubcategoryUpsertSuccessResponse,
  SubcategoryUpsertSuccessResponseSchema,
} from '@api';

export async function categoriesRoutes(fastify: FastifyInstance) {
  const categoryRepo = AppDataSource.getRepository(Category);
  const categoryI18nRepo = AppDataSource.getRepository(CategoryI18n);
  const subcategoryRepo = AppDataSource.getRepository(Subcategory);
  const subcategoryI18nRepo = AppDataSource.getRepository(SubcategoryI18n);

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
    let candidate = base || 'category';
    // If available, use as-is
    // Then append -2, -3 ... until available
    let suffix = 2;
    while (true) {
      const exists = await categoryRepo.findOne({ where: { id: candidate } });
      if (!exists) return candidate;
      candidate = `${base}-${suffix++}`;
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

  // Upsert Category
  fastify.post<{
    Body: CategoryUpsertRequest;
    Reply: CategoryUpsertSuccessResponse | ApiErrorResponseType;
  }>(
    '/categories',
    {
      schema: {
        body: CategoryUpsertRequestSchema,
        response: {
          200: CategoryUpsertSuccessResponseSchema,
          400: ApiErrorSchema,
          500: ApiErrorSchema,
        },
      },
    },
    async (request, reply) => {
      try {
        const { icon, sortOrder, i18n } = request.body;

        // Generate ID (slug) from preferred name (en, else first)
        const preferred =
          i18n.find((e) => e.locale.toLowerCase() === 'en') ?? i18n[0];
        const baseSlug = slugify(preferred.name);
        const id = await ensureUniqueCategoryId(baseSlug);

        let created = false;
        const updatedLocales: string[] = [];

        let category = await categoryRepo.findOne({ where: { id } });
        if (!category) {
          category = categoryRepo.create({
            id,
            icon: icon ?? null,
            sortOrder: sortOrder ?? 0,
            // keep Category.name aligned on create
            name: preferred.name,
          });
          created = true;
        } else {
          category.icon = icon ?? category.icon ?? null;
          if (typeof sortOrder === 'number') category.sortOrder = sortOrder;
          // optionally keep name unchanged on updates
        }
        await categoryRepo.save(category);

        for (const entry of i18n) {
          const existing = await categoryI18nRepo.findOne({
            where: { category: { id }, locale: entry.locale },
            relations: { category: true },
          });
          if (existing) {
            existing.name = entry.name;
            existing.description = entry.description ?? null;
            await categoryI18nRepo.save(existing);
          } else {
            const rec = categoryI18nRepo.create({
              category,
              locale: entry.locale,
              name: entry.name,
              description: entry.description ?? null,
            });
            await categoryI18nRepo.save(rec);
          }
          updatedLocales.push(entry.locale);
        }

        const res: CategoryUpsertSuccessResponse = {
          success: true,
          message: created ? 'Category created' : 'Category updated',
          data: { category: { id, created, updatedLocales } },
        };
        return reply.status(200).send(res);
      } catch (err) {
        fastify.log.error(err);
        const devMsg =
          process.env.NODE_ENV === 'development' && err instanceof Error
            ? `Failed to upsert category: ${err.message}`
            : 'Failed to upsert category';
        return reply.status(500).send({
          success: false,
          error: { message: devMsg, code: 500 },
        });
      }
    }
  );

  // Upsert Subcategory
  fastify.post<{
    Body: SubcategoryUpsertRequest;
    Reply: SubcategoryUpsertSuccessResponse | ApiErrorResponseType;
  }>(
    '/subcategories',
    {
      schema: {
        body: SubcategoryUpsertRequestSchema,
        response: {
          200: SubcategoryUpsertSuccessResponseSchema,
          400: ApiErrorSchema,
          500: ApiErrorSchema,
        },
      },
    },
    async (request, reply) => {
      try {
        const { categoryId, slug, icon, sortOrder, i18n } = request.body;

        // Ensure category exists
        const cat = await categoryRepo.findOne({ where: { id: categoryId } });
        if (!cat) {
          return reply.status(400).send({
            success: false,
            error: { message: `Category "${categoryId}" not found`, code: 400 },
          });
        }

        let created = false;
        const updatedLocales: string[] = [];

        let sub = await subcategoryRepo.findOne({
          where: { categoryId, slug },
        });
        if (!sub) {
          sub = subcategoryRepo.create({
            categoryId,
            slug,
            icon: icon ?? null,
            sortOrder: sortOrder ?? 0,
            category: cat,
          });
          created = true;
        } else {
          sub.icon = icon ?? sub.icon ?? null;
          if (typeof sortOrder === 'number') sub.sortOrder = sortOrder;
        }
        await subcategoryRepo.save(sub);

        for (const entry of i18n) {
          const existing = await subcategoryI18nRepo.findOne({
            where: { subcategory: { id: sub.id }, locale: entry.locale },
            relations: { subcategory: true },
          });
          if (existing) {
            existing.name = entry.name;
            existing.description = entry.description ?? null;
            await subcategoryI18nRepo.save(existing);
          } else {
            const rec = subcategoryI18nRepo.create({
              subcategory: sub,
              locale: entry.locale,
              name: entry.name,
              description: entry.description ?? null,
            });
            await subcategoryI18nRepo.save(rec);
          }
          updatedLocales.push(entry.locale);
        }

        const res: SubcategoryUpsertSuccessResponse = {
          success: true,
          message: created ? 'Subcategory created' : 'Subcategory updated',
          data: { subcategory: { categoryId, slug, created, updatedLocales } },
        };
        return reply.status(200).send(res);
      } catch (err) {
        fastify.log.error(err);
        const devMsg =
          process.env.NODE_ENV === 'development' && err instanceof Error
            ? `Failed to upsert subcategory: ${err.message}`
            : 'Failed to upsert subcategory';
        return reply.status(500).send({
          success: false,
          error: { message: devMsg, code: 500 },
        });
      }
    }
  );
}
