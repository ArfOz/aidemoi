import { FastifyInstance } from 'fastify';
import {
  ApiErrorResponseType,
  ApiErrorSchema,
  CategoryDetailSuccessResponseSchema,
  CategoryDetailSuccessResponse,
  CategoryGetRequest,
  CategoryGetRequestSchema,
  CategoryUpsertRequest,
  CategoryUpsertSuccessResponse,
  CategoryUpsertRequestSchema,
  CategoryUpsertSuccessResponseSchema,
  CategoriesListRequest,
  CategoriesListSuccessResponse,
  CategoriesListSuccessResponseSchema,
  SubcategoryUpsertSuccessResponse,
  SubcategoryUpsertRequest,
  SubcategoryUpsertRequestSchema,
  SubcategoryUpsertSuccessResponseSchema,
  SubcategoryGetRequest,
  SubcategoryDetailSuccessResponse,
} from '@api';
import { CategoriesDBService } from '../services/DatabaseService/CategoriesDBService';
import { SubCategoriesDBServices } from '../services/DatabaseService/SubCategoriesDBServices';

export async function categoriesRoutes(
  fastify: FastifyInstance
): Promise<void> {
  // Initialize services with the Prisma client from Fastify's decoration
  const categoriesDBService = new CategoriesDBService(fastify.prisma);
  const subCategoriesDBService = new SubCategoriesDBServices(fastify.prisma);

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
      const exists = await categoriesDBService.findById({
        where: { id: candidate },
      });
      if (!exists) return candidate;
      candidate = `${effectiveBase}-${suffix++}`;
    }
  };

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
        // allow server to generate id when creating new category
        let id = request.body.id as string | undefined;
        const { icon, sortOrder, i18n } = request.body;

        // basic validation for i18n
        if (!Array.isArray(i18n) || i18n.length === 0) {
          return reply.status(400).send({
            success: false,
            message: 'Validation failed',
            error: {
              message: 'i18n is required and cannot be empty',
              code: 400,
            },
          });
        }

        // normalize locales and names
        const normalizedI18n = i18n.map((e) => ({
          ...e,
          locale: String(e.locale || '')
            .toLowerCase()
            .trim(),
          name: String(e.name || '').trim(),
          description: e.description ?? null,
        }));

        // ensure all names are present
        if (normalizedI18n.some((e) => !e.name)) {
          return reply.status(400).send({
            success: false,
            message: 'Validation failed',
            error: {
              message: 'All i18n entries must have a non-empty name',
              code: 400,
            },
          });
        }

        let created = false;

        let newId;

        if (id) {
          // Update existing category
          const category = await categoriesDBService.findById({
            where: { id },
          });
          if (!category) {
            return reply.status(404).send({
              success: false,
              message: 'Category not found',
              error: {
                message: `Category with id "${id}" not found`,
                code: 404,
              },
            });
          }
        } else {
          // Create new category: Generate ID (slug) from preferred name
          const preferred =
            normalizedI18n.find((e) => e.locale === 'en') ??
            normalizedI18n.find((e) => e.locale.startsWith('en')) ??
            normalizedI18n[0];

          const baseSlug = slugify(preferred.name) || 'category';
          newId = await ensureUniqueCategoryId(baseSlug);
          // assign generated id into `id` so Prisma create receives the required `id`
          id = newId;
          created = true;
        }

        const upsertData = {
          icon: icon ?? null,
          sortOrder: sortOrder,
          // When creating, pass nested create shape Prisma expects
          i18n: created
            ? { create: normalizedI18n }
            : { deleteMany: {}, create: normalizedI18n },
        };

        const result = created
          ? await categoriesDBService.create({
              id,
              name:
                normalizedI18n.find((e) => e.locale === 'en')?.name ??
                normalizedI18n[0].name,
              ...upsertData,
            })
          : await categoriesDBService.update(id, upsertData);

        const res: CategoryUpsertSuccessResponse = {
          success: true,
          message: created ? 'Category created' : 'Category updated',
          data: {
            category: {
              id: result.id,
              created,
              updatedLocales: created
                ? normalizedI18n.map((item) => item.locale)
                : normalizedI18n.map((item) => item.locale),
            },
          },
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
          message: 'Request failed',
          error: { message: devMsg, code: 500 },
        });
      }
    }
  );

  // List Categories
  fastify.get<{
    Querystring: CategoriesListRequest;
    Reply: CategoriesListSuccessResponse | ApiErrorResponseType;
  }>(
    '/categories',
    {
      schema: {
        querystring: CategoryGetRequestSchema,
        response: {
          200: CategoriesListSuccessResponseSchema,
          400: ApiErrorSchema,
          500: ApiErrorSchema,
        },
      },
    },
    async (request, reply) => {
      try {
        // Get languages from query parameters
        const { languages: lang } = request.query;

        // Fetch all categories with language filtering at database level
        const categories = await categoriesDBService.findAll({
          where:
            lang && lang.length > 0
              ? {
                  i18n: { some: { locale: { in: lang } } },
                }
              : undefined,
          languages: lang && lang.length > 0 ? lang : undefined,
        });

        return reply.status(200).send({
          success: true,
          message: 'Categories fetched',
          data: {
            categories:
              categories as unknown as CategoriesListSuccessResponse['data']['categories'],
          },
        });
      } catch (err) {
        fastify.log.error(err);
        const devMsg =
          process.env.NODE_ENV === 'development' && err instanceof Error
            ? `Failed to fetch categories: ${err.message}`
            : 'Failed to fetch categories';
        return reply.status(500).send({
          success: false,
          message: 'Request failed',
          error: { message: devMsg, code: 500 },
        });
      }
    }
  );

  // Get Category by ID
  fastify.get<{
    Params: { id: string };
    Querystring: CategoryGetRequest;
    Reply: CategoryDetailSuccessResponse | ApiErrorResponseType;
  }>(
    '/category/:id',
    {
      schema: {
        params: {
          type: 'object',
          properties: { id: { type: 'string' } },
          required: ['id'],
        },
        querystring: CategoryGetRequestSchema,
        response: {
          200: CategoryDetailSuccessResponseSchema,
          404: ApiErrorSchema,
          500: ApiErrorSchema,
        },
      },
    },
    async (request, reply) => {
      try {
        // Get id from URL params and languages from query
        const { id } = request.params;
        const { languages: lang } = request.query;

        // Fetch category by ID with language filtering at database level
        const category = await categoriesDBService.findById({
          where: { id },
          languages: lang && lang.length > 0 ? lang : undefined,
        });

        if (!category) {
          return reply.status(404).send({
            success: false,
            message: 'Category not found',
            error: {
              message: `Category "${id}" not found`,
              code: 404,
            },
          });
        }

        return reply.status(200).send({
          success: true,
          message: 'Category fetched',
          data: {
            category:
              category as unknown as CategoryDetailSuccessResponse['data']['category'],
          },
        });
      } catch (err) {
        fastify.log.error(err);
        const devMsg =
          process.env.NODE_ENV === 'development' && err instanceof Error
            ? `Failed to fetch category: ${err.message}`
            : 'Failed to fetch category';
        return reply.status(500).send({
          success: false,
          message: 'Request failed',
          error: { message: devMsg, code: 500 },
        });
      }
    }
  );

  // List/Get Subcategories
  fastify.get<{
    Params: { id: string };
    Body: SubcategoryGetRequest;
    Reply: SubcategoryDetailSuccessResponse | ApiErrorResponseType;
  }>('/subcategory/:id', async (request, reply) => {
    try {
      // allow optional query params: categoryId and languages (array)
      const q: any = request.query || {};
      const categoryId: string | undefined = q.categoryId;
      const languages: string[] | undefined = q.languages;

      const where: any = {};
      if (categoryId) where.categoryId = categoryId;
      if (languages && Array.isArray(languages) && languages.length > 0) {
        where.i18n = { some: { locale: { in: languages } } };
      }

      const subcategory = await subCategoriesDBService.findUnique({
        where: {
          id: Number(request.params.id),
        },
      });

      if (!subcategory) {
        return reply.status(404).send({
          success: false,
          message: 'Subcategory not found',
          error: {
            message: `Subcategory with id "${request.params.id}" not found`,
            code: 404,
          },
        });
      }

      return reply.status(200).send({
        success: true,
        message: 'Subcategory fetched',
        data: {
          subcategory:
            subcategory as unknown as SubcategoryDetailSuccessResponse['data']['subcategory'],
        },
      });
    } catch (err) {
      fastify.log.error(err);
      const devMsg =
        process.env.NODE_ENV === 'development' && err instanceof Error
          ? `Failed to fetch subcategories: ${err.message}`
          : 'Failed to fetch subcategories';
      return reply.status(500).send({
        success: false,
        message: 'Request failed',
        error: { message: devMsg, code: 500 },
      });
    }
  });

  // Upsert SubCategory
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
        const { categoryId, icon, sortOrder } = request.body;
        let slug = request.body.slug as string | undefined;
        const { i18n } = request.body;

        // If slug provided, normalise it; otherwise leave undefined to let service generate one.
        if (typeof slug === 'string') {
          slug = slugify(String(slug).trim());
          if (!slug) {
            return reply.status(400).send({
              success: false,
              message: 'Validation failed',
              error: { message: 'Valid slug is required', code: 400 },
            });
          }
        } else {
          slug = undefined;
        }

        // Basic validation for i18n
        if (!Array.isArray(i18n) || i18n.length === 0) {
          return reply.status(400).send({
            success: false,
            message: 'Validation failed',
            error: {
              message: 'i18n is required and cannot be empty',
              code: 400,
            },
          });
        }

        // Normalize locales and names
        const normalizedI18n = i18n.map((e) => ({
          ...e,
          locale: String(e.locale || '')
            .toLowerCase()
            .trim(),
          name: String(e.name || '').trim(),
          description: e.description ?? null,
        }));

        // Ensure all names are present
        if (normalizedI18n.some((e) => !e.name)) {
          return reply.status(400).send({
            success: false,
            message: 'Validation failed',
            error: {
              message: 'All i18n entries must have a non-empty name',
              code: 400,
            },
          });
        }

        // Ensure parent category exists
        const parentCategory = await categoriesDBService.findById({
          where: { id: categoryId },
        });
        if (!parentCategory) {
          return reply.status(400).send({
            success: false,
            message: 'Validation failed',
            error: { message: `Category "${categoryId}" not found`, code: 400 },
          });
        }

        let created = false;
        let updatedLocales: string[] = [];

        // If slug provided, check existence; if no slug provided, proceed to create
        let subcategory = null;
        if (slug) {
          subcategory = await subCategoriesDBService.findBySlugAndCategory(
            categoryId,
            slug
          );
        }

        if (!subcategory) {
          // Create new subcategory
          try {
            const result = await subCategoriesDBService.create({
              categoryId,
              slug: slug as string, // service accepts optional slug
              icon: icon ?? null,
              sortOrder: sortOrder ?? 0,
              i18n: normalizedI18n,
            });
            created = true;
            updatedLocales = normalizedI18n.map((item) => item.locale);
            // capture generated slug if service returned one
            slug = result.slug;
          } catch {
            // Fallback if createSubcategory doesn't exist
            return reply.status(500).send({
              success: false,
              message: 'Service error',
              error: {
                message: 'Subcategory service method not implemented',
                code: 500,
              },
            });
          }
        } else {
          // Update existing subcategory
          try {
            const updateResult = await subCategoriesDBService.update(
              categoryId,
              slug as string,
              {
                icon: icon ?? null,
                sortOrder: sortOrder,
                i18n: normalizedI18n,
              }
            );
            updatedLocales = updateResult?.updatedLocales ?? [];
          } catch {
            // Fallback if updateSubcategory doesn't exist
            return reply.status(500).send({
              success: false,
              message: 'Service error',
              error: {
                message: 'Subcategory update service method not implemented',
                code: 500,
              },
            });
          }
        }

        const res: SubcategoryUpsertSuccessResponse = {
          success: true,
          message: created ? 'Subcategory created' : 'Subcategory updated',
          data: {
            subcategory: {
              categoryId,
              slug: slug as string,
              created,
              updatedLocales,
            },
          },
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
          message: 'Request failed',
          error: { message: devMsg, code: 500 },
        });
      }
    }
  );
}

export default categoriesRoutes;
