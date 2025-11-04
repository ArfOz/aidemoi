import { FastifyInstance } from 'fastify';
import {
  ApiErrorResponseType,
  ApiResponseErrorSchema,
  CategoryGetRequest,
  CategoryGetRequestSchema,
  CategoryUpsertRequest,
  CategoryUpsertSuccessResponse,
  CategoryUpsertRequestSchema,
  CategoryUpsertSuccessResponseSchema,
  CategoriesListRequest,
  CategoriesListSuccessResponse,
  CategoriesListSuccessResponseSchema,
  // SubcategoryUpsertSuccessResponse,
  SubcategoryUpsertRequest,
  SubcategoryUpsertRequestSchema,
  // SubcategoryUpsertSuccessResponseSchema,
  SubcategoryGetRequest,
  IdParamsSchema,
  ApiResponseType,
  CategoryDetailSuccessResponseSchema,
  ApiResponseSuccessSchema,
  CategoriesListResponseSchema,
  CategoryDetailResponseSchema,
  CategoryDetailSuccessResponse,
} from '@api';
import {
  CategoriesDBService,
  SubCategoriesDBService,
} from '../services/DatabaseService';

export async function categoriesRoutes(
  fastify: FastifyInstance
): Promise<void> {
  // Ensure all uncaught errors serialize to the expected error schema
  fastify.setErrorHandler(async (error, request, reply) => {
    fastify.log.error(error);
    const statusCode = (error && (error as any).statusCode) || 500;
    const message =
      process.env.NODE_ENV === 'development' && error instanceof Error
        ? error.message
        : statusCode >= 500
        ? 'Internal Server Error'
        : String((error as any).message || 'Error');

    return reply.status(statusCode).send({
      success: false,
      error: { message, code: statusCode },
    });
  });

  // Initialize services with the Prisma client from Fastify's decoration
  const categoriesDBService = new CategoriesDBService(fastify.prisma);
  const subcategoriesDBService = new SubCategoriesDBService(fastify.prisma);

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

  // // Upsert Category
  // fastify.post<{
  //   Body: CategoryUpsertRequest;
  //   Reply: CategoryUpsertSuccessResponse;
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
  //       // Allow server to generate id when creating new category
  //       let id = request.body.id as string | undefined;
  //       const { icon, sortOrder, i18n } = request.body;

  //       // Basic validation for i18n
  //       if (!Array.isArray(i18n) || i18n.length === 0) {
  //         return reply.status(400).send({
  //           success: false,
  //           message: 'Validation failed',
  //           error: {
  //             message: 'i18n is required and cannot be empty',
  //             code: 400,
  //           },
  //         });
  //       }

  //       // Normalize locales and names
  //       const normalizedI18n = i18n.map((e) => ({
  //         ...e,
  //         locale: String(e.locale || '')
  //           .toLowerCase()
  //           .trim(),
  //         name: String(e.name || '').trim(),
  //         description: e.description ?? undefined,
  //       }));

  //       // Ensure all names are present
  //       if (normalizedI18n.some((e) => !e.name)) {
  //         return reply.status(400).send({
  //           success: false,
  //           message: 'Validation failed',
  //           error: {
  //             message: 'All i18n entries must have a non-empty name',
  //             code: 400,
  //           },
  //         });
  //       }

  //       let created = false;
  //       let result;

  //       if (id) {
  //         // Update existing category
  //         const category = await categoriesDBService.findById({
  //           where: { id },
  //         });
  //         if (!category) {
  //           return reply.status(404).send({
  //             success: false,
  //             message: 'Category not found',
  //             error: {
  //               message: `Category with id "${id}" not found`,
  //               code: 404,
  //             },
  //           });
  //         }

  //         // Update category
  //         result = await categoriesDBService.update(id, {
  //           icon: icon ?? undefined,
  //           sortOrder: sortOrder,
  //           i18n: {
  //             deleteMany: {},
  //             create: normalizedI18n,
  //           },
  //         });
  //       } else {
  //         // Create new category: Generate ID (slug) from preferred name
  //         const preferred =
  //           normalizedI18n.find((e) => e.locale === 'en') ??
  //           normalizedI18n.find((e) => e.locale.startsWith('en')) ??
  //           normalizedI18n[0];

  //         const baseSlug = slugify(preferred.name) || 'category';
  //         id = await ensureUniqueCategoryId(baseSlug);
  //         created = true;

  //         result = await categoriesDBService.create({
  //           id,
  //           name: preferred.name,
  //           icon: icon ?? null,
  //           sortOrder: sortOrder ?? 0,
  //           i18n: {
  //             create: normalizedI18n,
  //           },
  //         });
  //       }

  //       const res: CategoryUpsertSuccessResponse = {
  //         success: true,
  //         message: created ? 'Category created' : 'Category updated',
  //         data: {
  //           category: {
  //             id: result.id,
  //             created,
  //             updatedLocales: normalizedI18n.map((item) => item.locale),
  //           },
  //         },
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
  //         message: 'Request failed',
  //         error: { message: devMsg, code: 500 },
  //       });
  //     }
  //   }
  // );

  // List Categories
  fastify.get<{
    Querystring: CategoriesListRequest;
    Reply: ApiResponseType<typeof CategoriesListResponseSchema>;
  }>(
    '/categories',
    {
      schema: {
        querystring: CategoryGetRequestSchema,
        response: {
          200: CategoriesListSuccessResponseSchema,
          400: ApiResponseErrorSchema,
          500: ApiResponseErrorSchema,
        },
      },
    },
    async (request, reply) => {
      try {
        // Get languages from query parameters
        const { languages: lang } = request.query;

        // Fetch all categories with language filtering
        const categories = await categoriesDBService.findAll(
          lang && lang.length > 0 ? { languages: lang } : undefined
        );

        // return exact shape required by CategoriesListSuccessResponseSchema
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
          error: { message: devMsg, code: 500 },
        });
      }
    }
  );

  // Get Category by ID
  fastify.get<{
    Params: { id: string };
    Querystring: CategoryGetRequest;
    Reply: ApiResponseType<typeof CategoryDetailResponseSchema>;
  }>(
    '/category/:id',
    {
      schema: {
        params: IdParamsSchema,
        querystring: CategoryGetRequestSchema,
        response: {
          200: CategoryDetailSuccessResponseSchema,
          404: ApiResponseErrorSchema,
          500: ApiResponseErrorSchema,
        },
      },
    },
    async (request, reply) => {
      try {
        // Get id from URL params and languages from query
        const { id } = request.params;
        const { languages: lang } = request.query;

        console.log('Fetching category', id, 'with languages', lang);
        // Fetch category by ID with language filtering
        const details = await categoriesDBService.findById({
          where: { id },
          languages: lang && lang.length > 0 ? lang : undefined,
        });

        console.log('Fetched category details:', details);

        if (!details) {
          return reply.status(404).send({
            success: false,
            error: {
              message: `Category "${id}" not found`,
              code: 404,
            },
          });
        }

        // Return shape matching schema: { success: true, message, data: { category } }
        return reply.status(200).send({
          success: true,
          message: 'Category fetched',
          data: {
            details:
              details as unknown as CategoryDetailSuccessResponse['data']['details'],
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
          error: { message: devMsg, code: 500 },
        });
      }
    }
  );

  // // Get Subcategory by ID
  // fastify.get<{
  //   Params: { id: string };
  //   Querystring: SubcategoryGetRequest;
  //   Reply: ApiResponseType<typeof SubcategoryDetailSuccessResponseSchema>;
  // }>(
  //   '/subcategory/:id',
  //   {
  //     schema: {
  //       params: IdParamsSchema,
  //       response: {
  //         200: SubcategoryDetailSuccessResponseSchema,
  //         404: ApiResponseErrorSchema,
  //         500: ApiResponseErrorSchema,
  //       },
  //     },
  //   },
  //   async (request, reply) => {
  //     try {
  //       const { id } = request.params;
  //       const query: any = request.query || {};
  //       const languages: string[] | undefined = query.languages;

  //       const subcategories = await subcategoriesDBService.findAll({
  //         where: {
  //           slug: id,
  //           ...(languages && languages.length > 0
  //             ? { i18n: { some: { locale: { in: languages } } } }
  //             : {}),
  //         },
  //       });

  //       const subcategory = subcategories?.[0];

  //       if (!subcategory) {
  //         return reply.status(404).send({
  //           success: false,
  //           error: {
  //             message: `Subcategory with id "${id}" not found`,
  //             code: 404,
  //           },
  //         });
  //       }

  //       // Schema expects: { data: { subcategory: ... } }
  //       return reply.status(200).send({
  //         data: {
  //           subcategory:
  //             subcategory as unknown as (typeof SubcategoryDetailSuccessResponseSchema)['subcategory'],
  //         },
  //       });
  //     } catch (err) {
  //       fastify.log.error(err);
  //       const devMsg =
  //         process.env.NODE_ENV === 'development' && err instanceof Error
  //           ? `Failed to fetch subcategory: ${err.message}`
  //           : 'Failed to fetch subcategory';
  //       return reply.status(500).send({
  //         success: false,
  //         error: { message: devMsg, code: 500 },
  //       });
  //     }
  //   }
  // );

  // // Upsert Subcategory
  // fastify.post<{
  //   Body: SubcategoryUpsertRequest;
  //   Reply: SubcategoryUpsertSuccessResponse | ApiErrorResponseType;
  // }>(
  //   '/subcategories',
  //   {
  //     schema: {
  //       body: SubcategoryUpsertRequestSchema,
  //       response: {
  //         // 200: SubcategoryUpsertSuccessResponseSchema,
  //         400: ApiErrorSchema,
  //         500: ApiErrorSchema,
  //       },
  //     },
  //   },
  //   async (request, reply) => {
  //     try {
  //       const { categoryId, icon, sortOrder } = request.body;
  //       let slug = request.body.slug as string | undefined;
  //       const { i18n } = request.body;

  //       // If slug provided, normalize it; otherwise leave undefined to let service generate one
  //       if (typeof slug === 'string') {
  //         slug = slugify(String(slug).trim());
  //         if (!slug) {
  //           return reply.status(400).send({
  //             success: false,
  //             message: 'Validation failed',
  //             error: { message: 'Valid slug is required', code: 400 },
  //           });
  //         }
  //       } else {
  //         slug = undefined;
  //       }

  //       // Basic validation for i18n
  //       if (!Array.isArray(i18n) || i18n.length === 0) {
  //         return reply.status(400).send({
  //           success: false,
  //           message: 'Validation failed',
  //           error: {
  //             message: 'i18n is required and cannot be empty',
  //             code: 400,
  //           },
  //         });
  //       }

  //       // Normalize locales and names
  //       const normalizedI18n = i18n.map((e) => ({
  //         ...e,
  //         locale: String(e.locale || '')
  //           .toLowerCase()
  //           .trim(),
  //         name: String(e.name || '').trim(),
  //         description: e.description ?? undefined,
  //       }));

  //       // Ensure all names are present
  //       if (normalizedI18n.some((e) => !e.name)) {
  //         return reply.status(400).send({
  //           success: false,
  //           message: 'Validation failed',
  //           error: {
  //             message: 'All i18n entries must have a non-empty name',
  //             code: 400,
  //           },
  //         });
  //       }

  //       // Ensure parent category exists
  //       const parentCategory = await categoriesDBService.findById({
  //         where: { id: categoryId },
  //       });
  //       if (!parentCategory) {
  //         return reply.status(400).send({
  //           success: false,
  //           message: 'Validation failed',
  //           error: { message: `Category "${categoryId}" not found`, code: 400 },
  //         });
  //       }

  //       let created = false;
  //       let result;

  //       // If slug provided, check existence; if no slug provided, proceed to create
  //       let subcategory = null;
  //       if (slug) {
  //         const subcategories = await subcategoriesDBService.findAll({
  //           where: { categoryId, slug },
  //         });
  //         subcategory = subcategories?.[0] || null;
  //       }

  //       if (!subcategory) {
  //         // Create new subcategory
  //         result = await subcategoriesDBService.create({
  //           categoryId,
  //           slug: slug || undefined,
  //           icon: icon ?? undefined,
  //           sortOrder: sortOrder ?? 0,
  //           i18n: normalizedI18n,
  //         });
  //         created = true;
  //         slug = result.slug;
  //       } else {
  //         // Update existing subcategory
  //         result = await subcategoriesDBService.update(
  //           { id: subcategory.id },
  //           {
  //             icon: icon ?? undefined,
  //             sortOrder: sortOrder,
  //             i18n: {
  //               deleteMany: {},
  //               create: normalizedI18n,
  //             },
  //           }
  //         );
  //       }

  //       const res: SubcategoryUpsertSuccessResponse = {
  //         success: true,
  //         message: created ? 'Subcategory created' : 'Subcategory updated',
  //         data: {
  //           subcategory: {
  //             categoryId,
  //             slug: slug as string,
  //             created,
  //             updatedLocales: normalizedI18n.map((item) => item.locale),
  //           },
  //         },
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
  //         message: 'Request failed',
  //         error: { message: devMsg, code: 500 },
  //       });
  //     }
  //   }
  // );
}

export default categoriesRoutes;
