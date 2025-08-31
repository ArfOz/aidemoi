import { FastifyInstance } from 'fastify';
import { AppDataSource } from '../config/database';
import {
  ApiErrorResponseType,
  ApiErrorSchema,
  CategoriesListSuccessResponse,
  CategoriesListSuccessResponseSchema,
  CategoryGetRequest,
  CategoryGetRequestSchema,
  CategoryUpsertRequest,
  CategoryUpsertRequestSchema,
  CategoryUpsertSuccessResponse,
  CategoryUpsertSuccessResponseSchema,
  SubcategoryUpsertRequest,
  SubcategoryUpsertRequestSchema,
  SubcategoryUpsertSuccessResponse,
  SubcategoryUpsertSuccessResponseSchema,
} from '@api';
import { CategoriesDBService } from '../services/DatabaseService/CategoriesDBService';
import { In } from 'typeorm';

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
      const exists = await categoriesDBService.findById(candidate);
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
        const { icon, sortOrder, i18n } = request.body;

        // basic validation for i18n
        if (!Array.isArray(i18n) || i18n.length === 0) {
          return reply.status(400).send({
            success: false,
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
            error: {
              message: 'All i18n entries must have a non-empty name',
              code: 400,
            },
          });
        }

        // Generate ID (slug) from preferred name (en, then en-*, else first)
        const preferred =
          normalizedI18n.find((e) => e.locale === 'en') ??
          normalizedI18n.find((e) => e.locale.startsWith('en')) ??
          normalizedI18n[0];

        const baseSlugRaw = slugify(preferred.name);
        const baseSlug = baseSlugRaw || 'category';
        const id = await ensureUniqueCategoryId(baseSlug);

        let created = false;
        let updatedLocales: string[] = [];

        // Check if category exists
        const category = await categoriesDBService.findById(id);
        if (!category) {
          // Create new category
          const result = await categoriesDBService.create({
            id: id,
            icon: icon ?? null,
            sortOrder: sortOrder ?? 0,
            i18n: normalizedI18n,
          });
          created = true;
          updatedLocales = normalizedI18n.map((item) => item.locale);
        } else {
          // Update existing category
          const updateResult = await categoriesDBService.update(id, {
            icon: icon ?? null,
            sortOrder: sortOrder,
            i18n: normalizedI18n,
          });
          updatedLocales = updateResult?.updatedLocales ?? [];
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

  fastify.get<{
    Querystring: CategoryGetRequest;
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

        // Fetch all categories and convert to plain objects
        const rawCategories = await categoriesDBService.findAll({
          order: { sortOrder: 'ASC', id: 'ASC' },
        });

        // Convert to plain objects to avoid serialization issues
        const categories = rawCategories.map((cat) => ({
          id: cat.id,
          icon: cat.icon,
          sortOrder: cat.sortOrder,
          i18n: cat.i18n || [],
        }));

        // Filter by language if specified
        let filteredCategories = categories;
        if (lang) {
          const langList = Array.isArray(lang)
            ? lang.map((l) => String(l).toLowerCase())
            : [String(lang).toLowerCase()];
          const langSet = new Set(langList);

          filteredCategories = categories
            .map((cat) => ({
              ...cat,
              i18n: cat.i18n.filter((entry: any) =>
                langSet.has(String(entry.locale || '').toLowerCase())
              ),
            }))
            .filter((cat) => cat.i18n.length > 0);
        }

        return reply.status(200).send({
          success: true,
          message: 'Categories fetched',
          data: { categories: filteredCategories },
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

  // Upsert Subcategory (commented out until implementation is complete)
  /*
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
        let { slug } = request.body;
        const i18n = request.body.i18n;

        // Validate slug and i18n
        slug = slugify(String(slug || '').trim());
        if (!slug) {
          return reply.status(400).send({
            success: false,
            error: { message: 'Valid slug is required', code: 400 },
          });
        }
        
        // TODO: Implement subcategory creation logic
        
        const res: SubcategoryUpsertSuccessResponse = {
          success: true,
          message: 'Subcategory created',
          data: { subcategory: { categoryId, slug, created: true, updatedLocales: [] } },
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
  */
}
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

//       });
//     }
//   }
// );
