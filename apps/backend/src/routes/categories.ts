import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { AppDataSource } from '../config/database';
import { Category, CategoryI18n } from '../entities/Category';
import { Subcategory, SubcategoryI18n } from '../entities/Subcategory';
import {
  CategoryUpsertRequest,
  CategoryUpsertRequestSchema,
  CategoryUpsertSuccessResponse,
  CategoryUpsertSuccessResponseSchema,
  SubcategoryUpsertRequest,
  SubcategoryUpsertRequestSchema,
  SubcategoryUpsertSuccessResponse,
  SubcategoryUpsertSuccessResponseSchema,
} from '@api';

export async function categoriesRoutes(
  fastify: FastifyInstance,
  _options: FastifyPluginOptions
) {
  const categoryRepo = AppDataSource.getRepository(Category);
  const categoryI18nRepo = AppDataSource.getRepository(CategoryI18n);
  const subcategoryRepo = AppDataSource.getRepository(Subcategory);
  const subcategoryI18nRepo = AppDataSource.getRepository(SubcategoryI18n);

  // Upsert Category
  fastify.post<{
    Body: CategoryUpsertRequest;
    Reply: CategoryUpsertSuccessResponse;
  }>(
    '/categories',
    {
      schema: {
        body: CategoryUpsertRequestSchema,
        response: { 200: CategoryUpsertSuccessResponseSchema },
      },
    },
    async (request, reply) => {
      const { id, icon, sortOrder, i18n } = request.body;

      let created = false;
      const updatedLocales: string[] = [];

      let category = await categoryRepo.findOne({ where: { id } });
      if (!category) {
        category = categoryRepo.create({
          id,
          icon: icon ?? null,
          sortOrder: sortOrder ?? 0,
        });
        created = true;
      } else {
        category.icon = icon ?? category.icon ?? null;
        if (typeof sortOrder === 'number') category.sortOrder = sortOrder;
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
    }
  );

  // Upsert Subcategory
  fastify.post<{
    Body: SubcategoryUpsertRequest;
    Reply: SubcategoryUpsertSuccessResponse;
  }>(
    '/subcategories',
    {
      schema: {
        body: SubcategoryUpsertRequestSchema,
        response: { 200: SubcategoryUpsertSuccessResponseSchema },
      },
    },
    async (request, reply) => {
      const { categoryId, slug, icon, sortOrder, i18n } = request.body;

      // Ensure category exists
      const cat = await categoryRepo.findOne({ where: { id: categoryId } });
      if (!cat) {
        return reply.status(400).send({
          success: true,
          message: `Category "${categoryId}" not found`,
          data: {
            subcategory: {
              categoryId,
              slug,
              created: false,
              updatedLocales: [],
            },
          },
        } as any);
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
        data: {
          subcategory: { categoryId, slug, created, updatedLocales },
        },
      };
      return reply.status(200).send(res);
    }
  );
}
